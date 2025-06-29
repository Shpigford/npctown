import { NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import type { NPC, Building, WorldState } from '@/types/game'

const WORLD_SIZE = 20

export async function POST(request: Request) {
  console.log('[npc-actions API] Received NPC action request at:', new Date().toISOString())
  try {
    const { npcId } = await request.json()
    console.log('[npc-actions API] Processing action for NPC:', npcId)
    const supabase = await createClient()

    // Get NPC data
    const { data: npc } = await supabase
      .from('npcs')
      .select('*')
      .eq('id', npcId)
      .single()

    if (!npc) {
      return NextResponse.json({ error: 'NPC not found' }, { status: 404 })
    }

    // Get world context
    const { data: otherNpcs } = await supabase
      .from('npcs')
      .select('*')
      .neq('id', npcId)

    const { data: buildings } = await supabase
      .from('buildings')
      .select('*')

    const { data: worldState } = await supabase
      .from('world_state')
      .select('*')
      .single()

    const { data: recentEvents } = await supabase
      .from('events')
      .select('*')
      .eq('npc_id', npcId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Generate AI decision
    const decision = await makeNPCDecision(
      npc as NPC,
      otherNpcs as NPC[],
      buildings as Building[],
      worldState as WorldState,
      recentEvents || []
    )

    // Apply decision
    await applyDecision(npc as NPC, decision, supabase)

    return NextResponse.json({ success: true, decision })
  } catch (error) {
    console.error('Error in NPC actions:', error)
    return NextResponse.json({ error: 'Failed to process NPC action' }, { status: 500 })
  }
}

async function makeNPCDecision(
  npc: any, // Using any to handle database JSON fields
  otherNpcs: any[],
  buildings: Building[],
  worldState: WorldState,
  recentMemory: any[]
) {
  const nearbyNpcs = otherNpcs.filter(other => 
    Math.abs(other.x - npc.x) <= 3 && Math.abs(other.y - npc.y) <= 3
  )

  const nearbyBuildings = buildings.filter(building =>
    Math.abs(building.x - npc.x) <= 5 && Math.abs(building.y - npc.y) <= 5
  )

  // Parse personality and stats from JSON
  const personality = typeof npc.personality === 'string' ? JSON.parse(npc.personality) : npc.personality
  const stats = typeof npc.stats === 'string' ? JSON.parse(npc.stats) : npc.stats

  const prompt = `You are ${npc.name}, a citizen of NPC Town with a rich inner life and unique personality.

PERSONALITY PROFILE:
- Traits: ${personality.traits?.join(', ') || 'no specific traits'}
- Enjoys: ${personality.likes?.join(', ') || 'nothing in particular'}
- Dislikes: ${personality.dislikes?.join(', ') || 'nothing in particular'}

CURRENT STATE:
- Health: ${stats.health}/100 ${stats.health < 50 ? '(feeling unwell)' : stats.health > 80 ? '(feeling great!)' : '(feeling okay)'}
- Energy: ${stats.energy}/100 ${stats.energy < 30 ? '(exhausted)' : stats.energy > 80 ? '(full of energy!)' : '(somewhat tired)'}
- Hunger: ${stats.hunger}/100 ${stats.hunger > 70 ? '(very hungry!)' : stats.hunger < 30 ? '(well-fed)' : '(getting peckish)'}
- Social: ${stats.social}/100 ${stats.social < 30 ? '(lonely)' : stats.social > 80 ? '(socially fulfilled)' : '(could use some company)'}

CONTEXT:
- Location: (${npc.x}, ${npc.y})
- Time: ${worldState.time_of_day}:00 (${worldState.time_of_day < 6 ? 'late night' : worldState.time_of_day < 12 ? 'morning' : worldState.time_of_day < 18 ? 'afternoon' : 'evening'}), Day ${worldState.day_count}
- Weather: ${worldState.weather} ${worldState.weather === 'rain' ? '(the rain patters softly)' : worldState.weather === 'fog' ? '(visibility is limited)' : worldState.weather === 'storm' ? '(thunder rumbles overhead)' : '(the weather is pleasant)'}

SURROUNDINGS:
${nearbyNpcs.length > 0 ? `Other people nearby: ${nearbyNpcs.map(n => {
  const nStats = typeof n.stats === 'string' ? JSON.parse(n.stats) : n.stats
  return `${n.name} is ${Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y)} steps away (they look ${nStats.energy < 30 ? 'tired' : 'energetic'})`
}).join('; ')}` : 'You are alone in this area'}

Nearby locations: ${nearbyBuildings.map(b => `The ${b.name} (${b.type}) is ${Math.abs(b.x - npc.x) + Math.abs(b.y - npc.y)} steps away`).join('; ')}

RECENT EXPERIENCES:
${recentMemory.length > 0 ? recentMemory.slice(-3).map(m => m.description).join('\n') : 'Nothing notable has happened recently'}

INSTRUCTIONS:
Based on your personality, current needs, and surroundings, decide what to do next. Be creative and express your thoughts, feelings, and motivations. Your response should reflect your unique personality and current state of mind.

IMPORTANT NEEDS TO CONSIDER:
- If energy < 20: You MUST rest immediately, you're about to collapse!
- If energy < 40: Strongly consider resting soon
- If hunger > 80: Urgently seek food at the Market or Farm
- If social < 20: You're feeling very lonely, seek companionship

Actions you can take:
1. Move (specify direction or destination)
2. Interact with another NPC
3. Enter/use a building
4. Rest or reflect (RESTORES ENERGY - do this when tired!)
5. Speak (express thoughts aloud)
6. Observe your surroundings

Respond with a JSON object:
{
  "action": "move|interact|enter|rest|speak|observe",
  "target": "direction, person name, or building name",
  "description": "A rich, personality-driven description of what you're doing, thinking, and feeling. Include sensory details, emotions, and internal monologue. Be specific and creative! (2-3 sentences)",
  "dialogue": "What you say out loud (if speaking)",
  "thought": "Your internal thoughts/feelings that others can't hear"
}`

  try {
    console.log('[NPC AI] Generating decision for:', npc.name)
    console.log('[NPC AI] Using OpenAI API key:', process.env.OPENAI_API_KEY ? 'Key is set' : 'KEY IS MISSING')
    
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.8,
    })
    
    console.log('[NPC AI] Generated response:', text)
    
    try {
      const parsed = JSON.parse(text)
      console.log('[NPC AI] Parsed decision:', parsed)
      return parsed
    } catch (parseError) {
      console.error('[NPC AI] Failed to parse JSON:', parseError)
      console.error('[NPC AI] Raw text was:', text)
      return {
        action: 'rest',
        target: null,
        description: `${npc.name} pauses for a moment, lost in thought about the day ahead.`,
        dialogue: null,
        thought: "I need to gather my thoughts..."
      }
    }
  } catch (error) {
    console.error('[NPC AI] Failed to generate decision:', error)
    console.error('[NPC AI] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return {
      action: 'rest',
      target: null,
      description: `${npc.name} takes a moment to rest, feeling the weight of ${stats.energy < 50 ? 'exhaustion' : 'the day'}.`,
      dialogue: null,
      thought: `${stats.hunger > 70 ? "I'm so hungry..." : stats.energy < 30 ? "I need to rest..." : "What should I do next?"}`
    }
  }
}

async function applyDecision(npc: any, decision: any, supabase: any) {
  let newX = npc.x
  let newY = npc.y
  let eventType = 'action'
  let eventDescription = decision.description

  // Handle movement
  if (decision.action === 'move') {
    const movements: Record<string, [number, number]> = {
      north: [0, -1],
      south: [0, 1],
      east: [1, 0],
      west: [-1, 0],
      northeast: [1, -1],
      northwest: [-1, -1],
      southeast: [1, 1],
      southwest: [-1, 1]
    }
    
    const [dx, dy] = movements[decision.target] || [0, 0]
    newX = Math.max(0, Math.min(WORLD_SIZE - 1, npc.x + dx))
    newY = Math.max(0, Math.min(WORLD_SIZE - 1, npc.y + dy))
    eventType = 'movement'
  }

  // Handle speaking
  if (decision.action === 'speak' && decision.dialogue) {
    eventType = 'dialogue'
    eventDescription = decision.dialogue ? `${npc.name}: "${decision.dialogue}"` : decision.description
  }

  // Handle interactions
  if (decision.action === 'interact') {
    eventType = 'interaction'
  }

  // Handle observations
  if (decision.action === 'observe') {
    eventType = 'action'
  }

  // Parse stats if needed
  const currentStats = typeof npc.stats === 'string' ? JSON.parse(npc.stats) : npc.stats
  const currentMemory = typeof npc.memory === 'string' ? JSON.parse(npc.memory) : npc.memory || []

  // Update memory with recent action and thought
  const newMemory = {
    event: decision.description,
    thought: decision.thought || null,
    timestamp: new Date().toISOString(),
    importance: decision.action === 'interact' ? 8 : decision.action === 'speak' ? 7 : 5,
    related_npcs: decision.target && decision.action === 'interact' ? [decision.target] : []
  }

  const updatedMemory = [...currentMemory.slice(-9), newMemory] // Keep last 10 memories

  // Update NPC position and state
  const { error: updateError } = await supabase
    .from('npcs')
    .update({
      x: newX,
      y: newY,
      current_action: decision.action,
      stats: {
        ...currentStats,
        energy: decision.action === 'rest' 
          ? Math.min(100, currentStats.energy + 15) // Restore energy when resting
          : Math.max(0, currentStats.energy - 5), // Consume energy for other actions
        hunger: Math.min(100, currentStats.hunger + 2),
        social: decision.action === 'interact' || decision.action === 'speak' 
          ? Math.min(100, currentStats.social + 10) 
          : Math.max(0, currentStats.social - 1),
        health: currentStats.energy <= 0 || currentStats.hunger >= 90
          ? Math.max(0, currentStats.health - 5) // Health decreases when exhausted or starving
          : Math.min(100, currentStats.health + 1) // Slowly recover health otherwise
      },
      memory: updatedMemory
    })
    .eq('id', npc.id)

  if (updateError) {
    console.error('[NPC Update] Failed to update NPC:', updateError)
  }

  // Log event
  const { error: eventError } = await supabase
    .from('events')
    .insert({
      npc_id: npc.id,
      type: eventType,
      description: eventDescription,
      location: { x: newX, y: newY },
      metadata: decision
    })

  if (eventError) {
    console.error('[Event Log] Failed to log event:', eventError)
  } else {
    console.log('[Event Log] Logged event:', eventDescription)
  }
}
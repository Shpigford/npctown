import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import type { NPC, Building, WorldState } from '@/types/game'

const WORLD_SIZE = 20

export async function makeNPCDecision(
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

  // Parse personality, stats, and relationships from JSON
  const personality = typeof npc.personality === 'string' ? JSON.parse(npc.personality) : npc.personality
  const stats = typeof npc.stats === 'string' ? JSON.parse(npc.stats) : npc.stats
  const relationships = typeof npc.relationships === 'string' ? JSON.parse(npc.relationships) : npc.relationships || []
  
  // Calculate total population
  const totalCitizens = otherNpcs.length + 1 // Include self

  const prompt = `You are ${npc.name}, a citizen of NPC Town with a rich inner life and unique personality.

TOWN POPULATION: ${totalCitizens} citizen${totalCitizens === 1 ? '' : 's'} ${totalCitizens === 1 ? '(you are the only one here!)' : totalCitizens <= 3 ? '(a small, intimate community)' : totalCitizens <= 10 ? '(a growing village)' : '(a bustling town)'}

PERSONALITY PROFILE:
- Traits: ${personality.traits?.join(', ') || 'no specific traits'}
- Enjoys: ${personality.likes?.join(', ') || 'nothing in particular'}
- Dislikes: ${personality.dislikes?.join(', ') || 'nothing in particular'}

CURRENT STATE:
- Health: ${stats.health}/100 ${stats.health < 50 ? '(feeling unwell)' : stats.health > 80 ? '(feeling great!)' : '(feeling okay)'}
- Energy: ${stats.energy}/100 ${stats.energy < 30 ? '(exhausted)' : stats.energy > 80 ? '(full of energy!)' : '(somewhat tired)'}
- Hunger: ${stats.hunger}/100 ${stats.hunger > 70 ? '(very hungry!)' : stats.hunger < 30 ? '(well-fed)' : '(getting peckish)'}
- Social: ${stats.social}/100 ${stats.social < 30 ? '(lonely)' : stats.social > 80 ? '(socially fulfilled)' : '(could use some company)'}

RELATIONSHIPS:
${relationships.length === 0 ? 'You haven\'t formed any close relationships yet.' : relationships.map(rel => {
  return `- ${rel.npc_name}: Familiarity ${rel.familiarity}/100, Affinity ${rel.affinity > 0 ? '+' : ''}${rel.affinity}/100 (${rel.interaction_count} interactions)`
}).join('\n')}

CONTEXT:
- Location: (${npc.x}, ${npc.y})
- Time: ${worldState.time_of_day}:00 (${worldState.time_of_day < 6 ? 'late night' : worldState.time_of_day < 12 ? 'morning' : worldState.time_of_day < 18 ? 'afternoon' : 'evening'}), Day ${worldState.day_count}
- Weather: ${worldState.weather} ${worldState.weather === 'rain' ? '(the rain patters softly)' : worldState.weather === 'fog' ? '(visibility is limited)' : worldState.weather === 'storm' ? '(thunder rumbles overhead)' : '(the weather is pleasant)'}

SURROUNDINGS:
${nearbyNpcs.length > 0 ? `Other people nearby: ${nearbyNpcs.map(n => {
  const nStats = typeof n.stats === 'string' ? JSON.parse(n.stats) : n.stats
  const relationship = relationships.find(r => r.npc_id === n.id)
  const relInfo = relationship ? ` (${relationship.familiarity > 50 ? 'close friend' : relationship.familiarity > 20 ? 'acquaintance' : 'stranger'}, affinity: ${relationship.affinity > 50 ? 'strong positive' : relationship.affinity > 0 ? 'positive' : relationship.affinity < -50 ? 'strong negative' : 'negative'})` : ' (stranger)'
  return `${n.name} is ${Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y)} steps away${relInfo} - they look ${nStats.energy < 30 ? 'tired' : 'energetic'}`
}).join('; ')}` : totalCitizens === 1 ? 'You are completely alone in this town.' : 'You are alone in this area'}

Nearby locations: ${nearbyBuildings.map(b => `The ${b.name} (${b.type}) is ${Math.abs(b.x - npc.x) + Math.abs(b.y - npc.y)} steps away`).join('; ')}

RECENT EXPERIENCES:
${recentMemory.length > 0 ? recentMemory.slice(-3).map(m => m.description).join('\n') : 'Nothing notable has happened recently'}

INSTRUCTIONS:
Based on your personality, current needs, and surroundings, decide what to do next. Be creative and express your thoughts, feelings, and motivations. Your response should reflect your unique personality and current state of mind.

IMPORTANT CONSIDERATIONS:
- Population awareness: You know there are ${totalCitizens} citizen${totalCitizens === 1 ? '' : 's'} in town. ${totalCitizens === 1 ? 'Being alone affects your mood and decisions.' : ''}
- Relationships: Consider your existing relationships when choosing who to interact with
- Personality: Let your traits, likes, and dislikes guide your actions
- Memory: Remember past interactions and let them influence your behavior

IMPORTANT NEEDS TO CONSIDER:
- If energy < 20: You MUST rest immediately, you're about to collapse!
- If energy < 40: Strongly consider resting soon
- If hunger > 80: Urgently seek food at the Market or Farm
- If social < 20: You're feeling very lonely, seek companionship${totalCitizens === 1 ? ' (though you are alone)' : ''}

Actions you can take:
1. Move (specify direction: north, south, east, west, northeast, northwest, southeast, southwest)
2. Interact with another NPC (use their exact name)
3. Enter/use a building (use the building's exact name)
4. Rest or reflect (RESTORES ENERGY - do this when tired!)
5. Speak (express thoughts aloud)
6. Observe your surroundings

Respond with a valid JSON object (do not include any markdown formatting or code blocks):
{
  "action": "move|interact|enter|rest|speak|observe",
  "target": "For move: use exact direction (north/south/east/west/northeast/northwest/southeast/southwest). For interact: NPC name. For enter: building name",
  "description": "A rich, personality-driven description of what you're doing, thinking, and feeling. Include sensory details, emotions, and internal monologue. Be specific and creative! (2-3 sentences)",
  "dialogue": "What you say out loud (if speaking)",
  "thought": "Your internal thoughts/feelings that others can't hear"
}`

  try {
    console.log('[NPC AI] Generating decision for:', npc.name)
    console.log('[NPC AI] OpenAI API key check:', {
      keyExists: !!process.env.OPENAI_API_KEY,
      keyLength: process.env.OPENAI_API_KEY?.length || 0,
      keyPrefix: process.env.OPENAI_API_KEY?.substring(0, 7) || 'NO_KEY',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    })
    
    // Initialize OpenAI client with explicit API key
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    })
    
    console.log('[NPC AI] OpenAI client created, attempting to generate text...')
    
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.8,
      experimental_providerMetadata: {
        openai: {
          response_format: { type: 'json_object' }
        }
      }
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
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      cause: error instanceof Error ? error.cause : undefined,
      fullError: JSON.stringify(error, null, 2)
    })
    
    // Log specific error types
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.error('[NPC AI] Authentication error - check if API key is valid')
      } else if (error.message.includes('429')) {
        console.error('[NPC AI] Rate limit error - too many requests')
      } else if (error.message.includes('insufficient_quota')) {
        console.error('[NPC AI] Quota error - check OpenAI account credits')
      }
    }
    return {
      action: 'rest',
      target: null,
      description: `${npc.name} takes a moment to rest, feeling the weight of ${stats.energy < 50 ? 'exhaustion' : 'the day'}.`,
      dialogue: null,
      thought: `${stats.hunger > 70 ? "I'm so hungry..." : stats.energy < 30 ? "I need to rest..." : "What should I do next?"}`
    }
  }
}

export async function applyDecision(npc: any, decision: any, supabase: any) {
  let newX = npc.x
  let newY = npc.y
  let eventType = 'action'
  let eventDescription = decision.description

  // Handle movement
  if (decision.action === 'move') {
    console.log('[NPC Movement] Processing move action for', npc.name, 'with target:', decision.target)
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
    
    // Normalize the target to lowercase and handle various formats
    const normalizedTarget = decision.target?.toLowerCase()?.trim() || ''
    const [dx, dy] = movements[normalizedTarget] || [0, 0]
    
    if (dx === 0 && dy === 0) {
      console.log('[NPC Movement] Invalid movement direction:', decision.target, 'normalized to:', normalizedTarget)
    }
    
    const oldX = npc.x
    const oldY = npc.y
    newX = Math.max(0, Math.min(WORLD_SIZE - 1, npc.x + dx))
    newY = Math.max(0, Math.min(WORLD_SIZE - 1, npc.y + dy))
    
    console.log(`[NPC Movement] ${npc.name} moving from (${oldX},${oldY}) to (${newX},${newY})`)
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

  // Parse stats and relationships if needed
  const currentStats = typeof npc.stats === 'string' ? JSON.parse(npc.stats) : npc.stats
  const currentMemory = typeof npc.memory === 'string' ? JSON.parse(npc.memory) : npc.memory || []
  const currentRelationships = typeof npc.relationships === 'string' ? JSON.parse(npc.relationships) : npc.relationships || []

  // Update relationships if interacting with another NPC
  const updatedRelationships = [...currentRelationships]
  if (decision.action === 'interact' && decision.target) {
    // Find the target NPC
    const { data: targetNpc } = await supabase
      .from('npcs')
      .select('*')
      .eq('name', decision.target)
      .single()
    
    if (targetNpc) {
      // Check if relationship exists
      const existingRelIndex = updatedRelationships.findIndex(r => r.npc_id === targetNpc.id)
      
      if (existingRelIndex >= 0) {
        // Update existing relationship
        updatedRelationships[existingRelIndex] = {
          ...updatedRelationships[existingRelIndex],
          familiarity: Math.min(100, updatedRelationships[existingRelIndex].familiarity + 5),
          affinity: Math.max(-100, Math.min(100, updatedRelationships[existingRelIndex].affinity + (decision.thought?.includes('enjoy') || decision.thought?.includes('like') ? 3 : -1))),
          last_interaction: new Date().toISOString(),
          interaction_count: updatedRelationships[existingRelIndex].interaction_count + 1,
          notes: [...updatedRelationships[existingRelIndex].notes.slice(-4), decision.thought || decision.description].filter(Boolean)
        }
      } else {
        // Create new relationship
        updatedRelationships.push({
          npc_id: targetNpc.id,
          npc_name: targetNpc.name,
          familiarity: 5,
          affinity: decision.thought?.includes('enjoy') || decision.thought?.includes('like') ? 5 : 0,
          last_interaction: new Date().toISOString(),
          interaction_count: 1,
          notes: [decision.thought || decision.description].filter(Boolean)
        })
      }
    }
  }

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
  console.log(`[NPC Update] Updating ${npc.name} position to (${newX},${newY}) with action: ${decision.action}`)
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
      memory: updatedMemory,
      relationships: updatedRelationships
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
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const WORLD_SIZE = 20

export async function POST(request: Request) {
  try {
    const { npcId, decision } = await request.json()
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

    // Apply the visitor's decision
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
      
      // If target is a building name, don't move (simplified for now)
      if (movements[decision.target]) {
        const [dx, dy] = movements[decision.target]
        newX = Math.max(0, Math.min(WORLD_SIZE - 1, npc.x + dx))
        newY = Math.max(0, Math.min(WORLD_SIZE - 1, npc.y + dy))
      }
      eventType = 'movement'
    }

    // Handle speaking
    if (decision.action === 'speak' && decision.dialogue) {
      eventType = 'dialogue'
    }

    // Parse stats
    const currentStats = typeof npc.stats === 'string' ? JSON.parse(npc.stats) : npc.stats
    const currentMemory = typeof npc.memory === 'string' ? JSON.parse(npc.memory) : npc.memory || []

    // Update memory with visitor interaction
    const newMemory = {
      event: `A mysterious force guided my actions`,
      thought: "That was strange... I felt compelled to do that",
      timestamp: new Date().toISOString(),
      importance: 9,
      visitor_guided: true
    }

    const updatedMemory = [...currentMemory.slice(-9), newMemory]

    // Update NPC
    await supabase
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
          social: decision.action === 'speak' || decision.action === 'interact'
            ? Math.min(100, currentStats.social + 10) 
            : Math.max(0, currentStats.social - 1),
          health: currentStats.energy <= 0 || currentStats.hunger >= 90
            ? Math.max(0, currentStats.health - 5) // Health decreases when exhausted or starving
            : Math.min(100, currentStats.health + 1) // Slowly recover health otherwise
        },
        memory: updatedMemory
      })
      .eq('id', npc.id)

    // Log event with visitor flag
    await supabase
      .from('events')
      .insert({
        npc_id: npc.id,
        type: eventType,
        description: `🎮 ${eventDescription}`,
        location: { x: newX, y: newY },
        metadata: {
          ...decision,
          visitor_guided: true,
          thought: "A strange compulsion came over me..."
        }
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in visitor action:', error)
    return NextResponse.json({ error: 'Failed to process visitor action' }, { status: 500 })
  }
}
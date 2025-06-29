import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  console.log('[world-tick API] Received world tick request at:', new Date().toISOString())
  try {
    const supabase = await createClient()

    // Check for reset flag - simple boolean check
    const { data: resetControl } = await supabase
      .from('admin_controls')
      .select('*')
      .eq('setting_name', 'reset_game')
      .single()

    // Simple check - if setting_value is true (as a boolean), reset the game
    if (resetControl?.setting_value === true) {
      console.log('[world-tick API] Reset flag detected! Initiating game reset...')
      
      // Perform reset operations
      await resetGame(supabase)
      
      // Set the flag back to false
      await supabase
        .from('admin_controls')
        .update({
          setting_value: false
        })
        .eq('setting_name', 'reset_game')
      
      // Log reset event
      await supabase
        .from('events')
        .insert({
          type: 'system',
          description: 'Game world has been reset',
          metadata: { 
            reset_at: new Date().toISOString()
          }
        })
      
      console.log('[world-tick API] Game reset completed')
      return NextResponse.json({ 
        success: true, 
        message: 'Game reset completed',
        reset: true 
      })
    }

    // Get current world state
    console.log('[world-tick API] Fetching current world state...')
    const { data: worldState, error: worldStateError } = await supabase
      .from('world_state')
      .select('*')
      .single()

    if (worldStateError) {
      console.error('[world-tick API] Error fetching world state:', worldStateError)
      return NextResponse.json({ error: 'Failed to fetch world state', details: worldStateError }, { status: 500 })
    }

    if (!worldState) {
      console.error('[world-tick API] No world state found in database')
      return NextResponse.json({ error: 'World state not found' }, { status: 404 })
    }

    console.log('[world-tick API] Current world state:', worldState)

    // Calculate new time
    let newHour = worldState.time_of_day + 1
    let newDay = worldState.day_count
    
    if (newHour >= 24) {
      newHour = 0
      newDay += 1
    }

    // Determine weather (simple random for now)
    const weatherOptions = ['clear', 'rain', 'fog', 'storm']
    const newWeather = Math.random() > 0.7 
      ? weatherOptions[Math.floor(Math.random() * weatherOptions.length)]
      : worldState.weather

    // Update world state
    console.log('[world-tick API] Updating world state to:', { newHour, newDay, newWeather })
    const { error: updateError } = await supabase
      .from('world_state')
      .update({
        time_of_day: newHour,
        day_count: newDay,
        weather: newWeather
      })
      .eq('id', worldState.id)

    if (updateError) {
      console.error('[world-tick API] Error updating world state:', updateError)
      return NextResponse.json({ error: 'Failed to update world state', details: updateError }, { status: 500 })
    }

    // Log time change event
    if (newHour === 0) {
      await supabase
        .from('events')
        .insert({
          type: 'system',
          description: `Day ${newDay} begins`,
          metadata: { day: newDay }
        })
    } else if (newHour === 6) {
      await supabase
        .from('events')
        .insert({
          type: 'system',
          description: 'The sun rises over NPC Town',
          metadata: { time: newHour }
        })
    } else if (newHour === 20) {
      await supabase
        .from('events')
        .insert({
          type: 'system',
          description: 'Night falls on NPC Town',
          metadata: { time: newHour }
        })
    }

    // Get all NPCs for actions
    console.log('[world-tick API] Fetching NPCs...')
    const { data: npcs, error: npcsError } = await supabase
      .from('npcs')
      .select('id')

    if (npcsError) {
      console.error('[world-tick API] Error fetching NPCs:', npcsError)
    }

    // Trigger NPC actions
    if (npcs && npcs.length > 0) {
      console.log('[world-tick API] Triggering actions for', npcs.length, 'NPCs')
      
      // Instead of making HTTP calls, directly call the NPC decision logic
      // This avoids Vercel authentication issues for internal API calls
      const { makeNPCDecision, applyDecision } = await import('./npc-actions-logic')
      
      for (const npc of npcs) {
        try {
          console.log('[world-tick API] Processing NPC action for:', npc.id)
          
          // Get NPC data
          const { data: npcData } = await supabase
            .from('npcs')
            .select('*')
            .eq('id', npc.id)
            .single()
          
          if (!npcData) {
            console.error('[world-tick API] NPC not found:', npc.id)
            continue
          }
          
          // Get world context for this NPC
          const { data: otherNpcs } = await supabase
            .from('npcs')
            .select('*')
            .neq('id', npc.id)

          const { data: buildings } = await supabase
            .from('buildings')
            .select('*')

          const { data: recentEvents } = await supabase
            .from('events')
            .select('*')
            .eq('npc_id', npc.id)
            .order('created_at', { ascending: false })
            .limit(10)
          
          // Generate AI decision
          const decision = await makeNPCDecision(
            npcData,
            otherNpcs || [],
            buildings || [],
            worldState,
            recentEvents || []
          )
          
          // Apply decision
          await applyDecision(npcData, decision, supabase)
          
          console.log('[world-tick API] NPC action succeeded for NPC', npc.id)
        } catch (npcError) {
          console.error('[world-tick API] Error processing NPC action for NPC', npc.id, ':', npcError)
        }
      }
    } else {
      console.log('[world-tick API] No NPCs found to trigger actions for')
    }

    console.log('[world-tick API] World tick completed successfully')
    return NextResponse.json({ 
      success: true, 
      worldState: { time_of_day: newHour, day_count: newDay, weather: newWeather }
    })
  } catch (error) {
    console.error('[world-tick API] Unexpected error in world tick:', error)
    return NextResponse.json({ error: 'Failed to update world', details: error.message }, { status: 500 })
  }
}

async function resetGame(supabase: any) {
  console.log('[resetGame] Starting game reset...')
  
  // 1. Delete all NPCs except the initial 3
  console.log('[resetGame] Clearing NPCs...')
  await supabase
    .from('npcs')
    .delete()
    .not('name', 'in', '("Alice","Bob","Carol")')
  
  // 2. Reset the initial NPCs to their starting positions and stats
  const initialNpcs = [
    {
      name: 'Alice',
      x: 5,
      y: 5,
      stats: { health: 100, energy: 100, hunger: 0, social: 50 },
      memory: [],
      relationships: [],
      current_action: null
    },
    {
      name: 'Bob',
      x: 10,
      y: 10,
      stats: { health: 100, energy: 100, hunger: 0, social: 50 },
      memory: [],
      relationships: [],
      current_action: null
    },
    {
      name: 'Carol',
      x: 15,
      y: 15,
      stats: { health: 100, energy: 100, hunger: 0, social: 50 },
      memory: [],
      relationships: [],
      current_action: null
    }
  ]
  
  for (const npc of initialNpcs) {
    await supabase
      .from('npcs')
      .update({
        x: npc.x,
        y: npc.y,
        stats: npc.stats,
        memory: npc.memory,
        relationships: npc.relationships,
        current_action: npc.current_action
      })
      .eq('name', npc.name)
  }
  
  // 3. Clear all events
  console.log('[resetGame] Clearing events...')
  // Delete all events - using a condition that matches all rows
  const { error: deleteError, count } = await supabase
    .from('events')
    .delete()
    .gte('created_at', '1900-01-01') // This will match all events
  
  if (deleteError) {
    console.error('[resetGame] Error deleting events:', deleteError)
  } else {
    console.log(`[resetGame] Deleted ${count} events`)
  }
  
  // 4. Reset world state to day 1, 8 AM, clear weather
  console.log('[resetGame] Resetting world state...')
  await supabase
    .from('world_state')
    .update({
      time_of_day: 8,
      day_count: 1,
      weather: 'clear',
      global_events: []
    })
    .eq('id', (await supabase.from('world_state').select('id').single()).data.id)
  
  console.log('[resetGame] Game reset complete!')
}
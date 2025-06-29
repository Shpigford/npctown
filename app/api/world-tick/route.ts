import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  console.log('[world-tick API] Received world tick request at:', new Date().toISOString())
  try {
    const supabase = await createClient()

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
      for (const npc of npcs) {
        try {
          // Call NPC action endpoint
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
          const npcActionUrl = `${baseUrl}/api/npc-actions`
          console.log('[world-tick API] Calling NPC action for NPC', npc.id, 'at:', npcActionUrl)
          const response = await fetch(npcActionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ npcId: npc.id })
          })
          if (!response.ok) {
            console.error('[world-tick API] NPC action failed for NPC', npc.id, 'with status:', response.status)
          }
        } catch (npcError) {
          console.error('[world-tick API] Error triggering NPC action for NPC', npc.id, ':', npcError)
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
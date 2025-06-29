'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePolling } from '@/lib/hooks/usePolling'
import type { NPC, Building, WorldState, GameEvent } from '@/types/game'

export function useGame() {
  const [npcs, setNpcs] = useState<NPC[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [worldState, setWorldState] = useState<WorldState | null>(null)
  const [events, setEvents] = useState<GameEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    // Initial data load
    loadGameData()

    // Set up real-time subscriptions
    console.log('[useGame] Setting up real-time subscriptions...')
    
    const npcSubscription = supabase
      .channel('npcs-channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'npcs' 
      }, (payload) => {
        console.log('[useGame] NPC change received:', payload)
        handleNpcChange(payload)
      })
      .subscribe((status) => {
        console.log('[useGame] NPC subscription status:', status)
      })

    const worldSubscription = supabase
      .channel('world-state-channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'world_state' 
      }, (payload) => {
        console.log('[useGame] World state change received:', payload)
        handleWorldChange(payload)
      })
      .subscribe((status) => {
        console.log('[useGame] World subscription status:', status)
      })

    const eventsSubscription = supabase
      .channel('events-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'events' 
      }, (payload) => {
        console.log('[useGame] New event received:', payload)
        handleNewEvent(payload)
      })
      .subscribe((status) => {
        console.log('[useGame] Events subscription status:', status)
      })

    return () => {
      console.log('[useGame] Cleaning up subscriptions...')
      npcSubscription.unsubscribe()
      worldSubscription.unsubscribe()
      eventsSubscription.unsubscribe()
    }
  }, [])

  async function loadGameData() {
    try {
      // Load NPCs
      const { data: npcData } = await supabase
        .from('npcs')
        .select('*')
        .order('created_at', { ascending: true })

      // Load Buildings
      const { data: buildingData } = await supabase
        .from('buildings')
        .select('*')
        .order('created_at', { ascending: true })

      // Load World State
      const { data: worldData } = await supabase
        .from('world_state')
        .select('*')
        .single()

      // Load Recent Events
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (npcData) setNpcs(npcData as NPC[])
      if (buildingData) setBuildings(buildingData as Building[])
      if (worldData) setWorldState(worldData as WorldState)
      if (eventData) setEvents(eventData.reverse() as GameEvent[])
    } catch (error) {
      console.error('Error loading game data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleNpcChange(payload: any) {
    if (payload.eventType === 'UPDATE') {
      setNpcs(prev => prev.map(npc => 
        npc.id === payload.new.id ? payload.new : npc
      ))
    } else if (payload.eventType === 'INSERT') {
      setNpcs(prev => [...prev, payload.new])
    } else if (payload.eventType === 'DELETE') {
      setNpcs(prev => prev.filter(npc => npc.id !== payload.old.id))
    }
  }

  function handleWorldChange(payload: any) {
    if (payload.eventType === 'UPDATE') {
      setWorldState(payload.new)
    }
  }

  function handleNewEvent(payload: any) {
    setEvents(prev => [...prev.slice(-49), payload.new])
  }

  // Polling fallback - refresh data every 2 seconds
  usePolling(() => {
    console.log('[useGame] Polling for updates...')
    loadGameData()
  }, 2000)

  return {
    npcs,
    buildings,
    worldState,
    events,
    isLoading
  }
}
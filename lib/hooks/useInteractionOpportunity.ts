'use client'

import { useEffect, useState, useCallback } from 'react'
import type { NPC } from '@/types/game'

const INTERACTION_CHANCE = 0.15 // 15% chance per tick
const COOLDOWN_PERIOD = 60000 // 1 minute cooldown between interactions
const MIN_NPCS_FOR_INTERACTION = 1

export function useInteractionOpportunity(npcs: NPC[]) {
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null)
  const [lastInteractionTime, setLastInteractionTime] = useState(0)

  const checkForInteraction = useCallback(() => {
    // Don't allow interactions too frequently
    if (Date.now() - lastInteractionTime < COOLDOWN_PERIOD) {
      return
    }

    // Need at least some NPCs
    if (npcs.length < MIN_NPCS_FOR_INTERACTION) {
      return
    }

    // Random chance for interaction
    if (Math.random() < INTERACTION_CHANCE) {
      // Select a random NPC
      const randomNpc = npcs[Math.floor(Math.random() * npcs.length)]
      setSelectedNpc(randomNpc)
      setLastInteractionTime(Date.now())
    }
  }, [npcs, lastInteractionTime])

  // Check for interaction opportunities periodically
  useEffect(() => {
    const interval = setInterval(checkForInteraction, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [checkForInteraction])

  const handleClose = useCallback(() => {
    setSelectedNpc(null)
  }, [])

  const handleDecision = useCallback(() => {
    setSelectedNpc(null)
  }, [])

  return {
    selectedNpc,
    handleClose,
    handleDecision
  }
}
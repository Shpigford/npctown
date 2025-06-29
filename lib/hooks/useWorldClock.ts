'use client'

import { useEffect, useRef } from 'react'

const TICK_INTERVAL = 10000 // 10 seconds = 1 hour in game time

export function useWorldClock() {
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    console.log('[useWorldClock] Hook initialized, starting world clock...')
    // Start the world clock
    startClock()

    return () => {
      console.log('[useWorldClock] Cleaning up world clock interval')
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  function startClock() {
    console.log('[useWorldClock] Starting clock with interval:', TICK_INTERVAL, 'ms')
    // Initial tick
    tick()

    // Set up interval
    intervalRef.current = setInterval(tick, TICK_INTERVAL)
    console.log('[useWorldClock] Interval set up successfully')
  }

  async function tick() {
    console.log('[useWorldClock] Executing world tick at:', new Date().toISOString())
    try {
      const response = await fetch('/api/world-tick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        console.error('[useWorldClock] World tick failed with status:', response.status)
        const errorText = await response.text()
        console.error('[useWorldClock] Error response:', errorText)
      } else {
        const data = await response.json()
        console.log('[useWorldClock] World tick successful:', data)
      }
    } catch (error) {
      console.error('[useWorldClock] World tick failed with error:', error)
    }
  }

  return null
}
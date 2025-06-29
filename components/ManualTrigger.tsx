'use client'

import { useState } from 'react'

export default function ManualTrigger() {
  const [isTriggering, setIsTriggering] = useState(false)
  const [response, setResponse] = useState<string>('')

  async function triggerWorldTick() {
    setIsTriggering(true)
    setResponse('Triggering world tick...')
    
    try {
      const res = await fetch('/api/world-tick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setResponse(`Success! Time: ${data.worldState?.time_of_day}:00, Day: ${data.worldState?.day_count}`)
      } else {
        setResponse(`Error: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      setResponse(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTriggering(false)
    }
  }

  return (
    <div className="border border-green-400/30 p-4 space-y-2">
      <h3 className="text-sm font-bold opacity-80">DEBUG CONTROLS</h3>
      <button
        onClick={triggerWorldTick}
        disabled={isTriggering}
        className="px-4 py-2 border border-green-400 hover:bg-green-400 hover:text-black transition-colors disabled:opacity-50"
      >
        {isTriggering ? 'TRIGGERING...' : 'TRIGGER WORLD TICK'}
      </button>
      {response && (
        <div className="text-xs mt-2 font-mono">
          {response}
        </div>
      )}
    </div>
  )
}
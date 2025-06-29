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
    <div className="sf-panel">
      <h3 className="text-sm font-bold mb-3 pb-2 border-b border-white/50">DEBUG</h3>
      <button
        onClick={triggerWorldTick}
        disabled={isTriggering}
        className="w-full sf-button py-2 disabled:opacity-50"
      >
        {isTriggering ? 'TRIGGERING...' : 'TRIGGER WORLD TICK'}
      </button>
      {response && (
        <div className="text-sm mt-2 font-mono opacity-70">
          &gt; {response}
        </div>
      )}
    </div>
  )
}
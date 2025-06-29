'use client'

import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { 
  ArrowRight, 
  MessageSquare, 
  Users, 
  Activity, 
  Terminal,
  Clock
} from 'lucide-react'
import type { GameEvent } from '@/types/game'

interface EventLogProps {
  events: GameEvent[]
}

export default function EventLog({ events }: EventLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events])

  const getEventStyle = (type: GameEvent['type']) => {
    switch (type) {
      case 'movement': 
        return { color: 'text-green', prefix: '>' }
      case 'interaction': 
        return { color: 'text-light-yellow', prefix: '*' }
      case 'dialogue': 
        return { color: 'text-cyan', prefix: '"' }
      case 'action': 
        return { color: 'text-light-yellow', prefix: '+' }
      case 'system': 
        return { color: 'text-white/50', prefix: '!' }
      default: 
        return { color: 'text-white', prefix: '-' }
    }
  }

  return (
    <div 
      ref={scrollRef}
      className="h-[480px] overflow-y-auto text-xs font-mono space-y-1"
    >
      {events.length === 0 ? (
        <div className="text-white/50 uppercase">
          <span className="animate-pulse">Waiting for events...</span>
        </div>
      ) : (
        events.map((event) => {
          const { color, prefix } = getEventStyle(event.type)
          const timestamp = format(new Date(event.created_at), 'HH:mm')
          return (
            <div key={event.id} className="leading-relaxed">
              <span className="text-white/30">[{timestamp}]</span>
              <span className={`${color} ml-2`}>{prefix}</span>
              <span className="text-white ml-1">{event.description}</span>
              {event.metadata?.thought && (
                <div className="text-white/50 italic ml-14 text-xs">
                  ({event.metadata.thought})
                </div>
              )}
            </div>
          )
        })
      )}
      <div className="text-white animate-pulse mt-2">█</div>
    </div>
  )
}
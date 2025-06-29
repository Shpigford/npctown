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
        return { color: 'text-green-400', Icon: ArrowRight }
      case 'interaction': 
        return { color: 'text-yellow-400', Icon: Users }
      case 'dialogue': 
        return { color: 'text-blue-400', Icon: MessageSquare }
      case 'action': 
        return { color: 'text-purple-400', Icon: Activity }
      case 'system': 
        return { color: 'text-gray-400', Icon: Terminal }
      default: 
        return { color: 'text-green-400', Icon: Activity }
    }
  }

  return (
    <div 
      ref={scrollRef}
      className="h-[400px] overflow-y-auto space-y-1 text-xs font-mono scrollbar-thin scrollbar-thumb-green-400/20"
    >
      {events.length === 0 ? (
        <div className="opacity-50 flex items-center gap-2">
          <Clock size={12} className="animate-pulse" />
          Waiting for events...
        </div>
      ) : (
        events.map((event) => {
          const { color, Icon } = getEventStyle(event.type)
          return (
            <div 
              key={event.id} 
              className={`${color} animate-fade-in flex items-start gap-2`}
            >
              <Icon size={12} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="opacity-50 text-xs">
                  [{format(new Date(event.created_at), 'HH:mm:ss')}]
                </span>{' '}
                <span className="font-semibold">{event.description}</span>
                {event.metadata?.thought && (
                  <div className="text-xs italic opacity-70 ml-4 mt-1">
                    💭 {event.metadata.thought}
                  </div>
                )}
              </div>
            </div>
          )
        })
      )}
      <div className="animate-cursor-blink inline-block">_</div>
    </div>
  )
}
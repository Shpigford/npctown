'use client'

import { Sun, Cloud, CloudRain, CloudSnow, Users, Wifi, Gamepad2 } from 'lucide-react'
import type { WorldState } from '@/types/game'

interface StatusBarProps {
  worldState: WorldState | null
  npcCount: number
  hasActiveInteraction?: boolean
}

export default function StatusBar({ worldState, npcCount, hasActiveInteraction }: StatusBarProps) {
  if (!worldState) return null

  const timeString = `${worldState.time_of_day.toString().padStart(2, '0')}:00`
  
  const getWeatherIcon = (weather: string) => {
    const iconProps = { size: 14 }
    switch (weather) {
      case 'clear':
        return <Sun {...iconProps} className="text-light-yellow" />
      case 'rain':
        return <CloudRain {...iconProps} className="text-blue" />
      case 'fog':
        return <Cloud {...iconProps} className="text-white/50" />
      case 'storm':
        return <CloudSnow {...iconProps} className="text-magenta" />
      default:
        return <Sun {...iconProps} className="text-light-yellow" />
    }
  }

  const isDaytime = worldState.time_of_day >= 6 && worldState.time_of_day < 20

  return (
    <div className="flex items-center gap-6 text-sm">
      {/* Time */}
      <div className="flex items-center gap-2">
        <span className="text-white/70 uppercase">Day</span>
        <span className="text-white font-bold">{worldState.day_count}</span>
        <span className="text-white/30">|</span>
        <span className="text-white font-bold">{timeString}</span>
      </div>

      {/* Weather */}
      <div className="flex items-center gap-2">
        {getWeatherIcon(worldState.weather)}
        <span className="text-white uppercase">{worldState.weather}</span>
      </div>

      {/* Population */}
      <div className="flex items-center gap-2">
        <Users size={14} className="text-white" />
        <span className="text-white font-bold">{npcCount}</span>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <Wifi size={14} className={isDaytime ? "text-green" : "text-cyan"} />
        <span className={isDaytime ? "text-green uppercase" : "text-cyan uppercase"}>
          {isDaytime ? "AWAKE" : "SLEEPING"}
        </span>
      </div>

      {/* Interaction Status */}
      {hasActiveInteraction && (
        <div className="flex items-center gap-2">
          <Gamepad2 size={14} className="text-light-yellow animate-pulse" />
          <span className="text-light-yellow uppercase animate-pulse">CONTROLLING</span>
        </div>
      )}
    </div>
  )
}
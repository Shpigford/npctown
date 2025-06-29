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
    const iconProps = { size: 14, className: "inline-block mr-1" }
    switch (weather) {
      case 'clear':
        return <Sun {...iconProps} className="text-yellow-400" />
      case 'rain':
        return <CloudRain {...iconProps} className="text-blue-400" />
      case 'fog':
        return <Cloud {...iconProps} className="text-gray-400" />
      case 'storm':
        return <CloudSnow {...iconProps} className="text-purple-400" />
      default:
        return <Sun {...iconProps} className="text-yellow-400" />
    }
  }

  const isDaytime = worldState.time_of_day >= 6 && worldState.time_of_day < 20

  return (
    <div className="border border-green-400/30 p-2 flex justify-between items-center text-xs">
      <div className="flex items-center gap-4">
        <span className="font-bold">DAY {worldState.day_count}</span>
        <span className={isDaytime ? 'text-yellow-400' : 'text-blue-400'}>
          {timeString} {isDaytime ? '☀' : '🌙'}
        </span>
        <span className="flex items-center">
          {getWeatherIcon(worldState.weather)}
          {worldState.weather.toUpperCase()}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Users size={14} className="text-green-400" />
          POPULATION: {npcCount}
        </span>
        <span className="flex items-center gap-1 text-green-500">
          <Wifi size={14} className="animate-pulse" />
          ONLINE
        </span>
        {hasActiveInteraction && (
          <span className="flex items-center gap-1 text-yellow-400 animate-pulse">
            <Gamepad2 size={14} />
            INTERACTION AVAILABLE
          </span>
        )}
      </div>
    </div>
  )
}
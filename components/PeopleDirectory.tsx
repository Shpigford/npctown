'use client'

import { useState } from 'react'
import { 
  User, 
  Heart, 
  Zap, 
  Utensils, 
  Users,
  ChevronDown,
  ChevronUp,
  Activity,
  MapPin
} from 'lucide-react'
import type { NPC } from '@/types/game'

interface PeopleDirectoryProps {
  npcs: NPC[]
}

export default function PeopleDirectory({ npcs }: PeopleDirectoryProps) {
  const [expandedNpc, setExpandedNpc] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'health' | 'energy' | 'hunger' | 'social'>('name')

  const sortedNpcs = [...npcs].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name)
    }
    const aStats = typeof a.stats === 'string' ? JSON.parse(a.stats) : a.stats
    const bStats = typeof b.stats === 'string' ? JSON.parse(b.stats) : b.stats
    return bStats[sortBy] - aStats[sortBy]
  })

  const getStatColor = (value: number, stat: string) => {
    if (stat === 'hunger') {
      // For hunger, high is bad
      if (value > 70) return 'text-red-400'
      if (value > 40) return 'text-yellow-400'
      return 'text-green-400'
    } else {
      // For other stats, low is bad
      if (value < 30) return 'text-red-400'
      if (value < 60) return 'text-yellow-400'
      return 'text-green-400'
    }
  }

  const getPersonalityIcon = (traits: string[]) => {
    if (traits.includes('curious')) return '🔍'
    if (traits.includes('friendly')) return '😊'
    if (traits.includes('hardworking')) return '💪'
    if (traits.includes('creative')) return '🎨'
    if (traits.includes('adventurous')) return '🗺️'
    return '👤'
  }

  return (
    <div className="space-y-4">
      {/* Header with sorting */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold opacity-80">CITIZENS ({npcs.length})</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-black border border-green-400/30 text-green-400 text-xs px-2 py-1 rounded focus:outline-none focus:border-green-400"
        >
          <option value="name">Sort by Name</option>
          <option value="health">Sort by Health</option>
          <option value="energy">Sort by Energy</option>
          <option value="hunger">Sort by Hunger</option>
          <option value="social">Sort by Social</option>
        </select>
      </div>

      {/* NPC List */}
      <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-green-400/20">
        {sortedNpcs.map(npc => {
          const stats = typeof npc.stats === 'string' ? JSON.parse(npc.stats) : npc.stats
          const personality = typeof npc.personality === 'string' ? JSON.parse(npc.personality) : npc.personality
          const isExpanded = expandedNpc === npc.id

          return (
            <div
              key={npc.id}
              className="border border-green-400/20 rounded p-2 hover:border-green-400/40 transition-colors"
            >
              {/* Main Info */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedNpc(isExpanded ? null : npc.id)}
              >
                <div className="flex items-center gap-2">
                  <User size={14} className="text-yellow-400" />
                  <span className="font-semibold">{npc.name}</span>
                  <span className="text-xs opacity-50">
                    {getPersonalityIcon(personality.traits || [])}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <MapPin size={10} className="opacity-50" />
                    <span className="text-xs opacity-70">({npc.x},{npc.y})</span>
                  </div>
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Heart size={10} className={getStatColor(stats.health, 'health')} />
                  <span className={getStatColor(stats.health, 'health')}>
                    {stats.health}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap size={10} className={getStatColor(stats.energy, 'energy')} />
                  <span className={getStatColor(stats.energy, 'energy')}>
                    {stats.energy}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Utensils size={10} className={getStatColor(stats.hunger, 'hunger')} />
                  <span className={getStatColor(stats.hunger, 'hunger')}>
                    {stats.hunger}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={10} className={getStatColor(stats.social, 'social')} />
                  <span className={getStatColor(stats.social, 'social')}>
                    {stats.social}%
                  </span>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-green-400/10 space-y-2 text-xs">
                  {/* Current Action */}
                  {npc.current_action && (
                    <div className="flex items-start gap-2">
                      <Activity size={10} className="mt-0.5 opacity-50" />
                      <div>
                        <span className="opacity-50">Current Action:</span>
                        <span className="ml-1">{npc.current_action}</span>
                      </div>
                    </div>
                  )}

                  {/* Personality */}
                  <div className="space-y-1">
                    <div className="opacity-50">Personality:</div>
                    <div className="ml-2">
                      <div>Traits: {personality.traits?.join(', ') || 'None'}</div>
                      <div>Likes: {personality.likes?.join(', ') || 'None'}</div>
                      <div>Dislikes: {personality.dislikes?.join(', ') || 'None'}</div>
                    </div>
                  </div>

                  {/* Status Summary */}
                  <div className="mt-2 p-2 bg-green-400/5 rounded">
                    {stats.energy < 30 && (
                      <div className="text-yellow-400">⚠ Feeling tired</div>
                    )}
                    {stats.hunger > 70 && (
                      <div className="text-red-400">⚠ Very hungry</div>
                    )}
                    {stats.social < 30 && (
                      <div className="text-yellow-400">⚠ Feeling lonely</div>
                    )}
                    {stats.health < 50 && (
                      <div className="text-red-400">⚠ Health declining</div>
                    )}
                    {stats.energy >= 30 && stats.hunger <= 70 && stats.social >= 30 && stats.health >= 50 && (
                      <div className="text-green-400">✓ Doing well</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="text-xs opacity-50 space-y-1 pt-2 border-t border-green-400/20">
        <div>Stats: Health • Energy • Hunger • Social</div>
        <div className="flex gap-4">
          <span className="text-green-400">Good</span>
          <span className="text-yellow-400">Warning</span>
          <span className="text-red-400">Critical</span>
        </div>
      </div>
    </div>
  )
}
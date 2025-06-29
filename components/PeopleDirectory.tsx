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
      if (value > 70) return 'text-light-red'
      if (value > 40) return 'text-light-yellow'
      return 'text-green'
    } else {
      // For other stats, low is bad
      if (value < 30) return 'text-light-red'
      if (value < 60) return 'text-light-yellow'
      return 'text-green'
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
      {/* Header with sorting - removed since it's now in Terminal */}
      <div className="flex items-center justify-between mb-3">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="sf-button text-xs px-2 py-1"
        >
          <option value="name">SORT: NAME</option>
          <option value="health">SORT: HEALTH</option>
          <option value="energy">SORT: ENERGY</option>
          <option value="hunger">SORT: HUNGER</option>
          <option value="social">SORT: SOCIAL</option>
        </select>
      </div>

      {/* NPC List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
        {sortedNpcs.map(npc => {
          const stats = typeof npc.stats === 'string' ? JSON.parse(npc.stats) : npc.stats
          const personality = typeof npc.personality === 'string' ? JSON.parse(npc.personality) : npc.personality
          const isExpanded = expandedNpc === npc.id

          return (
            <div
              key={npc.id}
              className="border-[2px] border-white p-3 hover:border-light-yellow transition-colors"
            >
              {/* Main Info */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedNpc(isExpanded ? null : npc.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold">{npc.name.toUpperCase()}</span>
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
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs w-14 text-white/70">HEALTH</span>
                  <div className="flex-1 sf-stat-bar">
                    <div className={`sf-stat-fill ${stats.health > 70 ? 'stat-high' : stats.health > 30 ? 'stat-med' : 'stat-low'}`} style={{width: `${stats.health}%`}} />
                  </div>
                  <span className={`text-xs w-12 text-right ${getStatColor(stats.health, 'health')}`}>
                    {stats.health}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs w-14 text-white/70">HUNGER</span>
                  <div className="flex-1 sf-stat-bar">
                    <div className={`sf-stat-fill ${stats.hunger < 30 ? 'stat-high' : stats.hunger < 70 ? 'stat-med' : 'stat-low'}`} style={{width: `${stats.hunger}%`}} />
                  </div>
                  <span className={`text-xs w-12 text-right ${getStatColor(stats.hunger, 'hunger')}`}>
                    {stats.hunger}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs w-14 text-white/70">ENERGY</span>
                  <div className="flex-1 sf-stat-bar">
                    <div className={`sf-stat-fill ${stats.energy > 70 ? 'stat-high' : stats.energy > 30 ? 'stat-med' : 'stat-low'}`} style={{width: `${stats.energy}%`}} />
                  </div>
                  <span className={`text-xs w-12 text-right ${getStatColor(stats.energy, 'energy')}`}>
                    {stats.energy}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs w-14 text-white/70">SOCIAL</span>
                  <div className="flex-1 sf-stat-bar">
                    <div className={`sf-stat-fill ${stats.social > 70 ? 'stat-high' : stats.social > 30 ? 'stat-med' : 'stat-low'}`} style={{width: `${stats.social}%`}} />
                  </div>
                  <span className={`text-xs w-12 text-right ${getStatColor(stats.social, 'social')}`}>
                    {stats.social}%
                  </span>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-xs">
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

                  {/* Relationships */}
                  {npc.relationships && npc.relationships.length > 0 && (
                    <div className="space-y-1">
                      <div className="opacity-50">Relationships:</div>
                      <div className="ml-2 space-y-1">
                        {npc.relationships.slice(0, 3).map((rel: any) => (
                          <div key={rel.npc_id} className="flex items-center gap-2">
                            <span>{rel.npc_name}:</span>
                            <span className={rel.affinity > 0 ? 'text-green-400' : 'text-red-400'}>
                              {rel.affinity > 0 ? '+' : ''}{rel.affinity}
                            </span>
                            <span className="opacity-50 text-xs">
                              ({rel.familiarity}% familiar)
                            </span>
                          </div>
                        ))}
                        {npc.relationships.length > 3 && (
                          <div className="opacity-50">...and {npc.relationships.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status Summary */}
                  <div className="mt-2 p-2 bg-white/5 border border-white/20">
                    {stats.energy < 30 && (
                      <div className="text-light-yellow uppercase">! FEELING TIRED</div>
                    )}
                    {stats.hunger > 70 && (
                      <div className="text-light-red uppercase">! VERY HUNGRY</div>
                    )}
                    {stats.social < 30 && (
                      <div className="text-light-yellow uppercase">! FEELING LONELY</div>
                    )}
                    {stats.health < 50 && (
                      <div className="text-light-red uppercase">! HEALTH DECLINING</div>
                    )}
                    {stats.energy >= 30 && stats.hunger <= 70 && stats.social >= 30 && stats.health >= 50 && (
                      <div className="text-green uppercase">+ DOING WELL</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}
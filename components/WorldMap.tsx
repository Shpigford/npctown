'use client'

import { useMemo } from 'react'
import { 
  User, 
  Home, 
  Store, 
  Coffee, 
  Building2, 
  Trees, 
  Droplet,
  Wheat
} from 'lucide-react'
import type { NPC, Building } from '@/types/game'

const WORLD_SIZE = 20

interface WorldMapProps {
  npcs: NPC[]
  buildings: Building[]
}

interface MapCell {
  type: 'empty' | 'npc' | 'building'
  entity?: NPC | Building
  symbol?: string
}

export default function WorldMap({ npcs, buildings }: WorldMapProps) {
  const grid = useMemo(() => {
    // Initialize empty grid
    const map: MapCell[][] = Array(WORLD_SIZE).fill(null).map(() => 
      Array(WORLD_SIZE).fill(null).map(() => ({ type: 'empty' as const }))
    )

    // Place buildings
    buildings.forEach(building => {
      for (let y = building.y; y < building.y + building.height; y++) {
        for (let x = building.x; x < building.x + building.width; x++) {
          if (x < WORLD_SIZE && y < WORLD_SIZE) {
            map[y][x] = {
              type: 'building',
              entity: building,
              symbol: building.symbol
            }
          }
        }
      }
    })

    // Place NPCs (they override buildings visually)
    npcs.forEach(npc => {
      if (npc.x < WORLD_SIZE && npc.y < WORLD_SIZE) {
        map[npc.y][npc.x] = {
          type: 'npc',
          entity: npc,
          symbol: npc.symbol
        }
      }
    })

    return map
  }, [npcs, buildings])

  const getBuildingIcon = (building: Building) => {
    const iconProps = { size: 12, className: "inline-block" }
    
    switch (building.type) {
      case 'government':
        return <Building2 {...iconProps} className="text-blue-400" />
      case 'commerce':
        return <Store {...iconProps} className="text-yellow-400" />
      case 'social':
        return <Coffee {...iconProps} className="text-orange-400" />
      case 'residential':
        return <Home {...iconProps} className="text-green-400" />
      case 'production':
        return <Wheat {...iconProps} className="text-yellow-600" />
      case 'utility':
        return <Droplet {...iconProps} className="text-cyan-400" />
      default:
        return building.symbol
    }
  }

  return (
    <div className="font-mono text-xs leading-tight select-none">
      <div className="inline-block border-2 border-green-400/30 bg-black/80 relative overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Vertical lines */}
          {Array.from({ length: WORLD_SIZE + 1 }, (_, i) => (
            <div
              key={`v-${i}`}
              className="absolute top-0 bottom-0 w-px bg-green-400/10"
              style={{ left: `${i * 16}px` }}
            />
          ))}
          {/* Horizontal lines */}
          {Array.from({ length: WORLD_SIZE + 1 }, (_, i) => (
            <div
              key={`h-${i}`}
              className="absolute left-0 right-0 h-px bg-green-400/10"
              style={{ top: `${i * 16}px` }}
            />
          ))}
        </div>
        
        {/* Map content */}
        <div className="relative p-2">
          {grid.map((row, y) => (
            <div key={y} className="flex">
              {row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className="w-4 h-4 flex items-center justify-center relative group"
                >
                  {cell.type === 'empty' && (
                    <span className="opacity-20 text-gray-600">·</span>
                  )}
                  {cell.type === 'npc' && (
                    <>
                      <User size={12} className="text-yellow-400 animate-pulse z-10 relative" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black border border-green-400/50 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        {(cell.entity as NPC).name}
                      </div>
                    </>
                  )}
                  {cell.type === 'building' && (
                    <>
                      {getBuildingIcon(cell.entity as Building)}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black border border-green-400/50 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        {(cell.entity as Building).name}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="space-y-1">
          <div className="font-bold opacity-80">BUILDINGS:</div>
          <div className="flex items-center gap-2"><Building2 size={12} className="text-blue-400" /> Town Hall</div>
          <div className="flex items-center gap-2"><Store size={12} className="text-yellow-400" /> Market</div>
          <div className="flex items-center gap-2"><Coffee size={12} className="text-orange-400" /> Tavern</div>
        </div>
        <div className="space-y-1">
          <div className="font-bold opacity-80">ICONS:</div>
          <div className="flex items-center gap-2"><Home size={12} className="text-green-400" /> House</div>
          <div className="flex items-center gap-2"><Wheat size={12} className="text-yellow-600" /> Farm</div>
          <div className="flex items-center gap-2"><Droplet size={12} className="text-cyan-400" /> Well</div>
        </div>
      </div>
    </div>
  )
}
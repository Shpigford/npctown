'use client'

import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
const CELL_SIZE = 24 // pixels - larger cells for better visibility

interface WorldMapProps {
  npcs: NPC[]
  buildings: Building[]
}

interface NPCTrail {
  id: string
  positions: Array<{ x: number; y: number; timestamp: number }>
}

export default function AnimatedWorldMap({ npcs, buildings }: WorldMapProps) {
  const [npcTrails, setNpcTrails] = useState<Map<string, NPCTrail>>(new Map())

  // Track NPC movements
  useEffect(() => {
    setNpcTrails(prevTrails => {
      const newTrails = new Map(prevTrails)
      const now = Date.now()

      npcs.forEach(npc => {
        const trail = newTrails.get(npc.id) || { id: npc.id, positions: [] }
        const lastPos = trail.positions[trail.positions.length - 1]
        
        // Only add new position if NPC moved
        if (!lastPos || lastPos.x !== npc.x || lastPos.y !== npc.y) {
          trail.positions.push({ x: npc.x, y: npc.y, timestamp: now })
          // Keep only last 5 positions
          if (trail.positions.length > 5) {
            trail.positions.shift()
          }
        }
        
        // Remove old positions (older than 10 seconds)
        trail.positions = trail.positions.filter(pos => now - pos.timestamp < 10000)
        
        newTrails.set(npc.id, trail)
      })

      return newTrails
    })
  }, [npcs])

  const getBuildingIcon = (building: Building) => {
    const iconProps = { size: 16, className: "inline-block" }
    
    switch (building.type) {
      case 'government':
        return <Building2 {...iconProps} className="text-blue" />
      case 'commerce':
        return <Store {...iconProps} className="text-light-yellow" />
      case 'social':
        return <Coffee {...iconProps} className="text-magenta" />
      case 'residential':
        return <Home {...iconProps} className="text-green" />
      case 'production':
        return <Wheat {...iconProps} className="text-dark-yellow" />
      case 'utility':
        return <Droplet {...iconProps} className="text-cyan" />
      default:
        return building.symbol
    }
  }

  const buildingMap = useMemo(() => {
    const map = new Map<string, Building>()
    buildings.forEach(building => {
      for (let y = building.y; y < building.y + building.height; y++) {
        for (let x = building.x; x < building.x + building.width; x++) {
          if (x < WORLD_SIZE && y < WORLD_SIZE) {
            map.set(`${x},${y}`, building)
          }
        }
      }
    })
    return map
  }, [buildings])

  return (
    <div className="font-mono text-xs leading-tight select-none inline-block">
      <div className="border-[3px] border-white bg-black relative overflow-hidden">
        <div style={{ width: WORLD_SIZE * CELL_SIZE, height: WORLD_SIZE * CELL_SIZE }}>
        {/* Grid background */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
          }}
        />
        
          {/* Map content */}
          <div className="relative" style={{ width: WORLD_SIZE * CELL_SIZE, height: WORLD_SIZE * CELL_SIZE }}>
          {/* Empty cells */}
          {Array.from({ length: WORLD_SIZE }, (_, y) => (
            <div key={y} className="absolute" style={{ top: y * CELL_SIZE, left: 0 }}>
              {Array.from({ length: WORLD_SIZE }, (_, x) => (
                <div
                  key={`${x}-${y}`}
                  className="absolute flex items-center justify-center"
                  style={{
                    left: x * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE
                  }}
                >
                  <span className="text-white/20">·</span>
                </div>
              ))}
            </div>
          ))}

          {/* Building areas (background) */}
          {buildings.map(building => (
            <div
              key={`${building.id}-area`}
              className="absolute bg-white/5 border border-white/20"
              style={{
                left: building.x * CELL_SIZE,
                top: building.y * CELL_SIZE,
                width: building.width * CELL_SIZE,
                height: building.height * CELL_SIZE
              }}
            />
          ))}

          {/* Building icons */}
          {buildings.map(building => {
            // For multi-cell buildings, place icon in the center
            const centerX = building.x + Math.floor(building.width / 2)
            const centerY = building.y + Math.floor(building.height / 2)
            
            return (
              <div
                key={building.id}
                className="absolute flex items-center justify-center group"
                style={{
                  left: centerX * CELL_SIZE,
                  top: centerY * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE
                }}
              >
                {getBuildingIcon(building)}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black border border-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 uppercase">
                  {building.name}
                </div>
              </div>
            )
          })}

          {/* NPC movement trails */}
          <svg className="absolute inset-0 pointer-events-none" width={WORLD_SIZE * CELL_SIZE} height={WORLD_SIZE * CELL_SIZE}>
            {Array.from(npcTrails.values()).map(trail => {
              if (trail.positions.length < 2) return null
              
              return trail.positions.slice(0, -1).map((pos, i) => {
                const nextPos = trail.positions[i + 1]
                if (!nextPos) return null
                
                const age = Date.now() - pos.timestamp
                const opacity = Math.max(0, 1 - (age / 10000)) * 0.3
                
                return (
                  <line
                    key={`${trail.id}-${i}`}
                    x1={pos.x * CELL_SIZE + CELL_SIZE / 2}
                    y1={pos.y * CELL_SIZE + CELL_SIZE / 2}
                    x2={nextPos.x * CELL_SIZE + CELL_SIZE / 2}
                    y2={nextPos.y * CELL_SIZE + CELL_SIZE / 2}
                    stroke="#e5c07b"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity={opacity}
                  />
                )
              })
            })}
          </svg>

          {/* NPCs with smooth movement */}
          <AnimatePresence>
            {npcs.map(npc => (
              <motion.div
                key={npc.id}
                className="absolute flex items-center justify-center group"
                initial={{ 
                  left: npc.x * CELL_SIZE,
                  top: npc.y * CELL_SIZE
                }}
                animate={{ 
                  left: npc.x * CELL_SIZE,
                  top: npc.y * CELL_SIZE
                }}
                transition={{ 
                  type: "spring",
                  stiffness: 50,
                  damping: 15,
                  duration: 1
                }}
                style={{ width: CELL_SIZE, height: CELL_SIZE }}
              >
                <User size={16} className="text-light-yellow z-10 relative" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black border border-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 uppercase">
                  {npc.name}
                  <div className="text-[10px] opacity-70">
                    ({npc.x}, {npc.y})
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Grid info */}
      <div className="mt-2 text-[10px] text-white/50 uppercase">
        <div>GRID: {WORLD_SIZE}x{WORLD_SIZE} | COORDINATES: (0,0) TO ({WORLD_SIZE-1},{WORLD_SIZE-1})</div>
      </div>

      {/* Legend */}
      <div className="mt-3 border-t border-white/20 pt-3 grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <div className="font-bold text-white uppercase">BUILDINGS:</div>
          <div className="flex items-center gap-2 text-white/70"><Building2 size={14} className="text-blue" /> TOWN HALL</div>
          <div className="flex items-center gap-2 text-white/70"><Store size={14} className="text-light-yellow" /> MARKET</div>
          <div className="flex items-center gap-2 text-white/70"><Coffee size={14} className="text-magenta" /> TAVERN</div>
        </div>
        <div className="space-y-1">
          <div className="font-bold text-white uppercase">LEGEND:</div>
          <div className="flex items-center gap-2 text-white/70"><Home size={14} className="text-green" /> HOUSE</div>
          <div className="flex items-center gap-2 text-white/70"><Wheat size={14} className="text-dark-yellow" /> FARM</div>
          <div className="flex items-center gap-2 text-white/70"><Droplet size={14} className="text-cyan" /> WELL</div>
        </div>
      </div>
    </div>
  )
}
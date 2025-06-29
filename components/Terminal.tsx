'use client'

import { useEffect, useState } from 'react'
import AnimatedWorldMap from './AnimatedWorldMap'
import EventLog from './EventLog'
import StatusBar from './StatusBar'
import PeopleDirectory from './PeopleDirectory'
import InteractionPrompt from './InteractionPrompt'
import { useGame } from '@/lib/hooks/useGame'
import { useInteractionOpportunity } from '@/lib/hooks/useInteractionOpportunity'

export default function Terminal() {
  const { worldState, npcs, buildings, events, isLoading } = useGame()
  const [showHelp, setShowHelp] = useState(false)
  const { selectedNpc, handleClose, handleDecision } = useInteractionOpportunity(npcs)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setShowHelp(!showHelp)
      }
    }
    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [showHelp])

  if (isLoading) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-full mx-auto p-4">
        {/* Header Bar */}
        <header className="border-[3px] border-white bg-black mb-4">
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-[3px] border-white flex items-center justify-center font-bold text-xl">
                N
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wider">NPC TOWN</h1>
                <p className="text-xs opacity-70 uppercase">AI Social Experiment</p>
              </div>
            </div>
            
            {/* Status Bar inline with header */}
            <StatusBar worldState={worldState} npcCount={npcs.length} hasActiveInteraction={!!selectedNpc} />
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="space-y-4">
          {/* Top Row - Map and Event Log 50/50 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* World Map - 50% */}
            <div className="border-[3px] border-white bg-black">
              <h2 className="sf-header text-sm">WORLD MAP</h2>
              <div className="p-4">
                <AnimatedWorldMap npcs={npcs} buildings={buildings} />
              </div>
            </div>
            
            {/* Event Log - 50% */}
            <div className="border-[3px] border-white bg-black">
              <h2 className="sf-header text-sm">ACTIVITY LOG</h2>
              <div className="p-4">
                <EventLog events={events} />
              </div>
            </div>
          </div>
          
          {/* Bottom Full Width - People Directory */}
          <div className="border-[3px] border-white bg-black">
            <h2 className="sf-header text-sm">PEOPLE DIRECTORY</h2>
            <div className="p-4">
              <PeopleDirectory npcs={npcs} />
            </div>
          </div>
        </div>

        {/* Help */}
        {showHelp && (
          <div className="border-[3px] border-white bg-black mt-4">
            <h2 className="sf-header text-sm">HELP</h2>
            <div className="p-4 text-xs space-y-2 font-mono">
              <div className="text-white uppercase font-bold">CONTROLS:</div>
              <div className="text-white/70">H - Toggle this help menu</div>
              <div className="text-white/70">Hover over map icons to see names</div>
              <div className="mt-3 text-white uppercase font-bold">SIMULATION:</div>
              <div className="text-white/70">Time progresses every 30 seconds</div>
              <div className="text-white/70">NPCs make AI-driven decisions</div>
              <div className="text-white/70">Watch the event log for activities</div>
            </div>
          </div>
        )}

        {/* Footer Bar */}
        <footer className="border-[3px] border-white bg-black mt-4">
          <div className="px-4 py-2 text-center">
            <div className="text-xs uppercase tracking-wider">
              <span className="text-white/70">[H] HELP</span>
              <span className="mx-3 text-white/30">|</span>
              <span className="text-green">SIMULATION RUNNING...</span>
              <span className="mx-3 text-white/30">|</span>
              <a 
                href="https://github.com/Shpigford/npctown" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
              >
                GITHUB
              </a>
            </div>
          </div>
        </footer>

        {/* Interaction Prompt */}
        {selectedNpc && (
          <InteractionPrompt
            npc={selectedNpc}
            onClose={handleClose}
            onDecision={handleDecision}
          />
        )}
      </div>
    </div>
  )
}
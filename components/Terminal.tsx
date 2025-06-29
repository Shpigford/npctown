'use client'

import { useEffect, useState } from 'react'
import AnimatedWorldMap from './AnimatedWorldMap'
import EventLog from './EventLog'
import StatusBar from './StatusBar'
import ManualTrigger from './ManualTrigger'
import PeopleDirectory from './PeopleDirectory'
import NPCSpawner from './NPCSpawner'
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
    <div className="w-full max-w-7xl mx-auto">
      <div className="border border-green-400/50 terminal-border bg-black p-4 space-y-4">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold terminal-glow">NPC TOWN</h1>
          <p className="text-xs opacity-70">AI SOCIAL EXPERIMENT v1.0</p>
        </div>

        {/* Status Bar */}
        <StatusBar worldState={worldState} npcCount={npcs.length} hasActiveInteraction={!!selectedNpc} />

        {/* Main Content */}
        <div className="space-y-4">
          {/* Top Row - Map and Event Log side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* World Map */}
            <div className="border border-green-400/30 p-4">
              <h2 className="text-sm font-bold mb-2 opacity-80">WORLD MAP</h2>
              <AnimatedWorldMap npcs={npcs} buildings={buildings} />
            </div>
            
            {/* Event Log */}
            <div className="border border-green-400/30 p-4">
              <h2 className="text-sm font-bold mb-2 opacity-80">EVENT LOG</h2>
              <EventLog events={events} />
            </div>
          </div>

          {/* Bottom Row - People Directory and Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* People Directory (2 columns wide) */}
            <div className="lg:col-span-2 border border-green-400/30 p-4">
              <PeopleDirectory npcs={npcs} />
            </div>
            
            {/* Controls Column */}
            <div className="space-y-4">
              <NPCSpawner />
              <ManualTrigger />
            </div>
          </div>
        </div>

        {/* Help */}
        {showHelp && (
          <div className="border border-green-400/30 p-4 text-xs space-y-2">
            <div className="font-bold">CONTROLS:</div>
            <div className="opacity-70">H - Toggle this help menu</div>
            <div className="opacity-70">Hover over map icons to see names</div>
            <div className="mt-2 font-bold">SIMULATION:</div>
            <div className="opacity-70">Time progresses every 30 seconds</div>
            <div className="opacity-70">NPCs make AI-driven decisions</div>
            <div className="opacity-70">Watch the event log for activities</div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs opacity-50">
          Press H for help | Simulation running...
        </div>
      </div>

      {/* Interaction Prompt */}
      {selectedNpc && (
        <InteractionPrompt
          npc={selectedNpc}
          onClose={handleClose}
          onDecision={handleDecision}
        />
      )}
    </div>
  )
}
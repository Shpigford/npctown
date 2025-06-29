'use client'

import { useState, useEffect } from 'react'
import { User, X, Clock, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { NPC } from '@/types/game'

interface InteractionPromptProps {
  npc: NPC
  onClose: () => void
  onDecision: (action: string) => void
}

export default function InteractionPrompt({ npc, onClose, onDecision }: InteractionPromptProps) {
  const [timeLeft, setTimeLeft] = useState(15) // 15 seconds to decide
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()
  
  const stats = typeof npc.stats === 'string' ? JSON.parse(npc.stats) : npc.stats
  const personality = typeof npc.personality === 'string' ? JSON.parse(npc.personality) : npc.personality

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onClose])

  const handleChoice = async (choice: {
    action: string,
    target: string,
    description: string,
    dialogue?: string
  }) => {
    setIsSubmitting(true)
    
    try {
      // Log the visitor interaction
      await supabase.from('events').insert({
        npc_id: npc.id,
        type: 'system',
        description: `🎮 A visitor guided ${npc.name}'s decision`,
        metadata: { visitor_choice: choice }
      })

      // Apply the decision through the API
      await fetch('/api/npc-actions/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npcId: npc.id,
          decision: choice
        })
      })

      onDecision(choice.action)
    } catch (error) {
      console.error('Failed to submit choice:', error)
    }
  }

  const getContextualChoices = () => {
    const choices = []

    // Movement options based on energy
    if (stats.energy > 20) {
      choices.push({
        action: 'move',
        target: 'north',
        description: `${npc.name} heads north to explore new areas`,
        dialogue: personality.traits?.includes('curious') ? "I wonder what's up there!" : null
      })
    }

    // Social options if others are nearby
    choices.push({
      action: 'speak',
      target: null,
      description: `${npc.name} calls out to see if anyone's around`,
      dialogue: stats.social < 50 ? "Hello? Is anyone there? I could use some company!" : "What a lovely day!"
    })

    // Need-based options
    if (stats.hunger > 60) {
      choices.push({
        action: 'move',
        target: 'Market',
        description: `${npc.name} decides to head to the Market for food`,
        dialogue: "I'm getting quite hungry... time for a snack!"
      })
    }

    if (stats.energy < 40) {
      choices.push({
        action: 'rest',
        target: null,
        description: `${npc.name} sits down to rest and recover energy`,
        dialogue: "I need to take a break..."
      })
    }

    // Personality-based options
    if (personality.traits?.includes('social')) {
      choices.push({
        action: 'move',
        target: 'Tavern',
        description: `${npc.name} heads to the Tavern to socialize`,
        dialogue: "Time to see what everyone's up to!"
      })
    }

    if (personality.traits?.includes('hardworking')) {
      choices.push({
        action: 'move',
        target: 'Farm',
        description: `${npc.name} goes to help at the Farm`,
        dialogue: "There's always work to be done!"
      })
    }

    // Always include a free choice
    choices.push({
      action: 'observe',
      target: null,
      description: `${npc.name} takes a moment to observe their surroundings thoughtfully`,
      dialogue: null
    })

    return choices.slice(0, 4) // Limit to 4 choices
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-black border-[3px] border-white p-0 max-w-2xl w-full">
        {/* Header */}
        <div className="sf-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} />
            <span className="text-sm font-bold">VISITOR CONTROL: {npc.name.toUpperCase()}</span>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white hover:text-black px-2 py-1 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="p-6">

          {/* Timer */}
          <div className="flex items-center gap-2 mb-4 text-xs uppercase">
            <Clock size={12} className={timeLeft <= 5 ? 'text-light-red animate-pulse' : 'text-white'} />
            <span className={timeLeft <= 5 ? 'text-light-red font-bold' : 'text-white/70'}>
              TIME: {timeLeft}s
            </span>
          </div>

          {/* NPC Status */}
          <div className="border border-white/20 p-3 mb-4 text-xs">
            <div className="font-bold uppercase mb-2">CURRENT STATUS:</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-white/70">
              <div>POSITION: ({npc.x}, {npc.y})</div>
              <div>ENERGY: <span className={stats.energy < 30 ? 'text-light-red' : 'text-green'}>{stats.energy}%</span></div>
              <div>HUNGER: <span className={stats.hunger > 70 ? 'text-light-red' : 'text-green'}>{stats.hunger}%</span></div>
              <div>SOCIAL: <span className={stats.social < 30 ? 'text-light-yellow' : 'text-green'}>{stats.social}%</span></div>
            </div>
            <div className="mt-2 text-white/70">
              TRAITS: {personality.traits?.join(', ').toUpperCase()}
            </div>
          </div>

          {/* Choices */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase mb-3">SELECT ACTION:</div>
            {getContextualChoices().map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoice(choice)}
                disabled={isSubmitting}
                className="w-full text-left p-3 border-[2px] border-white hover:bg-white hover:text-black transition-all disabled:opacity-50 group"
              >
              <div className="flex items-start gap-3">
                  <span className="text-light-yellow group-hover:text-black">[{index + 1}]</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium uppercase">{choice.description}</div>
                    {choice.dialogue && (
                      <div className="text-xs italic text-white/50 group-hover:text-black/70 mt-1">
                        "{choice.dialogue}"
                      </div>
                    )}
                  </div>
              </div>
            </button>
          ))}
        </div>

          {/* Footer */}
          <div className="mt-4 text-xs text-center text-white/50 uppercase">
            YOUR CHOICE WILL GUIDE {npc.name.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  )
}
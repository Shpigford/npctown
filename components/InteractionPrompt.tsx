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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-black border-2 border-green-400 p-6 max-w-2xl w-full terminal-border animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <User size={20} className="text-yellow-400" />
            <h2 className="text-lg font-bold text-green-400">
              VISITOR INTERACTION: {npc.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-green-400 hover:text-green-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <Clock size={14} className={timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-green-400'} />
          <span className={timeLeft <= 5 ? 'text-red-400' : 'text-green-400'}>
            Time remaining: {timeLeft}s
          </span>
        </div>

        {/* NPC Status */}
        <div className="bg-green-400/10 p-3 rounded mb-4 text-xs">
          <div className="font-semibold mb-2">{npc.name}'s Current State:</div>
          <div className="grid grid-cols-2 gap-2">
            <div>Location: ({npc.x}, {npc.y})</div>
            <div>Energy: {stats.energy}%</div>
            <div>Hunger: {stats.hunger}%</div>
            <div>Social: {stats.social}%</div>
          </div>
          <div className="mt-2">
            Personality: {personality.traits?.join(', ')}
          </div>
        </div>

        {/* Choices */}
        <div className="space-y-2">
          <div className="text-sm font-semibold mb-2">What should {npc.name} do?</div>
          {getContextualChoices().map((choice, index) => (
            <button
              key={index}
              onClick={() => handleChoice(choice)}
              disabled={isSubmitting}
              className="w-full text-left p-3 border border-green-400/30 hover:border-green-400 hover:bg-green-400/10 transition-all disabled:opacity-50 group"
            >
              <div className="flex items-start gap-3">
                <Zap size={14} className="text-yellow-400 mt-0.5 group-hover:animate-pulse" />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{choice.description}</div>
                  {choice.dialogue && (
                    <div className="text-xs italic opacity-70 mt-1">
                      "{choice.dialogue}"
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 text-xs text-center opacity-50">
          Your choice will influence {npc.name}'s next action
        </div>
      </div>
    </div>
  )
}
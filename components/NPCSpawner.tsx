'use client'

import { useState } from 'react'
import { UserPlus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const PERSONALITY_TRAITS = [
  'curious', 'friendly', 'hardworking', 'creative', 'adventurous',
  'cautious', 'ambitious', 'lazy', 'social', 'introverted'
]

const LIKES = [
  'exploring', 'talking', 'working', 'resting', 'eating',
  'building', 'learning', 'helping', 'trading', 'farming'
]

const DISLIKES = [
  'conflict', 'crowds', 'noise', 'work', 'rain',
  'loneliness', 'boredom', 'hunger', 'darkness', 'waiting'
]

const NAMES = [
  'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Henry', 'Iris',
  'Jack', 'Kate', 'Leo', 'Maya', 'Noah', 'Olivia', 'Pete', 'Quinn',
  'Rose', 'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xavier', 'Yara', 'Zoe'
]

export default function NPCSpawner() {
  const [isSpawning, setIsSpawning] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [npcName, setNpcName] = useState('')
  const supabase = createClient()

  const getRandomElements = <T,>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  const spawnRandomNPC = async () => {
    setIsSpawning(true)
    
    try {
      const name = npcName || NAMES[Math.floor(Math.random() * NAMES.length)]
      const traits = getRandomElements(PERSONALITY_TRAITS, 3)
      const likes = getRandomElements(LIKES, 2)
      const dislikes = getRandomElements(DISLIKES, 2)
      
      // Find a random empty spot
      const x = Math.floor(Math.random() * 20)
      const y = Math.floor(Math.random() * 20)
      
      const { error } = await supabase.from('npcs').insert({
        name,
        x,
        y,
        personality: {
          traits,
          likes,
          dislikes
        },
        stats: {
          health: 100,
          energy: 100,
          hunger: 0,
          social: 50
        },
        relationships: []
      })

      if (error) {
        console.error('Failed to spawn NPC:', error)
      } else {
        // Log the spawn event
        await supabase.from('events').insert({
          type: 'system',
          description: `${name} has arrived in NPC Town!`,
          metadata: { npc_name: name, spawn_location: { x, y } }
        })
      }
    } catch (error) {
      console.error('Error spawning NPC:', error)
    } finally {
      setIsSpawning(false)
      setShowForm(false)
      setNpcName('')
    }
  }

  return (
    <div className="sf-panel">
      <h3 className="text-sm font-bold mb-3 pb-2 border-b border-white/50">SPAWN CITIZEN</h3>
      
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          disabled={isSpawning}
          className="w-full sf-button py-2 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span className="mr-2">+</span>
          <span>ADD NEW CITIZEN</span>
        </button>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Name (optional, random if empty)"
            value={npcName}
            onChange={(e) => setNpcName(e.target.value)}
            className="w-full px-2 py-1 bg-black border-2 border-white text-amber-600 text-sm focus:outline-none focus:border-white"
          />
          <div className="flex gap-2">
            <button
              onClick={spawnRandomNPC}
              disabled={isSpawning}
              className="flex-1 sf-button py-1 disabled:opacity-50 text-sm flex items-center justify-center gap-1"
            >
              {isSpawning ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>SPAWNING...</span>
                </>
              ) : (
                <>
                  <UserPlus size={12} />
                  <span>SPAWN</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                setNpcName('')
              }}
              className="sf-button py-1 opacity-70 hover:opacity-100 transition-opacity text-sm"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
      
      <div className="text-sm opacity-50 mt-2">
        RANDOM PERSONALITY & LOCATION
      </div>
    </div>
  )
}
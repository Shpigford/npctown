export interface NPC {
  id: string
  name: string
  x: number
  y: number
  symbol: string
  personality: {
    traits: string[]
    likes: string[]
    dislikes: string[]
  }
  stats: {
    health: number
    energy: number
    hunger: number
    social: number
  }
  memory: Memory[]
  current_action: string | null
}

export interface Memory {
  event: string
  timestamp: string
  importance: number
  related_npcs?: string[]
}

export interface Building {
  id: string
  name: string
  type: 'residential' | 'commerce' | 'social' | 'government' | 'production' | 'utility'
  x: number
  y: number
  width: number
  height: number
  symbol: string
  properties: Record<string, any>
}

export interface WorldState {
  time_of_day: number // 0-23
  day_count: number
  weather: 'clear' | 'rain' | 'fog' | 'storm'
  global_events: string[]
}

export interface GameEvent {
  id: string
  npc_id: string | null
  type: 'movement' | 'interaction' | 'dialogue' | 'action' | 'system'
  description: string
  location?: { x: number; y: number }
  metadata: Record<string, any>
  created_at: string
}

export interface MapTile {
  x: number
  y: number
  occupied: boolean
  building?: Building
  npc?: NPC
}
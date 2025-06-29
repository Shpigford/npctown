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
  relationships: Relationship[]
  current_action: string | null
}

export interface Memory {
  event: string
  timestamp: string
  importance: number
  related_npcs?: string[]
  thought?: string
}

export interface Relationship {
  npc_id: string
  npc_name: string
  familiarity: number // 0-100, how well they know each other
  affinity: number // -100 to 100, how much they like each other
  last_interaction: string
  interaction_count: number
  notes: string[] // memorable moments or impressions
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
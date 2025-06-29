export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      npcs: {
        Row: {
          id: string
          name: string
          x: number
          y: number
          symbol: string
          personality: Json
          stats: Json
          memory: Json
          relationships: Json
          current_action: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          x: number
          y: number
          symbol?: string
          personality?: Json
          stats?: Json
          memory?: Json
          relationships?: Json
          current_action?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          x?: number
          y?: number
          symbol?: string
          personality?: Json
          stats?: Json
          memory?: Json
          relationships?: Json
          current_action?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      buildings: {
        Row: {
          id: string
          name: string
          type: string
          x: number
          y: number
          width: number
          height: number
          symbol: string
          properties: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          x: number
          y: number
          width?: number
          height?: number
          symbol?: string
          properties?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          x?: number
          y?: number
          width?: number
          height?: number
          symbol?: string
          properties?: Json
          created_at?: string
        }
      }
      world_state: {
        Row: {
          id: string
          time_of_day: number
          day_count: number
          weather: string
          global_events: Json
          updated_at: string
        }
        Insert: {
          id?: string
          time_of_day?: number
          day_count?: number
          weather?: string
          global_events?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          time_of_day?: number
          day_count?: number
          weather?: string
          global_events?: Json
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          npc_id: string | null
          type: string
          description: string
          location: Json | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          npc_id?: string | null
          type: string
          description: string
          location?: Json | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          npc_id?: string | null
          type?: string
          description?: string
          location?: Json | null
          metadata?: Json
          created_at?: string
        }
      }
    }
  }
}
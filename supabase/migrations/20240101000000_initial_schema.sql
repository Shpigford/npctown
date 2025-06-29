-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- NPCs table
CREATE TABLE npcs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  symbol CHAR(1) NOT NULL DEFAULT 'N',
  personality JSONB NOT NULL DEFAULT '{}',
  stats JSONB NOT NULL DEFAULT '{"health": 100, "energy": 100, "hunger": 0, "social": 50}',
  memory JSONB NOT NULL DEFAULT '[]',
  current_action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buildings table
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  width INTEGER NOT NULL DEFAULT 1,
  height INTEGER NOT NULL DEFAULT 1,
  symbol CHAR(1) NOT NULL DEFAULT '#',
  properties JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- World state table
CREATE TABLE world_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  time_of_day INTEGER NOT NULL DEFAULT 0, -- 0-23 hours
  day_count INTEGER NOT NULL DEFAULT 1,
  weather TEXT NOT NULL DEFAULT 'clear',
  global_events JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events log table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  npc_id UUID REFERENCES npcs(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  location JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_npcs_location ON npcs(x, y);
CREATE INDEX idx_buildings_location ON buildings(x, y);
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_events_npc_id ON events(npc_id);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_npcs_updated_at BEFORE UPDATE ON npcs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_world_state_updated_at BEFORE UPDATE ON world_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial world state
INSERT INTO world_state (time_of_day, day_count, weather) 
VALUES (8, 1, 'clear');

-- Insert initial buildings
INSERT INTO buildings (name, type, x, y, width, height, symbol, properties) VALUES
  ('Town Hall', 'government', 9, 9, 3, 3, 'H', '{"capacity": 20}'),
  ('Market', 'commerce', 5, 5, 2, 2, 'M', '{"goods": ["food", "tools"]}'),
  ('Tavern', 'social', 13, 5, 2, 2, 'T', '{"capacity": 10}'),
  ('House 1', 'residential', 3, 13, 1, 1, 'h', '{"owner": null}'),
  ('House 2', 'residential', 5, 13, 1, 1, 'h', '{"owner": null}'),
  ('House 3', 'residential', 7, 13, 1, 1, 'h', '{"owner": null}'),
  ('Farm', 'production', 15, 13, 3, 2, 'F', '{"produces": "food", "output": 5}'),
  ('Well', 'utility', 10, 6, 1, 1, 'W', '{"resource": "water"}');

-- Insert initial NPCs with diverse personalities
INSERT INTO npcs (name, x, y, personality, stats) VALUES
  ('Alice', 10, 10, 
   '{"traits": ["curious", "friendly", "hardworking"], "likes": ["exploring", "talking", "learning"], "dislikes": ["conflict", "boredom"]}',
   '{"health": 100, "energy": 100, "hunger": 0, "social": 50}'),
  
  ('Bob', 5, 7, 
   '{"traits": ["lazy", "humorous", "social"], "likes": ["resting", "eating", "joking"], "dislikes": ["work", "early mornings"]}',
   '{"health": 100, "energy": 60, "hunger": 40, "social": 80}'),
  
  ('Carol', 15, 15, 
   '{"traits": ["ambitious", "creative", "introverted"], "likes": ["building", "quiet time", "farming"], "dislikes": ["crowds", "noise"]}',
   '{"health": 100, "energy": 90, "hunger": 20, "social": 30}');
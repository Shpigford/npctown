-- Add relationships column to NPCs table
ALTER TABLE npcs ADD COLUMN relationships JSONB NOT NULL DEFAULT '[]';

-- Update existing NPCs with empty relationships
UPDATE npcs SET relationships = '[]' WHERE relationships IS NULL;
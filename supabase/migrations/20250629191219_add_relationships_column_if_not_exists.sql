-- Add relationships column to npcs table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'npcs' 
        AND column_name = 'relationships'
    ) THEN
        ALTER TABLE npcs ADD COLUMN relationships JSONB NOT NULL DEFAULT '[]';
    END IF;
END $$;
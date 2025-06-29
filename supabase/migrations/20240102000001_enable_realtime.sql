-- Enable realtime for all tables
-- Check if tables are already in publication before adding
DO $$
BEGIN
    -- Add npcs table if not already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'npcs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE npcs;
    END IF;
    
    -- Add buildings table if not already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'buildings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE buildings;
    END IF;
    
    -- Add world_state table if not already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'world_state'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE world_state;
    END IF;
    
    -- Add events table if not already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'events'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE events;
    END IF;
END $$;
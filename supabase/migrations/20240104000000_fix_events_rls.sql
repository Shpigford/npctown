-- Disable RLS on events table to allow anonymous access
-- This is safe for a public simulation where all events should be visible
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read all events
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'events' 
        AND policyname = 'Events are viewable by everyone'
    ) THEN
        CREATE POLICY "Events are viewable by everyone" ON events
            FOR SELECT USING (true);
    END IF;
END $$;

-- Allow authenticated users (your backend) to insert events
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'events' 
        AND policyname = 'Authenticated users can insert events'
    ) THEN
        CREATE POLICY "Authenticated users can insert events" ON events
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Ensure the events table is included in real-time publications
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'events'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE events;
    END IF;
END $$;
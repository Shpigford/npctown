-- Disable RLS on events table to allow anonymous access
-- This is safe for a public simulation where all events should be visible
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read all events
CREATE POLICY "Events are viewable by everyone" ON events
    FOR SELECT USING (true);

-- Allow authenticated users (your backend) to insert events
CREATE POLICY "Authenticated users can insert events" ON events
    FOR INSERT WITH CHECK (true);

-- Ensure the events table is included in real-time publications
ALTER PUBLICATION supabase_realtime ADD TABLE events;
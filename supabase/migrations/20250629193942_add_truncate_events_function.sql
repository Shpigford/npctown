-- Add DELETE policy for events table
-- This was missing and preventing event deletion during reset
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'events' 
        AND policyname = 'Authenticated users can delete events'
    ) THEN
        CREATE POLICY "Authenticated users can delete events" ON events
            FOR DELETE USING (true);
    END IF;
END $$;

-- Also create a function to delete all events that bypasses RLS
-- Using SECURITY DEFINER to run with the function owner's privileges
CREATE OR REPLACE FUNCTION delete_all_events()
RETURNS void AS $$
BEGIN
    DELETE FROM events;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_all_events() TO authenticated;
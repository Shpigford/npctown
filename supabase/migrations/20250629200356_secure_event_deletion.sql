-- Replace the open DELETE policy with a more restrictive one
-- Only allow deletion of events during a game reset

-- First, drop the existing policy if it exists
DO $$
BEGIN
    DROP POLICY IF EXISTS "Authenticated users can delete events" ON events;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Create a more secure delete function that checks if reset is active
CREATE OR REPLACE FUNCTION delete_all_events()
RETURNS void AS $$
DECLARE
    reset_active boolean;
BEGIN
    -- Check if reset_game flag is true
    SELECT setting_value::boolean INTO reset_active
    FROM admin_controls
    WHERE setting_name = 'reset_game';
    
    -- Only allow deletion if reset is active
    IF reset_active = true THEN
        DELETE FROM events;
    ELSE
        RAISE EXCEPTION 'Event deletion is only allowed during game reset';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Keep the execute permission for authenticated users
-- But now the function itself checks if reset is active
GRANT EXECUTE ON FUNCTION delete_all_events() TO authenticated;

-- Add a more restrictive DELETE policy that only allows deletion of old events (older than 7 days)
-- This allows for cleanup without allowing mass deletion
CREATE POLICY "Allow deletion of old events only" ON events
    FOR DELETE 
    USING (created_at < NOW() - INTERVAL '7 days');
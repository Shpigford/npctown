-- Create admin_controls table for game management
CREATE TABLE IF NOT EXISTS admin_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_name TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the reset_game control with default value false
INSERT INTO admin_controls (setting_name, setting_value)
VALUES ('reset_game', 'false'::jsonb)
ON CONFLICT (setting_name) DO NOTHING;

-- Enable RLS
ALTER TABLE admin_controls ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read and update admin controls
CREATE POLICY "Authenticated users can manage admin controls" ON admin_controls
    FOR ALL USING (true) WITH CHECK (true);
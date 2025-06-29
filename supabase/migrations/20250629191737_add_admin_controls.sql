-- Create admin_controls table for game management
CREATE TABLE IF NOT EXISTS admin_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_name TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert reset flag with default value (simple boolean)
INSERT INTO admin_controls (setting_name, setting_value)
VALUES ('reset_game', 'false')
ON CONFLICT (setting_name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_controls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_admin_controls_updated_at
BEFORE UPDATE ON admin_controls
FOR EACH ROW
EXECUTE FUNCTION update_admin_controls_updated_at();

-- Enable RLS on admin_controls
ALTER TABLE admin_controls ENABLE ROW LEVEL SECURITY;

-- Create policy: anyone can read admin_controls
CREATE POLICY "Allow public read access" ON admin_controls
  FOR SELECT USING (true);

-- Create policy: only authenticated users can update admin_controls
CREATE POLICY "Allow authenticated update access" ON admin_controls
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Enable realtime for admin_controls
ALTER PUBLICATION supabase_realtime ADD TABLE admin_controls;
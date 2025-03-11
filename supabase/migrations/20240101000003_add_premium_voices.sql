-- Create voices table to store available voice options
CREATE TABLE IF NOT EXISTS voices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  language TEXT NOT NULL,
  gender TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample voices
INSERT INTO voices (id, name, language, gender, is_premium)
VALUES
  ('en-US-1', 'Emma', 'en-US', 'female', false),
  ('en-US-2', 'Michael', 'en-US', 'male', false),
  ('en-GB-1', 'Olivia', 'en-GB', 'female', false),
  ('en-GB-2', 'James', 'en-GB', 'male', false),
  ('en-AU-1', 'Charlotte', 'en-AU', 'female', false),
  ('en-US-premium-1', 'Sophia', 'en-US', 'female', true),
  ('en-US-premium-2', 'William', 'en-US', 'male', true),
  ('en-GB-premium-1', 'Isabella', 'en-GB', 'female', true),
  ('en-GB-premium-2', 'Alexander', 'en-GB', 'male', true),
  ('fr-FR-premium-1', 'Camille', 'fr-FR', 'female', true),
  ('de-DE-premium-1', 'Hannah', 'de-DE', 'female', true),
  ('es-ES-premium-1', 'Sofia', 'es-ES', 'female', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE voices ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to view voices
DROP POLICY IF EXISTS "Everyone can view voices";
CREATE POLICY "Everyone can view voices"
  ON voices FOR SELECT
  USING (true);

-- Add to realtime publication
alter publication supabase_realtime add table voices;

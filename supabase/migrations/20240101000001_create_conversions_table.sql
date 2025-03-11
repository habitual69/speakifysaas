-- Create conversions table to track user text-to-speech conversions
CREATE TABLE IF NOT EXISTS conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  token_count INTEGER NOT NULL,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own conversions
DROP POLICY IF EXISTS "Users can view their own conversions";
CREATE POLICY "Users can view their own conversions"
  ON conversions FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own conversions
DROP POLICY IF EXISTS "Users can insert their own conversions";
CREATE POLICY "Users can insert their own conversions"
  ON conversions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add to realtime publication
alter publication supabase_realtime add table conversions;

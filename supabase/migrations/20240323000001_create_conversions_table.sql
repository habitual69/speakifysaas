CREATE TABLE IF NOT EXISTS public.conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  token_count INTEGER NOT NULL,
  audio_url TEXT,
  task_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own conversions" ON public.conversions;
CREATE POLICY "Users can view their own conversions"
  ON public.conversions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own conversions" ON public.conversions;
CREATE POLICY "Users can insert their own conversions"
  ON public.conversions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own conversions" ON public.conversions;
CREATE POLICY "Users can update their own conversions"
  ON public.conversions
  FOR UPDATE
  USING (auth.uid() = user_id);
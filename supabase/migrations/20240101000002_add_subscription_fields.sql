-- Add subscription fields to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS monthly_token_limit INTEGER DEFAULT 10000,
  ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tokens_reset_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month');

-- Add function to reset token usage monthly
CREATE OR REPLACE FUNCTION reset_monthly_tokens()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tokens_reset_date <= NOW() THEN
    NEW.tokens_used := 0;
    NEW.tokens_reset_date := NOW() + INTERVAL '1 month';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to reset tokens monthly
DROP TRIGGER IF EXISTS reset_tokens_trigger ON users;
CREATE TRIGGER reset_tokens_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION reset_monthly_tokens();

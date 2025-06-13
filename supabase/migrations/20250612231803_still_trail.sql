/*
  # Create API keys table

  1. New Tables
    - `api_keys`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `key_name` (text, user-friendly name for the key)
      - `encrypted_key` (text, encrypted API key)
      - `provider` (text, API provider - e.g., 'openai')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `api_keys` table
    - Add policies for authenticated users to manage their own keys
    - Limit users to maximum 2 keys
*/

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name text NOT NULL,
  encrypted_key text NOT NULL,
  provider text NOT NULL DEFAULT 'openai',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own API keys"
  ON api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own API keys"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys"
  ON api_keys
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
  ON api_keys
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
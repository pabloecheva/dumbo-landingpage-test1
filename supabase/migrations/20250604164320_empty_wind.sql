/*
  # Create contexts table and policies

  1. New Tables
    - contexts
      - id (uuid, primary key)
      - name (text)
      - user_id (uuid, references auth.users)
      - created_at (timestamptz)
      - updated_at (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Only authenticated users can access their own contexts
*/

-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create contexts table if it doesn't exist
CREATE TABLE IF NOT EXISTS contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contexts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create contexts" ON contexts;
DROP POLICY IF EXISTS "Users can read own contexts" ON contexts;
DROP POLICY IF EXISTS "Users can update own contexts" ON contexts;
DROP POLICY IF EXISTS "Users can delete own contexts" ON contexts;

-- Create policies
CREATE POLICY "Users can create contexts"
  ON contexts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own contexts"
  ON contexts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own contexts"
  ON contexts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contexts"
  ON contexts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_contexts_updated_at ON contexts;

-- Create trigger for updating the updated_at column
CREATE TRIGGER update_contexts_updated_at
  BEFORE UPDATE ON contexts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
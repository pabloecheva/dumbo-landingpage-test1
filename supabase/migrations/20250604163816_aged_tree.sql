/*
  # Create contexts table

  1. New Tables
    - `contexts`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `contexts` table
    - Add policies for authenticated users to:
      - Read their own contexts
      - Create new contexts
      - Update their own contexts
      - Delete their own contexts
*/

CREATE TABLE contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contexts ENABLE ROW LEVEL SECURITY;

-- Policy for reading own contexts
CREATE POLICY "Users can read own contexts"
  ON contexts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for creating contexts
CREATE POLICY "Users can create contexts"
  ON contexts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating own contexts
CREATE POLICY "Users can update own contexts"
  ON contexts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for deleting own contexts
CREATE POLICY "Users can delete own contexts"
  ON contexts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_contexts_updated_at
  BEFORE UPDATE ON contexts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
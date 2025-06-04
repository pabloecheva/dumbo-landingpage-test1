/*
  # Fix RLS policies for contexts table

  1. Changes
    - Update RLS policies for the contexts table to properly handle INSERT operations
    - Ensure authenticated users can create new contexts
    - Maintain existing policies for other operations

  2. Security
    - Enable RLS on contexts table (if not already enabled)
    - Add policy for authenticated users to insert new contexts
    - Ensure user_id is set to the authenticated user's ID
*/

-- First ensure RLS is enabled
ALTER TABLE contexts ENABLE ROW LEVEL SECURITY;

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can create contexts" ON contexts;

-- Create new INSERT policy that properly sets the user_id
CREATE POLICY "Users can create contexts"
ON contexts
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- Ensure the user_id is automatically set to the authenticated user's ID
ALTER TABLE contexts ALTER COLUMN user_id SET DEFAULT auth.uid();
/*
  # Update Files Table RLS Policies

  1. Changes
    - Drop existing INSERT policy
    - Create new INSERT policy with correct context ownership check
    - Update SELECT policy to include context ownership check
    - Update DELETE policy to include context ownership check

  2. Security
    - Ensures users can only create files in contexts they own
    - Maintains data isolation between users
    - Preserves existing security model
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can create files" ON files;

-- Create new INSERT policy that properly checks context ownership
CREATE POLICY "Users can create files" ON files
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM contexts 
    WHERE contexts.id = context_id 
    AND contexts.user_id = auth.uid()
  )
);

-- Update SELECT policy to include context ownership
DROP POLICY IF EXISTS "Users can read own files" ON files;
CREATE POLICY "Users can read own files" ON files
FOR SELECT TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM contexts 
    WHERE contexts.id = context_id 
    AND contexts.user_id = auth.uid()
  )
);

-- Update DELETE policy to include context ownership
DROP POLICY IF EXISTS "Users can delete own files" ON files;
CREATE POLICY "Users can delete own files" ON files
FOR DELETE TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM contexts 
    WHERE contexts.id = context_id 
    AND contexts.user_id = auth.uid()
  )
);
/*
  # Update Files Table RLS Policies

  1. Changes
    - Modify the INSERT policy for files table to properly handle file uploads
    - Ensure policy checks for authenticated users and valid context ownership

  2. Security
    - Maintains RLS enabled on files table
    - Updates INSERT policy to verify context ownership
    - Preserves existing SELECT and DELETE policies
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can create files" ON files;

-- Create new INSERT policy with proper context ownership check
CREATE POLICY "Users can create files"
ON files
FOR INSERT
TO authenticated
WITH CHECK (
  -- Verify the user owns the context they're uploading to
  EXISTS (
    SELECT 1 FROM contexts 
    WHERE contexts.id = context_id 
    AND contexts.user_id = auth.uid()
  )
  -- Ensure the user_id matches the authenticated user
  AND auth.uid() = user_id
);
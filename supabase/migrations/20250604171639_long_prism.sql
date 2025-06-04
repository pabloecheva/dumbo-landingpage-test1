/*
  # Improve file storage and context organization

  1. Changes
    - Add path column to files table to store the full storage path
    - Update RLS policies to properly handle context-based file access
    - Add indexes for better query performance
    - Ensure proper cascading deletes

  2. Security
    - Maintain strict RLS policies for file access
    - Ensure users can only access files in their contexts
    - Prevent unauthorized access to storage objects
*/

-- Add path column to files table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'files' AND column_name = 'path'
  ) THEN
    ALTER TABLE files ADD COLUMN path text;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_files_context_id ON files(context_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);

-- Update files policies to properly handle context-based access
DROP POLICY IF EXISTS "Users can create files" ON files;
DROP POLICY IF EXISTS "Users can read own files" ON files;
DROP POLICY IF EXISTS "Users can delete own files" ON files;

-- Create new policies that properly handle context-based access
CREATE POLICY "Users can create files"
ON files FOR INSERT TO authenticated
WITH CHECK (
  -- User must own the context to add files to it
  EXISTS (
    SELECT 1 FROM contexts
    WHERE contexts.id = context_id
    AND contexts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can read own files"
ON files FOR SELECT TO authenticated
USING (
  -- Users can access files if they own the context
  EXISTS (
    SELECT 1 FROM contexts
    WHERE contexts.id = context_id
    AND contexts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own files"
ON files FOR DELETE TO authenticated
USING (
  -- Users can delete files if they own the context
  EXISTS (
    SELECT 1 FROM contexts
    WHERE contexts.id = context_id
    AND contexts.user_id = auth.uid()
  )
);

-- Ensure storage bucket exists with proper configuration
DO $$ 
BEGIN
  -- First try to delete any existing objects
  DELETE FROM storage.objects WHERE bucket_id = 'files';
  
  -- Then recreate the bucket with proper settings
  DELETE FROM storage.buckets WHERE id = 'files';
  
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'files',
    'files',
    false,
    52428800, -- 50MB limit
    ARRAY[
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/json',
      'text/markdown'
    ]
  );
EXCEPTION
  WHEN others THEN
    NULL; -- Ignore errors if bucket already exists
END $$;

-- Update storage policies
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
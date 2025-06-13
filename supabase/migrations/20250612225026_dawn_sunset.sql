/*
  # Remove PDF support from storage bucket

  1. Changes
    - Update storage bucket to only allow text files
    - Remove PDF from allowed MIME types
    - Keep existing file structure intact

  2. Security
    - Maintains existing RLS policies
    - Only changes file type restrictions
*/

-- Update the files bucket to only allow text files
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'text/plain'
]
WHERE id = 'files';
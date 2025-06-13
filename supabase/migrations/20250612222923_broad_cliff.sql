/*
  # Update storage bucket configuration for PDF and text files

  1. Changes
    - Update allowed MIME types to include PDF files
    - Maintain existing file size limits and security policies
    - Ensure proper file type validation

  2. Security
    - Maintain existing RLS policies
    - Keep user isolation for file access
    - Preserve upload restrictions
*/

-- Update the files bucket to allow PDF files
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'application/json',
  'text/markdown'
]
WHERE id = 'files';
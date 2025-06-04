/*
  # Create Storage Bucket for File Uploads

  1. Changes
    - Creates a new storage bucket named 'files' for storing uploaded files
    - Sets up RLS policies to allow authenticated users to manage their own files
    
  2. Security
    - Enables RLS on the bucket
    - Adds policies for authenticated users to:
      - Upload files
      - Download their own files
      - Delete their own files
*/

-- Create a new storage bucket for files
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', false);

-- Enable RLS
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'files');

CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);
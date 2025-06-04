import React, { useState, useCallback } from 'react';
import { X, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../lib/supabase';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextId: string;
  onUploadComplete: (file?: File) => void;
  isPromptUpload?: boolean;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, contextId, onUploadComplete, isPromptUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setUploading(true);

    try {
      // First, verify the user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Authentication required');
      }

      // Then, verify the context belongs to the user
      const { data: contextData, error: contextError } = await supabase
        .from('contexts')
        .select('user_id')
        .eq('id', contextId)
        .single();

      if (contextError || !contextData) {
        throw new Error('Context not found');
      }

      if (contextData.user_id !== user.id) {
        throw new Error('You do not have permission to upload files to this context');
      }

      // Now process each file
      for (const file of acceptedFiles) {
        const filePath = `${user.id}/${contextId}/${file.name}`;
        
        // Upload file to Supabase Storage with upsert enabled
        const { error: storageError } = await supabase.storage
          .from('files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (storageError) throw storageError;

        // Create file record in database
        const { error: dbError } = await supabase
          .from('files')
          .insert({
            name: file.name,
            context_id: contextId,
            user_id: user.id,
            size: file.size,
            type: file.type,
            path: filePath
          });

        if (dbError) throw dbError;
      }

      onUploadComplete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }, [contextId, onClose, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg w-full max-w-md m-4 p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#6E6B65] hover:text-[#23201A] transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#23201A]">
            {isPromptUpload ? 'Upload Data for Prompt' : 'Upload Files to Context'}
          </h2>
          <p className="text-[#6E6B65] text-sm mt-1">Add files to your context</p>
          <p className="text-[#6E6B65] text-xs mt-2">Maximum file size: 50MB</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-[#A3C9C7] bg-[#A3C9C7] bg-opacity-10' : 'border-[#E5E5E5]'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-4 text-[#6E6B65]" size={24} />
          <p className="text-[#23201A] mb-2">
            {isDragActive ? 'Drop files here' : 'Drag and drop files here, or click to browse'}
          </p>
          <p className="text-[#6E6B65] text-sm">
            Supported files: PDF, TXT, DOC, DOCX, CSV, JSON, MD
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#6E6B65] hover:text-[#23201A] transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={uploading}
            className="px-4 py-2 bg-[#A3C9C7] text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
import React, { useState, useCallback } from 'react';
import { X, Upload, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../lib/supabase';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextId: string;
  onUploadComplete: (file?: File) => void;
  isPromptUpload?: boolean;
}

interface FileTypeErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FileTypeErrorModal: React.FC<FileTypeErrorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center animate-in fade-in-0 duration-200">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 m-4 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-[#23201A] dark:text-gray-200">Invalid File Type</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-[#6E6B65] dark:text-gray-400">
            Only .txt files are supported. Please select a valid text file to continue.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#A3C9C7] text-white rounded-md hover:bg-opacity-90 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, contextId, onUploadComplete, isPromptUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFileTypeError, setShowFileTypeError] = useState(false);
  const [uploadAreaError, setUploadAreaError] = useState(false);

  const checkForDuplicateFilename = async (fileName: string, contextId: string): Promise<boolean> => {
    try {
      const { data: existingFiles, error } = await supabase
        .from('files')
        .select('name')
        .eq('context_id', contextId)
        .eq('name', fileName);

      if (error) {
        console.error('Error checking for duplicate filename:', error);
        return false;
      }

      return existingFiles && existingFiles.length > 0;
    } catch (error) {
      console.error('Error checking for duplicate filename:', error);
      return false;
    }
  };

  const validateFileType = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    return fileName.endsWith('.txt');
  };

  const showErrorFeedback = () => {
    setUploadAreaError(true);
    setShowFileTypeError(true);
    setTimeout(() => {
      setUploadAreaError(false);
    }, 2000);
  };

  const processFile = async (file: File): Promise<{ content: string; processedName: string }> => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.txt')) {
      // Process text file
      const content = await file.text();
      return { content, processedName: file.name };
    } else {
      throw new Error('Unsupported file type');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Clear previous errors when new files are dropped
    setError(null);
    setUploadAreaError(false);

    // Validate file types first
    const invalidFiles = acceptedFiles.filter(file => !validateFileType(file));
    if (invalidFiles.length > 0) {
      showErrorFeedback();
      return;
    }

    setUploading(true);

    let hasError = false;
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

      // Process each file
      for (const file of acceptedFiles) {
        try {
          // Check for duplicate filename
          const isDuplicate = await checkForDuplicateFilename(file.name, contextId);
          if (isDuplicate) {
            setError(`A file named '${file.name}' already exists. Please rename your file and try uploading again.`);
            hasError = true;
            return; // Exit early, don't process any files
          }

          // Process the file
          const { content, processedName } = await processFile(file);
          
          // Create a text blob from the processed content
          const textBlob = new Blob([content], { type: 'text/plain' });
          const filePath = `${user.id}/${contextId}/${processedName}`;
          
          // Upload the processed text to Supabase Storage
          const { error: storageError } = await supabase.storage
            .from('files')
            .upload(filePath, textBlob, {
              cacheControl: '3600',
              upsert: true,
              contentType: 'text/plain'
            });

          if (storageError) throw storageError;

          // Create file record in database
          const { error: dbError } = await supabase
            .from('files')
            .insert({
              name: processedName,
              context_id: contextId,
              user_id: user.id,
              size: textBlob.size,
              type: 'text/plain',
              path: filePath
            });

          if (dbError) throw dbError;
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          setError(`Failed to process ${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
          hasError = true;
          return; // Exit early on any processing error
        }
      }

      // Only close modal and call onUploadComplete if no errors occurred
      if (!hasError) {
        if (isPromptUpload && acceptedFiles.length > 0) {
          onUploadComplete(acceptedFiles[0]);
        } else {
          onUploadComplete();
        }
        onClose();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
      hasError = true;
    } finally {
      setUploading(false);
    }
  }, [contextId, onClose, onUploadComplete]);

  // Reset error state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setError(null);
      setUploadAreaError(false);
    }
  }, [isOpen]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/plain': ['.txt']
    },
    multiple: true
  });

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md m-4 p-6 shadow-xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-[#6E6B65] dark:text-gray-400 hover:text-[#23201A] dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#23201A] dark:text-gray-200">
              {isPromptUpload ? 'Upload Data for Prompt' : 'Upload Files to Context'}
            </h2>
            <p className="text-[#6E6B65] dark:text-gray-400 text-sm mt-1">Add text files to your context</p>
            <p className="text-[#6E6B65] dark:text-gray-400 text-xs mt-2">Maximum file size: 50MB • Text files only</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
              {error}
            </div>
          )}

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
              uploadAreaError 
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                : isDragActive 
                  ? 'border-[#A3C9C7] bg-[#A3C9C7] bg-opacity-10 dark:bg-[#A3C9C7]/10' 
                  : 'border-[#E5E5E5] dark:border-gray-600 hover:border-[#A3C9C7] dark:hover:border-[#A3C9C7]'
            }`}
            title="Accepts: .txt files only"
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              {uploadAreaError ? (
                <AlertTriangle className="mx-auto mb-4 text-red-500" size={24} />
              ) : (
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="text-[#6E6B65] dark:text-gray-400" size={20} />
                  <FileText className="text-[#A3C9C7]" size={20} />
                </div>
              )}
              <p className={`mb-2 ${uploadAreaError ? 'text-red-600 dark:text-red-400' : 'text-[#23201A] dark:text-gray-200'}`}>
                {uploadAreaError 
                  ? 'Invalid file type detected'
                  : isDragActive 
                    ? 'Drop files here' 
                    : 'Drag and drop files here, or click to browse'
                }
              </p>
              <div className="text-[#6E6B65] dark:text-gray-400 text-sm space-y-1">
                <p className="font-medium">Text files only (.txt)</p>
                <p>Accepts: Plain text files (*.txt)</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-[#6E6B65] dark:text-gray-400 hover:text-[#23201A] dark:hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              disabled={uploading}
              className="px-4 py-2 bg-[#A3C9C7] text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* File Type Error Modal */}
      <FileTypeErrorModal
        isOpen={showFileTypeError}
        onClose={() => setShowFileTypeError(false)}
      />
    </>
  );
};

export default FileUploadModal;
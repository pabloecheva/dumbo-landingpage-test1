import React, { useState, useEffect } from 'react';
import { Send, LogOut, ChevronRight, Plus, FileUp, Settings, MessageSquare, Files, X, ChevronLeft, MoreVertical, Edit2, Trash2, Folder, FileText, ChevronUp, ChevronDown, Key, Menu } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Sidebar from './Sidebar';
import FileUploadModal from './FileUploadModal';
import ThemeDropdown from './ThemeDropdown';
import CopyButton from './CopyButton';
import ProfileModal from './ProfileModal';
import ApiKeyModal from './ApiKeyModal';

interface Context {
  id: string;
  name: string;
  isExpanded?: boolean;
  isSelected?: boolean;
  files?: File[];
}

interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string | null;
}

interface ContextMenuProps {
  context: Context;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  position: { x: number; y: number } | null;
  onClose: () => void;
}

interface CreateContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface DeleteContextModalProps {
  isOpen: boolean;
  contextName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  attachment?: {
    name: string;
    url: string;
    type: string;
  };
}

interface FileInputRef {
  click: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, fileName, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in-0 duration-200">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 m-4 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-[#23201A] dark:text-gray-200">Delete File</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-[#6E6B65] dark:text-gray-400">
            Are you sure you want to delete <span className="font-medium text-[#23201A] dark:text-gray-200">{fileName}</span>? This action cannot be undone.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-[#E5E5E5] dark:border-gray-600 rounded-md hover:bg-[#F7D6B7] hover:border-[#F7D6B7] dark:hover:bg-gray-700 transition-colors text-[#23201A] dark:text-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteContextModal: React.FC<DeleteContextModalProps> = ({ isOpen, contextName, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in-0 duration-200">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 m-4 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-[#23201A] dark:text-gray-200">Delete Context</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-[#6E6B65] dark:text-gray-400">
            Are you sure you want to delete <span className="font-medium text-[#23201A] dark:text-gray-200">"{contextName}"</span>? This will permanently remove the context and all its files. This action cannot be undone.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-[#E5E5E5] dark:border-gray-600 rounded-md hover:bg-[#F7D6B7] hover:border-[#F7D6B7] dark:hover:bg-gray-700 transition-colors text-[#23201A] dark:text-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateContextModal: React.FC<CreateContextModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name);
      setName('');
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg w-full max-w-md p-6 m-4 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#F7D6B7] flex items-center justify-center">
            <Folder className="w-5 h-5 text-[#23201A]" />
          </div>
          <h2 className="text-xl font-semibold text-[#23201A]">Create New Context</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="contextName" className="block text-sm font-medium text-[#6E6B65] mb-2">
              Context Name
            </label>
            <input
              id="contextName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A3C9C7] focus:border-transparent"
              placeholder="Enter a name for your context"
              autoFocus
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-md hover:bg-[#F7D6B7] hover:border-[#F7D6B7] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-2 bg-[#A3C9C7] text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ContextMenu: React.FC<ContextMenuProps> = ({ context, onRename, onDelete, position, onClose }) => {
  if (!position) return null;

  return (
    <div
      className="fixed z-50 bg-white rounded-md shadow-lg border border-[#E5E5E5] py-1 w-48"
      style={{ top: position.y, left: position.x }}
    >
      <button
        onClick={() => {
          onRename(context.id);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-4 py-2 text-[#23201A] hover:bg-[#F7D6B7] transition-colors text-left"
      >
        <Edit2 size={16} />
        <span>Rename</span>
      </button>
      <button
        onClick={() => {
          onDelete(context.id);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 transition-colors text-left"
      >
        <Trash2 size={16} />
        <span>Delete</span>
      </button>
    </div>
  );
};

const Chat: React.FC = () => {
  const [contexts, setContexts] = useState<Context[]>([]);
  const [selectedContext, setSelectedContext] = useState<Context | null>(null);
  const [editingContextId, setEditingContextId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLeftDrawer, setShowLeftDrawer] = useState(true);
  const [showContextSidebar, setShowContextSidebar] = useState(true);
  const [showRightDrawer, setShowRightDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'files'>('chat');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    context: Context;
    position: { x: number; y: number };
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showMessageFileUpload, setShowMessageFileUpload] = useState(false);
  const [lastAiResponse, setLastAiResponse] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    fileId: string;
    fileName: string;
    filePath: string | null;
  }>({
    isOpen: false,
    fileId: '',
    fileName: '',
    filePath: null
  });
  const [deleteContextConfirmation, setDeleteContextConfirmation] = useState<{
    isOpen: boolean;
    contextId: string;
    contextName: string;
  }>({
    isOpen: false,
    contextId: '',
    contextName: ''
  });

  // Load sidebar preferences from localStorage
  useEffect(() => {
    const savedMainSidebar = localStorage.getItem('showLeftDrawer');
    const savedContextSidebar = localStorage.getItem('showContextSidebar');
    
    if (savedMainSidebar !== null) {
      setShowLeftDrawer(JSON.parse(savedMainSidebar));
    }
    if (savedContextSidebar !== null) {
      setShowContextSidebar(JSON.parse(savedContextSidebar));
    }
  }, []);

  // Save sidebar preferences to localStorage
  useEffect(() => {
    localStorage.setItem('showLeftDrawer', JSON.stringify(showLeftDrawer));
  }, [showLeftDrawer]);

  useEffect(() => {
    localStorage.setItem('showContextSidebar', JSON.stringify(showContextSidebar));
  }, [showContextSidebar]);

  const handleDeleteFile = async (fileId: string, fileName: string, filePath: string | null) => {
    setDeleteConfirmation({
      isOpen: true,
      fileId,
      fileName,
      filePath
    });
  };

  const confirmDeleteFile = async () => {
    const { fileId, filePath } = deleteConfirmation;
    
    try {
      // First delete the file from storage if it exists
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('files')
          .remove([`${filePath}`]);

        if (storageError) throw storageError;
      }

      // Delete the file record from the database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      // Fetch updated context data
      const { data: updatedContext, error: contextError } = await supabase
        .from('contexts')
        .select(`
          id,
          name,
          files (
            id,
            name,
            size,
            type,
            path
          )
        `)
        .eq('id', selectedContext?.id)
        .single();

      if (contextError) throw contextError;

      // Update contexts state with fresh data
      setContexts(prev => prev.map(context => 
        context.id === updatedContext.id 
          ? { ...context, files: updatedContext.files || [] }
          : context
      ));

      // Update selected context
      if (selectedContext) {
        setSelectedContext({
          ...selectedContext,
          files: updatedContext.files || []
        });
      }

      // Close the confirmation modal
      setDeleteConfirmation({
        isOpen: false,
        fileId: '',
        fileName: '',
        filePath: null
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const cancelDeleteFile = () => {
    setDeleteConfirmation({
      isOpen: false,
      fileId: '',
      fileName: '',
      filePath: null
    });
  };

  const handleDeleteContext = async (id: string) => {
    const contextToDelete = contexts.find(context => context.id === id);
    if (!contextToDelete) return;

    setDeleteContextConfirmation({
      isOpen: true,
      contextId: id,
      contextName: contextToDelete.name
    });
  };

  const confirmDeleteContext = async () => {
    const { contextId } = deleteContextConfirmation;
    
    try {
      const { error } = await supabase
        .from('contexts')
        .delete()
        .eq('id', contextId);

      if (error) throw error;

      setContexts(prev => prev.filter(context => context.id !== contextId));
      
      // If the deleted context was selected, clear the selection
      if (selectedContext?.id === contextId) {
        setSelectedContext(null);
      }

      // Close the confirmation modal
      setDeleteContextConfirmation({
        isOpen: false,
        contextId: '',
        contextName: ''
      });
    } catch (error) {
      console.error('Error deleting context:', error);
      alert('Failed to delete context. Please try again.');
    }
  };

  const cancelDeleteContext = () => {
    setDeleteContextConfirmation({
      isOpen: false,
      contextId: '',
      contextName: ''
    });
  };

  useEffect(() => {
    const fetchContexts = async () => {
      try {
        const { data: contextsData, error } = await supabase
          .from('contexts')
          .select(`
            id,
            name,
            files (
              id,
              name,
              size,
              type,
              path
            )
          `);

        if (error) throw error;

        const formattedContexts = contextsData.map(context => ({
          id: context.id,
          name: context.name,
          files: context.files || [],
        }));

        setContexts(formattedContexts);
      } catch (error) {
        console.error('Error fetching contexts:', error);
      }
    };

    fetchContexts();
  }, []);

  const handleCreateContext = async (name: string) => {
    const trimmedName = name.trim();
    
    // Check if name is empty
    if (!trimmedName) {
      alert('Context name cannot be empty.');
      return;
    }
    
    // Check if name already exists (case-insensitive)
    const existingContext = contexts.find(c => 
      c.name.toLowerCase().trim() === trimmedName.toLowerCase()
    );
    
    if (existingContext) {
      alert('A context with this name already exists. Please choose a different name.');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('contexts')
        .insert([{ name: trimmedName }])
        .select()
        .single();

      if (error) throw error;

      setContexts(prev => [...prev, { id: data.id, name: trimmedName, files: [] }]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating context:', error);
      alert('Failed to create context. Please try again.');
    }
  };

  const handleRenameContext = async (id: string) => {
    setEditingContextId(id);
  };

  const handleContextClick = (e: React.MouseEvent, context: Context) => {
    e.preventDefault();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setContextMenu({
      context,
      position: {
        x: rect.right,
        y: rect.top
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    let attachment;
    if (selectedFile) {
      try {
        const timestamp = Date.now();
        const filePath = `chat-attachments/${selectedContext?.id}/${timestamp}-${selectedFile.name}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('files')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('files')
          .getPublicUrl(filePath);

        attachment = {
          name: selectedFile.name,
          url: publicUrl,
          type: selectedFile.type
        };
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file. Please try again.');
        return;
      }
    }

    const userMessage = { 
      role: 'user', 
      content: input,
      attachment
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedFile(null);
    setIsLoading(true);

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage = {
        role: 'assistant',
        content: 'This is a simulated response. The real implementation will connect to your knowledge base.'
      };
      setMessages(prev => [...prev, assistantMessage]);
      setLastAiResponse(assistantMessage.content);
      setIsLoading(false);
    }, 1000);
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'txt':
        return <FileText className="text-gray-500" size={20} />;
      case 'py':
        return <FileText className="text-blue-500" size={20} />;
      case 'csv':
        return <FileText className="text-green-500" size={20} />;
      case 'json':
        return <FileText className="text-yellow-500" size={20} />;
      case 'md':
        return <FileText className="text-purple-500" size={20} />;
      default:
        return <FileText className="text-[#6E6B65]" size={20} />;
    }
  };

  const handleContextSelect = (context: Context) => {
    setSelectedContext(selectedContext?.id === context.id ? null : context);
  };

  // Function to truncate context name

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 relative">
      {/* Main Sidebar */}
      <Sidebar
        isExpanded={selectedContext ? showContextSidebar : showLeftDrawer}
        onToggle={() => {
          if (selectedContext) {
            setShowContextSidebar(!showContextSidebar);
          } else {
            setShowLeftDrawer(!showLeftDrawer);
          }
        }}
        title={selectedContext ? selectedContext.name : "MY CONTEXTS"}
      >
        {selectedContext ? (
          <>
            <Sidebar.Header
              title={selectedContext.name}
              isExpanded={showContextSidebar}
              onToggle={() => setShowContextSidebar(!showContextSidebar)}
              onBack={() => {
                setSelectedContext(null);
                setShowContextSidebar(showLeftDrawer);
              }}
              backLabel={`Back • ${selectedContext.name}`}
            />
            <Sidebar.Content isExpanded={showContextSidebar}>
              <div className="p-4">
                <h3 className="text-sm font-medium text-[#6E6B65] dark:text-gray-400 mb-3">Files</h3>
                {selectedContext.files?.map((file, index) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.name)}
                      <span className="text-[#23201A] dark:text-gray-200 text-sm">{file.name}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id, file.name, file.path);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 p-1 rounded-full transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </Sidebar.Content>
            <Sidebar.Footer isExpanded={showContextSidebar}>
              <div className="p-4">
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-[#A3C9C7] hover:bg-[#A3C9C7] hover:bg-opacity-20 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Plus size={16} />
                  <span>Add Data to Context</span>
                </button>
              </div>
            </Sidebar.Footer>
          </>
        ) : (
          <>
            <Sidebar.Header
              title="MY CONTEXTS"
              isExpanded={showLeftDrawer}
              onToggle={() => setShowLeftDrawer(!showLeftDrawer)}
            />
            <Sidebar.Content isExpanded={showLeftDrawer}>
              <div>
                {contexts.map((context) => (
                  <button
                    key={context.id}
                    className="w-full"
                    onClick={(e) => {
                      if (editingContextId !== context.id) {
                        handleContextSelect(context);
                      }
                    }}
                  >
                    <div 
                      className="flex items-center justify-between px-4 py-3 text-left hover:bg-[#A3C9C7] hover:bg-opacity-20 dark:hover:bg-gray-700 transition-colors group"
                      onContextMenu={(e) => handleContextClick(e, context)}
                    >
                      <div className="flex flex-col min-w-0 flex-1 pr-3">
                        {editingContextId === context.id ? (
                          <input
                            autoFocus
                            type="text"
                            value={context.name}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const newName = e.target.value;
                              setContexts(prev =>
                                prev.map(c =>
                                  c.id === context.id ? { ...c, name: newName } : c
                                )
                              );
                            }}
                            onBlur={async () => {
                              const trimmedName = context.name.trim();
                              
                              // Check if name is empty
                              if (!trimmedName) {
                                // Revert to original name if empty
                                const { data: originalContext, error: fetchError } = await supabase
                                  .from('contexts')
                                  .select('name')
                                  .eq('id', context.id)
                                  .single();
                                
                                if (!fetchError && originalContext) {
                                  setContexts(prev =>
                                    prev.map(c =>
                                      c.id === context.id ? { ...c, name: originalContext.name } : c
                                    )
                                  );
                                }
                                setEditingContextId(null);
                                alert('Context name cannot be empty.');
                                return;
                              }
                              
                              // Check if name already exists (case-insensitive)
                              const existingContext = contexts.find(c => 
                                c.id !== context.id && 
                                c.name.toLowerCase().trim() === trimmedName.toLowerCase()
                              );
                              
                              if (existingContext) {
                                // Revert to original name if duplicate
                                const { data: originalContext, error: fetchError } = await supabase
                                  .from('contexts')
                                  .select('name')
                                  .eq('id', context.id)
                                  .single();
                                
                                if (!fetchError && originalContext) {
                                  setContexts(prev =>
                                    prev.map(c =>
                                      c.id === context.id ? { ...c, name: originalContext.name } : c
                                    )
                                  );
                                }
                                setEditingContextId(null);
                                alert('A context with this name already exists. Please choose a different name.');
                                return;
                              }
                              
                              try {
                                const { error } = await supabase
                                  .from('contexts')
                                  .update({ name: trimmedName })
                                  .eq('id', context.id);

                                if (error) throw error;
                                
                                // Update local state with trimmed name
                                setContexts(prev =>
                                  prev.map(c =>
                                    c.id === context.id ? { ...c, name: trimmedName } : c
                                  )
                                );
                              } catch (error) {
                                console.error('Error updating context:', error);
                                alert('Failed to update context name. Please try again.');
                              }
                              setEditingContextId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur();
                              }
                            }}
                            className="bg-transparent border-none focus:outline-none text-[#23201A] dark:text-gray-200 w-full text-sm font-medium"
                          />
                        ) : (
                          <span 
                            className="text-[#23201A] dark:text-gray-200 truncate block text-sm font-medium leading-tight"
                            title={context.name}
                          >
                            {context.name}
                          </span>
                        )}
                        <span className="text-xs text-[#6E6B65] dark:text-gray-400 mt-0.5">{context.files?.length || 0} files</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContextClick(e, context);
                        }}
                        className="p-1.5 hover:bg-[#A3C9C7] hover:bg-opacity-20 dark:hover:bg-gray-600 rounded-full transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical size={16} className="text-[#6E6B65] dark:text-gray-400" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </Sidebar.Content>
            <Sidebar.Footer isExpanded={showLeftDrawer}>
              <div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-[#A3C9C7] hover:bg-[#A3C9C7] hover:bg-opacity-20 dark:hover:bg-gray-700 transition-colors border-b border-[#E5E5E5] dark:border-gray-600"
                >
                  <Plus size={16} />
                  <span>New Context</span>
                </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-[#6E6B65] dark:text-gray-400 hover:bg-[#A3C9C7] hover:bg-opacity-20 dark:hover:bg-gray-700 transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
              </div>
            </Sidebar.Footer>
          </>
        )}
      </Sidebar>

      {/* Header with Logout */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-[#E0E0E0] dark:border-gray-600 px-4 py-3 flex items-center justify-between bg-white dark:bg-gray-800">
          <h1 className="text-[#23201A] dark:text-gray-200 text-xl font-medium">{selectedContext?.name || 'My Contexts'}</h1>
          <div className="flex items-center gap-2">
            <ThemeDropdown />
            <CopyButton lastAiResponse={lastAiResponse} />
            <button
              onClick={() => setShowRightDrawer(!showRightDrawer)}
              className="p-2 hover:bg-[#A3C9C7] hover:bg-opacity-20 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <Settings size={20} className="text-[#6E6B65] dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-6 bg-[#F6F5EE] dark:bg-gray-900 ${!selectedContext ? 'opacity-50' : ''}`}>
          {!selectedContext ? (
            <div className="flex items-center justify-center h-full flex-col gap-3 px-4 text-center">
              <h1 className="text-xl sm:text-2xl text-[#23201A] dark:text-gray-200">Please select a Context</h1>
              <p className="text-sm sm:text-base text-[#6E6B65] dark:text-gray-400">Choose a context from the sidebar to start chatting.</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full flex-col gap-3 px-4 text-center">
              <h1 className="text-xl sm:text-2xl text-[#23201A] dark:text-gray-200">What can I help with?</h1>
              <p className="text-sm sm:text-base text-[#6E6B65] dark:text-gray-400">Ask me anything about your saved content.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'assistant' ? 'bg-white dark:bg-gray-800' : ''} p-2 sm:p-4 rounded-lg`}
              >
                <div className="max-w-3xl mx-auto w-full text-sm sm:text-base">
                  <div className="flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'assistant' ? 'bg-[#A3C9C7]' : 'bg-[#F7D6B7]'
                    } text-white`}>
                      {message.role === 'assistant' ? 'AI' : 'U'}
                    </div>
                    <div className="flex-1 text-[#23201A] dark:text-gray-200 whitespace-pre-wrap">
                      <div>{message.content}</div>
                      {message.attachment && (
                        <div className="mt-2 flex items-center gap-2 bg-[#A3C9C7] bg-opacity-10 p-2 rounded">
                          <FileText size={16} className="text-[#6E6B65]" />
                          <a 
                            href={message.attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#23201A] dark:text-gray-200 hover:underline"
                          >
                            {message.attachment.name}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className="max-w-3xl mx-auto w-full">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#A3C9C7] flex items-center justify-center text-white">
                    AI
                  </div>
                  <div className="flex-1">
                    <div className="w-3 h-3 bg-[#A3C9C7] rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-[#E0E0E0] dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              {selectedFile && (
                <div className="absolute left-4 top-0 -translate-y-full mb-2 flex items-center gap-2 bg-[#A3C9C7] bg-opacity-20 px-3 py-1 rounded-md">
                  <FileText size={16} className="text-[#6E6B65]" />
                  <span className="text-sm text-[#23201A] dark:text-gray-200">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={removeSelectedFile}
                    className="ml-2 text-[#6E6B65] hover:text-[#23201A] dark:hover:text-gray-200"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <input
                disabled={!selectedContext}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message your AI assistant..."
                className="w-full p-4 pr-24 rounded-lg bg-white dark:bg-gray-700 border border-[#E0E0E0] dark:border-gray-600 text-[#23201A] dark:text-gray-200 placeholder-[#6E6B65] dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A3C9C7] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled={!selectedContext}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-[#6E6B65] dark:text-gray-400 hover:text-[#23201A] dark:hover:text-gray-200"
                onClick={() => setShowMessageFileUpload(true)}
              >
                <FileUp size={20} />
              </button>
              <button
                type="submit"
                disabled={!selectedContext || (!input.trim() && !selectedFile) || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#6E6B65] dark:text-gray-400 hover:text-[#23201A] dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Drawer */}
      <div className={`w-full sm:w-80 bg-white dark:bg-gray-800 border-l border-[#E0E0E0] dark:border-gray-600 flex flex-col transform transition-transform duration-300 ${
        showRightDrawer ? 'translate-x-0' : 'translate-x-full'
      } fixed right-0 top-0 bottom-0 z-30`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E0E0E0] dark:border-gray-600">
          <h2 className="text-[#23201A] dark:text-gray-200 font-medium">Settings</h2>
          <button
            onClick={() => setShowRightDrawer(false)}
            className="p-2 hover:bg-[#A3C9C7] hover:bg-opacity-20 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-3">
            {/* My Profile Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-full flex items-center gap-3 p-4 bg-white dark:bg-gray-700 hover:bg-[#F6F5EE] dark:hover:bg-gray-600 rounded-lg border border-[#E0E0E0] dark:border-gray-600 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-[#A3C9C7] rounded-full flex items-center justify-center">
                <Settings size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-[#23201A] dark:text-gray-200 font-medium">My Profile</h3>
                <p className="text-[#6E6B65] dark:text-gray-400 text-sm">Manage account settings</p>
              </div>
            </button>

            {/* API Key Management */}
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-[#E0E0E0] dark:border-gray-600 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <Key size={20} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-[#23201A] dark:text-gray-200 font-medium">API Keys</h3>
                  <p className="text-[#6E6B65] dark:text-gray-400 text-sm">Manage your OpenAI API keys</p>
                </div>
              </div>
              <button 
                onClick={() => setShowApiKeyModal(true)}
                className="w-full text-left text-[#A3C9C7] hover:text-opacity-80 text-sm"
              >
                Manage API Keys
              </button>
            </div>

            {/* Temperature Settings */}
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-[#E0E0E0] dark:border-gray-600 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#A3C9C7] bg-opacity-20 rounded-full flex items-center justify-center">
                  <Settings size={20} className="text-[#A3C9C7]" />
                </div>
                <div>
                  <h3 className="text-[#23201A] dark:text-gray-200 font-medium">Temperature</h3>
                  <p className="text-[#6E6B65] dark:text-gray-400 text-sm">Control response creativity</p>
                </div>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Logout Button */}
          <div className="mt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <LogOut size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-red-600 dark:text-red-400 font-medium">Log Out</h3>
                <p className="text-red-500 dark:text-red-500 text-sm">Sign out of your account</p>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <ContextMenu
            context={contextMenu.context}
            position={contextMenu.position}
            onRename={handleRenameContext}
            onDelete={handleDeleteContext}
            onClose={() => setContextMenu(null)}
          />
        </>
      )}
      
      {/* Create Context Modal */}
      <CreateContextModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateContext}
      />
      
      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        contextId={selectedContext?.id || ''}
        onUploadComplete={() => {
          setShowUploadModal(false);
        }}
      />
      
      {/* Message File Upload Modal */}
      <FileUploadModal
        isOpen={showMessageFileUpload}
        onClose={() => setShowMessageFileUpload(false)}
        contextId={selectedContext?.id || ''}
        isPromptUpload={true}
        onUploadComplete={(file) => {
          setSelectedFile(file);
          setShowMessageFileUpload(false);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        fileName={deleteConfirmation.fileName}
        onConfirm={confirmDeleteFile}
        onCancel={cancelDeleteFile}
      />

      {/* Delete Context Confirmation Modal */}
      <DeleteContextModal
        isOpen={deleteContextConfirmation.isOpen}
        contextName={deleteContextConfirmation.contextName}
        onConfirm={confirmDeleteContext}
        onCancel={cancelDeleteContext}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />
    </div>
  );
};

export default Chat;

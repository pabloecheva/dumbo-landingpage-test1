import React, { useState, useEffect } from 'react';
import { Send, LogOut, ChevronRight, Plus, FileUp, Settings, MessageSquare, Files, X, ChevronLeft, MoreVertical, Edit2, Trash2, Folder, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import FileUploadModal from './FileUploadModal';

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
  const [showLeftDrawer, setShowLeftDrawer] = useState(false);
  const [showRightDrawer, setShowRightDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'files'>('chat');
  const [contextMenu, setContextMenu] = useState<{
    context: Context;
    position: { x: number; y: number };
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showMessageFileUpload, setShowMessageFileUpload] = useState(false);

  const handleDeleteFile = async (fileId: string, filePath: string | null) => {
    try {
      // First delete the file from storage if it exists
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
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
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
    try {
      const { data, error } = await supabase
        .from('contexts')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;

      setContexts(prev => [...prev, { id: data.id, name: data.name, files: [] }]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating context:', error);
    }
  };

  const handleRenameContext = async (id: string) => {
    setEditingContextId(id);
  };

  const handleDeleteContext = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contexts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContexts(prev => prev.filter(context => context.id !== id));
    } catch (error) {
      console.error('Error deleting context:', error);
    }
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
      setIsLoading(false);
    }, 1000);
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileText className="text-red-500\" size={20} />;
      case 'py':
        return <FileText className="text-blue-500\" size={20} />;
      case 'csv':
        return <FileText className="text-green-500\" size={20} />;
      case 'json':
        return <FileText className="text-yellow-500\" size={20} />;
      case 'md':
        return <FileText className="text-purple-500\" size={20} />;
      case 'txt':
        return <FileText className="text-gray-500\" size={20} />;
      default:
        return <FileText className="text-[#6E6B65]\" size={20} />;
    }
  };

  const handleContextSelect = (context: Context) => {
    setSelectedContext(selectedContext?.id === context.id ? null : context);
  };

  return (
    <div className="flex h-screen bg-white relative">
      {/* Sidebar */}
      <div className={`w-64 bg-white border-r border-[#E5E5E5] flex flex-col transform transition-transform duration-300 ${
        showLeftDrawer ? 'translate-x-0' : '-translate-x-full'
      } fixed md:static z-20 h-full md:translate-x-0`}>
        {selectedContext ? (
          <>
            <div className="flex items-center px-4 py-3 text-[#6E6B65] text-sm font-medium border-b border-[#E5E5E5]">
              <button 
                onClick={() => setSelectedContext(null)}
                className="flex items-center gap-2 hover:text-[#23201A] transition-colors"
              >
                <ChevronLeft size={16} />
                <span>Back</span>
                <span className="text-[#23201A]">• {selectedContext.name}</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-sm font-medium text-[#6E6B65] mb-3">Files</h3>
              {selectedContext.files?.map((file, index) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between py-2 hover:bg-white rounded-md transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.name)}
                    <span className="text-[#23201A] text-sm">{file.name}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file.id, file.path);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 p-1 rounded-full transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E5E5E5] p-4">
              <button 
                onClick={() => setShowUploadModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2 text-[#A3C9C7] hover:bg-[#A3C9C7] hover:bg-opacity-20 rounded-md transition-colors"
              >
                <Plus size={16} />
                <span>Add Data to Context</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="px-4 py-3 text-sm font-medium text-[#6E6B65] border-b border-[#E5E5E5]">
              MY CONTEXTS
            </h2>
            <div className="flex-1 overflow-y-auto">
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
                    className="flex items-center justify-between px-4 py-2 text-left hover:bg-[#A3C9C7] hover:bg-opacity-20 transition-colors"
                    onContextMenu={(e) => handleContextClick(e, context)}
                  >
                    <div className="flex flex-col">
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
                            try {
                              const { error } = await supabase
                                .from('contexts')
                                .update({ name: context.name })
                                .eq('id', context.id);

                              if (error) throw error;
                            } catch (error) {
                              console.error('Error updating context:', error);
                            }
                            setEditingContextId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          className="bg-transparent border-none focus:outline-none text-[#23201A]"
                        />
                      ) : (
                        <span className="text-[#23201A]">{context.name}</span>
                      )}
                      <span className="text-xs text-[#6E6B65]">{context.files?.length} files</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextClick(e, context);
                      }}
                      className="p-1 hover:bg-[#A3C9C7] hover:bg-opacity-20 rounded-full transition-colors"
                    >
                      <MoreVertical size={16} className="text-[#6E6B65]" />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="border-t border-[#E5E5E5]">
          {!selectedContext && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full flex items-center gap-2 px-4 py-3 text-[#A3C9C7] hover:bg-[#A3C9C7] hover:bg-opacity-20 transition-colors"
            >
              <Plus size={16} />
              <span>New Context</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-[#6E6B65] hover:bg-[#A3C9C7] hover:bg-opacity-20 transition-colors border-t border-[#E5E5E5]"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Header with Logout */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-[#E5E5E5] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLeftDrawer(!showLeftDrawer)}
              className="p-2 hover:bg-[#A3C9C7] hover:bg-opacity-20 rounded-md transition-colors md:hidden"
            >
              {showLeftDrawer ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
            <h1 className="text-[#23201A] text-xl font-medium">{selectedContext?.name || 'My Contexts'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`p-2 rounded-md transition-colors ${
                activeTab === 'chat' ? 'bg-[#A3C9C7] bg-opacity-20' : 'hover:bg-[#A3C9C7] hover:bg-opacity-20'
              }`}
            >
              <MessageSquare size={20} />
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`p-2 rounded-md transition-colors ${
                activeTab === 'files' ? 'bg-[#A3C9C7] bg-opacity-20' : 'hover:bg-[#A3C9C7] hover:bg-opacity-20'
              }`}
            >
              <Files size={20} />
            </button>
            <button
              onClick={() => setShowRightDrawer(!showRightDrawer)}
              className="p-2 hover:bg-[#A3C9C7] hover:bg-opacity-20 rounded-md transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto p-2 sm:p-4 space-y-6 bg-[#F6F5EE] ${!selectedContext ? 'opacity-50' : ''}`}>
          {!selectedContext ? (
            <div className="flex items-center justify-center h-full flex-col gap-3 px-4 text-center">
              <h1 className="text-xl sm:text-2xl text-[#23201A]">Please select a Context</h1>
              <p className="text-sm sm:text-base text-[#6E6B65]">Choose a context from the sidebar to start chatting.</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full flex-col gap-3 px-4 text-center">
              <h1 className="text-xl sm:text-2xl text-[#23201A]">What can I help with?</h1>
              <p className="text-sm sm:text-base text-[#6E6B65]">Ask me anything about your saved content.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'assistant' ? 'bg-white' : ''} p-2 sm:p-4 rounded-lg`}
              >
                <div className="max-w-3xl mx-auto w-full text-sm sm:text-base">
                  <div className="flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'assistant' ? 'bg-[#A3C9C7]' : 'bg-[#F7D6B7]'
                    } text-white`}>
                      {message.role === 'assistant' ? 'AI' : 'U'}
                    </div>
                    <div className="flex-1 text-[#23201A] whitespace-pre-wrap">
                      <div>{message.content}</div>
                      {message.attachment && (
                        <div className="mt-2 flex items-center gap-2 bg-[#A3C9C7] bg-opacity-10 p-2 rounded">
                          <FileText size={16} className="text-[#6E6B65]" />
                          <a 
                            href={message.attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#23201A] hover:underline"
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
            <div className="flex bg-white p-4 rounded-lg">
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
        <div className="border-t border-[#E5E5E5] p-2 sm:p-4 bg-white">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              {selectedFile && (
                <div className="absolute left-4 top-0 -translate-y-full mb-2 flex items-center gap-2 bg-[#A3C9C7] bg-opacity-20 px-3 py-1 rounded-md">
                  <FileText size={16} className="text-[#6E6B65]" />
                  <span className="text-sm text-[#23201A]">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={removeSelectedFile}
                    className="ml-2 text-[#6E6B65] hover:text-[#23201A]"
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
                className="w-full p-3 sm:p-4 pr-24 rounded-lg bg-white border border-[#E5E5E5] text-[#23201A] text-sm sm:text-base placeholder-[#6E6B65] focus:outline-none focus:ring-2 focus:ring-[#A3C9C7] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled={!selectedContext}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-[#6E6B65] hover:text-[#23201A]"
                onClick={() => setShowMessageFileUpload(true)}
              >
                <FileUp size={20} />
              </button>
              <button
                type="submit"
                disabled={!selectedContext || (!input.trim() && !selectedFile) || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#6E6B65] hover:text-[#23201A] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Drawer */}
      <div className={`w-full sm:w-80 bg-white border-l border-[#E5E5E5] flex flex-col transform transition-transform duration-300 ${
        showRightDrawer ? 'translate-x-0' : 'translate-x-full'
      } fixed right-0 top-0 bottom-0 z-30`}>
        <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5]">
          <h2 className="text-[#23201A] font-medium">Settings</h2>
          <button
            onClick={() => setShowRightDrawer(false)}
            className="p-2 hover:bg-[#A3C9C7] hover:bg-opacity-20 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#6E6B65]">Model</label>
              <select className="w-full p-2 rounded-md border border-[#E5E5E5]">
                <option>GPT-4</option>
                <option>GPT-3.5</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#6E6B65]">Temperature</label>
              <input type="range" min="0" max="100" className="w-full" />
            </div>
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
    </div>
  );
};

export default Chat;
import React, { useState, useEffect } from 'react';
import { X, Key, Plus, Eye, EyeOff, Trash2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApiKey {
  id: string;
  key_name: string;
  encrypted_key: string;
  provider: string;
  created_at: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    keyId: string;
    keyName: string;
  }>({
    isOpen: false,
    keyId: '',
    keyName: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchApiKeys();
      setError('');
      setSuccess('');
      setShowAddForm(false);
      setNewKeyName('');
      setNewApiKey('');
      setVisibleKeys(new Set());
    }
  }, [isOpen]);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (err: any) {
      setError('Failed to load API keys');
      console.error('Error fetching API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newKeyName.trim()) {
      setError('Please enter a name for your API key');
      return;
    }

    if (!newApiKey.trim()) {
      setError('Please enter your OpenAI API key');
      return;
    }

    if (!newApiKey.startsWith('sk-')) {
      setError('Invalid OpenAI API key format. Keys should start with "sk-"');
      return;
    }

    if (apiKeys.length >= 2) {
      setError('You can only have a maximum of 2 API keys');
      return;
    }

    setLoading(true);

    try {
      // Simple encryption (in production, use proper encryption)
      const encryptedKey = btoa(newApiKey);

      const { error } = await supabase
        .from('api_keys')
        .insert({
          key_name: newKeyName.trim(),
          encrypted_key: encryptedKey,
          provider: 'openai'
        });

      if (error) throw error;

      setSuccess('API key added successfully');
      setNewKeyName('');
      setNewApiKey('');
      setShowAddForm(false);
      fetchApiKeys();
    } catch (err: any) {
      setError(err.message || 'Failed to add API key');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApiKey = (keyId: string, keyName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      keyId,
      keyName
    });
  };

  const confirmDeleteApiKey = async () => {
    const { keyId } = deleteConfirmation;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      setSuccess('API key deleted successfully');
      setDeleteConfirmation({ isOpen: false, keyId: '', keyName: '' });
      fetchApiKeys();
    } catch (err: any) {
      setError('Failed to delete API key');
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const decryptKey = (encryptedKey: string): string => {
    try {
      return atob(encryptedKey);
    } catch {
      return 'Invalid key';
    }
  };

  const maskKey = (key: string): string => {
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 7) + '••••••••' + key.substring(key.length - 4);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl m-4 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5] dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#A3C9C7] rounded-full flex items-center justify-center">
                <Key size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#23201A] dark:text-gray-200">API Key Management</h2>
                <p className="text-sm text-[#6E6B65] dark:text-gray-400">Manage your OpenAI API keys</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#A3C9C7] hover:bg-opacity-20 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <X size={20} className="text-[#6E6B65] dark:text-gray-400" />
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md flex items-start gap-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md flex items-start gap-2">
                <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {loading && !showAddForm && (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-[#A3C9C7]" />
              </div>
            )}

            {!loading && apiKeys.length === 0 && !showAddForm && (
              <div className="text-center py-8">
                <Key size={48} className="mx-auto text-[#6E6B65] dark:text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-[#23201A] dark:text-gray-200 mb-2">No API Keys</h3>
                <p className="text-[#6E6B65] dark:text-gray-400 mb-4">
                  You haven't added any OpenAI API keys yet. Add one to start using AI features.
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#A3C9C7] text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  <Plus size={16} />
                  Add OpenAI API Key
                </button>
              </div>
            )}

            {!loading && apiKeys.length > 0 && !showAddForm && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-[#23201A] dark:text-gray-200">
                    Your API Keys ({apiKeys.length}/2)
                  </h3>
                  {apiKeys.length < 2 && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#A3C9C7] text-white rounded-md hover:bg-opacity-90 transition-colors text-sm"
                    >
                      <Plus size={14} />
                      Add Key
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 bg-[#F6F5EE] dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-[#23201A] dark:text-gray-200">{key.key_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm text-[#6E6B65] dark:text-gray-400 font-mono">
                            {visibleKeys.has(key.id) 
                              ? decryptKey(key.encrypted_key)
                              : maskKey(decryptKey(key.encrypted_key))
                            }
                          </code>
                          <button
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded transition-colors"
                          >
                            {visibleKeys.has(key.id) ? (
                              <EyeOff size={14} className="text-[#6E6B65] dark:text-gray-400" />
                            ) : (
                              <Eye size={14} className="text-[#6E6B65] dark:text-gray-400" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-[#6E6B65] dark:text-gray-400 mt-1">
                          Added {new Date(key.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteApiKey(key.id, key.key_name)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showAddForm && (
              <form onSubmit={handleAddApiKey} className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-[#23201A] dark:text-gray-200">Add New API Key</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-[#6E6B65] dark:text-gray-400 hover:text-[#23201A] dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label htmlFor="key-name" className="block text-sm font-medium text-[#6E6B65] dark:text-gray-400 mb-2">
                    Key Name
                  </label>
                  <input
                    type="text"
                    id="key-name"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-[#E5E5E5] dark:border-gray-600 bg-white dark:bg-gray-700 text-[#23201A] dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A3C9C7] focus:border-transparent"
                    placeholder="e.g., My OpenAI Key"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="api-key" className="block text-sm font-medium text-[#6E6B65] dark:text-gray-400 mb-2">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    id="api-key"
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    className="w-full px-4 py-2 rounded-md border border-[#E5E5E5] dark:border-gray-600 bg-white dark:bg-gray-700 text-[#23201A] dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A3C9C7] focus:border-transparent font-mono"
                    placeholder="sk-..."
                    required
                  />
                  <p className="text-xs text-[#6E6B65] dark:text-gray-400 mt-1">
                    Your API key should start with "sk-". Get one from{' '}
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#A3C9C7] hover:underline"
                    >
                      OpenAI Platform
                    </a>
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 border border-[#E5E5E5] dark:border-gray-600 rounded-md hover:bg-[#F7D6B7] hover:border-[#F7D6B7] dark:hover:bg-gray-700 transition-colors text-[#23201A] dark:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !newKeyName.trim() || !newApiKey.trim()}
                    className="flex-1 px-4 py-2 bg-[#A3C9C7] text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add API Key'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setDeleteConfirmation({ isOpen: false, keyId: '', keyName: '' })} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 m-4 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-[#23201A] dark:text-gray-200">Delete API Key</h2>
            </div>
            
            <div className="mb-6">
              <p className="text-[#6E6B65] dark:text-gray-400">
                Are you sure you want to delete the API key <span className="font-medium text-[#23201A] dark:text-gray-200">"{deleteConfirmation.keyName}"</span>? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmation({ isOpen: false, keyId: '', keyName: '' })}
                className="flex-1 px-4 py-2 border border-[#E5E5E5] dark:border-gray-600 rounded-md hover:bg-[#F7D6B7] hover:border-[#F7D6B7] dark:hover:bg-gray-700 transition-colors text-[#23201A] dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteApiKey}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApiKeyModal;
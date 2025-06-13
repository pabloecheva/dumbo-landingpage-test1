import React, { useState, useEffect } from 'react';
import { X, User, Mail, Key, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const [userEmail, setUserEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
      setError('');
      setSuccess('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (user) {
        setUserEmail(user.email || '');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    }
  };

  const validatePassword = (password: string): string[] => {
    const errors = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
    if (!/\d/.test(password)) errors.push('one number');
    return errors;
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password requirements
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setError(`Password must contain ${passwordErrors.join(', ')}`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const passwordErrors = newPassword ? validatePassword(newPassword) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl m-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5] dark:border-gray-600">
          <h2 className="text-2xl font-semibold text-[#23201A] dark:text-gray-200">My Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#A3C9C7] hover:bg-opacity-20 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <X size={20} className="text-[#6E6B65] dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-[#F6F5EE] dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-gray-600 text-[#23201A] dark:text-gray-200 shadow-sm'
                  : 'text-[#6E6B65] dark:text-gray-400 hover:text-[#23201A] dark:hover:text-gray-200'
              }`}
            >
              <User size={16} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'password'
                  ? 'bg-white dark:bg-gray-600 text-[#23201A] dark:text-gray-200 shadow-sm'
                  : 'text-[#6E6B65] dark:text-gray-400 hover:text-[#23201A] dark:hover:text-gray-200'
              }`}
            >
              <Key size={16} />
              Password
            </button>
          </div>

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

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-[#F6F5EE] dark:bg-gray-700 rounded-lg">
                <div className="w-16 h-16 bg-[#A3C9C7] rounded-full flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-[#23201A] dark:text-gray-200">Account Information</h3>
                  <p className="text-[#6E6B65] dark:text-gray-400">Manage your account details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6E6B65] dark:text-gray-400 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <Mail size={16} className="text-[#6E6B65] dark:text-gray-400" />
                    <span className="text-[#23201A] dark:text-gray-200">{userEmail}</span>
                  </div>
                  <p className="text-xs text-[#6E6B65] dark:text-gray-400 mt-1">
                    This is your login email address
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6E6B65] dark:text-gray-400 mb-2">
                    Account Type
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <span className="text-[#23201A] dark:text-gray-200">Free Account</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-[#6E6B65] dark:text-gray-400 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-[#E5E5E5] dark:border-gray-600 bg-white dark:bg-gray-700 text-[#23201A] dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A3C9C7] focus:border-transparent"
                  placeholder="Enter new password"
                  required
                />
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-[#6E6B65] dark:text-gray-400">Password requirements:</p>
                    <div className="space-y-1">
                      {[
                        { check: newPassword.length >= 8, text: 'At least 8 characters' },
                        { check: /[A-Z]/.test(newPassword), text: 'One uppercase letter' },
                        { check: /[a-z]/.test(newPassword), text: 'One lowercase letter' },
                        { check: /\d/.test(newPassword), text: 'One number' },
                      ].map((req, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${req.check ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                          <span className={`text-xs ${req.check ? 'text-green-600 dark:text-green-400' : 'text-[#6E6B65] dark:text-gray-400'}`}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirm-new-password" className="block text-sm font-medium text-[#6E6B65] dark:text-gray-400 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm-new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-[#E5E5E5] dark:border-gray-600 bg-white dark:bg-gray-700 text-[#23201A] dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A3C9C7] focus:border-transparent"
                  placeholder="Confirm new password"
                  required
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={
                    loading || 
                    !newPassword || 
                    !confirmPassword || 
                    newPassword !== confirmPassword ||
                    passwordErrors.length > 0
                  }
                  className="w-full bg-[#A3C9C7] text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
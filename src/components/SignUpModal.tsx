import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onLoginClick }) => {
  if (!isOpen) return null;

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      // Show success message instead of closing
      setError('');
      setEmail('');
      setPassword('');
      // Use the error state to show a success message (in green)
      setSuccess('Account created! Please check your email for a confirmation link before logging in.');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const [success, setSuccess] = React.useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg w-full max-w-md p-6 m-4 shadow-xl transform transition-all">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#6E6B65] hover:text-[#23201A] transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold text-[#23201A] mb-6">Create an account</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md flex items-center gap-2">
              <AlertCircle size={18} />
              <span className="text-sm">{success}</span>
            </div>
          )}

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-[#6E6B65] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="signup-email"
              className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A3C9C7] focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-[#6E6B65] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="signup-password"
              className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A3C9C7] focus:border-transparent"
              placeholder="Create a password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#A3C9C7] text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-[#6E6B65]">
          Already have an account?{' '}
          <button 
            onClick={onLoginClick}
            className="text-[#A3C9C7] hover:text-opacity-80 font-medium"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpModal
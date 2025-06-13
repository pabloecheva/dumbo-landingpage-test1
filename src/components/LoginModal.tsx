import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpClick: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSignUpClick }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple simultaneous requests
    if (loading) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Please enter a valid email address');
        return;
      }

      // Attempt to login
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        // Handle specific authentication errors
        if (authError.message.includes('Invalid login credentials') || 
            authError.message.includes('invalid_credentials') ||
            (authError as any).code === 'invalid_credentials') {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before logging in.');
        } else if (authError.message.includes('Too many requests')) {
          setError('Too many login attempts. Please wait a moment and try again.');
        } else if (authError.message.includes('User not found')) {
          setError('No account found with this email address. Please check your email or sign up for a new account.');
        } else if (authError.message.includes('Signup is disabled')) {
          setError('Login is currently disabled. Please contact support.');
        } else {
          setError(authError.message || 'An error occurred during login');
        }
        return;
      }

      // Success - reload the page to update auth state
      window.location.reload();
    } catch (err: any) {
      if (err?.message?.includes('fetch') || err?.message?.includes('network')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (error.message.includes('User not found')) {
          setError('No account found with this email address.');
        } else if (error.message.includes('Too many requests') || 
                   error.message.includes('rate_limit')) {
          setError('Too many password reset requests. Please wait a moment and try again.');
        } else {
          setError('Failed to send password reset email. Please try again.');
        }
      } else {
        setError('');
        alert('Password reset email sent! Please check your inbox.');
      }
    } catch (err: any) {
      if (err?.message?.includes('rate_limit') || err?.message?.includes('Too many requests')) {
        setError('Too many password reset requests. Please wait a moment and try again.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    }
  };

  const handleSignUpNavigation = () => {
    // Reset all state when navigating to sign up
    setError('');
    setEmail('');
    setPassword('');
    onSignUpClick();
  };

  const handleModalClose = () => {
    // Reset all state when closing modal
    setError('');
    setEmail('');
    setPassword('');
    onClose();
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Reset error when user changes email
    if (error) {
      setError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Reset error when user changes password
    if (error) {
      setError('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 transition-opacity"
        onClick={handleModalClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg w-full max-w-md p-6 m-4 shadow-xl transform transition-all">
        <button
          onClick={handleModalClose}
          className="absolute right-4 top-4 text-[#6E6B65] hover:text-[#23201A] transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold text-[#23201A] mb-6">Login</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-sm block">{error}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#6E6B65] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              id="email"
              required
              className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A3C9C7] focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#6E6B65] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              id="password"
              required
              className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A3C9C7] focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="w-full bg-[#A3C9C7] text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleForgotPassword}
            className="text-sm text-[#A3C9C7] hover:text-opacity-80 font-medium"
          >
            Forgot your password?
          </button>
        </div>

        <p className="mt-4 text-center text-[#6E6B65]">
          New to EchevarríaLabs?{' '}
          <button 
            onClick={handleSignUpNavigation}
            className="text-[#A3C9C7] hover:text-opacity-80 font-medium"
          >
            Sign up for free
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
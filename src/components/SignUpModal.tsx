import React from 'react';
import { X, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onLoginClick }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [emailAlreadyExists, setEmailAlreadyExists] = React.useState(false);

  if (!isOpen) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): string[] => {
    const errors = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
    if (!/\d/.test(password)) errors.push('one number');
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent any submission if email already exists
    if (emailAlreadyExists) {
      return;
    }

    // Prevent multiple simultaneous requests
    if (loading) {
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Step 1: Validate email format first
      if (!validateEmail(email.trim())) {
        setError('Please enter a valid email address');
        return;
      }

      // Step 2: Validate password requirements
      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        setError(`Password must contain ${passwordErrors.join(', ')}`);
        return;
      }

      // Step 3: Check password confirmation
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Step 4: Temporarily suppress console errors for expected user_already_exists responses
      const originalConsoleError = console.error;
      const tempSuppressConsoleError = (...args: any[]) => {
        // Check if this is the specific Supabase "user_already_exists" error we want to suppress
        const errorString = args.join(' ');
        if (errorString.includes('Supabase request failed') && 
            errorString.includes('user_already_exists') && 
            errorString.includes('User already registered')) {
          // Suppress this specific console error
          return;
        }
        // Allow all other console errors through
        originalConsoleError.apply(console, args);
      };

      // Temporarily replace console.error
      console.error = tempSuppressConsoleError;

      try {
        // Step 5: Attempt to create the account
        const { error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (authError) {
          // Handle signup errors
          if (authError.message === 'User already registered' || 
              authError.message.includes('already been registered') ||
              authError.message.includes('User already registered') ||
              authError.message.includes('user_already_exists') ||
              (authError as any).code === 'user_already_exists') {
            // Email already exists - show the specific UI state
            setEmailAlreadyExists(true);
            setError('');
          } else if (authError.message.includes('Invalid email')) {
            setError('Please enter a valid email address');
          } else if (authError.message.includes('Password') && 
                     !authError.message.includes('reset')) {
            setError('Password does not meet requirements');
          } else if (authError.message.includes('Too many requests')) {
            setError('Too many signup attempts. Please wait a moment and try again.');
          } else if (authError.message.includes('Signup is disabled')) {
            setError('Account creation is currently disabled. Please contact support.');
          } else if (authError.message.includes('rate_limit')) {
            setError('Too many signup attempts. Please wait a moment and try again.');
          } else if (authError.message.includes('weak_password')) {
            setError('Password is too weak. Please choose a stronger password.');
          } else {
            setError(authError.message || 'An error occurred during signup');
          }
          return;
        }

        // Success - account created
        setError('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setEmailAlreadyExists(false);
        setSuccess('Account created successfully! Please check your email for a confirmation link before logging in.');
        
      } finally {
        // Always restore the original console.error
        console.error = originalConsoleError;
      }
      
    } catch (err: any) {
      // Handle network or unexpected errors
      if (err?.message?.includes('fetch') || err?.message?.includes('network')) {
        setError('Network error. Please check your connection and try again.');
      } else if (err?.message === 'User already registered' || 
                 err?.message?.includes('already been registered') ||
                 err?.message?.includes('User already registered') ||
                err?.message?.includes('user_already_exists') ||
                 err?.code === 'user_already_exists') {
        setEmailAlreadyExists(true);
        setError('');
      } else if (err?.message?.includes('rate_limit') || 
                 err?.message?.includes('Too many requests')) {
        setError('Too many signup attempts. Please wait a moment and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginNavigation = () => {
    // Reset all state when navigating to login
    setEmailAlreadyExists(false);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    onLoginClick();
  };

  const handleModalClose = () => {
    // Reset all state when closing modal
    setEmailAlreadyExists(false);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Reset email exists state when user changes email
    if (emailAlreadyExists) {
      setEmailAlreadyExists(false);
      setError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Reset email exists state when user changes password
    if (emailAlreadyExists) {
      setEmailAlreadyExists(false);
      setError('');
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    // Reset email exists state when user changes confirm password
    if (emailAlreadyExists) {
      setEmailAlreadyExists(false);
      setError('');
    }
  };

  const passwordErrors = password ? validatePassword(password) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 transition-opacity"
        onClick={handleModalClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg w-full max-w-md p-6 m-4 shadow-xl transform transition-all max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleModalClose}
          className="absolute right-4 top-4 text-[#6E6B65] hover:text-[#23201A] transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold text-[#23201A] mb-6">Create an account</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email Already Exists Message */}
          {emailAlreadyExists && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">This email is already registered</p>
                    <p className="text-sm">An account already exists with this email. Please login instead.</p>
                    <button
                      type="button"
                      onClick={handleLoginNavigation}
                      className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium underline"
                    >
                      Go to Login <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Errors */}
          {error && !emailAlreadyExists && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-start gap-2">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md flex items-start gap-2">
              <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
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
              onChange={handleEmailChange}
              id="signup-email"
              required
              disabled={emailAlreadyExists}
              className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A3C9C7] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
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
              onChange={handlePasswordChange}
              id="signup-password"
              required
              disabled={emailAlreadyExists}
              className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A3C9C7] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
              placeholder="Create a password"
            />
            {password && !emailAlreadyExists && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-[#6E6B65]">Password requirements:</p>
                <div className="space-y-1">
                  {[
                    { check: password.length >= 8, text: 'At least 8 characters' },
                    { check: /[A-Z]/.test(password), text: 'One uppercase letter' },
                    { check: /[a-z]/.test(password), text: 'One lowercase letter' },
                    { check: /\d/.test(password), text: 'One number' },
                  ].map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${req.check ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={`text-xs ${req.check ? 'text-green-600' : 'text-[#6E6B65]'}`}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-[#6E6B65] mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              id="confirm-password"
              required
              disabled={emailAlreadyExists}
              className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A3C9C7] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
              placeholder="Confirm your password"
            />
            {confirmPassword && password !== confirmPassword && !emailAlreadyExists && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={
              loading || 
              emailAlreadyExists ||
              !email.trim() || 
              !password || 
              !confirmPassword || 
              password !== confirmPassword ||
              passwordErrors.length > 0
            }
            className="w-full bg-[#A3C9C7] text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : emailAlreadyExists ? 'Email Already Registered' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-[#6E6B65]">
          Already have an account?{' '}
          <button 
            onClick={handleLoginNavigation}
            className="text-[#A3C9C7] hover:text-opacity-80 font-medium"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpModal;
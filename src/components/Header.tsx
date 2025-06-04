import React from 'react';
import Logo from './Logo';
import { useState } from 'react';
import LoginModal from './LoginModal';
import SignUpModal from './SignUpModal';

const Header: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  const handleOpenSignUp = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  const handleOpenLogin = () => {
    setIsSignUpModalOpen(false);
    setIsLoginModalOpen(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 py-4 px-6 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo />
          
          <div className="flex items-center gap-3 md:gap-4">
            <a 
              href="https://chrome.google.com/webstore" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-[#6E6B65] hover:text-[#23201A] transition-colors"
            >
              Chrome Extension
            </a>
            <button 
              onClick={() => setIsSignUpModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-[#6E6B65] hover:text-[#23201A] transition-colors"
            >
              Sign Up
            </button>
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-2 text-sm font-medium bg-[#A3C9C7] text-white rounded-md hover:bg-opacity-90 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </header>
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSignUpClick={handleOpenSignUp}
      />
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        onLoginClick={handleOpenLogin}
      />
    </>
  );
};

export default Header;
import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Check } from 'lucide-react';
import { Theme, useTheme } from '../hooks/useTheme';

const ThemeDropdown: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Get the appropriate icon for the current theme
  const getThemeIcon = () => {
    if (isTransitioning) {
      return <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent" />;
    }
    return theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />;
  };

  // Get theme description for accessibility
  const getThemeDescription = () => {
    return `${theme.charAt(0).toUpperCase() + theme.slice(1)} theme`;
  };

  // Theme options configuration
  const themeOptions: { 
    value: Theme; 
    label: string; 
    icon: React.ReactNode; 
    description: string;
  }[] = [
    { 
      value: 'light', 
      label: 'Light Theme', 
      icon: <Sun size={16} />,
      description: 'Use light theme'
    },
    { 
      value: 'dark', 
      label: 'Dark Theme', 
      icon: <Moon size={16} />,
      description: 'Use dark theme'
    },
  ];

  const handleThemeSelect = async (selectedTheme: Theme) => {
    if (selectedTheme === theme) {
      setIsOpen(false);
      return;
    }

    setIsTransitioning(true);
    
    try {
      // Add a small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 150));
      setTheme(selectedTheme);
    } catch (error) {
      console.error('Failed to change theme:', error);
    } finally {
      setIsTransitioning(false);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, themeValue: Theme) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleThemeSelect(themeValue);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTransitioning}
        className="p-2 rounded-md transition-all duration-200 hover:bg-[#A3C9C7] hover:bg-opacity-20 dark:hover:bg-gray-700 text-[#6E6B65] dark:text-gray-400 hover:text-[#23201A] dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#A3C9C7] focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        aria-label={getThemeDescription()}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title={getThemeDescription()}
      >
        {getThemeIcon()}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-[#E5E5E5] dark:border-gray-600 py-1 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
          role="menu"
          aria-label="Theme selection menu"
        >
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleThemeSelect(option.value)}
              onKeyDown={(e) => handleKeyDown(e, option.value)}
              disabled={isTransitioning}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F7D6B7] dark:hover:bg-gray-700 transition-colors text-[#23201A] dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:bg-[#F7D6B7] dark:focus:bg-gray-700"
              role="menuitem"
              aria-label={option.description}
              title={option.description}
            >
              <div className="flex items-center gap-3">
                <span className="text-[#6E6B65] dark:text-gray-400">
                  {option.icon}
                </span>
                <span className="font-medium">
                  {option.label}
                </span>
              </div>
              {theme === option.value && (
                <Check size={16} className="text-[#A3C9C7] dark:text-blue-400 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeDropdown;
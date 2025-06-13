import React from 'react';
import { ChevronLeft, Menu, Plus, LogOut, MoreVertical, Edit2, Trash2, FileText } from 'lucide-react';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  title?: string;
  showToggle?: boolean;
  className?: string;
}

interface SidebarHeaderProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  showToggle?: boolean;
  onBack?: () => void;
  backLabel?: string;
}

interface SidebarContentProps {
  children: React.ReactNode;
  isExpanded: boolean;
}

interface SidebarFooterProps {
  children: React.ReactNode;
  isExpanded: boolean;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ 
  title, 
  isExpanded, 
  onToggle, 
  showToggle = true,
  onBack,
  backLabel 
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5] dark:border-gray-600 min-h-[60px]">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {onBack && isExpanded && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#6E6B65] dark:text-gray-400 hover:text-[#23201A] dark:hover:text-gray-200 transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            <span className="truncate">{backLabel}</span>
          </button>
        )}
        {!onBack && isExpanded && (
          <h2 className="text-sm font-medium text-[#6E6B65] dark:text-gray-400 truncate">
            {title}
          </h2>
        )}
      </div>
      
      {showToggle && (
        <button
          onClick={onToggle}
          className="p-2 hover:bg-[#A3C9C7] hover:bg-opacity-20 dark:hover:bg-gray-700 rounded-md transition-colors flex-shrink-0"
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? (
            <ChevronLeft size={16} className="text-[#6E6B65] dark:text-gray-400" />
          ) : (
            <Menu size={16} className="text-[#6E6B65] dark:text-gray-400" />
          )}
        </button>
      )}
    </div>
  );
};

const SidebarContent: React.FC<SidebarContentProps> = ({ children, isExpanded }) => {
  return (
    <div className={`flex-1 overflow-y-auto ${isExpanded ? 'min-w-64' : 'w-0 overflow-hidden'}`}>
      {children}
    </div>
  );
};

const SidebarFooter: React.FC<SidebarFooterProps> = ({ children, isExpanded }) => {
  return (
    <div className={`border-t border-[#E5E5E5] dark:border-gray-600 ${isExpanded ? 'min-w-64' : 'w-0 overflow-hidden'}`}>
      {children}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ 
  isExpanded, 
  onToggle, 
  children, 
  title = "Sidebar",
  showToggle = true,
  className = ""
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 border-r border-[#E5E5E5] dark:border-gray-600 flex flex-col transition-all duration-300 ease-in-out relative z-20 h-full ${
      isExpanded ? 'w-64' : 'w-12'
    } ${className}`}>
      {children}
    </div>
  );
};

// Compound component exports
Sidebar.Header = SidebarHeader;
Sidebar.Content = SidebarContent;
Sidebar.Footer = SidebarFooter;

export default Sidebar;
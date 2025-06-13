import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  lastAiResponse: string | null;
}

const CopyButton: React.FC<CopyButtonProps> = ({ lastAiResponse }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!lastAiResponse) return;

    try {
      await navigator.clipboard.writeText(lastAiResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = lastAiResponse;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        disabled={!lastAiResponse}
        className="p-2 rounded-md transition-colors hover:bg-[#A3C9C7] hover:bg-opacity-20 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Copy last AI response"
      >
        {copied ? (
          <Check size={20} className="text-green-500" />
        ) : (
          <Copy size={20} className="text-[#6E6B65] dark:text-gray-400" />
        )}
      </button>
      
      {copied && (
        <div className="absolute right-0 top-full mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
          Copied!
        </div>
      )}
    </div>
  );
};

export default CopyButton;
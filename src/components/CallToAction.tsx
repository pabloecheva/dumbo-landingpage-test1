import React from 'react';

const CallToAction: React.FC = () => {
  return (
    <section className="py-16 bg-[#A3C9C7] bg-opacity-20">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#23201A] mb-4">
          Ready to Build Your Knowledge Base?
        </h2>
        <p className="text-[#6E6B65] max-w-2xl mx-auto mb-8">
          Start chatting with an AI that only uses content you trust. No hallucinations, no unreliable sources.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-6 py-3 bg-[#A3C9C7] text-white rounded-md hover:bg-opacity-90 transition-colors font-medium">
            Get Started
          </button>
          <a 
            href="https://chrome.google.com/webstore" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3 border border-[#A3C9C7] text-[#23201A] rounded-md hover:bg-[#F7D6B7] hover:border-[#F7D6B7] transition-colors font-medium"
          >
            Get Chrome Extension
          </a>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
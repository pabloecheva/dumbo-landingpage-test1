import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#23201A] leading-tight mb-6">
            Your Personal LLM Knowledge Base
          </h1>
          <p className="text-xl text-[#6E6B65] mb-8">
            Your Knowledge. Your Sources. Your AI Assistant.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-[#A3C9C7] text-white rounded-md hover:bg-opacity-90 transition-colors font-medium">
              Get Started
            </button>
            <button className="px-6 py-3 border border-[#A3C9C7] text-[#23201A] rounded-md hover:bg-[#F7D6B7] hover:border-[#F7D6B7] transition-colors font-medium">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
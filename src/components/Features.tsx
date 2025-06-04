import React from 'react';
import { Database, Search, Shield, Chrome, MessageSquare, Brain, CheckCircle, Compass } from 'lucide-react';
import FeatureCard from './FeatureCard';

const Features: React.FC = () => {
  const features = [
    {
      title: 'Your Trusted Content Only',
      description: "A chat assistant that only uses the content you've saved — no hallucinations, no unreliable sources.",
      icon: <Shield size={24} />
    },
    {
      title: 'Vector Database Search',
      description: 'Built on top of a vector database, letting you search and chat with your personal web archive.',
      icon: <Database size={24} />
    },
    {
      title: 'No Unverified Sources',
      description: 'Say goodbye to answers citing forums, Reddit, or unverified sources — you define the knowledge base.',
      icon: <CheckCircle size={24} />
    },
    {
      title: 'Chrome Extension',
      description: 'Works as a Chrome extension: save any web page with a simple command, instantly.',
      icon: <Chrome size={24} />
    },
    {
      title: 'Natural Conversations',
      description: 'Retrieve insights from saved websites via a natural, conversational interface.',
      icon: <MessageSquare size={24} />
    },
    {
      title: 'LLM Power',
      description: 'Combines the power of LLMs with your trusted, hand-picked content.',
      icon: <Brain size={24} />
    }
  ];

  return (
    <section className="py-16 bg-[#F6F5EE]">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#23201A] mb-4">How It Works</h2>
          <p className="text-[#6E6B65] max-w-2xl mx-auto">
            Your personalized AI assistant that only works with content you've explicitly trusted.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="text-[#A3C9C7] mb-4">{icon}</div>
      <h3 className="text-[#23201A] text-xl font-semibold mb-2">{title}</h3>
      <p className="text-[#6E6B65]">{description}</p>
    </div>
  );
};

export default FeatureCard;
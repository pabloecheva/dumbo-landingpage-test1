import React from 'react';

const UseCases: React.FC = () => {
  const cases = [
    {
      title: 'Researchers',
      description: 'Organize and query research papers and web sources with precision.'
    },
    {
      title: 'Students',
      description: 'Build a personal knowledge base from trusted academic sources.'
    },
    {
      title: 'Analysts',
      description: 'Create a database of industry reports and market data for accurate insights.'
    },
    {
      title: 'Content Creators',
      description: 'Reference your own curated collection of inspiration and resources.'
    }
  ];

  return (
    <section className="py-16 bg-[#F6F5EE]">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#23201A] mb-4">Perfect For</h2>
          <p className="text-[#6E6B65] max-w-2xl mx-auto">
            Discover how different professionals benefit from a personal knowledge base.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cases.map((item, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border-t-2 border-[#A3C9C7]"
            >
              <h3 className="text-xl font-semibold text-[#23201A] mb-3">{item.title}</h3>
              <p className="text-[#6E6B65]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
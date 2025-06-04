import React from 'react';

const VisualSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-[#23201A] mb-4">
              Your Knowledge, Conversational
            </h2>
            <p className="text-[#6E6B65] mb-6">
              Perfect for researchers, students, analysts — anyone tired of vague or source-less LLM answers.
              Your chat answers are always based on documents you've explicitly added — no guessing.
            </p>
            <ul className="space-y-3">
              {[
                'Save web pages with a single click',
                'Chat with your personal knowledge base',
                'Get answers based only on sources you trust',
                'Trace every answer back to its exact source'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#A3C9C7] flex-shrink-0 mt-1">•</span>
                  <span className="text-[#6E6B65]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:w-1/2 bg-[#F7D6B7] bg-opacity-30 rounded-lg p-6 flex items-center justify-center">
            <div className="w-full max-w-md aspect-video bg-white rounded-md shadow-md p-4 flex items-center justify-center">
              <p className="text-[#6E6B65] text-center">Visualization of the knowledge base and chat interaction</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisualSection;
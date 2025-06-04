import React from 'react';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="flex flex-col items-center md:items-start">
            <Logo size={24} />
            <p className="text-[#6E6B65] mt-4 text-center md:text-left max-w-xs">
              Your personal AI assistant powered by your trusted content.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-[#23201A] mb-4">Product</h3>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'Chrome Extension', 'Roadmap'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[#6E6B65] hover:text-[#23201A] transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-[#23201A] mb-4">Resources</h3>
              <ul className="space-y-2">
                {['Documentation', 'Tutorials', 'Blog', 'Support'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[#6E6B65] hover:text-[#23201A] transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-[#23201A] mb-4">Company</h3>
              <ul className="space-y-2">
                {['About', 'Careers', 'Privacy', 'Terms'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[#6E6B65] hover:text-[#23201A] transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-[#6E6B65] text-sm">
            © {new Date().getFullYear()} EchevarríaLabs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
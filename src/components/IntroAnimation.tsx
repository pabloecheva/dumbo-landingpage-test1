import React, { useState, useEffect } from 'react';
import Logo from './Logo';

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationStage(1);
    }, 500);

    const timer2 = setTimeout(() => {
      setAnimationStage(2);
    }, 1500);

    const timer3 = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#F6F5EE] flex items-center justify-center z-50">
      <div 
        className={`transform transition-all duration-700 ease-in-out ${
          animationStage === 0 
            ? 'scale-0 opacity-0' 
            : animationStage === 1 
              ? 'scale-110 opacity-100' 
              : 'scale-100 opacity-0'
        }`}
      >
        <Logo size={64} />
      </div>
    </div>
  );
};

export default IntroAnimation;
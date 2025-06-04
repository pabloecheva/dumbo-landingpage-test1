import React from 'react';
import { Database } from 'lucide-react';

interface LogoProps {
  size?: number;
  color?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 32, color = '#A3C9C7' }) => {
  return (
    <div className="flex items-center gap-2">
      <Database size={size} color={color} strokeWidth={1.5} />
      <span className="font-semibold text-xl text-[#23201A]">EchevarríaLabs</span>
    </div>
  );
};

export default Logo;
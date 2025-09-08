
import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center gap-1">
      <div className="text-black font-bold">
        Pampa<span className="text-pampa-green">Time</span>
      </div>
      <div className="w-6 h-6 bg-pampa-green rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">L</span>
      </div>
    </div>
  );
};

export default Logo;

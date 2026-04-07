import React from 'react';

const AuthorSignature = ({ className = '' }) => {
  return (
    <div className={`fixed bottom-4 right-6 z-50 pointer-events-none select-none ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-md rounded-full border border-white/10 shadow-xl shadow-black/20">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        <span className="text-xs font-medium text-white/80 tracking-widest font-mono">
          DESIGNED BY <span className="text-cyan-400 font-bold ml-1">THEHAOUY</span>
        </span>
      </div>
    </div>
  );
};

export default AuthorSignature;

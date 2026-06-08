import React from 'react';

const EurekaLogo = ({ className = "w-10 h-10", color = "#2099e9" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full transform hover:scale-110 transition-transform duration-700">
        {/* Elegant Background Field Loops */}
        <circle cx="50" cy="50" r="46" stroke={color} strokeWidth="0.5" strokeDasharray="3 6" className="opacity-20" />
        <ellipse cx="50" cy="50" rx="48" ry="12" stroke={color} strokeWidth="0.75" transform="rotate(-30 50 50)" className="opacity-30" />
        <ellipse cx="50" cy="50" rx="42" ry="10" stroke={color} strokeWidth="0.75" transform="rotate(60 50 50)" className="opacity-30" />

        {/* Refined Academic 'E' Symbol (Massive size for visual parity) */}
        <text
          x="50"
          y="71"
          textAnchor="middle"
          fill={color}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '85px',
            fontWeight: '500',
            fontStyle: 'italic'
          }}
          className="drop-shadow-sm select-none"
        >
          E
        </text>

        {/* Glow & Spark Elements */}
        <circle cx="50" cy="50" r="1.5" fill={color} className="animate-pulse" />
        <path d="M72 45 Q 80 50, 72 55" stroke={color} strokeWidth="1" strokeLinecap="round" className="opacity-50" />
      </svg>
    </div>
  );
};

export default EurekaLogo;


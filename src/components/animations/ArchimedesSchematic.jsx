import React from 'react';

const ArchimedesSchematic = () => {
  return (
    <svg 
      viewBox="0 0 800 600" 
      className="w-full h-full drop-shadow-[0_0_15px_rgba(255,140,0,0.6)]"
      style={{ filter: 'drop-shadow(0 0 8px #FF8C00)' }}
    >
      <defs>
        {/* Grid Pattern within the SVG */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.3" />
        </pattern>
        {/* Glowing Orange Filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background Grid */}
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* The Fulcrum (Điểm tựa) */}
      <path 
        d="M 350 450 L 450 450 L 400 350 Z" 
        fill="none" 
        stroke="#FF8C00" 
        strokeWidth="4" 
        strokeLinejoin="round" 
        filter="url(#glow)"
      />
      {/* Cố định điểm tựa với đất */}
      <line x1="300" y1="450" x2="500" y2="450" stroke="#FF8C00" strokeWidth="4" filter="url(#glow)" strokeDasharray="10 5" />
      <line x1="330" y1="450" x2="310" y2="470" stroke="#FF8C00" strokeWidth="2" filter="url(#glow)" />
      <line x1="370" y1="450" x2="350" y2="470" stroke="#FF8C00" strokeWidth="2" filter="url(#glow)" />
      <line x1="410" y1="450" x2="390" y2="470" stroke="#FF8C00" strokeWidth="2" filter="url(#glow)" />
      <line x1="450" y1="450" x2="430" y2="470" stroke="#FF8C00" strokeWidth="2" filter="url(#glow)" />
      <line x1="490" y1="450" x2="470" y2="470" stroke="#FF8C00" strokeWidth="2" filter="url(#glow)" />

      {/* The Lever (Đòn bẩy) */}
      <line 
        x1="100" y1="200" 
        x2="650" y2="475" 
        stroke="#FF8C00" 
        strokeWidth="8" 
        strokeLinecap="round" 
        filter="url(#glow)"
      />

      {/* The Earth (Trái Đất) */}
      <circle 
        cx="150" cy="150" 
        r="80" 
        fill="none" 
        stroke="#FF8C00" 
        strokeWidth="4" 
        strokeDasharray="15 5" 
        filter="url(#glow)"
      />
      {/* Vĩ tuyến / Kinh tuyến Trái Đất cơ bản */}
      <ellipse cx="150" cy="150" rx="80" ry="30" fill="none" stroke="#FF8C00" strokeWidth="2" filter="url(#glow)" opacity="0.6"/>
      <ellipse cx="150" cy="150" rx="30" ry="80" fill="none" stroke="#FF8C00" strokeWidth="2" filter="url(#glow)" opacity="0.6"/>

      {/* Force Vectors (Vectơ lực) */}
      {/* Lực tác dụng nhỏ ở tay */}
      <line x1="600" y1="350" x2="600" y2="440" stroke="#0ea5e9" strokeWidth="4" markerEnd="url(#arrowhead)" />
      <polygon points="590,440 610,440 600,460" fill="#0ea5e9" />
      <text x="620" y="400" fill="#0ea5e9" fontSize="24" fontFamily="monospace" fontWeight="bold">F (Force)</text>

      {/* Lực nâng Trái Đất */}
      <line x1="150" y1="300" x2="150" y2="230" stroke="#0ea5e9" strokeWidth="5" />
      <polygon points="140,230 160,230 150,210" fill="#0ea5e9" />
      <text x="170" y="270" fill="#0ea5e9" fontSize="24" fontFamily="monospace" fontWeight="bold">W (Weight)</text>

      {/* Mathematical Notations */}
      <text x="250" y="320" fill="#FFD700" fontSize="20" fontFamily="monospace">L₁</text>
      <text x="500" y="400" fill="#FFD700" fontSize="20" fontFamily="monospace">L₂</text>
      <text x="350" y="520" fill="#FF8C00" fontSize="18" fontFamily="monospace" opacity="0.8">Δ: F * L₂ = W * L₁</text>

    </svg>
  );
};

export default ArchimedesSchematic;

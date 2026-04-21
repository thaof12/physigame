import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { mechSounds } from '../../core/MechanicalSoundEngine';

/**
 * Nút bấm dạng bánh răng (GearButton)
 * Khi hover: Bánh răng chính và các bánh răng nhỏ xoay khớp nhau
 */
const GearButton = ({ children, onClick, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    mechSounds.playGearClack();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = (e) => {
    mechSounds.playGearClack();
    if (onClick) onClick(e);
  };

  return (
    <button
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`relative group flex items-center justify-center transition-all ${className}`}
      style={{ overflow: 'visible' }}
    >
      {/* Bánh răng bao bọc */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
         {/* Bánh răng chính giữa cắm ở nền */}
         <div 
           className={`absolute w-[140%] h-[140%] rounded-full border-4 border-dashed border-[#274dad]/40 shadow-[0_0_15px_rgba(184,115,51,0.2)] transition-transform duration-700 ease-in-out ${isHovered ? 'rotate-90' : 'rotate-0'}`} 
         />
         {/* Bánh răng quay ngược */}
         <div 
           className={`absolute -bottom-4 -right-4 w-[60%] h-[60%] rounded-full border-[6px] border-dotted border-slate-500/50 transition-transform duration-700 ease-in-out ${isHovered ? '-rotate-180' : 'rotate-0'}`} 
         >
           <Settings className="w-full h-full text-slate-500/30 p-1" />
         </div>
      </div>

      {/* Thân nút bấm Đồng/Thép */}
      <div className="relative z-10 px-6 py-3 bg-gradient-to-b from-[#1a2938] to-[#0a1520] border border-[#274dad]/50 rounded-lg shadow-[inset_0_2px_5px_rgba(255,255,255,0.1),_0_5px_15px_rgba(0,0,0,0.5)] group-hover:border-[#274dad] transition-colors flex items-center gap-2">
         {/* Đinh ốc 4 góc */}
         <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-slate-400 shadow-inner"></div>
         <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-slate-400 shadow-inner"></div>
         <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-slate-400 shadow-inner"></div>
         <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-slate-400 shadow-inner"></div>

         <div className="text-[#274dad] group-hover:text-blue-400 font-mono font-bold tracking-widest uppercase transition-colors drop-shadow-md">
            {children}
         </div>
      </div>
    </button>
  );
};

export default GearButton;



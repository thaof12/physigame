import React, { useState } from 'react';
import { mechSounds } from '../../core/MechanicalSoundEngine';

const LeverButton = ({ children, onClick, className = '' }) => {
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
    <div 
      className={`relative group inline-block cursor-pointer ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
       {/* Đế cần gạt (Base & Gear teeth) */}
       <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-b from-[#4a5568] to-[#1a202c] border-2 border-[#B87333] rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.8)] z-20 flex items-center justify-center overflow-hidden">
          {/* Răng cưa ở đế */}
          <div className="absolute top-0 w-[120%] h-3 bg-repeating-linear-gradient-to-r" 
               style={{ backgroundImage: 'repeating-linear-gradient(90deg, #B87333, #B87333 4px, transparent 4px, transparent 8px)' }}>
          </div>
          <div className="absolute inset-x-0 bottom-2 text-center text-[#B87333] font-bold text-sm tracking-widest pointer-events-none drop-shadow-md">
             {children}
          </div>
       </div>

       {/* Rãnh trượt (Slot) */}
       <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-6 h-20 bg-black rounded-t-full shadow-inner z-10 border-x border-t border-[#4a5568]"></div>

       {/* Tay đòn (Lever Arm) */}
       <div 
         className="absolute bottom-10 left-1/2 -translate-x-1/2 origin-bottom transition-transform duration-300 ease-in-out z-10"
         style={{
            transform: isHovered ? 'rotate(35deg) scaleY(0.9)' : 'rotate(-20deg) scaleY(1)'
         }}
       >
          {/* Trục kim loại */}
          <div className="w-4 h-24 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 border border-slate-500 rounded-full shadow-md mx-auto"></div>
          {/* Tay nắm gỗ */}
          <div className="w-10 h-10 bg-gradient-to-br from-[#8b4513] to-[#5c2e0b] rounded-full absolute -top-5 left-1/2 -translate-x-1/2 border-2 border-amber-900 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.2),_0_5px_10px_rgba(0,0,0,0.5)]"></div>
       </div>

       {/* Kích thước giữ chỗ (Spacer) */}
       <div className="w-64 h-32"></div>
    </div>
  );
};

export default LeverButton;

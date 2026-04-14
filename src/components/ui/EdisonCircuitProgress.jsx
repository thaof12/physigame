import React from 'react';
import { Lightbulb } from 'lucide-react';

/**
 * Thanh tiến độ Mạch điện (Edison Circuit Progress)
 * Dãy bóng đèn Edison nối bằng dây đồng.
 * @param {Object} props
 * @param {number} props.total - Số bóng đèn tổng cộng
 * @param {number} props.completed - Số bóng đã sáng (màu cam)
 * @param {number} props.inProgress - Vị trí bóng đang nhấp nháy (thuộc index)
 */
const EdisonCircuitProgress = ({ total = 5, completed = 2, inProgress = 2 }) => {
  return (
    <div className="flex items-center w-full relative h-16">
      
      {/* Dây Đồng chính */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-b from-[#B87333] to-[#8C5523] -translate-y-1/2 shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-0 rounded-full"></div>
      
      {/* Dãy Bóng đèn */}
      <div className="absolute inset-0 flex justify-between items-center px-2 z-10">
        {Array.from({ length: total }).map((_, idx) => {
          
          let state = 'off';
          if (idx < completed) state = 'on';
          else if (idx === inProgress) state = 'flicker';

          return (
            <div key={idx} className="relative flex flex-col items-center justify-center">
               
               {/* Đầu kẹp dây đồng */}
               <div className="absolute top-1/2 w-4 h-6 border-x-2 border-[#8C5523] bg-[#3a2010] -translate-y-1/2 z-0 rounded-sm"></div>

               {/* Bóng Đèn Edison */}
               <div className={`relative z-10 w-8 h-10 border-2 rounded-t-full rounded-b-xl flex items-center justify-center transition-all duration-300 ${
                 state === 'on' ? 'bg-orange-400/20 border-orange-500 shadow-[0_0_20px_#FF8C00,inset_0_0_10px_#FF8C00]' :
                 state === 'flicker' ? 'bg-cyan-400/10 border-cyan-500 shadow-[0_0_15px_#00FFFF] animate-pulse' :
                 'bg-slate-900/60 border-slate-700 shadow-inner'
               }`}>
                  {/* Lõi dây tóc */}
                  <div className={`w-2 h-4 border border-t-0 rounded-b-full ${
                    state === 'on' ? 'border-orange-200 shadow-[0_0_10px_#fff]' :
                    state === 'flicker' ? 'border-cyan-200' :
                    'border-slate-500'
                  }`}></div>
               </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EdisonCircuitProgress;

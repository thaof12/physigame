import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';

const MechanicalDoorTransition = ({ isActive, onComplete }) => {
  const [stage, setStage] = useState('idle'); // idle, closing, closed, opening

  useEffect(() => {
    if (isActive && stage === 'idle') {
      // 1. Cửa Đóng lại
      setStage('closing');
      setTimeout(() => {
        setStage('closed');
        // Kéo dài lúc đóng một chút cho cảm giác nặng nề
        setTimeout(() => {
          // 2. Cửa Mở ra (Warp đến trang đích)
          setStage('opening');
          if (onComplete) onComplete();
          
          setTimeout(() => {
            setStage('idle');
          }, 800); // Đợi CSS animation mở hoàn tất
        }, 300);
      }, 500); // 500ms hệt như thời gian transition CSS
    }
  }, [isActive, stage, onComplete]);

  if (stage === 'idle' && !isActive) return null;

  const isClosed = stage === 'closing' || stage === 'closed';

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex overflow-hidden">
       {/* Cánh cửa Trái */}
       <div 
         className={`w-1/2 h-full bg-[#111c27] flex items-center justify-end border-r-8 border-[#274dad]/80 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-[0_0_50px_rgba(0,0,0,0.8)] ${isClosed ? 'translate-x-0' : '-translate-x-full'}`}
       >
          <div className="absolute top-1/2 -mt-10 right-0 translate-x-1/2 text-slate-500 opacity-50 flex items-center flex-col gap-2">
            <Settings className={`w-20 h-20 origin-center transition-transform duration-1000 ${isClosed ? 'rotate-[360deg]' : 'rotate-0'}`} />
          </div>
          <div className="mr-8 text-[#274dad]/30 font-mono text-8xl font-black rotate-[-90deg] uppercase tracking-widest whitespace-nowrap opacity-20">
            SYSTEM
          </div>
       </div>

       {/* Cánh cửa Phải */}
       <div 
         className={`w-1/2 h-full bg-[#111c27] flex items-center justify-start border-l-8 border-[#30475e] transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-[0_0_50px_rgba(0,0,0,0.8)] ${isClosed ? 'translate-x-0' : 'translate-x-full'}`}
       >
          <div className="absolute top-1/2 -mt-10 left-0 -translate-x-1/2 text-slate-500/80 flex items-center flex-col gap-2">
             <Settings className={`w-16 h-16 origin-center transition-transform duration-1000 ${isClosed ? '-rotate-[360deg]' : 'rotate-0'}`} />
          </div>
          <div className="ml-8 text-[#274dad]/30 font-mono text-8xl font-black rotate-90 uppercase tracking-widest whitespace-nowrap opacity-20">
            SECURE
          </div>
       </div>

       {/* Overlay Spark Effect (khi cửa đóng khớp) */}
       {stage === 'closed' && (
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-full bg-cyan-400 blur-md animate-pulse"></div>
         </div>
       )}
    </div>
  );
};

export default MechanicalDoorTransition;


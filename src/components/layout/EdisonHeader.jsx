import { useEffect, useRef, useState } from 'react';

/**
 * EdisonHeader - Copper Busbar với dãy bóng Edison + Galvanometer
 * - Gắn chặt trên đỉnh PhysicsHome
 * - Bóng đèn sáng dần theo tiến độ (completedBulbs / totalBulbs)
 * - Galvanometer ở cuối với kim dao động
 */
const EdisonHeader = ({ completedBulbs = 3, totalBulbs = 10, isActive = false, title = 'PhysiGame', onBack }) => {
  const [galvAngle, setGalvAngle] = useState(0);
  const galvRef = useRef(null);

  // Galvanometer needle jitter animation
  useEffect(() => {
    const baseAngle = (completedBulbs / totalBulbs) * 120 - 60; // -60 to +60 deg
    const intensity = isActive ? 12 : 4;
    const interval = setInterval(() => {
      setGalvAngle(baseAngle + (Math.random() - 0.5) * intensity);
    }, 120);
    return () => clearInterval(interval);
  }, [completedBulbs, totalBulbs, isActive]);

  return (
    <div className="relative w-full h-14 flex items-center bg-gradient-to-b from-[#1a0e05] to-[#0f0a03] border-b-4 border-[#274dad] shadow-[0_4px_20px_rgba(0,0,0,0.8)] overflow-hidden z-30 flex-shrink-0">

      {/* Nền mặt bàn gỗ cho header */}
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, #5c3d1e 0px, #3d2510 2px, transparent 2px, transparent 20px)' }}
      />

      {/* Thanh đồng (Copper Busbar) chạy ngang */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 bg-gradient-to-b from-[#FFD700] via-[#274dad] to-[#2099e9] shadow-[0_0_8px_rgba(184,115,51,0.6)] z-0" />

      {/* Nút Back / Logo */}
      <div className="relative z-10 flex items-center gap-2 pl-3 pr-4 h-full border-r border-[#274dad]/50 flex-shrink-0">
        {onBack && (
          <button onClick={onBack} className="w-7 h-7 rounded-full bg-[#1e293b] border border-[#274dad] text-[#FFD700] text-xs flex items-center justify-center hover:bg-[#274dad]/30 transition-colors">
            ←
          </button>
        )}
        <span className="text-[#FFD700] font-mono font-black text-sm tracking-widest">{title}</span>
      </div>

      {/* ─── Dãy bóng đèn Edison ─── */}
      <div className="flex-1 flex items-center justify-center gap-2 md:gap-3 relative z-10 px-2 overflow-hidden">
        {[...Array(totalBulbs)].map((_, i) => {
          const isLit = i < completedBulbs;
          return (
            <div key={i} className="flex flex-col items-center flex-shrink-0 relative group" title={isLit ? `Bài ${i + 1}: Hoàn thành` : `Bài ${i + 1}: Chưa học`}>
              {/* Dây nối từ busbar lên */}
              <div className={`w-[1.5px] h-2 ${isLit ? 'bg-[#FFD700]' : 'bg-[#475569]'} transition-colors duration-500`} />

              {/* Đuôi bóng (bulb base - E27 cap) */}
              <div className={`w-4 h-2 rounded-sm ${isLit ? 'bg-gradient-to-b from-[#92400e] to-[#451a03]' : 'bg-[#1e293b]'} border ${isLit ? 'border-[#274dad]' : 'border-[#334155]'} transition-all duration-500`} />

              {/* Bóng đèn (bulb glass) */}
              <div className={`w-5 h-6 rounded-t-full relative overflow-hidden transition-all duration-700 ${isLit
                ? 'bg-gradient-to-b from-[#fffbeb] to-[#fde68a] shadow-[0_0_12px_6px_rgba(253,230,138,0.7),0_0_25px_rgba(251,191,36,0.4)]'
                : 'bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-[#334155]'
              }`}>
                {/* Sợi đốt (filament) - chỉ hiện khi sáng */}
                {isLit && (
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 20 24">
                    <path d="M 5 20 Q 7 10 10 14 Q 13 18 15 8" stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.8" />
                    <path d="M 5 20 Q 7 14 10 14 Q 13 14 15 20" stroke="#d97706" strokeWidth="0.5" fill="none" opacity="0.5" />
                  </svg>
                )}
                {/* Highlight kính */}
                <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white/20" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Galvanometer (Điện kế) ─── */}
      <div className="relative z-10 flex flex-col items-center justify-center pr-3 pl-2 h-full border-l border-[#274dad]/50 flex-shrink-0" title="Điện kế - đo cường độ học tập">
        <svg width="44" height="44" viewBox="0 0 44 44">
          {/* Mặt đồng hồ */}
          <circle cx="22" cy="22" r="18" fill="#0f172a" stroke="#274dad" strokeWidth="2" />

          {/* Vạch chia */}
          {[-60, -40, -20, 0, 20, 40, 60].map((a, i) => {
            const rad = (a - 90) * Math.PI / 180;
            const x1 = 22 + 14 * Math.cos(rad);
            const y1 = 22 + 14 * Math.sin(rad);
            const x2 = 22 + 17 * Math.cos(rad);
            const y2 = 22 + 17 * Math.sin(rad);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth={i === 3 ? 2 : 1} />;
          })}

          {/* Arc nền */}
          <path d="M 8 30 A 16 16 0 0 1 36 30" fill="none" stroke="#1e293b" strokeWidth="6" />
          <path d="M 8 30 A 16 16 0 0 1 22 6" fill="none" stroke="#14532d" strokeWidth="4" opacity="0.5" />

          {/* Kim chỉ */}
          <g transform={`rotate(${galvAngle}, 22, 22)`}>
            <line x1="22" y1="22" x2="22" y2="8" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="22" y1="22" x2="22" y2="27" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <circle cx="22" cy="22" r="2.5" fill="#274dad" stroke="#FFD700" strokeWidth="0.5" />

          {/* Label G */}
          <text x="22" y="35" textAnchor="middle" fill="#475569" fontSize="5" fontFamily="monospace">G</text>
        </svg>
        <span className="text-[8px] text-[#475569] font-mono uppercase tracking-widest mt-0.5">Điện kế</span>
      </div>
    </div>
  );
};

export default EdisonHeader;


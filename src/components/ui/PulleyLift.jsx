import { useState, useEffect, useRef } from 'react';
import { mechSounds } from '../../core/MechanicalSoundEngine';

/**
 * PulleyLift - Hệ ròng rọc phức hợp (Block & Tackle) Sidebar
 * - Grades hiển thị như quả nặng treo dây
 * - Click quả nặng: ròng rọc xoay + rope creak sound
 * - Hiển thị công thức i = n₁/n₂
 */
const PulleyLift = ({ grades = [6, 7, 8, 9, 10, 11, 12], activeGrade, onSelect }) => {
  const [pulleyAngle, setPulleyAngle] = useState(0);
  const [activatingGrade, setActivatingGrade] = useState(null);
  const animFrameRef = useRef(null);

  const handleSelect = (grade) => {
    if (grade === activeGrade) return;
    mechSounds.playRopeCreak();
    setActivatingGrade(grade);

    // Animate pulley spinning
    let angle = pulleyAngle;
    const targetAngle = angle + 180;
    const start = performance.now();
    const duration = 400;

    const animate = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setPulleyAngle(angle + (targetAngle - angle) * eased);
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setPulleyAngle(targetAngle % 360);
        setActivatingGrade(null);
        onSelect(grade);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => () => cancelAnimationFrame(animFrameRef.current), []);

  return (
    <div className="w-28 md:w-36 h-full flex flex-col items-center relative overflow-hidden bg-gradient-to-b from-[#0f1923] to-[#060d13] border-r-2 border-[#274dad]/30 shadow-[10px_0_30px_rgba(0,0,0,0.7)]">

      {/* ─── TOP BLOCK (Upper Pulley Housing) ─── */}
      <div className="relative z-20 mt-4 flex flex-col items-center">
        {/* Khung ròng rọc trên */}
        <div className="w-20 h-10 bg-gradient-to-b from-[#594024] to-[#2d1f10] border-2 border-[#274dad] rounded-sm shadow-xl flex items-center justify-center gap-1 relative">
          <div className="absolute -top-1 left-3 right-3 h-1 bg-[#274dad] rounded" />
          {/* 2 bánh xe ròng rọc */}
          {[0, 1].map(i => (
            <div key={i} className="relative w-7 h-7">
              <div
                className="w-full h-full rounded-full bg-gradient-to-br from-[#c8a060] to-[#6b3a1f] border-2 border-[#274dad] shadow-inner transition-transform duration-100"
                style={{ transform: `rotate(${pulleyAngle + i * 90}deg)` }}
              >
                {/* Nan hoa */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-[2px] bg-[#4a2c0a]/60" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center rotate-90">
                  <div className="w-full h-[2px] bg-[#4a2c0a]/60" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center rotate-45">
                  <div className="w-full h-[2px] bg-[#4a2c0a]/60" />
                </div>
                <div className="w-2 h-2 bg-[#0f1923] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-[#274dad]" />
              </div>
            </div>
          ))}
        </div>
        {/* Hook nghiêng */}
        <div className="w-3 h-4 border-2 border-b-0 border-[#2099e9] rounded-t-full" />
      </div>

      {/* ─── ROPES + WEIGHT TAGS ─── */}
      <div className="flex-1 relative w-full flex flex-col items-center justify-around py-4 px-1">
        {/* Dây cáp chính (3 sợi song song) */}
        <div className="absolute top-0 bottom-0 left-[35%] flex gap-[4px]">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-[3px] h-full bg-gradient-to-b from-[#94a3b8] via-[#64748b] to-[#334155] opacity-80 shadow-sm" />
          ))}
        </div>

        {/* Quả nặng (Grade Tags) */}
        {grades.map((grade, idx) => {
          const isActive = grade === activeGrade;
          const isAnimating = activatingGrade === grade;
          return (
            <div
              key={grade}
              onClick={() => handleSelect(grade)}
              className="relative z-10 cursor-pointer group flex flex-col items-center"
            >
              {/* Móc treo */}
              <div className="w-1 h-3 bg-gradient-to-b from-[#475569] to-[#94a3b8]" />
              <div className="w-3 h-3 border-[3px] border-t-0 border-[#64748b] rounded-b-full mb-0.5" />

              {/* Thân quả nặng kim loại */}
              <div className={`transition-all duration-300 ease-bounce flex flex-col items-center justify-center px-2 py-3 w-20 relative overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.8)]
                ${isActive
                  ? 'bg-gradient-to-b from-[#c8a060] to-[#2099e9] border-2 border-[#FFD700] scale-110 translate-y-1'
                  : 'bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-[#475569] hover:border-[#274dad] hover:scale-105'
                } ${isAnimating ? 'animate-bounce' : ''}`}
              >
                {/* Đinh tán góc */}
                {['-top-0.5 -left-0.5', '-top-0.5 -right-0.5', '-bottom-0.5 -left-0.5', '-bottom-0.5 -right-0.5'].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} w-2.5 h-2.5 rounded-full ${isActive ? 'bg-[#4a2c0a]' : 'bg-slate-900'} border ${isActive ? 'border-[#FFD700]' : 'border-[#334155]'} shadow-inner z-10`} />
                ))}

                {/* Vạch kim loại ngang */}
                <div className={`absolute top-1/3 left-0 right-0 h-[1px] ${isActive ? 'bg-[#FFD700]/30' : 'bg-slate-600/40'}`} />
                <div className={`absolute top-2/3 left-0 right-0 h-[1px] ${isActive ? 'bg-[#FFD700]/30' : 'bg-slate-600/40'}`} />

                {/* Label */}
                <span className={`font-black font-mono text-lg tracking-tight z-10 ${isActive ? 'text-[#0f172a]' : 'text-slate-300 group-hover:text-[#FFD700]'}`}>
                  L.{grade}
                </span>
                {/* Sub-label */}
                <span className={`text-[9px] font-mono uppercase tracking-widest z-10 ${isActive ? 'text-[#1c1917]' : 'text-slate-500'}`}>
                  Lớp {grade}
                </span>

                {/* Shine overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── BOTTOM BLOCK (Lower Pulley Housing) ─── */}
      <div className="relative z-20 mb-4 flex flex-col items-center">
        <div className="w-3 h-4 border-2 border-t-0 border-[#2099e9] rounded-b-full" />
        <div className="w-20 h-8 bg-gradient-to-b from-[#2d1f10] to-[#594024] border-2 border-[#274dad] rounded-sm shadow-xl flex items-center justify-center gap-1">
          {[0, 1].map(i => (
            <div key={i} className="relative w-5 h-5">
              <div
                className="w-full h-full rounded-full bg-gradient-to-br from-[#274dad] to-[#4a2c0a] border border-[#FFD700]/50 shadow-inner transition-transform duration-100"
                style={{ transform: `rotate(${-(pulleyAngle) + i * 90}deg)` }}
              >
                <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[1.5px] bg-black/40" /></div>
                <div className="absolute inset-0 flex items-center justify-center rotate-90"><div className="w-full h-[1.5px] bg-black/40" /></div>
                <div className="w-1.5 h-1.5 bg-[#0f1923] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FORMULA TAG ─── */}
      <div className="absolute bottom-16 right-1 text-[9px] text-[#475569] font-mono rotate-90 origin-right whitespace-nowrap select-none">
        i = n₁/n₂ = {activeGrade}/6
      </div>
    </div>
  );
};

export default PulleyLift;


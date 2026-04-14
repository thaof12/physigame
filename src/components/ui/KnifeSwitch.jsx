import { useState } from 'react';
import { mechSounds } from '../../core/MechanicalSoundEngine';

/**
 * KnifeSwitch - Cầu dao sứ & đồng công nghiệp
 * - Click để kích hoạt với electric arc animation
 * - Âm thanh: playElectricSpark
 */
const KnifeSwitch = ({ onActivate, label = 'KÍCH HOẠT', isActive = false }) => {
  const [switched, setSwitched] = useState(isActive);
  const [sparking, setSparking] = useState(false);

  const handleFlip = () => {
    mechSounds.playElectricSpark();
    setSparking(true);
    setTimeout(() => {
      setSwitched(s => {
        const next = !s;
        if (next && onActivate) onActivate();
        return next;
      });
    }, 300);
    setTimeout(() => setSparking(false), 800);
  };

  return (
    <div className="relative flex flex-col items-center select-none gap-2" onClick={handleFlip}>
      {/* Arc flash overlay */}
      {sparking && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 rounded-xl bg-cyan-200/30 animate-pulse" />
          {/* Arc lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 80">
            <path d="M 60 20 Q 50 30 55 40 Q 65 50 58 60" stroke="#0ea5e9" strokeWidth="2" fill="none"
              className="animate-ping" opacity="0.8" />
            <path d="M 62 18 Q 72 28 68 40 Q 60 52 65 62" stroke="#7dd3fc" strokeWidth="1.5" fill="none"
              opacity="0.6" />
          </svg>
        </div>
      )}

      {/* The Switch Body */}
      <div className="relative w-28 cursor-pointer group">
        {/* Đế sứ trắng (Insulator base) */}
        <div className="absolute bottom-0 left-4 right-4 h-4 bg-gradient-to-b from-slate-200 to-slate-400 rounded-sm shadow-lg border border-slate-500" />
        <div className="absolute bottom-0 left-1 right-1 h-6 bg-gradient-to-b from-slate-100 to-slate-300 rounded shadow-xl border-2 border-slate-400 flex items-center justify-center">
          <div className="w-4 h-2 bg-[#B87333] rounded-sm" />
        </div>

        {/* Tay đòn (Blade) */}
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 origin-bottom transition-transform duration-400 ease-in-out cursor-pointer"
          style={{ transform: `translateX(-50%) rotate(${switched ? '-55deg' : '0deg'})` }}
        >
          {/* Tay cầm Bakelite đen */}
          <div className="w-5 h-20 bg-gradient-to-b from-[#1c1917] to-[#292524] rounded-t-full rounded-b-sm shadow-xl border border-[#44403c] mx-auto relative">
            {/* Vân gỗ / nhựa bakelite */}
            <div className="absolute inset-x-1 top-2 bottom-2 border-x border-[#57534e]/30 rounded" />
            <div className="absolute left-1/2 -translate-x-1/2 top-3 w-3 h-3 rounded-full bg-[#78716c] border border-[#57534e]" />
          </div>
          {/* Lưỡi đồng (Blade) */}
          <div className="w-3 h-10 bg-gradient-to-b from-[#FFD700] via-[#B87333] to-[#8C5523] mx-auto shadow-[0_0_8px_rgba(184,115,51,0.5)] border-x border-[#FFD700]/30" />
        </div>

        {/* Spacer */}
        <div className="h-24 w-28" />

        {/* Tiếp điểm đồng dưới (Contact clamp) */}
        <div className="relative bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-[#B87333] to-[#6b3a1f] rounded shadow-lg border border-[#FFD700]/30 flex items-center justify-center">
          <div className="w-2 h-6 bg-[#c8a060] rounded-sm shadow-inner" />
          <div className="absolute top-1 left-2 right-2 h-1 bg-[#FFD700]/30 rounded" />
        </div>
      </div>

      {/* Label */}
      <div className={`mt-2 px-6 py-2 font-mono font-black tracking-widest text-sm uppercase rounded border-2 transition-all duration-300 ${switched
        ? 'bg-emerald-900/80 border-emerald-500 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.5)]'
        : 'bg-red-950/80 border-red-700 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
      }`}>
        {switched ? '● ON' : '○ OFF'} — {label}
      </div>

      <style>{`
        @keyframes arc-flicker {
          0%, 100% { opacity: 1; }
          25% { opacity: 0.3; }
          50% { opacity: 0.9; }
          75% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default KnifeSwitch;

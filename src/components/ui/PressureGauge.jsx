import { useEffect, useRef, useState } from 'react';
import { mechSounds } from '../../core/MechanicalSoundEngine';

/**
 * PressureGauge - Đồng hồ áp suất hơi nước Steampunk
 * - Hiển thị fixed ở góc dưới phải
 * - Kim dao động theo pressure prop (0-100)
 * - Khi > 80: kim vào vùng đỏ + tiếng xì hơi
 */
const PressureGauge = ({ pressure = 30, isLoading = false }) => {
  const [displayedPressure, setDisplayedPressure] = useState(pressure);
  const [needleAngle, setNeedleAngle] = useState(-90);
  const [jitter, setJitter] = useState(0);
  const prevPressureRef = useRef(pressure);

  useEffect(() => {
    // Animate pressure change
    const target = isLoading ? Math.min(100, pressure + 20) : pressure;
    setDisplayedPressure(target);
    // Map pressure 0-100 → needle -135deg to +135deg
    const angle = -135 + (target / 100) * 270;
    setNeedleAngle(angle);

    if (target > 80 && prevPressureRef.current <= 80) {
      mechSounds.playSteamHiss();
    }
    prevPressureRef.current = target;
  }, [pressure, isLoading]);

  // Constant micro-jitter of needle
  useEffect(() => {
    const interval = setInterval(() => {
      setJitter((Math.random() - 0.5) * (displayedPressure > 70 ? 8 : 3));
    }, 150);
    return () => clearInterval(interval);
  }, [displayedPressure]);

  const isRed = displayedPressure > 80;
  const isYellow = displayedPressure > 50 && displayedPressure <= 80;

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none" title={`Áp suất hệ thống: ${Math.round(displayedPressure)}%`}>
      <div className="relative w-28 h-28">
        {/* Vỏ đồng hồ - Brass ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#c8a060] via-[#8C5523] to-[#4a2c0a] shadow-[0_0_20px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.2)] border-4 border-[#a07040]" />

        {/* Mặt đồng hồ */}
        <div className="absolute inset-2 rounded-full bg-[#0a0f0a] shadow-inner overflow-hidden">
          {/* SVG Dial */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Vùng xanh an toàn */}
            <path d="M 50 50 L 13 72 A 42 42 0 0 1 13 28 Z" fill="#14532d" opacity="0.6" />
            {/* Vùng vàng cảnh báo */}
            <path d="M 50 50 L 13 28 A 42 42 0 0 1 50 8 Z" fill="#713f12" opacity="0.6" />
            {/* Vùng đỏ nguy hiểm */}
            <path d="M 50 50 L 50 8 A 42 42 0 0 1 87 28 Z" fill="#7f1d1d" opacity="0.7" />

            {/* Vạch chia độ */}
            {[...Array(11)].map((_, i) => {
              const a = (-135 + i * 27) * (Math.PI / 180);
              const x1 = 50 + 36 * Math.cos(a);
              const y1 = 50 + 36 * Math.sin(a);
              const x2 = 50 + 42 * Math.cos(a);
              const y2 = 50 + 42 * Math.sin(a);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a07040" strokeWidth={i % 5 === 0 ? 2 : 1} />;
            })}

            {/* Nhãn */}
            <text x="18" y="76" fill="#6b7280" fontSize="7" textAnchor="middle">0</text>
            <text x="50" y="12" fill="#6b7280" fontSize="7" textAnchor="middle">50</text>
            <text x="82" y="36" fill="#ef4444" fontSize="7" textAnchor="middle">100</text>

            {/* Kim chỉ */}
            <g transform={`rotate(${needleAngle + jitter}, 50, 50)`}>
              <line x1="50" y1="50" x2="50" y2="14" stroke={isRed ? '#ef4444' : isYellow ? '#f59e0b' : '#22c55e'} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="50" y1="50" x2="50" y2="57" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Tâm */}
            <circle cx="50" cy="50" r="4" fill="#B87333" stroke="#a07040" strokeWidth="1" />

            {/* Text chỉ số */}
            <text x="50" y="70" fill={isRed ? '#ef4444' : '#94a3b8'} fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
              {Math.round(displayedPressure)} PSI
            </text>
          </svg>
        </div>

        {/* Hiệu ứng kính phản chiếu */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

        {/* Steam puffs khi quá tải */}
        {isRed && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce blur-sm" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-white/30 rounded-full animate-bounce blur-sm" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce blur-sm" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Label */}
      <p className="text-center text-[10px] text-[#8C5523] font-mono mt-1 tracking-wider uppercase">Áp Kế</p>
    </div>
  );
};

export default PressureGauge;

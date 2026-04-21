import { useEffect, useRef, useState } from 'react';

/**
 * EngineerDesk - Bàn làm việc Kỹ sư
 * Chứa: Bản vẽ Archimedes + La bàn (xoay theo chuột) + Lăng kính (thay theme)
 */
const THEMES = [
  { name: 'Blueprint', bg: '#003366', filter: 'hue-rotate(0deg)' },
  { name: 'Crimson', bg: '#3b0a0a', filter: 'hue-rotate(20deg) saturate(1.3)' },
  { name: 'Viridian', bg: '#0a2d1a', filter: 'hue-rotate(100deg)' },
  { name: 'Violet', bg: '#1a0a3b', filter: 'hue-rotate(250deg)' },
  { name: 'Amber', bg: '#2d1a00', filter: 'hue-rotate(30deg) sepia(0.3)' },
];

const EngineerDesk = ({ workshopData, onStartMachine, activeGrade }) => {
  const [compassAngle, setCompassAngle] = useState(0);
  const [themeIdx, setThemeIdx] = useState(0);
  const [prismActive, setPrismActive] = useState(false);
  const [lensPos, setLensPos] = useState({ x: -200, y: -200 });
  const [showLens, setShowLens] = useState(false);
  const deskRef = useRef(null);
  const compassRef = useRef(null);

  // La bàn xoay theo vị trí chuột
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!compassRef.current) return;
      const rect = compassRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI) + 90;
      setCompassAngle(angle);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Thấu kính phóng to theo vị trí chuột trong vùng desk
  const handleDeskMouseMove = (e) => {
    if (!deskRef.current) return;
    const rect = deskRef.current.getBoundingClientRect();
    setLensPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setShowLens(true);
  };

  // Thay theme khi click lăng kính
  const handlePrismClick = () => {
    setPrismActive(true);
    const next = (themeIdx + 1) % THEMES.length;
    setThemeIdx(next);
    document.documentElement.style.setProperty('--page-filter', THEMES[next].filter);
    document.documentElement.style.setProperty('--page-bg', THEMES[next].bg);
    setTimeout(() => setPrismActive(false), 500);
  };

  const theme = THEMES[themeIdx];

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
      {/* Nền mặt bàn gỗ */}
      <div className="absolute inset-0 z-0"
        style={{
          background: `
            repeating-linear-gradient(88deg, rgba(92,61,30,0.15) 0px, rgba(60,38,16,0.08) 1px, transparent 1px, transparent 18px),
            repeating-linear-gradient(2deg, rgba(92,61,30,0.06) 0px, transparent 1px, transparent 25px),
            linear-gradient(180deg, #1a0e05 0%, #120a03 100%)
          `
        }}
      />
      {/* Blueprint grid overlay */}
      <div className="absolute inset-0 z-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(rgba(14,165,233,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,165,233,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* ─── MAIN CONTENT ROW ─── */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 lg:p-8 gap-6 relative z-10 overflow-hidden min-h-0">

        {/* ──── LEFT: Archimedes Schematic Panel ──── */}
        <div
          ref={deskRef}
          onMouseMove={handleDeskMouseMove}
          onMouseLeave={() => setShowLens(false)}
          className="flex-1 relative rounded-sm border border-[#0ea5e9]/20 bg-[#030d1a] shadow-[0_0_40px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden min-h-0 cursor-crosshair"
        >
          {/* Scanner line */}
          <div className="absolute top-0 w-full h-[1.5px] bg-cyan-400/60 shadow-[0_0_10px_cyan] z-20 pointer-events-none animate-[scanline_6s_ease-in-out_infinite]" />

          {/* Archimedes Lever SVG */}
          <svg viewBox="0 0 800 520" className="w-full h-full drop-shadow-[0_0_12px_rgba(255,140,0,0.5)]" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id="bg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0ea5e9" strokeWidth="0.4" opacity="0.25" />
              </pattern>
              <filter id="glow-orange">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="glow-blue">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            <rect width="100%" height="100%" fill="url(#bg-grid)" />

            {/* ── Mặt đất ── */}
            <line x1="60" y1="440" x2="740" y2="440" stroke="#FF8C00" strokeWidth="3" filter="url(#glow-orange)" />
            {[...Array(17)].map((_,i) => (
              <line key={i} x1={60 + i*42} y1="440" x2={50 + i*42} y2="460" stroke="#FF8C00" strokeWidth="1.5" opacity="0.5" />
            ))}

            {/* ── Điểm tựa (Fulcrum) ── */}
            <path d="M 340 440 L 420 440 L 380 330 Z" fill="none" stroke="#FF8C00" strokeWidth="4" strokeLinejoin="round" filter="url(#glow-orange)" />

            {/* ── Đòn bẩy ── */}
            <line x1="90" y1="190" x2="660" y2="430" stroke="#FF8C00" strokeWidth="9" strokeLinecap="round" filter="url(#glow-orange)" />
            {/* Texture highlights trên đòn bẩy */}
            <line x1="90" y1="185" x2="660" y2="425" stroke="#FFD700" strokeWidth="1.5" opacity="0.4" />

            {/* ── Trái Đất ── */}
            <circle cx="130" cy="130" r="90" fill="none" stroke="#FF8C00" strokeWidth="4" strokeDasharray="18 6" filter="url(#glow-orange)" />
            <ellipse cx="130" cy="130" rx="90" ry="30" fill="none" stroke="#FF8C00" strokeWidth="1.5" opacity="0.4" />
            <ellipse cx="130" cy="130" rx="30" ry="90" fill="none" stroke="#FF8C00" strokeWidth="1.5" opacity="0.4" />
            <text x="130" y="135" fill="#FF8C00" fontSize="14" textAnchor="middle" fontFamily="monospace" opacity="0.7">EARTH</text>
            {/* Nối đòn bẩy vào Trái Đất */}
            <line x1="90" y1="190" x2="130" y2="220" stroke="#FF8C00" strokeWidth="4" strokeDasharray="6 3" opacity="0.6" />

            {/* ── Người (Archimedes) đứng đầu kia ── */}
            <circle cx="620" cy="340" r="18" fill="none" stroke="#0ea5e9" strokeWidth="2" filter="url(#glow-blue)" />
            <line x1="620" y1="358" x2="620" y2="420" stroke="#0ea5e9" strokeWidth="3" />
            <line x1="590" y1="390" x2="650" y2="390" stroke="#0ea5e9" strokeWidth="2" />
            <line x1="620" y1="420" x2="595" y2="450" stroke="#0ea5e9" strokeWidth="2" />
            <line x1="620" y1="420" x2="645" y2="450" stroke="#0ea5e9" strokeWidth="2" />

            {/* ── Vectors ── */}
            <line x1="130" y1="270" x2="130" y2="230" stroke="#0ea5e9" strokeWidth="3" filter="url(#glow-blue)" />
            <polygon points="122,230 138,230 130,210" fill="#0ea5e9" />
            <text x="145" y="255" fill="#0ea5e9" fontSize="18" fontFamily="monospace" fontWeight="bold">W</text>

            <line x1="600" y1="440" x2="600" y2="400" stroke="#a3e635" strokeWidth="3" />
            <polygon points="592,400 608,400 600,380" fill="#a3e635" />
            <text x="615" y="425" fill="#a3e635" fontSize="18" fontFamily="monospace" fontWeight="bold">F</text>

            {/* ── Kích thước ── */}
            <line x1="130" y1="470" x2="380" y2="470" stroke="#FFD700" strokeWidth="1.5" strokeDasharray="5 3" />
            <text x="250" y="490" fill="#FFD700" fontSize="14" textAnchor="middle" fontFamily="monospace">L₁</text>
            <line x1="380" y1="470" x2="640" y2="470" stroke="#FFD700" strokeWidth="1.5" strokeDasharray="5 3" />
            <text x="510" y="490" fill="#FFD700" fontSize="14" textAnchor="middle" fontFamily="monospace">L₂</text>

            {/* ── Công thức ── */}
            <rect x="540" y="80" width="220" height="70" rx="4" fill="#0a0f18" stroke="#274dad" strokeWidth="1.5" />
            <text x="650" y="108" fill="#FF8C00" fontSize="15" textAnchor="middle" fontFamily="monospace">F × L₂ = W × L₁</text>
            <text x="650" y="130" fill="#FFD700" fontSize="12" textAnchor="middle" fontFamily="monospace" opacity="0.7">Principle of Leverage</text>
            <text x="650" y="148" fill="#0ea5e9" fontSize="11" textAnchor="middle" fontFamily="monospace" opacity="0.6">— Archimedes, 287 BC</text>

            {/* Title */}
            <text x="400" y="30" fill="#274dad" fontSize="13" textAnchor="middle" fontFamily="monospace" opacity="0.8" letterSpacing="3">SCHEMATIC 01: THE LEVER</text>
          </svg>

          {/* Magnifying Lens overlay */}
          {showLens && (
            <div
              className="absolute pointer-events-none z-30 w-24 h-24 rounded-full overflow-hidden border-4 border-[#274dad] shadow-[0_0_20px_rgba(184,115,51,0.8),inset_0_0_10px_rgba(0,0,0,0.5)]"
              style={{
                left: lensPos.x - 48,
                top: lensPos.y - 48,
                backdropFilter: 'contrast(1.2) brightness(1.15)',
                background: 'rgba(14,165,233,0.05)',
              }}
            >
              {/* Tia phản chiếu kính */}
              <div className="absolute top-2 left-2 w-6 h-1 bg-white/15 rounded-full rotate-[-30deg]" />
              <div className="absolute top-4 left-3 w-3 h-0.5 bg-white/10 rounded-full rotate-[-30deg]" />
            </div>
          )}
        </div>

        {/* ──── RIGHT: Workshop Info + Tools ──── */}
        <div className="lg:w-80 flex flex-col justify-between gap-4 flex-shrink-0">
          {/* Thông tin bác học */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_red] animate-pulse flex-shrink-0" />
              <span className="text-[#274dad] font-mono font-bold text-xs tracking-widest uppercase">Văn Phòng Vĩ Nhân</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-2 drop-shadow-[2px_2px_0_#274dad] leading-tight">
              {workshopData?.field || 'Cơ Học Sơ Cấp'}
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#274dad]/40 bg-[#2099e9]/10 rounded text-[#FFD700] text-xs font-mono mb-3">
              ⚙ Lớp {activeGrade} · {workshopData?.name || 'Archimedes'}
            </div>

            <div className="relative bg-[#000d1a] border-l-4 border-[#274dad] p-4 shadow-inner rounded-r">
              <div className="absolute -top-3 -left-3 w-6 h-6 text-[#274dad] opacity-50 text-2xl leading-none">"</div>
              <p className="text-base text-slate-300 italic leading-relaxed">
                {workshopData?.quote || '"Hãy cho tôi một điểm tựa, tôi sẽ nhấc bổng Trái Đất."'}
              </p>
            </div>
          </div>

          {/* ─── Dụng cụ trên bàn ─── */}
          <div className="flex items-end gap-4 justify-center py-2">
            {/* La bàn (xoay theo chuột) */}
            <div ref={compassRef} className="flex flex-col items-center gap-1 cursor-pointer group" title="La bàn — xoay theo hướng chuột">
              <div className="relative w-14 h-14">
                <svg viewBox="0 0 56 56" className="w-full h-full drop-shadow-[0_0_8px_rgba(184,115,51,0.5)]">
                  <circle cx="28" cy="28" r="26" fill="#0a0f18" stroke="#274dad" strokeWidth="3" />
                  <circle cx="28" cy="28" r="20" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 2" />
                  {/* N S E W */}
                  <text x="28" y="10" textAnchor="middle" fill="#ef4444" fontSize="7" fontFamily="monospace" fontWeight="bold">N</text>
                  <text x="28" y="52" textAnchor="middle" fill="#64748b" fontSize="6" fontFamily="monospace">S</text>
                  <text x="50" y="30" textAnchor="middle" fill="#64748b" fontSize="6" fontFamily="monospace">E</text>
                  <text x="6" y="30" textAnchor="middle" fill="#64748b" fontSize="6" fontFamily="monospace">W</text>
                  {/* Kim la bàn - xoay theo chuột */}
                  <g transform={`rotate(${compassAngle}, 28, 28)`}>
                    <polygon points="28,8 25,28 28,32 31,28" fill="#ef4444" />
                    <polygon points="28,48 25,28 28,24 31,28" fill="#e2e8f0" />
                  </g>
                  <circle cx="28" cy="28" r="3" fill="#274dad" />
                </svg>
              </div>
              <span className="text-[9px] text-[#475569] font-mono uppercase">La Bàn</span>
            </div>

            {/* Lăng kính (thay theme) */}
            <div onClick={handlePrismClick} className="flex flex-col items-center gap-1 cursor-pointer group" title={`Lăng kính — Click để đổi theme (${theme.name})`}>
              <div className={`relative w-14 h-14 transition-all duration-300 ${prismActive ? 'scale-110' : 'hover:scale-105'}`}>
                <svg viewBox="0 0 56 56" className="w-full h-full drop-shadow-[0_0_12px_rgba(167,139,250,0.6)]">
                  {/* Lăng kính tam giác */}
                  <path d="M 28 10 L 8 46 L 48 46 Z" fill="none" stroke="#a78bfa" strokeWidth="2.5" />
                  {/* Ánh sáng tán sắc */}
                  <line x1="28" y1="10" x2="8" y2="46" stroke="#818cf8" strokeWidth="1.5" opacity="0.5" />
                  {['#ef4444','#f97316','#facc15','#4ade80','#38bdf8','#a78bfa'].map((c, i) => (
                    <line key={i} x1={48} y1={46} x2={54} y2={44 - i * 5} stroke={c} strokeWidth="2.5" opacity="0.8" />
                  ))}
                  {/* Tia sáng vào */}
                  <line x1="16" y1="22" x2="28" y2="28" stroke="white" strokeWidth="1.5" opacity="0.6" />
                  <circle cx="28" cy="28" r="2" fill="#a78bfa" />
                </svg>
              </div>
              <span className="text-[9px] text-[#475569] font-mono uppercase">Lăng Kính</span>
              <span className={`text-[8px] font-mono ${prismActive ? 'text-purple-400' : 'text-slate-600'}`}>{theme.name}</span>
            </div>

            {/* Thước kẹp */}
            <div className="flex flex-col items-center gap-1 cursor-pointer group" title="Thước kẹp Vernier">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg viewBox="0 0 60 40" className="w-full h-auto drop-shadow-md">
                  {/* Thân thước */}
                  <rect x="2" y="15" width="56" height="10" rx="2" fill="none" stroke="#274dad" strokeWidth="2" />
                  {/* Vạch chia */}
                  {[...Array(12)].map((_,i) => (
                    <line key={i} x1={4 + i*5} y1="15" x2={4 + i*5} y2={i%4===0 ? 10 : 12} stroke="#274dad" strokeWidth="1" />
                  ))}
                  {/* Hàm đo */}
                  <rect x="2" y="10" width="6" height="25" rx="1" fill="#2099e9" stroke="#274dad" strokeWidth="1.5" />
                  <rect x="28" y="10" width="5" height="22" rx="1" fill="#475569" stroke="#64748b" strokeWidth="1.5" />
                  {/* Đầu đo */}
                  <line x1="2" y1="35" x2="8" y2="35" stroke="#274dad" strokeWidth="2" />
                  <line x1="28" y1="32" x2="33" y2="32" stroke="#64748b" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-[9px] text-[#475569] font-mono uppercase">Thước Kẹp</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0% { top: 0; opacity: 0.1; }
          50% { top: calc(100% - 2px); opacity: 0.8; }
          100% { top: 0; opacity: 0.1; }
        }
      `}</style>
    </div>
  );
};

export default EngineerDesk;


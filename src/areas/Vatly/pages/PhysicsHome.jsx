import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import {
  ChevronRight, Swords, FlaskConical, BookOpen,
  CircuitBoard, Target, Shield, TrendingUp, Microscope, Compass, CheckCircle2, Play, Map,
  Sparkles, GraduationCap, School, Users
} from 'lucide-react';
import physicsBanner from '../../../assets/images/physics_banner.png';
import heroMaster from '../../../assets/images/hero_master.png';
import utilLab from '../../../assets/images/util_lab.png';
import utilArena from '../../../assets/images/util_arena.png';
import utilJourney from '../../../assets/images/util_journey.png';
import utilLectures from '../../../assets/images/util_lectures.png';

/* ────────────────────────────────────────────
   CON QUAY HỒI CHUYỂN (ASTROLABE PROFESSION)
   ──────────────────────────────────────────── */
const GoldenGyroscope = () => {
  const outerRing = useRef(null);
  const midRing = useRef(null);
  const innerRing = useRef(null);
  const core = useRef(null);

  useEffect(() => {
    let raf;
    let a1 = 0, a2 = 0, a3 = 0, a4 = 0;
    const tick = () => {
      a1 += 0.2; // degrees
      a2 -= 0.3;
      a3 += 0.45;
      a4 -= 0.6;

      if (outerRing.current) outerRing.current.style.transform = `rotateX(65deg) rotateY(15deg) rotateZ(${a1}deg)`;
      if (midRing.current) midRing.current.style.transform = `rotateX(45deg) rotateY(-20deg) rotateZ(${a2}deg)`;
      if (innerRing.current) innerRing.current.style.transform = `rotateX(75deg) rotateY(30deg) rotateZ(${a3}deg)`;
      if (core.current) core.current.style.transform = `rotateY(${a4}deg) rotateX(${a4 * 0.5}deg)`;

      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative flex items-center justify-center scale-110 group" style={{ perspective: '1200px' }}>
      {/* Background ambient glow */}
      <div className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-20 pointer-events-none bg-gradient-to-tr from-[#D4AF37] via-[#B87333] to-transparent group-hover:opacity-40 transition-opacity duration-1000" />

      <div className="relative w-72 h-72 transition-transform duration-1000 ease-out group-hover:scale-105" style={{ transformStyle: 'preserve-3d' }}>

        {/* Core Energy Sphere */}
        <div ref={core} className="absolute inset-[38%] rounded-full bg-gradient-to-br from-[#FDFCF8] via-[#D4AF37] to-[#4A3728] shadow-[0_0_40px_rgba(212,175,55,0.7),inset_0_0_20px_rgba(255,255,255,0.9)] flex items-center justify-center after:content-[''] after:absolute after:inset-0 after:rounded-full after:border after:border-white/50 after:blur-[1px]" style={{ transformStyle: 'preserve-3d' }}>
          <Compass className="w-8 h-8 text-[#4A3728]/40 absolute z-10" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent rounded-full animate-pulse" />
        </div>

        {/* Outer Ring & Degree Ticks */}
        <div ref={outerRing} className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          <svg className="w-full h-full drop-shadow-[0_10px_20px_rgba(184,115,51,0.2)]" viewBox="0 0 100 100" fill="none">
            {/* Outer track */}
            <circle cx="50" cy="50" r="48" stroke="url(#brassOuter)" strokeWidth="1" strokeDasharray="3 4" strokeLinecap="round" className="opacity-80" />
            {/* Inner track */}
            <circle cx="50" cy="50" r="45" stroke="#4A3728" strokeWidth="0.5" className="opacity-50" />
            <circle cx="50" cy="50" r="49.5" stroke="#D4AF37" strokeWidth="0.25" className="opacity-60" />
            {/* Tick marks representing degrees/measurement */}
            {[...Array(36)].map((_, i) => (
              <line
                key={i}
                x1="50" y1="2" x2="50" y2={i % 3 === 0 ? "6" : "4"}
                transform={`rotate(${i * 10} 50 50)`}
                stroke={i % 3 === 0 ? "#8C5523" : "#D4AF37"}
                strokeWidth={i % 3 === 0 ? "0.6" : "0.3"}
              />
            ))}
            <defs>
              <linearGradient id="brassOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="25%" stopColor="#FFF1B8" />
                <stop offset="50%" stopColor="#8C5523" />
                <stop offset="75%" stopColor="#FFF1B8" />
                <stop offset="100%" stopColor="#4A3728" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Middle Ring with Satellite Nodes */}
        <div ref={midRing} className="absolute inset-5" style={{ transformStyle: 'preserve-3d' }}>
          <svg className="w-full h-full drop-shadow-[0_0_15px_rgba(184,115,51,0.3)]" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="46" stroke="url(#brassMid)" strokeWidth="2.5" className="opacity-90" />
            <circle cx="50" cy="50" r="46" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="1 10" className="opacity-50" />

            {/* Planet/nodes along the middle ring */}
            <circle cx="50" cy="4" r="2.5" fill="url(#nodeGlow)" />
            <circle cx="50" cy="96" r="2.5" fill="url(#nodeGlow)" />
            <circle cx="16" cy="16" r="1.5" fill="#B87333" />
            <circle cx="84" cy="84" r="1.5" fill="#B87333" />

            <defs>
              <linearGradient id="brassMid" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F8F4EF" />
                <stop offset="40%" stopColor="#B87333" />
                <stop offset="100%" stopColor="#2A1B12" />
              </linearGradient>
              <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#8C5523" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Inner Tracking Ring with Data Lines */}
        <div ref={innerRing} className="absolute inset-12" style={{ transformStyle: 'preserve-3d' }}>
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="48" stroke="#D4AF37" strokeWidth="1" className="opacity-70" />
            <circle cx="50" cy="50" r="40" stroke="#8C5523" strokeWidth="0.5" strokeDasharray="6 4" className="opacity-90" />

            {/* Crosshairs */}
            <path d="M50 2 L50 98 M2 50 L98 50" stroke="url(#crosshair)" strokeWidth="0.5" className="opacity-60" />
            <defs>
              <linearGradient id="crosshair" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="40%" stopColor="#D4AF37" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>

          {/* Orbital Electron / Tracker point */}
          <div className="absolute top-0 left-1/2 w-3 h-3 -mt-1.5 -ml-1.5 rounded-full bg-white shadow-[0_0_15px_2px_#D4AF37]" style={{ transform: 'translateZ(10px)' }} />
          <div className="absolute bottom-1/4 right-0 w-2 h-2 rounded-full bg-[#B87333] shadow-[0_0_10px_1px_#8C5523]" style={{ transform: 'translateZ(-10px)' }} />
        </div>
      </div>

      {/* Decorative Floating Horizon Line */}
      <div className="absolute top-1/2 left-[-20%] right-[-20%] h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent pointer-events-none -translate-y-1/2" />
    </div>
  );
};



/* ────────────────────────────────────────────
   MAIN
   ──────────────────────────────────────────── */
import EurekaPremiumLogo from '../../../components/ui/EurekaPremiumLogo';

/* ────────────────────────────────────────────
   MAIN
   ──────────────────────────────────────────── */
const PhysicsHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [activeGrade, setActive] = useState(10);

  useEffect(() => {
    const init = async () => {
      setGrades([6, 7, 8, 9, 10, 11, 12].map(g => ({ grade: g })));
      setActive(user?.profile?.grade ?? 10);
      setTimeout(() => setLoading(false), 600);
    };
    init();
  }, [user]);

  const handleAction = (path) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#FDFCF8] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-[#E5E7EB] border-t-[#B87333] rounded-full animate-spin" />
        <p className="text-[#8C5523] font-black tracking-widest text-sm uppercase">Khởi động bộ máy...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#FDFCF8] font-sans overflow-x-hidden min-h-screen selection:bg-[#B87333]/20 selection:text-[#4A3728]">

      {/* ══════════════════════════════════════════
          HERO — EUREKA BRANDING
          ══════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#FDFCF8] pt-4 pb-12 px-4">

        {/* Academic Background - Formulas & Sketches */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.12] select-none">
          {/* Subtle Grid */}
          <div className="absolute inset-0 graph-grid" />

          {/* Floating Physics Sketches (Text-based for now) */}
          <div className="absolute top-[15%] left-[10%] text-[100px] font-serif italic text-[#8C5523] rotate-[-15deg] opacity-40">F = ma</div>
          <div className="absolute top-[20%] right-[15%] text-[80px] font-serif italic text-[#8C5523] rotate-[10deg] opacity-30">∇ × E = -∂B/∂t</div>
          <div className="absolute bottom-[25%] left-[20%] text-[90px] font-serif italic text-[#8C5523] rotate-[5deg] opacity-25">PV = nRT</div>
          <div className="absolute bottom-[15%] right-[10%] text-[110px] font-serif italic text-[#8C5523] rotate-[-10deg] opacity-35">λ = h/p</div>

          {/* Decorative Gradient Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[160px] bg-gradient-to-tr from-[#B87333]/10 via-[#D4AF37]/5 to-transparent animate-pulse-slow" />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">

          {/* Header Row: Logo + Brand Group (Visual Parity) */}
          <div className="flex flex-col items-center justify-center mb-[-6rem] animate-fade-in-up transition-all hover:scale-105 duration-1000">
            <EurekaPremiumLogo className="h-64 sm:h-80 md:h-[28rem]" />
          </div>

          {/* Description Row: Centered Heading */}
          <div className="max-w-4xl text-center mb-20 animate-fade-in-up animation-delay-200">
            <h2 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-black text-[#374151] leading-[1.3]">
              Nền tảng học thuật Vật lý số 1 kết hợp <br />
              mô phỏng tương tác và thi đấu trực tuyến.
            </h2>
          </div>

          {/* Action Row: Centered Buttons (Pill style matching reference) */}
          <div className="flex flex-wrap justify-center gap-6 animate-fade-in-up animation-delay-300">
            <button
              onClick={() => handleAction(`/physics-class/${activeGrade}`)}
              className="px-14 py-5 rounded-full bg-[#82C91E] text-white font-black text-xl shadow-[0_15px_30px_-10px_rgba(130,201,30,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(130,201,30,0.6)] hover:-translate-y-1 active:scale-95 transition-all"
            >
              Vào Lớp Học &rarr;
            </button>
            <button
              onClick={() => handleAction('/vatly/virtual-lab')}
              className="px-14 py-5 rounded-full bg-white text-[#1E293B] font-black text-xl shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] hover:-translate-y-1 active:scale-95 transition-all border border-slate-100"
            >
              Vào Phòng Lab
            </button>
          </div>
        </div>

        {/* Floating Background Particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] w-2 h-2 rounded-full bg-[#10B981] animate-float-slow opacity-20" />
          <div className="absolute top-[40%] right-[20%] w-3 h-3 rounded-full bg-[#B87333] animate-float-medium opacity-15" />
          <div className="absolute bottom-[30%] left-[25%] w-2 h-2 rounded-full bg-[#D4AF37] animate-float-fast opacity-20" />
          <div className="absolute bottom-[10%] right-[40%] w-4 h-4 rounded-full bg-[#10B981] animate-float-slow opacity-10" />
        </div>
      </section>



      {/* ══════════════════════════════════════════
          FEATURE BANNERS — Split Layout
          ══════════════════════════════════════════ */}
      {[
        {
          title: 'Lộ trình học tập',
          highlight: 'Trực tuyến bài bản',
          desc: 'Từ kiến thức cơ bản của Vật lý 6 đến các chuyên đề nâng cao của Vật lý 12. Nội dung được số hóa thành các bài học tương tác tinh tiến, rèn giữa cả lý thuyết và bài tập.',
          cta: 'Khám phá Lớp học',
          img: physicsBanner,
          path: `/physics-classes`,
          accentColor: '#10B981',
        },
        {
          title: 'Phòng thí nghiệm',
          highlight: 'Ảo 3D tương tác',
          desc: 'Mô phỏng đồ họa 3D chân thực, chuẩn xác. Thực hành các thí nghiệm Vật lý kinh điển ngay trên trình duyệt với giao diện trực quan và kết quả thời gian thực.',
          cta: 'Vào phòng Lab',
          img: utilLab,
          path: '/vatly/virtual-lab',
          accentColor: '#3B82F6',
        },
        {
          title: 'Đấu trường',
          highlight: 'PK trực tuyến',
          desc: 'Sân chơi trí tuệ, mài giũa tư duy. Thi đấu online theo thời gian thực với bạn bè hoặc đối thủ ngẫu nhiên, chinh phục bảng xếp hạng toàn quốc.',
          cta: 'Tham gia ngay',
          img: utilArena,
          path: '/pk-battle',
          accentColor: '#EF4444',
        },
        {
          title: 'Hành trình',
          highlight: 'Chinh phục kiến thức',
          desc: 'Phiêu lưu qua các chương trình học theo hình thức game nhập vai. Thu thập thành tựu, mở khóa cấp độ mới và ghi danh bảng vàng cùng cộng đồng học tập.',
          cta: 'Bắt đầu hành trình',
          img: utilJourney,
          path: '/game-journey',
          accentColor: '#8B5CF6',
        },
        {
          title: 'Bài giảng tương tác',
          highlight: 'Trực quan & sinh động',
          desc: 'Lý thuyết được trình bày qua các slide tương tác, video minh họa và câu hỏi kiểm tra ngay trong bài. Học mọi lúc, mọi nơi với nội dung chuẩn chương trình.',
          cta: 'Xem bài giảng',
          img: utilLectures,
          path: '/interactive-lectures',
          accentColor: '#6366F1',
        },
      ].map((feature, idx) => {
        const isReversed = idx % 2 !== 0;
        return (
          <section
            key={idx}
            className={`py-20 sm:py-24 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FDFCF8]'} border-t border-[#E5E7EB]/60 overflow-hidden`}
          >
            <div className="container mx-auto max-w-6xl px-4 sm:px-6">
              <div className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}>

                {/* Text Side */}
                <div className="w-full lg:w-1/2 space-y-6">
                  <h2 className="text-3xl sm:text-[2.5rem] font-black text-[#1E293B] leading-[1.15] tracking-tight">
                    {feature.title}<br />
                    <span style={{ color: feature.accentColor }}>{feature.highlight}</span>
                  </h2>
                  <p className="text-slate-500 font-medium leading-relaxed text-[15px] max-w-lg">
                    {feature.desc}
                  </p>
                  <button
                    onClick={() => handleAction(feature.path)}
                    className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#1E293B] text-white font-black text-sm hover:bg-[#0F172A] transition-colors shadow-lg hover:shadow-xl active:scale-[0.97]"
                  >
                    {feature.cta}
                    <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </button>
                </div>

                {/* Image Side */}
                <div className="w-full lg:w-1/2 flex justify-center">
                  <div className="relative w-full max-w-md">
                    <div
                      className="absolute -inset-4 rounded-[2rem] opacity-20 blur-[40px] pointer-events-none"
                      style={{ background: feature.accentColor }}
                    />
                    <div className="relative rounded-[1.5rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] border-4 border-white group">
                      <img
                        src={feature.img}
                        alt={feature.title}
                        className="w-full h-auto aspect-[4/3] object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/10 pointer-events-none" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        );
      })}

    </div>
  );
};

export default PhysicsHome;

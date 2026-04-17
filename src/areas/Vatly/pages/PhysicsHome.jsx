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
const PhysicsHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [activeGrade, setActive] = useState(10);

  const scientists = { 6: 'Newton', 7: 'Archimedes', 8: 'Pascal', 9: 'Faraday', 10: 'Einstein', 11: 'Bohr', 12: 'Maxwell' };
  const formulas = {
    6: 'F = ma', 7: '"Cho tôi một điểm tựa..."',
    8: 'P = F/S', 9: 'B = μ₀ I / 2πr', 10: 'E = mc²', 11: 'E = hf', 12: '∇·B = 0'
  };
  const subjects = { 6: 'Cơ Học Cơ Bản', 7: 'Cơ Học Sơ Cấp', 8: 'Cơ Học Nâng Cao', 9: 'Điện Từ Học', 10: 'Cơ Học Hiện Đại', 11: 'Lượng Tử', 12: 'Điện Từ Trường' };

  useEffect(() => {
    const init = async () => {
      if (!user) { navigate('/login'); return; }
      setGrades([6, 7, 8, 9, 10, 11, 12].map(g => ({ grade: g })));
      setActive(user?.profile?.grade ?? 10);
      setTimeout(() => setLoading(false), 600);
    };
    init();
  }, [user, navigate]);

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
          HERO — INTEGRATED JOURNEY BANNER
          ══════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#FDFCF8]">
        {/* Master Background Image with Blur/Fade */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src={heroMaster}
            alt="Academy Background"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDFCF8] via-transparent to-[#FDFCF8]" />
        </div>

        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 graph-grid opacity-[0.15] pointer-events-none" />
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none bg-[#B87333]/5 animate-pulse-slow" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none bg-[#D4AF37]/5 animate-pulse-slow" />

        <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left Content (Moved from Section 1) */}
            <div className="w-full lg:w-3/5 space-y-8 animate-fade-in-up">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#B87333]/20 text-[#8C5523] font-black text-[10px] tracking-[0.2em] uppercase mb-6 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" /> Học qua chơi - Vui là chính!
                </div>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#1E293B] leading-[1.1] mb-6 tracking-tight">
                  Hành trình học tập<br />
                  kỳ diệu cùng
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8C5523] to-[#D4AF37]"> Vật lý</span> hiện đại
                </h1>
                <p className="text-slate-500 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl">
                  Khám phá thế giới qua các định luật vận hành vũ trụ, từ những hạt cơ bản đến các thiên hà xa xôi thông qua các thí nghiệm tương tác 3D.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate(`/physics-class/${activeGrade}`)}
                  className="pg-btn-brass px-8 py-4 text-base flex items-center gap-3 shadow-[0_10px_25px_-5px_rgba(184,115,51,0.4)]"
                >
                  Bắt đầu học <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/vatly/virtual-lab')}
                  className="px-8 py-4 rounded-2xl bg-white border-2 border-[#E5E7EB] text-[#4A3728] font-black text-base hover:border-[#B87333]/30 hover:bg-[#F8F4EF] transition-all"
                >
                  Khám phá phòng Lab
                </button>
              </div>

              {/* Quick Stats Bar */}
              <div className="pt-8 border-t border-[#E5E7EB]/50 flex flex-wrap gap-8 sm:gap-12">
                {[
                  { label: 'Học sinh', value: '12,500+', icon: GraduationCap },
                  { label: 'Giáo viên', value: '200+', icon: Users },
                  { label: 'Trường học', value: '50+', icon: School }
                ].map((stat, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-2xl font-black text-[#1E293B] tracking-tight">{stat.value}</span>
                    <span className="text-[10px] font-black text-slate-400 tracking-[0.1em] uppercase flex items-center gap-1.5">
                      <stat.icon className="w-3 h-3 text-[#B87333]" />
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Image/Banner (Moved from Section 1) */}
            <div className="w-full lg:w-2/5 relative animate-fade-in-right">
              {/* Decorative Frame */}
              <div className="absolute -inset-4 border border-[#B87333]/10 rounded-[2.5rem] pointer-events-none" />
              <div className="absolute -inset-2 border border-[#B87333]/20 rounded-[2rem] pointer-events-none" />

              <div className="relative rounded-[1.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(184,115,51,0.25)] border-4 border-white group">
                <img
                  src={physicsBanner}
                  alt="Physics Journey"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-1000"
                />
                {/* Glass coating overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#B87333]/5 via-transparent to-white/10 pointer-events-none" />

                {/* Floating academic icon */}
                <div className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/50">
                  <BookOpen className="w-6 h-6 text-[#B87333]" />
                </div>
              </div>

              {/* Extra decorative element */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-[#E5E7EB] animate-bounce-slow">
                <FlaskConical className="w-10 h-10 text-[#B87333]/60" />
              </div>
            </div>

          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 animate-bounce">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Khám phá</span>
          <ChevronRight className="w-4 h-4 rotate-90 text-[#B87333]" />
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
                    onClick={() => navigate(feature.path)}
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

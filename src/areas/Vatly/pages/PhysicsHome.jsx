import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import {
  ChevronRight, Swords, FlaskConical, BookOpen,
  CircuitBoard, Target, Shield, TrendingUp, Microscope, Compass, CheckCircle2, Play, Map,
  Sparkles, GraduationCap, School, Users, Magnet, Zap, Activity, Orbit, Cpu
} from 'lucide-react';
import SpacetimeGrid from '../../../components/animations/SpacetimeGrid';

// Feature Images
import utilLab from '../../../assets/images/feature_lab.png';
import utilArena from '../../../assets/images/feature_arena.png';
import utilJourney from '../../../assets/images/feature_journey.jpg';
import utilLectures from '../../../assets/images/feature_lectures.jpg';

/* ────────────────────────────────────────────
   CON QUAY HỒI CHUYỂN (GOLDEN GYROSCOPE)
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
      <div className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-20 pointer-events-none bg-gradient-to-tr from-[#44b5d7] via-[#274dad] to-transparent group-hover:opacity-40 transition-opacity duration-1000" />
      <div className="relative w-72 h-72 transition-transform duration-1000 ease-out group-hover:scale-105" style={{ transformStyle: 'preserve-3d' }}>
        <div ref={core} className="absolute inset-[38%] rounded-full bg-gradient-to-br from-[#FFFFFF] via-[#44b5d7] to-[#4A3728] shadow-[0_0_40px_rgba(212,175,55,0.7),inset_0_0_20px_rgba(255,255,255,0.9)] flex items-center justify-center after:content-[''] after:absolute after:inset-0 after:rounded-full after:border after:border-white/50 after:blur-[1px]" style={{ transformStyle: 'preserve-3d' }}>
          <Compass className="w-8 h-8 text-[#4A3728]/40 absolute z-10" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent rounded-full animate-pulse" />
        </div>
        <div ref={outerRing} className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          <svg className="w-full h-full drop-shadow-[0_10px_20px_rgba(184,115,51,0.25)]" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="48" stroke="url(#brassOuter)" strokeWidth="1" strokeDasharray="3 4" strokeLinecap="round" className="opacity-80" />
            <circle cx="50" cy="50" r="45" stroke="#4A3728" strokeWidth="0.5" className="opacity-50" />
            <circle cx="50" cy="50" r="49.5" stroke="#44b5d7" strokeWidth="0.25" className="opacity-60" />
            {[...Array(36)].map((_, i) => (
              <line key={i} x1="50" y1="2" x2="50" y2={i % 3 === 0 ? "6" : "4"} transform={`rotate(${i * 10} 50 50)`} stroke={i % 3 === 0 ? "#2099e9" : "#44b5d7"} strokeWidth={i % 3 === 0 ? "0.6" : "0.3"} />
            ))}
            <defs>
              <linearGradient id="brassOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#44b5d7" /><stop offset="25%" stopColor="#FFF1B8" /><stop offset="50%" stopColor="#2099e9" /><stop offset="75%" stopColor="#FFF1B8" /><stop offset="100%" stopColor="#4A3728" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div ref={midRing} className="absolute inset-5" style={{ transformStyle: 'preserve-3d' }}>
          <svg className="w-full h-full drop-shadow-[0_0_15px_rgba(184,115,51,0.3)]" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="46" stroke="url(#brassMid)" strokeWidth="2.5" className="opacity-90" />
            <circle cx="50" cy="50" r="46" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="1 10" className="opacity-50" />
            <circle cx="50" cy="4" r="2.5" fill="url(#nodeGlow)" /><circle cx="50" cy="96" r="2.5" fill="url(#nodeGlow)" />
            <defs>
              <linearGradient id="brassMid" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e4f2f0" /><stop offset="40%" stopColor="#274dad" /><stop offset="100%" stopColor="#2A1B12" />
              </linearGradient>
              <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" /><stop offset="50%" stopColor="#44b5d7" /><stop offset="100%" stopColor="#2099e9" />
              </radialGradient>
            </defs>
          </svg>
        </div>
        <div ref={innerRing} className="absolute inset-12" style={{ transformStyle: 'preserve-3d' }}>
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="48" stroke="#44b5d7" strokeWidth="1" className="opacity-70" />
            <circle cx="50" cy="50" r="40" stroke="#2099e9" strokeWidth="0.5" strokeDasharray="6 4" className="opacity-90" />
            <path d="M50 2 L50 98 M2 50 L98 50" stroke="url(#crosshair)" strokeWidth="0.5" className="opacity-60" />
            <defs>
              <linearGradient id="crosshair" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="transparent" /><stop offset="40%" stopColor="#44b5d7" /><stop offset="60%" stopColor="#44b5d7" /><stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute top-0 left-1/2 w-3 h-3 -mt-1.5 -ml-1.5 rounded-full bg-white shadow-[0_0_15px_2px_#44b5d7]" style={{ transform: 'translateZ(10px)' }} />
        </div>
      </div>
      <div className="absolute top-1/2 left-[-20%] right-[-20%] h-[1px] bg-gradient-to-r from-transparent via-[#44b5d7]/30 to-transparent pointer-events-none -translate-y-1/2" />
    </div>
  );
};

/* ────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────── */
const PhysicsHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeGrade, setActive] = useState(10);

  useEffect(() => {
    setActive(user?.profile?.grade ?? 10);
    setTimeout(() => setLoading(false), 600);
  }, [user]);

  const handleAction = (path) => {
    if (!user) navigate('/login');
    else navigate(path);
  };

  if (loading) return (
    <div className="h-screen bg-[#FFFFFF] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-[#E5E7EB] border-t-[#274dad] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-[#FFFFFF] font-sans overflow-x-hidden min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-32 pb-32 px-6">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-indigo-50/30 rounded-full blur-[120px]" />
           <div className="absolute inset-0 physics-field-grid opacity-20" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center">
          

          <h1 className="font-premium-serif text-[15vw] sm:text-[12rem] font-bold text-slate-900 italic leading-none tracking-tighter mb-4 select-none">
            Eureka
          </h1>
          
          <p className="text-xl md:text-2xl font-medium text-slate-400 tracking-tight leading-relaxed max-w-3xl mb-16">
            Kiến tạo tương lai qua <span className="text-indigo-600 font-black">Vật lý mô phỏng</span>. <br />
            Trải nghiệm học tập chuẩn mực trong hệ sinh thái 3D đỉnh cao.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <button
              onClick={() => handleAction(`/physics-class/${activeGrade}`)}
              className="group relative px-12 py-6 rounded-full bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] overflow-hidden shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <div className="relative z-10 flex items-center gap-4">
                 BẮT ĐẦU NGAY
                 <ChevronRight size={16} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <button
              onClick={() => handleAction('/vatly/virtual-lab')}
              className="px-12 py-6 rounded-full bg-white text-slate-900 font-black text-xs uppercase tracking-[0.3em] border border-slate-100 hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              PHÒNG LAB ẢO
            </button>
          </div>

          {/* Fundamental Constants */}
          <div className="absolute bottom-12 flex items-center gap-12 opacity-30">
             <div className="physics-annotation">c = 299,792,458 m/s</div>
             <div className="physics-annotation">G = 6.674×10⁻¹¹</div>
             <div className="physics-annotation">h = 6.626×10⁻³⁴</div>
          </div>
        </div>
      </section>

      {/* Bento Feature Grid */}
      <section className="py-32 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
             <div className="physics-annotation text-indigo-600 tracking-[0.4em] mb-4 uppercase text-[10px]">Platform Features</div>
             <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">Tương tác với <span className="text-indigo-600">Vật lý</span> theo cách hoàn toàn mới.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[30rem]">
            {/* Virtual Lab */}
            <div className="md:col-span-2 relative rounded-[3rem] bg-slate-900 overflow-hidden group cursor-pointer hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-700" onClick={() => handleAction('/vatly/virtual-lab')}>
               <img src={utilLab} alt="Virtual Lab" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2s] ease-out" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
               <div className="relative h-full p-12 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                     <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white shadow-xl"><Microscope size={32} /></div>
                     <div className="physics-annotation text-white/50 tracking-[0.3em]">SCIENTIFIC PRECISION</div>
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-5xl font-black text-white tracking-tighter">Phòng thí nghiệm Ảo</h3>
                     <p className="text-white/60 font-medium max-w-md text-lg leading-relaxed">Môi trường giả lập 3D với độ trễ bằng không và độ chính xác tuyệt đối trong từng phép tính.</p>
                  </div>
               </div>
            </div>

            {/* Arena */}
            <div className="relative rounded-[3rem] bg-slate-100 overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-700" onClick={() => handleAction('/pk-battle')}>
               <img src={utilArena} alt="Arena" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-[2s] ease-out" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
               <div className="relative h-full p-10 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                     <div className="w-14 h-14 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg"><Swords size={28} /></div>
                     <div className="physics-annotation text-white/70">LIVE PK</div>
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-3xl font-black text-white tracking-tight">Đấu trường</h3>
                     <p className="text-white/80 text-sm font-medium leading-relaxed">Thi đấu đối kháng thời gian thực. Chinh phục bảng xếp hạng và chứng minh tư duy vật lý sắc bén.</p>
                  </div>
               </div>
            </div>

            {/* Learning Path */}
            <div className="relative rounded-[3rem] bg-white border border-slate-100 overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-700" onClick={() => handleAction('/physics-classes')}>
               <img src={utilJourney} alt="Learning Path" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-[2s] ease-out" />
               <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-transparent" />
               <div className="relative h-full p-10 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                     <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg"><GraduationCap size={28} /></div>
                     <div className="physics-annotation text-slate-400">CURRICULUM</div>
                  </div>
                  <div className="space-y-4 pt-12">
                     <h3 className="text-3xl font-black text-slate-900 tracking-tight">Lộ trình học</h3>
                     <p className="text-slate-600 text-sm font-medium leading-relaxed">Chương trình cá nhân hóa từ lớp 6 đến lớp 12 theo chuẩn giáo dục hiện đại và toàn diện.</p>
                  </div>
               </div>
            </div>

            {/* Lectures */}
            <div className="md:col-span-2 relative rounded-[3rem] bg-indigo-600 overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-700" onClick={() => handleAction('/interactive-lectures')}>
               <img src={utilLectures} alt="Interactive Lectures" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-[2s] ease-out" />
               <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-indigo-900/40 to-transparent" />
               <div className="relative h-full p-12 flex items-center z-10">
                  <div className="flex-1 space-y-6">
                     <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-3xl flex items-center justify-center text-white border border-white/30 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                        <Play fill="currentColor" size={24} className="ml-1" />
                     </div>
                     <h3 className="text-5xl font-black text-white tracking-tighter">Bài giảng Tương tác</h3>
                     <p className="text-white/70 font-medium max-w-md text-lg leading-relaxed">Hình ảnh hóa các định luật phức tạp thông qua các câu chuyện thị giác sinh động và tương tác trực tiếp.</p>
                  </div>
                  <div className="hidden lg:block w-px h-1/2 bg-white/20 mx-12" />
                  <div className="hidden lg:flex flex-col gap-8 text-white/40 font-black text-[10px] uppercase tracking-[0.4em]">
                     <div className="hover:text-white transition-colors">Visual Storytelling</div>
                     <div className="hover:text-white transition-colors">Real-time Data</div>
                     <div className="hover:text-white transition-colors">Instant Feedback</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacetime Grid Feature Section */}
      <section className="relative z-10 bg-slate-950 overflow-hidden min-h-[700px] flex items-center py-24">
        {/* Interactive Spacetime Canvas */}
        <SpacetimeGrid />
        
        {/* Foreground Content */}
        <div className="container mx-auto px-4 relative z-20 pointer-events-none">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Bẻ cong <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                mọi giới hạn
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-indigo-100/70 mb-16 font-light max-w-2xl mx-auto drop-shadow-md">
              Không gian học tập nơi kiến thức không còn là những dòng chữ khô khan. Tương tác với môi trường, kiểm chứng định luật và khai phá tư duy đa chiều.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 text-center pointer-events-none">
               <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                 <Orbit className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
                 <div className="text-2xl font-black text-white mb-2">Mô phỏng 3D</div>
                 <div className="text-sm font-medium text-indigo-200/60">Tương tác vật lý thực tế</div>
               </div>
               
               <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden transform md:-translate-y-4">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                 <Cpu className="w-10 h-10 text-purple-400 mx-auto mb-4" />
                 <div className="text-2xl font-black text-white mb-2">Trợ lý AI</div>
                 <div className="text-sm font-medium text-purple-200/60">Hỗ trợ giải đáp 24/7</div>
               </div>

               <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                 <Zap className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                 <div className="text-2xl font-black text-white mb-2">120Hz Core</div>
                 <div className="text-sm font-medium text-cyan-200/60">Tính toán chính xác tuyệt đối</div>
               </div>
            </div>
          </div>
        </div>
        
        {/* Gradient transition to white/slate-900 at the bottom to flow smoothly to CTA */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-b from-transparent to-white pointer-events-none"></div>
      </section>

      {/* Final Call to Action */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-16 md:p-32 text-center relative overflow-hidden shadow-2xl">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#4338ca44_0%,transparent_60%)]" />
           <div className="relative z-10 space-y-12">
              <div className="physics-annotation text-indigo-400 tracking-[0.5em] uppercase text-[10px]">Khai mở tiềm năng</div>
              <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">Sẵn sàng <br /> bắt đầu?</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                 <button onClick={() => handleAction('/register')} className="w-full sm:w-auto px-16 py-6 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all">BẮT ĐẦU NGAY</button>
                 <button onClick={() => handleAction('/interactive-lectures')} className="w-full sm:w-auto px-16 py-6 rounded-2xl bg-slate-800 text-white font-black text-xs uppercase tracking-[0.3em] border border-slate-700 hover:bg-slate-700 transition-all">XEM DEMO</button>
              </div>
              <div className="flex justify-center gap-12 opacity-40 pt-8 border-t border-white/5">
                 <div className="physics-annotation text-white text-[10px]">E = MC²</div><div className="physics-annotation text-white text-[10px]">F = G(M1M2/R²)</div><div className="physics-annotation text-white text-[10px]">ΔS ≥ 0</div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default PhysicsHome;

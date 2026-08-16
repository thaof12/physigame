import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Microscope, Swords, GraduationCap, Play } from 'lucide-react';

// Feature Images
import utilLab from '../../../assets/images/feature_lab.png';
import utilArena from '../../../assets/images/feature_arena.png';
import utilJourney from '../../../assets/images/feature_journey.jpg';
import utilLectures from '../../../assets/images/feature_lectures.jpg';

/* ────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────── */
const PhysicsHome = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeGrade, setActive] = useState(10);

  useEffect(() => {
    setActive(user?.profile?.grade ?? 10);
    setTimeout(() => setLoading(false), 600);
  }, [user]);

  useEffect(() => {
    const handleIframeMessage = (event) => {
      const data = event.data;
      if (!data) return;

      let isStartEvent = false;

      if (typeof data === 'string') {
        if (
          data === 'START_GAME' ||
          data === 'START' ||
          data.includes('START_GAME') ||
          data.includes('NAVIGATE_CHALLENGE') ||
          data.includes('advanced-physics-challenge')
        ) {
          isStartEvent = true;
        } else {
          try {
            const parsed = JSON.parse(data);
            if (
              parsed.type === 'START_GAME' ||
              parsed.type === 'HERO_START' ||
              parsed.type === 'NAVIGATE_CHALLENGE' ||
              parsed.action === 'START' ||
              parsed.target === '/advanced-physics-challenge'
            ) {
              isStartEvent = true;
            }
          } catch (e) {
            // Ignored if not JSON
          }
        }
      } else if (typeof data === 'object') {
        if (
          data.type === 'START_GAME' ||
          data.type === 'HERO_START' ||
          data.type === 'NAVIGATE' ||
          data.type === 'NAVIGATE_CHALLENGE' ||
          data.action === 'START' ||
          data.scene === 'game' ||
          data.event === 'click_start' ||
          data.target === '/advanced-physics-challenge'
        ) {
          isStartEvent = true;
        }
      }

      if (isStartEvent) {
        navigate('/advanced-physics-challenge');
      }
    };

    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [navigate]);

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
      {/* Landing Page Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-32 pb-32 px-6">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-indigo-50/30 rounded-full blur-[120px]" />
           <div className="absolute inset-0 physics-field-grid opacity-20" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center">
          <h1 className="font-premium-serif text-[15vw] sm:text-[12rem] font-bold text-slate-900 italic leading-none tracking-tighter mb-4 select-none">
            Eureka
          </h1>
          
          <p className="font-body text-xl md:text-2xl font-medium text-slate-400 tracking-tight leading-relaxed max-w-3xl mb-16">
            {t('home.slogan_1')} <span className="text-indigo-600 font-extrabold">{t('home.slogan_highlight')}</span>. <br />
            {t('home.slogan_2')}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <button
              onClick={() => handleAction(`/physics-class/${activeGrade}`)}
              className="font-heading group relative px-12 py-6 rounded-full bg-slate-900 text-white font-extrabold text-xs uppercase tracking-[0.3em] overflow-hidden shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <div className="relative z-10 flex items-center gap-4">
                 {t('home.start_now')}
                 <ChevronRight size={16} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <button
              onClick={() => handleAction('/vatly/virtual-lab')}
              className="font-heading px-12 py-6 rounded-full bg-white text-slate-900 font-extrabold text-xs uppercase tracking-[0.3em] border border-slate-100 hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              {t('home.virtual_lab')}
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
             <div className="physics-annotation text-indigo-600 tracking-[0.4em] mb-4 uppercase text-[10px]">{t('home.features')}</div>
             <h2 className="font-heading text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tighter">{t('home.features_title')} <span className="text-indigo-600">{t('home.features_title_highlight')}</span> {t('home.features_title_2')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[30rem]">
            {/* Virtual Lab */}
            <div className="md:col-span-2 relative rounded-[3rem] bg-slate-900 overflow-hidden group cursor-pointer hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-700" onClick={() => handleAction('/vatly/virtual-lab')}>
               <img src={utilLab} alt="Virtual Lab" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2s] ease-out" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
               <div className="relative h-full p-12 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                     <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white shadow-xl"><Microscope size={32} /></div>
                     <div className="physics-annotation text-white/50 tracking-[0.3em]">{t('home.lab_tag')}</div>
                  </div>
                  <div className="space-y-4">
                     <h3 className="font-heading text-5xl font-extrabold text-white tracking-tighter">{t('home.lab_title')}</h3>
                     <p className="font-body text-white/60 font-medium max-w-md text-lg leading-relaxed">{t('home.lab_desc')}</p>
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
                     <div className="physics-annotation text-white/70">{t('home.arena_tag')}</div>
                  </div>
                  <div className="space-y-4">
                     <h3 className="font-heading text-3xl font-extrabold text-white tracking-tight">{t('home.arena_title')}</h3>
                     <p className="font-body text-white/80 text-sm font-medium leading-relaxed">{t('home.arena_desc')}</p>
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
                     <div className="physics-annotation text-slate-400">{t('home.curriculum_tag')}</div>
                  </div>
                  <div className="space-y-4 pt-12">
                     <h3 className="font-heading text-3xl font-extrabold text-slate-900 tracking-tight">{t('home.curriculum_title')}</h3>
                     <p className="font-body text-slate-600 text-sm font-medium leading-relaxed">{t('home.curriculum_desc')}</p>
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
                     <h3 className="font-heading text-5xl font-extrabold text-white tracking-tighter">{t('home.lecture_title')}</h3>
                     <p className="font-body text-white/70 font-medium max-w-md text-lg leading-relaxed">{t('home.lecture_desc')}</p>
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

      {/* Hero Section Container (Old Banner Position) */}
      <div className="hero-cocos-container bg-white">
        <iframe 
          src="https://robot-physic-eureka.vercel.app/?scene=hero" 
          style={{ width: '100%', height: '100%', border: 'none', outline: 'none', display: 'block', backgroundColor: '#ffffff' }} 
          frameBorder="0"
          allow="autoplay"
          allowtransparency="true"
          scrolling="no"
          title="Robot Physics Hero Section"
          className="hero-cocos-iframe"
        ></iframe>
      </div>

      {/* Final Call to Action */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-16 md:p-32 text-center relative overflow-hidden shadow-2xl">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#4338ca44_0%,transparent_60%)]" />
           <div className="relative z-10 space-y-12">
              <div className="physics-annotation text-indigo-400 tracking-[0.5em] uppercase text-[10px]">{t('home.unlock_potential')}</div>
              <h2 className="font-heading text-6xl md:text-8xl font-extrabold text-white tracking-tighter leading-none">{t('home.ready_to_start')} <br /> {t('home.ready_to_start_2')}</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                 <button onClick={() => handleAction('/register')} className="font-heading w-full sm:w-auto px-16 py-6 rounded-2xl bg-white text-slate-900 font-extrabold text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all">{t('home.start_now')}</button>
                 <button onClick={() => handleAction('/interactive-lectures')} className="font-heading w-full sm:w-auto px-16 py-6 rounded-2xl bg-slate-800 text-white font-extrabold text-xs uppercase tracking-[0.3em] border border-slate-700 hover:bg-slate-700 transition-all">{t('home.watch_demo')}</button>
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

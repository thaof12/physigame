import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft, Microscope, Swords, GraduationCap, Play, Sparkles, Trophy, Crown, Medal, Zap, Flame, Award, Star } from 'lucide-react';
import { supabase } from '../../../config/supabase';
import api from '../../../config/api';

// Feature Images
import utilLab from '../../../assets/images/feature_lab.png';
import utilArena from '../../../assets/images/feature_arena.png';
import utilJourney from '../../../assets/images/feature_journey.jpg';
import utilLectures from '../../../assets/images/feature_lectures.jpg';

// Demo Scene Carousel Images (Exact Order: intro, scene1-demo, 2-scene-demo, 3-scene-demo, 4-scene-demo, and start-demo)
import imgIntro from '../../../assets/images/intro.png';
import imgScene1 from '../../../assets/images/scene1-demo.png';
import imgScene2 from '../../../assets/images/2-scene-demo.png';
import imgScene3 from '../../../assets/images/3-scene-demo.png';
import imgScene4 from '../../../assets/images/4-scene-demo.png';
import imgBtnStart from '../../../assets/images/btn-start-hero.png';
import imgDemoWord from '../../../assets/images/demo-word.png';

const heroSlides = [
   {
      id: 'intro',
      src: imgIntro,
      title: 'Giới Thiệu Tổng Quan',
      subtitle: 'Mô phỏng Vật Lý Eureka 3D sống động và trực quan',
      tag: 'Intro Scene'
   },
   {
      id: 'scene1',
      src: imgScene1,
      title: 'Không Gian Thử Thách 1',
      subtitle: 'Khám phá chuyển động và môi trường mô phỏng vật lý',
      tag: 'Scene 1'
   },
   {
      id: 'scene2',
      src: imgScene2,
      title: 'Không Gian Thử Thách 2',
      subtitle: 'Tương tác vật lý không gian 3D chân thực',
      tag: 'Scene 2'
   },
   {
      id: 'scene3',
      src: imgScene3,
      title: 'Không Gian Thử Thách 3',
      subtitle: 'Phân tích động lực học và quy luật vật lý tự nhiên',
      tag: 'Scene 3'
   },
   {
      id: 'scene4',
      src: imgScene4,
      title: 'Không Gian Thử Thách 4',
      subtitle: 'Vận dụng kiến thức giải quyết thử thách nâng cao',
      tag: 'Scene 4'
   },
   {
      id: 'start-demo',
      src: imgDemoWord,
      title: 'Sẵn Sàng Bắt Đầu',
      subtitle: 'Bấm nút Bắt Đầu bên dưới để tham gia thử thách',
      tag: 'Start Challenge',
      isStartSlide: true
   }
];

/* ────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────── */
const PhysicsHome = () => {
   const { t } = useTranslation();
   const { user } = useAuth();
   const navigate = useNavigate();
   const [loading, setLoading] = useState(true);
   const [activeGrade, setActive] = useState(10);

   // Carousel State
   const [currentSlide, setCurrentSlide] = useState(0);
   const [isAutoplay, setIsAutoplay] = useState(true);

   // Supabase Real-time Leaderboard State (100% Real Supabase Data)
   const [leaderboard, setLeaderboard] = useState([]);
   const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

   const fetchLeaderboardData = async () => {
      try {
         setLoadingLeaderboard(true);

         // 1. Try backend API first (uses Service Role Key to bypass RLS and fetch all registered users)
         try {
            const res = await api.get('/leaderboard', { params: { type: 'xp', limit: 20 } });
            if (res?.data?.success && Array.isArray(res.data.leaderboard) && res.data.leaderboard.length > 0) {
               let items = [...res.data.leaderboard];
               items.sort((a, b) => (b.xp || 0) - (a.xp || 0));

               const formatted = items.slice(0, 6).map((u, index) => ({
                  id: u.id || `user-${index}`,
                  rank: index + 1,
                  displayName: u.displayName || u.username || u.email?.split('@')[0] || `Học viên #${index + 1}`,
                  avatar: u.avatar || null,
                  xp: typeof u.xp === 'number' ? u.xp : 0
               }));

               setLeaderboard(formatted);
               setLoadingLeaderboard(false);
               return;
            }
         } catch (apiErr) {
            console.warn('API Leaderboard fetch fallback to direct Supabase:', apiErr.message);
         }

         // 2. Direct Supabase Query (Selecting VALID columns only: id, display_name, username, email, avatar, xp)
         if (!supabase || typeof supabase.from !== 'function') {
            setLeaderboard([]);
            return;
         }

         const { data, error } = await supabase
            .from('users')
            .select('id, display_name, username, email, avatar, xp')
            .order('xp', { ascending: false, nullsFirst: false })
            .limit(6);

         if (!error && data && Array.isArray(data) && data.length > 0) {
            const formatted = data.map((u, index) => ({
               id: u.id || `user-${index}`,
               rank: index + 1,
               displayName: u.display_name || u.username || u.email?.split('@')[0] || `Học viên #${index + 1}`,
               avatar: u.avatar || null,
               xp: typeof u.xp === 'number' ? u.xp : 0
            }));

            setLeaderboard(formatted);
         } else {
            if (error) console.warn('Direct Supabase fetch error:', error.message);
            setLeaderboard([]);
         }
      } catch (err) {
         console.warn('Leaderboard fetch exception:', err);
         setLeaderboard([]);
      } finally {
         setLoadingLeaderboard(false);
      }
   };

   useEffect(() => {
      fetchLeaderboardData();

      let channel;
      try {
         if (supabase && typeof supabase.channel === 'function') {
            channel = supabase
               .channel('public_users_xp_realtime_home')
               .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
                  console.log('⚡ [Realtime XP] Supabase update detected! Updating Hero Leaderboard...');
                  fetchLeaderboardData();
               })
               .subscribe();
         }
      } catch (e) {
         console.warn('Realtime subscription error:', e);
      }

      return () => {
         if (channel && supabase && typeof supabase.removeChannel === 'function') {
            try {
               supabase.removeChannel(channel);
            } catch (e) { }
         }
      };
   }, []);

   useEffect(() => {
      setActive(user?.profile?.grade ?? 10);
      setTimeout(() => setLoading(false), 600);
   }, [user]);

   // Auto-advance Carousel
   useEffect(() => {
      if (!isAutoplay) return;
      const interval = setInterval(() => {
         setCurrentSlide(prev => (prev === heroSlides.length - 1 ? 0 : prev + 1));
      }, 4500);
      return () => clearInterval(interval);
   }, [isAutoplay]);

   const prevSlide = () => {
      setCurrentSlide(prev => (prev === 0 ? heroSlides.length - 1 : prev - 1));
   };

   const nextSlide = () => {
      setCurrentSlide(prev => (prev === heroSlides.length - 1 ? 0 : prev + 1));
   };

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
         <section className="relative min-h-[65vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden bg-white pt-28 pb-12 px-6">
            <div className="absolute inset-0 z-0">
               <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-indigo-50/30 rounded-full blur-[120px]" />
               <div className="absolute inset-0 physics-field-grid opacity-20" />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center">
               <h1 className="font-premium-serif text-[15vw] sm:text-[12rem] font-bold text-slate-900 italic leading-none tracking-tighter mb-4 select-none">
                  Eureka
               </h1>

               <p className="font-body text-xl md:text-2xl font-medium text-slate-400 tracking-tight leading-relaxed max-w-3xl mb-12">
                  {t('home.slogan_1')} <span className="text-indigo-600 font-extrabold">{t('home.slogan_highlight')}</span>. <br />
                  {t('home.slogan_2')}
               </p>

               <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
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
            </div>
         </section>

         {/* Hero Showcase Image Slider Section */}
         <section className="pt-24 pb-16 md:pt-36 md:pb-24 bg-slate-50/70 border-y border-slate-100 px-4 md:px-8 relative overflow-hidden mt-12">
            <div className="max-w-7xl mx-auto">
               {/* Section Header */}
               <div className="text-center mb-12">
                  <h2 className="font-heading text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                     Khám Phá Các Phân Cảnh <span className="text-indigo-600 italic font-premium-serif">Game 2D</span>
                  </h2>
               </div>

               {/* Main Slider Box */}
               <div
                  className="relative rounded-[2.5rem] bg-slate-950 border border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden group aspect-[16/9] md:aspect-[21/9] min-h-[380px] md:min-h-[500px]"
                  onMouseEnter={() => setIsAutoplay(false)}
                  onMouseLeave={() => setIsAutoplay(true)}
               >
                  {/* Image Slides */}
                  {heroSlides.map((slide, index) => (
                     <div
                        key={slide.id}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide
                           ? 'opacity-100 scale-100 pointer-events-auto z-10'
                           : 'opacity-0 scale-105 pointer-events-none z-0'
                           }`}
                     >
                        {slide.isStartSlide ? (
                           /* Slide 6 (Start Slide): Clean display of demo-word image + BẮT ĐẦU button */
                           <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4 md:p-8 text-center relative overflow-hidden gap-1">
                              {/* Ambient Glow Effects */}
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

                              {/* Clean demo-word image graphic without overlapping HTML text */}
                              <img
                                 src={imgDemoWord}
                                 alt="Demo Word"
                                 className="max-h-40 md:max-h-56 max-w-[85%] object-contain mb-1 filter drop-shadow-[0_15px_35px_rgba(39,77,173,0.6)] relative z-10"
                              />

                              {/* Interactive Start Button Image with Hover Effect */}
                              <button
                                 onClick={() => handleAction('/advanced-physics-challenge')}
                                 className="group relative z-10 cursor-pointer outline-none transition-all duration-300 hover:scale-110 active:scale-95"
                              >
                                 <img
                                    src={imgBtnStart}
                                    alt="Bắt đầu"
                                    className="h-14 md:h-20 object-contain filter drop-shadow-[0_10px_25px_rgba(99,102,241,0.6)] group-hover:drop-shadow-[0_0_35px_rgba(99,102,241,1)] group-hover:brightness-110 transition-all duration-300"
                                 />
                              </button>
                           </div>
                        ) : (
                           /* Slides 1 to 5: Standard Demo Slide layout without Start button, counter tag, or subtitle */
                           <>
                              {/* Background Image */}
                              <img
                                 src={slide.src}
                                 alt={slide.title}
                                 className="w-full h-full object-cover object-center"
                              />

                              {/* Gradient Overlays */}
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-slate-950/30" />

                              {/* Slide Caption Info (Only Title) */}
                              <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12 z-20 max-w-2xl">
                                 <h3 className="font-heading text-2xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                                    {slide.title}
                                 </h3>
                              </div>
                           </>
                        )}
                     </div>
                  ))}

                  {/* Left Arrow Button */}
                  <button
                     onClick={prevSlide}
                     aria-label="Previous Slide"
                     className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 hover:bg-white backdrop-blur-xl border border-white/40 text-white hover:text-slate-900 shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer group-hover:opacity-100 opacity-80"
                  >
                     <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
                  </button>

                  {/* Right Arrow Button */}
                  <button
                     onClick={nextSlide}
                     aria-label="Next Slide"
                     className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 hover:bg-white backdrop-blur-xl border border-white/40 text-white hover:text-slate-900 shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer group-hover:opacity-100 opacity-80"
                  >
                     <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
                  </button>

                  {/* Bottom Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-950/50 backdrop-blur-md border border-white/10">
                     {heroSlides.map((_, index) => (
                        <button
                           key={index}
                           onClick={() => setCurrentSlide(index)}
                           aria-label={`Go to slide ${index + 1}`}
                           className={`transition-all duration-300 rounded-full cursor-pointer ${index === currentSlide
                              ? 'w-8 h-2.5 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]'
                              : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/80'
                              }`}
                        />
                     ))}
                  </div>
               </div>
            </div>
         </section>

         {/* Bento Feature Grid */}
         <section className="py-24 md:py-28 bg-white px-6">
            <div className="max-w-7xl mx-auto">
               <div className="text-center mb-16">
                  <div className="physics-annotation text-indigo-600 tracking-[0.4em] mb-4 uppercase text-[10px]">{t('home.features')}</div>
                  <h2 className="font-heading text-3xl md:text-5xl font-black text-slate-900 tracking-tight">{t('home.features_title')} <span className="text-indigo-600 italic font-premium-serif">{t('home.features_title_highlight')}</span> {t('home.features_title_2')}</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[24rem] md:auto-rows-[26rem]">
                  {/* Virtual Lab */}
                  <div className="md:col-span-2 relative rounded-[3rem] bg-slate-900 overflow-hidden group cursor-pointer hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-700" onClick={() => handleAction('/vatly/virtual-lab')}>
                     <img src={utilLab} alt="Virtual Lab" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[2s] ease-out" />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                     <div className="relative h-full p-10 flex flex-col justify-between z-10">
                        <div className="flex justify-between items-start">
                           <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-white shadow-xl"><Microscope size={28} /></div>
                           <div className="physics-annotation text-white/50 tracking-[0.3em]">{t('home.lab_tag')}</div>
                        </div>
                        <div className="space-y-3">
                           <h3 className="font-heading text-2xl md:text-3xl font-bold text-white tracking-tight">{t('home.lab_title')}</h3>
                           <p className="font-body text-white/60 font-medium max-w-md text-base leading-relaxed">{t('home.lab_desc')}</p>
                        </div>
                     </div>
                  </div>

                  {/* Arena */}
                  <div className="relative rounded-[3rem] bg-slate-100 overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-700" onClick={() => handleAction('/pk-battle')}>
                     <img src={utilArena} alt="Arena" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-[2s] ease-out" />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                     <div className="relative h-full p-8 flex flex-col justify-between z-10">
                        <div className="flex justify-between items-start">
                           <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg"><Swords size={24} /></div>
                           <div className="physics-annotation text-white/70">{t('home.arena_tag')}</div>
                        </div>
                        <div className="space-y-2">
                           <h3 className="font-heading text-xl md:text-2xl font-bold text-white tracking-tight">{t('home.arena_title')}</h3>
                           <p className="font-body text-white/80 text-sm font-medium leading-relaxed">{t('home.arena_desc')}</p>
                        </div>
                     </div>
                  </div>

                  {/* Learning Path */}
                  <div className="relative rounded-[3rem] bg-white border border-slate-100 overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-700" onClick={() => handleAction('/physics-classes')}>
                     <img src={utilJourney} alt="Learning Path" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-[2s] ease-out" />
                     <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-transparent" />
                     <div className="relative h-full p-8 flex flex-col justify-between z-10">
                        <div className="flex justify-between items-start">
                           <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg"><GraduationCap size={24} /></div>
                           <div className="physics-annotation text-slate-400">{t('home.curriculum_tag')}</div>
                        </div>
                        <div className="space-y-2 pt-8">
                           <h3 className="font-heading text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{t('home.curriculum_title')}</h3>
                           <p className="font-body text-slate-600 text-sm font-medium leading-relaxed">{t('home.curriculum_desc')}</p>
                        </div>
                     </div>
                  </div>

                  {/* Lectures */}
                  <div className="md:col-span-2 relative rounded-[3rem] bg-indigo-600 overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-700" onClick={() => handleAction('/interactive-lectures')}>
                     <img src={utilLectures} alt="Interactive Lectures" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-[2s] ease-out" />
                     <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-indigo-900/40 to-transparent" />
                     <div className="relative h-full p-10 flex items-center z-10">
                        <div className="flex-1 space-y-4">
                           <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-3xl flex items-center justify-center text-white border border-white/30 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                              <Play fill="currentColor" size={20} className="ml-1" />
                           </div>
                           <h3 className="font-heading text-2xl md:text-3xl font-bold text-white tracking-tight">{t('home.lecture_title')}</h3>
                           <p className="font-body text-white/70 font-medium max-w-md text-base leading-relaxed">{t('home.lecture_desc')}</p>
                        </div>
                        <div className="hidden lg:block w-px h-1/2 bg-white/20 mx-10" />
                        <div className="hidden lg:flex flex-col gap-6 text-white/40 font-black text-[10px] uppercase tracking-[0.4em]">
                           <div className="hover:text-white transition-colors">Visual Storytelling</div>
                           <div className="hover:text-white transition-colors">Real-time Data</div>
                           <div className="hover:text-white transition-colors">Instant Feedback</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Hero Section 3: Supabase Realtime Leaderboard Section */}
         <section className="py-24 md:py-32 bg-slate-50/70 border-t border-slate-100 px-4 md:px-8 relative overflow-hidden">
            {/* Subtle Ambient Background */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-100/40 rounded-full blur-[130px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
               {/* Section Header */}
               <div className="text-center mb-10">
                  <h2 className="font-heading text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                     Bảng Xếp Hạng <span className="text-indigo-600 italic font-premium-serif">Thi Đua Học Sinh</span>
                  </h2>
               </div>

               {/* Podium + Top List Container (Compact Width) */}
               <div className="max-w-2xl mx-auto space-y-8">
                  {loadingLeaderboard ? (
                     <div className="text-center py-16">
                        <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin mb-3" />
                        <p className="font-heading font-medium text-slate-500 text-sm">Đang tải dữ liệu xếp hạng thời gian thực từ Supabase...</p>
                     </div>
                  ) : leaderboard.length === 0 ? (
                     <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto px-6">
                        <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-heading font-bold text-slate-700 text-lg">Chưa có dữ liệu bảng xếp hạng</h3>
                        <p className="font-body text-slate-400 text-sm mt-1">Dữ liệu XP sẽ tự động cập nhật ngay khi học sinh tham gia học tập trên hệ thống.</p>
                     </div>
                  ) : (
                     <>
                        {/* Top 3 Podium Stand (Compacted Height & Width) */}
                        <div className="grid grid-cols-3 gap-2 md:gap-4 items-end pt-6 pb-2 px-2 max-w-lg mx-auto">
                           {/* Rank 2 (Silver - Left) */}
                           {leaderboard[1] ? (
                              <div className="flex flex-col items-center group cursor-pointer transition-all duration-300 hover:-translate-y-1.5">
                                 {/* Silver Medal Badge */}
                                 <div className="mb-1 flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 border-2 border-white shadow-sm">
                                    <Medal className="w-3.5 h-3.5 text-slate-700" />
                                 </div>
                                 {/* Name & XP */}
                                 <div className="text-center mb-1.5">
                                    <h3 className="font-heading font-extrabold text-xs md:text-sm text-slate-900 truncate max-w-[90px] md:max-w-[130px]">
                                       {leaderboard[1].displayName}
                                    </h3>
                                    <span className="inline-flex items-center gap-1 font-heading font-black text-[11px] md:text-xs text-slate-600 mt-0.5">
                                       <Zap className="w-3 h-3 fill-amber-400 text-amber-500" />
                                       {leaderboard[1].xp.toLocaleString()} XP
                                    </span>
                                 </div>
                                 {/* Avatar Circle Standing Directly on Top of Podium */}
                                 <div className="relative -mb-2.5 z-10">
                                    <div className="w-14 h-14 md:w-18 md:h-18 rounded-full p-1 bg-gradient-to-tr from-slate-400 via-slate-200 to-white shadow-md border-2 border-white group-hover:scale-105 transition-transform duration-300">
                                       {leaderboard[1].avatar ? (
                                          <img src={leaderboard[1].avatar} alt={leaderboard[1].displayName} className="w-full h-full rounded-full object-cover" />
                                       ) : (
                                          <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center font-heading text-lg md:text-xl font-black text-slate-700">
                                             {leaderboard[1].displayName[0]?.toUpperCase()}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                                 {/* Compact Podium Stand Box */}
                                 <div className="w-full h-16 md:h-22 rounded-t-2xl bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500 text-white shadow-lg border-t-2 border-slate-100 flex flex-col items-center justify-center pt-3 relative overflow-hidden group-hover:brightness-105 transition-all">
                                    <div className="font-heading font-black text-3xl md:text-4xl text-white/30 select-none drop-shadow">
                                       2
                                    </div>
                                 </div>
                              </div>
                           ) : <div />}

                           {/* Rank 1 (Gold - Center / Highest) */}
                           {leaderboard[0] ? (
                              <div className="flex flex-col items-center group cursor-pointer transition-all duration-300 hover:-translate-y-2">
                                 {/* Crown Icon floating on top */}
                                 <div className="mb-0.5 animate-bounce">
                                    <Crown className="w-6 h-6 md:w-7 md:h-7 text-amber-500 fill-amber-400 drop-shadow-[0_3px_8px_rgba(245,158,11,0.4)]" />
                                 </div>
                                 {/* Name & XP */}
                                 <div className="text-center mb-1.5">
                                    <h3 className="font-heading font-black text-sm md:text-base text-amber-800 truncate max-w-[100px] md:max-w-[150px]">
                                       {leaderboard[0].displayName}
                                    </h3>
                                    <span className="inline-flex items-center gap-1 font-heading font-black text-xs md:text-sm text-amber-600 mt-0.5">
                                       <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                       {leaderboard[0].xp.toLocaleString()} XP
                                    </span>
                                 </div>
                                 {/* Avatar Circle Standing Directly on Top of Podium */}
                                 <div className="relative -mb-3 z-10">
                                    <div className="w-18 h-18 md:w-22 md:h-22 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-xl border-4 border-white group-hover:scale-105 transition-transform duration-300">
                                       {leaderboard[0].avatar ? (
                                          <img src={leaderboard[0].avatar} alt={leaderboard[0].displayName} className="w-full h-full rounded-full object-cover" />
                                       ) : (
                                          <div className="w-full h-full rounded-full bg-amber-100 flex items-center justify-center font-heading text-2xl md:text-3xl font-black text-amber-700">
                                             {leaderboard[0].displayName[0]?.toUpperCase()}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                                 {/* Compact Podium Stand Box */}
                                 <div className="w-full h-24 md:h-30 rounded-t-2xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-white shadow-xl border-t-2 border-yellow-200 flex flex-col items-center justify-center pt-3 relative overflow-hidden group-hover:brightness-105 transition-all">
                                    <div className="font-heading font-black text-4xl md:text-5xl text-white/35 select-none drop-shadow">
                                       1
                                    </div>
                                 </div>
                              </div>
                           ) : <div />}

                           {/* Rank 3 (Bronze - Right) */}
                           {leaderboard[2] ? (
                              <div className="flex flex-col items-center group cursor-pointer transition-all duration-300 hover:-translate-y-1.5">
                                 {/* Bronze Medal Badge */}
                                 <div className="mb-1 flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 border-2 border-white shadow-sm">
                                    <Medal className="w-3.5 h-3.5 text-amber-100" />
                                 </div>
                                 {/* Name & XP */}
                                 <div className="text-center mb-1.5">
                                    <h3 className="font-heading font-extrabold text-xs md:text-sm text-slate-900 truncate max-w-[90px] md:max-w-[130px]">
                                       {leaderboard[2].displayName}
                                    </h3>
                                    <span className="inline-flex items-center gap-1 font-heading font-black text-[11px] md:text-xs text-amber-700 mt-0.5">
                                       <Zap className="w-3 h-3 fill-amber-400 text-amber-500" />
                                       {leaderboard[2].xp.toLocaleString()} XP
                                    </span>
                                 </div>
                                 {/* Avatar Circle Standing Directly on Top of Podium */}
                                 <div className="relative -mb-2.5 z-10">
                                    <div className="w-14 h-14 md:w-18 md:h-18 rounded-full p-1 bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-700 shadow-md border-2 border-white group-hover:scale-105 transition-transform duration-300">
                                       {leaderboard[2].avatar ? (
                                          <img src={leaderboard[2].avatar} alt={leaderboard[2].displayName} className="w-full h-full rounded-full object-cover" />
                                       ) : (
                                          <div className="w-full h-full rounded-full bg-amber-200 flex items-center justify-center font-heading text-lg md:text-xl font-black text-amber-800">
                                             {leaderboard[2].displayName[0]?.toUpperCase()}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                                 {/* Compact Podium Stand Box */}
                                 <div className="w-full h-12 md:h-16 rounded-t-2xl bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 text-white shadow-lg border-t-2 border-amber-400 flex flex-col items-center justify-center pt-2 relative overflow-hidden group-hover:brightness-105 transition-all">
                                    <div className="font-heading font-black text-2xl md:text-3xl text-white/30 select-none drop-shadow">
                                       3
                                    </div>
                                 </div>
                              </div>
                           ) : <div />}
                        </div>

                        {/* Ranks 4, 5, 6 List Rows */}
                        {leaderboard.length > 3 && (
                           <div className="space-y-2.5 pt-2">
                              {leaderboard.slice(3, 6).map((item) => (
                                 <div
                                    key={item.id}
                                    className="group flex items-center justify-between p-3.5 md:px-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                                 >
                                    <div className="flex items-center gap-3.5">
                                       {/* Rank Number (without '#' symbol) */}
                                       <div className="w-8 h-8 rounded-xl bg-slate-100 font-heading font-black text-slate-600 flex items-center justify-center text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-inner">
                                          {item.rank}
                                       </div>

                                       {/* Round Avatar */}
                                       <div className="w-10 h-10 rounded-full p-0.5 bg-slate-100 border border-slate-200 shadow-sm group-hover:border-indigo-400 transition-colors">
                                          {item.avatar ? (
                                             <img src={item.avatar} alt={item.displayName} className="w-full h-full rounded-full object-cover" />
                                          ) : (
                                             <div className="w-full h-full rounded-full bg-indigo-50 flex items-center justify-center font-heading text-base font-bold text-indigo-600">
                                                {item.displayName[0]?.toUpperCase()}
                                             </div>
                                          )}
                                       </div>

                                       {/* User Display Name */}
                                       <div>
                                          <h4 className="font-heading font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                                             {item.displayName}
                                          </h4>
                                          <span className="text-[11px] text-slate-400 font-body">Học viên xuất sắc</span>
                                       </div>
                                    </div>

                                    {/* Metric Count Badge (XP Only) */}
                                    <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 font-heading font-black text-amber-700 text-xs md:text-sm flex items-center gap-1.5 group-hover:bg-amber-100 transition-colors">
                                       <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                       {item.xp.toLocaleString()} <span className="text-[10px] text-amber-600 uppercase">XP</span>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </>
                  )}
               </div>
            </div>
         </section>

      </div>
   );
};

export default PhysicsHome;

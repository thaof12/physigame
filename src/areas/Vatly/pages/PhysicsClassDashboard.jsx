import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Trophy, Lock, Flag, Orbit, Zap, Target, Hexagon, Shield } from 'lucide-react';
import { physicsLessons, getLessonStats } from '../data/physicsLessons';
import SolarSystemBackground from '../../../components/animations/SolarSystemBackground';

const PhysicsClassDashboard = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    const loadProgress = async () => {
      const savedProgress = localStorage.getItem(`physics-progress-${classId}`);
      if (savedProgress) {
        setUserProgress(JSON.parse(savedProgress));
      }
      
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.email || user?.uid) {
          const userId = user.email || user.uid;
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/users/profile/${userId}`);
          
          if (response.ok) {
            const userData = await response.json();
            const physicsProgram = userData.programs?.find(p => p.programId === 'physics');
            
            if (physicsProgram?.progress?.completedLessons) {
              const progressObj = {};
              physicsProgram.progress.completedLessons.forEach(lessonKey => {
                progressObj[lessonKey] = 'completed';
              });
              setUserProgress(progressObj);
              localStorage.setItem(`physics-progress-${classId}`, JSON.stringify(progressObj));
            }
          }
        }
      } catch (error) {
        console.log('Could not load progress from backend:', error);
      }
      
      setTimeout(() => setLoading(false), 500);
    };
    
    loadProgress();
  }, [classId]);

  const currentGrade = physicsLessons[classId];
  const stats = currentGrade ? getLessonStats(classId, userProgress) : { total: 0, completed: 0 };
  const overallProgress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const handleLessonClick = (chapterId, lessonId) => {
    navigate(`/physics-lesson/${classId}/${chapterId}/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center relative">
         <SolarSystemBackground />
         <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 relative flex items-center justify-center">
               <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin"></div>
               <Orbit className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-cyan-400 mt-4 tracking-wider">ĐANG TẢI DỮ LIỆU...</h2>
         </div>
      </div>
    );
  }

  if (!currentGrade) {
    return (
      <div className="min-h-screen bg-slate-950 py-8 px-4 relative flex items-center justify-center">
        <SolarSystemBackground />
        <div className="relative z-10 w-full max-w-lg">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-10 border border-red-500/30 text-center shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Hexagon className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">LỖI KẾT NỐI</h2>
            <p className="text-slate-400 mb-8 font-medium">Không tìm thấy phân khu nhiệm vụ của Lớp {classId}. Vui lòng kiểm tra lại tọa độ.</p>
            <button
              onClick={() => navigate('/program/physics')}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
            >
              VỀ TRẠM ĐIỀU HÀNH CHÍNH
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-slate-950 pb-20">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
         <SolarSystemBackground />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950"></div>
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-4 pt-8">
        
        {/* Navigation & Title */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/program/physics')}
            className="group flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium mb-6 bg-cyan-950/30 px-4 py-2 rounded-full border border-cyan-800/50 w-fit backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            TRẠM ĐIỀU HÀNH
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs mb-3 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                  <Target className="w-3 h-3" /> NHIỆM VỤ CHÍNH TUYẾN
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">
                 Vật Lý Lớp {classId}
               </h1>
               <p className="text-lg text-slate-300 mt-2 font-medium max-w-2xl">
                 {currentGrade.description || "Khám phá các quy luật vĩ đại cấu thành nên vũ trụ."}
               </p>
            </div>
            
            {/* Global Progress Capacitor */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 p-4 rounded-2xl w-full md:w-72 shadow-xl">
               <div className="flex justify-between items-end mb-2">
                 <span className="text-sm font-bold text-slate-400">TỔNG TIẾN ĐỘ</span>
                 <span className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">
                   {Math.round(overallProgress)}%
                 </span>
               </div>
               <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner flex">
                 <div
                   className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-1000 ease-out"
                   style={{ width: `${overallProgress}%` }}
                 ></div>
               </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover:border-blue-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
               <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <div>
               <p className="text-sm font-bold text-slate-400">TỔNG BÀI</p>
               <p className="text-2xl font-black text-white">{stats.total}</p>
            </div>
          </div>
          
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover:border-emerald-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
               <Trophy className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
               <p className="text-sm font-bold text-slate-400">HOÀN THÀNH</p>
               <p className="text-2xl font-black text-white">{stats.completed}</p>
            </div>
          </div>
          
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-600 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
               <Lock className="w-6 h-6 text-slate-400" />
            </div>
            <div>
               <p className="text-sm font-bold text-slate-400">CHƯA HỌC</p>
               <p className="text-2xl font-black text-white">{stats.total - stats.completed}</p>
            </div>
          </div>
        </div>

        {/* Chapters - Mission Briefing */}
        <div className="space-y-6">
          {currentGrade.chapters.map((chapter, idx) => {
            const chapterCompleted = chapter.lessons.filter(lesson => {
              const lessonKey = `${classId}-${chapter.id}-${lesson.id}`;
              return userProgress[lessonKey] === 'completed';
            }).length;
            const chapterTotal = chapter.lessons.length;
            const isFullyCompleted = chapterTotal > 0 && chapterCompleted === chapterTotal;
            const hasStarted = chapterCompleted > 0;
            const chapterProgress = chapterTotal > 0 ? (chapterCompleted / chapterTotal) * 100 : 0;

            return (
              <div key={chapter.id} className={`bg-slate-900/60 backdrop-blur-xl border ${isFullyCompleted ? 'border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : hasStarted ? 'border-indigo-500/30' : 'border-slate-800'} rounded-3xl p-6 relative overflow-hidden transition-all duration-500 hover:-translate-y-1`}>
                
                {/* Glow Effect for completed */}
                {isFullyCompleted && (
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] pointer-events-none"></div>
                )}
                
                <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                   {/* Chapter Summary */}
                   <div className="w-full lg:w-1/3 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-700/50 pb-6 lg:pb-0 lg:pr-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`px-2 py-1 rounded text-xs font-bold ${isFullyCompleted ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-slate-300'}`}>
                           CHƯƠNG {idx + 1}
                        </div>
                        {isFullyCompleted && <div className="text-cyan-400 font-bold text-xs flex items-center gap-1"><Zap className="w-3 h-3 fill-current"/> CLEARED</div>}
                      </div>
                      <h2 className={`text-2xl font-black ${isFullyCompleted ? 'text-white' : 'text-slate-200'} leading-tight mb-4`}>
                        {chapter.title}
                      </h2>
                      <div className="mt-auto">
                         <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-bold text-slate-400">Tiến độ phân khu</span>
                            <span className={`text-sm font-black ${isFullyCompleted ? 'text-cyan-400' : 'text-slate-300'}`}>
                               {chapterCompleted}/{chapterTotal}
                            </span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                           <div
                             className={`h-full rounded-full transition-all duration-700 ${isFullyCompleted ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-indigo-500'}`}
                             style={{ width: `${chapterProgress}%` }}
                           ></div>
                         </div>
                      </div>
                   </div>

                   {/* Lessons Grid */}
                   <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {chapter.lessons.map((lesson, lIdx) => {
                       const lessonKey = `${classId}-${chapter.id}-${lesson.id}`;
                       const isCompleted = userProgress[lessonKey] === 'completed';

                       return (
                         <div
                           key={lesson.id}
                           onClick={() => handleLessonClick(chapter.id, lesson.id)}
                           className={`group relative flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                             isCompleted
                               ? 'bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]'
                               : 'bg-slate-800/50 border border-slate-700 hover:border-indigo-400/50 hover:bg-slate-800'
                           }`}
                         >
                           <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mr-4 transition-colors ${
                               isCompleted
                                 ? 'bg-cyan-500 text-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                                 : 'bg-slate-900 border border-slate-600 text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-300'
                             }`}>
                               {isCompleted ? <Flag className="w-5 h-5" /> : (lIdx + 1)}
                           </div>
                           <div className="flex-1 pr-2">
                             <p className={`font-bold text-sm leading-snug line-clamp-2 ${isCompleted ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                               {lesson.title}
                             </p>
                             <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${isCompleted ? 'text-cyan-400' : 'text-slate-500/80'}`}>
                               {isCompleted ? 'Hoàn thành' : 'Chưa thu thập'}
                             </p>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note / Promo */}
        <div className="mt-12 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
           <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>
           <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                 <Shield className="w-6 h-6 text-blue-400" />
                 Thực Hành Kiến Thức
              </h3>
              <p className="text-slate-300 mt-2 font-medium max-w-xl">
                 Bạn đã nắm vững lý thuyết? Hãy áp dụng chúng vào mô phỏng không gian và vượt qua các thử thách Mini-game tương tác.
              </p>
           </div>
           <button
             onClick={() => navigate('/advanced-physics-challenge')}
             className="whitespace-nowrap px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-bold backdrop-blur-md transition-all active:scale-95"
           >
             Vào Khu Thử Thách
           </button>
        </div>
        
      </div>
    </div>
  );
};

export default PhysicsClassDashboard;

import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Trophy, Lock, Flag, Zap, Target, Shield, CheckCircle, ChevronRight } from 'lucide-react';
import { physicsLessons, getLessonStats } from '../data/physicsLessons';

const PhysicsClassDashboard = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    const loadProgress = async () => {
      const savedProgress = localStorage.getItem(`physics-progress-${classId}`);
      if (savedProgress) {
        try {
          setUserProgress(JSON.parse(savedProgress));
        } catch (e) {
          console.error('Failed to parse savedProgress:', e);
          localStorage.removeItem(`physics-progress-${classId}`);
        }
      }
      
      try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (user?.email || user?.uid) {
          const userId = user.email || user.uid;
          const response = await fetch(`/api/users/profile/${userId}`);
          
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
      <div className="min-h-screen bg-[#FFFFFF] flex justify-center items-center relative">
         <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
              style={{ backgroundImage:'linear-gradient(#274dad 1px,transparent 1px),linear-gradient(90deg,#274dad 1px,transparent 1px)', backgroundSize:'40px 40px' }} />
         <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 relative flex items-center justify-center">
               <div className="absolute inset-0 rounded-full border-[3px] border-[#274dad]/30 border-t-[#274dad] animate-spin"></div>
               <BookOpen className="w-8 h-8 text-[#274dad]" />
            </div>
            <h2 className="text-lg font-black text-[#2a4095] mt-4 tracking-widest uppercase">Đang tải dữ liệu...</h2>
         </div>
      </div>
    );
  }

  if (!currentGrade) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] py-8 px-4 relative flex items-center justify-center">
        <div className="relative z-10 w-full max-w-lg">
          <div className="bg-white rounded-3xl p-10 border-2 border-red-200 text-center shadow-[0_8px_30px_rgba(225,29,72,0.08)]">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-200">
              <Target className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4">Không tìm thấy</h2>
            <p className="text-slate-500 mb-8 font-medium">Không tìm thấy chương trình học của Lớp {classId}. Vui lòng kiểm tra lại.</p>
            <button
              onClick={() => navigate('/program/physics')}
              className="w-full py-4 pg-btn-brass rounded-xl text-white font-bold"
            >
              Về Trang Chủ Vật Lý
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#FFFFFF] pb-20">
      {/* Warm ambient blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] bg-blue-50/50" />
        <div className="absolute bottom-20 right-10 w-[400px] h-[400px] rounded-full blur-[120px] bg-cyan-50/40" />
        <div className="absolute inset-0 opacity-[0.025]"
             style={{ backgroundImage:'linear-gradient(#274dad 1px,transparent 1px),linear-gradient(90deg,#274dad 1px,transparent 1px)', backgroundSize:'40px 40px' }} />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-4 pt-24">
        
        {/* Navigation & Title */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/program/physics')}
            className="group flex items-center gap-2 text-[#274dad] hover:text-[#2099e9] transition-colors font-bold mb-6 bg-white px-4 py-2 rounded-full border-2 border-[#274dad]/20 w-fit shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Trạm Điều Hành
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#274dad]/10 border border-[#274dad]/20 text-[#2099e9] font-black text-xs mb-3">
                  <Target className="w-3 h-3" /> CHƯƠNG TRÌNH CHÍNH TUYẾN
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#2a4095] to-[#274dad]">
                 Vật Lý Lớp {classId}
               </h1>
               <p className="text-lg text-slate-500 mt-2 font-medium max-w-2xl">
                 {currentGrade.description || "Khám phá các quy luật vĩ đại cấu thành nên vũ trụ."}
               </p>
            </div>
            
            {/* Global Progress */}
            <div className="bg-white border-2 border-[#274dad]/15 p-5 rounded-2xl w-full md:w-72 shadow-[0_4px_20px_rgba(184,115,51,0.08)]">
               <div className="flex justify-between items-end mb-2">
                 <span className="text-sm font-black text-slate-400 uppercase tracking-wider">Tổng tiến độ</span>
                 <span className="text-2xl font-black text-[#274dad]">
                   {Math.round(overallProgress)}%
                 </span>
               </div>
               <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                 <div
                   className="h-full bg-gradient-to-r from-[#274dad] to-[#44b5d7] rounded-full transition-all duration-1000 ease-out"
                   style={{ width: `${overallProgress}%` }}
                 ></div>
               </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-[#274dad]/30 transition-all shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center">
               <BookOpen className="w-6 h-6 text-sky-600" />
            </div>
            <div>
               <p className="text-sm font-black text-slate-400 uppercase tracking-wider">Tổng bài</p>
               <p className="text-2xl font-black text-slate-800">{stats.total}</p>
            </div>
          </div>
          
          <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
               <Trophy className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
               <p className="text-sm font-black text-slate-400 uppercase tracking-wider">Hoàn thành</p>
               <p className="text-2xl font-black text-slate-800">{stats.completed}</p>
            </div>
          </div>
          
          <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-300 transition-all shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
               <Lock className="w-6 h-6 text-slate-400" />
            </div>
            <div>
               <p className="text-sm font-black text-slate-400 uppercase tracking-wider">Chưa học</p>
               <p className="text-2xl font-black text-slate-800">{stats.total - stats.completed}</p>
            </div>
          </div>
        </div>

        {/* Chapters */}
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
              <div key={chapter.id} className={`bg-white border-2 ${isFullyCompleted ? 'border-[#274dad]/40 shadow-[0_8px_30px_rgba(184,115,51,0.1)]' : hasStarted ? 'border-blue-200' : 'border-slate-100'} rounded-3xl p-6 relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-lg`}>
                
                {/* Glow Effect for completed */}
                {isFullyCompleted && (
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 blur-[80px] pointer-events-none"></div>
                )}
                
                <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                   {/* Chapter Summary */}
                   <div className="w-full lg:w-1/3 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`px-2.5 py-1 rounded-lg text-xs font-black ${isFullyCompleted ? 'bg-[#274dad] text-white' : 'bg-slate-100 text-slate-500'}`}>
                           CHƯƠNG {idx + 1}
                        </div>
                        {isFullyCompleted && <div className="text-[#274dad] font-black text-xs flex items-center gap-1"><Zap className="w-3 h-3 fill-current"/> HOÀN TẤT</div>}
                      </div>
                      <h2 className={`text-2xl font-black ${isFullyCompleted ? 'text-[#2a4095]' : 'text-slate-700'} leading-tight mb-4`}>
                        {chapter.title}
                      </h2>
                      <div className="mt-auto">
                         <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Tiến độ chương</span>
                            <span className={`text-sm font-black ${isFullyCompleted ? 'text-[#274dad]' : 'text-slate-500'}`}>
                               {chapterCompleted}/{chapterTotal}
                            </span>
                         </div>
                         <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div
                             className={`h-full rounded-full transition-all duration-700 ${isFullyCompleted ? 'bg-gradient-to-r from-[#274dad] to-[#44b5d7]' : 'bg-blue-400'}`}
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
                               ? 'bg-[#274dad]/5 border-2 border-[#274dad]/25 hover:bg-[#274dad]/10 hover:border-[#274dad]/40'
                               : 'bg-slate-50/50 border-2 border-slate-100 hover:border-[#274dad]/30 hover:bg-white hover:shadow-md'
                           }`}
                         >
                           <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mr-4 transition-all font-black text-sm ${
                               isCompleted
                                 ? 'bg-[#274dad] text-white shadow-[0_4px_12px_rgba(184,115,51,0.3)]'
                                 : 'bg-white border-2 border-slate-200 text-slate-400 group-hover:border-[#274dad]/50 group-hover:text-[#274dad]'
                             }`}>
                               {isCompleted ? <CheckCircle className="w-5 h-5" /> : (lIdx + 1)}
                           </div>
                           <div className="flex-1 pr-2">
                             <p className={`font-bold text-sm leading-snug line-clamp-2 ${isCompleted ? 'text-[#2a4095]' : 'text-slate-600 group-hover:text-slate-800'}`}>
                               {lesson.title}
                             </p>
                             <p className={`text-[10px] font-black mt-1 uppercase tracking-wider ${isCompleted ? 'text-[#274dad]' : 'text-slate-400'}`}>
                               {isCompleted ? '✓ Hoàn thành' : 'Chưa học'}
                             </p>
                           </div>
                           <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-all ${isCompleted ? 'text-[#274dad]' : 'text-slate-300 group-hover:text-[#274dad] group-hover:translate-x-1'}`} />
                         </div>
                       );
                     })}
                   </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Promo / CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#274dad] to-[#2099e9] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-[0_8px_30px_rgba(39,77,173,0.25)]">
           <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>
           <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                 <Shield className="w-6 h-6 text-blue-200" />
                 Thực Hành Kiến Thức
              </h3>
              <p className="text-white/80 mt-2 font-medium max-w-xl">
                 Bạn đã nắm vững lý thuyết? Hãy áp dụng chúng vào mô phỏng không gian và vượt qua các thử thách Mini-game tương tác.
              </p>
           </div>
           <button
             onClick={() => navigate('/advanced-physics-challenge')}
             className="whitespace-nowrap px-8 py-4 bg-white text-[#2a4095] rounded-2xl font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
           >
             Vào Khu Thử Thách
           </button>
        </div>
        
      </div>
    </div>
  );
};

export default PhysicsClassDashboard;




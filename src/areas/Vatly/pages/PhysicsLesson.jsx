import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { logSessionActivity } from '../../../services/activityLogger';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  Orbit, 
  Compass, 
  Target, 
  Flag, 
  ChevronRight, 
  ChevronLeft,
  Info,
  Send,
  Zap,
  Star,
  Award
} from 'lucide-react';
import { physicsLessons } from '../data/physicsLessons';

const STATIONS = [
  { id: 'discovery', label: 'Khám Phá', icon: Compass, color: 'sky' },
  { id: 'assessment', label: 'Giải Mã', icon: Zap, color: 'blue' },
  { id: 'application', label: 'Chinh Phục', icon: Target, color: 'emerald' },
  { id: 'summary', label: 'Tổng Kết', icon: Award, color: 'indigo' }
];

const PhysicsLesson = () => {
  const { classId, chapterId, lessonId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stationIndex, setStationIndex] = useState(0);
  const [lessonData, setLessonData] = useState(null);
  
  // Quiz State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  
  // Essay State
  const [essayResponse, setEssayResponse] = useState('');
  const [isEssaySubmitted, setIsEssaySubmitted] = useState(false);
  
  // Completion
  const [isCompleted, setIsCompleted] = useState(false);

  const currentStation = STATIONS[stationIndex];

  // Safe accessors for content sub-fields (prevents undefined crashes)
  const exercises = lessonData?.content?.exercises || [];
  const essay = lessonData?.content?.essay || {};

  // Helper: Generate placeholder content if backend is empty
  const generatePlaceholderContent = useMemo(() => {
    return (title) => {
      const qPrefix = title.split(' ').slice(0, 3).join(' ');
      return {
        theory: `<div class="space-y-6">
          <p class="text-xl font-medium text-slate-700 leading-relaxed">Chào mừng bạn đến với bài học <strong>${title}</strong>.</p>
          <div class="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-2xl">
            <h4 class="font-black text-[#2099e9] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Info className="w-5 h-5" /> Tóm tắt kiến thức
            </h4>
            <p class="text-[#2a4095]">Trong bài học này, chúng ta sẽ tìm hiểu về các khái niệm cơ bản của ${title}, vai trò của nó trong đời sống và cách vận dụng vào giải quyết các vấn đề thực tế.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div class="p-6 bg-white border-2 border-slate-100 rounded-2xl">
                <h5 class="font-bold text-slate-800 mb-2">Mục tiêu 1</h5>
                <p class="text-sm text-slate-500">Nắm vững định nghĩa và các đại lượng liên quan đến ${title}.</p>
             </div>
             <div class="p-6 bg-white border-2 border-slate-100 rounded-2xl">
                <h5 class="font-bold text-slate-800 mb-2">Mục tiêu 2</h5>
                <p class="text-sm text-slate-500">Vận dụng công thức để giải các bài tập cơ bản về ${title}.</p>
             </div>
          </div>
        </div>`,
        exercises: [
          {
            question: `Khái niệm cơ bản nhất của ${title} tập trung vào điều gì?`,
            options: [
              `Nghiên cứu các quy luật vận động của tự nhiên`,
              `Sáng tạo ra các công cụ đo lường mới`,
              `Giải thích các hiện tượng tâm linh`,
              `Xử lý các dữ liệu kinh tế vĩ mô`
            ],
            correctAnswer: 0,
            explanation: `Vật lý học nói chung và ${title} nói riêng luôn tập trung nghiên cứu các quy luật vận động cơ bản của thế giới tự nhiên.`
          },
          {
            question: `Đơn vị đo lường phổ biến nhất được sử dụng trong ${title} là gì?`,
            options: [
              `Hệ đo lường Anh-Mỹ`,
              `Hệ đo lường quốc tế SI`,
              `Hệ đo lường cổ điển`,
              `Tùy vào từng địa phương`
            ],
            correctAnswer: 1,
            explanation: `Hệ SI là tiêu chuẩn chung được sử dụng trong nghiên cứu khoa học hiện đại.`
          }
        ],
        essay: {
          question: `Dựa trên những gì bạn đã đọc, hãy lấy một ví dụ thực tế về ứng dụng của ${title} trong đời sống hàng ngày?`,
          sampleAnswer: `Một ví dụ điển hình là việc áp dụng các nguyên lý của ${title} vào việc thiết kế các công cụ gia dụng như cân điện tử, nhiệt kế hoặc các hệ thống giao thông.`
        }
      };
    };
  }, []);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/lessons/class/${classId}/chapter/${chapterId}/lesson/${lessonId}`,
          { params: { subject: 'physics' } }
        );
        
        if (response.data && response.data.content) {
          // Merge with placeholder to ensure exercises/essay always exist
          const title = response.data.title || `Bài ${lessonId}`;
          const placeholder = generatePlaceholderContent(title);
          const mergedContent = {
            theory: response.data.content.theory || placeholder.theory,
            exercises: response.data.content.exercises || placeholder.exercises,
            essay: response.data.content.essay || placeholder.essay
          };
          setLessonData({ ...response.data, content: mergedContent });
        } else {
          const classData = physicsLessons[classId];
          const chapter = classData?.chapters.find(ch => ch.id === parseInt(chapterId));
          const lesson = chapter?.lessons.find(l => l.id === parseInt(lessonId));
          
          if (lesson) {
            setLessonData({
              title: lesson.title,
              content: generatePlaceholderContent(lesson.title)
            });
          }
        }
      } catch (error) {
        // Only log error if it's really unexpected. 404 is technically fine as we have fallback.
        if (error.response?.status !== 404) {
          console.warn('⚠️ Server lesson data not available (Status:', error.response?.status || 'Network Error', '). Using local fallback.');
        } else {
          console.log('ℹ️ Lesson not found in DB, using optimized local content.');
        }
        
        // Fallback to locally defined physicsLessons.js
        const classData = physicsLessons[classId];
        const chapter = classData?.chapters.find(ch => ch.id === parseInt(chapterId));
        const lesson = chapter?.lessons.find(l => l.id === parseInt(lessonId));
        
        if (lesson) {
          setLessonData({
            title: lesson.title,
            content: generatePlaceholderContent(lesson.title)
          });
        } else {
          // Ultimate fallback: generate placeholder with generic title
          const fallbackTitle = `Bài ${lessonId} - Chương ${chapterId}`;
          console.warn('⚠️ Local fallback not found for', classId, chapterId, lessonId, '- using generic placeholder');
          setLessonData({
            title: fallbackTitle,
            content: generatePlaceholderContent(fallbackTitle)
          });
        }
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };

    fetchLesson();
  }, [classId, chapterId, lessonId, generatePlaceholderContent]);

  const handleNextStation = () => {
    if (stationIndex < STATIONS.length - 1) {
      setStationIndex(stationIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStation = () => {
    if (stationIndex > 0) {
      setStationIndex(stationIndex - 1);
    }
  };

  const handleQuizAnswer = (idx) => {
    if (showQuizResult) return;
    setSelectedAnswer(idx);
  };

  const checkQuizAnswer = () => {
    const currentQuiz = exercises[currentQuizIndex];
    if (currentQuiz && selectedAnswer === currentQuiz.correctAnswer) {
      setQuizScore(quizScore + 1);
    }
    setShowQuizResult(true);
  };

  const nextQuiz = () => {
    if (currentQuizIndex < exercises.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
      setShowQuizResult(false);
    } else {
      handleNextStation();
    }
  };

  const handleFinish = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.email || user?.uid;
      
      if (userId) {
        const totalEx = exercises.length;
        const progressData = {
          userId,
          programId: 'physics',
          classId: parseInt(classId),
          chapterId: parseInt(chapterId),
          lessonId: parseInt(lessonId),
          score: quizScore,
          totalQuestions: totalEx,
          completed: true,
          completionDate: new Date().toISOString()
        };

        // Submit to backend
        await axios.post(`${API_BASE_URL}/users/submit-physics-lesson`, progressData);

        // Log session activity
        logSessionActivity(
          'lesson',
          'Hoàn thành bài học',
          `Bài học ${lessonId} (Chương ${chapterId}) - Lớp ${classId}`,
          quizScore * 50
        );
        
        // Update local progress
        const lessonKey = `${classId}-${chapterId}-${lessonId}`;
        let savedProgress = {};
        try {
          const progressStr = localStorage.getItem(`physics-progress-${classId}`);
          savedProgress = progressStr ? JSON.parse(progressStr) : {};
        } catch (e) {
          console.error('Failed to parse physics-progress:', e);
        }
        savedProgress[lessonKey] = 'completed';
        localStorage.setItem(`physics-progress-${classId}`, JSON.stringify(savedProgress));
      }
    } catch (error) {
      console.error('Error saving task progress:', error);
    }
    
    navigate(`/physics-class/${classId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e4f2f0] flex flex-col items-center justify-center relative">
         <div className="absolute inset-0 opacity-[0.025] pointer-events-none graph-grid" />
         <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 relative flex items-center justify-center">
               <div className="absolute inset-0 rounded-full border-[4px] border-[#274dad]/20 border-t-[#274dad] animate-spin"></div>
               <Orbit className="w-10 h-10 text-[#274dad] animate-pulse" />
            </div>
            <h2 className="text-xl font-black text-[#2a4095] mt-6 tracking-[0.2em] uppercase">Đang mở trạm kiến thức...</h2>
         </div>
      </div>
    );
  }

  if (!lessonData) {
    return <div className="p-20 text-center">Không tìm thấy dữ liệu bài học.</div>;
  }

  return (
    <div className="min-h-screen bg-white pb-20 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#274dad]/5 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#e4f2f0] blur-[100px] rounded-full" />
         <div className="absolute inset-0 graph-grid opacity-[0.03]" />
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl px-4 pt-24">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
           <button
             onClick={() => navigate(`/physics-class/${classId}`)}
             className="flex items-center gap-2 text-[#274dad] font-bold hover:translate-x-1 transition-transform"
           >
             <ArrowLeft className="w-5 h-5" /> 
             <span className="hidden sm:inline">Quay Lại Lớp Học</span>
           </button>
           
           <div className="flex items-center gap-3">
              <div className="px-4 py-1.5 rounded-full bg-white border border-[#274dad]/20 shadow-sm flex items-center gap-2">
                 <Star className="w-4 h-4 text-blue-500 fill-blue-500" />
                 <span className="text-sm font-black text-[#2a4095]">LỚP {classId}</span>
              </div>
              <div className="px-4 py-1.5 rounded-full bg-[#274dad] text-white shadow-md flex items-center gap-2">
                 <Zap className="w-4 h-4" />
                 <span className="text-sm font-black uppercase tracking-wider">Bài {lessonId}</span>
              </div>
           </div>
        </div>

        {/* Station Navigation Rail */}
        <div className="mb-12">
           <div className="flex items-center justify-between relative px-2">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />
              <div 
                className="absolute top-1/2 left-0 h-1 bg-[#274dad]/40 -translate-y-1/2 z-0 rounded-full transition-all duration-700" 
                style={{ width: `${((stationIndex / (STATIONS.length - 1)) * 100)}%` }}
              />
              
              {STATIONS.map((s, idx) => {
                const Icon = s.icon;
                const isActive = stationIndex === idx;
                const isCompleted = idx < stationIndex;
                
                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center">
                    <div 
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg border-2 ${
                        isActive 
                          ? 'bg-[#274dad] border-[#274dad] text-white scale-110 -translate-y-1' 
                          : isCompleted
                            ? 'bg-white border-[#274dad] text-[#274dad]'
                            : 'bg-white border-slate-200 text-slate-300'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
                    </div>
                    <span className={`mt-3 text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-[#274dad]' : 'text-slate-400'}`}>
                      {s.label}
                    </span>
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                         <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
           </div>
        </div>

        {/* Main Content Area */}
        <div className="animate-station-enter">
          <div className="card-premium p-8 md:p-12 mb-8 relative">
             <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
                <currentStation.icon className="w-32 h-32 text-[#274dad]" />
             </div>

             <div className="relative z-10">
                <h1 className="text-3xl md:text-4xl font-black text-[#2a4095] mb-2">{lessonData.title}</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] mb-10 border-b border-slate-100 pb-6 flex items-center gap-3">
                   <Flag className={`w-5 h-5 text-${currentStation.color}-500`} />
                   Trạm {stationIndex + 1}: {currentStation.label}
                </p>

                {/* STATION CONTENTS */}
                
                {/* 1. DISCOVERY */}
                {currentStation.id === 'discovery' && (
                  <div className="prose prose-lg prose-slate max-w-none prose-headings:text-[#2a4095] prose-strong:text-[#274dad]">
                    <div dangerouslySetInnerHTML={{ __html: lessonData.content.theory }} />
                    
                    <div className="mt-12 flex justify-center">
                       <button
                         onClick={handleNextStation}
                         className="pg-btn-brass flex items-center gap-3"
                       >
                         Khám Phá Xong, Tiếp Tục <ChevronRight className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                )}

                {/* 2. ASSESSMENT (QUIZ) */}
                {currentStation.id === 'assessment' && (
                  <div>
                    <div className="flex justify-between items-center mb-8">
                       <span className="text-sm font-black text-slate-400">CÂU HỎI {currentQuizIndex + 1} / {exercises.length}</span>
                       <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-300" 
                            style={{ width: `${((currentQuizIndex + 1) / exercises.length) * 100}%` }}
                          />
                       </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
                       {exercises[currentQuizIndex]?.question}
                    </h3>

                    <div className="space-y-4">
                       {exercises[currentQuizIndex]?.options?.map((opt, i) => {
                          const isSelected = selectedAnswer === i;
                          const isCorrect = i === exercises[currentQuizIndex]?.correctAnswer;
                          
                          let className = "w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 font-medium ";
                          
                          if (showQuizResult) {
                            if (isCorrect) className += "bg-emerald-50 border-emerald-500 text-emerald-800";
                            else if (isSelected) className += "bg-red-50 border-red-500 text-red-800";
                            else className += "bg-white border-slate-100 opacity-50";
                          } else {
                            className += isSelected 
                              ? "bg-blue-50 border-[#274dad] text-[#2099e9] shadow-md" 
                              : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50";
                          }

                          return (
                            <button key={i} onClick={() => handleQuizAnswer(i)} className={className}>
                               <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
                                 isSelected ? 'bg-[#274dad] text-white' : 'bg-slate-100 text-slate-400'
                               }`}>
                                  {String.fromCharCode(65 + i)}
                               </div>
                               <span className="flex-1">{opt}</span>
                               {showQuizResult && isCorrect && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                               {showQuizResult && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                            </button>
                          );
                       })}
                    </div>

                    {showQuizResult && (
                      <div className="mt-8 p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 animate-fade-in">
                         <h4 className="font-black text-[#2a4095] mb-2 uppercase text-xs tracking-widest flex items-center gap-2">
                           <Info className="w-4 h-4" /> Giải thích khoa học
                         </h4>
                         <p className="text-slate-600 italic leading-relaxed text-sm">
                           {exercises[currentQuizIndex]?.explanation}
                         </p>
                      </div>
                    )}

                    <div className="mt-10 flex gap-4">
                       {!showQuizResult ? (
                         <button
                           disabled={selectedAnswer === null}
                           onClick={checkQuizAnswer}
                           className="flex-1 pg-btn-brass disabled:opacity-50 disabled:grayscale transition-all"
                         >
                           Xác Nhận Giải Mã
                         </button>
                       ) : (
                         <button
                           onClick={nextQuiz}
                           className="flex-1 py-4 bg-[#2a4095] text-white rounded-2xl font-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                         >
                           {currentQuizIndex < exercises.length - 1 ? 'Câu Tiếp Theo' : 'Hoàn Thành Trạm'}
                           <ChevronRight className="w-5 h-5" />
                         </button>
                       )}
                    </div>
                  </div>
                )}

                {/* 3. APPLICATION (ESSAY) */}
                {currentStation.id === 'application' && (
                  <div className="space-y-8">
                     <div className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex gap-4">
                        <Award className="w-10 h-10 text-emerald-600 flex-shrink-0" />
                        <div>
                           <h4 className="font-bold text-emerald-900 mb-1">Thử Thách Vận Dụng</h4>
                           <p className="text-emerald-700 text-sm">Hãy tự trả lời câu hỏi bên dưới để củng cố kiến thực và nhận thêm điểm kinh nghiệm.</p>
                        </div>
                     </div>

                     <div className="bg-white border-2 border-slate-100 p-8 rounded-3xl shadow-sm">
                        <p className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">
                           {essay?.question || "Dựa vào kiến thức đã học, hãy phân tích tầm quan trọng của bài học này đối với cuộc sống?"}
                        </p>
                        
                        <textarea
                          value={essayResponse}
                          onChange={(e) => setEssayResponse(e.target.value)}
                          disabled={isEssaySubmitted}
                          placeholder="Nhập suy nghĩ của bạn tại đây..."
                          className="w-full h-40 p-6 rounded-2xl border-2 border-slate-100 focus:border-[#274dad] focus:ring-0 transition-all font-medium text-slate-700 text-lg"
                        />

                        <div className="mt-4 flex justify-between items-center text-sm">
                           <span className={essayResponse.length >= 10 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                             {essayResponse.length} / 10 ký tự tối thiểu
                           </span>
                           {essayResponse.length > 0 && essayResponse.length < 10 && (
                             <span className="text-blue-600 font-bold animate-pulse flex items-center gap-1">
                               <Info className="w-4 h-4" /> Câu trả lời hơi ngắn nè!
                             </span>
                           )}
                        </div>

                        {!isEssaySubmitted ? (
                          <button
                            onClick={() => {
                              if (essayResponse.length >= 10) {
                                setIsEssaySubmitted(true);
                              }
                            }}
                            disabled={essayResponse.length < 10}
                            className={`mt-6 w-full py-4 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-3 ${
                              essayResponse.length >= 10 
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-70'
                            }`}
                          >
                            {essayResponse.length < 10 ? 'Cần thêm thông tin...' : 'Gửi Câu Trả Lời'} 
                            <Send className="w-5 h-5" />
                          </button>
                        ) : (
                          <div className="mt-10 animate-fade-in">
                             <div className="p-6 bg-slate-50 border-2 border-emerald-500/20 rounded-2xl mb-8">
                                <h4 className="font-bold text-[#2a4095] mb-4 text-sm uppercase tracking-widest">Gợi ý câu trả lời lý tưởng:</h4>
                                <p className="text-slate-600 line-relaxed font-medium italic">
                                  {essay?.sampleAnswer}
                                </p>
                             </div>
                             <button
                               onClick={handleNextStation}
                               className="w-full pg-btn-brass"
                             >
                               Tiến Tới Trạm Cuối Cùng
                             </button>
                          </div>
                        )}
                     </div>
                  </div>
                )}

                {/* 4. SUMMARY */}
                {currentStation.id === 'summary' && (
                  <div className="text-center py-10">
                     <div className="relative inline-block mb-10">
                        <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-20" />
                        <div className="w-40 h-40 bg-white border-4 border-[#274dad] shadow-2xl rounded-full flex items-center justify-center relative z-10 mx-auto">
                           <Trophy className="w-20 h-20 text-[#274dad]" />
                        </div>
                     </div>

                     <h2 className="text-4xl font-black text-[#2a4095] mb-4">Chúc Mừng Bạn!</h2>
                     <p className="text-slate-500 font-medium mb-12 max-w-md mx-auto text-lg">
                        Bạn đã xuất sắc vượt qua các trạm của bài học <strong>${lessonData.title}</strong>. 
                        Kết quả đã được đồng bộ vào học bạ của bạn.
                     </p>

                     <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto mb-16">
                        <div className="p-6 bg-white border-2 border-slate-100 rounded-3xl shadow-sm">
                           <p className="text-[#274dad] text-4xl font-black mb-1">{quizScore}/{exercises.length}</p>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Độ Chính Xác</p>
                        </div>
                        <div className="p-6 bg-white border-2 border-slate-100 rounded-3xl shadow-sm">
                           <p className="text-emerald-600 text-4xl font-black mb-1">+{quizScore * 50}</p>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Điểm Kinh Nghiệm</p>
                        </div>
                     </div>

                     <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={handleFinish}
                          className="px-10 py-4 pg-btn-brass min-w-[240px]"
                        >
                          Lưu Kết Quả & Trở Về
                        </button>
                     </div>
                  </div>
                )}
             </div>
          </div>
          
          {/* Station Assistance Info (Dynamic) */}
          <div className="flex items-center gap-4 p-6 bg-blue-50 border border-blue-100 rounded-3xl">
             <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-blue-500" />
             </div>
             <div>
                <p className="text-blue-900 text-sm font-bold">Mẹo từ Robot Hỗ Trợ:</p>
                <p className="text-blue-800 text-xs">
                   {stationIndex === 0 && "Hãy đọc kỹ lý thuyết trước khi bước vào trạm đánh giá để đạt điểm cao nhất nhé!"}
                   {stationIndex === 1 && "Đừng lo lắng, hãy suy nghĩ logic để giải mã các câu hỏi trắc nghiệm."}
                   {stationIndex === 2 && "Đây là cơ hội để bạn thể hiện tư duy và hiểu biết thực tế của mình."}
                   {stationIndex === 3 && "Kết quả này sẽ được lưu mãi mãi để ghi nhận sự nỗ lực của bạn."}
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsLesson;



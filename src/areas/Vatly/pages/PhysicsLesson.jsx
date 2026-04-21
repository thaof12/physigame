import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { ArrowLeft, BookOpen, CheckCircle, XCircle, Trophy, Orbit, Activity, TerminalSquare, ShieldAlert, ShieldCheck } from 'lucide-react';
import { physicsLessons } from '../data/physicsLessons';
import SolarSystemBackground from '../../../components/animations/SolarSystemBackground';

const normalizeExercises = (exercises = []) => {
  if (!Array.isArray(exercises) || exercises.length === 0) return [];

  const hasOnlyOneBasedNumericAnswers = exercises
    .filter((exercise) => Array.isArray(exercise?.options) && typeof exercise?.correctAnswer === 'number')
    .every((exercise) => exercise.correctAnswer >= 1 && exercise.correctAnswer <= exercise.options.length);

  const hasAnyZeroBasedAnswer = exercises
    .some((exercise) => typeof exercise?.correctAnswer === 'number' && exercise.correctAnswer === 0);

  const shouldConvertFromOneBased = hasOnlyOneBasedNumericAnswers && !hasAnyZeroBasedAnswer;

  return exercises.map((exercise) => {
    if (!Array.isArray(exercise?.options)) return exercise;

    if (typeof exercise.correctAnswer === 'number') {
      const normalizedAnswer = shouldConvertFromOneBased
        ? exercise.correctAnswer - 1
        : exercise.correctAnswer;

      return {
        ...exercise,
        correctAnswer: normalizedAnswer
      };
    }

    if (typeof exercise.correctAnswer === 'string') {
      const optionIndex = exercise.options.findIndex((option) => option === exercise.correctAnswer);
      if (optionIndex >= 0) {
        return {
          ...exercise,
          correctAnswer: optionIndex
        };
      }
    }

    return exercise;
  });
};

const normalizeLessonData = (lesson) => {
  if (!lesson?.content) return lesson;

  return {
    ...lesson,
    content: {
      ...lesson.content,
      exercises: normalizeExercises(lesson.content.exercises)
    }
  };
};

const PhysicsLesson = () => {
  const { classId, chapterId, lessonId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('theory');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lessonData, setLessonData] = useState(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        
        // Fetch from backend
        const response = await axios.get(
          `${API_BASE_URL}/lessons/class/${classId}/chapter/${chapterId}/lesson/${lessonId}`,
          { params: { subject: 'physics' } }
        );
        
        if (response.data) {
          setLessonData(normalizeLessonData(response.data));
        } else {
          // Fallback to frontend data
          const classData = physicsLessons[classId];
          if (classData) {
            const chapter = classData.chapters.find(ch => ch.id === parseInt(chapterId));
            if (chapter) {
              const lesson = chapter.lessons.find(l => l.id === parseInt(lessonId));
              if (lesson) {
                setLessonData({
                  id: `vatly-${classId}-${chapterId}-${lessonId}`,
                  title: lesson.title,
                  classId: parseInt(classId),
                  chapterId: parseInt(chapterId),
                  lessonNumber: parseInt(lessonId),
                  content: {
                    theory: `<h2>${lesson.title}</h2><p>Nội dung dữ liệu khoa học đang được giải nén...</p>`,
                    examples: [],
                    exercises: []
                  }
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
        // Use fallback data
        const classData = physicsLessons[classId];
        if (classData) {
          const chapter = classData.chapters.find(ch => ch.id === parseInt(chapterId));
          if (chapter) {
            const lesson = chapter.lessons.find(l => l.id === parseInt(lessonId));
            if (lesson) {
              setLessonData({
                id: `vatly-${classId}-${chapterId}-${lessonId}`,
                title: lesson.title,
                classId: parseInt(classId),
                chapterId: parseInt(chapterId),
                lessonNumber: parseInt(lessonId),
                content: {
                  theory: `<h2>${lesson.title}</h2><p>Dữ liệu lý thuyết dự phòng (offline mode).</p>`,
                  examples: [],
                  exercises: []
                }
              });
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [classId, chapterId, lessonId]);

  const exercises = lessonData?.content?.exercises || [];
  const currentExercise = exercises[currentQuizIndex];

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleCheckAnswer = () => {
    const isCorrect = selectedAnswer === currentExercise.correctAnswer;
    
    setQuizAnswers([...quizAnswers, {
      questionIndex: currentQuizIndex,
      selectedAnswer,
      isCorrect
    }]);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < exercises.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleFinish = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userEmail = user?.email || user?.uid;
      
      if (userEmail) {
        const progressData = {
          userId: userEmail,
          programId: 'physics',
          classId: parseInt(classId),
          chapterId: parseInt(chapterId),
          lessonId: parseInt(lessonId),
          score: score,
          totalQuestions: exercises.length,
          completed: true
        };

        await axios.post(`${API_BASE_URL}/users/submit-physics-lesson`, progressData);
        
        const lessonKey = `${classId}-${chapterId}-${lessonId}`;
        const savedProgress = JSON.parse(localStorage.getItem(`physics-progress-${classId}`) || '{}');
        savedProgress[lessonKey] = 'completed';
        localStorage.setItem(`physics-progress-${classId}`, JSON.stringify(savedProgress));
      }
    } catch (error) {
      console.error('❌ Error saving progress:', error);
    }
    
    navigate(`/physics-class/${classId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative">
        <SolarSystemBackground />
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 relative flex items-center justify-center">
               <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin"></div>
               <Orbit className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-cyan-400 mt-4 tracking-wider">ĐANG GIẢI MÃ DỮ LIỆU...</h2>
         </div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative">
        <SolarSystemBackground />
        <div className="relative z-10 max-w-lg w-full px-4">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-red-500/30 rounded-3xl p-10 text-center shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-white mb-4">Tệp Bị Lỗi</h2>
            <p className="text-slate-400 mb-8 font-medium">Lệnh truy cập bị từ chối hoặc máy chủ không phản hồi tệp lý thuyết này.</p>
            <button
              onClick={() => navigate(`/physics-class/${classId}`)}
              className="w-full px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold transition-all"
            >
              Hủy bỏ & Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-slate-950 pb-20">
      <div className="fixed inset-0 z-0">
         <SolarSystemBackground />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950"></div>
      </div>

      <div className="relative z-10 container mx-auto max-w-5xl px-4 pt-8">
        {/* Header - Holographic Style */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/physics-class/${classId}`)}
            className="group flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium mb-6 bg-cyan-950/30 px-5 py-2.5 rounded-full border border-cyan-800/50 w-fit backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            NGẮT KẾT NỐI (QUAY LẠI)
          </button>
          
          <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-6 md:p-8 flex items-center gap-6 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
            <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[inset_0_0_20px_rgba(6,182,212,0.2)]">
               <TerminalSquare className="w-10 h-10 text-cyan-400" />
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs font-bold tracking-widest mb-2 border border-slate-700">
                 TỆP DỮ LIỆU {classId}.{chapterId}.{lessonId}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                 {lessonData.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Console Body */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
          {/* Cyberpunk Tabs */}
          <div className="flex border-b border-slate-700/50 bg-slate-950/50">
            <button
              onClick={() => setActiveTab('theory')}
              className={`flex-1 py-5 px-6 font-bold tracking-wider transition-all focus:outline-none flex items-center justify-center gap-3 ${
                activeTab === 'theory'
                  ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400 shadow-[inset_0_-20px_20px_-20px_rgba(34,211,238,0.3)]'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              LÝ THUYẾT TRẠM
            </button>
            {exercises.length > 0 && (
              <button
                onClick={() => setActiveTab('exercises')}
                className={`flex-1 py-5 px-6 font-bold tracking-wider transition-all focus:outline-none flex items-center justify-center gap-3 ${
                  activeTab === 'exercises'
                    ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-400 shadow-[inset_0_-20px_20px_-20px_rgba(52,211,153,0.3)]'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <Activity className="w-5 h-5" />
                MÔ PHỎNG / BÀI TẬP ({exercises.length})
              </button>
            )}
          </div>

          <div className="p-6 md:p-10 relative">
            {/* Theory Tab */}
            {activeTab === 'theory' && (
              <div className="animate-fade-in relative">
                {/* 
                  Enforcing text colors for theory html injection since it comes from DB.
                  Applying !text-white / !text-slate-300 overrides. 
                */}
                <div 
                  className="prose prose-lg prose-invert max-w-none text-slate-300 prose-headings:text-white prose-a:text-cyan-400 prose-strong:text-cyan-300 prose-code:text-emerald-400 [&_*]:!text-slate-200 [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_strong]:!text-cyan-300"
                  dangerouslySetInnerHTML={{ __html: lessonData.content.theory }}
                />
                
                {exercises.length > 0 ? (
                  <div className="mt-12 text-center pt-8 border-t border-slate-800/50">
                    <button
                      onClick={() => setActiveTab('exercises')}
                      className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 rounded-2xl font-black text-lg shadow-[0_0_30px_rgba(52,211,153,0.3)] hover:shadow-[0_0_50px_rgba(52,211,153,0.5)] transition-all transform hover:-translate-y-1"
                    >
                      BẮT ĐẦU KIỂM TRA MÔ PHỎNG
                    </button>
                  </div>
                ) : (
                  <div className="mt-12 text-center pt-8 border-t border-slate-800/50">
                    <button
                      onClick={handleFinish}
                      className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-2xl font-bold shadow-lg transition-all"
                    >
                      XÁC NHẬN ĐÃ ĐỌC
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Exercises Tab */}
            {activeTab === 'exercises' && !isCompleted && (
              <div className="max-w-3xl mx-auto animate-fade-in">
                {/* Progress HUD */}
                <div className="mb-10">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-slate-500" />
                       <span className="text-sm font-bold text-slate-400 tracking-wider">
                         GIAO THỨC {currentQuizIndex + 1} / {exercises.length}
                       </span>
                    </div>
                    <span className="text-sm font-black text-emerald-400 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                      SCORE: {score} X
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden shadow-inner flex">
                    <div
                      className="bg-emerald-500 h-1.5 shadow-[0_0_10px_rgba(52,211,153,0.8)] transition-all duration-500"
                      style={{ width: `${((currentQuizIndex + 1) / exercises.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Question Hologram */}
                <div className="bg-[#0f172a] border border-slate-700 rounded-3xl p-8 mb-8 relative shadow-2xl">
                  {/* Decorative corners */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500 rounded-tl-2xl"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500 rounded-tr-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500 rounded-bl-2xl"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500 rounded-br-2xl"></div>

                  <h3 className="text-xl md:text-2xl font-bold text-white mb-8 leading-snug">
                    {currentExercise?.question}
                  </h3>
                  
                  <div className="space-y-4">
                    {currentExercise?.options?.map((option, index) => {
                       let stateClass = "border-slate-700 bg-slate-800/40 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-800";
                       let idxClass = "bg-slate-700 text-slate-400";

                       if (showResult) {
                         if (index === currentExercise.correctAnswer) {
                            stateClass = "border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_15px_rgba(52,211,153,0.2)]";
                            idxClass = "bg-emerald-500 text-slate-900";
                         } else if (index === selectedAnswer) {
                            stateClass = "border-red-500 bg-red-500/10 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
                            idxClass = "bg-red-500 text-white";
                         } else {
                            stateClass = "border-slate-800 bg-slate-900/50 text-slate-500 opacity-50";
                         }
                       } else if (selectedAnswer === index) {
                         stateClass = "border-cyan-500 bg-cyan-500/10 text-cyan-50 shadow-[0_0_15px_rgba(6,182,212,0.2)] scale-[1.01]";
                         idxClass = "bg-cyan-500 text-slate-900";
                       }

                       return (
                        <button
                          key={index}
                          onClick={() => !showResult && handleAnswerSelect(index)}
                          disabled={showResult}
                          className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${stateClass}`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black transition-colors ${idxClass}`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="flex-1 font-medium text-lg leading-relaxed">{option}</span>
                          
                          {showResult && index === currentExercise.correctAnswer && (
                            <CheckCircle className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                          )}
                          {showResult && index === selectedAnswer && index !== currentExercise.correctAnswer && (
                            <XCircle className="w-8 h-8 text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Info Panel after answering */}
                {showResult && (
                  <div className={`animate-slide-up rounded-2xl p-6 mb-8 border backdrop-blur-xl ${
                    selectedAnswer === currentExercise.correctAnswer
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      {selectedAnswer === currentExercise.correctAnswer ? (
                        <>
                          <CheckCircle className="w-6 h-6 text-emerald-400" />
                          <span className="font-bold text-emerald-400 tracking-wider">HỆ THỐNG XÁC NHẬN ĐÚNG!</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" />
                          <span className="font-bold text-red-400 tracking-wider">DỮ LIỆU CẢNH BÁO SAI</span>
                        </>
                      )}
                    </div>
                    {currentExercise.explanation && (
                      <p className="text-slate-300 font-medium leading-relaxed pl-9 border-l border-slate-700/50 py-1">
                        {currentExercise.explanation}
                      </p>
                    )}
                  </div>
                )}

                {/* Controls */}
                <div className="flex gap-4">
                  {!showResult && selectedAnswer !== null && (
                    <button
                      onClick={handleCheckAnswer}
                      className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-black tracking-widest hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all active:scale-95 text-lg"
                    >
                      XÁC NHẬN CHUỖI
                    </button>
                  )}
                  
                  {showResult && (
                    <button
                      onClick={handleNextQuestion}
                      className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-900 rounded-2xl font-black tracking-widest hover:shadow-[0_0_30px_rgba(52,211,153,0.4)] transition-all active:scale-95 text-lg"
                    >
                      {currentQuizIndex < exercises.length - 1 ? 'NẠP TIẾP TỤC DỮ LIỆU' : 'BÁO CÁO NHIỆM VỤ'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Completion Terminal Screen */}
            {isCompleted && (
              <div className="text-center py-16 animate-zoom-in max-w-2xl mx-auto">
                <div className="relative inline-block mb-8 group">
                   <div className="absolute inset-0 bg-emerald-500/30 blur-[50px] rounded-full"></div>
                   <div className="w-32 h-32 bg-slate-900 border-2 border-emerald-500 rounded-full flex items-center justify-center relative z-10 shadow-[inset_0_0_30px_rgba(52,211,153,0.3)]">
                      <Trophy className="w-16 h-16 text-emerald-400" />
                   </div>
                </div>
                
                <h2 className="text-3xl font-black text-white mb-2 tracking-widest">
                  GIAO THỨC HOÀN CHỈNH
                </h2>
                <p className="text-slate-400 font-medium mb-10 tracking-wide uppercase">
                  Dữ liệu ghi nhận: {score}/{exercises.length} chính xác
                </p>
                
                <div className="grid grid-cols-2 gap-6 max-w-md mx-auto mb-12">
                   <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group">
                      <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/20 to-transparent blur-xl pointer-events-none group-hover:from-emerald-500/40 transition-colors"></div>
                      <div className="text-4xl font-black text-emerald-400 relative z-10 mb-1">
                        {Math.round((score / exercises.length) * 100)}%
                      </div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest relative z-10">Độ Khớp</div>
                   </div>
                   <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group">
                      <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/20 to-transparent blur-xl pointer-events-none group-hover:from-cyan-500/40 transition-colors"></div>
                      <div className="text-4xl font-black text-cyan-400 relative z-10 mb-1">
                        +{score * 10}
                      </div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest relative z-10">Năng Lượng</div>
                   </div>
                </div>

                <button
                  onClick={handleFinish}
                  className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 rounded-3xl font-black shadow-[0_0_30px_rgba(52,211,153,0.4)] hover:shadow-[0_0_50px_rgba(52,211,153,0.6)] transition-all transform hover:-translate-y-1 active:scale-95 text-lg inline-flex items-center gap-3 tracking-widest"
                >
                  XÁC NHẬN LƯU VÀO CSDL
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsLesson;

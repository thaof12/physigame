import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { ArrowLeft, BookOpen, CheckCircle, XCircle, Trophy, Orbit, ShieldAlert, Sparkles, Route, ChevronRight, Lock, Lightbulb, Zap, Microscope, Telescope, Wind, Flame, Droplets, Heart } from 'lucide-react';
import { physicsLessons } from '../data/physicsLessons';
import SolarSystemBackground from '../../../components/animations/SolarSystemBackground';

const MIN_EXERCISE_COUNT = 4;

// Mascot mapping for each step type
const mascotMap = {
  theory: { emoji: '📚', icon: BookOpen, color: '#B87333' },
  question: { emoji: '❓', icon: Lightbulb, color: '#D4AF37' },
  '0': { emoji: '⚡', icon: Zap, character: '⚛️' },
  '1': { emoji: '🔬', icon: Microscope, character: '🧪' },
  '2': { emoji: '🌡️', icon: Flame, character: '🔥' },
  '3': { emoji: '💧', icon: Droplets, character: '❄️' },
  '4': { emoji: '🔭', icon: Telescope, character: '🌌' },
  '5': { emoji: '💨', icon: Wind, character: '🌪️' },
  '6': { emoji: '❤️', icon: Heart, character: '💓' }
};

const classThemes = {
  6: {
    focus: 'đo lường và chuyển động cơ bản',
    quantity: 'chiều dài, thời gian hoặc khối lượng',
    strategy: 'viết dữ kiện, đổi đơn vị và xác định đại lượng cần tìm'
  },
  7: {
    focus: 'ánh sáng và âm thanh',
    quantity: 'góc tới, góc phản xạ hoặc tần số',
    strategy: 'phân biệt hiện tượng và nêu đúng điều kiện xảy ra'
  },
  8: {
    focus: 'lực, áp suất và điện học cơ bản',
    quantity: 'lực, áp suất hoặc cường độ dòng điện',
    strategy: 'vẽ sơ đồ lực/mạch trước khi tính toán'
  },
  9: {
    focus: 'điện học, điện từ học và quang học',
    quantity: 'điện trở, hiệu điện thế hoặc tiêu cự',
    strategy: 'chọn đúng định luật và kiểm tra đơn vị ở kết quả cuối'
  },
  10: {
    focus: 'động lực học và nhiệt động lực học',
    quantity: 'vận tốc, gia tốc, động lượng hoặc nhiệt lượng',
    strategy: 'xác định hệ vật lý rồi mới áp dụng công thức bảo toàn'
  },
  11: {
    focus: 'điện trường, dòng điện và từ trường',
    quantity: 'cường độ điện trường, suất điện động hoặc cảm ứng từ',
    strategy: 'tách bài thành từng định luật nhỏ rồi nối kết quả'
  },
  12: {
    focus: 'dao động, sóng và vật lý lượng tử/hạt nhân',
    quantity: 'chu kỳ, tần số, bước sóng hoặc năng lượng liên kết',
    strategy: 'xác định mô hình dao động/sóng trước, sau đó thay số'
  }
};

const chapterFocusMap = {
  6: { 1: ['đo lường', 'đơn vị SI', 'sai số'], 2: ['chuyển động', 'tốc độ', 'đồ thị'] },
  7: { 1: ['ánh sáng', 'phản xạ', 'khúc xạ'], 2: ['âm thanh', 'tần số', 'độ cao'], 3: ['nhiệt năng', 'truyền nhiệt', 'nhiệt lượng'] },
  8: { 1: ['lực', 'quán tính', 'ma sát'], 2: ['áp suất', 'lực đẩy', 'chất lỏng'], 3: ['dòng điện', 'điện áp', 'điện trở'] },
  9: { 1: ['điện trở', 'công suất', 'điện năng'], 2: ['từ trường', 'nam châm điện', 'cảm ứng điện từ'], 3: ['quang học', 'tán sắc', 'thấu kính'] },
  10: { 1: ['động học', 'vận tốc', 'gia tốc'], 2: ['định luật Newton', 'lực', 'quán tính'], 3: ['momen lực', 'cân bằng', 'vật rắn'], 4: ['động lượng', 'cơ năng', 'bảo toàn'], 5: ['chất khí', 'đẳng nhiệt', 'đẳng tích'], 6: ['nhiệt động lực học', 'nội năng', 'nguyên lý'] },
  11: { 1: ['điện tích', 'điện trường', 'tụ điện'], 2: ['dòng điện không đổi', 'suất điện động', 'toàn mạch'], 3: ['dòng điện trong môi trường', 'kim loại', 'bán dẫn'], 4: ['từ trường', 'cảm ứng từ', 'lực Lorenxơ'], 5: ['cảm ứng điện từ', 'từ thông', 'tự cảm'] },
  12: { 1: ['dao động', 'con lắc', 'chu kỳ'], 2: ['sóng cơ', 'giao thoa', 'sóng dừng'], 3: ['xoay chiều', 'công suất', 'máy biến áp'], 4: ['điện từ trường', 'sóng điện từ', 'vô tuyến'], 5: ['sóng ánh sáng', 'quang phổ', 'tia X'], 6: ['lượng tử ánh sáng', 'quang điện', 'photon'], 7: ['hạt nhân', 'phân hạch', 'nhiệt hạch'] }
};

const normalizeQuestionKey = (question = '') =>
  String(question)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[?.!,;:]/g, '');

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

const createSupplementalExercises = ({ classId, chapterId, lessonTitle, needed }) => {
  const grade = Number(classId);
  const theme = classThemes[grade] || classThemes[10];
  const chapterLabel = `Chương ${chapterId}`;

  const chapterTopics = chapterFocusMap[grade]?.[Number(chapterId)] || [theme.focus, theme.quantity, theme.strategy];
  const [topicA, topicB, topicC] = chapterTopics;

  const bank = [
    {
      question: `Trong bài "${lessonTitle}" (${chapterLabel}), bước đầu nào phù hợp nhất để giải đúng phần ${topicA}?`,
      options: [
        'Thay số ngay vào công thức dài nhất',
        'Xác định dữ kiện, đại lượng cần tìm và đơn vị tương ứng',
        'Bỏ qua phần giả thiết để tiết kiệm thời gian',
        'Chọn đáp án theo cảm giác gần đúng'
      ],
      correctAnswer: 1,
      explanation: `Ở lớp ${classId}, cách làm ổn định là đọc dữ kiện kỹ, xác định mục tiêu và chuẩn hóa đơn vị trước khi tính.`
    },
    {
      question: `${chapterLabel} lớp ${classId}: khi xử lý nội dung ${topicB}, yếu tố nào cần ghi rõ để tránh sai điểm?`,
      options: [
        `Đơn vị của đại lượng ${theme.quantity}`,
        'Chỉ cần ghi đáp án số, không cần đơn vị',
        'Tên bài học',
        'Màu sắc của sơ đồ minh họa'
      ],
      correctAnswer: 0,
      explanation: `Đơn vị SI là bắt buộc để tránh sai lệch kết quả và thể hiện đúng chuẩn trình bày bài vật lý.`
    },
    {
      question: `Với nhóm câu hỏi về ${topicC}, chiến lược nào giúp tránh nhầm khái niệm giữa các đáp án?`,
      options: [
        'Ghi nhớ máy móc toàn bộ định nghĩa',
        'Làm thật nhanh và bỏ qua kiểm tra lại',
        theme.strategy,
        'Chỉ tập trung vào mẹo loại trừ đáp án'
      ],
      correctAnswer: 2,
      explanation: `Các câu hỏi lý thuyết cần tư duy theo bước. Làm tuần tự giúp giảm lỗi nhầm khái niệm và đơn vị.`
    },
    {
      question: `Ở ${chapterLabel}, khi gặp câu mới chưa từng luyện trong phần ${topicA}, nên chọn hướng giải nào?`,
      options: [
        'Chọn công thức có nhiều ký hiệu nhất',
        'Đối chiếu hiện tượng, điều kiện áp dụng rồi mới dùng công thức',
        'Dùng cùng một công thức cho mọi dạng bài',
        'Ưu tiên công thức học gần đây nhất'
      ],
      correctAnswer: 1,
      explanation: `Mỗi định luật có điều kiện áp dụng riêng. Đối chiếu hiện tượng trước giúp chọn công cụ giải đúng bản chất.`
    },
    {
      question: `Tình huống nào thể hiện cách học đúng cho bài "${lessonTitle}" ở lớp ${classId}?`,
      options: [
        'Làm câu nào cũng dùng chung một mẫu giải',
        `Đọc kỹ yêu cầu, gạch chân dữ kiện liên quan đến ${topicB} rồi mới chọn công thức`,
        'Bỏ qua giải thích vì chỉ cần chọn đáp án',
        'Đổi đơn vị sau cùng nếu còn thời gian'
      ],
      correctAnswer: 1,
      explanation: 'Kỹ thuật gạch chân dữ kiện theo chủ đề giúp tránh sai do đọc lướt đề và chọn sai định luật.'
    },
    {
      question: `Trong lộ trình câu hỏi ${chapterLabel}, dấu hiệu nào cho thấy bạn đã nắm chắc kiến thức ${topicC}?`,
      options: [
        'Nhớ đáp án mẫu của bài trước',
        'Giải được câu biến thể và giải thích vì sao các phương án khác sai',
        'Chỉ cần làm đúng 1 câu bất kỳ',
        'Làm nhanh hơn bạn bè'
      ],
      correctAnswer: 1,
      explanation: 'Hiểu bản chất là phân biệt đúng-sai bằng lập luận vật lý, không phụ thuộc việc học thuộc đáp án.'
    }
  ];

  return bank.slice(0, Math.max(0, needed));
};

const buildLessonExercises = ({ exercises, classId, chapterId, lessonTitle }) => {
  const normalized = normalizeExercises(exercises || []);
  const seen = new Set();
  const deduped = normalized.filter((exercise) => {
    const key = normalizeQuestionKey(exercise?.question);
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });

  if (deduped.length >= MIN_EXERCISE_COUNT) {
    return deduped;
  }

  const supplements = createSupplementalExercises({
    classId,
    chapterId,
    lessonTitle,
    needed: MIN_EXERCISE_COUNT - deduped.length
  }).filter((exercise) => {
    const key = normalizeQuestionKey(exercise?.question);
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });

  return [...deduped, ...supplements];
};

const PhysicsLesson = () => {
  const { classId, chapterId, lessonId } = useParams();
  const navigate = useNavigate();
  const lessonKey = `${classId}-${chapterId}-${lessonId}`;
  const classProgressKey = `physics-progress-${classId}`;
  const lessonDraftKey = `physics-lesson-draft-${lessonKey}`;
  const [loading, setLoading] = useState(true);
  const [journeyStep, setJourneyStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionSaved, setCompletionSaved] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
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

  const exercises = useMemo(() => {
    return buildLessonExercises({
      exercises: lessonData?.content?.exercises || [],
      classId,
      chapterId,
      lessonTitle: lessonData?.title || `Bài ${lessonId}`
    });
  }, [lessonData, classId, chapterId, lessonId]);

  const totalSteps = exercises.length + 1;
  const isTheoryStep = journeyStep === 0;
  const currentQuizIndex = Math.max(0, journeyStep - 1);
  const currentExercise = exercises[currentQuizIndex];
  const contentStageKey = isCompleted
    ? 'completed'
    : isTheoryStep
      ? 'theory'
      : `question-${currentQuizIndex}-${showResult ? 'result' : 'quiz'}`;
  const progressPercent = isCompleted ? 100 : Math.round((journeyStep / Math.max(totalSteps - 1, 1)) * 100);
  const correctCount = quizAnswers.filter((item) => item.isCorrect).length;

  const persistCompletion = async () => {
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
          score,
          totalQuestions: exercises.length,
          completed: true
        };

        await axios.post(`${API_BASE_URL}/users/submit-physics-lesson`, progressData);
      }
    } catch (error) {
      console.error('❌ Error saving progress to backend:', error);
    } finally {
      const savedProgress = JSON.parse(localStorage.getItem(classProgressKey) || '{}');
      savedProgress[lessonKey] = 'completed';
      localStorage.setItem(classProgressKey, JSON.stringify(savedProgress));
      localStorage.removeItem(lessonDraftKey);
      setCompletionSaved(true);
      setLastSavedAt(new Date().toISOString());
    }
  };

  useEffect(() => {
    const savedDraft = JSON.parse(localStorage.getItem(lessonDraftKey) || 'null');
    if (!savedDraft) return;

    setJourneyStep(savedDraft.journeyStep || 0);
    setScore(savedDraft.score || 0);
    setQuizAnswers(Array.isArray(savedDraft.quizAnswers) ? savedDraft.quizAnswers : []);
    setIsCompleted(Boolean(savedDraft.isCompleted));
    setLastSavedAt(savedDraft.lastSavedAt || null);
  }, [lessonDraftKey]);

  useEffect(() => {
    if (loading || !lessonData || completionSaved) return;

    const payload = {
      journeyStep,
      score,
      quizAnswers,
      isCompleted,
      lastSavedAt: new Date().toISOString()
    };

    localStorage.setItem(lessonDraftKey, JSON.stringify(payload));
    setLastSavedAt(payload.lastSavedAt);
  }, [loading, lessonData, completionSaved, journeyStep, score, quizAnswers, isCompleted, lessonDraftKey]);

  useEffect(() => {
    if (!isCompleted || completionSaved || exercises.length === 0) return;
    persistCompletion();
  }, [isCompleted, completionSaved, exercises.length]);

  const resetQuestionState = () => {
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleCheckAnswer = () => {
    if (!currentExercise) return;

    const isCorrect = selectedAnswer === currentExercise.correctAnswer;

    setQuizAnswers((prev) => [
      ...prev,
      {
        questionIndex: currentQuizIndex,
        selectedAnswer,
        isCorrect,
        skipped: false
      }
    ]);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setShowResult(true);
  };

  const handleSkipQuestion = () => {
    setQuizAnswers((prev) => [
      ...prev,
      {
        questionIndex: currentQuizIndex,
        selectedAnswer: null,
        isCorrect: false,
        skipped: true
      }
    ]);

    if (journeyStep < totalSteps - 1) {
      setJourneyStep((prev) => prev + 1);
      resetQuestionState();
      return;
    }

    setIsCompleted(true);
  };

  const handleNextQuestion = () => {
    if (journeyStep < totalSteps - 1) {
      setJourneyStep((prev) => prev + 1);
      resetQuestionState();
    } else {
      setIsCompleted(true);
    }
  };

  const handleStartRoadmap = () => {
    setJourneyStep(1);
    resetQuestionState();
  };

  const handleFinish = async () => {
    if (!completionSaved) {
      await persistCompletion();
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
    <div className="min-h-screen relative bg-[#F8F5F0] pb-20">
      <div className="fixed inset-0 z-0 opacity-25 pointer-events-none">
        <SolarSystemBackground />
      </div>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-16 left-8 w-72 h-72 rounded-full blur-[90px] bg-amber-200/45" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full blur-[100px] bg-orange-100/45" />
      </div>

      <div className="relative z-10 container mx-auto max-w-5xl px-4 pt-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/physics-class/${classId}`)}
            className="group flex items-center gap-2 text-[#8C5523] hover:text-[#6E421A] transition-colors font-bold mb-5 bg-white px-4 py-2 rounded-full border border-[#B87333]/20 w-fit shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Quay lại lớp học
          </button>

          <div className="bg-white/95 rounded-3xl border border-[#B87333]/15 p-5 md:p-7 shadow-[0_12px_40px_-18px_rgba(184,115,51,0.3)] animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B87333]/10 text-[#8C5523] text-xs font-black tracking-wider mb-2">
                  <Route className="w-3 h-3" /> ROADMAP BÀI HỌC
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-[#4A3728] leading-tight">{lessonData.title}</h1>
                <p className="text-slate-500 mt-1 font-medium">Lớp {classId} • Chương {chapterId} • Bài {lessonId}</p>
                {lastSavedAt && (
                  <p className="text-xs text-emerald-700 font-semibold mt-2 animate-fade-in">
                    Tự động lưu lúc {new Date(lastSavedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>

              <div className="bg-[#FDF7EE] border border-[#B87333]/20 rounded-2xl px-4 py-3 min-w-[220px]">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-black text-[#8C5523]">Tiến độ</span>
                  <span className="font-black text-[#B87333]">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-[#ECDCC5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#B87333] to-[#D4AF37] transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 font-semibold">Đúng: {correctCount}/{quizAnswers.length || exercises.length}</p>
              </div>
            </div>
          </div>
        </div>

        {!isCompleted && (
          <div className="bg-white/90 rounded-3xl border border-[#B87333]/10 p-4 md:p-8 shadow-[0_8px_30px_-15px_rgba(184,115,51,0.25)] mb-6 animate-fade-in">
            {/* Zigzag Roadmap Journey */}
            <div className="relative py-8">
              {/* SVG Connector Lines */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
                viewBox={`0 0 100 ${Math.max(totalSteps * 160, 260)}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#B87333" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                
                {/* Zigzag connecting path */}
                {Array.from({ length: Math.max(0, totalSteps - 1) }, (_, idx) => {
                  const isLeftSide = idx % 2 === 0;
                  const x1 = isLeftSide ? 22 : 78;
                  const y1 = 70 + idx * 160;
                  const x2 = isLeftSide ? 78 : 22;
                  const y2 = y1 + 160;
                  
                  return (
                    <g key={`connector-${idx}`}>
                      {/* Curved connecting line */}
                      <path
                        d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + 14} ${x2} ${y2}`}
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                      />
                      {/* Animated arrow marker */}
                      <circle cx={x1 + (x2 - x1) * 0.5} cy={y1 + (y2 - y1) * 0.5 + 10} r="1.8" fill="#D4AF37" opacity="0.5">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </g>
                  );
                })}
              </svg>

              {/* Roadmap Steps */}
              <div className="relative z-10 space-y-24">
                {Array.from({ length: totalSteps }, (_, idx) => {
                  const completed = idx < journeyStep;
                  const current = idx === journeyStep;
                  const label = idx === 0 ? 'Lý thuyết' : `Câu ${idx}`;
                  const locked = idx > journeyStep;
                  const isLeftSide = idx % 2 === 0;
                  const mascot = idx === 0 ? mascotMap.theory : mascotMap[`${idx % 7}`] || mascotMap.question;

                  return (
                    <div
                      key={`step-${idx}`}
                      className={`flex ${isLeftSide ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row items-center gap-6 transition-all duration-300`}
                      style={{ animation: `fadeInUp 0.6s ease ${idx * 100}ms both` }}
                    >
                      {/* Mascot Character */}
                      <div className={`flex-shrink-0 ${isLeftSide ? 'md:order-1' : 'md:order-2'}`}>
                        <div className={`text-5xl md:text-6xl transition-all duration-300 transform ${
                          current ? 'scale-125 animate-bounce' : completed ? 'scale-100 opacity-100' : 'scale-75 opacity-60'
                        }`}>
                          {mascot.emoji}
                        </div>
                      </div>

                      {/* Step Card */}
                      <div
                        className={`flex-1 roadmap-step-card rounded-2xl border-2 p-5 md:p-6 transition-all duration-300 ${
                          completed
                            ? 'bg-emerald-50 border-emerald-300 shadow-[0_8px_20px_-10px_rgba(16,185,129,0.3)]'
                            : current
                              ? 'bg-[#FFF5E6] border-[#D4AF37] shadow-[0_12px_40px_-15px_rgba(184,115,51,0.5)] scale-105'
                              : locked
                                ? 'bg-slate-50 border-slate-300 opacity-60'
                                : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm ${
                                completed
                                  ? 'bg-emerald-500 text-white'
                                  : current
                                    ? 'bg-[#D4AF37] text-[#4A3728]'
                                    : locked
                                      ? 'bg-slate-300 text-slate-600'
                                      : 'bg-slate-100 text-slate-500'
                              }`}>
                                {idx}
                              </span>
                              <h3 className={`font-black text-lg ${current ? 'text-[#8C5523]' : 'text-slate-700'}`}>
                                {label}
                              </h3>
                            </div>
                            <p className={`text-sm font-semibold ${
                              current ? 'text-[#B87333]' : completed ? 'text-emerald-700' : 'text-slate-500'
                            }`}>
                              {completed ? '✓ Đã hoàn thành' : current ? '⚡ Đang học' : locked ? '🔒 Chờ mở khóa' : '⏳ Sẵn sàng'}
                            </p>
                          </div>

                          {/* Status Icon */}
                          <div className="flex-shrink-0">
                            {locked ? (
                              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-slate-600" />
                              </div>
                            ) : completed ? (
                              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse">
                                <CheckCircle className="w-5 h-5 text-white" />
                              </div>
                            ) : current ? (
                              <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center animate-spin" style={{ animationDuration: '2s' }}>
                                <Sparkles className="w-5 h-5 text-white" />
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/95 rounded-3xl border border-[#B87333]/15 p-5 md:p-8 shadow-[0_16px_45px_-20px_rgba(184,115,51,0.35)]">
          <div key={contentStageKey} className="stage-transition">
          {!isCompleted && isTheoryStep && (
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs mb-4">
                <Sparkles className="w-3 h-3" /> Bước 1: Nắm lý thuyết
              </div>

              <div
                className="prose prose-lg max-w-none text-slate-700 prose-headings:text-[#4A3728] prose-strong:text-[#8C5523]"
                dangerouslySetInnerHTML={{ __html: lessonData.content.theory }}
              />

              <div className="mt-8 pt-6 border-t border-[#EBDCC9] flex justify-end">
                <button
                  onClick={handleStartRoadmap}
                  className="px-7 py-3 bg-gradient-to-r from-[#B87333] to-[#D4AF37] text-white rounded-xl font-black hover:shadow-lg transition-all inline-flex items-center gap-2"
                >
                  Tiếp theo: Câu hỏi <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {!isCompleted && !isTheoryStep && currentExercise && (
            <div className="max-w-3xl mx-auto animate-fade-in-up">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF4E5] text-[#B87333] font-black text-sm">
                  CÂU HỎI {currentQuizIndex + 1}/{exercises.length}
                </div>
                <span className="text-sm text-slate-500 font-bold">Mỗi bước đều mở khóa bước tiếp theo</span>
              </div>

              <div className="bg-[#FCFAF5] border border-[#E9DBC6] rounded-3xl p-6 md:p-8 shadow-inner mb-6">
                <h3 className="text-xl md:text-2xl font-black text-[#334155] leading-snug mb-6">
                  {currentExercise.question}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentExercise.options?.map((option, index) => {
                    let stateClass = 'border-[#E7D7C1] bg-[#FBE8DA] text-[#334155] hover:bg-[#F6DDCB]';
                    let bubbleClass = 'bg-white/90 text-[#8C5523]';

                    if (showResult) {
                      if (index === currentExercise.correctAnswer) {
                        stateClass = 'border-emerald-300 bg-emerald-50 text-emerald-800';
                        bubbleClass = 'bg-emerald-500 text-white';
                      } else if (index === selectedAnswer) {
                        stateClass = 'border-rose-300 bg-rose-50 text-rose-700';
                        bubbleClass = 'bg-rose-500 text-white';
                      } else {
                        stateClass = 'border-slate-200 bg-slate-50 text-slate-400';
                        bubbleClass = 'bg-slate-200 text-slate-500';
                      }
                    } else if (selectedAnswer === index) {
                      stateClass = 'border-[#B87333] bg-[#FFF1E0] text-[#4A3728] shadow-[0_6px_20px_-10px_rgba(184,115,51,0.5)]';
                      bubbleClass = 'bg-[#B87333] text-white';
                    }

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => !showResult && handleAnswerSelect(index)}
                        disabled={showResult}
                        className={`rounded-2xl border-2 p-4 text-left transition-all duration-200 flex items-center gap-3 ${stateClass}`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${bubbleClass}`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="font-semibold leading-snug">{option}</span>
                        {showResult && index === currentExercise.correctAnswer && <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />}
                        {showResult && index === selectedAnswer && index !== currentExercise.correctAnswer && <XCircle className="w-5 h-5 text-rose-500 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {showResult && (
                <div
                  className={`animate-slide-up rounded-2xl p-4 mb-5 border ${
                    selectedAnswer === currentExercise.correctAnswer
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {selectedAnswer === currentExercise.correctAnswer ? (
                      <CheckCircle className="w-5 h-5 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 mt-0.5" />
                    )}
                    <div>
                      <p className="font-black mb-1">
                        {selectedAnswer === currentExercise.correctAnswer ? 'Chính xác, bạn đã mở khóa bước tiếp theo.' : 'Chưa đúng, nhưng bạn có thể tiếp tục roadmap.'}
                      </p>
                      {currentExercise.explanation && <p className="font-medium">{currentExercise.explanation}</p>}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                {!showResult && (
                  <button
                    type="button"
                    onClick={handleSkipQuestion}
                    className="px-5 py-3 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                  >
                    Bỏ qua
                  </button>
                )}

                {!showResult && (
                  <button
                    type="button"
                    onClick={handleCheckAnswer}
                    disabled={selectedAnswer === null}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#B87333] to-[#D4AF37] text-white font-black disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                  >
                    Xác nhận
                  </button>
                )}

                {showResult && (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black hover:shadow-lg transition-all"
                  >
                    {currentQuizIndex < exercises.length - 1 ? 'Tiếp theo' : 'Hoàn tất bài'}
                  </button>
                )}
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="text-center py-10 animate-fade-in-up max-w-2xl mx-auto">
              <div className="w-24 h-24 rounded-full bg-[#FFF2E1] border-2 border-[#D4AF37] flex items-center justify-center mx-auto mb-5 animate-pulse-soft">
                <Trophy className="w-12 h-12 text-[#B87333]" />
              </div>

              <h2 className="text-3xl font-black text-[#4A3728] mb-2">Hoàn thành roadmap bài học</h2>
              <p className="text-slate-600 font-medium mb-8">Bạn trả lời đúng {score}/{exercises.length} câu hỏi.</p>
              <p className="text-sm font-bold text-emerald-700 mb-6 animate-pulse-soft">
                {completionSaved ? 'Tiến độ đã được lưu và đánh dấu hoàn thành.' : 'Đang lưu tiến độ hoàn thành...'}
              </p>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                <div className="rounded-2xl bg-[#FDF7EE] border border-[#EBDCC9] p-5">
                  <p className="text-3xl font-black text-[#B87333]">{Math.round((score / Math.max(exercises.length, 1)) * 100)}%</p>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-black">Độ chính xác</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5">
                  <p className="text-3xl font-black text-emerald-600">{score}</p>
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-black">Câu đúng</p>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="px-8 py-3 bg-gradient-to-r from-[#B87333] to-[#D4AF37] text-white rounded-2xl font-black hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!completionSaved}
              >
                Lưu tiến độ và quay lại lớp
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      <style>{`
        .roadmap-step-card {
          position: relative;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .stage-transition {
          animation: stageEnter 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
          transform-origin: top center;
        }

        @keyframes stageEnter {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.985);
            filter: blur(1.5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .roadmap-step-card:hover {
          transform: translateX(-4px);
          box-shadow: 0 12px 40px -15px rgba(184, 115, 51, 0.4) !important;
        }

        /* Zigzag alternating positions */
        @media (min-width: 768px) {
          .roadmap-step-card {
            max-width: 480px;
          }
        }

        /* Mascot bouncing animation */
        @keyframes mascotBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        /* Zigzag path animation */
        @keyframes zigzagFlow {
          0% {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          100% {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }

        svg path {
          animation: zigzagFlow 3s ease-in-out infinite;
        }

        /* Card entrance animation */
        @keyframes slideInCard {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Pulse for current step */
        @keyframes currentStepPulse {
          0%, 100% {
            box-shadow: 0 12px 40px -15px rgba(184, 115, 51, 0.5);
          }
          50% {
            box-shadow: 0 12px 60px -10px rgba(184, 115, 51, 0.8);
          }
        }

        .roadmap-current-node {
          animation: currentStepPulse 2s ease-in-out infinite;
        }

        /* Glow effect on completed steps */
        .bg-emerald-50.border-emerald-300 {
          animation: completedGlow 2s ease-in-out infinite;
        }

        @keyframes completedGlow {
          0%, 100% {
            box-shadow: 0 8px 20px -10px rgba(16, 185, 129, 0.3);
          }
          50% {
            box-shadow: 0 8px 30px -5px rgba(16, 185, 129, 0.5);
          }
        }

        /* Mascot animation */
        @keyframes mascotHop {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(-2deg); }
          75% { transform: translateY(-8px) rotate(2deg); }
        }

        .animate-bounce {
          animation: mascotHop 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PhysicsLesson;

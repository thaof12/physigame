import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { ArrowLeft, BookOpen, CheckCircle, XCircle, Trophy, Play, ExternalLink } from 'lucide-react';
import { physicsLessons } from '../data/physicsLessons';
import { getChapterVideoDefaults } from '../data/chapterVideoCatalog';
import { useAuth } from '../../../contexts/AuthContext';

const stripHtmlTags = (html = '') => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const extractTheoryTopics = (theoryHtml = '') => {
  const topics = [];
  const headingRegex = /<h[2-4][^>]*>(.*?)<\/h[2-4]>/gi;
  let match = headingRegex.exec(theoryHtml);

  while (match) {
    const topic = stripHtmlTags(match[1]);
    if (topic) {
      topics.push(topic);
    }
    match = headingRegex.exec(theoryHtml);
  }

  return topics;
};

const buildSimilarTheoryQuestions = (lesson, topics) => {
  const lessonTitle = lesson?.title || 'bài học này';
  const firstTopic = topics[0] || lessonTitle;

  return [
    `Khái niệm cốt lõi của "${firstTopic}" là gì và khi nào nên áp dụng?`,
    `Hãy nêu một ví dụ thực tế minh họa cho "${lessonTitle}" trong đời sống hằng ngày.`,
    `So sánh "${firstTopic}" với một hiện tượng vật lý gần giống về bản chất.`
  ];
};

const convertToEmbedUrl = (rawUrl = '') => {
  const url = String(rawUrl || '').trim();
  if (!url) {
    return '';
  }

  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '').trim();
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/shorts/')) {
        const videoId = parsed.pathname.split('/').filter(Boolean)[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }

      const videoId = parsed.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    return url;
  } catch {
    return url;
  }
};

const normalizeVideoCollection = (rawVideos = []) => {
  if (!Array.isArray(rawVideos)) {
    return [];
  }

  return rawVideos
    .map((video, index) => {
      if (typeof video === 'string') {
        const cleanUrl = video.trim();
        if (!cleanUrl) {
          return null;
        }
        return {
          title: `Video ${index + 1}`,
          url: cleanUrl,
          embedUrl: convertToEmbedUrl(cleanUrl)
        };
      }

      if (video && typeof video === 'object') {
        const cleanUrl = String(video.url || '').trim();
        if (!cleanUrl) {
          return null;
        }
        return {
          title: String(video.title || `Video ${index + 1}`).trim(),
          url: cleanUrl,
          embedUrl: convertToEmbedUrl(cleanUrl)
        };
      }

      return null;
    })
    .filter(Boolean);
};

const parseVideoEditorValue = (value = '') => {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split('|').map((item) => item.trim());
      const hasTitleAndUrl = parts.length > 1;
      const title = hasTitleAndUrl ? parts[0] : `Video ${index + 1}`;
      const url = hasTitleAndUrl ? parts.slice(1).join('|') : parts[0];

      return {
        title,
        url
      };
    })
    .filter((item) => item.url);
};

const stringifyVideoEditorValue = (videos = []) => {
  if (!Array.isArray(videos) || videos.length === 0) {
    return '';
  }

  return videos
    .map((video, index) => {
      if (typeof video === 'string') {
        return `Video ${index + 1}|${video}`;
      }

      const title = String(video?.title || `Video ${index + 1}`).trim();
      const url = String(video?.url || '').trim();
      return url ? `${title}|${url}` : '';
    })
    .filter(Boolean)
    .join('\n');
};

const PhysicsLesson = () => {
  const { classId, chapterId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('theory');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [lessonData, setLessonData] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorTheory, setEditorTheory] = useState('');
  const [editorTopics, setEditorTopics] = useState('');
  const [editorQuestions, setEditorQuestions] = useState('');
  const [editorVideos, setEditorVideos] = useState('');
  const [savingTheory, setSavingTheory] = useState(false);
  const [editorMessage, setEditorMessage] = useState('');
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [savingCompletion, setSavingCompletion] = useState(false);
  const [completionSaved, setCompletionSaved] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');

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
          setLessonData(response.data);
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
                    theory: `<h2>${lesson.title}</h2><p>Nội dung bài học đang được cập nhật...</p>`,
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
                  theory: `<h2>${lesson.title}</h2><p>Nội dung bài học đang được cập nhật...</p>`,
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

  const exercises = Array.isArray(lessonData?.content?.exercises)
    ? lessonData.content.exercises
    : [];
  const adminEmailList = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const userEmail = (user?.email || '').toLowerCase();
  const isAdminUser = Boolean(
    user?.isAdmin ||
    user?.role === 'admin' ||
    (userEmail && adminEmailList.includes(userEmail))
  );
  const content = lessonData?.content || {};
  const declaredTopics = Array.isArray(content.topics) ? content.topics.filter(Boolean) : [];
  const extractedTopics = extractTheoryTopics(content.theory || '');
  const lessonTopics = [...new Set([...declaredTopics, ...extractedTopics])].slice(0, 8);
  const declaredTheoryQuestions = Array.isArray(content.theoryQuestions)
    ? content.theoryQuestions.filter(Boolean)
    : [];
  const theoryQuestions = declaredTheoryQuestions.length > 0
    ? declaredTheoryQuestions
    : buildSimilarTheoryQuestions(lessonData, lessonTopics);
  const declaredVideos = normalizeVideoCollection(content.videos || []);
  const legacyVideoUrl = typeof content.videoUrl === 'string' && content.videoUrl.trim()
    ? [{ title: 'Video bai giang', url: content.videoUrl.trim(), embedUrl: convertToEmbedUrl(content.videoUrl.trim()) }]
    : [];
  const chapterDefaultVideos = normalizeVideoCollection(getChapterVideoDefaults(classId, chapterId));
  const lessonVideos = declaredVideos.length > 0
    ? declaredVideos
    : (legacyVideoUrl.length > 0 ? legacyVideoUrl : chapterDefaultVideos);
  const selectedVideo = lessonVideos[selectedVideoIndex] || lessonVideos[0] || null;
  const canEmbedSelectedVideo = Boolean(
    selectedVideo?.embedUrl &&
    (selectedVideo.embedUrl.includes('youtube.com/embed/') ||
      selectedVideo.embedUrl.includes('player.vimeo.com/video/'))
  );
  const currentExercise = exercises[currentQuizIndex];

  const submitLessonCompletion = async (answersPayload = [], finalScore = 0) => {
    if (!lessonData) {
      return false;
    }

    const localUser = JSON.parse(localStorage.getItem('user') || 'null');
    const userIdentifier =
      user?.email ||
      user?.id ||
      user?._id ||
      user?.firebaseUid ||
      user?.uid ||
      localUser?.email ||
      localUser?.id ||
      localUser?._id ||
      localUser?.firebaseUid ||
      localUser?.uid;

    if (!userIdentifier) {
      setCompletionMessage('Chua xac dinh duoc tai khoan de luu tien do.');
      return false;
    }

    try {
      setSavingCompletion(true);
      setCompletionMessage('');

      await axios.post(`${API_BASE_URL}/lesson-completions`, {
        userId: userIdentifier,
        lessonId: `vatly-${classId}-${chapterId}-${lessonId}`,
        classId: parseInt(classId),
        chapterId: parseInt(chapterId),
        lessonNumber: parseInt(lessonId),
        completed: true,
        score: finalScore,
        totalQuestions: exercises.length,
        quizAnswers: answersPayload
      });

      setCompletionSaved(true);
      setCompletionMessage('Da cap nhat tien do bai hoc.');
      return true;
    } catch (error) {
      console.error('Error saving lesson completion:', error);
      const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
      setCompletionMessage(serverMessage ? `Luu tien do that bai: ${serverMessage}` : 'Luu tien do that bai. Ban co the bam Quay lai de thu luu lai.');
      return false;
    } finally {
      setSavingCompletion(false);
    }
  };

  useEffect(() => {
    if (!lessonData) {
      return;
    }

    setEditorTheory(content.theory || '');
    setEditorTopics((content.topics || []).join('\n'));
    setEditorQuestions((content.theoryQuestions || []).join('\n'));
    setEditorVideos(stringifyVideoEditorValue(content.videos || (content.videoUrl ? [{ title: 'Video bai giang', url: content.videoUrl }] : [])));
    setSelectedVideoIndex(0);
    setEditorMessage('');
  }, [lessonData]);

  const getCorrectAnswerIndex = (exercise) => {
    if (!exercise || typeof exercise.correctAnswer !== 'number') {
      return -1;
    }

    // Backend lesson files are stored as 1-based answers.
    return exercise.correctAnswer > 0
      ? exercise.correctAnswer - 1
      : exercise.correctAnswer;
  };

  const handleAnswerSelect = (answerIndex) => {
    if (showResult || isCompleted) {
      return;
    }

    setSelectedAnswer(answerIndex);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null || !currentExercise) {
      return;
    }

    const correctAnswerIndex = getCorrectAnswerIndex(currentExercise);
    if (selectedAnswer === correctAnswerIndex) {
      setScore((prev) => prev + 1);
    }

    setShowResult(true);
  };

  const handleNextQuestion = async () => {
    if (!currentExercise) {
      return;
    }

    const answerRecord = {
      questionIndex: currentQuizIndex,
      selectedAnswer,
      correctAnswer: getCorrectAnswerIndex(currentExercise)
    };
    const nextAnswers = [...quizAnswers, answerRecord];

    setQuizAnswers(nextAnswers);

    if (currentQuizIndex < exercises.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      return;
    }

    const finalScore = nextAnswers.filter((item) => item.selectedAnswer === item.correctAnswer).length;
    setScore(finalScore);
    await submitLessonCompletion(nextAnswers, finalScore);

    setIsCompleted(true);
  };

  const handleFinish = async () => {
    if (exercises.length === 0 && !completionSaved) {
      await submitLessonCompletion([], 0);
    }

    navigate(`/physics-class/${classId}`);
  };

  const handleSaveTheoryContent = async () => {
    try {
      setSavingTheory(true);
      setEditorMessage('');

      const topicsPayload = editorTopics
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      const questionsPayload = editorQuestions
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      const videosPayload = parseVideoEditorValue(editorVideos);

      const response = await axios.put(
        `${API_BASE_URL}/lessons/class/${classId}/chapter/${chapterId}/lesson/${lessonId}/content`,
        {
          subject: 'physics',
          theory: editorTheory,
          topics: topicsPayload,
          theoryQuestions: questionsPayload,
          videos: videosPayload
        }
      );

      if (response?.data?.lesson) {
        setLessonData(response.data.lesson);
      }

      setEditorMessage('Da luu noi dung ly thuyet thanh cong.');
    } catch (error) {
      console.error('Error saving theory content:', error);
      setEditorMessage('Luu that bai. Vui long thu lai.');
    } finally {
      setSavingTheory(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⚛️</div>
          <h2 className="text-2xl font-bold text-gray-700">Đang tải bài học...</h2>
        </div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy bài học</h2>
            <button
              onClick={() => navigate(`/physics-class/${classId}`)}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/physics-class/${classId}`)}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại danh sách bài học
          </button>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-white text-3xl">
                📚
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{lessonData.title}</h1>
                <p className="text-gray-600">Lớp {classId} - Chương {chapterId} - Bài {lessonId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('theory')}
              className={`flex-1 py-4 px-6 font-medium transition-all ${
                activeTab === 'theory'
                  ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-5 h-5 inline mr-2" />
              Lý thuyết
            </button>
            {exercises.length > 0 && (
              <button
                onClick={() => setActiveTab('exercises')}
                className={`flex-1 py-4 px-6 font-medium transition-all ${
                  activeTab === 'exercises'
                    ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Trophy className="w-5 h-5 inline mr-2" />
                Bài tập ({exercises.length})
              </button>
            )}
          </div>

          <div className="p-8">
            {/* Theory Tab */}
            {activeTab === 'theory' && (
              <div className="prose max-w-none">
                {lessonTopics.length > 0 && (
                  <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5">
                    <h3 className="mb-3 text-lg font-semibold text-green-800">Chủ đề chính</h3>
                    <div className="flex flex-wrap gap-2">
                      {lessonTopics.map((topic, index) => (
                        <span
                          key={`${topic}-${index}`}
                          className="rounded-full bg-white px-3 py-1 text-sm font-medium text-green-700 border border-green-200"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">Nội dung lý thuyết</h3>
                  <div 
                    dangerouslySetInnerHTML={{ __html: content.theory || '<p>Nội dung lý thuyết đang được cập nhật...</p>' }}
                    className="text-gray-800 leading-relaxed"
                  />
                </div>

                {lessonVideos.length > 0 && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 not-prose">
                    <div className="mb-4 flex items-center gap-2">
                      <Play className="h-5 w-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-red-900">Video theo chương</h3>
                    </div>

                    {selectedVideo && canEmbedSelectedVideo && (
                      <div className="mb-4 overflow-hidden rounded-xl border border-red-100 bg-black">
                        <div className="aspect-video w-full">
                          <iframe
                            title={selectedVideo.title}
                            src={selectedVideo.embedUrl || selectedVideo.url}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    {selectedVideo && !canEmbedSelectedVideo && (
                      <div className="mb-4 rounded-xl border border-red-200 bg-white p-4 text-sm text-gray-700">
                        Video nay dang o dang lien ket tim kiem/ngoai he thong, vui long mo trong tab moi de xem.
                      </div>
                    )}

                    <div className="space-y-2">
                      {lessonVideos.map((video, index) => (
                        <button
                          type="button"
                          key={`${video.url}-${index}`}
                          onClick={() => setSelectedVideoIndex(index)}
                          className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                            index === selectedVideoIndex
                              ? 'border-red-500 bg-white'
                              : 'border-red-100 bg-white/70 hover:border-red-300'
                          }`}
                        >
                          <p className="font-medium text-gray-800">{video.title || `Video ${index + 1}`}</p>
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="mt-1 inline-flex items-center gap-1 text-sm text-red-700 hover:underline"
                          >
                            Mo trong tab moi
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {theoryQuestions.length > 0 && (
                  <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
                    <h3 className="mb-3 text-lg font-semibold text-blue-800">Câu hỏi lý thuyết tương tự</h3>
                    <div className="space-y-2">
                      {theoryQuestions.map((question, index) => (
                        <p key={`${question}-${index}`} className="text-gray-700">
                          {index + 1}. {question}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {isAdminUser && (
                  <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 not-prose">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-amber-900">Quan tri noi dung ly thuyet</h3>
                      <button
                        onClick={() => setShowEditor((prev) => !prev)}
                        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition"
                      >
                        {showEditor ? 'Dong trinh sua' : 'Mo trinh sua'}
                      </button>
                    </div>

                    {showEditor && (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-sm font-semibold text-gray-700">Noi dung ly thuyet (HTML)</label>
                          <textarea
                            value={editorTheory}
                            onChange={(e) => setEditorTheory(e.target.value)}
                            rows={8}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-semibold text-gray-700">Chu de (moi dong 1 muc)</label>
                          <textarea
                            value={editorTopics}
                            onChange={(e) => setEditorTopics(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-semibold text-gray-700">Cau hoi ly thuyet tuong tu (moi dong 1 cau)</label>
                          <textarea
                            value={editorQuestions}
                            onChange={(e) => setEditorQuestions(e.target.value)}
                            rows={5}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-semibold text-gray-700">Video bai giang (dinh dang: Tieu de|URL, moi dong 1 video)</label>
                          <textarea
                            value={editorVideos}
                            onChange={(e) => setEditorVideos(e.target.value)}
                            rows={5}
                            placeholder={'Video 1|https://www.youtube.com/watch?v=xxxx\nVideo 2|https://youtu.be/yyyy'}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-amber-500"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleSaveTheoryContent}
                            disabled={savingTheory}
                            className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                          >
                            {savingTheory ? 'Dang luu...' : 'Luu noi dung'}
                          </button>
                          {editorMessage && (
                            <p className="text-sm text-gray-700">{editorMessage}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {exercises.length > 0 && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => setActiveTab('exercises')}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      Làm bài tập →
                    </button>
                  </div>
                )}
                
                {exercises.length === 0 && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleFinish}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      Hoàn thành bài học
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Exercises Tab */}
            {activeTab === 'exercises' && (
              <div>
                {!isCompleted ? (
                  <div>
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">
                          Câu {currentQuizIndex + 1} / {exercises.length}
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          Điểm: {score} / {exercises.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${((currentQuizIndex + 1) / exercises.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        {currentExercise?.question}
                      </h3>
                      
                      <div className="space-y-3">
                        {currentExercise?.options?.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => !showResult && handleAnswerSelect(index)}
                            disabled={showResult}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                              showResult
                                ? index === getCorrectAnswerIndex(currentExercise)
                                  ? 'border-green-500 bg-green-50'
                                  : index === selectedAnswer
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-200 bg-white'
                                : selectedAnswer === index
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 bg-white hover:border-green-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                showResult
                                  ? index === getCorrectAnswerIndex(currentExercise)
                                    ? 'bg-green-500 text-white'
                                    : index === selectedAnswer
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                  : selectedAnswer === index
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-600'
                              }`}>
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span className="flex-1">{option}</span>
                              {showResult && index === getCorrectAnswerIndex(currentExercise) && (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                              )}
                              {showResult && index === selectedAnswer && index !== getCorrectAnswerIndex(currentExercise) && (
                                <XCircle className="w-6 h-6 text-red-500" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {showResult && (
                      <div className={`rounded-xl p-6 mb-6 ${
                        selectedAnswer === getCorrectAnswerIndex(currentExercise)
                          ? 'bg-green-50 border-2 border-green-200'
                          : 'bg-red-50 border-2 border-red-200'
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          {selectedAnswer === getCorrectAnswerIndex(currentExercise) ? (
                            <>
                              <CheckCircle className="w-6 h-6 text-green-600" />
                              <span className="font-bold text-green-600">Chính xác!</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-6 h-6 text-red-600" />
                              <span className="font-bold text-red-600">Chưa đúng!</span>
                            </>
                          )}
                        </div>
                        {currentExercise.explanation && (
                          <p className="text-gray-700">{currentExercise.explanation}</p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-4">
                      {!showResult && selectedAnswer !== null && (
                        <button
                          onClick={handleCheckAnswer}
                          className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          Kiểm tra đáp án
                        </button>
                      )}
                      
                      {showResult && (
                        <button
                          onClick={handleNextQuestion}
                          className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          {currentQuizIndex < exercises.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả'}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🎉</div>
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Hoàn thành bài học!
                      </h2>
                      <p className="text-xl text-gray-600 mb-8">
                        Bạn đã trả lời đúng {score}/{exercises.length} câu hỏi
                      </p>
                      
                      <div className="bg-green-50 rounded-xl p-6 max-w-md mx-auto mb-8">
                        <div className="text-5xl font-bold text-green-600 mb-2">
                          {exercises.length > 0 ? Math.round((score / exercises.length) * 100) : 100}%
                        </div>
                        <div className="text-gray-600">Độ chính xác</div>
                      </div>
                    </div>

                    {exercises.map((exercise, index) => {
                      const answer = quizAnswers.find(a => a.questionIndex === index);
                      const selected = answer ? answer.selectedAnswer : null;
                      
                      return (
                        <div key={index} className="bg-gray-50 rounded-xl p-6 mb-6">
                          <h3 className="text-xl font-bold text-gray-800 mb-4">
                            Câu {index + 1}: {exercise.question}
                          </h3>
                          
                          <div className="space-y-3">
                            {exercise.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={`w-full text-left p-4 rounded-lg border-2 ${
                                  optionIndex === (exercise.correctAnswer > 0 ? exercise.correctAnswer - 1 : exercise.correctAnswer)
                                    ? 'border-green-500 bg-green-50'
                                    : optionIndex === selected
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                    optionIndex === (exercise.correctAnswer > 0 ? exercise.correctAnswer - 1 : exercise.correctAnswer)
                                      ? 'bg-green-500 text-white'
                                      : optionIndex === selected
                                      ? 'bg-red-500 text-white'
                                      : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {String.fromCharCode(65 + optionIndex)}
                                  </div>
                                  <span className="flex-1">{option}</span>
                                  {optionIndex === (exercise.correctAnswer > 0 ? exercise.correctAnswer - 1 : exercise.correctAnswer) && (
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                  )}
                                  {optionIndex === selected && optionIndex !== (exercise.correctAnswer > 0 ? exercise.correctAnswer - 1 : exercise.correctAnswer) && (
                                    <XCircle className="w-6 h-6 text-red-500" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          {exercise.explanation && (
                            <div className="mt-4 rounded-xl p-4 bg-blue-50 border-2 border-blue-200">
                                <p className="text-gray-700">{exercise.explanation}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    <div className="text-center mt-8">
                        {completionMessage && (
                          <p className={`mb-4 text-sm ${completionSaved ? 'text-green-700' : 'text-red-600'}`}>
                            {completionMessage}
                          </p>
                        )}
                        <button
                          onClick={handleFinish}
                          disabled={savingCompletion}
                          className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                        >
                          {savingCompletion ? 'Dang luu tien do...' : 'Quay lại'}
                        </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsLesson;

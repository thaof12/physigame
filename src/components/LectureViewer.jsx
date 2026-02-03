import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, FileText, ChevronDown, ChevronUp, ArrowLeft, CheckCircle2 } from 'lucide-react';
import PopupQuiz from './PopupQuiz';
import { lectureData } from '../data/lectureData';

const LectureViewer = () => {
  const { subject, grade, lectureId } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [completedSections, setCompletedSections] = useState([]);
  const [lectureProgress, setLectureProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    // Load lecture data
    setIsLoading(true);
    setLoadError(null);
    
    const timeout = setTimeout(() => {
      setLoadError('Không thể tải bài giảng. Vui lòng thử lại.');
      setIsLoading(false);
    }, 5000);

    // Parse grade to get number
    const gradeNum = grade.startsWith('class') ? parseInt(grade.replace('class', '')) : parseInt(grade);
    const lectureLookup = lectureData[subject]?.[gradeNum]?.[lectureId || '0'];
    
    if (lectureLookup) {
      setLecture(lectureLookup);
      setCompletedSections([]);
      setExpandedSections({ 0: true });
      setIsLoading(false);
      clearTimeout(timeout);
    } else {
      setLoadError('Không tìm thấy bài giảng này.');
      setIsLoading(false);
      clearTimeout(timeout);
    }
  }, [subject, grade, lectureId]);

  const handleToggleSection = (sectionIndex) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex],
    }));
  };

  const handleSectionComplete = (sectionIndex) => {
    if (!completedSections.includes(sectionIndex)) {
      const newCompleted = [...completedSections, sectionIndex];
      setCompletedSections(newCompleted);
      setLectureProgress(Math.round((newCompleted.length / (lecture?.sections.length || 1)) * 100));
    }
  };

  const handleQuizQuestion = (sectionIndex, questionIndex) => {
    const section = lecture.sections[sectionIndex];
    if (section.questions && section.questions[questionIndex]) {
      setQuizData({
        sectionIndex,
        questionIndex,
        question: section.questions[questionIndex],
      });
      setShowQuiz(true);
    }
  };

  const handleQuizComplete = () => {
    setShowQuiz(false);
    setQuizData(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Đang tải bài giảng...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{loadError}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-gray-400 text-5xl mb-4">📚</div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Không tìm thấy bài giảng</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(`/interactive-lectures/${subject}/${grade}`)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="flex-1 mx-4">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {lecture.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {lecture.description}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${lectureProgress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Tiến độ: {lectureProgress}% ({completedSections.length}/{lecture.sections.length} phần)
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lecture Content */}
          <div className="lg:col-span-2">
            {/* Video Section */}
            {lecture.videoUrl && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Play className="w-6 h-6 text-red-500" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Video Bài Giảng
                  </h2>
                </div>
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <iframe
                    width="100%"
                    height="100%"
                    src={lecture.videoUrl}
                    title={lecture.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Xem video này để hiểu rõ hơn về nội dung bài học
                </p>
              </div>
            )}

            {/* Sections */}
            <div className="space-y-4">
              {lecture.sections.map((section, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                >
                  {/* Section Header */}
                  <button
                    onClick={() => handleToggleSection(index)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-left flex-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {completedSections.includes(index) && (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          )}
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            {section.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {section.content.substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                    {expandedSections[index] ? (
                      <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>

                  {/* Section Content */}
                  {expandedSections[index] && (
                    <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                      <div className="prose dark:prose-invert prose-sm max-w-none mb-6">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {section.content}
                        </p>
                      </div>

                      {/* Key Points */}
                      {section.keyPoints && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                          <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3">
                            🎯 Điểm chính:
                          </h4>
                          <ul className="space-y-2">
                            {section.keyPoints.map((point, idx) => (
                              <li
                                key={idx}
                                className="text-blue-800 dark:text-blue-200 flex items-start gap-2"
                              >
                                <span className="text-blue-600 dark:text-blue-400 font-bold mt-1">
                                  •
                                </span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Examples */}
                      {section.examples && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                          <h4 className="font-bold text-green-900 dark:text-green-300 mb-3">
                            📌 Ví dụ:
                          </h4>
                          {section.examples.map((example, idx) => (
                            <div key={idx} className="mb-3 last:mb-0">
                              <p className="font-semibold text-green-800 dark:text-green-200">
                                {example.title}
                              </p>
                              <p className="text-green-700 dark:text-green-300 text-sm">
                                {example.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Questions */}
                      {section.questions && section.questions.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-bold text-purple-900 dark:text-purple-300">
                            ❓ Câu hỏi kiểm tra:
                          </h4>
                          {section.questions.map((question, qIdx) => (
                            <button
                              key={qIdx}
                              onClick={() => handleQuizQuestion(index, qIdx)}
                              className="w-full p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:shadow-md transition-all text-left"
                            >
                              <p className="text-purple-900 dark:text-purple-300 font-medium">
                                Câu {qIdx + 1}: {question.question}
                              </p>
                              <p className="text-purple-700 dark:text-purple-400 text-sm mt-1">
                                Nhấp để trả lời
                              </p>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Mark Complete Button */}
                      <button
                        onClick={() => handleSectionComplete(index)}
                        disabled={completedSections.includes(index)}
                        className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold transition-all ${
                          completedSections.includes(index)
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {completedSections.includes(index)
                          ? '✓ Đã hoàn thành'
                          : 'Đánh dấu là đã hoàn thành'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar - Summary & Navigation */}
          <div className="lg:col-span-1">
            {/* Summary Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                📋 Tóm tắt bài học
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tiến độ:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {lectureProgress}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Phần hoàn thành:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {completedSections.length}/{lecture.sections.length}
                  </span>
                </div>
              </div>

              {/* Table of Contents */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-bold text-gray-800 dark:text-white mb-3 text-sm">
                  Nội dung bài học:
                </h4>
                <div className="space-y-2">
                  {lecture.sections.map((section, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleToggleSection(idx);
                        setCurrentSection(idx);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-sm font-medium transition-colors ${
                        expandedSections[idx]
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {completedSections.includes(idx) && (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                        <span className="truncate">{idx + 1}. {section.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuiz && quizData && (
        <PopupQuiz
          question={quizData.question}
          onClose={handleQuizComplete}
        />
      )}
    </div>
  );
};

export default LectureViewer;

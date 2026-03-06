import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Lock } from 'lucide-react';
import { lectureData } from '../data/lectureData';

const LectureClassSelector = () => {
  const { subject, grade } = useParams();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [subjectName, setSubjectName] = useState('');

  useEffect(() => {
    // Load lectures for this grade
    const gradeNum = grade.startsWith('class') ? parseInt(grade.replace('class', '')) : parseInt(grade);
    const subjectData = lectureData[subject]?.[gradeNum];

    if (subjectData) {
      const lectureList = Object.entries(subjectData).map(([id, data]) => ({
        id,
        ...data
      }));
      setLectures(lectureList);
      setSubjectName(subject === 'physics' ? 'Vật Lý' : 'Hóa Học');
    }
  }, [subject, grade]);

  if (lectures.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">📚</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Chưa có bài giảng
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Bài giảng cho lớp này sắp được cập nhật
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
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
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/interactive-lectures/${subject}`)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                {subjectName} - Lớp {grade.replace('class', '')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Chọn bài giảng để bắt đầu học
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lectures.map((lecture, index) => (
            <div
              key={lecture.id}
              onClick={() => navigate(`/interactive-lectures/${subject}/${grade}/${lecture.id}`)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 overflow-hidden group"
            >
              {/* Color Header */}
              <div className={`${
                subject === 'physics'
                  ? 'bg-gradient-to-r from-green-500 to-teal-600'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              } p-6 text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <div className="text-sm opacity-80">Bài {index + 1}</div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                  {lecture.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {lecture.description}
                </p>

                {/* Stats */}
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <span>📖</span>
                    <span>{lecture.sections.length} phần nội dung</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>❓</span>
                    <span>
                      {lecture.sections.reduce((acc, sec) => acc + (sec.questions?.length || 0), 0)} câu hỏi
                    </span>
                  </div>
                </div>

                {/* Button */}
                <button className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                  subject === 'physics'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}>
                  Bắt đầu bài học →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add More Lessons Info */}
        <div className="mt-12 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                Bài giảng sẽ được cập nhật thường xuyên
              </h3>
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                Chúng tôi liên tục bổ sung thêm bài giảng mới với nội dung phong phú để hỗ trợ quá trình học tập của bạn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureClassSelector;

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';

const LectureGradeSelector = () => {
  const { subject } = useParams();
  const navigate = useNavigate();

  const subjectInfo = {
    physics: {
      name: 'Vật Lý',
      color: 'from-green-500 to-teal-600',
      icon: '⚛️',
      grades: [6, 7, 8, 9, 10, 11, 12]
    }
  };

  const currentSubject = subjectInfo[subject];

  if (!currentSubject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Không tìm thấy môn học</p>
          <button
            onClick={() => navigate('/interactive-lectures')}
            className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg sticky top-24 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/interactive-lectures')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <span className="text-4xl">{currentSubject.icon}</span>
                {currentSubject.name} - Chọn Lớp
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Chọn lớp học để xem các bài giảng tương ứng
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentSubject.grades.map((grade) => (
            <button
              key={grade}
              onClick={() => navigate(`/interactive-lectures/${subject}/class${grade}`)}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500"
            >
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${currentSubject.color} text-white text-3xl font-bold mb-4 group-hover:scale-110 transition-transform`}>
                  {grade}
                </div>
                <div className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  Lớp {grade}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <BookOpen className="w-4 h-4" />
                  <span>Xem bài giảng</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LectureGradeSelector;

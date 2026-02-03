import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Target, Play, FileText } from 'lucide-react';

const InteractiveLectureHub = () => {
  const navigate = useNavigate();

  const subjects = [
    {
      id: 'physics',
      name: 'Vật Lý',
      description: 'Hiểu các định luật vật lý từ cơ học, điện học, quang học đến nhiệt học',
      icon: '⚛️',
      color: 'from-green-500 to-teal-600',
      grades: [6, 7, 8, 9, 10, 11, 12],
      lectureCount: 120
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-500" />
                Thư Viện Bài Giảng Tương Tác
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Video, tài liệu và câu hỏi dừa để kiểm tra mức độ hiểu bài
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-8 mb-12 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Target className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">
                Học tập hiệu quả với bài giảng tương tác
              </h2>
              <p className="text-blue-100 leading-relaxed">
                Đọc tài liệu chi tiết, và trả lời các câu hỏi pop-up để kiểm tra mức độ hiểu bài ngay lập tức. 
                Hệ thống sẽ ghi nhận tiến độ học tập của bạn để lần sau có thể tiếp tục từ vị trí đã dừng.
              </p>
            </div>
          </div>
        </div>

        {/* Subject Selection View */}
        <div className="grid md:grid-cols-2 gap-8">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => navigate(`/interactive-lectures/${subject.id}`)}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 overflow-hidden group"
            >
                {/* Color Header */}
                <div className={`bg-gradient-to-r ${subject.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                      <span className="text-4xl">{subject.icon}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm opacity-80">Số bài giảng</div>
                      <div className="text-2xl font-bold">{subject.lectureCount}</div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    {subject.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {subject.description}
                  </p>

                  {/* Grades Badge */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Lớp {subject.grades[0]}-{subject.grades[subject.grades.length - 1]}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {subject.grades.map((grade) => (
                        <span
                          key={grade}
                          className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs font-medium"
                        >
                          Lớp {grade}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-6">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-blue-500" />
                      <span>Video bài giảng HD</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-500" />
                      <span>Tài liệu chi tiết</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-500" />
                      <span>Câu hỏi pop-up kiểm tra</span>
                    </div>
                  </div>

                  {/* Button */}
                  <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105">
                    Chọn {subject.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default InteractiveLectureHub;

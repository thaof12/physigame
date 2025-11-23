import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Trophy, Lock } from 'lucide-react';

const PhysicsClassDashboard = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, [classId]);

  const gradeData = {
    6: {
      title: 'Lớp 6',
      icon: '🔭',
      color: 'from-blue-400 to-blue-600',
      chapters: [
        {
          id: 1,
          title: 'Chương 1: Đại cương vật lý',
          lessons: ['Vật lý học là gì?', 'Đo lường trong vật lý', 'Đơn vị đo'],
          completed: 0,
          total: 3
        },
        {
          id: 2,
          title: 'Chương 2: Chuyển động cơ học',
          lessons: ['Chuyển động và đứng yên', 'Tốc độ', 'Đồ thị chuyển động'],
          completed: 0,
          total: 3
        }
      ]
    },
    7: {
      title: 'Lớp 7',
      icon: '🌟',
      color: 'from-green-400 to-green-600',
      chapters: [
        {
          id: 1,
          title: 'Chương 1: Ánh sáng',
          lessons: ['Nguồn sáng', 'Truyền ánh sáng', 'Gương phẳng', 'Khúc xạ ánh sáng'],
          completed: 0,
          total: 4
        },
        {
          id: 2,
          title: 'Chương 2: Âm thanh',
          lessons: ['Âm thanh là gì?', 'Truyền âm', 'Đặc trưng âm thanh'],
          completed: 0,
          total: 3
        }
      ]
    },
    8: {
      title: 'Lớp 8',
      icon: '⚙️',
      color: 'from-yellow-400 to-yellow-600',
      chapters: [
        {
          id: 1,
          title: 'Chương 1: Cơ học',
          lessons: ['Lực', 'Máy cơ đơn giản', 'Công và công suất'],
          completed: 0,
          total: 3
        },
        {
          id: 2,
          title: 'Chương 2: Áp suất',
          lessons: ['Áp suất chất rắn', 'Áp suất chất lỏng', 'Áp suất khí quyển'],
          completed: 0,
          total: 3
        }
      ]
    },
    9: {
      title: 'Lớp 9',
      icon: '🔌',
      color: 'from-purple-400 to-purple-600',
      chapters: [
        {
          id: 1,
          title: 'Chương 1: Điện học',
          lessons: ['Dòng điện', 'Định luật Ohm', 'Công suất điện'],
          completed: 0,
          total: 3
        },
        {
          id: 2,
          title: 'Chương 2: Điện từ',
          lessons: ['Từ trường', 'Cảm ứng điện từ', 'Động cơ điện'],
          completed: 0,
          total: 3
        }
      ]
    },
    10: {
      title: 'Lớp 10',
      icon: '🚀',
      color: 'from-red-400 to-red-600',
      chapters: [
        {
          id: 1,
          title: 'Chương 1: Động học',
          lessons: ['Chuyển động thẳng đều', 'Chuyển động biến đổi đều', 'Rơi tự do'],
          completed: 0,
          total: 3
        },
        {
          id: 2,
          title: 'Chương 2: Động lực học',
          lessons: ['Định luật Newton 1', 'Định luật Newton 2', 'Định luật Newton 3'],
          completed: 0,
          total: 3
        }
      ]
    }
  };

  const currentGrade = gradeData[classId];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⚛️</div>
          <h2 className="text-2xl font-bold text-gray-700">Đang tải dữ liệu...</h2>
        </div>
      </div>
    );
  }

  if (!currentGrade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy lớp học</h2>
            <button
              onClick={() => navigate('/program/physics/dashboard')}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all"
            >
              Quay lại chọn lớp
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/program/physics/dashboard')}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại chọn lớp
          </button>
          
          <div className="flex items-center mb-4">
            <div className="text-5xl mr-4">{currentGrade.icon}</div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                {currentGrade.title}
              </h1>
              <p className="text-gray-600">
                Chương trình Vật lý {currentGrade.title}
              </p>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className={`p-3 bg-gradient-to-br ${currentGrade.color} rounded-lg`}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {currentGrade.chapters.reduce((sum, ch) => sum + ch.total, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Tổng số bài</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {currentGrade.chapters.reduce((sum, ch) => sum + ch.completed, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Đã hoàn thành</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {currentGrade.chapters.reduce((sum, ch) => sum + (ch.total - ch.completed), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Chưa học</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters */}
        <div className="space-y-6">
          {currentGrade.chapters.map((chapter) => {
            const progress = chapter.total > 0 ? (chapter.completed / chapter.total) * 100 : 0;

            return (
              <div key={chapter.id} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {chapter.title}
                  </h2>
                  <span className="text-sm text-gray-600">
                    {chapter.completed}/{chapter.total} bài
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${currentGrade.color}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                {/* Lessons */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chapter.lessons.map((lesson, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all cursor-pointer border-2 border-transparent hover:border-green-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentGrade.color} flex items-center justify-center text-white font-bold`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{lesson}</p>
                          <p className="text-xs text-gray-500">Chưa học</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
          <p className="text-blue-800">
            <strong>📝 Lưu ý:</strong> Tính năng học bài theo chương đang được phát triển. 
            Hiện tại bạn có thể trải nghiệm các game vật lý tương tác tại phần{' '}
            <button
              onClick={() => navigate('/advanced-physics-challenge')}
              className="font-bold underline hover:text-blue-600"
            >
              Thử thách
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhysicsClassDashboard;

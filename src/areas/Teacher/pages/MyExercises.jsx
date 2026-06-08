import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileQuestion,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

// Mock data
const mockExercises = [
  {
    id: 1,
    title: 'Quiz Định luật Newton',
    grade: 10,
    chapter: 'Động lực học',
    questions: 15,
    submissions: 156,
    avgScore: 78,
    status: 'published',
    createdAt: '2024-03-10'
  },
  {
    id: 2,
    title: 'Bài tập Điện học cơ bản',
    grade: 9,
    chapter: 'Điện học',
    questions: 20,
    submissions: 98,
    avgScore: 82,
    status: 'published',
    createdAt: '2024-03-08'
  },
  {
    id: 3,
    title: 'Trắc nghiệm Chuyển động',
    grade: 10,
    chapter: 'Động học',
    questions: 10,
    submissions: 0,
    avgScore: 0,
    status: 'draft',
    createdAt: '2024-03-05'
  },
];

const MyExercises = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState(mockExercises);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === 'all' || ex.grade.toString() === filterGrade;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Bài tập của tôi</h1>
          <p className="text-slate-400 text-sm mt-1">Quản lý các bài tập và quiz bạn đã tạo</p>
        </div>
        <button
          onClick={() => navigate('/teacher/create?type=exercise')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-orange-600 rounded-xl text-white text-sm font-medium hover:from-blue-400 hover:to-cyan-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tạo bài tập mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm bài tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
        >
          <option value="all">Tất cả lớp</option>
          {[6, 7, 8, 9, 10, 11, 12].map(grade => (
            <option key={grade} value={grade}>Lớp {grade}</option>
          ))}
        </select>
      </div>

      {/* Exercises Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-600 rounded-xl flex items-center justify-center">
                <FileQuestion className="w-6 h-6 text-white" />
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                exercise.status === 'published'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-500/20 text-slate-400'
              }`}>
                {exercise.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
              </span>
            </div>

            <h3 className="text-white font-medium mb-1">{exercise.title}</h3>
            <p className="text-sm text-slate-400 mb-4">
              Lớp {exercise.grade} • {exercise.chapter}
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-slate-800/30 rounded-lg">
                <p className="text-lg font-bold text-white">{exercise.questions}</p>
                <p className="text-xs text-slate-500">Câu hỏi</p>
              </div>
              <div className="text-center p-2 bg-slate-800/30 rounded-lg">
                <p className="text-lg font-bold text-white">{exercise.submissions}</p>
                <p className="text-xs text-slate-500">Lượt nộp</p>
              </div>
              <div className="text-center p-2 bg-slate-800/30 rounded-lg">
                <p className="text-lg font-bold text-emerald-400">{exercise.avgScore}%</p>
                <p className="text-xs text-slate-500">Điểm TB</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg text-sm transition-colors">
                <Eye className="w-4 h-4" />
                Xem
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg text-sm transition-colors">
                <BarChart3 className="w-4 h-4" />
                Thống kê
              </button>
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl py-12 text-center">
          <FileQuestion className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Không tìm thấy bài tập nào</p>
          <button
            onClick={() => navigate('/teacher/create?type=exercise')}
            className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
          >
            + Tạo bài tập đầu tiên
          </button>
        </div>
      )}
    </div>
  );
};

export default MyExercises;


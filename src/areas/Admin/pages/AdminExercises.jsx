import { useState } from 'react';
import {
  FileQuestion,
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Atom,
  Beaker,
  BarChart3,
  Filter
} from 'lucide-react';

const mockExercises = [
  { id: 1, title: 'Bài tập chuyển động thẳng đều', subject: 'physics', grade: 10, type: 'multiple_choice', questions: 15, attempts: 3420, avgScore: 78, difficulty: 'medium' },
  { id: 2, title: 'Quiz định luật Newton', subject: 'physics', grade: 10, type: 'quiz', questions: 10, attempts: 2850, avgScore: 82, difficulty: 'easy' },
  { id: 4, title: 'Thí nghiệm ảo định luật Ôm', subject: 'physics', grade: 9, type: 'simulation', questions: 5, attempts: 4200, avgScore: 88, difficulty: 'easy' },
];

const typeLabels = {
  multiple_choice: 'Trắc nghiệm',
  quiz: 'Quiz',
  fill_blank: 'Điền khuyết',
  simulation: 'Mô phỏng',
  game: 'Game'
};

const difficultyColors = {
  easy: 'bg-emerald-500/20 text-emerald-400',
  medium: 'bg-blue-500/20 text-blue-400',
  hard: 'bg-red-500/20 text-red-400'
};

const AdminExercises = () => {
  const [exercises] = useState(mockExercises);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filteredExercises = exercises.filter(ex => {
    const matchSearch = ex.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSubject = filterSubject === 'all' || ex.subject === filterSubject;
    const matchType = filterType === 'all' || ex.type === filterType;
    return matchSearch && matchSubject && matchType;
  });

  const stats = {
    total: exercises.length,
    totalQuestions: exercises.reduce((a, b) => a + b.questions, 0),
    totalAttempts: exercises.reduce((a, b) => a + b.attempts, 0),
    avgScore: Math.round(exercises.reduce((a, b) => a + b.avgScore, 0) / exercises.length)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý bài tập</h1>
          <p className="text-slate-400 text-sm mt-1">Quản lý bài tập và game tương tác</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white text-sm font-medium">
          <Plus className="w-4 h-4" />
          <span>Thêm bài tập</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-lg">
              <FileQuestion className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">Tổng bài tập</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/20 rounded-lg">
              <Target className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalQuestions}</p>
              <p className="text-xs text-slate-400">Tổng câu hỏi</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalAttempts.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Lượt làm bài</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.avgScore}%</p>
              <p className="text-xs text-slate-400">Điểm TB</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm bài tập..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
          >
            <option value="all">Tất cả môn</option>
            <option value="physics">Vật lý</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
          >
            <option value="all">Tất cả loại</option>
            <option value="multiple_choice">Trắc nghiệm</option>
            <option value="quiz">Quiz</option>
            <option value="fill_blank">Điền khuyết</option>
            <option value="simulation">Mô phỏng</option>
            <option value="game">Game</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  exercise.subject === 'physics'
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}>
                  {exercise.subject === 'physics' ? (
                    <Atom className="w-6 h-6 text-white" />
                  ) : (
                    <Beaker className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{exercise.title}</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm text-slate-400">
                      {exercise.subject === 'physics' ? 'Vật lý' : 'Hóa học'} {exercise.grade}
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-xs font-medium">
                      {typeLabels[exercise.type]}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${difficultyColors[exercise.difficulty]}`}>
                      {exercise.difficulty === 'easy' ? 'Dễ' : exercise.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">{exercise.questions} câu</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm">{exercise.attempts.toLocaleString()} lượt</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">{exercise.avgScore}% TB</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminExercises;



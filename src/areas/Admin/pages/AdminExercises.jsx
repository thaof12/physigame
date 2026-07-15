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
import { getRandomGames } from '../../../pages/PKBattle/pkGameModes';
import { getQuizQuestions } from '../../../pages/PKBattle/pkRoundGenerator';
import { useMemo } from 'react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const initialExercises = useMemo(() => {
    const allGames = getRandomGames(50, { grade: 'all' });
    const allQuizzes = getQuizQuestions('all', 'mixed', 50);

    const formattedGames = allGames.map((g, idx) => ({
      id: `game-${g.id}-${idx}`,
      title: g.name,
      subject: 'physics',
      grade: parseInt(g.grade) || 10,
      type: 'game',
      questions: 1,
      attempts: Math.floor(Math.random() * 5000) + 1000,
      avgScore: Math.floor(Math.random() * 20) + 70,
      difficulty: g.difficulty || 'medium',
      description: `Game tương tác vật lý: ${g.name}. Giúp học sinh nắm vững kiến thức thông qua các thử thách sinh động.`
    }));

    const formattedQuizzes = allQuizzes.map((q, idx) => ({
      id: `quiz-${q.id}-${idx}`,
      title: q.question,
      subject: 'physics',
      grade: parseInt(q.grade) || 10,
      type: 'quiz',
      questions: 1,
      attempts: Math.floor(Math.random() * 3000) + 500,
      avgScore: Math.floor(Math.random() * 30) + 60,
      difficulty: q.difficulty || 'medium',
      description: `Câu hỏi trắc nghiệm kiến thức: ${q.question}. Đánh giá mức độ hiểu bài của học sinh.`
    }));

    return [...formattedGames, ...formattedQuizzes];
  }, []);

  const [exercises, setExercises] = useState(initialExercises);
  const [showViewModal, setShowViewModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

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
    avgScore: exercises.length > 0 ? Math.round(exercises.reduce((a, b) => a + b.avgScore, 0) / exercises.length) : 0
  };

  const handleDelete = (id) => {
    setExercises(prev => prev.filter(ex => ex.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleUpdate = (updatedEx) => {
    setExercises(prev => prev.map(ex => ex.id === updatedEx.id ? { ...ex, ...updatedEx } : ex));
    setShowEditModal(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-extrabold text-[#274dad]">Quản lý bài tập</h1>
          <p className="font-body text-slate-500 font-bold text-sm">Quản lý bài tập và game tương tác</p>
        </div>
        <button className="font-heading flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2099e9] to-[#85e4fb] rounded-[1.25rem] text-white text-sm font-extrabold shadow-xl shadow-blue-500/10 hover:brightness-110 transition-all">
          <Plus className="w-5 h-5" />
          <span>THÊM BÀI TẬP</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#85e4fb]/20">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-50 rounded-2xl">
              <FileQuestion className="w-8 h-8 text-indigo-500" />
            </div>
            <div>
              <p className="font-heading text-3xl font-extrabold text-[#274dad]">{stats.total}</p>
              <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Tổng bài tập</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#85e4fb]/20">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-violet-50 rounded-2xl">
              <Target className="w-8 h-8 text-violet-500" />
            </div>
            <div>
              <p className="font-heading text-3xl font-extrabold text-[#274dad]">{stats.totalQuestions}</p>
              <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Tổng câu hỏi</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#85e4fb]/20">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-cyan-50 rounded-2xl">
              <BarChart3 className="w-8 h-8 text-cyan-500" />
            </div>
            <div>
              <p className="font-heading text-3xl font-extrabold text-[#274dad]">{stats.totalAttempts.toLocaleString()}</p>
              <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Lượt làm bài</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#85e4fb]/20">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-50 rounded-2xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <p className="font-heading text-3xl font-extrabold text-[#274dad]">{stats.avgScore}%</p>
              <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Điểm TB</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-[#85e4fb]/20">
        <div className="flex flex-col lg:flex-row gap-4 font-body">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài tập theo tiêu đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-2xl pl-12 pr-6 py-4 text-sm text-[#274dad] placeholder-slate-400 focus:outline-none focus:border-[#2099e9]/50 font-bold"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-2xl px-6 py-4 text-sm text-[#274dad] focus:outline-none font-bold"
            >
              <option value="all">Tất cả môn</option>
              <option value="physics">Vật lý</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-2xl px-6 py-4 text-sm text-[#274dad] focus:outline-none font-bold"
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
      </div>

      <div className="grid gap-6">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#85e4fb]/10 hover:border-[#2099e9]/30 transition-all group"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-6">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg ${
                  exercise.subject === 'physics'
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}>
                  {exercise.subject === 'physics' ? (
                    <Atom className="w-8 h-8" />
                  ) : (
                    <Beaker className="w-8 h-8" />
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading text-xl font-extrabold text-[#274dad] group-hover:text-[#2099e9] transition-colors line-clamp-1">{exercise.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="font-heading px-3 py-1 bg-[#e4f2f0] text-[#2099e9] rounded-lg text-[10px] font-extrabold uppercase tracking-widest">
                      {exercise.subject === 'physics' ? 'Vật lý' : 'Hóa học'} {exercise.grade}
                    </span>
                    <span className="font-heading px-3 py-1 bg-indigo-50 text-indigo-500 rounded-lg text-[10px] font-extrabold uppercase tracking-widest">
                      {typeLabels[exercise.type]}
                    </span>
                    <span className={`font-heading px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest ${difficultyColors[exercise.difficulty].replace('text-', 'text-opacity-100 text-')}`}>
                      {exercise.difficulty === 'easy' ? 'DỄ' : exercise.difficulty === 'medium' ? 'TRUNG BÌNH' : 'KHÓ'}
                    </span>
                  </div>
                  <div className="font-body flex flex-wrap items-center gap-6 pt-2">
                    <div className="flex items-center gap-2 text-slate-400 font-bold">
                      <Target className="w-4 h-4" />
                      <span className="text-xs">{exercise.questions} câu</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 font-bold">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-xs">{exercise.attempts.toLocaleString()} lượt</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-500 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs">{exercise.avgScore}% TB</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowViewModal(exercise)}
                  className="p-3 text-slate-400 hover:text-[#2099e9] hover:bg-[#e4f2f0] rounded-2xl transition-all shadow-sm"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowEditModal(exercise)}
                  className="p-3 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-2xl transition-all shadow-sm"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(exercise)}
                  className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all shadow-sm"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Exercise Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-[#274dad]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-[#85e4fb]/20">
            <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-violet-600 p-10 text-white">
              <button onClick={() => setShowViewModal(null)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-all">
                <XCircle className="w-8 h-8" />
              </button>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-[1.5rem] flex items-center justify-center">
                  <FileQuestion className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-2xl font-extrabold leading-tight line-clamp-2">{showViewModal.title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-heading px-2 py-1 bg-white/20 backdrop-blur rounded text-[10px] font-extrabold uppercase">{typeLabels[showViewModal.type]}</span>
                    <span className="font-heading px-2 py-1 bg-white/20 backdrop-blur rounded text-[10px] font-extrabold uppercase">Lớp {showViewModal.grade}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Số câu hỏi', value: `${showViewModal.questions} câu`, icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                  { label: 'Lượt thực hiện', value: showViewModal.attempts.toLocaleString(), icon: BarChart3, color: 'text-cyan-500', bg: 'bg-cyan-50' },
                  { label: 'Điểm trung bình', value: `${showViewModal.avgScore}%`, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' }
                ].map((item, idx) => (
                  <div key={idx} className={`${item.bg} rounded-2xl p-6 flex flex-col items-center text-center gap-2`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                    <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className={`font-heading font-extrabold text-lg ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-heading text-sm font-extrabold text-[#274dad] uppercase tracking-widest">Chi tiết nội dung</h4>
                <p className="font-body text-slate-500 font-bold leading-relaxed">
                  {showViewModal.description}
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => { setShowViewModal(null); setShowEditModal(showViewModal); }}
                  className="font-heading flex-1 py-4 bg-[#e4f2f0] text-[#2099e9] rounded-2xl font-extrabold text-xs uppercase tracking-widest hover:bg-[#e4f2f0]/80 transition-all"
                >
                  Sửa bài tập
                </button>
                <button 
                  onClick={() => setShowViewModal(null)}
                  className="font-heading flex-1 py-4 bg-[#2099e9] text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Exercise Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#274dad]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-[#85e4fb]/20">
            <div className="p-8 bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading text-2xl font-extrabold">Chỉnh sửa bài tập</h3>
                <button onClick={() => setShowEditModal(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <p className="font-body font-bold opacity-80">Cập nhật thông số bài tập</p>
            </div>
            
            <form className="p-8 space-y-6" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleUpdate({
                ...showEditModal,
                title: formData.get('title'),
                difficulty: formData.get('difficulty'),
                grade: parseInt(formData.get('grade'))
              });
            }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Tiêu đề / Câu hỏi</label>
                  <textarea 
                    name="title"
                    defaultValue={showEditModal.title}
                    className="font-body w-full h-24 bg-[#e4f2f0]/50 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-bold focus:outline-none focus:border-[#2099e9] transition-all resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Độ khó</label>
                    <select 
                      name="difficulty"
                      defaultValue={showEditModal.difficulty}
                      className="font-body w-full bg-[#e4f2f0]/50 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-bold focus:outline-none focus:border-[#2099e9] transition-all"
                    >
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Lớp học</label>
                    <select 
                      name="grade"
                      defaultValue={showEditModal.grade}
                      className="font-body w-full bg-[#e4f2f0]/50 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-bold focus:outline-none focus:border-[#2099e9] transition-all"
                    >
                      {[6, 7, 8, 9, 10, 11, 12].map(g => (
                        <option key={g} value={g}>Lớp {g}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="font-heading flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-extrabold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="font-heading flex-[2] py-4 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:brightness-110 transition-all"
                >
                  CẬP NHẬT NGAY
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-[#274dad]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-[#85e4fb]/20 animate-in zoom-in-95 duration-200">
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                <Trash2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-2xl font-extrabold text-[#274dad]">Xóa bài tập này?</h3>
                <p className="font-body text-slate-400 font-bold line-clamp-3 px-4">Bạn có chắc chắn muốn xóa: <span className="text-[#274dad]">{showDeleteConfirm.title}</span>?</p>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="font-heading flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-extrabold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={() => handleDelete(showDeleteConfirm.id)}
                  className="font-heading flex-1 py-4 bg-rose-500 text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                >
                  XÓA NGAY
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExercises;



import { useState, useEffect } from 'react';
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
import { useTeacherAuth } from '../contexts/TeacherAuthContext';
import api from '../../../config/api';

const MyExercises = () => {
  const navigate = useNavigate();
  const { teacher } = useTeacherAuth();
  const [exercises, setExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');

  const fetchExercises = async () => {
    if (!teacher?.id) return;
    try {
      const response = await api.get(`/challenges?teacherId=${teacher.id}&category=exercise`);
      setExercises(response.data || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [teacher]);

  const handleDeleteExercise = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài tập này?')) return;
    try {
      const response = await api.delete(`/challenges/${id}`);
      setExercises(exercises.filter(ex => ex.id !== id));
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Không thể xóa bài tập.');
    }
  };

  const filteredExercises = exercises.filter(ex => {
    const titleVal = ex.name || ex.title || '';
    const gradeVal = (ex.grade || '').toString();
    const matchesSearch = titleVal.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === 'all' || gradeVal === filterGrade;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Bài tập của tôi</h1>
          <p className="text-slate-500 font-bold text-sm mt-1">Quản lý các bài tập và quiz bạn đã tạo</p>
        </div>
        <button
          onClick={() => navigate('/teacher/create?type=exercise')}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-600 hover:brightness-110 text-white text-sm font-black rounded-[1.25rem] shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest"
        >
          <Plus className="w-5 h-5" />
          Tạo bài tập mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
          />
        </div>
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
        >
          <option value="all">Tất cả lớp</option>
          {[6, 7, 8, 9, 10, 11, 12].map(grade => (
            <option key={grade} value={grade}>Lớp {grade}</option>
          ))}
        </select>
      </div>

      {/* Exercises Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <FileQuestion className="w-6 h-6 text-white" />
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                  exercise.status === 'available' || exercise.status === 'published'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-slate-50 text-slate-400'
                }`}>
                  {exercise.status === 'available' || exercise.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
              </div>

              <h3 className="text-slate-900 font-black text-lg mb-1 group-hover:text-blue-600 transition-colors">{exercise.name || exercise.title}</h3>
              <p className="text-sm text-slate-400 font-bold mb-4">
                Lớp {exercise.grade || 8} • {exercise.category === 'molecule' ? 'Hóa học Phân tử' : 'Vật lý'}
              </p>

              <div className="grid grid-cols-3 gap-2.5 mb-6">
                <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                  <p className="text-lg font-black text-slate-800">{Array.isArray(exercise.features) ? exercise.features.length : (exercise.questions || 10)}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Câu hỏi</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                  <p className="text-lg font-black text-slate-800">{exercise.completions_count || exercise.submissions || 0}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Lượt nộp</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                  <p className="text-lg font-black text-emerald-600">{exercise.avg_score || exercise.avgScore || 0}%</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Điểm TB</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-slate-600 hover:text-blue-600 font-bold rounded-xl text-sm transition-all">
                <Eye className="w-4 h-4" />
                Xem
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-slate-600 hover:text-blue-600 font-bold rounded-xl text-sm transition-all">
                <BarChart3 className="w-4 h-4" />
                Thống kê
              </button>
              <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100/50 hover:border-indigo-200 rounded-xl transition-all" title="Chỉnh sửa">
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDeleteExercise(exercise.id)}
                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-100/50 hover:border-rose-200 rounded-xl transition-all" 
                title="Xóa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl py-16 text-center shadow-sm">
          <FileQuestion className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">Không tìm thấy bài tập nào</p>
          <button
            onClick={() => navigate('/teacher/create?type=exercise')}
            className="mt-4 text-blue-600 hover:text-blue-700 font-black text-sm flex items-center justify-center gap-1.5 mx-auto hover:underline"
          >
            + Tạo bài tập đầu tiên
          </button>
        </div>
      )}
    </div>
  );
};

export default MyExercises;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Play,
  Settings,
  Users
} from 'lucide-react';
import { useTeacherAuth } from '../contexts/TeacherAuthContext';
import api from '../../../config/api';

const MyExperiments = () => {
  const navigate = useNavigate();
  const { teacher } = useTeacherAuth();
  const [experiments, setExperiments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchExperiments = async () => {
    if (!teacher?.id) return;
    try {
      const response = await api.get(`/challenges?teacherId=${teacher.id}&category=experiment`);
      setExperiments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching experiments:', error);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, [teacher]);

  const handleDeleteExperiment = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thí nghiệm này?')) return;
    try {
      const response = await api.delete(`/challenges/${id}`);
      setExperiments(experiments.filter(exp => exp.id !== id));
    } catch (error) {
      console.error('Error deleting experiment:', error);
      alert('Không thể xóa thí nghiệm.');
    }
  };

  const filteredExperiments = experiments.filter(exp => {
    const titleVal = exp.name || exp.title || '';
    return titleVal.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Thí nghiệm của tôi</h1>
          <p className="text-slate-500 font-bold text-sm mt-1">Quản lý các thí nghiệm ảo bạn đã thiết kế</p>
        </div>
        <button
          onClick={() => navigate('/teacher/create?type=experiment')}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:brightness-110 text-white text-sm font-black rounded-[1.25rem] shadow-xl shadow-purple-500/20 transition-all uppercase tracking-widest"
        >
          <Plus className="w-5 h-5" />
          Tạo thí nghiệm mới
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm thí nghiệm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 transition-all font-bold"
        />
      </div>

      {/* Experiments Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredExperiments.map((experiment) => (
          <div
            key={experiment.id}
            className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-md hover:border-slate-200 transition-all group flex flex-col justify-between"
          >
            <div>
              {/* Preview Image Placeholder */}
              <div className="h-40 bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center relative border-b border-slate-100">
                <FlaskConical className="w-16 h-16 text-violet-300" />
                <button className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div>
                    <h3 className="text-slate-900 font-black text-lg mb-1 group-hover:text-purple-600 transition-colors">{experiment.name || experiment.title}</h3>
                    <p className="text-sm text-slate-400 font-bold">
                      Lớp {experiment.grade || 8} • {experiment.category === 'molecule' ? 'Hóa học Phân tử' : 'Vật lý'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shrink-0 ${
                    experiment.status === 'available' || experiment.status === 'published'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-slate-50 text-slate-400'
                  }`}>
                    {experiment.status === 'available' || experiment.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500 font-bold mb-6">
                  <span className="flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-slate-400" />
                    {experiment.time || '30 phút'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    {experiment.completions_count || experiment.completions || 0} hoàn thành
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-violet-50 hover:bg-violet-100 border border-violet-100/50 hover:border-violet-200 text-violet-600 font-bold rounded-xl text-sm transition-all">
                    <Play className="w-4 h-4" />
                    Chạy thử
                  </button>
                  <button className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 border border-slate-100/50 hover:border-purple-200 rounded-xl transition-all" title="Chỉnh sửa">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteExperiment(experiment.id)}
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-100/50 hover:border-rose-200 rounded-xl transition-all" 
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredExperiments.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl py-16 text-center shadow-sm">
          <FlaskConical className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">Chưa có thí nghiệm nào</p>
          <button
            onClick={() => navigate('/teacher/create?type=experiment')}
            className="mt-4 text-purple-600 hover:text-purple-700 font-black text-sm flex items-center justify-center gap-1.5 mx-auto hover:underline"
          >
            + Tạo thí nghiệm đầu tiên
          </button>
        </div>
      )}
    </div>
  );
};

export default MyExperiments;

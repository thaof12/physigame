import { useState } from 'react';
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

// Mock data
const mockExperiments = [
  {
    id: 1,
    title: 'Thí nghiệm đo điện trở',
    grade: 9,
    topic: 'Điện học',
    duration: 30,
    completions: 45,
    status: 'published',
    createdAt: '2024-03-10'
  },
  {
    id: 2,
    title: 'Khảo sát con lắc đơn',
    grade: 10,
    topic: 'Dao động',
    duration: 25,
    completions: 32,
    status: 'published',
    createdAt: '2024-03-05'
  },
];

const MyExperiments = () => {
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState(mockExperiments);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExperiments = experiments.filter(exp =>
    exp.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Thí nghiệm của tôi</h1>
          <p className="text-slate-400 text-sm mt-1">Quản lý các thí nghiệm ảo bạn đã thiết kế</p>
        </div>
        <button
          onClick={() => navigate('/teacher/create?type=experiment')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl text-white text-sm font-medium hover:from-violet-400 hover:to-purple-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tạo thí nghiệm mới
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Tìm kiếm thí nghiệm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
        />
      </div>

      {/* Experiments Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredExperiments.map((experiment) => (
          <div
            key={experiment.id}
            className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl overflow-hidden hover:border-slate-700/50 transition-all"
          >
            {/* Preview Image Placeholder */}
            <div className="h-40 bg-gradient-to-br from-violet-600/20 to-purple-600/20 flex items-center justify-center relative">
              <FlaskConical className="w-16 h-16 text-violet-400/50" />
              <button className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">{experiment.title}</h3>
                  <p className="text-sm text-slate-400">
                    Lớp {experiment.grade} • {experiment.topic}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  experiment.status === 'published'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-500/20 text-slate-400'
                }`}>
                  {experiment.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                <span className="flex items-center gap-1">
                  <Settings className="w-4 h-4" />
                  {experiment.duration} phút
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {experiment.completions} hoàn thành
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 rounded-lg text-sm transition-colors">
                  <Play className="w-4 h-4" />
                  Chạy thử
                </button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredExperiments.length === 0 && (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl py-12 text-center">
          <FlaskConical className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Chưa có thí nghiệm nào</p>
          <button
            onClick={() => navigate('/teacher/create?type=experiment')}
            className="mt-4 text-violet-400 hover:text-violet-300 text-sm"
          >
            + Tạo thí nghiệm đầu tiên
          </button>
        </div>
      )}
    </div>
  );
};

export default MyExperiments;

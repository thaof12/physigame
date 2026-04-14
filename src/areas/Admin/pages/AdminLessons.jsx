import { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  Trash2,
  ChevronRight,
  Play,
  Clock,
  Users,
  Star,
  BarChart3,
  Atom,
  Beaker
} from 'lucide-react';

const mockLessons = [
  { id: 1, title: 'Chuyển động thẳng đều', subject: 'physics', grade: 10, chapter: 1, views: 1520, completion: 92, duration: 25, rating: 4.8 },
  { id: 2, title: 'Chuyển động thẳng biến đổi đều', subject: 'physics', grade: 10, chapter: 1, views: 1380, completion: 88, duration: 30, rating: 4.7 },
  { id: 3, title: 'Định luật Newton', subject: 'physics', grade: 10, chapter: 2, views: 1245, completion: 85, duration: 35, rating: 4.9 },
  { id: 6, title: 'Định luật Ôm', subject: 'physics', grade: 9, chapter: 3, views: 1450, completion: 90, duration: 22, rating: 4.8 },
];

const AdminLessons = () => {
  const [lessons] = useState(mockLessons);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');

  const filteredLessons = lessons.filter(lesson => {
    const matchSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSubject = filterSubject === 'all' || lesson.subject === filterSubject;
    const matchGrade = filterGrade === 'all' || lesson.grade.toString() === filterGrade;
    return matchSearch && matchSubject && matchGrade;
  });

  const stats = {
    total: lessons.length,
    physics: lessons.filter(l => l.subject === 'physics').length,
    avgCompletion: Math.round(lessons.reduce((a, b) => a + b.completion, 0) / lessons.length)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý bài học</h1>
          <p className="text-slate-400 text-sm mt-1">Quản lý nội dung bài học trên hệ thống</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white text-sm font-medium">
          <Plus className="w-4 h-4" />
          <span>Thêm bài học</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">Tổng bài học</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 rounded-lg">
              <Atom className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.physics}</p>
              <p className="text-xs text-slate-400">Vật lý</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.avgCompletion}%</p>
              <p className="text-xs text-slate-400">TB hoàn thành</p>
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
              placeholder="Tìm kiếm bài học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
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
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
          >
            <option value="all">Tất cả lớp</option>
            {[6, 7, 8, 9, 10, 11, 12].map(g => (
              <option key={g} value={g}>Lớp {g}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  lesson.subject === 'physics'
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}>
                  {lesson.subject === 'physics' ? (
                    <Atom className="w-6 h-6 text-white" />
                  ) : (
                    <Beaker className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{lesson.title}</h3>
                  <p className="text-sm text-slate-400">
                    {lesson.subject === 'physics' ? 'Vật lý' : 'Hóa học'} {lesson.grade} - Chương {lesson.chapter}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">{lesson.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{lesson.duration} phút</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm">{lesson.rating}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm">{lesson.completion}% hoàn thành</span>
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

export default AdminLessons;

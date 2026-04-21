import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  Clock,
  Users,
  ChevronDown
} from 'lucide-react';

// Mock data
const mockLessons = [
  {
    id: 1,
    title: 'Định luật Newton I',
    grade: 10,
    chapter: 'Động lực học',
    views: 245,
    students: 89,
    status: 'published',
    createdAt: '2024-03-10',
    updatedAt: '2024-03-15'
  },
  {
    id: 2,
    title: 'Định luật Ôm',
    grade: 9,
    chapter: 'Điện học',
    views: 180,
    students: 67,
    status: 'published',
    createdAt: '2024-03-08',
    updatedAt: '2024-03-12'
  },
  {
    id: 3,
    title: 'Chuyển động thẳng đều',
    grade: 10,
    chapter: 'Động học',
    views: 320,
    students: 102,
    status: 'draft',
    createdAt: '2024-03-05',
    updatedAt: '2024-03-05'
  },
  {
    id: 4,
    title: 'Lực đẩy Archimedes',
    grade: 8,
    chapter: 'Cơ học',
    views: 156,
    students: 45,
    status: 'published',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-10'
  },
];

const MyLessons = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState(mockLessons);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === 'all' || lesson.grade.toString() === filterGrade;
    const matchesStatus = filterStatus === 'all' || lesson.status === filterStatus;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Bài học của tôi</h1>
          <p className="text-slate-400 text-sm mt-1">Quản lý các bài học bạn đã tạo</p>
        </div>
        <button
          onClick={() => navigate('/teacher/create?type=lesson')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-medium hover:from-emerald-500 hover:to-teal-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tạo bài học mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm bài học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
        >
          <option value="all">Tất cả lớp</option>
          {[6, 7, 8, 9, 10, 11, 12].map(grade => (
            <option key={grade} value={grade}>Lớp {grade}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
        </select>
      </div>

      {/* Lessons List */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-400">Bài học</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-400">Lớp</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-slate-400">Chương</th>
                <th className="text-center py-4 px-4 text-sm font-medium text-slate-400">Lượt xem</th>
                <th className="text-center py-4 px-4 text-sm font-medium text-slate-400">Học sinh</th>
                <th className="text-center py-4 px-4 text-sm font-medium text-slate-400">Trạng thái</th>
                <th className="text-right py-4 px-4 text-sm font-medium text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map((lesson) => (
                <tr
                  key={lesson.id}
                  className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{lesson.title}</p>
                        <p className="text-xs text-slate-500">Cập nhật: {lesson.updatedAt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-slate-300">Lớp {lesson.grade}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-slate-300">{lesson.chapter}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-400">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">{lesson.views}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-400">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{lesson.students}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${
                      lesson.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {lesson.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLessons.length === 0 && (
          <div className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Không tìm thấy bài học nào</p>
            <button
              onClick={() => navigate('/teacher/create?type=lesson')}
              className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm"
            >
              + Tạo bài học đầu tiên
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLessons;

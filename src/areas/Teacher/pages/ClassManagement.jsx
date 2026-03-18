import { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Settings,
  Trash2,
  UserPlus,
  Copy,
  ExternalLink,
  MoreVertical,
  BookOpen,
  Clock
} from 'lucide-react';

// Mock data
const mockClasses = [
  {
    id: 1,
    name: 'Lớp 10A1 - Vật lý',
    code: 'VL10A1-2024',
    students: 35,
    lessons: 12,
    created: '2024-01-15'
  },
  {
    id: 2,
    name: 'Lớp 9B2 - Điện học',
    code: 'DH9B2-2024',
    students: 28,
    lessons: 8,
    created: '2024-02-20'
  },
  {
    id: 3,
    name: 'Lớp 11A3 - Dao động & Sóng',
    code: 'DS11A3-2024',
    students: 32,
    lessons: 15,
    created: '2024-03-01'
  },
];

const ClassManagement = () => {
  const [classes, setClasses] = useState(mockClasses);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateClass = () => {
    if (!newClassName.trim()) return;

    const newClass = {
      id: Date.now(),
      name: newClassName,
      code: `CL${Date.now().toString().slice(-6)}`,
      students: 0,
      lessons: 0,
      created: new Date().toISOString().split('T')[0]
    };

    setClasses([...classes, newClass]);
    setNewClassName('');
    setShowCreateModal(false);
  };

  const copyClassCode = (code) => {
    navigator.clipboard.writeText(code);
    // TODO: Show toast notification
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý lớp học</h1>
          <p className="text-slate-400 text-sm mt-1">Tạo và quản lý các lớp học của bạn</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-medium hover:from-emerald-500 hover:to-teal-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tạo lớp mới
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Tìm kiếm lớp học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
        />
      </div>

      {/* Classes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClasses.map((cls) => (
          <div
            key={cls.id}
            className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-white font-medium mb-2">{cls.name}</h3>

            {/* Class Code */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-slate-800/50 rounded-lg text-xs text-slate-400 font-mono">
                {cls.code}
              </span>
              <button
                onClick={() => copyClassCode(cls.code)}
                className="p-1 text-slate-500 hover:text-white transition-colors"
                title="Sao chép mã lớp"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {cls.students} học sinh
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {cls.lessons} bài học
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg text-sm transition-colors">
                <Settings className="w-4 h-4" />
                Quản lý
              </button>
              <button className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm transition-colors">
                <UserPlus className="w-4 h-4" />
                Thêm HS
              </button>
            </div>
          </div>
        ))}

        {/* Empty State / Create New */}
        {filteredClasses.length === 0 && (
          <div
            onClick={() => setShowCreateModal(true)}
            className="border-2 border-dashed border-slate-700/50 rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-slate-900/30 transition-all"
          >
            <div className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-400 mb-1">Chưa có lớp học nào</p>
            <p className="text-emerald-400 text-sm">Tạo lớp đầu tiên của bạn</p>
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Tạo lớp học mới</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tên lớp học
              </label>
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="VD: Lớp 10A1 - Vật lý nâng cao"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateClass}
                disabled={!newClassName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tạo lớp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;

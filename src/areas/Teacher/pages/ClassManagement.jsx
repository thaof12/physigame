import { useState, useEffect } from 'react';
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
import { useTeacherAuth } from '../contexts/TeacherAuthContext';
import api from '../../../config/api';

const ClassManagement = () => {
  const { teacher } = useTeacherAuth();
  const [classes, setClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  const fetchClasses = async () => {
    if (!teacher?.id) return;
    try {
      const response = await api.get(`/classes/teacher/${teacher.id}`);
      if (response.data?.success) {
        setClasses(response.data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [teacher]);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateClass = async () => {
    if (!newClassName.trim() || !teacher?.id) return;

    try {
      const response = await api.post('/classes', {
        teacherId: teacher.id,
        name: newClassName
      });
      if (response.data?.success) {
        setClasses([response.data.class, ...classes]);
        setNewClassName('');
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Không thể tạo lớp học. Vui lòng thử lại.');
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lớp học này? Tất cả học sinh sẽ bị ngắt kết nối.')) return;
    try {
      const response = await api.delete(`/classes/${classId}`);
      if (response.data?.success) {
        setClasses(classes.filter(c => c.id !== classId));
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Không thể xóa lớp học.');
    }
  };

  const copyClassCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã sao chép mã lớp: ${code}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Quản lý lớp học</h1>
          <p className="text-slate-500 font-bold text-sm mt-1">Tạo và quản lý các lớp học của bạn</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-sm font-black rounded-[1.25rem] shadow-xl shadow-emerald-500/20 transition-all uppercase tracking-widest"
        >
          <Plus className="w-5 h-5" />
          Tạo lớp mới
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm lớp học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold"
        />
      </div>

      {/* Classes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClasses.map((cls) => (
          <div
            key={cls.id}
            className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <button 
                  onClick={() => handleDeleteClass(cls.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Xóa lớp học"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-slate-900 font-black text-lg mb-2 group-hover:text-indigo-600 transition-colors">{cls.name}</h3>

              {/* Class Code */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-500 font-mono font-bold">
                  {cls.code}
                </span>
                <button
                  onClick={() => copyClassCode(cls.code)}
                  className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Sao chép mã lớp"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-slate-500 font-bold mb-6">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  {cls.students} học sinh
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  {cls.lessons} bài học
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-slate-600 hover:text-slate-900 font-bold rounded-xl text-sm transition-all">
                <Settings className="w-4 h-4" />
                Quản lý
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100/50 hover:border-emerald-200 text-emerald-600 font-bold rounded-xl text-sm transition-all">
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
            className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-slate-50 transition-all flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-slate-400 mb-1 font-bold">Chưa có lớp học nào</p>
            <p className="text-emerald-600 text-sm font-black">Tạo lớp đầu tiên của bạn</p>
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-4">Tạo lớp học mới</h2>

            <div className="mb-6">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                Tên lớp học
              </label>
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="VD: Lớp 10A1 - Vật lý nâng cao"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-xl transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateClass}
                disabled={!newClassName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white rounded-xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
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

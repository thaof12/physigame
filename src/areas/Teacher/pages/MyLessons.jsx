import { useState, useEffect } from 'react';
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
import { useTeacherAuth } from '../contexts/TeacherAuthContext';
import api from '../../../config/api';

const MyLessons = () => {
  const navigate = useNavigate();
  const { teacher } = useTeacherAuth();
  const [lessons, setLessons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchLessons = async () => {
    if (!teacher?.id) return;
    try {
      const response = await api.get(`/lessons?teacherId=${teacher.id}`);
      setLessons(response.data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [teacher]);

  const handleDeleteLesson = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
    try {
      const response = await api.delete(`/lessons/${id}`);
      setLessons(lessons.filter(l => l.id !== id));
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Không thể xóa bài học.');
    }
  };

  const filteredLessons = lessons.filter(lesson => {
    const titleVal = lesson.title || '';
    const gradeVal = (lesson.class_id || lesson.grade || '').toString();
    const statusVal = lesson.status || 'published';

    const matchesSearch = titleVal.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === 'all' || gradeVal === filterGrade;
    const matchesStatus = filterStatus === 'all' || statusVal === filterStatus;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Bài học của tôi</h1>
          <p className="text-slate-500 font-bold text-sm mt-1">Quản lý các bài học bạn đã tạo</p>
        </div>
        <button
          onClick={() => navigate('/teacher/create?type=lesson')}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white text-sm font-black rounded-[1.25rem] shadow-xl shadow-indigo-500/20 transition-all uppercase tracking-widest"
        >
          <Plus className="w-5 h-5" />
          Tạo bài học mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
          />
        </div>
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
        >
          <option value="all">Tất cả lớp</option>
          {[6, 7, 8, 9, 10, 11, 12].map(grade => (
            <option key={grade} value={grade}>Lớp {grade}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
        </select>
      </div>

      {/* Lessons List */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Bài học</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Lớp</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Chương</th>
                <th className="text-center py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Lượt xem</th>
                <th className="text-center py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Học sinh</th>
                <th className="text-center py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th className="text-right py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map((lesson) => (
                <tr
                  key={lesson.id}
                  className="border-b border-slate-100/50 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/10">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{lesson.title}</p>
                        <p className="text-xs text-slate-400 font-medium">Cập nhật: {lesson.created_at ? new Date(lesson.created_at).toLocaleDateString('vi-VN') : 'Mới đây'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-600 font-bold">Lớp {lesson.class_id || lesson.grade || 10}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-600 font-medium">{lesson.chapter_id ? `Chương ${lesson.chapter_id}` : (lesson.chapter || 'Tổng quan')}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-500 font-bold">
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">{lesson.views || 0}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-500 font-bold">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">{lesson.students_count || lesson.students || 0}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                      lesson.status === 'published'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {lesson.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Xem trước">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Chỉnh sửa">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                        title="Xóa"
                      >
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
          <div className="py-16 text-center">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">Không tìm thấy bài học nào</p>
            <button
              onClick={() => navigate('/teacher/create?type=lesson')}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-black text-sm flex items-center justify-center gap-1.5 mx-auto hover:underline"
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



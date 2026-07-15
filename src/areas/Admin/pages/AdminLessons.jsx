import { useState, useEffect, useMemo } from 'react';
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
  Beaker,
  XCircle,
  X
} from 'lucide-react';
import { lectureData } from '../../../data/lectureData';
import { supabase } from '../../../config/supabase';

const AdminLessons = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const [showViewModal, setShowViewModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('class_id', { ascending: true })
        .order('chapter_id', { ascending: true })
        .order('lesson_id', { ascending: true });

      if (error) throw error;

      // Map lessons to format expected by UI
      const mapped = (data || []).map(lesson => {
        // Find chapter title from local lectureData if it's a system lesson matching class_id & chapter_id
        let chTitle = '';
        if (lesson.class_id && lectureData.physics?.[lesson.class_id]) {
          const chapters = lectureData.physics[lesson.class_id];
          const chKey = Object.keys(chapters).find(key => {
            const ch = chapters[key];
            return lesson.description && lesson.description.includes(ch.title);
          }) || Object.keys(chapters)[lesson.chapter_id - 1] || '0';
          
          if (chapters[chKey]) {
            chTitle = chapters[chKey].title;
          }
        }

        // If no chapter title is resolved, parse it from description: "Chương/ chủ đề: ... - Thể loại: ..."
        if (!chTitle && lesson.description) {
          const chMatch = lesson.description.match(/Chương\/ chủ đề:\s*([^-]+)/);
          if (chMatch) {
            chTitle = chMatch[1].trim();
          }
        }
        if (!chTitle) {
          chTitle = `Chương ${lesson.chapter_id || 1}`;
        }

        return {
          id: lesson.id,
          title: lesson.title,
          subject: 'physics', // default to physics
          grade: lesson.class_id || 6,
          chapter: lesson.chapter_id || 1,
          chapterTitle: chTitle,
          views: lesson.views || 0,
          completion: Math.floor(Math.random() * 30) + 70, // Keep random or use reasonable default
          duration: 20 + Math.floor(Math.random() * 15), // Keep random or use reasonable default
          rating: (4 + Math.random()).toFixed(1),
          description: lesson.description || 'Nội dung bài học chi tiết về các hiện tượng vật lý và bài tập ứng dụng.',
          status: lesson.status || 'published', // 'published' = active (Kích hoạt), 'draft' = inactive (Vô hiệu)
          teacher_id: lesson.teacher_id,
          theory: lesson.theory,
          content: lesson.content,
          original: lesson
        };
      });

      setLessons(mapped);
    } catch (err) {
      console.error('Error fetching lessons:', err);
      setError('Không thể tải danh sách bài học từ database');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (lesson) => {
    const newStatus = lesson.status === 'published' ? 'draft' : 'published';
    setActionLoading(lesson.id);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ status: newStatus })
        .eq('id', lesson.id);

      if (error) throw error;

      // Update local state
      setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, status: newStatus } : l));
      // Update details modal if open
      if (showViewModal && showViewModal.id === lesson.id) {
        setShowViewModal(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error toggling lesson status:', err);
      alert('Không thể cập nhật trạng thái bài giảng');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLessons(prev => prev.filter(l => l.id !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting lesson:', err);
      alert('Không thể xóa bài học khỏi database');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdate = async (updatedLesson) => {
    setActionLoading(updatedLesson.id);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          title: updatedLesson.title,
          class_id: updatedLesson.grade,
          description: updatedLesson.description,
          status: updatedLesson.status
        })
        .eq('id', updatedLesson.id);

      if (error) throw error;

      // Update local state
      setLessons(prev => prev.map(l => l.id === updatedLesson.id ? { ...l, ...updatedLesson } : l));
      setShowEditModal(null);
    } catch (err) {
      console.error('Error updating lesson:', err);
      alert('Không thể lưu thay đổi vào database');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lesson.description && lesson.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSubject = filterSubject === 'all' || lesson.subject === filterSubject;
      
      const matchesGrade = filterGrade === 'all' || String(lesson.grade) === String(filterGrade);
      
      return matchesSearch && matchesSubject && matchesGrade;
    });
  }, [lessons, searchTerm, filterSubject, filterGrade]);

  const stats = useMemo(() => {
    const total = lessons.length;
    const physics = lessons.filter(l => l.subject === 'physics').length;
    const totalCompletion = lessons.reduce((acc, l) => acc + (l.completion || 0), 0);
    const avgCompletion = total > 0 ? Math.round(totalCompletion / total) : 0;
    
    return {
      total,
      physics,
      avgCompletion
    };
  }, [lessons]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 font-body">
        <div className="w-12 h-12 border-4 border-[#2099e9] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold text-sm">Đang tải danh sách bài học...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4 font-body">
        <p className="text-rose-600 font-bold">{error}</p>
        <button 
          onClick={fetchLessons}
          className="font-heading px-6 py-2.5 bg-[#2099e9] text-white rounded-xl font-extrabold hover:brightness-110 transition-all"
        >
          Tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-extrabold text-[#274dad]">Quản lý bài học</h1>
          <p className="font-body text-slate-500 font-bold text-sm">Quản lý nội dung bài học trên toàn hệ thống</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="font-heading flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2099e9] to-[#85e4fb] rounded-[1.25rem] text-white text-sm font-extrabold shadow-xl shadow-blue-500/10 hover:brightness-110 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>THÊM BÀI HỌC</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#85e4fb]/20">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-50 rounded-2xl">
              <BookOpen className="w-8 h-8 text-indigo-500" />
            </div>
            <div>
              <p className="font-heading text-3xl font-extrabold text-[#274dad]">{stats.total}</p>
              <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Tổng bài học</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#85e4fb]/20">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-cyan-50 rounded-2xl">
              <Atom className="w-8 h-8 text-cyan-500" />
            </div>
            <div>
              <p className="font-heading text-3xl font-extrabold text-[#274dad]">{stats.physics}</p>
              <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Vật lý</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#85e4fb]/20">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-2xl">
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="font-heading text-3xl font-extrabold text-[#274dad]">{stats.avgCompletion}%</p>
              <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">TB hoàn thành</p>
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
              placeholder="Tìm kiếm tiêu đề bài học hoặc nội dung..."
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
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-2xl px-6 py-4 text-sm text-[#274dad] focus:outline-none font-bold"
            >
              <option value="all">Tất cả lớp</option>
              {[6, 7, 8, 9, 10, 11, 12].map(g => (
                <option key={g} value={g}>Lớp {g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#85e4fb]/10 hover:border-[#2099e9]/30 transition-all group"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg ${
                  lesson.subject === 'physics'
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}>
                  {lesson.subject === 'physics' ? (
                    <Atom className="w-8 h-8" />
                  ) : (
                    <Beaker className="w-8 h-8" />
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading text-xl font-extrabold text-[#274dad] group-hover:text-[#2099e9] transition-colors">{lesson.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="font-heading px-3 py-1 bg-[#e4f2f0] text-[#2099e9] rounded-lg text-[10px] font-extrabold uppercase tracking-widest">
                      {lesson.subject === 'physics' ? 'Vật lý' : 'Hóa học'} {lesson.grade}
                    </span>
                    <span className={`font-heading px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      lesson.status === 'published' 
                        ? 'bg-emerald-100 text-emerald-600 border border-emerald-200/50' 
                        : 'bg-rose-100 text-rose-600 border border-rose-200/50'
                    }`}>
                      {lesson.status === 'published' ? 'Kích hoạt' : 'Vô hiệu'}
                    </span>
                    <span className="font-body text-xs font-bold text-slate-400">
                      Chương {lesson.chapter}: {lesson.chapterTitle}
                    </span>
                  </div>
                  <div className="font-body flex flex-wrap items-center gap-6 pt-2">
                    <div className="flex items-center gap-2 text-slate-400 font-bold">
                      <Eye className="w-4 h-4" />
                      <span className="text-xs">{lesson.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 font-bold">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">{lesson.duration} phút</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-500 font-bold">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs">{lesson.rating}</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-500 font-bold">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-xs">{lesson.completion}% hoàn thành</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowViewModal(lesson)}
                  className="p-3 text-slate-400 hover:text-[#2099e9] hover:bg-[#e4f2f0] rounded-2xl transition-all shadow-sm"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowEditModal(lesson)}
                  className="p-3 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-2xl transition-all shadow-sm"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(lesson)}
                  className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all shadow-sm"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Lesson Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-[#274dad]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-[#85e4fb]/20">
            <div className="relative h-48 bg-gradient-to-br from-[#2099e9] to-[#274dad] p-10 text-white">
              <button onClick={() => setShowViewModal(null)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-all">
                <XCircle className="w-8 h-8" />
              </button>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-[1.5rem] flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-3xl font-extrabold leading-tight">{showViewModal.title}</h3>
                  <p className="font-heading font-extrabold opacity-80 mt-1 uppercase tracking-widest text-sm">Chương {showViewModal.chapter}: {showViewModal.chapterTitle}</p>
                </div>
              </div>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-4 gap-6">
                {[
                  { label: 'Môn học', value: showViewModal.subject === 'physics' ? 'Vật lý' : 'Hóa học', icon: Atom, color: 'text-cyan-500', bg: 'bg-cyan-50' },
                  { label: 'Lớp', value: showViewModal.grade, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                  { label: 'Thời lượng', value: `${showViewModal.duration}p`, icon: Clock, color: 'text-rose-500', bg: 'bg-rose-50' },
                  { label: 'Đánh giá', value: showViewModal.rating, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' }
                ].map((item, idx) => (
                  <div key={idx} className={`${item.bg} rounded-2xl p-4 flex flex-col items-center text-center gap-2`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className={`font-heading font-extrabold text-sm ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-heading text-sm font-extrabold text-[#274dad] uppercase tracking-widest flex items-center gap-2">
                   Mô tả bài học
                </h4>
                <p className="font-body text-slate-500 font-bold leading-relaxed">
                  {showViewModal.description}
                </p>
              </div>

              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Trạng thái hiện tại:</span>
                  <span className={`font-heading px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    showViewModal.status === 'published' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-600 border border-rose-200'
                  }`}>
                    {showViewModal.status === 'published' ? 'Kích hoạt' : 'Vô hiệu'}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleStatus(showViewModal)}
                  disabled={actionLoading === showViewModal.id}
                  className={`font-heading px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all ${
                    showViewModal.status === 'published'
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                  } disabled:opacity-50`}
                >
                  {actionLoading === showViewModal.id ? 'Đang cập nhật...' : (showViewModal.status === 'published' ? 'Vô hiệu hóa' : 'Kích hoạt')}
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => { setShowViewModal(null); setShowEditModal(showViewModal); }}
                  className="font-heading flex-1 py-4 bg-[#e4f2f0] text-[#2099e9] rounded-2xl font-extrabold text-xs uppercase tracking-widest hover:bg-[#e4f2f0]/80 transition-all"
                >
                  Chỉnh sửa bài học
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

      {/* Edit Lesson Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#274dad]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-[#85e4fb]/20">
            <div className="p-8 bg-gradient-to-br from-indigo-500 to-[#274dad] text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading text-2xl font-extrabold">Chỉnh sửa bài học</h3>
                <button onClick={() => setShowEditModal(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <p className="font-body font-bold opacity-80">ID: {showEditModal.id}</p>
            </div>
            
            <form className="p-8 space-y-6" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleUpdate({
                ...showEditModal,
                title: formData.get('title'),
                grade: parseInt(formData.get('grade')),
                duration: parseInt(formData.get('duration')),
                description: formData.get('description'),
                status: formData.get('status')
              });
            }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Tiêu đề bài học</label>
                  <input 
                    name="title"
                    defaultValue={showEditModal.title}
                    className="font-body w-full bg-[#e4f2f0]/50 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-bold focus:outline-none focus:border-[#2099e9] transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Thời lượng (phút)</label>
                    <input 
                      name="duration"
                      type="number"
                      defaultValue={showEditModal.duration}
                      className="font-body w-full bg-[#e4f2f0]/50 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-bold focus:outline-none focus:border-[#2099e9] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Trạng thái</label>
                  <select 
                    name="status"
                    defaultValue={showEditModal.status}
                    className="font-body w-full bg-[#e4f2f0]/50 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-bold focus:outline-none focus:border-[#2099e9] transition-all"
                  >
                    <option value="published">Kích hoạt (Published)</option>
                    <option value="draft">Vô hiệu (Draft)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Mô tả bài học</label>
                  <textarea 
                    name="description"
                    rows={3}
                    defaultValue={showEditModal.description}
                    placeholder="Nhập mô tả tóm tắt nội dung bài học..."
                    className="font-body w-full bg-[#e4f2f0]/50 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-bold focus:outline-none focus:border-[#2099e9] transition-all resize-none"
                  />
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
                  disabled={actionLoading === showEditModal.id}
                  className="font-heading flex-[2] py-4 bg-gradient-to-r from-[#2099e9] to-[#85e4fb] text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all"
                >
                  {actionLoading === showEditModal.id ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#274dad]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-[#85e4fb]/20">
            <div className="p-8 bg-gradient-to-br from-[#2099e9] to-[#274dad] text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading text-2xl font-extrabold">Thêm bài học mới</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <p className="font-body font-bold opacity-80">Tạo bài học mới trên hệ thống</p>
            </div>
            
            <form className="p-8 space-y-6" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const title = formData.get('title');
              const grade = parseInt(formData.get('grade'));
              const description = formData.get('description');
              const status = formData.get('status');

              if (!title) {
                alert('Vui lòng nhập tiêu đề bài học');
                return;
              }

              setActionLoading(true);
              try {
                // Find next lesson_id for class_id
                const { data: siblingLessons, error: fetchErr } = await supabase
                  .from('lessons')
                  .select('lesson_id')
                  .eq('class_id', grade);
                
                if (fetchErr) throw fetchErr;
                
                const nextLessonId = siblingLessons && siblingLessons.length > 0 
                  ? Math.max(...siblingLessons.map(l => l.lesson_id)) + 1
                  : 1;

                const newLessonPayload = {
                  class_id: grade,
                  chapter_id: 1, // default to Chapter 1
                  lesson_id: nextLessonId,
                  title,
                  description: description || `Chương/ chủ đề: Chương I - Thể loại: Bài giảng`,
                  level: 'Beginner',
                  status,
                  theory: '',
                  content: '',
                  game: {},
                  sort_order: (grade * 1000) + 100 + nextLessonId
                };

                const { error: insertErr } = await supabase
                  .from('lessons')
                  .insert(newLessonPayload);

                if (insertErr) throw insertErr;

                // Refresh the list
                await fetchLessons();
                setShowAddModal(false);
              } catch (err) {
                console.error('Error adding lesson:', err);
                alert('Không thể tạo bài học mới');
              } finally {
                setActionLoading(false);
              }
            }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Tiêu đề bài học</label>
                  <input 
                    name="title"
                    placeholder="VD: Bài 1: Chuyển động cơ học"
                    className="font-body w-full bg-[#e4f2f0]/50 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-bold focus:outline-none focus:border-[#2099e9] transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Khối lớp</label>
                    <select 
                      name="grade"
                      defaultValue="8"
                      className="font-body w-full bg-[#e4f2f0]/50 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-bold focus:outline-none focus:border-[#2099e9] transition-all"
                    >
                      {[6, 7, 8, 9, 10, 11, 12].map(g => (
                        <option key={g} value={g}>Lớp {g}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Trạng thái</label>
                    <select 
                      name="status"
                      defaultValue="published"
                      className="font-body w-full bg-[#e4f2f0]/50 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-bold focus:outline-none focus:border-[#2099e9] transition-all"
                    >
                      <option value="published">Kích hoạt (Published)</option>
                      <option value="draft">Vô hiệu (Draft)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Mô tả bài học</label>
                  <textarea 
                    name="description"
                    rows={3}
                    placeholder="Nhập mô tả tóm tắt nội dung bài học..."
                    className="font-body w-full bg-[#e4f2f0]/50 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-bold focus:outline-none focus:border-[#2099e9] transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="font-heading flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-extrabold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="font-heading flex-[2] py-4 bg-gradient-to-r from-[#2099e9] to-[#85e4fb] text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'ĐANG TẠO...' : 'TẠO BÀI HỌC'}
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
                <h3 className="font-heading text-2xl font-extrabold text-[#274dad]">Xóa bài học này?</h3>
                <p className="font-body text-slate-400 font-bold">Bạn có chắc chắn muốn xóa bài học <span className="text-[#274dad]">{showDeleteConfirm.title}</span>? Thao tác này sẽ gỡ bài học khỏi hệ thống.</p>
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
                  disabled={actionLoading === showDeleteConfirm.id}
                  className="font-heading flex-1 py-4 bg-rose-500 text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                >
                  {actionLoading === showDeleteConfirm.id ? 'ĐANG XÓA...' : 'XÓA NGAY'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLessons;



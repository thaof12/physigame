import { useState, useMemo } from 'react';
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

const AdminLessons = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');

  // Flatten lectureData for initial state
  const initialLessons = useMemo(() => {
    const flattened = [];
    if (lectureData.physics) {
      Object.entries(lectureData.physics).forEach(([grade, chapters]) => {
        Object.entries(chapters).forEach(([chapterId, chapter]) => {
          chapter.lessons.forEach(lesson => {
            flattened.push({
              id: `${grade}-${chapterId}-${lesson.id}`,
              title: lesson.title,
              subject: 'physics',
              grade: parseInt(grade),
              chapter: chapterId,
              chapterTitle: chapter.title,
              views: Math.floor(Math.random() * 2000) + 500,
              completion: Math.floor(Math.random() * 30) + 70,
              duration: 20 + Math.floor(Math.random() * 15),
              rating: (4 + Math.random()).toFixed(1),
              description: lesson.description || 'Nội dung bài học chi tiết về các hiện tượng vật lý và bài tập ứng dụng.'
            });
          });
        });
      });
    }
    return flattened;
  }, []);

  const [lessons, setLessons] = useState(initialLessons);
  const [showViewModal, setShowViewModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const filteredLessons = lessons.filter(lesson => {
    const matchSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSubject = filterSubject === 'all' || lesson.subject === filterSubject;
    const matchGrade = filterGrade === 'all' || lesson.grade.toString() === filterGrade;
    return matchSearch && matchSubject && matchGrade;
  });

  const stats = {
    total: lessons.length,
    physics: lessons.filter(l => l.subject === 'physics').length,
    avgCompletion: lessons.length > 0 ? Math.round(lessons.reduce((a, b) => a + b.completion, 0) / lessons.length) : 0
  };

  const handleDelete = (id) => {
    setLessons(prev => prev.filter(l => l.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleUpdate = (updatedLesson) => {
    setLessons(prev => prev.map(l => l.id === updatedLesson.id ? { ...l, ...updatedLesson } : l));
    setShowEditModal(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#274dad]">Quản lý bài học</h1>
          <p className="text-slate-500 font-bold text-sm">Quản lý nội dung bài học trên toàn hệ thống</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2099e9] to-[#85e4fb] rounded-[1.25rem] text-white text-sm font-black shadow-xl shadow-blue-500/10 hover:brightness-110 transition-all">
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
              <p className="text-3xl font-black text-[#274dad]">{stats.total}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tổng bài học</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#85e4fb]/20">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-cyan-50 rounded-2xl">
              <Atom className="w-8 h-8 text-cyan-500" />
            </div>
            <div>
              <p className="text-3xl font-black text-[#274dad]">{stats.physics}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vật lý</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#85e4fb]/20">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-2xl">
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-3xl font-black text-[#274dad]">{stats.avgCompletion}%</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">TB hoàn thành</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-[#85e4fb]/20">
        <div className="flex flex-col lg:flex-row gap-4">
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
                  <h3 className="text-xl font-black text-[#274dad] group-hover:text-[#2099e9] transition-colors">{lesson.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-[#e4f2f0] text-[#2099e9] rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {lesson.subject === 'physics' ? 'Vật lý' : 'Hóa học'} {lesson.grade}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      Chương {lesson.chapter}: {lesson.chapterTitle}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 pt-2">
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
                  <h3 className="text-3xl font-black leading-tight">{showViewModal.title}</h3>
                  <p className="font-bold opacity-80 mt-1 uppercase tracking-widest text-sm">Chương {showViewModal.chapter}: {showViewModal.chapterTitle}</p>
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className={`font-black text-sm ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black text-[#274dad] uppercase tracking-widest flex items-center gap-2">
                   Mô tả bài học
                </h4>
                <p className="text-slate-500 font-bold leading-relaxed">
                  {showViewModal.description}
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => { setShowViewModal(null); setShowEditModal(showViewModal); }}
                  className="flex-1 py-4 bg-[#e4f2f0] text-[#2099e9] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#e4f2f0]/80 transition-all"
                >
                  Chỉnh sửa bài học
                </button>
                <button 
                  onClick={() => setShowViewModal(null)}
                  className="flex-1 py-4 bg-[#2099e9] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all"
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
                <h3 className="text-2xl font-black">Chỉnh sửa bài học</h3>
                <button onClick={() => setShowEditModal(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <p className="font-bold opacity-80">ID: {showEditModal.id}</p>
            </div>
            
            <form className="p-8 space-y-6" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleUpdate({
                ...showEditModal,
                title: formData.get('title'),
                grade: parseInt(formData.get('grade')),
                duration: parseInt(formData.get('duration'))
              });
            }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tiêu đề bài học</label>
                  <input 
                    name="title"
                    defaultValue={showEditModal.title}
                    className="w-full bg-[#e4f2f0]/50 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-black focus:outline-none focus:border-[#2099e9] transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Lớp học</label>
                    <select 
                      name="grade"
                      defaultValue={showEditModal.grade}
                      className="w-full bg-[#e4f2f0]/50 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-black focus:outline-none focus:border-[#2099e9] transition-all"
                    >
                      {[6, 7, 8, 9, 10, 11, 12].map(g => (
                        <option key={g} value={g}>Lớp {g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Thời lượng (phút)</label>
                    <input 
                      name="duration"
                      type="number"
                      defaultValue={showEditModal.duration}
                      className="w-full bg-[#e4f2f0]/50 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-black focus:outline-none focus:border-[#2099e9] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-gradient-to-r from-[#2099e9] to-[#85e4fb] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all"
                >
                  LƯU THAY ĐỔI
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
                <h3 className="text-2xl font-black text-[#274dad]">Xóa bài học này?</h3>
                <p className="text-slate-400 font-bold">Bạn có chắc chắn muốn xóa bài học <span className="text-[#274dad]">{showDeleteConfirm.title}</span>? Thao tác này sẽ gỡ bài học khỏi hệ thống.</p>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={() => handleDelete(showDeleteConfirm.id)}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
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

export default AdminLessons;



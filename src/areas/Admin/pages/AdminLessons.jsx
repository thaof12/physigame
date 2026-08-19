import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Clock,
  Star,
  Atom,
  XCircle,
  X,
  Video,
  FileText,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  Check
} from 'lucide-react';
import { lectureData } from '../../../data/lectureData';
import { saveAdminLessons } from '../../../utils/lessonStorage';

const extractYouTubeId = (urlOrId) => {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : trimmed;
};

const loadInitialLessons = () => {
  const saved = localStorage.getItem('admin_lessons_data');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved admin lessons', e);
    }
  }

  const list = [];
  if (lectureData?.physics) {
    Object.entries(lectureData.physics).forEach(([gradeStr, chapters]) => {
      const grade = parseInt(gradeStr, 10);
      Object.entries(chapters).forEach(([chapterKey, chapter]) => {
        (chapter.lessons || []).forEach((l, idx) => {
          const rawNum = l.id ? l.id.replace('b', '') : (idx + 1);
          list.push({
            id: `phy-${grade}-${chapterKey}-${l.id || idx}`,
            rawId: l.id || `b${idx + 1}`,
            lessonNumber: rawNum,
            title: l.title,
            videoId: l.videoId || '',
            grade: grade,
            chapterKey: chapterKey,
            chapterTitle: chapter.title,
            description: chapter.description || `Nội dung chi tiết bài học ${l.title} thuộc ${chapter.title}`,
            subject: 'physics',
            status: 'published',
            views: 150 + (grade * 20) + (idx * 37),
            completion: 78 + ((idx % 4) * 5),
            duration: 20 + ((idx + 1) * 5),
            rating: (4.6 + ((idx % 4) * 0.1)).toFixed(1)
          });
        });
      });
    });
  }
  return list;
};

const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => String(opt.value) === String(value)) || options[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="font-body w-full bg-slate-50/60 border border-slate-200/80 rounded-2xl px-5 py-3.5 text-slate-800 font-bold flex items-center justify-between focus:outline-none focus:bg-white focus:border-[#2099e9] transition-all cursor-pointer"
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#2099e9]' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[60] bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden p-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 transparent',
            }}
            className="max-h-52 overflow-y-auto overflow-x-hidden pr-1 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
          >
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-3 rounded-xl font-body font-bold text-sm cursor-pointer transition-all flex items-center justify-between ${isSelected
                      ? 'bg-blue-50 text-[#274dad]'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#2099e9]'
                    }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#274dad]" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const AdminLessons = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState(loadInitialLessons);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');

  const [showViewModal, setShowViewModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit form state for custom selects
  const [editGrade, setEditGrade] = useState(6);
  const [editStatus, setEditStatus] = useState('published');

  // Add form state for custom selects
  const [addGrade, setAddGrade] = useState(8);
  const [addStatus, setAddStatus] = useState('published');

  useEffect(() => {
    if (showEditModal) {
      setEditGrade(showEditModal.grade);
      setEditStatus(showEditModal.status || 'published');
    }
  }, [showEditModal]);

  useEffect(() => {
    if (showAddModal) {
      setAddGrade(selectedGrade !== 'all' ? parseInt(selectedGrade, 10) : 8);
      setAddStatus('published');
    }
  }, [showAddModal, selectedGrade]);

  // Save to localStorage and notify student views whenever lessons state updates
  useEffect(() => {
    saveAdminLessons(lessons);
  }, [lessons]);

  const grades = [6, 7, 8, 9, 10, 11, 12];
  const gradeOptions = grades.map(g => ({ value: g, label: `Lớp ${g}` }));
  const statusOptions = [
    { value: 'published', label: 'Kích hoạt' },
    { value: 'draft', label: 'Vô hiệu' }
  ];

  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      const matchesSearch =
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lesson.chapterTitle && lesson.chapterTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lesson.videoId && lesson.videoId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesGrade =
        selectedGrade === 'all' || String(lesson.grade) === String(selectedGrade);

      return matchesSearch && matchesGrade;
    });
  }, [lessons, searchTerm, selectedGrade]);

  const handleToggleStatus = (lessonId) => {
    setLessons(prev =>
      prev.map(l => {
        if (l.id === lessonId) {
          const updatedStatus = l.status === 'published' ? 'draft' : 'published';
          if (showViewModal && showViewModal.id === lessonId) {
            setShowViewModal({ ...showViewModal, status: updatedStatus });
          }
          return { ...l, status: updatedStatus };
        }
        return l;
      })
    );
  };

  const handleDeleteLesson = (lessonId) => {
    setLessons(prev => prev.filter(l => l.id !== lessonId));
    setShowDeleteConfirm(null);
  };

  const handleUpdateLesson = (updatedLesson) => {
    const targetGrade = parseInt(updatedLesson.grade, 10);
    const finalLesson = {
      ...updatedLesson,
      grade: targetGrade
    };
    setLessons(prev => prev.map(l => l.id === finalLesson.id ? finalLesson : l));
    if (selectedGrade !== 'all') {
      setSelectedGrade(String(targetGrade));
    }
    setShowEditModal(null);
  };

  const handleAddLesson = (newLessonData) => {
    const grade = parseInt(newLessonData.grade, 10);
    const videoId = extractYouTubeId(newLessonData.videoId);
    const newLesson = {
      id: `phy-${grade}-custom-${Date.now()}`,
      rawId: `b${Date.now().toString().slice(-3)}`,
      lessonNumber: `${lessons.filter(l => parseInt(l.grade, 10) === grade).length + 1}`,
      title: newLessonData.title,
      videoId: videoId,
      grade: grade,
      chapterKey: '0',
      chapterTitle: newLessonData.chapterTitle || 'Chương I: Tổng quan',
      description: newLessonData.description || 'Nội dung chi tiết bài học mới.',
      subject: 'physics',
      status: newLessonData.status || 'published',
      views: 0,
      completion: 100,
      duration: parseInt(newLessonData.duration || 20, 10),
      rating: '5.0'
    };
    setLessons(prev => [newLesson, ...prev]);
    if (selectedGrade !== 'all') {
      setSelectedGrade(String(grade));
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 font-body">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-extrabold text-[#274dad]">Quản lý bài học</h1>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="font-heading flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#2099e9] to-[#274dad] rounded-[1.25rem] text-white text-sm font-extrabold shadow-xl shadow-blue-500/20 hover:brightness-110 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>THÊM BÀI HỌC</span>
          </button>
        </div>
      </div>

      {/* Grade Filters & Search Bar */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-[#85e4fb]/20 space-y-6">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề bài học, chương hoặc Video ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-2xl pl-14 pr-6 py-4 text-sm text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-[#274dad] focus:bg-white font-bold transition-all"
          />
        </div>

        {/* Grade Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setSelectedGrade('all')}
            className={`px-5 py-2.5 rounded-full font-heading font-extrabold text-xs transition-all ${selectedGrade === 'all'
                ? 'bg-[#274dad] text-white shadow-md shadow-blue-500/20 scale-105'
                : 'bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100'
              }`}
          >
            TẤT CẢ LỚP
          </button>
          {grades.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGrade(String(g))}
              className={`px-5 py-2.5 rounded-full font-heading font-extrabold text-xs transition-all ${String(selectedGrade) === String(g)
                  ? 'bg-[#274dad] text-white shadow-md shadow-blue-500/20 scale-105'
                  : 'bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100'
                }`}
            >
              LỚP {g}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Lesson Cards (3 per row) */}
      {filteredLessons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="group bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                {/* Header tag & Admin Actions */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[#274dad] text-xs font-black tracking-widest uppercase opacity-80">
                    LỚP {lesson.grade} • BÀI {lesson.lessonNumber}
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                    <button
                      onClick={() => setShowViewModal(lesson)}
                      title="Xem chi tiết"
                      className="p-1.5 text-slate-400 hover:text-[#2099e9] hover:bg-white rounded-xl transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowEditModal(lesson)}
                      title="Chỉnh sửa bài học"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(lesson)}
                      title="Xóa bài học"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lesson Title */}
                <h3 className="font-heading text-lg font-bold text-[#1E293B] mb-3 leading-snug group-hover:text-[#274dad] transition-colors">
                  {lesson.title}
                </h3>

                {/* Chapter Title */}
                <p className="font-body text-slate-400 text-xs mb-6 line-clamp-2 font-medium">
                  {lesson.chapterTitle}
                </p>
              </div>

              {/* Bottom Specs & Status Badge */}
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[#2099e9]">
                    <Video className="w-3.5 h-3.5" />
                    <span>1 VIDEO</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <FileText className="w-3.5 h-3.5" />
                    <span>LÝ THUYẾT</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleStatus(lesson.id)}
                  className={`font-heading px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${lesson.status === 'published'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                      : 'bg-rose-50 text-rose-600 border border-rose-200/60'
                    }`}
                >
                  {lesson.status === 'published' ? 'Kích hoạt' : 'Vô hiệu'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
          <div className="text-4xl mb-4">🔬</div>
          <h3 className="font-heading text-xl font-extrabold text-slate-700">Không tìm thấy bài giảng nào</h3>
          <p className="font-body text-slate-400 font-bold text-sm mt-1">Vui lòng chọn khối lớp khác hoặc thử thay đổi từ khóa tìm kiếm</p>
        </div>
      )}

      {/* View Lesson Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            {/* Header banner */}
            <div className="relative bg-gradient-to-br from-[#274dad] to-[#2099e9] p-8 text-white shrink-0">
              <button
                onClick={() => setShowViewModal(null)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-all text-white"
              >
                <XCircle className="w-7 h-7" />
              </button>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center shrink-0">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <span className="font-heading text-xs font-black uppercase tracking-widest text-cyan-200">
                    LỚP {showViewModal.grade} • BÀI {showViewModal.lessonNumber}
                  </span>
                  <h3 className="font-heading text-2xl font-extrabold leading-tight mt-1">{showViewModal.title}</h3>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6 overflow-y-auto">
              {/* Video Embed Preview if videoId exists */}
              {showViewModal.videoId ? (
                <div className="space-y-2">
                  <h4 className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                    Video Bài Giảng Preview
                  </h4>
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${showViewModal.videoId}`}
                      title={showViewModal.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : null}

              {/* Stats overview */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Chương</p>
                  <p className="font-heading font-extrabold text-slate-900 text-sm mt-1">{showViewModal.chapterTitle}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Thời lượng</p>
                  <p className="font-heading font-extrabold text-[#274dad] text-sm mt-1">{showViewModal.duration} phút</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Đánh giá</p>
                  <p className="font-heading font-extrabold text-amber-500 text-sm mt-1">★ {showViewModal.rating}</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                  Mô tả chủ đề
                </h4>
                <p className="font-body text-slate-600 font-bold leading-relaxed bg-slate-50 p-4 rounded-2xl">
                  {showViewModal.description}
                </p>
              </div>

              {/* Status control */}
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Trạng thái:</span>
                  <span className={`font-heading px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${showViewModal.status === 'published'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}>
                    {showViewModal.status === 'published' ? 'Kích hoạt' : 'Vô hiệu'}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleStatus(showViewModal.id)}
                  className={`font-heading px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all ${showViewModal.status === 'published'
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    }`}
                >
                  {showViewModal.status === 'published' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => {
                    navigate(`/interactive-lectures/physics/class${showViewModal.grade}/${showViewModal.rawId}`);
                  }}
                  className="font-heading flex-1 py-4 bg-blue-50 text-[#274dad] rounded-2xl font-extrabold text-xs uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                >
                  <span>Mở giao diện học sinh</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowViewModal(null)}
                  className="font-heading flex-1 py-4 bg-[#274dad] text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lesson Modal (Custom Dropdown & Water Blue Save Button) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-[visible] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-slate-100">
              <h3 className="font-heading text-2xl font-bold text-slate-900">Chỉnh sửa bài học</h3>
              <button
                onClick={() => setShowEditModal(null)}
                className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              className="p-8 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const rawVideo = formData.get('videoId') || '';
                const videoId = extractYouTubeId(rawVideo);

                handleUpdateLesson({
                  ...showEditModal,
                  title: formData.get('title'),
                  grade: parseInt(editGrade, 10),
                  chapterTitle: formData.get('chapterTitle'),
                  videoId: videoId,
                  status: editStatus
                });
              }}
            >
              <div className="space-y-6">
                {/* Row 1: Title & Chapter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-heading text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      TIÊU ĐỀ BÀI HỌC
                    </label>
                    <input
                      name="title"
                      defaultValue={showEditModal.title}
                      required
                      className="font-body w-full bg-slate-50/60 border border-slate-200/80 rounded-2xl px-5 py-3.5 text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-[#2099e9] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-heading text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      CHƯƠNG / PHẦN
                    </label>
                    <input
                      name="chapterTitle"
                      defaultValue={showEditModal.chapterTitle}
                      className="font-body w-full bg-slate-50/60 border border-slate-200/80 rounded-2xl px-5 py-3.5 text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-[#2099e9] transition-all"
                    />
                  </div>
                </div>

                {/* Row 2: Custom Dropdown Grade & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-heading text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      LỚP
                    </label>
                    <CustomSelect
                      value={editGrade}
                      onChange={setEditGrade}
                      options={gradeOptions}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-heading text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      TRẠNG THÁI
                    </label>
                    <CustomSelect
                      value={editStatus}
                      onChange={setEditStatus}
                      options={statusOptions}
                    />
                  </div>
                </div>

                {/* Row 3: Link Video Youtube */}
                <div className="space-y-2">
                  <label className="font-heading text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    LINK VIDEO YOUTUBE
                  </label>
                  <input
                    name="videoId"
                    defaultValue={showEditModal.videoId ? `https://www.youtube.com/watch?v=${showEditModal.videoId}` : ''}
                    placeholder="VD: https://www.youtube.com/watch?v=qzmw1nAns-4"
                    className="font-body w-full bg-slate-50/60 border border-slate-200/80 rounded-2xl px-5 py-3.5 text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-[#2099e9] transition-all"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="font-heading px-6 py-3.5 text-slate-600 font-bold text-sm hover:text-slate-900 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="font-heading px-8 py-3.5 bg-[#2099e9] hover:bg-[#1b8bd4] text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:brightness-110 transition-all"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lesson Modal (Horizontal Layout Matching Edit Modal) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-[visible] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-slate-100">
              <div>
                <h3 className="font-heading text-2xl font-bold text-slate-900">Thêm bài học mới</h3>
                <p className="font-body text-xs font-bold text-slate-400 mt-0.5">Thêm bài học vào Thư viện bài giảng</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              className="p-8 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const rawVideo = formData.get('videoId') || '';
                const videoId = extractYouTubeId(rawVideo);

                handleAddLesson({
                  title: formData.get('title'),
                  grade: parseInt(addGrade, 10),
                  chapterTitle: formData.get('chapterTitle'),
                  videoId: videoId,
                  status: addStatus
                });
              }}
            >
              <div className="space-y-6">
                {/* Row 1: Title & Chapter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-heading text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      TIÊU ĐỀ BÀI HỌC
                    </label>
                    <input
                      name="title"
                      required
                      placeholder="VD: Bài 1: Khối lượng riêng [Bài 13 - SGK]"
                      className="font-body w-full bg-slate-50/60 border border-slate-200/80 rounded-2xl px-5 py-3.5 text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-[#2099e9] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-heading text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      CHƯƠNG / PHẦN
                    </label>
                    <input
                      name="chapterTitle"
                      placeholder="VD: Chương III: Khối lượng riêng và áp suất"
                      className="font-body w-full bg-slate-50/60 border border-slate-200/80 rounded-2xl px-5 py-3.5 text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-[#2099e9] transition-all"
                    />
                  </div>
                </div>

                {/* Row 2: Custom Dropdown Grade & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-heading text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      LỚP
                    </label>
                    <CustomSelect
                      value={addGrade}
                      onChange={setAddGrade}
                      options={gradeOptions}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-heading text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      TRẠNG THÁI
                    </label>
                    <CustomSelect
                      value={addStatus}
                      onChange={setAddStatus}
                      options={statusOptions}
                    />
                  </div>
                </div>

                {/* Row 3: Link Video Youtube */}
                <div className="space-y-2">
                  <label className="font-heading text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    LINK VIDEO YOUTUBE
                  </label>
                  <input
                    name="videoId"
                    placeholder="VD: https://www.youtube.com/watch?v=qzmw1nAns-4"
                    className="font-body w-full bg-slate-50/60 border border-slate-200/80 rounded-2xl px-5 py-3.5 text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-[#2099e9] transition-all"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="font-heading px-6 py-3.5 text-slate-600 font-bold text-sm hover:text-slate-900 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="font-heading px-8 py-3.5 bg-[#2099e9] hover:bg-[#1b8bd4] text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:brightness-110 transition-all"
                >
                  Tạo bài học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                <Trash2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-2xl font-extrabold text-slate-900">Xóa bài học này?</h3>
                <p className="font-body text-slate-500 font-bold text-sm">
                  Bạn có chắc chắn muốn xóa bài học <span className="text-[#274dad]">{showDeleteConfirm.title}</span> khỏi hệ thống Admin?
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="font-heading flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-extrabold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={() => handleDeleteLesson(showDeleteConfirm.id)}
                  className="font-heading flex-1 py-4 bg-rose-500 text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
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

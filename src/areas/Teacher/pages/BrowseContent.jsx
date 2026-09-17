import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  ClipboardList,
  Search,
  ExternalLink,
  GraduationCap,
  X,
  Check,
  Clock,
  CheckCircle2,
  Link2,
  Send,
  ChevronDown,
  ChevronUp,
  ScanSearch,
  Plus,
  UploadCloud,
  FileText,
  Eye,
  EyeOff,
  User,
  Sparkles,
  Play,
  Trash2,
  Flag,
  AlertTriangle,
  AlertCircle,
  Lock
} from 'lucide-react';
import api from '../../../config/api';
import { useTeacherAuth } from '../contexts/TeacherAuthContext';

const getEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }
  return url;
};

const availableGrades = [6, 7, 8, 9, 10, 11, 12];

const BrowseContent = () => {
  const { teacher } = useTeacherAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [activeTab, setActiveTab] = useState('lessons');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filterGrade, setFilterGrade] = useState('all');
  const [lessons, setLessons] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [lockedIds, setLockedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Synchronize search query when URL parameters update
  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchQuery(q);
  }, [searchParams]);

  // Selected item state for preview modal
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchSystemContent = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const [lessonsRes, exercisesRes, locksRes] = await Promise.all([
        api.get('/lessons?teacherId=all'),
        api.get('/challenges?teacherId=all&category=exercise'),
        api.get('/reports/locks').catch(() => ({ data: { locked_ids: [] } }))
      ]);
      const newLessons = Array.isArray(lessonsRes.data) ? lessonsRes.data : [];
      const newExercises = Array.isArray(exercisesRes.data) ? exercisesRes.data : [];
      
      setLessons(newLessons);
      setExercises(newExercises);
      if (locksRes && locksRes.data && Array.isArray(locksRes.data.locked_ids)) {
        setLockedIds(locksRes.data.locked_ids);
      }

      // If currently previewed item was deleted, close modal
      setSelectedItem(prev => {
        if (!prev) return null;
        const existsInLessons = newLessons.some(l => String(l.id) === String(prev.id));
        const existsInExercises = newExercises.some(e => String(e.id) === String(prev.id));
        return (existsInLessons || existsInExercises) ? prev : null;
      });

    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemContent(false);
    const interval = setInterval(() => {
      fetchSystemContent(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'lessons', label: 'Bài học', icon: BookOpen, count: lessons.length },
    { id: 'exercises', label: 'Bài tập', icon: ClipboardList, count: exercises.length },
  ];

  const getFilteredContent = () => {
    const content = activeTab === 'lessons' ? lessons : exercises;
    return content.filter(item => {
      const titleVal = item.name || item.title || '';
      const gradeVal = (item.grade || item.class_id || '').toString();
      const matchesSearch = titleVal.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = filterGrade === 'all' || gradeVal === filterGrade;
      return matchesSearch && matchesGrade;
    });
  };

  const filteredContent = getFilteredContent();

  // ── Author information parser ───────────────────────────────────────
  const getAuthorInfo = (item) => {
    let isAnon = false;
    let authorName = '';

    if (item.game && typeof item.game === 'object' && item.game.is_anonymous !== undefined) {
      isAnon = item.game.is_anonymous;
      authorName = item.game.author_name;
    } else if (Array.isArray(item.features) && item.features[0] && item.features[0].is_anonymous !== undefined) {
      isAnon = item.features[0].is_anonymous;
      authorName = item.features[0].author_name;
    } else if (item.is_anonymous !== undefined) {
      isAnon = item.is_anonymous;
      authorName = item.author_name || item.teacher_name;
    }

    if (isAnon) {
      return { isTeacher: true, isAnonymous: true, name: 'Ẩn danh' };
    }

    if (authorName || item.teacher_id) {
      return { isTeacher: true, isAnonymous: false, name: authorName || 'Giáo viên' };
    }

    return { isTeacher: false, isAnonymous: false, name: 'Hệ thống' };
  };

  // ── Create new content modal state ─────────────────────────────────
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState('lesson'); // 'lesson' | 'exercise'
  const [createTitle, setCreateTitle] = useState('');
  const [createGrade, setCreateGrade] = useState('8');
  const [createSourceType, setCreateSourceType] = useState('link'); // 'link' | 'file'
  const [createLinkUrl, setCreateLinkUrl] = useState('');
  const [createFileName, setCreateFileName] = useState('');
  const [createFileDataUrl, setCreateFileDataUrl] = useState('');
  const [createIsAnonymous, setCreateIsAnonymous] = useState(false);
  const [createDescription, setCreateDescription] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createGradeDropdownOpen, setCreateGradeDropdownOpen] = useState(false);

  const openCreateModal = () => {
    setCreateType(activeTab === 'lessons' ? 'lesson' : 'exercise');
    setCreateTitle('');
    setCreateGrade('8');
    setCreateSourceType('link');
    setCreateLinkUrl('');
    setCreateFileName('');
    setCreateFileDataUrl('');
    setCreateIsAnonymous(false);
    setCreateDescription('');
    setCreateSuccess(false);
    setCreateGradeDropdownOpen(false);
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setCreateSuccess(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('Kích thước tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 25MB.');
      return;
    }

    setCreateFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCreateFileDataUrl(evt.target?.result || '');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateContent = async (e) => {
    e.preventDefault();
    if (!createTitle.trim()) {
      alert('Vui lòng nhập tên bài!');
      return;
    }
    if (!createGrade) {
      alert('Vui lòng chọn số lớp (6 đến 12)!');
      return;
    }

    const contentUrl = createSourceType === 'link' ? createLinkUrl.trim() : createFileDataUrl;
    if (!contentUrl) {
      alert(createSourceType === 'link' ? 'Vui lòng dán đường link bài!' : 'Vui lòng tải tệp từ máy tính!');
      return;
    }

    setCreateSubmitting(true);
    try {
      const teacherName = teacher?.displayName || teacher?.display_name || 'Giáo viên';
      const teacherId = teacher?.id || null;

      if (createType === 'lesson') {
        const payload = {
          class_id: parseInt(createGrade, 10),
          chapter_id: 1,
          lesson_id: Math.floor(Math.random() * 899999) + 100000,
          title: createTitle.trim(),
          description: createDescription.trim() || `Bài giảng Lớp ${createGrade} do giáo viên chia sẻ`,
          level: 'Intermediate',
          theory: contentUrl,
          content: contentUrl,
          teacher_id: teacherId,
          game: {
            author_name: teacherName,
            is_anonymous: createIsAnonymous,
            source_type: createSourceType,
            file_name: createFileName || null
          },
          sort_order: Math.floor(Date.now() / 1000)
        };
        await api.post('/lessons', payload);
      } else {
        const payload = {
          challenge_id: Math.floor(Math.random() * 899999) + 100000,
          name: createTitle.trim(),
          description: createDescription.trim() || `Bài tập Lớp ${createGrade} do giáo viên chia sẻ`,
          icon: 'ClipboardList',
          difficulty: 'Trung bình',
          difficulty_level: 'medium',
          difficulty_color: '#0284c7',
          category: 'game',
          grade: parseInt(createGrade, 10),
          time: '15 phút',
          points: 100,
          status: 'available',
          link: contentUrl,
          teacher_id: teacherId,
          features: [
            {
              author_name: teacherName,
              is_anonymous: createIsAnonymous,
              source_type: createSourceType,
              file_name: createFileName || null
            }
          ]
        };
        await api.post('/challenges', payload);
      }

      setCreateSuccess(true);
      await fetchSystemContent();
      setTimeout(() => closeCreateModal(), 1600);
    } catch (err) {
      console.error('Error creating content:', err);
      alert('Không thể tạo bài mới. Vui lòng kiểm tra lại thông tin và thử lại.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // ── Assign modal state ─────────────────────────────────────────────
  const [assignItem, setAssignItem] = useState(null);
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [assignClassId, setAssignClassId] = useState('');
  const [assignLink, setAssignLink] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);

  const selectedClass = classes.find(c => c.id === assignClassId) || null;

  const openAssignModal = async (item, e) => {
    if (e) e.stopPropagation();
    setAssignItem(item);
    setAssignLink(item.theory || item.link || item.content || '');
    setAssignClassId('');
    setAssignDueDate('');
    setAssignNote('');
    setAssignSuccess(false);
    setClassDropdownOpen(false);

    if (teacher?.id) {
      setClassesLoading(true);
      try {
        const res = await api.get(`/classes/teacher/${teacher.id}`);
        setClasses(res.data?.classes || res.data || []);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setClasses([]);
      } finally {
        setClassesLoading(false);
      }
    }
  };

  const closeAssignModal = () => {
    setAssignItem(null);
    setAssignSuccess(false);
  };

  const handleSubmitAssign = async (e) => {
    e.preventDefault();
    if (!assignClassId || !assignLink.trim() || !assignItem) return;

    setAssignSubmitting(true);
    try {
      await api.post(`/classes/${assignClassId}/assignments`, {
        title: assignItem.name || assignItem.title || 'Bài tập từ ngân hàng nội dung',
        description: assignNote.trim() || null,
        link: assignLink.trim(),
        resourceId: assignLink.trim(),
        type: 'custom',
        dueDate: assignDueDate || null
      });
      setAssignSuccess(true);
      setTimeout(() => closeAssignModal(), 1600);
    } catch (err) {
      console.error('Error assigning content:', err);
      alert('Không thể giao bài. Vui lòng thử lại.');
    } finally {
      setAssignSubmitting(false);
    }
  };

  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    item: null
  });

  const executeDeleteContent = async (item) => {
    if (!item) return;
    setDeleteSubmitting(true);
    try {
      if (activeTab === 'lessons') {
        await api.delete(`/lessons/${item.id}`);
      } else {
        await api.delete(`/challenges/${item.id}`);
      }
      await fetchSystemContent();
    } catch (err) {
      console.error('Error deleting content:', err);
    } finally {
      setDeleteSubmitting(false);
      setDeleteConfirmModal({ isOpen: false, item: null });
    }
  };

  const handleDeleteContent = (item, e) => {
    if (e) e.stopPropagation();
    setDeleteConfirmModal({ isOpen: true, item });
  };

  // ── Report content state ───────────────────────────────────────────
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);

  const handleSendReport = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) {
      alert('Vui lòng nhập nội dung báo cáo vi phạm!');
      return;
    }
    if (!selectedItem) return;

    setReportSubmitting(true);
    try {
      const reporterName = teacher?.displayName || teacher?.display_name || teacher?.name || 'Giáo viên';
      const reporterId = teacher?.id || teacher?.uid || null;

      await api.post('/reports', {
        content_id: selectedItem.id,
        content_title: selectedItem.name || selectedItem.title || 'Nội dung bài học/bài tập',
        content_type: activeTab === 'lessons' ? 'lesson' : 'exercise',
        reporter_id: reporterId,
        reporter_name: reporterName,
        reason: reportReason.trim()
      });

      setReportSuccess(true);
      setReportReason('');
      setTimeout(() => {
        setReportSuccess(false);
        setShowReportForm(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting report:', err);
      alert(err.response?.data?.message || 'Không thể gửi báo cáo. Vui lòng thử lại.');
    } finally {
      setReportSubmitting(false);
    }
  };

  const gradeOptions = [{ value: 'all', label: 'Tất cả lớp' }, ...availableGrades.map(g => ({ value: String(g), label: `Lớp ${g}` }))];
  const selectedGradeLabel = gradeOptions.find(o => o.value === filterGrade)?.label || 'Tất cả lớp';
  const [gradeDropdownOpen, setGradeDropdownOpen] = useState(false);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-black text-slate-900 tracking-tight">Ngân hàng nội dung</h1>
          <p className="font-body text-slate-400 font-bold text-xs mt-1">
            Khám phá và sử dụng nội dung có sẵn của hệ thống và cộng đồng giáo viên PhysiGame
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="font-heading flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-700 to-teal-700 hover:brightness-110 text-white font-extrabold rounded-xl transition-all shadow-md shadow-cyan-700/20 shrink-0 text-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Tạo bài mới
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1.5 bg-slate-200/50 p-1.5 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                className={`font-heading flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-extrabold transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`font-heading px-1.5 py-0.5 rounded text-xs ml-1 font-extrabold ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài học hoặc bài tập..."
            className="font-body w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all font-semibold"
          />
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setGradeDropdownOpen(o => !o)}
            className={`font-heading flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-extrabold transition-all min-w-[120px] justify-between ${gradeDropdownOpen ? 'bg-white border-indigo-400 text-slate-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'}`}
          >
            <span>{selectedGradeLabel}</span>
            {gradeDropdownOpen ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {gradeDropdownOpen && (
            <div className="absolute right-0 z-30 mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1">
              {gradeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setFilterGrade(opt.value); setGradeDropdownOpen(false); }}
                  className={`font-heading w-full text-left px-4 py-2.5 text-sm font-extrabold transition-colors ${filterGrade === opt.value ? 'bg-cyan-700 text-white' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-bold">Đang tải...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
          {filteredContent.map((item) => {
            const author = getAuthorInfo(item);
            const currentTeacherId = teacher?.id || teacher?.uid;
            const currentTeacherName = teacher?.displayName || teacher?.display_name || teacher?.name || teacher?.full_name;
            const isOwner = !!(
              (currentTeacherId && (
                String(item.teacher_id) === String(currentTeacherId) ||
                String(item.teacherId) === String(currentTeacherId)
              )) ||
              (currentTeacherName && (
                (item.game && item.game.author_name === currentTeacherName) ||
                (Array.isArray(item.features) && item.features[0] && item.features[0].author_name === currentTeacherName) ||
                item.author_name === currentTeacherName ||
                item.teacher_name === currentTeacherName
              ))
            );
            const isLocked = lockedIds.includes(String(item.id)) || item.is_locked || item.status === 'locked';
            return (
              <div
                key={item.id}
                className={`rounded-2xl p-5 shadow-sm transition-all group flex flex-col gap-4 relative overflow-hidden ${isLocked
                    ? 'bg-slate-100/90 border-2 border-slate-300 opacity-75 grayscale-[35%]'
                    : 'bg-white border border-slate-100 hover:shadow-md'
                  }`}
              >
                {/* Notice banner if locked */}
                {isLocked && (
                  <div className="w-full bg-amber-500/10 border border-amber-300 text-amber-950 px-3 py-2 rounded-xl font-heading font-extrabold text-[11px] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>TẠM KHÓA: Chúng tôi đang tạm khóa bài để xem xét vi phạm. Bạn không thể thực hiện bất kỳ thao tác nào liên quan đến bài viết này.</span>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isLocked ? 'bg-slate-200' : 'bg-slate-100 group-hover:bg-cyan-700'
                    }`}>
                    {activeTab === 'lessons' ? (
                      <BookOpen className={`w-5 h-5 ${isLocked ? 'text-slate-500' : 'text-slate-600 group-hover:text-white'}`} />
                    ) : (
                      <ClipboardList className={`w-5 h-5 ${isLocked ? 'text-slate-500' : 'text-slate-600 group-hover:text-white'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-slate-900 font-extrabold text-base leading-snug line-clamp-2">{item.name || item.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="font-body text-xs text-slate-400 font-bold flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        Lớp {item.grade || item.class_id || 8}
                      </span>
                      {author.isTeacher && !author.isAnonymous && (
                        <span className="font-heading px-2 py-0.5 bg-teal-50 border border-teal-200/70 text-teal-800 text-[11px] font-extrabold rounded-md flex items-center gap-1 truncate max-w-[160px]">
                          <User className="w-3 h-3 text-teal-600 shrink-0" />
                          <span className="truncate">{author.name}</span>
                        </span>
                      )}
                      {isLocked && (
                        <span className="font-heading px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-extrabold rounded-md flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-700" /> Khóa cứng
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="font-heading flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-extrabold rounded-xl text-xs transition-all"
                  >
                    <ScanSearch className="w-3.5 h-3.5" />
                    Chi tiết
                  </button>
                  <button
                    onClick={(e) => !isLocked && openAssignModal(item, e)}
                    disabled={isLocked}
                    className={`font-heading flex-1 flex items-center justify-center gap-1.5 px-3 py-2 font-extrabold rounded-xl text-xs transition-all ${isLocked
                        ? 'bg-slate-200 border border-slate-300 text-slate-400 cursor-not-allowed'
                        : 'bg-cyan-700 hover:bg-cyan-800 text-white'
                      }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Giao bài
                  </button>
                  {isOwner && (
                    isLocked ? (
                      <button
                        type="button"
                        disabled
                        className="font-heading px-3 py-2 bg-slate-200 border border-slate-300 text-slate-500 font-extrabold rounded-xl text-xs cursor-not-allowed shrink-0 flex items-center gap-1"
                        title="Bài viết bị Quản trị viên khóa cứng do có báo cáo vi phạm. Bạn không thể thực hiện thao tác xóa bài."
                      >
                        <Lock className="w-4 h-4 text-amber-700" />
                        <span>Đã bị khóa</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleDeleteContent(item, e)}
                        disabled={deleteSubmitting}
                        className="font-heading p-2 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-rose-600 hover:text-rose-700 font-extrabold rounded-xl text-xs transition-all shrink-0 flex items-center justify-center"
                        title="Xóa bài đã đăng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredContent.length === 0 && !loading && (
        <div className="bg-white border border-slate-100 rounded-2xl py-16 text-center shadow-sm">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="font-body text-slate-400 font-bold">Không tìm thấy nội dung phù hợp</p>
        </div>
      )}

      {/* ── CREATE CONTENT MODAL ("Tạo bài mới") ──────────────── */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 transform transition-all">

            {createSuccess ? (
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-9 h-9 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-extrabold text-slate-900">Tạo bài mới thành công!</h3>
                  <p className="font-body text-sm text-slate-500 font-bold mt-1">
                    Bài của bạn đã được đăng lên ngân hàng nội dung và sẵn sàng cho tất cả giáo viên sử dụng.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-cyan-700 stroke-[3]" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-extrabold text-slate-900">Tạo bài mới cho giáo viên</h3>
                      <p className="font-body text-xs text-slate-400 font-bold mt-0.5">
                        Tải tệp hoặc dán link chia sẻ tới tất cả giáo viên trên hệ thống
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeCreateModal}
                    className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form - 2 Columns Horizontal Layout */}
                <form onSubmit={handleCreateContent} className="px-8 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Left Column: Essential Info & Author Settings */}
                    <div className="space-y-4">
                      {/* 1. Content Type Switch: Lesson vs Exercise */}
                      <div>
                        <label className="font-heading block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                          Loại nội dung <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => setCreateType('lesson')}
                            className={`font-heading flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-extrabold transition-all ${createType === 'lesson'
                              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50'
                              : 'text-slate-500 hover:text-slate-800'
                              }`}
                          >
                            <BookOpen className="w-4 h-4" />
                            Bài học
                          </button>
                          <button
                            type="button"
                            onClick={() => setCreateType('exercise')}
                            className={`font-heading flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-extrabold transition-all ${createType === 'exercise'
                              ? 'bg-white text-cyan-700 shadow-sm border border-slate-200/50'
                              : 'text-slate-500 hover:text-slate-800'
                              }`}
                          >
                            <ClipboardList className="w-4 h-4" />
                            Bài tập
                          </button>
                        </div>
                      </div>

                      {/* 2. Grade selection (Required: 6 to 12) */}
                      <div>
                        <label className="font-heading block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                          Số lớp (6 đến 12) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setCreateGradeDropdownOpen(o => !o)}
                            className="font-heading w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold text-slate-900 hover:border-cyan-500 transition-all"
                          >
                            <span>Lớp {createGrade}</span>
                            {createGradeDropdownOpen ? <ChevronUp className="w-4 h-4 text-cyan-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </button>

                          {createGradeDropdownOpen && (
                            <div className="absolute z-20 top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                              {availableGrades.map((g) => (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() => { setCreateGrade(String(g)); setCreateGradeDropdownOpen(false); }}
                                  className={`font-heading w-full text-left px-4 py-2.5 text-sm font-extrabold transition-colors ${createGrade === String(g) ? 'bg-cyan-700 text-white' : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                  Lớp {g}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 3. Title input (Required) */}
                      <div>
                        <label className="font-heading block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                          Tên bài <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={createTitle}
                          onChange={(e) => setCreateTitle(e.target.value)}
                          placeholder="VD: Bài giảng Động học chất điểm - Lớp 10"
                          required
                          className="font-body w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-500 transition-all font-bold"
                        />
                      </div>

                      {/* 4. Author Name Visibility Toggle */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                        <label className="font-heading block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                          Tùy chọn hiển thị người đăng bài <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => setCreateIsAnonymous(false)}
                            className={`font-heading flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-extrabold border transition-all ${!createIsAnonymous
                              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Hiển thị
                          </button>
                          <button
                            type="button"
                            onClick={() => setCreateIsAnonymous(true)}
                            className={`font-heading flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-extrabold border transition-all ${createIsAnonymous
                              ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            Ẩn tên
                          </button>
                        </div>
                        <p className="font-body text-[11px] text-slate-500 font-bold pt-0.5 leading-relaxed">
                          {!createIsAnonymous ? (
                            <span className="text-teal-700">Tên ({teacher?.displayName || teacher?.display_name || 'Giáo viên'}) sẽ hiển thị trên bài.</span>
                          ) : (
                            <span className="text-slate-600">Tên của bạn sẽ được ẩn hoàn toàn.</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Right Column: Source Upload & Description */}
                    <div className="space-y-4 flex flex-col justify-between">
                      {/* 5. Upload Source: Link URL vs File Upload */}
                      <div>
                        <label className="font-heading block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                          Hình thức chia sẻ <span className="text-rose-500">*</span>
                        </label>

                        {/* Source mode selector tabs */}
                        <div className="flex gap-2 mb-3">
                          <button
                            type="button"
                            onClick={() => setCreateSourceType('link')}
                            className={`font-heading flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-extrabold border transition-all ${createSourceType === 'link'
                              ? 'bg-cyan-50 border-cyan-300 text-cyan-800'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            Dán đường link
                          </button>
                          <button
                            type="button"
                            onClick={() => setCreateSourceType('file')}
                            className={`font-heading flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-extrabold border transition-all ${createSourceType === 'file'
                              ? 'bg-cyan-50 border-cyan-300 text-cyan-800'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            Upload tệp từ máy
                          </button>
                        </div>

                        {createSourceType === 'link' ? (
                          <div className="relative">
                            <input
                              type="url"
                              value={createLinkUrl}
                              onChange={(e) => setCreateLinkUrl(e.target.value)}
                              placeholder="https://drive.google.com/file/d/..."
                              className="font-body w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-500 transition-all font-semibold"
                            />
                            <ExternalLink className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        ) : (
                          <div>
                            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-200 hover:border-cyan-500 rounded-2xl p-4 cursor-pointer bg-slate-50 hover:bg-slate-100/80 transition-all text-center">
                              <UploadCloud className="w-7 h-7 text-cyan-600 mb-1.5" />
                              <span className="font-heading text-xs font-extrabold text-slate-700">
                                {createFileName ? createFileName : 'Bấm để chọn tệp từ máy tính (PDF, Word, Ảnh...)'}
                              </span>
                              <span className="font-body text-[10px] text-slate-400 font-bold mt-1">
                                {createFileName ? 'Đã tải lên sẵn sàng' : 'Hỗ trợ tất cả định dạng tài liệu'}
                              </span>
                              <input
                                type="file"
                                onChange={handleFileSelect}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Optional Description */}
                      <div className="flex-1 flex flex-col">
                        <label className="font-heading block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                          Ghi chú / Mô tả chi tiết (không bắt buộc)
                        </label>
                        <textarea
                          rows={4}
                          value={createDescription}
                          onChange={(e) => setCreateDescription(e.target.value)}
                          placeholder="Mô tả nội dung chính, hướng dẫn áp dụng bài..."
                          className="font-body flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-500 transition-all font-medium resize-none"
                        />
                      </div>
                    </div>

                    {/* Modal Action Buttons (Full width col-span-2) */}
                    <div className="col-span-1 md:col-span-2 flex gap-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={closeCreateModal}
                        className="font-heading flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-xl transition-all text-sm"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={createSubmitting || !createTitle.trim() || !(createSourceType === 'link' ? createLinkUrl.trim() : createFileDataUrl)}
                        className="font-heading flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-700 to-teal-700 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-extrabold transition-all text-sm shadow-md shadow-cyan-700/20 uppercase tracking-wider"
                      >
                        {createSubmitting ? (
                          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang tạo...</>
                        ) : (
                          <><Plus className="w-4 h-4 stroke-[3]" /> Tạo bài mới</>
                        )}
                      </button>
                    </div>

                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* DETAIL VIEW MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-50 text-cyan-700">
                  {activeTab === 'lessons'
                    ? <BookOpen className="w-5 h-5" />
                    : <ClipboardList className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-heading text-xl font-extrabold text-slate-900">{selectedItem.name || selectedItem.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-heading px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase tracking-wider rounded">
                      Lớp {selectedItem.grade || selectedItem.class_id}
                    </span>
                    {selectedItem.chapter_id && (
                      <span className="font-heading px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase tracking-wider rounded">
                        Chương {selectedItem.chapter_id}
                      </span>
                    )}
                    {selectedItem.time && (
                      <span className="font-heading px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase tracking-wider rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedItem.time}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin">
              {/* Stats & Author Row */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <div className="text-center">
                  <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Người đăng</p>
                  <p className="font-heading text-sm font-extrabold text-slate-800 truncate">
                    {(() => {
                      const info = getAuthorInfo(selectedItem);
                      return info.isAnonymous ? 'Ẩn danh' : info.name;
                    })()}
                  </p>
                </div>
                <div className="text-center border-x border-slate-200">
                  <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                    {activeTab === 'lessons' ? 'Phân loại' : 'Lượt nộp'}
                  </p>
                  <p className="font-heading text-sm font-extrabold text-slate-800">
                    {activeTab === 'lessons' ? 'Bài giảng' : (selectedItem.completions || selectedItem.completions_count || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Điểm tối đa</p>
                  <p className="font-heading text-sm font-extrabold text-slate-800">100</p>
                </div>
              </div>

              {/* Description */}
              {selectedItem.description && (
                <div className="space-y-2">
                  <h4 className="font-heading text-xs font-extrabold text-slate-500 uppercase tracking-widest">Mô tả chi tiết</h4>
                  <p className="font-body text-sm font-bold text-slate-700 bg-slate-50/50 p-4 rounded-xl border border-slate-100/30 leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>
              )}

              {/* Dynamic Content Display depending on Tab */}
              {activeTab === 'lessons' && (
                <div className="space-y-4">
                  <h4 className="font-heading text-xs font-extrabold text-slate-500 uppercase tracking-widest">Nội dung bài giảng</h4>
                  {selectedItem.theory && (selectedItem.theory.startsWith('http://') || selectedItem.theory.startsWith('https://') || selectedItem.theory.startsWith('data:')) ? (
                    <div className="font-body space-y-3">
                      {selectedItem.theory.startsWith('http') && (
                        <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-800 font-medium leading-relaxed flex items-start gap-2">
                          <span className="text-base select-none mt-0.5">💡</span>
                          <div>
                            <strong>Lưu ý về tài liệu:</strong> Để xem trực tiếp, tệp Google Drive cần được chia sẻ ở chế độ công khai <strong>"Bất kỳ ai có liên kết đều có thể xem"</strong>.
                          </div>
                        </div>
                      )}
                      <div className="border border-slate-200 rounded-2xl overflow-hidden h-[420px] shadow-inner bg-slate-50 relative">
                        <iframe
                          src={getEmbedUrl(selectedItem.theory)}
                          className="w-full h-full border-none"
                          allow="autoplay"
                          title="Xem trước tài liệu"
                        />
                      </div>
                      <button
                        onClick={() => window.open(selectedItem.theory, '_blank')}
                        className="font-heading w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 transition-all border border-indigo-100/50"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Mở tài liệu trong tab mới
                      </button>
                    </div>
                  ) : selectedItem.theory ? (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 leading-relaxed max-h-[300px] overflow-y-auto scrollbar-thin">
                      <p className="font-body text-sm font-medium text-slate-700 whitespace-pre-wrap">{selectedItem.theory}</p>
                    </div>
                  ) : (
                    <p className="font-body text-sm italic text-slate-400 text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                      Bài giảng thuộc chương trình sách giáo khoa chuẩn hệ thống.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'exercises' && (
                <div className="space-y-4">
                  <h4 className="font-heading text-xs font-extrabold text-slate-500 uppercase tracking-widest">Nội dung bài tập / tài liệu</h4>
                  {selectedItem.link && (selectedItem.link.startsWith('http://') || selectedItem.link.startsWith('https://') || selectedItem.link.startsWith('data:')) ? (
                    <div className="font-body space-y-3">
                      {selectedItem.link.startsWith('http') && (
                        <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-800 font-medium leading-relaxed flex items-start gap-2">
                          <span className="text-base select-none mt-0.5">💡</span>
                          <div>
                            <strong>Lưu ý về tài liệu:</strong> Để xem trực tiếp, tệp Google Drive cần được chia sẻ ở chế độ công khai.
                          </div>
                        </div>
                      )}
                      <div className="border border-slate-200 rounded-2xl overflow-hidden h-[420px] shadow-inner bg-slate-50 relative">
                        <iframe
                          src={getEmbedUrl(selectedItem.link)}
                          className="w-full h-full border-none"
                          allow="autoplay"
                          title="Xem trước bài tập"
                        />
                      </div>
                      <button
                        onClick={() => window.open(selectedItem.link, '_blank')}
                        className="font-heading w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 transition-all border border-indigo-100/50"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Mở bài tập trong tab mới
                      </button>
                    </div>
                  ) : (
                    <p className="font-body text-sm italic text-slate-400 text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                      Bài tập tự luyện trực quan trên hệ thống.
                    </p>
                  )}
                </div>
              )}

              {/* Report Violation Section */}
              <div className="pt-4 border-t border-slate-100">
                {!showReportForm ? (
                  <div className="flex items-center justify-between bg-rose-50/60 border border-rose-100 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <Flag className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-heading text-xs font-extrabold text-rose-900">Báo cáo nội dung vi phạm / lỗi</h5>
                        <p className="font-body text-[11px] text-rose-700/80 font-bold">Phản hồi lỗi bài học hoặc nội dung vi phạm tới Quản trị viên</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowReportForm(true)}
                      className="font-heading px-3.5 py-2 bg-white hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 text-xs font-extrabold rounded-xl transition-all shadow-sm shrink-0"
                    >
                      Báo cáo bài này
                    </button>
                  </div>
                ) : (
                  <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-700 font-extrabold text-xs uppercase tracking-wider font-heading">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Gửi báo cáo vi phạm tới Quản trị viên
                      </div>
                      <button
                        type="button"
                        onClick={() => { setShowReportForm(false); setReportSuccess(false); }}
                        className="text-slate-400 hover:text-slate-600 p-1 text-xs font-bold"
                      >
                        Hủy
                      </button>
                    </div>

                    {reportSuccess ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Đã gửi báo cáo thành công tới Quản trị viên hệ thống!
                      </div>
                    ) : (
                      <form onSubmit={handleSendReport} className="space-y-3">
                        <textarea
                          rows={3}
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                          placeholder="Vui lòng nhập chi tiết nội dung vi phạm hoặc lỗi bài học (bắt buộc)..."
                          required
                          className="w-full bg-white border border-rose-200 rounded-xl p-3 text-xs text-slate-800 placeholder-rose-300 focus:outline-none focus:border-rose-500 font-medium resize-none shadow-inner"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowReportForm(false)}
                            className="font-heading px-3.5 py-2 bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 text-xs font-bold rounded-xl transition-all"
                          >
                            Đóng
                          </button>
                          <button
                            type="submit"
                            disabled={reportSubmitting || !reportReason.trim()}
                            className="font-heading px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5"
                          >
                            {reportSubmitting ? (
                              <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang gửi...</>
                            ) : (
                              <><Flag className="w-3.5 h-3.5" /> Gửi báo cáo</>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-8 py-6 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={(e) => { setSelectedItem(null); openAssignModal(selectedItem, e); }}
                className="font-heading flex items-center gap-1.5 px-5 py-2.5 bg-cyan-700 text-white rounded-xl text-xs font-extrabold hover:bg-cyan-800 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Giao bài này
              </button>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="font-heading px-6 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-extrabold hover:bg-slate-900 transition-colors shadow-sm"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGN MODAL ──────────────────────────────────────── */}
      {assignItem && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">

            {assignSuccess ? (
              /* ── Success state ── */
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-extrabold text-slate-900">Giao bài thành công!</h3>
                  <p className="font-body text-sm text-slate-500 font-bold mt-1">
                    Học sinh trong lớp đã nhận được bài tập mới.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-start justify-between px-7 pt-7 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                      <Send className="w-5 h-5 text-cyan-700" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-extrabold text-slate-900">Giao bài cho lớp học</h3>
                      <p className="font-body text-xs text-slate-400 font-bold mt-0.5 truncate max-w-[220px]">
                        {assignItem.name || assignItem.title}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeAssignModal}
                    className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Info banner */}
                <div className="mx-7 mt-5 flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                  <Link2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="font-body text-xs text-blue-700 font-bold leading-relaxed">
                    Học sinh sẽ nhận được bài học / bài tập này trong mục Bài tập của lớp để xem và nộp bài.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmitAssign} className="px-7 py-5 space-y-4">

                  {/* Class selector – custom dropdown */}
                  <div>
                    <label className="font-heading block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Chọn lớp học <span className="text-rose-500">*</span>
                    </label>
                    {classesLoading ? (
                      <div className="font-body w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-400 font-bold animate-pulse">
                        Đang tải danh sách lớp...
                      </div>
                    ) : classes.length === 0 ? (
                      <div className="font-body w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 font-bold">
                        Bạn chưa có lớp học nào. Hãy tạo lớp trong mục Quản lý lớp học.
                      </div>
                    ) : (
                      <div className="relative">
                        {/* Trigger button */}
                        <button
                          type="button"
                          onClick={() => setClassDropdownOpen(o => !o)}
                          className={`font-heading w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-extrabold transition-all ${classDropdownOpen
                            ? 'bg-white border-cyan-500 text-slate-900 shadow-sm shadow-cyan-100'
                            : assignClassId
                              ? 'bg-white border-slate-200 text-slate-900 hover:border-cyan-400'
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-cyan-400'
                            }`}
                        >
                          <span className={assignClassId ? 'text-slate-900' : 'text-slate-400'}>
                            {selectedClass ? selectedClass.name : '-- Chọn lớp học --'}
                          </span>
                          {classDropdownOpen
                            ? <ChevronUp className="w-4 h-4 text-cyan-600 shrink-0" />
                            : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                        </button>

                        {/* Dropdown panel */}
                        {classDropdownOpen && (
                          <div className="absolute z-10 top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/60 overflow-hidden">
                            <ul className="max-h-44 overflow-y-auto divide-y divide-slate-100">
                              {classes.map(cls => (
                                <li key={cls.id}>
                                  <button
                                    type="button"
                                    onClick={() => { setAssignClassId(cls.id); setClassDropdownOpen(false); }}
                                    className={`font-heading w-full text-left px-4 py-3 text-sm font-extrabold transition-colors ${assignClassId === cls.id
                                      ? 'bg-cyan-700 text-white'
                                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                      }`}
                                  >
                                    {cls.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Link field */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Đường link bài học / tài liệu <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={assignLink}
                        onChange={(e) => setAssignLink(e.target.value)}
                        placeholder="https://..."
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                      <ExternalLink className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Due date */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Hạn nộp bài (không bắt buộc)
                    </label>
                    <input
                      type="date"
                      value={assignDueDate}
                      onChange={(e) => setAssignDueDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
                    />
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                      Hướng dẫn / Ghi chú cho học sinh
                    </label>
                    <textarea
                      rows={2}
                      value={assignNote}
                      onChange={(e) => setAssignNote(e.target.value)}
                      placeholder="VD: Học sinh xem bài giảng và hoàn thành bài tập theo yêu cầu..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={closeAssignModal}
                      className="flex-1 px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-xl transition-all text-sm"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={assignSubmitting || !assignClassId || !assignLink.trim() || classes.length === 0}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-700 to-teal-700 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black transition-all text-sm shadow-lg shadow-cyan-700/20 uppercase tracking-wider"
                    >
                      {assignSubmitting ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang giao...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Giao bài</>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL FOR DELETING CONTENT */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative space-y-6 animate-scale-up">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-inner">
                <Trash2 className="w-7 h-7" />
              </div>
              <div className="space-y-1 pt-1">
                <h3 className="font-heading text-xl font-extrabold text-slate-900 leading-tight">Xóa học liệu khỏi hệ thống</h3>
                <p className="font-body text-xs font-semibold text-slate-500 leading-relaxed">
                  Bạn có chắc chắn muốn xóa bài "{deleteConfirmModal.item?.name || deleteConfirmModal.item?.title || 'này'}"? Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal({ isOpen: false, item: null })}
                className="flex-1 px-5 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-2xl transition-all text-xs uppercase tracking-wider"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => executeDeleteContent(deleteConfirmModal.item)}
                disabled={deleteSubmitting}
                className="flex-1 px-5 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl shadow-lg shadow-rose-600/20 transition-all text-xs uppercase tracking-wider disabled:opacity-50 active:scale-95"
              >
                {deleteSubmitting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseContent;

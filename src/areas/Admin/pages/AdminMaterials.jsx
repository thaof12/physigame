import { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  ClipboardList,
  GraduationCap,
  User,
  ExternalLink,
  X,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Edit,
  Eye,
  FileText,
  Bell,
  Check,
  MessageSquare
} from 'lucide-react';
import api from '../../../config/api';

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

const AdminMaterials = () => {
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' | 'exercises'
  const [lessons, setLessons] = useState(() => {
    try {
      const cached = localStorage.getItem('physigame_admin_mat_lessons');
      return cached ? JSON.parse(cached) : [];
    } catch (e) { return []; }
  });
  const [exercises, setExercises] = useState(() => {
    try {
      const cached = localStorage.getItem('physigame_admin_mat_exercises');
      return cached ? JSON.parse(cached) : [];
    } catch (e) { return []; }
  });
  const [reports, setReports] = useState(() => {
    try {
      const cached = localStorage.getItem('physigame_admin_mat_reports');
      return cached ? JSON.parse(cached) : [];
    } catch (e) { return []; }
  });
  const [lockedIds, setLockedIds] = useState(() => {
    try {
      const cached = localStorage.getItem('physigame_admin_mat_locked');
      return cached ? JSON.parse(cached) : [];
    } catch (e) { return []; }
  });
  const [loading, setLoading] = useState(() => {
    const hasCache = localStorage.getItem('physigame_admin_mat_lessons');
    return !hasCache;
  });

  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterOnlyReported, setFilterOnlyReported] = useState(false);

  // Modals state
  const [selectedItem, setSelectedItem] = useState(null); // Detail modal
  const [editItem, setEditItem] = useState(null); // Edit / Manage modal
  const [confirmDeleteModalItem, setConfirmDeleteModalItem] = useState(null); // Custom confirm delete modal (Thay thế window.confirm)

  // Toast / Status banner
  const [statusNotification, setStatusNotification] = useState(null);

  // Reply to report states
  const [replyingReportId, setReplyingReportId] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replySuccessReportId, setReplySuccessReportId] = useState(null);

  // Warning modal state
  const [warningMessage, setWarningMessage] = useState('');
  const [warningSubmitting, setWarningSubmitting] = useState(false);
  const [warningSuccess, setWarningSuccess] = useState(false);
  const [lockSubmitting, setLockSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [resolveSubmitting, setResolveSubmitting] = useState(false);

  // Grade dropdown filter
  const [gradeDropdownOpen, setGradeDropdownOpen] = useState(false);

  useEffect(() => {
    fetchContentAndReports();
  }, []);

  const showStatus = (type, text) => {
    setStatusNotification({ type, text });
    // Success messages auto-dismiss after 5s
    // Error messages stay until user manually closes them (they need to read why it failed)
    if (type === 'success') {
      setTimeout(() => setStatusNotification(prev => prev?.text === text ? null : prev), 5000);
    }
  };

  const dismissStatus = () => setStatusNotification(null);

  const fetchContentAndReports = async () => {
    try {
      const [lessonsRes, challengesRes, reportsRes] = await Promise.all([
        api.get('/lessons?teacherId=all'),
        api.get('/challenges?teacherId=all'),
        api.get('/reports')
      ]);

      const fetchedLessons = Array.isArray(lessonsRes.data) ? lessonsRes.data : [];
      const fetchedExercises = Array.isArray(challengesRes.data) ? challengesRes.data : [];

      setLessons(fetchedLessons);
      setExercises(fetchedExercises);

      try {
        localStorage.setItem('physigame_admin_mat_lessons', JSON.stringify(fetchedLessons));
        localStorage.setItem('physigame_admin_mat_exercises', JSON.stringify(fetchedExercises));
      } catch (e) {}

      if (reportsRes.data && reportsRes.data.success) {
        const fetchedReports = reportsRes.data.reports || [];
        const fetchedLocked = reportsRes.data.locked_ids || [];
        setReports(fetchedReports);
        setLockedIds(fetchedLocked);

        try {
          localStorage.setItem('physigame_admin_mat_reports', JSON.stringify(fetchedReports));
          localStorage.setItem('physigame_admin_mat_locked', JSON.stringify(fetchedLocked));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error fetching admin materials content:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract author info
  const getAuthorInfo = (item) => {
    if (item.game && typeof item.game === 'object') {
      if (item.game.author_name) {
        return {
          name: item.game.author_name,
          isAnonymous: !!item.game.is_anonymous,
          isTeacher: true
        };
      }
    }
    if (Array.isArray(item.features) && item.features[0] && typeof item.features[0] === 'object') {
      if (item.features[0].author_name) {
        return {
          name: item.features[0].author_name,
          isAnonymous: !!item.features[0].is_anonymous,
          isTeacher: true
        };
      }
    }
    if (item.teacher_id || item.teacherId) {
      return {
        name: 'Giáo viên',
        isAnonymous: false,
        isTeacher: true
      };
    }
    return {
      name: 'Hệ thống physiGame',
      isAnonymous: false,
      isTeacher: false
    };
  };

  // Active content list based on tab
  const rawList = activeTab === 'lessons' ? lessons : exercises;

  // Available grades
  const availableGrades = Array.from(
    new Set(rawList.map(item => Number(item.grade || item.class_id || 8)))
  ).filter(Boolean).sort((a, b) => a - b);

  // Filtered content list
  const filteredContent = rawList.filter(item => {
    const title = (item.title || item.name || '').toLowerCase();
    const matchesKeyword = !searchKeyword.trim() || title.includes(searchKeyword.trim().toLowerCase());

    const itemGrade = Number(item.grade || item.class_id || 8);
    const matchesGrade = filterGrade === 'all' || itemGrade === Number(filterGrade);

    const itemReports = reports.filter(r => String(r.content_id) === String(item.id));
    const hasReport = itemReports.length > 0;
    const matchesReportedFilter = !filterOnlyReported || hasReport;

    return matchesKeyword && matchesGrade && matchesReportedFilter;
  });

  // Report counts per category
  const lessonReportsCount = reports.filter(r => lessons.some(l => String(l.id) === String(r.content_id))).length;
  const exerciseReportsCount = reports.filter(r => exercises.some(e => String(e.id) === String(r.content_id))).length;
  const currentTabReportCount = activeTab === 'lessons' ? lessonReportsCount : exerciseReportsCount;

  // Handle reply directly to reporting teacher
  const handleSendReplyToReporter = async (e, rep) => {
    e.preventDefault();
    if (!replyMessage.trim() || !rep) return;

    setReplySubmitting(true);
    try {
      await api.post('/reports/reply', {
        report_id: rep.id,
        reporter_id: rep.reporter_id,
        content_title: editItem.name || editItem.title,
        reply_message: replyMessage.trim()
      });

      setReplySuccessReportId(rep.id);
      setReplyMessage('');
      setTimeout(() => {
        setReplySuccessReportId(null);
        setReplyingReportId(null);
      }, 3000);
    } catch (err) {
      console.error('Error replying to report:', err);
      showStatus('error', 'Không thể gửi phản hồi tới giáo viên. Vui lòng thử lại.');
    } finally {
      setReplySubmitting(false);
    }
  };

  // Handle send warning feedback to warned teacher
  const handleSendWarning = async (e) => {
    e.preventDefault();
    if (!warningMessage.trim() || !editItem) return;

    setWarningSubmitting(true);
    try {
      await api.post('/reports/warning', {
        content_id: editItem.id,
        content_title: editItem.name || editItem.title,
        teacher_id: editItem.teacher_id || editItem.teacherId,
        warning_message: warningMessage.trim()
      });

      setWarningSuccess(true);
      setWarningMessage('');
      setTimeout(() => setWarningSuccess(false), 3000);
    } catch (err) {
      console.error('Error sending warning:', err);
      showStatus('error', 'Không thể gửi cảnh báo. Vui lòng thử lại.');
    } finally {
      setWarningSubmitting(false);
    }
  };

  // Handle toggle content lock
  const handleToggleLock = async () => {
    if (!editItem) return;
    const currentlyLocked = lockedIds.includes(String(editItem.id)) || editItem.is_locked || editItem.status === 'locked';

    setLockSubmitting(true);
    try {
      const res = await api.put('/reports/lock', {
        content_id: editItem.id,
        content_type: activeTab === 'lessons' ? 'lesson' : 'exercise',
        is_locked: !currentlyLocked
      });

      if (res.data && res.data.success) {
        const newLockedState = !currentlyLocked;
        // Instant local state update
        if (res.data.locked_ids) {
          setLockedIds(res.data.locked_ids);
        } else {
          setLockedIds(prev =>
            newLockedState
              ? [...prev.filter(lid => lid !== String(editItem.id)), String(editItem.id)]
              : prev.filter(lid => lid !== String(editItem.id))
          );
        }
        if (activeTab === 'lessons') {
          setLessons(prev => prev.map(item => item.id === editItem.id ? { ...item, is_locked: newLockedState } : item));
        } else {
          setExercises(prev => prev.map(item => item.id === editItem.id ? { ...item, is_locked: newLockedState } : item));
        }
        setEditItem(prev => ({ ...prev, is_locked: newLockedState }));
        showStatus('success', newLockedState ? 'Đã vô hiệu hóa bài viết trong giao diện giáo viên.' : 'Đã mở khóa bài viết cho giáo viên.');
      }
    } catch (err) {
      console.error('Error toggling lock:', err);
      showStatus('error', 'Không thể cập nhật trạng thái khóa bài. Vui lòng thử lại.');
    } finally {
      setLockSubmitting(false);
    }
  };

  // Trigger Custom Confirm Modal for Deletion (Không dùng window.confirm)
  const onRequestDeleteContent = () => {
    if (!editItem) return;
    setConfirmDeleteModalItem(editItem);
  };

  // Execute actual delete upon Custom Modal confirmation
  const executeDeleteContent = async () => {
    if (!confirmDeleteModalItem) return;
    const itemToDelete = confirmDeleteModalItem;

    setDeleteSubmitting(true);
    // Optimistic: close modal immediately so admin sees it's working
    setConfirmDeleteModalItem(null);
    setEditItem(null);

    try {
      if (activeTab === 'lessons') {
        await api.delete(`/lessons/${itemToDelete.id}`);
      } else {
        await api.delete(`/challenges/${itemToDelete.id}`);
      }

      // Clean up reports for this content
      await api.delete(`/reports/content/${itemToDelete.id}`).catch(() => {});

      const deletedTitle = itemToDelete.name || itemToDelete.title;

      // Instant local state update — don't wait for full fetch to remove item
      if (activeTab === 'lessons') {
        setLessons(prev => prev.filter(l => String(l.id) !== String(itemToDelete.id)));
      } else {
        setExercises(prev => prev.filter(e => String(e.id) !== String(itemToDelete.id)));
      }
      // Remove all reports for this deleted content from local state
      setReports(prev => prev.filter(r => String(r.content_id) !== String(itemToDelete.id)));
      // Remove from locked IDs if any
      setLockedIds(prev => prev.filter(lid => String(lid) !== String(itemToDelete.id)));

      showStatus('success', `Đã xóa bài viết "${deletedTitle}" thành công khỏi hệ thống!`);
    } catch (err) {
      console.error('Error deleting item:', err);
      // On failure, re-open edit modal so admin can retry
      setEditItem(itemToDelete);
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error || 'Không thể xóa bài viết này. Vui lòng thử lại.';
      showStatus('error', errorMsg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Handle resolve/dismiss reports for a content item
  const handleResolveReports = async (contentId) => {
    if (!contentId) return;

    setResolveSubmitting(true);
    try {
      await api.delete(`/reports/content/${contentId}`);

      // Instant local state update — remove reports for this content immediately
      setReports(prev => prev.filter(r => String(r.content_id) !== String(contentId)));

      // If the edit modal is open for this item, close it
      if (editItem && String(editItem.id) === String(contentId)) {
        setEditItem(null);
      }

      showStatus('success', 'Đã đánh dấu xử lý xong và dọn dẹp các báo cáo vi phạm!');
    } catch (err) {
      console.error('Error resolving reports:', err);
      showStatus('error', 'Không thể cập nhật trạng thái báo cáo. Vui lòng thử lại.');
    } finally {
      setResolveSubmitting(false);
    }
  };

  const gradeOptions = [{ value: 'all', label: 'Tất cả lớp' }, ...availableGrades.map(g => ({ value: String(g), label: `Lớp ${g}` }))];
  const selectedGradeLabel = gradeOptions.find(o => o.value === filterGrade)?.label || 'Tất cả lớp';

  return (
    <div className="space-y-6 pb-20 font-body relative">

      {/* Status Notification Toast Banner */}
      {statusNotification && (
        <div className={`fixed top-6 right-6 z-[400] px-5 py-3.5 rounded-2xl shadow-2xl border font-heading font-black text-xs flex items-center gap-2.5 max-w-sm ${
          statusNotification.type === 'success'
            ? 'bg-emerald-600 border-emerald-500 text-white'
            : 'bg-rose-600 border-rose-500 text-white'
        }`}>
          {statusNotification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-white shrink-0" /> : <AlertTriangle className="w-5 h-5 text-white shrink-0" />}
          <span className="flex-1 leading-snug">{statusNotification.text}</span>
          <button
            onClick={dismissStatus}
            className="ml-1 w-6 h-6 rounded-lg hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="w-7 h-7 text-[#4f46e5]" />
            Quản Lý Học Liệu & Nội Dung
          </h1>
          <p className="font-body text-slate-500 font-bold text-xs mt-1">
            Tổng hợp toàn bộ Bài giảng & Bài tập do Giáo viên đăng tải hoặc Hệ thống biên soạn
          </p>
        </div>

        {/* Tab Switch: Lessons vs Exercises */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => { setActiveTab('lessons'); setFilterGrade('all'); }}
            className={`font-heading px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 relative ${
              activeTab === 'lessons'
                ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Bài học ({lessons.length})</span>
            {lessonReportsCount > 0 && (
              <span
                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                className="flex items-center gap-1 px-2 py-0.5 font-black text-[10px] rounded-full shadow-sm animate-pulse"
              >
                <Bell className="w-3 h-3 text-white animate-bounce shrink-0" />
                {lessonReportsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('exercises'); setFilterGrade('all'); }}
            className={`font-heading px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 relative ${
              activeTab === 'exercises'
                ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Bài tập ({exercises.length})</span>
            {exerciseReportsCount > 0 && (
              <span
                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                className="flex items-center gap-1 px-2 py-0.5 font-black text-[10px] rounded-full shadow-sm animate-pulse"
              >
                <Bell className="w-3 h-3 text-white animate-bounce shrink-0" />
                {exerciseReportsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Warning Banner Alert if Reports exist */}
      {reports.length > 0 && (
        <div
          style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
          className="rounded-2xl p-4 shadow-lg shadow-red-600/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-red-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Bell className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm tracking-wide uppercase flex items-center gap-2 text-white">
                <span>CẢNH BÁO: BÁO CÁO VI PHẠM TỪ GIÁO VIÊN ({reports.length})</span>
              </h3>
              <p className="font-body text-xs text-white/90 font-bold mt-0.5">
                Các bài viết bị báo cáo được gắn <strong>Tag đỏ nổi bật (🔔 BÁO CÁO VI PHẠM)</strong> bên dưới để Admin có thể xem xét và truy xét nhanh chóng.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterOnlyReported(prev => !prev)}
            style={{
              backgroundColor: filterOnlyReported ? '#ffffff' : 'rgba(0,0,0,0.3)',
              color: filterOnlyReported ? '#dc2626' : '#ffffff'
            }}
            className="font-heading px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-2 shadow-md border border-white/20"
          >
            <Bell className="w-3.5 h-3.5" />
            {filterOnlyReported ? 'Hiển thị tất cả bài' : 'Chỉ xem bài bị báo cáo'}
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        {/* Search keyword input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm kiếm bài học hoặc bài tập..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#4f46e5] transition-all font-semibold"
          />
        </div>

        {/* Filter ONLY REPORTED Toggle */}
        <button
          type="button"
          onClick={() => setFilterOnlyReported(o => !o)}
          style={filterOnlyReported ? { backgroundColor: '#dc2626', color: '#ffffff', borderColor: '#dc2626' } : {}}
          className={`font-heading flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-extrabold transition-all shrink-0 ${
            filterOnlyReported
              ? 'shadow-md shadow-red-600/20'
              : currentTabReportCount > 0
                ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <Bell className={`w-4 h-4 ${filterOnlyReported ? 'text-white' : currentTabReportCount > 0 ? 'text-rose-600 animate-bounce' : 'text-slate-400'}`} />
          <span>Bài có báo cáo ({currentTabReportCount})</span>
        </button>

        {/* Grade Custom Dropdown Filter */}
        <div className="relative w-full md:w-52 shrink-0">
          <button
            type="button"
            onClick={() => setGradeDropdownOpen(o => !o)}
            className={`font-heading w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-extrabold transition-all ${
              gradeDropdownOpen
                ? 'bg-white border-[#4f46e5] text-slate-900 shadow-sm'
                : filterGrade !== 'all'
                  ? 'bg-indigo-50/70 border-indigo-200 text-[#4f46e5]'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              {selectedGradeLabel}
            </span>
            {gradeDropdownOpen ? <ChevronUp className="w-4 h-4 text-[#4f46e5]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {gradeDropdownOpen && (
            <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1">
              {gradeOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setFilterGrade(opt.value); setGradeDropdownOpen(false); }}
                  className={`font-heading w-full text-left px-4 py-2 text-xs font-extrabold transition-colors ${
                    filterGrade === opt.value
                      ? 'bg-[#4f46e5] text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-bold">Đang tải danh sách học liệu...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
          {filteredContent.map((item) => {
            const author = getAuthorInfo(item);
            const isLocked = lockedIds.includes(String(item.id)) || item.is_locked || item.status === 'locked';
            const itemReports = reports.filter(r => String(r.content_id) === String(item.id));
            const hasReport = itemReports.length > 0;

            return (
              <div
                key={item.id}
                className={`rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 relative overflow-hidden group ${
                  hasReport
                    ? 'bg-rose-50/40 border-2 border-red-500 shadow-xl shadow-red-500/10 ring-4 ring-red-500/15'
                    : 'bg-white border border-slate-200'
                }`}
              >

                {/* Status Badges & Red Tag Header */}
                <div className="space-y-2.5">
                  {hasReport && (
                    <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-rose-200/80">
                      {/* Red Tag Banner Label */}
                      <div
                        style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 font-heading font-black text-xs rounded-xl shadow-sm"
                      >
                        <Bell className="w-3.5 h-3.5 text-white animate-bounce shrink-0" />
                        <span>BÁO CÁO VI PHẠM ({itemReports.length})</span>
                      </div>

                      {/* Standalone Separate "Đã xử lý" Button */}
                      <button
                        type="button"
                        onClick={() => handleResolveReports(item.id)}
                        disabled={resolveSubmitting}
                        className="font-heading px-3 py-1.5 bg-white hover:bg-rose-100 border border-rose-300 text-rose-700 hover:text-rose-900 text-xs font-extrabold rounded-xl shadow-sm transition-all flex items-center gap-1 shrink-0"
                        title="Đánh dấu đã xử lý xong và dọn dẹp báo cáo"
                      >
                        <Check className="w-3.5 h-3.5 text-rose-600" />
                        <span>Đã xử lý</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-body text-xs text-slate-500 font-bold flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        Lớp {item.grade || item.class_id || 8}
                      </span>
                      {author.isTeacher && !author.isAnonymous && (
                        <span className="font-heading px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-extrabold rounded-md flex items-center gap-1 truncate max-w-[140px]">
                          <User className="w-3 h-3 text-teal-600 shrink-0" />
                          <span className="truncate">{author.name}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {isLocked && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-700" /> Đã khóa
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-heading text-slate-900 font-extrabold text-base leading-snug line-clamp-2">{item.name || item.title}</h3>
                  <p className="font-body text-slate-500 text-xs mt-1 line-clamp-2">
                    {item.description || 'Chưa có mô tả chi tiết'}
                  </p>
                </div>

                {/* Actions: Chi tiết & Xử lý Báo cáo / Chỉnh sửa */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="font-heading flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold rounded-xl text-xs transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Chi tiết
                  </button>
                  <button
                    onClick={() => { setEditItem(item); setWarningMessage(''); setWarningSuccess(false); setReplyingReportId(null); }}
                    style={hasReport ? { backgroundColor: '#dc2626', color: '#ffffff' } : {}}
                    className={`font-heading flex-1 flex items-center justify-center gap-1.5 px-3 py-2 font-extrabold rounded-xl text-xs transition-all shadow-sm ${
                      hasReport
                        ? 'hover:bg-red-700 shadow-md shadow-red-600/30 animate-pulse'
                        : 'bg-[#4f46e5] hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {hasReport ? <Bell className="w-3.5 h-3.5 text-white animate-bounce" /> : <Edit className="w-3.5 h-3.5 text-white" />}
                    {hasReport ? `Xử lý báo cáo (${itemReports.length})` : 'Quản lý bài'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredContent.length === 0 && !loading && (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center shadow-sm">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="font-body text-slate-400 font-bold">Không tìm thấy nội dung phù hợp</p>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 text-[#4f46e5]">
                  {activeTab === 'lessons' ? <BookOpen className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-heading text-xl font-extrabold text-slate-900">{selectedItem.name || selectedItem.title}</h3>
                  <span className="font-heading px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase rounded">
                    Lớp {selectedItem.grade || selectedItem.class_id || 8}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin">
              {/* Content Preview */}
              {(selectedItem.theory || selectedItem.link) && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden h-[400px] shadow-inner bg-slate-50">
                  <iframe
                    src={getEmbedUrl(selectedItem.theory || selectedItem.link)}
                    className="w-full h-full border-none"
                    title="Xem trước nội dung"
                  />
                </div>
              )}

              {selectedItem.description && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-medium text-slate-700">
                  {selectedItem.description}
                </div>
              )}
            </div>

            <div className="px-8 py-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => setSelectedItem(null)}
                className="font-heading px-6 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-extrabold hover:bg-slate-900 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / MANAGE REPORT MODAL */}
      {editItem && (() => {
        const author = getAuthorInfo(editItem);
        const itemReports = reports.filter(r => String(r.content_id) === String(editItem.id));
        const isLocked = lockedIds.includes(String(editItem.id)) || editItem.is_locked || editItem.status === 'locked';

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-[2rem] w-full max-w-5xl shadow-2xl border border-slate-100 overflow-hidden my-6">

              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3.5">
                  <div
                    style={itemReports.length > 0 ? { backgroundColor: '#fee2e2', color: '#dc2626' } : {}}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${itemReports.length > 0 ? '' : 'bg-indigo-50 text-[#4f46e5]'}`}
                  >
                    {itemReports.length > 0 ? <Bell className="w-6 h-6 animate-bounce text-red-600" /> : <ShieldAlert className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-extrabold text-slate-900">
                      {itemReports.length > 0 ? `Xử lý Báo cáo Vi phạm (${itemReports.length})` : 'Quản lý Bài viết'}
                    </h3>
                    <p className="font-body text-xs text-slate-500 font-bold truncate max-w-xl mt-0.5">
                      {editItem.name || editItem.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditItem(null)}
                  className="w-10 h-10 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Grid 12 Cột */}
              <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column (7/12): Reports List & Warning Feedback */}
                <div className="lg:col-span-7 space-y-6">

                  {/* Author Info */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <h4 className="font-heading text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Thông tin tác giả bài đăng</h4>
                      <p className="font-heading text-sm font-extrabold text-slate-900 mt-0.5">{author.name}</p>
                    </div>
                    {author.isAnonymous && (
                      <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">Đã chọn ẩn danh</span>
                    )}
                  </div>

                  {/* Reports List with Reply Button */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-heading text-xs font-extrabold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-red-600 animate-bounce" />
                        Danh sách báo cáo từ giáo viên ({itemReports.length})
                      </h4>
                      {itemReports.length > 0 && (
                        <button
                          onClick={() => handleResolveReports(editItem.id)}
                          disabled={resolveSubmitting}
                          style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                          className="font-heading px-3 py-1.5 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                        >
                          <Check className="w-3.5 h-3.5 text-white" />
                          Đánh dấu đã xử lý
                        </button>
                      )}
                    </div>

                    {itemReports.length === 0 ? (
                      <p className="font-body text-xs text-slate-400 italic bg-slate-50 p-4 rounded-2xl border border-slate-100">Bài viết này chưa bị báo cáo vi phạm nào.</p>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {itemReports.map(rep => (
                          <div key={rep.id} className="bg-rose-50/80 border border-rose-200/70 rounded-2xl p-4 text-xs space-y-2.5">
                            <div className="flex items-center justify-between font-bold text-rose-900">
                              <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-rose-600" />
                                Từ: <strong>{rep.reporter_name || 'Giáo viên'}</strong>
                              </span>
                              <span className="text-[10px] text-rose-600 font-medium">{new Date(rep.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <p className="text-slate-800 font-medium bg-white/70 p-3 rounded-xl border border-rose-100 leading-relaxed">{rep.reason}</p>

                            {/* Reply Action Row */}
                            <div className="flex items-center justify-between pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingReportId(replyingReportId === rep.id ? null : rep.id);
                                  setReplyMessage('');
                                }}
                                className="font-heading text-xs font-extrabold text-[#4f46e5] hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all border border-indigo-200"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-[#4f46e5]" />
                                {replyingReportId === rep.id ? 'Đóng trả lời' : 'Trả lời GV gửi báo cáo'}
                              </button>
                            </div>

                            {/* Inline Reply Form */}
                            {replyingReportId === rep.id && (
                              <form onSubmit={(e) => handleSendReplyToReporter(e, rep)} className="pt-3 border-t border-rose-200 space-y-2.5 animate-fade-in">
                                <label className="block text-xs font-extrabold text-slate-700">
                                  Phản hồi gửi tới chuông thông báo của GV <strong>{rep.reporter_name || 'Giáo viên'}</strong>:
                                </label>
                                <textarea
                                  rows={2}
                                  value={replyMessage}
                                  onChange={(e) => setReplyMessage(e.target.value)}
                                  placeholder="Nhập lời nhắn phản hồi tới giáo viên đã báo cáo..."
                                  className="w-full bg-white border border-indigo-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none"
                                />
                                {replySuccessReportId === rep.id && (
                                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> Đã gửi phản hồi tới icon thông báo của GV thành công!
                                  </p>
                                )}
                                <button
                                  type="submit"
                                  disabled={replySubmitting || !replyMessage.trim()}
                                  className="font-heading py-2.5 px-4 bg-[#4f46e5] hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
                                >
                                  <Send className="w-3.5 h-3.5 text-white" />
                                  {replySubmitting ? 'Đang gửi...' : 'Gửi phản hồi báo cáo'}
                                </button>
                              </form>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Warning Feedback Form to Warned Teacher */}
                  <form onSubmit={handleSendWarning} className="space-y-3 pt-4 border-t border-slate-200">
                    <div>
                      <label className="font-heading block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                        Phản hồi cảnh báo tới tác giả bài viết
                      </label>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Phản hồi này sẽ được gửi đến tác giả của bài đăng này ({author.name}).
                      </p>
                    </div>
                    <textarea
                      rows={3}
                      value={warningMessage}
                      onChange={(e) => setWarningMessage(e.target.value)}
                      placeholder="Nhập thông điệp cảnh báo yêu cầu chỉnh sửa hoặc thông báo vi phạm..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#4f46e5] font-medium resize-none"
                    />
                    {warningSuccess && (
                      <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Đã gửi phản hồi tới icon thông báo của Giáo viên bị cảnh báo thành công!
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={warningSubmitting || !warningMessage.trim()}
                      className="font-heading w-full py-3 bg-[#4f46e5] hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Send className="w-4 h-4 text-white" />
                      {warningSubmitting ? 'Đang gửi...' : 'Gửi cảnh báo tới giáo viên bị cảnh báo'}
                    </button>
                  </form>
                </div>

                {/* Right Column (5/12): Controls & Actions (Locking & Admin Deletion) */}
                <div className="lg:col-span-5 space-y-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-8">

                  <div className="space-y-6">
                    {/* Lock Action */}
                    <div className="space-y-3">
                      <h4 className="font-heading text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                        Vô hiệu hóa thao tác của Giáo viên
                      </h4>
                      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
                        <button
                          type="button"
                          onClick={handleToggleLock}
                          disabled={lockSubmitting}
                          className={`font-heading w-full py-3 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-sm ${
                            isLocked
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-amber-600 hover:bg-amber-700 text-white'
                          }`}
                        >
                          {isLocked ? (
                            <><Unlock className="w-4 h-4 text-white" /> Mở khóa cho giáo viên tác động</>
                          ) : (
                            <><Lock className="w-4 h-4 text-white" /> Vô hiệu hóa (Khóa cứng) quyền xóa của GV</>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Direct Admin Delete Action */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <h4 className="font-heading text-xs font-extrabold text-red-700 uppercase tracking-wider">
                        Xóa bài khỏi ngân hàng nội dung
                      </h4>
                      <button
                        type="button"
                        onClick={onRequestDeleteContent}
                        style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                        className="font-heading w-full py-3 px-4 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/20 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                        Xóa bài này vĩnh viễn
                      </button>
                    </div>
                  </div>

                  {/* Close Modal */}
                  <div className="pt-6 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setEditItem(null)}
                      className="font-heading px-8 py-3 bg-slate-800 text-white rounded-xl text-xs font-extrabold hover:bg-slate-900 transition-colors shadow-sm"
                    >
                      Hoàn tất
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* CUSTOM CONFIRM DELETE MODAL (Hoàn toàn thay thế window.confirm để không bị localhost says) */}
      {confirmDeleteModalItem && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-heading text-lg font-black text-slate-900">Xác Nhận Xóa Bài Viết</h3>
              <p className="font-body text-xs text-slate-500 font-bold leading-relaxed">
                Bạn có chắc chắn muốn XÓA bài <strong className="text-slate-900 font-extrabold">"{confirmDeleteModalItem.name || confirmDeleteModalItem.title}"</strong> khỏi hệ thống? Thao tác này không thể hoàn tác.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteModalItem(null)}
                className="font-heading flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={executeDeleteContent}
                disabled={deleteSubmitting}
                style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                className="font-heading flex-1 py-2.5 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-red-600/20 hover:bg-red-700 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
                {deleteSubmitting ? 'Đang xóa...' : 'Xác nhận Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminMaterials;

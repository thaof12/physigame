import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  UserCheck,
  UserX,
  X,
  Clock,
  Building,
  BookOpen,
  RefreshCw,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  Check,
  ShieldCheck,
  Phone,
  FileText,
  ExternalLink,
  Award,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../../../config/supabase';
import api from '../../../config/api';
import { sendTeacherStatusEmail, sendCustomFeedbackEmail } from '../../../services/emailService';

const CustomSelect = ({ value, onChange, options, className = "" }) => {
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
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="font-body w-full bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-xl px-4 py-2.5 text-sm text-[#274dad] font-bold flex items-center justify-between gap-3 focus:outline-none focus:bg-white focus:border-[#2099e9] transition-all cursor-pointer shadow-sm hover:border-[#2099e9]/40"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#2099e9]' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[60] bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden p-1.5 animate-in fade-in zoom-in-95 duration-150 min-w-[170px]">
          <div className="max-h-52 overflow-y-auto overflow-x-hidden space-y-1 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-3.5 py-2.5 rounded-xl font-body font-bold text-sm cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 text-[#2099e9]'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#2099e9]'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#2099e9] shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const roleFilterOptions = [
  { value: 'all', label: 'Tất cả vai trò' },
  { value: 'student', label: 'Học sinh' },
  { value: 'teacher', label: 'Giáo viên' },
  { value: 'admin', label: 'Quản trị viên' }
];

const statusFilterOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
  { value: 'pending', label: 'Chờ xác nhận' }
];

// Empty mock data array - Real data only
const mockUsers = [];
const PendingTeachersTab = ({ selectedTeacherIdFromState }) => {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('pending');
  const [selectedTeacherDetail, setSelectedTeacherDetail] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState(null);

  useEffect(() => {
    if (selectedTeacherDetail) {
      setFeedbackText('');
      setFeedbackStatus(null);
    }
  }, [selectedTeacherDetail]);

  const handleSendFeedback = async () => {
    if (!selectedTeacherDetail || !feedbackText.trim()) return;

    const targetEmail = selectedTeacherDetail.email;
    if (!targetEmail || targetEmail.includes('@example.com') || targetEmail === 'Chưa cập nhật email') {
      setFeedbackStatus({ type: 'error', message: 'Ứng viên chưa cập nhật địa chỉ email hợp lệ.' });
      return;
    }

    setSendingFeedback(true);
    setFeedbackStatus(null);

    try {
      const result = await sendCustomFeedbackEmail(
        targetEmail,
        selectedTeacherDetail.displayName || selectedTeacherDetail.username,
        feedbackText.trim()
      );

      if (result.success) {
        setFeedbackStatus({ type: 'success', message: `Đã gửi email phản hồi thành công đến ${targetEmail}!` });
        setFeedbackText('');
      } else {
        setFeedbackStatus({ type: 'error', message: result.error || 'Gửi email phản hồi thất bại.' });
      }
    } catch (err) {
      setFeedbackStatus({ type: 'error', message: 'Lỗi kết nối khi gửi email phản hồi.' });
    } finally {
      setSendingFeedback(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    setError('');
    
    // Safety timer to prevent infinite loading state
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    try {
      let usersData = null;
      try {
        const apiRes = await api.get('/users/teachers');
        if (apiRes.data?.success && Array.isArray(apiRes.data.teachers)) {
          usersData = apiRes.data.teachers;
        }
      } catch (e) {
        console.warn('⚠️ [AdminUsers] API /users/teachers failed, falling back to direct Supabase SDK:', e?.message);
      }

      if (!usersData) {
        const { data: dbData, error: usersErr } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'teacher');
        if (usersErr) throw usersErr;
        usersData = dbData;
      }

      const formatted = await Promise.all((usersData || []).map(async (t) => {
        const rawCerts = t.teacher_profile?.certificates || [];
        const certsWithSignedUrls = await Promise.all(
          (Array.isArray(rawCerts) ? rawCerts : []).map(async (cert) => {
            if (!cert) return { viewUrl: null, isImage: false };
            let viewUrl = null;
            let rawPath = typeof cert === 'string' ? cert : (cert.path || cert.url || '');
            if (typeof rawPath === 'string' && rawPath.includes('/teacher-certificates/')) {
              rawPath = rawPath.split('/teacher-certificates/')[1];
            }

            const isStoragePath = typeof rawPath === 'string' &&
              rawPath.length > 0 &&
              !rawPath.startsWith('http://') &&
              !rawPath.startsWith('https://') &&
              !rawPath.startsWith('data:') &&
              !rawPath.startsWith('blob:');

            if (isStoragePath) {
              const cleanPath = rawPath.replace(/^teacher-certificates\//, '');
              try {
                const { data: pubData } = supabase.storage
                  .from('teacher-certificates')
                  .getPublicUrl(cleanPath);
                if (pubData?.publicUrl) {
                  viewUrl = pubData.publicUrl;
                }
              } catch (e) {}

              if (!viewUrl) {
                try {
                  const signedPromise = supabase.storage
                    .from('teacher-certificates')
                    .createSignedUrl(cleanPath, 86400);
                  const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ data: null }), 1500));
                  const { data } = await Promise.race([signedPromise, timeoutPromise]);
                  if (data?.signedUrl) {
                    viewUrl = data.signedUrl;
                  }
                } catch (e) {}
              }
            }

            if (!viewUrl) {
              viewUrl = (typeof cert === 'object' && cert) ? (cert.viewUrl || cert.url || cert.base64 || cert.preview || null) : (typeof cert === 'string' ? cert : null);
            }

            const certName = typeof cert === 'object' && cert ? cert.name : '';
            const certType = typeof cert === 'object' && cert ? cert.type : '';

            const isImage = Boolean(
              (certType && certType.startsWith('image/')) ||
              (certName && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(certName)) ||
              (viewUrl && typeof viewUrl === 'string' && (
                viewUrl.startsWith('data:image/') ||
                /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(viewUrl) ||
                viewUrl.includes('teacher-certificates')
              ))
            );

            return {
              ...(typeof cert === 'object' && cert ? cert : { url: cert }),
              viewUrl,
              isImage
            };
          })
        );

        const rawEmail = (t.teacher_profile?.email && typeof t.teacher_profile.email === 'string' && !t.teacher_profile.email.includes('@example.com'))
          ? t.teacher_profile.email
          : (t.email && typeof t.email === 'string' && !t.email.includes('@example.com') ? t.email : null);
        const resolvedEmail = rawEmail || 'Chưa cập nhật email';

        return {
          _id: t.id,
          id: t.id,
          username: t.display_name || t.username || 'Giáo viên',
          displayName: t.display_name || t.username || 'Giáo viên',
          email: resolvedEmail,
          avatar: t.avatar_url || t.avatar || t.profile?.avatar || t.teacher_profile?.avatar || null,
          teacherStatus: t.teacher_status || 'pending',
          teacherProfile: {
            email: resolvedEmail,
            school: t.teacher_profile?.school || t.profile?.school || 'Chưa cập nhật',
            subject: t.teacher_profile?.subject || t.profile?.subject || 'Vật lý',
            phone: t.teacher_profile?.phone || null,
            experience: t.teacher_profile?.experience || null,
            degree: t.teacher_profile?.degree || null,
            reason: t.teacher_profile?.reason || null,
            certificates: certsWithSignedUrls,
            appliedAt: t.teacher_profile?.applied_at || t.created_at,
            rejectionReason: t.teacher_profile?.rejectionReason || t.profile?.rejectionReason
          },
          originalData: t
        };
      }));

      setAllTeachers(formatted);
      setPendingTeachers(formatted.filter(t => (t.teacherStatus || '').toLowerCase() === 'pending'));
    } catch (err) {
      console.error('Error fetching real teachers:', err);
      setError('Không thể tải danh sách giáo viên từ database');
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTeacherIdFromState && allTeachers.length > 0) {
      const found = allTeachers.find(t => String(t.id) === String(selectedTeacherIdFromState));
      if (found) {
        setSelectedTeacherDetail(found);
      }
    }
  }, [selectedTeacherIdFromState, allTeachers]);

  const handleVerify = async (teacherId) => {
    const teacher = allTeachers.find(t => t.id === teacherId);
    setActionLoading(teacherId);
    try {
      console.log('📡 [AdminUsers] Elevating approval through backend API...');
      const response = await api.post(`/users/verify-teacher/${teacherId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Approval failed');
      }

      if (teacher?.email) {
        await sendTeacherStatusEmail(teacher.email, teacher.displayName, 'verified');
      }
      
      try {
        const bc = new BroadcastChannel('physigame_teacher_status_actions');
        bc.postMessage({ type: 'TEACHER_STATUS_UPDATED', teacherId, status: 'verified' });
        bc.close();
      } catch (e) {}

      await fetchTeachers();
      if (selectedTeacherDetail?.id === teacherId) {
        setSelectedTeacherDetail(null);
      }
    } catch (err) {
      console.error('Error verifying teacher:', err);
      setError('Lỗi khi duyệt giáo viên');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const teacherId = rejectModal;
    const teacher = allTeachers.find(t => t.id === teacherId);
    
    setActionLoading(teacherId);
    try {
      console.log('📡 [AdminUsers] Elevating rejection through backend API...');
      const response = await api.post(`/users/reject-teacher/${teacherId}`, {
        reason: rejectReason
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Rejection failed');
      }

      if (teacher?.email) {
        await sendTeacherStatusEmail(teacher.email, teacher.displayName, 'rejected', rejectReason);
      }

      try {
        const bc = new BroadcastChannel('physigame_teacher_status_actions');
        bc.postMessage({ type: 'TEACHER_STATUS_UPDATED', teacherId, status: 'rejected' });
        bc.close();
      } catch (e) {}

      setRejectModal(null);
      setRejectReason('');
      await fetchTeachers();
      if (selectedTeacherDetail?.id === teacherId) {
        setSelectedTeacherDetail(null);
      }
    } catch (err) {
      console.error('Error rejecting teacher:', err);
      setError('Lỗi khi từ chối giáo viên');
    } finally {
      setActionLoading(null);
    }
  };

  const getFilteredTeachers = () => {
    if (teacherFilter === 'pending') return pendingTeachers;
    if (teacherFilter === 'all') return allTeachers;
    return allTeachers.filter(t => t.teacherStatus === teacherFilter);
  };

  const filteredTeachers = getFilteredTeachers();

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setTeacherFilter('pending')}
          className={`bg-white border-2 rounded-[1.5rem] p-5 cursor-pointer transition-all shadow-sm ${
            teacherFilter === 'pending' ? 'border-indigo-400 bg-indigo-50/50 shadow-indigo-100' : 'border-slate-100 hover:border-indigo-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 rounded-xl">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-heading text-2xl font-extrabold text-slate-900">{pendingTeachers.length}</p>
              <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Chờ duyệt</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setTeacherFilter('verified')}
          className={`bg-white border-2 rounded-[1.5rem] p-5 cursor-pointer transition-all shadow-sm ${
            teacherFilter === 'verified' ? 'border-emerald-400 bg-emerald-50/50 shadow-emerald-100' : 'border-slate-100 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-heading text-2xl font-extrabold text-slate-900">
                {allTeachers.filter(t => t.teacherStatus === 'verified').length}
              </p>
              <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Đã duyệt</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setTeacherFilter('rejected')}
          className={`bg-white border-2 rounded-[1.5rem] p-5 cursor-pointer transition-all shadow-sm ${
            teacherFilter === 'rejected' ? 'border-rose-400 bg-rose-50/50 shadow-rose-100' : 'border-slate-100 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 rounded-xl">
              <UserX className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="font-heading text-2xl font-extrabold text-slate-900">
                {allTeachers.filter(t => t.teacherStatus === 'rejected').length}
              </p>
              <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Đã từ chối</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setTeacherFilter('all')}
          className={`bg-white border-2 rounded-[1.5rem] p-5 cursor-pointer transition-all shadow-sm ${
            teacherFilter === 'all' ? 'border-violet-400 bg-violet-50/50 shadow-violet-100' : 'border-slate-100 hover:border-violet-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-100 rounded-xl">
              <GraduationCap className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="font-heading text-2xl font-extrabold text-slate-900">{allTeachers.length}</p>
              <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Tổng hồ sơ</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <p className="text-sm font-bold text-rose-600">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-rose-400 hover:text-rose-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Refresh */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base font-extrabold text-slate-900">
          {teacherFilter === 'pending' ? 'Giáo viên chờ duyệt' :
           teacherFilter === 'verified' ? 'Giáo viên đã duyệt' :
           teacherFilter === 'rejected' ? 'Giáo viên bị từ chối' :
           'Tất cả giáo viên'}
        </h3>
        <button
          onClick={fetchTeachers}
          disabled={loading}
          className="font-heading flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all font-extrabold text-sm shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Teachers list */}
      {loading ? (
        <div className="bg-white border border-slate-100 rounded-[2rem] p-16 text-center shadow-sm font-body">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold text-sm">Đang tải dữ liệu...</p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-[2rem] p-16 text-center shadow-sm font-body">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 font-heading font-extrabold">
            {teacherFilter === 'pending' ? 'Không có giáo viên nào đang chờ duyệt' : 'Không có dữ liệu'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher._id}
              onClick={() => setSelectedTeacherDetail(teacher)}
              className="p-6 bg-white hover:bg-indigo-50/20 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group shadow-sm hover:shadow-md space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white font-heading font-extrabold text-lg shadow-lg shadow-indigo-500/20 overflow-hidden shrink-0 relative">
                    {teacher.avatar && teacher.avatar !== 'null' && teacher.avatar !== 'undefined' ? (
                      <img
                        src={teacher.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span className={`${teacher.avatar && teacher.avatar !== 'null' && teacher.avatar !== 'undefined' ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                      {(teacher.displayName || teacher.username || 'G')[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-heading font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {teacher.displayName || teacher.username}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-heading font-extrabold uppercase tracking-widest ${
                        teacher.teacherStatus === 'pending' ? 'bg-indigo-100 text-indigo-600' :
                        teacher.teacherStatus === 'verified' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-rose-100 text-rose-600'
                      }`}>
                        {teacher.teacherStatus === 'pending' ? 'Chờ duyệt' :
                         teacher.teacherStatus === 'verified' ? 'Đã duyệt' : 'Từ chối'}
                      </span>
                    </div>
                    <div className="font-body flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1 text-indigo-600"><Mail className="w-3.5 h-3.5" />{teacher.email}</span>
                      {teacher.teacherProfile?.phone && (
                        <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{teacher.teacherProfile.phone}</span>
                      )}
                      {teacher.teacherProfile?.school && (
                        <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" />{teacher.teacherProfile.school}</span>
                      )}
                      {teacher.teacherProfile?.subject && (
                        <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{teacher.teacherProfile.subject}</span>
                      )}
                    </div>
                    <p className="font-body text-xs text-slate-300 mt-1">Đăng ký: {formatDate(teacher.teacherProfile?.appliedAt || teacher.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedTeacherDetail(teacher)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-heading font-extrabold text-xs transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    Chi tiết đơn
                  </button>

                  {teacher.teacherStatus === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVerify(teacher._id)}
                        disabled={actionLoading === teacher._id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-heading font-extrabold text-xs transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                      >
                        {actionLoading === teacher._id ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        Duyệt
                      </button>
                      <button
                        onClick={() => setRejectModal(teacher._id)}
                        disabled={actionLoading === teacher._id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl font-heading font-extrabold text-xs transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILED TEACHER APPLICATION MODAL (Horizontal Layout) */}
      {selectedTeacherDetail && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-6xl my-6 overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-[#faf9f5] border-b border-amber-200/40 px-6 py-4 sm:px-8 sm:py-5 text-slate-900 relative shrink-0">
              <button
                onClick={() => setSelectedTeacherDetail(null)}
                className="absolute top-4 right-6 w-9 h-9 bg-slate-200/60 hover:bg-slate-300/80 rounded-full flex items-center justify-center text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="px-2.5 py-0.5 bg-amber-100/80 border border-amber-200/80 rounded-full text-[11px] font-heading font-extrabold uppercase tracking-wider text-amber-900">
                  Chi Tiết Đơn Đăng Ký
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-heading font-extrabold uppercase tracking-wider border ${
                  selectedTeacherDetail.teacherStatus === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                  selectedTeacherDetail.teacherStatus === 'verified' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                  'bg-rose-50 text-rose-800 border-rose-300'
                }`}>
                  {selectedTeacherDetail.teacherStatus === 'pending' ? 'Chờ xét duyệt' :
                   selectedTeacherDetail.teacherStatus === 'verified' ? 'Đã duyệt' : 'Từ chối'}
                </span>
              </div>
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                <h2 className="font-heading text-lg md:text-xl font-black text-slate-900">
                  Hồ Sơ Đăng Ký Giảng Viên
                </h2>
                <span className="font-body text-slate-500 text-xs md:text-sm font-medium">
                  Ứng viên: <strong className="text-slate-800 font-extrabold">{selectedTeacherDetail.displayName || selectedTeacherDetail.username}</strong>
                </span>
              </div>
            </div>

            {/* Modal Body: Horizontal 2-Column Grid */}
            <div className="p-6 sm:p-8 overflow-y-auto font-body flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* LEFT COLUMN: Applicant Info & Form Response Details (7 Columns) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Applicant Profile Card */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center text-white font-heading font-black text-2xl sm:text-3xl shadow-lg shadow-indigo-500/20 shrink-0 overflow-hidden relative">
                      {selectedTeacherDetail.avatar && selectedTeacherDetail.avatar !== 'null' && selectedTeacherDetail.avatar !== 'undefined' ? (
                        <img
                          src={selectedTeacherDetail.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span className={`${selectedTeacherDetail.avatar && selectedTeacherDetail.avatar !== 'null' && selectedTeacherDetail.avatar !== 'undefined' ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                        {(selectedTeacherDetail.displayName || selectedTeacherDetail.username || 'G')[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                      <h3 className="font-heading text-xl font-extrabold text-slate-900 truncate">
                        {selectedTeacherDetail.displayName || selectedTeacherDetail.username}
                      </h3>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">
                          <Mail className="w-4 h-4 shrink-0" />
                          <span className="font-mono text-xs">{selectedTeacherDetail.email}</span>
                        </div>
                        {selectedTeacherDetail.teacherProfile?.phone && (
                          <div className="flex items-center gap-1.5 bg-slate-200/60 px-3 py-1 rounded-xl text-slate-700">
                            <Phone className="w-4 h-4 shrink-0 text-slate-400" />
                            <span>{selectedTeacherDetail.teacherProfile.phone}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        Ngày gửi đơn: {formatDate(selectedTeacherDetail.teacherProfile?.appliedAt || selectedTeacherDetail.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Form Information Grid */}
                  <div>
                    <h4 className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Building className="w-4 h-4 text-indigo-500" />
                      Thông Tin Chuyên Môn & Đơn Đăng Ký
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3.5">
                      <div className="p-4 bg-[#e4f2f0]/30 rounded-2xl border border-[#e4f2f0]">
                        <span className="text-[10px] font-heading font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                          Trường / Đơn vị công tác
                        </span>
                        <span className="font-heading text-sm font-extrabold text-[#274dad]">
                          {selectedTeacherDetail.teacherProfile?.school || 'Chưa cập nhật'}
                        </span>
                      </div>

                      <div className="p-4 bg-[#e4f2f0]/30 rounded-2xl border border-[#e4f2f0]">
                        <span className="text-[10px] font-heading font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                          Môn giảng dạy
                        </span>
                        <span className="font-heading text-sm font-extrabold text-[#274dad]">
                          {selectedTeacherDetail.teacherProfile?.subject || 'Vật lý'}
                        </span>
                      </div>

                      <div className="p-4 bg-[#e4f2f0]/30 rounded-2xl border border-[#e4f2f0]">
                        <span className="text-[10px] font-heading font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                          Kinh nghiệm giảng dạy
                        </span>
                        <span className="font-heading text-sm font-extrabold text-[#274dad]">
                          {selectedTeacherDetail.teacherProfile?.experience || 'Chưa cập nhật'}
                        </span>
                      </div>

                      <div className="p-4 bg-[#e4f2f0]/30 rounded-2xl border border-[#e4f2f0]">
                        <span className="text-[10px] font-heading font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                          Bằng cấp / Trình độ
                        </span>
                        <span className="font-heading text-sm font-extrabold text-[#274dad]">
                          {selectedTeacherDetail.teacherProfile?.degree || 'Chưa cập nhật'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Application Reason */}
                  {selectedTeacherDetail.teacherProfile?.reason && (
                    <div>
                      <h4 className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-violet-500" />
                        Lý Do Tham Gia Hệ Thống
                      </h4>
                      <div className="p-5 bg-gradient-to-r from-violet-50/70 to-indigo-50/70 rounded-2xl border border-violet-100">
                        <p className="text-sm text-slate-700 font-medium leading-relaxed italic">
                          "{selectedTeacherDetail.teacherProfile.reason}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: Proof Documents & Certificate Photo Gallery (5 Columns) */}
                <div className="lg:col-span-5 bg-slate-50/80 p-5 rounded-3xl border border-slate-100 space-y-4">
                  <h4 className="font-heading text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-500" />
                      Ảnh Minh Chứng Xét Duyệt ({selectedTeacherDetail.teacherProfile?.certificates?.length || 0})
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Nhấp ảnh để phóng to
                    </span>
                  </h4>

                  {selectedTeacherDetail.teacherProfile?.certificates && selectedTeacherDetail.teacherProfile.certificates.length > 0 ? (
                    <div className="space-y-3.5">
                      {selectedTeacherDetail.teacherProfile.certificates.map((cert, idx) => {
                        const fileLink = cert.viewUrl || cert.url || cert.base64;
                        const isImg = cert.isImage;

                        return (
                          <div
                            key={idx}
                            className="group relative bg-white border border-slate-200 rounded-2xl p-3 flex flex-col items-center justify-between transition-all hover:shadow-md hover:border-indigo-300"
                          >
                            {fileLink ? (
                              isImg ? (
                                <div
                                  onClick={() => setPreviewImage({ url: fileLink, fallbackUrl: cert.base64 || cert.url, name: cert.name || `Tài liệu ${idx + 1}` })}
                                  className="w-full h-44 rounded-xl overflow-hidden bg-slate-900/5 relative cursor-pointer group-hover:opacity-95 transition-opacity"
                                >
                                  <img
                                    src={fileLink}
                                    alt={cert.name || 'Proof'}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                      const fallback = cert.base64 || cert.url;
                                      if (fallback && e.target.src !== fallback && fallback !== fileLink) {
                                        console.log('🔄 Image load failed, falling back to base64 data');
                                        e.target.src = fallback;
                                      } else {
                                        console.warn('⚠️ Image failed to load:', fileLink);
                                        e.target.style.display = 'none';
                                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                      }
                                    }}
                                  />
                                  <div className="hidden w-full h-full items-center justify-center bg-slate-100 text-slate-400 text-xs font-bold p-4 text-center">
                                    Không thể hiển thị ảnh (File hỏng)
                                  </div>
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-heading text-xs font-extrabold gap-1.5 backdrop-blur-[2px]">
                                    <Eye className="w-4 h-4" />
                                    <span>Xem phóng to</span>
                                  </div>
                                </div>
                              ) : (
                                <a
                                  href={fileLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full h-36 rounded-xl bg-violet-50 border border-violet-100 flex flex-col items-center justify-center p-4 text-center group-hover:bg-violet-100 transition-colors"
                                >
                                  <FileText className="w-10 h-10 text-violet-500 mb-2" />
                                  <span className="text-xs font-extrabold text-violet-700 max-w-[180px] truncate">
                                    {cert.name || `Tài liệu ${idx + 1}`}
                                  </span>
                                  <span className="text-[10px] text-violet-400 mt-1 flex items-center gap-1">
                                    Tải về / Mở file <ExternalLink className="w-3 h-3" />
                                  </span>
                                </a>
                              )
                            ) : (
                              <div className="w-full h-36 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 text-xs font-bold p-4 text-center">
                                Chưa có link tải file
                              </div>
                            )}

                            <div className="w-full mt-3 flex items-center justify-between text-xs px-1">
                              <span className="font-bold text-slate-600 truncate max-w-[160px]">
                                {cert.name || `Bằng cấp ${idx + 1}`}
                              </span>
                              {isImg && fileLink && (
                                <button
                                  onClick={() => setPreviewImage({ url: fileLink, name: cert.name || `Tài liệu ${idx + 1}` })}
                                  className="text-indigo-600 font-extrabold hover:underline text-[11px] shrink-0"
                                >
                                  Phóng to
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-amber-700 text-xs font-bold flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                      <span>Chưa có ảnh minh chứng bằng cấp/chứng chỉ được đính kèm trong đơn này.</span>
                    </div>
                  )}

                  {/* DIRECT APPLICANT FEEDBACK CARD */}
                  <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-3">
                    <h4 className="font-heading text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-600" />
                      Phản Hồi Trực Tiếp Ứng Viên (Qua Email)
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Nhập nội dung để gửi mail trực tiếp đến hòm thư: <strong className="text-indigo-600 font-mono">{selectedTeacherDetail.email}</strong>
                    </p>

                    <div className="relative">
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Nhập ghi chú, nhận xét hoặc yêu cầu bổ sung thông tin gửi tới ứng viên..."
                        rows={3}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                      />
                    </div>

                    {/* Feedback Status Alert */}
                    {feedbackStatus && (
                      <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 ${
                        feedbackStatus.type === 'success' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {feedbackStatus.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span>{feedbackStatus.message}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleSendFeedback}
                      disabled={sendingFeedback || !feedbackText.trim()}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-heading font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-500/10 transition-all cursor-pointer"
                    >
                      {sendingFeedback ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang gửi phản hồi...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Gửi Phản Hồi Đến Email</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 shrink-0">
              <button
                onClick={() => setSelectedTeacherDetail(null)}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl font-heading font-extrabold text-xs uppercase tracking-widest transition-all"
              >
                Đóng
              </button>

              {selectedTeacherDetail.teacherStatus === 'pending' && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const tId = selectedTeacherDetail._id;
                      setSelectedTeacherDetail(null);
                      setRejectModal(tId);
                    }}
                    disabled={actionLoading === selectedTeacherDetail._id}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl font-heading font-extrabold text-xs uppercase tracking-widest transition-all shadow-sm disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Từ chối đơn
                  </button>
                  <button
                    onClick={() => {
                      const tId = selectedTeacherDetail._id;
                      setSelectedTeacherDetail(null);
                      handleVerify(tId);
                    }}
                    disabled={actionLoading === selectedTeacherDetail._id}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-heading font-extrabold text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Phê duyệt hồ sơ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage.url}
              alt={previewImage.name}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              onError={(e) => {
                if (previewImage.fallbackUrl && e.target.src !== previewImage.fallbackUrl) {
                  console.log('🔄 Lightbox image failed, trying fallback URL');
                  e.target.src = previewImage.fallbackUrl;
                }
              }}
            />
            <div className="mt-4 flex items-center gap-4 text-white">
              <span className="font-heading font-extrabold text-sm">{previewImage.name}</span>
              <a
                href={previewImage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:underline"
              >
                Mở tab mới <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-[#274dad]/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-[#85e4fb]/20 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-rose-50 rounded-xl">
                <XCircle className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="font-heading text-xl font-extrabold text-[#274dad]">Từ chối giáo viên</h3>
            </div>
            <div className="mb-8 font-body">
              <label className="font-heading block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">
                Lý do từ chối (tùy chọn)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="VD: Thông tin không đầy đủ, cần bổ sung giấy tờ xác minh chuyên môn..."
                className="w-full bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-bold placeholder:text-slate-300 focus:outline-none focus:border-[#2099e9]/50 transition-all resize-none shadow-inner"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="font-heading flex-1 px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-extrabold text-xs uppercase tracking-widest transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectModal}
                className="font-heading flex-1 px-6 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50"
              >
                {actionLoading === rejectModal ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getInitialUsersCache = () => {
  try {
    const cached = localStorage.getItem('physigame_admin_users_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out legacy mock users
        const realOnly = parsed.filter(u => typeof u.id === 'string' && u.id.length > 10 && !u.name?.startsWith('Nguyễn Văn'));
        if (realOnly.length > 0) return realOnly;
        localStorage.removeItem('physigame_admin_users_cache');
      }
    }
  } catch (e) {}
  return [];
};

// ==================== Main AdminUsers Component ====================
const AdminUsers = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    } else if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);
  const [users, setUsers] = useState(() => getInitialUsersCache());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    if (showEditModal) {
      setEditFormData({
        id: showEditModal.id,
        name: showEditModal.name || '',
        avatar: showEditModal.avatar || '',
        role: showEditModal.role || 'student',
        status: showEditModal.status || 'active',
        grade: showEditModal.grade || '6',
        email: showEditModal.email || ''
      });
    } else {
      setEditFormData(null);
    }
  }, [showEditModal]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let rawUsers = null;
      try {
        const apiRes = await api.get('/users/all');
        if (apiRes.data?.success && Array.isArray(apiRes.data.users)) {
          rawUsers = apiRes.data.users;
        }
      } catch (e) {
        console.warn('⚠️ API /users/all failed, falling back to direct Supabase SDK:', e?.message);
      }

      if (!rawUsers) {
        const { data: dbData, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        rawUsers = dbData;
      }

      if (rawUsers && Array.isArray(rawUsers)) {
        const formatted = rawUsers.map(u => {
          // Resolve display status — status field takes priority if explicitly 'inactive'
          let resolvedStatus = u.status || 'active';
          if (u.role === 'teacher') {
            // Explicit inactive check first (both fields)
            if (u.status === 'inactive' || u.teacher_status === 'inactive') resolvedStatus = 'inactive';
            else if (u.teacher_status === 'pending') resolvedStatus = 'pending';
            else if (u.teacher_status === 'rejected') resolvedStatus = 'rejected';
            else if (u.teacher_status === 'verified') resolvedStatus = 'active';
          }
          const userAvatar = u.avatar || u.avatar_url || u.profile?.avatar || u.teacher_profile?.avatar || null;
          return {
            id: u.id,
            name: u.display_name || u.username || 'Người dùng',
            email: u.email || 'Chưa cập nhật email',
            avatar: userAvatar,
            role: u.role || 'student',
            teacher_status: u.teacher_status || null,
            grade: u.profile?.grade || u.grade || (u.programs && u.programs[0]?.currentClass) || '?',
            status: resolvedStatus,
            joinDate: u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '—',
            lastActive: u.updated_at ? new Date(u.updated_at).toLocaleDateString('vi-VN') : '—',
            lessonsCompleted: u.profile?.lessonsCompleted || (u.programs && u.programs[0]?.progress?.completedLessons?.length) || 0,
            exercisesCompleted: u.profile?.exercisesCompleted || 0,
            originalData: u
          };
        });

        setUsers(formatted);
        try {
          localStorage.setItem('physigame_admin_users_cache', JSON.stringify(formatted));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error fetching real users from backend/Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setActionLoading(userId);
    try {
      // Use backend API (service role) instead of Supabase anon key (blocked by RLS)
      const response = await api.delete(`/users/delete/${userId}`);
      if (response.data.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
      }
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      // Fallback: remove from local UI even if API fails
      setUsers(prev => prev.filter(u => u.id !== userId));
      setShowDeleteConfirm(null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateUser = async (userData) => {
    // Determine teacher_status based on updated role & status
    let resolvedTeacherStatus = userData.teacher_status;
    if (userData.role === 'student') {
      resolvedTeacherStatus = null;
    } else if (userData.role === 'teacher') {
      if (userData.status === 'active') resolvedTeacherStatus = 'verified';
      else if (userData.status === 'pending') resolvedTeacherStatus = 'pending';
      else if (userData.status === 'rejected') resolvedTeacherStatus = 'rejected';
      else if (userData.status === 'inactive') resolvedTeacherStatus = 'inactive';
    }

    const updatedUserObj = {
      ...userData,
      name: userData.name,
      avatar: userData.avatar || null,
      role: userData.role,
      status: userData.status,
      grade: userData.grade || '?',
      teacher_status: resolvedTeacherStatus
    };

    // 1. OPTIMISTIC UPDATE: Update Admin users list & save to localStorage cache
    setUsers(prev => {
      const nextUsers = prev.map(u => (u.id === userData.id || (u.email && u.email === userData.email)) ? { ...u, ...updatedUserObj } : u);
      try {
        localStorage.setItem('physigame_admin_users_cache', JSON.stringify(nextUsers));
      } catch (e) {}
      return nextUsers;
    });

    setShowEditModal(null);
    setActionLoading(null);

    // 2. BroadcastChannel: Send instant message to all open tabs / teacher sessions (1ms latency)
    try {
      const bc = new BroadcastChannel('physigame_admin_actions');
      bc.postMessage({
        type: 'USER_STATUS_UPDATED',
        id: userData.id,
        email: userData.email,
        name: userData.name,
        username: userData.username,
        status: userData.status,
        role: userData.role
      });
      bc.close();
    } catch (e) {}

    // 3. If editing active user session in localStorage, update it directly or kick out if inactive
    const currentUserStr = localStorage.getItem('user');
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        const isMatch = (currentUser.id && String(currentUser.id) === String(userData.id)) ||
                        (currentUser.email && userData.email && currentUser.email.toLowerCase() === userData.email.toLowerCase());
        if (isMatch) {
          if (userData.status === 'inactive') {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          } else {
            const updatedCurrentUser = {
              ...currentUser,
              displayName: userData.name,
              display_name: userData.name,
              avatar_url: userData.avatar,
              avatar: userData.avatar,
              role: userData.role,
              status: userData.status,
              grade: userData.grade,
              teacherStatus: resolvedTeacherStatus,
              teacher_status: resolvedTeacherStatus
            };
            localStorage.setItem('user', JSON.stringify(updatedCurrentUser));
          }
          window.dispatchEvent(new Event('storage'));
        }
      } catch (e) {}
    }

    // 4. Backend API Update (service role — bypasses RLS)
    try {
      let resolvedTeacherStatus2 = resolvedTeacherStatus;
      const response = await api.post('/users/update-status', {
        id: userData.id,
        email: userData.email,
        status: userData.status,
        teacher_status: resolvedTeacherStatus2,
        name: userData.name,
        role: userData.role
      });
      if (response.data.success) {
        console.log('✅ [AdminUsers] Backend update succeeded:', response.data.user);
      } else {
        console.warn('⚠️ [AdminUsers] Backend update returned failure:', response.data);
      }
    } catch (err) {
      console.error('❌ [AdminUsers] Backend API update failed:', err.message);
      // Fallback: try direct Supabase (may fail due to RLS)
      try {
        const updatePayload = {
          display_name: userData.name,
          avatar: userData.avatar || null,
          role: userData.role,
          status: userData.status,
          teacher_status: resolvedTeacherStatus
        };
        if (userData.email) {
          const { error } = await supabase.from('users').update(updatePayload).eq('email', userData.email);
          if (error) console.warn('Supabase fallback also failed:', error.message);
        }
      } catch (fbErr) {
        console.warn('Both update methods failed');
      }
    }
  };

  const handleBatchStatusUpdate = async (status) => {
    if (selectedUsers.length === 0) return;
    setLoading(true);
    try {
      const selectedList = users.filter(u => selectedUsers.includes(u.id));
      const updatedList = users.map(u => selectedUsers.includes(u.id) ? { ...u, status } : u);
      setUsers(updatedList);
      try {
        localStorage.setItem('physigame_admin_users_cache', JSON.stringify(updatedList));
      } catch (e) {}

      // Broadcast each updated user status
      selectedList.forEach(u => {
        try {
          const bc = new BroadcastChannel('physigame_admin_actions');
          bc.postMessage({
            type: 'USER_STATUS_UPDATED',
            id: u.id,
            email: u.email,
            name: u.name,
            status: status
          });
          bc.close();
        } catch (e) {}
      });

      // Use batch API endpoint (service role)
      try {
        const response = await api.post('/users/batch-update-status', {
          userIds: selectedUsers,
          status
        });
        if (response.data.success) {
          console.log('✅ [AdminUsers] Batch update succeeded:', response.data.message);
        } else {
          console.warn('⚠️ Batch update issue:', response.data);
        }
      } catch (apiErr) {
        console.error('❌ Batch API failed, trying Supabase fallback:', apiErr.message);
        // Fallback with Supabase (may be blocked by RLS)
        const teacherEmails = selectedList.filter(u => u.role === 'teacher').map(u => u.email).filter(Boolean);
        const studentEmails = selectedList.filter(u => u.role !== 'teacher').map(u => u.email).filter(Boolean);
        if (teacherEmails.length > 0) {
          await supabase.from('users').update({ status, teacher_status: status === 'active' ? 'verified' : 'inactive' }).in('email', teacherEmails);
        }
        if (studentEmails.length > 0) {
          await supabase.from('users').update({ status }).in('email', studentEmails);
        }
      }

      setSelectedUsers([]);
    } catch (err) {
      console.error('Error during batch status update:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedUsers.length} người dùng đã chọn? Hành động này không thể hoàn tác.`)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .in('id', selectedUsers);

      if (error) throw error;

      await fetchUsers();
      setSelectedUsers([]);
    } catch (err) {
      console.error('Error during batch delete:', err);
      alert('Không thể xóa các tài khoản được chọn.');
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'all' || user.role === filterRole;
    const matchStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher' && u.status === 'active').length,
    active: users.filter(u => u.status === 'active').length
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-[#274dad]">Quản lý người dùng</h1>
          <p className="font-body text-slate-500 font-bold text-sm mt-1">Quản lý học sinh và giáo viên trên hệ thống</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[#e4f2f0] rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('users')}
          className={`font-heading flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-extrabold transition-all ${
            activeTab === 'users' ? 'bg-white text-[#2099e9] shadow-sm' : 'text-slate-400 hover:text-[#2099e9]'
          }`}
        >
          <Users className="w-4 h-4" />
          Người dùng
        </button>
        <button
          onClick={() => setActiveTab('pending-teachers')}
          className={`font-heading flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-extrabold transition-all ${
            activeTab === 'pending-teachers' ? 'bg-white text-[#2099e9] shadow-sm' : 'text-slate-400 hover:text-[#2099e9]'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Duyệt giáo viên
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'pending-teachers' ? (
        <PendingTeachersTab selectedTeacherIdFromState={location.state?.selectedTeacherId} />
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#85e4fb]/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Users className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <p className="font-heading text-2xl font-extrabold text-[#274dad]">{stats.total}</p>
                  <p className="font-heading text-xs font-extrabold text-slate-400">Tổng người dùng</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#85e4fb]/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-50 rounded-xl">
                  <Users className="w-6 h-6 text-violet-500" />
                </div>
                <div>
                  <p className="font-heading text-2xl font-extrabold text-[#274dad]">{stats.students}</p>
                  <p className="font-heading text-xs font-extrabold text-slate-400">Học sinh</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#85e4fb]/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-heading text-2xl font-extrabold text-[#274dad]">{stats.teachers}</p>
                  <p className="font-heading text-xs font-extrabold text-slate-400">Giáo viên</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#85e4fb]/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <UserCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="font-heading text-2xl font-extrabold text-[#274dad]">{stats.active}</p>
                  <p className="font-heading text-xs font-extrabold text-slate-400">Đang hoạt động</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters with CustomSelect */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#85e4fb]/20">
            <div className="flex flex-col sm:flex-row gap-4 font-body items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#274dad] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2099e9] font-bold transition-all"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <CustomSelect
                  value={filterRole}
                  onChange={setFilterRole}
                  options={roleFilterOptions}
                  className="w-full sm:w-48"
                />
                <CustomSelect
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={statusFilterOptions}
                  className="w-full sm:w-52"
                />
                <button 
                  onClick={fetchUsers}
                  className="p-2.5 bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-xl text-slate-400 hover:text-[#2099e9] hover:bg-white transition-all shrink-0"
                  title="Làm mới"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#e4f2f0]">
                <span className="text-sm font-bold text-slate-400 font-body">Đã chọn {selectedUsers.length} người dùng</span>
                <button 
                  onClick={() => handleBatchStatusUpdate('active')}
                  className="font-heading px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-extrabold hover:bg-emerald-100 transition-colors"
                >
                  KÍCH HOẠT
                </button>
                <button 
                  onClick={() => handleBatchStatusUpdate('inactive')}
                  className="font-heading px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-extrabold hover:bg-blue-100 transition-colors"
                >
                  VÔ HIỆU HÓA
                </button>
                <button 
                  onClick={handleBatchDelete}
                  className="font-heading px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-extrabold hover:bg-rose-100 transition-colors"
                >
                  XÓA
                </button>
              </div>
            )}
          </div>

          {/* Users table */}
          <>
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#85e4fb]/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/60 border-b border-[#e4f2f0]">
                        <th className="w-[4%] px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-slate-300 text-[#2099e9] focus:ring-[#2099e9]/20 transition-all cursor-pointer"
                          />
                        </th>
                        <th className="font-heading w-[24%] px-4 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Người dùng</th>
                        <th className="font-heading w-[17%] px-4 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Vai trò</th>
                        <th className="font-heading w-[17%] px-4 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                        <th className="font-heading w-[16%] px-4 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Tiến độ</th>
                        <th className="font-heading w-[16%] px-4 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider whitespace-nowrap">Hoạt động cuối</th>
                        <th className="font-heading w-[6%] px-4 py-4 text-right text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4f2f0]">
                      {paginatedUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                           <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleSelectUser(user.id)}
                              className="w-4 h-4 rounded border-slate-300 text-[#2099e9] focus:ring-[#2099e9]/20 transition-all cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div 
                              onClick={() => setShowUserDetail(user)}
                              className="flex items-center gap-3.5 cursor-pointer group/name"
                            >
                              <div className="w-11 h-11 rounded-full bg-white border border-slate-200/90 shadow-sm flex items-center justify-center overflow-hidden shrink-0 group-hover/name:border-[#2099e9] group-hover/name:shadow-md transition-all relative">
                                {user.avatar && user.avatar !== 'null' && user.avatar !== 'undefined' ? (
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className={`${user.avatar && user.avatar !== 'null' && user.avatar !== 'undefined' ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                                  {user.role === 'teacher' ? (
                                    <GraduationCap className="w-5 h-5 text-slate-900" />
                                  ) : (
                                    <span className="font-heading text-slate-900 font-extrabold text-base">
                                      {user.name ? user.name[0].toUpperCase() : 'U'}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="font-heading text-sm font-extrabold text-[#274dad] group-hover/name:text-[#2099e9] transition-colors">
                                  {user.name}
                                </p>
                                <p className="font-body text-xs font-medium text-slate-400">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`font-heading inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              user.role === 'teacher'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                : user.role === 'admin'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-sky-50 text-sky-700 border border-sky-100'
                            }`}>
                              {user.role === 'teacher' ? (
                                <>
                                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                                  {user.status === 'rejected'
                                    ? 'Giáo viên (Từ chối)'
                                    : user.status === 'pending'
                                    ? 'Giáo viên (Chờ duyệt)'
                                    : 'Giáo viên'}
                                </>
                              ) : user.role === 'admin' ? (
                                <>
                                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                                  Quản trị viên
                                </>
                              ) : (
                                <>
                                  <Users className="w-3.5 h-3.5 text-sky-600" />
                                  Lớp {user.grade || '?'}
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`font-heading inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                              user.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : user.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : user.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {user.status === 'active' ? (
                                <>
                                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                  Hoạt động
                                </>
                              ) : user.status === 'pending' ? (
                                <>
                                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                                  Chờ duyệt
                                </>
                              ) : user.status === 'rejected' ? (
                                <>
                                  <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                                  Từ chối
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                                  Không hoạt động
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {user.role === 'student' ? (
                              <div className="font-body text-xs font-bold text-slate-600">
                                <span>{user.lessonsCompleted || 0} bài học</span>
                                <span className="mx-1 text-slate-300">•</span>
                                <span>{user.exercisesCompleted || 0} bài tập</span>
                              </div>
                            ) : (
                              <span className="font-body text-xs text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="font-body text-xs font-bold text-slate-400">{user.lastActive || '—'}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setShowUserDetail(user)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-[#2099e9] hover:bg-blue-50 transition-all"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowEditModal(user)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                title="Chỉnh sửa"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(user)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
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
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-8 py-6 border-t border-[#e4f2f0] bg-slate-50/30">
                    <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} / {filteredUsers.length} người dùng
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2.5 text-slate-400 hover:text-[#2099e9] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`font-heading w-10 h-10 rounded-xl text-xs font-extrabold transition-all ${
                              page === currentPage
                                ? 'bg-[#2099e9] text-white shadow-lg shadow-blue-500/20'
                                : 'text-slate-400 hover:text-[#274dad] hover:bg-[#e4f2f0]'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2.5 text-slate-400 hover:text-[#2099e9] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          </>
        )}

      {/* Horizontal User Detail Modal */}
      {showUserDetail && (
        <div className="fixed inset-0 bg-[#274dad]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl border border-[#85e4fb]/20 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 px-8 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#2099e9]/10 rounded-xl text-[#2099e9]">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-extrabold text-[#274dad]">Chi tiết người dùng</h3>
                  <p className="font-body text-xs font-bold text-slate-400">Thông tin tài khoản và tiến độ học tập</p>
                </div>
              </div>
              <button
                onClick={() => setShowUserDetail(null)}
                className="p-2.5 text-slate-400 hover:text-[#2099e9] hover:bg-white rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Horizontal Two-Column Layout */}
            <div className="p-8 flex flex-col md:flex-row gap-8">
              {/* Left Column: Avatar & Profile Card */}
              <div className="w-full md:w-64 bg-slate-50/70 border border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center shrink-0">
                <div className="w-24 h-24 rounded-full bg-white border-2 border-slate-200 shadow-md flex items-center justify-center overflow-hidden mb-4 shrink-0 relative">
                  {showUserDetail.avatar && showUserDetail.avatar !== 'null' && showUserDetail.avatar !== 'undefined' ? (
                    <img
                      src={showUserDetail.avatar}
                      alt={showUserDetail.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`${showUserDetail.avatar && showUserDetail.avatar !== 'null' && showUserDetail.avatar !== 'undefined' ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                    {showUserDetail.role === 'teacher' ? (
                      <GraduationCap className="w-10 h-10 text-slate-900" />
                    ) : (
                      <span className="font-heading text-slate-900 font-black text-3xl">
                        {showUserDetail.name ? showUserDetail.name[0].toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="font-heading text-lg font-extrabold text-[#274dad] mb-1 break-words w-full">
                  {showUserDetail.name}
                </h4>
                <p className="font-body text-xs font-bold text-slate-400 mb-4 break-all w-full">
                  {showUserDetail.email}
                </p>

                <div className="flex flex-col gap-2 w-full items-center">
                  <span className={`font-heading inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                    showUserDetail.role === 'teacher'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : showUserDetail.role === 'admin'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-sky-50 text-sky-700 border border-sky-100'
                  }`}>
                    {showUserDetail.role === 'teacher' ? (
                      <>
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        Giáo viên
                      </>
                    ) : showUserDetail.role === 'admin' ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        Quản trị viên
                      </>
                    ) : (
                      <>
                        <Users className="w-3.5 h-3.5 text-sky-600" />
                        Học sinh Lớp {showUserDetail.grade || '?'}
                      </>
                    )}
                  </span>

                  <span className={`font-heading inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                    showUserDetail.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : showUserDetail.status === 'pending'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : showUserDetail.status === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border border-rose-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {showUserDetail.status === 'active' ? (
                      <>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Hoạt động
                      </>
                    ) : showUserDetail.status === 'pending' ? (
                      <>
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        Chờ duyệt
                      </>
                    ) : showUserDetail.status === 'rejected' ? (
                      <>
                        <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                        Từ chối
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                        Không hoạt động
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Right Column: Detailed Grid Cards */}
              <div className="flex-1 space-y-4 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#e4f2f0]/30 rounded-2xl p-4 border border-[#e4f2f0]">
                    <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Vai trò hệ thống</p>
                    <p className="font-heading font-extrabold text-[#2099e9] text-sm uppercase">
                      {showUserDetail.role === 'teacher' ? (
                        showUserDetail.status === 'rejected'
                          ? 'Giáo viên (Từ chối)'
                          : showUserDetail.status === 'pending'
                          ? 'Giáo viên (Chờ duyệt)'
                          : 'Giáo viên'
                      ) : showUserDetail.role === 'admin' ? 'Quản trị viên' : `Học sinh (Lớp ${showUserDetail.grade || '?'})`}
                    </p>
                  </div>

                  <div className="bg-[#e4f2f0]/30 rounded-2xl p-4 border border-[#e4f2f0]">
                    <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Trạng thái tài khoản</p>
                    <p className={`font-heading font-extrabold text-sm uppercase ${
                      showUserDetail.status === 'active' ? 'text-emerald-500' :
                      showUserDetail.status === 'pending' ? 'text-amber-500' :
                      showUserDetail.status === 'rejected' ? 'text-rose-500' :
                      'text-slate-400'
                    }`}>
                      {showUserDetail.status === 'active' ? 'Hoạt động' :
                       showUserDetail.status === 'pending' ? 'Chờ duyệt' :
                       showUserDetail.status === 'rejected' ? 'Từ chối' :
                       'Không hoạt động'}
                    </p>
                  </div>

                  <div className="bg-[#e4f2f0]/30 rounded-2xl p-4 border border-[#e4f2f0]">
                    <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Ngày tham gia</p>
                    <p className="font-heading font-extrabold text-[#274dad] text-sm">{showUserDetail.joinDate || '—'}</p>
                  </div>

                  <div className="bg-[#e4f2f0]/30 rounded-2xl p-4 border border-[#e4f2f0]">
                    <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Hoạt động cuối</p>
                    <p className="font-heading font-extrabold text-[#274dad] text-sm">{showUserDetail.lastActive || '—'}</p>
                  </div>
                </div>

                {showUserDetail.role === 'student' && (
                  <div className="bg-[#e4f2f0]/30 rounded-2xl p-5 border border-[#e4f2f0]">
                    <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Tiến độ học tập</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
                        <p className="font-heading text-2xl font-extrabold text-[#274dad]">{showUserDetail.lessonsCompleted || 0}</p>
                        <p className="font-body text-xs font-bold text-slate-400">Bài học hoàn thành</p>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
                        <p className="font-heading text-2xl font-extrabold text-[#274dad]">{showUserDetail.exercisesCompleted || 0}</p>
                        <p className="font-body text-xs font-bold text-slate-400">Bài tập hoàn thành</p>
                      </div>
                    </div>
                  </div>
                )}

                {showUserDetail.role === 'teacher' && showUserDetail.teacherProfile && (
                  <div className="bg-[#e4f2f0]/30 rounded-2xl p-5 border border-[#e4f2f0]">
                    <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Hồ sơ giáo viên</p>
                    <div className="grid grid-cols-2 gap-4 font-body text-xs font-bold text-slate-600">
                      <p>Trường: <span className="text-[#274dad]">{showUserDetail.teacherProfile?.school || 'Chưa cập nhật'}</span></p>
                      <p>Môn dạy: <span className="text-[#274dad]">{showUserDetail.teacherProfile?.subject || 'Vật lý'}</span></p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 px-8 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setShowUserDetail(null)}
                className="font-heading px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-extrabold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  const userToEdit = showUserDetail;
                  setShowUserDetail(null);
                  setShowEditModal(userToEdit);
                }}
                className="font-heading px-6 py-3.5 bg-gradient-to-r from-[#2099e9] to-[#85e4fb] text-white rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-md shadow-blue-500/20 hover:brightness-110 transition-all cursor-pointer flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh sửa thông tin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Edit User Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-[#274dad]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl border border-[#85e4fb]/20 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 px-8 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-extrabold text-[#274dad]">Chỉnh sửa thành viên</h3>
                  <p className="font-body text-xs font-bold text-slate-400">Cập nhật thông tin tài khoản và thông số hệ thống</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(null)}
                className="p-2.5 text-slate-400 hover:text-[#2099e9] hover:bg-white rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Horizontal Layout */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateUser(editFormData);
              }}
            >
              <div className="p-8 flex flex-col md:flex-row gap-8">
                {/* Left Column: Live Avatar & Profile Card */}
                <div className="w-full md:w-64 bg-slate-50/70 border border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center shrink-0">
                  <div className="w-24 h-24 rounded-full bg-white border-2 border-slate-200 shadow-md flex items-center justify-center overflow-hidden mb-4 shrink-0 transition-all">
                    {editFormData.avatar ? (
                      <img src={editFormData.avatar} alt={editFormData.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : editFormData.role === 'teacher' ? (
                      <GraduationCap className="w-10 h-10 text-slate-900" />
                    ) : (
                      <span className="font-heading text-slate-900 font-black text-3xl">
                        {editFormData.name ? editFormData.name[0].toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>

                  <h4 className="font-heading text-base font-extrabold text-[#274dad] mb-1 break-words w-full">
                    {editFormData.name || 'Chưa nhập tên'}
                  </h4>
                  <p className="font-body text-xs font-bold text-slate-400 mb-4 break-all w-full">
                    {editFormData.email}
                  </p>

                  <div className="flex flex-col gap-2 w-full items-center">
                    <span className={`font-heading inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      editFormData.role === 'teacher'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        : editFormData.role === 'admin'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-sky-50 text-sky-700 border border-sky-100'
                    }`}>
                      {editFormData.role === 'teacher' ? (
                        <>
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                          Giáo viên
                        </>
                      ) : editFormData.role === 'admin' ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                          Quản trị viên
                        </>
                      ) : (
                        <>
                          <Users className="w-3.5 h-3.5 text-sky-600" />
                          Học sinh Lớp {editFormData.grade || '?'}
                        </>
                      )}
                    </span>

                    <span className={`font-heading inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                      editFormData.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : editFormData.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : editFormData.status === 'rejected'
                        ? 'bg-rose-50 text-rose-700 border border-rose-100'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {editFormData.status === 'active' ? (
                        <>
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                          Hoạt động
                        </>
                      ) : editFormData.status === 'pending' ? (
                        <>
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                          Chờ duyệt
                        </>
                      ) : editFormData.status === 'rejected' ? (
                        <>
                          <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                          Từ chối
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                          Khóa tài khoản
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Right Column: Form Fields */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Họ và tên</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="font-body w-full bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-2xl px-5 py-3.5 text-[#274dad] font-bold focus:outline-none focus:bg-white focus:border-[#2099e9] transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Email người dùng</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="user@example.com"
                      className="font-body w-full bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-2xl px-5 py-3.5 text-[#274dad] font-bold focus:outline-none focus:bg-white focus:border-[#2099e9] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Link ảnh đại diện (URL)</label>
                    <input
                      type="text"
                      value={editFormData.avatar}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, avatar: e.target.value }))}
                      placeholder="https://example.com/avatar.jpg"
                      className="font-body w-full bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-2xl px-5 py-3.5 text-sm text-[#274dad] font-bold focus:outline-none focus:bg-white focus:border-[#2099e9] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Vai trò</label>
                      <CustomSelect
                        value={editFormData.role}
                        onChange={(val) => setEditFormData(prev => {
                          let newStatus = prev.status;
                          if (val !== 'teacher' && prev.status === 'rejected') {
                            newStatus = 'active';
                          }
                          return { ...prev, role: val, status: newStatus };
                        })}
                        options={[
                          { value: 'student', label: 'Học sinh' },
                          { value: 'teacher', label: 'Giáo viên' },
                          { value: 'admin', label: 'Quản trị viên' }
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Trạng thái</label>
                      <CustomSelect
                        value={editFormData.status}
                        onChange={(val) => setEditFormData(prev => ({ ...prev, status: val }))}
                        options={
                          editFormData.role === 'teacher'
                            ? [
                                { value: 'active', label: 'Hoạt động' },
                                { value: 'pending', label: 'Chờ duyệt' },
                                { value: 'rejected', label: 'Từ chối' },
                                { value: 'inactive', label: 'Khóa tài khoản' }
                              ]
                            : [
                                { value: 'active', label: 'Hoạt động' },
                                { value: 'pending', label: 'Chờ duyệt' },
                                { value: 'inactive', label: 'Khóa tài khoản' }
                              ]
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Khối lớp học</label>
                    <CustomSelect
                      value={String(editFormData.grade || '?')}
                      onChange={(val) => setEditFormData(prev => ({ ...prev, grade: val }))}
                      options={[
                        { value: '6', label: 'Lớp 6' },
                        { value: '7', label: 'Lớp 7' },
                        { value: '8', label: 'Lớp 8' },
                        { value: '9', label: 'Lớp 9' },
                        { value: '10', label: 'Lớp 10' },
                        { value: '11', label: 'Lớp 11' },
                        { value: '12', label: 'Lớp 12' },
                        { value: '?', label: 'Khác' }
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 px-8 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="font-heading px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-extrabold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === showEditModal.id}
                  className="font-heading px-8 py-3.5 bg-gradient-to-r from-[#2099e9] to-[#85e4fb] text-white rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-md shadow-blue-500/20 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === showEditModal.id ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
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
                <AlertCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-2xl font-extrabold text-[#274dad]">Xác nhận xóa?</h3>
                <p className="font-body text-slate-400 font-bold">Bạn có chắc chắn muốn xóa người dùng <span className="text-[#274dad]">{showDeleteConfirm.name}</span>? Hành động này không thể hoàn tác.</p>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="font-heading flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-extrabold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={() => handleDeleteUser(showDeleteConfirm.id)}
                  disabled={actionLoading === showDeleteConfirm.id}
                  className="font-heading flex-1 py-4 bg-rose-500 text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all disabled:opacity-50"
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

export default AdminUsers;



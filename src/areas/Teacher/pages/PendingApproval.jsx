import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTeacherAuth } from '../contexts/TeacherAuthContext';
import { supabase } from '../../../config/supabase';
import api from '../../../config/api';
import {
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Building,
  ArrowLeft,
  RefreshCw,
  LogOut,
  ShieldAlert,
  Loader2,
  Bell,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const PendingApproval = () => {
  const navigate = useNavigate();
  const { teacher, isAuthenticated, isVerified, isPending, isRejected, logout, refreshTeacher, loading } = useTeacherAuth();
  const [checking, setChecking] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Filter only feedback from rejection popup & admin rejection reasons for teacher registration
  const filterApplicationFeedback = useCallback((rawList = []) => {
    const violationKeywords = [
      'vi phạm nội dung',
      'cảnh báo vi phạm',
      'nhận cảnh báo từ quản trị viên',
      'bài viết của bạn',
      'bài đăng của bạn',
      'bài test',
      'khóa tài khoản của bạn',
      'báo cáo'
    ];

    const applicationKeywords = [
      'từ chối',
      'lý do từ chối',
      'hồ sơ',
      'đăng ký',
      'giảng viên',
      'phản hồi',
      'xem xét',
      'xác minh',
      'xác duyệt',
      'phê duyệt',
      'chưa được',
      'minh chứng'
    ];

    const filtered = (rawList || []).filter(item => {
      const titleLower = (item.title || '').toLowerCase();
      const contentLower = (item.content || '').toLowerCase();
      const combined = `${titleLower} ${contentLower}`;

      // 1. Must NOT be an article / post content violation or lesson report
      const isViolation = violationKeywords.some(kw => combined.includes(kw));
      if (isViolation) return false;

      // 2. Must be related to teacher registration or admin application review
      const isAppFeedback = applicationKeywords.some(kw => combined.includes(kw));
      return isAppFeedback;
    });

    // 3. Ensure the admin rejection reason from popup is present if teacherProfile.rejectionReason exists
    const currentRejectionReason = teacher?.teacherProfile?.rejectionReason || teacher?.teacher_profile?.rejectionReason;
    if (currentRejectionReason && typeof currentRejectionReason === 'string' && currentRejectionReason.trim()) {
      const trimmedReason = currentRejectionReason.trim();
      const alreadyIncluded = filtered.some(n =>
        (n.content && n.content.includes(trimmedReason)) ||
        (n.title && n.title.includes(trimmedReason))
      );
      if (!alreadyIncluded) {
        filtered.unshift({
          id: 'admin-rejection-popup-reason',
          title: '❌ Lý do từ chối từ Ban Quản Trị',
          content: `Lý do từ chối: "${trimmedReason}". Thầy/cô vui lòng kiểm tra và chỉnh sửa lại thông tin minh chứng.`,
          created_at: teacher?.teacherProfile?.rejectedAt || teacher?.updated_at || new Date().toISOString(),
          isPopupReason: true
        });
      }
    }

    return filtered;
  }, [teacher]);

  // Fetch notifications sent to this teacher
  const fetchNotifications = useCallback(async () => {
    if (!teacher?.id) return;
    try {
      const res = await api.get(`/classes/teacher/${teacher.id}/notifications`);
      if (res.data?.success && Array.isArray(res.data.notifications)) {
        setNotifications(filterApplicationFeedback(res.data.notifications));
        return;
      }
    } catch (e) {}

    // Direct Supabase fallback
    try {
      const { data } = await supabase
        .from('teacher_notifications')
        .select('*')
        .eq('teacher_id', teacher.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) {
        setNotifications(filterApplicationFeedback(data));
      }
    } catch (err) {}
  }, [teacher?.id, filterApplicationFeedback]);

  useEffect(() => {
    if (isVerified) {
      navigate('/teacher/dashboard');
      return;
    }

    if (!isAuthenticated && !loading) {
      navigate('/login');
      return;
    }

    // Immediate initial sync
    refreshTeacher();
    fetchNotifications();

    // Fast polling fallback every 6 seconds while in pending state
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshTeacher();
        fetchNotifications();
      }
    }, 6000);

    const handleFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshTeacher();
        fetchNotifications();
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, isVerified, loading, navigate, refreshTeacher, fetchNotifications]);

  // Supabase Realtime Subscriptions for zero-delay approval
  useEffect(() => {
    if (!teacher?.id) return;

    const userChannel = supabase
      .channel(`pending-teacher-user-${teacher.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${teacher.id}`
        },
        async (payload) => {
          const newStatus = payload.new?.teacher_status || payload.new?.teacherStatus;
          if (newStatus === 'verified') {
            await refreshTeacher();
            navigate('/teacher/dashboard');
          } else if (newStatus === 'rejected') {
            await refreshTeacher();
            fetchNotifications();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeConnected(true);
        }
      });

    const notifChannel = supabase
      .channel(`pending-teacher-notif-${teacher.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'teacher_notifications',
          filter: `teacher_id=eq.${teacher.id}`
        },
        () => {
          fetchNotifications();
          refreshTeacher();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [teacher?.id, refreshTeacher, navigate, fetchNotifications]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRefresh = async () => {
    setChecking(true);
    try {
      await Promise.all([refreshTeacher(), fetchNotifications()]);
      const now = new Date();
      setLastCheckedTime(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Refresh check failed:', err);
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#4f46e5] animate-spin" />
      </div>
    );
  }

  if (!teacher) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8 font-body relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4f46e5]/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute inset-0 graph-grid pointer-events-none z-0 opacity-10"></div>

      <div className="w-full max-w-xl relative z-10">
        {/* Header Area */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Link to="/" className="flex items-center group cursor-pointer transition-transform duration-500 hover:scale-105">
              <span className="font-premium-serif text-4xl md:text-5xl font-bold text-slate-900 italic tracking-tight">Eureka</span>
            </Link>
          </div>

          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
            {isPending && 'Đang Chờ Xác Minh'}
            {isRejected && 'Đăng Ký Bị Từ Chối'}
            {isVerified && 'Đã Được Xác Minh'}
          </h1>

          <p className="font-body text-slate-500 font-medium text-sm md:text-base max-w-md mx-auto leading-relaxed">
            {isPending && 'Yêu cầu của bạn đang được chờ xác nhận. Admin đang xem xét hồ sơ giảng dạy của bạn.'}
            {isRejected && 'Rất tiếc, hồ sơ giảng viên của bạn chưa đáp ứng được các tiêu chuẩn của hệ thống.'}
            {isVerified && 'Chúc mừng! Tài khoản của bạn đã sẵn sàng để bắt đầu giảng dạy.'}
          </p>
        </div>

        {/* Central Card */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-[#0f172a]/5 border border-slate-100">

          {/* Realtime Live Indicator & Refresh Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
            <div className="flex items-center gap-2 px-1">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${realtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-[11px] font-black text-slate-600">
                {realtimeConnected ? 'Đang kết nối trực tiếp với máy chủ duyệt hồ sơ' : 'Đang đồng bộ trạng thái...'}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={checking}
              className="px-3.5 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
              title="Kiểm tra trạng thái ngay lập tức"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{checking ? 'Đang kiểm tra...' : 'Kiểm tra ngay'}</span>
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 group hover:bg-slate-50 hover:border-slate-200 transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-heading block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Email Giảng Viên</span>
                  <p className="font-body font-bold text-slate-800 truncate text-sm">{teacher.email}</p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 group hover:bg-slate-50 hover:border-slate-200 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-500">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-heading block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Trạng Thái Hiện Tại</span>
                  <p className={`font-heading font-extrabold text-sm ${isPending ? 'text-[#4f46e5]' : isRejected ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                    {isPending ? 'Đang chờ phê duyệt' : isRejected ? 'Bị từ chối' : 'Đã xác minh'}
                  </p>
                </div>
              </div>
            </div>

            {teacher.teacherProfile?.school && (
              <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 group hover:bg-slate-50 hover:border-slate-200 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-500">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-heading block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Đơn Vị Công Tác</span>
                    <p className="font-body font-bold text-slate-800 text-sm truncate">{teacher.teacherProfile.school}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications from Admin / System */}
          {notifications.length > 0 && (
            <div className="space-y-3 mb-6 bg-slate-50/60 border border-slate-100 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <h4 className="font-heading text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Thông báo & Phản hồi ({notifications.length})</span>
                </h4>
                {lastCheckedTime && (
                  <span className="text-[10px] text-slate-400 font-bold">Cập nhật: {lastCheckedTime}</span>
                )}
              </div>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {notifications.map(notif => {
                  const isRejectionItem = notif.isPopupReason || (notif.title && notif.title.toLowerCase().includes('từ chối'));
                  return (
                    <div
                      key={notif.id}
                      className={`p-3.5 bg-white border rounded-xl text-left space-y-1.5 shadow-xs transition-colors ${
                        isRejectionItem ? 'border-rose-200 bg-rose-50/20' : 'border-slate-100 hover:border-indigo-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-black text-xs flex items-center gap-1.5 ${isRejectionItem ? 'text-rose-700' : 'text-slate-900'}`}>
                          {isRejectionItem ? <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                          <span>{notif.title}</span>
                        </p>
                        <span className="text-[10px] text-slate-400 font-bold shrink-0">
                          {notif.created_at ? new Date(notif.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${isRejectionItem ? 'text-rose-700 font-medium' : 'text-slate-600 font-medium'}`}>
                        {notif.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status Specific Message */}
          {isPending && (
            <div className="flex items-start gap-3 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl text-[#4f46e5] mb-8 shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-body text-xs font-semibold leading-relaxed">
                Quy trình xác minh thường diễn ra trong vòng 24–48h làm việc. Chúng tôi sẽ thông báo ngay khi có kết quả.
              </p>
            </div>
          )}

          {isRejected && (
            <div className="space-y-4 mb-8">
              <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl">
                <div className="flex items-center gap-2 mb-2 text-rose-700">
                  <AlertCircle className="w-4 h-4" />
                  <h4 className="font-heading font-extrabold text-xs uppercase tracking-wider">Lý do từ chối:</h4>
                </div>
                <p className="font-body text-xs font-medium text-rose-600 leading-relaxed">
                  {teacher.teacherProfile?.rejectionReason || 'Thông tin cung cấp không đủ điều kiện xác minh danh tính giảng viên.'}
                </p>
              </div>

              <button
                onClick={() => navigate('/teacher/apply')}
                className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-heading font-extrabold text-sm transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Chỉnh Sửa & Nộp Lại Hồ Sơ</span>
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="font-heading grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/"
              className="px-6 py-3.5 bg-gradient-to-r from-[#4f46e5] to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 active:scale-95 text-white rounded-xl font-extrabold text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại Trang Chủ
            </Link>

            <button
              onClick={handleLogout}
              className="px-6 py-3.5 bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-xl font-extrabold text-sm transition-all border border-slate-200/40 flex items-center justify-center gap-2.5 active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất hệ thống
            </button>
          </div>
        </div>

        {/* Support Footer */}
        <p className="font-body text-center text-slate-400 font-medium text-xs mt-8">
          Cần hỗ trợ kỹ thuật? Liên hệ{' '}
          <a href="mailto:support@physigame.edu.vn" className="text-[#4f46e5] hover:underline font-semibold">
            support@physigame.edu.vn
          </a>
        </p>
      </div>
    </div>
  );
};

const AlertCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="12" x2="12" y2="16" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export default PendingApproval;

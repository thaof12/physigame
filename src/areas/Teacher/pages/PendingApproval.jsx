import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTeacherAuth } from '../contexts/TeacherAuthContext';
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
  Loader2
} from 'lucide-react';

const PendingApproval = () => {
  const navigate = useNavigate();
  const { teacher, isAuthenticated, isVerified, isPending, isRejected, logout, refreshTeacher, loading } = useTeacherAuth();
  const [checking, setChecking] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState(null);

  useEffect(() => {
    // If verified, redirect to dashboard
    if (isVerified) {
      navigate('/teacher/dashboard');
    }

    // If not authenticated as teacher, redirect to login
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, isVerified, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRefresh = async () => {
    setChecking(true);
    const startTime = Date.now();
    try {
      await refreshTeacher();
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise((r) => setTimeout(r, 500 - elapsed));
      }
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

          <div className="space-y-4 mb-8">
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
                    {isPending ? 'Đang chờ phê duyệt' : isRejected ? 'Rejected' : 'Verified'}
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
            <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl mb-8">
              <div className="flex items-center gap-2 mb-2 text-rose-700">
                <AlertCircle className="w-4 h-4" />
                <h4 className="font-heading font-extrabold text-xs uppercase tracking-wider">Lý do từ chối:</h4>
              </div>
              <p className="font-body text-xs font-medium text-rose-600 leading-relaxed">
                {teacher.teacherProfile?.rejectionReason || 'Thông tin cung cấp không đủ điều kiện xác minh danh tính giảng viên.'}
              </p>
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

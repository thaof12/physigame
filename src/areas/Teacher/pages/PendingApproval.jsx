import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTeacherAuth } from '../contexts/TeacherAuthContext';
import {
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Building,
  BookOpen,
  Users,
  ArrowLeft,
  RefreshCw,
  LogOut,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import EurekaPremiumLogo from '../../../components/ui/EurekaPremiumLogo';

const PendingApproval = () => {
  const navigate = useNavigate();
  const { teacher, isAuthenticated, isVerified, isPending, isRejected, logout, refreshTeacher, loading } = useTeacherAuth();
  const [checking, setChecking] = useState(false);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefresh = async () => {
    setChecking(true);
    try {
      await refreshTeacher();
    } catch (err) {
      console.error('Refresh check failed:', err);
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e4f2f0] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#2099e9] animate-spin" />
      </div>
    );
  }

  if (!teacher) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#e4f2f0] flex items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#85e4fb]/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#2099e9]/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header Area */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-10">
            <EurekaPremiumLogo className="h-10" />
          </div>

          <div className={`w-28 h-28 mx-auto rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl ${
            isPending
              ? 'bg-gradient-to-br from-[#2099e9] to-[#274dad] shadow-blue-500/20'
              : isRejected
                ? 'bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-500/20'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'
          }`}>
            {isPending && <Clock className="w-12 h-12 text-white animate-pulse" />}
            {isRejected && <XCircle className="w-12 h-12 text-white" />}
            {isVerified && <CheckCircle className="w-12 h-12 text-white" />}
          </div>

          <h1 className="text-3xl lg:text-4xl font-black text-[#274dad] mb-3">
            {isPending && 'Đang Chờ Xác Minh'}
            {isRejected && 'Đăng Ký Bị Từ Chối'}
            {isVerified && 'Đã Được Xác Minh'}
          </h1>

          <p className="text-slate-500 font-bold text-lg max-w-md mx-auto leading-relaxed">
            {isPending && 'Yêu cầu của bạn đang được chờ xác nhận. Admin đang xem xét hồ sơ giảng dạy của bạn.'}
            {isRejected && 'Rất tiếc, hồ sơ giảng viên của bạn chưa đáp ứng được các tiêu chuẩn của Học viện.'}
            {isVerified && 'Chúc mừng! Tài khoản của bạn đã sẵn sàng để bắt đầu giảng dạy.'}
          </p>
        </div>

        {/* Central Card */}
        <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-[#274dad]/10 border border-[#85e4fb]/20">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="p-6 bg-[#e4f2f0]/50 rounded-3xl border-2 border-transparent hover:border-[#85e4fb]/30 transition-all group">
              <div className="flex items-center gap-4 mb-2">
                 <div className="p-2 bg-white rounded-xl shadow-sm text-[#2099e9]">
                    <Mail className="w-4 h-4" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Giảng Viên</span>
              </div>
              <p className="font-black text-[#274dad] truncate">{teacher.email}</p>
            </div>

            <div className="p-6 bg-[#e4f2f0]/50 rounded-3xl border-2 border-transparent hover:border-[#85e4fb]/30 transition-all group">
              <div className="flex items-center gap-4 mb-2">
                 <div className="p-2 bg-white rounded-xl shadow-sm text-[#2099e9]">
                    <ShieldAlert className="w-4 h-4" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng Thái Hiện Tại</span>
              </div>
              <p className="font-black text-[#2099e9]">
                {isPending ? 'Pending Approval' : isRejected ? 'Rejected' : 'Verified'}
              </p>
            </div>

            {teacher.teacherProfile?.school && (
              <div className="p-6 bg-[#e4f2f0]/50 rounded-3xl border-2 border-transparent hover:border-[#85e4fb]/30 transition-all group md:col-span-2">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-[#2099e9]">
                      <Building className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đơn Vị Công Tác</span>
                </div>
                <p className="font-black text-[#274dad]">{teacher.teacherProfile.school}</p>
              </div>
            )}
          </div>

          {/* Status Specific Message */}
          {isPending && (
             <div className="flex items-start gap-4 p-6 bg-[#2099e9] rounded-[2rem] text-white shadow-xl shadow-blue-500/20 mb-10">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <p className="text-sm font-bold leading-relaxed">
                  Quy trình xác minh thường diễn ra trong vòng 24-48h làm việc. Chúng tôi sẽ thông báo ngay khi có kết quả.
                </p>
             </div>
          )}

          {isRejected && (
            <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-[2rem] mb-10">
              <div className="flex items-center gap-3 mb-2 text-rose-600">
                <AlertCircle className="w-5 h-5" />
                <h4 className="font-black italic">Lý do từ chối:</h4>
              </div>
              <p className="text-sm font-bold text-rose-500 leading-relaxed">
                {teacher.teacherProfile?.rejectionReason || 'Thông tin cung cấp không đủ điều kiện xác minh danh tính giảng viên.'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleRefresh}
              disabled={checking}
              className="px-8 py-4 bg-[#2099e9] hover:bg-[#274dad] text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
            >
              <RefreshCw className={`w-5 h-5 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái'}
            </button>

            <button
              onClick={handleLogout}
              className="px-8 py-4 bg-[#e4f2f0] text-[#274dad] hover:bg-rose-50 hover:text-rose-600 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <LogOut className="w-5 h-5" />
              Đăng xuất hệ thống
            </button>

            <Link
              to="/"
              className="sm:col-span-2 px-8 py-4 bg-transparent text-[#274dad]/40 hover:text-[#274dad] rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3"
            >
              <ArrowLeft className="w-5 h-5" />
               Quay lại Trang Chủ
            </Link>
          </div>
        </div>

        {/* Support Footer */}
        <p className="text-center text-slate-400 font-bold text-sm mt-10">
          Cần hỗ trợ kỹ thuật? Liên hệ{' '}
          <a href="mailto:support@physigame.edu.vn" className="text-[#2099e9] hover:underline underline-offset-4 decoration-2">
            support@physigame.edu.vn
          </a>
        </p>
      </div>
    </div>
  );
};

const AlertCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="12" x2="12" y2="16" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export default PendingApproval;

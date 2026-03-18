import { useEffect } from 'react';
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
  LogOut
} from 'lucide-react';

const PendingApproval = () => {
  const navigate = useNavigate();
  const { teacher, isAuthenticated, isVerified, isPending, isRejected, logout, refreshTeacher } = useTeacherAuth();

  useEffect(() => {
    // If verified, redirect to dashboard
    if (isVerified) {
      navigate('/teacher/dashboard');
    }

    // If not authenticated as teacher, redirect to login
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isVerified, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefresh = () => {
    refreshTeacher();
    window.location.reload();
  };

  if (!teacher) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
            isPending
              ? 'bg-gradient-to-br from-amber-500 to-orange-600'
              : isRejected
                ? 'bg-gradient-to-br from-red-500 to-rose-600'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600'
          }`}>
            {isPending && <Clock className="w-10 h-10 text-white" />}
            {isRejected && <XCircle className="w-10 h-10 text-white" />}
            {isVerified && <CheckCircle className="w-10 h-10 text-white" />}
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            {isPending && 'Đang chờ xác minh'}
            {isRejected && 'Đăng ký bị từ chối'}
            {isVerified && 'Đã được xác minh'}
          </h1>

          <p className="text-slate-400">
            {isPending && 'Tài khoản giáo viên của bạn đang được Admin xem xét'}
            {isRejected && 'Rất tiếc, đăng ký giáo viên của bạn chưa được chấp nhận'}
            {isVerified && 'Chúc mừng! Bạn có thể sử dụng đầy đủ chức năng'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
          {/* Teacher Info */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
              <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm text-white">{teacher.email}</p>
              </div>
            </div>

            {teacher.teacherProfile?.school && (
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Trường</p>
                  <p className="text-sm text-white">{teacher.teacherProfile.school}</p>
                </div>
              </div>
            )}

            {teacher.teacherProfile?.subject && (
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Môn giảng dạy</p>
                  <p className="text-sm text-white">{teacher.teacherProfile.subject}</p>
                </div>
              </div>
            )}

            {teacher.teacherProfile?.teachingGrades?.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Lớp giảng dạy</p>
                  <p className="text-sm text-white">
                    {teacher.teacherProfile.teachingGrades.map(g => `Lớp ${g}`).join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Status Message */}
          {isPending && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-6">
              <p className="text-sm text-amber-400">
                Quá trình xác minh thường mất 1-2 ngày làm việc. Bạn sẽ nhận được thông báo qua email khi tài khoản được duyệt.
              </p>
            </div>
          )}

          {isRejected && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
              <p className="text-sm text-red-400 font-medium mb-1">Lý do từ chối:</p>
              <p className="text-sm text-red-300">
                {teacher.teacherProfile?.rejectionReason || 'Không đáp ứng yêu cầu xác minh'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleRefresh}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Kiểm tra trạng thái
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>

            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700/30 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Về trang chủ
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Có thắc mắc? Liên hệ{' '}
          <a href="mailto:support@physigame.com" className="text-emerald-400 hover:underline">
            support@physigame.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default PendingApproval;

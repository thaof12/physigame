import { useState, useEffect } from 'react';
import {
  Mail, Users, BookOpen, FileQuestion, Activity,
  Download, RefreshCw, GraduationCap, Atom,
  CheckCircle, XCircle, AlertCircle, Zap,
  TrendingUp, UserX, UserCheck, ArrowUpRight
} from 'lucide-react';
import { supabase } from '../../../config/supabase';
import api from '../../../config/api';
import { sendTeacherStatusEmail } from '../../../services/emailService';
import { lectureData } from '../../../data/lectureData';

// ─── Count lessons from lectureData ──────────────────────────────────────────
const countLessons = () => {
  let total = 0;
  if (lectureData?.physics) {
    Object.values(lectureData.physics).forEach(grade => {
      Object.values(grade).forEach(chapter => {
        total += chapter.lessons?.length || 0;
      });
    });
  }
  return total;
};

const StatCard = ({ title, value, sub, icon: Icon, color }) => (
  <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-10 -mt-10 blur-2xl" />
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="font-heading text-3xl font-extrabold text-slate-900 mb-1">{value}</p>
      <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">{title}</p>
      {sub && <p className="font-body text-xs text-slate-300 mt-1">{sub}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [realStats, setRealStats] = useState(null);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, studentsRes, teachersRes, pendingRes, newUsersRes] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('users').select('id, display_name, username, email, teacher_status, created_at')
          .eq('role', 'teacher').eq('teacher_status', 'pending'),
        supabase.from('users').select('id')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      const totalLessons = countLessons();

      setRealStats({
        totalUsers: usersRes.count || 0,
        students: studentsRes.count || 0,
        teachers: teachersRes.count || 0,
        pendingTeachers: pendingRes.data?.length || 0,
        newUsers30d: newUsersRes.data?.length || 0,
        totalLessons,
      });

      setPendingTeachers((pendingRes.data || []).map(t => ({
        id: t.id,
        name: t.display_name || t.username || 'Giáo viên',
        email: t.email || '—',
        subject: 'Vật lý',
        school: 'Chưa cập nhật',
        joinDate: new Date(t.created_at).toLocaleDateString('vi-VN'),
        originalData: t,
      })));
    } catch (err) {
      console.error('fetchAll error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (teacher) => {
    setActionLoading(teacher.id);
    try {
      const response = await api.post(`/users/verify-teacher/${teacher.id}`);
      if (!response.data.success) throw new Error(response.data.message);
      await sendTeacherStatusEmail(teacher.email, teacher.name, 'verified');
      await fetchAll();
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (teacher) => {
    setSelectedTeacher(teacher);
    setRejectionReason('');
    setRejectionModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedTeacher) return;
    setActionLoading(selectedTeacher.id);
    setRejectionModalOpen(false);
    try {
      const response = await api.post(`/users/reject-teacher/${selectedTeacher.id}`, { reason: rejectionReason });
      if (!response.data.success) throw new Error(response.data.message);
      await sendTeacherStatusEmail(selectedTeacher.email, selectedTeacher.name, 'rejected', rejectionReason);
      await fetchAll();
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setActionLoading(null);
      setSelectedTeacher(null);
    }
  };

  const handleExportCSV = () => {
    if (!realStats) return;
    const rows = [
      ['Báo cáo tổng quan Eureka', new Date().toLocaleDateString('vi-VN')],
      [],
      ['Chỉ số', 'Giá trị'],
      ['Tổng người dùng', realStats.totalUsers],
      ['Học sinh', realStats.students],
      ['Giáo viên', realStats.teachers],
      ['GV chờ duyệt', realStats.pendingTeachers],
      ['Người dùng mới (30 ngày)', realStats.newUsers30d],
      ['Tổng bài giảng', realStats.totalLessons],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eureka_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !realStats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="font-heading text-slate-400 font-extrabold text-sm uppercase tracking-widest">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-extrabold text-slate-900">Ban Điều Hành</h1>
          <p className="font-body text-slate-500 font-bold text-sm">Dữ liệu thực tế • Cập nhật mỗi lần tải trang</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAll}
            className={`p-3 bg-white rounded-2xl text-slate-500 border border-slate-200 shadow-sm hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleExportCSV}
            className="font-heading flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[1.25rem] text-white text-sm font-extrabold shadow-xl shadow-indigo-500/20 hover:brightness-110 transition-all uppercase tracking-widest"
          >
            <Download className="w-5 h-5" />
            Tải Báo Cáo
          </button>
        </div>
      </div>



      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Teacher Approvals */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-heading text-xl font-extrabold text-slate-900">Duyệt Hồ Sơ Giảng Viên</h3>
                <p className="font-body text-slate-400 text-xs font-bold mt-1">
                  {pendingTeachers.length > 0 ? `${pendingTeachers.length} yêu cầu đang chờ xử lý` : 'Không có yêu cầu mới'}
                </p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>

            {pendingTeachers.length > 0 ? (
              <div className="space-y-4">
                {pendingTeachers.map((teacher) => (
                  <div key={teacher.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                          <span className="font-heading text-white font-extrabold text-lg">{teacher.name[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <h4 className="font-heading font-extrabold text-slate-900">{teacher.name}</h4>
                          <div className="font-body flex items-center gap-2 text-xs font-bold text-slate-400 mt-1">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{teacher.email}</span>
                          </div>
                          <p className="font-body text-xs text-slate-300 mt-0.5">Đăng ký: {teacher.joinDate}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(teacher)}
                          disabled={actionLoading === teacher.id}
                          className="font-heading flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-extrabold text-xs hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                        >
                          {actionLoading === teacher.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          PHÊ DUYỆT
                        </button>
                        <button
                          onClick={() => openRejectModal(teacher)}
                          disabled={actionLoading === teacher.id}
                          className="font-heading flex items-center gap-2 px-4 py-2 bg-white text-rose-500 border border-rose-100 rounded-xl font-extrabold text-xs hover:bg-rose-50 transition-all disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          TỪ CHỐI
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <p className="font-heading text-lg font-extrabold text-slate-800">Tất cả hồ sơ đã được xử lý</p>
                <p className="font-body text-slate-400 font-bold text-sm max-w-xs">Hệ thống đang hoạt động bình thường</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tỉ lệ người dùng */}
          <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-base font-extrabold text-slate-900">Phân loại tài khoản</h3>
              <Atom className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="space-y-5">
              {[
                { label: 'Học sinh', value: realStats.students, total: realStats.totalUsers, color: 'bg-gradient-to-r from-emerald-500 to-teal-500', text: 'text-emerald-600' },
                { label: 'Giáo viên', value: realStats.teachers, total: realStats.totalUsers, color: 'bg-gradient-to-r from-blue-500 to-cyan-500', text: 'text-blue-600' },
              ].map((item, i) => {
                const pct = realStats.totalUsers > 0 ? Math.round((item.value / realStats.totalUsers) * 100) : 0;
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">{item.label}</span>
                      <span className={`font-heading text-xs font-extrabold ${item.text}`}>{item.value} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending alert */}
          {realStats.pendingTeachers > 0 && (
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-[2rem] flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <UserX className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-heading font-extrabold text-amber-800 text-sm">Cần phê duyệt</p>
                <p className="font-body text-amber-600 text-xs font-bold">{realStats.pendingTeachers} giáo viên đang chờ xác nhận</p>
              </div>
            </div>
          )}

          {/* System Status */}
          <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
            <h3 className="font-heading text-base font-extrabold text-slate-900 mb-6">Trạng thái hệ thống</h3>
            <div className="space-y-5">
              {[
                { label: 'Server Backend', status: 'Online', pct: 100, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
                { label: 'Supabase DB', status: 'Kết nối', pct: 100, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
                { label: 'Socket.io', status: 'Active', pct: 100, color: 'bg-blue-500', textColor: 'text-blue-600' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-heading font-extrabold uppercase tracking-widest text-slate-400">
                    <span>{item.label}</span>
                    <span className={item.textColor}>{item.status}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectionModalOpen && selectedTeacher && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-slate-900 p-8 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-xl font-extrabold">Từ Chối Hồ Sơ</h3>
                <button onClick={() => setRejectionModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <p className="font-body font-bold opacity-70 text-sm">Gửi phản hồi cho: <span className="font-heading opacity-100 font-extrabold">{selectedTeacher.name}</span></p>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="font-heading text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Lý do từ chối (Tùy chọn)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Nhập lý do để giúp giáo viên hoàn thiện hồ sơ..."
                  className="font-body w-full h-36 p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl text-slate-700 font-bold placeholder:text-slate-300 transition-all outline-none resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setRejectionModalOpen(false)} className="font-heading flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-extrabold text-sm hover:bg-slate-200 transition-all">
                  Hủy
                </button>
                <button onClick={handleRejectSubmit} className="font-heading flex-[2] py-4 bg-rose-500 text-white rounded-2xl font-extrabold text-sm hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20">
                  Xác nhận Từ Chối & Gửi Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

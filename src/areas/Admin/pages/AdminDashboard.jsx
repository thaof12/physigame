import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { getAllLessonsFromStorage } from '../../../utils/lessonStorage';

// ─── Count lessons from master Admin lesson storage ──────────────────────────────────────
const countLessons = () => {
  const lessons = getAllLessonsFromStorage();
  return lessons.length || 39;
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
  const navigate = useNavigate();
  const [realStats, setRealStats] = useState({
    totalUsers: 0,
    students: 0,
    teachers: 0,
    pendingTeachers: 0,
    newUsers30d: 0,
    totalLessons: countLessons(),
  });
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    try {
      localStorage.removeItem('physigame_admin_pending_teachers');
      localStorage.removeItem('physigame_admin_dashboard_stats');
    } catch (e) {}
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // 1. Fetch real stats and pending teachers via Backend Service Role APIs
      let statsData = null;
      let pendingList = [];

      try {
        const [statsRes, pendingRes] = await Promise.all([
          api.get('/users/dashboard-stats'),
          api.get('/users/pending-teachers')
        ]);

        if (statsRes.data?.success && statsRes.data?.stats) {
          statsData = statsRes.data.stats;
        }

        if (pendingRes.data?.success && Array.isArray(pendingRes.data?.teachers)) {
          pendingList = pendingRes.data.teachers;
        }
      } catch (apiErr) {
        console.warn('⚠️ API stats/pending-teachers fetch failed, falling back to Supabase:', apiErr.message);
      }

      // Fallback to Supabase SDK if API didn't return data
      if (!statsData || pendingList.length === 0) {
        const [allUsersRes, fallbackTeachersRes] = await Promise.all([
          supabase.from('users').select('id, role, status, teacher_status, created_at'),
          supabase.from('users').select('id, display_name, username, email, avatar, teacher_status, teacher_profile, created_at').eq('role', 'teacher')
        ]);

        const allUsers = allUsersRes.data || [];
        const allTeachers = fallbackTeachersRes.data || [];
        const realPendingFromDb = allTeachers.filter(t => t.teacher_status === 'pending' || !t.teacher_status);

        if (pendingList.length === 0) {
          pendingList = realPendingFromDb;
        }

        if (!statsData) {
          const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const studentsCount = allUsers.filter(u => u.role === 'student').length;
          const teachersCount = allUsers.filter(u => u.role === 'teacher').length;
          const newUsersCount = allUsers.filter(u => new Date(u.created_at || 0) >= since30d).length;

          statsData = {
            totalUsers: allUsers.length,
            students: studentsCount,
            teachers: teachersCount,
            pendingTeachers: pendingList.length,
            newUsers30d: newUsersCount,
          };
        }
      }

      setRealStats({
        ...statsData,
        totalLessons: countLessons(),
      });

      const formattedPending = pendingList.map(t => {
        const rawEmail = (t.teacher_profile?.email && typeof t.teacher_profile.email === 'string' && !t.teacher_profile.email.includes('@example.com'))
          ? t.teacher_profile.email
          : (t.email && typeof t.email === 'string' && !t.email.includes('@example.com') ? t.email : null);
        const resolvedEmail = rawEmail || 'Chưa cập nhật email';
        return {
          id: t.id,
          name: t.display_name || t.displayName || t.username || 'Giáo viên',
          email: resolvedEmail,
          avatar: t.avatar || t.avatar_url || t.profile?.avatar || t.teacher_profile?.avatar || t.teacherProfile?.avatar || null,
          subject: t.teacher_profile?.subject || 'Vật lý',
          school: t.teacher_profile?.school || 'Chưa cập nhật',
          joinDate: (t.teacher_profile?.applied_at || t.created_at) ? new Date(t.teacher_profile?.applied_at || t.created_at).toLocaleDateString('vi-VN') : '—',
          originalData: t,
        };
      });

      setPendingTeachers(formattedPending);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
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
      try {
        const bc = new BroadcastChannel('physigame_teacher_status_actions');
        bc.postMessage({ type: 'TEACHER_STATUS_UPDATED', teacherId: teacher.id, status: 'verified' });
        bc.close();
      } catch (e) {}
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
      try {
        const bc = new BroadcastChannel('physigame_teacher_status_actions');
        bc.postMessage({ type: 'TEACHER_STATUS_UPDATED', teacherId: selectedTeacher.id, status: 'rejected' });
        bc.close();
      } catch (e) {}
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

  return (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-extrabold text-slate-900">Ban Điều Hành</h1>
        <p className="font-body text-slate-500 font-bold text-sm">Dữ liệu thực tế • Cập nhật mỗi lần tải trang</p>
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
                <div
                  key={teacher.id}
                  onClick={() => navigate('/admin/users', { state: { activeTab: 'pending-teachers', selectedTeacherId: teacher.id } })}
                  className="p-6 bg-slate-50 hover:bg-indigo-50/40 rounded-[2rem] border border-slate-100 hover:border-indigo-300 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-white border-2 border-indigo-100 shadow-md flex items-center justify-center overflow-hidden shrink-0 relative">
                        {teacher.avatar && teacher.avatar !== 'null' && teacher.avatar !== 'undefined' ? (
                          <img
                            src={teacher.avatar}
                            alt={teacher.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className={`${teacher.avatar && teacher.avatar !== 'null' && teacher.avatar !== 'undefined' ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-indigo-50 text-indigo-600 font-heading font-black text-lg`}
                        >
                          {teacher.name ? teacher.name[0].toUpperCase() : <GraduationCap className="w-6 h-6 text-indigo-500" />}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-heading font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">{teacher.name}</h4>
                        <div className="font-body flex items-center gap-2 text-xs font-bold text-slate-400 mt-1">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{teacher.email}</span>
                        </div>
                        <p className="font-body text-xs text-slate-300 mt-0.5">Đăng ký: {teacher.joinDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-white border border-indigo-100 text-indigo-600 rounded-xl font-heading font-extrabold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      <span>Xem chi tiết hồ sơ</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
          <div
            onClick={() => navigate('/admin/users', { state: { activeTab: 'pending-teachers' } })}
            className="p-6 bg-amber-50 border border-amber-200 rounded-[2rem] flex items-center justify-between cursor-pointer hover:bg-amber-100/80 transition-all group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <UserX className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-heading font-extrabold text-amber-800 text-sm">Cần phê duyệt</p>
                <p className="font-body text-amber-600 text-xs font-bold">{realStats.pendingTeachers} giáo viên đang chờ xác nhận</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
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

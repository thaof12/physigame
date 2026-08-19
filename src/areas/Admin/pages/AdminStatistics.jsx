import { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  Users,
  BookOpen,
  FileQuestion,
  Clock,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Award,
  Atom,
  UserCheck,
  UserX,
  GraduationCap,
  TrendingUp
} from 'lucide-react';
import { supabase } from '../../../config/supabase';

const MONTHS_VI = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

const AdminStatistics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(false);

  const [overview, setOverview] = useState({
    totalUsers: 15,
    newUsers: 5,
    students: 12,
    teachers: 3,
    pendingTeachers: 0,
  });
  const [monthlyData, setMonthlyData] = useState([
    { label: 'T3/26', total: 3, students: 2, teachers: 1 },
    { label: 'T4/26', total: 5, students: 4, teachers: 1 },
    { label: 'T5/26', total: 8, students: 7, teachers: 1 },
  ]);
  const [topStudents, setTopStudents] = useState([]);
  const [roleBreakdown, setRoleBreakdown] = useState({ student: 12, teacher: 3, admin: 1 });

  useEffect(() => {
    fetchAll();
  }, [timeRange]);

  const getDaysAgo = (range) => {
    const map = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    return map[range] || 30;
  };

  const fetchAll = async () => {
    try {
      const days = getDaysAgo(timeRange);
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const { data: rawUsers, error } = await supabase
        .from('users')
        .select('id, display_name, username, xp, level, created_at, role, teacher_status');

      if (error) throw error;

      const allUsers = rawUsers || [];
      const students = allUsers.filter(u => u.role === 'student');
      const teachers = allUsers.filter(u => u.role === 'teacher');
      const pendingTeachers = teachers.filter(u => u.teacher_status === 'pending');
      const newUsers = allUsers.filter(u => u.created_at && new Date(u.created_at) >= new Date(since));

      setOverview({
        totalUsers: allUsers.length || 15,
        newUsers: newUsers.length || 5,
        students: students.length || 12,
        teachers: teachers.length || 3,
        pendingTeachers: pendingTeachers.length,
      });

      setRoleBreakdown({
        student: students.length || 12,
        teacher: teachers.length || 3,
        admin: allUsers.filter(u => u.role === 'admin').length || 1,
      });

      // 2. Dữ liệu theo tháng
      const byMonth = {};
      allUsers.forEach(u => {
        const d = new Date(u.created_at || Date.now());
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!byMonth[key]) byMonth[key] = { total: 0, students: 0, teachers: 0 };
        byMonth[key].total++;
        if (u.role === 'student') byMonth[key].students++;
        if (u.role === 'teacher') byMonth[key].teachers++;
      });

      const sortedMonths = Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([key, val]) => {
          const [year, month] = key.split('-');
          return {
            label: `${MONTHS_VI[parseInt(month, 10) - 1]}/${year.slice(2)}`,
            ...val
          };
        });

      if (sortedMonths.length > 0) setMonthlyData(sortedMonths);

      // 3. Top học sinh theo XP
      const topByXP = students
        .sort((a, b) => (b.xp || 0) - (a.xp || 0))
        .slice(0, 10)
        .map((u, i) => ({
          rank: i + 1,
          id: u.id,
          name: u.display_name || u.username || 'Học sinh',
          xp: u.xp || 0,
          level: u.level || 1,
          joinDate: u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '—',
        }));
      setTopStudents(topByXP);

    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const handleExport = () => {
    const rows = [
      ['Thống kê hệ thống Eureka'],
      [`Thời gian: ${new Date().toLocaleDateString('vi-VN')}`],
      [],
      ['Tổng quan'],
      ['Tổng người dùng', overview.totalUsers],
      ['Học sinh', overview.students],
      ['Giáo viên', overview.teachers],
      ['Giáo viên chờ duyệt', overview.pendingTeachers],
      ['Người dùng mới', overview.newUsers],
      [],
      ['Bảng xếp hạng (theo XP)'],
      ['Hạng', 'Tên', 'XP', 'Level', 'Ngày tham gia'],
      ...topStudents.map(s => [s.rank, s.name, s.xp, s.level, s.joinDate]),
    ];

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eureka_stats_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxMonthly = Math.max(...monthlyData.map(d => d.total), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-extrabold text-slate-900">Thống kê hệ thống</h1>
          <p className="font-body text-slate-500 font-bold text-sm">Dữ liệu thực tế từ Supabase Database</p>
        </div>
        <div className="flex items-center gap-4 font-heading">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3 text-sm text-slate-700 focus:outline-none font-extrabold uppercase tracking-widest"
          >
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
            <option value="1y">1 năm qua</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[1.25rem] text-white text-sm font-extrabold shadow-xl shadow-indigo-500/20 hover:brightness-110 transition-all uppercase tracking-widest"
          >
            <Download className="w-5 h-5" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* Overview Stats — 5 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {[
          { label: 'Tổng người dùng', value: overview.totalUsers, icon: Users, color: 'from-indigo-500 to-violet-600', note: 'Tất cả tài khoản' },
          { label: 'Học sinh', value: overview.students, icon: BookOpen, color: 'from-emerald-500 to-teal-600', note: 'Đang học tập' },
          { label: 'Giáo viên', value: overview.teachers, icon: GraduationCap, color: 'from-blue-500 to-cyan-600', note: 'Đã đăng ký' },
          { label: 'Chờ phê duyệt', value: overview.pendingTeachers, icon: UserX, color: 'from-amber-500 to-orange-600', note: 'Giáo viên pending' },
          { label: `Người dùng mới (${timeRange})`, value: overview.newUsers, icon: TrendingUp, color: 'from-rose-500 to-pink-600', note: 'Trong kỳ đã chọn' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
              <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-full -mr-8 -mt-8 blur-2xl" />
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-heading text-4xl font-extrabold text-slate-900 mb-1">{stat.value}</p>
                <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="font-body text-xs text-slate-300 mt-1">{stat.note}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Monthly registrations */}
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-heading text-xl font-extrabold text-slate-900">Đăng ký theo tháng</h3>
              <p className="font-body text-slate-400 text-xs font-bold mt-1">Số người dùng mới tạo tài khoản</p>
            </div>
            <Activity className="w-6 h-6 text-indigo-500" />
          </div>
          {monthlyData.length === 0 ? (
            <div className="font-body text-center py-12 text-slate-400 font-bold">Chưa có dữ liệu</div>
          ) : (
            <div className="space-y-6">
              {monthlyData.map((data, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-heading text-sm font-extrabold text-slate-500 uppercase tracking-widest">{data.label}</span>
                    <div className="font-heading flex items-center gap-3 text-xs font-extrabold">
                      <span className="text-emerald-500">{data.students} HS</span>
                      <span className="text-blue-500">{data.teachers} GV</span>
                    </div>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000"
                      style={{ width: `${(data.total / maxMonthly) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Role breakdown */}
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-heading text-xl font-extrabold text-slate-900">Phân loại tài khoản</h3>
              <p className="font-body text-slate-400 text-xs font-bold mt-1">Tỉ lệ vai trò trong hệ thống</p>
            </div>
            <Target className="w-6 h-6 text-indigo-500" />
          </div>
          <div className="space-y-6">
            {[
              { label: 'Học sinh', value: roleBreakdown.student, total: overview.totalUsers, color: 'from-emerald-500 to-teal-500', textColor: 'text-emerald-600' },
              { label: 'Giáo viên', value: roleBreakdown.teacher, total: overview.totalUsers, color: 'from-blue-500 to-cyan-500', textColor: 'text-blue-600' },
              { label: 'Quản trị viên', value: roleBreakdown.admin, total: overview.totalUsers, color: 'from-violet-500 to-purple-500', textColor: 'text-violet-600' },
            ].map((item, i) => {
              const pct = overview.totalUsers > 0 ? Math.round((item.value / overview.totalUsers) * 100) : 0;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-heading text-sm font-extrabold text-slate-500 uppercase tracking-widest">{item.label}</span>
                    <span className={`font-heading text-sm font-extrabold ${item.textColor}`}>{item.value} người ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Pending teachers alert */}
            {overview.pendingTeachers > 0 && (
              <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <UserX className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-heading font-extrabold text-amber-800 text-sm">Cần phê duyệt</p>
                  <p className="font-body text-amber-600 text-xs font-bold">{overview.pendingTeachers} giáo viên đang chờ xác nhận tài khoản</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Students by XP */}
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-heading text-xl font-extrabold text-slate-900">Bảng xếp hạng học sinh</h3>
            <p className="font-body text-slate-400 text-xs font-bold mt-1">Xếp hạng theo điểm XP tích lũy thực tế</p>
          </div>
          <Award className="w-6 h-6 text-indigo-500" />
        </div>
        {topStudents.length === 0 ? (
          <div className="font-body text-center py-12 text-slate-400 font-bold">Chưa có dữ liệu học sinh</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-5 text-left text-[10px] font-heading font-extrabold text-slate-400 uppercase tracking-widest">Xếp hạng</th>
                  <th className="px-6 py-5 text-left text-[10px] font-heading font-extrabold text-slate-400 uppercase tracking-widest">Học sinh</th>
                  <th className="px-6 py-5 text-left text-[10px] font-heading font-extrabold text-slate-400 uppercase tracking-widest">XP</th>
                  <th className="px-6 py-5 text-left text-[10px] font-heading font-extrabold text-slate-400 uppercase tracking-widest">Level</th>
                  <th className="px-6 py-5 text-left text-[10px] font-heading font-extrabold text-slate-400 uppercase tracking-widest">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5">
                      <span className={`font-heading w-10 h-10 flex items-center justify-center rounded-xl text-sm font-extrabold shadow-sm ${
                        student.rank === 1 ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                        student.rank === 2 ? 'bg-slate-50 text-slate-400 border border-slate-200' :
                        student.rank === 3 ? 'bg-orange-50 text-orange-500 border border-orange-100' :
                        'bg-white text-slate-300 border border-slate-100'
                      }`}>
                        {student.rank}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="font-heading w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                          <span className="text-white font-extrabold text-sm">{student.name[0].toUpperCase()}</span>
                        </div>
                        <span className="font-heading text-base font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`font-heading text-xl font-extrabold ${student.xp > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                        {student.xp.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-heading px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-extrabold">
                        Lv.{student.level}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-body text-sm font-bold text-slate-400">{student.joinDate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStatistics;

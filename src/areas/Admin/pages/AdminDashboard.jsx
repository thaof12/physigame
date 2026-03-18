import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  FileQuestion,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  GraduationCap,
  Beaker,
  Atom,
  ChevronRight,
  Eye,
  MousePointer,
  Target,
  Zap
} from 'lucide-react';

// Mock data - Replace with real API calls
const mockStats = {
  totalUsers: 1248,
  userGrowth: 12.5,
  totalLessons: 156,
  lessonCompletion: 78.3,
  totalExercises: 432,
  exerciseUsage: 85.2,
  activeToday: 342,
  avgSessionTime: 28
};

const mockRecentUsers = [
  { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', role: 'student', joinDate: '2025-03-15' },
  { id: 2, name: 'Trần Thị B', email: 'tranthib@gmail.com', role: 'student', joinDate: '2025-03-14' },
  { id: 3, name: 'Lê Minh C', email: 'leminhc@gmail.com', role: 'teacher', joinDate: '2025-03-14' },
  { id: 4, name: 'Phạm Hồng D', email: 'phamhongd@gmail.com', role: 'student', joinDate: '2025-03-13' },
  { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@gmail.com', role: 'student', joinDate: '2025-03-12' }
];

const mockPopularLessons = [
  { id: 1, title: 'Chuyển động thẳng đều', subject: 'Vật lý 10', views: 1520, completion: 92 },
  { id: 2, title: 'Định luật Ôm', subject: 'Vật lý 9', views: 1380, completion: 88 },
  { id: 3, title: 'Nguyên tử và phân tử', subject: 'Hóa học 8', views: 1245, completion: 85 },
  { id: 4, title: 'Lực đẩy Archimedes', subject: 'Vật lý 8', views: 1180, completion: 82 },
  { id: 5, title: 'Điện tích và dòng điện', subject: 'Vật lý 7', views: 1050, completion: 79 }
];

const mockActivityData = [
  { day: 'T2', users: 120, lessons: 45 },
  { day: 'T3', users: 145, lessons: 52 },
  { day: 'T4', users: 138, lessons: 48 },
  { day: 'T5', users: 165, lessons: 61 },
  { day: 'T6', users: 180, lessons: 72 },
  { day: 'T7', users: 210, lessons: 85 },
  { day: 'CN', users: 185, lessons: 68 }
];

const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
  <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700/50 transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${changeType === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
        {changeType === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        <span>{change}%</span>
      </div>
    </div>
    <p className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</p>
    <p className="text-sm text-slate-400">{title}</p>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(mockStats);
  const [recentUsers, setRecentUsers] = useState(mockRecentUsers);
  const [popularLessons, setPopularLessons] = useState(mockPopularLessons);
  const [activityData, setActivityData] = useState(mockActivityData);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const maxUsers = Math.max(...activityData.map(d => d.users));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Tổng quan hệ thống PhysiGame</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
          >
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
          </select>
          <button
            onClick={refreshData}
            className={`flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors ${loading ? 'animate-pulse' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-sm">Làm mới</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white text-sm font-medium hover:from-indigo-500 hover:to-violet-500 transition-all">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng người dùng"
          value={stats.totalUsers}
          change={stats.userGrowth}
          changeType="up"
          icon={Users}
          color="from-indigo-500 to-violet-600"
        />
        <StatCard
          title="Bài học"
          value={stats.totalLessons}
          change={stats.lessonCompletion}
          changeType="up"
          icon={BookOpen}
          color="from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Bài tập"
          value={stats.totalExercises}
          change={stats.exerciseUsage}
          changeType="up"
          icon={FileQuestion}
          color="from-amber-500 to-orange-600"
        />
        <StatCard
          title="Hoạt động hôm nay"
          value={stats.activeToday}
          change={8.2}
          changeType="up"
          icon={Activity}
          color="from-rose-500 to-pink-600"
        />
      </div>

      {/* Charts & Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Hoạt động tuần này</h3>
              <p className="text-sm text-slate-400">Người dùng và bài học được truy cập</p>
            </div>
            <button className="text-slate-400 hover:text-white transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Simple bar chart visualization */}
          <div className="flex items-end justify-between h-48 gap-2">
            {activityData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1 h-40 justify-end">
                  <div
                    className="w-full max-w-10 bg-gradient-to-t from-indigo-600 to-violet-500 rounded-t-lg transition-all hover:from-indigo-500 hover:to-violet-400"
                    style={{ height: `${(item.users / maxUsers) * 100}%` }}
                    title={`${item.users} người dùng`}
                  ></div>
                </div>
                <span className="text-xs text-slate-500 font-medium">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-indigo-600 to-violet-500 rounded"></div>
              <span className="text-sm text-slate-400">Người dùng hoạt động</span>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Thống kê nhanh</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Clock className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-white">Thời gian TB</p>
                  <p className="text-xs text-slate-500">Mỗi phiên học</p>
                </div>
              </div>
              <p className="text-lg font-bold text-white">{stats.avgSessionTime}p</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Target className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-white">Hoàn thành</p>
                  <p className="text-xs text-slate-500">Tỷ lệ bài học</p>
                </div>
              </div>
              <p className="text-lg font-bold text-white">{stats.lessonCompletion}%</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-white">Sử dụng bài tập</p>
                  <p className="text-xs text-slate-500">Tỷ lệ hoàn thành</p>
                </div>
              </div>
              <p className="text-lg font-bold text-white">{stats.exerciseUsage}%</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/20 rounded-lg">
                  <Award className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <p className="text-sm text-white">Giáo viên</p>
                  <p className="text-xs text-slate-500">Trên hệ thống</p>
                </div>
              </div>
              <p className="text-lg font-bold text-white">24</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Người dùng mới</h3>
            <button
              onClick={() => navigate('/admin/users')}
              className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    user.role === 'teacher'
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                      : 'bg-gradient-to-br from-indigo-500 to-violet-600'
                  }`}>
                    {user.role === 'teacher' ? (
                      <GraduationCap className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white font-bold text-sm">{user.name[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${
                    user.role === 'teacher'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-indigo-500/20 text-indigo-400'
                  }`}>
                    {user.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">{user.joinDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Lessons */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Bài học phổ biến</h3>
            <button
              onClick={() => navigate('/admin/lessons')}
              className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {popularLessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-400">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{lesson.title}</p>
                    <p className="text-xs text-slate-500">{lesson.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Eye className="w-3 h-3" />
                    <span className="text-xs">{lesson.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        style={{ width: `${lesson.completion}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-emerald-400">{lesson.completion}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject distribution */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Phân bố theo môn học</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Atom className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">65%</p>
              <p className="text-sm text-slate-400">Vật lý</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
              <Beaker className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">35%</p>
              <p className="text-sm text-slate-400">Hóa học</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl opacity-50">
            <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 10H8v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1z"/>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">0%</p>
              <p className="text-sm text-slate-400">Sinh học (sắp ra mắt)</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl opacity-50">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM17 14v8M14 17h6"/>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">0%</p>
              <p className="text-sm text-slate-400">Toán học (sắp ra mắt)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

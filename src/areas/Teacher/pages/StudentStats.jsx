import { useState } from 'react';
import {
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  Target,
  Download,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Mock data
const mockOverview = {
  totalStudents: 156,
  activeThisWeek: 89,
  avgCompletion: 78.5,
  avgTime: 28
};

const mockStudentActivity = [
  { day: 'T2', students: 45, lessons: 120 },
  { day: 'T3', students: 52, lessons: 145 },
  { day: 'T4', students: 48, lessons: 132 },
  { day: 'T5', students: 61, lessons: 168 },
  { day: 'T6', students: 72, lessons: 195 },
  { day: 'T7', students: 85, lessons: 220 },
  { day: 'CN', students: 68, lessons: 180 },
];

const mockTopStudents = [
  { id: 1, name: 'Nguyễn Văn A', grade: 10, lessonsCompleted: 45, avgScore: 92, lastActive: '2 giờ trước' },
  { id: 2, name: 'Trần Thị B', grade: 10, lessonsCompleted: 42, avgScore: 88, lastActive: '5 giờ trước' },
  { id: 3, name: 'Lê Minh C', grade: 9, lessonsCompleted: 38, avgScore: 85, lastActive: 'Hôm qua' },
  { id: 4, name: 'Phạm Hồng D', grade: 9, lessonsCompleted: 35, avgScore: 90, lastActive: 'Hôm qua' },
  { id: 5, name: 'Hoàng Văn E', grade: 10, lessonsCompleted: 32, avgScore: 78, lastActive: '2 ngày trước' },
];

const StatCard = ({ title, value, suffix, change, icon: Icon, color }) => (
  <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-sm font-medium ${change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {change > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          <span>{Math.abs(change)}%</span>
        </div>
      )}
    </div>
    <p className="text-3xl font-bold text-white mb-1">
      {value}{suffix && <span className="text-lg text-slate-400">{suffix}</span>}
    </p>
    <p className="text-sm text-slate-400">{title}</p>
  </div>
);

const StudentStats = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [searchQuery, setSearchQuery] = useState('');

  const maxStudents = Math.max(...mockStudentActivity.map(d => d.students));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Thống kê học sinh</h1>
          <p className="text-slate-400 text-sm mt-1">Theo dõi hoạt động học tập của học sinh</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng học sinh"
          value={mockOverview.totalStudents}
          change={12}
          icon={Users}
          color="from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Hoạt động tuần này"
          value={mockOverview.activeThisWeek}
          change={8}
          icon={TrendingUp}
          color="from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Tỷ lệ hoàn thành TB"
          value={mockOverview.avgCompletion}
          suffix="%"
          change={5}
          icon={Target}
          color="from-amber-500 to-orange-600"
        />
        <StatCard
          title="Thời gian học TB"
          value={mockOverview.avgTime}
          suffix=" phút"
          change={-3}
          icon={Clock}
          color="from-violet-500 to-purple-600"
        />
      </div>

      {/* Activity Chart */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Hoạt động học tập</h3>
            <p className="text-sm text-slate-400">Số học sinh hoạt động theo ngày</p>
          </div>
        </div>

        <div className="flex items-end justify-between h-48 gap-2">
          {mockStudentActivity.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center gap-1 h-40 justify-end">
                <div
                  className="w-full max-w-10 bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t-lg transition-all hover:from-emerald-500 hover:to-teal-400"
                  style={{ height: `${(item.students / maxStudents) * 100}%` }}
                  title={`${item.students} học sinh`}
                ></div>
              </div>
              <span className="text-xs text-slate-500 font-medium">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Students Table */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-white">Học sinh tích cực</h3>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm học sinh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Học sinh</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Lớp</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Bài hoàn thành</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Điểm TB</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Hoạt động</th>
              </tr>
            </thead>
            <tbody>
              {mockTopStudents.map((student, index) => (
                <tr
                  key={student.id}
                  className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-400">#{index + 1}</span>
                      </div>
                      <span className="text-sm text-white">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm text-slate-300">Lớp {student.grade}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm text-white">{student.lessonsCompleted}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-sm font-medium ${
                      student.avgScore >= 85 ? 'text-emerald-400' :
                      student.avgScore >= 70 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {student.avgScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-slate-500">{student.lastActive}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentStats;

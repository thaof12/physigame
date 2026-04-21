import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  FileQuestion,
  Clock,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Award,
  Atom,
  Beaker
} from 'lucide-react';

const mockMonthlyData = [
  { month: 'T1', users: 850, lessons: 12500, exercises: 28000 },
  { month: 'T2', users: 920, lessons: 14200, exercises: 31500 },
  { month: 'T3', users: 1050, lessons: 16800, exercises: 38200 },
];

const mockTopPerformers = [
  { id: 1, name: 'Nguyễn Văn A', score: 98, lessons: 52, exercises: 145 },
  { id: 2, name: 'Trần Thị B', score: 96, lessons: 48, exercises: 138 },
  { id: 3, name: 'Lê Minh C', score: 95, lessons: 45, exercises: 132 },
  { id: 4, name: 'Phạm Hồng D', score: 94, lessons: 43, exercises: 128 },
  { id: 5, name: 'Hoàng Văn E', score: 93, lessons: 41, exercises: 125 },
];

const AdminStatistics = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const overviewStats = [
    { label: 'Người dùng mới', value: 342, change: 12.5, up: true, icon: Users, color: 'from-indigo-500 to-violet-600' },
    { label: 'Bài học được xem', value: '18.5K', change: 8.3, up: true, icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
    { label: 'Bài tập hoàn thành', value: '42.3K', change: 15.2, up: true, icon: FileQuestion, color: 'from-blue-500 to-orange-600' },
    { label: 'Thời gian học TB', value: '32 phút', change: 3.1, up: false, icon: Clock, color: 'from-rose-500 to-pink-600' }
  ];

  const subjectStats = [
    { subject: 'Vật lý', icon: Atom, color: 'from-cyan-500 to-blue-600', users: 1248, lessons: 156, exercises: 432, completion: 78 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Thống kê</h1>
          <p className="text-slate-400 text-sm mt-1">Phân tích dữ liệu hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
          >
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
            <option value="1y">1 năm qua</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white text-sm font-medium">
            <Download className="w-4 h-4" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>{stat.change}%</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Xu hướng theo tháng</h3>
          <div className="space-y-4">
            {mockMonthlyData.map((data, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-sm text-slate-400 w-8">{data.month}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      style={{ width: `${(data.users / 1200) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-400 w-16">{data.users} users</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-violet-500 rounded"></div>
              <span className="text-xs text-slate-400">Người dùng</span>
            </div>
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Phân bố theo môn học</h3>
          <div className="space-y-4">
            {subjectStats.map((subject, index) => {
              const Icon = subject.icon;
              return (
                <div key={index} className="bg-slate-800/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${subject.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-white">{subject.subject}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <p className="text-lg font-bold text-white">{subject.users}</p>
                      <p className="text-xs text-slate-500">Người dùng</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{subject.lessons}</p>
                      <p className="text-xs text-slate-500">Bài học</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{subject.exercises}</p>
                      <p className="text-xs text-slate-500">Bài tập</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-400">{subject.completion}%</p>
                      <p className="text-xs text-slate-500">Hoàn thành</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Top học sinh xuất sắc</h3>
          <button className="text-sm text-indigo-400 hover:text-indigo-300">Xem tất cả</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Học sinh</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Điểm TB</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Bài học</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Bài tập</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {mockTopPerformers.map((student, index) => (
                <tr key={student.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-bold ${
                      index === 0 ? 'bg-blue-500/20 text-blue-400' :
                      index === 1 ? 'bg-slate-400/20 text-slate-300' :
                      index === 2 ? 'bg-cyan-500/20 text-orange-400' :
                      'bg-slate-700/50 text-slate-400'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{student.name[0]}</span>
                      </div>
                      <span className="text-sm font-medium text-white">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-400 font-semibold">{student.score}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-400">{student.lessons}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-400">{student.exercises}</span>
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

export default AdminStatistics;



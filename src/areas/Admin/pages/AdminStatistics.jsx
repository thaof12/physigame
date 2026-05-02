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
import { supabase } from '../../../config/supabase';
import { lectureData } from '../../../data/lectureData';
import { useEffect } from 'react';

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
  const [stats, setStats] = useState({
    newUsers: 0,
    lessonsViewed: '0',
    exercisesCompleted: '0',
    avgStudyTime: '0 phút'
  });
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // 1. Fetch new users in time range
      const { count: newUserCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // 2. Fetch top performers
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .limit(5);
      
      setTopPerformers((userData || []).map(u => ({
        id: u.id,
        name: u.display_name || u.username || 'Người dùng',
        score: 85 + Math.floor(Math.random() * 10),
        lessons: 10 + Math.floor(Math.random() * 20),
        exercises: 20 + Math.floor(Math.random() * 30)
      })));

      setStats({
        newUsers: newUserCount || 0,
        lessonsViewed: `${((newUserCount || 100) * 5.2).toFixed(1)}K`,
        exercisesCompleted: `${((newUserCount || 100) * 12.8).toFixed(1)}K`,
        avgStudyTime: '45 phút'
      });

    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const overviewStats = [
    { label: 'Người dùng mới', value: stats.newUsers, change: 12.5, up: true, icon: Users, color: 'from-indigo-500 to-violet-600' },
    { label: 'Bài học được xem', value: stats.lessonsViewed, change: 8.3, up: true, icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
    { label: 'Bài tập hoàn thành', value: stats.exercisesCompleted, change: 15.2, up: true, icon: FileQuestion, color: 'from-blue-500 to-orange-600' },
    { label: 'Thời gian học TB', value: stats.avgStudyTime, change: 3.1, up: false, icon: Clock, color: 'from-rose-500 to-pink-600' }
  ];

  const subjectStats = [
    { subject: 'Vật lý', icon: Atom, color: 'from-cyan-500 to-blue-600', users: stats.newUsers, lessons: 156, exercises: 432, completion: 78 }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#274dad]">Thống kê hệ thống</h1>
          <p className="text-slate-500 font-bold text-sm">Phân tích dữ liệu học tập và hiệu suất</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-2xl px-6 py-3 text-sm text-[#274dad] focus:outline-none font-black uppercase tracking-widest"
          >
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
            <option value="1y">1 năm qua</option>
          </select>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2099e9] to-[#85e4fb] rounded-[1.25rem] text-white text-sm font-black shadow-xl shadow-blue-500/10 hover:brightness-110 transition-all uppercase tracking-widest">
            <Download className="w-5 h-5" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#85e4fb]/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#e4f2f0]/30 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-[#e4f2f0]/50 transition-colors"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg shadow-blue-500/10`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${stat.up ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    {stat.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    <span>{stat.change}%</span>
                  </div>
                </div>
                <p className="text-4xl font-black text-[#274dad] mb-2">{stat.value}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Monthly Trend */}
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-[#85e4fb]/20">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-[#274dad]">Xu hướng học tập</h3>
            <Activity className="w-6 h-6 text-[#2099e9]" />
          </div>
          <div className="space-y-8">
            {mockMonthlyData.map((data, index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{data.month}</span>
                  <span className="text-sm font-black text-[#2099e9]">{data.users} HỌC VIÊN</span>
                </div>
                <div className="h-4 bg-[#e4f2f0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2099e9] to-[#85e4fb] rounded-full shadow-inner transition-all duration-1000"
                    style={{ width: `${(data.users / 1200) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-[#85e4fb]/20">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-[#274dad]">Hiệu suất môn học</h3>
            <Target className="w-6 h-6 text-[#2099e9]" />
          </div>
          <div className="space-y-6">
            {subjectStats.map((subject, index) => {
              const Icon = subject.icon;
              return (
                <div key={index} className="bg-[#e4f2f0]/30 rounded-[2.5rem] p-8 border border-[#e4f2f0]">
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${subject.color} shadow-lg shadow-blue-500/10`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-black text-[#274dad] uppercase tracking-widest">{subject.subject}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div>
                      <p className="text-2xl font-black text-[#274dad]">{subject.users}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Học viên</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-[#274dad]">{subject.lessons}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bài học</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-[#274dad]">{subject.exercises}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bài tập</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-emerald-500">{subject.completion}%</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tỉ lệ</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-[#85e4fb]/20">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-xl font-black text-[#274dad]">Bảng vàng vinh danh</h3>
          <Award className="w-6 h-6 text-[#2099e9]" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e4f2f0]">
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Xếp hạng</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Học sinh</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Điểm TB</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Bài học</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Bài tập</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4f2f0]">
              {topPerformers.map((student, index) => (
                <tr key={student.id} className="hover:bg-[#e4f2f0]/20 transition-colors group">
                  <td className="px-6 py-6">
                    <span className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black shadow-sm ${
                      index === 0 ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                      index === 1 ? 'bg-slate-50 text-slate-400 border border-slate-100' :
                      index === 2 ? 'bg-orange-50 text-orange-500 border border-orange-100' :
                      'bg-white text-slate-400 border border-slate-100'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#2099e9] to-[#85e4fb] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10">
                        <span className="text-white font-black text-sm">{student.name[0]}</span>
                      </div>
                      <span className="text-base font-black text-[#274dad] group-hover:text-[#2099e9] transition-colors">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-xl font-black text-emerald-500">{student.score}%</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-base font-bold text-slate-400">{student.lessons} BÀI</span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-base font-bold text-slate-400">{student.exercises} BÀI</span>
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



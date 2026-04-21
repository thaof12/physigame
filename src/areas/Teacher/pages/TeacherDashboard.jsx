import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherAuth } from '../contexts/TeacherAuthContext';
import {
  BookOpen,
  FileQuestion,
  FlaskConical,
  Users,
  TrendingUp,
  Clock,
  Eye,
  Target,
  ArrowUpRight,
  ChevronRight,
  Calendar,
  RefreshCw,
  Download,
  PlusCircle,
  Zap,
  Award
} from 'lucide-react';

// Mock data - Replace with real API calls
const mockStats = {
  lessonsCreated: 12,
  exercisesCreated: 45,
  experimentsCreated: 5,
  totalStudents: 156,
  totalViews: 2340,
  averageCompletion: 78.5
};

const mockRecentActivity = [
  { id: 1, type: 'lesson', title: 'Định luật Ôm', views: 45, date: '2 giờ trước' },
  { id: 2, type: 'exercise', title: 'Bài tập điện học', submissions: 23, date: '5 giờ trước' },
  { id: 3, type: 'experiment', title: 'TN Đo điện trở', views: 18, date: 'Hôm qua' },
  { id: 4, type: 'lesson', title: 'Chuyển động thẳng đều', views: 67, date: '2 ngày trước' },
];

const mockTopContent = [
  { id: 1, title: 'Định luật Newton', type: 'Bài học', views: 520, completion: 92 },
  { id: 2, title: 'Quiz Điện học', type: 'Bài tập', views: 380, completion: 85 },
  { id: 3, title: 'TN Con lắc đơn', type: 'Thí nghiệm', views: 290, completion: 88 },
  { id: 4, title: 'Lực đẩy Archimedes', type: 'Bài học', views: 245, completion: 79 },
];

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700/50 transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {change && (
        <div className="flex items-center gap-1 text-sm font-medium text-emerald-400">
          <ArrowUpRight className="w-4 h-4" />
          <span>{change}%</span>
        </div>
      )}
    </div>
    <p className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</p>
    <p className="text-sm text-slate-400">{title}</p>
  </div>
);

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { teacher } = useTeacherAuth();
  const [stats, setStats] = useState(mockStats);
  const [recentActivity, setRecentActivity] = useState(mockRecentActivity);
  const [topContent, setTopContent] = useState(mockTopContent);
  const [loading, setLoading] = useState(false);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'lesson': return BookOpen;
      case 'exercise': return FileQuestion;
      case 'experiment': return FlaskConical;
      default: return BookOpen;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'lesson': return 'from-blue-500 to-indigo-600';
      case 'exercise': return 'from-amber-500 to-orange-600';
      case 'experiment': return 'from-violet-500 to-purple-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Xin chào, {teacher?.displayName || 'Giáo viên'}!
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Đây là tổng quan hoạt động của bạn trên PhysiGame
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            className={`flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors ${loading ? 'animate-pulse' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-sm">Làm mới</span>
          </button>
          <button
            onClick={() => navigate('/teacher/create')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-medium hover:from-emerald-500 hover:to-teal-500 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Tạo mới</span>
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Bài học đã tạo"
          value={stats.lessonsCreated}
          change={12}
          icon={BookOpen}
          color="from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Bài tập đã tạo"
          value={stats.exercisesCreated}
          change={8}
          icon={FileQuestion}
          color="from-amber-500 to-orange-600"
        />
        <StatCard
          title="Thí nghiệm đã tạo"
          value={stats.experimentsCreated}
          icon={FlaskConical}
          color="from-violet-500 to-purple-600"
        />
        <StatCard
          title="Học sinh sử dụng"
          value={stats.totalStudents}
          change={15}
          icon={Users}
          color="from-rose-500 to-pink-600"
        />
      </div>

      {/* Quick Stats & Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Timeline */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Hoạt động gần đây</h3>
              <p className="text-sm text-slate-400">Nội dung của bạn được truy cập</p>
            </div>
            <button
              onClick={() => navigate('/teacher/my-lessons')}
              className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentActivity.map((item) => {
              const Icon = getActivityIcon(item.type);
              const colorClass = getActivityColor(item.type);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${colorClass}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        {item.views ? `${item.views} lượt xem` : `${item.submissions} nộp bài`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">{item.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Thống kê nhanh</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Eye className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-white">Tổng lượt xem</p>
                  <p className="text-xs text-slate-500">Tuần này</p>
                </div>
              </div>
              <p className="text-lg font-bold text-white">{stats.totalViews.toLocaleString()}</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Target className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-white">Tỷ lệ hoàn thành</p>
                  <p className="text-xs text-slate-500">Trung bình</p>
                </div>
              </div>
              <p className="text-lg font-bold text-white">{stats.averageCompletion}%</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/20 rounded-lg">
                  <Zap className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-white">Nội dung hoạt động</p>
                  <p className="text-xs text-slate-500">Đang được sử dụng</p>
                </div>
              </div>
              <p className="text-lg font-bold text-white">
                {stats.lessonsCreated + stats.exercisesCreated + stats.experimentsCreated}
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/20 rounded-lg">
                  <Award className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <p className="text-sm text-white">Đánh giá</p>
                  <p className="text-xs text-slate-500">Từ học sinh</p>
                </div>
              </div>
              <p className="text-lg font-bold text-white">4.8/5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Content */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Nội dung nổi bật</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white bg-slate-800/50 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Nội dung</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Loại</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Lượt xem</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Hoàn thành</th>
              </tr>
            </thead>
            <tbody>
              {topContent.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-500">#{index + 1}</span>
                      <span className="text-sm text-white">{item.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${
                      item.type === 'Bài học' ? 'bg-emerald-500/20 text-emerald-400' :
                      item.type === 'Bài tập' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-violet-500/20 text-violet-400'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-white">{item.views.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                          style={{ width: `${item.completion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-emerald-400">{item.completion}%</span>
                    </div>
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

export default TeacherDashboard;

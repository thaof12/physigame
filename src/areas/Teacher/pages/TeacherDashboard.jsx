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
  Award,
  Search,
  MoreVertical,
  Bell,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../../../config/api';

const mockStats = {
  lessonsCreated: 0,
  exercisesCreated: 0,
  experimentsCreated: 0,
  totalStudents: 0,
  totalViews: 0,
  averageCompletion: 0
};

const mockNotifications = [
  { id: 1, title: 'Báo cáo tuần mới', desc: 'Dữ liệu tuần qua đã sẵn sàng.', time: '10:00 AM' },
  { id: 2, title: 'Học sinh phản hồi', desc: 'Có 5 câu hỏi mới về Bài tập Chương 2.', time: '09:30 AM' },
];

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100 hover:shadow-md transition-all group">
    <div className="flex items-start justify-between mb-5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {change && (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full text-xs font-black text-emerald-600">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+{change}%</span>
        </div>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-3xl font-black text-slate-900 mb-1">{value !== undefined ? value.toLocaleString() : 0}</p>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</p>
    </div>
  </div>
);

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { teacher } = useTeacherAuth();
  const [stats, setStats] = useState(mockStats);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    if (!teacher?.id) return;
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await api.get(`/users/teacher-stats/${teacher.id}`);
      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
      }

      // 2. Fetch notifications
      const notifRes = await api.get(`/classes/teacher/${teacher.id}/notifications`);
      if (notifRes.data?.success) {
        setNotifications((notifRes.data.notifications || []).slice(0, 3));
      }

      // 3. Fetch Lessons and Challenges to build a dynamic "Recent Activity" list
      const [lessonsRes, challengesRes] = await Promise.all([
        api.get(`/lessons?teacherId=${teacher.id}`),
        api.get(`/challenges?teacherId=${teacher.id}`)
      ]);

      const combined = [
        ...(Array.isArray(lessonsRes.data) ? lessonsRes.data : []).map(l => ({
          id: l.id,
          type: 'lesson',
          title: l.title,
          views: l.views || 0,
          date: l.created_at ? new Date(l.created_at).toLocaleDateString('vi-VN') : 'Mới đây',
          status: l.status === 'published' ? 'active' : 'pending'
        })),
        ...(Array.isArray(challengesRes.data) ? challengesRes.data : []).map(c => ({
          id: c.id,
          type: c.category === 'experiment' ? 'experiment' : 'exercise',
          title: c.name,
          views: c.views_count || 0,
          date: c.created_at ? new Date(c.created_at).toLocaleDateString('vi-VN') : 'Mới đây',
          status: 'active'
        }))
      ];

      // Sort by date/id descending, limit to 4
      setRecentActivity(combined.slice(0, 4));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [teacher]);

  const refreshData = () => {
    fetchDashboardData();
  };

  return (
    <div className="space-y-10 pb-20">
      

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <StatCard
          title="Bài giảng Học viện"
          value={stats.lessonsCreated}
          change={15}
          icon={BookOpen}
          color="bg-gradient-to-br from-indigo-500 to-violet-600"
        />
        <StatCard
          title="Số lượng Bài tập"
          value={stats.exercisesCreated}
          change={22}
          icon={FileQuestion}
          color="bg-gradient-to-br from-blue-500 to-cyan-600"
        />
        <StatCard
          title="Học sinh Theo dõi"
          value={stats.totalStudents}
          change={12}
          icon={Users}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Lượt xem Nội dung"
          value={stats.totalViews}
          change={42}
          icon={Eye}
          color="bg-gradient-to-br from-amber-500 to-orange-600"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
        
        {/* Main Activity Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Activity List */}
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">Hoạt động Gần đây</h3>
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Luồng dữ liệu thời gian thực</p>
              </div>
              <button className="p-3 bg-slate-50 rounded-xl text-slate-500 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {recentActivity.length === 0 ? (
                <div className="py-10 text-center text-slate-400 font-bold">
                  Chưa có hoạt động nào gần đây. Hãy soạn thêm nội dung mới!
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 rounded-3xl transition-all border border-slate-100/50 hover:border-slate-200 group cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white shadow-md ${
                        activity.type === 'lesson' ? 'text-indigo-600' : 
                        activity.type === 'exercise' ? 'text-blue-600' : 'text-cyan-600'
                      }`}>
                        {activity.type === 'lesson' ? <BookOpen className="w-6 h-6" /> : 
                         activity.type === 'exercise' ? <FileQuestion className="w-6 h-6" /> : <FlaskConical className="w-6 h-6" />}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{activity.title}</h4>
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {activity.views} lượt xem
                          </span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {activity.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         activity.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                       }`}>
                          {activity.status === 'active' ? 'Hoạt động' : 'Bản nháp'}
                       </span>
                       <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-all" />
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button className="w-full mt-10 py-5 bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl font-black text-sm hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
               Xem Tất Cả Hoạt Động
            </button>
          </div>

        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8 lg:space-y-10">
          
          {/* Quick Stats Mini */}
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-8">Vật Lý Chỉ Số</h3>
            <div className="space-y-8">
              {[
                { label: 'Tỷ lệ Hoàn thành', value: stats.averageCompletion + '%', icon: Target, color: 'text-indigo-600' },
                { label: 'Chất lượng Giảng dạy', value: '4.9/5.0', icon: Award, color: 'text-amber-500' },
                { label: 'Năng suất Tuần', value: 'Cao', icon: TrendingUp, color: 'text-blue-600' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                      <p className="text-lg font-black text-slate-900">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-gradient-to-br from-indigo-600 to-slate-900 rounded-[3rem] p-10 shadow-xl shadow-indigo-500/10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black">Thông báo Mới</h3>
                <Bell className="w-6 h-6 text-indigo-300" />
              </div>
              
              <div className="space-y-6">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-indigo-200 font-bold text-xs">
                    Chưa có thông báo mới nào.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/5 hover:bg-white/20 transition-all cursor-pointer group">
                      <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">
                        {new Date(notif.created_at).toLocaleDateString('vi-VN')} {new Date(notif.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <h4 className="font-bold text-sm mb-1 group-hover:text-indigo-200 transition-colors">{notif.title}</h4>
                      <p className="text-xs text-white/60 leading-relaxed font-semibold">{notif.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Calendar Placeholder */}
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900">Lịch Học Thuật</h3>
                <Calendar className="w-6 h-6 text-indigo-600" />
             </div>
             <div className="flex flex-col items-center justify-center py-10 space-y-4 border-2 border-dashed border-slate-100 rounded-[2rem]">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-400">Không có sự kiện sắp tới</p>
                <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-black text-xs hover:brightness-110 transition-all shadow-md shadow-indigo-500/10">
                  Thêm Sự Kiện
                </button>
             </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default TeacherDashboard;



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

const mockStats = {
  lessonsCreated: 24,
  exercisesCreated: 156,
  experimentsCreated: 8,
  totalStudents: 1240,
  totalViews: 15420,
  averageCompletion: 84.5
};

const mockRecentActivity = [
  { id: 1, type: 'lesson', title: 'Định luật Vạn vật hấp dẫn', views: 124, date: '15 phút trước', status: 'active' },
  { id: 2, type: 'exercise', title: 'Kiểm tra Chương: Cơ học', submissions: 45, date: '1 giờ trước', status: 'pending' },
  { id: 3, type: 'experiment', title: 'Mô phỏng Chuyển động tròn', views: 89, date: '3 giờ trước', status: 'active' },
  { id: 4, type: 'lesson', title: 'Nhiệt học đại cương', views: 256, date: 'Hôm qua', status: 'active' },
];

const mockNotifications = [
  { id: 1, title: 'Báo cáo tuần mới', desc: 'Dữ liệu tuần qua đã sẵn sàng.', time: '10:00 AM' },
  { id: 2, title: 'Học sinh phản hồi', desc: 'Có 5 câu hỏi mới về Bài tập Chương 2.', time: '09:30 AM' },
];

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-[#274dad]/5 border border-[#85e4fb]/10 hover:shadow-blue-500/10 transition-all group">
    <div className="flex items-start justify-between mb-6">
      <div className={`p-4 rounded-2xl ${color} shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {change && (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#e4f2f0] rounded-full text-xs font-black text-[#2099e9]">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+{change}%</span>
        </div>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-4xl font-black text-[#274dad]">{value.toLocaleString()}</p>
      <p className="text-sm font-bold text-slate-400 tracking-tight">{title}</p>
    </div>
  </div>
);

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { teacher } = useTeacherAuth();
  const [stats, setStats] = useState(mockStats);
  const [loading, setLoading] = useState(false);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-r from-[#2099e9] to-[#274dad] p-10 lg:p-14 shadow-2xl shadow-blue-900/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#85e4fb]/10 rounded-full -ml-20 -mb-20 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[#85e4fb] text-xs font-black uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5" />
              <span>Học viện đang hoạt động tốt</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
              Chào mừng, {teacher?.displayName?.split(' ')?.[0] || 'Giáo viên'}!
            </h1>
            <p className="text-white/70 text-lg max-w-xl font-medium">
              Hôm nay là một ngày tuyệt vời để chia sẻ kiến thức vật lý. Hệ thống đã tự động cập nhật báo cáo mới nhất cho bạn.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
              onClick={refreshData}
              className={`p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all ${loading ? 'animate-spin' : ''}`}
             >
                <RefreshCw className="w-6 h-6" />
             </button>
             <button 
              onClick={() => navigate('/teacher/create')}
              className="px-8 py-4 bg-white text-[#274dad] rounded-2xl font-black text-lg shadow-xl shadow-black/10 hover:shadow-white/20 hover:-translate-y-1 transition-all flex items-center gap-3"
             >
                <PlusCircle className="w-6 h-6" />
                Soạn Bài Giảng
             </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <StatCard
          title="Bài giảng Học viện"
          value={stats.lessonsCreated}
          change={15}
          icon={BookOpen}
          color="bg-[#2099e9]"
        />
        <StatCard
          title="Số lượng Bài tập"
          value={stats.exercisesCreated}
          change={22}
          icon={FileQuestion}
          color="bg-[#44b5d7]"
        />
        <StatCard
          title="Học sinh Theo dõi"
          value={stats.totalStudents}
          change={12}
          icon={Users}
          color="bg-[#274dad]"
        />
        <StatCard
          title="Lượt xem Nội dung"
          value={stats.totalViews}
          change={42}
          icon={Eye}
          color="bg-[#85e4fb]"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
        
        {/* Main Activity Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Activity List */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-[#274dad]/5 border border-[#85e4fb]/10">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-[#274dad]">Hoạt động Gần đây</h3>
                <p className="text-sm font-bold text-slate-400 italic">Luồng dữ liệu thời gian thực</p>
              </div>
              <button className="p-3 bg-[#e4f2f0] rounded-xl text-[#2099e9] hover:bg-[#2099e9] hover:text-white transition-all">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-6 bg-[#e4f2f0]/30 hover:bg-[#e4f2f0]/60 rounded-3xl transition-all border-2 border-transparent hover:border-[#85e4fb]/30 group cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white shadow-lg shadow-blue-500/5 ${
                      activity.type === 'lesson' ? 'text-[#2099e9]' : 
                      activity.type === 'exercise' ? 'text-[#44b5d7]' : 'text-[#85e4fb]'
                    }`}>
                      {activity.type === 'lesson' ? <BookOpen className="w-6 h-6" /> : 
                       activity.type === 'exercise' ? <FileQuestion className="w-6 h-6" /> : <FlaskConical className="w-6 h-6" />}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-[#274dad] text-lg group-hover:text-[#2099e9] transition-colors">{activity.title}</h4>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {activity.views || activity.submissions} {activity.views ? 'lượt xem' : 'nộp bài'}
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
                       activity.status === 'active' ? 'bg-[#2099e9]/10 text-[#2099e9]' : 'bg-blue-500/10 text-blue-500'
                     }`}>
                        {activity.status === 'active' ? 'Đã duyệt' : 'Chờ duyệt'}
                     </span>
                     <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#2099e9] transition-all" />
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-10 py-5 bg-[#e4f2f0] text-[#274dad] rounded-2xl font-black text-sm hover:bg-[#2099e9] hover:text-white transition-all shadow-sm">
               Xem Tất Cả Hoạt Động
            </button>
          </div>

        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8 lg:space-y-10">
          
          {/* Quick Stats Mini */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-[#274dad]/5 border border-[#85e4fb]/10">
            <h3 className="text-xl font-black text-[#274dad] mb-8">Vật Lý Chỉ Số</h3>
            <div className="space-y-8">
              {[
                { label: 'Tỷ lệ Hoàn thành', value: stats.averageCompletion + '%', icon: Target, color: 'text-[#2099e9]' },
                { label: 'Chất lượng Giảng dạy', value: '4.9/5.0', icon: Award, color: 'text-[#85e4fb]' },
                { label: 'Năng suất Tuần', value: 'Cao', icon: TrendingUp, color: 'text-[#44b5d7]' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#e4f2f0] rounded-xl">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                      <p className="text-lg font-black text-[#274dad]">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-[#274dad] rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black">Thông báo Mới</h3>
                <Bell className="w-6 h-6 text-[#85e4fb]" />
              </div>
              
              <div className="space-y-6">
                {mockNotifications.map((notif) => (
                  <div key={notif.id} className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/20 transition-all cursor-pointer group">
                    <p className="text-[10px] font-black text-[#85e4fb] uppercase tracking-widest mb-1">{notif.time}</p>
                    <h4 className="font-bold text-sm mb-1 group-hover:text-[#85e4fb] transition-colors">{notif.title}</h4>
                    <p className="text-xs text-white/60 leading-relaxed">{notif.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Calendar Placeholder */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-[#274dad]/5 border border-[#85e4fb]/10">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-[#274dad]">Lịch Học Thuật</h3>
                <Calendar className="w-6 h-6 text-[#2099e9]" />
             </div>
             <div className="flex flex-col items-center justify-center py-10 space-y-4 border-2 border-dashed border-[#e4f2f0] rounded-[2rem]">
                <div className="w-16 h-16 bg-[#e4f2f0] rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-[#274dad]/20" />
                </div>
                <p className="text-sm font-bold text-slate-400">Không có sự kiện sắp tới</p>
                <button className="px-6 py-2 bg-[#2099e9] text-white rounded-xl font-black text-xs hover:bg-[#274dad] transition-all">
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



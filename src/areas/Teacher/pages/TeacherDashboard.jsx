import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherAuth } from '../contexts/TeacherAuthContext';
import {
  BookOpen,
  FileQuestion,
  FlaskConical,
  Clock,
  Eye,
  ChevronRight,
  MoreVertical,
  Bell
} from 'lucide-react';
import api from '../../../config/api';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { teacher } = useTeacherAuth();
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    if (!teacher?.id) return;
    setLoading(true);
    try {
      // 1. Fetch notifications
      const notifRes = await api.get(`/classes/teacher/${teacher.id}/notifications`);
      if (notifRes.data?.success) {
        setNotifications((notifRes.data.notifications || []).slice(0, 3));
      }

      // 2. Fetch Lessons and Challenges to build a dynamic "Recent Activity" list
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

  return (
    <div className="space-y-10 pb-20">
      <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
        
        {/* Main Activity Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Activity List */}
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h3 className="font-heading text-xl font-extrabold text-slate-900">Hoạt động Gần đây</h3>
                <p className="font-body text-xs font-bold text-slate-400 tracking-widest uppercase">Luồng dữ liệu thời gian thực</p>
              </div>
              <button className="p-3 bg-slate-50 rounded-xl text-slate-500 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {recentActivity.length === 0 ? (
                <div className="font-body py-10 text-center text-slate-400 font-bold">
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
                        <h4 className="font-heading font-extrabold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{activity.title}</h4>
                        <div className="font-body flex items-center gap-3 text-xs font-bold text-slate-400">
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
                       <span className={`font-heading px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
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
            
            <button 
              onClick={() => navigate('/teacher/browse')}
              className="font-heading w-full mt-10 py-5 bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl font-extrabold text-sm hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
            >
               Xem Tất Cả Hoạt Động
            </button>
          </div>

        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8 lg:space-y-10">
          
          {/* Notifications */}
          <div className="bg-gradient-to-br from-indigo-600 to-slate-900 rounded-[3rem] p-10 shadow-xl shadow-indigo-500/10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-heading text-xl font-extrabold">Thông báo Mới</h3>
                <Bell className="w-6 h-6 text-indigo-300" />
              </div>
              
              <div className="space-y-6">
                {notifications.length === 0 ? (
                  <div className="font-body p-8 text-center text-indigo-200 font-bold text-xs">
                    Chưa có thông báo mới nào.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/5 hover:bg-white/20 transition-all cursor-pointer group">
                      <p className="font-heading text-[10px] font-extrabold text-indigo-300 uppercase tracking-widest mb-1">
                        {new Date(notif.created_at).toLocaleDateString('vi-VN')} {new Date(notif.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <h4 className="font-heading font-extrabold text-sm mb-1 group-hover:text-indigo-200 transition-colors">{notif.title}</h4>
                      <p className="font-body text-xs text-white/60 leading-relaxed font-bold">{notif.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default TeacherDashboard;

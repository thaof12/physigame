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
  Bell,
  Users,
  UserPlus,
  GraduationCap,
  ArrowRight,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import api from '../../../config/api';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { teacher } = useTeacherAuth();
  const [learningMaterials, setLearningMaterials] = useState(() => {
    try {
      const cached = localStorage.getItem('eureka_teacher_dash_materials_' + (teacher?.id || 'default'));
      return cached ? JSON.parse(cached) : [];
    } catch (e) { return []; }
  });
  const [teacherClasses, setTeacherClasses] = useState(() => {
    try {
      const cached = localStorage.getItem('eureka_teacher_classes_' + (teacher?.id || 'default'));
      return cached ? JSON.parse(cached) : [];
    } catch (e) { return []; }
  });
  const [notifications, setNotifications] = useState(() => {
    try {
      const cached = localStorage.getItem('eureka_teacher_dash_notifs_' + (teacher?.id || 'default'));
      return cached ? JSON.parse(cached) : [];
    } catch (e) { return []; }
  });
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    if (!teacher?.id) return;
    if (learningMaterials.length === 0 && teacherClasses.length === 0) {
      setLoading(true);
    }
    try {
      // 1. Fetch Notifications
      const notifRes = await api.get(`/classes/teacher/${teacher.id}/notifications`).catch(() => ({ data: { success: false } }));
      if (notifRes.data?.success) {
        const freshNotifs = (notifRes.data.notifications || []).slice(0, 4);
        setNotifications(freshNotifs);
        try {
          localStorage.setItem('eureka_teacher_dash_notifs_' + teacher.id, JSON.stringify(freshNotifs));
        } catch (e) {}
      }

      // 2. Fetch Teacher Classes
      const classesRes = await api.get(`/classes/teacher/${teacher.id}`).catch(() => ({ data: { success: false, classes: [] } }));
      if (classesRes.data?.success && Array.isArray(classesRes.data.classes)) {
        setTeacherClasses(classesRes.data.classes);
        try {
          localStorage.setItem('eureka_teacher_classes_' + teacher.id, JSON.stringify(classesRes.data.classes));
        } catch (e) {}
      }

      // 3. Fetch Lessons and Challenges (Học liệu)
      const [lessonsRes, challengesRes] = await Promise.all([
        api.get(`/lessons?teacherId=${teacher.id}`).catch(() => ({ data: [] })),
        api.get(`/challenges?teacherId=${teacher.id}`).catch(() => ({ data: [] }))
      ]);

      const lessons = Array.isArray(lessonsRes.data) ? lessonsRes.data : [];
      const challenges = Array.isArray(challengesRes.data) ? challengesRes.data : [];

      const combinedMaterials = [
        ...lessons.map(l => ({
          id: `les-${l.id}`,
          type: 'lesson',
          title: l.title,
          views: l.views || 0,
          viewsLabel: 'lượt xem',
          date: l.created_at ? new Date(l.created_at).toLocaleDateString('vi-VN') : 'Mới đây',
          status: l.status === 'published' ? 'active' : 'draft',
          statusText: l.status === 'published' ? 'Hoạt động' : 'Bản nháp'
        })),
        ...challenges.map(c => ({
          id: `chal-${c.id}`,
          type: c.category === 'experiment' ? 'experiment' : 'exercise',
          title: c.name,
          views: c.views_count || 0,
          viewsLabel: 'lượt làm',
          date: c.created_at ? new Date(c.created_at).toLocaleDateString('vi-VN') : 'Mới đây',
          status: 'active',
          statusText: 'Hoạt động'
        }))
      ];

      const freshMaterials = combinedMaterials.slice(0, 5);
      setLearningMaterials(freshMaterials);
      try {
        localStorage.setItem('eureka_teacher_dash_materials_' + teacher.id, JSON.stringify(freshMaterials));
      } catch (e) {}
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
    <div className="space-y-8 pb-20 animate-fade-in">
      
      {/* Heading */}
      <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">
        Tổng quan hoạt động
      </h2>

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
        
        {/* Main 2-part content area */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* PART 1: HỌC LIỆU (Learning Content) */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-extrabold text-slate-900">Học liệu</h3>
                      <p className="font-body text-[11px] font-bold text-slate-400">Bài học & Bài tập đã tạo</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {learningMaterials.length} mục
                  </span>
                </div>

                <div className="space-y-3">
                  {learningMaterials.length === 0 ? (
                    <div className="font-body py-10 text-center text-slate-400 font-bold bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-black text-slate-600">Chưa có học liệu nào.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Tạo bài giảng hoặc bài tập mới ngay!</p>
                    </div>
                  ) : (
                    learningMaterials.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => navigate('/teacher/browse')}
                        className="flex items-center justify-between p-4 bg-slate-50/60 hover:bg-indigo-50/60 rounded-2xl transition-all border border-slate-100 hover:border-indigo-200 group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 border border-slate-100 shrink-0 shadow-sm">
                            {item.type === 'lesson' ? <BookOpen className="w-5 h-5" /> : <FileQuestion className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-heading font-extrabold text-slate-900 text-xs md:text-sm group-hover:text-indigo-600 transition-colors truncate">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mt-0.5">
                              <span>{item.views} {item.viewsLabel}</span>
                              <span>•</span>
                              <span>{item.date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            item.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {item.statusText}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={() => navigate('/teacher/browse')}
                className="font-heading w-full mt-6 py-3.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-extrabold text-xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Xem Ngân hàng nội dung</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* PART 2: LỚP HỌC (Classes & Pending Join Requests) */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-extrabold text-slate-900">Lớp học</h3>
                      <p className="font-body text-[11px] font-bold text-slate-400">Danh sách lớp & Yêu cầu duyệt</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    {teacherClasses.length} lớp
                  </span>
                </div>

                <div className="space-y-3">
                  {teacherClasses.length === 0 ? (
                    <div className="font-body py-10 text-center text-slate-400 font-bold bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-black text-slate-600">Chưa có lớp học nào.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Tạo lớp học mới để bắt đầu tiếp nhận học sinh!</p>
                    </div>
                  ) : (
                    teacherClasses.map((cls) => (
                      <div
                        key={cls.id}
                        onClick={() => navigate('/teacher/classes')}
                        className="p-4 bg-slate-50/60 hover:bg-emerald-50/60 rounded-2xl transition-all border border-slate-100 hover:border-emerald-200 group cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-black shrink-0">
                              Khối {cls.grade || 10}
                            </span>
                            <h4 className="font-heading font-extrabold text-slate-900 text-xs md:text-sm group-hover:text-emerald-600 transition-colors truncate">
                              {cls.name}
                            </h4>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>

                        <div className="flex items-center justify-between text-xs font-bold pt-1">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                            <span>{cls.students || 0} học sinh</span>
                          </div>

                          {cls.pendingCount > 0 ? (
                            <span className="flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              {cls.pendingCount} học sinh chờ duyệt
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">
                              Mã: <code className="text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">{cls.code}</code>
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={() => navigate('/teacher/classes')}
                className="font-heading w-full mt-6 py-3.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-extrabold text-xs hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Đến Quản lý Lớp học</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

        {/* Sidebar Widgets (Notifications) */}
        <div className="space-y-8 lg:space-y-10">
          
          <div className="bg-gradient-to-br from-indigo-600 to-slate-900 rounded-[2.5rem] p-8 shadow-xl shadow-indigo-500/10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-lg font-extrabold">Thông báo Mới</h3>
                <Bell className="w-5 h-5 text-indigo-300" />
              </div>
              
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="font-body p-6 text-center text-indigo-200 font-bold text-xs bg-white/5 rounded-2xl border border-white/5">
                    Chưa có thông báo mới nào.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => navigate(notif.target || '/teacher/classes')}
                      className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/5 hover:bg-white/20 transition-all cursor-pointer group space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-heading text-[10px] font-extrabold text-indigo-300 uppercase tracking-widest">
                          {notif.created_at ? `${new Date(notif.created_at).toLocaleDateString('vi-VN')} ${new Date(notif.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : 'Gần đây'}
                        </p>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-300 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h4 className="font-heading font-extrabold text-xs group-hover:text-indigo-200 transition-colors">{notif.title}</h4>
                      <p className="font-body text-xs text-white/70 leading-relaxed">{notif.content}</p>
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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
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
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search
} from 'lucide-react';
import { supabase } from '../../../config/supabase';
import api from '../../../config/api';
import { sendTeacherStatusEmail } from '../../../services/emailService';
import EurekaPremiumLogo from '../../../components/ui/EurekaPremiumLogo';

const mockStats = {
  totalUsers: 14520,
  userGrowth: 18.5,
  totalLessons: 856,
  lessonCompletion: 82.3,
  totalExercises: 2432,
  exerciseUsage: 89.2,
  activeToday: 1240,
  avgSessionTime: 32
};

const mockPendingTeachers = [
  { id: 1, name: 'Lê Minh C', email: 'leminhc@gmail.com', school: 'ĐH Bách Khoa', subject: 'Vật lý Đại cương', date: '2025-03-20' },
  { id: 2, name: 'Trần Văn D', email: 'tranvand@gmail.com', school: 'THPT Chuyên HN', subject: 'Vật lý 12', date: '2025-03-19' },
];

const mockRecentUsers = [
  { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', role: 'student', joinDate: '2025-03-15' },
  { id: 2, name: 'Trần Thị B', email: 'tranthib@gmail.com', role: 'student', joinDate: '2025-03-14' },
  { id: 3, name: 'Phạm Hồng D', email: 'phamhongd@gmail.com', role: 'student', joinDate: '2025-03-13' },
];

const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
  <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-[#274dad]/5 border border-[#85e4fb]/10 hover:shadow-blue-500/10 transition-all group">
    <div className="flex items-start justify-between mb-6">
      <div className={`p-4 rounded-2xl ${color} shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${changeType === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {changeType === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        <span>{change}%</span>
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-3xl font-black text-[#274dad]">{value.toLocaleString()}</p>
      <p className="text-sm font-bold text-slate-400 tracking-tight">{title}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(mockStats);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  const fetchPendingTeachers = async () => {
    setLoading(true);
    console.log('%c📊 [AdminDashboard] Querying schema-validated users table...', 'color: #2099e9; font-weight: bold');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'teacher')
        .eq('teacher_status', 'pending');

      if (error) {
        console.error('❌ [AdminDashboard] Fetch Error:', error.message);
        setPendingTeachers([]);
      } else {
        console.log(`✅ [AdminDashboard] Found ${data?.length || 0} pending teachers`);
        if (data && data.length > 0) {
          console.table(data.map(t => ({ id: t.id, name: t.display_name, email: t.email, status: t.teacher_status })));
          setPendingTeachers(data.map(t => ({
            id: t.id,
            name: t.display_name || t.username || 'Giáo viên',
            email: t.email,
            school: t.teacher_profile?.school || t.profile?.school || 'Chưa cập nhật',
            subject: t.teacher_profile?.subject || t.profile?.subject || 'Vật lý',
            originalData: t
          })));
        } else {
          setPendingTeachers([]);
        }
      }
    } catch (err) {
      console.error('💥 [AdminDashboard] Critical fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (teacher) => {
    setActionLoading(teacher.id);
    try {
      console.log('📡 [AdminDashboard] Elevating approval through backend API...');
      // Use Backend API to bypass RLS
      const response = await api.post(`/users/verify-teacher/${teacher.id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Approval failed');
      }

      await sendTeacherStatusEmail(teacher.email, teacher.name, 'verified');
      await fetchPendingTeachers();
    } catch (err) {
      console.error('Approval failed:', err);
      // Fallback alert or message
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (teacher) => {
    setSelectedTeacher(teacher);
    setRejectionReason('');
    setRejectionModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedTeacher) return;
    
    setActionLoading(selectedTeacher.id);
    setRejectionModalOpen(false);
    
    try {
      console.log('📡 [AdminDashboard] Elevating rejection through backend API...');
      // Use Backend API to bypass RLS
      const response = await api.post(`/users/reject-teacher/${selectedTeacher.id}`, {
        reason: rejectionReason
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Rejection failed');
      }

      await sendTeacherStatusEmail(selectedTeacher.email, selectedTeacher.name, 'rejected', rejectionReason);
      await fetchPendingTeachers();
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setActionLoading(null);
      setSelectedTeacher(null);
    }
  };

  return (
    <div className="space-y-10 pb-20 bg-[#e4f2f0] min-h-screen p-6 lg:p-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
          <EurekaPremiumLogo className="h-10 mb-4 mx-auto md:mx-0" />
          <h1 className="text-4xl font-black text-[#274dad]">Điều Hành Học Viện</h1>
          <p className="text-slate-500 font-bold tracking-tight italic">Trung tâm quản trị hệ thống PhysiGame</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
            onClick={fetchPendingTeachers}
            className={`p-4 bg-white rounded-2xl text-[#2099e9] border border-[#85e4fb]/30 shadow-xl shadow-blue-500/5 hover:bg-[#2099e9] hover:text-white transition-all ${loading ? 'animate-spin' : ''}`}
           >
              <RefreshCw className="w-6 h-6" />
           </button>
           <button className="px-8 py-4 bg-[#2099e9] text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-[#274dad] transition-all flex items-center gap-3">
              <Download className="w-6 h-6" />
              Tải Báo Cáo Tổng
           </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <StatCard
          title="Tổng Nhà Vật Lý"
          value={stats.totalUsers}
          change={stats.userGrowth}
          changeType="up"
          icon={Users}
          color="bg-[#2099e9]"
        />
        <StatCard
          title="Kho Bài Giảng"
          value={stats.totalLessons}
          change={12.4}
          changeType="up"
          icon={BookOpen}
          color="bg-[#44b5d7]"
        />
        <StatCard
          title="Thử Thách Giải Đố"
          value={stats.totalExercises}
          change={stats.exerciseUsage}
          changeType="up"
          icon={FileQuestion}
          color="bg-[#274dad]"
        />
        <StatCard
          title="Năng Lượng Hệ Thống"
          value={stats.activeToday}
          change={24}
          changeType="up"
          icon={Zap}
          color="bg-[#85e4fb]"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
        
        {/* Teacher Approvals Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-[#274dad]/5 border border-[#85e4fb]/20">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-[#274dad]">Duyệt Hồ Sơ Giảng Viên</h3>
                <p className="text-sm font-bold text-slate-400">Yêu cầu tham gia Học viện mới nhất</p>
              </div>
              <div className="p-3 bg-[#e4f2f0] rounded-xl text-[#2099e9]">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>

            {pendingTeachers.length > 0 ? (
              <div className="space-y-6">
                {pendingTeachers.map((teacher) => (
                  <div key={teacher.id} className="p-6 bg-[#e4f2f0]/30 rounded-[2rem] border-2 border-transparent hover:border-[#2099e9]/30 transition-all group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/5 text-[#2099e9] font-black text-xl">
                            {teacher.name[0]}
                         </div>
                         <div className="space-y-1">
                            <h4 className="font-black text-[#274dad] text-lg">{teacher.name}</h4>
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                               <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{teacher.email}</span>
                               <span className="w-1 bg-slate-200 h-3"></span>
                               <span className="flex items-center gap-1 font-black text-[#2099e9] uppercase tracking-widest">{teacher.subject}</span>
                            </div>
                            <p className="text-xs text-slate-500 italic mt-1">{teacher.school}</p>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                         <button 
                          onClick={() => handleApprove(teacher)}
                          disabled={actionLoading === teacher.id}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#2099e9] text-white rounded-xl font-black text-xs hover:bg-emerald-500 transition-all shadow-md shadow-blue-500/10 disabled:opacity-50"
                         >
                            {actionLoading === teacher.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Phê Duyệt
                         </button>
                         <button 
                          onClick={() => openRejectModal(teacher)}
                          disabled={actionLoading === teacher.id}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-rose-500 border border-rose-100 rounded-xl font-black text-xs hover:bg-rose-50 transition-all disabled:opacity-50"
                         >
                            <XCircle className="w-4 h-4" />
                            Từ Chối
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                 <div className="w-20 h-20 bg-[#e4f2f0] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                 </div>
                 <p className="text-xl font-black text-[#274dad]">Tất cả hồ sơ đã được xử lý</p>
                 <p className="text-slate-400 font-bold max-w-xs">Hệ thống đang hoạt động ở trạng thái tối ưu.</p>
              </div>
            )}
          </div>

          {/* User Growth Chart Placeholder */}
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-[#274dad]/5 border border-[#85e4fb]/20">
             <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-[#274dad]">Phát Triển Cộng Đồng</h3>
                <Activity className="w-6 h-6 text-[#2099e9]" />
             </div>
             <div className="h-64 flex items-end justify-between gap-3 px-4">
                {[45, 60, 45, 80, 95, 70, 90, 100, 85, 110, 120, 140].map((h, i) => (
                  <div key={i} className="flex-1 min-w-[20px] bg-[#e4f2f0] rounded-t-xl relative group">
                    <div 
                      className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#2099e9] to-[#85e4fb] rounded-t-xl group-hover:brightness-110 transition-all"
                      style={{ height: `${(h / 140) * 100}%` }}
                    ></div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-10">
           
           {/* System Health */}
           <div className="bg-[#274dad] rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-900/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black">Hệ Thống</h3>
                    <Atom className="w-6 h-6 text-[#85e4fb] animate-spin-slow" />
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                          <span>Uptime</span>
                          <span className="text-[#85e4fb]">99.9%</span>
                       </div>
                       <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#85e4fb] w-[99.9%]"></div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                          <span>Database</span>
                          <span className="text-emerald-400">Stable</span>
                       </div>
                       <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 w-[95%]"></div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Quick Stats Sidebar */}
           <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-[#274dad]/5 border border-[#85e4fb]/20">
              <h3 className="text-xl font-black text-[#274dad] mb-8">Tổng Quan Nhanh</h3>
              <div className="space-y-8">
                 {[
                   { label: 'Học sinh Hoạt động', value: '8.4k', icon: MousePointer, color: 'text-[#2099e9]' },
                   { label: 'Nội dung Phổ biến', value: '450+', icon: BookOpen, color: 'text-[#44b5d7]' },
                   { label: 'Tương tác API', value: '1.2M', icon: Activity, color: 'text-[#274dad]' },
                 ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                       <div className="p-3 bg-[#e4f2f0] rounded-xl">
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                          <p className="text-lg font-black text-[#274dad]">{item.value}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Notifications/Alerts */}
           <div className="p-8 bg-white rounded-[3rem] border-2 border-dashed border-[#e4f2f0] flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-[#e4f2f0] rounded-full flex items-center justify-center text-[#274dad]/20">
                 <AlertCircle className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-400">Không có cảnh báo đỏ</p>
           </div>

        </div>

      </div>

      {/* Rejection Modal */}
      {rejectionModalOpen && selectedTeacher && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#274dad]/20 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-[#85e4fb]/20 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-gradient-to-br from-[#2099e9] to-[#274dad] p-8 text-white">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-black">Từ Chối Hồ Sơ</h3>
                    <button onClick={() => setRejectionModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                       <XCircle className="w-6 h-6" />
                    </button>
                 </div>
                 <p className="font-bold opacity-80 italic">Gửi phản hồi cho giảng viên: <span className="text-white opacity-100">{selectedTeacher.name}</span></p>
              </div>

              <div className="p-8 space-y-6">
                 <div className="space-y-3">
                    <label className="text-sm font-black text-[#274dad] flex items-center gap-2">
                       <Mail className="w-4 h-4" /> Lý do từ chối (Tùy chọn)
                    </label>
                    <textarea 
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Nhập lý do tại đây để giúp giảng viên hoàn thiện hồ sơ hơn... (Nếu để trống, email sẽ không hiển thị phần này)"
                      className="w-full h-40 p-5 bg-[#e4f2f0]/50 border-2 border-transparent focus:border-[#2099e9] focus:bg-white rounded-2xl text-slate-700 font-bold placeholder:text-slate-300 transition-all outline-none resize-none"
                    />
                 </div>

                 <div className="flex gap-4">
                    <button 
                      onClick={() => setRejectionModalOpen(false)}
                      className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                    >
                       Hủy bỏ
                    </button>
                    <button 
                      onClick={handleRejectSubmit}
                      className="flex-[2] py-4 bg-rose-500 text-white rounded-2xl font-black text-sm hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                    >
                       Xác nhận Từ Chối & Gửi Email
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

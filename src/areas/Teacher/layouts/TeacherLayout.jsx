import { useState } from 'react';
import { useNavigate, useLocation, Navigate, Outlet, Link } from 'react-router-dom';
import { useTeacherAuth } from '../contexts/TeacherAuthContext';
import {
  LayoutGrid,
  BookOpen,
  FileQuestion,
  FlaskConical,
  BarChart3,
  Users,
  FolderOpen,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  GraduationCap,
  Menu,
  X,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';
import EurekaPremiumLogo from '../../../components/ui/EurekaPremiumLogo';

const menuItems = [
  {
    id: 'dashboard',
    label: 'Tổng quan',
    icon: LayoutGrid,
    path: '/teacher/dashboard'
  },
  {
    id: 'my-lessons',
    label: 'Bài học của tôi',
    icon: BookOpen,
    path: '/teacher/my-lessons'
  },
  {
    id: 'my-exercises',
    label: 'Bài tập của tôi',
    icon: FileQuestion,
    path: '/teacher/my-exercises'
  },
  {
    id: 'my-experiments',
    label: 'Thí nghiệm của tôi',
    icon: FlaskConical,
    path: '/teacher/my-experiments'
  },
  {
    id: 'browse',
    label: 'Ngân hàng nội dung',
    icon: FolderOpen,
    path: '/teacher/browse'
  },
  {
    id: 'students',
    label: 'Thống kê học sinh',
    icon: BarChart3,
    path: '/teacher/students'
  },
  {
    id: 'classes',
    label: 'Quản lý lớp học',
    icon: Users,
    path: '/teacher/classes'
  },
  {
    id: 'profile',
    label: 'Hồ sơ cá nhân',
    icon: Settings,
    path: '/teacher/profile'
  }
];

const TeacherLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { teacher, logout, isAuthenticated, isVerified, loading } = useTeacherAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#e4f2f0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2099e9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#274dad] font-bold">Đang tải học viện...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to pending page if not verified
  if (!isVerified) {
    return <Navigate to="/teacher/pending" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#e4f2f0] flex font-sans">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#274dad]/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${sidebarCollapsed ? 'w-24' : 'w-72'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-white border-r border-[#85e4fb]/30
        transition-all duration-500 flex flex-col shadow-2xl shadow-[#274dad]/5
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#e4f2f0]">
          {!sidebarCollapsed && (
            <EurekaPremiumLogo className="h-8" />
          )}
          {sidebarCollapsed && (
            <div className="w-10 h-10 bg-[#2099e9] rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-[#e4f2f0] text-[#2099e9] hover:bg-[#2099e9] hover:text-white transition-all shadow-sm translate-x-10"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-[#e4f2f0] text-[#274dad]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action */}
        {!sidebarCollapsed && (
          <div className="p-6">
            <button
              onClick={() => navigate('/teacher/create')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#2099e9] hover:bg-[#274dad] text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-700/30 group"
            >
              <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Tạo nội dung mới
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all
                  ${active
                    ? 'bg-[#2099e9] text-white shadow-lg shadow-blue-500/20 active-nav-glow'
                    : 'text-slate-500 hover:text-[#274dad] hover:bg-[#e4f2f0]/50'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
                title={sidebarCollapsed ? item.label : ''}
              >
                <IconComponent className={`w-5 h-5 shrink-0 ${active ? 'text-white' : ''}`} />
                {!sidebarCollapsed && (
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User info & Logout */}
        <div className="p-6 border-t border-[#e4f2f0]">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 px-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2099e9] to-[#274dad] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 border-2 border-white">
                <span className="text-white font-black text-lg">
                  {teacher?.displayName?.[0] || teacher?.email?.[0] || 'T'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-[#274dad] truncate">{teacher?.displayName || 'Giảng Viên'}</p>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#2099e9]" />
                  <p className="text-[10px] text-[#2099e9] font-black uppercase tracking-widest">Verified</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-4 py-4 rounded-2xl
              text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-bold text-sm
              ${sidebarCollapsed ? 'justify-center px-0 ring-0 bg-transparent' : ''}
            `}
            title={sidebarCollapsed ? 'Đăng xuất' : ''}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span>Đăng xuất hệ thống</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Header */}
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-[#85e4fb]/20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden flex items-center justify-center w-12 h-12 rounded-2xl bg-white text-[#274dad] shadow-sm border border-[#e4f2f0]"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex items-center px-4 py-2.5 bg-[#e4f2f0] rounded-2xl text-[#274dad]">
                <span className="text-xs font-black uppercase tracking-widest">Hàn Lâm Viện Vật Lý</span>
             </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#2099e9] transition-colors" />
              <input
                type="text"
                placeholder="Tìm kiến thức, bài giảng, mô phỏng..."
                className="w-full bg-[#e4f2f0]/50 border-2 border-transparent rounded-2xl pl-12 pr-6 py-3 text-sm text-[#274dad] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2099e9] transition-all font-medium"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white text-[#274dad] hover:bg-[#e4f2f0] transition-all border border-[#e4f2f0] shadow-sm group">
              <Bell className="w-6 h-6 group-hover:shake transition-all" />
              <span className="absolute top-3 right-3 w-3 h-3 bg-[#2099e9] border-2 border-white rounded-full"></span>
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-black text-[#274dad]">{teacher?.displayName || 'Giảng viên'}</p>
              <p className="text-[10px] font-black text-[#2099e9] uppercase tracking-widest">{teacher?.teacherProfile?.subject || 'Vật lý Ứng dụng'}</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-10 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;


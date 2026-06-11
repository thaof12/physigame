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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50
        ${sidebarCollapsed ? 'w-24' : 'w-80'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-white border-r border-[#e2e8f0]/20
        transition-all duration-500 flex flex-col shadow-2xl shadow-[#0f172a]/5
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-[#f8fafc]">
          {!sidebarCollapsed && (
            <span className="font-premium-serif text-4xl font-bold text-slate-900 italic tracking-tighter select-none">
              Eureka
            </span>
          )}
          {sidebarCollapsed && (
            <div className="w-12 h-12 bg-gradient-to-br from-[#0f172a] to-[#4f46e5] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          )}

          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden flex items-center justify-center w-12 h-12 rounded-2xl bg-[#f8fafc] text-[#0f172a]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Action */}
        {!sidebarCollapsed && (
          <div className="p-8">
            <button
              onClick={() => navigate('/teacher/create')}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white rounded-[1.5rem] font-black text-sm transition-all shadow-xl shadow-blue-500/20 hover:brightness-110 group"
            >
              <PlusCircle className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              Tạo nội dung mới
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 mt-6 space-y-2 overflow-hidden">
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
                  w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all
                  ${active
                    ? 'bg-[#4f46e5] text-white shadow-xl shadow-blue-500/20'
                    : 'text-slate-500 hover:text-[#0f172a] hover:bg-[#f8fafc]/50'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
                title={sidebarCollapsed ? item.label : ''}
              >
                <IconComponent className={`w-6 h-6 shrink-0 ${active ? 'text-white' : ''}`} />
                {!sidebarCollapsed && (
                  <span className="font-black text-sm tracking-tight">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User info & Logout */}
        <div className="p-8 border-t border-[#f8fafc]">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-4 px-2 mb-8">
              <div className="w-14 h-14 bg-white border-2 border-[#f8fafc] rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-[#0f172a]/5">
                <span className="text-[#0f172a] font-black text-xl italic">
                  {teacher?.displayName?.[0] || teacher?.email?.[0] || 'T'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-[#4f46e5] uppercase tracking-widest mb-0.5">Giảng Viên</p>
                <p className="text-sm font-black text-[#0f172a] truncate">{teacher?.displayName || 'Giảng Viên'}</p>
                <p className="text-[10px] text-slate-400 font-bold truncate">{teacher?.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem]
              text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-black text-sm
              ${sidebarCollapsed ? 'justify-center px-0 ring-0 bg-transparent' : ''}
            `}
            title={sidebarCollapsed ? 'Đăng xuất' : ''}
          >
            <LogOut className="w-6 h-6 shrink-0" />
            {!sidebarCollapsed && <span>Ngắt Kết Nối</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Header */}
        <header className="h-24 bg-white/70 backdrop-blur-md border-b border-[#e2e8f0]/20 flex items-center justify-between px-8 lg:px-12 sticky top-0 z-30">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden flex items-center justify-center w-14 h-14 rounded-2xl bg-white text-[#0f172a] shadow-sm border border-[#f8fafc]"
          >
            <Menu className="w-7 h-7" />
          </button>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex items-center px-5 py-3 bg-[#4f46e5]/10 rounded-[1.25rem] text-[#0f172a]">
                <span className="text-xs font-black uppercase tracking-widest text-[#0f172a]">Hàn Lâm Viện Vật Lý</span>
             </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-2xl mx-12">
            <div className="relative w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-[#4f46e5] transition-colors" />
              <input
                type="text"
                placeholder="Tìm kiến thức, bài giảng, mô phỏng..."
                className="w-full bg-[#f8fafc]/50 border-2 border-transparent rounded-[1.5rem] pl-16 pr-8 py-4 text-sm text-[#0f172a] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#4f46e5] transition-all font-bold"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-5">
            <button className="relative flex items-center justify-center w-14 h-14 rounded-[1.5rem] bg-white text-[#0f172a] hover:bg-[#f8fafc] transition-all border border-[#f8fafc] shadow-sm group">
              <Bell className="w-7 h-7 group-hover:shake transition-all" />
              <span className="absolute top-4 right-4 w-3.5 h-3.5 bg-[#4f46e5] border-2 border-white rounded-full"></span>
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-black text-[#0f172a]">{teacher?.displayName || 'Giảng viên'}</p>
              <p className="text-[10px] font-black text-[#4f46e5] uppercase tracking-widest">{teacher?.teacherProfile?.subject || 'Vật lý Ứng dụng'}</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 lg:p-12 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};


export default TeacherLayout;


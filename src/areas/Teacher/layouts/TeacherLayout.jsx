import { useState } from 'react';
import { useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
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
  PlusCircle
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải...</p>
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
    <div className="min-h-screen bg-slate-950 flex">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${sidebarCollapsed ? 'w-20' : 'w-72'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50
        transition-all duration-300 flex flex-col
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/50">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-sm">PhysiGame</h1>
                <p className="text-xs text-emerald-400">Teacher Portal</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/50 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Action */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-slate-800/50">
            <button
              onClick={() => navigate('/teacher/create')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-medium text-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Tạo nội dung mới
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                  ${active
                    ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-white border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
                title={sidebarCollapsed ? item.label : ''}
              >
                <IconComponent className={`w-5 h-5 shrink-0 ${active ? 'text-emerald-400' : ''}`} />
                {!sidebarCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User info & Logout */}
        <div className="p-4 border-t border-slate-800/50">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {teacher?.displayName?.[0] || teacher?.email?.[0] || 'T'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{teacher?.displayName || 'Giáo viên'}</p>
                <p className="text-xs text-slate-500 truncate">{teacher?.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-xl
              text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all
              ${sidebarCollapsed ? 'justify-center' : ''}
            `}
            title={sidebarCollapsed ? 'Đăng xuất' : ''}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span className="font-medium text-sm">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/50 text-slate-400"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm kiếm bài học, bài tập..."
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">{teacher?.displayName || 'Giáo viên'}</p>
              <p className="text-xs text-emerald-400">{teacher?.teacherProfile?.subject || 'Vật lý'}</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;

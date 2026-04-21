import { useState } from 'react';
import { useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import {
  LayoutGrid,
  Users,
  BookOpen,
  FileQuestion,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  ShieldCheck,
  GraduationCap,
  Microscope,
  Activity,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutGrid,
    path: '/admin/dashboard'
  },
  {
    id: 'users',
    label: 'Quản lý người dùng',
    icon: Users,
    path: '/admin/users'
  },
  {
    id: 'lessons',
    label: 'Quản lý bài học',
    icon: BookOpen,
    path: '/admin/lessons'
  },
  {
    id: 'exercises',
    label: 'Quản lý bài tập',
    icon: FileQuestion,
    path: '/admin/exercises'
  },
  {
    id: 'statistics',
    label: 'Thống kê',
    icon: BarChart3,
    path: '/admin/statistics'
  },
  {
    id: 'settings',
    label: 'Cài đặt',
    icon: Settings,
    path: '/admin/settings'
  }
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout, isAuthenticated, loading } = useAdminAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
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
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-sm">PhysiGame</h1>
                <p className="text-xs text-slate-500">Admin Panel</p>
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
                    ? 'bg-gradient-to-r from-indigo-600/20 to-violet-600/20 text-white border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
                title={sidebarCollapsed ? item.label : ''}
              >
                <IconComponent className={`w-5 h-5 shrink-0 ${active ? 'text-indigo-400' : ''}`} />
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
                <span className="text-white font-bold text-sm">QT</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{admin?.name}</p>
                <p className="text-xs text-slate-500 truncate">{admin?.email}</p>
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
                placeholder="Tìm kiếm..."
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
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

export default AdminLayout;

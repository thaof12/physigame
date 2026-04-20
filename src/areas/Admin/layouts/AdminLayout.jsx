import { useState } from 'react';
import { useNavigate, useLocation, Navigate, Outlet, Link } from 'react-router-dom';
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
  X,
  PlusCircle,
  ShieldAlert
} from 'lucide-react';
import EurekaPremiumLogo from '../../../components/ui/EurekaPremiumLogo';

const menuItems = [
  {
    id: 'dashboard',
    label: 'Ban Điều Hành',
    icon: LayoutGrid,
    path: '/admin/dashboard'
  },
  {
    id: 'users',
    label: 'Học Viên & GV',
    icon: Users,
    path: '/admin/users'
  },
  {
    id: 'lessons',
    label: 'Bài Giảng',
    icon: BookOpen,
    path: '/admin/lessons'
  },
  {
    id: 'exercises',
    label: 'Thử Thách',
    icon: FileQuestion,
    path: '/admin/exercises'
  },
  {
    id: 'statistics',
    label: 'Đo Lường',
    icon: BarChart3,
    path: '/admin/statistics'
  },
  {
    id: 'settings',
    label: 'Hệ Thống',
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
      <div className="min-h-screen bg-[#e4f2f0] flex items-center justify-center font-sans text-[#274dad]">
        <div className="text-center font-black">
          <div className="w-16 h-16 border-4 border-[#2099e9] border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-xl shadow-blue-500/20"></div>
          <p className="tracking-widest uppercase">Admin System Loading...</p>
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
        ${sidebarCollapsed ? 'w-24' : 'w-80'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-white border-r border-[#85e4fb]/20
        transition-all duration-500 flex flex-col shadow-2xl shadow-[#274dad]/5
      `}>
        {/* Logo */}
        <div className="h-24 flex items-center justify-between px-8 border-b border-[#e4f2f0]">
          {!sidebarCollapsed && (
            <EurekaPremiumLogo className="h-10" />
          )}
          {sidebarCollapsed && (
            <div className="w-12 h-12 bg-gradient-to-br from-[#274dad] to-[#2099e9] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-[#f8fafc] text-[#2099e9] border border-[#e2e8f0] hover:bg-[#2099e9] hover:text-white transition-all shadow-sm translate-x-12"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden flex items-center justify-center w-12 h-12 rounded-2xl bg-[#e4f2f0] text-[#274dad]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Admin Tag */}
        {!sidebarCollapsed && (
          <div className="px-8 mt-8">
             <div className="p-4 bg-gradient-to-r from-[#274dad] to-[#2099e9] rounded-2xl text-white shadow-xl shadow-blue-900/10">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/10 rounded-xl">
                      <ShieldCheck className="w-5 h-5 text-[#85e4fb]" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Privileged</p>
                      <p className="font-black text-xs uppercase tracking-widest">Root Controller</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 mt-8 space-y-2 overflow-y-auto">
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
                    ? 'bg-[#2099e9] text-white shadow-xl shadow-blue-500/20'
                    : 'text-slate-500 hover:text-[#274dad] hover:bg-[#e4f2f0]/50'
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
        <div className="p-8 border-t border-[#e4f2f0]">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-4 px-2 mb-8">
              <div className="w-14 h-14 bg-white border-2 border-[#e4f2f0] rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-[#274dad]/5">
                <span className="text-[#274dad] font-black text-xl italic">QT</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-[#2099e9] uppercase tracking-widest mb-0.5">Admin Account</p>
                <p className="text-sm font-black text-[#274dad] truncate">{admin?.name}</p>
                <p className="text-[10px] text-slate-400 font-bold truncate">{admin?.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem]
              text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-black text-sm
              ${sidebarCollapsed ? 'justify-center px-0 ring-0' : ''}
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
        <header className="h-24 bg-white/70 backdrop-blur-md border-b border-[#85e4fb]/20 flex items-center justify-between px-8 lg:px-12 sticky top-0 z-30">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden flex items-center justify-center w-14 h-14 rounded-2xl bg-white text-[#274dad] shadow-sm border border-[#e4f2f0]"
          >
            <Menu className="w-7 h-7" />
          </button>

          <div className="flex items-center gap-6">
             <div className="hidden lg:flex items-center px-5 py-3 bg-[#e4f2f0] rounded-[1.5rem] text-[#274dad] border border-[#85e4fb]/20 shadow-sm">
                <Activity className="w-4 h-4 mr-2 text-[#2099e9]" />
                <span className="text-xs font-black uppercase tracking-widest">System Health: Optimal</span>
             </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-2xl mx-12">
            <div className="relative w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-[#2099e9] transition-colors" />
              <input
                type="text"
                placeholder="Truy vấn dữ liệu bài học, người dùng, hệ thống..."
                className="w-full bg-[#e4f2f0]/50 border-2 border-transparent rounded-[1.5rem] pl-16 pr-8 py-4 text-sm text-[#274dad] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2099e9] transition-all font-bold"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-5">
            <button className="relative flex items-center justify-center w-14 h-14 rounded-[1.5rem] bg-white text-[#274dad] hover:bg-[#e4f2f0] transition-all border border-[#e4f2f0] shadow-sm group">
              <Bell className="w-7 h-7" />
              <span className="absolute top-4 right-4 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>
            <button className="hidden sm:flex items-center justify-center w-14 h-14 rounded-[1.5rem] bg-white text-[#274dad] hover:bg-[#e4f2f0] transition-all border border-[#e4f2f0] shadow-sm">
              <HelpCircle className="w-7 h-7" />
            </button>
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

export default AdminLayout;

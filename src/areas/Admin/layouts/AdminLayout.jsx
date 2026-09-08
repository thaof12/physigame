import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate, Outlet, Link } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import api from '../../../config/api';
import {
  LayoutGrid,
  Users,
  BookOpen,
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
  ShieldAlert,
  FileText,
  MessageSquare
} from 'lucide-react';

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
    id: 'materials',
    label: 'Học Liệu',
    icon: FileText,
    path: '/admin/hoc-lieu'
  },
  {
    id: 'lessons',
    label: 'Bài Giảng',
    icon: BookOpen,
    path: '/admin/lessons'
  },
  {
    id: 'feedback',
    label: 'Phản Hồi',
    icon: MessageSquare,
    path: '/admin/feedback'
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
  const [reportCount, setReportCount] = useState(() => {
    try {
      const cached = localStorage.getItem('physigame_admin_report_count');
      return cached ? parseInt(cached, 10) : 0;
    } catch (e) { return 0; }
  });

  // Poll report count for sidebar red bell notification
  // Key fix: only update count when API succeeds — never reset to 0 on failure
  useEffect(() => {
    let isMounted = true;
    const fetchReportCount = async () => {
      try {
        const res = await api.get('/reports');
        if (!isMounted) return;
        if (res.data && res.data.success && Array.isArray(res.data.reports)) {
          const count = res.data.reports.length;
          // Only update state if count actually changed — prevent unnecessary re-renders
          setReportCount(prev => {
            if (prev !== count) {
              localStorage.setItem('physigame_admin_report_count', String(count));
              return count;
            }
            return prev;
          });
        }
        // If API fails or returns unexpected shape, keep previous count — don't flash to 0
      } catch (err) {
        // Silent fallback — previous cached count remains displayed
      }
    };

    fetchReportCount();
    const interval = setInterval(fetchReportCount, 12000); // 12s to reduce flicker
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-body text-[#0f172a]">
        <div className="text-center font-heading font-extrabold">
          <div className="w-16 h-16 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-xl shadow-blue-500/20"></div>
          <p className="tracking-widest uppercase">Admin System Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-body">
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
        overflow-y-auto no-scrollbar
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-[#f8fafc] shrink-0">
          {!sidebarCollapsed && (
            <span className="font-premium-serif text-4xl font-bold text-slate-900 italic tracking-tighter select-none">
              Eureka
            </span>
          )}
          {sidebarCollapsed && (
            <div className="w-12 h-12 bg-gradient-to-br from-[#0f172a] to-[#4f46e5] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
              <ShieldAlert className="w-6 h-6 text-white" />
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



        {/* Navigation */}
        <nav className="flex-1 px-4 mt-6 space-y-2 shrink-0">
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
                  w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all relative group
                  ${active
                    ? 'bg-[#4f46e5] text-white shadow-xl shadow-indigo-500/20 font-black'
                    : 'text-slate-700 hover:text-[#4f46e5] hover:bg-indigo-50/60 font-extrabold'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
                title={sidebarCollapsed ? item.label : ''}
              >
                <div className="relative shrink-0">
                  <IconComponent className={`w-6 h-6 shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-[#4f46e5]'}`} />
                  {item.id === 'materials' && reportCount > 0 && sidebarCollapsed && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-gradient-to-r from-rose-600 to-red-600 border-2 border-white items-center justify-center text-[9px] font-black text-white shadow-md">
                        {reportCount > 99 ? '99+' : reportCount}
                      </span>
                    </span>
                  )}
                </div>

                {!sidebarCollapsed && (
                  <span className="font-heading text-sm tracking-tight flex-1 text-left flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.id === 'materials' && reportCount > 0 && (
                      <span className={`ml-auto flex items-center gap-1.5 px-2.5 py-0.5 text-white font-black text-[11px] rounded-full shadow-md animate-pulse ${
                        active
                          ? 'bg-rose-500 text-white shadow-rose-950/40 ring-2 ring-white/40'
                          : 'bg-gradient-to-r from-rose-600 to-red-600 shadow-rose-500/40'
                      }`}>
                        <Bell className="w-3.5 h-3.5 text-white animate-bounce shrink-0" />
                        <span>{reportCount} BÁO CÁO</span>
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User info & Logout */}
        <div className="p-8 border-t border-[#f8fafc] shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-4 px-2 mb-8">
              <div className="w-14 h-14 bg-white border-2 border-slate-200 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-[#0f172a]/5 shrink-0">
                <span className="text-[#0f172a] font-black text-xl italic">QT</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-[10px] font-extrabold text-[#4f46e5] uppercase tracking-widest mb-0.5">Admin Account</p>
                <p className="font-heading text-sm font-extrabold text-[#0f172a] truncate">{admin?.name}</p>
                <p className="font-body text-[10px] text-slate-500 font-bold truncate">{admin?.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem]
              text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all font-heading font-extrabold text-sm
              ${sidebarCollapsed ? 'justify-center px-0 ring-0' : ''}
            `}
            title={sidebarCollapsed ? 'Đăng xuất' : ''}
          >
            <LogOut className="w-6 h-6 shrink-0 text-slate-500 group-hover:text-rose-600" />
            {!sidebarCollapsed && <span>Ngắt Kết Nối</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Header - only on mobile */}
        <header className="lg:hidden h-16 bg-white/70 backdrop-blur-md border-b border-[#e2e8f0]/20 flex items-center justify-between px-6 sticky top-0 z-30">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white text-[#0f172a] shadow-sm border border-[#f8fafc]"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 lg:px-10 py-6 lg:py-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

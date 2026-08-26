import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Navigate, Outlet, Link } from 'react-router-dom';
import { useTeacherAuth } from '../contexts/TeacherAuthContext';
import api from '../../../config/api';
import {
  LayoutGrid,
  BookOpen,
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
  ShieldCheck,
  Headphones
} from 'lucide-react';

const menuItems = [
  {
    id: 'dashboard',
    label: 'Tổng quan',
    icon: LayoutGrid,
    path: '/teacher/dashboard'
  },
  {
    id: 'browse',
    label: 'Ngân hàng nội dung',
    icon: FolderOpen,
    path: '/teacher/browse'
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
  },
  {
    id: 'contact',
    label: 'Liên hệ Admin',
    icon: Headphones,
    path: '/teacher/contact'
  }
];

const TeacherLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { teacher, logout, isAuthenticated, isVerified, loading } = useTeacherAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!teacher?.id) return;
    try {
      const response = await api.get(`/classes/teacher/${teacher.id}/notifications`);
      if (response.data?.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching teacher notifications:', error);
    }
  };

  useEffect(() => {
    if (teacher?.id) {
      fetchNotifications();
      // Poll every 30 seconds for live notifications
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [teacher?.id]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = async () => {
    if (!teacher?.id) return;
    try {
      await api.post(`/classes/teacher/${teacher.id}/notifications/read-all`);
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const [headerSearch, setHeaderSearch] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(`/teacher/browse?search=${encodeURIComponent(headerSearch.trim())}`);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#e4f2f0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2099e9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-body text-[#274dad] font-bold">Đang tải học viện...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated or deactivated
  if (!isAuthenticated || teacher?.status === 'inactive') {
    return <Navigate to="/login?error=deactivated" replace />;
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
                  font-heading w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all
                  ${active
                    ? 'bg-[#4f46e5] text-white shadow-xl shadow-blue-500/20'
                    : 'text-slate-500 hover:text-[#0f172a] hover:bg-[#f8fafc]/50 font-extrabold'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
                title={sidebarCollapsed ? item.label : ''}
              >
                <IconComponent className={`w-6 h-6 shrink-0 ${active ? 'text-white' : ''}`} />
                {!sidebarCollapsed && (
                  <span className="font-extrabold text-sm tracking-tight">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User info & Logout */}
        <div className="p-8 border-t border-[#f8fafc] shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-4 px-2 mb-8">
              <div className="w-14 h-14 bg-white border-2 border-[#f8fafc] rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-[#0f172a]/5 shrink-0 overflow-hidden relative">
                {teacher?.avatar ? (
                  <img
                    src={teacher.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <span className={`text-[#0f172a] font-black text-xl italic ${teacher?.avatar ? 'hidden' : 'flex'}`}>
                  {teacher?.displayName?.[0] || teacher?.email?.[0] || 'T'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-[10px] font-extrabold text-[#4f46e5] uppercase tracking-widest mb-0.5">Giảng Viên</p>
                <p className="font-heading text-sm font-extrabold text-[#0f172a] truncate">{teacher?.displayName || 'Giảng Viên'}</p>
                <p className="font-body text-[10px] text-slate-400 font-bold truncate">{teacher?.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem]
              text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-heading font-extrabold text-sm
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

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-2xl mx-12">
            <div className="relative w-full group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-[#4f46e5] transition-colors" />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Tìm kiến thức, bài giảng, mô phỏng..."
                className="font-body w-full bg-[#f8fafc]/50 border-2 border-transparent rounded-[1.5rem] pl-16 pr-8 py-4 text-sm text-[#0f172a] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#4f46e5] transition-all font-bold"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-5">
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  if (!showNotifDropdown) {
                    handleMarkAllAsRead();
                  }
                }}
                className="relative flex items-center justify-center w-14 h-14 rounded-[1.5rem] bg-white text-[#0f172a] hover:bg-[#f8fafc] transition-all border border-[#f8fafc] shadow-sm group"
              >
                <Bell className="w-6 h-6 group-hover:shake transition-all text-slate-700" />
                {unreadCount > 0 && (
                  <span className="font-heading absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-100 rounded-3xl shadow-xl py-3 z-50 animate-fade-in max-h-[450px] overflow-y-auto">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-heading text-sm font-extrabold text-slate-800">Thông báo của bạn</span>
                    {unreadCount > 0 && (
                      <span className="font-heading text-[10px] font-extrabold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>

                  <div className="divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="font-body p-8 text-center text-slate-400 font-bold text-xs">
                        <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        Chưa có thông báo nào.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-4 hover:bg-slate-50 transition-colors flex items-start gap-3 ${!n.is_read ? 'bg-indigo-50/20' : ''}`}>
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.is_read ? 'bg-indigo-600' : 'bg-transparent'}`} />
                          <div className="flex-1 space-y-1">
                            <p className="font-heading text-xs font-extrabold text-slate-800">{n.title}</p>
                            <p className="font-body text-xs text-slate-500 leading-relaxed font-bold">{n.content}</p>
                            <p className="font-body text-[9px] text-slate-400 font-bold">
                              {new Date(n.created_at).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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


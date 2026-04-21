import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, GraduationCap, Wrench, User } from 'lucide-react';

const MobileBottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const hiddenPaths = [
    '/login',
    '/register'
  ];

  const hiddenPrefixes = [
    '/admin',
    '/teacher',
    '/pk-battle/room/'
  ];

  const shouldHide =
    !user ||
    hiddenPaths.includes(location.pathname) ||
    hiddenPrefixes.some(prefix => location.pathname.startsWith(prefix));

  if (shouldHide) {
    return null;
  }

  const navItems = [
    { label: 'Trang chủ', path: '/program/physics/dashboard', icon: Home },
    { label: 'Lớp học', path: '/physics-classes', icon: GraduationCap },
    { label: 'Công cụ', path: '/physics-tools', icon: Wrench },
    { label: 'Hồ sơ', path: '/profile', icon: User }
  ];

  const isActive = (path) => {
    if (path === '/program/physics/dashboard') {
      return location.pathname === '/program/physics/dashboard' || location.pathname === '/program/physics';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-4 gap-1 px-2 pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition-all ${
                active
                  ? 'text-[#B87333] bg-amber-50'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

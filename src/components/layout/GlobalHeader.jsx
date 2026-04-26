import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Atom, Home, Wrench, BookOpen, FlaskConical, Trophy, LogOut, Globe, Menu, X, Rocket, GraduationCap } from 'lucide-react';

import EurekaPremiumLogo from '../ui/EurekaPremiumLogo';

const GlobalHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); }
    catch (error) { console.error('Logout error:', error); }
  };

  const navLinks = [
    { name: 'TRANG CHỦ', path: '/program/physics/dashboard', icon: Home },
    { name: 'LỚP HỌC', path: '/physics-classes', icon: GraduationCap },
    { name: 'KHO TÀNG', path: '/physics-tools', icon: Wrench },
    { name: 'BÀI GIẢNG', path: '/interactive-lectures', icon: BookOpen },
    { name: 'THÍ NGHIỆM', path: '/vatly/virtual-lab', icon: FlaskConical },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 md:top-4 z-50 w-full md:w-[98%] max-w-7xl mx-auto transition-all duration-300">
      <div className="glass-panel rounded-none md:rounded-2xl border-y md:border border-white/60 shadow-[0_12px_40px_rgba(184,115,51,0.12)] px-3 sm:px-6 md:px-8 h-16 sm:h-20 py-2 flex items-center justify-between gap-3 md:gap-8">

        {/* Brand & Logo (Left) */}
        <div className="flex-none">
          <Link to="/" className="flex items-center group cursor-pointer transition-transform duration-500 hover:scale-105">
            <EurekaPremiumLogo className="h-10 sm:h-12 md:h-16" />
          </Link>
        </div>

        {/* Main Navigation (Grouped) */}
        <nav className="hidden lg:flex flex-1 items-center justify-start gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <button
                key={link.name}
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                  } else {
                    navigate(link.path);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-[13px] whitespace-nowrap shrink-0 transition-all duration-300 ${active
                  ? 'bg-[#B87333] text-white shadow-[0_4px_12px_rgba(184,115,51,0.3)]'
                  : 'text-slate-500 hover:bg-white hover:text-[#B87333] hover:shadow-sm'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </button>
            );
          })}
        </nav>

        {/* Right Actions Area (User Profile + Menu) */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {/* Language / VI (Hidden on small mobile) */}
          <button className="hidden sm:flex items-center gap-2 text-slate-500 hover:text-[#B87333] font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full bg-white/50 border border-slate-100 transition-all">
            <Globe className="w-3.5 h-3.5" /> <span>VI</span>
          </button>

          {/* Desktop-only divider */}
          <div className="hidden lg:block h-10 w-px bg-slate-200 mx-1" />

          {/* Auth/Profile Section */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link to="/profile"
                  className="group flex items-center gap-2 sm:gap-3 bg-white hover:bg-[#FDFCF8] rounded-2xl p-1 pr-2 sm:pr-4 cursor-pointer transition-all border border-slate-100 shadow-sm hover:shadow-md hover:border-[#B87333]/20"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-[#B87333] to-[#4A3728] rounded-xl flex items-center justify-center shadow-inner">
                    <span className="text-white font-bold text-xs sm:text-sm">
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-black text-slate-700 leading-tight">
                      {user?.displayName || user?.email?.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-[#B87333] font-black uppercase tracking-[0.15em] leading-none mt-0.5">Explorer</span>
                  </div>
                </Link>
                <button onClick={handleLogout} className="p-2 sm:p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link to="/login" className="text-slate-500 font-bold hover:text-[#8C5523] px-3 py-2 transition-colors text-xs sm:text-sm">
                  Đăng nhập
                </Link>
                <Link to="/register"
                  className="hidden sm:flex items-center gap-2 px-4 sm:px-6 py-2 sm:2.5 text-xs sm:text-sm font-black text-white bg-gradient-to-r from-[#B87333] to-[#4A3728] rounded-xl shadow-[0_8px_20px_rgba(184,115,51,0.25)] hover:shadow-[0_12px_25px_rgba(184,115,51,0.35)] hover:-translate-y-0.5 transition-all active:scale-95 active:translate-y-0"
                >
                  Đăng ký <Rocket className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-500 hover:text-[#B87333] p-2 sm:p-2.5 rounded-xl bg-white shadow-sm border border-slate-100">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 mx-2 md:mx-0 bg-white/95 backdrop-blur-lg rounded-2xl border border-slate-100 shadow-2xl overflow-hidden animate-fade-in">
          <div className="px-3 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <button
                  key={link.name}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (!user) {
                      navigate('/login');
                    } else {
                      navigate(link.path);
                    }
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-black text-sm transition-all ${active ? 'bg-[#B87333] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  <Icon className="w-5 h-5" /> {link.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default GlobalHeader;

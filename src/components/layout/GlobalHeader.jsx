import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Atom, Home, Wrench, BookOpen, FlaskConical, Trophy, User, LogOut, Globe, Menu, X, Rocket } from 'lucide-react';

const GlobalHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { name: 'Trang chủ', path: '/program/physics/dashboard', icon: Home },
    { name: 'Công cụ', path: '/physics-tools', icon: Wrench },
    { name: 'Bài giảng', path: '/interactive-lectures', icon: BookOpen },
    { name: 'Thí nghiệm', path: '/vatly/virtual-lab', icon: FlaskConical },
    { name: 'Thử thách', path: '/advanced-physics-challenge', icon: Trophy },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(6,182,212,0.1)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo Area */}
        <Link to="/" className="flex items-center gap-2 group cursor-pointer shrink-0">
          <div className="p-1.5 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg group-hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] transition-all duration-300">
            <Atom className="w-6 h-6 text-white group-hover:animate-spin-slow" />
          </div>
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
            Physi<span className="text-white">Game</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active 
                    ? 'bg-cyan-500/15 text-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.2)]' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-cyan-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'animate-pulse' : ''}`} />
                <span>{link.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right Section (Auth, Lang, Mobile Toggle) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Toggle (Decorative) */}
          <button className="hidden sm:flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">VI</span>
          </button>

          {/* Auth State */}
          {user ? (
            <div className="flex items-center gap-0">
              <Link 
                to="/profile"
                className="flex items-center gap-2 hover:bg-slate-800 rounded-full px-2 py-1 pr-3 cursor-pointer transition-all border border-transparent hover:border-slate-700"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                  <span className="text-white font-bold text-sm">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-sm font-bold text-white truncate max-w-[100px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-semibold uppercase">Explorer</span>
                </div>
              </Link>
              <button 
                onClick={handleLogout}
                className="ml-1 p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link 
                to="/login"
                className="px-4 py-2 text-sm font-bold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-xl transition-all"
              >
                Đăng nhập
              </Link>
              <Link 
                to="/register"
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:-translate-y-0.5 transition-all"
              >
                <span>Đăng ký</span>
                <Rocket className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-300 hover:text-cyan-400 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-slate-900 border-b border-cyan-500/20 shadow-2xl py-4 flex flex-col gap-2 px-4 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  active 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className={`p-2 rounded-lg ${active ? 'bg-cyan-500/30' : 'bg-slate-800'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {link.name}
              </Link>
            )
          })}
          
          {!user && (
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-800">
              <Link 
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-3 text-base font-bold text-cyan-400 bg-cyan-500/10 rounded-xl"
              >
                Đăng nhập
              </Link>
              <Link 
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl"
              >
                Đăng ký ngay
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default GlobalHeader;

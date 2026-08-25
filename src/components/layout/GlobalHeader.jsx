import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import {
  Atom,
  Home,
  Wrench,
  BookOpen,
  FlaskConical,
  Trophy,
  LogOut,
  Menu,
  X,
  Rocket,
  GraduationCap,
  ChevronDown,
  Gamepad2,
  Swords,
  Compass,
  Library,
  Calculator,
  ArrowLeftRight,
  Headphones
} from 'lucide-react';

import EurekaPremiumLogo from '../ui/EurekaPremiumLogo';

const GlobalHeader = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); }
    catch (error) { console.error('Logout error:', error); }
  };

  const navLinks = [
    {
      name: t('header.journey'),
      icon: Compass,
      children: [
        { name: t('header.classes'), path: '/physics-classes', icon: GraduationCap },
        { name: t('header.lectures'), path: '/interactive-lectures', icon: BookOpen },
        { name: t('header.my_class'), path: '/my-class', icon: GraduationCap },
      ]
    },
    {
      name: t('header.treasure'),
      icon: Library,
      children: [
        { name: t('header.calculator'), path: '/physics-tools/calculator', icon: Calculator },
        { name: t('header.constants'), path: '/physics-tools/constants', icon: BookOpen },
        { name: t('header.converter'), path: '/physics-tools/converter', icon: ArrowLeftRight },
      ]
    },
    {
      name: t('header.challenge'),
      icon: Trophy,
      children: [
        { name: t('header.games'), path: '/advanced-physics-challenge', icon: Gamepad2 },
        { name: t('header.lab'), path: '/vatly/virtual-lab', icon: FlaskConical },
        { name: t('header.arena'), path: '/pk-battle', icon: Swords },
      ]
    },
    {
      name: 'LIÊN HỆ',
      path: '/support/contact',
      icon: Headphones
    }
  ];

  const isActive = (path) => {
    if (!path) return false;
    return location.pathname.startsWith(path);
  };

  const isParentActive = (children) => {
    if (!children) return false;
    return children.some(child => isActive(child.path));
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="absolute top-0 z-50 w-full bg-transparent">
      <div className="w-full max-w-[97%] mx-auto px-4 sm:px-6 md:px-10 h-28 flex items-center justify-between gap-8">

        {/* Brand & Logo (Left) */}
        <div className="flex-none">
          <Link to="/" className="flex items-center group cursor-pointer transition-transform duration-500 hover:scale-105">
            <span className="font-premium-serif text-4xl font-bold text-slate-900 italic tracking-tight">Eureka</span>
          </Link>
        </div>

        {/* Main Navigation (Grouped with Dropdowns) */}
        <nav className="hidden lg:flex flex-1 items-center justify-start gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const hasChildren = link.children && link.children.length > 0;
            const parentActive = hasChildren ? isParentActive(link.children) : isActive(link.path);

            return (
              <div
                key={link.name}
                className="relative group h-full flex items-center"
                onMouseEnter={() => hasChildren && setActiveDropdown(link.name)}
                onMouseLeave={() => hasChildren && setActiveDropdown(null)}
              >
                <button
                  onClick={() => {
                    if (!hasChildren && link.path) {
                      if (!user) navigate('/login');
                      else navigate(link.path);
                    }
                  }}
                  className={`font-heading flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-sm tracking-wide transition-all duration-300 cursor-pointer ${parentActive
                    ? 'text-[#274dad]'
                    : 'text-slate-500 hover:text-[#274dad]'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                  {hasChildren && <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === link.name ? 'rotate-180' : ''}`} />}
                </button>

                {/* Dropdown Menu */}
                {hasChildren && (
                  <div className={`absolute top-full left-0 pt-2 transition-all duration-300 ${activeDropdown === link.name ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
                    }`}>
                    <div className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 min-w-[200px] overflow-hidden">
                      {link.children.map((child) => {
                        const ChildIcon = child.icon;
                        const active = isActive(child.path);
                        return (
                          <button
                            key={child.name}
                            onClick={() => {
                              if (!user) navigate('/login');
                              else navigate(child.path);
                              setActiveDropdown(null);
                            }}
                            className={`font-heading w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${active
                              ? 'bg-[#274dad]/10 text-[#274dad]'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-[#274dad]'
                              }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${active ? 'bg-[#274dad] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-white'
                              }`}>
                              <ChildIcon className="w-4 h-4" />
                            </div>
                            {child.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right Actions Area */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {/* Auth Section */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link to="/profile"
                  className="group flex items-center gap-2 sm:gap-3 bg-white hover:bg-[#FFFFFF] rounded-2xl p-1 pr-2 sm:pr-4 cursor-pointer transition-all border border-slate-100 shadow-sm hover:shadow-md hover:border-[#274dad]/20"
                >
                  {user?.profile?.avatar ? (
                    <img src={user.profile.avatar} alt="Avatar" className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shadow-inner border border-slate-200" />
                  ) : (
                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-[#274dad] to-[#4A3728] rounded-xl flex items-center justify-center shadow-inner">
                      <span className="text-white font-bold text-xs sm:text-sm">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="hidden sm:flex flex-col">
                    <span className="text-sm font-black text-slate-700 leading-tight mt-1">
                      {user?.displayName || user?.email?.split('@')[0]}
                    </span>
                  </div>
                </Link>
                <button onClick={handleLogout} className="p-2.5 sm:p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link to="/login" className="text-slate-500 font-bold hover:text-[#2099e9] px-3 py-2 transition-colors text-xs sm:text-sm">
                  {t('header.login')}
                </Link>
                <Link to="/register"
                  className="hidden sm:flex items-center gap-2 px-4 sm:px-6 py-2 sm:2.5 text-xs sm:text-sm font-black text-white bg-gradient-to-r from-[#274dad] to-[#4A3728] rounded-xl shadow-[0_8px_20px_rgba(184,115,51,0.25)] hover:shadow-[0_12px_25px_rgba(184,115,51,0.35)] hover:-translate-y-0.5 transition-all active:scale-95 active:translate-y-0"
                >
                  {t('header.register')} <Rocket className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-500 hover:text-[#274dad] p-2 sm:p-2.5 rounded-xl bg-white shadow-sm border border-slate-100">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown (Updated for nesting) */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 bg-white/95 backdrop-blur-lg rounded-2xl border border-slate-100 shadow-2xl overflow-hidden animate-fade-in max-h-[80vh] overflow-y-auto">
          <div className="px-3 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const hasChildren = link.children && link.children.length > 0;

              return (
                <div key={link.name} className="flex flex-col">
                  {hasChildren ? (
                    <>
                      <div className="flex items-center justify-between px-4 py-3.5 rounded-xl text-slate-400 font-black text-xs uppercase tracking-widest bg-slate-50/50 mb-1">
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" /> {link.name}
                        </div>
                      </div>
                      <div className="pl-4 space-y-1 mb-2">
                        {link.children.map((child) => {
                          const ChildIcon = child.icon;
                          const active = isActive(child.path);
                          return (
                            <button
                              key={child.name}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                if (!user) navigate('/login');
                                else navigate(child.path);
                              }}
                              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm transition-all ${active ? 'bg-[#274dad] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                              <ChildIcon className="w-5 h-5" /> {child.name}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (!user) navigate('/login');
                        else navigate(link.path);
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-black text-sm transition-all ${isActive(link.path) ? 'bg-[#274dad] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                      <Icon className="w-5 h-5" /> {link.name}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default GlobalHeader;


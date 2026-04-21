import React, { useEffect } from 'react';
import GlobalHeader from './GlobalHeader';
import GlobalFooter from './GlobalFooter';
import MobileBottomNav from './MobileBottomNav';
import { useLocation, Outlet } from 'react-router-dom';

export default function MainLayout() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCF8] text-slate-700">
      <GlobalHeader />
      <main className="flex-grow flex flex-col relative w-full overflow-hidden pb-20 lg:pb-0">
        {/* Subtle graph grid overlay */}
        <div className="absolute inset-0 pointer-events-none z-0 graph-grid opacity-[0.2]" />
        <div className="relative z-10 flex-grow flex flex-col">
          <Outlet />
        </div>
      </main>
      <GlobalFooter />
      <MobileBottomNav />
    </div>
  );
}

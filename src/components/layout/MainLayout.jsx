import React, { useEffect } from 'react';
import GlobalHeader from './GlobalHeader';
import GlobalFooter from './GlobalFooter';
import { useLocation, Outlet } from 'react-router-dom';

export default function MainLayout() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#040D12] to-[#020617] text-white">
      <GlobalHeader />
      <main className="flex-grow flex flex-col relative w-full overflow-hidden">
        {/* We can add a subtle grid or particle overlay here for all pages in MainLayout */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>
        <div className="relative z-10 flex-grow flex flex-col">
          <Outlet />
        </div>
      </main>
      <GlobalFooter />
    </div>
  );
}

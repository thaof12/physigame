import React, { useEffect } from 'react';
import GlobalHeader from './GlobalHeader';
import GlobalFooter from './GlobalFooter';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DifyChatbot from '../AIChatbot/DifyChatbot';

export default function MainLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Global pending teacher guard
  useEffect(() => {
    if (!user) {
       console.log('%c🛡️ [MainLayout] No user session found. Waiting...', 'color: #94a3b8');
       return;
    }
    
    const isTeacher = user.role === 'teacher';
    const isPending = user.teacherStatus === 'pending' || user.teacher_status === 'pending';
    const isAdmin = user.role === 'admin' || user.email === 'quantrivien@gmail.com';
    
    console.log(`%c🛡️ [MainLayout] Guard check - Role: ${user.role}, Status: ${user.teacherStatus || user.teacher_status}`, 'color: #274dad; font-weight: bold');
    
    if (isAdmin) {
      console.log('%c🚀 [MainLayout] Admin detected on student route. FORCING REDIRECT...', 'color: #f59e0b; font-weight: black');
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    if (isTeacher) {
      if (isPending) {
        if (location.pathname !== '/teacher/pending') {
          console.log('%c🚀 [MainLayout] Pending teacher detected on student route. FORCING REDIRECT...', 'color: #f59e0b; font-weight: black; font-size: 14px');
          navigate('/teacher/pending', { replace: true });
        } else {
          console.log('%c✅ [MainLayout] Teacher is on the pending page. Guard passed.', 'color: #10b981');
        }
      } else {
        // Verified teacher - redirect to dashboard if on general student homepage / landing paths
        const studentHomePaths = ['/', '/home'];
        if (studentHomePaths.includes(location.pathname)) {
          console.log('%c🚀 [MainLayout] Verified teacher on landing page. FORCING REDIRECT...', 'color: #10b981; font-weight: black');
          navigate('/teacher/dashboard', { replace: true });
        }
      }
    }
  }, [user, navigate, location.pathname]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFFFF] text-slate-700">
      <GlobalHeader />
      <main className="flex-grow flex flex-col relative w-full overflow-hidden">
        {/* Subtle graph grid overlay */}
        <div className="absolute inset-0 pointer-events-none z-0 graph-grid opacity-[0.2]" />
        <div className="relative flex-grow flex flex-col">
          <Outlet />
        </div>
      </main>
      <GlobalFooter />
      {/* AI Chatbot - floating widget, hiển thị trên toàn bộ student layout */}
      <DifyChatbot />
    </div>
  );
}


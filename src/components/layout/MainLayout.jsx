import React, { useEffect, lazy, Suspense } from 'react';
import GlobalHeader from './GlobalHeader';
import GlobalFooter from './GlobalFooter';
import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DifyChatbot = lazy(() => import('../AIChatbot/DifyChatbot'));

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
    const isVerified = user.teacherStatus === 'verified' || user.teacher_status === 'verified';
    const hasSubmittedProfile = Boolean(
      user.teacher_profile?.phone || 
      (user.teacher_profile?.school && user.teacher_profile?.school !== 'Chưa cập nhật') || 
      user.teacher_profile?.applied_at ||
      user.teacherProfile?.phone ||
      user.teacherProfile?.appliedAt
    );
    const isPending = (user.teacherStatus === 'pending' || user.teacher_status === 'pending') && hasSubmittedProfile;
    const isUnsubmitted = isTeacher && !isVerified && !hasSubmittedProfile && user.teacher_status !== 'rejected';
    const isAdmin = user.role === 'admin' || user.email === 'quantrivien@gmail.com';
    
    console.log(`%c🛡️ [MainLayout] Guard check - Role: ${user.role}, Status: ${user.teacherStatus || user.teacher_status}, Submitted: ${hasSubmittedProfile}`, 'color: #274dad; font-weight: bold');
    
    if (isAdmin) {
      console.log('%c🚀 [MainLayout] Admin detected on student route. FORCING REDIRECT...', 'color: #f59e0b; font-weight: black');
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    if (isTeacher) {
      if (isUnsubmitted) {
        console.log('%c🚀 [MainLayout] Unsubmitted teacher detected on student layout. Immediate redirect to /teacher/apply...', 'color: #2099e9; font-weight: bold');
        navigate('/teacher/apply', { replace: true });
        return;
      }

      const publicLandingPaths = ['/', '/home', '/support/guide', '/support/faq', '/support/privacy', '/support/terms'];

      if (isPending) {
        if (!publicLandingPaths.includes(location.pathname) && location.pathname !== '/teacher/pending') {
          console.log('%c🚀 [MainLayout] Pending teacher detected on protected student route. Redirecting to /teacher/pending...', 'color: #f59e0b; font-weight: black');
          navigate('/teacher/pending', { replace: true });
        }
      } else if (isVerified) {
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
      <Suspense fallback={null}>
        <DifyChatbot />
      </Suspense>
    </div>
  );
}


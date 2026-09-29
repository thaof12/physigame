import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

import { supabase } from '../../../config/supabase';

const TeacherAuthContext = createContext();

export const useTeacherAuth = () => {
  return useContext(TeacherAuthContext);
};

export const TeacherAuthProvider = ({ children }) => {
  const { user, loading: globalLoading, logout: globalLogout, refreshUser } = useAuth();

  const getInitialUser = () => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const activeUser = user || getInitialUser();
  const isTeacherUser = activeUser?.role === 'teacher';
  const isTeacherVerifiedUser = isTeacherUser && (activeUser?.teacherStatus === 'verified' || activeUser?.teacher_status === 'verified');

  const [teacher, setTeacher] = useState(isTeacherUser ? activeUser : null);
  const [loading, setLoading] = useState(globalLoading);
  const [isAuthenticated, setIsAuthenticated] = useState(isTeacherUser);
  const [isVerified, setIsVerified] = useState(isTeacherVerifiedUser);

  useEffect(() => {
    if (globalLoading) {
      setLoading(true);
      return;
    }

    const currentUser = user || getInitialUser();
    if (currentUser) {
      const isTeacher = currentUser.role === 'teacher';
      const isTeacherVerified = isTeacher && (currentUser.teacherStatus === 'verified' || currentUser.teacher_status === 'verified');
      
      setTeacher(isTeacher ? currentUser : null);
      setIsAuthenticated(isTeacher);
      setIsVerified(isTeacherVerified);
    } else {
      setTeacher(null);
      setIsAuthenticated(false);
      setIsVerified(false);
    }
    setLoading(false);
  }, [user, globalLoading]);

  const logout = async () => {
    await globalLogout();
  };

  const refreshTeacher = async () => {
    try {
      const updatedUser = await refreshUser();
      if (updatedUser) {
        setTeacher(updatedUser);
        setIsVerified(updatedUser.teacherStatus === 'verified' || updatedUser.teacher_status === 'verified');
      }
    } catch (error) {
      console.error('Error refreshing teacher data:', error);
    }
  };

  const checkTeacherAuth = () => {
    if (user) {
      const isTeacher = user.role === 'teacher';
      setTeacher(isTeacher ? user : null);
      setIsAuthenticated(isTeacher);
      setIsVerified(isTeacher && (user.teacherStatus === 'verified' || user.teacher_status === 'verified'));
    }
  };

  const effectiveStatus = teacher?.teacher_status || teacher?.teacherStatus || user?.teacher_status || user?.teacherStatus || 'unsubmitted';
  const hasSubmittedApp = Boolean(
    teacher?.teacher_profile?.phone || 
    (teacher?.teacher_profile?.school && teacher?.teacher_profile?.school !== 'Chưa cập nhật') || 
    teacher?.teacher_profile?.applied_at ||
    teacher?.teacherProfile?.phone ||
    teacher?.teacherProfile?.appliedAt
  );
  const isTeacherVerified = effectiveStatus === 'verified';
  const isTeacherRejected = effectiveStatus === 'rejected';
  const isTeacherPending = effectiveStatus === 'pending' && hasSubmittedApp;
  const isTeacherUnsubmitted = !isTeacherVerified && !isTeacherRejected && !isTeacherPending;

  const value = {
    teacher,
    loading,
    isAuthenticated,
    isVerified: isTeacherVerified,
    isPending: isTeacherPending,
    isRejected: isTeacherRejected,
    isUnsubmitted: isTeacherUnsubmitted,
    logout,
    refreshTeacher,
    checkTeacherAuth
  };

  return (
    <TeacherAuthContext.Provider value={value}>
      {children}
    </TeacherAuthContext.Provider>
  );
};

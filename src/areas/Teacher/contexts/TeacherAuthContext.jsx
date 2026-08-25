import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

import { supabase } from '../../../config/supabase';

const TeacherAuthContext = createContext();

export const useTeacherAuth = () => {
  return useContext(TeacherAuthContext);
};

export const TeacherAuthProvider = ({ children }) => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { user, loading: globalLoading, logout: globalLogout, refreshUser } = useAuth();

  useEffect(() => {
    if (globalLoading) {
      setLoading(true);
      return;
    }

    if (user) {
      const isTeacher = user.role === 'teacher';
      const isTeacherVerified = user.teacherStatus === 'verified' || user.teacher_status === 'verified';
      
      setTeacher(isTeacher ? user : null);
      setIsAuthenticated(isTeacher);
      setIsVerified(isTeacher && isTeacherVerified);
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

  const effectiveStatus = teacher?.teacher_status || teacher?.teacherStatus || user?.teacher_status || user?.teacherStatus || 'pending';
  const isTeacherVerified = effectiveStatus === 'verified';
  const isTeacherRejected = effectiveStatus === 'rejected';
  const isTeacherPending = !isTeacherVerified && !isTeacherRejected;

  const value = {
    teacher,
    loading,
    isAuthenticated,
    isVerified: isTeacherVerified,
    isPending: isTeacherPending,
    isRejected: isTeacherRejected,
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

import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherAuthContext = createContext();

export const useTeacherAuth = () => {
  return useContext(TeacherAuthContext);
};

export const TeacherAuthProvider = ({ children }) => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    checkTeacherAuth();
  }, []);

  const checkTeacherAuth = () => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (savedUser && token) {
        const userData = JSON.parse(savedUser);

        // Check if user is a teacher
        if (userData.role === 'teacher') {
          setTeacher(userData);
          setIsAuthenticated(true);
          setIsVerified(userData.teacherStatus === 'verified');
        } else {
          // Not a teacher, clear auth
          setTeacher(null);
          setIsAuthenticated(false);
          setIsVerified(false);
        }
      }
    } catch (error) {
      console.error('Error checking teacher auth:', error);
      setTeacher(null);
      setIsAuthenticated(false);
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTeacher(null);
    setIsAuthenticated(false);
    setIsVerified(false);
  };

  const refreshTeacher = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        // TODO: Fetch updated teacher data from server
        setTeacher(userData);
        setIsVerified(userData.teacherStatus === 'verified');
      }
    } catch (error) {
      console.error('Error refreshing teacher data:', error);
    }
  };

  const value = {
    teacher,
    loading,
    isAuthenticated,
    isVerified,
    isPending: teacher?.teacherStatus === 'pending',
    isRejected: teacher?.teacherStatus === 'rejected',
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

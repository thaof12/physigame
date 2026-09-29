import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';


const AdminAuthContext = createContext(null);

// Hardcoded admin credentials for demo
const ADMIN_CREDENTIALS = {
  email: 'quantrivien@gmail.com',
  password: 'qtv123@',
  name: 'Quản trị viên',
  role: 'super_admin'
};

export const AdminAuthProvider = ({ children }) => {
  const { user: globalUser, loading: globalLoading, logout: globalLogout } = useAuth();

  const getInitialAdmin = () => {
    try {
      const savedAdmin = localStorage.getItem('physigame_admin');
      if (savedAdmin) return JSON.parse(savedAdmin);
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.role === 'admin' || parsed.email === ADMIN_CREDENTIALS.email) {
          return {
            email: parsed.email,
            name: parsed.displayName || parsed.display_name || ADMIN_CREDENTIALS.name,
            role: ADMIN_CREDENTIALS.role
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const [admin, setAdmin] = useState(getInitialAdmin);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (globalLoading) return;

    if (globalUser && (globalUser.role === 'admin' || globalUser.email === ADMIN_CREDENTIALS.email)) {
      const adminData = {
        email: globalUser.email,
        name: globalUser.displayName || globalUser.display_name || ADMIN_CREDENTIALS.name,
        role: ADMIN_CREDENTIALS.role
      };
      setAdmin(adminData);
      localStorage.setItem('physigame_admin', JSON.stringify(adminData));
    } else if (!globalUser && !localStorage.getItem('physigame_admin')) {
      setAdmin(null);
    }
    setLoading(false);
  }, [globalUser, globalLoading]);

  const login = async (email, password) => {
    // Validate credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const adminData = {
        email: ADMIN_CREDENTIALS.email,
        name: ADMIN_CREDENTIALS.name,
        role: ADMIN_CREDENTIALS.role,
        loginTime: new Date().toISOString()
      };

      setAdmin(adminData);
      localStorage.setItem('physigame_admin', JSON.stringify(adminData));
      return { success: true };
    }

    return { success: false, error: 'Email hoặc mật khẩu không đúng' };
  };

  const logout = async () => {
    setAdmin(null);
    localStorage.removeItem('physigame_admin');
    await globalLogout();
  };

  const value = {
    admin,
    loading,
    login,
    logout,
    isAuthenticated: !!admin
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;

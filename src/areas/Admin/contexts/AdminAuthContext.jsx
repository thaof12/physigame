import { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext(null);

// Hardcoded admin credentials for demo
const ADMIN_CREDENTIALS = {
  email: 'quantrivien@gmail.com',
  password: 'qtv123@',
  name: 'Quản trị viên',
  role: 'super_admin'
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in from localStorage
    const savedAdmin = localStorage.getItem('physigame_admin');
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (e) {
        localStorage.removeItem('physigame_admin');
      }
    }
    setLoading(false);
  }, []);

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

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('physigame_admin');
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

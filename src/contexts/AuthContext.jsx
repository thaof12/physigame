import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import api from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current Supabase session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          console.log('✅ Supabase session found:', session.user.email);

          // Store token for API calls
          localStorage.setItem('token', session.access_token);

          // Fetch user profile from backend
          try {
            const response = await api.get(`/users/firebase/${session.user.id}`);
            if (response.data) {
              const userData = {
                ...response.data,
                firebaseUid: session.user.id,
                uid: session.user.id
              };
              localStorage.setItem('user', JSON.stringify(userData));
              setUser(userData);
              console.log('✅ User profile loaded');
            }
          } catch (profileError) {
            console.warn('⚠️ Could not load profile, using basic data');
            const basicUser = {
              id: session.user.id,
              email: session.user.email,
              displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
              firebaseUid: session.user.id,
              uid: session.user.id,
              xp: 0,
              level: 1,
              programs: []
            };
            localStorage.setItem('user', JSON.stringify(basicUser));
            setUser(basicUser);
          }
        } else {
          // Check localStorage fallback
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch {
              localStorage.removeItem('user');
              localStorage.removeItem('token');
            }
          }
          console.log('ℹ️ No active session');
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);

        if (event === 'SIGNED_IN' && session) {
          localStorage.setItem('token', session.access_token);

          try {
            const response = await api.get(`/users/firebase/${session.user.id}`);
            if (response.data) {
              const userData = { ...response.data, firebaseUid: session.user.id, uid: session.user.id };
              localStorage.setItem('user', JSON.stringify(userData));
              setUser(userData);
            }
          } catch {
            const basicUser = {
              id: session.user.id,
              email: session.user.email,
              displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
              firebaseUid: session.user.id,
              uid: session.user.id
            };
            setUser(basicUser);
            localStorage.setItem('user', JSON.stringify(basicUser));
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw new Error(error.message);

      localStorage.setItem('token', data.session.access_token);

      // Fetch profile
      const response = await api.get(`/users/firebase/${data.user.id}`);
      const userData = { ...response.data, firebaseUid: data.user.id, uid: data.user.id };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return userData;
    } catch (error) {
      throw new Error(error.message || 'Đăng nhập thất bại');
    }
  };

  const register = async (username, email, password) => {
    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: username
          }
        }
      });

      if (error) throw new Error(error.message);

      // Wait for profile to be created by trigger, then update it
      if (data.session) {
        localStorage.setItem('token', data.session.access_token);
      }

      // Sync profile on backend
      try {
        await api.post('/auth/register', {
          username,
          email,
          firebaseUid: data.user.id
        });
      } catch (syncError) {
        console.warn('⚠️ Profile sync may have failed:', syncError.message);
      }

      // Fetch the profile
      try {
        const response = await api.get(`/users/firebase/${data.user.id}`);
        if (response.data) {
          const userData = { ...response.data, firebaseUid: data.user.id, uid: data.user.id };
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          return userData;
        }
      } catch {
        // Use basic data if profile fetch fails
        const basicUser = {
          id: data.user.id,
          email,
          username,
          displayName: username,
          firebaseUid: data.user.id,
          uid: data.user.id,
          xp: 0,
          level: 1,
          programs: []
        };
        localStorage.setItem('user', JSON.stringify(basicUser));
        setUser(basicUser);
        return basicUser;
      }
    } catch (error) {
      throw new Error(error.message || 'Đăng ký thất bại');
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });

      if (error) throw new Error(error.message);

      // The redirect will handle the rest via onAuthStateChange
      return data;
    } catch (error) {
      throw new Error(error.message || 'Đăng nhập Google thất bại');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await api.get(`/users/firebase/${session.user.id}`);
      if (response.data) {
        const userData = { ...response.data, firebaseUid: session.user.id, uid: session.user.id };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        console.log('✅ User data refreshed');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

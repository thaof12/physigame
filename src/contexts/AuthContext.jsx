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
                email: response.data.email || session.user.email,
                displayName: response.data.displayName || response.data.display_name || session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
                firebaseUid: session.user.id,
                uid: session.user.id
              };
              localStorage.setItem('user', JSON.stringify(userData));
              setUser(userData);
              console.log('✅ User profile loaded:', userData.email);
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
        const timestamp = new Date().toLocaleTimeString();
        console.log(`%c🔄 [AuthContext] ${timestamp} - Event: ${event}`, 'color: #2099e9; font-weight: bold', session?.user?.email);

        if (event === 'SIGNED_IN' && session) {
          localStorage.setItem('token', session.access_token);

          // 1. Get Intent from LocalStorage
          const intentRole = localStorage.getItem('pending_role');
          const isTeacherIntent = intentRole === 'teacher';
          
          if (intentRole) {
            console.log(`%c🎯 [AuthContext] Role intent found in storage: ${intentRole}`, 'color: #274dad; font-weight: bold; font-size: 14px');
          }

          try {
            // 2. Fetch existing profile from API
            console.log('📡 [AuthContext] Fetching existing profile...');
            const response = await api.get(`/users/firebase/${session.user.id}`);
            let userData = response.data 
              ? { ...response.data, firebaseUid: session.user.id, uid: session.user.id }
              : null;

            // 3. ATOMIC SYNC: If intent is teacher, force update both specialized and core tables
            if (isTeacherIntent) {
              console.log('%c🚀 [AuthContext] Teacher path triggered. Synchronizing database...', 'color: #2099e9; font-weight: black');
              
              const teacherProfileData = {
                id: session.user.id,
                name: userData?.display_name || session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
                email: session.user.email,
                teacherStatus: 'pending',
                teacher_status: 'pending',
                subject: 'Chưa cập nhật',
                school: 'Chưa cập nhật',
                createdAt: new Date().toISOString()
              };

              // 3. ATOMIC SYNC: Update core users table with teacher intent
              console.log('%c🚀 [AuthContext] Teacher registration intent detected. Syncing with users table...', 'color: #2099e9; font-weight: black');
              
              const teacherSyncData = {
                 id: session.user.id,
                 username: session.user.user_metadata?.preferred_username || 
                           session.user.user_metadata?.username || 
                           session.user.user_metadata?.display_name || 
                           session.user.email?.split('@')[0],
                 display_name: session.user.user_metadata?.display_name || 
                               session.user.user_metadata?.full_name || 
                               session.user.email?.split('@')[0],
                 email: session.user.email,
                 role: 'teacher',
                 teacher_status: 'pending',
                 updated_at: new Date().toISOString()
              };

              // Single-layer sync to the correct core users table
              const { error: syncError } = await supabase
                .from('users')
                .upsert(teacherSyncData);

              if (syncError) {
                console.error('❌ [AuthContext] Schema Sync failed:', syncError.message);
              } else {
                console.log('✅ [AuthContext] Database synchronized (teacher_status: pending)');
              }

              // 4. Update Backend API if possible
              try {
                await api.post('/auth/register', {
                  username: session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
                  email: session.user.email,
                  firebaseUid: session.user.id,
                  role: 'teacher',
                  teacherStatus: 'pending' // Keeping this for API compatibility if needed
                });
              } catch (apiErr) {
                console.warn('⚠️ [AuthContext] Backend API sync skipped or failed');
              }
              
              // Standardize local userData
              userData = { 
                ...(userData || {}), 
                ...teacherSyncData,
                displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
                id: session.user.id,
                uid: session.user.id
              };
              
              // Clear intent only after successful sync start
              localStorage.removeItem('pending_role');
              console.log('%c✅ [AuthContext] Teacher sync completed successfully!', 'color: #10b981; font-weight: bold');
            }

            if (userData) {
              // Ensure we don't accidentally wipe teacher status if API returned student but intent was teacher
              const finalUser = {
                ...userData,
                email: userData.email || session.user.email,
                displayName: userData.displayName || userData.display_name || session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
                role: isTeacherIntent ? 'teacher' : (userData.role || 'student'),
                teacherStatus: isTeacherIntent ? 'pending' : (userData.teacherStatus || userData.teacher_status || 'verified'),
                teacher_status: isTeacherIntent ? 'pending' : (userData.teacher_status || userData.teacherStatus || 'verified')
              };

              console.log(`%c👤 [AuthContext] Session ready. Role: ${finalUser.role}, Status: ${finalUser.teacherStatus}`, 'color: #2099e9; font-weight: bold');
              localStorage.setItem('user', JSON.stringify(finalUser));
              setUser(finalUser);
            } else {
              throw new Error('Profile determination failed');
            }
          } catch (error) {
            console.warn('%c⚠️ [AuthContext] Profile sync encountered issues, using fallback logic', 'color: #f59e0b', error.message);
            
            const role = isTeacherIntent ? 'teacher' : 'student';
            const basicUser = {
              id: session.user.id,
              email: session.user.email,
              displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
              firebaseUid: session.user.id,
              uid: session.user.id,
              role: role,
              teacherStatus: role === 'teacher' ? 'pending' : 'verified',
              teacher_status: role === 'teacher' ? 'pending' : 'verified'
            };
            
            setUser(basicUser);
            localStorage.setItem('user', JSON.stringify(basicUser));
            localStorage.removeItem('pending_role');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('%c👋 [AuthContext] Session terminated', 'color: #ef4444; font-weight: bold');
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
      // Special check for hardcoded admin
      if (email === 'quantrivien@gmail.com' && password === 'qtv123@') {
        const adminData = {
          email: 'quantrivien@gmail.com',
          displayName: 'Quản trị viên',
          role: 'admin',
          uid: 'admin-hardcoded',
          id: 'admin-hardcoded',
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(adminData));
        localStorage.setItem('physigame_admin', JSON.stringify({
          email: adminData.email,
          name: adminData.displayName,
          role: 'super_admin',
          loginTime: adminData.loginTime
        }));
        setUser(adminData);
        return adminData;
      }

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

  const register = async (username, email, password, role = 'student') => {
    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: username,
            role: role
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
          firebaseUid: data.user.id,
          role: role,
          teacherStatus: role === 'teacher' ? 'pending' : 'verified'
        });

        // Explicitly sync to "teacher profile" table for Admin Dashboard visibility
        if (role === 'teacher') {
          await supabase
            .from('teacher profile')
            .upsert({
              id: data.user.id,
              name: username,
              email: email,
              teacherStatus: 'pending',
              subject: 'Chưa cập nhật',
              school: 'Chưa cập nhật',
              createdAt: new Date().toISOString()
            });
        }
      } catch (syncError) {
        console.warn('⚠️ Profile sync may have failed:', syncError.message);
      }

      // Fetch the profile
      try {
        const response = await api.get(`/users/firebase/${data.user.id}`);
        if (response.data) {
          const userData = { 
            ...response.data, 
            firebaseUid: data.user.id, 
            uid: data.user.id,
            role: role,
            teacherStatus: role === 'teacher' ? 'pending' : 'verified'
          };
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
          role: role,
          teacherStatus: role === 'teacher' ? 'pending' : 'verified',
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

  const loginWithGoogle = async (role = 'student') => {
    try {
      // Store intended role for new accounts
      localStorage.setItem('pending_role', role);

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

  // Inactivity Auto-Logout
  useEffect(() => {
    if (!user) return;
    const isStudent = !['admin', 'super_admin', 'teacher'].includes(user.role);
    if (!isStudent) return;

    let timeoutId;
    let activityTimer;
    let timeoutMinutes = 30;

    const setupTimer = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/settings');
        const settings = await response.json();
        if (settings.sessionTimeout) {
          timeoutMinutes = Number(settings.sessionTimeout);
          console.log(`[Auth] Cập nhật thời gian hết hạn phiên từ máy chủ: ${timeoutMinutes} phút`);
        }
      } catch (e) {
        console.error('Failed to fetch session timeout', e);
      }
      resetTimer();
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      console.log(`[Auth] Bắt đầu đếm ngược ${timeoutMinutes} phút không hoạt động...`);
      timeoutId = setTimeout(async () => {
         console.log(`[Auth] Đã quá ${timeoutMinutes} phút không hoạt động. Thực hiện đăng xuất!`);
         try {
           await logout();
         } catch (err) {
           console.error("Supabase logout error, forcing local logout", err);
           localStorage.removeItem('token');
           localStorage.removeItem('user');
           setUser(null);
         } finally {
           alert('Phiên làm việc của bạn đã hết hạn do không có hoạt động. Vui lòng đăng nhập lại.');
           window.location.href = '/login';
         }
      }, timeoutMinutes * 60 * 1000);
    };

    const handleActivity = () => {
      if (activityTimer) return;
      activityTimer = setTimeout(() => {
        resetTimer();
        activityTimer = null;
      }, 10000); // 10s throttle
    };

    setupTimer();
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (activityTimer) clearTimeout(activityTimer);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [user ? 'logged_in' : 'logged_out']);

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      console.log('🔄 [AuthContext] Force refreshing user profile from source...');

      // Dual fetch for maximum consistency
      const [apiRes, supabaseRes] = await Promise.all([
        api.get(`/users/firebase/${session.user.id}`).catch(() => null),
        supabase.from('users').select('*').eq('id', session.user.id).single()
      ]);

      const dbUser = supabaseRes.data;
      const apiUser = apiRes?.data;

      if (dbUser || apiUser) {
        const mergedUser = {
          ...(apiUser || {}),
          ...(dbUser || {}),
          displayName: dbUser?.display_name || apiUser?.displayName || apiUser?.display_name || '',
          id: session.user.id,
          uid: session.user.id,
          firebaseUid: session.user.id,
          // Explicitly map status for guards
          teacherStatus: dbUser?.teacher_status || apiUser?.teacherStatus || 'pending',
          teacher_status: dbUser?.teacher_status || apiUser?.teacher_status || 'pending'
        };

        localStorage.setItem('user', JSON.stringify(mergedUser));
        setUser(mergedUser);
        console.log(`✅ [AuthContext] Refresh complete. Status: ${mergedUser.teacher_status}`);
        return mergedUser;
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

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../config/supabase';
import api from '../config/api';

const AuthContext = createContext();

// Safe localStorage parsing to prevent app crashes on corrupt data
const safeGetItem = (key, fallback = null) => {
  const value = localStorage.getItem(key);
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (e) {
    console.error(`Error parsing localStorage key "${key}":`, e);
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`Failed to auto-heal corrupted key "${key}":`, err);
    }
    return fallback;
  }
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchingUserRef = useRef(null);
  const loadingTimeoutRef = useRef(null);

  // Check session on mount
  useEffect(() => {
    // Reset on mount/reload to prevent stale refs blocking profile loads
    fetchingUserRef.current = null;

    // Safety timeout: force loading=false after 10s to prevent infinite loading screen
    loadingTimeoutRef.current = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          console.warn('⚠️ [AuthContext] Loading safety timeout (10s). Using cached data.');
          const cachedUser = safeGetItem('user');
          if (cachedUser) {
            setUser(cachedUser);
          }
        }
        return false;
      });
    }, 10000);

    const checkAuth = async () => {
      try {
        // Get current Supabase session
        // Timeout prevents hanging when Supabase token refresh stalls
        const { data: { session } } = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('getSession timeout')), 8000))
        ]);

        if (session?.user) {
          console.log('✅ Supabase session found:', session.user.email);

          if (fetchingUserRef.current === session.user.id) {
            console.log('ℹ️ [AuthContext] checkAuth: Profile already being fetched or loaded, skipping duplicate');
            return;
          }
          fetchingUserRef.current = session.user.id;

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
              
              const { data: { session: currentSession } } = await supabase.auth.getSession();
              if (!currentSession || currentSession.user.id !== session.user.id) {
                return;
              }

              if (userData.status === 'inactive') {
                console.warn('⚠️ User account is inactive. Logging out.');
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                supabase.auth.signOut().finally(() => {
                  window.location.href = '/login?error=deactivated';
                });
              } else {
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                console.log('✅ User profile loaded:', userData.email);
              }
            }
          } catch (profileError) {
            const isDeactivatedError = profileError.response?.status === 403 && 
              (profileError.response?.data?.message?.includes('vô hiệu hóa') || 
               profileError.response?.data?.message?.includes('disabled') || 
               profileError.response?.data?.message?.includes('inactive'));

            if (isDeactivatedError) {
              console.warn('⚠️ User account is inactive on profile fetch error. Logging out.');
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              supabase.auth.signOut().finally(() => {
                window.location.href = '/login?error=deactivated';
              });
              return;
            }

            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession || currentSession.user.id !== session.user.id) {
              return;
            }
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
          const savedUser = safeGetItem('user');
          if (savedUser) {
            setUser(savedUser);
          }
          console.log('ℹ️ No active session');
        }
      } catch (error) {
        // getSession timeout is expected on reload - handled gracefully via cached data
        if (error.message?.includes('timeout')) {
          console.warn('⚠️ [AuthContext] Session check timed out, using cached data');
        } else {
          console.error('❌ Auth check error:', error);
        }
        // Fall back to cached user to avoid redirect to login
        const cachedUser = safeGetItem('user');
        if (cachedUser) {
          setUser(cachedUser);
        }
      } finally {
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`%c🔄 [AuthContext] ${timestamp} - Event: ${event}`, 'color: #2099e9; font-weight: bold', session?.user?.email);

        // Handle TOKEN_REFRESHED - update stored token without re-fetching profile
        if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔄 [AuthContext] Token refreshed, updating stored token');
          localStorage.setItem('token', session.access_token);
          return;
        }

        // INITIAL_SESSION is handled by checkAuth(), skip to avoid double-processing
        if (event === 'INITIAL_SESSION') {
          console.log('ℹ️ [AuthContext] INITIAL_SESSION event, handled by checkAuth');
          return;
        }

        if (event === 'SIGNED_IN' && session) {
          if (fetchingUserRef.current === session.user.id) {
            console.log('ℹ️ [AuthContext] onAuthStateChange SIGNED_IN: Profile already fetching or loaded, skipping duplicate');
            return;
          }
          fetchingUserRef.current = session.user.id;

          localStorage.setItem('token', session.access_token);

          // 1. Get Intent from LocalStorage
          const intentRole = localStorage.getItem('pending_role');
          const isTeacherIntent = intentRole === 'teacher';
          
          if (intentRole) {
            console.log(`%c🎯 [AuthContext] Role intent found in storage: ${intentRole}`, 'color: #274dad; font-weight: bold; font-size: 14px');
          }

          try {
            // 2. Fetch existing profile from dual sources for consistency
            console.log('📡 [AuthContext] Fetching profile from dual sources...');
            const [apiRes, supabaseRes] = await Promise.race([
              Promise.all([
                api.get(`/users/firebase/${session.user.id}`).catch(() => null),
                Promise.resolve(supabase.from('users').select('*').eq('id', session.user.id).single()).catch(() => ({ data: null }))
              ]),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 8000))
            ]);

            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession || currentSession.user.id !== session.user.id) {
              console.warn('⚠️ Session changed or terminated during load. Aborting profile set.');
              return;
            }

            const dbUser = supabaseRes?.data;
            const apiUser = apiRes?.data;

            let userData = null;
            if (dbUser || apiUser) {
              userData = {
                ...(apiUser || {}),
                ...(dbUser || {}),
                displayName: dbUser?.display_name || apiUser?.displayName || apiUser?.display_name || '',
                id: session.user.id,
                uid: session.user.id,
                firebaseUid: session.user.id,
                role: dbUser?.role || apiUser?.role,
                teacherStatus: dbUser?.teacher_status || apiUser?.teacherStatus || apiUser?.teacher_status,
                teacher_status: dbUser?.teacher_status || apiUser?.teacher_status || apiUser?.teacherStatus
              };
            }

            const isAlreadyTeacher = userData?.role === 'teacher';
            const existingStatus = userData?.teacherStatus || userData?.teacher_status;

            // 3. ATOMIC SYNC: If intent is teacher and they aren't already a teacher with status, register them
            if (isTeacherIntent) {
              const hasExistingStatus = isAlreadyTeacher && (existingStatus === 'verified' || existingStatus === 'pending' || existingStatus === 'rejected');
              
              if (hasExistingStatus) {
                console.log(`%cℹ️ [AuthContext] User is already a teacher with status: ${existingStatus}. Preserving status.`, 'color: #10b981; font-weight: bold');
                localStorage.removeItem('pending_role');
              } else {
                console.log('%c🚀 [AuthContext] Teacher path triggered. Synchronizing database...', 'color: #2099e9; font-weight: black');
                
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
                    teacherStatus: 'pending'
                  });
                } catch (apiErr) {
                  console.warn('⚠️ [AuthContext] Backend API sync skipped or failed');
                }
                
                // Update local userData
                userData = { 
                  ...(userData || {}), 
                  ...teacherSyncData,
                  displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
                  id: session.user.id,
                  uid: session.user.id,
                  teacherStatus: 'pending',
                  teacher_status: 'pending'
                };
                
                localStorage.removeItem('pending_role');
                console.log('%c✅ [AuthContext] Teacher sync completed successfully!', 'color: #10b981; font-weight: bold');
              }
            }

            if (userData) {
              if (userData.status === 'inactive') {
                console.warn('⚠️ User account is inactive. Logging out.');
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                supabase.auth.signOut().finally(() => {
                  window.location.href = '/login?error=deactivated';
                });
                return;
              }

              // Decide final role and teacher status
              const isTeacher = isAlreadyTeacher || isTeacherIntent;
              let finalStatus = 'verified';

              if (isTeacher) {
                if (isTeacherIntent && !isAlreadyTeacher) {
                  finalStatus = 'pending';
                } else {
                  finalStatus = existingStatus || 'pending';
                }
              }

              const finalUser = {
                ...userData,
                email: userData.email || session.user.email,
                displayName: userData.displayName || userData.display_name || session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
                role: isTeacher ? 'teacher' : (userData.role || 'student'),
                teacherStatus: finalStatus,
                teacher_status: finalStatus
              };

              console.log(`%c👤 [AuthContext] Session ready. Role: ${finalUser.role}, Status: ${finalUser.teacherStatus}`, 'color: #2099e9; font-weight: bold');
              localStorage.setItem('user', JSON.stringify(finalUser));
              setUser(finalUser);
              if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
              setLoading(false);
            } else {
              throw new Error('Profile determination failed');
            }
          } catch (error) {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession || currentSession.user.id !== session.user.id) {
              return;
            }
            console.warn('%c⚠️ [AuthContext] Profile sync encountered issues, using fallback logic', 'color: #f59e0b', error.message);
            
            // Check localStorage cached user or metadata before defaulting to student
            const cachedUser = safeGetItem('user');
            const role = isTeacherIntent ? 'teacher' : (cachedUser?.role || 'student');
            
            const basicUser = {
              id: session.user.id,
              email: session.user.email,
              displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
              firebaseUid: session.user.id,
              uid: session.user.id,
              role: role,
              teacherStatus: role === 'teacher' ? (cachedUser?.teacherStatus || 'pending') : 'verified',
              teacher_status: role === 'teacher' ? (cachedUser?.teacher_status || 'pending') : 'verified'
            };
            
            setUser(basicUser);
            localStorage.setItem('user', JSON.stringify(basicUser));
            localStorage.removeItem('pending_role');
            if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('%c👋 [AuthContext] Session terminated', 'color: #ef4444; font-weight: bold');
          fetchingUserRef.current = null;
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, []);

  // Listen for realtime updates from Supabase 'users' table and local storage events
  // Listen for realtime updates from Supabase 'users' table and local storage events
  // State for deactivation warning overlay
  const [deactivatedWarning, setDeactivatedWarning] = useState(null);
  const deactivationTimerRef = useRef(null);

  // Show warning overlay with countdown before kicking out
  const showDeactivationWarning = useCallback((userName) => {
    // Prevent duplicate triggers
    if (deactivatedWarning) return;
    setDeactivatedWarning({ name: userName || 'bạn', countdown: 5 });
  }, [deactivatedWarning]);

  // Perform actual logout after warning
  const doForcedLogout = useCallback(() => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('physigame_admin');
    } catch (e) {}
    setUser(null);
    supabase.auth.signOut().catch(() => {});
    window.location.href = '/login';
  }, []);

  // Countdown effect when warning is shown
  useEffect(() => {
    if (!deactivatedWarning) return;
    if (deactivatedWarning.countdown <= 0) {
      doForcedLogout();
      return;
    }
    deactivationTimerRef.current = setTimeout(() => {
      setDeactivatedWarning(prev => prev ? { ...prev, countdown: prev.countdown - 1 } : null);
    }, 1000);
    return () => clearTimeout(deactivationTimerRef.current);
  }, [deactivatedWarning, doForcedLogout]);

  // Legacy helper kept for backward-compat — now shows warning instead of instant kick
  // Use a ref to always hold the latest version (avoids stale closure in setInterval)
  const logoutSilentKickoutRef = useRef(null);
  const logoutSilentKickout = useCallback((userName) => {
    showDeactivationWarning(userName);
  }, [showDeactivationWarning]);
  // Keep ref in sync with latest callback
  logoutSilentKickoutRef.current = logoutSilentKickout;

  // Listen for realtime updates from Supabase 'users' table, BroadcastChannel, and local storage events
  useEffect(() => {
    const currentUserId = user?.id || user?.uid;
    const currentUserEmail = user?.email;
    const currentUserName = user?.displayName || user?.display_name || user?.username || 'bạn';
    if (!currentUserId || currentUserId === 'admin-hardcoded') return;

    // Helper: detect inactive from BOTH status and teacher_status
    const isDeactivatedRecord = (rec) => {
      if (!rec) return false;
      if (rec.status === 'inactive') return true;
      if (rec.teacher_status === 'inactive') return true;
      return false;
    };

    // Check immediately if current user is marked inactive in admin cache
    const isInactiveInCache = () => {
      try {
        const cachedAdminUsersStr = localStorage.getItem('physigame_admin_users_cache');
        if (cachedAdminUsersStr) {
          const cachedUsers = JSON.parse(cachedAdminUsersStr);
          const match = cachedUsers.find(u =>
            (u.id && String(u.id) === String(currentUserId)) ||
            (u.email && currentUserEmail && u.email.toLowerCase() === currentUserEmail.toLowerCase())
          );
          if (match && isDeactivatedRecord(match)) return true;
        }
      } catch (e) {}
      return false;
    };

    if (isDeactivatedRecord(user) || isInactiveInCache()) {
      console.warn('⚠️ User account is inactive on effect mount. Showing deactivation warning.');
      logoutSilentKickoutRef.current?.(currentUserName);
      return;
    }

    // 1. BroadcastChannel — instant cross-tab/same-browser locking
    let adminBc;
    try {
      adminBc = new BroadcastChannel('physigame_admin_actions');
      adminBc.onmessage = (event) => {
        const msg = event.data;
        if (msg && msg.type === 'USER_STATUS_UPDATED') {
          const isTargetUser =
            (msg.id && String(msg.id) === String(currentUserId)) ||
            (msg.email && currentUserEmail && msg.email.toLowerCase() === currentUserEmail.toLowerCase());
          if (isTargetUser && msg.status === 'inactive') {
            console.warn('⚡ [AuthContext] BroadcastChannel: account locked. Showing warning.');
            logoutSilentKickoutRef.current?.(msg.name || msg.username || currentUserName);
          }
        }
      };
    } catch (e) {}

    // 2. Supabase Realtime — cross-browser locking via DB events
    const channel = supabase
      .channel(`public_users_update_${currentUserId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' },
        (payload) => {
          const updated = payload.new;
          if (!updated) return;
          const isMatch =
            (updated.id && String(updated.id) === String(currentUserId)) ||
            (updated.email && currentUserEmail && updated.email.toLowerCase() === currentUserEmail.toLowerCase());
          if (isMatch && isDeactivatedRecord(updated)) {
            console.warn('⚠️ [AuthContext] Realtime: account deactivated. Showing warning.');
            logoutSilentKickoutRef.current?.(updated.display_name || currentUserName);
          }
        }
      )
      .subscribe();

    // 3. Polling backup — every 4s, uses backend API (service role, bypasses RLS)
    //    More reliable than Supabase anon key which can be blocked by RLS
    let pollActive = true; // prevent multiple triggers after warning shown
    const interval = setInterval(async () => {
      if (!pollActive) return;
      try {
        if (isInactiveInCache()) {
          pollActive = false;
          logoutSilentKickoutRef.current?.(currentUserName);
          return;
        }
        if (currentUserEmail) {
          const response = await api.get('/users/check-status', {
            params: { email: currentUserEmail }
          });
          const statusData = response?.data;
          console.log(`[AuthContext] Poll check: status=${statusData?.status}, teacher_status=${statusData?.teacher_status}`);
          if (statusData?.isDeactivated) {
            pollActive = false;
            console.warn('⚠️ [AuthContext] Polling (API): account deactivated! Showing warning.');
            logoutSilentKickoutRef.current?.(statusData.display_name || currentUserName);
          }
        }
      } catch (e) {
        // If 403 from api interceptor, let it handle it. Log other errors.
        if (e?.response?.status !== 403) {
          console.warn('[AuthContext] Poll error (non-fatal):', e?.message);
        }
      }
    }, 4000);

    // 4. localStorage/storage event — same-browser cross-tab via storage events
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'physigame_admin_users_cache' || !e.key) {
        if (isInactiveInCache()) {
          logoutSilentKickoutRef.current?.(currentUserName);
          return;
        }
        const cached = safeGetItem('user');
        if (cached) {
          if (isDeactivatedRecord(cached)) {
            logoutSilentKickoutRef.current?.(cached.displayName || cached.display_name || cached.username || currentUserName);
            return;
          }
          setUser(cached);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (adminBc) adminBc.close();
      supabase.removeChannel(channel);
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user?.id, user?.uid, user?.status, user?.teacher_status, user?.email, user?.role]);

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

      // Check 1: Check admin users cache in localStorage
      try {
        const cachedAdminUsersStr = localStorage.getItem('physigame_admin_users_cache');
        if (cachedAdminUsersStr) {
          const cachedUsers = JSON.parse(cachedAdminUsersStr);
          const cachedTarget = cachedUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
          if (cachedTarget && cachedTarget.status === 'inactive') {
            throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên.');
          }
        }
      } catch (e) {
        if (e.message?.includes('bị khóa')) throw e;
      }

      // Check 2: Check Supabase Users DB first to verify status by Email
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (dbUser && (dbUser.status === 'inactive' || dbUser.teacher_status === 'inactive')) {
        throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw new Error(error.message);

      localStorage.setItem('token', data.session.access_token);

      // Fetch profile
      let userData;
      try {
        const response = await api.get(`/users/firebase/${data.user.id}`);
        userData = { ...response.data, firebaseUid: data.user.id, uid: data.user.id };
      } catch (err) {
        userData = dbUser ? { ...dbUser, uid: dbUser.id } : { email: data.user.email, id: data.user.id };
      }

      if (userData.status === 'inactive' || userData.teacher_status === 'inactive') {
        await supabase.auth.signOut().catch(() => {});
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên.');
      }

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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('physigame_admin');
    sessionStorage.clear();
    setUser(null);

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut failed:', err);
    }
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
        const response = await fetch('/api/settings');
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

        if (mergedUser.status === 'inactive') {
          console.warn('⚠️ User account is inactive on refresh. Logging out.');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          supabase.auth.signOut().finally(() => {
            window.location.href = '/login?error=deactivated';
          });
          return null;
        }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#274dad] border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-lg shadow-[#274dad]/10"></div>
          <h2 className="text-2xl font-black text-[#274dad] italic tracking-tight mb-2">Eureka</h2>
          <p className="text-slate-500 font-bold text-sm tracking-wide uppercase">Đang tải học viện vật lý...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}

      {/* ===== Account Deactivation Warning Overlay ===== */}
      {deactivatedWarning && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            animation: 'deactivated-fadein 0.3s ease'
          }}
        >
          <style>{`
            @keyframes deactivated-fadein {
              from { opacity: 0; transform: scale(0.96); }
              to   { opacity: 1; transform: scale(1); }
            }
            @keyframes deactivated-pulse-ring {
              0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
              70%  { box-shadow: 0 0 0 18px rgba(239,68,68,0); }
              100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
            }
            @keyframes deactivated-countdown {
              from { stroke-dashoffset: 0; }
              to   { stroke-dashoffset: 100; }
            }
          `}</style>

          <div style={{
            background: '#fff',
            borderRadius: '2rem',
            padding: '2.5rem 2rem',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 32px 64px -12px rgba(239,68,68,0.25), 0 4px 16px rgba(0,0,0,0.12)',
            border: '2px solid #fee2e2',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Red glow bar top */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)',
              backgroundSize: '200% 100%',
              animation: 'deactivated-fadein 0.3s ease'
            }} />

            {/* Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              animation: 'deactivated-pulse-ring 1.5s ease infinite'
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '1.375rem',
              fontWeight: '900',
              color: '#1e293b',
              marginBottom: '0.75rem',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              lineHeight: 1.2
            }}>Tài khoản bị vô hiệu hóa</h2>

            {/* Description */}
            <p style={{
              fontSize: '0.9375rem',
              color: '#64748b',
              fontWeight: '600',
              lineHeight: 1.6,
              marginBottom: '0.5rem',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              Tài khoản của <strong style={{ color: '#ef4444' }}>{deactivatedWarning.name}</strong> đã bị
              Quản trị viên <strong>vô hiệu hóa</strong>.
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              marginBottom: '2rem',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: '500'
            }}>Bạn sẽ tự động đăng xuất khỏi hệ thống.</p>

            {/* Countdown ring */}
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="36" cy="36" r="30" fill="none" stroke="#fee2e2" strokeWidth="5" />
                <circle
                  cx="36" cy="36" r="30"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="188.5"
                  strokeDashoffset={188.5 * (1 - deactivatedWarning.countdown / 5)}
                  style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                />
              </svg>
              <span style={{
                position: 'absolute',
                fontSize: '1.5rem',
                fontWeight: '900',
                color: '#ef4444',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>{deactivatedWarning.countdown}</span>
            </div>

            {/* Contact info */}
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '1rem',
              padding: '0.875rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <p style={{
                fontSize: '0.8rem',
                color: '#b91c1c',
                fontWeight: '700',
                textAlign: 'left',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                lineHeight: 1.4
              }}>Liên hệ Quản trị viên để khiếu nại hoặc mở lại tài khoản.</p>
            </div>
          </div>
        </div>
      )}
      {/* ================================================ */}
    </AuthContext.Provider>
  );
};

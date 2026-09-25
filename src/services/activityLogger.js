const getUserId = () => {
  try {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return user?.id || user?.uid || user?.email || 'anonymous';
  } catch {
    return 'anonymous';
  }
};

export const logSessionActivity = (type, title, detail, xp = 0) => {
  try {
    const userId = getUserId();
    const key = `session_activities_${userId}`;
    const existing = JSON.parse(sessionStorage.getItem(key) || '[]');

    // Add new activity at the start
    existing.unshift({
      type,
      title,
      detail,
      xp,
      time: new Date().toISOString()
    });

    // Keep top 100
    sessionStorage.setItem(key, JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.error('Error logging session activity:', e);
  }
};

export const getSessionActivities = () => {
  try {
    const userId = getUserId();
    const key = `session_activities_${userId}`;
    let activities = JSON.parse(sessionStorage.getItem(key) || '[]');

    // If specific key is empty, check any session_activities_ key as fallback
    if (!activities.length) {
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith('session_activities_')) {
          try {
            const parsed = JSON.parse(sessionStorage.getItem(k) || '[]');
            if (Array.isArray(parsed) && parsed.length > 0) {
              activities = parsed;
              break;
            }
          } catch {}
        }
      }
    }

    // Display activities that grant XP or are completed lessons/exercises
    return activities.filter(act => (act.xp || 0) > 0 || act.type === 'lesson');
  } catch (e) {
    console.error('Error getting session activities:', e);
    return [];
  }
};

export const clearSessionActivities = (userId) => {
  try {
    if (userId) {
      sessionStorage.removeItem(`session_activities_${userId}`);
    }
    const currentId = getUserId();
    if (currentId) {
      sessionStorage.removeItem(`session_activities_${currentId}`);
    }
    // Remove all session activity keys
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith('session_activities_')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => sessionStorage.removeItem(k));
  } catch (e) {
    console.error('Error clearing session activities:', e);
  }
};


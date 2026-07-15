export const logSessionActivity = (type, title, detail, xp = 0) => {
  try {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.uid || user?.id || 'anonymous';

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
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.uid || user?.id || 'anonymous';

    const key = `session_activities_${userId}`;
    const activities = JSON.parse(sessionStorage.getItem(key) || '[]');

    // ONLY display activities that grant XP!
    return activities.filter(act => (act.xp || 0) > 0);
  } catch (e) {
    console.error('Error getting session activities:', e);
    return [];
  }
};

import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import api from '../config/api';
import BackNavButton from '../components/ui/BackNavButton';

const Profile = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/users/profile/${user.uid}`);
        setUserData(response.data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.response?.data?.message || 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Calculate stats from user data
  const stats = userData ? {
    totalLessons: 36, // Total available lessons (can be fetched from lessons API)
    completedLessons: userData.progress?.completedLessons?.length || 0,
    totalPoints: userData.progress?.totalPoints || 0,
    currentStreak: userData.progress?.currentStreak || 0,
    averageScore: userData.progress?.completedLessons?.length > 0
      ? Math.round(
          userData.progress.completedLessons.reduce((sum, lesson) => sum + (lesson.score || 0), 0) /
          userData.progress.completedLessons.length
        )
      : 0,
    studyTime: formatStudyTime(userData.progress?.totalStudyTime || 0)
  } : {
    totalLessons: 0,
    completedLessons: 0,
    totalPoints: 0,
    currentStreak: 0,
    averageScore: 0,
    studyTime: '0h 0m'
  };

  // Helper function to format study time
  function formatStudyTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  // Helper function to calculate progress by level/difficulty
  function calculateProgressByLevel(completedLessons) {
    // Assuming lessons are organized: 
    // Class 8: Chapters 1-4 (Basic), 5-8 (Intermediate), 9-12 (Advanced)
    // Total: ~12 lessons per level = 36 total
    const levels = [
      { name: 'Cấp độ Cơ bản', chapters: [1, 2, 3, 4], color: 'success', total: 12 },
      { name: 'Cấp độ Trung cấp', chapters: [5, 6, 7, 8], color: 'primary', total: 12 },
      { name: 'Cấp độ Nâng cao', chapters: [9, 10, 11, 12], color: 'warning', total: 12 },
    ];

    return levels.map(level => {
      const completed = completedLessons.filter(lesson => 
        level.chapters.includes(lesson.chapterId)
      ).length;
      const percentage = level.total > 0 ? Math.round((completed / level.total) * 100) : 0;
      
      return {
        ...level,
        completed,
        percentage
      };
    });
  }

  // Dynamic achievements based on user stats
  const achievements = [
    { 
      id: 1, 
      title: '7 ngày liên tục', 
      icon: '🔥', 
      unlocked: stats.currentStreak >= 7 
    },
    { 
      id: 2, 
      title: 'Hoàn thành 5 bài', 
      icon: '⭐', 
      unlocked: stats.completedLessons >= 5 
    },
    { 
      id: 3, 
      title: '100% một bài', 
      icon: '🏆', 
      unlocked: userData?.progress?.completedLessons?.some(lesson => lesson.score === 100) || false
    },
    { 
      id: 4, 
      title: 'Hoàn thành 10 bài', 
      icon: '🎓', 
      unlocked: stats.completedLessons >= 10 
    },
    { 
      id: 5, 
      title: '14 ngày liên tục', 
      icon: '💪', 
      unlocked: stats.currentStreak >= 14 
    },
    { 
      id: 6, 
      title: '1000 điểm', 
      icon: '💎', 
      unlocked: stats.totalPoints >= 1000 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center text-red-600">
            <p className="text-xl font-bold mb-2">⚠️ Lỗi</p>
            <p>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-4">
          <BackNavButton fallbackPath="/program-selection" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Hồ sơ của tôi</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* User Info Card */}
          <Card className="md:col-span-1">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {userData?.profile?.avatar ? (
                  <img 
                    src={userData.profile.avatar} 
                    alt="Avatar" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">
                    {userData?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '👤'}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                {userData?.displayName || userData?.username || user?.email?.split('@')[0] || 'Học viên'}
              </h2>
              <p className="text-gray-600 text-sm mb-4">{userData?.email || user?.email}</p>
              <div className="bg-primary-50 rounded-lg p-3">
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  Level {userData?.level || 1}
                </div>
                <ProgressBar 
                  progress={((userData?.xp || 0) % 100)} 
                  className="h-2"
                />
                <p className="text-xs text-gray-600 mt-2">
                  {100 - ((userData?.xp || 0) % 100)} điểm nữa đến level tiếp theo
                </p>
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <Card>
              <div className="text-center">
                <div className="text-4xl mb-2">📚</div>
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {stats.completedLessons}/{stats.totalLessons}
                </div>
                <div className="text-sm text-gray-600">Bài học hoàn thành</div>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="text-4xl mb-2">🔥</div>
                <div className="text-3xl font-bold text-warning mb-1">
                  {stats.currentStreak}
                </div>
                <div className="text-sm text-gray-600">Ngày liên tục</div>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="text-4xl mb-2">⭐</div>
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {stats.totalPoints}
                </div>
                <div className="text-sm text-gray-600">Tổng điểm</div>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <div className="text-3xl font-bold text-success mb-1">
                  {stats.averageScore}%
                </div>
                <div className="text-sm text-gray-600">Điểm trung bình</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Progress by Level */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Tiến độ theo cấp độ</h2>
          
          <div className="space-y-6">
            {calculateProgressByLevel(userData?.progress?.completedLessons || []).map((levelData, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">{levelData.name}</span>
                  <span className="text-gray-600">{levelData.percentage}%</span>
                </div>
                <ProgressBar progress={levelData.percentage} color={levelData.color} />
                <p className="text-sm text-gray-500 mt-1">
                  {levelData.completed}/{levelData.total} bài học hoàn thành
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Achievements */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Thành tích</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`text-center p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked
                    ? 'border-primary-200 bg-primary-50'
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <p className="text-sm font-medium text-gray-700">{achievement.title}</p>
                {achievement.unlocked && (
                  <p className="text-xs text-success mt-1">✓ Đã mở khóa</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

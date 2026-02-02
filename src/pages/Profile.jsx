import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import api from '../config/api';
import { 
  Trophy, Star, Flame, Target, Zap, Clock, 
  BookOpen, Award, Medal, Crown, Shield, Gift,
  TrendingUp, Calendar, Edit3, Camera, ChevronRight,
  Swords, Users, CheckCircle, Lock
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [questData, setQuestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    school: '',
    grade: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch user profile and quest data in parallel
        const [profileRes, questRes] = await Promise.all([
          api.get(`/users/profile/${user.uid}`),
          api.get(`/quests/${user.uid}`).catch(() => ({ data: null }))
        ]);
        
        setUserData(profileRes.data);
        setQuestData(questRes.data);
        
        // Initialize edit form
        setEditForm({
          displayName: profileRes.data?.displayName || '',
          bio: profileRes.data?.profile?.bio || '',
          school: profileRes.data?.profile?.school || '',
          grade: profileRes.data?.profile?.grade || ''
        });
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.response?.data?.message || 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      await api.put(`/users/profile/${user.uid}`, editForm);
      setUserData(prev => ({
        ...prev,
        displayName: editForm.displayName,
        profile: {
          ...prev.profile,
          bio: editForm.bio,
          school: editForm.school,
          grade: editForm.grade
        }
      }));
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  // Calculate stats from user data
  const stats = userData ? {
    totalLessons: 36,
    completedLessons: userData.progress?.completedLessons?.length || 0,
    totalPoints: userData.progress?.totalPoints || 0,
    currentStreak: questData?.loginStreak?.current || userData.progress?.currentStreak || 0,
    longestStreak: questData?.loginStreak?.longest || userData.progress?.longestStreak || 0,
    averageScore: userData.progress?.completedLessons?.length > 0
      ? Math.round(
          userData.progress.completedLessons.reduce((sum, lesson) => sum + (lesson.score || 0), 0) /
          userData.progress.completedLessons.length
        )
      : 0,
    studyTime: formatStudyTime(userData.progress?.totalStudyTime || 0),
    totalXP: userData?.xp || 0,
    level: userData?.level || 1,
    pkWins: userData?.pkStats?.wins || 0,
    pkLosses: userData?.pkStats?.losses || 0,
    pkRating: userData?.pkStats?.rating || 1000,
    achievementsUnlocked: questData?.achievements?.filter(a => a.unlockedAt)?.length || 0,
    totalAchievements: questData?.achievements?.length || 12,
    questsCompleted: questData?.statistics?.totalQuestsCompleted || 0,
    rewardsEarned: questData?.statistics?.totalRewardsEarned || 0
  } : {
    totalLessons: 0,
    completedLessons: 0,
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageScore: 0,
    studyTime: '0h 0m',
    totalXP: 0,
    level: 1,
    pkWins: 0,
    pkLosses: 0,
    pkRating: 1000,
    achievementsUnlocked: 0,
    totalAchievements: 12,
    questsCompleted: 0,
    rewardsEarned: 0
  };

  // Calculate XP progress to next level
  const xpForCurrentLevel = (stats.level - 1) * 100;
  const xpForNextLevel = stats.level * 100;
  const currentLevelXP = stats.totalXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - stats.totalXP;
  const levelProgress = (currentLevelXP / 100) * 100;

  // Helper function to format study time
  function formatStudyTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  // Get rank based on XP/Level
  function getRank(level) {
    if (level >= 50) return { name: 'Huyền Thoại', icon: Crown, color: 'text-yellow-500', bgColor: 'bg-yellow-100' };
    if (level >= 30) return { name: 'Kim Cương', icon: Medal, color: 'text-cyan-500', bgColor: 'bg-cyan-100' };
    if (level >= 20) return { name: 'Bạch Kim', icon: Shield, color: 'text-purple-500', bgColor: 'bg-purple-100' };
    if (level >= 10) return { name: 'Vàng', icon: Trophy, color: 'text-amber-500', bgColor: 'bg-amber-100' };
    if (level >= 5) return { name: 'Bạc', icon: Award, color: 'text-gray-400', bgColor: 'bg-gray-100' };
    return { name: 'Đồng', icon: Star, color: 'text-orange-600', bgColor: 'bg-orange-100' };
  }

  const rank = getRank(stats.level);

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

  // Dynamic achievements based on user stats and quest data
  const allAchievements = questData?.achievements || [
    { id: 'first_lesson', title: 'Bước Đầu Tiên', icon: '🎯', description: 'Hoàn thành bài học đầu tiên', unlockedAt: stats.completedLessons >= 1 ? new Date() : null },
    { id: 'streak_7', title: 'Tuần Lễ Rực Lửa', icon: '🔥', description: '7 ngày học liên tục', unlockedAt: stats.currentStreak >= 7 ? new Date() : null },
    { id: 'lessons_5', title: 'Học Sinh Chăm Chỉ', icon: '⭐', description: 'Hoàn thành 5 bài học', unlockedAt: stats.completedLessons >= 5 ? new Date() : null },
    { id: 'perfect_score', title: 'Hoàn Hảo', icon: '🏆', description: 'Đạt điểm tuyệt đối trong một bài học', unlockedAt: userData?.progress?.completedLessons?.some(l => l.score === 100) ? new Date() : null },
    { id: 'lessons_10', title: 'Nhà Khoa Học Nhí', icon: '🎓', description: 'Hoàn thành 10 bài học', unlockedAt: stats.completedLessons >= 10 ? new Date() : null },
    { id: 'streak_14', title: 'Kiên Trì', icon: '💪', description: '14 ngày học liên tục', unlockedAt: stats.currentStreak >= 14 ? new Date() : null },
    { id: 'xp_1000', title: 'Chuyên Gia', icon: '💎', description: 'Đạt 1000 XP', unlockedAt: stats.totalXP >= 1000 ? new Date() : null },
    { id: 'pk_first_win', title: 'Chiến Thắng Đầu Tiên', icon: '⚔️', description: 'Thắng trận PK đầu tiên', unlockedAt: stats.pkWins >= 1 ? new Date() : null },
    { id: 'pk_10_wins', title: 'Chiến Binh', icon: '🛡️', description: 'Thắng 10 trận PK', unlockedAt: stats.pkWins >= 10 ? new Date() : null },
    { id: 'level_10', title: 'Tiến Bộ Vượt Bậc', icon: '📈', description: 'Đạt level 10', unlockedAt: stats.level >= 10 ? new Date() : null },
    { id: 'level_25', title: 'Bậc Thầy', icon: '👑', description: 'Đạt level 25', unlockedAt: stats.level >= 25 ? new Date() : null },
    { id: 'all_basic', title: 'Nền Tảng Vững Chắc', icon: '🏅', description: 'Hoàn thành tất cả bài cơ bản', unlockedAt: null },
  ];

  // Recent activity mock data (would come from API)
  const recentActivity = userData?.recentActivity || [
    { type: 'lesson', title: 'Hoàn thành bài học', detail: 'Chương 2: Nhiệt học', time: '2 giờ trước', xp: 50 },
    { type: 'achievement', title: 'Mở khóa thành tích', detail: 'Học Sinh Chăm Chỉ', time: '1 ngày trước', xp: 100 },
    { type: 'pk', title: 'Thắng trận PK', detail: 'vs. Người chơi khác', time: '2 ngày trước', xp: 30 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center text-red-600">
            <p className="text-xl font-bold mb-2">⚠️ Lỗi</p>
            <p>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  const RankIcon = rank.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <RankIcon className={`w-5 h-5 ${rank.color}`} />
              <span className="text-white font-semibold text-sm">{rank.name}</span>
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="absolute -top-12 left-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center overflow-hidden">
                    {userData?.profile?.avatar ? (
                      <img 
                        src={userData.profile.avatar} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl text-white font-bold">
                        {userData?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '👤'}
                      </span>
                    )}
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* User Details */}
            <div className="pt-16 flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3 max-w-md">
                    <input
                      type="text"
                      value={editForm.displayName}
                      onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Tên hiển thị"
                    />
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Giới thiệu bản thân..."
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editForm.school}
                        onChange={(e) => setEditForm({...editForm, school: e.target.value})}
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Trường học"
                      />
                      <select
                        value={editForm.grade}
                        onChange={(e) => setEditForm({...editForm, grade: e.target.value})}
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Lớp</option>
                        {[6,7,8,9,10,11,12].map(g => (
                          <option key={g} value={g}>Lớp {g}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-800">
                        {userData?.displayName || userData?.username || user?.email?.split('@')[0] || 'Học viên'}
                      </h1>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <p className="text-gray-500 mb-2">{userData?.email || user?.email}</p>
                    {(userData?.profile?.bio || userData?.profile?.school) && (
                      <p className="text-gray-600 mb-2">
                        {userData?.profile?.bio}
                        {userData?.profile?.school && (
                          <span className="text-gray-400"> • {userData.profile.school}</span>
                        )}
                        {userData?.profile?.grade && (
                          <span className="text-gray-400"> • Lớp {userData.profile.grade}</span>
                        )}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Tham gia: {new Date(userData?.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Level & XP Card */}
              <div className="mt-4 md:mt-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 text-white min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-200 text-sm">Level</span>
                  <Zap className="w-5 h-5 text-yellow-300" />
                </div>
                <div className="text-4xl font-bold mb-2">{stats.level}</div>
                <div className="bg-white/20 rounded-full h-2 mb-2">
                  <div 
                    className="bg-yellow-400 h-full rounded-full transition-all"
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
                <div className="text-xs text-purple-200">
                  {currentLevelXP} / 100 XP ({xpNeeded} XP đến level tiếp)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Tổng quan', icon: TrendingUp },
            { id: 'achievements', label: 'Thành tích', icon: Trophy },
            { id: 'activity', label: 'Hoạt động', icon: Clock },
            { id: 'pk', label: 'Đấu trường', icon: Swords },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                icon={<BookOpen className="w-6 h-6 text-blue-500" />}
                value={`${stats.completedLessons}/${stats.totalLessons}`}
                label="Bài học"
                color="blue"
              />
              <StatCard 
                icon={<Flame className="w-6 h-6 text-orange-500" />}
                value={stats.currentStreak}
                label="Ngày liên tục"
                subtext={`Kỷ lục: ${stats.longestStreak}`}
                color="orange"
              />
              <StatCard 
                icon={<Star className="w-6 h-6 text-amber-500" />}
                value={stats.totalXP.toLocaleString()}
                label="Tổng XP"
                color="amber"
              />
              <StatCard 
                icon={<Target className="w-6 h-6 text-green-500" />}
                value={`${stats.averageScore}%`}
                label="Điểm trung bình"
                color="green"
              />
            </div>

            {/* Progress by Level */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Tiến độ học tập
              </h2>
              
              <div className="space-y-5">
                {calculateProgressByLevel(userData?.progress?.completedLessons || []).map((levelData, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">{levelData.name}</span>
                      <span className="text-gray-500 text-sm">{levelData.completed}/{levelData.total}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          index === 0 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                          index === 1 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                          'bg-gradient-to-r from-purple-400 to-purple-500'
                        }`}
                        style={{ width: `${levelData.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Achievements Preview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Thành tích gần đây
                </h2>
                <button 
                  onClick={() => setActiveTab('achievements')}
                  className="text-purple-600 text-sm font-medium flex items-center gap-1 hover:text-purple-700"
                >
                  Xem tất cả <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-2">
                {allAchievements.slice(0, 6).map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`flex-shrink-0 w-20 text-center ${!achievement.unlockedAt && 'opacity-40'}`}
                  >
                    <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-2xl mb-2 ${
                      achievement.unlockedAt 
                        ? 'bg-gradient-to-br from-amber-100 to-yellow-200 shadow-md' 
                        : 'bg-gray-100'
                    }`}>
                      {achievement.unlockedAt ? achievement.icon : <Lock className="w-6 h-6 text-gray-400" />}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{achievement.title}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'achievements' && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Thành tích
            </h2>
            <p className="text-gray-500 mb-6">
              {stats.achievementsUnlocked}/{stats.totalAchievements} thành tích đã mở khóa
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    achievement.unlockedAt
                      ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-md'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {achievement.unlockedAt && (
                    <div className="absolute -top-2 -right-2">
                      <CheckCircle className="w-6 h-6 text-green-500 fill-white" />
                    </div>
                  )}
                  <div className={`text-4xl mb-3 ${!achievement.unlockedAt && 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <h3 className={`font-semibold mb-1 ${achievement.unlockedAt ? 'text-gray-800' : 'text-gray-500'}`}>
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-500">{achievement.description}</p>
                  {achievement.unlockedAt && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ {new Date(achievement.unlockedAt).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Hoạt động gần đây
            </h2>
            
            <div className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    activity.type === 'lesson' ? 'bg-blue-100' :
                    activity.type === 'achievement' ? 'bg-amber-100' :
                    activity.type === 'pk' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {activity.type === 'lesson' && <BookOpen className="w-5 h-5 text-blue-600" />}
                    {activity.type === 'achievement' && <Trophy className="w-5 h-5 text-amber-600" />}
                    {activity.type === 'pk' && <Swords className="w-5 h-5 text-red-600" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                    <p className="text-sm text-gray-500">{activity.detail}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-semibold">+{activity.xp} XP</div>
                    <div className="text-xs text-gray-400">{activity.time}</div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Chưa có hoạt động nào</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'pk' && (
          <div className="space-y-6">
            {/* PK Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                icon={<Swords className="w-6 h-6 text-red-500" />}
                value={stats.pkWins + stats.pkLosses}
                label="Tổng trận"
                color="red"
              />
              <StatCard 
                icon={<Trophy className="w-6 h-6 text-green-500" />}
                value={stats.pkWins}
                label="Thắng"
                color="green"
              />
              <StatCard 
                icon={<Target className="w-6 h-6 text-amber-500" />}
                value={stats.pkWins + stats.pkLosses > 0 ? Math.round((stats.pkWins / (stats.pkWins + stats.pkLosses)) * 100) + '%' : '0%'}
                label="Tỷ lệ thắng"
                color="amber"
              />
              <StatCard 
                icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
                value={stats.pkRating}
                label="Rating"
                color="purple"
              />
            </div>

            {/* PK Ranking */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Bảng xếp hạng
              </h2>
              <p className="text-gray-500 text-center py-8">
                Tính năng đang được phát triển...
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, value, label, subtext, color }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-2">
      <div className={`p-2 rounded-lg bg-${color}-50`}>
        {icon}
      </div>
    </div>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
    {subtext && <div className="text-xs text-gray-400 mt-1">{subtext}</div>}
  </div>
);

export default Profile;

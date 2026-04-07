import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import api from '../config/api';
import { 
  Trophy, Star, Flame, Target, Zap, Clock, 
  BookOpen, Award, Medal, Crown, Shield, 
  TrendingUp, Calendar, Edit3, Camera, ChevronRight,
  Swords, Users, CheckCircle, Lock, Hexagon
} from 'lucide-react';
import SolarSystemBackground from '../components/animations/SolarSystemBackground';
import { Link } from 'react-router-dom';

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
        ) : 0,
    totalXP: userData?.xp || 0,
    level: userData?.level || 1,
    pkWins: userData?.pkStats?.wins || 0,
    pkLosses: userData?.pkStats?.losses || 0,
    pkRating: userData?.pkStats?.rating || 1000,
    achievementsUnlocked: questData?.achievements?.filter(a => a.unlockedAt)?.length || 0,
    totalAchievements: questData?.achievements?.length || 12,
  } : {
    totalLessons: 0, completedLessons: 0, totalPoints: 0, currentStreak: 0, longestStreak: 0,
    averageScore: 0, totalXP: 0, level: 1, pkWins: 0, pkLosses: 0, pkRating: 1000,
    achievementsUnlocked: 0, totalAchievements: 12
  };

  const xpForCurrentLevel = (stats.level - 1) * 100;
  const xpForNextLevel = stats.level * 100;
  const currentLevelXP = stats.totalXP - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - stats.totalXP;
  const levelProgress = xpForNextLevel > xpForCurrentLevel ? (currentLevelXP / 100) * 100 : 100;

  function getRank(level) {
    if (level >= 50) return { name: 'Thống Soái Không Gian', icon: Crown, color: 'text-yellow-400', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.6)]' };
    if (level >= 30) return { name: 'Đại Tá Ngân Hà', icon: Medal, color: 'text-cyan-400', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.6)]' };
    if (level >= 20) return { name: 'Chỉ Huy Tinh Tú', icon: Shield, color: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(192,132,252,0.6)]' };
    if (level >= 10) return { name: 'Tiên Phong', icon: Trophy, color: 'text-amber-500', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.6)]' };
    if (level >= 5) return { name: 'Tân Binh Không Gian', icon: Award, color: 'text-slate-300', glow: 'shadow-[0_0_15px_rgba(203,213,225,0.6)]' };
    return { name: 'Học Phiên Tập Sự', icon: Star, color: 'text-orange-500', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.6)]' };
  }

  const rank = getRank(stats.level);

  function calculateProgressByLevel(completedLessons) {
    const levels = [
      { name: 'Cấp độ Cơ bản', chapters: [1, 2, 3, 4], color: 'from-green-400 to-emerald-500', total: 12 },
      { name: 'Cấp độ Trung cấp', chapters: [5, 6, 7, 8], color: 'from-blue-400 to-cyan-500', total: 12 },
      { name: 'Cấp độ Nâng cao', chapters: [9, 10, 11, 12], color: 'from-purple-400 to-indigo-500', total: 12 },
    ];

    return levels.map(level => {
      const completed = completedLessons.filter(lesson => level.chapters.includes(lesson.chapterId)).length;
      const percentage = level.total > 0 ? Math.round((completed / level.total) * 100) : 0;
      return { ...level, completed, percentage };
    });
  }

  const allAchievements = questData?.achievements || [
    { id: 'first_lesson', title: 'Bước Đầu Tiên', icon: <Target/>, description: 'Hoàn thành bài học đầu tiên', unlockedAt: stats.completedLessons >= 1 ? new Date() : null },
    { id: 'streak_7', title: 'Tuần Lễ Rực Lửa', icon: <Flame/>, description: '7 ngày học liên tục', unlockedAt: stats.currentStreak >= 7 ? new Date() : null },
    { id: 'lessons_5', title: 'Học Sinh Chăm Chỉ', icon: <BookOpen/>, description: 'Hoàn thành 5 bài học', unlockedAt: stats.completedLessons >= 5 ? new Date() : null },
    { id: 'perfect_score', title: 'Hoàn Hảo', icon: <Star/>, description: 'Đạt điểm tuyệt đối trong bài học', unlockedAt: userData?.progress?.completedLessons?.some(l => l.score === 100) ? new Date() : null },
    { id: 'lessons_10', title: 'Thám Hiểm Gia', icon: <Trophy/>, description: 'Hoàn thành 10 bài học', unlockedAt: stats.completedLessons >= 10 ? new Date() : null },
    { id: 'streak_14', title: 'Kiên Trì', icon: <TrendingUp/>, description: '14 ngày học liên tục', unlockedAt: stats.currentStreak >= 14 ? new Date() : null },
  ];

  const recentActivity = userData?.recentActivity || [
    { type: 'lesson', title: 'Vượt qua bài kiểm tra', detail: 'Chương 2: Động lực học', time: '2 giờ trước', xp: 50 },
    { type: 'achievement', title: 'Mở khóa Huy Chương', detail: 'Chiến Binh Không Gian', time: '1 ngày trước', xp: 100 },
    { type: 'pk', title: 'Chiến thắng Đấu Trường PK', detail: 'vs. Đối thủ ngẫu nhiên', time: '2 ngày trước', xp: 30 },
  ];

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#020617]">
         <div className="w-16 h-16 border-t-2 border-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const RankIcon = rank.icon;

  return (
    <div className="min-h-full relative font-sans text-white pb-20">
      
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 opacity-40">
        <SolarSystemBackground />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-4 sm:px-6 py-8">
        
        {/* Navigation / Back */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-wide">
            <div className="w-1.5 h-8 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)]"></div>
            Hồ sơ Không Không Gian
          </h1>
        </div>

        {/* PROFILE ID CARD */}
        <div className="bg-[#0B1221]/90 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] overflow-hidden mb-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Top Banner */}
          <div className="h-32 sm:h-40 bg-gradient-to-r from-purple-900 via-indigo-900 to-cyan-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-500/30 blur-[50px] rounded-full"></div>
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10">
              <RankIcon className={`w-5 h-5 ${rank.color}`} />
              <span className={`font-bold text-sm tracking-wide ${rank.color}`}>{rank.name}</span>
            </div>
          </div>
          
          <div className="px-6 pb-8 sm:px-10 relative">
            {/* Avatar Hologram */}
            <div className="absolute -top-16 sm:-top-20 left-6 sm:left-10">
              <div className="relative group cursor-pointer">
                <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-slate-900 p-1.5 shadow-2xl ${rank.glow}`}>
                  <div className="w-full h-full rounded-[1.25rem] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden border border-slate-700">
                    {userData?.profile?.avatar ? (
                      <img src={userData.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-500">
                        {userData?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'ID'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-800 rounded-full border border-slate-600 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                  <Camera className="w-5 h-5 text-slate-400 group-hover:text-white" />
                </div>
              </div>
            </div>

            {/* Profile Info Space */}
            <div className="pt-20 sm:pt-24 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              
              {/* Identity Details */}
              <div className="flex-1 max-w-xl">
                {isEditing ? (
                  <div className="space-y-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
                    <input
                      type="text"
                      value={editForm.displayName}
                      onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      placeholder="Danh xưng"
                    />
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
                      placeholder="Tiểu sử / Nhiệm vụ cá nhân..."
                      rows={2}
                    />
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="text"
                        value={editForm.school}
                        onChange={(e) => setEditForm({...editForm, school: e.target.value})}
                        className="flex-1 bg-slate-950 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        placeholder="Trạm cơ sở (Trường học)"
                      />
                      <select
                        value={editForm.grade}
                        onChange={(e) => setEditForm({...editForm, grade: e.target.value})}
                        className="sm:w-1/3 bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      >
                         <option value="">Cấp bậc</option>
                         {[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Lớp {g}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                       <button onClick={handleSaveProfile} className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors">Đồng bộ dữ liệu</button>
                       <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">Hủy</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <h2 className="text-3xl font-black text-white tracking-wide">
                        {userData?.displayName || user?.email?.split('@')[0] || 'Unknown Cadet'}
                      </h2>
                      <button onClick={() => setIsEditing(true)} className="p-2 bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 rounded-lg transition-all border border-transparent hover:border-cyan-500/50">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-slate-400 font-mono text-sm mb-4">ID: {user?.email}</p>
                    
                    <div className="flex flex-wrap gap-3 mb-6">
                       {userData?.profile?.school && (
                         <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-full border border-slate-700">📍 {userData.profile.school}</span>
                       )}
                       {userData?.profile?.grade && (
                         <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-full border border-slate-700">🎓 Lớp {userData.profile.grade}</span>
                       )}
                       <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-full border border-slate-700 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Đăng ký: {new Date(userData?.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                       </span>
                    </div>

                    {userData?.profile?.bio && (
                      <p className="text-slate-300 italic border-l-2 border-cyan-500 pl-4 py-1 bg-slate-800/30 rounded-r-lg">
                        "{userData.profile.bio}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Energy/Level Capacitor */}
              <div className="w-full md:w-64 bg-slate-900 border border-slate-700 rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[30px] rounded-full group-hover:bg-cyan-500/20 transition-colors duration-700"></div>
                <div className="relative z-10 flex items-center justify-between mb-4">
                  <span className="text-slate-400 text-sm font-bold tracking-widest uppercase">Năng lượng</span>
                  <Zap className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                </div>
                <div className="relative z-10 flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-black text-white">{stats.level}</span>
                  <span className="text-slate-500 font-bold">LVL</span>
                </div>
                <div className="relative z-10 w-full h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    style={{ width: `${levelProgress}%` }}
                  ></div>
                </div>
                <div className="relative z-10 mt-3 flex justify-between text-xs font-bold text-slate-400">
                  <span>{currentLevelXP}/{100} XP</span>
                  <span className="text-cyan-400">Cần {xpNeeded} XP</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {[
            { id: 'overview', label: 'Báo Cáo Tổng Quan', icon: TrendingUp },
            { id: 'achievements', label: 'Kho Huy Hiệu', icon: Trophy },
            { id: 'activity', label: 'Nhật Ký Hành Trình', icon: Clock },
            { id: 'pk', label: 'Lịch Sử Đấu Trường', icon: Swords },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all whitespace-nowrap border ${
                activeTab === tab.id
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<BookOpen />} iconColor="text-blue-400" bgColor="bg-blue-500/10" value={`${stats.completedLessons}/${stats.totalLessons}`} label="LƯỢT KHÁM PHÁ" />
                <StatCard icon={<Flame />} iconColor="text-orange-500" bgColor="bg-orange-500/10" value={stats.currentStreak} label="CHUỖI NGÀY ONLINE" subtext={`Kỷ lục đỉnh cao: ${stats.longestStreak}`} />
                <StatCard icon={<Star />} iconColor="text-amber-400" bgColor="bg-amber-400/10" value={stats.totalXP.toLocaleString()} label="KINH NGHIỆM TỔNG" />
                <StatCard icon={<Target />} iconColor="text-emerald-400" bgColor="bg-emerald-500/10" value={`${stats.averageScore}%`} label="TỶ LỆ CHÍNH XÁC" />
              </div>

              <div className="bg-[#0B1221]/80 backdrop-blur-md rounded-3xl p-6 border border-slate-800">
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" /> Tiến độ Giải mã Không gian
                </h3>
                <div className="space-y-6">
                  {calculateProgressByLevel(userData?.progress?.completedLessons || []).map((lvl, idx) => (
                    <div key={idx} className="relative">
                      <div className="flex justify-between items-end mb-2">
                        <span className="font-bold text-slate-300">{lvl.name}</span>
                        <span className="text-sm font-mono text-cyan-400">{lvl.percentage}% ({lvl.completed}/{lvl.total})</span>
                      </div>
                      <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden shadow-inner border border-slate-800/50">
                        <div className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${lvl.color}`} style={{ width: `${lvl.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
             <div className="bg-[#0B1221]/80 backdrop-blur-md border border-slate-800 rounded-[2rem] p-8">
               <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                 <h2 className="text-2xl font-black text-white flex items-center gap-3">
                   <Trophy className="w-6 h-6 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                   Bộ sưu tập Huy Hiệu
                 </h2>
                 <div className="px-4 py-2 bg-slate-900 rounded-full border border-slate-700 text-slate-300 text-sm font-bold">
                    Đã mở khóa: <span className="text-cyan-400">{stats.achievementsUnlocked}/{stats.totalAchievements}</span>
                 </div>
               </div>

               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                 {allAchievements.map((ach) => {
                   const isUnlocked = ach.unlockedAt;
                   return (
                     <div key={ach.id} className={`relative flex flex-col items-center text-center p-5 rounded-2xl border transition-all duration-500 ${isUnlocked ? 'bg-slate-900/80 border-cyan-500/40 hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-slate-900/30 border-slate-800 opacity-60'}`}>
                        {isUnlocked && <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-emerald-400" />}
                        <div className={`w-16 h-16 mb-4 flex items-center justify-center rounded-2xl ${isUnlocked ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[inset_0_0_15px_rgba(6,182,212,0.4)]' : 'bg-slate-800 text-slate-500'}`}>
                           {isUnlocked ? ach.icon : <Lock className="w-8 h-8" />}
                        </div>
                        <h4 className={`font-bold mb-1 text-sm ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>{ach.title}</h4>
                        <p className="text-xs text-slate-500 mb-2">{ach.description}</p>
                        {isUnlocked && <span className="text-[10px] text-emerald-500 font-mono tracking-wider mt-auto">{new Date(ach.unlockedAt).toLocaleDateString('vi-VN')}</span>}
                     </div>
                   );
                 })}
               </div>
             </div>
          )}

          {activeTab === 'activity' && (
             <div className="bg-[#0B1221]/80 backdrop-blur-md border border-slate-800 rounded-[2rem] p-8">
               <h2 className="text-xl font-black text-white flex items-center gap-3 mb-6">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Nhật Ký Hành Trình
               </h2>
               <div className="space-y-4">
                 {recentActivity.length > 0 ? recentActivity.map((act, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                       <div className="p-3 bg-slate-800 rounded-xl text-slate-300 w-fit">
                          {act.type === 'lesson' ? <BookOpen /> : act.type === 'achievement' ? <Trophy className="text-amber-500" /> : <Swords className="text-rose-500" />}
                       </div>
                       <div className="flex-1">
                          <h4 className="font-bold text-white text-base">{act.title}</h4>
                          <p className="text-sm text-slate-400">{act.detail}</p>
                       </div>
                       <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-0 border-slate-800 pt-2 sm:pt-0">
                          <span className="text-emerald-400 font-black text-lg">+{act.xp} XP</span>
                          <span className="text-xs font-mono text-slate-500">{act.time}</span>
                       </div>
                    </div>
                 )) : (
                    <div className="text-center py-12 text-slate-500">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>Hệ thống chưa ghi nhận hoạt động nào.</p>
                    </div>
                 )}
               </div>
             </div>
          )}

          {activeTab === 'pk' && (
             <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <StatCard icon={<Swords />} iconColor="text-rose-500" bgColor="bg-rose-500/10" value={stats.pkWins + stats.pkLosses} label="TỔNG TRẬN PK" />
                   <StatCard icon={<Trophy />} iconColor="text-emerald-500" bgColor="bg-emerald-500/10" value={stats.pkWins} label="DÀNH CHIẾN THẮNG" />
                   <StatCard icon={<Target />} iconColor="text-orange-500" bgColor="bg-orange-500/10" value={stats.pkWins + stats.pkLosses > 0 ? Math.round((stats.pkWins / (stats.pkWins + stats.pkLosses)) * 100) + '%' : '0%'} label="TỶ LỆ THẮNG" />
                   <StatCard icon={<TrendingUp />} iconColor="text-purple-500" bgColor="bg-purple-500/10" value={stats.pkRating} label="ĐIỂM ELO" />
                </div>
                <div className="bg-[#0B1221]/80 backdrop-blur-md border border-slate-800 rounded-[2rem] p-10 text-center">
                   <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                   <h3 className="text-xl font-bold text-white mb-2">Bảng Xếp Hạng PK</h3>
                   <p className="text-slate-400">Dữ liệu đấu trường đang được đồng bộ hoá với Cổng Không Gian...</p>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label, subtext, bgColor, iconColor }) => (
  <div className="bg-[#0B1221]/80 backdrop-blur border border-slate-800 rounded-3xl p-5 hover:border-cyan-500/30 transition-all group overflow-hidden relative">
    <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full ${bgColor} blur-2xl group-hover:bg-cyan-500/20 transition-all`}></div>
    <div className="flex items-center gap-3 mb-3 relative z-10">
      <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${iconColor}`}>
        {icon}
      </div>
    </div>
    <div className="relative z-10">
      <div className="text-3xl font-black text-white mb-1">{value}</div>
      <div className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-wider uppercase">{label}</div>
      {subtext && <div className="text-xs text-slate-500 mt-2 font-mono">{subtext}</div>}
    </div>
  </div>
);

export default Profile;

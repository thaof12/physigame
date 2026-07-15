import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import api from '../config/api';
import {
  Trophy, Star, Flame, Target, Zap, Clock,
  BookOpen, Award, Medal, Crown, Shield,
  TrendingUp, Calendar, Edit3, Camera, ChevronRight,
  Swords, Users, CheckCircle, Lock, Hexagon, LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
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
  const fileInputRef = useRef(null);

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
  }, [user?.uid]);

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

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một file hình ảnh hợp lệ.');
      return;
    }

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = async () => {
        URL.revokeObjectURL(objectUrl);

        // Resize parameters
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG format with 0.8 quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

        try {
          await api.put(`/users/profile/${user.uid}`, { avatar: compressedBase64 });

          const updatedProfile = { avatar: compressedBase64 };

          setUserData(prev => ({
            ...prev,
            profile: {
              ...prev?.profile,
              ...updatedProfile
            }
          }));

          // Cập nhật AuthContext để thay đổi hiển thị trên header ngay lập tức
          setUser(prev => ({
            ...prev,
            profile: {
              ...prev?.profile,
              ...updatedProfile
            }
          }));
        } catch (apiErr) {
          console.error('Error uploading avatar:', apiErr);
          alert('Đã có lỗi xảy ra khi lưu ảnh lên máy chủ. Vui lòng thử lại sau.');
        }
      };

      img.src = objectUrl;
    } catch (err) {
      console.error('Error preparing avatar:', err);
      alert('Đã có lỗi xảy ra khi xử lý ảnh. Vui lòng chọn ảnh khác.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const aggregateProgress = (programs) => {
    let completedLessonIds = [];
    let totalPoints = 0;
    if (Array.isArray(programs)) {
      programs.forEach(p => {
        if (p.progress) {
          if (Array.isArray(p.progress.completedLessons)) {
            completedLessonIds = [...completedLessonIds, ...p.progress.completedLessons];
          }
          totalPoints += p.progress.totalScore || 0;
        }
      });
    }
    return { completedLessonIds, totalPoints };
  };

  const { completedLessonIds, totalPoints } = aggregateProgress(userData?.programs);

  const stats = userData ? {
    totalLessons: 36,
    completedLessons: completedLessonIds.length,
    totalPoints: totalPoints,
    currentStreak: questData?.loginStreak?.current || userData.profile?.currentStreak || 0,
    longestStreak: questData?.loginStreak?.longest || userData.profile?.longestStreak || 0,
    averageScore: completedLessonIds.length > 0 ? Math.round(totalPoints / completedLessonIds.length) : 0,
    totalXP: userData.xp || 0,
    level: userData.level || 1,
    pkWins: userData.profile?.pkStats?.wins || 0,
    pkLosses: userData.profile?.pkStats?.losses || 0,
    pkRating: userData.profile?.pkStats?.rating || 1000,
    achievementsUnlocked: questData?.achievements?.filter(a => a.unlockedAt)?.length || 0,
    totalAchievements: questData?.achievements?.length || 12,
  } : {
    totalLessons: 36, completedLessons: 0, totalPoints: 0, currentStreak: 0, longestStreak: 0,
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
    if (level >= 10) return { name: 'Tiên Phong', icon: Trophy, color: 'text-blue-500', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.6)]' };
    if (level >= 5) return { name: 'Tân Binh Không Gian', icon: Award, color: 'text-slate-300', glow: 'shadow-[0_0_15px_rgba(203,213,225,0.6)]' };
    return { name: 'Học Phiên Tập Sự', icon: Star, color: 'text-cyan-500', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.6)]' };
  }

  const rank = getRank(stats.level);

  function calculateProgressByLevel(completedLessonIdsList) {
    const levels = [
      { name: 'Cấp độ Cơ bản', chapters: [1, 2, 3, 4], color: 'from-green-400 to-emerald-500', total: 12 },
      { name: 'Cấp độ Trung cấp', chapters: [5, 6, 7, 8], color: 'from-blue-400 to-cyan-500', total: 12 },
      { name: 'Cấp độ Nâng cao', chapters: [9, 10, 11, 12], color: 'from-purple-400 to-indigo-500', total: 12 },
    ];

    // Phân bổ ngẫu nhiên dựa trên số lượng hoàn thành thực tế nếu lessonId không chứa chapter
    let remainingCompleted = completedLessonIdsList.length;

    return levels.map(level => {
      let completed = 0;
      if (remainingCompleted > level.total) {
        completed = level.total;
        remainingCompleted -= level.total;
      } else {
        completed = remainingCompleted;
        remainingCompleted = 0;
      }
      const percentage = level.total > 0 ? Math.round((completed / level.total) * 100) : 0;
      return { ...level, completed, percentage };
    });
  }

  const allAchievements = questData?.achievements || [
    { id: 'first_lesson', title: 'Bước Đầu Tiên', icon: <Target />, description: 'Hoàn thành bài học đầu tiên', unlockedAt: stats.completedLessons >= 1 ? new Date() : null },
    { id: 'streak_7', title: 'Tuần Lễ Rực Lửa', icon: <Flame />, description: '7 ngày học liên tục', unlockedAt: stats.currentStreak >= 7 ? new Date() : null },
    { id: 'lessons_5', title: 'Học Sinh Chăm Chỉ', icon: <BookOpen />, description: 'Hoàn thành 5 bài học', unlockedAt: stats.completedLessons >= 5 ? new Date() : null },
    { id: 'perfect_score', title: 'Hoàn Hảo', icon: <Star />, description: 'Đạt điểm tuyệt đối trong bài học', unlockedAt: userData?.progress?.completedLessons?.some(l => l.score === 100) ? new Date() : null },
    { id: 'lessons_10', title: 'Thám Hiểm Gia', icon: <Trophy />, description: 'Hoàn thành 10 bài học', unlockedAt: stats.completedLessons >= 10 ? new Date() : null },
    { id: 'streak_14', title: 'Kiên Trì', icon: <TrendingUp />, description: '14 ngày học liên tục', unlockedAt: stats.currentStreak >= 14 ? new Date() : null },
  ];

  const getRelativeTime = (isoString) => {
    if (!isoString) return 'Vừa xong';
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
  };

  const recentActivity = userData?.profile?.recentActivity || [];

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-16 h-16 border-t-4 border-[#274dad] border-r-4 border-r-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const RankIcon = rank.icon;

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-body text-[#1E293B] overflow-x-hidden selection:bg-[#274dad]/20">

      {/* Background patterns */}
      <div className="fixed inset-0 graph-grid opacity-[0.15] pointer-events-none" />
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none bg-[#274dad]/5" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none bg-[#44b5d7]/5" />

      <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 pt-24 lg:pt-32 pb-12 lg:pb-16">

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* ──────────────────────────────────────────────
              SIDEBAR: USER IDENTITY & NAVIGATION
              ────────────────────────────────────────────── */}
          <aside className="w-full lg:w-80 space-y-8">

            {/* User Info Card */}
            <div className="bg-white rounded-[2.5rem] border border-[#E5E7EB] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] p-8 text-center relative overflow-hidden group">
              {/* Decorative brass accent */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gradient-to-r from-transparent via-[#274dad]/30 to-transparent" />

              <div className="relative inline-block mb-6 pt-2">
                <div className={`w-32 h-32 rounded-full p-1.5 bg-white border-2 border-[#E5E7EB] group-hover:border-[#274dad]/50 transition-colors duration-500 shadow-xl overflow-hidden`}>
                  <div className="w-full h-full rounded-full bg-[#e4f2f0] flex items-center justify-center overflow-hidden border border-[#274dad]/10">
                    {userData?.profile?.avatar ? (
                      <img src={userData.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-heading text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-[#2099e9] to-[#274dad]">
                        {userData?.displayName?.[0]?.toUpperCase() || user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'ID'}
                      </span>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-9 h-9 bg-white rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#274dad] shadow-lg hover:bg-[#FFFFFF] transition-colors"
                  title="Thay đổi ảnh đại diện"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <h2 className="font-heading text-2xl font-extrabold text-[#1E293B] tracking-tight truncate px-2">
                  {userData?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Unknown Cadet'}
                </h2>
                <div className="font-heading inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e4f2f0] text-[#2099e9] text-[10px] font-extrabold tracking-widest uppercase border border-[#274dad]/10">
                  <RankIcon className={`w-3 h-3 ${rank.color}`} /> {rank.name}
                </div>
              </div>

              {/* Login Streak */}
              <div className="mt-8 pt-8 border-t border-[#F1F5F9] flex items-center justify-center gap-6">
                <div className="text-center group/streak">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FFF7ED] text-cyan-500 mb-2 border border-cyan-100 group-hover/streak:scale-110 transition-transform">
                    <Flame className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="text-lg font-heading font-extrabold text-[#1E293B] leading-none mb-1">{stats.currentStreak}</div>
                  <div className="text-[9px] font-heading font-extrabold text-slate-400 uppercase tracking-tight">Ngày liên tục</div>
                </div>
                <div className="text-center group/xp">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 mb-2 border border-indigo-100 group-hover/xp:scale-110 transition-transform">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="text-lg font-heading font-extrabold text-[#1E293B] leading-none mb-1">{stats.level}</div>
                  <div className="text-[9px] font-heading font-extrabold text-slate-400 uppercase tracking-tight">Cấp độ (LVL)</div>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="bg-white rounded-[2rem] border border-[#E5E7EB] shadow-sm overflow-hidden p-3">
              {[
                { id: 'info', label: 'Thông tin cá nhân', icon: Users, color: 'text-blue-500' },
                { id: 'overview', label: 'Thống kê & thành tựu', icon: TrendingUp, color: 'text-emerald-500' },
                { id: 'achievements', label: 'Kho huy hiệu', icon: Trophy, color: 'text-blue-500' },
                { id: 'activity', label: 'Nhật ký hoạt động', icon: Clock, color: 'text-indigo-500' },
                { id: 'pk', label: 'Lịch sử đấu trường', icon: Swords, color: 'text-rose-500' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-heading font-extrabold text-sm transition-all text-left mb-1 group ${activeTab === item.id
                    ? 'bg-[#FFFFFF] border border-[#274dad]/20 text-[#274dad] shadow-sm'
                    : 'text-slate-500 hover:bg-[#F8F9FA] hover:text-[#1E293B]'
                    }`}
                >
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? item.color : 'text-slate-400 opacity-60'}`} />
                  <span className="flex-1">{item.label}</span>
                  {activeTab === item.id && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
              <div className="mt-2 pt-2 border-t border-[#F1F5F9]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-xl font-heading font-extrabold text-sm text-rose-500 hover:bg-rose-50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* ──────────────────────────────────────────────
              MAIN CONTENT: SECTION DETAILS
              ────────────────────────────────────────────── */}
          <main className="flex-1 animate-fade-in-right">

            {/* Header for content */}
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-8">
              <div>
                <h1 className="font-heading text-3xl font-extrabold text-[#1E293B] tracking-tight">
                  {activeTab === 'info' && 'Thông tin cá nhân'}
                  {activeTab === 'overview' && 'Thống kê tổng quan'}
                  {activeTab === 'achievements' && 'Bộ sưu tập danh dự'}
                  {activeTab === 'activity' && 'Lịch sử khám phá'}
                  {activeTab === 'pk' && 'Dữ liệu đấu trường'}
                </h1>
                <p className="font-body text-slate-500 font-medium text-sm mt-1">Quản lý và cập nhật tiến trình khoa học của bạn.</p>
              </div>
              {activeTab === 'info' && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="font-heading pg-btn-brass px-6 py-3 text-xs flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" /> Cập nhật thông tin
                </button>
              )}
            </div>

            {/* Content Display based on activeTab */}
            <div className="space-y-8">

              {/* SECTION: PERSONAL INFO / FORM */}
              {activeTab === 'info' && (
                <div className="bg-white rounded-[2rem] border border-[#E5E7EB] p-8 sm:p-10 shadow-sm relative overflow-hidden">
                  {isEditing ? (
                    <div className="max-w-2xl space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Danh xưng hiển thị</label>
                          <input
                            type="text"
                            value={editForm.displayName}
                            onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                            className="font-body w-full bg-[#F8F9FA] border border-[#E5E7EB] text-[#1E293B] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#274dad]/50 focus:ring-4 focus:ring-[#274dad]/5 transition-all font-bold"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Email (Tài khoản)</label>
                          <input
                            type="text"
                            value={user?.email}
                            disabled
                            className="font-body w-full bg-slate-50 border border-[#E5E7EB] text-slate-400 rounded-2xl px-5 py-4 cursor-not-allowed font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Tiểu sử / Châm ngôn khoa học</label>
                        <textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                          rows={3}
                          className="font-body w-full bg-[#F8F9FA] border border-[#E5E7EB] text-[#1E293B] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#274dad]/50 focus:ring-4 focus:ring-[#274dad]/5 transition-all font-medium"
                          placeholder="Mô tả hành trình khám phá vũ trụ của bạn..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Trường học / Cơ sở</label>
                          <input
                            type="text"
                            value={editForm.school}
                            onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                            className="font-body w-full bg-[#F8F9FA] border border-[#E5E7EB] text-[#1E293B] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#274dad]/50 focus:ring-4 focus:ring-[#274dad]/5 transition-all font-bold"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Khối lớp (Grade)</label>
                          <select
                            value={editForm.grade}
                            onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                            className="font-body w-full bg-[#F8F9FA] border border-[#E5E7EB] text-[#1E293B] rounded-2xl px-5 py-4 focus:outline-none focus:border-[#274dad]/50 transition-all font-bold appearance-none"
                          >
                            <option value="">Lựa chọn cấp bậc</option>
                            {[6, 7, 8, 9, 10, 11, 12].map(g => <option key={g} value={g}>Lớp {g}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button onClick={handleSaveProfile} className="font-heading pg-btn-brass px-8 py-4 text-sm font-extrabold shadow-lg shadow-[#274dad]/20">Đồng bộ dữ liệu</button>
                        <button onClick={() => setIsEditing(false)} className="font-heading px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl transition-all text-sm">Hủy bỏ</button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-10">
                        <div className="flex items-start gap-6">
                          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 font-bold">1</div>
                          <div>
                            <h4 className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Họ và tên</h4>
                            <p className="font-body text-xl font-bold text-[#1E293B]">{userData?.displayName || 'Chưa cập nhật'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-6">
                          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100 font-bold">2</div>
                          <div>
                            <h4 className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Email liên hệ</h4>
                            <p className="font-body text-xl font-bold text-[#1E293B]">{user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-6">
                          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 font-bold">3</div>
                          <div>
                            <h4 className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Trường học</h4>
                            <p className="font-body text-xl font-bold text-[#1E293B]">{userData?.profile?.school || 'Chưa cập nhật'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-10">
                        <div className="flex items-start gap-6">
                          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center shrink-0 border border-purple-100 font-bold">4</div>
                          <div>
                            <h4 className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Cấp lớp</h4>
                            <p className="font-body text-xl font-bold text-[#1E293B]">{userData?.profile?.grade ? `Lớp ${userData.profile.grade}` : 'Chưa cập nhật'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-6">
                          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100 font-bold">5</div>
                          <div>
                            <h4 className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Ngày tham gia</h4>
                            <p className="font-body text-xl font-bold text-[#1E293B]">{new Date(userData?.createdAt || Date.now()).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-6">
                          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 font-bold">6</div>
                          <div className="flex-1">
                            <h4 className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Tiểu sử</h4>
                            <p className="font-body text-sm font-medium text-slate-600 italic">"{userData?.profile?.bio || 'Chưa thiết lập châm ngôn...'}"</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: OVERVIEW & PROGRESS */}
              {activeTab === 'overview' && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCardAcademic icon={<BookOpen />} color="text-blue-500" value={`${stats.completedLessons}/${stats.totalLessons}`} label="Lượt khám phá" />
                    <StatCardAcademic icon={<Flame />} color="text-cyan-500" value={stats.currentStreak} label="Chuỗi ngày học" subtext={`Kỷ lục: ${stats.longestStreak}`} />
                    <StatCardAcademic icon={<Swords />} color="text-rose-500" value={stats.pkWins} label="Chiến thắng PK" />
                    <StatCardAcademic icon={<Zap />} color="text-indigo-500" value={stats.totalXP.toLocaleString()} label="Tổng kinh nghiệm" />
                  </div>

                  <div className="bg-white rounded-[2rem] border border-[#E5E7EB] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-10">
                      <div className="p-2 bg-[#e4f2f0] rounded-xl border border-[#274dad]/10">
                        <TrendingUp className="w-5 h-5 text-[#274dad]" />
                      </div>
                      <h3 className="font-heading text-xl font-extrabold text-[#1E293B]">Tiến độ giải mã khoa học</h3>
                    </div>

                    <div className="space-y-10">
                      {calculateProgressByLevel(completedLessonIds).map((lvl, idx) => (
                        <div key={idx} className="relative">
                          <div className="flex justify-between items-end mb-3">
                            <span className="font-heading font-extrabold text-sm text-[#1E293B] uppercase tracking-tight">{lvl.name}</span>
                            <span className="font-heading text-sm font-extrabold text-[#274dad]">{lvl.percentage}% ({lvl.completed}/{lvl.total})</span>
                          </div>
                          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-[#274dad] to-[#44b5d7] shadow-[0_0_10px_rgba(184,115,51,0.2)]`}
                              style={{ width: `${lvl.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: ACHIEVEMENTS */}
              {activeTab === 'achievements' && (
                <div className="bg-white rounded-[2rem] border border-[#E5E7EB] p-8 shadow-sm">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {allAchievements.map((ach) => {
                      const isUnlocked = ach.unlockedAt;
                      return (
                        <div
                          key={ach.id}
                          className={`relative flex flex-col items-center text-center p-6 rounded-3xl border transition-all duration-500 ${isUnlocked
                            ? 'bg-white border-[#274dad]/30 shadow-lg shadow-[#274dad]/5 hover:scale-105'
                            : 'bg-slate-50 border-slate-100 opacity-60'
                            }`}
                        >
                          {isUnlocked && <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-emerald-500" />}
                          <div className={`w-16 h-16 mb-4 flex items-center justify-center rounded-2xl ${isUnlocked
                            ? 'bg-[#FFFFFF] text-[#274dad] border-2 border-[#274dad]/10 shadow-[inner_0_0_10px_rgba(184,115,51,0.1)]'
                            : 'bg-slate-100 text-slate-300'
                            }`}>
                            {isUnlocked ? ach.icon : <Lock className="w-7 h-7" />}
                          </div>
                          <h4 className="font-heading font-extrabold tracking-tight text-sm mb-1 text-slate-800">
                            {ach.title}
                          </h4>
                          <p className="font-body text-[10px] text-slate-500 font-medium leading-tight mb-2">
                            {ach.description}
                          </p>
                          {isUnlocked && (
                            <span className="font-heading text-[8px] font-extrabold text-emerald-500 tracking-widest uppercase mt-auto">
                              {new Date(ach.unlockedAt).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION: ACTIVITY */}
              {activeTab === 'activity' && (
                <div className="bg-white rounded-[2.5rem] border border-[#E5E7EB] p-8 sm:p-10 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#274dad]/5 blur-[60px] rounded-full" />
                  <div className="space-y-6">
                    {recentActivity.length > 0 ? recentActivity.map((act, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 bg-white rounded-2xl border border-slate-100 hover:border-[#274dad]/20 hover:shadow-md transition-all group">
                        <div className="p-4 bg-[#e4f2f0] rounded-2xl text-[#274dad] transition-colors group-hover:bg-[#274dad] group-hover:text-white border border-[#274dad]/10">
                          {act.type === 'lesson' ? <BookOpen className="w-6 h-6" /> : act.type === 'achievement' ? <Trophy className="w-6 h-6" /> : <Swords className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-heading font-extrabold text-[#1E293B] text-lg leading-tight mb-1">{act.title}</h4>
                          <p className="font-body text-sm font-medium text-slate-500">{act.detail}</p>
                        </div>
                        <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end gap-1">
                          <span className="font-heading font-extrabold text-xl text-emerald-600">+{act.xp} XP</span>
                          <span className="font-heading text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">{getRelativeTime(act.time)}</span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-20 text-slate-400">
                        <Clock className="w-16 h-16 mx-auto mb-4 opacity-10" />
                        <p className="font-body font-bold">Chưa có dấu vết hành trình tại đây.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION: PK ARENA */}
              {activeTab === 'pk' && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCardAcademic icon={<Swords />} color="text-rose-500" value={stats.pkWins + stats.pkLosses} label="Tổng trận PK" />
                    <StatCardAcademic icon={<Trophy />} color="text-emerald-500" value={stats.pkWins} label="Dành chiến thắng" />
                    <StatCardAcademic icon={<Target />} color="text-cyan-500" value={stats.pkWins + stats.pkLosses > 0 ? Math.round((stats.pkWins / (stats.pkWins + stats.pkLosses)) * 100) + '%' : '0%'} label="Tỷ lệ thắng" />
                    <StatCardAcademic icon={<TrendingUp />} color="text-purple-500" value={stats.pkRating} label="Xếp hạng Elo" />
                  </div>
                  <div className="bg-white rounded-[2rem] border border-[#E5E7EB] p-16 text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                      <Users className="w-10 h-10" />
                    </div>
                    <h3 className="font-heading text-2xl font-extrabold text-[#1E293B] mb-3">Sảnh Danh Vọng Đấu Trường</h3>
                    <p className="font-body text-slate-500 max-w-md mx-auto font-medium">Lịch sử giao đấu chi tiết đang được đồng bộ hóa từ máy chủ trung tâm.</p>
                  </div>
                </div>
              )}

            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const StatCardAcademic = ({ icon, value, label, subtext, color }) => (
  <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] hover:border-[#274dad]/20 shadow-sm transition-all group overflow-hidden relative">
    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#274dad]/20 to-transparent" />
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-xl bg-slate-50 border border-slate-100 ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
    <div>
      <div className="font-heading text-3xl font-extrabold text-[#1E293B] tracking-tight">{value}</div>
      <div className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">{label}</div>
      {subtext && <div className="font-heading text-[10px] text-[#274dad] mt-2 font-bold">{subtext}</div>}
    </div>
  </div>
);

export default Profile;



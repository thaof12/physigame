import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import { useEffect, useState } from 'react';
import {
  BookOpen, Trophy, Target, Clock, Star, Flame, Zap, Award, TrendingUp, Play, LogOut,
  ChevronDown, Swords, FlaskConical, Map, GraduationCap, Wrench,
  Atom, Beaker, Dna, Compass, Telescope, Lightbulb, Settings, Cpu, Rocket, Sparkles, User, Crown,
  ArrowRight, Activity, Timer, Medal, Gamepad2, Microscope, Brain, CircuitBoard, Waves, Route
} from 'lucide-react';
import api from '../../../config/api';
import QuestModal from '../../../components/Quest/QuestModal';
import Leaderboard from '../../../components/Leaderboard/Leaderboard';
import PhysicsHeaderBackground from '../../../components/animations/PhysicsHeaderBackground';
import SolarSystemBackground from '../../../components/animations/SolarSystemBackground';
import AuthorSignature from '../../../components/ui/AuthorSignature';

const PhysicsHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [programData, setProgramData] = useState(null);
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [computedStats, setComputedStats] = useState(null);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const availablePrograms = [
    { id: 'chemistry', name: 'Hóa học', icon: Beaker, path: '/program/chemistry', available: true },
    { id: 'physics', name: 'Vật lý', icon: Atom, path: '/program/physics', available: true },
    { id: 'biology', name: 'Sinh học', icon: Dna, path: '/program/biology', available: false },
    { id: 'math', name: 'Toán học', icon: Compass, path: '/program/math', available: false }
  ];

  const handleProgramChange = (program) => {
    if (!program.available) {
      alert(`Chương trình ${program.name} sắp ra mắt!`);
      return;
    }

    const hasProgram = user.programs?.some(p => p.programId === program.id && p.isActive);
    if (hasProgram) {
      navigate(program.path);
    } else {
      navigate(`/placement-test/${program.id}`);
    }
    setShowProgramDropdown(false);
  };

  const topicMapping = {
    6: {
      topics: ['Đại cương vật lý', 'Đo lường', 'Chuyển động', 'Lực'],
      icon: Telescope,
      color: 'from-blue-500 to-cyan-500'
    },
    7: {
      topics: ['Ánh sáng', 'Âm thanh', 'Nhiệt học cơ bản', 'Quang học'],
      icon: Lightbulb,
      color: 'from-emerald-500 to-teal-500'
    },
    8: {
      topics: ['Cơ học', 'Áp suất', 'Điện học cơ bản', 'Công suất'],
      icon: Settings,
      color: 'from-amber-500 to-orange-500'
    },
    9: {
      topics: ['Điện từ trường', 'Sóng điện từ', 'Quang học nâng cao', 'Dao động'],
      icon: Cpu,
      color: 'from-violet-500 to-purple-500'
    },
    10: {
      topics: ['Động học', 'Nhiệt động học', 'Dao động sóng', 'Điện xoay chiều'],
      icon: Rocket,
      color: 'from-rose-500 to-pink-500'
    }
  };

  useEffect(() => {
    const initializePhysicsProgram = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      const physicsProgram = user.programs?.find(p => p.programId === 'physics' && p.isActive);
      if (!physicsProgram) {
        navigate('/placement-test/physics');
        return;
      }

      setProgramData(physicsProgram);

      try {
        setLoading(true);
        const userUid = user?.firebaseUid || user?.uid;
        
        const userResponse = await api.get(`/users/firebase/${userUid}`);
        const userData = userResponse.data;
        
        const physProgram = userData.programs?.find(p => p.programId === 'physics');
        
        // Mock grades data - replace with actual API when available
        const mockGrades = [
          { grade: 6, icon: '🔭', color: 'from-blue-400 to-blue-600', totalLessons: 20, completedLessons: 0 },
          { grade: 7, icon: '🌟', color: 'from-green-400 to-green-600', totalLessons: 22, completedLessons: 0 },
          { grade: 8, icon: '⚙️', color: 'from-yellow-400 to-yellow-600', totalLessons: 24, completedLessons: 0 },
          { grade: 9, icon: '🔌', color: 'from-purple-400 to-purple-600', totalLessons: 26, completedLessons: 0 },
          { grade: 10, icon: '🚀', color: 'from-red-400 to-red-600', totalLessons: 28, completedLessons: 0 }
        ];

        setGrades(mockGrades);

        const stats = {
          totalLessons: 120,
          completedLessons: physProgram?.progress?.completedLessons?.length || 0,
          totalStars: physProgram?.progress?.totalStars || 0,
          currentStreak: 0,
          totalTimeSpent: 0
        };

        setComputedStats(stats);
        setLoading(false);
      } catch (error) {
        console.error('Error loading physics data:', error);
        setLoading(false);
      }
    };

    initializePhysicsProgram();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Atom className="w-10 h-10 text-white animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-30 animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-white">Đang tải dữ liệu...</h2>
          <p className="text-slate-400 mt-2">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  const stats = computedStats || {
    totalLessons: 120,
    completedLessons: 0,
    totalStars: 0,
    currentStreak: 0,
    totalTimeSpent: 0
  };

  const progressPercentage = (stats.completedLessons / stats.totalLessons) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      <SolarSystemBackground />
      <AuthorSignature />
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-[100px] animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/10 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950 opacity-90"></div>
      </div>

      {/* Hero Section - Compact */}
      <section className="relative py-6 px-4 z-10">
        <div className="container mx-auto max-w-7xl">
          {/* Navigation Bar - Compact */}
          <div className="flex items-center justify-between mb-5">
            {/* Program Selector Dropdown - Compact */}
            <div className="relative">
              <button
                onClick={() => setShowProgramDropdown(!showProgramDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 backdrop-blur hover:bg-slate-700/60 text-white rounded-xl font-medium transition-all border border-slate-700/40 hover:border-cyan-500/40"
              >
                <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                  <Atom className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm">Vật lý</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showProgramDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showProgramDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProgramDropdown(false)}
                  ></div>

                  <div className="absolute top-full left-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden z-50 shadow-2xl shadow-black/50">
                    <div className="p-4">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                        Chọn chương trình học
                      </p>
                      {availablePrograms.map((program) => {
                        const isActive = program.id === 'physics';
                        const isEnrolled = user.programs?.some(p => p.programId === program.id && p.isActive);
                        const IconComponent = program.icon;

                        return (
                          <button
                            key={program.id}
                            onClick={() => handleProgramChange(program)}
                            disabled={!program.available && !isEnrolled}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                              isActive
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                : program.available
                                ? 'hover:bg-slate-700/50 text-slate-300'
                                : 'opacity-40 cursor-not-allowed text-slate-500'
                            }`}
                          >
                            <div className={`p-2 rounded-xl ${isActive ? 'bg-cyan-500/30' : 'bg-slate-700/50'}`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-semibold">{program.name}</p>
                              {isActive && (
                                <p className="text-xs text-cyan-400">Đang học</p>
                              )}
                              {!program.available && !isActive && (
                                <p className="text-xs text-slate-500">Sắp ra mắt</p>
                              )}
                            </div>
                            {isActive && <Sparkles className="w-4 h-4 text-cyan-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons - Compact */}
            <div className="flex items-center gap-2">
              {/* Quest Button */}
              <button
                onClick={() => setShowQuestModal(true)}
                className="relative flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-orange-500/20 hover:shadow-orange-500/30"
                title="Nhiệm vụ"
              >
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Nhiệm vụ</span>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>

              {/* Leaderboard Button */}
              <button
                onClick={() => setShowLeaderboard(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-purple-500/20 hover:shadow-purple-500/30"
                title="Bảng xếp hạng"
              >
                <Crown className="w-4 h-4" />
                <span className="hidden sm:inline">Xếp hạng</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl text-sm font-medium transition-all border border-slate-700/40 hover:border-red-500/40"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Thoát</span>
              </button>
            </div>
          </div>

          {/* Welcome Banner - Modern Neon */}
          <div className="relative bg-black/60 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/10 overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.15)] group">
            <PhysicsHeaderBackground />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-100 shadow-[0_0_10px_rgba(34,211,238,0.8)] z-10"></div>
            
            {/* Banner Content with z-10 to stay above Phaser background */}
            <div className="relative flex items-center gap-5 z-10 pointer-events-none">
              <div className="relative shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <span className="text-2xl font-bold text-white">{(user?.username || user?.email)?.[0]?.toUpperCase() || 'U'}</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-800"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white truncate">
                  {user?.username || user?.email?.split('@')[0]}
                </h1>
                <p className="text-slate-400 text-sm">Tiếp tục hành trình Vật lý</p>
              </div>
              <div className="hidden sm:flex items-center gap-3 pointer-events-auto">
                <div className="flex items-center gap-1.5 px-4 py-2 bg-black/40 backdrop-blur border border-amber-500/30 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Star className="w-5 h-5 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" />
                  <span className="text-amber-400 font-bold text-base">{stats.totalStars}</span>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 bg-black/40 backdrop-blur border border-orange-500/30 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                  <Flame className="w-5 h-5 text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]" />
                  <span className="text-orange-400 font-bold text-base">{stats.currentStreak}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards - Compact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {/* Lessons Completed */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-5 border border-white/5 hover:border-emerald-500/50 shadow-[0_0_0_rgba(16,185,129,0)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-sm text-slate-300 tracking-wide font-semibold">BÀI HỌC</span>
              </div>
              <p className="text-3xl font-extrabold text-white tracking-tight">
                {stats.completedLessons}<span className="text-slate-500 text-lg font-medium ml-1">/{stats.totalLessons}</span>
              </p>
              <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,1)]"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Stars Earned */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-5 border border-white/5 hover:border-amber-500/50 shadow-[0_0_0_rgba(245,158,11,0)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                  <Medal className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-sm text-slate-300 tracking-wide font-semibold">SAO TÍCH LŨY</span>
              </div>
              <p className="text-3xl font-extrabold text-white tracking-tight">{stats.totalStars}</p>
            </div>

            {/* Streak */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-5 border border-white/5 hover:border-orange-500/50 shadow-[0_0_0_rgba(249,115,22,0)] hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-orange-500/20 border border-orange-500/30 rounded-xl shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                  <Zap className="w-5 h-5 text-orange-400" />
                </div>
                <span className="text-sm text-slate-300 tracking-wide font-semibold">STREAK</span>
              </div>
              <p className="text-3xl font-extrabold text-white tracking-tight">{stats.currentStreak}<span className="text-slate-500 text-lg font-medium ml-2">ngày</span></p>
            </div>

            {/* Time Spent */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-5 border border-white/5 hover:border-cyan-500/50 shadow-[0_0_0_rgba(34,211,238,0)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-cyan-500/20 border border-cyan-500/30 rounded-xl shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                  <Timer className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-sm text-slate-300 tracking-wide font-semibold">THỜI GIAN</span>
              </div>
              <p className="text-3xl font-extrabold text-white tracking-tight">{Math.floor(stats.totalTimeSpent / 60)}<span className="text-slate-500 text-lg font-medium ml-2">phút</span></p>
            </div>
          </div>

          {/* Quick Actions - Compact & Modern */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {/* Start Learning */}
            <button
              onClick={() => navigate('/program/physics/dashboard')}
              className="group relative bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl p-4 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5 overflow-hidden"
            >
              <div className="relative flex flex-col items-start">
                <div className="p-2 bg-white/20 rounded-lg mb-3">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm">Học ngay</span>
                <span className="text-emerald-100 text-xs mt-0.5">Tiếp tục</span>
              </div>
              <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Game Journey */}
            <button
              onClick={() => navigate('/game-journey')}
              className="group relative bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-4 shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:-translate-y-0.5 overflow-hidden"
            >
              <div className="relative flex flex-col items-start">
                <div className="p-2 bg-white/20 rounded-lg mb-3">
                  <Route className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm">Hành trình</span>
                <span className="text-amber-100 text-xs mt-0.5">Khám phá</span>
              </div>
              <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* PK Battle */}
            <button
              onClick={() => navigate('/pk-battle')}
              className="group relative bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-xl p-4 shadow-md shadow-rose-500/20 hover:shadow-rose-500/30 transition-all hover:-translate-y-0.5 overflow-hidden"
            >
              <div className="absolute top-3 right-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                </span>
              </div>
              <div className="relative flex flex-col items-start">
                <div className="p-2 bg-white/20 rounded-lg mb-3">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm">Thi đấu</span>
                <span className="text-rose-100 text-xs mt-0.5">PK Battle</span>
              </div>
              <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Profile */}
            <button
              onClick={() => navigate('/profile')}
              className="group relative bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-xl p-4 shadow-md shadow-violet-500/20 hover:shadow-violet-500/30 transition-all hover:-translate-y-0.5 overflow-hidden"
            >
              <div className="relative flex flex-col items-start">
                <div className="p-2 bg-white/20 rounded-lg mb-3">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm">Hồ sơ</span>
                <span className="text-violet-100 text-xs mt-0.5">Thành tích</span>
              </div>
              <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Tools Row - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {/* Physics Tools */}
            <button
              onClick={() => navigate('/physics-tools')}
              className="group bg-slate-800/40 backdrop-blur rounded-xl p-4 border border-slate-700/30 hover:border-cyan-500/40 transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-md shadow-cyan-500/20">
                  <CircuitBoard className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Công cụ Vật lý</span>
                    <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-[10px] font-semibold">NEW</span>
                  </div>
                  <span className="text-slate-400 text-xs">Máy tính, Hằng số</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>

            {/* Interactive Lectures */}
            <button
              onClick={() => navigate('/interactive-lectures')}
              className="group bg-slate-800/40 backdrop-blur rounded-xl p-4 border border-slate-700/30 hover:border-violet-500/40 transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg shadow-md shadow-violet-500/20">
                  <Waves className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Bài giảng</span>
                    <span className="px-1.5 py-0.5 bg-violet-500/20 text-violet-400 rounded text-[10px] font-semibold">NEW</span>
                  </div>
                  <span className="text-slate-400 text-xs">Video & Mô phỏng</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>

            {/* Virtual Lab */}
            <button
              onClick={() => navigate('/vatly/virtual-lab')}
              className="group bg-slate-800/40 backdrop-blur rounded-xl p-4 border border-slate-700/30 hover:border-emerald-500/40 transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md shadow-emerald-500/20">
                  <Microscope className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Thí nghiệm ảo</span>
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-semibold">NEW</span>
                  </div>
                  <span className="text-slate-400 text-xs">Phòng lab trực tuyến</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Video */}
      <section className="px-4 pb-2 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="bg-slate-900/45 backdrop-blur rounded-2xl border border-slate-700/40 overflow-hidden shadow-xl shadow-cyan-900/20">
            <div className="px-4 md:px-6 pt-4 md:pt-5 pb-3 border-b border-slate-700/30">
              <h3 className="text-base md:text-lg font-bold text-white">Video bài giảng nổi bật</h3>
              <p className="text-slate-400 text-xs md:text-sm mt-1">Xem nhanh trước khi bắt đầu lộ trình học tập</p>
            </div>

            <div className="p-3 md:p-4">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black ring-1 ring-slate-700/40">
                <video
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                  src="/video/final.mp4"
                >
                  Trình duyệt của bạn không hỗ trợ phát video.
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Path - Compact */}
      <section className="py-8 px-4 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Lộ trình học tập</h2>
            </div>
            <p className="text-slate-400 text-sm ml-8">Vật lý lớp 6 - 10</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {grades.map((grade, index) => {
              const gradeTopics = topicMapping[grade.grade];
              const progress = grade.totalLessons > 0
                ? (grade.completedLessons / grade.totalLessons) * 100
                : 0;
              const IconComponent = gradeTopics?.icon || Atom;

              return (
                <div
                  key={grade.grade}
                  className="group bg-slate-800/40 backdrop-blur rounded-xl p-4 border border-slate-700/30 hover:border-cyan-500/40 transition-all hover:-translate-y-0.5 cursor-pointer"
                  onClick={() => navigate('/program/physics/dashboard')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 bg-gradient-to-br ${gradeTopics?.color || 'from-cyan-500 to-blue-600'} rounded-lg`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">{Math.round(progress)}%</span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2">Lớp {grade.grade}</h3>

                  <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${gradeTopics?.color || 'from-cyan-500 to-blue-600'}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <span className="text-xs text-slate-400">{grade.completedLessons}/{grade.totalLessons} bài</span>
                </div>
              );
            })}

            {/* Challenge Card - Compact */}
            <div
              className="group bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all hover:-translate-y-0.5 cursor-pointer text-white"
              onClick={() => navigate('/advanced-physics-challenge')}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Trophy className="w-5 h-5" />
                </div>
                <Sparkles className="w-4 h-4 text-amber-200" />
              </div>

              <h3 className="text-sm font-bold mb-1">Thử thách</h3>
              <p className="text-amber-100 text-xs">9 game tương tác</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Compact */}
      <section className="py-8 px-4 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-1">Tại sao chọn chúng tôi?</h2>
            <p className="text-slate-400 text-sm">Phương pháp học hiện đại</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-800/40 backdrop-blur rounded-xl p-5 border border-slate-700/30 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white">Game tương tác</h3>
              </div>
              <p className="text-slate-400 text-sm">Học qua game mô phỏng và thí nghiệm ảo</p>
            </div>

            <div className="bg-slate-800/40 backdrop-blur rounded-xl p-5 border border-slate-700/30 hover:border-amber-500/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                  <Microscope className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white">Mô phỏng thực tế</h3>
              </div>
              <p className="text-slate-400 text-sm">Trải nghiệm hiện tượng vật lý chân thực</p>
            </div>

            <div className="bg-slate-800/40 backdrop-blur rounded-xl p-5 border border-slate-700/30 hover:border-violet-500/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white">Theo dõi tiến độ</h3>
              </div>
              <p className="text-slate-400 text-sm">Hệ thống đánh giá chi tiết</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quest Modal */}
      <QuestModal 
        isOpen={showQuestModal} 
        onClose={() => setShowQuestModal(false)} 
      />

      {/* Leaderboard Modal */}
      <Leaderboard 
        isOpen={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)} 
      />
    </div>
  );
};

export default PhysicsHome;

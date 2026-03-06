import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import { useEffect, useState } from 'react';
import { BookOpen, Trophy, Target, Clock, Star, Flame, Zap, Award, TrendingUp, Play, LogOut, ChevronDown, Swords, Calculator, FlaskConical, Map, GraduationCap, Wrench } from 'lucide-react';
import api from '../../../config/api';
import QuestModal from '../../../components/Quest/QuestModal';
import Leaderboard from '../../../components/Leaderboard/Leaderboard';

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
    { id: 'chemistry', name: 'Hóa học', icon: '🧪', path: '/program/chemistry', available: true },
    { id: 'physics', name: 'Vật lý', icon: '⚛️', path: '/program/physics', available: true },
    { id: 'biology', name: 'Sinh học', icon: '🧬', path: '/program/biology', available: false },
    { id: 'math', name: 'Toán học', icon: '📐', path: '/program/math', available: false }
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
      icon: '🔭'
    },
    7: {
      topics: ['Ánh sáng', 'Âm thanh', 'Nhiệt học cơ bản', 'Quang học'],
      icon: '🌟'
    },
    8: {
      topics: ['Cơ học', 'Áp suất', 'Điện học cơ bản', 'Công suất'],
      icon: '⚙️'
    },
    9: {
      topics: ['Điện từ trường', 'Sóng điện từ', 'Quang học nâng cao', 'Dao động'],
      icon: '🔌'
    },
    10: {
      topics: ['Động học', 'Nhiệt động học', 'Dao động sóng', 'Điện xoay chiều'],
      icon: '🚀'
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⚛️</div>
          <h2 className="text-2xl font-bold text-gray-700">Đang tải dữ liệu...</h2>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Navigation Bar */}
          <div className="flex items-center justify-between mb-6">
            {/* Program Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProgramDropdown(!showProgramDropdown)}
                className="flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-all shadow-md hover:shadow-lg border border-gray-200"
              >
                <span className="text-2xl">⚛️</span>
                <span>Vật lý</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showProgramDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showProgramDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProgramDropdown(false)}
                  ></div>
                  
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                    <div className="p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                        Chọn chương trình học
                      </p>
                      {availablePrograms.map((program) => {
                        const isActive = program.id === 'physics';
                        const isEnrolled = user.programs?.some(p => p.programId === program.id && p.isActive);
                        
                        return (
                          <button
                            key={program.id}
                            onClick={() => handleProgramChange(program)}
                            disabled={!program.available && !isEnrolled}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                              isActive 
                                ? 'bg-green-50 text-green-700 border-2 border-green-200' 
                                : program.available
                                ? 'hover:bg-gray-50 text-gray-700'
                                : 'opacity-50 cursor-not-allowed text-gray-400'
                            }`}
                          >
                            <span className="text-2xl">{program.icon}</span>
                            <div className="flex-1 text-left">
                              <p className="font-semibold">{program.name}</p>
                              {isActive && (
                                <p className="text-xs text-green-600">Đang học</p>
                              )}
                              {!program.available && !isActive && (
                                <p className="text-xs text-gray-400">Sắp ra mắt</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Quest Button */}
              <button
                onClick={() => setShowQuestModal(true)}
                className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg hover:scale-105"
                title="Nhiệm vụ"
              >
                <Target className="w-5 h-5" />
                <span className="hidden sm:inline">Nhiệm vụ</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </button>

              {/* Leaderboard Button */}
              <button
                onClick={() => setShowLeaderboard(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg hover:scale-105"
                title="Bảng xếp hạng"
              >
                <Trophy className="w-5 h-5" />
                <span className="hidden sm:inline">Xếp hạng</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-xl font-medium transition-all shadow-md hover:shadow-lg border border-gray-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 rounded-3xl p-8 mb-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Xin chào, {user?.username || user?.email?.split('@')[0]}! 👋
                </h1>
                <p className="text-green-50 text-lg">
                  Chào mừng đến với hành trình khám phá Vật lý
                </p>
              </div>
              <div className="text-8xl opacity-90">⚛️</div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">
                {stats.completedLessons}/{stats.totalLessons}
              </p>
              <p className="text-sm text-gray-600">Bài học hoàn thành</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <Award className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">
                {stats.totalStars}
              </p>
              <p className="text-sm text-gray-600">Sao đạt được</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">
                {stats.currentStreak}
              </p>
              <p className="text-sm text-gray-600">Ngày liên tiếp</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">
                {Math.floor(stats.totalTimeSpent / 60)}
              </p>
              <p className="text-sm text-gray-600">Phút học tập</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => navigate('/program/physics/dashboard')}
              className="group bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Play className="w-6 h-6" />
                </div>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Bắt đầu học</h3>
              <p className="text-green-100 text-sm">Tiếp tục hành trình của bạn</p>
            </button>

            {/* Game Journey Button */}
            <button
              onClick={() => navigate('/game-journey')}
              className="group bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Map className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">MỚI</span>
                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">🗺️ Hành trình Game</h3>
                <p className="text-amber-100 text-sm">Chơi game theo thứ tự từng lớp</p>
              </div>
            </button>

            {/* PK Battle Button */}
            <button
              onClick={() => navigate('/pk-battle')}
              className="group bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 hover:from-red-600 hover:via-pink-600 hover:to-purple-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Swords className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">⚔️ Thi đấu PK</h3>
                <p className="text-pink-100 text-sm">Đấu trí với người chơi khác</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="group bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Award className="w-6 h-6" />
                </div>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Hồ sơ</h3>
              <p className="text-purple-100 text-sm">Xem thành tích của bạn</p>
            </button>
          </div>

          {/* Physics Tools - Calculator */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => navigate('/physics-tools')}
              className="group bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="relative flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl">
                  <Wrench className="w-8 h-8" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold">🛠️ Công cụ Vật lý</h3>
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">MỚI</span>
                  </div>
                  <p className="text-cyan-100 text-sm">Máy tính, Hằng số vật lý, Chuyển đổi đơn vị</p>
                </div>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Interactive Lectures */}
            <button
              onClick={() => navigate('/interactive-lectures')}
              className="group bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="relative flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold">📖 Bài giảng tương tác</h3>
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">MỚI</span>
                  </div>
                  <p className="text-violet-100 text-sm">Học lý thuyết qua video và mô phỏng sinh động</p>
                </div>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          {/* Virtual Lab Button - Full Width */}
          <div className="mt-4">
            <button
              onClick={() => navigate('/vatly/virtual-lab')}
              className="w-full group bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="relative flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl">
                  <FlaskConical className="w-8 h-8" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold">🔬 Phòng Thí Nghiệm Ảo</h3>
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">MỚI</span>
                  </div>
                  <p className="text-emerald-100 text-sm">Thực hành thí nghiệm Vật lý trực tuyến - Thu thập số liệu và phân tích kết quả</p>
                </div>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <span className="text-4xl">🎯</span>
              Lộ trình học tập
            </h2>
            <p className="text-gray-600">Chương trình Vật lý từ lớp 6 đến lớp 10</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grades.map((grade, index) => {
              const gradeTopics = topicMapping[grade.grade];
              const progress = grade.totalLessons > 0 
                ? (grade.completedLessons / grade.totalLessons) * 100 
                : 0;

              return (
                <div
                  key={grade.grade}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                  onClick={() => navigate('/program/physics/dashboard')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`text-5xl p-3 bg-gradient-to-br ${grade.color} rounded-2xl shadow-lg`}>
                      <span className="filter drop-shadow-lg">{gradeTopics?.icon || '⚛️'}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Tiến độ</p>
                      <p className="text-2xl font-bold text-gray-800">{Math.round(progress)}%</p>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Lớp {grade.grade}
                  </h3>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${grade.color}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      📚 {grade.completedLessons}/{grade.totalLessons} bài học
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {gradeTopics?.topics.slice(0, 3).map((topic, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Challenge Card */}
            <div
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer text-white"
              onClick={() => navigate('/advanced-physics-challenge')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl p-3 bg-white/20 rounded-2xl">
                  🏆
                </div>
                <Target className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-bold mb-2">
                Thử thách Vật lý
              </h3>

              <p className="text-orange-100 mb-4">
                9 game tương tác để thử thách kiến thức của bạn
              </p>

              <div className="flex items-center gap-2 text-sm">
                <Play className="w-4 h-4" />
                <span>Bắt đầu ngay →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-transparent to-green-50/50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Tại sao chọn chương trình Vật lý của chúng tôi?
            </h2>
            <p className="text-gray-600 text-lg">
              Phương pháp học hiện đại, hiệu quả cao
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg">
                🎮
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Game tương tác</h3>
              <p className="text-gray-600">
                Học Vật lý qua các game mô phỏng và thí nghiệm ảo thú vị
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg">
                🔬
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Mô phỏng thực tế</h3>
              <p className="text-gray-600">
                Trải nghiệm các hiện tượng vật lý qua mô phỏng chân thực
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg">
                📊
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Theo dõi tiến độ</h3>
              <p className="text-gray-600">
                Hệ thống đánh giá chi tiết giúp bạn nắm rõ quá trình học
              </p>
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

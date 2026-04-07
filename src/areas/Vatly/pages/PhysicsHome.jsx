import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import {
  Trophy, Target, Star, Flame, Zap, Play, ChevronRight, Swords, FlaskConical, Route,
  Atom, Beaker, Brain, CircuitBoard, Waves, Hexagon, Medal, Timer, Activity,
  Gamepad2, Microscope, TrendingUp
} from 'lucide-react';
import api from '../../../config/api';
import QuestModal from '../../../components/Quest/QuestModal';
import Leaderboard from '../../../components/Leaderboard/Leaderboard';
import SolarSystemBackground from '../../../components/animations/SolarSystemBackground';

const PhysicsHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [computedStats, setComputedStats] = useState(null);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [grades, setGrades] = useState([]);

  const topicMapping = {
    6: { topics: ['Đại cương vật lý', 'Đo lường', 'Lực'], icon: Telescope, color: 'from-blue-500 to-cyan-500' },
    7: { topics: ['Ánh sáng', 'Âm thanh', 'Quang học'], icon: Waves, color: 'from-emerald-500 to-teal-500' },
    8: { topics: ['Cơ học', 'Áp suất', 'Công suất'], icon: Hexagon, color: 'from-amber-500 to-orange-500' },
    9: { topics: ['Điện từ trường', 'Sóng điện từ', 'Dao động'], icon: CircuitBoard, color: 'from-violet-500 to-purple-500' },
    10: { topics: ['Động lực học', 'Nhiệt động học', 'Điện xoay chiều'], icon: Atom, color: 'from-rose-500 to-pink-500' }
  };

  function Telescope(props) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"/><path d="m13.56 11.747 4.332-.924"/><path d="m16 21-3.105-6.21"/><path d="M16.485 5.33l-.922-1.844"/><path d="M6.082 11.964l1.3-4.593"/><path d="m20.505 13.513-2.128-4.256"/></svg>;
  }

  useEffect(() => {
    const initializePhysicsProgram = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        setLoading(true);
        const userUid = user?.firebaseUid || user?.uid;
        let physProgram = user.programs?.find(p => p.programId === 'physics');
        
        if (!physProgram && userUid) {
          const userResponse = await api.get(`/users/firebase/${userUid}`);
          physProgram = userResponse.data.programs?.find(p => p.programId === 'physics');
        }

        const stats = {
          totalLessons: 120,
          completedLessons: physProgram?.progress?.completedLessons?.length || 0,
          totalStars: physProgram?.progress?.totalStars || 0,
          currentStreak: physProgram?.progress?.currentStreak || 0,
          totalTimeSpent: 0
        };

        const mockGrades = [
          { grade: 6, totalLessons: 20, completedLessons: 0 },
          { grade: 7, totalLessons: 22, completedLessons: 0 },
          { grade: 8, totalLessons: 24, completedLessons: 0 },
          { grade: 9, totalLessons: 26, completedLessons: 0 },
          { grade: 10, totalLessons: 28, completedLessons: 0 }
        ];

        setGrades(mockGrades);
        setComputedStats(stats);
      } catch (error) {
        console.error('Error loading physics data:', error);
      } finally {
        setLoading(false);
      }
    };
    initializePhysicsProgram();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center relative">
         <div className="w-24 h-24 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin"></div>
            <Atom className="w-10 h-10 text-cyan-400 animate-pulse" />
         </div>
      </div>
    );
  }

  const stats = computedStats || { totalLessons: 120, completedLessons: 0, totalStars: 0, currentStreak: 0, totalTimeSpent: 0 };
  const progressPercentage = (stats.completedLessons / stats.totalLessons) * 100;

  return (
    <div className="min-h-full relative overflow-hidden font-sans pb-20">
      
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 opacity-50">
        <SolarSystemBackground />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 py-8">
        
        {/* HERO COMMAND CENTER */}
        <div className="relative w-full rounded-[2.5rem] bg-[#020617]/80 backdrop-blur-3xl border border-cyan-500/20 overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.15)] mb-10">
          
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-cyan-900/40 to-transparent pointer-events-none"></div>
          
          <div className="p-8 sm:p-12 pb-6 lg:pb-12 flex flex-col lg:flex-row items-center gap-10">
            
            {/* Left Info */}
            <div className="flex-1 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-sm mb-6 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                TRẠM ĐIỀU MÀNH CHÍNH
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
                Chào mừng Tư lệnh,<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                  {user?.displayName || user?.email?.split('@')[0]}
                </span>
              </h1>
              <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed font-medium">
                Vũ trụ vật lý đang mở ra trước mắt. Hãy thiết lập lộ trình học tập hôm nay của bạn.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <button
                  onClick={() => navigate(`/physics-class/${user?.profile?.grade || 10}`)}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-white font-black text-lg hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] focus:ring-4 focus:ring-cyan-500/30 transition-all active:scale-95 flex items-center gap-3"
                >
                  <Play className="fill-current w-5 h-5" />
                  Tiếp Tục Chinh Phục
                </button>
                <button
                  onClick={() => setShowQuestModal(true)}
                  className="px-8 py-4 bg-slate-800/80 rounded-2xl text-white font-bold text-lg border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-700/80 transition-all focus:ring-4 focus:ring-slate-800 active:scale-95 flex items-center gap-3 shadow-lg"
                >
                  <Target className="w-5 h-5 text-cyan-400" />
                  Nhận Nhiệm Vụ
                </button>
              </div>
            </div>

            {/* Right Hologram/Stats */}
            <div className="w-full lg:w-5/12 z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/60 border border-slate-700/50 p-5 rounded-3xl backdrop-blur-sm group hover:border-emerald-500/50 transition-colors">
                  <Activity className="w-8 h-8 text-emerald-400 mb-3 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <p className="text-slate-400 text-sm font-semibold mb-1">TIẾN ĐỘ</p>
                  <p className="text-3xl font-black text-white">{progressPercentage.toFixed(1)}<span className="text-lg text-slate-500 ml-1">%</span></p>
                </div>
                <div className="bg-slate-900/60 border border-slate-700/50 p-5 rounded-3xl backdrop-blur-sm group hover:border-amber-500/50 transition-colors">
                  <Star className="w-8 h-8 text-amber-400 mb-3 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] fill-amber-400/20" />
                  <p className="text-slate-400 text-sm font-semibold mb-1">TỔNG SAO TÍCH QUỸ</p>
                  <p className="text-3xl font-black text-white">{stats.totalStars}</p>
                </div>
                <div className="bg-slate-900/60 border border-slate-700/50 p-5 rounded-3xl backdrop-blur-sm group hover:border-orange-500/50 transition-colors">
                  <Flame className="w-8 h-8 text-orange-500 mb-3 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)] fill-orange-500/20" />
                  <p className="text-slate-400 text-sm font-semibold mb-1">CHUỖI STREAK</p>
                  <p className="text-3xl font-black text-white">{stats.currentStreak} <span className="text-lg text-slate-500 font-medium">ngày</span></p>
                </div>
                <div className="bg-slate-900/60 border border-slate-700/50 p-5 rounded-3xl backdrop-blur-sm group hover:border-purple-500/50 transition-colors cursor-pointer" onClick={() => setShowLeaderboard(true)}>
                  <Trophy className="w-8 h-8 text-purple-400 mb-3 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                  <p className="text-slate-400 text-sm font-semibold mb-1">BẢNG XẾP HẠNG</p>
                  <p className="text-xl font-bold text-white flex gap-2 items-center">Xem vị thế <ChevronRight className="w-4 h-4 text-purple-500"/></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURE GATEWAYS */}
        <div className="mb-14">
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
             <div className="w-1.5 h-6 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
             Khu vực Trải nghiệm
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: "Thí nghiệm thực tế ảo", desc: "Tương tác với phòng Lab 3D", icon: Microscope,
                glow: "from-emerald-500 to-teal-500", path: "/vatly/virtual-lab"
              },
              {
                title: "Đấu trường PK", desc: "So tài cùng đối thủ", icon: Swords,
                glow: "from-rose-500 to-orange-500", path: "/pk-battle"
              },
              {
                title: "Công cụ Phân tích", desc: "Máy tính & Hằng số Vật lý", icon: CircuitBoard,
                glow: "from-blue-500 to-indigo-500", path: "/physics-tools"
              },
              {
                title: "Thử thách giải đố", desc: "Minigames đa dạng", icon: Gamepad2,
                glow: "from-purple-500 to-pink-500", path: "/advanced-physics-challenge"
              }
            ].map((gateway, idx) => {
              const Icon = gateway.icon;
              return (
                <div onClick={() => navigate(gateway.path)} key={idx} className="group relative rounded-3xl bg-slate-900/50 backdrop-blur border border-slate-700 hover:border-slate-500 p-6 flex flex-col items-center text-center cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1">
                  
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gateway.glow} opacity-10 blur-3xl group-hover:opacity-30 transition-opacity duration-500 rounded-full pointer-events-none`}></div>
                  
                  <div className={`w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{gateway.title}</h3>
                  <p className="text-slate-400 text-sm font-medium">{gateway.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* LEARNING PATHWAY GRID */}
        <div>
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
             <div className="w-1.5 h-6 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
             Bản đồ Không gian Học tập
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {grades.map((grade) => {
              const gradeTopics = topicMapping[grade.grade];
              const progress = grade.totalLessons > 0 ? (grade.completedLessons / grade.totalLessons) * 100 : 0;
              const IconComponent = gradeTopics?.icon || Atom;

              return (
                <div
                  key={grade.grade}
                  className="group bg-[#0B1221] rounded-[2rem] p-5 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer overflow-hidden relative"
                  onClick={() => navigate(`/physics-class/${grade.grade}`)}
                >
                  <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${gradeTopics?.color} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`}></div>
                  
                  <div className="flex flex-col h-full relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradeTopics?.color || 'from-cyan-500 to-blue-600'} shadow-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <span className="px-3 py-1 bg-slate-800 text-white font-bold text-sm rounded-full border border-slate-700">Lớp {grade.grade}</span>
                    </div>

                    <h3 className="font-extrabold text-white text-lg mb-4 flex-grow tracking-wide">
                       Vật lý Lớp {grade.grade}
                    </h3>
                    
                    <div className="mt-auto">
                       <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                         <span>Tiến độ</span>
                         <span className="text-white">{Math.round(progress)}%</span>
                       </div>
                       <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner flex">
                         <div
                           className={`h-full rounded-full bg-gradient-to-r ${gradeTopics?.color || 'from-cyan-500 to-blue-600'} shadow-[0_0_8px_rgba(255,255,255,0.3)]`}
                           style={{ width: `${progress}%` }}
                         ></div>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <QuestModal isOpen={showQuestModal} onClose={() => setShowQuestModal(false)} />
      <Leaderboard isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
    </div>
  );
};

export default PhysicsHome;

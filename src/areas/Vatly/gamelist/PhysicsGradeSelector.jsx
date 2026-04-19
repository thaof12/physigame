import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gamepad2, Star, Trophy, Zap, Orbit, BookOpen, Target, ChevronRight } from 'lucide-react';
import { physicsGames } from '../data/physicsGames';
import { grade6Games } from '../data/grade6Games';
import { grade7Games } from '../data/grade7Games';
import { grade8Games } from '../data/grade8Games';
import { grade9Games } from '../data/grade9Games';
import { grade10Games } from '../data/grade10Games';
import SolarSystemBackground from '../../../components/animations/SolarSystemBackground';

const gradeConfig = [
  {
    id: 6, name: 'Lớp 6', description: 'Cơ học & Nhiệt học cơ bản',
    color: 'from-violet-500 to-purple-600', glow: 'rgba(139,92,246,0.3)',
    borderHover: 'hover:border-violet-500/50', icon: '🔭'
  },
  {
    id: 7, name: 'Lớp 7', description: 'Ánh sáng & Âm thanh',
    color: 'from-sky-500 to-blue-600', glow: 'rgba(14,165,233,0.3)',
    borderHover: 'hover:border-sky-500/50', icon: '🌟'
  },
  {
    id: 8, name: 'Lớp 8', description: 'Điện học & Cơ học',
    color: 'from-emerald-500 to-teal-600', glow: 'rgba(16,185,129,0.3)',
    borderHover: 'hover:border-emerald-500/50', icon: '⚡'
  },
  {
    id: 9, name: 'Lớp 9', description: 'Điện từ & Sóng cơ',
    color: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.3)',
    borderHover: 'hover:border-amber-500/50', icon: '🌊'
  },
  {
    id: 10, name: 'Lớp 10', description: 'Động học & Nhiệt động lực học',
    color: 'from-rose-500 to-pink-600', glow: 'rgba(244,63,94,0.3)',
    borderHover: 'hover:border-rose-500/50', icon: '🚀'
  },
  {
    id: 11, name: 'Lớp 11', description: 'Dao động & Sóng điện từ',
    color: 'from-red-500 to-rose-600', glow: 'rgba(239,68,68,0.3)',
    borderHover: 'hover:border-red-500/50', icon: '🔥'
  },
  {
    id: 12, name: 'Lớp 12', description: 'Vật lý hiện đại & Hạt nhân',
    color: 'from-fuchsia-500 to-purple-600', glow: 'rgba(217,70,239,0.3)',
    borderHover: 'hover:border-fuchsia-500/50', icon: '⚛️'
  },
];

const getGameCount = (id) => {
  const map = { 6: grade6Games, 7: grade7Games, 8: grade8Games, 9: grade9Games, 10: grade10Games };
  return map[id]?.length || 0;
};

const totalGames = grade6Games.length + grade7Games.length + grade8Games.length + grade9Games.length + grade10Games.length;

const PhysicsGradeSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative bg-slate-950 font-sans pb-20">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <SolarSystemBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/70 to-slate-950"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">

        {/* ── MASTHEAD ── */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/program/physics')}
            className="group flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium mb-6 bg-purple-950/30 px-5 py-2.5 rounded-full border border-purple-800/50 w-fit backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            TRẠM ĐIỀU HÀNH
          </button>

          <div className="relative rounded-[2rem] bg-slate-900/60 backdrop-blur-3xl border border-purple-500/20 overflow-hidden shadow-[0_0_60px_rgba(139,92,246,0.1)] p-8 md:p-12">
            <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-l from-purple-900/30 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-xs font-bold mb-4 shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                <Gamepad2 className="w-3.5 h-3.5" />
                ĐẤU TRƯỜNG TRI THỨC — GAME VẬT LÝ TƯƠNG TÁC
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3">
                Chiến trường <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Game Vật Lý
                </span>
              </h1>
              <p className="text-slate-300 text-lg max-w-2xl font-medium mb-8">
                Lựa chọn Phân khu theo Cấp độ của bạn. Mỗi Cấp độ là một vũ trụ kiến thức khác nhau, chứa đầy nhiệm vụ game tương tác.
              </p>

              {/* Stats bar */}
              <div className="flex flex-wrap gap-6">
                {[
                  { icon: BookOpen, value: '7', label: 'CẤP LỚP', color: 'text-blue-400' },
                  { icon: Gamepad2, value: totalGames.toString(), label: 'TỔNG GAME', color: 'text-purple-400' },
                  { icon: Trophy, value: '0', label: 'HOÀN THÀNH', color: 'text-amber-400' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 bg-slate-900/60 border border-slate-700 rounded-2xl px-5 py-3 backdrop-blur-md">
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                      <div>
                        <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs font-bold text-slate-500 tracking-widest">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── GRADE CARDS GRID ── */}
        <div className="mb-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="w-1.5 h-6 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]"></div>
            Chọn Phân Khu Chiến Đấu
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {gradeConfig.map((grade, index) => {
            const gameCount = getGameCount(grade.id);
            const isAvailable = gameCount > 0;

            return (
              <div
                key={grade.id}
                onClick={() => navigate(`/physics-games/grade/${grade.id}`)}
                className={`group relative rounded-3xl bg-slate-900/60 backdrop-blur border border-slate-800 ${grade.borderHover} cursor-pointer overflow-hidden transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Glow effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ boxShadow: `inset 0 0 40px ${grade.glow}` }}
                />

                {/* Top gradient banner */}
                <div className={`relative bg-gradient-to-br ${grade.color} h-28 p-5 overflow-hidden`}>
                  <div className="absolute -right-4 -top-4 text-7xl opacity-20 transform rotate-12 select-none">
                    {grade.icon}
                  </div>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <span className="text-4xl">{grade.icon}</span>
                    <h3 className="text-xl font-black text-white drop-shadow">{grade.name}</h3>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <p className="text-slate-400 text-sm mb-4 leading-relaxed font-medium">{grade.description}</p>

                  {/* Game count */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Gamepad2 className="w-4 h-4 text-slate-500" />
                      <span className="font-bold text-white">{gameCount}</span>
                      <span className="text-slate-500">game</span>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                      isAvailable
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                      {isAvailable ? '● SẴN SÀNG' : '○ SẮP RA MẮT'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>Tiến độ</span><span>0%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className={`bg-gradient-to-r ${grade.color} h-1.5 rounded-full`} style={{ width: '0%' }} />
                    </div>
                  </div>

                  {/* Launch button */}
                  <button
                    className={`w-full py-3 rounded-2xl font-black text-sm tracking-wider transition-all flex items-center justify-center gap-2 ${
                      isAvailable
                        ? `bg-gradient-to-r ${grade.color} text-white shadow-md group-hover:shadow-lg active:scale-95`
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    {isAvailable ? (
                      <><Zap className="w-4 h-4" />THÂM NHẬP<ChevronRight className="w-4 h-4" /></>
                    ) : (
                      'SẮP RA MẮT'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── PROMO SECTION ── */}
        <div className="mt-14 grid md:grid-cols-2 gap-5">
          <div className="relative bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border border-blue-500/20 rounded-3xl p-8 overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/20 blur-[60px] rounded-full"></div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                <Star className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">Game Tương Tác Thực</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Mỗi game được thiết kế phản ánh đúng chương trình học, giúp bạn nắm vững các khái niệm vật lý qua thực chiến.</p>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/20 rounded-3xl p-8 overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full"></div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30">
                <Trophy className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">Bảng Xếp Hạng Vũ Trụ</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Hoàn thành các game để mở khóa nội dung độc quyền và leo thang bảng xếp hạng toàn cầu cùng những Tư lệnh khác.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsGradeSelector;

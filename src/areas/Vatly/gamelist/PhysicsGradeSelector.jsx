import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Gamepad2, Trophy, CheckCircle2, Lock, Flag } from 'lucide-react';
import { physicsGames } from '../data/physicsGames';
import { grade6Games } from '../data/grade6Games';
import { grade7Games } from '../data/grade7Games';
import { grade8Games } from '../data/grade8Games';
import { grade9Games } from '../data/grade9Games';
import { grade10Games } from '../data/grade10Games';
import { grade11Games } from '../data/grade11Games';
import { grade12Games } from '../data/grade12Games';

const PhysicsGradeSelector = () => {
  const navigate = useNavigate();

  const roadmap = [
    { id: 6, name: 'Lớp 6', color: 'from-sky-500 to-cyan-500', icon: '🛰️', description: 'Khởi động nền tảng: chuyển động, lực cơ bản' },
    { id: 7, name: 'Lớp 7', color: 'from-blue-500 to-indigo-500', icon: '🔭', description: 'Ánh sáng và âm thanh qua thí nghiệm tương tác' },
    { id: 8, name: 'Lớp 8', color: 'from-emerald-500 to-teal-500', icon: '🧲', description: 'Cơ học, áp suất và điện học ứng dụng' },
    { id: 9, name: 'Lớp 9', color: 'from-amber-500 to-orange-500', icon: '🌌', description: 'Điện từ, quang học và bài toán tổng hợp' },
    { id: 10, name: 'Lớp 10', color: 'from-orange-500 to-rose-500', icon: '🚀', description: 'Động học và nhiệt động trong bối cảnh thực tế' },
    { id: 11, name: 'Lớp 11', color: 'from-rose-500 to-red-500', icon: '⚡', description: 'Điện trường, từ trường và cảm ứng điện từ' },
    { id: 12, name: 'Lớp 12', color: 'from-fuchsia-500 to-pink-500', icon: '⚛️', description: 'Dao động, sóng và vật lý hiện đại' },
  ];

  const getGamesForGrade = (gradeId) => {
    const gamesFromPhysicsGames = physicsGames.filter((game) => game.grade === gradeId);

    switch (gradeId) {
      case 6:
        return [...gamesFromPhysicsGames, ...grade6Games];
      case 7:
        return [...gamesFromPhysicsGames, ...grade7Games];
      case 8:
        return [...gamesFromPhysicsGames, ...grade8Games];
      case 9:
        return [...gamesFromPhysicsGames, ...grade9Games];
      case 10:
        return [...gamesFromPhysicsGames, ...grade10Games];
      case 11:
        return [...gamesFromPhysicsGames, ...grade11Games];
      case 12:
        return [...gamesFromPhysicsGames, ...grade12Games];
      default:
        return gamesFromPhysicsGames;
    }
  };

  const getRoadStatus = (gradeId) => {
    const games = getGamesForGrade(gradeId);
    const hasGames = games.length > 0;

    if (gradeId === 6) {
      return hasGames ? 'active' : 'coming';
    }

    const previousGames = getGamesForGrade(gradeId - 1);
    if (previousGames.length === 0) {
      return 'locked';
    }

    return hasGames ? 'active' : 'coming';
  };

  const totalGames = roadmap.reduce((sum, grade) => sum + getGamesForGrade(grade.id).length, 0);
  const playableGrades = roadmap.filter((grade) => getGamesForGrade(grade.id).length > 0).length;

  const handleGradeClick = (gradeId) => {
    const status = getRoadStatus(gradeId);
    if (status === 'locked') {
      return;
    }

    navigate(`/physics-games/grade/${gradeId}`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0f172a,_#111827_40%,_#1e1b4b_100%)] text-white">
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-cyan-600/80 via-blue-600/80 to-fuchsia-600/80 backdrop-blur">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/program/physics/dashboard')}
            className="flex items-center text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
                Roadmap Thử Thách Vật Lý
              </h1>
              <p className="text-lg text-white/90 max-w-2xl">
                Theo lộ trình từ lớp 6 đến 12 để luyện đều từng mảng kiến thức. Mỗi chặng có bộ game theo chủ đề và mức độ tăng dần.
              </p>
            </div>
            <div className="hidden md:block text-7xl opacity-90">
              🛣️
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <BookOpen className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{roadmap.length}</p>
              <p className="text-sm text-white/80">Mốc lớp</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <Gamepad2 className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalGames}</p>
              <p className="text-sm text-white/80">Game theo lộ trình</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{playableGrades}</p>
              <p className="text-sm text-white/80">Chặng đã mở</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">
            Tuyến đường học tập
          </h2>
          <p className="text-cyan-100/90">
            Chọn một mốc để vào danh sách game của lớp tương ứng. Bạn có thể học tuần tự hoặc quay lại ôn tập bất kỳ lúc nào.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 hidden h-full w-1 -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-300/40 via-blue-300/30 to-fuchsia-300/40 md:block" />

          <div className="space-y-8">
            {roadmap.map((grade, index) => {
            const games = getGamesForGrade(grade.id);
            const gameCount = games.length;
            const status = getRoadStatus(grade.id);
            const isLocked = status === 'locked';
            const isComingSoon = status === 'coming';
            const alignRight = index % 2 === 1;

            return (
              <div
                key={grade.id}
                className={`relative flex md:items-stretch ${alignRight ? 'md:justify-end' : 'md:justify-start'}`}
              >
                <div className="absolute left-1/2 top-10 z-20 hidden h-4 w-4 -translate-x-1/2 rounded-full border-4 border-slate-900 bg-cyan-300 md:block" />

                <button
                  onClick={() => handleGradeClick(grade.id)}
                  disabled={isLocked}
                  className={`group relative w-full md:w-[46%] overflow-hidden rounded-3xl border text-left transition-all duration-300 ${
                    isLocked
                      ? 'cursor-not-allowed border-white/10 bg-white/5 opacity-70'
                      : 'border-white/20 bg-white/10 hover:-translate-y-1 hover:border-cyan-300/50 hover:bg-white/15'
                  }`}
                >
                  <div className={`absolute -right-6 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${grade.color} opacity-30 blur-sm`} />

                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-4xl leading-none">{grade.icon}</p>
                        <h3 className="mt-3 text-2xl font-bold text-white">{grade.name}</h3>
                      </div>

                      {isLocked && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
                          <Lock className="h-3.5 w-3.5" />
                          Khóa
                        </span>
                      )}

                      {!isLocked && isComingSoon && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-300/20 px-3 py-1 text-xs font-semibold text-amber-100">
                          <Flag className="h-3.5 w-3.5" />
                          Sắp mở
                        </span>
                      )}

                      {!isLocked && !isComingSoon && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/40 bg-emerald-300/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Sẵn sàng
                        </span>
                      )}
                    </div>

                    <p className="mb-5 text-sm leading-6 text-slate-200">{grade.description}</p>

                    <div className="mb-4 flex items-center justify-between text-sm">
                      <span className="text-slate-300">Số game trong chặng</span>
                      <span className="font-semibold text-white">{gameCount}</span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${grade.color}`}
                        style={{ width: gameCount > 0 ? '100%' : '28%' }}
                      />
                    </div>

                    <div className="mt-5">
                      <span className={`inline-flex rounded-xl px-4 py-2 text-sm font-semibold ${
                        isLocked
                          ? 'bg-slate-700/70 text-slate-200'
                          : `bg-gradient-to-r ${grade.color} text-white`
                      }`}>
                        {isLocked ? 'Cần mở khóa chặng trước' : 'Vào chặng này'}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PhysicsGradeSelector;

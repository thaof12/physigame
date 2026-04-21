import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trophy, Clock, Star, Gamepad2, Lock, CheckCircle, PlayCircle } from 'lucide-react';
import { physicsGames } from '../data/physicsGames';
import { grade6Games } from '../data/grade6Games';
import { grade7Games } from '../data/grade7Games';
import { grade8Games } from '../data/grade8Games';
import { grade9Games } from '../data/grade9Games';
import { grade10Games } from '../data/grade10Games';
import { grade11Games } from '../data/grade11Games';
import { grade12Games } from '../data/grade12Games';
import { useGameProgress } from '../../../contexts/GameProgressContext';
import './PhysicsGradeGames.css';

const PhysicsGradeGames = () => {
  const navigate = useNavigate();
  const { gradeId } = useParams();
  const gradeNumber = parseInt(gradeId);

  const {
    progressByGrade,
    gameResults,
    loadGradeProgress,
    completeGame,
    isGameCompleted,
    isGameUnlocked,
    getCurrentGame
  } = useGameProgress();

  // Lấy danh sách game theo lớp
  const getGamesForGrade = () => {
    // Ưu tiên bộ game theo lớp/chương để đảm bảo lộ trình chuẩn
    if (gradeNumber === 6) {
      return grade6Games;
    }

    if (gradeNumber === 7) {
      return grade7Games;
    }

    if (gradeNumber === 8) {
      return grade8Games;
    }

    if (gradeNumber === 9) {
      return grade9Games;
    }

    if (gradeNumber === 10) {
      return grade10Games;
    }

    if (gradeNumber === 11) {
      return grade11Games;
    }

    if (gradeNumber === 12) {
      return grade12Games;
    }

    // Fallback cho dữ liệu cũ
    return physicsGames.filter(game => game.grade === gradeNumber);
  };

  const rawGames = getGamesForGrade();

  const games = useMemo(() => {
    const getOrderInChapter = (game) => {
      const idMatch = String(game.id || '').match(/-(\d+)$/);
      if (idMatch) {
        return Number(idMatch[1]);
      }

      const slugParts = String(game.slug || '').split('-');
      const lastPart = Number(slugParts[slugParts.length - 1]);
      if (!Number.isNaN(lastPart)) {
        return lastPart;
      }

      return 999;
    };

    return [...rawGames].sort((a, b) => {
      const chapterA = Number(a.chapter || 0);
      const chapterB = Number(b.chapter || 0);
      if (chapterA !== chapterB) {
        return chapterA - chapterB;
      }

      const orderA = getOrderInChapter(a);
      const orderB = getOrderInChapter(b);
      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return String(a.title || '').localeCompare(String(b.title || ''), 'vi');
    });
  }, [rawGames]);

  useEffect(() => {
    if (!Number.isNaN(gradeNumber)) {
      loadGradeProgress(gradeNumber);
    }
  }, [gradeNumber, loadGradeProgress]);

  // Thông tin lớp học
  const gradeInfo = {
    6: { name: 'Lớp 6', color: 'from-purple-400 to-purple-600', icon: '📚', description: 'Cơ học & Nhiệt học cơ bản' },
    7: { name: 'Lớp 7', color: 'from-blue-400 to-blue-600', icon: '🔬', description: 'Ánh sáng & Âm thanh' },
    8: { name: 'Lớp 8', color: 'from-green-400 to-green-600', icon: '⚡', description: 'Cơ học & Nhiệt học' },
    9: { name: 'Lớp 9', color: 'from-yellow-400 to-yellow-600', icon: '🔋', description: 'Điện học & Quang học' },
    10: { name: 'Lớp 10', color: 'from-orange-400 to-orange-600', icon: '🎯', description: 'Động học & Nhiệt động' },
    11: { name: 'Lớp 11', color: 'from-red-400 to-red-600', icon: '🔥', description: 'Dao động & Sóng điện từ' },
    12: { name: 'Lớp 12', color: 'from-pink-400 to-pink-600', icon: '⚛️', description: 'Vật lý hiện đại' },
  };

  const currentGrade = gradeInfo[gradeNumber];

  const gradeProgress = progressByGrade[gradeNumber] || { completed: [] };
  const completedCount = (gradeProgress.completed || []).length;
  const progressPercent = games.length > 0 ? Math.round((completedCount / games.length) * 100) : 0;
  const currentGameId = getCurrentGame(gradeNumber, games);

  const chapterGroups = useMemo(() => {
    const chapterMap = games.reduce((acc, game) => {
      const chapter = Number(game.chapter || 0);
      if (!acc[chapter]) {
        acc[chapter] = [];
      }
      acc[chapter].push(game);
      return acc;
    }, {});

    return Object.keys(chapterMap)
      .map(Number)
      .sort((a, b) => a - b)
      .map(chapter => ({
        chapter,
        games: chapterMap[chapter]
      }));
  }, [games]);

  const isChapterUnlocked = (chapterNumber) => {
    const chapterIndex = chapterGroups.findIndex(group => group.chapter === chapterNumber);
    if (chapterIndex <= 0) {
      return true;
    }

    const previousChapterGames = chapterGroups[chapterIndex - 1]?.games || [];
    return previousChapterGames.every(game => isGameCompleted(game.id, gradeNumber));
  };

  const isChapterCompleted = (chapterNumber) => {
    const chapterData = chapterGroups.find(group => group.chapter === chapterNumber);
    if (!chapterData) {
      return false;
    }

    return chapterData.games.every(game => isGameCompleted(game.id, gradeNumber));
  };

  const handleGameClick = (game) => {
    const locked = !isGameUnlocked(game.id, gradeNumber, games);
    if (locked) {
      return;
    }
    navigate(game.path || `/advanced-physics-challenge/${game.slug}`);
  };

  const handleCompleteGame = async (e, game) => {
    e.stopPropagation();

    await completeGame({
      gameId: game.id,
      grade: gradeNumber,
      chapter: game.chapter,
      score: 100,
      maxScore: 100,
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
      default:
        return 'Chưa xác định';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${currentGrade.color} text-white`}>
        <div className="container mx-auto px-4 pt-14 sm:pt-20 md:pt-24 pb-6 sm:pb-8">
          <button
            onClick={() => navigate('/physics-games/grades')}
            className="flex items-center text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại chọn lớp
          </button>

          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 sm:gap-4 mb-2">
                <span className="text-4xl sm:text-6xl">{currentGrade.icon}</span>
                <div>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold">
                    {currentGrade.name}
                  </h1>
                  <p className="text-sm sm:text-xl text-white/90 mt-1">
                    {currentGrade.description}
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:block text-8xl opacity-80">
              🎮
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 sm:mt-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <Gamepad2 className="w-5 h-5 sm:w-8 sm:h-8 mx-auto mb-1.5 sm:mb-2" />
              <p className="text-lg sm:text-2xl font-bold">{games.length}</p>
              <p className="text-[11px] sm:text-sm text-white/80">Game khả dụng</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <Trophy className="w-5 h-5 sm:w-8 sm:h-8 mx-auto mb-1.5 sm:mb-2" />
              <p className="text-lg sm:text-2xl font-bold">{completedCount}</p>
              <p className="text-[11px] sm:text-sm text-white/80">Hoàn thành</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <Star className="w-5 h-5 sm:w-8 sm:h-8 mx-auto mb-1.5 sm:mb-2" />
              <p className="text-lg sm:text-2xl font-bold">{progressPercent}%</p>
              <p className="text-[11px] sm:text-sm text-white/80">Tiến độ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Games Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12 pb-28 lg:pb-12">
        {games.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Đang phát triển
            </h3>
            <p className="text-gray-600 mb-6">
              Game cho {currentGrade.name} đang được phát triển
            </p>
            <button
              onClick={() => navigate('/physics-games/grades')}
              className={`px-6 py-3 bg-gradient-to-r ${currentGrade.color} text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-lg`}
            >
              Chọn lớp khác
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Roadmap {currentGrade.name}</h2>
                <p className="text-sm sm:text-base text-gray-600">Hoàn thành theo thứ tự từ trên xuống để mở khóa game tiếp theo.</p>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm text-gray-500">Tiến độ</p>
                <p className="text-2xl font-bold text-gray-800">{completedCount}/{games.length}</p>
              </div>
            </div>

            <div className="relative max-w-5xl mx-auto">
              <div className="roadmap-line absolute left-6 top-3 bottom-3 w-1 bg-gradient-to-b from-emerald-300 via-amber-300 to-rose-300 rounded-full" />

              <div className="space-y-8">
                {chapterGroups.map((chapterData, chapterIndex) => {
                  const chapterUnlocked = isChapterUnlocked(chapterData.chapter);
                  const chapterCompleted = isChapterCompleted(chapterData.chapter);

                  return (
                    <section
                      key={`chapter-${chapterData.chapter}`}
                      className="chapter-fade"
                      style={{ animationDelay: `${chapterIndex * 120}ms` }}
                    >
                      <div className="mb-4 flex items-center gap-3 pl-16">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Chương {chapterData.chapter}</h3>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            chapterCompleted
                              ? 'bg-emerald-100 text-emerald-700'
                              : chapterUnlocked
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {chapterCompleted ? 'Đã hoàn thành' : chapterUnlocked ? 'Đang mở' : 'Đã khóa'}
                        </span>
                      </div>

                      <div className="space-y-6">
                        {chapterData.games.map((game, gameIndex) => {
                          const side = gameIndex % 2 === 0 ? 'left' : 'right';
                          const globalIndex = games.findIndex(item => item.id === game.id);
                          const completed = isGameCompleted(game.id, gradeNumber);
                          const lockedBySequence = !isGameUnlocked(game.id, gradeNumber, games);
                          const locked = !chapterUnlocked || lockedBySequence;
                          const isCurrent = currentGameId === game.id;
                          const gameResult = gameResults?.[gradeNumber]?.[game.id];
                          const timeLabel = typeof game.estimatedTime === 'number' ? `${game.estimatedTime} phút` : game.estimatedTime;

                          return (
                            <div
                              key={game.id}
                              className={`roadmap-item roadmap-${side} relative pl-16 md:pl-0`}
                              style={{ animationDelay: `${(chapterIndex * 180) + (gameIndex * 90)}ms` }}
                            >
                              <div
                                className={`roadmap-node absolute left-0 top-1.5 h-12 w-12 rounded-full flex items-center justify-center border-4 z-10 ${
                                  completed
                                    ? 'bg-emerald-500 border-emerald-200 text-white'
                                    : locked
                                      ? 'bg-gray-300 border-gray-200 text-gray-600'
                                      : 'bg-amber-500 border-amber-200 text-white'
                                } ${isCurrent && !locked ? 'current-node' : ''}`}
                              >
                                {completed ? <CheckCircle className="w-6 h-6" /> : locked ? <Lock className="w-5 h-5" /> : <PlayCircle className="w-6 h-6" />}
                              </div>
                              <div className={`roadmap-connector connector-${side}`} />

                              <div
                                onClick={() => handleGameClick(game)}
                                className={`roadmap-card rounded-2xl border bg-white p-5 shadow-md transition-all ${
                                  locked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl hover:-translate-y-0.5'
                                } ${isCurrent ? 'ring-2 ring-amber-300 border-amber-300' : 'border-gray-100'}`}
                              >
                                <div className="flex items-start justify-between gap-3 sm:gap-4">
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                        Chương {game.chapter || 0} • Bước {globalIndex + 1}
                                      </span>
                                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getDifficultyColor(game.difficulty)}`}>
                                        {getDifficultyText(game.difficulty)}
                                      </span>
                                      {isCurrent && !completed && !locked && (
                                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                          Hiện tại
                                        </span>
                                      )}
                                    </div>

                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{game.title}</h3>
                                    <p className="text-gray-600 text-sm mb-3">{game.description}</p>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                      {(game.topics || []).slice(0, 3).map((topic, idx) => (
                                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                          {topic}
                                        </span>
                                      ))}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {timeLabel}
                                      </span>
                                      {gameResult?.score !== undefined && (
                                        <span className="font-medium text-gray-700">Điểm: {gameResult.score}/{gameResult.maxScore || 100}</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className={`h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-xl sm:text-2xl shrink-0`}>
                                    {game.icon}
                                  </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                                  <p className="text-sm text-gray-500">
                                    {!chapterUnlocked
                                      ? 'Hoàn thành toàn bộ chương trước để mở khóa chương này'
                                      : lockedBySequence
                                        ? 'Hoàn thành game trước để mở khóa'
                                        : completed
                                          ? 'Đã hoàn thành, có thể chơi lại'
                                          : 'Sẵn sàng bắt đầu'}
                                  </p>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {!locked && !completed && (
                                      <button
                                        type="button"
                                        onClick={(e) => handleCompleteGame(e, game)}
                                        className="px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                      >
                                        Hoàn thành
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      disabled={locked}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleGameClick(game);
                                      }}
                                      className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                                        locked
                                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                          : completed
                                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                      }`}
                                    >
                                      {locked ? 'Đã khóa' : completed ? 'Chơi lại' : 'Bắt đầu'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className={`mt-12 bg-gradient-to-r ${currentGrade.color} rounded-2xl p-8 text-white text-center`}>
              <h3 className="text-2xl font-bold mb-3">
                🛣️ Hoàn thành từng chặng để tiến tới đích!
              </h3>
              <p className="text-white/90 mb-6">
                Hệ thống đã chuyển sang lộ trình tuần tự theo chương và lớp.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                        <button
                  onClick={() => navigate('/physics-games/grades')}
                          className="w-full sm:w-auto px-6 py-3 bg-white text-gray-800 rounded-xl font-medium hover:bg-gray-100 transition-all shadow-lg"
                >
                  Chọn lớp khác
                </button>
                <button
                  onClick={() => navigate('/program/physics/dashboard')}
                          className="w-full sm:w-auto px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-all border-2 border-white/50"
                >
                  Về Dashboard
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PhysicsGradeGames;

import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trophy, Target, Clock, Star, Gamepad2 } from 'lucide-react';
import { physicsGames } from '../data/physicsGames';
import { grade6Games } from '../data/grade6Games';
import { grade7Games } from '../data/grade7Games';
import { grade8Games } from '../data/grade8Games';
import { grade9Games } from '../data/grade9Games';
import { grade10Games } from '../data/grade10Games';
import { grade11Games } from '../data/grade11Games';
import { grade12Games } from '../data/grade12Games';

const PhysicsGradeGames = () => {
  const navigate = useNavigate();
  const { gradeId } = useParams();
  const gradeNumber = parseInt(gradeId);

  // Lấy danh sách game theo lớp
  const getGamesForGrade = () => {
    // Lấy các game từ physicsGames cho lớp này
    const gamesFromPhysicsGames = physicsGames.filter(game => game.grade === gradeNumber);
    
    // Nếu là lớp 6, merge với grade6Games
    if (gradeNumber === 6) {
      return [...gamesFromPhysicsGames, ...grade6Games];
    }
    
    // Nếu là lớp 7, merge với grade7Games
    if (gradeNumber === 7) {
      return [...gamesFromPhysicsGames, ...grade7Games];
    }
    
    // Nếu là lớp 8, merge với grade8Games
    if (gradeNumber === 8) {
      return [...gamesFromPhysicsGames, ...grade8Games];
    }
    
    // Nếu là lớp 9, merge với grade9Games
    if (gradeNumber === 9) {
      return [...gamesFromPhysicsGames, ...grade9Games];
    }
    
    // Nếu là lớp 10, merge với grade10Games
    if (gradeNumber === 10) {
      return [...gamesFromPhysicsGames, ...grade10Games];
    }
    
    // Nếu là lớp 11, merge với grade11Games
    if (gradeNumber === 11) {
      return [...gamesFromPhysicsGames, ...grade11Games];
    }
    
    // Nếu là lớp 12, merge với grade12Games
    if (gradeNumber === 12) {
      return [...gamesFromPhysicsGames, ...grade12Games];
    }
    
    return gamesFromPhysicsGames;
  };

  const games = getGamesForGrade();

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

  const handleGameClick = (game) => {
    navigate(game.path || `/advanced-physics-challenge/${game.slug}`);
  };

  const formatEstimatedTime = (estimatedTime) => {
    return typeof estimatedTime === 'number' ? `${estimatedTime} phút` : estimatedTime;
  };

  const getLearningHint = (game) => {
    const topTopic = game.topics?.[0] || 'kiến thức trọng tâm';

    switch (game.difficulty) {
      case 'easy':
        return `Bắt đầu nhẹ nhàng với ${topTopic.toLowerCase()}, ưu tiên làm đúng bước cơ bản.`;
      case 'medium':
        return `Luyện chắc ${topTopic.toLowerCase()} qua tình huống có dữ kiện gần thực tế.`;
      case 'hard':
        return `Thử thách nâng cao về ${topTopic.toLowerCase()}, cần phân tích dữ kiện trước khi tính.`;
      default:
        return `Ôn lại ${topTopic.toLowerCase()} theo lộ trình từng bước.`;
    }
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

  // Nhóm game theo chương (nếu có)
  const gamesByChapter = games.reduce((acc, game) => {
    const chapter = game.chapter || 0;
    if (!acc[chapter]) {
      acc[chapter] = [];
    }
    acc[chapter].push(game);
    return acc;
  }, {});

  const chapters = Object.keys(gamesByChapter).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${currentGrade.color} text-white`}>
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/physics-games/grades')}
            className="flex items-center text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại chọn lớp
          </button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-6xl">{currentGrade.icon}</span>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold">
                    {currentGrade.name}
                  </h1>
                  <p className="text-xl text-white/90 mt-1">
                    {currentGrade.description}
                  </p>
                  <p className="text-sm md:text-base text-white/85 mt-3 max-w-2xl">
                    Gợi ý học nhanh: chọn game theo thứ tự chương để nắm nền trước, sau đó quay lại các game khó để tăng tốc độ giải bài.
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:block text-8xl opacity-80">
              🎮
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <Gamepad2 className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{games.length}</p>
              <p className="text-sm text-white/80">Game khả dụng</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-white/80">Hoàn thành</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-white/80">Sao đạt được</p>
            </div>
          </div>
        </div>
      </div>

      {/* Games Content */}
      <div className="container mx-auto px-4 py-12">
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
            {chapters.map(chapterKey => {
              const chapterGames = gamesByChapter[chapterKey];
              const chapterNumber = parseInt(chapterKey);
              
              return (
                <div key={chapterKey} className="mb-12">
                  {chapterNumber > 0 && (
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Chương {chapterNumber}
                      </h2>
                      <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {chapterGames.map((game, index) => (
                      <div
                        key={game.id}
                        onClick={() => handleGameClick(game)}
                        className="group bg-white rounded-2xl shadow-lg ring-1 ring-black/5 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Card Header with Gradient */}
                        <div className={`bg-gradient-to-br ${game.color} p-6 relative overflow-hidden`}>
                          <div className="absolute top-0 right-0 text-8xl opacity-10 transform rotate-12">
                            {game.icon}
                          </div>
                          <div className="relative z-10">
                            <div className="text-5xl mb-3">{game.icon}</div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(game.difficulty)}`}>
                              {getDifficultyText(game.difficulty)}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                            {game.title}
                          </h3>

                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {game.description}
                          </p>

                          <p className="text-xs text-slate-500 mb-4 italic leading-5">
                            {getLearningHint(game)}
                          </p>

                          {/* Topics */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {game.topics.slice(0, 3).map((topic, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>

                          {/* Meta Info */}
                          <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatEstimatedTime(game.estimatedTime)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              <span className="font-medium">{getDifficultyText(game.difficulty)}</span>
                            </div>
                          </div>

                          {/* Play Button */}
                          <button className={`w-full mt-4 bg-gradient-to-r ${game.color} hover:opacity-90 text-white py-3 rounded-xl font-medium transition-all transform group-hover:scale-105 shadow-md hover:shadow-lg`}>
                            Vào phòng thí nghiệm →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Bottom CTA */}
            <div className={`mt-12 bg-gradient-to-r ${currentGrade.color} rounded-2xl p-8 text-white text-center`}>
              <h3 className="text-2xl font-bold mb-3">
                🎯 Hoàn thành theo chương để học chắc hơn
              </h3>
              <p className="text-white/90 mb-6">
                Mỗi game đều gắn với một ý trọng tâm trong bài học. Học theo nhịp ổn định sẽ giúp bạn làm bài tập nhanh và ít sai hơn.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={() => navigate('/physics-games/grades')}
                  className="px-6 py-3 bg-white text-gray-800 rounded-xl font-medium hover:bg-gray-100 transition-all shadow-lg"
                >
                  Chọn lớp khác
                </button>
                <button
                  onClick={() => navigate('/program/physics/dashboard')}
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-all border-2 border-white/50"
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

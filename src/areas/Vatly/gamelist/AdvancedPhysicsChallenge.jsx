import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Target, Clock, Star } from 'lucide-react';
import { physicsGames } from '../data/physicsGames';

const AdvancedPhysicsChallenge = () => {
  const navigate = useNavigate();

  const handleGameClick = (game) => {
    navigate(`/advanced-physics-challenge/${game.slug}`);
  };

  const formatEstimatedTime = (estimatedTime) => {
    return typeof estimatedTime === 'number' ? `${estimatedTime} phút` : estimatedTime;
  };

  const getMentorLine = (game) => {
    const topTopic = game.topics?.[0] || 'chủ đề chính';
    return `Mục tiêu: nắm chắc ${topTopic.toLowerCase()} qua tình huống mô phỏng gần thực tế.`;
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
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
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
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                🏆 Thử thách Vật lý
              </h1>
              <p className="text-xl text-white/90">
                Hệ game thực hành giúp bạn học nhanh, hiểu sâu và nhớ lâu
              </p>
              <p className="text-sm md:text-base text-white/85 mt-3 max-w-2xl">
                Mẹo học: ưu tiên game mức Dễ - Trung bình để chốt nền, rồi quay lại game Khó để luyện tư duy giải bài nâng cao.
              </p>
            </div>
            <div className="hidden md:block text-8xl opacity-80">
              ⚛️
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{physicsGames.length}</p>
              <p className="text-sm text-white/80">Thử thách</p>
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

      {/* Games Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Danh sách thử thách
          </h2>
          <p className="text-gray-600">
            Chọn một thử thách phù hợp với thời gian và mục tiêu ôn tập của bạn.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {physicsGames.map((game, index) => (
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

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {game.description}
                </p>

                <p className="text-xs text-slate-500 mb-4 italic leading-5">
                  {getMentorLine(game)}
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
                    <span className="font-medium">Lớp {game.grade}</span>
                  </div>
                </div>

                {/* Play Button */}
                <button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-3 rounded-xl font-medium transition-all transform group-hover:scale-105 shadow-md hover:shadow-lg">
                  Bắt đầu bài luyện →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">
            🎯 Học như luyện đề, nhưng trực quan hơn
          </h3>
          <p className="text-white/90 mb-6">
            Mỗi game là một tình huống học tập nhỏ. Hoàn thành đều đặn sẽ giúp bạn xử lý bài tập nhanh hơn trên lớp.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/program/physics')}
              className="px-6 py-3 bg-white text-orange-600 rounded-xl font-medium hover:bg-gray-100 transition-all shadow-lg"
            >
              Về trang chủ Vật lý
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedPhysicsChallenge;

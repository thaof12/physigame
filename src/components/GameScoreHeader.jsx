import { Trophy, Star, Target, Zap } from 'lucide-react';
import { useGameScore } from '../contexts/GameScoreContext';

const GameScoreHeader = ({ gameTitle, gameSlug, onClose }) => {
  const { getGameScore, currentGameScore } = useGameScore();
  const currentGame = getGameScore(gameSlug);

  return (
    <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Game Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-xl font-bold">{gameTitle}</h2>
              <p className="text-sm text-white/80">Thử thách Vật lý</p>
            </div>
          </div>

          {/* Score Stats */}
          <div className="flex items-center gap-6">
            {/* Current Score */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-semibold text-white/80">Điểm hiện tại</span>
              </div>
              <p className="text-2xl font-bold">{currentGameScore}</p>
            </div>

            {/* Best Score */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-semibold text-white/80">Điểm cao nhất</span>
              </div>
              <p className="text-2xl font-bold">{currentGame.bestScore}</p>
            </div>

            {/* Attempts */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs font-semibold text-white/80">Lần chơi</span>
              </div>
              <p className="text-2xl font-bold">{currentGame.attempts}</p>
            </div>

            {/* Stars */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4" />
                <span className="text-xs font-semibold text-white/80">Sao</span>
              </div>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor((currentGame.bestScore / 100) * 3)
                        ? 'fill-yellow-300 text-yellow-300'
                        : 'text-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-black/20 h-1">
        <div
          className="bg-yellow-300 h-full transition-all duration-300"
          style={{ width: `${Math.min((currentGameScore / 100) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default GameScoreHeader;

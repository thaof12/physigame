import { useNavigate } from 'react-router-dom';
import { useGameScore } from '../contexts/GameScoreContext';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Star, Target, Clock, ArrowRight } from 'lucide-react';

const GameScoreModal = ({ gameSlug, gameTitle, finalScore, onContinue, onRetry }) => {
  const navigate = useNavigate();
  const { submitScore } = useGameScore();
  const { user } = useAuth();

  const calculateStars = (score) => {
    if (score >= 100) return 3;
    if (score >= 70) return 2;
    if (score >= 50) return 1;
    return 0;
  };

  const stars = calculateStars(finalScore);

  const handleSubmit = async () => {
    try {
      const userId = user?.firebaseUid || user?.uid;
      await submitScore(gameSlug, finalScore, userId);
      onContinue?.();
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-bounce-in">
        {/* Header */}
        <div className="mb-6">
          <div className="text-6xl mb-4">
            {stars >= 3 ? '🏆' : stars >= 2 ? '⭐' : '✨'}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {stars === 3 ? 'Xuất sắc!' : stars === 2 ? 'Tốt lắm!' : 'Chúc mừng!'}
          </h2>
          <p className="text-gray-600">
            {gameTitle}
          </p>
        </div>

        {/* Score Display */}
        <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl p-6 mb-6">
          <p className="text-gray-600 text-sm mb-2">Điểm của bạn</p>
          <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
            {finalScore}
          </div>
          <p className="text-gray-600 text-sm mt-2">điểm</p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-3 mb-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                i < stars
                  ? 'bg-yellow-200 scale-110'
                  : 'bg-gray-200'
              }`}
            >
              <Star
                className={`w-6 h-6 ${
                  i < stars
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-400'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-100 rounded-lg p-3">
            <Trophy className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Điểm cao nhất</p>
            <p className="text-lg font-bold text-gray-800">{finalScore}</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-3">
            <Target className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Lần chơi</p>
            <p className="text-lg font-bold text-gray-800">1</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-colors"
          >
            Chơi lại
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            Tiếp tục
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer */}
        <button
          onClick={() => navigate('/advanced-physics-challenge')}
          className="mt-4 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Quay lại thử thách
        </button>
      </div>
    </div>
  );
};

export default GameScoreModal;

import { useState, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useGameScore } from '../../../contexts/GameScoreContext';
import GameScoreHeader from '../../../components/GameScoreHeader';
import GameScoreModal from '../../../components/GameScoreModal';

/**
 * Game cân bằng lực - Ví dụ game đơn giản có scoring
 * Người chơi phải cân bằng đĩa bằng cách đặt trọng lượng ở vị trí đúng
 */
const BalanceChallengeExample = () => {
  const { user } = useAuth();
  const { submitScore, getGameScore } = useGameScore();
  
  // Game state
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [leftWeight, setLeftWeight] = useState(0);
  const [rightWeight, setRightWeight] = useState(0);
  const [targetWeight] = useState(50);
  const [isBalanced, setIsBalanced] = useState(false);

  // Check if balanced
  const checkBalance = useCallback((left, right) => {
    const balanced = Math.abs(left - right) <= 5;
    setIsBalanced(balanced);
    
    if (balanced) {
      const baseScore = 100;
      const attemptPenalty = Math.max(0, (attempts - 1) * 10);
      const finalScore = Math.max(0, baseScore - attemptPenalty);
      setScore(finalScore);
    }
  }, [attempts]);

  const handleAddLeft = () => {
    const newLeft = leftWeight + 10;
    setLeftWeight(newLeft);
    checkBalance(newLeft, rightWeight);
    setAttempts(attempts + 1);
  };

  const handleAddRight = () => {
    const newRight = rightWeight + 10;
    setRightWeight(newRight);
    checkBalance(leftWeight, newRight);
    setAttempts(attempts + 1);
  };

  const handleReset = () => {
    setLeftWeight(0);
    setRightWeight(0);
    setIsBalanced(false);
    setScore(0);
    setAttempts(0);
  };

  const handleComplete = async () => {
    if (user && isBalanced) {
      const currentGame = getGameScore('balance');
      const bestScore = Math.max(score, currentGame?.bestScore || 0);
      
      await submitScore('balance', score, user.uid);
      setGameEnded(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <GameScoreHeader
        gameTitle="Cân Bằng Lực"
        gameSlug="balance"
        onClose={() => window.history.back()}
      />

      <div className="max-w-2xl mx-auto mt-12 bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">
          Trò Chơi Cân Bằng Lực
        </h2>

        {/* Game Area */}
        <div className="bg-blue-50 rounded-lg p-8 mb-6">
          <div className="flex justify-between items-center mb-8">
            {/* Left Side */}
            <div className="flex flex-col items-center gap-4">
              <div className="text-2xl font-bold text-blue-600">{leftWeight} kg</div>
              <div className="w-24 h-24 bg-blue-300 rounded-lg flex items-center justify-center text-white font-bold">
                ⬜
              </div>
              <button
                onClick={handleAddLeft}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                + 10kg
              </button>
            </div>

            {/* Balance Indicator */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl font-bold text-purple-600">
                {isBalanced ? '✓ Cân Bằng!' : '⚖️ Chưa'}
              </div>
              <div className="w-2 h-32 bg-gray-300 rounded-full relative">
                <div
                  className={`absolute top-0 left-1/2 w-1 h-full transition-transform ${
                    isBalanced ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex flex-col items-center gap-4">
              <div className="text-2xl font-bold text-blue-600">{rightWeight} kg</div>
              <div className="w-24 h-24 bg-orange-300 rounded-lg flex items-center justify-center text-white font-bold">
                ⬜
              </div>
              <button
                onClick={handleAddRight}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                + 10kg
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-sm font-semibold text-purple-600">Điểm Hiện Tại</div>
            <div className="text-3xl font-bold text-purple-700">{score}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-sm font-semibold text-green-600">Lần Thử</div>
            <div className="text-3xl font-bold text-green-700">{attempts}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
          >
            Đặt Lại
          </button>
          <button
            onClick={handleComplete}
            disabled={!isBalanced}
            className={`flex-1 px-4 py-3 rounded-lg transition font-semibold text-white ${
              isBalanced
                ? 'bg-green-500 hover:bg-green-600 cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isBalanced ? '✓ Hoàn Thành' : 'Cân bằng để hoàn thành'}
          </button>
        </div>
      </div>

      {/* Score Modal */}
      {gameEnded && (
        <GameScoreModal
          gameSlug="balance"
          gameTitle="Cân Bằng Lực"
          finalScore={score}
          onContinue={() => window.history.back()}
          onRetry={() => {
            setGameEnded(false);
            handleReset();
          }}
        />
      )}
    </div>
  );
};

export default BalanceChallengeExample;

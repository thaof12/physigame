import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameScore } from '../contexts/GameScoreContext';
import { useAuth } from '../contexts/AuthContext';
import GameScoreHeader from '../components/GameScoreHeader';
import GameScoreModal from '../components/GameScoreModal';

/**
 * Wrapper cho game vật lý có hỗ trợ scoring
 * Cách sử dụng:
 * <PhysicsGameTemplate
 *   gameSlug="balance"
 *   gameTitle="Trò chơi cân bằng"
 *   GameComponent={BalanceChallenge}
 *   onScoreChange={(score) => { ... }}
 * />
 */
export const PhysicsGameTemplate = ({
  gameSlug,
  gameTitle,
  GameComponent,
  onScoreChange
}) => {
  const navigate = useNavigate();
  const { setCurrentScore, submitScore } = useGameScore();
  const { user } = useAuth();
  const [score, setScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Cập nhật điểm khi thay đổi
  useEffect(() => {
    setCurrentScore(score);
    onScoreChange?.(score);
  }, [score, setCurrentScore, onScoreChange]);

  // Bắt buộc game component phải có prop updateScore
  const handleGameComplete = (finalGameScore) => {
    setFinalScore(finalGameScore);
    setShowScoreModal(true);
  };

  const handleRetry = () => {
    setShowScoreModal(false);
    setScore(0);
    // Game component sẽ reset lại game
  };

  const handleContinue = () => {
    setShowScoreModal(false);
    navigate('/advanced-physics-challenge');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <GameScoreHeader
        gameTitle={gameTitle}
        gameSlug={gameSlug}
        onClose={() => navigate('/advanced-physics-challenge')}
      />

      <div className="pt-4">
        <GameComponent
          onScoreUpdate={setScore}
          onGameComplete={handleGameComplete}
          gameSlug={gameSlug}
        />
      </div>

      {showScoreModal && (
        <GameScoreModal
          gameSlug={gameSlug}
          gameTitle={gameTitle}
          finalScore={finalScore}
          onContinue={handleContinue}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
};

export default PhysicsGameTemplate;

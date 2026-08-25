import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Clock, Gamepad2, Trophy, AlertTriangle, Loader2 } from 'lucide-react';
import './PKBattle.css';

// Lazy load challenge games
const challengeComponents = {
  'BalanceChallenge': lazy(() => import('../../areas/Vatly/challenges/BalanceChallenge/BalanceChallenge'))
};


// Loading component for lazy loaded games
const GameLoader = () => (
  <div className="pk-game-loader">
    <Loader2 className="pk-loader-icon" size={48} />
    <p>Đang tải game...</p>
  </div>
);

// Error boundary for game loading failures
class GameErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Game loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="pk-game-error">
          <AlertTriangle size={48} color="#ef4444" />
          <h3>Không thể tải game</h3>
          <p>Đã xảy ra lỗi khi tải game. Vui lòng thử lại.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="pk-retry-btn"
          >
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const PKChallengeRound = ({ 
  gameData,
  timeLimit = 60,
  onComplete,
  opponentProgress,
  myInfo,
  opponentInfo
}) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameScore, setGameScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  
  const GameComponent = challengeComponents[gameData?.gameComponent];

  // Timer countdown
  useEffect(() => {
    if (isCompleted) return;
    
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Time's up
      handleGameEnd();
    }
  }, [timeLeft, isCompleted]);

  // Handle when user completes the game
  const handleGameComplete = useCallback((result) => {
    if (isCompleted) return;
    
    const responseTime = (Date.now() - startTime) / 1000;
    let score = 0;
    
    if (result.completed || result.success) {
      // Base points from game
      score = result.score || result.points || 100;
      
      // Time bonus: More points for faster completion
      const timeBonus = Math.floor((timeLeft / timeLimit) * 50);
      score += timeBonus;
      
      // Difficulty multiplier
      const difficultyMultiplier = {
        easy: 1,
        medium: 1.5,
        hard: 2,
        expert: 2.5
      }[gameData?.difficulty || 'medium'];
      
      score = Math.floor(score * difficultyMultiplier);
    }
    
    setGameScore(score);
    setIsCompleted(true);
    
    onComplete?.({
      gameId: gameData?.gameId,
      score,
      completed: result.completed || result.success || false,
      responseTime,
      accuracy: result.accuracy || 100
    });
  }, [gameData, timeLeft, timeLimit, startTime, isCompleted, onComplete]);

  // Handle timeout
  const handleGameEnd = useCallback(() => {
    if (!isCompleted) {
      handleGameComplete({ completed: false, score: 0 });
    }
  }, [isCompleted, handleGameComplete]);

  // Calculate time progress for display
  const timeProgress = (timeLeft / timeLimit) * 100;
  const isUrgent = timeLeft <= 10;

  if (!GameComponent) {
    return (
      <div className="pk-challenge-error">
        <AlertTriangle size={48} color="#f59e0b" />
        <h3>Game không khả dụng</h3>
        <p>Game "{gameData?.gameName}" chưa được hỗ trợ trong chế độ PK.</p>
        <button 
          onClick={() => handleGameComplete({ completed: false, score: 0 })}
          className="pk-skip-btn"
        >
          Bỏ qua lượt này
        </button>
      </div>
    );
  }

  return (
    <div className="pk-challenge-round">
      {/* Header with timer and info */}
      <div className="pk-challenge-header">
        <div className="pk-player-mini pk-player-left">
          <img src={myInfo?.avatar} alt="" className="pk-avatar-mini" />
          <div className="pk-player-info-mini">
            <span className="pk-player-name-mini">{myInfo?.displayName}</span>
            <span className="pk-player-score-mini">{myInfo?.score || 0} điểm</span>
          </div>
        </div>

        <div className="pk-challenge-timer-container">
          <div className={`pk-challenge-timer ${isUrgent ? 'urgent' : ''}`}>
            <Clock size={20} />
            <span>{timeLeft}s</span>
          </div>
          <div className="pk-timer-bar">
            <div 
              className={`pk-timer-progress ${isUrgent ? 'urgent' : ''}`}
              style={{ width: `${timeProgress}%` }}
            />
          </div>
          <div className="pk-game-title">
            <Gamepad2 size={16} />
            {gameData?.gameName}
          </div>
        </div>

        <div className="pk-player-mini pk-player-right">
          <div className="pk-player-info-mini">
            <span className="pk-player-name-mini">{opponentInfo?.displayName}</span>
            <span className="pk-player-score-mini">{opponentInfo?.score || 0} điểm</span>
          </div>
          <img src={opponentInfo?.avatar} alt="" className="pk-avatar-mini" />
          {opponentProgress?.playing && (
            <div className="pk-opponent-status">
              <span className="pk-status-dot active"></span>
              Đang chơi...
            </div>
          )}
        </div>
      </div>

      {/* Game container */}
      <div className="pk-game-container">
        {!isCompleted ? (
          <GameErrorBoundary>
            <Suspense fallback={<GameLoader />}>
              <GameComponent
                isPKMode={true}
                pkTimeLimit={timeLeft}
                onComplete={handleGameComplete}
                onScoreUpdate={(score) => setGameScore(score)}
                difficulty={gameData?.difficulty || 'medium'}
              />
            </Suspense>
          </GameErrorBoundary>
        ) : (
          <div className="pk-challenge-completed">
            <Trophy size={64} color="#fbbf24" />
            <h2>Hoàn thành!</h2>
            <div className="pk-score-display">
              <span className="pk-score-label">Điểm của bạn</span>
              <span className="pk-score-value">{gameScore}</span>
            </div>
            <p className="pk-waiting-opponent">
              {opponentProgress?.completed 
                ? 'Đối thủ đã hoàn thành!' 
                : 'Đang chờ đối thủ...'
              }
            </p>
          </div>
        )}
      </div>

      {/* Current round score */}
      {!isCompleted && gameScore > 0 && (
        <div className="pk-live-score">
          <span>Điểm hiện tại: </span>
          <span className="pk-score-number">{gameScore}</span>
        </div>
      )}
    </div>
  );
};

export default PKChallengeRound;

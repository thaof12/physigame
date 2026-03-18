import React, { createContext, useContext, useState, useCallback } from 'react';

const GameScoreContext = createContext();

export const GameScoreProvider = ({ children }) => {
  const [gameScores, setGameScores] = useState({});
  const [currentGameScore, setCurrentGameScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy điểm của một game
  const getGameScore = useCallback((gameSlug) => {
    return gameScores[gameSlug] || { score: 0, bestScore: 0, attempts: 0 };
  }, [gameScores]);

  // Cập nhật điểm hiện tại
  const setCurrentScore = useCallback((score) => {
    setCurrentGameScore(score);
  }, []);

  // Submit điểm cho game
  const submitScore = useCallback(async (gameSlug, score, userId) => {
    try {
      setIsSubmitting(true);
      
      // Lưu vào state địa phương
      const currentScore = gameScores[gameSlug] || { score: 0, bestScore: 0, attempts: 0 };
      const newScore = {
        score: score,
        bestScore: Math.max(currentScore.bestScore, score),
        attempts: currentScore.attempts + 1,
        lastAttempt: new Date().toISOString()
      };

      setGameScores(prev => ({
        ...prev,
        [gameSlug]: newScore
      }));

      // Gọi API để lưu vào database
      try {
        const response = await fetch('/api/game-scores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            gameSlug,
            score: score,
            bestScore: newScore.bestScore,
            attempts: newScore.attempts,
            timestamp: newScore.lastAttempt
          })
        });

        if (!response.ok) {
          console.error('Failed to save score to database');
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        // Vẫn lưu điểm địa phương ngay cả khi API fails
      }

      return newScore;
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [gameScores]);

  // Lấy tổng điểm tất cả game
  const getTotalScore = useCallback(() => {
    return Object.values(gameScores).reduce((total, game) => total + (game.bestScore || 0), 0);
  }, [gameScores]);

  // Lấy số game hoàn thành
  const getCompletedGames = useCallback(() => {
    return Object.keys(gameScores).filter(key => gameScores[key].bestScore > 0).length;
  }, [gameScores]);

  // Reset score
  const resetGameScore = useCallback((gameSlug) => {
    setGameScores(prev => {
      const newScores = { ...prev };
      delete newScores[gameSlug];
      return newScores;
    });
  }, []);

  const value = {
    gameScores,
    currentGameScore,
    setCurrentScore,
    submitScore,
    getGameScore,
    getTotalScore,
    getCompletedGames,
    resetGameScore,
    isSubmitting
  };

  return (
    <GameScoreContext.Provider value={value}>
      {children}
    </GameScoreContext.Provider>
  );
};

export const useGameScore = () => {
  const context = useContext(GameScoreContext);
  if (!context) {
    throw new Error('useGameScore must be used within GameScoreProvider');
  }
  return context;
};

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, RotateCcw, Trophy, Star, Coins, TrendingUp, Award } from 'lucide-react';
import Confetti from 'react-confetti';
import { useAuth } from '../../contexts/AuthContext';
import './PKBattle.css';

const PKResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [saved, setSaved] = useState(false);
  
  const {
    playerName = 'Bạn',
    avatarUrl,
    myScore = 0,
    opponentScore = 0,
    opponent = { displayName: 'Đối thủ', avatar: '' },
    winner = 'me', // 'me', 'opponent', 'draw'
    myAnswers = [],
    rewards = { xp: 50, coins: 25 },
    roomId = ''
  } = location.state || {};

  const isVictory = winner === 'me';
  const isDraw = winner === 'draw';

  // Save battle result to database
  useEffect(() => {
    const saveBattleResult = async () => {
      if (saved || !user?.uid) return;
      
      try {
        const response = await fetch('/api/battles/save-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId,
            firebaseUid: user.uid,
            playerName,
            myScore,
            opponentScore,
            opponentName: opponent?.displayName,
            opponentFirebaseUid: opponent?.firebaseUid,
            winner,
            correctAnswers: myAnswers.filter(a => a.isCorrect).length,
            totalQuestions: myAnswers.length || 10,
            avgResponseTime: myAnswers.length > 0 
              ? myAnswers.reduce((sum, a) => sum + (a.responseTime || 0), 0) / myAnswers.length 
              : 0,
            rewards
          })
        });
        
        if (response.ok) {
          setSaved(true);
          console.log('Battle result saved successfully');
        }
      } catch (error) {
        console.error('Error saving battle result:', error);
      }
    };

    saveBattleResult();
  }, [user, saved, roomId, playerName, myScore, opponentScore, opponent, winner, myAnswers, rewards]);

  // Confetti effect for victory
  useEffect(() => {
    if (isVictory) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVictory]);

  // Calculate stats
  const totalQuestions = myAnswers.length || 10;
  const correctAnswers = myAnswers.filter(a => a.isCorrect).length;
  const accuracy = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(0) : 0;
  const avgTime = myAnswers.length > 0 
    ? (myAnswers.reduce((sum, a) => sum + (a.responseTime || 0), 0) / myAnswers.length).toFixed(1) 
    : 0;

  return (
    <div className={`pk-result ${isVictory ? 'victory' : isDraw ? '' : 'defeat'}`}>
      {/* Confetti for victory */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          colors={['#10b981', '#fbbf24', '#6366f1', '#f43f5e', '#8b5cf6']}
        />
      )}

      <div className="pk-result-container">
        {/* Result Title */}
        <h1 className={`pk-result-title ${isVictory ? 'victory' : isDraw ? 'draw' : 'defeat'}`}>
          {isVictory ? '🏆 CHIẾN THẮNG!' : isDraw ? '🤝 HÒA!' : '💔 THUA CUỘC'}
        </h1>

        {/* Players comparison */}
        <div className="pk-result-players">
          <div className={`pk-result-player ${isVictory ? 'winner' : isDraw ? '' : 'loser'}`}>
            <div className="pk-result-avatar">
              <img src={avatarUrl} alt="You" />
            </div>
            <div className="pk-result-name">{playerName}</div>
            <div className="pk-result-score">{myScore}</div>
          </div>

          <div className="pk-result-vs">VS</div>

          <div className={`pk-result-player ${!isVictory && !isDraw ? 'winner' : isDraw ? '' : 'loser'}`}>
            <div className="pk-result-avatar">
              <img src={opponent?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=opponent'} alt="Opponent" />
            </div>
            <div className="pk-result-name">{opponent?.displayName || 'Đối thủ'}</div>
            <div className="pk-result-score">{opponentScore}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          margin: '30px 0',
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 20,
            textAlign: 'center'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Đúng</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>
              {correctAnswers}/{totalQuestions}
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 20,
            textAlign: 'center'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Độ chính xác</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6366f1' }}>
              {accuracy}%
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 20,
            textAlign: 'center'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>TB Thời gian</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>
              {avgTime}s
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="pk-rewards">
          <div className="pk-reward-item xp">
            <Star size={24} color="#6366f1" />
            <span>+{rewards.xp} XP</span>
          </div>
          <div className="pk-reward-item coins">
            <Coins size={24} color="#f59e0b" />
            <span>+{rewards.coins} Xu</span>
          </div>
          {isVictory && (
            <div className="pk-reward-item" style={{ color: '#10b981' }}>
              <TrendingUp size={24} color="#10b981" />
              <span>+1 Thắng</span>
            </div>
          )}
        </div>

        {/* Rank progress (visual) */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 16,
          padding: 20,
          maxWidth: 400,
          margin: '20px auto',
          textAlign: 'center'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 10,
            marginBottom: 15,
            color: 'rgba(255,255,255,0.8)'
          }}>
            <Award size={20} />
            <span>Tiến trình hạng</span>
          </div>
          <div style={{
            height: 8,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(65 + (isVictory ? 10 : 0), 100)}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              transition: 'width 1s ease'
            }}></div>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: 10,
            fontSize: '0.85rem'
          }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>🥈 Silver</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>🥇 Gold</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pk-result-actions">
          <button 
            className="pk-result-btn pk-play-again-btn"
            onClick={() => navigate('/pk-battle')}
          >
            <RotateCcw size={20} />
            Chơi lại
          </button>
          
          <button 
            className="pk-result-btn pk-home-btn"
            onClick={() => navigate('/')}
          >
            <Home size={20} />
            Trang chủ
          </button>
        </div>

        {/* Match details expandable */}
        {myAnswers.length > 0 && (
          <details style={{ 
            marginTop: 30, 
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 16,
            padding: 20,
            maxWidth: 600,
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            <summary style={{ 
              color: 'white', 
              cursor: 'pointer',
              fontWeight: 600,
              marginBottom: 15
            }}>
              📋 Chi tiết câu trả lời
            </summary>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {myAnswers.map((answer, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 15px',
                  background: answer.isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 8,
                  marginBottom: 8,
                  borderLeft: `4px solid ${answer.isCorrect ? '#10b981' : '#ef4444'}`
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Câu {idx + 1}
                  </span>
                  <span style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                      {answer.responseTime}s
                    </span>
                    <span style={{ 
                      color: answer.isCorrect ? '#10b981' : '#ef4444',
                      fontWeight: 700
                    }}>
                      {answer.isCorrect ? `+${answer.pointsEarned}` : '0'}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default PKResult;

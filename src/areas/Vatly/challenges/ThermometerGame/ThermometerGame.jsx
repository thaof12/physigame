import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, RotateCcw, Thermometer, Star, Clock, Target, Check, X, Zap } from 'lucide-react';
import './ThermometerGame.css';

const ThermometerGame = ({ isPKMode = false, pkTimeLimit, onComplete, onExit }) => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showTutorial, setShowTutorial] = useState(!isPKMode);
  const [timeLeft, setTimeLeft] = useState(30);
  const [pkTimeLeft, setPkTimeLeft] = useState(pkTimeLimit || 45);

  const challenges = [
    {
      id: 1,
      scenario: 'Nước đang sôi',
      temperature: 100,
      unit: 'C',
      icon: '♨️',
      hint: 'Nước sôi ở 100°C',
      description: 'Đọc nhiệt độ trên nhiệt kế',
      context: 'boiling'
    },
    {
      id: 2,
      scenario: 'Nước đá đang tan',
      temperature: 0,
      unit: 'C',
      icon: '🧊',
      hint: 'Nước đá tan ở 0°C',
      description: 'Nhiệt độ nước đá tan',
      context: 'freezing'
    },
    {
      id: 3,
      scenario: 'Nhiệt độ phòng',
      temperature: 25,
      unit: 'C',
      icon: '🏠',
      hint: 'Phòng thường 20-25°C',
      description: 'Nhiệt độ trong nhà',
      context: 'room'
    },
    {
      id: 4,
      scenario: 'Cơ thể người khỏe mạnh',
      temperature: 37,
      unit: 'C',
      icon: '🌡️',
      hint: 'Thân nhiệt bình thường 37°C',
      description: 'Đo nhiệt độ cơ thể',
      context: 'body'
    },
    {
      id: 5,
      scenario: 'Chuyển đổi: 68°F',
      temperature: 20,
      unit: 'C',
      icon: '🔄',
      hint: 'C = (F - 32) × 5/9',
      description: 'Đổi từ Fahrenheit sang Celsius',
      context: 'convert',
      showF: 68
    },
    {
      id: 6,
      scenario: 'Ngày nắng nóng',
      temperature: 35,
      unit: 'C',
      icon: '☀️',
      hint: 'Mùa hè có thể lên 35°C',
      description: 'Nhiệt độ mùa hè',
      context: 'hot'
    },
    {
      id: 7,
      scenario: 'Chuyển đổi: 212°F',
      temperature: 100,
      unit: 'C',
      icon: '🔄',
      hint: 'Nước sôi ở 212°F = 100°C',
      description: 'Đổi từ Fahrenheit sang Celsius',
      context: 'convert',
      showF: 212
    },
    {
      id: 8,
      scenario: 'Tủ lạnh',
      temperature: 4,
      unit: 'C',
      icon: '❄️',
      hint: 'Tủ lạnh khoảng 2-6°C',
      description: 'Nhiệt độ bảo quản thực phẩm',
      context: 'fridge'
    },
    {
      id: 9,
      scenario: 'Chuyển đổi: 25°C sang °F',
      temperature: 77,
      unit: 'F',
      icon: '🔄',
      hint: 'F = (C × 9/5) + 32',
      description: 'Đổi từ Celsius sang Fahrenheit',
      context: 'convert',
      showC: 25
    },
    {
      id: 10,
      scenario: 'Ngày lạnh mùa đông',
      temperature: -5,
      unit: 'C',
      icon: '🌨️',
      hint: 'Âm độ dưới 0°C',
      description: 'Nhiệt độ dưới điểm đóng băng',
      context: 'cold'
    }
  ];

  const getThermometerColor = (temp) => {
    if (temp < 0) return '#3b82f6';
    if (temp < 20) return '#06b6d4';
    if (temp < 40) return '#22c55e';
    if (temp < 60) return '#f59e0b';
    if (temp < 80) return '#f97316';
    return '#ef4444';
  };

  const drawThermometer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentChallenge) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background gradient
    const bgGrad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, height/2);
    bgGrad.addColorStop(0, 'rgba(239, 68, 68, 0.1)');
    bgGrad.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Thermometer dimensions
    const tubeWidth = 50;
    const tubeHeight = height - 120;
    const bulbRadius = 40;
    const tubeX = width / 2 - tubeWidth / 2;
    const tubeY = 40;

    // Draw glass tube shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    // Draw glass tube
    ctx.beginPath();
    ctx.roundRect(tubeX, tubeY, tubeWidth, tubeHeight, 25);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Draw inner tube
    const innerWidth = 30;
    const innerX = width / 2 - innerWidth / 2;
    const innerHeight = tubeHeight - 20;
    const innerY = tubeY + 10;

    ctx.beginPath();
    ctx.roundRect(innerX, innerY, innerWidth, innerHeight, 15);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    // Calculate mercury height
    const temp = currentChallenge.temperature;
    const minTemp = -20;
    const maxTemp = 120;
    const mercuryPercentage = (temp - minTemp) / (maxTemp - minTemp);
    const mercuryHeight = innerHeight * mercuryPercentage;

    // Draw mercury with gradient
    const mercuryColor = getThermometerColor(temp);
    const mercuryGrad = ctx.createLinearGradient(innerX, innerY + innerHeight - mercuryHeight, innerX, innerY + innerHeight);
    mercuryGrad.addColorStop(0, mercuryColor);
    mercuryGrad.addColorStop(1, shadeColor(mercuryColor, -30));

    ctx.beginPath();
    ctx.roundRect(innerX, innerY + innerHeight - mercuryHeight, innerWidth, mercuryHeight, [0, 0, 15, 15]);
    ctx.fillStyle = mercuryGrad;
    ctx.fill();

    // Draw glow effect on mercury top
    ctx.shadowColor = mercuryColor;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(width / 2, innerY + innerHeight - mercuryHeight, 8, 0, Math.PI * 2);
    ctx.fillStyle = mercuryColor;
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Draw bulb
    const bulbY = tubeY + tubeHeight + bulbRadius - 20;
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(width / 2, bulbY, bulbRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowColor = 'transparent';

    // Draw bulb mercury
    const bulbGrad = ctx.createRadialGradient(width/2 - 10, bulbY - 10, 0, width/2, bulbY, bulbRadius - 10);
    bulbGrad.addColorStop(0, shadeColor(mercuryColor, 20));
    bulbGrad.addColorStop(1, mercuryColor);

    ctx.beginPath();
    ctx.arc(width / 2, bulbY, bulbRadius - 10, 0, Math.PI * 2);
    ctx.fillStyle = bulbGrad;
    ctx.fill();

    // Draw temperature scale on left
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'right';
    
    const scaleMarks = [-10, 0, 20, 40, 60, 80, 100, 110];
    scaleMarks.forEach(mark => {
      const markPercentage = (mark - minTemp) / (maxTemp - minTemp);
      const markY = innerY + innerHeight - (innerHeight * markPercentage);
      
      // Draw tick
      ctx.beginPath();
      ctx.moveTo(tubeX - 5, markY);
      ctx.lineTo(tubeX - 15, markY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      let color = 'rgba(255, 255, 255, 0.8)';
      if (mark === 0) color = '#3b82f6';
      if (mark === 100) color = '#ef4444';
      ctx.fillStyle = color;
      ctx.fillText(`${mark}°`, tubeX - 20, markY + 4);
    });

    // Draw context visual on right side
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    const contextY = height / 2;
    
    if (currentChallenge.context === 'boiling') {
      ctx.fillText('♨️', width - 60, contextY - 30);
      ctx.fillText('🫖', width - 60, contextY + 30);
    } else if (currentChallenge.context === 'freezing') {
      ctx.fillText('🧊', width - 60, contextY - 30);
      ctx.fillText('❄️', width - 60, contextY + 30);
    } else if (currentChallenge.context === 'room') {
      ctx.fillText('🏠', width - 60, contextY);
    } else if (currentChallenge.context === 'body') {
      ctx.fillText('🌡️', width - 60, contextY);
    } else if (currentChallenge.context === 'hot') {
      ctx.fillText('☀️', width - 60, contextY - 30);
      ctx.fillText('🥵', width - 60, contextY + 30);
    } else if (currentChallenge.context === 'fridge') {
      ctx.fillText('❄️', width - 60, contextY - 30);
      ctx.fillText('🥤', width - 60, contextY + 30);
    } else if (currentChallenge.context === 'cold') {
      ctx.fillText('🌨️', width - 60, contextY - 30);
      ctx.fillText('⛄', width - 60, contextY + 30);
    } else if (currentChallenge.context === 'convert') {
      ctx.fillText('🔄', width - 60, contextY);
    }

  }, [currentChallenge]);

  // Helper function to shade color
  const shadeColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + 
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  };

  const generateChallenge = () => {
    const challenge = challenges[level - 1];
    setCurrentChallenge(challenge);
    setUserAnswer('');
    setFeedback(null);
    setTimeLeft(30);
  };

  useEffect(() => {
    if (level <= 10 && !gameOver && !showTutorial) {
      generateChallenge();
    }
  }, [level, showTutorial]);

  useEffect(() => {
    drawThermometer();
  }, [currentChallenge, drawThermometer]);

  useEffect(() => {
    if (timeLeft > 0 && !feedback && !gameOver && !showTutorial && currentChallenge) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !feedback && currentChallenge) {
      handleSubmit(true);
    }
  }, [timeLeft, feedback, gameOver, showTutorial, currentChallenge]);

  // PK Mode timer
  useEffect(() => {
    if (!isPKMode || showTutorial || gameOver) return;
    
    if (pkTimeLeft > 0) {
      const timer = setTimeout(() => setPkTimeLeft(pkTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Time's up in PK mode
      if (onComplete) {
        onComplete({
          completed: true,
          success: true,
          score: score,
          accuracy: correctAnswers > 0 ? Math.round((correctAnswers / level) * 100) : 0
        });
      }
    }
  }, [isPKMode, pkTimeLeft, showTutorial, gameOver, score, correctAnswers, level, onComplete]);

  // Notify PK mode when game is over
  useEffect(() => {
    if (gameOver && isPKMode && onComplete) {
      onComplete({
        completed: true,
        success: true,
        score: score,
        accuracy: correctAnswers > 0 ? Math.round((correctAnswers / 10) * 100) : 0
      });
    }
  }, [gameOver, isPKMode, score, correctAnswers, onComplete]);

  const handleSubmit = (timeout = false) => {
    if (feedback) return;

    const answer = parseFloat(userAnswer);
    const correctTemp = currentChallenge.temperature;
    const tolerance = 2;

    const isCorrect = !timeout && !isNaN(answer) && Math.abs(answer - correctTemp) <= tolerance;

    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft / 3);
      const earnedPoints = 10 + timeBonus;
      setScore(score + earnedPoints);
      setCorrectAnswers(correctAnswers + 1);
      setFeedback({
        correct: true,
        message: 'Chính xác!',
        points: earnedPoints,
        detail: `Đáp án: ${correctTemp}°${currentChallenge.unit}`
      });
    } else {
      setFeedback({
        correct: false,
        message: timeout ? 'Hết giờ!' : 'Chưa chính xác!',
        detail: `Đáp án đúng: ${correctTemp}°${currentChallenge.unit}`
      });
    }

    setTimeout(() => {
      if (level < 10) {
        setLevel(level + 1);
      } else {
        setGameOver(true);
      }
    }, 2500);
  };

  const handleRestart = () => {
    setScore(0);
    setLevel(1);
    setCorrectAnswers(0);
    setGameOver(false);
    setShowTutorial(false);
    setFeedback(null);
  };

  const handleStartGame = () => {
    setShowTutorial(false);
  };

  const getBadge = () => {
    if (correctAnswers >= 9) return { icon: '🏆', text: 'Chuyên gia nhiệt độ!', color: '#fbbf24' };
    if (correctAnswers >= 7) return { icon: '🥈', text: 'Rất tốt!', color: '#94a3b8' };
    if (correctAnswers >= 5) return { icon: '🥉', text: 'Khá tốt!', color: '#cd7f32' };
    return { icon: '📚', text: 'Cần luyện tập thêm!', color: '#3b82f6' };
  };

  return (
    <div className="th-game">
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="th-tutorial-overlay">
          <div className="th-tutorial-card">
            <div className="th-tutorial-icon">
              <Thermometer size={40} />
            </div>
            <h2>Nhiệt Kế Thông Minh</h2>
            <p className="th-tutorial-desc">
              Học cách đọc nhiệt độ kế và chuyển đổi đơn vị nhiệt độ
            </p>
            <div className="th-tutorial-steps">
              <div className="th-step">
                <span className="th-step-num">1</span>
                <div className="th-step-content">
                  <strong>Đọc nhiệt kế</strong>
                  <span>Quan sát cột thủy ngân/chất lỏng</span>
                </div>
              </div>
              <div className="th-step">
                <span className="th-step-num">2</span>
                <div className="th-step-content">
                  <strong>Đơn vị</strong>
                  <span>°C (Celsius) hoặc °F (Fahrenheit)</span>
                </div>
              </div>
              <div className="th-step">
                <span className="th-step-num">3</span>
                <div className="th-step-content">
                  <strong>Công thức chuyển đổi</strong>
                  <span>F = (C × 9/5) + 32 | C = (F - 32) × 5/9</span>
                </div>
              </div>
            </div>
            <button onClick={handleStartGame} className="th-start-btn">
              <Zap size={20} />
              Bắt đầu chơi
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      {!isPKMode && (
        <header className="th-header">
          <button onClick={() => navigate('/physics-games/grade/6')} className="th-back-btn">
            <ArrowLeft size={20} />
            <span>Quay lại</span>
          </button>
          <div className="th-title">
            <Thermometer size={28} className="th-title-icon" />
            <h1>Nhiệt Kế Thông Minh</h1>
          </div>
          <div className="th-placeholder"></div>
        </header>
      )}

      {!gameOver ? (
        <div className="th-content">
          {/* Stats Bar */}
          <div className="th-stats-bar">
            <div className="th-stat">
              <Target size={20} />
              <div className="th-stat-info">
                <span className="th-stat-label">Câu hỏi</span>
                <span className="th-stat-value">{level}/10</span>
              </div>
            </div>
            <div className="th-stat">
              <Star size={20} />
              <div className="th-stat-info">
                <span className="th-stat-label">Điểm số</span>
                <span className="th-stat-value">{score}</span>
              </div>
            </div>
            <div className="th-stat">
              <Clock size={20} />
              <div className="th-stat-info">
                <span className="th-stat-label">Thời gian</span>
                <span className={`th-stat-value ${timeLeft <= 10 ? 'th-time-warning' : ''}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="th-progress-container">
            <div className="th-progress-bar">
              <div className="th-progress-fill" style={{ width: `${(level / 10) * 100}%` }}></div>
            </div>
          </div>

          {currentChallenge && (
            <>
              {/* Game Grid */}
              <div className="th-game-grid">
                {/* Challenge Card */}
                <div className="th-challenge-card">
                  <div className="th-scenario-badge">
                    <span className="th-scenario-icon">{currentChallenge.icon}</span>
                    <span className="th-scenario-name">{currentChallenge.scenario}</span>
                  </div>
                  <p className="th-challenge-desc">{currentChallenge.description}</p>
                  
                  <div className="th-hint-box">
                    <span className="th-hint-icon">💡</span>
                    <span className="th-hint-text">{currentChallenge.hint}</span>
                  </div>

                  {currentChallenge.showF && (
                    <div className="th-convert-box">
                      <span className="th-convert-label">Chuyển đổi:</span>
                      <span className="th-convert-value">{currentChallenge.showF}°F = ?°C</span>
                    </div>
                  )}
                  {currentChallenge.showC && (
                    <div className="th-convert-box">
                      <span className="th-convert-label">Chuyển đổi:</span>
                      <span className="th-convert-value">{currentChallenge.showC}°C = ?°F</span>
                    </div>
                  )}

                  {/* Answer Input */}
                  <div className="th-answer-section">
                    <label>Nhiệt độ là bao nhiêu?</label>
                    <div className="th-input-group">
                      <input
                        type="number"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Nhập nhiệt độ"
                        disabled={!!feedback}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        className="th-input"
                      />
                      <span className="th-unit">°{currentChallenge.unit}</span>
                    </div>
                    <button 
                      onClick={() => handleSubmit()} 
                      className="th-submit-btn" 
                      disabled={!!feedback || !userAnswer}
                    >
                      <Check size={20} />
                      Kiểm tra
                    </button>
                  </div>
                </div>

                {/* Canvas Card */}
                <div className="th-canvas-card">
                  <div className="th-canvas-header">
                    <Thermometer size={20} />
                    <span>Nhiệt kế</span>
                  </div>
                  <div className="th-canvas-wrapper">
                    <canvas ref={canvasRef} className="th-canvas"></canvas>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {feedback && (
                <div className={`th-feedback ${feedback.correct ? 'th-feedback-correct' : 'th-feedback-wrong'}`}>
                  <div className="th-feedback-icon">
                    {feedback.correct ? <Check size={28} /> : <X size={28} />}
                  </div>
                  <div className="th-feedback-content">
                    <h3>{feedback.message}</h3>
                    {feedback.points && <span className="th-feedback-points">+{feedback.points} điểm</span>}
                    <p>{feedback.detail}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="th-game-over">
          <div className="th-game-over-card">
            <div className="th-trophy">
              <Award size={60} />
            </div>
            <h2>🎉 Hoàn thành xuất sắc!</h2>
            <div className="th-final-stats">
              <div className="th-final-stat">
                <Star size={24} />
                <div>
                  <span className="th-final-label">Tổng điểm</span>
                  <span className="th-final-value">{score}</span>
                </div>
              </div>
              <div className="th-final-stat">
                <Target size={24} />
                <div>
                  <span className="th-final-label">Trả lời đúng</span>
                  <span className="th-final-value">{correctAnswers}/10</span>
                </div>
              </div>
            </div>
            <div className="th-badge" style={{ borderColor: getBadge().color, color: getBadge().color }}>
              <span className="th-badge-icon">{getBadge().icon}</span>
              <span className="th-badge-text">{getBadge().text}</span>
            </div>
            <div className="th-game-over-actions">
              <button onClick={handleRestart} className="th-restart-btn">
                <RotateCcw size={20} />
                Chơi lại
              </button>
              <button onClick={() => navigate('/physics-games/grade/6')} className="th-home-btn">
                Về danh sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThermometerGame;

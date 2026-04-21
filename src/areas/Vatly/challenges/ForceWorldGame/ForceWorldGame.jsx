import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, RotateCcw, Star, Target, Clock, Check, X, Zap, Move, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import './ForceWorldGame.css';

const ForceWorldGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [showTutorial, setShowTutorial] = useState(true);
  const [gameState, setGameState] = useState('playing');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [feedback, setFeedback] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Force arrow state
  const [arrowStart, setArrowStart] = useState({ x: 0, y: 0 });
  const [arrowEnd, setArrowEnd] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);

  const challenges = [
    {
      id: 1, object: 'Hộp gỗ', mass: 5, icon: '📦',
      targetForce: 20, targetDirection: 0,
      description: 'Kéo hộp sang phải với lực 20N', tolerance: 3
    },
    {
      id: 2, object: 'Quả bóng', mass: 0.5, icon: '⚽',
      targetForce: 10, targetDirection: 90,
      description: 'Đá bóng lên cao với lực 10N', tolerance: 2
    },
    {
      id: 3, object: 'Xe đẩy', mass: 10, icon: '🛒',
      targetForce: 30, targetDirection: 0,
      description: 'Đẩy xe về phía trước với lực 30N', tolerance: 5
    },
    {
      id: 4, object: 'Cửa', mass: 15, icon: '🚪',
      targetForce: 25, targetDirection: 180,
      description: 'Kéo cửa về phía bạn với lực 25N', tolerance: 4
    },
    {
      id: 5, object: 'Búa', mass: 2, icon: '🔨',
      targetForce: 40, targetDirection: 270,
      description: 'Đập búa xuống với lực 40N', tolerance: 6
    },
    {
      id: 6, object: 'Tủ sách', mass: 20, icon: '📚',
      targetForce: 50, targetDirection: 0,
      description: 'Đẩy tủ sách sang phải với lực 50N', tolerance: 7
    },
    {
      id: 7, object: 'Dù', mass: 1, icon: '☂️',
      targetForce: 15, targetDirection: 90,
      description: 'Nâng dù lên với lực 15N', tolerance: 3
    },
    {
      id: 8, object: 'Hòn đá', mass: 8, icon: '🪨',
      targetForce: 35, targetDirection: 270,
      description: 'Ném đá xuống với lực 35N', tolerance: 5
    },
    {
      id: 9, object: 'Kéo', mass: 0.3, icon: '✂️',
      targetForce: 12, targetDirection: 180,
      description: 'Kéo kéo về phía trái với lực 12N', tolerance: 2
    },
    {
      id: 10, object: 'Thùng nước', mass: 12, icon: '🪣',
      targetForce: 45, targetDirection: 90,
      description: 'Nâng thùng nước lên với lực 45N', tolerance: 6
    }
  ];

  // Initialize challenge
  useEffect(() => {
    if (!currentChallenge || currentChallenge.id !== level) {
      setCurrentChallenge(challenges[level - 1]);
      setArrowStart({ x: 200, y: 200 });
      setArrowEnd({ x: 200, y: 200 });
    }
  }, [level]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !feedback && gameState === 'playing' && !showTutorial) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !feedback && gameState === 'playing') {
      handleTimeout();
    }
  }, [timeLeft, feedback, gameState, showTutorial]);

  // Draw canvas
  const drawCanvas = useCallback(() => {
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
    const centerX = width / 2;
    const centerY = height / 2;

    // Background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width / 2);
    bgGradient.addColorStop(0, '#1e293b');
    bgGradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Grid with glow
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i <= height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Center cross
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Object glow
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
    const objectGlow = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, 70);
    objectGlow.addColorStop(0, 'rgba(234, 179, 8, 0.3)');
    objectGlow.addColorStop(1, 'rgba(234, 179, 8, 0)');
    ctx.fillStyle = objectGlow;
    ctx.fill();

    // Object circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Object emoji
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentChallenge.icon, centerX, centerY);

    // Force arrow
    const scaleX = width / 400;
    const scaleY = height / 400;
    const startX = arrowStart.x * scaleX;
    const startY = arrowStart.y * scaleY;
    const endX = arrowEnd.x * scaleX;
    const endY = arrowEnd.y * scaleY;

    if (startX !== endX || startY !== endY) {
      const dx = endX - startX;
      const dy = endY - startY;
      const angle = Math.atan2(dy, dx);

      // Arrow glow
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 15;

      // Arrow line
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Arrowhead
      const headlen = 20;
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headlen * Math.cos(angle - Math.PI / 6),
        endY - headlen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - headlen * Math.cos(angle + Math.PI / 6),
        endY - headlen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;

      // Force magnitude display
      const force = calculateForce();
      if (force > 0) {
        const labelX = endX + 30 * Math.cos(angle);
        const labelY = endY + 30 * Math.sin(angle);

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(labelX - 30, labelY - 15, 60, 30, 8);
        ctx.fill();
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#eab308';
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${force.toFixed(1)}N`, labelX, labelY);
      }
    }

    // Direction indicator in corner
    ctx.fillStyle = 'rgba(234, 179, 8, 0.1)';
    ctx.fillRect(width - 80, height - 80, 70, 70);
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
    ctx.strokeRect(width - 80, height - 80, 70, 70);

    const indicatorCenterX = width - 45;
    const indicatorCenterY = height - 45;

    ctx.fillStyle = 'rgba(234, 179, 8, 0.5)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('→ 0°', indicatorCenterX + 20, indicatorCenterY);
    ctx.fillText('↑ 90°', indicatorCenterX, indicatorCenterY - 20);
    ctx.fillText('← 180°', indicatorCenterX - 20, indicatorCenterY);
    ctx.fillText('↓ 270°', indicatorCenterX, indicatorCenterY + 25);

  }, [arrowStart, arrowEnd, currentChallenge]);

  useEffect(() => {
    drawCanvas();
    window.addEventListener('resize', drawCanvas);
    return () => window.removeEventListener('resize', drawCanvas);
  }, [drawCanvas]);

  const calculateForce = () => {
    const dx = arrowEnd.x - arrowStart.x;
    const dy = arrowEnd.y - arrowStart.y;
    return Math.sqrt(dx * dx + dy * dy) / 2;
  };

  const calculateAngle = () => {
    const dx = arrowEnd.x - arrowStart.x;
    const dy = arrowEnd.y - arrowStart.y;
    let angle = Math.atan2(-dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return angle;
  };

  const handleCanvasMouseDown = (e) => {
    if (feedback || gameState !== 'playing') return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 400;
    const y = ((e.clientY - rect.top) / rect.height) * 400;

    const dist = Math.sqrt((x - 200) ** 2 + (y - 200) ** 2);
    if (dist < 50) {
      setIsDragging(true);
      setArrowStart({ x: 200, y: 200 });
      setArrowEnd({ x: 200, y: 200 });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging || feedback) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 400;
    const y = ((e.clientY - rect.top) / rect.height) * 400;
    setArrowEnd({ x, y });
  };

  const handleCanvasMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleSubmit = () => {
    if (feedback || !currentChallenge) return;

    const force = calculateForce();
    const angle = calculateAngle();
    const target = currentChallenge;

    const forceDiff = Math.abs(force - target.targetForce);
    const forceCorrect = forceDiff <= target.tolerance;

    let angleDiff = Math.abs(angle - target.targetDirection);
    if (angleDiff > 180) angleDiff = 360 - angleDiff;
    const directionCorrect = angleDiff <= 30;

    const isCorrect = forceCorrect && directionCorrect;

    if (isCorrect) {
      const timeBonus = Math.ceil(timeLeft / 5);
      const accuracyBonus = (forceDiff < 1 && angleDiff < 10) ? 5 : 0;
      const earnedPoints = 15 + timeBonus + accuracyBonus;

      setScore(score + earnedPoints);
      setCorrectAnswers(correctAnswers + 1);
      setFeedback({
        correct: true,
        message: `Chính xác! 🎉`,
        points: earnedPoints,
        detail: `Lực: ${force.toFixed(1)}N, Góc: ${angle.toFixed(0)}°`
      });
    } else {
      let errorMsg = '';
      if (!forceCorrect) errorMsg += `Lực chưa đúng (cần ${target.targetForce}N). `;
      if (!directionCorrect) errorMsg += `Hướng chưa đúng.`;

      setFeedback({
        correct: false,
        message: 'Chưa chính xác!',
        detail: errorMsg
      });
    }

    setTimeout(() => {
      if (level < 10) {
        setLevel(level + 1);
        setFeedback(null);
        setTimeLeft(45);
      } else {
        setGameState('gameOver');
      }
    }, 2500);
  };

  const handleTimeout = () => {
    setFeedback({ correct: false, message: 'Hết giờ! ⏰', detail: '' });
    setTimeout(() => {
      if (level < 10) {
        setLevel(level + 1);
        setFeedback(null);
        setTimeLeft(45);
      } else {
        setGameState('gameOver');
      }
    }, 2000);
  };

  const handleRestart = () => {
    setScore(0);
    setLevel(1);
    setCorrectAnswers(0);
    setGameState('playing');
    setShowTutorial(false);
    setCurrentChallenge(challenges[0]);
    setTimeLeft(45);
    setFeedback(null);
    setArrowStart({ x: 200, y: 200 });
    setArrowEnd({ x: 200, y: 200 });
  };

  const getDirectionIcon = (angle) => {
    if (angle === 0) return <ArrowRight size={18} />;
    if (angle === 90) return <ArrowUp size={18} />;
    if (angle === 180) return <ArrowLeft size={18} />;
    if (angle === 270) return <ArrowDown size={18} />;
    return null;
  };

  const getDirectionText = (angle) => {
    if (angle === 0) return 'Sang phải';
    if (angle === 90) return 'Lên trên';
    if (angle === 180) return 'Sang trái';
    if (angle === 270) return 'Xuống dưới';
    return `${angle}°`;
  };

  const getBadge = () => {
    if (correctAnswers >= 9) return { icon: '🏆', text: 'Bậc thầy Lực học', color: '#eab308' };
    if (correctAnswers >= 7) return { icon: '🥈', text: 'Chuyên gia Vật lý', color: '#94a3b8' };
    if (correctAnswers >= 5) return { icon: '🥉', text: 'Nhà nghiên cứu', color: '#cd7f32' };
    return { icon: '💪', text: 'Học viên chăm chỉ', color: '#60a5fa' };
  };

  if (!currentChallenge) return null;

  return (
    <div className="fw-game">
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fw-tutorial-overlay">
          <div className="fw-tutorial-card">
            <div className="fw-tutorial-icon">
              <Zap size={40} />
            </div>
            <h2>Thế Giới Lực</h2>
            <p className="fw-tutorial-desc">
              Học cách tác dụng lực với đúng hướng và cường độ!
            </p>

            <div className="fw-tutorial-steps">
              <div className="fw-step">
                <div className="fw-step-num">1</div>
                <div className="fw-step-content">
                  <strong>Click vào vật thể</strong>
                  <span>Nhấp chuột vào đối tượng ở giữa màn hình</span>
                </div>
              </div>
              <div className="fw-step">
                <div className="fw-step-num">2</div>
                <div className="fw-step-content">
                  <strong>Kéo để vẽ mũi tên lực</strong>
                  <span>Hướng kéo = hướng lực, độ dài = cường độ</span>
                </div>
              </div>
              <div className="fw-step">
                <div className="fw-step-num">3</div>
                <div className="fw-step-content">
                  <strong>Kiểm tra kết quả</strong>
                  <span>2 pixels = 1N (Newton)</span>
                </div>
              </div>
            </div>

            <button className="fw-start-btn" onClick={() => setShowTutorial(false)}>
              <Zap size={20} />
              Bắt đầu thử thách
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="fw-header">
        <button className="fw-back-btn" onClick={() => navigate('/physics-games/grade/6')}>
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div className="fw-title">
          <Zap size={28} className="fw-title-icon" />
          <h1>Thế Giới Lực</h1>
        </div>
      </div>

      {gameState === 'playing' && (
        <div className="fw-content">
          {/* Stats Bar */}
          <div className="fw-stats-bar">
            <div className="fw-stat">
              <Target size={20} />
              <div className="fw-stat-info">
                <span className="fw-stat-label">Câu hỏi</span>
                <span className="fw-stat-value">{level}/10</span>
              </div>
            </div>
            <div className="fw-stat">
              <Star size={20} />
              <div className="fw-stat-info">
                <span className="fw-stat-label">Điểm số</span>
                <span className="fw-stat-value">{score}</span>
              </div>
            </div>
            <div className="fw-stat">
              <Clock size={20} />
              <div className="fw-stat-info">
                <span className="fw-stat-label">Thời gian</span>
                <span className={`fw-stat-value ${timeLeft < 15 ? 'fw-warning' : ''}`}>{timeLeft}s</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="fw-progress-container">
            <div className="fw-progress-bar">
              <div className="fw-progress-fill" style={{ width: `${(level / 10) * 100}%` }}></div>
            </div>
          </div>

          {/* Game Grid */}
          <div className="fw-game-grid">
            {/* Challenge Card */}
            <div className="fw-challenge-card">
              <div className="fw-object-display">
                <span className="fw-object-emoji">{currentChallenge.icon}</span>
                <span className="fw-object-name">{currentChallenge.object}</span>
              </div>
              <p className="fw-challenge-desc">{currentChallenge.description}</p>
              <div className="fw-target-info">
                <div className="fw-target-row">
                  <span className="fw-target-label">Lực cần tác dụng:</span>
                  <span className="fw-target-value">{currentChallenge.targetForce}N</span>
                </div>
                <div className="fw-target-row">
                  <span className="fw-target-label">Hướng:</span>
                  <span className="fw-target-direction">
                    {getDirectionIcon(currentChallenge.targetDirection)}
                    {getDirectionText(currentChallenge.targetDirection)}
                  </span>
                </div>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="fw-canvas-card">
              <div className="fw-canvas-header">
                <Move size={18} />
                <span>Vùng tác dụng lực</span>
              </div>
              <div className="fw-canvas-wrapper">
                <canvas
                  ref={canvasRef}
                  className="fw-canvas"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
              </div>
              <div className="fw-canvas-hint">
                🖱️ Click vào vật và kéo để vẽ mũi tên lực
              </div>
            </div>
          </div>

          {/* Current Force Display */}
          <div className="fw-current-force">
            <div className="fw-force-item">
              <span className="fw-force-label">Lực hiện tại:</span>
              <span className="fw-force-value">{calculateForce().toFixed(1)}N</span>
            </div>
            <div className="fw-force-item">
              <span className="fw-force-label">Góc:</span>
              <span className="fw-force-value">{calculateAngle().toFixed(0)}°</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="fw-action-section">
            <button
              className="fw-submit-btn"
              onClick={handleSubmit}
              disabled={!!feedback || calculateForce() === 0}
            >
              <Check size={20} />
              Kiểm tra
            </button>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`fw-feedback ${feedback.correct ? 'fw-feedback-correct' : 'fw-feedback-wrong'}`}>
              <div className="fw-feedback-icon">
                {feedback.correct ? <Check size={32} /> : <X size={32} />}
              </div>
              <div className="fw-feedback-content">
                <h3>{feedback.message}</h3>
                {feedback.points && <span className="fw-feedback-points">+{feedback.points} điểm</span>}
                {feedback.detail && <p>{feedback.detail}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Game Over */}
      {gameState === 'gameOver' && (
        <div className="fw-game-over">
          <div className="fw-game-over-card">
            <div className="fw-trophy">
              <Award size={80} />
            </div>
            <h2>🎉 Hoàn thành!</h2>

            <div className="fw-final-stats">
              <div className="fw-final-stat">
                <Star size={24} />
                <div>
                  <span className="fw-final-label">Tổng điểm</span>
                  <span className="fw-final-value">{score}</span>
                </div>
              </div>
              <div className="fw-final-stat">
                <Check size={24} />
                <div>
                  <span className="fw-final-label">Trả lời đúng</span>
                  <span className="fw-final-value">{correctAnswers}/10</span>
                </div>
              </div>
              <div className="fw-final-stat">
                <Target size={24} />
                <div>
                  <span className="fw-final-label">Độ chính xác</span>
                  <span className="fw-final-value">{Math.round((correctAnswers / 10) * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="fw-badge" style={{ borderColor: getBadge().color }}>
              <span className="fw-badge-icon">{getBadge().icon}</span>
              <span className="fw-badge-text" style={{ color: getBadge().color }}>{getBadge().text}</span>
            </div>

            <div className="fw-game-over-actions">
              <button className="fw-restart-btn" onClick={handleRestart}>
                <RotateCcw size={20} />
                Chơi lại
              </button>
              <button className="fw-home-btn" onClick={() => navigate('/physics-games/grade/6')}>
                Về danh sách game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForceWorldGame;

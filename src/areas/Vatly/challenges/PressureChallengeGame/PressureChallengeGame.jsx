import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, RotateCcw, Star, Target, Check, X, Gauge, ArrowDown, ArrowUp } from 'lucide-react';
import './PressureChallengeGame.css';

const PressureChallengeGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [showTutorial, setShowTutorial] = useState(true);
  const [gameState, setGameState] = useState('playing');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState(null);

  // Pressure parameters
  const [force, setForce] = useState(100);
  const [area, setArea] = useState(0.1);

  const challenges = [
    {
      id: 1, description: 'Đinh nhọn đóng vào gỗ',
      targetPressure: 2000, tolerance: 300,
      scenario: 'Đinh', icon: '📌',
      hint: 'Diện tích nhỏ → áp suất lớn',
      forceRange: [50, 200], areaRange: [0.01, 0.5]
    },
    {
      id: 2, description: 'Người đứng trên sàn',
      targetPressure: 20000, tolerance: 3000,
      scenario: 'Bàn chân', icon: '👣',
      hint: 'Trọng lượng người / Diện tích bàn chân',
      forceRange: [200, 800], areaRange: [0.01, 0.1]
    },
    {
      id: 3, description: 'Dao cắt thịt',
      targetPressure: 5000, tolerance: 800,
      scenario: 'Lưỡi dao', icon: '🔪',
      hint: 'Lưỡi dao mỏng tăng áp suất',
      forceRange: [50, 300], areaRange: [0.005, 0.2]
    },
    {
      id: 4, description: 'Xe tăng trên nền đất',
      targetPressure: 60000, tolerance: 10000,
      scenario: 'Xích xe tăng', icon: '🚜',
      hint: 'Xích rộng giảm áp suất',
      forceRange: [1000, 3000], areaRange: [0.1, 1]
    },
    {
      id: 5, description: 'Kim tiêm dưới da',
      targetPressure: 10000, tolerance: 1500,
      scenario: 'Mũi kim', icon: '💉',
      hint: 'Kim rất nhỏ nên áp suất cao',
      forceRange: [10, 100], areaRange: [0.001, 0.05]
    },
    {
      id: 6, description: 'Búa đóng đinh',
      targetPressure: 15000, tolerance: 2500,
      scenario: 'Đầu búa', icon: '🔨',
      hint: 'Lực va đập lớn',
      forceRange: [100, 500], areaRange: [0.01, 0.2]
    },
    {
      id: 7, description: 'Giày cao gót đi trên cỏ',
      targetPressure: 80000, tolerance: 12000,
      scenario: 'Gót giày', icon: '👠',
      hint: 'Gót nhỏ → áp suất rất lớn',
      forceRange: [300, 700], areaRange: [0.001, 0.02]
    },
    {
      id: 8, description: 'Máy ép thủy lực',
      targetPressure: 100000, tolerance: 15000,
      scenario: 'Piston', icon: '⚙️',
      hint: 'P = F/S rất lớn',
      forceRange: [1000, 5000], areaRange: [0.01, 0.15]
    },
    {
      id: 9, description: 'Kéo cắt giấy',
      targetPressure: 8000, tolerance: 1200,
      scenario: 'Lưỡi kéo', icon: '✂️',
      hint: 'Hai lưỡi sắc nhọn',
      forceRange: [50, 200], areaRange: [0.005, 0.1]
    },
    {
      id: 10, description: 'Người nằm trên giường đinh',
      targetPressure: 1000, tolerance: 200,
      scenario: 'Nhiều đinh', icon: '🛏️',
      hint: 'Nhiều đinh → diện tích lớn → áp suất nhỏ',
      forceRange: [400, 800], areaRange: [0.3, 1]
    }
  ];

  useEffect(() => {
    if (level <= 10 && gameState === 'playing') {
      const challenge = challenges[level - 1];
      setCurrentChallenge(challenge);
      setFeedback(null);
      setForce((challenge.forceRange[0] + challenge.forceRange[1]) / 2);
      setArea((challenge.areaRange[0] + challenge.areaRange[1]) / 2);
    }
  }, [level, gameState]);

  // Draw canvas visualization
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

    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#1e1b4b');
    bgGradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Calculate pressure percentage
    const currentPressure = calculatePressure();
    const maxPressure = 200000;
    const pressurePercent = Math.min(currentPressure / maxPressure, 1);

    // Draw pressure gauge (left side)
    const gaugeX = 60;
    const gaugeTop = 40;
    const gaugeHeight = height - 80;
    const gaugeWidth = 30;

    // Gauge background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.roundRect(gaugeX - gaugeWidth / 2, gaugeTop, gaugeWidth, gaugeHeight, 8);
    ctx.fill();

    // Gauge fill with gradient
    const fillHeight = gaugeHeight * pressurePercent;
    const gaugeGradient = ctx.createLinearGradient(0, gaugeTop + gaugeHeight - fillHeight, 0, gaugeTop + gaugeHeight);
    gaugeGradient.addColorStop(0, '#22c55e');
    gaugeGradient.addColorStop(0.5, '#eab308');
    gaugeGradient.addColorStop(1, '#ef4444');
    ctx.fillStyle = gaugeGradient;
    ctx.beginPath();
    ctx.roundRect(gaugeX - gaugeWidth / 2 + 4, gaugeTop + gaugeHeight - fillHeight, gaugeWidth - 8, fillHeight, 4);
    ctx.fill();

    // Gauge labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('200k Pa', gaugeX + gaugeWidth + 35, gaugeTop + 10);
    ctx.fillText('100k Pa', gaugeX + gaugeWidth + 35, gaugeTop + gaugeHeight / 2);
    ctx.fillText('0 Pa', gaugeX + gaugeWidth + 35, gaugeTop + gaugeHeight);

    // Target line
    const targetPercent = currentChallenge.targetPressure / maxPressure;
    const targetY = gaugeTop + gaugeHeight * (1 - targetPercent);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(gaugeX - gaugeWidth / 2 - 10, targetY);
    ctx.lineTo(gaugeX + gaugeWidth / 2 + 10, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw surface simulation (right side)
    const simX = centerX + 50;
    const simY = 60;
    const simWidth = width - simX - 40;
    const simHeight = height - 100;

    // Material surface
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(simX, simY + simHeight / 2, simWidth, simHeight / 2, [0, 0, 12, 12]);
    ctx.fill();

    // Material texture lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const y = simY + simHeight / 2 + 20 + i * 15;
      ctx.beginPath();
      ctx.moveTo(simX + 10, y);
      ctx.lineTo(simX + simWidth - 10, y);
      ctx.stroke();
    }

    // Calculate penetration based on pressure
    const penetration = Math.min(pressurePercent * 0.8, 0.8) * (simHeight / 3);

    // Object pressing down
    const objWidth = 40 + (1 - area / currentChallenge.areaRange[1]) * 60;
    const objHeight = 60;
    const objX = simX + simWidth / 2;
    const objY = simY + simHeight / 2 - penetration;

    // Object glow based on pressure
    ctx.beginPath();
    ctx.arc(objX, objY, objWidth + 20, 0, Math.PI * 2);
    const glowGradient = ctx.createRadialGradient(objX, objY, 0, objX, objY, objWidth + 30);
    const glowColor = pressurePercent > 0.5 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.2)';
    glowGradient.addColorStop(0, glowColor);
    glowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Force arrow
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(objX, simY + 20);
    ctx.lineTo(objX, objY - objHeight / 2 - 10);
    ctx.stroke();

    // Arrow head
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(objX, objY - objHeight / 2 - 5);
    ctx.lineTo(objX - 10, objY - objHeight / 2 - 20);
    ctx.lineTo(objX + 10, objY - objHeight / 2 - 20);
    ctx.closePath();
    ctx.fill();

    // Force label
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`F = ${force.toFixed(0)}N`, objX, simY + 10);

    // Pressing object
    const objGradient = ctx.createLinearGradient(objX - objWidth / 2, objY - objHeight / 2, objX + objWidth / 2, objY + objHeight / 2);
    objGradient.addColorStop(0, '#8b5cf6');
    objGradient.addColorStop(1, '#6366f1');
    ctx.fillStyle = objGradient;
    ctx.beginPath();
    ctx.roundRect(objX - objWidth / 2, objY - objHeight / 2, objWidth, objHeight, 8);
    ctx.fill();
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icon on object
    ctx.font = '24px Arial';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentChallenge.icon, objX, objY);

    // Contact area indicator
    ctx.fillStyle = 'rgba(234, 179, 8, 0.8)';
    ctx.beginPath();
    ctx.roundRect(objX - objWidth / 2, objY + objHeight / 2 - 4, objWidth, 4, 2);
    ctx.fill();

    // Area label
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px system-ui';
    ctx.fillText(`S = ${area.toFixed(3)}m²`, objX, objY + objHeight / 2 + 20);

    // Pressure waves
    if (pressurePercent > 0.3) {
      const waveCount = Math.floor(pressurePercent * 4);
      for (let i = 0; i < waveCount; i++) {
        const waveY = simY + simHeight / 2 + 20 + i * 20;
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 - i * 0.1})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(objX, waveY, objWidth / 2 + 10 + i * 15, 0, Math.PI);
        ctx.stroke();
      }
    }

    // Pressure status text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    let statusText = '';
    let statusColor = '';
    if (pressurePercent < 0.2) {
      statusText = '☁️ Áp suất thấp';
      statusColor = '#94a3b8';
    } else if (pressurePercent < 0.5) {
      statusText = '📌 Áp suất vừa';
      statusColor = '#22c55e';
    } else if (pressurePercent < 0.8) {
      statusText = '⚡ Áp suất cao';
      statusColor = '#eab308';
    } else {
      statusText = '💥 Áp suất rất cao';
      statusColor = '#ef4444';
    }

    ctx.fillStyle = statusColor;
    ctx.fillText(statusText, simX + simWidth / 2, simY + simHeight - 20);

  }, [currentChallenge, force, area]);

  useEffect(() => {
    drawCanvas();
    window.addEventListener('resize', drawCanvas);
    return () => window.removeEventListener('resize', drawCanvas);
  }, [drawCanvas]);

  const calculatePressure = () => {
    return force / area;
  };

  const handleSubmit = () => {
    if (feedback || !currentChallenge) return;

    const currentPressure = calculatePressure();
    const targetPressure = currentChallenge.targetPressure;
    const tolerance = currentChallenge.tolerance;

    const isCorrect = Math.abs(currentPressure - targetPressure) <= tolerance;

    if (isCorrect) {
      const earnedPoints = 15;
      setScore(score + earnedPoints);
      setCorrectAnswers(correctAnswers + 1);
      setFeedback({
        correct: true,
        message: 'Chính xác! 🎉',
        points: earnedPoints,
        detail: `Áp suất: ${currentPressure.toFixed(0)} Pa ≈ ${targetPressure} Pa`
      });
    } else {
      setFeedback({
        correct: false,
        message: 'Chưa chính xác!',
        detail: `Áp suất: ${currentPressure.toFixed(0)} Pa, Mục tiêu: ${targetPressure} Pa`
      });
    }

    setTimeout(() => {
      if (level < 10) {
        setLevel(level + 1);
        setFeedback(null);
      } else {
        setGameState('gameOver');
      }
    }, 2500);
  };

  const handleRestart = () => {
    setScore(0);
    setLevel(1);
    setCorrectAnswers(0);
    setGameState('playing');
    setShowTutorial(false);
    setFeedback(null);
  };

  const getComparisonStatus = () => {
    if (!currentChallenge) return null;
    const currentPressure = calculatePressure();
    const diff = Math.abs(currentPressure - currentChallenge.targetPressure);
    
    if (diff <= currentChallenge.tolerance) {
      return { status: 'good', text: '✓ Đạt yêu cầu', icon: <Check size={18} /> };
    } else if (currentPressure < currentChallenge.targetPressure) {
      return { status: 'low', text: 'Cần tăng áp suất', icon: <ArrowUp size={18} /> };
    } else {
      return { status: 'high', text: 'Cần giảm áp suất', icon: <ArrowDown size={18} /> };
    }
  };

  const getBadge = () => {
    if (correctAnswers >= 9) return { icon: '🏆', text: 'Chuyên gia áp suất', color: '#a855f7' };
    if (correctAnswers >= 7) return { icon: '🥈', text: 'Nhà vật lý học', color: '#94a3b8' };
    if (correctAnswers >= 5) return { icon: '🥉', text: 'Thợ kỹ thuật', color: '#cd7f32' };
    return { icon: '💪', text: 'Học viên chăm chỉ', color: '#8b5cf6' };
  };

  if (!currentChallenge && gameState === 'playing') return null;

  return (
    <div className="pc-game">
      {/* Tutorial */}
      {showTutorial && (
        <div className="pc-tutorial-overlay">
          <div className="pc-tutorial-card">
            <div className="pc-tutorial-icon">
              <Gauge size={40} />
            </div>
            <h2>Áp Suất Thách Đố</h2>
            <p className="pc-tutorial-desc">
              Điều chỉnh lực và diện tích để đạt áp suất mục tiêu!
            </p>

            <div className="pc-tutorial-steps">
              <div className="pc-step">
                <div className="pc-step-num">1</div>
                <div className="pc-step-content">
                  <strong>Công thức áp suất</strong>
                  <span>P = F / S (Pa = N / m²)</span>
                </div>
              </div>
              <div className="pc-step">
                <div className="pc-step-num">2</div>
                <div className="pc-step-content">
                  <strong>Diện tích nhỏ</strong>
                  <span>→ Áp suất tăng lên</span>
                </div>
              </div>
              <div className="pc-step">
                <div className="pc-step-num">3</div>
                <div className="pc-step-content">
                  <strong>Lực lớn</strong>
                  <span>→ Áp suất tăng lên</span>
                </div>
              </div>
            </div>

            <button className="pc-start-btn" onClick={() => setShowTutorial(false)}>
              <Gauge size={20} />
              Bắt đầu thử thách
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pc-header">
        <button className="pc-back-btn" onClick={() => navigate('/physics-games/grade/6')}>
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div className="pc-title">
          <Gauge size={28} className="pc-title-icon" />
          <h1>Áp Suất Thách Đố</h1>
        </div>
      </div>

      {gameState === 'playing' && currentChallenge && (
        <div className="pc-content">
          {/* Stats Bar */}
          <div className="pc-stats-bar">
            <div className="pc-stat">
              <Target size={20} />
              <div className="pc-stat-info">
                <span className="pc-stat-label">Câu hỏi</span>
                <span className="pc-stat-value">{level}/10</span>
              </div>
            </div>
            <div className="pc-stat">
              <Star size={20} />
              <div className="pc-stat-info">
                <span className="pc-stat-label">Điểm số</span>
                <span className="pc-stat-value">{score}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pc-progress-container">
            <div className="pc-progress-bar">
              <div className="pc-progress-fill" style={{ width: `${(level / 10) * 100}%` }}></div>
            </div>
          </div>

          {/* Game Grid */}
          <div className="pc-game-grid">
            {/* Challenge Card */}
            <div className="pc-challenge-card">
              <div className="pc-scenario-badge">
                <span className="pc-scenario-icon">{currentChallenge.icon}</span>
                <span className="pc-scenario-name">{currentChallenge.scenario}</span>
              </div>
              <p className="pc-challenge-desc">{currentChallenge.description}</p>
              
              <div className="pc-formula-box">
                <div className="pc-formula">
                  <span className="pc-formula-p">P</span>
                  <span className="pc-formula-eq">=</span>
                  <div className="pc-formula-frac">
                    <span className="pc-formula-num">F</span>
                    <span className="pc-formula-line"></span>
                    <span className="pc-formula-den">S</span>
                  </div>
                </div>
              </div>

              <div className="pc-hint-box">
                <span className="pc-hint-icon">💡</span>
                <span className="pc-hint-text">{currentChallenge.hint}</span>
              </div>

              <div className="pc-target-box">
                <span className="pc-target-label">Áp suất mục tiêu:</span>
                <span className="pc-target-value">{currentChallenge.targetPressure.toLocaleString()} Pa</span>
              </div>
            </div>

            {/* Canvas */}
            <div className="pc-canvas-card">
              <div className="pc-canvas-header">
                <Gauge size={18} />
                <span>Mô phỏng áp suất</span>
              </div>
              <div className="pc-canvas-wrapper">
                <canvas ref={canvasRef} className="pc-canvas" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="pc-controls-card">
            <div className="pc-controls-grid">
              <div className="pc-control">
                <label>
                  <span className="pc-control-icon">💪</span>
                  Lực (F): <strong>{force.toFixed(1)} N</strong>
                </label>
                <input
                  type="range"
                  min={currentChallenge.forceRange[0]}
                  max={currentChallenge.forceRange[1]}
                  step="1"
                  value={force}
                  onChange={(e) => setForce(parseFloat(e.target.value))}
                  className="pc-slider pc-slider-force"
                />
              </div>
              <div className="pc-control">
                <label>
                  <span className="pc-control-icon">📐</span>
                  Diện tích (S): <strong>{area.toFixed(3)} m²</strong>
                </label>
                <input
                  type="range"
                  min={currentChallenge.areaRange[0]}
                  max={currentChallenge.areaRange[1]}
                  step="0.001"
                  value={area}
                  onChange={(e) => setArea(parseFloat(e.target.value))}
                  className="pc-slider pc-slider-area"
                />
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="pc-result-card">
            <div className="pc-result-main">
              <span className="pc-result-label">Áp suất hiện tại:</span>
              <span className="pc-result-value">{calculatePressure().toFixed(0)} Pa</span>
            </div>
            <div className={`pc-result-status pc-status-${getComparisonStatus()?.status}`}>
              {getComparisonStatus()?.icon}
              <span>{getComparisonStatus()?.text}</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pc-action-section">
            <button
              className="pc-submit-btn"
              onClick={handleSubmit}
              disabled={!!feedback}
            >
              <Check size={20} />
              Kiểm tra
            </button>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`pc-feedback ${feedback.correct ? 'pc-feedback-correct' : 'pc-feedback-wrong'}`}>
              <div className="pc-feedback-icon">
                {feedback.correct ? <Check size={32} /> : <X size={32} />}
              </div>
              <div className="pc-feedback-content">
                <h3>{feedback.message}</h3>
                {feedback.points && <span className="pc-feedback-points">+{feedback.points} điểm</span>}
                {feedback.detail && <p>{feedback.detail}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Game Over */}
      {gameState === 'gameOver' && (
        <div className="pc-game-over">
          <div className="pc-game-over-card">
            <div className="pc-trophy">
              <Award size={80} />
            </div>
            <h2>🎉 Hoàn thành!</h2>

            <div className="pc-final-stats">
              <div className="pc-final-stat">
                <Star size={24} />
                <div>
                  <span className="pc-final-label">Tổng điểm</span>
                  <span className="pc-final-value">{score}</span>
                </div>
              </div>
              <div className="pc-final-stat">
                <Check size={24} />
                <div>
                  <span className="pc-final-label">Trả lời đúng</span>
                  <span className="pc-final-value">{correctAnswers}/10</span>
                </div>
              </div>
              <div className="pc-final-stat">
                <Target size={24} />
                <div>
                  <span className="pc-final-label">Độ chính xác</span>
                  <span className="pc-final-value">{Math.round((correctAnswers / 10) * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="pc-badge" style={{ borderColor: getBadge().color }}>
              <span className="pc-badge-icon">{getBadge().icon}</span>
              <span className="pc-badge-text" style={{ color: getBadge().color }}>{getBadge().text}</span>
            </div>

            <div className="pc-game-over-actions">
              <button className="pc-restart-btn" onClick={handleRestart}>
                <RotateCcw size={20} />
                Chơi lại
              </button>
              <button className="pc-home-btn" onClick={() => navigate('/physics-games/grade/6')}>
                Về danh sách game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PressureChallengeGame;

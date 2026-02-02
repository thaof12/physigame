import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, RotateCcw, Star, Target, Clock, Check, X, Gauge, Droplets, Weight } from 'lucide-react';
import './PressureMaster.css';

const PressureMaster = ({ isPKMode = false, pkTimeLimit, onComplete, onExit }) => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [showTutorial, setShowTutorial] = useState(!isPKMode);
  const [pkTimeLeft, setPkTimeLeft] = useState(pkTimeLimit || 60);
  const [gameState, setGameState] = useState('playing');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [feedback, setFeedback] = useState(null);

  // Game state
  const [weights, setWeights] = useState([]);
  const [liquidLevel, setLiquidLevel] = useState(0);
  const [currentPressure, setCurrentPressure] = useState(0);
  const [levelCompleted, setLevelCompleted] = useState(false);

  const levels = [
    {
      id: 1,
      name: 'Áp Suất Chất Rắn',
      description: 'Đặt vật nặng lên bề mặt để tạo áp suất mục tiêu',
      mode: 'solid',
      targetPressure: 4905, // 50kg * 9.81 / 0.01m²
      tolerance: 300,
      area: 0.01, // 100cm² = 0.01m²
      maxWeights: 5,
      formula: 'P = F/A = mg/A'
    },
    {
      id: 2,
      name: 'Áp Suất Chất Lỏng',
      description: 'Điều chỉnh mực nước để đạt áp suất đáy',
      mode: 'liquid',
      targetPressure: 4905, // ρgh = 1000 * 9.81 * 0.5
      tolerance: 300,
      density: 1000,
      gravity: 9.81,
      formula: 'P = ρgh'
    },
    {
      id: 3,
      name: 'Thử Thách Kết Hợp',
      description: 'Sử dụng cả vật nặng và chất lỏng',
      mode: 'combined',
      targetPressure: 7357, // Combined
      tolerance: 400,
      area: 0.01,
      density: 1000,
      gravity: 9.81,
      maxWeights: 3,
      formula: 'P = mg/A + ρgh'
    },
    {
      id: 4,
      name: 'Bậc Thầy Áp Suất',
      description: 'Đạt chính xác áp suất yêu cầu',
      mode: 'solid',
      targetPressure: 9810,
      tolerance: 200,
      area: 0.01,
      maxWeights: 5,
      formula: 'P = F/A'
    }
  ];

  const currentLevel = levels[level - 1];
  const availableWeights = [5, 10, 20, 50];

  // Timer
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && !showTutorial && !levelCompleted) {
      timer = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, showTutorial, levelCompleted]);

  // PK Mode Timer
  useEffect(() => {
    if (!isPKMode || gameState !== 'playing' || showTutorial) return;
    
    if (pkTimeLeft <= 0) {
      if (onComplete) onComplete({ score, level, completed: level - 1 });
      return;
    }
    
    const timer = setInterval(() => {
      setPkTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPKMode, gameState, showTutorial, pkTimeLeft, score, level, onComplete]);

  // Handle exit for PK mode
  const handleExit = () => {
    if (isPKMode && onExit) {
      onExit();
    } else {
      navigate(-1);
    }
  };

  // Calculate pressure
  useEffect(() => {
    let pressure = 0;
    const lvl = currentLevel;

    if (lvl.mode === 'solid' || lvl.mode === 'combined') {
      const totalMass = weights.reduce((sum, w) => sum + w, 0);
      const force = totalMass * 9.81;
      pressure += lvl.area > 0 ? force / lvl.area : 0;
    }

    if (lvl.mode === 'liquid' || lvl.mode === 'combined') {
      const h = liquidLevel / 100; // Convert to meters (0-1m range)
      pressure += (lvl.density || 1000) * (lvl.gravity || 9.81) * h;
    }

    setCurrentPressure(pressure);

    // Check win condition
    if (!levelCompleted && Math.abs(pressure - lvl.targetPressure) <= lvl.tolerance && pressure > 0) {
      setLevelCompleted(true);
      const points = Math.max(50, 200 - timeElapsed * 2);
      setScore(s => s + points);
      setFeedback({ type: 'success', message: `Tuyệt vời! +${points} điểm` });

      setTimeout(() => {
        setFeedback(null);
        if (level < levels.length) {
          setLevel(l => l + 1);
          resetLevel();
        } else {
          setGameState('victory');
          if (isPKMode && onComplete) {
            onComplete({ score: score + points, level: levels.length, completed: levels.length });
          }
        }
      }, 1500);
    }
  }, [weights, liquidLevel, currentLevel, levelCompleted, level, timeElapsed]);

  // Reset level
  const resetLevel = useCallback(() => {
    setWeights([]);
    setLiquidLevel(0);
    setLevelCompleted(false);
    setTimeElapsed(0);
  }, []);

  useEffect(() => {
    if (!showTutorial && gameState === 'playing') {
      resetLevel();
    }
  }, [showTutorial, level, resetLevel, gameState]);

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#1e293b');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const lvl = currentLevel;
    const centerX = width / 2;

    if (lvl.mode === 'solid') {
      drawSolidMode(ctx, width, height, centerX);
    } else if (lvl.mode === 'liquid') {
      drawLiquidMode(ctx, width, height, centerX);
    } else if (lvl.mode === 'combined') {
      drawCombinedMode(ctx, width, height, centerX);
    }

    // Draw pressure gauge
    drawPressureGauge(ctx, width, height);

    ctx.restore();
  }, [currentLevel, weights, liquidLevel, currentPressure]);

  const drawSolidMode = (ctx, width, height, centerX) => {
    // Platform
    const platformY = height - 80;
    const platformWidth = 160;
    const platformHeight = 20;

    ctx.fillStyle = '#64748b';
    ctx.fillRect(centerX - platformWidth / 2, platformY, platformWidth, platformHeight);

    // Surface area label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`S = 100 cm²`, centerX, platformY + platformHeight + 20);

    // Draw weights stacked
    weights.forEach((w, i) => {
      const weightY = platformY - 30 - i * 35;
      const weightWidth = 80 + w;
      const weightHeight = 30;

      // Weight block
      const wGrad = ctx.createLinearGradient(0, weightY, 0, weightY + weightHeight);
      wGrad.addColorStop(0, '#ef4444');
      wGrad.addColorStop(1, '#dc2626');
      ctx.fillStyle = wGrad;
      ctx.beginPath();
      ctx.roundRect(centerX - weightWidth / 2, weightY, weightWidth, weightHeight, 6);
      ctx.fill();

      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${w} kg`, centerX, weightY + 20);
    });

    // Force arrow
    if (weights.length > 0) {
      const totalMass = weights.reduce((s, w) => s + w, 0);
      const arrowStartY = platformY - 30 - weights.length * 35 - 20;
      
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, arrowStartY - 40);
      ctx.lineTo(centerX, arrowStartY);
      ctx.stroke();

      // Arrow head
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(centerX, arrowStartY);
      ctx.lineTo(centerX - 8, arrowStartY - 12);
      ctx.lineTo(centerX + 8, arrowStartY - 12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px system-ui';
      ctx.fillText(`F = ${(totalMass * 9.81).toFixed(1)} N`, centerX, arrowStartY - 50);
    }
  };

  const drawLiquidMode = (ctx, width, height, centerX) => {
    // Container
    const containerX = centerX - 80;
    const containerY = 80;
    const containerWidth = 160;
    const containerHeight = 300;

    // Container walls
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(containerX, containerY);
    ctx.lineTo(containerX, containerY + containerHeight);
    ctx.lineTo(containerX + containerWidth, containerY + containerHeight);
    ctx.lineTo(containerX + containerWidth, containerY);
    ctx.stroke();

    // Water
    const waterHeight = (liquidLevel / 100) * containerHeight;
    const waterY = containerY + containerHeight - waterHeight;

    if (waterHeight > 0) {
      const waterGrad = ctx.createLinearGradient(0, waterY, 0, containerY + containerHeight);
      waterGrad.addColorStop(0, '#3b82f6');
      waterGrad.addColorStop(1, '#1d4ed8');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(containerX + 2, waterY, containerWidth - 4, waterHeight - 2);

      // Water surface shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(containerX + 10, waterY + 5, containerWidth - 20, 3);
    }

    // Height marker
    if (liquidLevel > 0) {
      const h = (liquidLevel / 100).toFixed(2);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(containerX - 20, waterY);
      ctx.lineTo(containerX + containerWidth + 20, waterY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`h = ${h} m`, containerX - 25, waterY + 5);
    }

    // Bottom pressure indicator
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Áp suất đáy', centerX, containerY + containerHeight + 25);

    // Scale markers
    for (let i = 0; i <= 4; i++) {
      const y = containerY + (containerHeight / 4) * i;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(containerX + containerWidth + 5, y);
      ctx.lineTo(containerX + containerWidth + 15, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`${(1 - i * 0.25).toFixed(2)}m`, containerX + containerWidth + 20, y + 4);
    }
  };

  const drawCombinedMode = (ctx, width, height, centerX) => {
    // Container with piston
    const containerX = centerX - 80;
    const containerY = 120;
    const containerWidth = 160;
    const containerHeight = 250;

    // Container walls
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(containerX, containerY);
    ctx.lineTo(containerX, containerY + containerHeight);
    ctx.lineTo(containerX + containerWidth, containerY + containerHeight);
    ctx.lineTo(containerX + containerWidth, containerY);
    ctx.stroke();

    // Water
    const waterHeight = (liquidLevel / 100) * containerHeight * 0.7;
    const waterY = containerY + containerHeight - waterHeight;

    if (waterHeight > 0) {
      const waterGrad = ctx.createLinearGradient(0, waterY, 0, containerY + containerHeight);
      waterGrad.addColorStop(0, '#3b82f6');
      waterGrad.addColorStop(1, '#1d4ed8');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(containerX + 2, waterY, containerWidth - 4, waterHeight - 2);
    }

    // Piston
    const pistonY = containerY - 10;
    ctx.fillStyle = '#475569';
    ctx.fillRect(containerX + 10, pistonY, containerWidth - 20, 20);

    // Weights on piston
    weights.forEach((w, i) => {
      const weightY = pistonY - 25 - i * 30;
      const weightWidth = 70 + w * 0.5;

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(centerX - weightWidth / 2, weightY, weightWidth, 25, 4);
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${w}kg`, centerX, weightY + 17);
    });
  };

  const drawPressureGauge = (ctx, width, height) => {
    const gaugeX = 20;
    const gaugeY = 20;
    const gaugeWidth = 200;
    const gaugeHeight = 140;

    // Background
    ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
    ctx.beginPath();
    ctx.roundRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ ÁP KẾ', gaugeX + gaugeWidth / 2, gaugeY + 25);

    // Target
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px system-ui';
    ctx.fillText(`Mục tiêu: ${currentLevel.targetPressure.toFixed(0)} Pa`, gaugeX + gaugeWidth / 2, gaugeY + 48);

    // Current pressure
    const isClose = Math.abs(currentPressure - currentLevel.targetPressure) <= currentLevel.tolerance;
    ctx.fillStyle = isClose ? '#22c55e' : '#fbbf24';
    ctx.font = 'bold 24px system-ui';
    ctx.fillText(`${currentPressure.toFixed(0)} Pa`, gaugeX + gaugeWidth / 2, gaugeY + 80);

    // Progress bar
    const barX = gaugeX + 15;
    const barY = gaugeY + 95;
    const barWidth = gaugeWidth - 30;
    const barHeight = 12;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 6);
    ctx.fill();

    const ratio = Math.min(currentPressure / currentLevel.targetPressure, 1.2);
    const fillWidth = Math.min(ratio * barWidth, barWidth);

    ctx.fillStyle = isClose ? '#22c55e' : ratio > 1 ? '#ef4444' : '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillWidth, barHeight, 6);
    ctx.fill();

    // Target marker
    const targetX = barX + barWidth * (currentLevel.targetPressure / (currentLevel.targetPressure * 1.2));
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(targetX, barY - 3);
    ctx.lineTo(targetX, barY + barHeight + 3);
    ctx.stroke();

    // Status
    ctx.font = '11px system-ui';
    ctx.fillStyle = isClose ? '#22c55e' : '#94a3b8';
    const diff = currentLevel.targetPressure - currentPressure;
    const status = isClose ? '✓ Đạt yêu cầu!' : diff > 0 ? `↑ Cần thêm ${diff.toFixed(0)} Pa` : `↓ Cần giảm ${Math.abs(diff).toFixed(0)} Pa`;
    ctx.fillText(status, gaugeX + gaugeWidth / 2, gaugeY + 130);
  };

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    if (!showTutorial) {
      drawCanvas();
    }
  }, [showTutorial, drawCanvas]);

  useEffect(() => {
    if (!showTutorial && gameState === 'playing') {
      drawCanvas();
    }
  }, [weights, liquidLevel, showTutorial, gameState, drawCanvas]);

  const addWeight = (mass) => {
    if (currentLevel.maxWeights && weights.length >= currentLevel.maxWeights) return;
    setWeights([...weights, mass]);
  };

  const removeLastWeight = () => {
    setWeights(weights.slice(0, -1));
  };

  const restartGame = () => {
    setLevel(1);
    setScore(0);
    setTimeElapsed(0);
    setGameState('playing');
    resetLevel();
  };

  const getBadge = () => {
    if (score >= 600) return { name: 'Bậc Thầy Áp Suất', class: 'gold' };
    if (score >= 400) return { name: 'Chuyên Gia Vật Lý', class: 'silver' };
    return { name: 'Nhà Thí Nghiệm', class: 'bronze' };
  };

  // Tutorial
  if (showTutorial) {
    return (
      <div className="pressure-master">
        <div className="pm-tutorial-overlay">
          <div className="pm-tutorial-card">
            <div className="pm-tutorial-icon">
              <Gauge size={40} />
            </div>
            <h2>Bậc Thầy Áp Suất</h2>
            <p className="pm-tutorial-subtitle">Khám phá công thức áp suất!</p>

            <div className="pm-tutorial-steps">
              <div className="pm-tutorial-step">
                <span className="pm-step-icon">⚖️</span>
                <div className="pm-step-content">
                  <strong>Áp suất chất rắn</strong>
                  <span>P = F/A (Lực chia diện tích)</span>
                </div>
              </div>
              <div className="pm-tutorial-step">
                <span className="pm-step-icon">💧</span>
                <div className="pm-step-content">
                  <strong>Áp suất chất lỏng</strong>
                  <span>P = ρgh (Mật độ × g × độ sâu)</span>
                </div>
              </div>
              <div className="pm-tutorial-step">
                <span className="pm-step-icon">🎯</span>
                <div className="pm-step-content">
                  <strong>Mục tiêu</strong>
                  <span>Điều chỉnh để đạt áp suất yêu cầu</span>
                </div>
              </div>
            </div>

            <button className="pm-start-btn" onClick={() => setShowTutorial(false)}>
              <Gauge size={20} />
              Bắt Đầu Thí Nghiệm
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Victory
  if (gameState === 'victory') {
    const badge = getBadge();
    return (
      <div className="pressure-master">
        <div className="pm-game-over">
          <Award size={80} className="pm-trophy" />
          <h2>🎉 Xuất Sắc!</h2>

          <div className="pm-final-stats">
            <div className="pm-final-stat">
              <div className="pm-final-stat-icon gold"><Star size={24} /></div>
              <div className="pm-final-stat-value">{score}</div>
              <div className="pm-final-stat-label">Tổng điểm</div>
            </div>
            <div className="pm-final-stat">
              <div className="pm-final-stat-icon green"><Target size={24} /></div>
              <div className="pm-final-stat-value">{levels.length}</div>
              <div className="pm-final-stat-label">Cấp hoàn thành</div>
            </div>
            <div className="pm-final-stat">
              <div className="pm-final-stat-icon blue"><Clock size={24} /></div>
              <div className="pm-final-stat-value">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</div>
              <div className="pm-final-stat-label">Thời gian</div>
            </div>
          </div>

          <div className="pm-achievement">
            <span className={`pm-badge ${badge.class}`}>🏆 {badge.name}</span>
          </div>

          <div className="pm-actions">
            <button className="pm-restart-btn" onClick={restartGame}>
              <RotateCcw size={18} />
              Chơi Lại
            </button>
            <button className="pm-menu-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
              Thoát
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pressure-master">
      {/* Header */}
      {!isPKMode && (
        <header className="pm-header">
          <button className="pm-back-btn" onClick={handleExit}>
            <ArrowLeft size={20} />
            <span>Thoát</span>
          </button>
          <div className="pm-title">
            <h1>⚗️ Bậc Thầy Áp Suất</h1>
          </div>
          <div className="pm-level-badge">Cấp {level}/{levels.length}</div>
        </header>
      )}

      <main className="pm-main">
        {/* Stats */}
        <div className="pm-stats-bar">
          <div className="pm-stat">
            <Star size={20} className="pm-stat-icon gold" />
            <div className="pm-stat-info">
              <span className="pm-stat-label">Điểm</span>
              <span className="pm-stat-value">{score}</span>
            </div>
          </div>
          <div className="pm-stat">
            <Clock size={20} className="pm-stat-icon blue" />
            <div className="pm-stat-info">
              <span className="pm-stat-label">Thời gian</span>
              <span className="pm-stat-value">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="pm-progress-container">
          <div className="pm-progress-bar">
            <div className="pm-progress-fill" style={{ width: `${(level / levels.length) * 100}%` }} />
          </div>
        </div>

        {/* Level Info */}
        <div className="pm-level-panel">
          <h3>{currentLevel.name}</h3>
          <p>{currentLevel.description}</p>
          <div className="pm-formula-badge">{currentLevel.formula}</div>
        </div>

        {/* Game Area */}
        <div className="pm-game-area">
          {/* Canvas */}
          <div className="pm-canvas-container">
            <canvas
              ref={canvasRef}
              className="pm-canvas"
              style={{ width: 500, height: 450 }}
            />
          </div>

          {/* Controls */}
          <div className="pm-controls">
            {(currentLevel.mode === 'solid' || currentLevel.mode === 'combined') && (
              <div className="pm-control-section">
                <h4><Weight size={18} /> Vật nặng</h4>
                <div className="pm-weight-buttons">
                  {availableWeights.map(w => (
                    <button
                      key={w}
                      className="pm-weight-btn"
                      onClick={() => addWeight(w)}
                      disabled={currentLevel.maxWeights && weights.length >= currentLevel.maxWeights}
                    >
                      +{w} kg
                    </button>
                  ))}
                </div>
                <button className="pm-remove-btn" onClick={removeLastWeight} disabled={weights.length === 0}>
                  Bỏ vật cuối
                </button>
                <div className="pm-weight-info">
                  Đã đặt: {weights.length}/{currentLevel.maxWeights || '∞'} vật
                  ({weights.reduce((s, w) => s + w, 0)} kg)
                </div>
              </div>
            )}

            {(currentLevel.mode === 'liquid' || currentLevel.mode === 'combined') && (
              <div className="pm-control-section">
                <h4><Droplets size={18} /> Mực nước</h4>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={liquidLevel}
                  onChange={(e) => setLiquidLevel(Number(e.target.value))}
                  className="pm-slider"
                />
                <div className="pm-slider-value">h = {(liquidLevel / 100).toFixed(2)} m</div>
              </div>
            )}

            <button className="pm-reset-btn" onClick={resetLevel}>
              <RotateCcw size={16} />
              Đặt lại
            </button>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`pm-feedback ${feedback.type}`}>
            <div className="pm-feedback-icon">
              {feedback.type === 'success' ? <Check size={24} /> : <X size={24} />}
            </div>
            <span className="pm-feedback-message">{feedback.message}</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default PressureMaster;

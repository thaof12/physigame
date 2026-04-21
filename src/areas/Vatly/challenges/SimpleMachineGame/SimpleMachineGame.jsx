import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, RotateCcw, Star, Target, Check, X, Wrench, Settings, Sliders } from 'lucide-react';
import './SimpleMachineGame.css';

const SimpleMachineGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [showTutorial, setShowTutorial] = useState(true);
  const [gameState, setGameState] = useState('playing');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState(null);

  // Machine settings
  const [leverArm1, setLeverArm1] = useState(50);
  const [leverArm2, setLeverArm2] = useState(50);
  const [pulleyCount, setPulleyCount] = useState(1);
  const [inclineAngle, setInclineAngle] = useState(30);

  const challenges = [
    {
      id: 1, type: 'lever',
      description: 'Dùng đòn bẩy nâng vật 100N',
      objectWeight: 100, targetForce: 50,
      icon: '⚖️', hint: 'F1 × d1 = F2 × d2'
    },
    {
      id: 2, type: 'pulley',
      description: 'Dùng ròng rọc kéo vật 120N',
      objectWeight: 120, targetForce: 60,
      icon: '🔄', hint: 'Lực giảm = Số ròng rọc'
    },
    {
      id: 3, type: 'incline',
      description: 'Đẩy vật 80N lên dốc',
      objectWeight: 80, targetForce: 40,
      icon: '📐', hint: 'F = P × sin(α)'
    },
    {
      id: 4, type: 'lever',
      description: 'Nâng vật nặng 200N',
      objectWeight: 200, targetForce: 50,
      icon: '⚖️', hint: 'Cánh tay đòn dài hơn = lực nhỏ hơn'
    },
    {
      id: 5, type: 'pulley',
      description: 'Kéo vật 150N bằng ròng rọc',
      objectWeight: 150, targetForce: 50,
      icon: '🔄', hint: '3 ròng rọc giảm lực 3 lần'
    },
    {
      id: 6, type: 'incline',
      description: 'Đẩy hòn đá 100N lên dốc',
      objectWeight: 100, targetForce: 50,
      icon: '📐', hint: 'Góc dốc càng nhỏ, lực càng nhỏ'
    },
    {
      id: 7, type: 'lever',
      description: 'Bẩy tảng đá 300N',
      objectWeight: 300, targetForce: 100,
      icon: '⚖️', hint: 'Tỉ lệ cánh tay đòn = 3:1'
    },
    {
      id: 8, type: 'pulley',
      description: 'Nâng thùng hàng 240N',
      objectWeight: 240, targetForce: 60,
      icon: '🔄', hint: 'Cần 4 ròng rọc'
    },
    {
      id: 9, type: 'incline',
      description: 'Đẩy xe 120N lên dốc',
      objectWeight: 120, targetForce: 60,
      icon: '📐', hint: 'sin(30°) = 0.5'
    },
    {
      id: 10, type: 'lever',
      description: 'Nâng vật cực nặng 400N',
      objectWeight: 400, targetForce: 80,
      icon: '⚖️', hint: 'Cần tỉ lệ 5:1'
    }
  ];

  useEffect(() => {
    if (level <= 10 && gameState === 'playing') {
      const challenge = challenges[level - 1];
      setCurrentChallenge(challenge);
      setFeedback(null);
      setLeverArm1(50);
      setLeverArm2(50);
      setPulleyCount(1);
      setInclineAngle(30);
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
    const centerY = height / 2;

    // Background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width / 2);
    bgGradient.addColorStop(0, '#1e3a5f');
    bgGradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= width; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i <= height; i += 30) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    if (currentChallenge.type === 'lever') {
      drawLever(ctx, width, height, centerX, centerY);
    } else if (currentChallenge.type === 'pulley') {
      drawPulley(ctx, width, height, centerX, centerY);
    } else if (currentChallenge.type === 'incline') {
      drawIncline(ctx, width, height, centerX, centerY);
    }

  }, [currentChallenge, leverArm1, leverArm2, pulleyCount, inclineAngle]);

  const drawLever = (ctx, width, height, centerX, centerY) => {
    const barWidth = width * 0.7;
    const barHeight = 12;
    const barY = centerY + 20;

    // Calculate fulcrum position based on arm lengths
    const totalArms = leverArm1 + leverArm2;
    const fulcrumX = centerX - (barWidth / 2) + (leverArm1 / totalArms) * barWidth;

    // Draw fulcrum (triangle)
    ctx.beginPath();
    ctx.moveTo(fulcrumX, barY + barHeight / 2);
    ctx.lineTo(fulcrumX - 25, barY + 60);
    ctx.lineTo(fulcrumX + 25, barY + 60);
    ctx.closePath();
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Calculate rotation angle based on arms
    const rotation = Math.atan2((leverArm2 - leverArm1) * 0.3, barWidth / 2);

    ctx.save();
    ctx.translate(fulcrumX, barY);
    ctx.rotate(rotation);

    // Draw lever bar
    const barGradient = ctx.createLinearGradient(-barWidth / 2, 0, barWidth / 2, 0);
    barGradient.addColorStop(0, '#8b5cf6');
    barGradient.addColorStop(1, '#6366f1');
    ctx.fillStyle = barGradient;
    ctx.beginPath();
    ctx.roundRect(-barWidth / 2, -barHeight / 2, barWidth, barHeight, 6);
    ctx.fill();

    // Left weight (your force)
    const leftX = -barWidth / 2 + 20;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.roundRect(leftX - 25, -50, 50, 35, 8);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?N', leftX, -32);

    // Right weight (object)
    const rightX = barWidth / 2 - 20;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(rightX - 25, -50, 50, 35, 8);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.fillText(`${currentChallenge.objectWeight}N`, rightX, -32);

    ctx.restore();

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`d1 = ${leverArm1}cm`, fulcrumX - (leverArm1 / totalArms) * barWidth / 2, barY + 80);
    ctx.fillText(`d2 = ${leverArm2}cm`, fulcrumX + (leverArm2 / totalArms) * barWidth / 2, barY + 80);
  };

  const drawPulley = (ctx, width, height, centerX, centerY) => {
    const pulleyRadius = 25;
    const spacing = 70;
    const startX = centerX - ((pulleyCount - 1) * spacing) / 2;

    // Draw rope
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);

    for (let i = 0; i < pulleyCount; i++) {
      const x = startX + i * spacing;
      const y = centerY - 40;

      // Pulley wheel glow
      ctx.beginPath();
      ctx.arc(x, y, pulleyRadius + 10, 0, Math.PI * 2);
      const glowGradient = ctx.createRadialGradient(x, y, pulleyRadius, x, y, pulleyRadius + 15);
      glowGradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
      glowGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // Pulley wheel
      ctx.beginPath();
      ctx.arc(x, y, pulleyRadius, 0, Math.PI * 2);
      const wheelGradient = ctx.createRadialGradient(x - 10, y - 10, 0, x, y, pulleyRadius);
      wheelGradient.addColorStop(0, '#c4b5fd');
      wheelGradient.addColorStop(1, '#7c3aed');
      ctx.fillStyle = wheelGradient;
      ctx.fill();
      ctx.strokeStyle = '#5b21b6';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#1e1b4b';
      ctx.fill();

      // Draw rope through pulley
      if (i < pulleyCount - 1) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x + pulleyRadius, y);
        ctx.lineTo(startX + (i + 1) * spacing - pulleyRadius, centerY - 40);
        ctx.stroke();
      }
    }

    // Draw weight
    const weightY = centerY + 60;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(centerX - 40, weightY, 80, 60, 12);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📦', centerX, weightY + 20);
    ctx.fillText(`${currentChallenge.objectWeight}N`, centerX, weightY + 45);

    // Draw rope to weight
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(startX + (pulleyCount - 1) * spacing, centerY - 40 + pulleyRadius);
    ctx.lineTo(centerX, weightY);
    ctx.stroke();

    // Pull direction arrow
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(startX - 30, centerY - 60);
    ctx.lineTo(startX - 30, centerY - 100);
    ctx.lineTo(startX - 50, centerY - 100);
    ctx.lineTo(startX - 20, centerY - 120);
    ctx.lineTo(startX + 10, centerY - 100);
    ctx.lineTo(startX - 10, centerY - 100);
    ctx.lineTo(startX - 10, centerY - 60);
    ctx.closePath();
    ctx.fill();

    // Pulley count label
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${pulleyCount} ròng rọc`, centerX, centerY - 90);
  };

  const drawIncline = (ctx, width, height, centerX, centerY) => {
    const inclineWidth = width * 0.6;
    const angleRad = (inclineAngle * Math.PI) / 180;
    const inclineHeight = inclineWidth * Math.tan(angleRad);

    const startX = centerX - inclineWidth / 2;
    const startY = centerY + 60;

    // Draw incline plane
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + inclineWidth, startY);
    ctx.lineTo(startX + inclineWidth, startY - inclineHeight);
    ctx.closePath();

    const planeGradient = ctx.createLinearGradient(startX, startY, startX + inclineWidth, startY - inclineHeight);
    planeGradient.addColorStop(0, '#475569');
    planeGradient.addColorStop(1, '#64748b');
    ctx.fillStyle = planeGradient;
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw object on incline
    const objectX = startX + inclineWidth * 0.4;
    const objectY = startY - (inclineWidth * 0.4) * Math.tan(angleRad) - 30;

    ctx.save();
    ctx.translate(objectX, objectY);
    ctx.rotate(-angleRad);

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(-30, -25, 60, 50, 8);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📦', 0, -5);
    ctx.fillText(`${currentChallenge.objectWeight}N`, 0, 15);

    ctx.restore();

    // Draw angle arc
    ctx.beginPath();
    ctx.arc(startX + inclineWidth, startY, 40, Math.PI, Math.PI + angleRad, true);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Angle label
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${inclineAngle}°`, startX + inclineWidth - 60, startY - 15);

    // Force arrows
    // Weight (down)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(objectX, objectY);
    ctx.lineTo(objectX, objectY + 50);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(objectX, objectY + 50);
    ctx.lineTo(objectX - 8, objectY + 42);
    ctx.lineTo(objectX + 8, objectY + 42);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.font = '12px system-ui';
    ctx.fillText('P', objectX + 15, objectY + 45);
  };

  useEffect(() => {
    drawCanvas();
    window.addEventListener('resize', drawCanvas);
    return () => window.removeEventListener('resize', drawCanvas);
  }, [drawCanvas]);

  const calculateForce = () => {
    if (!currentChallenge) return 0;

    switch (currentChallenge.type) {
      case 'lever':
        return (currentChallenge.objectWeight * leverArm2) / leverArm1;
      case 'pulley':
        return currentChallenge.objectWeight / pulleyCount;
      case 'incline':
        const angleRad = (inclineAngle * Math.PI) / 180;
        return currentChallenge.objectWeight * Math.sin(angleRad);
      default:
        return 0;
    }
  };

  const handleSubmit = () => {
    if (feedback || !currentChallenge) return;

    const calculatedForce = calculateForce();
    const targetForce = currentChallenge.targetForce;
    const tolerance = targetForce * 0.15;

    const isCorrect = Math.abs(calculatedForce - targetForce) <= tolerance;

    if (isCorrect) {
      const earnedPoints = 15;
      setScore(score + earnedPoints);
      setCorrectAnswers(correctAnswers + 1);
      setFeedback({
        correct: true,
        message: 'Chính xác! 🎉',
        points: earnedPoints,
        detail: `Lực cần: ${calculatedForce.toFixed(1)}N ≈ ${targetForce}N`
      });
    } else {
      setFeedback({
        correct: false,
        message: 'Chưa chính xác!',
        detail: `Lực hiện tại: ${calculatedForce.toFixed(1)}N, Cần: ${targetForce}N`
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

  const getFormula = () => {
    if (!currentChallenge) return '';
    switch (currentChallenge.type) {
      case 'lever': return 'F₁ × d₁ = F₂ × d₂';
      case 'pulley': return 'F = P ÷ n';
      case 'incline': return 'F = P × sin(α)';
      default: return '';
    }
  };

  const getMachineType = () => {
    if (!currentChallenge) return '';
    switch (currentChallenge.type) {
      case 'lever': return 'Đòn Bẩy';
      case 'pulley': return 'Ròng Rọc';
      case 'incline': return 'Mặt Phẳng Nghiêng';
      default: return '';
    }
  };

  const getBadge = () => {
    if (correctAnswers >= 9) return { icon: '🏆', text: 'Kỹ sư cơ khí bậc thầy', color: '#f59e0b' };
    if (correctAnswers >= 7) return { icon: '🥈', text: 'Chuyên gia máy cơ', color: '#94a3b8' };
    if (correctAnswers >= 5) return { icon: '🥉', text: 'Thợ máy giỏi', color: '#cd7f32' };
    return { icon: '🔧', text: 'Học viên chăm chỉ', color: '#06b6d4' };
  };

  if (!currentChallenge && gameState === 'playing') return null;

  return (
    <div className="sm-game">
      {/* Tutorial */}
      {showTutorial && (
        <div className="sm-tutorial-overlay">
          <div className="sm-tutorial-card">
            <div className="sm-tutorial-icon">
              <Wrench size={40} />
            </div>
            <h2>Máy Cơ Đơn Giản</h2>
            <p className="sm-tutorial-desc">
              Tìm hiểu cách máy cơ đơn giản giúp giảm lực cần thiết!
            </p>

            <div className="sm-tutorial-steps">
              <div className="sm-step">
                <div className="sm-step-icon">⚖️</div>
                <div className="sm-step-content">
                  <strong>Đòn bẩy</strong>
                  <span>F₁ × d₁ = F₂ × d₂</span>
                </div>
              </div>
              <div className="sm-step">
                <div className="sm-step-icon">🔄</div>
                <div className="sm-step-content">
                  <strong>Ròng rọc</strong>
                  <span>Lực = Trọng lượng ÷ Số ròng rọc</span>
                </div>
              </div>
              <div className="sm-step">
                <div className="sm-step-icon">📐</div>
                <div className="sm-step-content">
                  <strong>Mặt phẳng nghiêng</strong>
                  <span>F = P × sin(góc)</span>
                </div>
              </div>
            </div>

            <button className="sm-start-btn" onClick={() => setShowTutorial(false)}>
              <Wrench size={20} />
              Bắt đầu thử thách
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sm-header">
        <button className="sm-back-btn" onClick={() => navigate('/physics-games/grade/6')}>
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div className="sm-title">
          <Wrench size={28} className="sm-title-icon" />
          <h1>Máy Cơ Đơn Giản</h1>
        </div>
      </div>

      {gameState === 'playing' && currentChallenge && (
        <div className="sm-content">
          {/* Stats Bar */}
          <div className="sm-stats-bar">
            <div className="sm-stat">
              <Target size={20} />
              <div className="sm-stat-info">
                <span className="sm-stat-label">Câu hỏi</span>
                <span className="sm-stat-value">{level}/10</span>
              </div>
            </div>
            <div className="sm-stat">
              <Star size={20} />
              <div className="sm-stat-info">
                <span className="sm-stat-label">Điểm số</span>
                <span className="sm-stat-value">{score}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="sm-progress-container">
            <div className="sm-progress-bar">
              <div className="sm-progress-fill" style={{ width: `${(level / 10) * 100}%` }}></div>
            </div>
          </div>

          {/* Game Grid */}
          <div className="sm-game-grid">
            {/* Challenge Card */}
            <div className="sm-challenge-card">
              <div className="sm-machine-badge">
                <span className="sm-machine-icon">{currentChallenge.icon}</span>
                <span className="sm-machine-name">{getMachineType()}</span>
              </div>
              <p className="sm-challenge-desc">{currentChallenge.description}</p>
              <div className="sm-formula-box">
                <span className="sm-formula-label">💡 Công thức:</span>
                <span className="sm-formula">{getFormula()}</span>
              </div>
              <div className="sm-hint-box">
                <span className="sm-hint-label">Gợi ý:</span>
                <span className="sm-hint">{currentChallenge.hint}</span>
              </div>
            </div>

            {/* Canvas */}
            <div className="sm-canvas-card">
              <div className="sm-canvas-header">
                <Settings size={18} />
                <span>{getMachineType()}</span>
              </div>
              <div className="sm-canvas-wrapper">
                <canvas ref={canvasRef} className="sm-canvas" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="sm-controls-card">
            <div className="sm-controls-header">
              <Sliders size={18} />
              <span>Điều chỉnh thông số</span>
            </div>
            
            {currentChallenge.type === 'lever' && (
              <div className="sm-controls-grid">
                <div className="sm-control">
                  <label>Cánh tay 1 (bạn): <strong>{leverArm1}cm</strong></label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={leverArm1}
                    onChange={(e) => setLeverArm1(parseInt(e.target.value))}
                    className="sm-slider"
                  />
                </div>
                <div className="sm-control">
                  <label>Cánh tay 2 (vật): <strong>{leverArm2}cm</strong></label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={leverArm2}
                    onChange={(e) => setLeverArm2(parseInt(e.target.value))}
                    className="sm-slider"
                  />
                </div>
              </div>
            )}

            {currentChallenge.type === 'pulley' && (
              <div className="sm-controls-grid">
                <div className="sm-control">
                  <label>Số ròng rọc: <strong>{pulleyCount}</strong></label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={pulleyCount}
                    onChange={(e) => setPulleyCount(parseInt(e.target.value))}
                    className="sm-slider"
                  />
                </div>
              </div>
            )}

            {currentChallenge.type === 'incline' && (
              <div className="sm-controls-grid">
                <div className="sm-control">
                  <label>Góc nghiêng: <strong>{inclineAngle}°</strong></label>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={inclineAngle}
                    onChange={(e) => setInclineAngle(parseInt(e.target.value))}
                    className="sm-slider"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Force Result */}
          <div className="sm-result-card">
            <div className="sm-result-row">
              <span className="sm-result-label">Lực cần thiết:</span>
              <span className="sm-result-value">{calculateForce().toFixed(1)} N</span>
            </div>
            <div className="sm-result-row">
              <span className="sm-result-label">Mục tiêu:</span>
              <span className="sm-result-target">{currentChallenge.targetForce} N</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="sm-action-section">
            <button
              className="sm-submit-btn"
              onClick={handleSubmit}
              disabled={!!feedback}
            >
              <Check size={20} />
              Kiểm tra
            </button>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`sm-feedback ${feedback.correct ? 'sm-feedback-correct' : 'sm-feedback-wrong'}`}>
              <div className="sm-feedback-icon">
                {feedback.correct ? <Check size={32} /> : <X size={32} />}
              </div>
              <div className="sm-feedback-content">
                <h3>{feedback.message}</h3>
                {feedback.points && <span className="sm-feedback-points">+{feedback.points} điểm</span>}
                {feedback.detail && <p>{feedback.detail}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Game Over */}
      {gameState === 'gameOver' && (
        <div className="sm-game-over">
          <div className="sm-game-over-card">
            <div className="sm-trophy">
              <Award size={80} />
            </div>
            <h2>🎉 Hoàn thành!</h2>

            <div className="sm-final-stats">
              <div className="sm-final-stat">
                <Star size={24} />
                <div>
                  <span className="sm-final-label">Tổng điểm</span>
                  <span className="sm-final-value">{score}</span>
                </div>
              </div>
              <div className="sm-final-stat">
                <Check size={24} />
                <div>
                  <span className="sm-final-label">Trả lời đúng</span>
                  <span className="sm-final-value">{correctAnswers}/10</span>
                </div>
              </div>
              <div className="sm-final-stat">
                <Target size={24} />
                <div>
                  <span className="sm-final-label">Độ chính xác</span>
                  <span className="sm-final-value">{Math.round((correctAnswers / 10) * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="sm-badge" style={{ borderColor: getBadge().color }}>
              <span className="sm-badge-icon">{getBadge().icon}</span>
              <span className="sm-badge-text" style={{ color: getBadge().color }}>{getBadge().text}</span>
            </div>

            <div className="sm-game-over-actions">
              <button className="sm-restart-btn" onClick={handleRestart}>
                <RotateCcw size={20} />
                Chơi lại
              </button>
              <button className="sm-home-btn" onClick={() => navigate('/physics-games/grade/6')}>
                Về danh sách game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMachineGame;

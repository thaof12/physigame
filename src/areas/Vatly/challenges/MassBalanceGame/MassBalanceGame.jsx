import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, RotateCcw, Scale, Target, Clock, Star, Check, X, Plus, Minus } from 'lucide-react';
import './MassBalanceGame.css';

const MassBalanceGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  
  // Game state
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [leftMass, setLeftMass] = useState(0);
  const [rightMass, setRightMass] = useState(0);
  const [targetMass, setTargetMass] = useState(0);
  const [availableWeights, setAvailableWeights] = useState([]);
  const [placedWeights, setPlacedWeights] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [tiltAngle, setTiltAngle] = useState(0);

  const weights = [1, 2, 5, 10, 20, 50, 100, 200, 500];
  const weightColors = {
    1: '#94a3b8', 2: '#64748b', 5: '#475569',
    10: '#22c55e', 20: '#16a34a', 50: '#15803d',
    100: '#3b82f6', 200: '#2563eb', 500: '#1d4ed8'
  };

  const generateLevel = useCallback(() => {
    const minMass = 50 + level * 30;
    const maxMass = 100 + level * 50;
    const target = Math.floor(Math.random() * (maxMass - minMass)) + minMass;
    setTargetMass(target);
    setRightMass(target);
    setLeftMass(0);
    setPlacedWeights([]);
    
    // Generate available weights
    const available = [];
    let remaining = target;
    const usedWeights = [];
    
    while (remaining > 0 && usedWeights.length < 6) {
      const possibleWeights = weights.filter(w => w <= remaining);
      if (possibleWeights.length === 0) break;
      const w = possibleWeights[Math.floor(Math.random() * possibleWeights.length)];
      usedWeights.push(w);
      remaining -= w;
    }
    
    usedWeights.forEach((w, i) => {
      available.push({ id: Date.now() + i, value: w });
    });
    
    const extraCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < extraCount; i++) {
      const weight = weights[Math.floor(Math.random() * weights.length)];
      available.push({ id: Date.now() + 100 + i, value: weight });
    }
    
    available.sort(() => Math.random() - 0.5);
    setAvailableWeights(available);
    setFeedback(null);
    setTimeLeft(60);
  }, [level]);

  useEffect(() => {
    generateLevel();
  }, [generateLevel]);

  // Animate tilt angle
  useEffect(() => {
    const targetAngle = Math.min(Math.max((leftMass - rightMass) / 20, -18), 18);
    const animateAngle = () => {
      setTiltAngle(prev => {
        const diff = targetAngle - prev;
        if (Math.abs(diff) < 0.5) return targetAngle;
        return prev + diff * 0.15;
      });
    };
    const interval = setInterval(animateAngle, 16);
    return () => clearInterval(interval);
  }, [leftMass, rightMass]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !feedback && !gameOver && !showTutorial) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !feedback) {
      handleTimeout();
    }
  }, [timeLeft, feedback, gameOver, showTutorial]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = 600;
    const height = 300;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    
    // Clear
    ctx.clearRect(0, 0, width, height);
    
    // Draw stand base
    const baseGradient = ctx.createLinearGradient(250, 260, 350, 260);
    baseGradient.addColorStop(0, '#64748b');
    baseGradient.addColorStop(0.5, '#94a3b8');
    baseGradient.addColorStop(1, '#64748b');
    
    ctx.fillStyle = baseGradient;
    ctx.beginPath();
    ctx.moveTo(220, 280);
    ctx.lineTo(380, 280);
    ctx.lineTo(360, 260);
    ctx.lineTo(240, 260);
    ctx.closePath();
    ctx.fill();
    
    // Draw stand pole
    const poleGradient = ctx.createLinearGradient(290, 100, 310, 100);
    poleGradient.addColorStop(0, '#475569');
    poleGradient.addColorStop(0.5, '#64748b');
    poleGradient.addColorStop(1, '#475569');
    
    ctx.fillStyle = poleGradient;
    ctx.fillRect(295, 100, 10, 160);
    
    // Draw pivot point
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(300, 100, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(300, 100, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Save context for rotation
    ctx.save();
    ctx.translate(300, 100);
    ctx.rotate((tiltAngle * Math.PI) / 180);
    
    // Draw beam
    const beamGradient = ctx.createLinearGradient(-200, 0, 200, 0);
    beamGradient.addColorStop(0, '#854d0e');
    beamGradient.addColorStop(0.5, '#a16207');
    beamGradient.addColorStop(1, '#854d0e');
    
    ctx.fillStyle = beamGradient;
    ctx.beginPath();
    ctx.roundRect(-200, -8, 400, 16, 4);
    ctx.fill();
    
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw chains/ropes
    ctx.strokeStyle = '#78716c';
    ctx.lineWidth = 3;
    
    // Left chain
    ctx.beginPath();
    ctx.moveTo(-180, 8);
    ctx.lineTo(-180, 60);
    ctx.stroke();
    
    // Right chain
    ctx.beginPath();
    ctx.moveTo(180, 8);
    ctx.lineTo(180, 60);
    ctx.stroke();
    
    // Draw left plate (player side)
    const leftPlateY = 60;
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(-180, leftPlateY + 20, 70, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Plate rim
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-180, leftPlateY + 10, 68, 12, 0, 0, Math.PI);
    ctx.stroke();
    
    // Draw weights on left plate
    let weightY = leftPlateY;
    const sortedWeights = [...placedWeights].sort((a, b) => b.value - a.value);
    sortedWeights.forEach((w, i) => {
      const size = Math.min(25, 10 + w.value / 20);
      const yPos = weightY - size / 2 - i * (size * 0.7);
      
      ctx.fillStyle = weightColors[w.value] || '#6b7280';
      ctx.beginPath();
      ctx.roundRect(-180 - size/2 + (i % 2) * 10 - 5, yPos, size, size * 0.8, 4);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.fillStyle = 'white';
      ctx.font = `bold ${Math.min(10, size * 0.5)}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${w.value}`, -180 + (i % 2) * 10 - 5, yPos + size * 0.4);
    });
    
    // Left mass label
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${leftMass}g`, -180, leftPlateY + 50);
    
    ctx.fillStyle = '#64748b';
    ctx.font = '11px system-ui';
    ctx.fillText('Quả cân', -180, leftPlateY + 65);
    
    // Draw right plate (target side)
    const rightPlateY = 60;
    
    // Target object gradient
    const targetGradient = ctx.createRadialGradient(180, rightPlateY - 20, 5, 180, rightPlateY - 20, 40);
    targetGradient.addColorStop(0, '#fbbf24');
    targetGradient.addColorStop(1, '#f59e0b');
    
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(180, rightPlateY + 20, 70, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Plate rim
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(180, rightPlateY + 10, 68, 12, 0, 0, Math.PI);
    ctx.stroke();
    
    // Draw target object
    ctx.fillStyle = targetGradient;
    ctx.beginPath();
    ctx.roundRect(150, rightPlateY - 35, 60, 40, 8);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Target icon
    ctx.font = '24px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎯', 180, rightPlateY - 15);
    
    // Right mass label
    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${rightMass}g`, 180, rightPlateY + 50);
    
    ctx.fillStyle = '#b45309';
    ctx.font = '11px system-ui';
    ctx.fillText('Vật cần đo', 180, rightPlateY + 65);
    
    ctx.restore();
    
    // Balance indicator
    const isBalanced = Math.abs(leftMass - rightMass) < 1;
    if (isBalanced && leftMass > 0) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('✓ CÂN BẰNG!', 300, 40);
    } else if (leftMass > 0) {
      const diff = leftMass - rightMass;
      ctx.fillStyle = diff > 0 ? '#ef4444' : '#3b82f6';
      ctx.font = '13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(diff > 0 ? `Thừa ${diff}g` : `Thiếu ${Math.abs(diff)}g`, 300, 40);
    }
    
  }, [tiltAngle, leftMass, rightMass, placedWeights]);

  const handleTimeout = () => {
    setFeedback({ correct: false, message: 'Hết giờ! ⏰', detail: `Đáp án đúng: ${targetMass}g` });
    setTimeout(() => moveToNext(), 2500);
  };

  const handleAddWeight = (weight) => {
    if (feedback) return;
    
    setLeftMass(prev => prev + weight.value);
    setPlacedWeights(prev => [...prev, weight]);
    setAvailableWeights(prev => prev.filter(w => w.id !== weight.id));
  };

  const handleRemoveWeight = (weight) => {
    if (feedback) return;
    
    setLeftMass(prev => Math.max(0, prev - weight.value));
    setPlacedWeights(prev => prev.filter(w => w.id !== weight.id));
    setAvailableWeights(prev => [...prev, weight]);
  };

  const moveToNext = () => {
    if (level < 10) {
      setLevel(level + 1);
    } else {
      setGameOver(true);
    }
  };

  const handleCheck = () => {
    if (feedback) return;
    
    const isBalanced = Math.abs(leftMass - rightMass) < 1;
    
    if (isBalanced) {
      const timeBonus = Math.ceil(timeLeft / 6);
      const earnedPoints = 10 + level * 2 + timeBonus;
      setScore(score + earnedPoints);
      setCorrectAnswers(correctAnswers + 1);
      setFeedback({ 
        correct: true, 
        message: 'Cân bằng hoàn hảo! 🎯', 
        detail: `+${earnedPoints} điểm` 
      });
      setTimeout(() => moveToNext(), 2500);
    } else {
      const diff = Math.abs(leftMass - rightMass);
      setFeedback({ 
        correct: false, 
        message: 'Chưa cân bằng!',
        detail: `Chênh lệch: ${diff}g`
      });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleRestart = () => {
    setScore(0);
    setLevel(1);
    setCorrectAnswers(0);
    setGameOver(false);
    setShowTutorial(false);
    generateLevel();
  };

  const isBalanced = Math.abs(leftMass - rightMass) < 1;

  return (
    <div className="mass-balance-game">
      {/* Tutorial */}
      {showTutorial && (
        <div className="mb-tutorial-overlay">
          <div className="mb-tutorial-card">
            <div className="mb-tutorial-icon">
              <Scale size={48} />
            </div>
            <h2>Cân Bằng Khối Lượng</h2>
            <p className="mb-tutorial-subtitle">Học cách sử dụng cân đĩa</p>
            
            <div className="mb-tutorial-steps">
              <div className="mb-tutorial-step">
                <div className="mb-step-icon">1</div>
                <div className="mb-step-content">
                  <strong>Xác định mục tiêu</strong>
                  <span>Nhìn vật thể trên đĩa phải cần cân bằng</span>
                </div>
              </div>
              <div className="mb-tutorial-step">
                <div className="mb-step-icon">2</div>
                <div className="mb-step-content">
                  <strong>Chọn quả cân</strong>
                  <span>Click để đặt quả cân lên đĩa trái</span>
                </div>
              </div>
              <div className="mb-tutorial-step">
                <div className="mb-step-icon">3</div>
                <div className="mb-step-content">
                  <strong>Điều chỉnh</strong>
                  <span>Click quả cân đã đặt để gỡ xuống</span>
                </div>
              </div>
            </div>
            
            <div className="mb-tutorial-tip">
              💡 Khi cân thăng bằng, nhấn Kiểm tra!
            </div>
            
            <button onClick={() => setShowTutorial(false)} className="mb-start-btn">
              Bắt đầu chơi
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-header">
        <button onClick={() => navigate('/physics-games/grade/6')} className="mb-back-btn">
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div className="mb-title">
          <Scale size={28} />
          <h1>Cân Bằng Khối Lượng</h1>
        </div>
        <div className="mb-level-badge">
          Câu {level}/10
        </div>
      </header>

      {!gameOver ? (
        <main className="mb-main">
          {/* Stats Bar */}
          <div className="mb-stats-bar">
            <div className="mb-stat">
              <Star className="mb-stat-icon gold" size={20} />
              <div className="mb-stat-info">
                <span className="mb-stat-label">Điểm</span>
                <span className="mb-stat-value">{score}</span>
              </div>
            </div>
            <div className="mb-stat">
              <Target className="mb-stat-icon orange" size={20} />
              <div className="mb-stat-info">
                <span className="mb-stat-label">Mục tiêu</span>
                <span className="mb-stat-value">{targetMass}g</span>
              </div>
            </div>
            <div className="mb-stat">
              <Clock className={`mb-stat-icon ${timeLeft < 15 ? 'red pulse' : 'blue'}`} size={20} />
              <div className="mb-stat-info">
                <span className="mb-stat-label">Thời gian</span>
                <span className={`mb-stat-value ${timeLeft < 15 ? 'warning' : ''}`}>{timeLeft}s</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-progress-container">
            <div className="mb-progress-bar">
              <div className="mb-progress-fill" style={{ width: `${(level / 10) * 100}%` }}></div>
            </div>
          </div>

          {/* Canvas Balance */}
          <div className="mb-canvas-container">
            <canvas ref={canvasRef} className="mb-canvas" />
          </div>

          {/* Weights Selection */}
          <div className="mb-weights-section">
            <div className="mb-weights-panel">
              <h3>
                <Plus size={18} />
                Quả cân có sẵn
              </h3>
              <div className="mb-weights-grid">
                {availableWeights.map(weight => (
                  <button
                    key={weight.id}
                    className="mb-weight-btn"
                    onClick={() => handleAddWeight(weight)}
                    disabled={!!feedback}
                    style={{ '--weight-color': weightColors[weight.value] }}
                  >
                    <div className="mb-weight-visual"></div>
                    <span>{weight.value}g</span>
                  </button>
                ))}
                {availableWeights.length === 0 && (
                  <div className="mb-empty-hint">Đã dùng hết quả cân</div>
                )}
              </div>
            </div>

            <div className="mb-weights-panel placed">
              <h3>
                <Minus size={18} />
                Đã đặt lên cân ({leftMass}g)
              </h3>
              <div className="mb-weights-grid">
                {placedWeights.map(weight => (
                  <button
                    key={weight.id}
                    className="mb-weight-btn placed"
                    onClick={() => handleRemoveWeight(weight)}
                    disabled={!!feedback}
                    style={{ '--weight-color': weightColors[weight.value] }}
                  >
                    <div className="mb-weight-visual"></div>
                    <span>{weight.value}g</span>
                    <X size={14} className="mb-remove-icon" />
                  </button>
                ))}
                {placedWeights.length === 0 && (
                  <div className="mb-empty-hint">Chưa đặt quả cân nào</div>
                )}
              </div>
            </div>
          </div>

          {/* Check Button */}
          <button 
            className={`mb-check-btn ${isBalanced ? 'balanced' : ''}`}
            onClick={handleCheck}
            disabled={!!feedback || leftMass === 0}
          >
            <Check size={22} />
            {isBalanced ? 'Xác nhận cân bằng!' : 'Kiểm tra'}
          </button>

          {/* Feedback */}
          {feedback && (
            <div className={`mb-feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
              <div className="mb-feedback-icon">
                {feedback.correct ? <Check size={32} /> : <X size={32} />}
              </div>
              <div className="mb-feedback-content">
                <div className="mb-feedback-message">{feedback.message}</div>
                <div className="mb-feedback-detail">{feedback.detail}</div>
              </div>
            </div>
          )}
        </main>
      ) : (
        <div className="mb-game-over">
          <div className="mb-trophy">
            <Award size={80} />
          </div>
          <h2>Hoàn thành! 🎉</h2>
          
          <div className="mb-final-stats">
            <div className="mb-final-stat">
              <div className="mb-final-stat-icon gold">
                <Star size={24} />
              </div>
              <div className="mb-final-stat-value">{score}</div>
              <div className="mb-final-stat-label">Tổng điểm</div>
            </div>
            <div className="mb-final-stat">
              <div className="mb-final-stat-icon green">
                <Target size={24} />
              </div>
              <div className="mb-final-stat-value">{correctAnswers}/10</div>
              <div className="mb-final-stat-label">Trả lời đúng</div>
            </div>
            <div className="mb-final-stat">
              <div className="mb-final-stat-icon blue">
                <Scale size={24} />
              </div>
              <div className="mb-final-stat-value">{Math.round((correctAnswers / 10) * 100)}%</div>
              <div className="mb-final-stat-label">Độ chính xác</div>
            </div>
          </div>

          <div className="mb-achievement">
            {correctAnswers >= 9 && <div className="mb-badge gold">🏆 Bậc thầy cân đo!</div>}
            {correctAnswers >= 7 && correctAnswers < 9 && <div className="mb-badge silver">🥈 Rất giỏi!</div>}
            {correctAnswers >= 5 && correctAnswers < 7 && <div className="mb-badge bronze">🥉 Khá tốt!</div>}
            {correctAnswers < 5 && <div className="mb-badge">💪 Tiếp tục cố gắng!</div>}
          </div>

          <div className="mb-actions">
            <button onClick={handleRestart} className="mb-restart-btn">
              <RotateCcw size={20} />
              Chơi lại
            </button>
            <button onClick={() => navigate('/physics-games/grade/6')} className="mb-menu-btn">
              Về danh sách
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MassBalanceGame;

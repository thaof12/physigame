import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, RotateCcw, Flame, Star, Target, Check, X, Zap, Snowflake } from 'lucide-react';
import './ThermalExpansionGame.css';

const ThermalExpansionGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [temperature, setTemperature] = useState(20);
  const [feedback, setFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isHeating, setIsHeating] = useState(false);

  const challenges = [
    {
      id: 1,
      material: 'Dây điện đồng',
      icon: '🔌',
      type: 'metal',
      minTemp: 20,
      maxTemp: 100,
      targetTemp: 80,
      expansionRate: 0.017,
      hint: 'Kim loại giãn nở khi nhiệt độ tăng',
      description: 'Quan sát dây đồng giãn nở khi đun nóng',
      color: '#d97706'
    },
    {
      id: 2,
      material: 'Dải sắt',
      icon: '🔩',
      type: 'metal',
      minTemp: 20,
      maxTemp: 120,
      targetTemp: 90,
      expansionRate: 0.012,
      hint: 'Sắt giãn nở ít hơn đồng',
      description: 'Đun nóng thanh sắt',
      color: '#6b7280'
    },
    {
      id: 3,
      material: 'Bóng bay',
      icon: '🎈',
      type: 'gas',
      minTemp: 10,
      maxTemp: 60,
      targetTemp: 45,
      expansionRate: 0.04,
      hint: 'Khí giãn nở mạnh nhất',
      description: 'Bóng bay phồng lên khi nóng',
      color: '#ef4444'
    },
    {
      id: 4,
      material: 'Nước trong bình',
      icon: '💧',
      type: 'liquid',
      minTemp: 10,
      maxTemp: 80,
      targetTemp: 60,
      expansionRate: 0.021,
      hint: 'Chất lỏng giãn nở vừa phải',
      description: 'Mực nước dâng cao khi đun',
      color: '#3b82f6'
    },
    {
      id: 5,
      material: 'Thanh nhôm',
      icon: '🪙',
      type: 'metal',
      minTemp: 20,
      maxTemp: 150,
      targetTemp: 100,
      expansionRate: 0.024,
      hint: 'Nhôm giãn nở nhiều hơn sắt',
      description: 'Thanh nhôm giãn dài',
      color: '#94a3b8'
    },
    {
      id: 6,
      material: 'Hơi nước',
      icon: '♨️',
      type: 'gas',
      minTemp: 100,
      maxTemp: 200,
      targetTemp: 150,
      expansionRate: 0.05,
      hint: 'Hơi nước giãn nở rất mạnh',
      description: 'Hơi nước thoát ra khi đun sôi',
      color: '#e5e7eb'
    },
    {
      id: 7,
      material: 'Dầu ăn',
      icon: '🛢️',
      type: 'liquid',
      minTemp: 20,
      maxTemp: 120,
      targetTemp: 80,
      expansionRate: 0.028,
      hint: 'Dầu giãn nở nhiều hơn nước',
      description: 'Dầu nở ra khi nhiệt độ tăng',
      color: '#fbbf24'
    },
    {
      id: 8,
      material: 'Đường ray xe lửa',
      icon: '🛤️',
      type: 'metal',
      minTemp: 20,
      maxTemp: 60,
      targetTemp: 45,
      expansionRate: 0.012,
      hint: 'Ray giãn nở nên có khe hở',
      description: 'Quan sát khe hở trên ray',
      color: '#475569'
    },
    {
      id: 9,
      material: 'Không khí trong lốp xe',
      icon: '🚗',
      type: 'gas',
      minTemp: 20,
      maxTemp: 70,
      targetTemp: 55,
      expansionRate: 0.037,
      hint: 'Áp suất lốp tăng khi nóng',
      description: 'Không khí giãn nở trong lốp',
      color: '#1f2937'
    },
    {
      id: 10,
      material: 'Thuỷ ngân trong nhiệt kế',
      icon: '🌡️',
      type: 'liquid',
      minTemp: 0,
      maxTemp: 100,
      targetTemp: 70,
      expansionRate: 0.018,
      hint: 'Thuỷ ngân giãn nở đều',
      description: 'Cột thuỷ ngân dâng lên',
      color: '#9ca3af'
    }
  ];

  const calculateSize = useCallback(() => {
    if (!currentChallenge) return 100;
    const tempDiff = temperature - currentChallenge.minTemp;
    const expansion = tempDiff * currentChallenge.expansionRate;
    return 100 + expansion;
  }, [currentChallenge, temperature]);

  const drawVisualization = useCallback(() => {
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

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const bgGrad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, height/2);
    bgGrad.addColorStop(0, 'rgba(249, 115, 22, 0.1)');
    bgGrad.addColorStop(1, 'rgba(30, 41, 59, 0.3)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const size = calculateSize();
    const centerX = width / 2;
    const centerY = height / 2;

    if (currentChallenge.type === 'metal') {
      // Draw metal bar
      const barWidth = (width - 80) * (size / 100);
      const barHeight = 50;
      const barY = centerY - barHeight / 2;
      const barX = 40;

      // Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 5;

      // Bar gradient
      const barGrad = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
      barGrad.addColorStop(0, shadeColor(currentChallenge.color, 30));
      barGrad.addColorStop(0.5, currentChallenge.color);
      barGrad.addColorStop(1, shadeColor(currentChallenge.color, -30));

      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth, barHeight, 10);
      ctx.fillStyle = barGrad;
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Reference line at 100%
      const refWidth = (width - 80);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(40 + refWidth, barY - 20);
      ctx.lineTo(40 + refWidth, barY + barHeight + 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Labels
      ctx.font = 'bold 14px system-ui';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText('100%', 40 + refWidth, barY - 30);
      ctx.fillStyle = '#f97316';
      ctx.fillText(`${size.toFixed(1)}%`, barX + barWidth / 2, barY + barHeight + 30);

      // Icon
      ctx.font = '40px Arial';
      ctx.fillText(currentChallenge.icon, centerX, 40);

    } else if (currentChallenge.type === 'gas') {
      // Draw balloon/gas
      const baseRadius = 60;
      const radius = baseRadius * (size / 100);

      // Glow
      ctx.shadowColor = currentChallenge.color;
      ctx.shadowBlur = 30;

      // Balloon gradient
      const balloonGrad = ctx.createRadialGradient(
        centerX - radius/3, centerY - radius/3, 0,
        centerX, centerY, radius
      );
      balloonGrad.addColorStop(0, shadeColor(currentChallenge.color, 40));
      balloonGrad.addColorStop(0.7, currentChallenge.color);
      balloonGrad.addColorStop(1, shadeColor(currentChallenge.color, -30));

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = balloonGrad;
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Particles inside
      const particleCount = Math.floor(size / 15);
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + Date.now() / 1000;
        const dist = Math.random() * radius * 0.7;
        const px = centerX + Math.cos(angle) * dist;
        const py = centerY + Math.sin(angle) * dist;
        
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
      }

      // Icon
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(currentChallenge.icon, centerX, centerY + 10);

      // Size label
      ctx.font = 'bold 16px system-ui';
      ctx.fillStyle = '#f97316';
      ctx.fillText(`${size.toFixed(1)}%`, centerX, centerY + radius + 40);

    } else if (currentChallenge.type === 'liquid') {
      // Draw beaker
      const beakerWidth = 100;
      const beakerHeight = 180;
      const beakerX = centerX - beakerWidth / 2;
      const beakerY = centerY - beakerHeight / 2;

      // Beaker outline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(beakerX, beakerY);
      ctx.lineTo(beakerX, beakerY + beakerHeight);
      ctx.lineTo(beakerX + beakerWidth, beakerY + beakerHeight);
      ctx.lineTo(beakerX + beakerWidth, beakerY);
      ctx.stroke();

      // Liquid level
      const liquidHeight = beakerHeight * (size / 130);
      const liquidY = beakerY + beakerHeight - liquidHeight;

      const liquidGrad = ctx.createLinearGradient(beakerX, liquidY, beakerX, beakerY + beakerHeight);
      liquidGrad.addColorStop(0, shadeColor(currentChallenge.color, 20));
      liquidGrad.addColorStop(1, currentChallenge.color);

      ctx.fillStyle = liquidGrad;
      ctx.fillRect(beakerX + 3, liquidY, beakerWidth - 6, liquidHeight - 3);

      // Surface highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(beakerX + 3, liquidY, beakerWidth - 6, 5);

      // Scale marks
      ctx.font = '11px system-ui';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.textAlign = 'left';
      for (let i = 0; i <= 4; i++) {
        const markY = beakerY + (beakerHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(beakerX + beakerWidth + 5, markY);
        ctx.lineTo(beakerX + beakerWidth + 15, markY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillText(`${100 - i * 25}%`, beakerX + beakerWidth + 20, markY + 4);
      }

      // Icon
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(currentChallenge.icon, centerX, beakerY - 20);

      // Size label
      ctx.font = 'bold 16px system-ui';
      ctx.fillStyle = '#f97316';
      ctx.fillText(`${size.toFixed(1)}%`, centerX, beakerY + beakerHeight + 35);
    }

    // Draw heat indicator if heating
    if (isHeating) {
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      const flameY = height - 30;
      ctx.fillText('🔥', centerX - 40, flameY);
      ctx.fillText('🔥', centerX, flameY);
      ctx.fillText('🔥', centerX + 40, flameY);
    }

  }, [currentChallenge, temperature, calculateSize, isHeating]);

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
    setTemperature(challenge.minTemp);
    setFeedback(null);
    setIsHeating(false);
  };

  useEffect(() => {
    if (level <= 10 && !gameOver && !showTutorial) {
      generateChallenge();
    }
  }, [level, showTutorial]);

  useEffect(() => {
    drawVisualization();
  }, [currentChallenge, temperature, isHeating, drawVisualization]);

  useEffect(() => {
    if (isHeating && currentChallenge && temperature < currentChallenge.maxTemp && !feedback) {
      const timer = setTimeout(() => {
        setTemperature(Math.min(temperature + 1, currentChallenge.maxTemp));
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isHeating, temperature, feedback, currentChallenge]);

  const handleHeating = () => {
    setIsHeating(!isHeating);
  };

  const handleCooling = () => {
    if (currentChallenge && temperature > currentChallenge.minTemp) {
      setTemperature(Math.max(temperature - 5, currentChallenge.minTemp));
    }
  };

  const handleSubmit = () => {
    if (feedback || !currentChallenge) return;

    const targetTemp = currentChallenge.targetTemp;
    const tolerance = 5;
    const isCorrect = Math.abs(temperature - targetTemp) <= tolerance;

    if (isCorrect) {
      const earnedPoints = 15;
      setScore(score + earnedPoints);
      setCorrectAnswers(correctAnswers + 1);
      setFeedback({
        correct: true,
        message: 'Chính xác!',
        points: earnedPoints,
        detail: `Nhiệt độ: ${temperature}°C ≈ ${targetTemp}°C`
      });
    } else {
      setFeedback({
        correct: false,
        message: 'Chưa chính xác!',
        detail: `Nhiệt độ cần: ${targetTemp}°C (±${tolerance}°C)`
      });
    }

    setIsHeating(false);

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

  const getExpansionPercentage = () => {
    if (!currentChallenge) return 0;
    const range = currentChallenge.maxTemp - currentChallenge.minTemp;
    const current = temperature - currentChallenge.minTemp;
    return (current / range) * 100;
  };

  const getBadge = () => {
    if (correctAnswers >= 9) return { icon: '🏆', text: 'Chuyên gia nhiệt học!', color: '#fbbf24' };
    if (correctAnswers >= 7) return { icon: '🥈', text: 'Rất tốt!', color: '#94a3b8' };
    if (correctAnswers >= 5) return { icon: '🥉', text: 'Khá tốt!', color: '#cd7f32' };
    return { icon: '📚', text: 'Cần luyện tập thêm!', color: '#3b82f6' };
  };

  return (
    <div className="te-game">
      {/* Tutorial */}
      {showTutorial && (
        <div className="te-tutorial-overlay">
          <div className="te-tutorial-card">
            <div className="te-tutorial-icon">
              <Flame size={40} />
            </div>
            <h2>Sự Nở Vì Nhiệt</h2>
            <p className="te-tutorial-desc">
              Khám phá hiện tượng giãn nở nhiệt của các chất khi thay đổi nhiệt độ
            </p>
            <div className="te-tutorial-steps">
              <div className="te-step">
                <span className="te-step-num">1</span>
                <div className="te-step-content">
                  <strong>Giãn nở nhiệt</strong>
                  <span>Vật chất nở ra khi nhiệt độ tăng</span>
                </div>
              </div>
              <div className="te-step">
                <span className="te-step-num">2</span>
                <div className="te-step-content">
                  <strong>Thứ tự giãn nở</strong>
                  <span>Khí {'>'} Lỏng {'>'} Rắn</span>
                </div>
              </div>
              <div className="te-step">
                <span className="te-step-num">3</span>
                <div className="te-step-content">
                  <strong>Điều khiển</strong>
                  <span>Đun nóng/làm lạnh để đạt nhiệt độ mục tiêu</span>
                </div>
              </div>
            </div>
            <button onClick={() => setShowTutorial(false)} className="te-start-btn">
              <Zap size={20} />
              Bắt đầu thí nghiệm
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="te-header">
        <button onClick={() => navigate('/physics-games/grade/6')} className="te-back-btn">
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div className="te-title">
          <Flame size={28} className="te-title-icon" />
          <h1>Sự Nở Vì Nhiệt</h1>
        </div>
        <div className="te-placeholder"></div>
      </header>

      {!gameOver ? (
        <div className="te-content">
          {/* Stats */}
          <div className="te-stats-bar">
            <div className="te-stat">
              <Target size={20} />
              <div className="te-stat-info">
                <span className="te-stat-label">Thí nghiệm</span>
                <span className="te-stat-value">{level}/10</span>
              </div>
            </div>
            <div className="te-stat">
              <Star size={20} />
              <div className="te-stat-info">
                <span className="te-stat-label">Điểm số</span>
                <span className="te-stat-value">{score}</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="te-progress-container">
            <div className="te-progress-bar">
              <div className="te-progress-fill" style={{ width: `${(level / 10) * 100}%` }}></div>
            </div>
          </div>

          {currentChallenge && (
            <>
              {/* Game Grid */}
              <div className="te-game-grid">
                {/* Challenge Info */}
                <div className="te-challenge-card">
                  <div className="te-material-badge">
                    <span className="te-material-icon">{currentChallenge.icon}</span>
                    <div className="te-material-info">
                      <span className="te-material-name">{currentChallenge.material}</span>
                      <span className="te-material-type">
                        {currentChallenge.type === 'metal' && 'Chất rắn'}
                        {currentChallenge.type === 'liquid' && 'Chất lỏng'}
                        {currentChallenge.type === 'gas' && 'Chất khí'}
                      </span>
                    </div>
                  </div>
                  <p className="te-challenge-desc">{currentChallenge.description}</p>
                  
                  <div className="te-hint-box">
                    <span className="te-hint-icon">💡</span>
                    <span className="te-hint-text">{currentChallenge.hint}</span>
                  </div>

                  <div className="te-target-box">
                    <span className="te-target-label">Nhiệt độ mục tiêu:</span>
                    <span className="te-target-value">{currentChallenge.targetTemp}°C (±5°C)</span>
                  </div>

                  {/* Temperature Display */}
                  <div className="te-temp-display">
                    <div className="te-temp-value">{temperature}°C</div>
                    <div className="te-temp-bar">
                      <div 
                        className="te-temp-fill"
                        style={{ 
                          width: `${getExpansionPercentage()}%`,
                          background: `linear-gradient(90deg, #3b82f6, #f97316)`
                        }}
                      ></div>
                    </div>
                    <div className="te-temp-range">
                      <span>{currentChallenge.minTemp}°C</span>
                      <span>{currentChallenge.maxTemp}°C</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="te-controls">
                    <button 
                      onClick={handleHeating}
                      className={`te-control-btn te-heat-btn ${isHeating ? 'active' : ''}`}
                      disabled={!!feedback || temperature >= currentChallenge.maxTemp}
                    >
                      <Flame size={18} />
                      {isHeating ? 'Đang đun' : 'Đun nóng'}
                    </button>
                    <button 
                      onClick={handleCooling}
                      className="te-control-btn te-cool-btn"
                      disabled={!!feedback || temperature <= currentChallenge.minTemp}
                    >
                      <Snowflake size={18} />
                      Làm lạnh
                    </button>
                  </div>

                  <button 
                    onClick={handleSubmit} 
                    className="te-submit-btn" 
                    disabled={!!feedback}
                  >
                    <Check size={20} />
                    Kiểm tra kết quả
                  </button>
                </div>

                {/* Canvas */}
                <div className="te-canvas-card">
                  <div className="te-canvas-header">
                    <Flame size={20} />
                    <span>Mô phỏng giãn nở</span>
                  </div>
                  <div className="te-canvas-wrapper">
                    <canvas ref={canvasRef} className="te-canvas"></canvas>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {feedback && (
                <div className={`te-feedback ${feedback.correct ? 'te-feedback-correct' : 'te-feedback-wrong'}`}>
                  <div className="te-feedback-icon">
                    {feedback.correct ? <Check size={28} /> : <X size={28} />}
                  </div>
                  <div className="te-feedback-content">
                    <h3>{feedback.message}</h3>
                    {feedback.points && <span className="te-feedback-points">+{feedback.points} điểm</span>}
                    <p>{feedback.detail}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="te-game-over">
          <div className="te-game-over-card">
            <div className="te-trophy">
              <Award size={60} />
            </div>
            <h2>🎉 Hoàn thành thí nghiệm!</h2>
            <div className="te-final-stats">
              <div className="te-final-stat">
                <Star size={24} />
                <div>
                  <span className="te-final-label">Tổng điểm</span>
                  <span className="te-final-value">{score}</span>
                </div>
              </div>
              <div className="te-final-stat">
                <Target size={24} />
                <div>
                  <span className="te-final-label">Thành công</span>
                  <span className="te-final-value">{correctAnswers}/10</span>
                </div>
              </div>
            </div>
            <div className="te-badge" style={{ borderColor: getBadge().color, color: getBadge().color }}>
              <span className="te-badge-icon">{getBadge().icon}</span>
              <span className="te-badge-text">{getBadge().text}</span>
            </div>
            <div className="te-game-over-actions">
              <button onClick={handleRestart} className="te-restart-btn">
                <RotateCcw size={20} />
                Thử lại
              </button>
              <button onClick={() => navigate('/physics-games/grade/6')} className="te-home-btn">
                Về danh sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThermalExpansionGame;

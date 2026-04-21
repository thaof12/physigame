import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, RotateCcw, Wind, Star, Target, Check, X, Zap, Thermometer, Droplets, Move } from 'lucide-react';
import './EvaporationGame.css';

const EvaporationGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  // Environmental factors
  const [temperature, setTemperature] = useState(25);
  const [windSpeed, setWindSpeed] = useState(5);
  const [humidity, setHumidity] = useState(50);
  const [surfaceArea, setSurfaceArea] = useState(50);

  const challenges = [
    {
      id: 1,
      scenario: 'Phơi quần áo ngoài trời',
      icon: '👕',
      targetRate: 60,
      optimalTemp: 35,
      optimalWind: 15,
      optimalHumidity: 30,
      optimalArea: 80,
      hint: 'Nhiệt độ cao + gió mạnh + độ ẩm thấp = bốc hơi nhanh',
      description: 'Làm thế nào để quần áo khô nhanh?'
    },
    {
      id: 2,
      scenario: 'Làm khô hạt thóc',
      icon: '🌾',
      targetRate: 70,
      optimalTemp: 40,
      optimalWind: 20,
      optimalHumidity: 20,
      optimalArea: 90,
      hint: 'Phơi rộng ra, nắng gắt, gió to',
      description: 'Phơi thóc hiệu quả'
    },
    {
      id: 3,
      scenario: 'Giữ nước lâu bay hơi',
      icon: '💧',
      targetRate: 20,
      optimalTemp: 15,
      optimalWind: 5,
      optimalHumidity: 80,
      optimalArea: 20,
      hint: 'Nhiệt độ thấp + không gió + độ ẩm cao',
      description: 'Làm chậm sự bốc hơi'
    },
    {
      id: 4,
      scenario: 'Sấy tóc nhanh',
      icon: '💇',
      targetRate: 75,
      optimalTemp: 45,
      optimalWind: 25,
      optimalHumidity: 25,
      optimalArea: 70,
      hint: 'Máy sấy nóng + gió mạnh',
      description: 'Sấy khô tóc ướt'
    },
    {
      id: 5,
      scenario: 'Làm muối từ nước biển',
      icon: '🧂',
      targetRate: 65,
      optimalTemp: 38,
      optimalWind: 18,
      optimalHumidity: 35,
      optimalArea: 85,
      hint: 'Ruộng muối phơi rộng',
      description: 'Bốc hơi nước biển lấy muối'
    },
    {
      id: 6,
      scenario: 'Bảo quản thực phẩm tươi',
      icon: '🥗',
      targetRate: 15,
      optimalTemp: 10,
      optimalWind: 3,
      optimalHumidity: 85,
      optimalArea: 15,
      hint: 'Tủ lạnh mát + đậy kín',
      description: 'Giữ độ ẩm cho thực phẩm'
    },
    {
      id: 7,
      scenario: 'Lau sàn nhà cho nhanh khô',
      icon: '🧹',
      targetRate: 68,
      optimalTemp: 32,
      optimalWind: 22,
      optimalHumidity: 28,
      optimalArea: 75,
      hint: 'Mở cửa + quạt + nóng',
      description: 'Làm khô sàn nhà'
    },
    {
      id: 8,
      scenario: 'Ủ rượu (giữ ẩm)',
      icon: '🍶',
      targetRate: 10,
      optimalTemp: 18,
      optimalWind: 2,
      optimalHumidity: 90,
      optimalArea: 10,
      hint: 'Kín + mát + ẩm cao',
      description: 'Ngăn rượu bay hơi'
    },
    {
      id: 9,
      scenario: 'Sấy trái cây làm mứt',
      icon: '🍎',
      targetRate: 72,
      optimalTemp: 42,
      optimalWind: 23,
      optimalHumidity: 22,
      optimalArea: 88,
      hint: 'Lò sấy nóng + gió tuần hoàn',
      description: 'Làm khô trái cây'
    },
    {
      id: 10,
      scenario: 'Giữ ẩm cho da mặt',
      icon: '😊',
      targetRate: 18,
      optimalTemp: 20,
      optimalWind: 4,
      optimalHumidity: 75,
      optimalArea: 25,
      hint: 'Nhiệt độ ổn + tránh gió + ẩm vừa',
      description: 'Ngăn da khô'
    }
  ];

  const calculateEvaporationRate = useCallback(() => {
    const tempFactor = temperature / 10;
    const windFactor = windSpeed / 5;
    const humidityFactor = 100 / (humidity + 10);
    const areaFactor = surfaceArea / 20;
    
    const rate = tempFactor * windFactor * humidityFactor * areaFactor * 10;
    return Math.min(100, Math.max(0, rate));
  }, [temperature, windSpeed, humidity, surfaceArea]);

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
    const time = Date.now() / 1000;
    const rate = calculateEvaporationRate();

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, 'rgba(6, 182, 212, 0.1)');
    bgGrad.addColorStop(1, 'rgba(30, 41, 59, 0.3)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Container / Water surface
    const containerWidth = width * 0.6;
    const containerHeight = height * 0.4;
    const containerX = (width - containerWidth) / 2;
    const containerY = height * 0.45;

    // Draw container
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(containerX, containerY);
    ctx.lineTo(containerX, containerY + containerHeight);
    ctx.lineTo(containerX + containerWidth, containerY + containerHeight);
    ctx.lineTo(containerX + containerWidth, containerY);
    ctx.stroke();

    // Water level (decreases with evaporation rate)
    const waterHeight = containerHeight * (1 - rate / 200);
    const waterY = containerY + containerHeight - waterHeight;

    const waterGrad = ctx.createLinearGradient(0, waterY, 0, containerY + containerHeight);
    waterGrad.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
    waterGrad.addColorStop(1, 'rgba(6, 182, 212, 0.9)');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(containerX + 3, waterY, containerWidth - 6, waterHeight - 3);

    // Water surface waves
    ctx.beginPath();
    ctx.moveTo(containerX + 3, waterY);
    for (let x = containerX + 3; x < containerX + containerWidth - 3; x += 5) {
      const waveHeight = Math.sin((x + time * 50) * 0.05) * 3;
      ctx.lineTo(x, waterY + waveHeight);
    }
    ctx.lineTo(containerX + containerWidth - 3, waterY);
    ctx.lineTo(containerX + containerWidth - 3, waterY + 10);
    ctx.lineTo(containerX + 3, waterY + 10);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();

    // Vapor particles
    const particleCount = Math.floor(rate / 8);
    for (let i = 0; i < particleCount; i++) {
      const baseX = containerX + (containerWidth / particleCount) * i + 20;
      const phase = (time + i * 0.5) % 3;
      const y = waterY - phase * 80;
      const opacity = Math.max(0, 1 - phase / 3);
      const size = 15 + Math.sin(time + i) * 5;

      ctx.globalAlpha = opacity * 0.7;
      ctx.font = `${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('💨', baseX + Math.sin(time + i) * 20, y);
    }
    ctx.globalAlpha = 1;

    // Sun indicator (if high temp)
    if (temperature > 30) {
      const sunSize = 40 + Math.sin(time * 2) * 5;
      ctx.font = `${sunSize}px Arial`;
      ctx.fillText('☀️', width - 60, 50);
    }

    // Wind indicator
    if (windSpeed > 10) {
      ctx.font = '28px Arial';
      for (let i = 0; i < 3; i++) {
        const windX = 30 + Math.sin(time * 3 + i) * 15;
        ctx.fillText('💨', windX, 50 + i * 35);
      }
    }

    // Humidity clouds
    if (humidity > 60) {
      ctx.font = '30px Arial';
      ctx.globalAlpha = 0.6;
      ctx.fillText('☁️', width / 2 - 50, 40);
      ctx.fillText('☁️', width / 2 + 20, 55);
      ctx.globalAlpha = 1;
    }

    // Rate gauge at bottom
    const gaugeWidth = width * 0.8;
    const gaugeHeight = 20;
    const gaugeX = (width - gaugeWidth) / 2;
    const gaugeY = height - 50;

    // Gauge background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.roundRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight, 10);
    ctx.fill();

    // Gauge fill
    const fillWidth = (gaugeWidth - 4) * (rate / 100);
    const gaugeGrad = ctx.createLinearGradient(gaugeX, 0, gaugeX + gaugeWidth, 0);
    gaugeGrad.addColorStop(0, '#3b82f6');
    gaugeGrad.addColorStop(0.5, '#06b6d4');
    gaugeGrad.addColorStop(1, '#ef4444');
    
    ctx.fillStyle = gaugeGrad;
    ctx.beginPath();
    ctx.roundRect(gaugeX + 2, gaugeY + 2, fillWidth, gaugeHeight - 4, 8);
    ctx.fill();

    // Rate text
    ctx.font = 'bold 14px system-ui';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(`Tốc độ bốc hơi: ${rate.toFixed(0)}%`, width / 2, gaugeY + 15);

    // Scenario icon
    ctx.font = '50px Arial';
    ctx.fillText(currentChallenge.icon, width / 2, 60);

    animationRef.current = requestAnimationFrame(drawVisualization);
  }, [currentChallenge, calculateEvaporationRate, temperature, windSpeed, humidity]);

  const generateChallenge = () => {
    const challenge = challenges[level - 1];
    setCurrentChallenge(challenge);
    setFeedback(null);
    setTemperature(25);
    setWindSpeed(5);
    setHumidity(50);
    setSurfaceArea(50);
  };

  useEffect(() => {
    if (level <= 10 && !gameOver && !showTutorial) {
      generateChallenge();
    }
  }, [level, showTutorial]);

  useEffect(() => {
    if (currentChallenge && !showTutorial) {
      drawVisualization();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentChallenge, showTutorial, temperature, windSpeed, humidity, surfaceArea, drawVisualization]);

  const handleSubmit = () => {
    if (feedback || !currentChallenge) return;

    const currentRate = calculateEvaporationRate();
    const targetRate = currentChallenge.targetRate;
    const tolerance = 10;

    const isCorrect = Math.abs(currentRate - targetRate) <= tolerance;

    if (isCorrect) {
      const earnedPoints = 15;
      setScore(score + earnedPoints);
      setCorrectAnswers(correctAnswers + 1);
      setFeedback({
        correct: true,
        message: 'Chính xác!',
        points: earnedPoints,
        detail: `Tốc độ bốc hơi: ${currentRate.toFixed(0)}% ≈ ${targetRate}%`
      });
    } else {
      setFeedback({
        correct: false,
        message: 'Chưa tối ưu!',
        detail: `Tốc độ hiện tại: ${currentRate.toFixed(0)}%, Mục tiêu: ${targetRate}%`
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

  const getBadge = () => {
    if (correctAnswers >= 9) return { icon: '🏆', text: 'Chuyên gia bốc hơi!', color: '#fbbf24' };
    if (correctAnswers >= 7) return { icon: '🥈', text: 'Rất tốt!', color: '#94a3b8' };
    if (correctAnswers >= 5) return { icon: '🥉', text: 'Khá tốt!', color: '#cd7f32' };
    return { icon: '📚', text: 'Cần luyện tập thêm!', color: '#3b82f6' };
  };

  return (
    <div className="ev-game">
      {/* Tutorial */}
      {showTutorial && (
        <div className="ev-tutorial-overlay">
          <div className="ev-tutorial-card">
            <div className="ev-tutorial-icon">
              <Wind size={40} />
            </div>
            <h2>Bay Hơi & Đông Đặc</h2>
            <p className="ev-tutorial-desc">
              Khám phá các yếu tố ảnh hưởng đến quá trình bốc hơi
            </p>
            <div className="ev-tutorial-steps">
              <div className="ev-step">
                <span className="ev-step-num">1</span>
                <div className="ev-step-content">
                  <strong>Bốc hơi</strong>
                  <span>Chất lỏng chuyển thành hơi ở mọi nhiệt độ</span>
                </div>
              </div>
              <div className="ev-step">
                <span className="ev-step-num">2</span>
                <div className="ev-step-content">
                  <strong>Tăng tốc</strong>
                  <span>Nhiệt độ cao, gió mạnh, độ ẩm thấp</span>
                </div>
              </div>
              <div className="ev-step">
                <span className="ev-step-num">3</span>
                <div className="ev-step-content">
                  <strong>Điều chỉnh</strong>
                  <span>Thay đổi 4 yếu tố để đạt mục tiêu</span>
                </div>
              </div>
            </div>
            <button onClick={() => setShowTutorial(false)} className="ev-start-btn">
              <Zap size={20} />
              Bắt đầu thí nghiệm
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="ev-header">
        <button onClick={() => navigate('/physics-games/grade/6')} className="ev-back-btn">
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div className="ev-title">
          <Wind size={28} className="ev-title-icon" />
          <h1>Bay Hơi & Đông Đặc</h1>
        </div>
        <div className="ev-placeholder"></div>
      </header>

      {!gameOver ? (
        <div className="ev-content">
          {/* Stats */}
          <div className="ev-stats-bar">
            <div className="ev-stat">
              <Target size={20} />
              <div className="ev-stat-info">
                <span className="ev-stat-label">Thí nghiệm</span>
                <span className="ev-stat-value">{level}/10</span>
              </div>
            </div>
            <div className="ev-stat">
              <Star size={20} />
              <div className="ev-stat-info">
                <span className="ev-stat-label">Điểm số</span>
                <span className="ev-stat-value">{score}</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="ev-progress-container">
            <div className="ev-progress-bar">
              <div className="ev-progress-fill" style={{ width: `${(level / 10) * 100}%` }}></div>
            </div>
          </div>

          {currentChallenge && (
            <>
              {/* Game Grid */}
              <div className="ev-game-grid">
                {/* Challenge Info */}
                <div className="ev-challenge-card">
                  <div className="ev-scenario-badge">
                    <span className="ev-scenario-icon">{currentChallenge.icon}</span>
                    <span className="ev-scenario-name">{currentChallenge.scenario}</span>
                  </div>
                  <p className="ev-challenge-desc">{currentChallenge.description}</p>
                  
                  <div className="ev-hint-box">
                    <span className="ev-hint-icon">💡</span>
                    <span className="ev-hint-text">{currentChallenge.hint}</span>
                  </div>

                  <div className="ev-target-box">
                    <span className="ev-target-label">Tốc độ bốc hơi mục tiêu:</span>
                    <span className="ev-target-value">{currentChallenge.targetRate}% (±10%)</span>
                  </div>

                  {/* Controls */}
                  <div className="ev-controls">
                    <div className="ev-control">
                      <label>
                        <Thermometer size={16} />
                        Nhiệt độ: <strong>{temperature}°C</strong>
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={temperature}
                        onChange={(e) => setTemperature(parseInt(e.target.value))}
                        disabled={!!feedback}
                        className="ev-slider ev-slider-temp"
                      />
                    </div>

                    <div className="ev-control">
                      <label>
                        <Wind size={16} />
                        Tốc độ gió: <strong>{windSpeed} m/s</strong>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={windSpeed}
                        onChange={(e) => setWindSpeed(parseInt(e.target.value))}
                        disabled={!!feedback}
                        className="ev-slider ev-slider-wind"
                      />
                    </div>

                    <div className="ev-control">
                      <label>
                        <Droplets size={16} />
                        Độ ẩm: <strong>{humidity}%</strong>
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="95"
                        value={humidity}
                        onChange={(e) => setHumidity(parseInt(e.target.value))}
                        disabled={!!feedback}
                        className="ev-slider ev-slider-humidity"
                      />
                    </div>

                    <div className="ev-control">
                      <label>
                        <Move size={16} />
                        Diện tích: <strong>{surfaceArea}%</strong>
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={surfaceArea}
                        onChange={(e) => setSurfaceArea(parseInt(e.target.value))}
                        disabled={!!feedback}
                        className="ev-slider ev-slider-area"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleSubmit} 
                    className="ev-submit-btn" 
                    disabled={!!feedback}
                  >
                    <Check size={20} />
                    Kiểm tra kết quả
                  </button>
                </div>

                {/* Canvas */}
                <div className="ev-canvas-card">
                  <div className="ev-canvas-header">
                    <Wind size={20} />
                    <span>Mô phỏng bốc hơi</span>
                  </div>
                  <div className="ev-canvas-wrapper">
                    <canvas ref={canvasRef} className="ev-canvas"></canvas>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {feedback && (
                <div className={`ev-feedback ${feedback.correct ? 'ev-feedback-correct' : 'ev-feedback-wrong'}`}>
                  <div className="ev-feedback-icon">
                    {feedback.correct ? <Check size={28} /> : <X size={28} />}
                  </div>
                  <div className="ev-feedback-content">
                    <h3>{feedback.message}</h3>
                    {feedback.points && <span className="ev-feedback-points">+{feedback.points} điểm</span>}
                    <p>{feedback.detail}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="ev-game-over">
          <div className="ev-game-over-card">
            <div className="ev-trophy">
              <Award size={60} />
            </div>
            <h2>🎉 Hoàn thành thí nghiệm!</h2>
            <div className="ev-final-stats">
              <div className="ev-final-stat">
                <Star size={24} />
                <div>
                  <span className="ev-final-label">Tổng điểm</span>
                  <span className="ev-final-value">{score}</span>
                </div>
              </div>
              <div className="ev-final-stat">
                <Target size={24} />
                <div>
                  <span className="ev-final-label">Thành công</span>
                  <span className="ev-final-value">{correctAnswers}/10</span>
                </div>
              </div>
            </div>
            <div className="ev-badge" style={{ borderColor: getBadge().color, color: getBadge().color }}>
              <span className="ev-badge-icon">{getBadge().icon}</span>
              <span className="ev-badge-text">{getBadge().text}</span>
            </div>
            <div className="ev-game-over-actions">
              <button onClick={handleRestart} className="ev-restart-btn">
                <RotateCcw size={20} />
                Thử lại
              </button>
              <button onClick={() => navigate('/physics-games/grade/6')} className="ev-home-btn">
                Về danh sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaporationGame;

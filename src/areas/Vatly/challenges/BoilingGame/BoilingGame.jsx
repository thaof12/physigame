import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, RotateCcw, Flame, Droplets, Gauge, ThermometerSun, Play, Pause, Check, X } from 'lucide-react';
import './BoilingGame.css';

const BoilingGame = () => {
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

  // Boiling simulation
  const [temperature, setTemperature] = useState(20);
  const [pressure, setPressure] = useState(101.3);
  const [isHeating, setIsHeating] = useState(false);
  const [isBoiling, setIsBoiling] = useState(false);
  
  // Animation state
  const bubblesRef = useRef([]);
  const steamsRef = useRef([]);

  const challenges = [
    {
      id: 1,
      scenario: 'Đun nước ở áp suất bình thường',
      icon: '♨️',
      targetTemp: 100,
      targetPressure: 101.3,
      liquid: 'Nước',
      hint: 'Nước sôi ở 100°C tại 1 atm',
      description: 'Điều kiện sôi chuẩn',
      color: '#3b82f6',
      liquidColor: 'rgba(59, 130, 246, 0.6)'
    },
    {
      id: 2,
      scenario: 'Nấu ăn trên núi cao',
      icon: '⛰️',
      targetTemp: 92,
      targetPressure: 70,
      liquid: 'Nước',
      hint: 'Áp suất thấp → nhiệt độ sôi giảm',
      description: 'Áp suất thấp hơn',
      color: '#06b6d4',
      liquidColor: 'rgba(6, 182, 212, 0.6)'
    },
    {
      id: 3,
      scenario: 'Nồi áp suất nấu nhanh',
      icon: '🍲',
      targetTemp: 120,
      targetPressure: 200,
      liquid: 'Nước',
      hint: 'Áp suất cao → nhiệt độ sôi tăng',
      description: 'Áp suất cao hơn',
      color: '#8b5cf6',
      liquidColor: 'rgba(139, 92, 246, 0.6)'
    },
    {
      id: 4,
      scenario: 'Rượu etylic sôi',
      icon: '🍶',
      targetTemp: 78,
      targetPressure: 101.3,
      liquid: 'Rượu',
      hint: 'Rượu sôi thấp hơn nước',
      description: 'Nhiệt độ sôi khác nhau',
      color: '#f59e0b',
      liquidColor: 'rgba(245, 158, 11, 0.6)'
    },
    {
      id: 5,
      scenario: 'Đỉnh Everest (cao nhất)',
      icon: '🏔️',
      targetTemp: 72,
      targetPressure: 33,
      liquid: 'Nước',
      hint: 'Áp suất rất thấp ở 8848m',
      description: 'Độ cao cực đại',
      color: '#0891b2',
      liquidColor: 'rgba(8, 145, 178, 0.6)'
    },
    {
      id: 6,
      scenario: 'Nồi hấp áp lực công nghiệp',
      icon: '⚙️',
      targetTemp: 135,
      targetPressure: 300,
      liquid: 'Nước',
      hint: 'Áp suất rất cao → sôi >130°C',
      description: 'Công nghiệp thực phẩm',
      color: '#6366f1',
      liquidColor: 'rgba(99, 102, 241, 0.6)'
    },
    {
      id: 7,
      scenario: 'Sữa sôi (không để cháy)',
      icon: '🥛',
      targetTemp: 100,
      targetPressure: 101.3,
      liquid: 'Sữa',
      hint: 'Sữa sôi gần 100°C',
      description: 'Kiểm soát nhiệt độ',
      color: '#f1f5f9',
      liquidColor: 'rgba(241, 245, 249, 0.8)'
    },
    {
      id: 8,
      scenario: 'Biển Chết (dưới mực nước biển)',
      icon: '🌊',
      targetTemp: 101,
      targetPressure: 106,
      liquid: 'Nước',
      hint: 'Áp suất cao hơn 1 chút',
      description: 'Độ cao âm (-430m)',
      color: '#14b8a6',
      liquidColor: 'rgba(20, 184, 166, 0.6)'
    },
    {
      id: 9,
      scenario: 'Cồn y tế',
      icon: '💊',
      targetTemp: 78,
      targetPressure: 101.3,
      liquid: 'Cồn',
      hint: 'Giống rượu etylic',
      description: 'Làm sạch vết thương',
      color: '#f97316',
      liquidColor: 'rgba(249, 115, 22, 0.6)'
    },
    {
      id: 10,
      scenario: 'Nước biển (có muối)',
      icon: '🧂',
      targetTemp: 102,
      targetPressure: 101.3,
      liquid: 'Nước muối',
      hint: 'Muối làm tăng nhiệt độ sôi',
      description: 'Chất tan tăng điểm sôi',
      color: '#0ea5e9',
      liquidColor: 'rgba(14, 165, 233, 0.6)'
    }
  ];

  const calculateBoilingPoint = useCallback((liquid, pressureKPa) => {
    const standardBoilingPoints = {
      'Nước': 100,
      'Rượu': 78,
      'Cồn': 78,
      'Sữa': 100,
      'Nước muối': 102
    };
    
    const baseTemp = standardBoilingPoints[liquid] || 100;
    const pressureRatio = pressureKPa / 101.3;
    const tempChange = (pressureRatio - 1) * 30;
    return baseTemp + tempChange;
  }, []);

  const generateChallenge = useCallback(() => {
    const challenge = challenges[level - 1];
    setCurrentChallenge(challenge);
    setFeedback(null);
    setTemperature(20);
    setPressure(101.3);
    setIsHeating(false);
    setIsBoiling(false);
    bubblesRef.current = [];
    steamsRef.current = [];
  }, [level]);

  useEffect(() => {
    if (level <= 10 && !gameOver) {
      generateChallenge();
    }
  }, [level, gameOver, generateChallenge]);

  useEffect(() => {
    if (isHeating && temperature < 150 && !feedback) {
      const timer = setTimeout(() => {
        setTemperature(prev => Math.min(prev + 1, 150));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isHeating, temperature, feedback]);

  useEffect(() => {
    if (!currentChallenge) return;
    const boilingPoint = calculateBoilingPoint(currentChallenge.liquid, pressure);
    setIsBoiling(temperature >= boilingPoint);
  }, [temperature, pressure, currentChallenge, calculateBoilingPoint]);

  // Canvas animation
  const drawBoilingSimulation = useCallback((ctx, width, height) => {
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, width, height);
    
    const w = width / dpr;
    const h = height / dpr;
    
    // Draw background - dark gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
    
    // Pot dimensions
    const potWidth = w * 0.5;
    const potHeight = h * 0.45;
    const potX = (w - potWidth) / 2;
    const potY = h * 0.35;
    
    // Draw pot (beaker style)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(potX, potY);
    ctx.lineTo(potX, potY + potHeight);
    ctx.lineTo(potX + potWidth, potY + potHeight);
    ctx.lineTo(potX + potWidth, potY);
    ctx.stroke();
    
    // Draw scale marks on pot
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const markY = potY + potHeight - (i + 1) * (potHeight / 6);
      ctx.beginPath();
      ctx.moveTo(potX + 5, markY);
      ctx.lineTo(potX + 20, markY);
      ctx.stroke();
    }
    
    // Draw liquid
    const liquidHeight = potHeight * 0.7;
    const liquidY = potY + potHeight - liquidHeight;
    
    if (currentChallenge) {
      const liquidGrad = ctx.createLinearGradient(0, liquidY, 0, potY + potHeight);
      liquidGrad.addColorStop(0, currentChallenge.liquidColor);
      liquidGrad.addColorStop(1, currentChallenge.color);
      ctx.fillStyle = liquidGrad;
      ctx.fillRect(potX + 2, liquidY, potWidth - 4, liquidHeight - 2);
    }
    
    // Draw bubbles
    if (isBoiling) {
      const boilingPoint = calculateBoilingPoint(currentChallenge?.liquid || 'Nước', pressure);
      const intensity = Math.min((temperature - boilingPoint) / 10, 1);
      
      // Add new bubbles
      if (Math.random() < 0.3 + intensity * 0.5) {
        bubblesRef.current.push({
          x: potX + 20 + Math.random() * (potWidth - 40),
          y: potY + potHeight - 10,
          radius: 3 + Math.random() * 6,
          speed: 1 + Math.random() * 2 + intensity * 2,
          opacity: 0.8
        });
      }
      
      // Update and draw bubbles
      bubblesRef.current = bubblesRef.current.filter(bubble => {
        bubble.y -= bubble.speed;
        bubble.x += Math.sin(bubble.y * 0.05) * 0.5;
        bubble.opacity -= 0.01;
        
        if (bubble.y < liquidY || bubble.opacity <= 0) {
          // Create steam when bubble reaches surface
          if (bubble.y < liquidY + 10) {
            steamsRef.current.push({
              x: bubble.x,
              y: liquidY,
              size: 10 + Math.random() * 10,
              speed: 0.5 + Math.random() * 1,
              opacity: 0.7
            });
          }
          return false;
        }
        
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity * 0.5})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${bubble.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        return true;
      });
    }
    
    // Update and draw steam
    steamsRef.current = steamsRef.current.filter(steam => {
      steam.y -= steam.speed;
      steam.x += Math.sin(steam.y * 0.02) * 0.5;
      steam.opacity -= 0.015;
      steam.size += 0.1;
      
      if (steam.opacity <= 0 || steam.y < potY - 80) return false;
      
      const steamGrad = ctx.createRadialGradient(steam.x, steam.y, 0, steam.x, steam.y, steam.size);
      steamGrad.addColorStop(0, `rgba(255, 255, 255, ${steam.opacity * 0.4})`);
      steamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = steamGrad;
      ctx.beginPath();
      ctx.arc(steam.x, steam.y, steam.size, 0, Math.PI * 2);
      ctx.fill();
      
      return true;
    });
    
    // Draw heat source / burner
    const burnerY = potY + potHeight + 15;
    const burnerGrad = ctx.createLinearGradient(potX - 20, burnerY, potX + potWidth + 20, burnerY);
    burnerGrad.addColorStop(0, '#374151');
    burnerGrad.addColorStop(0.5, '#4b5563');
    burnerGrad.addColorStop(1, '#374151');
    ctx.fillStyle = burnerGrad;
    ctx.fillRect(potX - 20, burnerY, potWidth + 40, 15);
    
    // Draw flames if heating
    if (isHeating) {
      const flameCount = 5;
      const flameWidth = potWidth / flameCount;
      const time = Date.now() * 0.003;
      
      for (let i = 0; i < flameCount; i++) {
        const flameX = potX + i * flameWidth + flameWidth / 2;
        const flameHeight = 25 + Math.sin(time + i) * 8;
        
        // Outer flame (orange)
        const outerFlame = ctx.createRadialGradient(
          flameX, burnerY, 0,
          flameX, burnerY - flameHeight / 2, flameHeight
        );
        outerFlame.addColorStop(0, 'rgba(249, 115, 22, 0.9)');
        outerFlame.addColorStop(0.4, 'rgba(239, 68, 68, 0.6)');
        outerFlame.addColorStop(1, 'rgba(239, 68, 68, 0)');
        
        ctx.beginPath();
        ctx.moveTo(flameX - 12, burnerY);
        ctx.quadraticCurveTo(flameX - 8, burnerY - flameHeight * 0.6, flameX, burnerY - flameHeight);
        ctx.quadraticCurveTo(flameX + 8, burnerY - flameHeight * 0.6, flameX + 12, burnerY);
        ctx.closePath();
        ctx.fillStyle = outerFlame;
        ctx.fill();
        
        // Inner flame (yellow)
        const innerFlame = ctx.createRadialGradient(
          flameX, burnerY, 0,
          flameX, burnerY - flameHeight / 3, flameHeight * 0.5
        );
        innerFlame.addColorStop(0, 'rgba(252, 211, 77, 1)');
        innerFlame.addColorStop(0.5, 'rgba(251, 191, 36, 0.8)');
        innerFlame.addColorStop(1, 'rgba(249, 115, 22, 0)');
        
        ctx.beginPath();
        ctx.moveTo(flameX - 6, burnerY);
        ctx.quadraticCurveTo(flameX - 3, burnerY - flameHeight * 0.4, flameX, burnerY - flameHeight * 0.6);
        ctx.quadraticCurveTo(flameX + 3, burnerY - flameHeight * 0.4, flameX + 6, burnerY);
        ctx.closePath();
        ctx.fillStyle = innerFlame;
        ctx.fill();
      }
    }
    
    // Draw thermometer
    const thermX = w * 0.12;
    const thermY = h * 0.2;
    const thermHeight = h * 0.55;
    const thermWidth = 16;
    
    // Thermometer tube
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(thermX - thermWidth / 2, thermY, thermWidth, thermHeight, 8);
    ctx.fill();
    ctx.stroke();
    
    // Mercury bulb
    ctx.beginPath();
    ctx.arc(thermX, thermY + thermHeight + 12, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.stroke();
    
    // Mercury level
    const mercuryHeight = (temperature / 150) * thermHeight * 0.9;
    const mercuryGrad = ctx.createLinearGradient(0, thermY + thermHeight - mercuryHeight, 0, thermY + thermHeight);
    mercuryGrad.addColorStop(0, '#ef4444');
    mercuryGrad.addColorStop(1, '#dc2626');
    ctx.fillStyle = mercuryGrad;
    ctx.fillRect(thermX - 5, thermY + thermHeight - mercuryHeight, 10, mercuryHeight + 5);
    
    // Temperature scale marks
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    for (let t = 0; t <= 150; t += 30) {
      const markY = thermY + thermHeight - (t / 150) * thermHeight * 0.9;
      ctx.fillText(`${t}°`, thermX - thermWidth / 2 - 5, markY + 4);
      ctx.beginPath();
      ctx.moveTo(thermX - thermWidth / 2 + 2, markY);
      ctx.lineTo(thermX - thermWidth / 2 + 8, markY);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Draw pressure gauge
    const gaugeX = w * 0.88;
    const gaugeY = h * 0.35;
    const gaugeRadius = 45;
    
    // Gauge background
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gaugeRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Gauge scale
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    for (let angle = -135; angle <= 135; angle += 27) {
      const rad = (angle * Math.PI) / 180;
      const innerR = gaugeRadius - 10;
      const outerR = gaugeRadius - 5;
      ctx.beginPath();
      ctx.moveTo(gaugeX + Math.cos(rad) * innerR, gaugeY + Math.sin(rad) * innerR);
      ctx.lineTo(gaugeX + Math.cos(rad) * outerR, gaugeY + Math.sin(rad) * outerR);
      ctx.stroke();
    }
    
    // Gauge needle
    const normalizedPressure = (pressure - 30) / (350 - 30);
    const needleAngle = (-135 + normalizedPressure * 270) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(gaugeX, gaugeY);
    ctx.lineTo(
      gaugeX + Math.cos(needleAngle) * (gaugeRadius - 15),
      gaugeY + Math.sin(needleAngle) * (gaugeRadius - 15)
    );
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Gauge center
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    
    // Gauge label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('kPa', gaugeX, gaugeY + gaugeRadius + 15);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(pressure.toFixed(0), gaugeX, gaugeY + 5);
    
    // Draw status indicator
    const statusY = h * 0.12;
    ctx.fillStyle = isBoiling ? '#22c55e' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(w / 2 - 60, statusY, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(isBoiling ? 'ĐANG SÔI' : 'ĐANG ĐUN', w / 2 - 45, statusY + 5);
    
    // Draw boiling point info
    if (currentChallenge) {
      const bp = calculateBoilingPoint(currentChallenge.liquid, pressure);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Điểm sôi: ${bp.toFixed(1)}°C`, w / 2, statusY + 25);
    }
    
  }, [currentChallenge, temperature, pressure, isHeating, isBoiling, calculateBoilingPoint]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || showTutorial || gameOver) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    
    resizeCanvas();
    
    const animate = () => {
      drawBoilingSimulation(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showTutorial, gameOver, drawBoilingSimulation]);

  const handleHeating = () => {
    setIsHeating(!isHeating);
  };

  const handleCooling = () => {
    setTemperature(Math.max(20, temperature - 10));
  };

  const handleSubmit = () => {
    if (feedback) return;

    const targetTemp = currentChallenge.targetTemp;
    const targetPressure = currentChallenge.targetPressure;
    const tempTolerance = 3;
    const pressureTolerance = 10;

    const tempCorrect = Math.abs(temperature - targetTemp) <= tempTolerance;
    const pressureCorrect = Math.abs(pressure - targetPressure) <= pressureTolerance;
    const isCorrect = tempCorrect && pressureCorrect && isBoiling;

    if (isCorrect) {
      const earnedPoints = 15;
      setScore(score + earnedPoints);
      setCorrectAnswers(correctAnswers + 1);
      setFeedback({
        correct: true,
        message: `Chính xác! 🎉`,
        detail: `${currentChallenge.liquid} đang sôi ở ${temperature}°C, ${pressure.toFixed(1)} kPa (+${earnedPoints} điểm)`
      });
    } else {
      setFeedback({
        correct: false,
        message: !isBoiling ? 'Chưa sôi!' : 'Chưa đúng điều kiện!',
        detail: `Mục tiêu: ${targetTemp}°C, ${targetPressure} kPa`
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
  };

  if (!currentChallenge && !gameOver) return null;

  return (
    <div className="bo-game">
      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="bo-tutorial-overlay">
          <div className="bo-tutorial-card">
            <div className="bo-tutorial-icon">♨️</div>
            <h2>Phòng Thí Nghiệm Sự Sôi</h2>
            <p className="bo-tutorial-subtitle">Khám phá mối quan hệ giữa áp suất và nhiệt độ sôi</p>
            
            <div className="bo-tutorial-steps">
              <div className="bo-tutorial-step">
                <div className="bo-step-icon"><Flame size={20} /></div>
                <div className="bo-step-content">
                  <strong>Đun nóng</strong>
                  <span>Tăng nhiệt độ chất lỏng</span>
                </div>
              </div>
              <div className="bo-tutorial-step">
                <div className="bo-step-icon"><Gauge size={20} /></div>
                <div className="bo-step-content">
                  <strong>Điều chỉnh áp suất</strong>
                  <span>Thay đổi điểm sôi</span>
                </div>
              </div>
              <div className="bo-tutorial-step">
                <div className="bo-step-icon"><Droplets size={20} /></div>
                <div className="bo-step-content">
                  <strong>Quan sát sự sôi</strong>
                  <span>Chất lỏng chuyển thành hơi</span>
                </div>
              </div>
            </div>
            
            <div className="bo-tutorial-info">
              <p>💡 Áp suất cao → Nhiệt độ sôi tăng</p>
              <p>💡 Áp suất thấp → Nhiệt độ sôi giảm</p>
            </div>
            
            <button onClick={() => setShowTutorial(false)} className="bo-start-btn">
              Bắt đầu thí nghiệm
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bo-header">
        <button onClick={() => navigate('/physics-games/grade/6')} className="bo-back-btn">
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div className="bo-title">
          <Droplets size={28} />
          <h1>Sự Sôi</h1>
        </div>
        <div className="bo-header-stats">
          <div className="bo-header-stat">
            <ThermometerSun size={16} />
            <span>{temperature}°C</span>
          </div>
          <div className="bo-header-stat">
            <Gauge size={16} />
            <span>{pressure.toFixed(0)} kPa</span>
          </div>
        </div>
      </div>

      {!gameOver ? (
        <div className="bo-main-content">
          {/* Stats Bar */}
          <div className="bo-stats-bar">
            <div className="bo-stat-item">
              <span className="bo-stat-label">Câu hỏi</span>
              <span className="bo-stat-value">{level}/10</span>
            </div>
            <div className="bo-progress-bar">
              <div className="bo-progress-fill" style={{ width: `${(level / 10) * 100}%` }}></div>
            </div>
            <div className="bo-stat-item">
              <span className="bo-stat-label">Điểm</span>
              <span className="bo-stat-value bo-score">{score}</span>
            </div>
          </div>

          {/* Challenge Info */}
          <div className="bo-challenge-card">
            <div className="bo-challenge-icon">{currentChallenge.icon}</div>
            <div className="bo-challenge-info">
              <h2>{currentChallenge.scenario}</h2>
              <p>{currentChallenge.description}</p>
            </div>
            <div className="bo-target-badge">
              <span>Mục tiêu:</span>
              <strong>{currentChallenge.targetTemp}°C</strong>
              <span>tại</span>
              <strong>{currentChallenge.targetPressure} kPa</strong>
            </div>
          </div>

          {/* Hint */}
          <div className="bo-hint-box">
            <span className="bo-hint-icon">💡</span>
            <span>{currentChallenge.hint}</span>
          </div>

          {/* Canvas Simulation */}
          <div className="bo-simulation-container">
            <canvas ref={canvasRef} className="bo-canvas"></canvas>
          </div>

          {/* Controls */}
          <div className="bo-controls">
            <div className="bo-control-buttons">
              <button 
                onClick={handleHeating}
                className={`bo-control-btn bo-heat-btn ${isHeating ? 'active' : ''}`}
                disabled={!!feedback || temperature >= 150}
              >
                {isHeating ? <Pause size={20} /> : <Play size={20} />}
                {isHeating ? 'Dừng đun' : 'Đun nóng'}
              </button>
              <button
                onClick={handleCooling}
                className="bo-control-btn bo-cool-btn"
                disabled={!!feedback || temperature <= 20}
              >
                ❄️ Làm lạnh
              </button>
            </div>

            <div className="bo-pressure-control">
              <label>
                <Gauge size={18} />
                <span>Áp suất: <strong>{pressure.toFixed(1)} kPa</strong></span>
              </label>
              <input
                type="range"
                min="30"
                max="350"
                step="1"
                value={pressure}
                onChange={(e) => setPressure(parseFloat(e.target.value))}
                disabled={!!feedback}
              />
              <div className="bo-range-labels">
                <span>30 kPa</span>
                <span>101.3 (1 atm)</span>
                <span>350 kPa</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button onClick={handleSubmit} className="bo-submit-btn" disabled={!!feedback}>
            <Check size={20} />
            Kiểm tra kết quả
          </button>

          {/* Feedback */}
          {feedback && (
            <div className={`bo-feedback ${feedback.correct ? 'bo-correct' : 'bo-wrong'}`}>
              <div className="bo-feedback-icon">
                {feedback.correct ? <Check size={24} /> : <X size={24} />}
              </div>
              <div className="bo-feedback-content">
                <div className="bo-feedback-message">{feedback.message}</div>
                <div className="bo-feedback-detail">{feedback.detail}</div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bo-info-box">
            <h4>📋 Nhiệt độ sôi tham khảo (1 atm):</h4>
            <div className="bo-info-grid">
              <span>• Nước: 100°C</span>
              <span>• Rượu/Cồn: 78°C</span>
              <span>• Sữa: ~100°C</span>
              <span>• Nước muối: ~102°C</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bo-game-over">
          <div className="bo-trophy-container">
            <Award size={80} className="bo-trophy-icon" />
          </div>
          <h2>🎉 Hoàn thành thí nghiệm!</h2>
          
          <div className="bo-final-stats">
            <div className="bo-final-stat">
              <span className="bo-final-label">Tổng điểm</span>
              <span className="bo-final-value">{score}</span>
            </div>
            <div className="bo-final-stat">
              <span className="bo-final-label">Chính xác</span>
              <span className="bo-final-value">{correctAnswers}/10</span>
            </div>
            <div className="bo-final-stat">
              <span className="bo-final-label">Tỷ lệ</span>
              <span className="bo-final-value">{Math.round(correctAnswers * 10)}%</span>
            </div>
          </div>

          <div className="bo-achievement">
            {correctAnswers >= 9 && <div className="bo-badge bo-gold">🏆 Chuyên gia nhiệt học!</div>}
            {correctAnswers >= 7 && correctAnswers < 9 && <div className="bo-badge bo-silver">🥈 Rất xuất sắc!</div>}
            {correctAnswers >= 5 && correctAnswers < 7 && <div className="bo-badge bo-bronze">🥉 Khá tốt!</div>}
            {correctAnswers < 5 && <div className="bo-badge bo-try">💪 Cố gắng thêm!</div>}
          </div>

          <div className="bo-button-group">
            <button onClick={handleRestart} className="bo-restart-btn">
              <RotateCcw size={20} />
              Chơi lại
            </button>
            <button onClick={() => navigate('/physics-games/grade/6')} className="bo-menu-btn">
              Về danh sách
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoilingGame;

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Award, 
  RotateCcw, 
  HelpCircle, 
  Lightbulb, 
  Target, 
  Zap, 
  Star, 
  Trophy,
  Play,
  Home,
  Eye,
  Sparkles,
  X
} from 'lucide-react';
import './LightReflectionGame.css';

const LightReflectionGame = ({ isPKMode = false, pkTimeLimit, onComplete, onExit }) => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState(isPKMode ? 'playing' : 'tutorial');
  const [pkTimeLeft, setPkTimeLeft] = useState(pkTimeLimit || 60);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [mirrorAngle, setMirrorAngle] = useState(45);
  const [lightRay, setLightRay] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(3);
  const [correctReflections, setCorrectReflections] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Các thử thách với mức độ khó tăng dần
  const challenges = [
    {
      level: 1,
      description: 'Đặt gương để phản xạ ánh sáng đến mục tiêu',
      lightSource: { x: 100, y: 300 },
      target: { x: 700, y: 300 },
      mirrorPosition: { x: 400, y: 300 },
      correctAngle: 45,
      tolerance: 5,
      hint: 'Góc tới bằng góc phản xạ. Thử góc 45°'
    },
    {
      level: 2,
      description: 'Phản xạ ánh sáng từ nguồn cao xuống mục tiêu thấp',
      lightSource: { x: 100, y: 150 },
      target: { x: 700, y: 450 },
      mirrorPosition: { x: 400, y: 300 },
      correctAngle: 30,
      tolerance: 5,
      hint: 'Nguồn sáng ở trên, mục tiêu ở dưới. Điều chỉnh góc nhỏ hơn'
    },
    {
      level: 3,
      description: 'Phản xạ qua 2 gương',
      lightSource: { x: 100, y: 200 },
      target: { x: 700, y: 400 },
      mirrors: [
        { x: 300, y: 250 },
        { x: 550, y: 350 }
      ],
      correctAngles: [40, 50],
      tolerance: 5,
      hint: 'Sử dụng 2 gương để dẫn ánh sáng đến đích'
    },
    {
      level: 4,
      description: 'Tránh vật cản và đến mục tiêu',
      lightSource: { x: 100, y: 300 },
      target: { x: 700, y: 300 },
      obstacles: [
        { x: 400, y: 200, width: 50, height: 200 }
      ],
      mirrorPosition: { x: 350, y: 450 },
      correctAngle: 60,
      tolerance: 5,
      hint: 'Phản xạ ánh sáng qua dưới vật cản'
    },
    {
      level: 5,
      description: 'Thử thách cao cấp: Nhiều gương và vật cản',
      lightSource: { x: 100, y: 500 },
      target: { x: 700, y: 100 },
      mirrors: [
        { x: 250, y: 450 },
        { x: 450, y: 300 },
        { x: 600, y: 200 }
      ],
      obstacles: [
        { x: 350, y: 350, width: 100, height: 30 }
      ],
      correctAngles: [35, 45, 40],
      tolerance: 8,
      hint: 'Sử dụng cả 3 gương để dẫn ánh sáng từ dưới lên trên'
    }
  ];

  useEffect(() => {
    if (gameState === 'playing' && currentChallenge) {
      drawScene();
    }
  }, [gameState, currentChallenge, mirrorAngle, lightRay]);

  const startGame = () => {
    setGameState('playing');
    setLevel(1);
    setScore(0);
    setCorrectReflections(0);
    setAttempts(3);
    loadChallenge(1);
  };

  // PK Mode Timer
  useEffect(() => {
    if (!isPKMode || gameState !== 'playing') return;
    
    if (pkTimeLeft <= 0) {
      if (onComplete) onComplete({ score, completed: correctReflections });
      return;
    }
    
    const timer = setInterval(() => {
      setPkTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPKMode, gameState, pkTimeLeft, score, correctReflections, onComplete]);

  // Handle exit for PK mode
  const handleExit = () => {
    if (isPKMode && onExit) {
      onExit();
    } else {
      navigate('/advanced-physics-challenge');
    }
  };

  const loadChallenge = (levelNum) => {
    const challenge = challenges[levelNum - 1];
    setCurrentChallenge(challenge);
    setMirrorAngle(45);
    setLightRay(null);
    setShowHint(false);
  };

  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas với gradient đẹp
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw grid với style mới
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    if (!currentChallenge) return;

    // Draw obstacles với gradient
    if (currentChallenge.obstacles) {
      currentChallenge.obstacles.forEach(obs => {
        const obsGradient = ctx.createLinearGradient(obs.x, obs.y, obs.x + obs.width, obs.y + obs.height);
        obsGradient.addColorStop(0, '#374151');
        obsGradient.addColorStop(1, '#1f2937');
        ctx.fillStyle = obsGradient;
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 8);
        ctx.fill();
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    // Draw light source với glow effect
    const source = currentChallenge.lightSource;
    
    // Outer glow
    const glowGradient = ctx.createRadialGradient(source.x, source.y, 0, source.x, source.y, 50);
    glowGradient.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
    glowGradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(source.x, source.y, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner light source
    const lightGradient = ctx.createRadialGradient(source.x, source.y, 0, source.x, source.y, 20);
    lightGradient.addColorStop(0, '#fef3c7');
    lightGradient.addColorStop(0.5, '#fbbf24');
    lightGradient.addColorStop(1, '#f59e0b');
    ctx.fillStyle = lightGradient;
    ctx.beginPath();
    ctx.arc(source.x, source.y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Light rays from source
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      ctx.beginPath();
      ctx.moveTo(source.x + Math.cos(angle) * 22, source.y + Math.sin(angle) * 22);
      ctx.lineTo(source.x + Math.cos(angle) * 35, source.y + Math.sin(angle) * 35);
      ctx.stroke();
    }

    // Draw target với glow effect
    const target = currentChallenge.target;
    
    // Target glow
    const targetGlow = ctx.createRadialGradient(target.x, target.y, 0, target.x, target.y, 60);
    targetGlow.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
    targetGlow.addColorStop(1, 'rgba(34, 197, 94, 0)');
    ctx.fillStyle = targetGlow;
    ctx.beginPath();
    ctx.arc(target.x, target.y, 60, 0, Math.PI * 2);
    ctx.fill();
    
    // Target rings
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(target.x, target.y, 40, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(target.x, target.y, 30, 0, Math.PI * 2);
    ctx.stroke();
    
    // Target center
    const targetGradient = ctx.createRadialGradient(target.x, target.y, 0, target.x, target.y, 20);
    targetGradient.addColorStop(0, '#86efac');
    targetGradient.addColorStop(0.5, '#22c55e');
    targetGradient.addColorStop(1, '#16a34a');
    ctx.fillStyle = targetGradient;
    ctx.beginPath();
    ctx.arc(target.x, target.y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Target icon
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎯', target.x, target.y);

    // Draw mirrors
    if (currentChallenge.mirrors) {
      currentChallenge.mirrors.forEach((mirror, index) => {
        drawMirror(ctx, mirror.x, mirror.y, mirrorAngle + index * 10);
      });
    } else if (currentChallenge.mirrorPosition) {
      drawMirror(ctx, currentChallenge.mirrorPosition.x, currentChallenge.mirrorPosition.y, mirrorAngle);
    }

    // Draw light ray
    if (lightRay) {
      drawLightRay(ctx);
    }
  };

  const drawMirror = (ctx, x, y, angle) => {
    const length = 80;
    const angleRad = (angle * Math.PI) / 180;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angleRad);
    
    // Mirror glow
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 15;
    
    // Mirror surface gradient
    const mirrorGradient = ctx.createLinearGradient(-length/2, -4, -length/2, 4);
    mirrorGradient.addColorStop(0, '#67e8f9');
    mirrorGradient.addColorStop(0.5, '#06b6d4');
    mirrorGradient.addColorStop(1, '#0891b2');
    
    ctx.fillStyle = mirrorGradient;
    ctx.beginPath();
    ctx.roundRect(-length/2, -4, length, 8, 4);
    ctx.fill();
    
    // Mirror shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.roundRect(-length/2 + 5, -3, length - 10, 3, 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    // Normal line
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, -35);
    ctx.lineTo(0, 35);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Normal arrow
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.moveTo(-5, -35);
    ctx.lineTo(5, -35);
    ctx.lineTo(0, -42);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  };

  const drawLightRay = (ctx) => {
    const source = currentChallenge.lightSource;
    const mirror = currentChallenge.mirrorPosition || currentChallenge.mirrors[0];
    const target = currentChallenge.target;

    // Incident ray với glow
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(mirror.x, mirror.y);
    ctx.stroke();
    
    // Animated dash effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Calculate reflection
    const angleRad = (mirrorAngle * Math.PI) / 180;
    const incidentAngle = Math.atan2(mirror.y - source.y, mirror.x - source.x);
    const reflectionAngle = 2 * angleRad - incidentAngle - Math.PI;

    // Reflected ray
    const rayLength = 600;
    const reflectedX = mirror.x + Math.cos(reflectionAngle) * rayLength;
    const reflectedY = mirror.y + Math.sin(reflectionAngle) * rayLength;

    ctx.shadowColor = '#fb923c';
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(mirror.x, mirror.y);
    ctx.lineTo(reflectedX, reflectedY);
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.shadowBlur = 0;

    // Check if ray hits target
    const distance = Math.sqrt(
      Math.pow(reflectedX - target.x, 2) + Math.pow(reflectedY - target.y, 2)
    );

    // Impact indicator
    if (distance < 100) {
      const impactColor = distance < 30 ? '#22c55e' : '#fb923c';
      ctx.fillStyle = impactColor;
      ctx.shadowColor = impactColor;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(reflectedX, reflectedY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    return distance < 30;
  };

  const shootLightRay = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setLightRay(true);
    
    setTimeout(() => {
      const isCorrect = checkSolution();
      if (isCorrect) {
        handleSuccess();
      } else {
        handleFailure();
      }
      setIsAnimating(false);
    }, 800);
  };

  const checkSolution = () => {
    const tolerance = currentChallenge.tolerance;
    const correctAngle = currentChallenge.correctAngle;
    
    if (correctAngle) {
      return Math.abs(mirrorAngle - correctAngle) <= tolerance;
    }
    
    // For multi-mirror challenges, this would need more complex logic
    return false;
  };

  const handleSuccess = () => {
    const points = 100 + (attempts * 50);
    const newScore = score + points;
    const newCorrectReflections = correctReflections + 1;
    setScore(newScore);
    setCorrectReflections(newCorrectReflections);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      if (level < challenges.length) {
        setLevel(level + 1);
        loadChallenge(level + 1);
        setAttempts(3);
      } else {
        setGameState('success');
        if (isPKMode && onComplete) {
          onComplete({ score: newScore, completed: newCorrectReflections });
        }
      }
    }, 1500);
  };

  const handleFailure = () => {
    setAttempts(attempts - 1);
    if (attempts <= 1) {
      setGameState('gameover');
    }
    setLightRay(null);
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setCorrectReflections(0);
    setAttempts(3);
    setGameState('playing');
    loadChallenge(1);
  };

  // Tutorial Screen Component
  const TutorialScreen = () => (
    <div className="lr-tutorial-overlay">
      <div className="lr-tutorial-card">
        <div className="lr-tutorial-icon">
          <Lightbulb size={40} />
        </div>
        <h2>Phản Xạ Ánh Sáng</h2>
        <p className="lr-tutorial-subtitle">Khám phá định luật phản xạ ánh sáng</p>
        
        <div className="lr-tutorial-steps">
          <div className="lr-tutorial-step">
            <div className="lr-step-icon">
              <Eye size={16} />
            </div>
            <div className="lr-step-content">
              <strong>Định luật phản xạ</strong>
              <span>Góc tới = Góc phản xạ</span>
            </div>
          </div>
          <div className="lr-tutorial-step">
            <div className="lr-step-icon">
              <Target size={16} />
            </div>
            <div className="lr-step-content">
              <strong>Mục tiêu</strong>
              <span>Điều chỉnh góc gương để phản xạ ánh sáng đến mục tiêu</span>
            </div>
          </div>
          <div className="lr-tutorial-step">
            <div className="lr-step-icon">
              <Zap size={16} />
            </div>
            <div className="lr-step-content">
              <strong>Bắn tia sáng</strong>
              <span>Nhấn nút để kiểm tra - Bạn có 3 lần thử mỗi cấp</span>
            </div>
          </div>
        </div>

        <div className="lr-tutorial-formula">
          <Sparkles className="formula-icon" size={16} />
          <span>i = r (Góc tới = Góc phản xạ)</span>
        </div>

        <button onClick={startGame} className="lr-start-btn">
          <Play size={20} />
          <span>Bắt Đầu Chơi</span>
        </button>
      </div>
    </div>
  );

  // Success Animation Popup
  const SuccessPopup = () => (
    <div className="lr-success-popup">
      <div className="lr-success-content">
        <div className="lr-success-icon">
          <Star size={32} />
        </div>
        <span>Tuyệt vời!</span>
      </div>
    </div>
  );

  return (
    <div className="lr-game">
      {/* Header */}
      {!isPKMode && (
        <div className="lr-header">
          <button onClick={handleExit} className="lr-back-btn">
            <ArrowLeft size={20} />
            <span>Quay lại</span>
          </button>
          
          <div className="lr-title">
            <div className="lr-title-icon">
              <Lightbulb size={24} />
            </div>
            <h1>Phản Xạ Ánh Sáng</h1>
          </div>

          <div className="lr-stats">
            <div className="lr-stat">
              <Award className="lr-stat-icon gold" size={20} />
              <span>{score}</span>
            </div>
            <div className="lr-stat">
              <Target className="lr-stat-icon blue" size={20} />
              <span>Cấp {level}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial */}
      {gameState === 'tutorial' && <TutorialScreen />}

      {/* Success Popup */}
      {showSuccess && <SuccessPopup />}

      {/* Game Playing */}
      {gameState === 'playing' && currentChallenge && (
        <div className="lr-game-content">
          {/* Challenge Info */}
          <div className="lr-challenge-card">
            <div className="lr-challenge-header">
              <div className="lr-challenge-level">
                <span className="level-badge">Cấp {level}</span>
                <span className="level-total">/ {challenges.length}</span>
              </div>
              <div className="lr-attempts">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`lr-attempt-dot ${i < attempts ? 'active' : 'used'}`}
                  >
                    {i < attempts ? <Star size={14} /> : <X size={14} />}
                  </div>
                ))}
              </div>
            </div>
            <p className="lr-challenge-desc">{currentChallenge.description}</p>
          </div>

          {/* Canvas */}
          <div className="lr-canvas-wrapper">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="lr-canvas"
            />
          </div>

          {/* Controls */}
          <div className="lr-controls-panel">
            <div className="lr-angle-control">
              <div className="lr-angle-header">
                <span className="lr-angle-label">Góc gương</span>
                <span className="lr-angle-value">{mirrorAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                value={mirrorAngle}
                onChange={(e) => setMirrorAngle(parseInt(e.target.value))}
                className="lr-angle-slider"
              />
              <div className="lr-angle-marks">
                <span>0°</span>
                <span>45°</span>
                <span>90°</span>
                <span>135°</span>
                <span>180°</span>
              </div>
            </div>

            <div className="lr-action-buttons">
              <button 
                onClick={shootLightRay} 
                className="lr-shoot-btn" 
                disabled={lightRay || isAnimating}
              >
                <Zap size={20} />
                <span>Bắn Tia Sáng</span>
              </button>
              <button 
                onClick={() => setShowHint(!showHint)} 
                className={`lr-hint-btn ${showHint ? 'active' : ''}`}
              >
                <HelpCircle size={20} />
                <span>Gợi ý</span>
              </button>
            </div>

            {showHint && (
              <div className="lr-hint-box">
                <Lightbulb className="hint-icon" size={18} />
                <p>{currentChallenge.hint}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Over - Success */}
      {gameState === 'success' && (
        <div className="lr-overlay">
          <div className="lr-result-card success">
            <div className="lr-result-icon success">
              <Trophy size={48} />
            </div>
            <h2>🎉 Xuất Sắc!</h2>
            <p className="lr-result-score">{score} điểm</p>
            
            <div className="lr-result-stats">
              <div className="lr-result-stat">
                <Star className="stat-icon" size={20} />
                <span>{correctReflections}/{challenges.length} thử thách</span>
              </div>
            </div>

            <div className="lr-result-message">
              <Sparkles size={18} />
              <p>Bạn đã thành thạo định luật phản xạ ánh sáng!</p>
            </div>

            <div className="lr-result-buttons">
              <button onClick={resetGame} className="lr-btn primary">
                <RotateCcw size={20} />
                <span>Chơi Lại</span>
              </button>
              <button onClick={() => navigate('/advanced-physics-challenge')} className="lr-btn secondary">
                <Home size={20} />
                <span>Về Trang Chủ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over - Failure */}
      {gameState === 'gameover' && (
        <div className="lr-overlay">
          <div className="lr-result-card">
            <div className="lr-result-icon">
              <Target size={48} />
            </div>
            <h2>💪 Thử Lại Nhé!</h2>
            <p className="lr-result-score">{score} điểm</p>
            
            <div className="lr-result-stats">
              <div className="lr-result-stat">
                <Star className="stat-icon" size={20} />
                <span>{correctReflections}/{level} thử thách</span>
              </div>
            </div>

            <div className="lr-result-buttons">
              <button onClick={resetGame} className="lr-btn primary">
                <RotateCcw size={20} />
                <span>Chơi Lại</span>
              </button>
              <button onClick={() => navigate('/advanced-physics-challenge')} className="lr-btn secondary">
                <Home size={20} />
                <span>Về Trang Chủ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LightReflectionGame;

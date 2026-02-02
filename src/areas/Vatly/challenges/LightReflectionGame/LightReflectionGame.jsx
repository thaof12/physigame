import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, RotateCcw, HelpCircle, Lightbulb, Target } from 'lucide-react';
import './LightReflectionGame.css';

const LightReflectionGame = ({ isPKMode = false, pkTimeLimit, onComplete, onExit }) => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState(isPKMode ? 'playing' : 'tutorial'); // tutorial, playing, success, gameover
  const [pkTimeLeft, setPkTimeLeft] = useState(pkTimeLimit || 60);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [mirrorAngle, setMirrorAngle] = useState(45);
  const [lightRay, setLightRay] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(3);
  const [correctReflections, setCorrectReflections] = useState(0);

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
      navigate('/physics-games/grade/7');
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

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#2a2a4e';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    if (!currentChallenge) return;

    // Draw obstacles
    if (currentChallenge.obstacles) {
      ctx.fillStyle = '#555';
      currentChallenge.obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.strokeStyle = '#777';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
      });
    }

    // Draw light source
    const source = currentChallenge.lightSource;
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(source.x, source.y, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw rays from light source
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(source.x + Math.cos(angle) * 25, source.y + Math.sin(angle) * 25);
      ctx.stroke();
    }

    // Draw target
    const target = currentChallenge.target;
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.arc(target.x, target.y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Target rings
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(target.x, target.y, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(target.x, target.y, 40, 0, Math.PI * 2);
    ctx.stroke();

    // Draw mirrors
    if (currentChallenge.mirrors) {
      currentChallenge.mirrors.forEach((mirror, index) => {
        drawMirror(ctx, mirror.x, mirror.y, mirrorAngle + index * 10);
      });
    } else if (currentChallenge.mirrorPosition) {
      drawMirror(ctx, currentChallenge.mirrorPosition.x, currentChallenge.mirrorPosition.y, mirrorAngle);
    }

    // Calculate and draw light ray
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
    
    // Mirror surface
    ctx.strokeStyle = '#00bcd4';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-length / 2, 0);
    ctx.lineTo(length / 2, 0);
    ctx.stroke();
    
    // Mirror shine effect
    ctx.strokeStyle = '#80deea';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-length / 2 + 10, -3);
    ctx.lineTo(length / 2 - 10, -3);
    ctx.stroke();
    
    // Normal line
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.lineTo(0, 40);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.restore();
  };

  const drawLightRay = (ctx) => {
    const source = currentChallenge.lightSource;
    const mirror = currentChallenge.mirrorPosition || currentChallenge.mirrors[0];
    const target = currentChallenge.target;

    // Incident ray
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(mirror.x, mirror.y);
    ctx.stroke();

    // Calculate reflection
    const angleRad = (mirrorAngle * Math.PI) / 180;
    const incidentAngle = Math.atan2(mirror.y - source.y, mirror.x - source.x);
    const reflectionAngle = 2 * angleRad - incidentAngle - Math.PI;

    // Reflected ray
    const rayLength = 600;
    const reflectedX = mirror.x + Math.cos(reflectionAngle) * rayLength;
    const reflectedY = mirror.y + Math.sin(reflectionAngle) * rayLength;

    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(mirror.x, mirror.y);
    ctx.lineTo(reflectedX, reflectedY);
    ctx.stroke();

    // Check if ray hits target
    const distance = Math.sqrt(
      Math.pow(reflectedX - target.x, 2) + Math.pow(reflectedY - target.y, 2)
    );

    // Draw impact point if close to target
    if (distance < 100) {
      ctx.fillStyle = distance < 30 ? '#4caf50' : '#ff9800';
      ctx.beginPath();
      ctx.arc(reflectedX, reflectedY, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    return distance < 30;
  };

  const shootLightRay = () => {
    setLightRay(true);
    
    setTimeout(() => {
      const isCorrect = checkSolution();
      if (isCorrect) {
        handleSuccess();
      } else {
        handleFailure();
      }
    }, 500);
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
    
    setTimeout(() => {
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

  return (
    <div className="light-reflection-game">
      {!isPKMode && (
        <div className="game-header">
          <button onClick={handleExit} className="back-button">
            <ArrowLeft size={20} />
            <span>Quay lại</span>
          </button>
          <div className="game-title">
            <Lightbulb className="title-icon" />
            <h1>Phản Xạ Ánh Sáng</h1>
          </div>
          <div className="game-stats">
            <div className="stat-item">
              <Award className="stat-icon" />
              <span>{score} điểm</span>
            </div>
            <div className="stat-item">
              <Target className="stat-icon" />
              <span>Cấp {level}</span>
            </div>
          </div>
        </div>
      )}

      {gameState === 'tutorial' && (
        <div className="tutorial-overlay">
          <div className="tutorial-content">
            <h2>🎓 Hướng Dẫn Chơi</h2>
            <div className="tutorial-steps">
              <div className="tutorial-step">
                <span className="step-number">1</span>
                <p><strong>Định luật phản xạ:</strong> Góc tới = Góc phản xạ</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">2</span>
                <p>Điều chỉnh góc gương để phản xạ ánh sáng đến mục tiêu</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">3</span>
                <p>Nhấn "Bắn Tia Sáng" để kiểm tra</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">4</span>
                <p>Bạn có 3 lần thử cho mỗi cấp độ</p>
              </div>
            </div>
            <button onClick={startGame} className="start-button">
              Bắt Đầu Chơi
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && currentChallenge && (
        <div className="game-content">
          <div className="challenge-info">
            <h3>{currentChallenge.description}</h3>
            <div className="attempts-indicator">
              {Array.from({ length: 3 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`attempt-dot ${i < attempts ? 'active' : 'used'}`}
                />
              ))}
            </div>
          </div>

          <div className="canvas-container">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="game-canvas"
            />
          </div>

          <div className="controls-panel">
            <div className="angle-control">
              <label>Góc gương: {mirrorAngle}°</label>
              <input
                type="range"
                min="0"
                max="180"
                value={mirrorAngle}
                onChange={(e) => setMirrorAngle(parseInt(e.target.value))}
                className="angle-slider"
              />
              <div className="angle-marks">
                <span>0°</span>
                <span>45°</span>
                <span>90°</span>
                <span>135°</span>
                <span>180°</span>
              </div>
            </div>

            <div className="action-buttons">
              <button onClick={shootLightRay} className="shoot-button" disabled={lightRay}>
                <Lightbulb size={20} />
                Bắn Tia Sáng
              </button>
              <button 
                onClick={() => setShowHint(!showHint)} 
                className="hint-button"
              >
                <HelpCircle size={20} />
                Gợi ý
              </button>
            </div>

            {showHint && (
              <div className="hint-box">
                <p>💡 {currentChallenge.hint}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {gameState === 'success' && (
        <div className="game-over-overlay success">
          <div className="game-over-content">
            <h2>🎉 Xuất Sắc!</h2>
            <p className="final-score">Điểm số: {score}</p>
            <p className="achievement">Hoàn thành {correctReflections}/5 thử thách</p>
            <div className="stats-summary">
              <p>⭐ Bạn đã thành thạo định luật phản xạ ánh sáng!</p>
            </div>
            <div className="game-over-buttons">
              <button onClick={resetGame} className="retry-button">
                <RotateCcw size={20} />
                Chơi Lại
              </button>
              <button onClick={() => navigate('/physics/grade/7')} className="home-button">
                Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h2>💪 Thử Lại Nhé!</h2>
            <p className="final-score">Điểm số: {score}</p>
            <p>Hoàn thành: {correctReflections}/{level} thử thách</p>
            <div className="game-over-buttons">
              <button onClick={resetGame} className="retry-button">
                <RotateCcw size={20} />
                Chơi Lại
              </button>
              <button onClick={() => navigate('/physics-games/grade/7')} className="home-button">
                Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LightReflectionGame;

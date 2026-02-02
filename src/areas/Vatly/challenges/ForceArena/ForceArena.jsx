import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, RotateCcw, Star, Target, Clock, Check, X, Zap, Move } from 'lucide-react';
import './ForceArena.css';

const ForceArena = ({ isPKMode = false, pkTimeLimit, onComplete, onExit }) => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);

  const [showTutorial, setShowTutorial] = useState(!isPKMode);
  const [gameState, setGameState] = useState('playing'); // playing, victory, gameOver
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [pkTimeLeft, setPkTimeLeft] = useState(pkTimeLimit || 90);
  const [feedback, setFeedback] = useState(null);

  // Physics state
  const playerRef = useRef({
    x: 400, y: 500,
    vx: 0, vy: 0,
    mass: 50, radius: 25
  });

  const [player, setPlayer] = useState({ ...playerRef.current });
  const [obstacles, setObstacles] = useState([]);
  const [target, setTarget] = useState({ x: 400, y: 100, radius: 35 });
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const levels = [
    {
      id: 1,
      name: 'Cân Bằng Lực',
      description: 'Đẩy vật đến đích bằng lực phù hợp',
      obstacles: [],
      friction: 0.98,
      targetPos: { x: 400, y: 100 },
      playerPos: { x: 400, y: 500 }
    },
    {
      id: 2,
      name: 'Vượt Chướng Ngại',
      description: 'Tránh vùng ma sát cao (màu đỏ)',
      obstacles: [
        { x: 300, y: 300, width: 100, height: 80, friction: 0.7 },
        { x: 500, y: 300, width: 100, height: 80, friction: 0.7 }
      ],
      friction: 0.96,
      targetPos: { x: 400, y: 100 },
      playerPos: { x: 400, y: 500 }
    },
    {
      id: 3,
      name: 'Đường Cong',
      description: 'Sử dụng quán tính để vượt qua',
      obstacles: [
        { x: 200, y: 350, width: 80, height: 60, friction: 0.6 },
        { x: 400, y: 250, width: 80, height: 60, friction: 0.6 },
        { x: 600, y: 350, width: 80, height: 60, friction: 0.6 }
      ],
      friction: 0.97,
      targetPos: { x: 650, y: 100 },
      playerPos: { x: 150, y: 500 }
    },
    {
      id: 4,
      name: 'Ma Sát Cao',
      description: 'Dùng lực lớn để vượt qua ma sát',
      obstacles: [],
      friction: 0.85,
      targetPos: { x: 400, y: 100 },
      playerPos: { x: 400, y: 500 }
    },
    {
      id: 5,
      name: 'Mê Cung Lực',
      description: 'Điều hướng qua nhiều chướng ngại',
      obstacles: [
        { x: 150, y: 200, width: 200, height: 40, friction: 0.5 },
        { x: 450, y: 200, width: 200, height: 40, friction: 0.5 },
        { x: 300, y: 350, width: 200, height: 40, friction: 0.5 }
      ],
      friction: 0.95,
      targetPos: { x: 650, y: 80 },
      playerPos: { x: 100, y: 550 }
    }
  ];

  const currentLevel = levels[level - 1];

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && !showTutorial) {
      timer = setInterval(() => {
        setTimeElapsed(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, showTutorial]);

  // Initialize level
  const initLevel = useCallback(() => {
    const lvl = levels[level - 1];
    playerRef.current = {
      x: lvl.playerPos.x,
      y: lvl.playerPos.y,
      vx: 0,
      vy: 0,
      mass: 50,
      radius: 25
    };
    setPlayer({ ...playerRef.current });
    setObstacles([...lvl.obstacles]);
    setTarget({ x: lvl.targetPos.x, y: lvl.targetPos.y, radius: 35 });
    setDragStart(null);
    setDragCurrent(null);
    setIsDragging(false);
  }, [level]);

  useEffect(() => {
    if (!showTutorial && gameState === 'playing') {
      initLevel();
    }
  }, [showTutorial, level, initLevel, gameState]);

  // Game loop
  const gameLoop = useCallback((timestamp) => {
    if (gameState !== 'playing' || showTutorial) return;

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // Update physics
    const p = playerRef.current;
    const lvl = levels[level - 1];

    // Apply friction
    p.vx *= lvl.friction;
    p.vy *= lvl.friction;

    // Check collision with obstacles
    obstacles.forEach(obs => {
      if (
        p.x + p.radius > obs.x &&
        p.x - p.radius < obs.x + obs.width &&
        p.y + p.radius > obs.y &&
        p.y - p.radius < obs.y + obs.height
      ) {
        p.vx *= obs.friction;
        p.vy *= obs.friction;
      }
    });

    // Update position
    p.x += p.vx;
    p.y += p.vy;

    // Boundary collision
    if (p.x - p.radius < 0) {
      p.x = p.radius;
      p.vx = -p.vx * 0.5;
    }
    if (p.x + p.radius > 800) {
      p.x = 800 - p.radius;
      p.vx = -p.vx * 0.5;
    }
    if (p.y - p.radius < 0) {
      p.y = p.radius;
      p.vy = -p.vy * 0.5;
    }
    if (p.y + p.radius > 600) {
      p.y = 600 - p.radius;
      p.vy = -p.vy * 0.5;
    }

    // Check win condition
    const distToTarget = Math.hypot(p.x - target.x, p.y - target.y);
    if (distToTarget < p.radius + target.radius - 10) {
      const points = Math.max(50, 150 - timeElapsed * 2 - attempts * 10);
      setScore(s => s + points);
      setFeedback({ type: 'success', message: `+${points} điểm!` });
      
      setTimeout(() => {
        setFeedback(null);
        if (level < levels.length) {
          setLevel(l => l + 1);
          setAttempts(0);
        } else {
          setGameState('victory');
          // In PK mode, call onComplete when game is complete
          if (isPKMode && onComplete) {
            onComplete({
              completed: true,
              score: score + points,
              levelsCompleted: level,
              totalLevels: levels.length
            });
          }
        }
      }, 1000);
      return;
    }

    setPlayer({ ...p });

    // Draw
    drawGame();

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, showTutorial, level, obstacles, target, timeElapsed, attempts, isPKMode, onComplete, score]);

  useEffect(() => {
    if (gameState === 'playing' && !showTutorial) {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, showTutorial, gameLoop]);

  // PK mode timer
  useEffect(() => {
    if (isPKMode && gameState === 'playing' && !showTutorial && pkTimeLeft > 0) {
      const timer = setTimeout(() => setPkTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isPKMode && pkTimeLeft === 0 && gameState === 'playing') {
      // Time's up in PK mode
      if (onComplete) {
        onComplete({
          completed: false,
          score: score,
          levelsCompleted: level - 1,
          totalLevels: levels.length
        });
      }
    }
  }, [isPKMode, pkTimeLeft, gameState, showTutorial, onComplete, score, level]);

  // Handle exit
  const handleExit = () => {
    if (isPKMode && onExit) {
      onExit();
    } else {
      navigate(-1);
    }
  };

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw obstacles
    obstacles.forEach(obs => {
      const obsGrad = ctx.createLinearGradient(obs.x, obs.y, obs.x + obs.width, obs.y + obs.height);
      obsGrad.addColorStop(0, '#ef4444');
      obsGrad.addColorStop(1, '#dc2626');
      ctx.fillStyle = obsGrad;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

      // Friction label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `μ=${(1 - obs.friction).toFixed(1)}`,
        obs.x + obs.width / 2,
        obs.y + obs.height / 2
      );
    });

    // Draw target
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
    const targetGrad = ctx.createRadialGradient(
      target.x, target.y, 0,
      target.x, target.y, target.radius
    );
    targetGrad.addColorStop(0, '#4ade80');
    targetGrad.addColorStop(0.6, '#22c55e');
    targetGrad.addColorStop(1, '#16a34a');
    ctx.fillStyle = targetGrad;
    ctx.fill();

    // Target rings
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius - 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius - 16, 0, Math.PI * 2);
    ctx.stroke();
    
    // Target icon
    ctx.fillStyle = 'white';
    ctx.font = '20px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎯', target.x, target.y);

    // Draw player
    const p = playerRef.current;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    const playerGrad = ctx.createRadialGradient(
      p.x - 5, p.y - 5, 0,
      p.x, p.y, p.radius
    );
    playerGrad.addColorStop(0, '#60a5fa');
    playerGrad.addColorStop(0.5, '#3b82f6');
    playerGrad.addColorStop(1, '#2563eb');
    ctx.fillStyle = playerGrad;
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Velocity vector
    const speed = Math.hypot(p.vx, p.vy);
    if (speed > 0.5) {
      const vecLen = Math.min(speed * 8, 60);
      const angle = Math.atan2(p.vy, p.vx);
      const endX = p.x + vecLen * Math.cos(angle);
      const endY = p.y + vecLen * Math.sin(angle);

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Arrow head
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - 10 * Math.cos(angle - Math.PI / 6),
        endY - 10 * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - 10 * Math.cos(angle + Math.PI / 6),
        endY - 10 * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    }

    // Draw drag indicator
    if (isDragging && dragStart && dragCurrent) {
      const dx = dragCurrent.x - dragStart.x;
      const dy = dragCurrent.y - dragStart.y;
      const forceMag = Math.hypot(dx, dy) * 0.15;
      const angle = Math.atan2(dy, dx);

      // Force line
      ctx.setLineDash([8, 4]);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(dragStart.x, dragStart.y);
      ctx.lineTo(dragCurrent.x, dragCurrent.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrow
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(dragCurrent.x, dragCurrent.y);
      ctx.lineTo(
        dragCurrent.x - 15 * Math.cos(angle - Math.PI / 6),
        dragCurrent.y - 15 * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        dragCurrent.x - 15 * Math.cos(angle + Math.PI / 6),
        dragCurrent.y - 15 * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      // Force label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(
        `F = ${forceMag.toFixed(1)}N`,
        (dragStart.x + dragCurrent.x) / 2,
        (dragStart.y + dragCurrent.y) / 2 - 15
      );
    }

    // Info overlay
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(10, 10, 180, 55);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 180, 55);

    ctx.fillStyle = 'white';
    ctx.font = '13px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`🚀 Vận tốc: ${speed.toFixed(1)} m/s`, 20, 32);
    ctx.fillText(`🔧 Ma sát: μ = ${(1 - currentLevel.friction).toFixed(2)}`, 20, 52);

    ctx.restore();
  }, [obstacles, target, isDragging, dragStart, dragCurrent, currentLevel]);

  // Canvas setup with DPR
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    if (!showTutorial) {
      drawGame();
    }
  }, [showTutorial, drawGame]);

  // Mouse/Touch handlers
  const getEventPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleStart = (e) => {
    if (gameState !== 'playing') return;
    e.preventDefault();

    const pos = getEventPos(e);
    const p = playerRef.current;
    const dist = Math.hypot(pos.x - p.x, pos.y - p.y);

    if (dist < p.radius + 20) {
      setIsDragging(true);
      setDragStart({ x: p.x, y: p.y });
      setDragCurrent({ x: pos.x, y: pos.y });
    }
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const pos = getEventPos(e);
    setDragCurrent({ x: pos.x, y: pos.y });
    drawGame();
  };

  const handleEnd = (e) => {
    if (!isDragging) return;

    if (dragStart && dragCurrent) {
      const dx = (dragCurrent.x - dragStart.x) * 0.15;
      const dy = (dragCurrent.y - dragStart.y) * 0.15;

      playerRef.current.vx += dx;
      playerRef.current.vy += dy;
      setPlayer({ ...playerRef.current });
      setAttempts(a => a + 1);
    }

    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  const resetLevel = () => {
    initLevel();
    setAttempts(0);
  };

  const restartGame = () => {
    setLevel(1);
    setScore(0);
    setTimeElapsed(0);
    setAttempts(0);
    setGameState('playing');
  };

  const getBadge = () => {
    if (score >= 600) return { name: 'Bậc Thầy Lực Học', class: 'gold' };
    if (score >= 400) return { name: 'Chuyên Gia Vật Lý', class: 'silver' };
    return { name: 'Nhà Khám Phá', class: 'bronze' };
  };

  // Tutorial Screen
  if (showTutorial) {
    return (
      <div className="force-arena">
        <div className="fa-tutorial-overlay">
          <div className="fa-tutorial-card">
            <div className="fa-tutorial-icon">
              <Zap size={40} />
            </div>
            <h2>Võ Đài Lực Học</h2>
            <p className="fa-tutorial-subtitle">Làm chủ định luật Newton!</p>
            
            <div className="fa-tutorial-steps">
              <div className="fa-tutorial-step">
                <span className="fa-step-icon">👆</span>
                <div className="fa-step-content">
                  <strong>Kéo và Thả</strong>
                  <span>Click vào vật xanh, kéo để tạo lực</span>
                </div>
              </div>
              <div className="fa-tutorial-step">
                <span className="fa-step-icon">🎯</span>
                <div className="fa-step-content">
                  <strong>Đưa vào Đích</strong>
                  <span>Điều hướng vật đến mục tiêu xanh lá</span>
                </div>
              </div>
              <div className="fa-tutorial-step">
                <span className="fa-step-icon">⚠️</span>
                <div className="fa-step-content">
                  <strong>Tránh Vùng Đỏ</strong>
                  <span>Vùng đỏ có ma sát cao, làm chậm vật</span>
                </div>
              </div>
              <div className="fa-tutorial-step">
                <span className="fa-step-icon">🧮</span>
                <div className="fa-step-content">
                  <strong>Công thức</strong>
                  <span>F = m × a (Lực = Khối lượng × Gia tốc)</span>
                </div>
              </div>
            </div>

            <button className="fa-start-btn" onClick={() => setShowTutorial(false)}>
              <Zap size={20} />
              Bắt Đầu Thử Thách
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Victory Screen
  if (gameState === 'victory') {
    const badge = getBadge();
    return (
      <div className="force-arena">
        <div className="fa-game-over">
          <Award size={80} className="fa-trophy" />
          <h2>🎉 Hoàn Thành Xuất Sắc!</h2>

          <div className="fa-final-stats">
            <div className="fa-final-stat">
              <div className="fa-final-stat-icon gold">
                <Star size={24} />
              </div>
              <div className="fa-final-stat-value">{score}</div>
              <div className="fa-final-stat-label">Tổng điểm</div>
            </div>
            <div className="fa-final-stat">
              <div className="fa-final-stat-icon green">
                <Target size={24} />
              </div>
              <div className="fa-final-stat-value">{levels.length}</div>
              <div className="fa-final-stat-label">Cấp hoàn thành</div>
            </div>
            <div className="fa-final-stat">
              <div className="fa-final-stat-icon blue">
                <Clock size={24} />
              </div>
              <div className="fa-final-stat-value">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</div>
              <div className="fa-final-stat-label">Thời gian</div>
            </div>
          </div>

          <div className="fa-achievement">
            <span className={`fa-badge ${badge.class}`}>🏆 {badge.name}</span>
          </div>

          <div className="fa-actions">
            <button className="fa-restart-btn" onClick={restartGame}>
              <RotateCcw size={18} />
              Chơi Lại
            </button>
            <button className="fa-menu-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
              Thoát
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="force-arena">
      {/* Header - Hide in PK mode */}
      {!isPKMode && (
        <header className="fa-header">
          <button className="fa-back-btn" onClick={handleExit}>
            <ArrowLeft size={20} />
            <span>Thoát</span>
          </button>
          <div className="fa-title">
            <h1>⚔️ Võ Đài Lực Học</h1>
          </div>
          <div className="fa-level-badge">Cấp {level}/{levels.length}</div>
        </header>
      )}

      <main className="fa-main">
        {/* Stats */}
        <div className="fa-stats-bar">
          <div className="fa-stat">
            <Star size={20} className="fa-stat-icon gold" />
            <div className="fa-stat-info">
              <span className="fa-stat-label">Điểm</span>
              <span className="fa-stat-value">{score}</span>
            </div>
          </div>
          <div className="fa-stat">
            <Target size={20} className="fa-stat-icon green" />
            <div className="fa-stat-info">
              <span className="fa-stat-label">Lần thử</span>
              <span className="fa-stat-value">{attempts}</span>
            </div>
          </div>
          <div className="fa-stat">
            <Clock size={20} className="fa-stat-icon blue" />
            <div className="fa-stat-info">
              <span className="fa-stat-label">{isPKMode ? 'Còn lại' : 'Thời gian'}</span>
              <span className="fa-stat-value" style={{ color: isPKMode && pkTimeLeft < 15 ? '#ef4444' : 'inherit' }}>
                {isPKMode ? `${pkTimeLeft}s` : `${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}`}
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="fa-progress-container">
          <div className="fa-progress-bar">
            <div 
              className="fa-progress-fill" 
              style={{ width: `${(level / levels.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Level Info */}
        <div className="fa-level-panel">
          <h3>{currentLevel.name}</h3>
          <p>{currentLevel.description}</p>
        </div>

        {/* Canvas */}
        <div className="fa-canvas-container">
          <canvas
            ref={canvasRef}
            className="fa-canvas"
            style={{ width: 800, height: 600 }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`fa-feedback ${feedback.type}`}>
            <div className="fa-feedback-icon">
              {feedback.type === 'success' ? <Check size={24} /> : <X size={24} />}
            </div>
            <span className="fa-feedback-message">{feedback.message}</span>
          </div>
        )}

        {/* Reset Button */}
        <button className="fa-reset-btn" onClick={resetLevel}>
          <RotateCcw size={18} />
          Đặt lại vị trí
        </button>

        {/* Instructions hint */}
        <div className="fa-hint">
          <Move size={16} />
          <span>Kéo vật thể xanh để tạo lực đẩy</span>
        </div>
      </main>
    </div>
  );
};

export default ForceArena;

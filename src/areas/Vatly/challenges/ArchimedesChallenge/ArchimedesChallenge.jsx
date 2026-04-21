import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, RotateCcw, Star, Target, Clock, Check, X, Waves, Anchor } from 'lucide-react';
import './ArchimedesChallenge.css';

const ArchimedesChallenge = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const [showTutorial, setShowTutorial] = useState(true);
  const [gameState, setGameState] = useState('playing');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [feedback, setFeedback] = useState(null);

  // Physics
  const [objects, setObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [levelComplete, setLevelComplete] = useState(false);

  const WATER_DENSITY = 1000;
  const GRAVITY = 9.81;
  const WATER_SURFACE_Y = 180;
  const CONTAINER_LEFT = 50;
  const CONTAINER_RIGHT = 550;
  const CONTAINER_BOTTOM = 420;

  const levels = [
    {
      id: 1,
      name: 'Vật Nổi',
      description: 'Thả vật có mật độ < 1000 kg/m³ vào nước',
      objects: [
        { id: 1, name: 'Gỗ', emoji: '🪵', mass: 0.6, volume: 0.001, density: 600, color: '#d97706' },
        { id: 2, name: 'Sắt', emoji: '🔩', mass: 7.8, volume: 0.001, density: 7800, color: '#64748b' },
        { id: 3, name: 'Nhôm', emoji: '🥄', mass: 2.7, volume: 0.001, density: 2700, color: '#94a3b8' }
      ],
      target: 'float',
      targetDensity: '<1000'
    },
    {
      id: 2,
      name: 'Vật Chìm',
      description: 'Thả vật có mật độ > 1000 kg/m³ vào nước',
      objects: [
        { id: 1, name: 'Nhựa', emoji: '🧴', mass: 0.7, volume: 0.001, density: 700, color: '#22c55e' },
        { id: 2, name: 'Thép', emoji: '⚙️', mass: 7.9, volume: 0.001, density: 7900, color: '#475569' },
        { id: 3, name: 'Bấc', emoji: '🧈', mass: 0.5, volume: 0.001, density: 500, color: '#fbbf24' }
      ],
      target: 'sink',
      targetDensity: '>1000'
    },
    {
      id: 3,
      name: 'Thử Thách Sắp Xếp',
      description: 'Thả TẤT CẢ vật vào nước và quan sát',
      objects: [
        { id: 1, name: 'Gỗ', emoji: '🪵', mass: 0.5, volume: 0.001, density: 500, color: '#d97706' },
        { id: 2, name: 'Nước Đá', emoji: '🧊', mass: 0.92, volume: 0.001, density: 920, color: '#60a5fa' },
        { id: 3, name: 'Đá', emoji: '🪨', mass: 2.6, volume: 0.001, density: 2600, color: '#78716c' },
        { id: 4, name: 'Kim Loại', emoji: '🔧', mass: 8.0, volume: 0.001, density: 8000, color: '#71717a' }
      ],
      target: 'all',
      targetDensity: 'all'
    },
    {
      id: 4,
      name: 'Bậc Thầy Archimedes',
      description: 'Dự đoán và thả đúng vật',
      objects: [
        { id: 1, name: 'Cao Su', emoji: '🎈', mass: 1.1, volume: 0.001, density: 1100, color: '#f43f5e' },
        { id: 2, name: 'Xốp', emoji: '📦', mass: 0.1, volume: 0.001, density: 100, color: '#fef08a' },
        { id: 3, name: 'Thủy Tinh', emoji: '🔮', mass: 2.5, volume: 0.001, density: 2500, color: '#a5b4fc' },
        { id: 4, name: 'Bóng', emoji: '⚽', mass: 0.4, volume: 0.001, density: 400, color: '#fb923c' }
      ],
      target: 'float',
      targetDensity: '<1000'
    }
  ];

  const currentLevel = levels[level - 1];

  // Timer
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && !showTutorial && !levelComplete) {
      timer = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, showTutorial, levelComplete]);

  // Initialize level
  const initLevel = useCallback(() => {
    const startX = 620;
    const objs = currentLevel.objects.map((obj, i) => ({
      ...obj,
      x: startX,
      y: 100 + i * 80,
      vy: 0,
      inWater: false,
      settled: false
    }));
    setObjects(objs);
    setSelectedObject(null);
    setIsDragging(false);
    setLevelComplete(false);
    setTimeElapsed(0);
  }, [currentLevel]);

  useEffect(() => {
    if (!showTutorial && gameState === 'playing') {
      initLevel();
    }
  }, [showTutorial, level, initLevel, gameState]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing' || showTutorial || levelComplete) return;

    setObjects(prevObjects => {
      const newObjects = prevObjects.map(obj => {
        if (obj.settled || (isDragging && selectedObject === obj.id)) {
          return obj;
        }

        // Only process if in container zone
        if (obj.x < CONTAINER_LEFT || obj.x > CONTAINER_RIGHT) {
          return obj;
        }

        let newY = obj.y;
        let newVy = obj.vy;
        const objectSize = 50;
        const halfSize = objectSize / 2;

        const inWater = obj.y + halfSize > WATER_SURFACE_Y && obj.y < CONTAINER_BOTTOM;

        if (inWater) {
          const weight = obj.mass * GRAVITY;
          const buoyancy = WATER_DENSITY * obj.volume * GRAVITY;
          const netForce = weight - buoyancy;
          const acceleration = netForce / obj.mass;

          newVy = (newVy + acceleration * 0.016) * 0.92;
          newY += newVy;

          // Settled check
          if (Math.abs(newVy) < 0.15) {
            if (obj.density < WATER_DENSITY) {
              // Float
              const submergedRatio = obj.density / WATER_DENSITY;
              newY = WATER_SURFACE_Y + (objectSize * submergedRatio) - halfSize;
            } else {
              // Sink
              newY = Math.min(newY, CONTAINER_BOTTOM - halfSize);
            }
            return { ...obj, y: newY, vy: 0, inWater: true, settled: true };
          }

          return { ...obj, y: newY, vy: newVy, inWater: true };
        } else if (obj.y < WATER_SURFACE_Y && obj.x >= CONTAINER_LEFT && obj.x <= CONTAINER_RIGHT) {
          // Falling into water
          newVy += GRAVITY * 0.016 * 5;
          newY += newVy;
          return { ...obj, y: newY, vy: newVy, inWater: false };
        }

        return obj;
      });

      // Check victory
      checkVictory(newObjects);

      return newObjects;
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, showTutorial, levelComplete, isDragging, selectedObject]);

  useEffect(() => {
    if (gameState === 'playing' && !showTutorial && !levelComplete) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, showTutorial, levelComplete, gameLoop]);

  const checkVictory = (currentObjects) => {
    const inWaterObjects = currentObjects.filter(obj => 
      obj.settled && obj.x >= CONTAINER_LEFT && obj.x <= CONTAINER_RIGHT
    );

    if (inWaterObjects.length === 0) return;

    let success = false;
    let message = '';

    if (currentLevel.target === 'float') {
      const floatingObj = inWaterObjects.find(obj => obj.density < WATER_DENSITY);
      if (floatingObj) {
        success = true;
        message = `${floatingObj.emoji} ${floatingObj.name} nổi! (ρ=${floatingObj.density} < 1000)`;
      }
    } else if (currentLevel.target === 'sink') {
      const sinkingObj = inWaterObjects.find(obj => obj.density > WATER_DENSITY);
      if (sinkingObj) {
        success = true;
        message = `${sinkingObj.emoji} ${sinkingObj.name} chìm! (ρ=${sinkingObj.density} > 1000)`;
      }
    } else if (currentLevel.target === 'all') {
      if (inWaterObjects.length === currentLevel.objects.length) {
        success = true;
        const floating = inWaterObjects.filter(o => o.density < WATER_DENSITY).length;
        const sinking = inWaterObjects.filter(o => o.density > WATER_DENSITY).length;
        message = `Hoàn thành! ${floating} nổi, ${sinking} chìm`;
      }
    }

    if (success && !levelComplete) {
      setLevelComplete(true);
      const points = Math.max(50, 200 - timeElapsed * 2);
      setScore(s => s + points);
      setFeedback({ type: 'success', message: `+${points} điểm! ${message}` });

      setTimeout(() => {
        setFeedback(null);
        if (level < levels.length) {
          setLevel(l => l + 1);
        } else {
          setGameState('victory');
        }
      }, 2000);
    }
  };

  // Draw
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
    bgGrad.addColorStop(0, '#0c4a6e');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Container
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(CONTAINER_LEFT, WATER_SURFACE_Y - 50);
    ctx.lineTo(CONTAINER_LEFT, CONTAINER_BOTTOM);
    ctx.lineTo(CONTAINER_RIGHT, CONTAINER_BOTTOM);
    ctx.lineTo(CONTAINER_RIGHT, WATER_SURFACE_Y - 50);
    ctx.stroke();

    // Water
    const waterGrad = ctx.createLinearGradient(0, WATER_SURFACE_Y, 0, CONTAINER_BOTTOM);
    waterGrad.addColorStop(0, 'rgba(59, 130, 246, 0.6)');
    waterGrad.addColorStop(1, 'rgba(30, 64, 175, 0.8)');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(CONTAINER_LEFT + 2, WATER_SURFACE_Y, CONTAINER_RIGHT - CONTAINER_LEFT - 4, CONTAINER_BOTTOM - WATER_SURFACE_Y - 2);

    // Water surface
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(CONTAINER_LEFT, WATER_SURFACE_Y);
    ctx.lineTo(CONTAINER_RIGHT, WATER_SURFACE_Y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Surface label
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Mặt nước', CONTAINER_LEFT + 10, WATER_SURFACE_Y - 10);

    // Objects
    objects.forEach(obj => {
      const size = 50;
      const halfSize = size / 2;
      const x = obj.x;
      const y = obj.y;

      // Object background
      ctx.fillStyle = obj.color;
      ctx.beginPath();
      ctx.roundRect(x - halfSize, y - halfSize, size, size, 8);
      ctx.fill();

      // Border
      ctx.strokeStyle = isDragging && selectedObject === obj.id ? '#fbbf24' : 'rgba(255,255,255,0.3)';
      ctx.lineWidth = isDragging && selectedObject === obj.id ? 3 : 2;
      ctx.stroke();

      // Emoji
      ctx.font = '24px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obj.emoji, x, y - 2);

      // Density label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px system-ui';
      ctx.fillText(`ρ=${obj.density}`, x, y + 20);

      // Force arrows when settled in water
      if (obj.settled && obj.inWater) {
        const weight = obj.mass * GRAVITY;
        const buoyancy = WATER_DENSITY * obj.volume * GRAVITY;

        // Weight (down)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 15, y);
        ctx.lineTo(x - 15, y + 30);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(x - 15, y + 30);
        ctx.lineTo(x - 19, y + 24);
        ctx.lineTo(x - 11, y + 24);
        ctx.closePath();
        ctx.fill();

        // Buoyancy (up)
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 15, y);
        ctx.lineTo(x + 15, y - 30);
        ctx.stroke();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(x + 15, y - 30);
        ctx.lineTo(x + 11, y - 24);
        ctx.lineTo(x + 19, y - 24);
        ctx.closePath();
        ctx.fill();
      }
    });

    // Formula panel
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 200, 80, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Lực đẩy Archimedes', 20, 32);
    ctx.fillStyle = '#fbbf24';
    ctx.font = '16px monospace';
    ctx.fillText('FA = ρ × V × g', 20, 55);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px system-ui';
    ctx.fillText('ρ nước = 1000 kg/m³', 20, 78);

    // Objects area label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Kéo vật vào nước →', 640, 60);

    ctx.restore();
  }, [objects, isDragging, selectedObject]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
  }, []);

  useEffect(() => {
    if (!showTutorial && gameState === 'playing') {
      drawCanvas();
    }
  }, [objects, showTutorial, gameState, drawCanvas]);

  // Handlers
  const getEventPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleStart = (e) => {
    if (gameState !== 'playing' || levelComplete) return;
    e.preventDefault();
    const pos = getEventPos(e);

    const clickedObj = objects.find(obj => {
      const size = 50;
      return (
        pos.x >= obj.x - size / 2 &&
        pos.x <= obj.x + size / 2 &&
        pos.y >= obj.y - size / 2 &&
        pos.y <= obj.y + size / 2
      );
    });

    if (clickedObj) {
      setSelectedObject(clickedObj.id);
      setIsDragging(true);
      setDragOffset({ x: pos.x - clickedObj.x, y: pos.y - clickedObj.y });
    }
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const pos = getEventPos(e);

    setObjects(prev =>
      prev.map(obj =>
        obj.id === selectedObject
          ? { ...obj, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y, vy: 0, settled: false, inWater: false }
          : obj
      )
    );
    drawCanvas();
  };

  const handleEnd = () => {
    setIsDragging(false);
    setSelectedObject(null);
  };

  const restartGame = () => {
    setLevel(1);
    setScore(0);
    setTimeElapsed(0);
    setGameState('playing');
    initLevel();
  };

  const getBadge = () => {
    if (score >= 600) return { name: 'Bậc Thầy Archimedes', class: 'gold' };
    if (score >= 400) return { name: 'Nhà Vật Lý Học', class: 'silver' };
    return { name: 'Nhà Thí Nghiệm', class: 'bronze' };
  };

  // Tutorial
  if (showTutorial) {
    return (
      <div className="archimedes-challenge">
        <div className="ac-tutorial-overlay">
          <div className="ac-tutorial-card">
            <div className="ac-tutorial-icon">
              <Waves size={40} />
            </div>
            <h2>Thử Thách Archimedes</h2>
            <p className="ac-tutorial-subtitle">Khám phá lực đẩy Archimedes!</p>

            <div className="ac-tutorial-steps">
              <div className="ac-tutorial-step">
                <span className="ac-step-icon">👆</span>
                <div className="ac-step-content">
                  <strong>Kéo & Thả</strong>
                  <span>Kéo vật vào bể nước</span>
                </div>
              </div>
              <div className="ac-tutorial-step">
                <span className="ac-step-icon">🔬</span>
                <div className="ac-step-content">
                  <strong>Quan sát</strong>
                  <span>Xem vật nổi hay chìm</span>
                </div>
              </div>
              <div className="ac-tutorial-step">
                <span className="ac-step-icon">📐</span>
                <div className="ac-step-content">
                  <strong>Công thức</strong>
                  <span>FA = ρ × V × g</span>
                </div>
              </div>
              <div className="ac-tutorial-step">
                <span className="ac-step-icon">💡</span>
                <div className="ac-step-content">
                  <strong>Quy tắc</strong>
                  <span>ρ vật {'<'} ρ nước → Nổi | ρ vật {'>'} ρ nước → Chìm</span>
                </div>
              </div>
            </div>

            <button className="ac-start-btn" onClick={() => setShowTutorial(false)}>
              <Anchor size={20} />
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
      <div className="archimedes-challenge">
        <div className="ac-game-over">
          <Award size={80} className="ac-trophy" />
          <h2>🎉 Xuất Sắc!</h2>

          <div className="ac-final-stats">
            <div className="ac-final-stat">
              <div className="ac-final-stat-icon gold"><Star size={24} /></div>
              <div className="ac-final-stat-value">{score}</div>
              <div className="ac-final-stat-label">Tổng điểm</div>
            </div>
            <div className="ac-final-stat">
              <div className="ac-final-stat-icon green"><Target size={24} /></div>
              <div className="ac-final-stat-value">{levels.length}</div>
              <div className="ac-final-stat-label">Cấp hoàn thành</div>
            </div>
            <div className="ac-final-stat">
              <div className="ac-final-stat-icon blue"><Clock size={24} /></div>
              <div className="ac-final-stat-value">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</div>
              <div className="ac-final-stat-label">Thời gian</div>
            </div>
          </div>

          <div className="ac-achievement">
            <span className={`ac-badge ${badge.class}`}>🏆 {badge.name}</span>
          </div>

          <div className="ac-actions">
            <button className="ac-restart-btn" onClick={restartGame}>
              <RotateCcw size={18} />
              Chơi Lại
            </button>
            <button className="ac-menu-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
              Thoát
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="archimedes-challenge">
      {/* Header */}
      <header className="ac-header">
        <button className="ac-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Thoát</span>
        </button>
        <div className="ac-title">
          <h1>🌊 Thử Thách Archimedes</h1>
        </div>
        <div className="ac-level-badge">Cấp {level}/{levels.length}</div>
      </header>

      <main className="ac-main">
        {/* Stats */}
        <div className="ac-stats-bar">
          <div className="ac-stat">
            <Star size={20} className="ac-stat-icon gold" />
            <div className="ac-stat-info">
              <span className="ac-stat-label">Điểm</span>
              <span className="ac-stat-value">{score}</span>
            </div>
          </div>
          <div className="ac-stat">
            <Clock size={20} className="ac-stat-icon blue" />
            <div className="ac-stat-info">
              <span className="ac-stat-label">Thời gian</span>
              <span className="ac-stat-value">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="ac-progress-container">
          <div className="ac-progress-bar">
            <div className="ac-progress-fill" style={{ width: `${(level / levels.length) * 100}%` }} />
          </div>
        </div>

        {/* Level Info */}
        <div className="ac-level-panel">
          <h3>{currentLevel.name}</h3>
          <p>{currentLevel.description}</p>
          <div className="ac-target-badge">
            Mục tiêu: {currentLevel.target === 'float' ? '🔺 Tìm vật NỔI' : currentLevel.target === 'sink' ? '🔻 Tìm vật CHÌM' : '🎯 Thả TẤT CẢ vật'}
          </div>
        </div>

        {/* Canvas */}
        <div className="ac-canvas-container">
          <canvas
            ref={canvasRef}
            className="ac-canvas"
            style={{ width: 700, height: 480 }}
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
          <div className={`ac-feedback ${feedback.type}`}>
            <div className="ac-feedback-icon">
              {feedback.type === 'success' ? <Check size={24} /> : <X size={24} />}
            </div>
            <span className="ac-feedback-message">{feedback.message}</span>
          </div>
        )}

        {/* Reset */}
        <button className="ac-reset-btn" onClick={initLevel}>
          <RotateCcw size={16} />
          Đặt lại
        </button>
      </main>
    </div>
  );
};

export default ArchimedesChallenge;

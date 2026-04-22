import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, RotateCcw, Eye, Target, Play, Home, CheckCircle, Zap, Star, Sparkles, Settings, RefreshCw, X, Lightbulb } from 'lucide-react';
import './MirrorLabGame.css';

const MirrorLabGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState('tutorial');
  const [currentMode, setCurrentMode] = useState('plane');
  const [objectPosition, setObjectPosition] = useState(200);
  const [mirrorType, setMirrorType] = useState('plane');
  const [focalLength, setFocalLength] = useState(100);
  const [showRays, setShowRays] = useState(true);
  const [imageProperties, setImageProperties] = useState(null);
  const [challengeMode, setChallengeMode] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [attempts, setAttempts] = useState(3);
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const challenges = [
    {
      id: 1,
      name: 'Tạo ảnh nhỏ bằng 1/2',
      description: 'Sử dụng gương cầu lồi để tạo ảnh nhỏ bằng 1/2 vật',
      mirrorType: 'convex',
      targetMagnification: 0.5,
      allowedObjectRange: { min: 50, max: 250 },
      allowedFocalRange: { min: 50, max: 150 },
      hint: 'Điều chỉnh vị trí vật và tiêu cự để đạt độ phóng đại = 0.5'
    },
    {
      id: 2,
      name: 'Tạo ảnh thật lớn gấp đôi',
      description: 'Dùng gương cầu lõm để tạo ảnh thật lớn gấp 2 lần vật',
      mirrorType: 'concave',
      targetMagnification: 2.0,
      imageType: 'real',
      allowedObjectRange: { min: 100, max: 300 },
      allowedFocalRange: { min: 80, max: 120 },
      hint: 'Đặt vật ngoài tiêu điểm, điều chỉnh để đạt độ phóng đại = 2'
    },
    {
      id: 3,
      name: 'Tạo ảnh ảo lớn gấp 3',
      description: 'Dùng gương cầu lõm để tạo ảnh ảo lớn gấp 3 lần vật',
      mirrorType: 'concave',
      targetMagnification: 3.0,
      imageType: 'virtual',
      allowedObjectRange: { min: 50, max: 150 },
      allowedFocalRange: { min: 80, max: 120 },
      hint: 'Đặt vật trong tiêu điểm để tạo ảnh ảo phóng đại'
    },
    {
      id: 4,
      name: 'Ứng dụng gương chiếu hậu',
      description: 'Tạo ảnh nhỏ hơn 1/3 vật như gương chiếu hậu xe máy',
      mirrorType: 'convex',
      targetMagnification: 0.33,
      allowedObjectRange: { min: 100, max: 300 },
      allowedFocalRange: { min: 60, max: 100 },
      hint: 'Gương cầu lồi luôn tạo ảnh ảo, nhỏ hơn vật, trường nhìn rộng'
    },
    {
      id: 5,
      name: 'Gương phóng đại',
      description: 'Dùng gương lõm tạo ảnh ảo phóng đại gấp 4 lần',
      mirrorType: 'concave',
      targetMagnification: 4.0,
      imageType: 'virtual',
      allowedObjectRange: { min: 30, max: 100 },
      allowedFocalRange: { min: 80, max: 120 },
      hint: 'Đặt vật rất gần gương, trong tiêu điểm'
    }
  ];

  useEffect(() => {
    if (gameState === 'playing') {
      drawMirrorLab();
    }
  }, [gameState, objectPosition, mirrorType, focalLength, showRays]);

  useEffect(() => {
    calculateImageProperties();
  }, [objectPosition, mirrorType, focalLength]);

  const startFreeMode = () => {
    setGameState('playing');
    setChallengeMode(false);
    setMirrorType('plane');
    setObjectPosition(200);
    setFocalLength(100);
  };

  const startChallengeMode = () => {
    setGameState('playing');
    setChallengeMode(true);
    setLevel(1);
    setScore(0);
    setCompletedChallenges(0);
    loadChallenge(1);
  };

  const loadChallenge = (levelNum) => {
    const challenge = challenges[levelNum - 1];
    setCurrentChallenge(challenge);
    setMirrorType(challenge.mirrorType);
    setObjectPosition(challenge.allowedObjectRange.min + 50);
    setFocalLength(challenge.allowedFocalRange ? challenge.allowedFocalRange.min + 20 : 100);
    setAttempts(3);
  };

  const drawMirrorLab = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;
    const mirrorX = width / 2;

    ctx.fillStyle = '#0f0f1e';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#1a1a30';
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

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    drawObject(ctx, objectPosition, centerY);

    if (mirrorType === 'plane') {
      drawPlaneMirror(ctx, mirrorX, centerY);
      if (showRays) drawPlaneRays(ctx, objectPosition, mirrorX, centerY);
    } else if (mirrorType === 'convex') {
      drawConvexMirror(ctx, mirrorX, centerY, focalLength);
      if (showRays) drawConvexRays(ctx, objectPosition, mirrorX, centerY, focalLength);
    } else if (mirrorType === 'concave') {
      drawConcaveMirror(ctx, mirrorX, centerY, focalLength);
      if (showRays) drawConcaveRays(ctx, objectPosition, mirrorX, centerY, focalLength);
    }

    if (mirrorType !== 'plane') {
      drawFocalPoint(ctx, mirrorX, centerY, focalLength, mirrorType);
    }
  };

  const drawObject = (ctx, x, centerY) => {
    const objectHeight = 60;
    ctx.strokeStyle = '#4caf50';
    ctx.fillStyle = '#4caf50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, centerY);
    ctx.lineTo(x, centerY - objectHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, centerY - objectHeight);
    ctx.lineTo(x - 8, centerY - objectHeight + 15);
    ctx.lineTo(x + 8, centerY - objectHeight + 15);
    ctx.closePath();
    ctx.fill();
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Vật', x - 15, centerY + 30);
  };

  const drawPlaneMirror = (ctx, x, centerY) => {
    const height = 200;
    ctx.strokeStyle = '#00bcd4';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x, centerY - height / 2);
    ctx.lineTo(x, centerY + height / 2);
    ctx.stroke();
    ctx.strokeStyle = '#80deea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 3, centerY - height / 2 + 10);
    ctx.lineTo(x - 3, centerY + height / 2 - 10);
    ctx.stroke();
  };

  const drawConvexMirror = (ctx, x, centerY, focal) => {
    const radius = focal * 2;
    const height = 180;
    ctx.strokeStyle = '#00bcd4';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(x - radius, centerY, radius, -Math.asin(height / 2 / radius), Math.asin(height / 2 / radius));
    ctx.stroke();
  };

  const drawConcaveMirror = (ctx, x, centerY, focal) => {
    const radius = focal * 2;
    const height = 180;
    ctx.strokeStyle = '#00bcd4';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(x + radius, centerY, radius, Math.PI - Math.asin(height / 2 / radius), Math.PI + Math.asin(height / 2 / radius));
    ctx.stroke();
  };

  const drawFocalPoint = (ctx, mirrorX, centerY, focal, type) => {
    const focalX = type === 'convex' ? mirrorX + focal : mirrorX - focal;
    ctx.fillStyle = '#ff9800';
    ctx.beginPath();
    ctx.arc(focalX, centerY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 12px Arial';
    ctx.fillText('F', focalX - 5, centerY - 15);
  };

  const drawPlaneRays = (ctx, objX, mirrorX, centerY) => {
    const objectHeight = 60;
    const dx = mirrorX - objX;
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(objX, centerY - objectHeight);
    ctx.lineTo(mirrorX, centerY - objectHeight);
    ctx.stroke();
    const imageX = mirrorX + dx;
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#ff9800';
    ctx.beginPath();
    ctx.moveTo(mirrorX, centerY - objectHeight);
    ctx.lineTo(imageX, centerY - objectHeight);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#f44336';
    ctx.fillStyle = '#f44336';
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(imageX, centerY);
    ctx.lineTo(imageX, centerY - objectHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(imageX, centerY - objectHeight);
    ctx.lineTo(imageX - 6, centerY - objectHeight + 12);
    ctx.lineTo(imageX + 6, centerY - objectHeight + 12);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Ảnh', imageX - 15, centerY + 30);
  };

  const drawConvexRays = (ctx, objX, mirrorX, centerY, focal) => {
    const objectHeight = 60;
    const objectDist = mirrorX - objX;
    const imageDist = (objectDist * focal) / (objectDist + focal);
    const imageHeight = objectHeight * imageDist / objectDist;
    const imageX = mirrorX + imageDist;
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(objX, centerY - objectHeight);
    ctx.lineTo(mirrorX, centerY - objectHeight);
    ctx.stroke();
    ctx.strokeStyle = '#ff9800';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(mirrorX, centerY - objectHeight);
    ctx.lineTo(imageX, centerY - imageHeight);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#f44336';
    ctx.fillStyle = '#f44336';
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(imageX, centerY);
    ctx.lineTo(imageX, centerY - imageHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(imageX, centerY - imageHeight);
    ctx.lineTo(imageX - 4, centerY - imageHeight + 8);
    ctx.lineTo(imageX + 4, centerY - imageHeight + 8);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Ảnh ảo', imageX - 20, centerY - imageHeight - 10);
  };

  const drawConcaveRays = (ctx, objX, mirrorX, centerY, focal) => {
    const objectHeight = 60;
    const objectDist = mirrorX - objX;
    if (objectDist > focal) {
      const imageDist = (objectDist * focal) / (objectDist - focal);
      const imageHeight = objectHeight * imageDist / objectDist;
      const imageX = mirrorX - imageDist;
      ctx.strokeStyle = '#ffeb3b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(objX, centerY - objectHeight);
      ctx.lineTo(mirrorX, centerY - objectHeight);
      ctx.stroke();
      ctx.strokeStyle = '#ff9800';
      ctx.beginPath();
      ctx.moveTo(mirrorX, centerY - objectHeight);
      ctx.lineTo(imageX, centerY + imageHeight);
      ctx.stroke();
      ctx.strokeStyle = '#f44336';
      ctx.fillStyle = '#f44336';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(imageX, centerY);
      ctx.lineTo(imageX, centerY + imageHeight);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(imageX, centerY + imageHeight);
      ctx.lineTo(imageX - 5, centerY + imageHeight - 10);
      ctx.lineTo(imageX + 5, centerY + imageHeight - 10);
      ctx.closePath();
      ctx.fill();
      ctx.font = 'bold 12px Arial';
      ctx.fillText('Ảnh thật', imageX - 25, centerY + imageHeight + 20);
    } else {
      const imageDist = (objectDist * focal) / (focal - objectDist);
      const imageHeight = objectHeight * imageDist / objectDist;
      const imageX = mirrorX + imageDist;
      ctx.strokeStyle = '#ffeb3b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(objX, centerY - objectHeight);
      ctx.lineTo(mirrorX, centerY - objectHeight);
      ctx.stroke();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#ff9800';
      ctx.beginPath();
      ctx.moveTo(mirrorX, centerY - objectHeight);
      ctx.lineTo(imageX, centerY - imageHeight);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = '#f44336';
      ctx.fillStyle = '#f44336';
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(imageX, centerY);
      ctx.lineTo(imageX, centerY - imageHeight);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(imageX, centerY - imageHeight);
      ctx.lineTo(imageX - 5, centerY - imageHeight + 10);
      ctx.lineTo(imageX + 5, centerY - imageHeight + 10);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.font = 'bold 12px Arial';
      ctx.fillText('Ảnh ảo', imageX - 20, centerY - imageHeight - 10);
    }
  };

  const calculateImageProperties = () => {
    const mirrorX = 400;
    const objectDist = mirrorX - objectPosition;
    let properties = {};
    if (mirrorType === 'plane') {
      properties = {
        type: 'Ảnh ảo',
        position: `${objectDist}cm sau gương`,
        size: 'Bằng vật',
        orientation: 'Cùng chiều',
        magnification: 1.0
      };
    } else if (mirrorType === 'convex') {
      const imageDist = (objectDist * focalLength) / (objectDist + focalLength);
      const mag = imageDist / objectDist;
      properties = {
        type: 'Ảnh ảo',
        position: `${imageDist.toFixed(1)}cm trong gương`,
        size: mag < 1 ? 'Nhỏ hơn vật' : 'Bằng vật',
        orientation: 'Cùng chiều',
        magnification: mag
      };
    } else if (mirrorType === 'concave') {
      if (objectDist > focalLength) {
        const imageDist = (objectDist * focalLength) / (objectDist - focalLength);
        const mag = imageDist / objectDist;
        properties = {
          type: 'Ảnh thật',
          position: `${imageDist.toFixed(1)}cm trước gương`,
          size: mag > 1 ? 'Lớn hơn vật' : mag < 1 ? 'Nhỏ hơn vật' : 'Bằng vật',
          orientation: 'Ngược chiều',
          magnification: mag
        };
      } else {
        const imageDist = (objectDist * focalLength) / (focalLength - objectDist);
        const mag = imageDist / objectDist;
        properties = {
          type: 'Ảnh ảo',
          position: `${imageDist.toFixed(1)}cm sau gương`,
          size: 'Lớn hơn vật',
          orientation: 'Cùng chiều',
          magnification: mag
        };
      }
    }
    setImageProperties(properties);
  };

  const checkChallenge = () => {
    if (!currentChallenge || !imageProperties) return;
    let success = false;
    const tolerance = 0.15;
    if (currentChallenge.targetMagnification) {
      const targetMag = currentChallenge.targetMagnification;
      const actualMag = Math.abs(imageProperties.magnification);
      const diff = Math.abs(actualMag - targetMag);
      if (diff / targetMag <= tolerance) {
        if (currentChallenge.imageType) {
          const expectedType = currentChallenge.imageType === 'real' ? 'Ảnh thật' : 'Ảnh ảo';
          success = imageProperties.type === expectedType;
        } else {
          success = true;
        }
      }
    }
    if (success) {
      handleChallengeSuccess();
    } else {
      handleChallengeFailure();
    }
  };

  const handleChallengeSuccess = () => {
    const points = 200 + (attempts * 50);
    setScore(score + points);
    setCompletedChallenges(completedChallenges + 1);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      if (level < challenges.length) {
        setLevel(level + 1);
        loadChallenge(level + 1);
      } else {
        setGameState('victory');
      }
    }, 1500);
  };

  const handleChallengeFailure = () => {
    setAttempts(attempts - 1);
    if (attempts <= 1) {
      setGameState('gameover');
    }
  };

  const resetGame = () => {
    setLevel(1);
    setScore(0);
    setCompletedChallenges(0);
    setGameState('playing');
    loadChallenge(1);
  };

  return (
    <div className="ml-game">
      {/* Header */}
      <div className="ml-header">
        <button onClick={() => navigate('/advanced-physics-challenge')} className="ml-back-btn">
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div className="ml-title">
          <div className="ml-title-icon">
            <Eye size={28} />
          </div>
          <h1>Phòng Thí Nghiệm Gương</h1>
        </div>
        <div className="ml-stats">
          <div className="ml-stat">
            <Star className="ml-stat-icon gold" size={20} />
            <span>{score}</span>
          </div>
          {challengeMode && (
            <div className="ml-stat">
              <Target className="ml-stat-icon blue" size={20} />
              <span>{level}/{challenges.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tutorial Screen */}
      {gameState === 'tutorial' && (
        <div className="ml-tutorial-overlay">
          <div className="ml-tutorial-card">
            <div className="ml-tutorial-icon">
              <Eye size={48} />
            </div>
            <h2>Phòng Thí Nghiệm Gương</h2>
            <p className="ml-tutorial-subtitle">Khám phá thế giới quang học kỳ diệu</p>
            
            <div className="ml-tutorial-mirrors">
              <div className="ml-mirror-item">
                <span className="mirror-icon">🪞</span>
                <div className="mirror-info">
                  <strong>Gương phẳng</strong>
                  <span>Ảnh ảo, cùng kích thước</span>
                </div>
              </div>
              <div className="ml-mirror-item">
                <span className="mirror-icon">⚫</span>
                <div className="mirror-info">
                  <strong>Gương cầu lồi</strong>
                  <span>Ảnh ảo nhỏ hơn, góc nhìn rộng</span>
                </div>
              </div>
              <div className="ml-mirror-item">
                <span className="mirror-icon">⚪</span>
                <div className="mirror-info">
                  <strong>Gương cầu lõm</strong>
                  <span>Ảnh thật hoặc ảo tùy vị trí</span>
                </div>
              </div>
            </div>

            <div className="ml-mode-buttons">
              <button onClick={startFreeMode} className="ml-mode-btn free">
                <Settings size={22} />
                <span>Thực Hành Tự Do</span>
              </button>
              <button onClick={startChallengeMode} className="ml-mode-btn challenge">
                <Target size={22} />
                <span>Chế Độ Thử Thách</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Playing State */}
      {gameState === 'playing' && (
        <div className="ml-game-content">
          {/* Challenge Info */}
          {challengeMode && currentChallenge && (
            <div className="ml-challenge-card">
              <div className="ml-challenge-header">
                <div className="ml-challenge-level">
                  <span className="level-badge">Thử thách {level}</span>
                  <span className="level-total">/ {challenges.length}</span>
                </div>
                <div className="ml-attempts">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`ml-attempt-dot ${i < attempts ? 'active' : 'used'}`}
                    >
                      {i < attempts ? <CheckCircle size={16} /> : <X size={16} />}
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="ml-challenge-title">{currentChallenge.name}</h3>
              <p className="ml-challenge-desc">{currentChallenge.description}</p>
              
              <button 
                onClick={() => setShowHint(!showHint)} 
                className={`ml-hint-toggle ${showHint ? 'active' : ''}`}
              >
                <Lightbulb size={18} />
                <span>{showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}</span>
              </button>
              
              {showHint && (
                <div className="ml-hint-box">
                  <Lightbulb size={20} className="hint-icon" />
                  <p>{currentChallenge.hint}</p>
                </div>
              )}
            </div>
          )}

          {/* Canvas Container */}
          <div className="ml-canvas-wrapper">
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="ml-canvas"
            />
          </div>

          {/* Controls Panel */}
          <div className="ml-controls-panel">
            {/* Mirror Type Selector */}
            {!challengeMode && (
              <div className="ml-mirror-selector">
                <span className="ml-selector-label">Loại gương:</span>
                <div className="ml-mirror-buttons">
                  <button
                    onClick={() => setMirrorType('plane')}
                    className={`ml-mirror-btn ${mirrorType === 'plane' ? 'active' : ''}`}
                  >
                    🪞 Gương Phẳng
                  </button>
                  <button
                    onClick={() => setMirrorType('convex')}
                    className={`ml-mirror-btn ${mirrorType === 'convex' ? 'active' : ''}`}
                  >
                    ⚫ Gương Lồi
                  </button>
                  <button
                    onClick={() => setMirrorType('concave')}
                    className={`ml-mirror-btn ${mirrorType === 'concave' ? 'active' : ''}`}
                  >
                    ⚪ Gương Lõm
                  </button>
                </div>
              </div>
            )}

            {/* Sliders */}
            <div className="ml-sliders">
              <div className="ml-slider-group">
                <div className="ml-slider-header">
                  <span className="ml-slider-label">Vị trí vật</span>
                  <span className="ml-slider-value">{objectPosition} cm</span>
                </div>
                <input
                  type="range"
                  min={challengeMode && currentChallenge ? currentChallenge.allowedObjectRange.min : 50}
                  max={challengeMode && currentChallenge ? currentChallenge.allowedObjectRange.max : 350}
                  value={objectPosition}
                  onChange={(e) => setObjectPosition(parseInt(e.target.value))}
                  className="ml-slider"
                />
              </div>

              {mirrorType !== 'plane' && (
                <div className="ml-slider-group">
                  <div className="ml-slider-header">
                    <span className="ml-slider-label">Tiêu cự</span>
                    <span className="ml-slider-value">{focalLength} cm</span>
                  </div>
                  <input
                    type="range"
                    min={challengeMode && currentChallenge?.allowedFocalRange ? currentChallenge.allowedFocalRange.min : 50}
                    max={challengeMode && currentChallenge?.allowedFocalRange ? currentChallenge.allowedFocalRange.max : 150}
                    value={focalLength}
                    onChange={(e) => setFocalLength(parseInt(e.target.value))}
                    className="ml-slider"
                  />
                </div>
              )}

              <label className="ml-checkbox">
                <input
                  type="checkbox"
                  checked={showRays}
                  onChange={(e) => setShowRays(e.target.checked)}
                />
                <span className="ml-checkbox-custom"></span>
                <span>Hiển thị tia sáng và ảnh</span>
              </label>
            </div>
          </div>

          {/* Image Properties */}
          {imageProperties && (
            <div className="ml-properties-panel">
              <h3>
                <Sparkles size={20} />
                <span>Tính chất của ảnh</span>
              </h3>
              <div className="ml-properties-grid">
                <div className="ml-property">
                  <span className="property-label">Loại ảnh</span>
                  <span className={`property-value ${imageProperties.type === 'Ảnh thật' ? 'real' : 'virtual'}`}>
                    {imageProperties.type}
                  </span>
                </div>
                <div className="ml-property">
                  <span className="property-label">Vị trí</span>
                  <span className="property-value">{imageProperties.position}</span>
                </div>
                <div className="ml-property">
                  <span className="property-label">Kích thước</span>
                  <span className="property-value">{imageProperties.size}</span>
                </div>
                <div className="ml-property">
                  <span className="property-label">Chiều</span>
                  <span className="property-value">{imageProperties.orientation}</span>
                </div>
                <div className="ml-property highlight">
                  <span className="property-label">Độ phóng đại</span>
                  <span className="property-value">{imageProperties.magnification.toFixed(2)}x</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="ml-action-buttons">
            {challengeMode ? (
              <>
                <button onClick={checkChallenge} className="ml-check-btn">
                  <CheckCircle size={22} />
                  <span>Kiểm Tra</span>
                </button>
                <button onClick={() => loadChallenge(level)} className="ml-reset-btn">
                  <RefreshCw size={20} />
                  <span>Đặt Lại</span>
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setGameState('tutorial')} className="ml-menu-btn">
                  <Home size={20} />
                  <span>Về Menu</span>
                </button>
                <button onClick={startChallengeMode} className="ml-challenge-btn">
                  <Target size={20} />
                  <span>Chế Độ Thử Thách</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Victory Screen */}
      {gameState === 'victory' && (
        <div className="ml-overlay">
          <div className="ml-result-card success">
            <div className="ml-result-icon success">
              <Award size={52} />
            </div>
            <h2>Hoàn Thành Xuất Sắc!</h2>
            <p className="ml-result-score">{score}</p>
            <div className="ml-result-stats">
              <div className="ml-result-stat">
                <CheckCircle size={18} className="stat-icon" />
                <span>{completedChallenges}/{challenges.length} thử thách</span>
              </div>
            </div>
            <div className="ml-stars">
              {[1, 2, 3].map((i) => (
                <Star key={i} size={36} fill="#fbbf24" color="#fbbf24" className="star-icon" />
              ))}
            </div>
            <div className="ml-result-buttons">
              <button onClick={resetGame} className="ml-btn primary">
                <RefreshCw size={20} />
                <span>Chơi Lại</span>
              </button>
              <button onClick={() => navigate('/advanced-physics-challenge')} className="ml-btn secondary">
                <Home size={20} />
                <span>Về Trang Chủ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="ml-overlay">
          <div className="ml-result-card">
            <div className="ml-result-icon">
              <Zap size={52} />
            </div>
            <h2>Thử Lại Nhé!</h2>
            <p className="ml-result-score">{score}</p>
            <div className="ml-result-stats">
              <div className="ml-result-stat">
                <CheckCircle size={18} className="stat-icon" />
                <span>{completedChallenges}/{challenges.length} thử thách</span>
              </div>
            </div>
            <div className="ml-result-message">
              <Lightbulb size={20} />
              <p>Hãy thử điều chỉnh vị trí vật và tiêu cự để đạt độ phóng đại mong muốn!</p>
            </div>
            <div className="ml-result-buttons">
              <button onClick={resetGame} className="ml-btn primary">
                <RefreshCw size={20} />
                <span>Thử Lại</span>
              </button>
              <button onClick={() => navigate('/physics-games/grade/7')} className="ml-btn secondary">
                <Home size={20} />
                <span>Về Trang Chủ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Animation Popup */}
      {showSuccess && (
        <div className="ml-success-popup">
          <div className="ml-success-content">
            <div className="ml-success-icon">
              <CheckCircle size={48} />
            </div>
            <span>Chính xác!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MirrorLabGame;

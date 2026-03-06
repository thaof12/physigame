import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Ear, Wind, Waves, Box, XCircle, Play, Star, RotateCcw, Home, CheckCircle, Lightbulb, Volume2, Trophy, Sparkles, Target, Timer, Zap } from 'lucide-react';
import './SoundTransmissionGame.css';

const SoundTransmissionGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const [gameState, setGameState] = useState('tutorial'); // tutorial, playing, challenge, results
  const [selectedMedium, setSelectedMedium] = useState(null);
  const [animationState, setAnimationState] = useState('idle'); // idle, propagating, finished
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [experimentsCompleted, setExperimentsCompleted] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState([]);
  const [particles, setParticles] = useState([]);
  const [waveRings, setWaveRings] = useState([]);

  const media = {
    air: { 
      name: 'Không khí', 
      icon: Wind, 
      speed: 343, 
      attenuation: 0.7,
      color: '#60a5fa',
      bgGradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
      description: 'Khí quyển bình thường'
    },
    water: { 
      name: 'Nước', 
      icon: Waves, 
      speed: 1480, 
      attenuation: 0.4,
      color: '#06b6d4',
      bgGradient: 'linear-gradient(135deg, #cffafe, #a5f3fc)',
      description: 'Nước tinh khiết 20°C'
    },
    steel: { 
      name: 'Thép', 
      icon: Box, 
      speed: 5960, 
      attenuation: 0.1,
      color: '#94a3b8',
      bgGradient: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
      description: 'Kim loại rắn chắc'
    },
    vacuum: { 
      name: 'Chân không', 
      icon: XCircle, 
      speed: 0, 
      attenuation: 1.0,
      color: '#1e1b4b',
      bgGradient: 'linear-gradient(135deg, #312e81, #1e1b4b)',
      description: 'Không có vật chất'
    },
  };

  const challenges = [
    { question: 'Âm thanh truyền nhanh nhất trong môi trường nào?', answer: 'steel', points: 100 },
    { question: 'Âm thanh KHÔNG truyền được trong môi trường nào?', answer: 'vacuum', points: 100 },
    { question: 'Trong nước, âm truyền nhanh hay chậm hơn không khí?', answer: 'water', hint: 'nhanh hơn', points: 80 },
  ];

  const [currentChallenge, setCurrentChallenge] = useState(0);

  const distance = 500;

  // Particle system
  const createParticles = useCallback((x, y, color, count = 15) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + i,
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        color,
        size: Math.random() * 4 + 2
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Update particles
  useEffect(() => {
    if (particles.length === 0) return;
    
    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 0.03,
          vy: p.vy + 0.2
        }))
        .filter(p => p.life > 0)
      );
    }, 30);

    return () => clearInterval(interval);
  }, [particles.length]);

  // Draw scene with improved visuals
  const drawScene = useCallback((progress = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear and draw background
    ctx.clearRect(0, 0, width, height);
    
    // Main background with gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 30) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw medium area with beautiful gradient
    if (selectedMedium) {
      const medium = media[selectedMedium];
      const mediumGradient = ctx.createLinearGradient(60, 60, width - 60, height - 60);
      
      if (selectedMedium === 'vacuum') {
        mediumGradient.addColorStop(0, 'rgba(30, 27, 75, 0.8)');
        mediumGradient.addColorStop(1, 'rgba(49, 46, 129, 0.6)');
        // Draw stars for vacuum
        ctx.fillStyle = 'white';
        for (let i = 0; i < 50; i++) {
          const starX = 70 + Math.random() * (width - 140);
          const starY = 70 + Math.random() * (height - 140);
          const starSize = Math.random() * 2;
          ctx.beginPath();
          ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (selectedMedium === 'water') {
        mediumGradient.addColorStop(0, 'rgba(6, 182, 212, 0.3)');
        mediumGradient.addColorStop(1, 'rgba(14, 165, 233, 0.2)');
      } else if (selectedMedium === 'air') {
        mediumGradient.addColorStop(0, 'rgba(96, 165, 250, 0.15)');
        mediumGradient.addColorStop(1, 'rgba(147, 197, 253, 0.1)');
      } else if (selectedMedium === 'steel') {
        mediumGradient.addColorStop(0, 'rgba(148, 163, 184, 0.3)');
        mediumGradient.addColorStop(1, 'rgba(100, 116, 139, 0.2)');
      }

      ctx.fillStyle = mediumGradient;
      ctx.beginPath();
      ctx.roundRect(60, 60, width - 120, height - 120, 20);
      ctx.fill();

      // Border glow
      ctx.strokeStyle = medium.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = medium.color;
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Medium label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(medium.name.toUpperCase(), width / 2, 45);
      ctx.font = '12px system-ui';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(medium.description, width / 2, 62);
    }

    // Positions
    const sourceX = 120;
    const receiverX = width - 120;
    const y = height / 2;

    // Draw connection line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(sourceX, y);
    ctx.lineTo(receiverX, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw sound source (Bell) with glow effect
    const bellGlow = animationState === 'propagating' ? 20 : 0;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = bellGlow;
    
    // Bell body
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(sourceX, y - 15, 25, Math.PI * 0.15, Math.PI * 0.85, true);
    ctx.lineTo(sourceX - 25, y + 10);
    ctx.lineTo(sourceX + 25, y + 10);
    ctx.closePath();
    ctx.fill();
    
    // Bell top
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(sourceX, y - 35, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;

    // Source label
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('NGUỒN ÂM', sourceX, y + 45);

    // Draw receiver (Ear)
    const earGlow = animationState === 'finished' && result?.intensity > 0 ? 15 : 0;
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = earGlow;
    
    ctx.fillStyle = earGlow > 0 ? '#22c55e' : '#94a3b8';
    ctx.beginPath();
    ctx.ellipse(receiverX, y, 20, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner ear
    ctx.fillStyle = earGlow > 0 ? '#16a34a' : '#64748b';
    ctx.beginPath();
    ctx.ellipse(receiverX + 5, y, 8, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;

    // Receiver label
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px system-ui';
    ctx.fillText('MÁY THU', receiverX, y + 45);

    // Draw sound waves (multiple rings)
    if (animationState === 'propagating' && selectedMedium && media[selectedMedium].speed > 0) {
      const medium = media[selectedMedium];
      const numRings = 5;
      
      for (let i = 0; i < numRings; i++) {
        const ringProgress = Math.max(0, progress - i * 0.15);
        if (ringProgress <= 0) continue;
        
        const waveX = sourceX + ringProgress * (receiverX - sourceX);
        const opacity = Math.max(0, 1 - ringProgress - i * 0.1);
        const radius = 25 + (1 - ringProgress) * 15;

        ctx.strokeStyle = `rgba(${medium.color === '#60a5fa' ? '96, 165, 250' : 
                                  medium.color === '#06b6d4' ? '6, 182, 212' : 
                                  '148, 163, 184'}, ${opacity * 0.8})`;
        ctx.lineWidth = 3 - i * 0.4;
        ctx.beginPath();
        ctx.arc(waveX, y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Draw particles
    particles.forEach(p => {
      ctx.fillStyle = `rgba(${p.color}, ${p.life})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw distance marker
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${distance}m`, (sourceX + receiverX) / 2, height - 30);

  }, [selectedMedium, animationState, particles, result]);

  useEffect(() => {
    if (gameState === 'playing' || gameState === 'challenge') {
      drawScene();
    }
  }, [selectedMedium, gameState, drawScene]);

  const runSimulation = () => {
    if (!selectedMedium) {
      return;
    }
    
    setAnimationState('propagating');
    setResult(null);

    const medium = media[selectedMedium];
    
    // Create particles at source
    const canvas = canvasRef.current;
    if (canvas) {
      createParticles(120, canvas.height / 2, '251, 191, 36', 20);
    }

    if (medium.speed === 0) {
      // Vacuum case - no sound transmission
      setTimeout(() => {
        setAnimationState('finished');
        setResult({ time: Infinity, intensity: 0 });
        if (!experimentsCompleted.includes(selectedMedium)) {
          setExperimentsCompleted(prev => [...prev, selectedMedium]);
          setScore(prev => prev + 50);
        }
        // Add to comparison
        setComparisonData(prev => {
          const existing = prev.find(d => d.medium === selectedMedium);
          if (existing) return prev;
          return [...prev, { medium: selectedMedium, ...media[selectedMedium], time: Infinity, intensity: 0 }];
        });
      }, 1500);
      
      // Animate showing no transmission
      let frame = 0;
      const maxFrames = 50;
      const animateVacuum = () => {
        if (frame >= maxFrames) return;
        drawScene(frame / maxFrames * 0.3);
        frame++;
        requestAnimationFrame(animateVacuum);
      };
      requestAnimationFrame(animateVacuum);
      return;
    }

    const duration = 2500 / (medium.speed / 343);
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      let progress = Math.min(elapsed / duration, 1);

      drawScene(progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setAnimationState('finished');
        const timeTaken = distance / medium.speed;
        const intensity = 100 * (1 - medium.attenuation);
        setResult({ time: timeTaken, intensity });
        
        // Create particles at receiver
        if (canvas) {
          createParticles(canvas.width - 120, canvas.height / 2, '34, 197, 94', 25);
        }
        
        if (!experimentsCompleted.includes(selectedMedium)) {
          setExperimentsCompleted(prev => [...prev, selectedMedium]);
          setScore(prev => prev + Math.round(50 + intensity / 2));
        }
        
        // Add to comparison
        setComparisonData(prev => {
          const existing = prev.find(d => d.medium === selectedMedium);
          if (existing) return prev;
          return [...prev, { medium: selectedMedium, ...media[selectedMedium], time: timeTaken, intensity }];
        });
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const reset = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setSelectedMedium(null);
    setAnimationState('idle');
    setResult(null);
    setParticles([]);
  };

  const handleChallengeAnswer = (mediumKey) => {
    const challenge = challenges[currentChallenge];
    if (mediumKey === challenge.answer) {
      setScore(prev => prev + challenge.points);
      createParticles(400, 300, '34, 197, 94', 30);
      if (currentChallenge < challenges.length - 1) {
        setTimeout(() => setCurrentChallenge(prev => prev + 1), 1000);
      } else {
        setTimeout(() => setGameState('results'), 1500);
      }
    } else {
      createParticles(400, 300, '239, 68, 68', 20);
    }
  };

  const renderTutorial = () => (
    <div className="st-tutorial-overlay">
      <div className="st-tutorial-card">
        <div className="st-tutorial-icon">
          <Volume2 size={48} />
        </div>
        <h2>Thí Nghiệm Truyền Âm</h2>
        <p className="st-tutorial-subtitle">Khám phá cách âm thanh di chuyển qua các môi trường khác nhau</p>
        
        <div className="st-tutorial-steps">
          <div className="st-tutorial-step">
            <div className="st-step-icon">
              <Target size={18} />
            </div>
            <div className="st-step-content">
              <strong>Chọn môi trường</strong>
              <span>Không khí, Nước, Thép hoặc Chân không</span>
            </div>
          </div>
          <div className="st-tutorial-step">
            <div className="st-step-icon">
              <Bell size={18} />
            </div>
            <div className="st-step-content">
              <strong>Rung chuông tạo sóng âm</strong>
              <span>Quan sát sóng âm lan truyền trong môi trường</span>
            </div>
          </div>
          <div className="st-tutorial-step">
            <div className="st-step-icon">
              <Zap size={18} />
            </div>
            <div className="st-step-content">
              <strong>So sánh kết quả</strong>
              <span>Phân tích tốc độ và cường độ âm thanh</span>
            </div>
          </div>
        </div>

        <div className="st-physics-note">
          <Lightbulb size={20} className="note-icon" />
          <div>
            <p><strong>Quy luật quan trọng:</strong></p>
            <p>V<sub>rắn</sub> &gt; V<sub>lỏng</sub> &gt; V<sub>khí</sub> &gt; V<sub>chân không</sub> = 0</p>
            <p>Âm thanh cần môi trường vật chất để truyền đi!</p>
          </div>
        </div>

        <button onClick={() => setGameState('playing')} className="st-start-btn">
          <Play size={22} />
          <span>Bắt Đầu Thí Nghiệm</span>
        </button>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="st-results-overlay">
      <div className="st-results-card">
        <div className="st-results-icon">
          <Trophy size={48} />
        </div>
        <h2>Thí Nghiệm Hoàn Thành!</h2>
        
        <div className="st-final-score">
          <Star size={32} className="score-star" />
          <span className="score-value">{score}</span>
          <span className="score-label">điểm</span>
        </div>

        <div className="st-achievements">
          <div className="achievement">
            <Sparkles size={20} />
            <span>Đã thử {experimentsCompleted.length}/4 môi trường</span>
          </div>
          {experimentsCompleted.length === 4 && (
            <div className="achievement gold">
              <Trophy size={20} />
              <span>Nhà Khoa Học Âm Thanh!</span>
            </div>
          )}
        </div>

        {comparisonData.length > 1 && (
          <div className="st-comparison-table">
            <h4>So sánh các môi trường</h4>
            <table>
              <thead>
                <tr>
                  <th>Môi trường</th>
                  <th>Tốc độ</th>
                  <th>Cường độ</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.sort((a, b) => b.speed - a.speed).map(d => (
                  <tr key={d.medium}>
                    <td>{d.name}</td>
                    <td>{d.speed} m/s</td>
                    <td>{d.intensity.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="st-results-buttons">
          <button onClick={() => {
            setGameState('playing');
            setScore(0);
            setExperimentsCompleted([]);
            setComparisonData([]);
            reset();
          }} className="st-btn primary">
            <RotateCcw size={20} />
            Chơi Lại
          </button>
          <button onClick={() => navigate('/physics-games/grade/7')} className="st-btn secondary">
            <Home size={20} />
            Menu
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="st-game">
      {gameState === 'tutorial' && renderTutorial()}
      {gameState === 'results' && renderResults()}
      
      {/* Header */}
      <header className="st-header">
        <button onClick={() => navigate('/physics-games/grade/7')} className="st-back-btn">
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div className="st-title">
          <div className="st-title-icon">
            <Volume2 size={28} />
          </div>
          <h1>Thí Nghiệm Truyền Âm</h1>
        </div>
        <div className="st-stats">
          <div className="st-stat">
            <Star className="st-stat-icon gold" size={20} />
            <span>{score}</span>
          </div>
          <div className="st-stat experiments">
            <CheckCircle size={18} />
            <span>{experimentsCompleted.length}/4</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="st-game-content">
        {/* Left Panel - Controls */}
        <div className="st-controls-panel">
          <h3 className="st-panel-title">
            <Wind size={20} />
            <span>Chọn Môi Trường</span>
          </h3>
          <div className="st-medium-list">
            {Object.keys(media).map(key => {
              const MediumIcon = media[key].icon;
              const isCompleted = experimentsCompleted.includes(key);
              return (
                <button
                  key={key}
                  className={`st-medium-btn ${selectedMedium === key ? 'selected' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => setSelectedMedium(key)}
                  disabled={animationState === 'propagating'}
                >
                  <div className="medium-icon-wrapper" style={{ background: `${media[key].color}20`, borderColor: media[key].color }}>
                    <MediumIcon size={24} style={{ color: media[key].color }} />
                  </div>
                  <div className="medium-info">
                    <span className="medium-name">{media[key].name}</span>
                    <span className="medium-speed">{media[key].speed > 0 ? `${media[key].speed} m/s` : 'Không truyền'}</span>
                  </div>
                  {isCompleted && <CheckCircle size={18} className="check-icon" />}
                </button>
              );
            })}
          </div>
          
          <div className="st-action-buttons">
            <button 
              className={`st-ring-btn ${animationState === 'propagating' ? 'ringing' : ''}`}
              onClick={runSimulation}
              disabled={!selectedMedium || animationState === 'propagating'}
            >
              <Bell size={22} />
              <span>{animationState === 'propagating' ? 'Đang truyền...' : 'Rung Chuông'}</span>
            </button>
            <button 
              className="st-reset-btn" 
              onClick={reset}
              disabled={animationState === 'propagating'}
            >
              <RotateCcw size={20} />
              <span>Làm Mới</span>
            </button>
          </div>

          {experimentsCompleted.length === 4 && (
            <button 
              className="st-complete-btn"
              onClick={() => setGameState('results')}
            >
              <Trophy size={20} />
              <span>Xem Kết Quả</span>
            </button>
          )}
        </div>

        {/* Center - Canvas */}
        <div className="st-canvas-wrapper">
          <canvas ref={canvasRef} width="800" height="400" className="st-canvas" />
          
          {animationState === 'finished' && selectedMedium === 'vacuum' && (
            <div className="st-vacuum-message">
              <XCircle size={32} />
              <span>Âm thanh không thể truyền trong chân không!</span>
            </div>
          )}
        </div>

        {/* Right Panel - Results */}
        <div className="st-results-panel">
          <h3 className="st-panel-title">
            <Waves size={20} />
            <span>Kết Quả Đo</span>
          </h3>
          {result ? (
            <div className="st-result-cards">
              <div className="st-result-card medium">
                <div className="result-icon" style={{ background: `${media[selectedMedium].color}20` }}>
                  {React.createElement(media[selectedMedium].icon, { size: 24, style: { color: media[selectedMedium].color } })}
                </div>
                <div className="result-data">
                  <span className="result-label">Môi trường</span>
                  <span className="result-value">{media[selectedMedium].name}</span>
                </div>
              </div>
              
              <div className="st-result-card speed">
                <div className="result-icon">
                  <Zap size={24} />
                </div>
                <div className="result-data">
                  <span className="result-label">Tốc độ âm</span>
                  <span className="result-value">
                    {media[selectedMedium].speed > 0 ? (
                      <>{media[selectedMedium].speed} <small>m/s</small></>
                    ) : (
                      <span className="no-transmission">Không truyền</span>
                    )}
                  </span>
                </div>
              </div>
              
              <div className="st-result-card time">
                <div className="result-icon">
                  <Timer size={24} />
                </div>
                <div className="result-data">
                  <span className="result-label">Thời gian ({distance}m)</span>
                  <span className="result-value">
                    {isFinite(result.time) ? (
                      <>{result.time.toFixed(4)} <small>giây</small></>
                    ) : (
                      <span className="infinity">∞</span>
                    )}
                  </span>
                </div>
              </div>
              
              <div className="st-result-card intensity">
                <div className="result-icon">
                  <Volume2 size={24} />
                </div>
                <div className="result-data">
                  <span className="result-label">Cường độ nhận</span>
                  <span className="result-value">{result.intensity.toFixed(0)}%</span>
                  <div className="intensity-bar">
                    <div 
                      className="intensity-fill" 
                      style={{ 
                        width: `${result.intensity}%`,
                        background: result.intensity > 50 ? '#22c55e' : result.intensity > 0 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="st-no-result">
              <Ear size={48} />
              <p>Chọn môi trường và rung chuông để bắt đầu thí nghiệm</p>
            </div>
          )}

          {/* Comparison Section */}
          {comparisonData.length > 1 && (
            <div className="st-comparison-mini">
              <h4>
                <Sparkles size={16} />
                So sánh nhanh
              </h4>
              <div className="comparison-bars">
                {comparisonData.sort((a, b) => b.speed - a.speed).map(d => (
                  <div key={d.medium} className="comparison-bar-item">
                    <span className="bar-label">{d.name}</span>
                    <div className="bar-track">
                      <div 
                        className="bar-fill"
                        style={{ 
                          width: `${(d.speed / 6000) * 100}%`,
                          background: d.color
                        }}
                      />
                    </div>
                    <span className="bar-value">{d.speed}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoundTransmissionGame;

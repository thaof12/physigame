import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, Music, Trophy, Play, Star, RotateCcw, Home, CheckCircle, Lightbulb, Target, Award } from 'lucide-react';
import './WaveFrequencyGame.css';

const WaveFrequencyGame = ({ isPKMode = false, pkTimeLimit, onComplete, onExit }) => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  
  const [gameState, setGameState] = useState(isPKMode ? 'playing' : 'tutorial');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [frequency, setFrequency] = useState(440);
  const [amplitude, setAmplitude] = useState(50);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(3);
  const [message, setMessage] = useState('');
  const [pkTimeLeft, setPkTimeLeft] = useState(pkTimeLimit || 60);

  const levels = [
    {
      level: 1,
      name: 'Tìm Nốt Nhạc Cơ Bản',
      description: 'Điều chỉnh tần số để tạo nốt La (A) - 440 Hz',
      targetFrequency: 440,
      targetAmplitude: null,
      tolerance: 10,
      hint: 'Tần số càng cao, âm thanh càng cao'
    },
    {
      level: 2,
      name: 'Âm Thanh Cao',
      description: 'Tạo nốt Đô cao (High C) - 523 Hz',
      targetFrequency: 523,
      targetAmplitude: null,
      tolerance: 15,
      hint: 'Tăng tần số để tạo âm cao hơn'
    },
    {
      level: 3,
      name: 'Kiểm Soát Âm Lượng',
      description: 'Tạo âm 440 Hz với biên độ 80%',
      targetFrequency: 440,
      targetAmplitude: 80,
      tolerance: 10,
      hint: 'Biên độ quyết định độ to của âm thanh'
    },
    {
      level: 4,
      name: 'Âm Trầm',
      description: 'Tạo nốt Đô thấp (Low C) - 262 Hz với biên độ 60%',
      targetFrequency: 262,
      targetAmplitude: 60,
      tolerance: 10,
      hint: 'Giảm tần số để có âm trầm hơn'
    },
    {
      level: 5,
      name: 'Bậc Thầy Sóng Âm',
      description: 'Tạo nốt Mi (E) - 330 Hz với biên độ chính xác 75%',
      targetFrequency: 330,
      targetAmplitude: 75,
      tolerance: 5,
      hint: 'Cần độ chính xác cao cho cả tần số và biên độ'
    }
  ];

  useEffect(() => {
    if (gameState === 'playing') {
      drawWave();
    }
  }, [frequency, amplitude, gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && gameState === 'playing') {
      const animationFrame = requestAnimationFrame(animateWave);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [gameState, frequency, amplitude]);

  let phase = 0;
  const animateWave = () => {
    phase += 0.05;
    drawWave();
    if (gameState === 'playing') {
      requestAnimationFrame(animateWave);
    }
  };

  const drawWave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (height / 10) * i);
      ctx.lineTo(width, (height / 10) * i);
      ctx.stroke();
    }
    
    // Draw wave
    const level = levels[currentLevel - 1];
    const wavelength = width / (frequency / 100);
    const amplitudePixels = (amplitude / 100) * (height / 2 - 20);
    
    ctx.beginPath();
    ctx.strokeStyle = '#00bcd4';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00bcd4';
    
    for (let x = 0; x < width; x++) {
      const y = height / 2 + Math.sin((x / wavelength) * 2 * Math.PI + phase) * amplitudePixels;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Draw target line if needed
    if (level.targetAmplitude !== null) {
      const targetPixels = (level.targetAmplitude / 100) * (height / 2 - 20);
      ctx.strokeStyle = 'rgba(255, 235, 59, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, height / 2 - targetPixels);
      ctx.lineTo(width, height / 2 - targetPixels);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, height / 2 + targetPixels);
      ctx.lineTo(width, height / 2 + targetPixels);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Draw frequency indicator
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`${frequency} Hz`, 20, 30);
    ctx.font = '16px Arial';
    ctx.fillText(`Biên độ: ${amplitude}%`, 20, 55);
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentLevel(1);
    setScore(0);
    setAttempts(3);
    setFrequency(440);
    setAmplitude(50);
    setMessage('');
  };

  const checkAnswer = () => {
    const level = levels[currentLevel - 1];
    const freqDiff = Math.abs(frequency - level.targetFrequency);
    const freqMatch = freqDiff <= level.tolerance;
    
    let ampMatch = true;
    if (level.targetAmplitude !== null) {
      const ampDiff = Math.abs(amplitude - level.targetAmplitude);
      ampMatch = ampDiff <= level.tolerance;
    }
    
    if (freqMatch && ampMatch) {
      // Success
      const bonus = Math.max(0, (3 - attempts) * 50);
      const levelScore = 200 + bonus;
      setScore(prev => prev + levelScore);
      setMessage(`🎉 Chính xác! +${levelScore} điểm`);
      
      setTimeout(() => {
        if (currentLevel < levels.length) {
          setCurrentLevel(prev => prev + 1);
          setAttempts(3);
          setFrequency(440);
          setAmplitude(50);
          setMessage('');
        } else {
          setGameState('victory');
        }
      }, 1500);
    } else {
      setAttempts(prev => prev - 1);
      
      if (attempts <= 1) {
        setGameState('gameover');
        return;
      }
      
      // Give hints
      let hint = '';
      if (!freqMatch) {
        if (frequency < level.targetFrequency) {
          hint = 'Tần số quá thấp! Tăng lên';
        } else {
          hint = 'Tần số quá cao! Giảm xuống';
        }
      }
      if (!ampMatch) {
        if (amplitude < level.targetAmplitude) {
          hint += (hint ? ' và ' : '') + 'Biên độ quá nhỏ!';
        } else {
          hint += (hint ? ' và ' : '') + 'Biên độ quá lớn!';
        }
      }
      setMessage(`❌ ${hint} (Còn ${attempts - 1} lượt)`);
    }
  };

  const playSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.value = amplitude / 200;
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 500);
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  const resetLevel = () => {
    setFrequency(440);
    setAmplitude(50);
    setMessage('');
  };

  // PK Mode timer
  useEffect(() => {
    if (!isPKMode || gameState === 'tutorial') return;
    
    if (pkTimeLeft > 0 && gameState === 'playing') {
      const timer = setTimeout(() => setPkTimeLeft(pkTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (pkTimeLeft === 0 || gameState === 'victory' || gameState === 'gameover') {
      if (onComplete) {
        onComplete({
          completed: true,
          success: gameState === 'victory',
          score: score,
          accuracy: Math.round((currentLevel / levels.length) * 100)
        });
      }
    }
  }, [isPKMode, pkTimeLeft, gameState, score, currentLevel, onComplete]);

  if (gameState === 'tutorial') {
    return (
      <div className="wf-game">
        <div className="wf-tutorial-overlay">
          <div className="wf-tutorial-card">
            <div className="wf-tutorial-icon">
              <Music size={44} />
            </div>
            <h2>Tần Số Sóng Âm</h2>
            <p className="wf-tutorial-subtitle">Làm chủ các thông số của sóng âm</p>
            
            <div className="wf-tutorial-steps">
              <div className="wf-tutorial-step">
                <div className="wf-step-icon"><Volume2 size={18} /></div>
                <div className="wf-step-content">
                  <strong>Điều chỉnh Tần Số</strong>
                  <span>Kéo thanh trượt để thay đổi cao độ âm thanh</span>
                </div>
              </div>
              <div className="wf-tutorial-step">
                <div className="wf-step-icon"><Target size={18} /></div>
                <div className="wf-step-content">
                  <strong>Điều chỉnh Biên Độ</strong>
                  <span>Thay đổi độ to của âm thanh</span>
                </div>
              </div>
              <div className="wf-tutorial-step">
                <div className="wf-step-icon"><CheckCircle size={18} /></div>
                <div className="wf-step-content">
                  <strong>Kiểm Tra Kết Quả</strong>
                  <span>Nhấn Kiểm Tra khi đã điều chỉnh xong</span>
                </div>
              </div>
            </div>

            <div className="wf-physics-note">
              <Lightbulb size={20} className="note-icon" />
              <div>
                <p><strong>Kiến thức vật lý:</strong></p>
                <p>• Tần số (Hz) quyết định cao độ của âm thanh</p>
                <p>• Biên độ quyết định cường độ (độ to) của âm</p>
              </div>
            </div>

            <button onClick={startGame} className="wf-start-btn">
              <Play size={22} />
              Bắt Đầu Chơi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'victory') {
    return (
      <div className="wf-game">
        <div className="wf-result-overlay">
          <div className="wf-result-card victory">
            <div className="wf-result-icon victory">
              <Trophy size={50} />
            </div>
            <h2>Xuất Sắc!</h2>
            <p className="wf-result-subtitle">Bạn đã làm chủ các sóng âm!</p>
            <div className="wf-final-score">
              <Star size={28} className="score-star" />
              <span>{score}</span>
              <small>điểm</small>
            </div>
            <div className="wf-result-buttons">
              <button onClick={startGame} className="wf-btn primary">
                <RotateCcw size={20} />
                Chơi Lại
              </button>
              <button onClick={() => navigate('/physics-games/grade/7')} className="wf-btn secondary">
                <Home size={20} />
                Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="wf-game">
        <div className="wf-result-overlay">
          <div className="wf-result-card gameover">
            <div className="wf-result-icon gameover">
              <Award size={50} />
            </div>
            <h2>Hết Lượt Thử</h2>
            <p className="wf-result-subtitle">Đạt được cấp độ {currentLevel}/{levels.length}</p>
            <div className="wf-final-score">
              <Star size={28} className="score-star" />
              <span>{score}</span>
              <small>điểm</small>
            </div>
            <div className="wf-result-buttons">
              <button onClick={startGame} className="wf-btn primary">
                <RotateCcw size={20} />
                Thử Lại
              </button>
              <button onClick={() => navigate('/physics-games/grade/7')} className="wf-btn secondary">
                <Home size={20} />
                Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const level = levels[currentLevel - 1];

  return (
    <div className="wf-game">
      {!isPKMode && (
        <header className="wf-header">
          <button onClick={() => navigate('/physics-games/grade/7')} className="wf-back-btn">
            <ArrowLeft size={20} />
            Quay lại
          </button>
          <div className="wf-title">
            <div className="wf-title-icon">
              <Music size={26} />
            </div>
            <h1>Tần Số Sóng Âm</h1>
          </div>
          <div className="wf-stats">
            <div className="wf-stat">
              <Target size={18} />
              <span>Cấp {currentLevel}/{levels.length}</span>
            </div>
            <div className="wf-stat">
              <Star size={18} className="wf-stat-icon gold" />
              <span>{score}</span>
            </div>
          </div>
        </header>
      )}

      <div className="wf-game-content">
        {/* Level Info Card */}
        <div className="wf-level-card">
          <div className="wf-level-header">
            <h2>{level.name}</h2>
            <p className="wf-level-desc">{level.description}</p>
          </div>
          <div className="wf-attempts">
            <span className="wf-attempts-label">Lượt thử:</span>
            <div className="wf-attempts-dots">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`wf-attempt-dot ${i < attempts ? 'active' : 'used'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="wf-canvas-wrapper">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={300}
            className="wf-canvas"
          />
        </div>

        {/* Controls Panel */}
        <div className="wf-controls-panel">
          <div className="wf-sliders">
            <div className="wf-slider-group">
              <div className="wf-slider-header">
                <label>Tần số</label>
                <span className="wf-slider-value">{frequency} Hz</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="5"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="wf-slider frequency"
              />
              <div className="wf-slider-labels">
                <span>100 Hz (Trầm)</span>
                <span>1000 Hz (Cao)</span>
              </div>
            </div>

            <div className="wf-slider-group">
              <div className="wf-slider-header">
                <label>Biên độ</label>
                <span className="wf-slider-value">{amplitude}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={amplitude}
                onChange={(e) => setAmplitude(Number(e.target.value))}
                className="wf-slider amplitude"
              />
              <div className="wf-slider-labels">
                <span>10% (Nhỏ)</span>
                <span>100% (To)</span>
              </div>
            </div>
          </div>

          <div className="wf-action-buttons">
            <button onClick={playSound} className="wf-action-btn sound">
              <Volume2 size={20} />
              Nghe Thử
            </button>
            <button onClick={resetLevel} className="wf-action-btn reset">
              <RotateCcw size={20} />
              Đặt Lại
            </button>
            <button onClick={checkAnswer} className="wf-action-btn check">
              <CheckCircle size={20} />
              Kiểm Tra
            </button>
          </div>

          {message && (
            <div className={`wf-message ${message.includes('❌') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <div className="wf-hint-box">
            <Lightbulb size={18} className="hint-icon" />
            <span>{level.hint}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveFrequencyGame;

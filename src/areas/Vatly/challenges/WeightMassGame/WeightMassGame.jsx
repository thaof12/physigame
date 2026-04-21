import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, RotateCcw, Star, Target, Clock, Check, X, Globe, Weight } from 'lucide-react';
import './WeightMassGame.css';

const WeightMassGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  
  // Game state
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState('earth');
  const [timeLeft, setTimeLeft] = useState(45);

  const objects = [
    { name: 'Người', mass: 60, icon: '🧍', description: 'Một người trưởng thành' },
    { name: 'Hộp gỗ', mass: 10, icon: '📦', description: 'Hộp gỗ vuông' },
    { name: 'Quả bóng', mass: 0.5, icon: '⚽', description: 'Quả bóng đá' },
    { name: 'Xe đạp', mass: 15, icon: '🚲', description: 'Xe đạp địa hình' },
    { name: 'Bàn học', mass: 20, icon: '🪑', description: 'Bàn học sinh' },
    { name: 'Tủ lạnh', mass: 80, icon: '🧊', description: 'Tủ lạnh gia đình' },
    { name: 'Chó', mass: 8, icon: '🐕', description: 'Chó nhà' },
    { name: 'Mèo', mass: 4, icon: '🐈', description: 'Mèo nhà' },
    { name: 'Sách', mass: 1, icon: '📚', description: 'Một quyển sách' },
    { name: 'Máy tính', mass: 25, icon: '💻', description: 'Máy tính để bàn' }
  ];

  const planets = {
    earth: { name: 'Trái Đất', g: 10, icon: '🌍', colors: ['#3b82f6', '#22c55e', '#1e40af'] },
    moon: { name: 'Mặt Trăng', g: 1.6, icon: '🌙', colors: ['#9ca3af', '#6b7280', '#4b5563'] },
    mars: { name: 'Sao Hỏa', g: 3.7, icon: '🔴', colors: ['#ef4444', '#dc2626', '#991b1b'] },
    jupiter: { name: 'Sao Mộc', g: 24.8, icon: '🟤', colors: ['#f59e0b', '#d97706', '#b45309'] }
  };

  const generateQuestion = () => {
    const obj = objects[level - 1];
    const planetKeys = Object.keys(planets);
    const randomPlanet = planetKeys[Math.floor(Math.random() * planetKeys.length)];
    setSelectedPlanet(randomPlanet);
    setCurrentQuestion(obj);
    setUserAnswer('');
    setFeedback(null);
    setTimeLeft(45);
  };

  useEffect(() => {
    if (level <= 10 && !gameOver) {
      generateQuestion();
    }
  }, [level]);

  useEffect(() => {
    if (timeLeft > 0 && !feedback && !gameOver && !showTutorial) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !feedback) {
      handleTimeout();
    }
  }, [timeLeft, feedback, gameOver, showTutorial]);

  // Canvas animation for planet
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentQuestion) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = 180;
    
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);
    
    let rotation = 0;
    let animationId;
    
    const animate = () => {
      ctx.clearRect(0, 0, size, size);
      
      const planet = planets[selectedPlanet];
      const cx = size / 2;
      const cy = size / 2;
      const radius = 70;
      
      // Glow effect
      const glow = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.4);
      glow.addColorStop(0, planet.colors[0] + '40');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, size, size);
      
      // Planet sphere gradient
      const gradient = ctx.createRadialGradient(cx - 20, cy - 20, 0, cx, cy, radius);
      gradient.addColorStop(0, planet.colors[0]);
      gradient.addColorStop(0.5, planet.colors[1]);
      gradient.addColorStop(1, planet.colors[2]);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Surface details (rotating)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      
      // Surface features
      ctx.fillStyle = planet.colors[2] + '60';
      ctx.beginPath();
      ctx.ellipse(-20, -15, 25, 15, 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.ellipse(25, 20, 18, 12, -0.4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.ellipse(-5, 35, 20, 10, 0.2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.ellipse(cx - 25, cy - 25, 20, 15, -0.5, 0, Math.PI * 2);
      ctx.fill();
      
      rotation += 0.005;
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [selectedPlanet, currentQuestion]);

  const handleTimeout = () => {
    const correctWeight = currentQuestion.mass * planets[selectedPlanet].g;
    setFeedback({ 
      correct: false, 
      message: 'Hết giờ! ⏰', 
      detail: `P = ${currentQuestion.mass} × ${planets[selectedPlanet].g} = ${correctWeight} N` 
    });
    setTimeout(() => moveToNext(), 2500);
  };

  const moveToNext = () => {
    if (level < 10) {
      setLevel(level + 1);
    } else {
      setGameOver(true);
    }
  };

  const handleSubmit = () => {
    if (feedback || !userAnswer) return;

    const correctWeight = currentQuestion.mass * planets[selectedPlanet].g;
    const answer = parseFloat(userAnswer);
    const tolerance = correctWeight * 0.05;
    const isCorrect = Math.abs(answer - correctWeight) <= Math.max(tolerance, 1);

    if (isCorrect) {
      const timeBonus = Math.ceil(timeLeft / 5);
      const earnedPoints = 10 + timeBonus;
      setScore(score + earnedPoints);
      setCorrectAnswers(correctAnswers + 1);
      setFeedback({
        correct: true,
        message: `Chính xác! 🎉`,
        detail: `P = m × g = ${currentQuestion.mass} × ${planets[selectedPlanet].g} = ${correctWeight} N (+${earnedPoints} điểm)`
      });
    } else {
      setFeedback({
        correct: false,
        message: 'Chưa chính xác!',
        detail: `Đáp án: P = ${currentQuestion.mass} × ${planets[selectedPlanet].g} = ${correctWeight} N`
      });
    }

    setTimeout(() => moveToNext(), 3000);
  };

  const handleRestart = () => {
    setScore(0);
    setLevel(1);
    setCorrectAnswers(0);
    setGameOver(false);
    setShowTutorial(false);
  };

  if (!currentQuestion && !gameOver) return null;

  const currentPlanet = planets[selectedPlanet];

  return (
    <div className="weight-mass-game">
      {/* Tutorial */}
      {showTutorial && (
        <div className="wm-tutorial-overlay">
          <div className="wm-tutorial-card">
            <div className="wm-tutorial-icon">
              <Globe size={48} />
            </div>
            <h2>Trọng Lượng & Khối Lượng</h2>
            <p className="wm-tutorial-subtitle">Tìm hiểu sự khác biệt giữa trọng lượng và khối lượng</p>
            
            <div className="wm-tutorial-steps">
              <div className="wm-tutorial-step">
                <div className="wm-step-icon">📐</div>
                <div className="wm-step-content">
                  <strong>Khối lượng (m)</strong>
                  <span>Không thay đổi ở mọi nơi trong vũ trụ</span>
                </div>
              </div>
              <div className="wm-tutorial-step">
                <div className="wm-step-icon">⬇️</div>
                <div className="wm-step-content">
                  <strong>Trọng lượng (P)</strong>
                  <span>Thay đổi theo gia tốc trọng trường</span>
                </div>
              </div>
              <div className="wm-tutorial-step">
                <div className="wm-step-icon">✨</div>
                <div className="wm-step-content">
                  <strong>Công thức: P = m × g</strong>
                  <span>P (Newton) = Khối lượng × Gia tốc</span>
                </div>
              </div>
            </div>
            
            <div className="wm-planets-preview">
              <div className="wm-planet-chip">🌍 g = 10</div>
              <div className="wm-planet-chip">🌙 g = 1.6</div>
              <div className="wm-planet-chip">🔴 g = 3.7</div>
              <div className="wm-planet-chip">🟤 g = 24.8</div>
            </div>
            
            <button onClick={() => setShowTutorial(false)} className="wm-start-btn">
              Bắt đầu khám phá vũ trụ!
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="wm-header">
        <button onClick={() => navigate('/physics-games/grade/6')} className="wm-back-btn">
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div className="wm-title">
          <Globe size={28} />
          <h1>Trọng Lượng & Khối Lượng</h1>
        </div>
        <div className="wm-level-badge">
          Câu {level}/10
        </div>
      </header>

      {!gameOver ? (
        <main className="wm-main">
          {/* Stats Bar */}
          <div className="wm-stats-bar">
            <div className="wm-stat">
              <Star className="wm-stat-icon gold" size={20} />
              <div className="wm-stat-info">
                <span className="wm-stat-label">Điểm</span>
                <span className="wm-stat-value">{score}</span>
              </div>
            </div>
            <div className="wm-stat">
              <Target className="wm-stat-icon green" size={20} />
              <div className="wm-stat-info">
                <span className="wm-stat-label">Đúng</span>
                <span className="wm-stat-value">{correctAnswers}/{level - 1 > 0 ? level - 1 : 0}</span>
              </div>
            </div>
            <div className="wm-stat">
              <Clock className={`wm-stat-icon ${timeLeft < 10 ? 'red pulse' : 'blue'}`} size={20} />
              <div className="wm-stat-info">
                <span className="wm-stat-label">Thời gian</span>
                <span className={`wm-stat-value ${timeLeft < 10 ? 'warning' : ''}`}>{timeLeft}s</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="wm-progress-container">
            <div className="wm-progress-bar">
              <div className="wm-progress-fill" style={{ width: `${(level / 10) * 100}%` }}></div>
            </div>
          </div>

          {/* Main Game Content */}
          <div className="wm-game-grid">
            {/* Object Card */}
            <div className="wm-object-card">
              <div className="wm-object-icon">{currentQuestion.icon}</div>
              <div className="wm-object-details">
                <h3>{currentQuestion.name}</h3>
                <p>{currentQuestion.description}</p>
              </div>
              <div className="wm-mass-display">
                <div className="wm-mass-label">Khối lượng</div>
                <div className="wm-mass-value">
                  <span className="wm-mass-number">{currentQuestion.mass}</span>
                  <span className="wm-mass-unit">kg</span>
                </div>
              </div>
            </div>

            {/* Planet Card */}
            <div className="wm-planet-card" style={{ '--planet-color': currentPlanet.colors[0] }}>
              <canvas ref={canvasRef} className="wm-planet-canvas" />
              <div className="wm-planet-details">
                <h3>{currentPlanet.name}</h3>
                <div className="wm-gravity-badge">
                  <span className="wm-g-label">g =</span>
                  <span className="wm-g-value">{currentPlanet.g}</span>
                  <span className="wm-g-unit">m/s²</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formula Card */}
          <div className="wm-formula-card">
            <div className="wm-formula-title">Tính trọng lượng</div>
            <div className="wm-formula-content">
              <span className="wm-formula-p">P</span>
              <span className="wm-formula-eq">=</span>
              <span className="wm-formula-m">{currentQuestion.mass}</span>
              <span className="wm-formula-times">×</span>
              <span className="wm-formula-g">{currentPlanet.g}</span>
              <span className="wm-formula-eq">=</span>
              <span className="wm-formula-result">?</span>
            </div>
          </div>

          {/* Answer Section */}
          <div className="wm-answer-section">
            <div className="wm-input-group">
              <label>Trọng lượng của {currentQuestion.name} trên {currentPlanet.name}:</label>
              <div className="wm-input-wrapper">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Nhập kết quả"
                  step="0.1"
                  disabled={!!feedback}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  autoFocus
                />
                <span className="wm-unit">N</span>
              </div>
            </div>
            <button 
              onClick={handleSubmit} 
              className="wm-submit-btn"
              disabled={!!feedback || !userAnswer}
            >
              <Check size={20} />
              Kiểm tra
            </button>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`wm-feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
              <div className="wm-feedback-icon">
                {feedback.correct ? <Check size={32} /> : <X size={32} />}
              </div>
              <div className="wm-feedback-content">
                <div className="wm-feedback-message">{feedback.message}</div>
                <div className="wm-feedback-detail">{feedback.detail}</div>
              </div>
            </div>
          )}
        </main>
      ) : (
        <div className="wm-game-over">
          <div className="wm-trophy">
            <Award size={80} />
          </div>
          <h2>Hoàn thành! 🎉</h2>
          
          <div className="wm-final-stats">
            <div className="wm-final-stat">
              <div className="wm-final-stat-icon gold">
                <Star size={24} />
              </div>
              <div className="wm-final-stat-value">{score}</div>
              <div className="wm-final-stat-label">Tổng điểm</div>
            </div>
            <div className="wm-final-stat">
              <div className="wm-final-stat-icon green">
                <Target size={24} />
              </div>
              <div className="wm-final-stat-value">{correctAnswers}/10</div>
              <div className="wm-final-stat-label">Trả lời đúng</div>
            </div>
            <div className="wm-final-stat">
              <div className="wm-final-stat-icon blue">
                <Globe size={24} />
              </div>
              <div className="wm-final-stat-value">{Math.round((correctAnswers / 10) * 100)}%</div>
              <div className="wm-final-stat-label">Độ chính xác</div>
            </div>
          </div>

          <div className="wm-achievement">
            {correctAnswers >= 9 && <div className="wm-badge gold">🏆 Chuyên gia vật lý!</div>}
            {correctAnswers >= 7 && correctAnswers < 9 && <div className="wm-badge silver">🥈 Rất tốt!</div>}
            {correctAnswers >= 5 && correctAnswers < 7 && <div className="wm-badge bronze">🥉 Khá tốt!</div>}
            {correctAnswers < 5 && <div className="wm-badge">💪 Tiếp tục cố gắng!</div>}
          </div>

          <div className="wm-actions">
            <button onClick={handleRestart} className="wm-restart-btn">
              <RotateCcw size={20} />
              Chơi lại
            </button>
            <button onClick={() => navigate('/physics-games/grade/6')} className="wm-menu-btn">
              Về danh sách
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightMassGame;

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, RotateCcw, HelpCircle, Target, Clock, Star, Check, X, Ruler } from 'lucide-react';
import './MeasurementGame.css';

const MeasurementGame = ({ isPKMode = false, pkTimeLimit, onComplete, onExit }) => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  
  // Game state
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(isPKMode ? (pkTimeLimit || 60) : 60);
  const [gameOver, setGameOver] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showTutorial, setShowTutorial] = useState(!isPKMode); // Skip tutorial in PK mode
  
  // Ruler state
  const [rulerStartX, setRulerStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [objectBounds, setObjectBounds] = useState({ left: 100, width: 200 });
  
  // Scale: 10px = 1cm
  const SCALE = 10;
  const RULER_WIDTH = 320; // 32cm ruler display width
  const CANVAS_WIDTH = 700;
  const CANVAS_HEIGHT = 220;

  // Objects to measure
  const measurements = [
    { object: 'Bút chì', realValue: 18, unit: 'cm', emoji: '✏️', color: '#FFD700', gradient: ['#FFE066', '#FFD700', '#DAA520'] },
    { object: 'Sách giáo khoa', realValue: 24, unit: 'cm', emoji: '📚', color: '#4169E1', gradient: ['#5B8DEF', '#4169E1', '#2F4F9F'] },
    { object: 'Thước kẻ', realValue: 30, unit: 'cm', emoji: '📏', color: '#32CD32', gradient: ['#5FE35F', '#32CD32', '#228B22'] },
    { object: 'Hộp bút', realValue: 22, unit: 'cm', emoji: '🎨', color: '#FF69B4', gradient: ['#FF8DC7', '#FF69B4', '#DB4D97'] },
    { object: 'Điện thoại', realValue: 15, unit: 'cm', emoji: '📱', color: '#708090', gradient: ['#8A9BAC', '#708090', '#4A5568'] },
    { object: 'Cốc nước', realValue: 12, unit: 'cm', emoji: '🥤', color: '#FF6347', gradient: ['#FF7F66', '#FF6347', '#DC3D2A'] },
    { object: 'Hộp phấn', realValue: 8, unit: 'cm', emoji: '📦', color: '#DEB887', gradient: ['#E8CCA0', '#DEB887', '#C8A06E'] },
    { object: 'Tẩy', realValue: 5, unit: 'cm', emoji: '🧽', color: '#FFB6C1', gradient: ['#FFCCD5', '#FFB6C1', '#E89DA8'] },
    { object: 'Vở', realValue: 20, unit: 'cm', emoji: '📓', color: '#FFA500', gradient: ['#FFB833', '#FFA500', '#E08E00'] },
    { object: 'Kéo', realValue: 16, unit: 'cm', emoji: '✂️', color: '#9E9E9E', gradient: ['#AEAEAE', '#9E9E9E', '#7E7E7E'] },
  ];

  const generateQuestion = useCallback(() => {
    const item = measurements[Math.floor(Math.random() * measurements.length)];
    const objectWidth = item.realValue * SCALE;
    const objectLeft = Math.floor((CANVAS_WIDTH - objectWidth) / 2);
    
    setCurrentQuestion(item);
    setObjectBounds({ left: objectLeft, width: objectWidth });
    setUserAnswer('');
    setFeedback(null);
    setTimeLeft(60);
    setRulerStartX(50); // Initial ruler position
  }, []);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  useEffect(() => {
    if (timeLeft > 0 && !feedback && !gameOver && !showTutorial) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !feedback) {
      handleTimeout();
    }
  }, [timeLeft, feedback, gameOver, showTutorial]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentQuestion) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size with DPR
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    canvas.style.width = `${CANVAS_WIDTH}px`;
    canvas.style.height = `${CANVAS_HEIGHT}px`;
    ctx.scale(dpr, dpr);
    
    // Clear canvas with gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGradient.addColorStop(0, '#f0f9ff');
    bgGradient.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw grid
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < CANVAS_WIDTH; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
    
    // Draw object with gradient
    const objY = 30;
    const objHeight = 55;
    
    // Object shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 6;
    ctx.shadowOffsetX = 0;
    
    const gradient = ctx.createLinearGradient(objectBounds.left, objY, objectBounds.left, objY + objHeight);
    gradient.addColorStop(0, currentQuestion.gradient[0]);
    gradient.addColorStop(0.5, currentQuestion.gradient[1]);
    gradient.addColorStop(1, currentQuestion.gradient[2]);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(objectBounds.left, objY, objectBounds.width, objHeight, 10);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Object border
    ctx.strokeStyle = currentQuestion.gradient[2];
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Object label
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 3;
    ctx.fillText(`${currentQuestion.emoji} ${currentQuestion.object}`, objectBounds.left + objectBounds.width / 2, objY + objHeight / 2);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // Draw ruler
    const rulerY = 115;
    const rulerHeight = 70;
    
    // Ruler shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    
    // Ruler body
    const rulerGradient = ctx.createLinearGradient(rulerStartX, rulerY, rulerStartX, rulerY + rulerHeight);
    rulerGradient.addColorStop(0, '#fef9c3');
    rulerGradient.addColorStop(0.3, '#fef08a');
    rulerGradient.addColorStop(0.7, '#fde047');
    rulerGradient.addColorStop(1, '#facc15');
    
    ctx.fillStyle = rulerGradient;
    ctx.beginPath();
    ctx.roundRect(rulerStartX, rulerY, RULER_WIDTH, rulerHeight, 8);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Ruler border
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Ruler measurement area (white strip)
    const stripY = rulerY + 28;
    const stripHeight = 32;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.roundRect(rulerStartX + 8, stripY, RULER_WIDTH - 16, stripHeight, 4);
    ctx.fill();
    ctx.strokeStyle = '#d4d4d8';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw ruler marks
    for (let i = 0; i <= 30; i++) {
      const x = rulerStartX + 10 + i * SCALE;
      const isMajor = i % 5 === 0;
      const markHeight = isMajor ? 20 : 10;
      
      ctx.strokeStyle = isMajor ? '#1f2937' : '#6b7280';
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x, stripY + 3);
      ctx.lineTo(x, stripY + 3 + markHeight);
      ctx.stroke();
      
      // Numbers for major marks
      if (isMajor) {
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i.toString(), x, stripY + stripHeight - 6);
      }
    }
    
    // Ruler label
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#854d0e';
    ctx.textAlign = 'center';
    ctx.fillText('📐 Thước kẻ (cm)', rulerStartX + RULER_WIDTH / 2, rulerY + 14);
    
    // Draw alignment indicators
    const rulerZeroX = rulerStartX + 10;
    const isAligned = Math.abs(rulerZeroX - objectBounds.left) < 8;
    
    // Left edge alignment line
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = isAligned ? '#22c55e' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(objectBounds.left, objY + objHeight + 5);
    ctx.lineTo(objectBounds.left, rulerY - 5);
    ctx.stroke();
    
    // Show alignment indicator
    if (isAligned) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('✓ Căn chỉnh', objectBounds.left, objY + objHeight + 18);
    }
    
    // Right edge and measurement display
    const objectRight = objectBounds.left + objectBounds.width;
    ctx.beginPath();
    ctx.moveTo(objectRight, objY + objHeight + 5);
    ctx.lineTo(objectRight, rulerY - 5);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Show measured value when aligned
    if (isAligned) {
      const measuredValue = (objectRight - rulerZeroX) / SCALE;
      ctx.fillStyle = '#16a34a';
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${measuredValue.toFixed(1)} cm`, objectRight, objY + objHeight + 18);
    }
    
  }, [currentQuestion, objectBounds, rulerStartX]);

  // Handle ruler dragging
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is on ruler
    if (y >= 115 && y <= 185 && x >= rulerStartX && x <= rulerStartX + RULER_WIDTH) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    const newX = x - RULER_WIDTH / 2;
    const minX = 0;
    const maxX = CANVAS_WIDTH - RULER_WIDTH;
    
    setRulerStartX(Math.max(minX, Math.min(maxX, newX)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (y >= 115 && y <= 185 && x >= rulerStartX && x <= rulerStartX + RULER_WIDTH) {
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    
    const newX = x - RULER_WIDTH / 2;
    const minX = 0;
    const maxX = CANVAS_WIDTH - RULER_WIDTH;
    
    setRulerStartX(Math.max(minX, Math.min(maxX, newX)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleTimeout = () => {
    // In PK mode, complete the game immediately when time is up
    if (isPKMode && onComplete) {
      onComplete({
        completed: false,
        score: score,
        correctAnswers: correctAnswers,
        totalQuestions: level
      });
      return;
    }
    
    setFeedback({ correct: false, message: 'Hết giờ! ⏰', detail: `Đáp án đúng: ${currentQuestion.realValue} ${currentQuestion.unit}` });
    setTimeout(() => moveToNextQuestion(), 2500);
  };

  const handleSubmit = () => {
    if (feedback || !userAnswer) return;

    const answer = parseFloat(userAnswer);
    const correct = currentQuestion.realValue;
    const tolerance = correct * 0.1;

    const isCorrect = Math.abs(answer - correct) <= tolerance;
    
    if (isCorrect) {
      const timeBonus = Math.ceil(timeLeft / 6);
      const accuracyBonus = Math.abs(answer - correct) < 0.5 ? 5 : 0;
      const earnedPoints = 10 + timeBonus + accuracyBonus;
      
      setScore(score + earnedPoints);
      setCorrectAnswers(correctAnswers + 1);
      setFeedback({
        correct: true,
        message: `Chính xác! 🎉`,
        detail: `+${earnedPoints} điểm${accuracyBonus > 0 ? ' (Bonus chính xác!)' : ''}`
      });
    } else {
      setFeedback({
        correct: false,
        message: `Chưa đúng!`,
        detail: `Đáp án: ${correct} ${currentQuestion.unit} | Bạn đo: ${answer} ${currentQuestion.unit}`
      });
    }

    setTimeout(() => moveToNextQuestion(), 2500);
  };

  const moveToNextQuestion = () => {
    if (level < 10) {
      setLevel(level + 1);
      generateQuestion();
    } else {
      setGameOver(true);
      // In PK mode, call onComplete with result
      if (isPKMode && onComplete) {
        onComplete({
          completed: true,
          score: score,
          correctAnswers: correctAnswers,
          totalQuestions: 10
        });
      }
    }
  };

  const handleRestart = () => {
    setScore(0);
    setLevel(1);
    setCorrectAnswers(0);
    setGameOver(false);
    setShowTutorial(false);
    generateQuestion();
  };

  // Handle PK mode exit
  const handleExit = () => {
    if (isPKMode && onExit) {
      onExit();
    } else {
      navigate(-1);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="measurement-game">
      {/* Tutorial */}
      {showTutorial && (
        <div className="mg-tutorial-overlay">
          <div className="mg-tutorial-card">
            <div className="mg-tutorial-icon">
              <Ruler size={48} />
            </div>
            <h2>Đo Độ Dài</h2>
            <p className="mg-tutorial-subtitle">Học cách sử dụng thước đo chính xác</p>
            
            <div className="mg-tutorial-steps">
              <div className="mg-tutorial-step">
                <div className="mg-step-icon">1</div>
                <div className="mg-step-content">
                  <strong>Kéo thước đo</strong>
                  <span>Đặt vạch 0 của thước sát mép trái vật thể</span>
                </div>
              </div>
              <div className="mg-tutorial-step">
                <div className="mg-step-icon">2</div>
                <div className="mg-step-content">
                  <strong>Đọc số đo</strong>
                  <span>Nhìn vạch thước tại mép phải vật thể</span>
                </div>
              </div>
              <div className="mg-tutorial-step">
                <div className="mg-step-icon">3</div>
                <div className="mg-step-content">
                  <strong>Nhập kết quả</strong>
                  <span>Ghi số đo vào ô và nhấn Kiểm tra</span>
                </div>
              </div>
            </div>
            
            <div className="mg-tutorial-tip">
              💡 Sai số cho phép: ±10%
            </div>
            
            <button onClick={() => setShowTutorial(false)} className="mg-start-btn">
              Bắt đầu chơi
            </button>
          </div>
        </div>
      )}

      {/* Header - Hide in PK mode */}
      {!isPKMode && (
        <header className="mg-header">
          <button onClick={handleExit} className="mg-back-btn">
            <ArrowLeft size={20} />
            <span>Quay lại</span>
          </button>
          <div className="mg-title">
            <Ruler size={28} />
            <h1>Đo Độ Dài</h1>
          </div>
          <div className="mg-level-badge">
            Câu {level}/10
          </div>
        </header>
      )}

      {!gameOver ? (
        <main className="mg-main">
          {/* Stats Bar */}
          <div className="mg-stats-bar">
            <div className="mg-stat">
              <Star className="mg-stat-icon gold" size={20} />
              <div className="mg-stat-info">
                <span className="mg-stat-label">Điểm</span>
                <span className="mg-stat-value">{score}</span>
              </div>
            </div>
            <div className="mg-stat">
              <Target className="mg-stat-icon green" size={20} />
              <div className="mg-stat-info">
                <span className="mg-stat-label">Đúng</span>
                <span className="mg-stat-value">{correctAnswers}/{level - 1 > 0 ? level - 1 : 0}</span>
              </div>
            </div>
            <div className="mg-stat">
              <Clock className={`mg-stat-icon ${timeLeft < 15 ? 'red pulse' : 'blue'}`} size={20} />
              <div className="mg-stat-info">
                <span className="mg-stat-label">Thời gian</span>
                <span className={`mg-stat-value ${timeLeft < 15 ? 'warning' : ''}`}>{timeLeft}s</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mg-progress-container">
            <div className="mg-progress-bar">
              <div className="mg-progress-fill" style={{ width: `${(level / 10) * 100}%` }}></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="mg-question-card">
            <div className="mg-question-header">
              <span className="mg-question-emoji">{currentQuestion.emoji}</span>
              <h2>Đo chiều dài: <strong>{currentQuestion.object}</strong></h2>
            </div>
            <div className="mg-hint">
              <HelpCircle size={16} />
              <span>Kéo thước để đặt vạch 0 sát mép trái vật thể, rồi đọc số đo ở mép phải</span>
            </div>
          </div>

          {/* Canvas Measurement Area */}
          <div className="mg-canvas-container">
            <canvas
              ref={canvasRef}
              className={`mg-canvas ${isDragging ? 'dragging' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
            <div className="mg-canvas-hint">
              🖱️ Kéo thước sang trái/phải để đo
            </div>
          </div>

          {/* Answer Section */}
          <div className="mg-answer-section">
            <div className="mg-input-group">
              <label>Kết quả đo:</label>
              <div className="mg-input-wrapper">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Nhập số"
                  step="0.5"
                  min="0"
                  max="30"
                  disabled={!!feedback}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <span className="mg-unit">{currentQuestion.unit}</span>
              </div>
            </div>
            <button 
              onClick={handleSubmit} 
              className="mg-submit-btn"
              disabled={!!feedback || !userAnswer}
            >
              <Check size={20} />
              Kiểm tra
            </button>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`mg-feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
              <div className="mg-feedback-icon">
                {feedback.correct ? <Check size={32} /> : <X size={32} />}
              </div>
              <div className="mg-feedback-content">
                <div className="mg-feedback-message">{feedback.message}</div>
                <div className="mg-feedback-detail">{feedback.detail}</div>
              </div>
            </div>
          )}
        </main>
      ) : (
        <div className="mg-game-over">
          <div className="mg-trophy">
            <Award size={80} />
          </div>
          <h2>Hoàn thành! 🎉</h2>
          
          <div className="mg-final-stats">
            <div className="mg-final-stat">
              <div className="mg-final-stat-icon gold">
                <Star size={24} />
              </div>
              <div className="mg-final-stat-value">{score}</div>
              <div className="mg-final-stat-label">Tổng điểm</div>
            </div>
            <div className="mg-final-stat">
              <div className="mg-final-stat-icon green">
                <Target size={24} />
              </div>
              <div className="mg-final-stat-value">{correctAnswers}/10</div>
              <div className="mg-final-stat-label">Trả lời đúng</div>
            </div>
            <div className="mg-final-stat">
              <div className="mg-final-stat-icon blue">
                <Ruler size={24} />
              </div>
              <div className="mg-final-stat-value">{Math.round((correctAnswers / 10) * 100)}%</div>
              <div className="mg-final-stat-label">Độ chính xác</div>
            </div>
          </div>

          <div className="mg-achievement">
            {correctAnswers >= 9 && <div className="mg-badge gold">🏆 Chuyên gia đo lường!</div>}
            {correctAnswers >= 7 && correctAnswers < 9 && <div className="mg-badge silver">🥈 Rất giỏi!</div>}
            {correctAnswers >= 5 && correctAnswers < 7 && <div className="mg-badge bronze">🥉 Khá tốt!</div>}
            {correctAnswers < 5 && <div className="mg-badge">💪 Tiếp tục cố gắng!</div>}
          </div>

          <div className="mg-actions">
            <button onClick={handleRestart} className="mg-restart-btn">
              <RotateCcw size={20} />
              Chơi lại
            </button>
            <button onClick={() => navigate('/physics-games/grade/6')} className="mg-menu-btn">
              Về danh sách
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeasurementGame;

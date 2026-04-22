import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, RotateCcw, Calculator, Zap, ThermometerSun, Check, X, Beaker } from 'lucide-react';
import './ThermalEnergyGame.css';

const ThermalEnergyGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showCalculation, setShowCalculation] = useState(false);

  const challenges = [
    {
      id: 1,
      scenario: 'Đun nóng 1 kg nước từ 20°C lên 100°C',
      mass: 1,
      specificHeat: 4200,
      tempInitial: 20,
      tempFinal: 100,
      substance: 'Nước',
      icon: '💧',
      color: '#3b82f6',
      hint: 'Q = m × c × ΔT = 1 × 4200 × 80'
    },
    {
      id: 2,
      scenario: 'Làm lạnh 2 kg sắt từ 100°C xuống 20°C',
      mass: 2,
      specificHeat: 460,
      tempInitial: 100,
      tempFinal: 20,
      substance: 'Sắt',
      icon: '🔩',
      color: '#64748b',
      hint: 'ΔT âm khi làm lạnh'
    },
    {
      id: 3,
      scenario: 'Nung 0.5 kg đồng từ 25°C lên 85°C',
      mass: 0.5,
      specificHeat: 380,
      tempInitial: 25,
      tempFinal: 85,
      substance: 'Đồng',
      icon: '🔶',
      color: '#f97316',
      hint: 'c của đồng = 380 J/(kg·°C)'
    },
    {
      id: 4,
      scenario: 'Làm nóng 3 kg nước từ 15°C lên 65°C',
      mass: 3,
      specificHeat: 4200,
      tempInitial: 15,
      tempFinal: 65,
      substance: 'Nước',
      icon: '💦',
      color: '#06b6d4',
      hint: 'Khối lượng lớn hơn → nhiệt lượng lớn hơn'
    },
    {
      id: 5,
      scenario: 'Làm lạnh 1.5 kg nhôm từ 200°C xuống 50°C',
      mass: 1.5,
      specificHeat: 880,
      tempInitial: 200,
      tempFinal: 50,
      substance: 'Nhôm',
      icon: '🪙',
      color: '#94a3b8',
      hint: 'c của nhôm = 880 J/(kg·°C)'
    },
    {
      id: 6,
      scenario: 'Đun sôi 0.5 kg nước từ 30°C lên 100°C',
      mass: 0.5,
      specificHeat: 4200,
      tempInitial: 30,
      tempFinal: 100,
      substance: 'Nước',
      icon: '♨️',
      color: '#ef4444',
      hint: 'Nước sôi ở 100°C'
    },
    {
      id: 7,
      scenario: 'Nung 2 kg sắt từ 0°C lên 150°C',
      mass: 2,
      specificHeat: 460,
      tempInitial: 0,
      tempFinal: 150,
      substance: 'Sắt',
      icon: '⚙️',
      color: '#78716c',
      hint: 'Chênh lệch nhiệt độ lớn'
    },
    {
      id: 8,
      scenario: 'Làm lạnh 4 kg nước từ 80°C xuống 10°C',
      mass: 4,
      specificHeat: 4200,
      tempInitial: 80,
      tempFinal: 10,
      substance: 'Nước',
      icon: '🧊',
      color: '#22d3ee',
      hint: 'Khối lượng và ΔT đều lớn'
    },
    {
      id: 9,
      scenario: 'Đun nóng 1 kg đồng từ 20°C lên 120°C',
      mass: 1,
      specificHeat: 380,
      tempInitial: 20,
      tempFinal: 120,
      substance: 'Đồng',
      icon: '🔥',
      color: '#ea580c',
      hint: 'ΔT = 100°C'
    },
    {
      id: 10,
      scenario: 'Làm lạnh 2.5 kg nhôm từ 180°C xuống 30°C',
      mass: 2.5,
      specificHeat: 880,
      tempInitial: 180,
      tempFinal: 30,
      substance: 'Nhôm',
      icon: '❄️',
      color: '#a1a1aa',
      hint: 'Q = 2.5 × 880 × 150'
    }
  ];

  const generateChallenge = useCallback(() => {
    const challenge = challenges[level - 1];
    setCurrentChallenge(challenge);
    setUserAnswer('');
    setFeedback(null);
    setShowCalculation(false);
  }, [level]);

  useEffect(() => {
    if (level <= 10 && !gameOver) {
      generateChallenge();
    }
  }, [level, gameOver, generateChallenge]);

  const calculateHeatEnergy = () => {
    if (!currentChallenge) return 0;
    const { mass, specificHeat, tempInitial, tempFinal } = currentChallenge;
    const deltaT = tempFinal - tempInitial;
    return Math.abs(mass * specificHeat * deltaT);
  };

  // Canvas animation
  const drawVisualization = useCallback((ctx, width, height) => {
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, width, height);
    
    const w = width / dpr;
    const h = height / dpr;
    const time = Date.now() * 0.001;
    
    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
    
    if (!currentChallenge) return;
    
    // Draw beaker/container
    const beakerWidth = w * 0.25;
    const beakerHeight = h * 0.55;
    const beakerX = w * 0.15;
    const beakerY = h * 0.25;
    
    // Beaker outline
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(beakerX, beakerY);
    ctx.lineTo(beakerX, beakerY + beakerHeight);
    ctx.lineTo(beakerX + beakerWidth, beakerY + beakerHeight);
    ctx.lineTo(beakerX + beakerWidth, beakerY);
    ctx.stroke();
    
    // Liquid in beaker
    const liquidHeight = beakerHeight * 0.7;
    const liquidY = beakerY + beakerHeight - liquidHeight;
    
    const liquidGrad = ctx.createLinearGradient(0, liquidY, 0, beakerY + beakerHeight);
    liquidGrad.addColorStop(0, `${currentChallenge.color}99`);
    liquidGrad.addColorStop(1, currentChallenge.color);
    ctx.fillStyle = liquidGrad;
    ctx.fillRect(beakerX + 2, liquidY, beakerWidth - 4, liquidHeight - 2);
    
    // Temperature indicator on beaker
    const isHeating = currentChallenge.tempFinal > currentChallenge.tempInitial;
    
    // Draw energy particles
    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
      const angle = time * 2 + i * (Math.PI * 2 / particleCount);
      const radius = 20 + Math.sin(time * 3 + i) * 5;
      const centerX = beakerX + beakerWidth / 2;
      const centerY = liquidY + liquidHeight / 2;
      
      const px = centerX + Math.cos(angle) * radius * (1 + i * 0.1);
      const py = centerY + Math.sin(angle) * radius * 0.5;
      
      if (px > beakerX + 5 && px < beakerX + beakerWidth - 5 &&
          py > liquidY && py < beakerY + beakerHeight - 5) {
        ctx.beginPath();
        ctx.arc(px, py, 3 + Math.sin(time * 5 + i) * 1, 0, Math.PI * 2);
        ctx.fillStyle = isHeating ? '#fbbf24' : '#38bdf8';
        ctx.fill();
      }
    }
    
    // Draw thermometer
    const thermX = beakerX + beakerWidth + 40;
    const thermY = beakerY;
    const thermHeight = beakerHeight;
    const thermWidth = 20;
    
    // Thermometer body
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(thermX - thermWidth / 2, thermY, thermWidth, thermHeight, 10);
    ctx.fill();
    ctx.stroke();
    
    // Bulb
    ctx.beginPath();
    ctx.arc(thermX, thermY + thermHeight + 15, 18, 0, Math.PI * 2);
    ctx.fillStyle = isHeating ? '#ef4444' : '#38bdf8';
    ctx.fill();
    
    // Mercury level
    const tempRange = 200;
    const tempNormalized = Math.max(0, Math.min(1, currentChallenge.tempFinal / tempRange));
    const mercuryHeight = tempNormalized * thermHeight * 0.85;
    
    ctx.fillStyle = isHeating ? '#ef4444' : '#38bdf8';
    ctx.fillRect(thermX - 6, thermY + thermHeight - mercuryHeight, 12, mercuryHeight + 5);
    
    // Temperature labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${currentChallenge.tempInitial}°C → ${currentChallenge.tempFinal}°C`, thermX + 20, thermY + thermHeight / 2);
    
    // Draw formula section
    const formulaX = w * 0.52;
    const formulaY = h * 0.15;
    
    // Formula box
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(formulaX, formulaY, w * 0.42, h * 0.7, 16);
    ctx.fill();
    ctx.stroke();
    
    // Formula title
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CÔNG THỨC NHIỆT LƯỢNG', formulaX + w * 0.21, formulaY + 30);
    
    // Main formula
    ctx.fillStyle = '#a78bfa';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('Q = m × c × ΔT', formulaX + w * 0.21, formulaY + 70);
    
    // Variables
    const vars = [
      { symbol: 'Q', desc: 'Nhiệt lượng', value: '? J', color: '#f59e0b' },
      { symbol: 'm', desc: 'Khối lượng', value: `${currentChallenge.mass} kg`, color: '#22c55e' },
      { symbol: 'c', desc: 'Nhiệt dung riêng', value: `${currentChallenge.specificHeat} J/(kg·°C)`, color: '#3b82f6' },
      { symbol: 'ΔT', desc: 'Độ biến thiên', value: `${Math.abs(currentChallenge.tempFinal - currentChallenge.tempInitial)}°C`, color: '#ef4444' }
    ];
    
    let varY = formulaY + 100;
    vars.forEach((v, i) => {
      // Variable box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(formulaX + 15, varY, w * 0.39, 35, 8);
      ctx.fill();
      
      // Symbol
      ctx.fillStyle = v.color;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(v.symbol, formulaX + 25, varY + 23);
      
      // Description
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText(v.desc, formulaX + 65, varY + 22);
      
      // Value
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(v.value, formulaX + w * 0.39 + 5, varY + 22);
      
      varY += 42;
    });
    
    // Arrow showing heat transfer direction
    const arrowY = beakerY - 25;
    ctx.fillStyle = isHeating ? '#ef4444' : '#38bdf8';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isHeating ? '🔥 Đun nóng' : '❄️ Làm lạnh', beakerX + beakerWidth / 2, arrowY);
    
  }, [currentChallenge]);

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
      drawVisualization(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showTutorial, gameOver, drawVisualization]);

  const handleSubmit = () => {
    if (feedback) return;

    const correctAnswer = calculateHeatEnergy();
    const answer = parseFloat(userAnswer);
    const tolerance = correctAnswer * 0.05;

    const isCorrect = !isNaN(answer) && Math.abs(answer - correctAnswer) <= tolerance;

    if (isCorrect) {
      const earnedPoints = 15;
      setScore(score + earnedPoints);
      setCorrectAnswers(correctAnswers + 1);
      setFeedback({
        correct: true,
        message: `Chính xác! 🎉`,
        detail: `Q = ${correctAnswer.toLocaleString()} J (+${earnedPoints} điểm)`
      });
    } else {
      setFeedback({
        correct: false,
        message: 'Chưa chính xác!',
        detail: `Đáp án đúng: ${correctAnswer.toLocaleString()} J`
      });
    }

    setShowCalculation(true);

    setTimeout(() => {
      if (level < 10) {
        setLevel(level + 1);
      } else {
        setGameOver(true);
      }
    }, 3000);
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
    <div className="te-game">
      {/* Tutorial */}
      {showTutorial && (
        <div className="te-tutorial-overlay">
          <div className="te-tutorial-card">
            <div className="te-tutorial-icon">🔬</div>
            <h2>Phòng Thí Nghiệm Nhiệt Lượng</h2>
            <p className="te-tutorial-subtitle">Tính toán nhiệt lượng với công thức Q = m × c × ΔT</p>
            
            <div className="te-tutorial-formula">
              <div className="te-formula-main">Q = m × c × ΔT</div>
              <div className="te-formula-vars">
                <div className="te-var"><span style={{color: '#f59e0b'}}>Q</span> = Nhiệt lượng (J)</div>
                <div className="te-var"><span style={{color: '#22c55e'}}>m</span> = Khối lượng (kg)</div>
                <div className="te-var"><span style={{color: '#3b82f6'}}>c</span> = Nhiệt dung riêng J/(kg·°C)</div>
                <div className="te-var"><span style={{color: '#ef4444'}}>ΔT</span> = T<sub>cuối</sub> - T<sub>đầu</sub> (°C)</div>
              </div>
            </div>
            
            <button onClick={() => setShowTutorial(false)} className="te-start-btn">
              Bắt đầu tính toán
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="te-header">
        <button onClick={() => navigate('/advanced-physics-challenge')} className="te-back-btn">
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div className="te-title">
          <Beaker size={28} />
          <h1>Năng Lượng Nhiệt</h1>
        </div>
        <div className="te-header-stats">
          <div className="te-header-stat">
            <Zap size={16} />
            <span>{score} điểm</span>
          </div>
        </div>
      </div>

      {!gameOver ? (
        <div className="te-main-content">
          {/* Stats Bar */}
          <div className="te-stats-bar">
            <div className="te-stat-item">
              <span className="te-stat-label">Câu hỏi</span>
              <span className="te-stat-value">{level}/10</span>
            </div>
            <div className="te-progress-bar">
              <div className="te-progress-fill" style={{ width: `${(level / 10) * 100}%` }}></div>
            </div>
            <div className="te-stat-item">
              <span className="te-stat-label">Đúng</span>
              <span className="te-stat-value te-correct">{correctAnswers}</span>
            </div>
          </div>

          {/* Challenge Card */}
          <div className="te-challenge-card">
            <div className="te-challenge-icon">{currentChallenge.icon}</div>
            <div className="te-challenge-info">
              <h2>{currentChallenge.scenario}</h2>
              <p>Chất: <strong>{currentChallenge.substance}</strong></p>
            </div>
          </div>

          {/* Hint */}
          <div className="te-hint-box">
            <span className="te-hint-icon">💡</span>
            <span>{currentChallenge.hint}</span>
          </div>

          {/* Canvas Visualization */}
          <div className="te-visualization">
            <canvas ref={canvasRef} className="te-canvas"></canvas>
          </div>

          {/* Calculation Steps (shown after answer) */}
          {showCalculation && (
            <div className="te-calculation">
              <h3>📝 Lời giải chi tiết</h3>
              <div className="te-calc-steps">
                <div className="te-calc-step">
                  <span className="te-step-num">1</span>
                  <span>ΔT = {currentChallenge.tempFinal}°C - {currentChallenge.tempInitial}°C = {currentChallenge.tempFinal - currentChallenge.tempInitial}°C</span>
                </div>
                <div className="te-calc-step">
                  <span className="te-step-num">2</span>
                  <span>Q = m × c × |ΔT|</span>
                </div>
                <div className="te-calc-step">
                  <span className="te-step-num">3</span>
                  <span>Q = {currentChallenge.mass} × {currentChallenge.specificHeat.toLocaleString()} × {Math.abs(currentChallenge.tempFinal - currentChallenge.tempInitial)}</span>
                </div>
                <div className="te-calc-step te-result">
                  <span className="te-step-num">✓</span>
                  <span>Q = <strong>{calculateHeatEnergy().toLocaleString()} J</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Answer Input */}
          <div className="te-answer-section">
            <label>Nhập nhiệt lượng Q:</label>
            <div className="te-input-group">
              <Calculator size={20} className="te-input-icon" />
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Nhập giá trị..."
                disabled={!!feedback}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <span className="te-unit">J</span>
            </div>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} className="te-submit-btn" disabled={!!feedback || !userAnswer}>
            <Check size={20} />
            Kiểm tra kết quả
          </button>

          {/* Feedback */}
          {feedback && (
            <div className={`te-feedback ${feedback.correct ? 'te-correct-fb' : 'te-wrong-fb'}`}>
              <div className="te-feedback-icon">
                {feedback.correct ? <Check size={24} /> : <X size={24} />}
              </div>
              <div className="te-feedback-content">
                <div className="te-feedback-message">{feedback.message}</div>
                <div className="te-feedback-detail">{feedback.detail}</div>
              </div>
            </div>
          )}

          {/* Reference Table */}
          <div className="te-reference">
            <h4>📋 Bảng nhiệt dung riêng:</h4>
            <div className="te-ref-grid">
              <span>Nước: 4200 J/(kg·°C)</span>
              <span>Nhôm: 880 J/(kg·°C)</span>
              <span>Sắt: 460 J/(kg·°C)</span>
              <span>Đồng: 380 J/(kg·°C)</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="te-game-over">
          <div className="te-trophy-container">
            <Award size={80} className="te-trophy-icon" />
          </div>
          <h2>🎉 Hoàn thành!</h2>
          
          <div className="te-final-stats">
            <div className="te-final-stat">
              <span className="te-final-label">Tổng điểm</span>
              <span className="te-final-value">{score}</span>
            </div>
            <div className="te-final-stat">
              <span className="te-final-label">Chính xác</span>
              <span className="te-final-value">{correctAnswers}/10</span>
            </div>
            <div className="te-final-stat">
              <span className="te-final-label">Tỷ lệ</span>
              <span className="te-final-value">{Math.round(correctAnswers * 10)}%</span>
            </div>
          </div>

          <div className="te-achievement">
            {correctAnswers >= 9 && <div className="te-badge te-gold">🏆 Bậc thầy nhiệt học!</div>}
            {correctAnswers >= 7 && correctAnswers < 9 && <div className="te-badge te-silver">🥈 Xuất sắc!</div>}
            {correctAnswers >= 5 && correctAnswers < 7 && <div className="te-badge te-bronze">🥉 Khá tốt!</div>}
            {correctAnswers < 5 && <div className="te-badge te-try">💪 Cố gắng thêm!</div>}
          </div>

          <div className="te-button-group">
            <button onClick={handleRestart} className="te-restart-btn">
              <RotateCcw size={20} />
              Chơi lại
            </button>
            <button onClick={() => navigate('/advanced-physics-challenge')} className="te-menu-btn">
              Về danh sách
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThermalEnergyGame;

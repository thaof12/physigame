import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Atom, Zap, Trophy, RotateCcw, Info, AlertTriangle } from 'lucide-react';
import './NuclearReactionChamber.css';

/**
 * Nuclear Reaction Chamber - Lớp 12 Chương 4: Vật lý hạt nhân
 * 
 * Game mô phỏng phản ứng hạt nhân: phân hạch và nhiệt hạch
 * 
 * Physics:
 * - Phân hạch: U-235 + n → Ba-141 + Kr-92 + 3n + E
 * - Nhiệt hạch: H-2 + H-3 → He-4 + n + E
 * - Năng lượng liên kết: E = Δm × c²
 * - Bảo toàn số khối và điện tích
 */

const NuclearReactionChamber = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const [gameState, setGameState] = useState('menu'); // menu, playing, victory
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [animationPhase, setAnimationPhase] = useState('idle'); // idle, reacting, complete

  // Particles for animation
  const [particles, setParticles] = useState([]);

  const levels = [
    {
      id: 1,
      name: 'Phân Hạch Uranium',
      type: 'fission',
      description: 'Tìm hiểu phản ứng phân hạch hạt nhân Uranium-235',
      questions: [
        {
          question: 'Khi một neutron bắn vào hạt nhân U-235, phản ứng nào xảy ra?',
          reaction: '²³⁵U + n → ?',
          options: [
            '¹⁴¹Ba + ⁹²Kr + 3n',
            '¹⁴⁴Xe + ⁹⁰Sr + 2n',
            '¹⁴⁰La + ⁹⁴Zr + 2n',
            '¹³⁹Cs + ⁹⁴Rb + 3n'
          ],
          correct: 0,
          explanation: 'Phản ứng phân hạch U-235 tạo ra Ba-141, Kr-92 và 3 neutron'
        },
        {
          question: 'Số neutron sinh ra trong phản ứng phân hạch U-235 thường là?',
          options: ['1', '2-3', '5-6', '10'],
          correct: 1,
          explanation: 'Phân hạch U-235 thường giải phóng 2-3 neutron'
        },
        {
          question: 'Khối lượng tới hạn của U-235 khoảng bao nhiêu?',
          options: ['5 kg', '15 kg', '50 kg', '100 kg'],
          correct: 1,
          explanation: 'Khối lượng tới hạn của U-235 khoảng 15-50 kg tùy hình dạng'
        }
      ]
    },
    {
      id: 2,
      name: 'Nhiệt Hạch Hydro',
      type: 'fusion',
      description: 'Khám phá phản ứng nhiệt hạch trong lõi mặt trời',
      questions: [
        {
          question: 'Phản ứng nhiệt hạch nào xảy ra trong lõi Mặt Trời?',
          reaction: '²H + ³H → ?',
          options: [
            '⁴He + n + 17.6 MeV',
            '³He + 2n + 10 MeV',
            '⁵Li + γ + 5 MeV',
            '⁶Li + p + 8 MeV'
          ],
          correct: 0,
          explanation: 'Deuterium + Tritium → Helium-4 + neutron + 17.6 MeV năng lượng'
        },
        {
          question: 'Nhiệt độ cần thiết để phản ứng nhiệt hạch xảy ra là?',
          options: ['1 triệu °C', '10 triệu °C', '100 triệu °C', '1 tỷ °C'],
          correct: 2,
          explanation: 'Cần khoảng 100 triệu °C để vượt qua lực đẩy Coulomb'
        },
        {
          question: 'Năng lượng giải phóng từ 1g nhiên liệu nhiệt hạch tương đương?',
          options: ['1 tấn than', '10 tấn than', '100 tấn than', '1000 tấn than'],
          correct: 2,
          explanation: '1g nhiên liệu nhiệt hạch ≈ 100 tấn than về năng lượng'
        }
      ]
    },
    {
      id: 3,
      name: 'Năng Lượng Liên Kết',
      type: 'binding',
      description: 'Tính toán năng lượng liên kết hạt nhân',
      questions: [
        {
          question: 'Công thức tính năng lượng liên kết hạt nhân là?',
          options: [
            'E = Δm × c²',
            'E = m × v²/2',
            'E = h × f',
            'E = p × c'
          ],
          correct: 0,
          explanation: 'E = Δm × c² (Einstein) với Δm là độ hụt khối'
        },
        {
          question: 'Hạt nhân nào có năng lượng liên kết riêng cao nhất?',
          options: ['Uranium-238', 'Sắt-56', 'Helium-4', 'Carbon-12'],
          correct: 1,
          explanation: 'Fe-56 có năng lượng liên kết riêng cao nhất (~8.8 MeV/nucleon)'
        },
        {
          question: 'Độ hụt khối của hạt nhân He-4 là 0.03038 u. Năng lượng liên kết là?',
          options: ['28.3 MeV', '14.2 MeV', '56.6 MeV', '7.1 MeV'],
          correct: 0,
          explanation: 'E = 0.03038 × 931.5 = 28.3 MeV'
        }
      ]
    },
    {
      id: 4,
      name: 'Phản Ứng Dây Chuyền',
      type: 'chain',
      description: 'Hiểu cơ chế phản ứng dây chuyền trong lò phản ứng',
      questions: [
        {
          question: 'Hệ số nhân neutron k trong lò phản ứng bình thường là?',
          options: ['k < 1', 'k = 1', 'k > 1', 'k = 0'],
          correct: 1,
          explanation: 'k = 1 (tới hạn) để duy trì phản ứng ổn định'
        },
        {
          question: 'Thanh điều khiển trong lò phản ứng làm bằng chất gì?',
          options: ['Uranium', 'Cadmi hoặc Bo', 'Chì', 'Graphite'],
          correct: 1,
          explanation: 'Cadmi và Bo hấp thụ neutron mạnh để điều khiển phản ứng'
        },
        {
          question: 'Chất làm chậm (moderator) trong lò có tác dụng gì?',
          options: [
            'Tăng tốc neutron',
            'Làm chậm neutron',
            'Hấp thụ neutron',
            'Tạo neutron mới'
          ],
          correct: 1,
          explanation: 'Làm chậm neutron để tăng xác suất gây phân hạch'
        }
      ]
    }
  ];

  const currentLevel = levels[level - 1];
  const currentQ = currentLevel?.questions[currentQuestion];

  // Animation loop
  useEffect(() => {
    if (gameState === 'playing') {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      let time = 0;

      const animate = () => {
        time += 0.016;
        drawReactionChamber(ctx, canvas.width, canvas.height, time);
        animationRef.current = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [gameState, animationPhase, currentLevel]);

  const drawReactionChamber = (ctx, width, height, time) => {
    // Dark background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw reactor core
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Glowing core
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
    gradient.addColorStop(0, animationPhase === 'reacting' ? '#ff6b35' : '#3b82f6');
    gradient.addColorStop(0.5, animationPhase === 'reacting' ? '#f7931e' : '#1e40af');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 150 + Math.sin(time * 3) * 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw particles
    const particleCount = animationPhase === 'reacting' ? 30 : 10;
    for (let i = 0; i < particleCount; i++) {
      const angle = (time * (i % 2 === 0 ? 1 : -1) + i * 0.5) % (Math.PI * 2);
      const radius = 80 + Math.sin(time * 2 + i) * 30;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      ctx.fillStyle = i % 3 === 0 ? '#4ade80' : i % 3 === 1 ? '#f59e0b' : '#60a5fa';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw energy waves if reacting
    if (animationPhase === 'reacting') {
      ctx.strokeStyle = 'rgba(255, 107, 53, 0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const waveRadius = ((time * 50 + i * 30) % 200);
        ctx.beginPath();
        ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Draw nucleus representation based on level type
    if (currentLevel) {
      drawNucleus(ctx, centerX, centerY, currentLevel.type, time);
    }
  };

  const drawNucleus = (ctx, cx, cy, type, time) => {
    const nucleonPositions = [];
    const nucleonCount = type === 'fission' ? 20 : type === 'fusion' ? 5 : 10;
    
    for (let i = 0; i < nucleonCount; i++) {
      const angle = (i / nucleonCount) * Math.PI * 2 + time * 0.5;
      const radius = 25 + Math.sin(time + i) * 5;
      nucleonPositions.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        isProton: i % 2 === 0
      });
    }

    nucleonPositions.forEach((nucleon, i) => {
      ctx.fillStyle = nucleon.isProton ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(nucleon.x, nucleon.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Glow effect
      ctx.fillStyle = nucleon.isProton ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)';
      ctx.beginPath();
      ctx.arc(nucleon.x, nucleon.y, 12, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const startGame = () => {
    setGameState('playing');
    setLevel(1);
    setScore(0);
    setCorrectAnswers(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowTutorial(false);
  };

  const handleAnswer = (index) => {
    if (showFeedback) return;
    
    setSelectedAnswer(index);
    const correct = index === currentQ.correct;
    setIsCorrect(correct);
    setShowFeedback(true);
    setAnimationPhase('reacting');

    if (correct) {
      setScore(prev => prev + 100);
      setCorrectAnswers(prev => prev + 1);
    }

    setTimeout(() => {
      setAnimationPhase('idle');
      
      if (currentQuestion < currentLevel.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else if (level < levels.length) {
        setLevel(prev => prev + 1);
        setCurrentQuestion(0);
      } else {
        setGameState('victory');
      }
      
      setSelectedAnswer(null);
      setShowFeedback(false);
    }, 2500);
  };

  const resetGame = () => {
    setGameState('menu');
    setLevel(1);
    setScore(0);
    setCorrectAnswers(0);
    setCurrentQuestion(0);
    setShowTutorial(true);
  };

  return (
    <div className="nuclear-reaction-chamber">
      {/* Tutorial Overlay */}
      {showTutorial && gameState === 'menu' && (
        <div className="tutorial-overlay">
          <div className="tutorial-card">
            <Atom className="tutorial-icon" size={60} />
            <h2>⚛️ Buồng Phản Ứng Hạt Nhân</h2>
            <div className="tutorial-content">
              <p className="tutorial-intro">Khám phá thế giới vật lý hạt nhân thông qua các thí nghiệm ảo!</p>
              <div className="tutorial-topics">
                <div className="topic-item">
                  <span className="topic-icon">💥</span>
                  <span>Phản ứng phân hạch Uranium</span>
                </div>
                <div className="topic-item">
                  <span className="topic-icon">☀️</span>
                  <span>Phản ứng nhiệt hạch trong Mặt Trời</span>
                </div>
                <div className="topic-item">
                  <span className="topic-icon">⚡</span>
                  <span>Năng lượng liên kết hạt nhân</span>
                </div>
                <div className="topic-item">
                  <span className="topic-icon">🔄</span>
                  <span>Phản ứng dây chuyền</span>
                </div>
              </div>
              <div className="formula-box">
                <p><strong>Công thức chính:</strong></p>
                <p>E = Δm × c² (Einstein)</p>
                <p>Δm = [Z×mp + (A-Z)×mn] - M</p>
              </div>
            </div>
            <button onClick={startGame} className="start-btn">
              <Zap size={20} />
              Bắt Đầu Thí Nghiệm
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="game-header">
        <button onClick={() => navigate('/physics-games/grade/12')} className="back-btn">
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div className="header-title">
          <Atom className="title-icon" />
          <h1>Buồng Phản Ứng Hạt Nhân</h1>
        </div>
        <div className="game-stats">
          <div className="stat">
            <Trophy size={18} />
            <span>{score} điểm</span>
          </div>
          <div className="stat">
            <span>Level {level}/4</span>
          </div>
        </div>
      </div>

      {/* Main Game Content */}
      {gameState === 'playing' && currentLevel && currentQ && (
        <div className="game-content">
          <div className="level-info">
            <h2>{currentLevel.name}</h2>
            <p>{currentLevel.description}</p>
            <div className="progress-indicator">
              Câu {currentQuestion + 1}/{currentLevel.questions.length}
            </div>
          </div>

          <div className="reaction-chamber">
            <canvas ref={canvasRef} width={400} height={300} />
          </div>

          <div className="question-section">
            <div className="question-box">
              <h3>{currentQ.question}</h3>
              {currentQ.reaction && (
                <div className="reaction-formula">{currentQ.reaction}</div>
              )}
            </div>

            <div className="options-grid">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showFeedback}
                  className={`option-btn ${
                    showFeedback && index === currentQ.correct ? 'correct' : ''
                  } ${
                    showFeedback && index === selectedAnswer && !isCorrect ? 'incorrect' : ''
                  } ${selectedAnswer === index ? 'selected' : ''}`}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                </button>
              ))}
            </div>

            {showFeedback && (
              <div className={`feedback-box ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="feedback-header">
                  {isCorrect ? '✅ Chính xác!' : '❌ Chưa đúng!'}
                </div>
                <p className="feedback-explanation">{currentQ.explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Victory Screen */}
      {gameState === 'victory' && (
        <div className="victory-overlay">
          <div className="victory-card">
            <Trophy className="victory-icon" size={80} />
            <h2>🎉 Hoàn Thành Xuất Sắc!</h2>
            <div className="victory-stats">
              <div className="stat-row">
                <span>Tổng điểm:</span>
                <span className="stat-value">{score}</span>
              </div>
              <div className="stat-row">
                <span>Câu đúng:</span>
                <span className="stat-value">{correctAnswers}/{levels.reduce((sum, l) => sum + l.questions.length, 0)}</span>
              </div>
            </div>
            <div className="achievement-badge">
              {correctAnswers >= 10 ? '🏆 Nhà Vật Lý Hạt Nhân' : 
               correctAnswers >= 7 ? '🥈 Nghiên Cứu Sinh Xuất Sắc' : 
               '🥉 Sinh Viên Cần Cù'}
            </div>
            <div className="victory-buttons">
              <button onClick={resetGame} className="reset-btn">
                <RotateCcw size={20} />
                Chơi Lại
              </button>
              <button onClick={() => navigate('/physics-games/grade/12')} className="home-btn">
                Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NuclearReactionChamber;

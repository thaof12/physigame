import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Atom, Timer, Trophy, RotateCcw, Play, Pause, Info } from 'lucide-react';
import './RadioactiveDecaySimulator.css';

/**
 * Radioactive Decay Simulator - Lớp 12 Chương 4: Vật lý hạt nhân
 * 
 * Game mô phỏng phóng xạ với chu kỳ bán rã
 * 
 * Physics:
 * - Định luật phân rã: N = N₀ × e^(-λt) = N₀ × (1/2)^(t/T)
 * - Chu kỳ bán rã: T = ln(2)/λ ≈ 0.693/λ
 * - Hoạt độ phóng xạ: A = λN = A₀ × e^(-λt)
 * - Các loại tia: α, β⁻, β⁺, γ
 */

const RadioactiveDecaySimulator = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const [gameState, setGameState] = useState('menu'); // menu, simulation, quiz, victory
  const [mode, setMode] = useState('simulation'); // simulation or quiz
  const [isRunning, setIsRunning] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Simulation parameters
  const [isotope, setIsotope] = useState('C-14');
  const [initialAtoms, setInitialAtoms] = useState(1000);
  const [currentAtoms, setCurrentAtoms] = useState(1000);
  const [decayedAtoms, setDecayedAtoms] = useState(0);
  const [halfLifePassed, setHalfLifePassed] = useState(0);

  // Particles for visualization
  const [particles, setParticles] = useState([]);
  const [emittedParticles, setEmittedParticles] = useState([]);

  const isotopes = {
    'C-14': { name: 'Carbon-14', halfLife: 5730, unit: 'năm', decayType: 'β⁻', product: 'N-14' },
    'U-238': { name: 'Uranium-238', halfLife: 4.5e9, unit: 'năm', decayType: 'α', product: 'Th-234' },
    'I-131': { name: 'Iodine-131', halfLife: 8, unit: 'ngày', decayType: 'β⁻', product: 'Xe-131' },
    'Co-60': { name: 'Cobalt-60', halfLife: 5.27, unit: 'năm', decayType: 'β⁻, γ', product: 'Ni-60' },
    'Ra-226': { name: 'Radium-226', halfLife: 1600, unit: 'năm', decayType: 'α', product: 'Rn-222' },
    'Po-210': { name: 'Polonium-210', halfLife: 138, unit: 'ngày', decayType: 'α', product: 'Pb-206' }
  };

  const questions = [
    {
      question: 'Sau 3 chu kỳ bán rã, số hạt nhân còn lại là bao nhiêu phần trăm?',
      options: ['50%', '25%', '12.5%', '6.25%'],
      correct: 2,
      explanation: 'Sau mỗi chu kỳ: 100% → 50% → 25% → 12.5%'
    },
    {
      question: 'Định luật phân rã phóng xạ có dạng?',
      options: [
        'N = N₀ × e^(-λt)',
        'N = N₀ + λt',
        'N = N₀ × λt',
        'N = N₀ / t'
      ],
      correct: 0,
      explanation: 'N = N₀ × e^(-λt) với λ là hằng số phóng xạ'
    },
    {
      question: 'Chu kỳ bán rã T liên hệ với hằng số phóng xạ λ bởi công thức?',
      options: [
        'T = λ',
        'T = ln(2)/λ',
        'T = 2λ',
        'T = e^λ'
      ],
      correct: 1,
      explanation: 'T = ln(2)/λ ≈ 0.693/λ'
    },
    {
      question: 'Tia alpha (α) có bản chất là?',
      options: [
        'Electron',
        'Photon',
        'Hạt nhân Heli-4',
        'Neutron'
      ],
      correct: 2,
      explanation: 'Tia α là hạt nhân He-4 (2 proton + 2 neutron)'
    },
    {
      question: 'Đồng vị C-14 có chu kỳ bán rã 5730 năm. Sau 11460 năm, còn lại bao nhiêu?',
      options: ['1/2', '1/4', '1/8', '1/16'],
      correct: 1,
      explanation: '11460 = 2 × 5730 (2 chu kỳ), còn lại (1/2)² = 1/4'
    },
    {
      question: 'Trong phân rã β⁻, hạt nhân phát ra?',
      options: [
        'Proton và neutrino',
        'Electron và phản neutrino',
        'Positron và neutrino',
        'Neutron và photon'
      ],
      correct: 1,
      explanation: 'β⁻: n → p + e⁻ + ν̄ (electron + phản neutrino)'
    },
    {
      question: 'Hoạt độ phóng xạ được đo bằng đơn vị?',
      options: [
        'Joule (J)',
        'Becquerel (Bq)',
        'Watt (W)',
        'Volt (V)'
      ],
      correct: 1,
      explanation: '1 Bq = 1 phân rã/giây. Đơn vị cũ: Curie (Ci)'
    },
    {
      question: 'Tia gamma (γ) có đặc điểm gì?',
      options: [
        'Mang điện tích +2',
        'Là sóng điện từ năng lượng cao',
        'Là dòng neutron',
        'Bị lệch trong điện trường'
      ],
      correct: 1,
      explanation: 'Tia γ là photon năng lượng cao, không mang điện'
    }
  ];

  // Initialize particles for visualization
  useEffect(() => {
    if (gameState === 'simulation') {
      initializeParticles();
    }
  }, [gameState, initialAtoms]);

  const initializeParticles = () => {
    const newParticles = [];
    const displayCount = Math.min(100, initialAtoms);
    
    for (let i = 0; i < displayCount; i++) {
      newParticles.push({
        id: i,
        x: 100 + Math.random() * 200,
        y: 80 + Math.random() * 140,
        decayed: false,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      });
    }
    
    setParticles(newParticles);
    setEmittedParticles([]);
    setCurrentAtoms(initialAtoms);
    setDecayedAtoms(0);
    setHalfLifePassed(0);
    setSimulationTime(0);
  };

  // Animation loop
  useEffect(() => {
    if (gameState === 'simulation') {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');

      const animate = () => {
        drawSimulation(ctx, canvas.width, canvas.height);
        animationRef.current = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [gameState, particles, emittedParticles, isRunning]);

  // Decay simulation
  useEffect(() => {
    if (!isRunning || gameState !== 'simulation') return;

    const interval = setInterval(() => {
      setSimulationTime(prev => prev + 0.1);
      
      // Decay some atoms
      setParticles(prev => {
        const decayProbability = 0.693 / 10; // Accelerated for visualization
        let decayCount = 0;
        
        const updated = prev.map(p => {
          if (!p.decayed && Math.random() < decayProbability) {
            decayCount++;
            
            // Emit a particle
            setEmittedParticles(em => [...em, {
              id: Date.now() + Math.random(),
              x: p.x,
              y: p.y,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5,
              type: isotopes[isotope].decayType.includes('α') ? 'alpha' : 'beta',
              life: 1
            }]);
            
            return { ...p, decayed: true };
          }
          return p;
        });
        
        if (decayCount > 0) {
          setDecayedAtoms(d => d + Math.round(decayCount * (initialAtoms / 100)));
          setCurrentAtoms(c => Math.max(0, c - Math.round(decayCount * (initialAtoms / 100))));
        }
        
        return updated;
      });

      // Update emitted particles
      setEmittedParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.02
          }))
          .filter(p => p.life > 0)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, gameState, isotope, initialAtoms]);

  // Calculate half-lives passed
  useEffect(() => {
    const halfLives = Math.log2(initialAtoms / Math.max(1, currentAtoms));
    setHalfLifePassed(halfLives);
  }, [currentAtoms, initialAtoms]);

  const drawSimulation = (ctx, width, height) => {
    // Background
    ctx.fillStyle = '#0f0f1f';
    ctx.fillRect(0, 0, width, height);

    // Draw container
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.strokeRect(80, 60, 240, 180);
    
    // Container glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#4f46e5';
    ctx.strokeRect(80, 60, 240, 180);
    ctx.shadowBlur = 0;

    // Draw particles
    particles.forEach(p => {
      if (!p.decayed) {
        // Active atom
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow
        ctx.fillStyle = 'rgba(74, 222, 128, 0.3)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Decayed atom (daughter nucleus)
        ctx.fillStyle = '#6b7280';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw emitted particles
    emittedParticles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.type === 'alpha' ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.type === 'alpha' ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Legend
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Arial';
    ctx.fillText('● Nguyên tử mẹ', 350, 100);
    ctx.fillStyle = '#4ade80';
    ctx.fillText('●', 350, 100);
    
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('● Nguyên tử con', 350, 125);
    ctx.fillStyle = '#6b7280';
    ctx.fillText('●', 350, 125);
    
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('● Hạt phóng xạ', 350, 150);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('●', 350, 150);
  };

  const startSimulation = () => {
    setGameState('simulation');
    initializeParticles();
  };

  const startQuiz = () => {
    setGameState('quiz');
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const handleAnswer = (index) => {
    if (showFeedback) return;
    
    setSelectedAnswer(index);
    const correct = index === questions[currentQuestion].correct;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(prev => prev + 100);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setGameState('victory');
      }
      setSelectedAnswer(null);
      setShowFeedback(false);
    }, 2500);
  };

  const resetAll = () => {
    setGameState('menu');
    setScore(0);
    setCurrentQuestion(0);
    setIsRunning(false);
  };

  return (
    <div className="radioactive-decay-simulator">
      {/* Header */}
      <div className="sim-header">
        <button onClick={() => navigate('/physics-games/grade/12')} className="back-btn">
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <div className="header-title">
          <Atom className="title-icon" />
          <h1>Mô Phỏng Phóng Xạ</h1>
        </div>
        {gameState === 'quiz' && (
          <div className="quiz-score">
            <Trophy size={18} />
            <span>{score} điểm</span>
          </div>
        )}
      </div>

      {/* Menu */}
      {gameState === 'menu' && (
        <div className="menu-container">
          <div className="menu-card">
            <Atom className="menu-icon" size={80} />
            <h2>☢️ Phóng Xạ & Chu Kỳ Bán Rã</h2>
            <p className="menu-description">
              Khám phá hiện tượng phóng xạ và định luật phân rã hạt nhân
            </p>
            
            <div className="physics-info">
              <h3>Kiến thức chính:</h3>
              <div className="formula-list">
                <div className="formula-item">N = N₀ × (1/2)^(t/T)</div>
                <div className="formula-item">T = ln(2)/λ ≈ 0.693/λ</div>
                <div className="formula-item">A = λN (Hoạt độ)</div>
              </div>
            </div>

            <div className="mode-buttons">
              <button onClick={startSimulation} className="mode-btn simulation">
                <Atom size={24} />
                <span>Mô Phỏng</span>
                <small>Quan sát phân rã</small>
              </button>
              <button onClick={startQuiz} className="mode-btn quiz">
                <Info size={24} />
                <span>Câu Hỏi</span>
                <small>Kiểm tra kiến thức</small>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Mode */}
      {gameState === 'simulation' && (
        <div className="simulation-container">
          <div className="simulation-controls">
            <div className="control-group">
              <label>Đồng vị:</label>
              <select 
                value={isotope} 
                onChange={(e) => setIsotope(e.target.value)}
                disabled={isRunning}
              >
                {Object.entries(isotopes).map(([key, value]) => (
                  <option key={key} value={key}>{value.name} (T = {value.halfLife} {value.unit})</option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>Số nguyên tử ban đầu:</label>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={initialAtoms}
                onChange={(e) => !isRunning && setInitialAtoms(parseInt(e.target.value))}
                disabled={isRunning}
              />
              <span>{initialAtoms.toLocaleString()}</span>
            </div>

            <div className="control-buttons">
              <button 
                onClick={() => setIsRunning(!isRunning)} 
                className={`control-btn ${isRunning ? 'running' : ''}`}
              >
                {isRunning ? <Pause size={20} /> : <Play size={20} />}
                {isRunning ? 'Tạm dừng' : 'Chạy'}
              </button>
              <button onClick={initializeParticles} className="control-btn reset">
                <RotateCcw size={20} />
                Đặt lại
              </button>
            </div>
          </div>

          <div className="simulation-view">
            <canvas ref={canvasRef} width={500} height={300} />
          </div>

          <div className="statistics-panel">
            <div className="stat-box">
              <span className="stat-label">Thời gian</span>
              <span className="stat-value">{simulationTime.toFixed(1)} đơn vị</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Còn lại</span>
              <span className="stat-value green">{currentAtoms.toLocaleString()}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Đã phân rã</span>
              <span className="stat-value red">{decayedAtoms.toLocaleString()}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Chu kỳ bán rã đã qua</span>
              <span className="stat-value blue">{halfLifePassed.toFixed(2)} T</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Tỷ lệ còn lại</span>
              <span className="stat-value">{((currentAtoms / initialAtoms) * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="isotope-info">
            <h3>{isotopes[isotope].name}</h3>
            <p>Loại phân rã: <strong>{isotopes[isotope].decayType}</strong></p>
            <p>Sản phẩm: <strong>{isotopes[isotope].product}</strong></p>
            <p>Chu kỳ bán rã: <strong>{isotopes[isotope].halfLife} {isotopes[isotope].unit}</strong></p>
          </div>

          <button onClick={() => setGameState('menu')} className="back-menu-btn">
            Về Menu
          </button>
        </div>
      )}

      {/* Quiz Mode */}
      {gameState === 'quiz' && (
        <div className="quiz-container">
          <div className="quiz-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
            <span>Câu {currentQuestion + 1}/{questions.length}</span>
          </div>

          <div className="question-card">
            <h3>{questions[currentQuestion].question}</h3>
            
            <div className="options-list">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showFeedback}
                  className={`option-btn ${
                    showFeedback && index === questions[currentQuestion].correct ? 'correct' : ''
                  } ${
                    showFeedback && index === selectedAnswer && !isCorrect ? 'incorrect' : ''
                  }`}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span>{option}</span>
                </button>
              ))}
            </div>

            {showFeedback && (
              <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                <p className="feedback-title">
                  {isCorrect ? '✅ Chính xác!' : '❌ Chưa đúng!'}
                </p>
                <p>{questions[currentQuestion].explanation}</p>
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
            <h2>🎉 Hoàn Thành!</h2>
            <div className="victory-stats">
              <p>Điểm số: <strong>{score}</strong></p>
              <p>Đúng: <strong>{score / 100}/{questions.length}</strong></p>
            </div>
            <div className="achievement">
              {score >= 700 ? '🏆 Chuyên Gia Phóng Xạ' :
               score >= 500 ? '🥈 Hiểu Biết Tốt' :
               '🥉 Cần Ôn Tập Thêm'}
            </div>
            <div className="victory-buttons">
              <button onClick={resetAll} className="restart-btn">
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

export default RadioactiveDecaySimulator;

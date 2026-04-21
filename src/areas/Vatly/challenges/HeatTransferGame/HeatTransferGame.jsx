import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, RotateCcw, Flame, Waves, Sun, Link, Check, X, Zap } from 'lucide-react';
import './HeatTransferGame.css';

const HeatTransferGame = ({ isPKMode = false, pkTimeLimit, onComplete, onExit }) => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showTutorial, setShowTutorial] = useState(!isPKMode);
  const [pkTimeLeft, setPkTimeLeft] = useState(pkTimeLimit || 60);
  
  // Animation particles
  const particlesRef = useRef([]);

  const transferMethods = [
    {
      id: 'conduction',
      name: 'Dẫn nhiệt',
      icon: Link,
      description: 'Nhiệt truyền qua vật rắn, từ phân tử này sang phân tử khác',
      color: '#ef4444',
      example: 'Thìa kim loại nóng dần khi đặt vào nước nóng'
    },
    {
      id: 'convection',
      name: 'Đối lưu',
      icon: Waves,
      description: 'Nhiệt truyền bằng dòng chất lỏng hoặc khí chuyển động',
      color: '#3b82f6',
      example: 'Nước nóng ở đáy nồi nổi lên trên'
    },
    {
      id: 'radiation',
      name: 'Bức xạ',
      icon: Sun,
      description: 'Nhiệt truyền bằng sóng điện từ, không cần môi trường',
      color: '#f59e0b',
      example: 'Ánh nắng mặt trời sưởi ấm trái đất'
    }
  ];

  const challenges = [
    {
      id: 1,
      scenario: 'Đun nước, nước đáy nồi nóng lên trước',
      icon: '🍲',
      correctMethod: 'conduction',
      hint: 'Đáy nồi tiếp xúc trực tiếp với bếp',
      description: 'Nhiệt từ bếp truyền vào nồi'
    },
    {
      id: 2,
      scenario: 'Nước nóng ở đáy nổi lên, nước lạnh chìm xuống',
      icon: '♨️',
      correctMethod: 'convection',
      hint: 'Nước chuyển động tạo dòng tuần hoàn',
      description: 'Dòng nước di chuyển'
    },
    {
      id: 3,
      scenario: 'Mặt trời sưởi ấm da mặt bạn',
      icon: '☀️',
      correctMethod: 'radiation',
      hint: 'Không cần không khí làm môi trường',
      description: 'Nhiệt từ mặt trời'
    },
    {
      id: 4,
      scenario: 'Thìa kim loại nóng khi khuấy trà nóng',
      icon: '🥄',
      correctMethod: 'conduction',
      hint: 'Kim loại dẫn nhiệt tốt',
      description: 'Nhiệt lan dọc thìa'
    },
    {
      id: 5,
      scenario: 'Gió ấm từ quạt sưởi làm nóng phòng',
      icon: '🌬️',
      correctMethod: 'convection',
      hint: 'Không khí nóng di chuyển',
      description: 'Không khí tuần hoàn'
    },
    {
      id: 6,
      scenario: 'Ngồi gần lửa trại cảm thấy ấm',
      icon: '🔥',
      correctMethod: 'radiation',
      hint: 'Cảm thấy nóng dù không chạm vào',
      description: 'Nhiệt bức xạ từ lửa'
    },
    {
      id: 7,
      scenario: 'Tay lạnh ôm cốc trà nóng để sưởi ấm',
      icon: '☕',
      correctMethod: 'conduction',
      hint: 'Tay chạm trực tiếp vào cốc',
      description: 'Tiếp xúc trực tiếp'
    },
    {
      id: 8,
      scenario: 'Nước sôi tạo dòng tuần hoàn trong nồi',
      icon: '💧',
      correctMethod: 'convection',
      hint: 'Nước nóng nhẹ hơn, nổi lên',
      description: 'Chất lỏng chuyển động'
    },
    {
      id: 9,
      scenario: 'Sưởi ấm bằng đèn hồng ngoại',
      icon: '💡',
      correctMethod: 'radiation',
      hint: 'Sóng nhiệt truyền qua không khí',
      description: 'Bức xạ nhiệt'
    },
    {
      id: 10,
      scenario: 'Đất nóng lên khi phơi nắng',
      icon: '🏖️',
      correctMethod: 'radiation',
      hint: 'Ánh nắng từ mặt trời',
      description: 'Năng lượng mặt trời'
    }
  ];

  const generateChallenge = useCallback(() => {
    const challenge = challenges[level - 1];
    setCurrentChallenge(challenge);
    setSelectedMethod(null);
    setFeedback(null);
    particlesRef.current = [];
  }, [level]);

  useEffect(() => {
    if (level <= 10 && !gameOver) {
      generateChallenge();
    }
  }, [level, gameOver, generateChallenge]);

  // PK Mode timer
  useEffect(() => {
    if (!isPKMode || showTutorial || gameOver) return;
    
    if (pkTimeLeft > 0) {
      const timer = setTimeout(() => setPkTimeLeft(pkTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Time's up in PK mode
      if (onComplete) {
        onComplete({
          completed: true,
          success: true,
          score: score,
          accuracy: correctAnswers > 0 ? Math.round((correctAnswers / level) * 100) : 0
        });
      }
    }
  }, [isPKMode, pkTimeLeft, showTutorial, gameOver, score, correctAnswers, level, onComplete]);

  // Notify PK mode when game is over
  useEffect(() => {
    if (gameOver && isPKMode && onComplete) {
      onComplete({
        completed: true,
        success: true,
        score: score,
        accuracy: correctAnswers > 0 ? Math.round((correctAnswers / 10) * 100) : 0
      });
    }
  }, [gameOver, isPKMode, score, correctAnswers, onComplete]);

  // Canvas animation
  const drawAnimation = useCallback((ctx, width, height) => {
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, width, height);
    
    const w = width / dpr;
    const h = height / dpr;
    
    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
    
    const time = Date.now() * 0.001;
    
    if (!selectedMethod) {
      // Draw waiting state - floating heat symbols
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Chọn phương thức truyền nhiệt', w / 2, h / 2);
      
      // Floating icons
      const icons = ['🔥', '☀️', '🌊', '💨'];
      icons.forEach((icon, i) => {
        const x = w * 0.2 + i * (w * 0.2);
        const y = h / 2 + Math.sin(time + i) * 20;
        ctx.font = '30px sans-serif';
        ctx.fillText(icon, x, y + 40);
      });
      return;
    }
    
    // Draw based on selected method
    if (selectedMethod === 'conduction') {
      drawConduction(ctx, w, h, time);
    } else if (selectedMethod === 'convection') {
      drawConvection(ctx, w, h, time);
    } else if (selectedMethod === 'radiation') {
      drawRadiation(ctx, w, h, time);
    }
  }, [selectedMethod]);

  const drawConduction = (ctx, w, h, time) => {
    // Draw metal bar
    const barWidth = w * 0.6;
    const barHeight = 40;
    const barX = (w - barWidth) / 2;
    const barY = h * 0.45;
    
    // Metal bar gradient (hot to cold)
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    barGrad.addColorStop(0, '#ef4444');
    barGrad.addColorStop(0.3, '#f97316');
    barGrad.addColorStop(0.6, '#fbbf24');
    barGrad.addColorStop(1, '#64748b');
    
    ctx.fillStyle = barGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 8);
    ctx.fill();
    
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw heat source (flame)
    const flameX = barX - 30;
    const flameY = barY + barHeight / 2;
    
    for (let i = 0; i < 3; i++) {
      const flameHeight = 30 + Math.sin(time * 3 + i) * 10;
      const gradient = ctx.createRadialGradient(
        flameX, flameY, 0,
        flameX, flameY - flameHeight / 2, flameHeight
      );
      gradient.addColorStop(0, 'rgba(252, 211, 77, 1)');
      gradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.8)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      
      ctx.beginPath();
      ctx.moveTo(flameX - 15, flameY + 10);
      ctx.quadraticCurveTo(flameX - 8, flameY - flameHeight * 0.6, flameX, flameY - flameHeight);
      ctx.quadraticCurveTo(flameX + 8, flameY - flameHeight * 0.6, flameX + 15, flameY + 10);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    // Draw vibrating particles in the bar
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const progress = i / particleCount;
      const px = barX + 20 + progress * (barWidth - 40);
      const vibration = (1 - progress) * 5; // More vibration near heat source
      const py = barY + barHeight / 2 + Math.sin(time * 10 + i * 0.5) * vibration;
      
      const particleColor = progress < 0.3 ? '#fcd34d' : 
                           progress < 0.6 ? '#fb923c' : '#94a3b8';
      
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = particleColor;
      ctx.fill();
      
      // Glow effect
      const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, 12);
      glowGrad.addColorStop(0, `${particleColor}40`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw arrows showing heat flow direction
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    
    const arrowY = barY - 30;
    ctx.beginPath();
    ctx.moveTo(barX + 50, arrowY);
    ctx.lineTo(barX + barWidth - 50, arrowY);
    ctx.stroke();
    
    // Arrow head
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(barX + barWidth - 50, arrowY);
    ctx.lineTo(barX + barWidth - 70, arrowY - 10);
    ctx.moveTo(barX + barWidth - 50, arrowY);
    ctx.lineTo(barX + barWidth - 70, arrowY + 10);
    ctx.stroke();
    
    // Label
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DẪN NHIỆT', w / 2, h * 0.2);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Nhiệt truyền qua vật rắn', w / 2, h * 0.25);
  };

  const drawConvection = (ctx, w, h, time) => {
    // Draw container (pot)
    const potWidth = w * 0.5;
    const potHeight = h * 0.55;
    const potX = (w - potWidth) / 2;
    const potY = h * 0.25;
    
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(potX, potY);
    ctx.lineTo(potX, potY + potHeight);
    ctx.lineTo(potX + potWidth, potY + potHeight);
    ctx.lineTo(potX + potWidth, potY);
    ctx.stroke();
    
    // Draw water with gradient
    const waterGrad = ctx.createLinearGradient(0, potY, 0, potY + potHeight);
    waterGrad.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    waterGrad.addColorStop(1, 'rgba(239, 68, 68, 0.4)');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(potX + 2, potY + 5, potWidth - 4, potHeight - 7);
    
    // Draw circulating arrows
    const arrowCount = 6;
    for (let i = 0; i < arrowCount; i++) {
      const angle = time * 0.5 + (i * Math.PI * 2) / arrowCount;
      const radiusX = potWidth * 0.3;
      const radiusY = potHeight * 0.35;
      const centerX = w / 2;
      const centerY = potY + potHeight * 0.5;
      
      const px = centerX + Math.cos(angle) * radiusX;
      const py = centerY + Math.sin(angle) * radiusY;
      
      // Draw particle
      const isRising = Math.sin(angle) < 0;
      const particleColor = isRising ? '#ef4444' : '#3b82f6';
      
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fillStyle = particleColor;
      ctx.fill();
      
      // Trail effect
      for (let t = 1; t <= 3; t++) {
        const trailAngle = angle - t * 0.2;
        const tx = centerX + Math.cos(trailAngle) * radiusX;
        const ty = centerY + Math.sin(trailAngle) * radiusY;
        ctx.beginPath();
        ctx.arc(tx, ty, 8 - t * 2, 0, Math.PI * 2);
        ctx.fillStyle = `${particleColor}${Math.floor(255 * (1 - t * 0.3)).toString(16).padStart(2, '0')}`;
        ctx.fill();
      }
    }
    
    // Draw arrows indicating circulation
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    
    // Up arrow on left
    const leftX = potX + potWidth * 0.25;
    ctx.beginPath();
    ctx.moveTo(leftX, potY + potHeight * 0.7);
    ctx.lineTo(leftX, potY + potHeight * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(leftX, potY + potHeight * 0.3);
    ctx.lineTo(leftX - 8, potY + potHeight * 0.4);
    ctx.moveTo(leftX, potY + potHeight * 0.3);
    ctx.lineTo(leftX + 8, potY + potHeight * 0.4);
    ctx.stroke();
    
    // Down arrow on right
    const rightX = potX + potWidth * 0.75;
    ctx.beginPath();
    ctx.moveTo(rightX, potY + potHeight * 0.3);
    ctx.lineTo(rightX, potY + potHeight * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rightX, potY + potHeight * 0.7);
    ctx.lineTo(rightX - 8, potY + potHeight * 0.6);
    ctx.moveTo(rightX, potY + potHeight * 0.7);
    ctx.lineTo(rightX + 8, potY + potHeight * 0.6);
    ctx.stroke();
    
    // Heat source below
    const flameY = potY + potHeight + 20;
    for (let i = 0; i < 5; i++) {
      const flameX = potX + 30 + i * (potWidth - 60) / 4;
      const flameHeight = 20 + Math.sin(time * 3 + i) * 5;
      
      const gradient = ctx.createRadialGradient(
        flameX, flameY, 0,
        flameX, flameY - flameHeight / 2, flameHeight
      );
      gradient.addColorStop(0, 'rgba(252, 211, 77, 1)');
      gradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.8)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      
      ctx.beginPath();
      ctx.moveTo(flameX - 10, flameY);
      ctx.quadraticCurveTo(flameX, flameY - flameHeight, flameX + 10, flameY);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    // Label
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ĐỐI LƯU', w / 2, h * 0.1);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Chất lỏng/khí chuyển động tuần hoàn', w / 2, h * 0.15);
    
    // Side labels
    ctx.fillStyle = '#ef4444';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Nóng ↑', leftX - 10, potY + potHeight * 0.5);
    ctx.fillStyle = '#3b82f6';
    ctx.textAlign = 'left';
    ctx.fillText('↓ Lạnh', rightX + 10, potY + potHeight * 0.5);
  };

  const drawRadiation = (ctx, w, h, time) => {
    // Draw sun
    const sunX = w * 0.2;
    const sunY = h * 0.35;
    const sunRadius = 40;
    
    // Sun glow
    const glowGrad = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.5, sunX, sunY, sunRadius * 2);
    glowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
    glowGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.3)');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Sun body
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
    sunGrad.addColorStop(0, '#fcd34d');
    sunGrad.addColorStop(0.7, '#f59e0b');
    sunGrad.addColorStop(1, '#ea580c');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Sun rays (corona)
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12 + time * 0.5;
      const innerR = sunRadius + 5;
      const outerR = sunRadius + 15 + Math.sin(time * 3 + i) * 5;
      ctx.beginPath();
      ctx.moveTo(sunX + Math.cos(angle) * innerR, sunY + Math.sin(angle) * innerR);
      ctx.lineTo(sunX + Math.cos(angle) * outerR, sunY + Math.sin(angle) * outerR);
      ctx.stroke();
    }
    
    // Draw target (earth/object)
    const earthX = w * 0.8;
    const earthY = h * 0.5;
    const earthRadius = 35;
    
    const earthGrad = ctx.createRadialGradient(earthX - 10, earthY - 10, 0, earthX, earthY, earthRadius);
    earthGrad.addColorStop(0, '#34d399');
    earthGrad.addColorStop(0.5, '#059669');
    earthGrad.addColorStop(1, '#065f46');
    ctx.fillStyle = earthGrad;
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw wavy radiation lines
    const waveCount = 5;
    for (let w_i = 0; w_i < waveCount; w_i++) {
      const startX = sunX + sunRadius + 20;
      const endX = earthX - earthRadius - 20;
      const baseY = sunY + (earthY - sunY) * (w_i + 1) / (waveCount + 1);
      
      const phase = time * 2 + w_i * 0.5;
      const opacity = 0.3 + Math.sin(phase) * 0.2;
      
      ctx.strokeStyle = `rgba(249, 115, 22, ${opacity})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, baseY);
      
      const steps = 20;
      for (let s = 1; s <= steps; s++) {
        const px = startX + (endX - startX) * (s / steps);
        const waveOffset = Math.sin((s / steps) * Math.PI * 4 + phase) * 8;
        const py = baseY + waveOffset;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
      
      // Arrow at end
      const arrowX = endX;
      const arrowY = baseY;
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX - 10, arrowY - 5);
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX - 10, arrowY + 5);
      ctx.stroke();
    }
    
    // Draw info
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BỨC XẠ NHIỆT', w / 2, h * 0.1);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Sóng điện từ - Không cần môi trường', w / 2, h * 0.15);
    
    // Labels
    ctx.fillStyle = '#fbbf24';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Nguồn nhiệt', sunX, sunY + sunRadius + 25);
    ctx.fillStyle = '#34d399';
    ctx.fillText('Vật hấp thụ', earthX, earthY + earthRadius + 25);
  };

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
      drawAnimation(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showTutorial, gameOver, drawAnimation]);

  const handleSelectMethod = (methodId) => {
    if (feedback) return;
    setSelectedMethod(methodId);
  };

  const handleSubmit = () => {
    if (feedback || !selectedMethod) return;

    const isCorrect = selectedMethod === currentChallenge.correctMethod;

    if (isCorrect) {
      const earnedPoints = 15;
      setScore(score + earnedPoints);
      setCorrectAnswers(correctAnswers + 1);
      setFeedback({
        correct: true,
        message: `Chính xác! 🎉`,
        detail: `${transferMethods.find(m => m.id === selectedMethod).description} (+${earnedPoints} điểm)`
      });
    } else {
      const correctMethodName = transferMethods.find(m => m.id === currentChallenge.correctMethod).name;
      setFeedback({
        correct: false,
        message: 'Chưa đúng!',
        detail: `Đáp án đúng: ${correctMethodName}`
      });
    }

    setTimeout(() => {
      if (level < 10) {
        setLevel(level + 1);
      } else {
        setGameOver(true);
      }
    }, 2500);
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
    <div className="ht-game">
      {/* Tutorial */}
      {showTutorial && (
        <div className="ht-tutorial-overlay">
          <div className="ht-tutorial-card">
            <div className="ht-tutorial-icon">🔥</div>
            <h2>Phòng Thí Nghiệm Truyền Nhiệt</h2>
            <p className="ht-tutorial-subtitle">Khám phá 3 phương thức truyền nhiệt cơ bản</p>
            
            <div className="ht-tutorial-methods">
              {transferMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <div key={method.id} className="ht-method-preview" style={{ borderColor: method.color }}>
                    <div className="ht-method-icon-wrapper" style={{ background: `${method.color}20` }}>
                      <IconComponent size={24} style={{ color: method.color }} />
                    </div>
                    <div className="ht-method-info">
                      <strong style={{ color: method.color }}>{method.name}</strong>
                      <span>{method.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button onClick={() => setShowTutorial(false)} className="ht-start-btn">
              Bắt đầu thí nghiệm
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      {!isPKMode && (
        <div className="ht-header">
          <button onClick={() => navigate('/physics-games/grade/6')} className="ht-back-btn">
            <ArrowLeft size={20} />
            <span>Quay lại</span>
          </button>
          <div className="ht-title">
            <Flame size={28} />
            <h1>Truyền Nhiệt</h1>
          </div>
          <div className="ht-header-stats">
            <div className="ht-header-stat">
              <Zap size={16} />
              <span>{score} điểm</span>
            </div>
          </div>
        </div>
      )}

      {!gameOver ? (
        <div className="ht-main-content">
          {/* Stats Bar */}
          <div className="ht-stats-bar">
            <div className="ht-stat-item">
              <span className="ht-stat-label">Câu hỏi</span>
              <span className="ht-stat-value">{level}/10</span>
            </div>
            <div className="ht-progress-bar">
              <div className="ht-progress-fill" style={{ width: `${(level / 10) * 100}%` }}></div>
            </div>
            <div className="ht-stat-item">
              <span className="ht-stat-label">Đúng</span>
              <span className="ht-stat-value ht-correct">{correctAnswers}</span>
            </div>
          </div>

          {/* Challenge Card */}
          <div className="ht-challenge-card">
            <div className="ht-challenge-icon">{currentChallenge.icon}</div>
            <div className="ht-challenge-info">
              <h2>{currentChallenge.scenario}</h2>
              <p>{currentChallenge.description}</p>
            </div>
          </div>

          {/* Hint */}
          <div className="ht-hint-box">
            <span className="ht-hint-icon">💡</span>
            <span>{currentChallenge.hint}</span>
          </div>

          {/* Canvas Animation */}
          <div className="ht-visualization">
            <canvas ref={canvasRef} className="ht-canvas"></canvas>
          </div>

          {/* Method Selection */}
          <div className="ht-methods-section">
            <h3>Chọn phương thức truyền nhiệt:</h3>
            <div className="ht-methods-grid">
              {transferMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => handleSelectMethod(method.id)}
                    className={`ht-method-card ${selectedMethod === method.id ? 'selected' : ''}`}
                    disabled={!!feedback}
                    style={{ 
                      '--method-color': method.color,
                      borderColor: selectedMethod === method.id ? method.color : undefined
                    }}
                  >
                    <div className="ht-method-card-icon" style={{ background: `${method.color}20` }}>
                      <IconComponent size={28} style={{ color: method.color }} />
                    </div>
                    <h4>{method.name}</h4>
                    <p>{method.example}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="ht-submit-btn"
            disabled={!!feedback || !selectedMethod}
          >
            <Check size={20} />
            Kiểm tra kết quả
          </button>

          {/* Feedback */}
          {feedback && (
            <div className={`ht-feedback ${feedback.correct ? 'ht-correct-fb' : 'ht-wrong-fb'}`}>
              <div className="ht-feedback-icon">
                {feedback.correct ? <Check size={24} /> : <X size={24} />}
              </div>
              <div className="ht-feedback-content">
                <div className="ht-feedback-message">{feedback.message}</div>
                <div className="ht-feedback-detail">{feedback.detail}</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="ht-game-over">
          <div className="ht-trophy-container">
            <Award size={80} className="ht-trophy-icon" />
          </div>
          <h2>🎉 Hoàn thành!</h2>
          
          <div className="ht-final-stats">
            <div className="ht-final-stat">
              <span className="ht-final-label">Tổng điểm</span>
              <span className="ht-final-value">{score}</span>
            </div>
            <div className="ht-final-stat">
              <span className="ht-final-label">Chính xác</span>
              <span className="ht-final-value">{correctAnswers}/10</span>
            </div>
            <div className="ht-final-stat">
              <span className="ht-final-label">Tỷ lệ</span>
              <span className="ht-final-value">{Math.round(correctAnswers * 10)}%</span>
            </div>
          </div>

          <div className="ht-achievement">
            {correctAnswers >= 9 && <div className="ht-badge ht-gold">🏆 Chuyên gia truyền nhiệt!</div>}
            {correctAnswers >= 7 && correctAnswers < 9 && <div className="ht-badge ht-silver">🥈 Rất xuất sắc!</div>}
            {correctAnswers >= 5 && correctAnswers < 7 && <div className="ht-badge ht-bronze">🥉 Khá tốt!</div>}
            {correctAnswers < 5 && <div className="ht-badge ht-try">💪 Cố gắng thêm!</div>}
          </div>

          {!isPKMode && (
            <div className="ht-button-group">
              <button onClick={handleRestart} className="ht-restart-btn">
                <RotateCcw size={20} />
                Chơi lại
              </button>
              <button onClick={() => navigate('/physics-games/grade/6')} className="ht-menu-btn">
                Về danh sách
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeatTransferGame;

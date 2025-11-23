// ElectromagneticLab.jsx - Phòng thí nghiệm Điện từ (Faraday's Electromagnetic Lab)
// Game ID: lop7-2

import React, { useState, useEffect, useRef } from 'react';
import GameIntro from '../GameIntro/GameIntro';
import { GAME_INTRO_DATA } from '../../../data/gameIntroData';
import './ElectromagneticLab.css';

// Component hiển thị nam châm với thiết kế 3D
const Magnet = ({ position, isDragging, onMouseDown, rotation = 0 }) => {
  return (
    <div 
      className={`magnet ${isDragging ? 'dragging' : ''}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        transform: `rotate(${rotation}deg)`
      }}
      onMouseDown={onMouseDown}
    >
      <div className="magnet-body">
        <div className="magnet-north">
          <span className="pole-label">N</span>
          <div className="pole-shine"></div>
        </div>
        <div className="magnet-south">
          <span className="pole-label">S</span>
          <div className="pole-shine"></div>
        </div>
      </div>
      <div className="magnet-shadow"></div>
    </div>
  );
};

// Component hiển thị cuộn dây với thiết kế 3D
const Coil = ({ position, currentFlow, turns = 4 }) => {
  return (
    <div 
      className="coil-container" 
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px` 
      }}
    >
      <svg width="160" height="160" viewBox="0 0 160 160">
        <defs>
          <linearGradient id="copperGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#CD7F32', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#E8A87C', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#8B4513', stopOpacity: 1 }} />
          </linearGradient>
          
          <filter id="coilShadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="2" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Core - Lõi sắt */}
        <rect x="70" y="30" width="20" height="100" fill="#666" rx="2" />
        <rect x="70" y="30" width="20" height="100" fill="url(#metalGradient)" opacity="0.3" rx="2" />
        
        {/* Vẽ các vòng dây với hiệu ứng 3D */}
        {[...Array(turns * 2)].map((_, i) => {
          const side = i < turns ? 'left' : 'right';
          const index = i < turns ? i : i - turns;
          const x = side === 'left' ? 40 : 100;
          const yOffset = 40 + (index * 20);
          const rx = 25;
          const ry = 15;
          
          return (
            <g key={i}>
              {/* Shadow */}
              <ellipse
                cx={x}
                cy={yOffset + 2}
                rx={rx}
                ry={ry}
                fill="rgba(0,0,0,0.2)"
              />
              {/* Wire coil */}
              <ellipse
                cx={x}
                cy={yOffset}
                rx={rx}
                ry={ry}
                fill="none"
                stroke="url(#copperGradient)"
                strokeWidth="4"
                filter="url(#coilShadow)"
              />
              {/* Highlight */}
              <ellipse
                cx={x - 5}
                cy={yOffset - 3}
                rx={rx * 0.4}
                ry={ry * 0.4}
                fill="rgba(255,255,255,0.3)"
              />
            </g>
          );
        })}
        
        {/* Electron flow animation */}
        {currentFlow !== 0 && (
          <g className="electron-flow-animation">
            {[...Array(6)].map((_, i) => (
              <circle 
                key={i} 
                r="3" 
                fill="#FFD700"
                className="electron"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <animateMotion
                  dur="1.5s"
                  repeatCount="indefinite"
                  path={`M 40,${50 + i * 15} Q 80,${50 + i * 15} 100,${50 + i * 15}`}
                />
              </circle>
            ))}
          </g>
        )}
        
        {/* Connection wires */}
        <line x1="65" y1="45" x2="40" y2="45" stroke="#CD7F32" strokeWidth="3" />
        <line x1="100" y1="45" x2="125" y2="45" stroke="#CD7F32" strokeWidth="3" />
      </svg>
      <div className="coil-label">Cuộn dây ({turns} vòng)</div>
    </div>
  );
};

// Component hiển thị đèn LED với thiết kế chân thực
const LightBulb = ({ brightness }) => {
  const opacity = Math.min(brightness / 100, 1);
  const isOn = brightness > 5;
  
  return (
    <div className="light-bulb-container">
      <svg width="80" height="120" viewBox="0 0 80 120">
        <defs>
          <radialGradient id="bulbGlow">
            <stop offset="0%" style={{ stopColor: '#FFFF99', stopOpacity: opacity }} />
            <stop offset="50%" style={{ stopColor: '#FFFF00', stopOpacity: opacity * 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: 0 }} />
          </radialGradient>
          
          <radialGradient id="glassGradient">
            <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.9 }} />
            <stop offset="70%" style={{ stopColor: '#E8E8E8', stopOpacity: 0.7 }} />
            <stop offset="100%" style={{ stopColor: '#CCCCCC', stopOpacity: 0.8 }} />
          </radialGradient>
          
          <filter id="lightGlow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer glow effect */}
        {isOn && (
          <circle 
            cx="40" 
            cy="40" 
            r="35" 
            fill="url(#bulbGlow)" 
            filter="url(#lightGlow)"
            className="bulb-outer-glow"
          />
        )}
        
        {/* Glass bulb body */}
        <path
          d="M 25,45 Q 25,20 40,15 Q 55,20 55,45 Q 55,60 50,65 L 50,70 L 30,70 L 30,65 Q 25,60 25,45 Z"
          fill="url(#glassGradient)"
          stroke="#999"
          strokeWidth="1"
        />
        
        {/* Filament */}
        <g className="filament">
          <path
            d="M 38,35 Q 35,40 38,45 Q 41,50 38,55"
            fill="none"
            stroke={isOn ? '#FFFF00' : '#666'}
            strokeWidth="2"
            opacity={isOn ? 1 : 0.3}
          />
          <path
            d="M 42,35 Q 45,40 42,45 Q 39,50 42,55"
            fill="none"
            stroke={isOn ? '#FFFF00' : '#666'}
            strokeWidth="2"
            opacity={isOn ? 1 : 0.3}
          />
          {isOn && (
            <>
              <circle cx="40" cy="40" r="12" fill="#FFFF00" opacity={opacity * 0.5} />
              <circle cx="40" cy="40" r="8" fill="#FFFFFF" opacity={opacity * 0.7} />
            </>
          )}
        </g>
        
        {/* Light rays */}
        {isOn && (
          <g className="light-rays">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const x1 = 40 + Math.cos(rad) * 20;
              const y1 = 40 + Math.sin(rad) * 20;
              const x2 = 40 + Math.cos(rad) * 30;
              const y2 = 40 + Math.sin(rad) * 30;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#FFFF00"
                  strokeWidth="2"
                  opacity={opacity * 0.6}
                  className="ray"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              );
            })}
          </g>
        )}
        
        {/* Base threads */}
        <g className="bulb-base">
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x="28"
              y={72 + i * 3}
              width="24"
              height="2"
              fill="#888"
            />
          ))}
        </g>
        
        {/* Base cap */}
        <rect x="30" y="88" width="20" height="8" fill="#666" rx="1" />
        
        {/* Connection point */}
        <circle cx="40" cy="100" r="3" fill="#444" />
        
        {/* Shine effect */}
        <ellipse
          cx="32"
          cy="28"
          rx="6"
          ry="10"
          fill="#FFFFFF"
          opacity="0.5"
        />
      </svg>
      <div className="bulb-status">
        <span className={`status-indicator ${isOn ? 'on' : 'off'}`}></span>
        Độ sáng: {Math.round(brightness)}%
      </div>
    </div>
  );
};

// Component kim la bàn hiển thị từ trường
const Compass = ({ position, magnetPosition, fieldStrength }) => {
  // Tính góc xoay của kim la bàn dựa trên vị trí nam châm
  const calculateNeedleAngle = () => {
    const dx = magnetPosition.x - position.x;
    const dy = magnetPosition.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 200) return 0; // Quá xa, không bị ảnh hưởng
    
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const influence = Math.max(0, 1 - distance / 200);
    
    return angle * influence * fieldStrength;
  };
  
  const needleAngle = calculateNeedleAngle();
  
  return (
    <div 
      className="compass" 
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px` 
      }}
    >
      <svg width="60" height="60" viewBox="0 0 60 60">
        <defs>
          <radialGradient id="compassGradient">
            <stop offset="0%" style={{ stopColor: '#FFFFFF' }} />
            <stop offset="100%" style={{ stopColor: '#E8E8E8' }} />
          </radialGradient>
        </defs>
        
        {/* Compass body */}
        <circle cx="30" cy="30" r="28" fill="url(#compassGradient)" stroke="#333" strokeWidth="2" />
        <circle cx="30" cy="30" r="26" fill="none" stroke="#666" strokeWidth="1" />
        
        {/* Cardinal directions */}
        <text x="30" y="12" textAnchor="middle" fontSize="10" fill="#c00" fontWeight="bold">N</text>
        <text x="30" y="52" textAnchor="middle" fontSize="10" fill="#666">S</text>
        <text x="50" y="34" textAnchor="middle" fontSize="10" fill="#666">E</text>
        <text x="10" y="34" textAnchor="middle" fontSize="10" fill="#666">W</text>
        
        {/* Needle - rotating based on magnetic field */}
        <g transform={`rotate(${needleAngle}, 30, 30)`}>
          {/* North pole (red) */}
          <path
            d="M 30,15 L 27,30 L 30,28 L 33,30 Z"
            fill="#E74C3C"
            stroke="#C0392B"
            strokeWidth="1"
          />
          {/* South pole (white/grey) */}
          <path
            d="M 30,45 L 27,30 L 30,32 L 33,30 Z"
            fill="#ECF0F1"
            stroke="#95A5A6"
            strokeWidth="1"
          />
        </g>
        
        {/* Center pivot */}
        <circle cx="30" cy="30" r="3" fill="#34495E" />
        <circle cx="30" cy="30" r="1.5" fill="#7F8C8D" />
      </svg>
      <div className="compass-label">Kim la bàn</div>
    </div>
  );
};

// Component đồng hồ đo điện với thiết kế chuyên nghiệp
const Voltmeter = ({ voltage }) => {
  const maxVoltage = 10;
  const needleAngle = ((voltage / maxVoltage) * 180) - 90; // -90 to +90 degrees
  
  return (
    <div className="voltmeter-container">
      <div className="voltmeter-body">
        <svg width="140" height="100" viewBox="0 0 140 100">
          <defs>
            <linearGradient id="meterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#2C3E50' }} />
              <stop offset="100%" style={{ stopColor: '#34495E' }} />
            </linearGradient>
            
            <radialGradient id="dialGradient">
              <stop offset="0%" style={{ stopColor: '#ECF0F1' }} />
              <stop offset="100%" style={{ stopColor: '#BDC3C7' }} />
            </radialGradient>
          </defs>
          
          {/* Meter body */}
          <rect x="5" y="5" width="130" height="90" rx="10" fill="url(#meterGradient)" stroke="#1A252F" strokeWidth="2" />
          
          {/* Dial face */}
          <path
            d="M 20 80 Q 20 30 70 30 Q 120 30 120 80 Z"
            fill="url(#dialGradient)"
            stroke="#7F8C8D"
            strokeWidth="1"
          />
          
          {/* Scale markings */}
          {[...Array(11)].map((_, i) => {
            const angle = -90 + (i * 18); // -90 to +90 degrees
            const rad = (angle * Math.PI) / 180;
            const x1 = 70 + Math.cos(rad) * 38;
            const y1 = 80 + Math.sin(rad) * 38;
            const x2 = 70 + Math.cos(rad) * (i % 2 === 0 ? 42 : 40);
            const y2 = 80 + Math.sin(rad) * (i % 2 === 0 ? 42 : 40);
            
            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#2C3E50"
                  strokeWidth={i % 2 === 0 ? "2" : "1"}
                />
                {i % 2 === 0 && (
                  <text
                    x={70 + Math.cos(rad) * 48}
                    y={80 + Math.sin(rad) * 48 + 4}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#2C3E50"
                    fontWeight="bold"
                  >
                    {i}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Needle */}
          <g transform={`rotate(${needleAngle}, 70, 80)`}>
            <line
              x1="70"
              y1="80"
              x2="70"
              y2="45"
              stroke="#E74C3C"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <polygon
              points="70,45 68,50 72,50"
              fill="#C0392B"
            />
          </g>
          
          {/* Center pivot */}
          <circle cx="70" cy="80" r="4" fill="#34495E" />
          <circle cx="70" cy="80" r="2" fill="#7F8C8D" />
          
          {/* Unit label */}
          <text x="70" y="75" textAnchor="middle" fontSize="10" fill="#2C3E50" fontWeight="bold">V</text>
        </svg>
        
        <div className="voltmeter-display">
          <div className="digital-display">
            <span className="voltage-value">{voltage.toFixed(2)}</span>
            <span className="voltage-unit"> V</span>
          </div>
        </div>
      </div>
      <div className="voltmeter-label">Đồng hồ đo điện áp</div>
    </div>
  );
};
// Component chính
const ElectromagneticLab = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [currentExperiment, setCurrentExperiment] = useState(0);
  const [score, setScore] = useState(0);
  const [magnetPosition, setMagnetPosition] = useState({ x: 100, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [voltage, setVoltage] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [speed, setSpeed] = useState(0); // Tốc độ di chuyển nam châm
  const [feedback, setFeedback] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const coilPosition = { x: 300, y: 200 };
  const labRef = useRef(null);
  const lastPositionRef = useRef(magnetPosition);
  const lastTimeRef = useRef(Date.now());

  const experiments = [
    {
      id: 1,
      title: 'Thí nghiệm 1: Cảm ứng điện từ cơ bản',
      instruction: 'Di chuyển nam châm vào gần cuộn dây để tạo ra dòng điện cảm ứng',
      goal: 'Tạo ra điện áp > 5V',
      targetVoltage: 5,
      points: 10
    },
    {
      id: 2,
      title: 'Thí nghiệm 2: Ảnh hưởng của tốc độ',
      instruction: 'Di chuyển nam châm nhanh qua cuộn dây để tạo điện áp cao',
      goal: 'Đạt điện áp > 8V',
      targetVoltage: 8,
      points: 15
    },
    {
      id: 3,
      title: 'Thí nghiệm 3: Thắp sáng bóng đèn',
      instruction: 'Di chuyển nam châm đủ nhanh để thắp sáng bóng đèn ít nhất 70%',
      goal: 'Độ sáng > 70%',
      targetBrightness: 70,
      points: 20
    },
    {
      id: 4,
      title: 'Thí nghiệm 4: Dòng điện liên tục',
      instruction: 'Duy trì điện áp trên 6V trong 3 giây',
      goal: 'Giữ điện áp > 6V trong 3 giây',
      targetVoltage: 6,
      duration: 3,
      points: 25
    }
  ];

  const currentExp = experiments[currentExperiment];

  // Tính toán cảm ứng điện từ dựa trên khoảng cách và tốc độ
  const calculateInduction = (magnetPos, coilPos, movementSpeed) => {
    const dx = magnetPos.x - coilPos.x;
    const dy = magnetPos.y - coilPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Hiệu ứng giảm theo khoảng cách
    const maxDistance = 150;
    if (distance > maxDistance) return 0;
    
    const distanceFactor = 1 - (distance / maxDistance);
    
    // Điện áp phụ thuộc vào tốc độ và khoảng cách
    const inducedVoltage = distanceFactor * movementSpeed * 10;
    
    return Math.min(inducedVoltage, 10); // Giới hạn 10V
  };

  // Xử lý kéo nam châm
  const handleMouseDown = (e) => {
    setIsDragging(true);
    lastTimeRef.current = Date.now();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const labRect = labRef.current.getBoundingClientRect();
    const newX = e.clientX - labRect.left - 40; // offset cho center của nam châm
    const newY = e.clientY - labRect.top - 40;
    
    // Tính tốc độ
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTimeRef.current) / 1000; // giây
    const deltaX = newX - lastPositionRef.current.x;
    const deltaY = newY - lastPositionRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const currentSpeed = deltaTime > 0 ? distance / deltaTime : 0;
    
    setSpeed(currentSpeed);
    setMagnetPosition({ x: newX, y: newY });
    
    lastPositionRef.current = { x: newX, y: newY };
    lastTimeRef.current = currentTime;
    
    // Tính toán cảm ứng
    const inducedVoltage = calculateInduction({ x: newX, y: newY }, coilPosition, currentSpeed);
    setVoltage(inducedVoltage);
    setBrightness((inducedVoltage / 10) * 100);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Giảm điện áp khi không di chuyển
  useEffect(() => {
    if (!isDragging) {
      const decayInterval = setInterval(() => {
        setVoltage(prev => Math.max(0, prev * 0.9));
        setBrightness(prev => Math.max(0, prev * 0.9));
        setSpeed(prev => Math.max(0, prev * 0.9));
      }, 100);
      
      return () => clearInterval(decayInterval);
    }
  }, [isDragging]);

  // Kiểm tra hoàn thành thí nghiệm
  useEffect(() => {
    if (currentExp.targetVoltage && voltage > currentExp.targetVoltage && !isCompleted) {
      if (currentExp.duration) {
        // Thí nghiệm cần duy trì điện áp
        const timer = setTimeout(() => {
          if (voltage > currentExp.targetVoltage) {
            completeExperiment();
          }
        }, currentExp.duration * 1000);
        return () => clearTimeout(timer);
      } else {
        completeExperiment();
      }
    }
    
    if (currentExp.targetBrightness && brightness > currentExp.targetBrightness && !isCompleted) {
      completeExperiment();
    }
  }, [voltage, brightness, isCompleted]);

  const completeExperiment = () => {
    setIsCompleted(true);
    setScore(prev => prev + currentExp.points);
    setFeedback(`🎉 Xuất sắc! +${currentExp.points} điểm`);
    
    setTimeout(() => {
      setFeedback('');
    }, 2000);
  };

  const nextExperiment = () => {
    if (currentExperiment < experiments.length - 1) {
      setCurrentExperiment(prev => prev + 1);
      setIsCompleted(false);
      setVoltage(0);
      setBrightness(0);
      setSpeed(0);
      setMagnetPosition({ x: 100, y: 200 });
      setShowInstructions(true);
    }
  };

  const resetExperiment = () => {
    setVoltage(0);
    setBrightness(0);
    setSpeed(0);
    setMagnetPosition({ x: 100, y: 200 });
    setIsCompleted(false);
  };

  // Event listeners cho chuột
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className="electromagnetic-lab">
      {/* Header */}
      <div className="lab-header">
        <h2>⚡ Phòng thí nghiệm Điện từ - Faraday</h2>
        <div className="score-display">Điểm: {score}</div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="instructions-modal">
          <div className="instructions-content">
            <h3>{currentExp.title}</h3>
            <p className="instruction-text">{currentExp.instruction}</p>
            <p className="goal-text">🎯 Mục tiêu: {currentExp.goal}</p>
            <button 
              className="start-button"
              onClick={() => setShowInstructions(false)}
            >
              Bắt đầu thí nghiệm
            </button>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="info-panel">
        <div className="experiment-info">
          <h3>Thí nghiệm {currentExp.id}/4</h3>
          <p>{currentExp.title}</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${(currentExperiment / experiments.length) * 100}%` 
              }}
            />
          </div>
        </div>
        
        <div className="physics-info">
          <h4>📊 Thông số vật lý:</h4>
          <div className="parameter">
            <span>Tốc độ nam châm:</span>
            <strong>{speed.toFixed(1)} px/s</strong>
          </div>
          <div className="parameter">
            <span>Điện áp cảm ứng:</span>
            <strong>{voltage.toFixed(2)} V</strong>
          </div>
          <div className="parameter">
            <span>Độ sáng đèn:</span>
            <strong>{brightness.toFixed(0)} %</strong>
          </div>
        </div>
      </div>

      {/* Hiển thị intro nếu chưa bắt đầu */}
      {showIntro && (
        <GameIntro gameInfo={GAME_INTRO_DATA['lop7-2']} onStart={() => setShowIntro(false)} />
      )}

      {/* Lab Area */}
      <div className="lab-area" ref={labRef}>
        <Magnet 
          position={magnetPosition}
          isDragging={isDragging}
          onMouseDown={handleMouseDown}
          rotation={0}
        />
        
        <Coil 
          position={coilPosition}
          currentFlow={voltage}
          turns={4}
        />
        
        {/* Compass array */}
        <div className="compass-grid">
          <Compass position={{ x: 200, y: 100 }} magnetPosition={magnetPosition} fieldStrength={1} />
          <Compass position={{ x: 400, y: 100 }} magnetPosition={magnetPosition} fieldStrength={1} />
          <Compass position={{ x: 200, y: 300 }} magnetPosition={magnetPosition} fieldStrength={1} />
          <Compass position={{ x: 400, y: 300 }} magnetPosition={magnetPosition} fieldStrength={1} />
        </div>
        
        <div className="instruments">
          <Voltmeter voltage={voltage} />
          <LightBulb brightness={brightness} />
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="feedback-message">
            {feedback}
          </div>
        )}

        {/* Field Lines (Hiển thị từ trường) - Improved */}
        <svg className="field-lines" width="100%" height="100%">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="4"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 8 4, 0 8" fill="#3498db" opacity="0.6" />
            </marker>
            
            <linearGradient id="fieldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#e74c3c', stopOpacity: 0.4 }} />
              <stop offset="50%" style={{ stopColor: '#3498db', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#3498db', stopOpacity: 0.4 }} />
            </linearGradient>
          </defs>
          
          {/* Vẽ đường sức từ từ cực N sang cực S */}
          {[...Array(8)].map((_, i) => {
            const offset = (i - 3.5) * 20;
            const startX = magnetPosition.x + 90; // Từ cực N
            const startY = magnetPosition.y + 40 + offset;
            const endX = magnetPosition.x - 10; // Đến cực S
            const endY = magnetPosition.y + 40 + offset;
            const controlX = magnetPosition.x + 200;
            const controlY = magnetPosition.y + 40 + offset * 2;
            
            return (
              <path
                key={i}
                d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
                fill="none"
                stroke="url(#fieldGradient)"
                strokeWidth="2"
                opacity={voltage > 0 ? 0.6 : 0.3}
                markerEnd="url(#arrowhead)"
                className="field-line"
              />
            );
          })}
        </svg>
      </div>

      {/* Control Panel */}
      <div className="control-panel">
        {isCompleted ? (
          <div className="completion-controls">
            <p className="success-message">✅ Thí nghiệm hoàn thành!</p>
            {currentExperiment < experiments.length - 1 ? (
              <button className="next-button" onClick={nextExperiment}>
                Thí nghiệm tiếp theo →
              </button>
            ) : (
              <div className="final-score">
                <h3>🏆 Hoàn thành tất cả thí nghiệm!</h3>
                <p>Tổng điểm: {score}/{experiments.reduce((sum, exp) => sum + exp.points, 0)}</p>
              </div>
            )}
          </div>
        ) : (
          <button className="reset-button" onClick={resetExperiment}>
            🔄 Đặt lại
          </button>
        )}
      </div>

      {/* Theory Box */}
      <div className="theory-box">
        <h4>💡 Kiến thức:</h4>
        <p>
          <strong>Cảm ứng điện từ (Faraday):</strong> Khi từ trường xuyên qua cuộn dây thay đổi, 
          sẽ xuất hiện dòng điện cảm ứng. Điện áp cảm ứng tỉ lệ với tốc độ thay đổi từ trường.
        </p>
        <p>
          <strong>Công thức:</strong> ε = -N × (dΦ/dt), trong đó N là số vòng dây, Φ là từ thông.
        </p>
      </div>
    </div>
  );
};

export default ElectromagneticLab;

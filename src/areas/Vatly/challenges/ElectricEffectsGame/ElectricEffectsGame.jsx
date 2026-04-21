import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Thermometer, Lightbulb, Magnet, TestTube, Check, Play, ToggleRight } from 'lucide-react';
import './ElectricEffectsGame.css';

const stations = {
  thermal: {
    name: 'Tác Dụng Nhiệt',
    icon: Thermometer,
    description: 'Nối mạch để xem dòng điện làm nóng dây dẫn như thế nào.',
    components: ['battery', 'switch', 'nichrome_wire'],
    goal: (circuit) => circuit.switch && circuit.battery && circuit.nichrome_wire,
  },
  luminous: {
    name: 'Tác Dụng Phát Sáng',
    icon: Lightbulb,
    description: 'Lắp một mạch điện đơn giản để làm bóng đèn LED sáng lên.',
    components: ['battery', 'switch', 'led'],
    goal: (circuit) => circuit.switch && circuit.battery && circuit.led,
  },
  magnetic: {
    name: 'Tác Dụng Từ',
    icon: Magnet,
    description: 'Tạo ra một nam châm điện và hút các kẹp giấy.',
    components: ['battery', 'switch', 'electromagnet'],
    goal: (circuit) => circuit.switch && circuit.battery && circuit.electromagnet,
  },
  chemical: {
    name: 'Tác Dụng Hóa Học',
    icon: TestTube,
    description: 'Quan sát hiện tượng điện phân dung dịch muối đồng.',
    components: ['battery', 'switch', 'electrodes'],
    goal: (circuit) => circuit.switch && circuit.battery && circuit.electrodes,
  },
};

const componentPositions = {
    battery: { x: 100, y: 250 },
    switch: { x: 300, y: 250 },
    device: { x: 500, y: 250 }, // Placeholder for the main device
};

const ElectricEffectsGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [gameState, setGameState] = useState('tutorial');
  const [currentStation, setCurrentStation] = useState('thermal');
  const [isSwitchClosed, setSwitchClosed] = useState(false);
  const [completedStations, setCompletedStations] = useState([]);
  const [animationProps, setAnimationProps] = useState({});
  const animationRef = useRef(null);

  useEffect(() => {
    draw();
  }, [gameState, currentStation, isSwitchClosed, animationProps]);

  useEffect(() => {
    if (isSwitchClosed) {
      runAnimation();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setAnimationProps({ progress: 0 });
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSwitchClosed, currentStation]);

  const runAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    let progress = 0;
    const animate = () => {
      if (!isSwitchClosed) return;
      
      if (progress < 100) {
        progress += 2;
        setAnimationProps({ progress: Math.min(progress, 100) });
        animationRef.current = requestAnimationFrame(animate);
      } else {
        if (!completedStations.includes(currentStation)) {
          setCompletedStations(prev => [...prev, currentStation]);
        }
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#1a2238';
    ctx.fillRect(0, 0, width, height);

    // Draw components
    const batteryPos = componentPositions.battery;
    const switchPos = componentPositions.switch;
    const devicePos = componentPositions.device;

    // Battery
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(batteryPos.x - 30, batteryPos.y - 50, 60, 100);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(batteryPos.x - 15, batteryPos.y - 70, 30, 20);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('+', batteryPos.x - 8, batteryPos.y - 52);
    ctx.fillStyle = '#34495e';
    ctx.fillRect(batteryPos.x - 15, batteryPos.y + 50, 30, 20);
    ctx.fillStyle = 'white';
    ctx.fillText('-', batteryPos.x - 6, batteryPos.y + 66);

    // Switch
    ctx.fillStyle = '#bdc3c7';
    ctx.beginPath();
    ctx.arc(switchPos.x - 30, switchPos.y, 10, 0, 2 * Math.PI);
    ctx.arc(switchPos.x + 30, switchPos.y, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = isSwitchClosed ? '#2ecc71' : '#e74c3c';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(switchPos.x - 30, switchPos.y);
    if (isSwitchClosed) {
        ctx.lineTo(switchPos.x + 30, switchPos.y);
    } else {
        ctx.lineTo(switchPos.x, switchPos.y - 40);
    }
    ctx.stroke();

    // Wires
    ctx.strokeStyle = '#95a5a6';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(batteryPos.x, batteryPos.y - 70);
    ctx.lineTo(switchPos.x - 30, switchPos.y);
    ctx.moveTo(switchPos.x + 30, switchPos.y);
    ctx.lineTo(devicePos.x, devicePos.y);
    ctx.lineTo(devicePos.x, devicePos.y + 50);
    ctx.lineTo(batteryPos.x, batteryPos.y + 60);
    ctx.stroke();

    // Draw specific device for station
    drawDevice(ctx, devicePos.x, devicePos.y);
  };

  const drawDevice = (ctx, x, y) => {
    const { progress = 0 } = animationProps;
    const effectActive = isSwitchClosed;

    switch (currentStation) {
      case 'thermal':
        ctx.strokeStyle = effectActive ? `rgb(255, ${progress * 1.5}, 0)` : '#e67e22';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(x - 50, y);
        ctx.bezierCurveTo(x - 25, y - 30, x + 25, y - 30, x + 50, y);
        ctx.stroke();
        if (effectActive && progress > 80) {
            ctx.fillStyle = `rgba(255, 165, 0, ${ (progress - 80) / 20 })`;
            ctx.font = '14px Arial';
            ctx.fillText('Nóng!', x, y - 40);
        }
        break;
      case 'luminous':
        const glow = effectActive ? progress / 100 : 0;
        ctx.fillStyle = `rgba(255, 255, 0, ${glow})`;
        ctx.shadowColor = 'yellow';
        ctx.shadowBlur = 30 * glow;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        break;
      case 'magnetic':
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(x - 15, y - 50, 30, 100);
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 4;
        for(let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.arc(x, y - 45 + i * 10, 20, Math.PI * 0.6, Math.PI * 1.4);
            ctx.stroke();
        }
        // Paper clips
        for(let i = 0; i < 5; i++) {
            const clipX = x + 60 + (i * 20);
            const clipY = y + 40;
            const attractedY = clipY - (effectActive ? (progress / 100) * 60 : 0);
            ctx.strokeStyle = '#bdc3c7';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(clipX, attractedY);
            ctx.lineTo(clipX, attractedY - 15);
            ctx.arc(clipX - 5, attractedY - 15, 5, 0, Math.PI);
            ctx.stroke();
        }
        break;
      case 'chemical':
        ctx.fillStyle = 'rgba(0, 188, 212, 0.3)';
        ctx.fillRect(x - 60, y - 50, 120, 120);
        ctx.strokeStyle = '#00bcd4';
        ctx.strokeRect(x - 60, y - 50, 120, 120);
        // Electrodes
        ctx.fillStyle = '#34495e';
        ctx.fillRect(x - 40, y - 40, 15, 80);
        ctx.fillRect(x + 25, y - 40, 15, 80);
        if (effectActive) {
            for(let i = 0; i < progress / 10; i++) {
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.beginPath();
                ctx.arc(x + 32, y + 30 - Math.random()*60, Math.random()*2, 0, 2*Math.PI);
                ctx.fill();
            }
            ctx.fillStyle = `rgba(201, 113, 66, ${progress/100})`;
            ctx.fillRect(x - 40, y - 40, 15, 80);
        }
        break;
    }
  };

  const handleSwitchToggle = () => {
    setAnimationProps({}); // Reset animation on toggle
    setSwitchClosed(!isSwitchClosed);
  };

  const changeStation = (station) => {
    setCurrentStation(station);
    setSwitchClosed(false);
    setAnimationProps({});
  };

  const renderTutorial = () => (
    <div className="ee-game">
      <div className="ee-tutorial-overlay">
        <div className="ee-tutorial-card">
          <div className="ee-tutorial-icon">
            <Zap size={44} />
          </div>
          <h2>Các Tác Dụng Của Dòng Điện</h2>
          <p>Khám phá 4 hiệu ứng vật lý quan trọng của dòng điện</p>
          
          <div className="ee-tutorial-steps">
            <h3><ToggleRight size={18} /> Hướng dẫn thí nghiệm</h3>
            <ul>
              <li>
                <div className="ee-step-icon"><Thermometer size={16} /></div>
                <span>Chọn một trạm thí nghiệm (Nhiệt, Sáng, Từ, Hóa học)</span>
              </li>
              <li>
                <div className="ee-step-icon"><Zap size={16} /></div>
                <span>Nhấn vào mạch điện để đóng/mở công tắc</span>
              </li>
              <li>
                <div className="ee-step-icon"><Lightbulb size={16} /></div>
                <span>Quan sát hiện tượng và hiệu ứng xảy ra</span>
              </li>
              <li>
                <div className="ee-step-icon"><Check size={16} /></div>
                <span>Hoàn thành cả 4 trạm để kết thúc thí nghiệm</span>
              </li>
            </ul>
          </div>
          
          <div className="ee-physics-note">
            <p><strong>💡 Kiến thức:</strong> Dòng điện có 4 tác dụng chính: <strong>tác dụng nhiệt</strong> (làm nóng dây dẫn), <strong>tác dụng phát sáng</strong> (làm đèn sáng), <strong>tác dụng từ</strong> (tạo nam châm điện), và <strong>tác dụng hóa học</strong> (điện phân).</p>
          </div>
          
          <button onClick={() => setGameState('playing')} className="ee-start-btn">
            <Play size={20} />
            Bắt Đầu Thí Nghiệm
          </button>
        </div>
      </div>
    </div>
  );
  
  const renderGameFinished = () => (
    <div className="ee-game">
      <div className="ee-tutorial-overlay">
        <div className="ee-tutorial-card">
          <div className="ee-tutorial-icon success">
            <Check size={44} />
          </div>
          <h2>Thí Nghiệm Hoàn Tất!</h2>
          <p>Bạn đã khám phá thành công các tác dụng của dòng điện.</p>
          
          <div className="ee-completed-list">
            {Object.keys(stations).map(key => {
              const StationIcon = stations[key].icon;
              return (
                <div key={key} className="ee-completed-item">
                  <StationIcon size={20} />
                  <span>{stations[key].name}</span>
                  <Check size={16} />
                </div>
              );
            })}
          </div>
          
          <div className="ee-game-over-buttons">
            <button onClick={() => { setGameState('playing'); setCompletedStations([]); changeStation('thermal'); }} className="ee-retry-btn">
              Làm Lại
            </button>
            <button onClick={() => navigate('/physics-games/grade/7')} className="ee-menu-btn">
              Về Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (gameState === 'tutorial') return renderTutorial();
  if (completedStations.length === Object.keys(stations).length) return renderGameFinished();

  return (
    <div className="ee-game">
      <header className="ee-header">
        <button onClick={() => navigate('/physics-games/grade/7')} className="ee-back-btn">
          <ArrowLeft size={20} />
          Quay lại
        </button>
        <div className="ee-title">
          <div className="ee-title-icon">
            <Zap size={26} />
          </div>
          <h1>{stations[currentStation].name}</h1>
        </div>
        <div className="ee-progress">
          <span>{completedStations.length}/{Object.keys(stations).length}</span>
          <Check size={18} />
        </div>
      </header>
      
      <div className="ee-game-content">
        <div className="ee-station-selector">
          <h3 className="ee-selector-title">
            <Zap size={18} />
            Trạm Thí Nghiệm
          </h3>
          <div className="ee-station-list">
            {Object.keys(stations).map(key => {
              const StationIcon = stations[key].icon;
              const isCompleted = completedStations.includes(key);
              return (
                <button 
                  key={key} 
                  className={`ee-station-btn ${currentStation === key ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => changeStation(key)}
                >
                  <div className="station-icon">
                    <StationIcon size={20} />
                  </div>
                  <span>{stations[key].name}</span>
                  {isCompleted && <Check size={16} className="completion-check" />}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="ee-canvas-wrapper">
          <div className="ee-canvas-container" onClick={handleSwitchToggle}>
            <canvas ref={canvasRef} width={700} height={500} className="ee-canvas" />
          </div>
          <div className="ee-instruction">
            <Lightbulb size={16} />
            <span>{stations[currentStation].description}</span>
          </div>
          <div className="ee-switch-hint">
            Click vào mạch để {isSwitchClosed ? 'mở' : 'đóng'} công tắc
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricEffectsGame;

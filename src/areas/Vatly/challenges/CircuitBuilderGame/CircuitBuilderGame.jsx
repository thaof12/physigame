import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Battery, Lightbulb, ToggleLeft, ToggleRight, Plus, Minus, Play, RotateCcw, Info, CircuitBoard, Cable } from 'lucide-react';
import './CircuitBuilderGame.css';

const components = {
  wire: { type: 'wire', label: 'Dây Dẫn' },
  battery: { type: 'battery', label: 'Nguồn Điện', voltage: 9 },
  resistor: { type: 'resistor', label: 'Điện Trở', resistance: 10 },
  lightbulb: { type: 'lightbulb', label: 'Bóng Đèn', resistance: 5 },
  switch: { type: 'switch', label: 'Công Tắc', isOpen: true },
};

const CircuitBuilderGame = ({ isPKMode = false, pkTimeLimit, onComplete, onExit }) => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [gameState, setGameState] = useState(isPKMode ? 'playing' : 'tutorial');
  const [nodes, setNodes] = useState([]);
  const [elements, setElements] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState('wire');
  const [startNode, setStartNode] = useState(null);
  const [circuitInfo, setCircuitInfo] = useState(null);
  const [pkTimeLeft, setPkTimeLeft] = useState(pkTimeLimit || 90);
  const [score, setScore] = useState(0);

  const gridSize = 40;

  useEffect(() => {
    if (gameState === 'playing') {
      initializeGrid();
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing' && canvasRef.current) {
      draw();
    }
  }, [gameState, elements, nodes, startNode]);

  useEffect(() => {
    if (elements.length > 0) {
      analyzeCircuit();
    }
  }, [elements]);

  // PK mode timer
  useEffect(() => {
    if (isPKMode && gameState === 'playing' && pkTimeLeft > 0) {
      const timer = setTimeout(() => setPkTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isPKMode && pkTimeLeft === 0 && gameState === 'playing') {
      // Time's up in PK mode
      if (onComplete) {
        onComplete({
          completed: circuitInfo?.isComplete || false,
          score: score,
          circuitWorking: circuitInfo?.isComplete || false
        });
      }
    }
  }, [isPKMode, pkTimeLeft, gameState, onComplete, score, circuitInfo]);

  // Handle exit
  const handleExit = () => {
    if (isPKMode && onExit) {
      onExit();
    } else {
      navigate(-1);
    }
  };

  // PK mode circuit complete handler
  useEffect(() => {
    if (isPKMode && circuitInfo?.isComplete) {
      const newScore = 100 + Math.floor(pkTimeLeft * 2);
      setScore(newScore);
      setTimeout(() => {
        if (onComplete) {
          onComplete({
            completed: true,
            score: newScore,
            circuitWorking: true
          });
        }
      }, 1500);
    }
  }, [circuitInfo, isPKMode, pkTimeLeft, onComplete]);

  const initializeGrid = () => {
    const canvas = canvasRef.current;
    const numX = Math.floor(canvas.width / gridSize);
    const numY = Math.floor(canvas.height / gridSize);
    const initialNodes = [];
    for (let i = 1; i < numX; i++) {
      for (let j = 1; j < numY; j++) {
        initialNodes.push({ id: `${i}-${j}`, x: i * gridSize, y: j * gridSize, connections: 0 });
      }
    }
    setNodes(initialNodes);
    setElements([]);
    setCircuitInfo(null);
  };

  const drawGrid = (ctx) => {
    const { width, height } = ctx.canvas;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawElements = (ctx) => {
    elements.forEach(el => {
      const n1 = nodes.find(n => n.id === el.start);
      const n2 = nodes.find(n => n.id === el.end);
      if (!n1 || !n2) return;

      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.lineTo(n2.x, n2.y);
      ctx.stroke();

      const midX = (n1.x + n2.x) / 2;
      const midY = (n1.y + n2.y) / 2;
      const angle = Math.atan2(n2.y - n1.y, n2.x - n1.x);

      ctx.save();
      ctx.translate(midX, midY);
      ctx.rotate(angle);

      switch (el.type) {
        case 'battery':
          ctx.fillStyle = 'white';
          ctx.fillRect(-20, -12, 40, 24);
          ctx.fillStyle = '#2c3e50';
          ctx.fillRect(-18, -10, 36, 20);
          ctx.fillStyle = '#e74c3c';
          ctx.fillRect(10, -10, 8, 20);
          ctx.fillStyle = '#3498db';
          ctx.fillRect(-18, -10, 8, 20);
          break;
        case 'resistor':
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          for(let i = 0; i < 6; i++) {
            ctx.lineTo(-15 + i*5, i%2 === 0 ? -8 : 8);
          }
          ctx.lineTo(15, 0);
          ctx.stroke();
          break;
        case 'lightbulb':
          const brightness = circuitInfo?.elementCurrents?.[el.id] || 0;
          const glow = Math.min(1, brightness / 0.5);
          ctx.fillStyle = `rgba(255, 255, 0, ${glow})`;
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, 2 * Math.PI);
          ctx.fill();
          if (glow > 0.1) {
            ctx.shadowColor = 'yellow';
            ctx.shadowBlur = 20 * glow;
          }
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 12, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.shadowBlur = 0;
          break;
        case 'switch':
          ctx.fillStyle = 'grey';
          ctx.fillRect(-20, -5, 40, 10);
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          if (el.isOpen) {
            ctx.lineTo(0, -15);
          } else {
            ctx.lineTo(20, 0);
          }
          ctx.moveTo(20,0);
          ctx.stroke();
          break;
        default: // wire
          break;
      }
      ctx.restore();
    });
  };

  const drawNodes = (ctx) => {
    nodes.forEach(node => {
      ctx.fillStyle = node.connections > 0 ? '#3498db' : 'rgba(255,255,255,0.3)';
      if (startNode && startNode.id === node.id) {
        ctx.fillStyle = '#2ecc71';
      }
      ctx.beginPath();
      ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGrid(ctx);
    drawElements(ctx);
    drawNodes(ctx);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = nodes.find(node => 
      Math.sqrt((x - node.x)**2 + (y - node.y)**2) < gridSize / 2
    );

    if (clickedNode) {
      // Handle switch toggle
      const clickedElement = elements.find(el => {
        if (el.type !== 'switch') return false;
        const n1 = nodes.find(n => n.id === el.start);
        const n2 = nodes.find(n => n.id === el.end);
        const midX = (n1.x + n2.x) / 2;
        const midY = (n1.y + n2.y) / 2;
        return Math.sqrt((x - midX)**2 + (y - midY)**2) < 20;
      });

      if (clickedElement) {
        setElements(prev => prev.map(el => el.id === clickedElement.id ? {...el, isOpen: !el.isOpen} : el));
        return;
      }

      if (!startNode) {
        setStartNode(clickedNode);
      } else {
        if (startNode.id !== clickedNode.id) {
          const newElement = {
            id: `${startNode.id}-${clickedNode.id}-${Date.now()}`,
            start: startNode.id,
            end: clickedNode.id,
            ...components[selectedComponent]
          };
          setElements(prev => [...prev, newElement]);
          setNodes(prev => prev.map(n => 
            (n.id === startNode.id || n.id === clickedNode.id) ? { ...n, connections: n.connections + 1 } : n
          ));
          setStartNode(null);
        }
      }
    } else {
      setStartNode(null);
    }
  };

  const analyzeCircuit = () => {
    // This is a highly simplified analysis for visualization
    const hasBattery = elements.some(el => el.type === 'battery');
    if (!hasBattery || elements.length < 2) {
      setCircuitInfo({ totalVoltage: 0, totalResistance: Infinity, totalCurrent: 0, elementCurrents: {} });
      return;
    }

    // Check if any switch is open
    const hasOpenSwitch = elements.some(el => el.type === 'switch' && el.isOpen);
    const hasPath = !hasOpenSwitch && elements.length > 2;

    if (hasPath) {
      let totalResistance = 0;
      elements.forEach(el => {
        if (el.resistance) totalResistance += el.resistance;
        if (el.type === 'switch' && el.isOpen) totalResistance = Infinity;
      });
      
      const totalVoltage = elements.find(el => el.type === 'battery')?.voltage || 0;
      const totalCurrent = totalResistance > 0 && totalResistance !== Infinity ? totalVoltage / totalResistance : 0;

      const elementCurrents = {};
      elements.forEach(el => {
        elementCurrents[el.id] = totalCurrent;
      });

      setCircuitInfo({ totalVoltage, totalResistance, totalCurrent, elementCurrents });
    } else {
      setCircuitInfo({ totalVoltage: 0, totalResistance: Infinity, totalCurrent: 0, elementCurrents: {} });
    }
  };

  const resetCircuit = () => {
    initializeGrid();
  };

  const renderTutorial = () => (
    <div className="cb-game">
      <div className="cb-tutorial-overlay">
        <div className="cb-tutorial-card">
          <div className="cb-tutorial-icon">
            <CircuitBoard size={44} />
          </div>
          <h2>Xây Dựng Mạch Điện</h2>
          <p className="cb-tutorial-subtitle">Lắp ráp mạch điện và quan sát hoạt động</p>
          
          <div className="cb-tutorial-steps">
            <div className="cb-tutorial-step">
              <div className="cb-step-icon"><Zap size={18} /></div>
              <div className="cb-step-content">
                <strong>Chọn Linh Kiện</strong>
                <span>Chọn dây dẫn, pin, đèn từ thanh công cụ</span>
              </div>
            </div>
            <div className="cb-tutorial-step">
              <div className="cb-step-icon"><Cable size={18} /></div>
              <div className="cb-step-content">
                <strong>Kết Nối Điểm</strong>
                <span>Nhấp 2 điểm liên tiếp để đặt linh kiện</span>
              </div>
            </div>
            <div className="cb-tutorial-step">
              <div className="cb-step-icon"><Lightbulb size={18} /></div>
              <div className="cb-step-content">
                <strong>Tạo Mạch Kín</strong>
                <span>Nối thành mạch kín để đèn sáng</span>
              </div>
            </div>
          </div>

          <div className="cb-physics-note">
            <Info size={20} className="note-icon" />
            <div>
              <p><strong>Quy tắc mạch điện:</strong></p>
              <p>Mạch kín + Nguồn điện = Dòng điện chạy qua</p>
            </div>
          </div>

          <button onClick={() => setGameState('playing')} className="cb-start-btn">
            <Play size={22} />
            Bắt Đầu Xây Dựng
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cb-game">
      {gameState === 'tutorial' && !isPKMode && renderTutorial()}
      
      {/* Header - conditional for PK mode */}
      {!isPKMode ? (
        <header className="cb-header">
          <button onClick={handleExit} className="cb-back-btn">
            <ArrowLeft size={20} />
            Quay lại
          </button>
          <div className="cb-title">
            <div className="cb-title-icon">
              <CircuitBoard size={26} />
            </div>
            <h1>Xây Dựng Mạch Điện</h1>
          </div>
          <button onClick={resetCircuit} className="cb-reset-btn">
            <RotateCcw size={18} />
            Làm Mới
          </button>
        </header>
      ) : (
        <header className="cb-header pk-mode">
          <div className="pk-timer" style={{ color: pkTimeLeft < 15 ? '#ef4444' : 'white' }}>
            ⏱️ {pkTimeLeft}s
          </div>
          <h1>Xây Dựng Mạch Điện</h1>
          <div className="pk-score">⭐ {score}</div>
        </header>
      )}
      
      <div className="cb-game-content">
        <div className="cb-toolbar">
          <h3 className="cb-toolbar-title">
            <Zap size={18} />
            Linh Kiện
          </h3>
          <div className="cb-tool-list">
            {Object.values(components).map(c => (
              <button 
                key={c.type} 
                className={`cb-tool-btn ${selectedComponent === c.type ? 'selected' : ''}`}
                onClick={() => setSelectedComponent(c.type)}
              >
                <div className="tool-icon">
                  {c.type === 'battery' && <Battery size={20} />}
                  {c.type === 'wire' && <Minus size={20} />}
                  {c.type === 'resistor' && <svg width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" d="M2 12h4l2-8l4 16l4-16l2 8h4"/></svg>}
                  {c.type === 'lightbulb' && <Lightbulb size={20} />}
                  {c.type === 'switch' && <ToggleLeft size={20} />}
                </div>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="cb-canvas-wrapper">
          <canvas ref={canvasRef} width={800} height={600} className="cb-canvas" onClick={handleCanvasClick} />
        </div>

        <div className="cb-info-panel">
          <h3 className="cb-info-title">
            <Info size={18} />
            Thông Tin Mạch
          </h3>
          {circuitInfo ? (
            <div className="cb-info-content">
              <div className="cb-info-item">
                <span className="info-label">Điện áp</span>
                <span className="info-value">{circuitInfo.totalVoltage.toFixed(2)} V</span>
              </div>
              <div className="cb-info-item">
                <span className="info-label">Tổng trở</span>
                <span className="info-value">
                  {isFinite(circuitInfo.totalResistance) ? `${circuitInfo.totalResistance.toFixed(2)} Ω` : 'Mạch hở'}
                </span>
              </div>
              <div className="cb-info-item">
                <span className="info-label">Dòng điện</span>
                <span className="info-value">{circuitInfo.totalCurrent.toFixed(3)} A</span>
              </div>
              {elements.find(e => e.type === 'lightbulb') && (
                <div className={`cb-bulb-status ${circuitInfo.totalCurrent > 0 ? 'on' : 'off'}`}>
                  <Lightbulb size={24} />
                  <span>{circuitInfo.totalCurrent > 0 ? 'Đèn sáng!' : 'Đèn tắt'}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="cb-no-info">
              <CircuitBoard size={40} />
              <p>Hãy lắp một mạch điện hoàn chỉnh để xem thông tin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircuitBuilderGame;

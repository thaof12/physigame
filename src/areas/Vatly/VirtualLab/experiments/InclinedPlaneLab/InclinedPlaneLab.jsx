/**
 * InclinedPlaneLab.jsx - Thí nghiệm Chuyển động trên mặt phẳng nghiêng
 * 
 * Mục tiêu:
 * - Khảo sát chuyển động có gia tốc trên mặt phẳng nghiêng
 * - Xác định gia tốc a = g.sin(α) - μ.g.cos(α)
 * - Đo hệ số ma sát μ
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play,
  Pause,
  RotateCcw, 
  Save,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Plus,
  Minus,
  Triangle
} from 'lucide-react';
import { PhysicsUtils, PHYSICS_CONSTANTS } from '../../core/PhysicsEngine';
import { ExperimentDataCollector } from '../../core/DataCollector';
import DataTable from '../../charts/DataTable';
import RealTimeChart from '../../charts/RealTimeChart';
import Stopwatch from '../../instruments/Stopwatch';
import './InclinedPlaneLab.css';

const InclinedPlaneLab = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const dataCollectorRef = useRef(null);
  const animationRef = useRef(null);

  // Trạng thái thí nghiệm
  const [experimentState, setExperimentState] = useState('setup'); // setup | running | finished
  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0);
  const [showTheory, setShowTheory] = useState(false);

  // Tham số thí nghiệm
  const [angle, setAngle] = useState(30); // Góc nghiêng (độ)
  const [planeLength, setPlaneLength] = useState(1.0); // Chiều dài mặt phẳng (m)
  const [mass, setMass] = useState(0.5); // Khối lượng vật (kg)
  const [frictionCoeff, setFrictionCoeff] = useState(0.1); // Hệ số ma sát

  // Trạng thái chuyển động
  const [position, setPosition] = useState(0); // Vị trí trên mặt phẳng (m)
  const [velocity, setVelocity] = useState(0); // Vận tốc (m/s)
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Kết quả tính toán
  const [acceleration, setAcceleration] = useState(0);
  const [theoreticalAccel, setTheoreticalAccel] = useState(0);
  const [finalVelocity, setFinalVelocity] = useState(0);

  // Dữ liệu
  const [motionData, setMotionData] = useState([]);
  const [collectedData, setCollectedData] = useState([]);

  // Khởi tạo DataCollector
  useEffect(() => {
    dataCollectorRef.current = new ExperimentDataCollector('Mặt phẳng nghiêng', [
      { name: 'trial', label: 'Lần đo', type: 'number' },
      { name: 'angle', label: 'α (°)', type: 'number', unit: '°' },
      { name: 'length', label: 'L (m)', type: 'number', unit: 'm' },
      { name: 'time', label: 't (s)', type: 'number', unit: 's' },
      { name: 'vFinal', label: 'v (m/s)', type: 'number', unit: 'm/s' },
      { name: 'accel', label: 'a (m/s²)', type: 'number', unit: 'm/s²' },
      { name: 'friction', label: 'μ', type: 'number' }
    ]);
  }, []);

  // Tính gia tốc lý thuyết
  useEffect(() => {
    const g = PHYSICS_CONSTANTS.g;
    const angleRad = (angle * Math.PI) / 180;
    // a = g(sin(α) - μ.cos(α))
    const a = g * (Math.sin(angleRad) - frictionCoeff * Math.cos(angleRad));
    setTheoreticalAccel(Math.max(0, a));
  }, [angle, frictionCoeff]);

  // Hướng dẫn
  const guideSteps = [
    {
      title: 'Thí nghiệm Mặt phẳng nghiêng',
      content: 'Trong thí nghiệm này, bạn sẽ khảo sát chuyển động của vật trượt trên mặt phẳng nghiêng.'
    },
    {
      title: 'Bước 1: Thiết lập',
      content: 'Điều chỉnh góc nghiêng α, chiều dài mặt phẳng L, và hệ số ma sát μ.'
    },
    {
      title: 'Bước 2: Thả vật',
      content: 'Nhấn "Thả vật" để bắt đầu. Vật sẽ trượt xuống với gia tốc a = g(sinα - μcosα).'
    },
    {
      title: 'Bước 3: Đo đạc',
      content: 'Quan sát thời gian và vận tốc. Sử dụng đồng hồ bấm giờ để đo chính xác.'
    },
    {
      title: 'Bước 4: Tính toán',
      content: 'So sánh gia tốc thực nghiệm với gia tốc lý thuyết. Xác định hệ số ma sát.'
    }
  ];

  // Animation - chuyển động trên mặt phẳng nghiêng
  useEffect(() => {
    if (!isRunning) return;

    const g = PHYSICS_CONSTANTS.g;
    const angleRad = (angle * Math.PI) / 180;
    const a = g * (Math.sin(angleRad) - frictionCoeff * Math.cos(angleRad));
    
    if (a <= 0) {
      setIsRunning(false);
      setExperimentState('finished');
      return;
    }

    let lastTime = performance.now();
    let currentPos = position;
    let currentVel = velocity;
    let currentTime = time;

    const animate = (now) => {
      const dt = (now - lastTime) / 1000; // seconds
      lastTime = now;

      // Cập nhật vận tốc và vị trí
      currentVel += a * dt;
      currentPos += currentVel * dt;
      currentTime += dt;

      // Kiểm tra kết thúc
      if (currentPos >= planeLength) {
        currentPos = planeLength;
        setPosition(currentPos);
        setVelocity(currentVel);
        setTime(currentTime);
        setAcceleration(a);
        setFinalVelocity(currentVel);
        setIsRunning(false);
        setExperimentState('finished');
        
        // Thêm điểm cuối vào dữ liệu
        setMotionData(prev => [...prev, {
          time: currentTime,
          position: currentPos,
          velocity: currentVel
        }]);
        return;
      }

      setPosition(currentPos);
      setVelocity(currentVel);
      setTime(currentTime);
      setAcceleration(a);

      // Lưu dữ liệu mỗi 0.05s
      if (Math.floor(currentTime * 20) > Math.floor((currentTime - dt) * 20)) {
        setMotionData(prev => [...prev, {
          time: PhysicsUtils.round(currentTime, 2),
          position: PhysicsUtils.round(currentPos, 3),
          velocity: PhysicsUtils.round(currentVel, 3)
        }]);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, angle, frictionCoeff, planeLength]);

  // Vẽ mặt phẳng nghiêng
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const padding = 60;
    const planePixelLength = width - 2 * padding - 100;
    const angleRad = (angle * Math.PI) / 180;
    
    // Điểm gốc (chân mặt phẳng)
    const baseX = padding + 50;
    const baseY = height - padding;
    
    // Điểm đỉnh mặt phẳng
    const topX = baseX + planePixelLength * Math.cos(angleRad);
    const topY = baseY - planePixelLength * Math.sin(angleRad);

    // Vẽ mặt đất
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, baseY, width, padding);

    // Vẽ mặt phẳng nghiêng
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(topX, topY);
    ctx.stroke();

    // Vẽ bề mặt mặt phẳng
    ctx.fillStyle = '#1e3a5f';
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(topX, topY);
    ctx.lineTo(topX, topY + 8);
    ctx.lineTo(baseX, baseY + 8);
    ctx.closePath();
    ctx.fill();

    // Vẽ góc α
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(baseX, baseY, 40, -angleRad, 0);
    ctx.stroke();
    
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`α = ${angle}°`, baseX + 50, baseY - 10);

    // Vẽ thước đo chiều dài
    const rulerOffset = 25;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    
    // Đường song song với mặt phẳng
    const dx = Math.cos(angleRad);
    const dy = -Math.sin(angleRad);
    const perpX = Math.sin(angleRad);
    const perpY = Math.cos(angleRad);
    
    ctx.beginPath();
    ctx.moveTo(baseX + perpX * rulerOffset, baseY + perpY * rulerOffset);
    ctx.lineTo(topX + perpX * rulerOffset, topY + perpY * rulerOffset);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#22c55e';
    ctx.font = '12px sans-serif';
    const midX = (baseX + topX) / 2 + perpX * (rulerOffset + 15);
    const midY = (baseY + topY) / 2 + perpY * (rulerOffset + 15);
    ctx.fillText(`L = ${planeLength} m`, midX, midY);

    // Vị trí vật trên mặt phẳng
    const progress = position / planeLength;
    const objX = topX - progress * (topX - baseX);
    const objY = topY + progress * (baseY - topY);

    // Vẽ vật (hình hộp)
    const boxSize = 35;
    ctx.save();
    ctx.translate(objX, objY - boxSize / 2);
    ctx.rotate(-angleRad);
    
    // Bóng đổ
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(-boxSize / 2 + 5, -boxSize / 2 + 5, boxSize, boxSize);
    
    // Vật
    const gradient = ctx.createLinearGradient(-boxSize / 2, -boxSize / 2, boxSize / 2, boxSize / 2);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = gradient;
    ctx.fillRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize);
    
    // Viền
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.strokeRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize);
    
    // Nhãn khối lượng
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass}kg`, 0, 4);
    
    ctx.restore();

    // Vẽ các lực (nếu đang chạy hoặc setup)
    if (experimentState !== 'finished' || !isRunning) {
      const forceScale = 3;
      const g = PHYSICS_CONSTANTS.g;
      
      // Trọng lực P
      const P = mass * g;
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(objX, objY);
      ctx.lineTo(objX, objY + P * forceScale);
      ctx.stroke();
      
      // Mũi tên P
      ctx.beginPath();
      ctx.moveTo(objX - 6, objY + P * forceScale - 10);
      ctx.lineTo(objX, objY + P * forceScale);
      ctx.lineTo(objX + 6, objY + P * forceScale - 10);
      ctx.fill();
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('P', objX + 15, objY + P * forceScale / 2);

      // Thành phần Px (song song mặt phẳng)
      const Px = P * Math.sin(angleRad);
      ctx.strokeStyle = '#f59e0b';
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(objX, objY);
      ctx.lineTo(objX + Px * forceScale * Math.cos(angleRad), objY + Px * forceScale * Math.sin(angleRad));
      ctx.stroke();

      // Lực ma sát (ngược chiều chuyển động)
      if (frictionCoeff > 0 && velocity > 0) {
        const N = P * Math.cos(angleRad);
        const Fms = frictionCoeff * N;
        ctx.strokeStyle = '#a855f7';
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(objX, objY);
        ctx.lineTo(objX - Fms * forceScale * Math.cos(angleRad), objY - Fms * forceScale * Math.sin(angleRad));
        ctx.stroke();
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Fms', objX - Fms * forceScale * Math.cos(angleRad) - 25, objY - Fms * forceScale * Math.sin(angleRad));
      }
    }

    // Thông tin hiển thị
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Vị trí: ${PhysicsUtils.round(position, 3)} m`, 20, 30);
    ctx.fillText(`Vận tốc: ${PhysicsUtils.round(velocity, 2)} m/s`, 20, 50);
    ctx.fillText(`Thời gian: ${PhysicsUtils.round(time, 2)} s`, 20, 70);
    
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`Gia tốc lý thuyết: ${PhysicsUtils.round(theoreticalAccel, 2)} m/s²`, 20, 100);

  }, [angle, planeLength, mass, frictionCoeff, position, velocity, time, experimentState, theoreticalAccel]);

  // Vẽ lại
  useEffect(() => {
    draw();
  }, [draw]);

  // Bắt đầu thí nghiệm
  const startExperiment = () => {
    setPosition(0);
    setVelocity(0);
    setTime(0);
    setMotionData([]);
    setIsRunning(true);
    setExperimentState('running');
  };

  // Reset
  const resetExperiment = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setPosition(0);
    setVelocity(0);
    setTime(0);
    setAcceleration(0);
    setFinalVelocity(0);
    setMotionData([]);
    setIsRunning(false);
    setExperimentState('setup');
  };

  // Ghi số liệu
  const recordData = () => {
    if (experimentState !== 'finished') {
      alert('Hãy chờ vật trượt hết mặt phẳng!');
      return;
    }

    const record = {
      trial: collectedData.length + 1,
      angle: angle,
      length: planeLength,
      time: PhysicsUtils.round(time, 3),
      vFinal: PhysicsUtils.round(finalVelocity, 3),
      accel: PhysicsUtils.round(acceleration, 3),
      friction: frictionCoeff
    };

    if (dataCollectorRef.current) {
      dataCollectorRef.current.addRecord(record);
    }

    setCollectedData(prev => [...prev, record]);
  };

  // Xóa dữ liệu
  const clearData = () => {
    setCollectedData([]);
    if (dataCollectorRef.current) {
      dataCollectorRef.current.clearData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/vatly/virtual-lab')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold">📐 Thí nghiệm: Mặt phẳng nghiêng</h1>
              <p className="text-gray-400 text-sm">Chuyển động có gia tốc</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTheory(!showTheory)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showTheory ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <BookOpen size={18} />
              <span className="hidden sm:inline">Lý thuyết</span>
            </button>
            <button
              onClick={() => setShowGuide(true)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto p-4 gap-4">
        {/* Main Canvas */}
        <div className="flex-1">
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="w-full"
                style={{ height: '380px' }}
              />

              {/* Controls overlay */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                {experimentState === 'setup' && (
                  <button
                    onClick={startExperiment}
                    disabled={theoreticalAccel <= 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors shadow-lg"
                  >
                    <Play size={18} />
                    Thả vật
                  </button>
                )}

                {experimentState === 'finished' && (
                  <button
                    onClick={recordData}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
                  >
                    <Save size={18} />
                    Ghi số liệu
                  </button>
                )}

                <button
                  onClick={resetExperiment}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium transition-colors"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
              </div>

              {/* Warning */}
              {theoreticalAccel <= 0 && (
                <div className="absolute top-4 right-4 bg-red-900/80 backdrop-blur-sm rounded-lg px-4 py-2 text-red-300 text-sm">
                  ⚠️ Ma sát quá lớn, vật không trượt được!
                </div>
              )}
            </div>

            {/* Parameters */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Điều chỉnh thông số</h3>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Angle */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Góc nghiêng α (°)</label>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={angle}
                    onChange={(e) => setAngle(parseInt(e.target.value))}
                    disabled={isRunning}
                    className="w-full accent-yellow-500"
                  />
                  <div className="text-center text-lg font-mono text-yellow-400">{angle}°</div>
                </div>

                {/* Plane Length */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Chiều dài L (m)</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={planeLength}
                    onChange={(e) => setPlaneLength(parseFloat(e.target.value))}
                    disabled={isRunning}
                    className="w-full accent-green-500"
                  />
                  <div className="text-center text-lg font-mono text-green-400">{planeLength.toFixed(1)} m</div>
                </div>

                {/* Mass */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Khối lượng m (kg)</label>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={mass}
                    onChange={(e) => setMass(parseFloat(e.target.value))}
                    disabled={isRunning}
                    className="w-full accent-blue-500"
                  />
                  <div className="text-center text-lg font-mono text-blue-400">{mass.toFixed(1)} kg</div>
                </div>

                {/* Friction */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Hệ số ma sát μ</label>
                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.05"
                    value={frictionCoeff}
                    onChange={(e) => setFrictionCoeff(parseFloat(e.target.value))}
                    disabled={isRunning}
                    className="w-full accent-purple-500"
                  />
                  <div className="text-center text-lg font-mono text-purple-400">{frictionCoeff.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Motion Chart */}
          {motionData.length > 1 && (
            <div className="mt-4">
              <RealTimeChart
                data={motionData}
                xKey="time"
                yKey="velocity"
                xLabel="Thời gian"
                yLabel="Vận tốc"
                xUnit="s"
                yUnit="m/s"
                title="Đồ thị v-t"
                lineColor="#3b82f6"
                pointColor="#22c55e"
                height={180}
              />
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="lg:w-96 space-y-4">
          {/* Stopwatch */}
          <Stopwatch
            time={time}
            isRunning={isRunning}
            onStart={startExperiment}
            onStop={() => setIsRunning(false)}
            onReset={resetExperiment}
          />

          {/* Results */}
          <div className={`rounded-xl p-4 border ${
            experimentState === 'finished'
              ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-700/50'
              : 'bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border-blue-700/50'
          }`}>
            <h3 className="text-lg font-bold text-white mb-3">📊 Kết quả</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-mono text-blue-400">
                  {PhysicsUtils.round(time, 2)}
                </div>
                <div className="text-xs text-gray-400">Thời gian (s)</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-mono text-green-400">
                  {PhysicsUtils.round(velocity, 2)}
                </div>
                <div className="text-xs text-gray-400">Vận tốc (m/s)</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-xl font-mono text-yellow-400">
                  {PhysicsUtils.round(theoreticalAccel, 2)}
                </div>
                <div className="text-xs text-gray-400">a lý thuyết (m/s²)</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-xl font-mono text-purple-400">
                  {experimentState === 'finished' ? PhysicsUtils.round(acceleration, 2) : '-'}
                </div>
                <div className="text-xs text-gray-400">a thực nghiệm (m/s²)</div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            columns={[
              { name: 'trial', label: '#', type: 'number' },
              { name: 'angle', label: 'α(°)', type: 'number' },
              { name: 'time', label: 't(s)', type: 'number', precision: 2 },
              { name: 'accel', label: 'a', type: 'number', precision: 2 }
            ]}
            data={collectedData}
            onClearAll={clearData}
            onExport={() => dataCollectorRef.current?.downloadCSV()}
            onDeleteRecord={(id) => {
              setCollectedData(prev => prev.filter(d => d.trial !== id));
            }}
            maxHeight={150}
          />

          {/* Formula */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">📐 Công thức</h3>
            <div className="bg-gray-900 rounded-lg p-3 space-y-2 text-center">
              <p className="text-lg font-mono text-yellow-400">a = g(sinα - μcosα)</p>
              <p className="text-sm font-mono text-gray-400">v = at | s = ½at²</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-6 border border-gray-700">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">📐</div>
              <h2 className="text-xl font-bold">{guideSteps[guideStep].title}</h2>
            </div>

            <p className="text-gray-300 text-center mb-6">
              {guideSteps[guideStep].content}
            </p>

            <div className="flex justify-center gap-2 mb-6">
              {guideSteps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === guideStep ? 'bg-yellow-500' : 'bg-gray-600'}`}
                />
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setGuideStep(Math.max(0, guideStep - 1))}
                disabled={guideStep === 0}
                className="flex items-center gap-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg"
              >
                <ChevronLeft size={18} /> Trước
              </button>

              {guideStep === guideSteps.length - 1 ? (
                <button
                  onClick={() => setShowGuide(false)}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg"
                >
                  Bắt đầu
                </button>
              ) : (
                <button
                  onClick={() => setGuideStep(guideStep + 1)}
                  className="flex items-center gap-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg"
                >
                  Tiếp <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Theory Modal */}
      {showTheory && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">📚 Chuyển động trên mặt phẳng nghiêng</h2>
              <button onClick={() => setShowTheory(false)} className="p-2 hover:bg-gray-700 rounded-lg">✕</button>
            </div>

            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Phân tích lực</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Trọng lực P = mg hướng xuống</li>
                  <li>Thành phần Px = mg.sinα (song song mặt phẳng)</li>
                  <li>Thành phần Py = mg.cosα (vuông góc mặt phẳng)</li>
                  <li>Phản lực N = mg.cosα</li>
                  <li>Lực ma sát Fms = μN = μmg.cosα</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Gia tốc</h3>
                <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <p className="text-xl font-mono text-yellow-400">a = g(sinα - μcosα)</p>
                </div>
                <p className="text-sm mt-2">Vật trượt được khi: sinα &gt; μcosα (tức tanα &gt; μ)</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Công thức động học</h3>
                <div className="bg-gray-900 p-4 rounded-lg space-y-2 text-center">
                  <p className="font-mono text-green-400">v = v₀ + at</p>
                  <p className="font-mono text-blue-400">s = v₀t + ½at²</p>
                  <p className="font-mono text-purple-400">v² - v₀² = 2as</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InclinedPlaneLab;

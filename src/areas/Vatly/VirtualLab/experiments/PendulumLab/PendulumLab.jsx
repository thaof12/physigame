/**
 * PendulumLab.jsx - Thí nghiệm Dao động con lắc đơn
 * 
 * Mục tiêu:
 * - Khảo sát dao động của con lắc đơn
 * - Đo chu kỳ dao động T
 * - Xác định gia tốc trọng trường g
 * 
 * Công thức: T = 2π√(L/g) => g = 4π²L/T²
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Save,
  Download,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Settings,
  BookOpen
} from 'lucide-react';
import { SimplePendulum, PHYSICS_CONSTANTS, PhysicsUtils } from '../../core/PhysicsEngine';
import { ExperimentDataCollector } from '../../core/DataCollector';
import Stopwatch from '../../instruments/Stopwatch';
import DataTable from '../../charts/DataTable';
import RealTimeChart from '../../charts/RealTimeChart';
import './PendulumLab.css';

const PendulumLab = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const dataCollectorRef = useRef(null);

  // Trạng thái thí nghiệm
  const [experimentState, setExperimentState] = useState('setup'); // setup, running, paused, completed
  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0);
  const [showTheory, setShowTheory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Tham số con lắc
  const [length, setLength] = useState(1.0); // Chiều dài dây (m)
  const [amplitude, setAmplitude] = useState(10); // Biên độ góc (độ)
  const [mass, setMass] = useState(0.5); // Khối lượng (kg) - không ảnh hưởng chu kỳ

  // Trạng thái mô phỏng
  const [angle, setAngle] = useState(0);
  const [angularVelocity, setAngularVelocity] = useState(0);
  const [time, setTime] = useState(0);
  const [oscillationCount, setOscillationCount] = useState(0);
  const [lastCrossing, setLastCrossing] = useState(null);
  const [measuredPeriods, setMeasuredPeriods] = useState([]);

  // Dữ liệu thu thập
  const [collectedData, setCollectedData] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Settings
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [showTrail, setShowTrail] = useState(true);
  const [damping, setDamping] = useState(0); // Hệ số tắt dần

  // Khởi tạo DataCollector
  useEffect(() => {
    dataCollectorRef.current = new ExperimentDataCollector('Dao động con lắc đơn', [
      { name: 'trial', label: 'Lần đo', type: 'number' },
      { name: 'length', label: 'Chiều dài L (m)', type: 'number', unit: 'm' },
      { name: 'oscillations', label: 'Số dao động n', type: 'number' },
      { name: 'totalTime', label: 'Thời gian t (s)', type: 'number', unit: 's' },
      { name: 'period', label: 'Chu kỳ T (s)', type: 'number', unit: 's' },
      { name: 'g', label: 'Gia tốc g (m/s²)', type: 'number', unit: 'm/s²' }
    ]);
  }, []);

  // Hướng dẫn thí nghiệm
  const guideSteps = [
    {
      title: 'Chào mừng đến với Thí nghiệm Con lắc đơn!',
      content: 'Trong thí nghiệm này, bạn sẽ khảo sát dao động của con lắc đơn và xác định gia tốc trọng trường g.',
      highlight: null
    },
    {
      title: 'Bước 1: Thiết lập thông số',
      content: 'Điều chỉnh chiều dài dây L và biên độ góc ban đầu. Lưu ý: chu kỳ T chỉ phụ thuộc vào L, không phụ thuộc khối lượng.',
      highlight: 'controls'
    },
    {
      title: 'Bước 2: Bắt đầu dao động',
      content: 'Nhấn nút "Thả" để bắt đầu. Con lắc sẽ dao động và hệ thống sẽ tự động đếm số dao động.',
      highlight: 'start-button'
    },
    {
      title: 'Bước 3: Thu thập số liệu',
      content: 'Sử dụng đồng hồ để đo thời gian cho nhiều dao động. Nhấn "Ghi số liệu" để lưu kết quả.',
      highlight: 'stopwatch'
    },
    {
      title: 'Bước 4: Phân tích kết quả',
      content: 'Xem bảng số liệu và biểu đồ. So sánh giá trị g tính được với giá trị chuẩn (9.8 m/s²).',
      highlight: 'data-panel'
    }
  ];

  // Tính toán vật lý
  const theoreticalPeriod = SimplePendulum.calculatePeriod(length);
  const theoreticalG = PHYSICS_CONSTANTS.g;

  // Vẽ canvas
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

    // Pivot point
    const pivotX = width / 2;
    const pivotY = 80;

    // Scale: 100px = 0.5m
    const scale = 200; // px per meter
    const ropeLength = length * scale;

    // Tính vị trí quả cầu
    const angleRad = angle * Math.PI / 180;
    const bobX = pivotX + ropeLength * Math.sin(angleRad);
    const bobY = pivotY + ropeLength * Math.cos(angleRad);

    // Vẽ nền với grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Vẽ điểm treo
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Vẽ giá đỡ
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pivotX - 60, pivotY - 20);
    ctx.lineTo(pivotX + 60, pivotY - 20);
    ctx.lineTo(pivotX + 60, pivotY);
    ctx.lineTo(pivotX - 60, pivotY);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    // Vẽ thước đo chiều dài
    const rulerX = pivotX + 80;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(rulerX, pivotY);
    ctx.lineTo(rulerX, pivotY + ropeLength);
    ctx.stroke();
    ctx.setLineDash([]);

    // Nhãn chiều dài
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`L = ${length.toFixed(2)} m`, rulerX + 10, pivotY + ropeLength / 2);

    // Vẽ cung biên độ
    if (experimentState === 'setup') {
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      const ampRad = amplitude * Math.PI / 180;
      ctx.arc(pivotX, pivotY, ropeLength * 0.3, Math.PI / 2 - ampRad, Math.PI / 2 + ampRad);
      ctx.stroke();
      ctx.setLineDash([]);

      // Nhãn biên độ
      ctx.fillStyle = '#22c55e';
      ctx.font = '12px sans-serif';
      ctx.fillText(`θ₀ = ${amplitude}°`, pivotX + ropeLength * 0.35, pivotY + 30);
    }

    // Vẽ dây
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // Vẽ quả cầu
    const bobRadius = 15 + mass * 10;
    
    // Shadow
    ctx.beginPath();
    ctx.arc(bobX + 3, bobY + 3, bobRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    // Ball gradient
    const gradient = ctx.createRadialGradient(
      bobX - bobRadius * 0.3, 
      bobY - bobRadius * 0.3, 
      0, 
      bobX, 
      bobY, 
      bobRadius
    );
    gradient.addColorStop(0, '#60a5fa');
    gradient.addColorStop(0.7, '#3b82f6');
    gradient.addColorStop(1, '#1d4ed8');

    ctx.beginPath();
    ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.arc(bobX - bobRadius * 0.3, bobY - bobRadius * 0.3, bobRadius * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();

    // Vẽ thông tin thời gian thực
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Thời gian: ${time.toFixed(2)} s`, 20, 30);
    ctx.fillText(`Số dao động: ${oscillationCount}`, 20, 55);
    ctx.fillText(`Góc hiện tại: ${angle.toFixed(1)}°`, 20, 80);

    // Chu kỳ lý thuyết
    ctx.fillStyle = '#a855f7';
    ctx.font = '14px sans-serif';
    ctx.fillText(`T (lý thuyết) = ${theoreticalPeriod.toFixed(3)} s`, 20, height - 40);
    ctx.fillText(`g = ${theoreticalG} m/s²`, 20, height - 20);

  }, [angle, length, amplitude, mass, time, oscillationCount, experimentState, theoreticalPeriod, theoreticalG]);

  // Animation loop
  useEffect(() => {
    if (experimentState === 'running') {
      const dt = 0.016 * simulationSpeed; // ~60fps
      
      const animate = () => {
        setTime(prev => prev + dt);
        
        // Cập nhật góc theo phương trình dao động
        setAngle(prevAngle => {
          const omega = Math.sqrt(PHYSICS_CONSTANTS.g / length);
          const dampingFactor = Math.exp(-damping * time);
          const newAngle = amplitude * dampingFactor * Math.cos(omega * (time + dt));
          
          // Đếm dao động khi qua vị trí cân bằng
          if (prevAngle > 0 && newAngle <= 0) {
            setOscillationCount(prev => {
              const newCount = prev + 0.5;
              
              // Ghi nhận thời điểm qua vị trí cân bằng
              if (Number.isInteger(newCount)) {
                setMeasuredPeriods(periods => {
                  if (periods.length > 0) {
                    const lastTime = periods[periods.length - 1].time;
                    const period = (time + dt) - lastTime;
                    return [...periods, { time: time + dt, period }];
                  }
                  return [...periods, { time: time + dt, period: 0 }];
                });
              }
              
              return newCount;
            });
          } else if (prevAngle < 0 && newAngle >= 0) {
            setOscillationCount(prev => prev + 0.5);
          }
          
          return newAngle;
        });

        // Cập nhật dữ liệu biểu đồ
        setChartData(prev => {
          const newPoint = { time: time + dt, angle };
          const updated = [...prev, newPoint];
          // Giới hạn số điểm
          if (updated.length > 500) {
            return updated.slice(-500);
          }
          return updated;
        });

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [experimentState, length, amplitude, damping, simulationSpeed, time, angle]);

  // Vẽ lại khi thay đổi
  useEffect(() => {
    draw();
  }, [draw]);

  // Bắt đầu thí nghiệm
  const startExperiment = () => {
    setAngle(amplitude);
    setAngularVelocity(0);
    setTime(0);
    setOscillationCount(0);
    setMeasuredPeriods([]);
    setChartData([]);
    setExperimentState('running');
  };

  // Tạm dừng
  const pauseExperiment = () => {
    setExperimentState('paused');
  };

  // Tiếp tục
  const resumeExperiment = () => {
    setExperimentState('running');
  };

  // Reset
  const resetExperiment = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setAngle(0);
    setAngularVelocity(0);
    setTime(0);
    setOscillationCount(0);
    setMeasuredPeriods([]);
    setChartData([]);
    setExperimentState('setup');
  };

  // Ghi số liệu
  const recordData = () => {
    if (oscillationCount < 1) {
      alert('Cần ít nhất 1 dao động để ghi số liệu!');
      return;
    }

    const measuredPeriod = time / oscillationCount;
    const calculatedG = SimplePendulum.calculateG(length, measuredPeriod);

    const record = {
      trial: collectedData.length + 1,
      length: PhysicsUtils.round(length, 3),
      oscillations: Math.floor(oscillationCount),
      totalTime: PhysicsUtils.round(time, 3),
      period: PhysicsUtils.round(measuredPeriod, 4),
      g: PhysicsUtils.round(calculatedG, 3)
    };

    if (dataCollectorRef.current) {
      dataCollectorRef.current.addRecord(record);
    }

    setCollectedData(prev => [...prev, record]);
  };

  // Xóa số liệu
  const clearData = () => {
    setCollectedData([]);
    if (dataCollectorRef.current) {
      dataCollectorRef.current.clearData();
    }
  };

  // Xuất CSV
  const exportData = () => {
    if (dataCollectorRef.current) {
      dataCollectorRef.current.downloadCSV();
    }
  };

  // Tính thống kê
  const calculateStats = () => {
    if (collectedData.length === 0) return null;

    const gValues = collectedData.map(d => d.g);
    const avgG = PhysicsUtils.average(gValues);
    const stdDev = PhysicsUtils.standardDeviation(gValues);
    const relError = PhysicsUtils.relativeError(avgG, PHYSICS_CONSTANTS.g);

    return {
      avgG: PhysicsUtils.round(avgG, 3),
      stdDev: PhysicsUtils.round(stdDev, 4),
      relError: PhysicsUtils.round(relError, 2)
    };
  };

  const stats = calculateStats();

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
              <h1 className="text-xl font-bold">🔬 Thí nghiệm: Dao động con lắc đơn</h1>
              <p className="text-gray-400 text-sm">Xác định gia tốc trọng trường g</p>
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
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <HelpCircle size={18} />
              <span className="hidden sm:inline">Hướng dẫn</span>
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto p-4 gap-4">
        {/* Main Canvas Area */}
        <div className="flex-1">
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            {/* Canvas */}
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="w-full"
                style={{ height: '400px' }}
              />

              {/* Overlay controls */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                {/* Control buttons */}
                <div className="flex gap-2">
                  {experimentState === 'setup' && (
                    <button
                      onClick={startExperiment}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors"
                    >
                      <Play size={18} />
                      Thả con lắc
                    </button>
                  )}
                  
                  {experimentState === 'running' && (
                    <button
                      onClick={pauseExperiment}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-medium transition-colors"
                    >
                      <Pause size={18} />
                      Tạm dừng
                    </button>
                  )}
                  
                  {experimentState === 'paused' && (
                    <button
                      onClick={resumeExperiment}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors"
                    >
                      <Play size={18} />
                      Tiếp tục
                    </button>
                  )}

                  {experimentState !== 'setup' && (
                    <>
                      <button
                        onClick={recordData}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
                      >
                        <Save size={18} />
                        Ghi số liệu
                      </button>
                      <button
                        onClick={resetExperiment}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium transition-colors"
                      >
                        <RotateCcw size={18} />
                        Đặt lại
                      </button>
                    </>
                  )}
                </div>

                {/* Stopwatch */}
                {experimentState !== 'setup' && (
                  <div className="hidden md:block">
                    <Stopwatch
                      size="small"
                      autoStart={experimentState === 'running'}
                      showLaps={false}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Parameter controls */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Thông số thí nghiệm</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Chiều dài */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Chiều dài dây L (m)
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="2"
                    step="0.05"
                    value={length}
                    onChange={(e) => setLength(parseFloat(e.target.value))}
                    disabled={experimentState !== 'setup'}
                    className="w-full accent-blue-500"
                  />
                  <div className="text-center text-lg font-mono text-blue-400">
                    {length.toFixed(2)} m
                  </div>
                </div>

                {/* Biên độ */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Biên độ góc θ₀ (°)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={amplitude}
                    onChange={(e) => setAmplitude(parseInt(e.target.value))}
                    disabled={experimentState !== 'setup'}
                    className="w-full accent-green-500"
                  />
                  <div className="text-center text-lg font-mono text-green-400">
                    {amplitude}°
                  </div>
                </div>

                {/* Khối lượng */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Khối lượng m (kg)
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={mass}
                    onChange={(e) => setMass(parseFloat(e.target.value))}
                    disabled={experimentState !== 'setup'}
                    className="w-full accent-yellow-500"
                  />
                  <div className="text-center text-lg font-mono text-yellow-400">
                    {mass.toFixed(1)} kg
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              <p className="text-xs text-gray-500 mt-3 italic">
                💡 Chu kỳ T chỉ phụ thuộc vào chiều dài L, không phụ thuộc khối lượng m và biên độ nhỏ θ₀
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-4">
            <RealTimeChart
              data={chartData}
              xKey="time"
              yKey="angle"
              xLabel="Thời gian"
              yLabel="Góc lệch"
              xUnit="s"
              yUnit="°"
              title="Đồ thị dao động θ(t)"
              lineColor="#3b82f6"
              height={200}
            />
          </div>
        </div>

        {/* Right Panel - Data */}
        <div className="lg:w-96 space-y-4">
          {/* Kết quả tính toán */}
          {stats && (
            <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 rounded-xl p-4 border border-emerald-700/50">
              <h3 className="text-lg font-bold text-white mb-3">📊 Kết quả phân tích</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">g trung bình:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {stats.avgG} m/s²
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Độ lệch chuẩn:</span>
                  <span className="font-mono text-gray-400">± {stats.stdDev}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Sai số tương đối:</span>
                  <span className={`font-mono font-bold ${
                    stats.relError < 5 ? 'text-green-400' : 
                    stats.relError < 10 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {stats.relError}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Giá trị chuẩn:</span>
                  <span className="font-mono text-gray-500">9.8 m/s²</span>
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          <DataTable
            columns={[
              { name: 'trial', label: 'Lần', type: 'number' },
              { name: 'length', label: 'L (m)', type: 'number', precision: 2 },
              { name: 'oscillations', label: 'n', type: 'number' },
              { name: 'totalTime', label: 't (s)', type: 'number', precision: 2 },
              { name: 'period', label: 'T (s)', type: 'number', precision: 3 },
              { name: 'g', label: 'g', type: 'number', precision: 2 }
            ]}
            data={collectedData}
            onClearAll={clearData}
            onExport={exportData}
            onDeleteRecord={(id) => {
              setCollectedData(prev => prev.filter(d => d.trial !== id));
            }}
            maxHeight={250}
          />

          {/* Instructions */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">📝 Hướng dẫn nhanh</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>1. Điều chỉnh chiều dài L</li>
              <li>2. Nhấn "Thả con lắc"</li>
              <li>3. Đợi 5-10 dao động</li>
              <li>4. Nhấn "Ghi số liệu"</li>
              <li>5. Lặp lại với L khác nhau</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-6 border border-gray-700">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔬</div>
              <h2 className="text-xl font-bold">{guideSteps[guideStep].title}</h2>
            </div>

            <p className="text-gray-300 text-center mb-6">
              {guideSteps[guideStep].content}
            </p>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {guideSteps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === guideStep ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setGuideStep(Math.max(0, guideStep - 1))}
                disabled={guideStep === 0}
                className="flex items-center gap-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronLeft size={18} />
                Trước
              </button>

              {guideStep === guideSteps.length - 1 ? (
                <button
                  onClick={() => setShowGuide(false)}
                  className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                >
                  Bắt đầu thí nghiệm
                </button>
              ) : (
                <button
                  onClick={() => setGuideStep(guideStep + 1)}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  Tiếp
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Theory Panel */}
      {showTheory && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">📚 Lý thuyết con lắc đơn</h2>
              <button
                onClick={() => setShowTheory(false)}
                className="p-2 hover:bg-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Định nghĩa</h3>
                <p>Con lắc đơn gồm một vật nhỏ khối lượng m treo ở đầu sợi dây không giãn, khối lượng không đáng kể, chiều dài l.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Chu kỳ dao động</h3>
                <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <p className="text-2xl font-mono text-blue-400">T = 2π√(L/g)</p>
                </div>
                <p className="mt-2">Trong đó:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>T: chu kỳ dao động (s)</li>
                  <li>L: chiều dài dây (m)</li>
                  <li>g: gia tốc trọng trường (m/s²)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Công thức tính g</h3>
                <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <p className="text-2xl font-mono text-green-400">g = 4π²L/T²</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">4. Lưu ý quan trọng</h3>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Chu kỳ T <strong>không phụ thuộc</strong> vào khối lượng m</li>
                  <li>Chu kỳ T <strong>không phụ thuộc</strong> vào biên độ (với góc nhỏ θ &lt; 10°)</li>
                  <li>Nên đo thời gian của nhiều dao động (5-10) để giảm sai số</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed top-20 right-4 bg-gray-800 rounded-xl p-4 border border-gray-700 w-72 z-40 shadow-xl">
          <h3 className="text-lg font-bold mb-4">⚙️ Cài đặt</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Tốc độ mô phỏng
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-400">x{simulationSpeed}</div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Hệ số tắt dần
              </label>
              <input
                type="range"
                min="0"
                max="0.1"
                step="0.01"
                value={damping}
                onChange={(e) => setDamping(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-400">{damping.toFixed(2)}</div>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="mt-4 w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
};

export default PendulumLab;

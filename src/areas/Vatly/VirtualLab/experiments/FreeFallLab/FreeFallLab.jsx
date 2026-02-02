/**
 * FreeFallLab.jsx - Thí nghiệm Đo gia tốc rơi tự do
 * 
 * Mục tiêu:
 * - Thả vật rơi tự do từ độ cao h
 * - Đo thời gian rơi t
 * - Xác định gia tốc trọng trường g = 2h/t²
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  Save,
  Download,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Settings,
  BookOpen,
  Target
} from 'lucide-react';
import { FreeFall, PHYSICS_CONSTANTS, PhysicsUtils } from '../../core/PhysicsEngine';
import { ExperimentDataCollector } from '../../core/DataCollector';
import DataTable from '../../charts/DataTable';
import RealTimeChart from '../../charts/RealTimeChart';
import './FreeFallLab.css';

const FreeFallLabExperiment = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const dataCollectorRef = useRef(null);

  // Trạng thái thí nghiệm
  const [experimentState, setExperimentState] = useState('setup'); // setup, dropping, landed
  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0);
  const [showTheory, setShowTheory] = useState(false);

  // Tham số thí nghiệm
  const [dropHeight, setDropHeight] = useState(1.5); // Độ cao thả (m)
  const [ballMass, setBallMass] = useState(0.1); // Khối lượng (kg)
  const [airResistance, setAirResistance] = useState(false); // Có cản không khí

  // Trạng thái mô phỏng
  const [ballY, setBallY] = useState(0); // Vị trí hiện tại
  const [velocity, setVelocity] = useState(0); // Vận tốc
  const [dropTime, setDropTime] = useState(0); // Thời gian rơi
  const [isDropping, setIsDropping] = useState(false);
  const [hasLanded, setHasLanded] = useState(false);

  // Dữ liệu thu thập
  const [collectedData, setCollectedData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [trialCount, setTrialCount] = useState(0);

  // Khởi tạo DataCollector
  useEffect(() => {
    dataCollectorRef.current = new ExperimentDataCollector('Đo gia tốc rơi tự do', [
      { name: 'trial', label: 'Lần đo', type: 'number' },
      { name: 'height', label: 'Độ cao h (m)', type: 'number', unit: 'm' },
      { name: 'time', label: 'Thời gian t (s)', type: 'number', unit: 's' },
      { name: 'g', label: 'Gia tốc g (m/s²)', type: 'number', unit: 'm/s²' }
    ]);
  }, []);

  // Hướng dẫn thí nghiệm
  const guideSteps = [
    {
      title: 'Thí nghiệm Đo gia tốc rơi tự do',
      content: 'Trong thí nghiệm này, bạn sẽ thả vật rơi tự do từ các độ cao khác nhau để xác định gia tốc trọng trường g.'
    },
    {
      title: 'Bước 1: Chọn độ cao',
      content: 'Điều chỉnh độ cao thả vật h. Độ cao càng lớn, thời gian rơi càng lâu, phép đo càng chính xác.'
    },
    {
      title: 'Bước 2: Thả vật',
      content: 'Nhấn nút "Thả" để bắt đầu. Hệ thống sẽ tự động đo thời gian từ lúc thả đến khi chạm đất.'
    },
    {
      title: 'Bước 3: Ghi số liệu',
      content: 'Sau khi vật chạm đất, nhấn "Ghi số liệu" để lưu kết quả. Gia tốc g được tính theo công thức g = 2h/t².'
    },
    {
      title: 'Bước 4: Lặp lại',
      content: 'Thực hiện nhiều lần với các độ cao khác nhau để có kết quả chính xác hơn.'
    }
  ];

  // Tính toán lý thuyết
  const theoreticalTime = FreeFall.calculateTime(dropHeight);
  const theoreticalVelocity = FreeFall.calculateFinalVelocity(dropHeight);

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

    // Scale: 150px = 1m
    const scale = 150;
    const groundY = height - 60;
    const maxVisibleHeight = (groundY - 100) / scale;

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = groundY; y > 50; y -= scale * 0.5) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Tháp thả
    const towerX = width / 2;
    const towerWidth = 60;
    const towerHeight = Math.min(dropHeight * scale + 50, groundY - 80);

    // Vẽ tháp
    ctx.fillStyle = '#374151';
    ctx.fillRect(towerX - towerWidth / 2, groundY - towerHeight, towerWidth, towerHeight);

    // Các tầng tháp
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    for (let y = groundY; y > groundY - towerHeight; y -= 30) {
      ctx.beginPath();
      ctx.moveTo(towerX - towerWidth / 2, y);
      ctx.lineTo(towerX + towerWidth / 2, y);
      ctx.stroke();
    }

    // Platform thả
    const platformY = groundY - dropHeight * scale;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(towerX - 40, platformY - 5, 80, 10);

    // Thước đo bên trái
    const rulerX = towerX - towerWidth / 2 - 40;
    
    // Đường thước
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rulerX, groundY);
    ctx.lineTo(rulerX, platformY);
    ctx.stroke();

    // Mũi tên
    ctx.beginPath();
    ctx.moveTo(rulerX - 8, platformY + 15);
    ctx.lineTo(rulerX, platformY);
    ctx.lineTo(rulerX + 8, platformY + 15);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rulerX - 8, groundY - 15);
    ctx.lineTo(rulerX, groundY);
    ctx.lineTo(rulerX + 8, groundY - 15);
    ctx.stroke();

    // Nhãn độ cao
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(rulerX - 20, (groundY + platformY) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`h = ${dropHeight.toFixed(2)} m`, 0, 0);
    ctx.restore();

    // Mặt đất
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, groundY, width, height - groundY);

    // Vẽ cỏ
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    for (let x = 10; x < width; x += 15) {
      const grassHeight = 5 + Math.random() * 10;
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x + 3, groundY - grassHeight);
      ctx.stroke();
    }

    // Cảm biến mặt đất
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(towerX - 50, groundY - 5, 100, 8);
    ctx.fillStyle = '#60a5fa';
    ctx.font = '10px sans-serif';
    ctx.fillText('SENSOR', towerX, groundY + 15);

    // Vẽ quả bóng
    const currentBallY = experimentState === 'setup' 
      ? platformY - 20 
      : groundY - ballY * scale - 15;

    const ballRadius = 12 + ballMass * 20;

    // Shadow
    if (currentBallY < groundY - 20) {
      const shadowSize = Math.max(5, ballRadius * (1 - (groundY - currentBallY) / 300));
      ctx.beginPath();
      ctx.ellipse(towerX, groundY - 2, shadowSize, shadowSize * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();
    }

    // Ball
    const gradient = ctx.createRadialGradient(
      towerX - ballRadius * 0.3,
      currentBallY - ballRadius * 0.3,
      0,
      towerX,
      currentBallY,
      ballRadius
    );
    gradient.addColorStop(0, '#f87171');
    gradient.addColorStop(0.7, '#ef4444');
    gradient.addColorStop(1, '#b91c1c');

    ctx.beginPath();
    ctx.arc(towerX, currentBallY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.arc(towerX - ballRadius * 0.3, currentBallY - ballRadius * 0.3, ballRadius * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();

    // Thông tin real-time
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    
    if (experimentState === 'dropping' || experimentState === 'landed') {
      ctx.fillText(`⏱️ Thời gian: ${dropTime.toFixed(3)} s`, 20, 30);
      ctx.fillText(`📏 Độ cao còn lại: ${(dropHeight - (dropHeight - ballY)).toFixed(2)} m`, 20, 55);
      ctx.fillText(`🚀 Vận tốc: ${velocity.toFixed(2)} m/s`, 20, 80);
    }

    // Giá trị lý thuyết
    ctx.fillStyle = '#a855f7';
    ctx.font = '14px sans-serif';
    ctx.fillText(`t (lý thuyết) = ${theoreticalTime.toFixed(3)} s`, 20, height - 40);
    ctx.fillText(`v (lý thuyết) = ${theoreticalVelocity.toFixed(2)} m/s`, 20, height - 20);

    // Thông báo chạm đất
    if (experimentState === 'landed') {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓ CHẠM ĐẤT!', width / 2, 100);

      const calculatedG = FreeFall.calculateG(dropHeight, dropTime);
      ctx.font = '18px sans-serif';
      ctx.fillText(`g = 2h/t² = ${calculatedG.toFixed(3)} m/s²`, width / 2, 130);
    }

  }, [ballY, dropHeight, ballMass, experimentState, dropTime, velocity, theoreticalTime, theoreticalVelocity]);

  // Animation loop
  useEffect(() => {
    if (experimentState === 'dropping') {
      const dt = 0.016; // ~60fps
      const g = PHYSICS_CONSTANTS.g;
      
      const animate = () => {
        setDropTime(prev => prev + dt);
        
        setVelocity(prev => {
          const newVel = prev + g * dt;
          // Cản không khí đơn giản
          if (airResistance) {
            const drag = 0.1 * newVel * newVel;
            return newVel - drag * dt;
          }
          return newVel;
        });

        setBallY(prev => {
          const newY = prev + velocity * dt + 0.5 * g * dt * dt;
          
          // Kiểm tra chạm đất
          if (newY >= dropHeight) {
            setExperimentState('landed');
            setHasLanded(true);
            return dropHeight;
          }
          
          return newY;
        });

        // Cập nhật biểu đồ
        setChartData(prev => [...prev, { time: dropTime + dt, height: dropHeight - ballY }]);

        if (experimentState === 'dropping') {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [experimentState, velocity, dropHeight, ballY, dropTime, airResistance]);

  // Vẽ lại
  useEffect(() => {
    draw();
  }, [draw]);

  // Thả vật
  const dropBall = () => {
    setBallY(0);
    setVelocity(0);
    setDropTime(0);
    setChartData([]);
    setHasLanded(false);
    setExperimentState('dropping');
  };

  // Reset
  const resetExperiment = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setBallY(0);
    setVelocity(0);
    setDropTime(0);
    setChartData([]);
    setHasLanded(false);
    setExperimentState('setup');
  };

  // Ghi số liệu
  const recordData = () => {
    if (!hasLanded) {
      alert('Vật chưa chạm đất!');
      return;
    }

    const calculatedG = FreeFall.calculateG(dropHeight, dropTime);
    const newTrial = trialCount + 1;

    const record = {
      trial: newTrial,
      height: PhysicsUtils.round(dropHeight, 3),
      time: PhysicsUtils.round(dropTime, 4),
      g: PhysicsUtils.round(calculatedG, 3)
    };

    if (dataCollectorRef.current) {
      dataCollectorRef.current.addRecord(record);
    }

    setCollectedData(prev => [...prev, record]);
    setTrialCount(newTrial);
    
    // Auto reset for next trial
    resetExperiment();
  };

  // Xóa dữ liệu
  const clearData = () => {
    setCollectedData([]);
    setTrialCount(0);
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

  // Thống kê
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
              <h1 className="text-xl font-bold">🍎 Thí nghiệm: Đo gia tốc rơi tự do</h1>
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
                style={{ height: '450px' }}
              />

              {/* Controls overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="flex gap-2">
                  {experimentState === 'setup' && (
                    <button
                      onClick={dropBall}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors shadow-lg"
                    >
                      <Target size={18} />
                      Thả vật
                    </button>
                  )}

                  {experimentState === 'landed' && (
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
                        Thử lại
                      </button>
                    </>
                  )}
                </div>

                {/* Timer display */}
                {experimentState !== 'setup' && (
                  <div className="bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2">
                    <div className="text-3xl font-mono text-green-400 font-bold">
                      {dropTime.toFixed(3)} s
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Parameters */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Thông số thí nghiệm</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Độ cao thả h (m)
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={dropHeight}
                    onChange={(e) => setDropHeight(parseFloat(e.target.value))}
                    disabled={experimentState !== 'setup'}
                    className="w-full accent-yellow-500"
                  />
                  <div className="text-center text-lg font-mono text-yellow-400">
                    {dropHeight.toFixed(1)} m
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Khối lượng m (kg)
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.5"
                    step="0.05"
                    value={ballMass}
                    onChange={(e) => setBallMass(parseFloat(e.target.value))}
                    disabled={experimentState !== 'setup'}
                    className="w-full accent-red-500"
                  />
                  <div className="text-center text-lg font-mono text-red-400">
                    {(ballMass * 1000).toFixed(0)} g
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3 italic">
                💡 Trong chân không, thời gian rơi không phụ thuộc vào khối lượng vật
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-4">
            <RealTimeChart
              data={chartData}
              xKey="time"
              yKey="height"
              xLabel="Thời gian"
              yLabel="Độ cao"
              xUnit="s"
              yUnit="m"
              title="Đồ thị h(t) - Chuyển động rơi tự do"
              lineColor="#ef4444"
              height={180}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:w-96 space-y-4">
          {/* Statistics */}
          {stats && (
            <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-xl p-4 border border-blue-700/50">
              <h3 className="text-lg font-bold text-white mb-3">📊 Kết quả phân tích</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">g trung bình:</span>
                  <span className="font-mono text-blue-400 font-bold">{stats.avgG} m/s²</span>
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
              </div>
            </div>
          )}

          {/* Data Table */}
          <DataTable
            columns={[
              { name: 'trial', label: 'Lần', type: 'number' },
              { name: 'height', label: 'h (m)', type: 'number', precision: 2 },
              { name: 'time', label: 't (s)', type: 'number', precision: 3 },
              { name: 'g', label: 'g (m/s²)', type: 'number', precision: 2 }
            ]}
            data={collectedData}
            onClearAll={clearData}
            onExport={exportData}
            onDeleteRecord={(id) => {
              setCollectedData(prev => prev.filter(d => d.trial !== id));
            }}
            maxHeight={250}
          />

          {/* Formula card */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">📐 Công thức</h3>
            <div className="bg-gray-900 rounded-lg p-3 text-center">
              <p className="text-xl font-mono text-green-400">g = 2h / t²</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              h: độ cao (m), t: thời gian rơi (s)
            </p>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-6 border border-gray-700">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🍎</div>
              <h2 className="text-xl font-bold">{guideSteps[guideStep].title}</h2>
            </div>

            <p className="text-gray-300 text-center mb-6">
              {guideSteps[guideStep].content}
            </p>

            <div className="flex justify-center gap-2 mb-6">
              {guideSteps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i === guideStep ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
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
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg"
                >
                  Bắt đầu
                </button>
              ) : (
                <button
                  onClick={() => setGuideStep(guideStep + 1)}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
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
              <h2 className="text-xl font-bold">📚 Lý thuyết rơi tự do</h2>
              <button onClick={() => setShowTheory(false)} className="p-2 hover:bg-gray-700 rounded-lg">✕</button>
            </div>

            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Định nghĩa</h3>
                <p>Rơi tự do là chuyển động rơi của vật chỉ chịu tác dụng của trọng lực, không có lực cản không khí.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Các công thức</h3>
                <div className="bg-gray-900 p-4 rounded-lg space-y-2">
                  <p className="font-mono text-blue-400">Thời gian: t = √(2h/g)</p>
                  <p className="font-mono text-green-400">Vận tốc: v = gt = √(2gh)</p>
                  <p className="font-mono text-yellow-400">Quãng đường: h = ½gt²</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Đặc điểm</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Chuyển động thẳng nhanh dần đều</li>
                  <li>Gia tốc g ≈ 9.8 m/s² (gần mặt đất)</li>
                  <li>Không phụ thuộc khối lượng vật</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeFallLabExperiment;

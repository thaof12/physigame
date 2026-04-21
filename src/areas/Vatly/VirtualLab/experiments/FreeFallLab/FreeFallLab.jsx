/**
 * FreeFallLab.jsx - Thí nghiệm Đo gia tốc rơi tự do (ENHANCED 3D)
 * 
 * Nâng cấp:
 * - Canvas 3D perspective rendering (bầu trời, tháp 3D, mặt đất 3D)
 * - Particle effects khi chạm đất
 * - Motion blur trail cho quả bóng
 * - Dynamic shadows & lighting
 * - Web Audio API sound effects
 * - Ambient atmosphere
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RotateCcw, 
  Save,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Target,
  Volume2,
  VolumeX
} from 'lucide-react';
import { FreeFall, PHYSICS_CONSTANTS, PhysicsUtils } from '../../core/PhysicsEngine';
import { ExperimentDataCollector } from '../../core/DataCollector';
import labSoundEngine from '../../core/LabSoundEngine';
import DataTable from '../../charts/DataTable';
import RealTimeChart from '../../charts/RealTimeChart';
import FreeFallPhaser from './FreeFallPhaser';
import './FreeFallLab.css';

const FreeFallLabExperiment = () => {
  const navigate = useNavigate();
  const phaserRef = useRef(null);
  const dataCollectorRef = useRef(null);
  const whooshRef = useRef(null);

  // Trạng thái thí nghiệm
  const [experimentState, setExperimentState] = useState('setup');
  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0);
  const [showTheory, setShowTheory] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Tham số thí nghiệm
  const [dropHeight, setDropHeight] = useState(1.5);
  const [ballMass, setBallMass] = useState(0.1);
  const [airResistance, setAirResistance] = useState(false);

  // Trạng thái mô phỏng
  const [ballY, setBallY] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [dropTime, setDropTime] = useState(0);
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
    return () => {
      labSoundEngine.stopAll();
    };
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

  // Callback from Phaser when updating
  const handlePhaserUpdate = (time, v, hFallen) => {
    setDropTime(time);
    setVelocity(v);
    setBallY(hFallen);
    setChartData(prev => [...prev, { time, height: Math.max(0, dropHeight - hFallen) }]);
    
    // Update whoosh
    if (whooshRef.current) {
      whooshRef.current.update(Math.min(1, v / 8));
    }
  };

  // Callback from Phaser when landing
  const handlePhaserLand = (finalTime) => {
    setExperimentState('landed');
    setHasLanded(true);
    // Impact sound
    labSoundEngine.playImpact(0.8 + ballMass * 2);
    // Stop whoosh
    if (whooshRef.current) {
      whooshRef.current.stop();
      whooshRef.current = null;
    }
  };

  // Thả vật
  const dropBall = () => {
    labSoundEngine.init();
    labSoundEngine.playDrop();
    
    setBallY(0);
    setVelocity(0);
    setDropTime(0);
    setChartData([]);
    setHasLanded(false);
    setExperimentState('dropping');
    
    if (phaserRef.current) {
      phaserRef.current.dropBall();
    }
    
    whooshRef.current = labSoundEngine.startWhoosh(0.1);
  };

  // Reset
  const resetExperiment = () => {
    if (whooshRef.current) {
      whooshRef.current.stop();
      whooshRef.current = null;
    }
    setBallY(0);
    setVelocity(0);
    setDropTime(0);
    setChartData([]);
    setHasLanded(false);
    setExperimentState('setup');
    
    if (phaserRef.current) {
      phaserRef.current.resetExperiment();
    }
  };

  // Ghi số liệu
  const recordData = () => {
    if (!hasLanded) {
      alert('Vật chưa chạm đất!');
      return;
    }

    labSoundEngine.playSuccess();

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

  // Toggle sound
  const toggleSound = () => {
    labSoundEngine.init();
    const enabled = labSoundEngine.toggle();
    setSoundEnabled(enabled);
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
      <header className="freefall-header">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/vatly/virtual-lab')}
              className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <span className="header-emoji">🍎</span>
                Thí nghiệm: Đo gia tốc rơi tự do
              </h1>
              <p className="text-gray-400 text-sm">Xác định gia tốc trọng trường g</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg transition-all duration-200 bg-gray-700/50 hover:bg-gray-600/50"
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              onClick={() => setShowTheory(!showTheory)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                showTheory ? 'bg-purple-600 shadow-lg shadow-purple-600/30' : 'bg-gray-700/50 hover:bg-gray-600/50'
              }`}
            >
              <BookOpen size={18} />
              <span className="hidden sm:inline">Lý thuyết</span>
            </button>
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all duration-200"
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto p-4 gap-4">
        {/* Main Canvas */}
        <div className="flex-1">
          <div className="canvas-container">
            <div className="relative" style={{ height: '450px' }}>
              <FreeFallPhaser 
                ref={phaserRef}
                dropHeight={dropHeight}
                ballMass={ballMass}
                airResistance={airResistance}
                experimentState={experimentState}
                onUpdate={handlePhaserUpdate}
                onLand={handlePhaserLand}
              />

              {/* Controls overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="flex gap-2">
                  {experimentState === 'setup' && (
                    <button
                      onClick={dropBall}
                      className="drop-button"
                    >
                      <Target size={18} />
                      Thả vật
                    </button>
                  )}

                  {experimentState === 'landed' && (
                    <>
                      <button
                        onClick={recordData}
                        className="record-button"
                      >
                        <Save size={18} />
                        Ghi số liệu
                      </button>
                      <button
                        onClick={resetExperiment}
                        className="reset-button"
                      >
                        <RotateCcw size={18} />
                        Thử lại
                      </button>
                    </>
                  )}
                </div>

                {/* Timer display */}
                {experimentState !== 'setup' && (
                  <div className="timer-display">
                    <div className={`timer-value ${experimentState === 'dropping' ? 'timer-active' : ''}`}>
                      {dropTime.toFixed(3)} s
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Parameters */}
            <div className="p-4 border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
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
                  <div className="text-center text-lg font-mono text-yellow-400 param-value">
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
                  <div className="text-center text-lg font-mono text-red-400 param-value">
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
            <div className="stats-card">
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
          <div className="formula-card">
            <h3 className="text-sm font-medium text-gray-400 mb-2">📐 Công thức</h3>
            <div className="formula-display">
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
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3 modal-emoji">🍎</div>
              <h2 className="text-xl font-bold">{guideSteps[guideStep].title}</h2>
            </div>

            <p className="text-gray-300 text-center mb-6">
              {guideSteps[guideStep].content}
            </p>

            <div className="flex justify-center gap-2 mb-6">
              {guideSteps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === guideStep ? 'bg-blue-500 scale-125' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setGuideStep(Math.max(0, guideStep - 1))}
                disabled={guideStep === 0}
                className="flex items-center gap-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-all"
              >
                <ChevronLeft size={18} /> Trước
              </button>

              {guideStep === guideSteps.length - 1 ? (
                <button
                  onClick={() => setShowGuide(false)}
                  className="px-5 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-all shadow-lg shadow-green-600/30"
                >
                  Bắt đầu
                </button>
              ) : (
                <button
                  onClick={() => setGuideStep(guideStep + 1)}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all"
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
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">📚 Lý thuyết rơi tự do</h2>
              <button onClick={() => setShowTheory(false)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">✕</button>
            </div>

            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Định nghĩa</h3>
                <p>Rơi tự do là chuyển động rơi của vật chỉ chịu tác dụng của trọng lực, không có lực cản không khí.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Các công thức</h3>
                <div className="bg-gray-900/80 p-4 rounded-lg space-y-2 border border-gray-700/50">
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

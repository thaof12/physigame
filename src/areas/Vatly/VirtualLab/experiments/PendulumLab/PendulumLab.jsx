/**
 * PendulumLab.jsx - Thí nghiệm Dao động con lắc đơn (ENHANCED 3D)
 * 
 * Nâng cấp:
 * - 3D lab room perspective (sàn nhà, tường, trần)
 * - Giá đỡ 3D với chiều sâu
 * - Metallic sphere với specular highlights
 * - Afterimage trail
 * - Sound effects (tick-tock)
 * - Dynamic rope lighting
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Save,
  HelpCircle,
  Settings,
  BookOpen,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { SimplePendulum, PHYSICS_CONSTANTS, PhysicsUtils } from '../../core/PhysicsEngine';
import { ExperimentDataCollector } from '../../core/DataCollector';
import labSoundEngine from '../../core/LabSoundEngine';
import Stopwatch from '../../instruments/Stopwatch';
import DataTable from '../../charts/DataTable';
import RealTimeChart from '../../charts/RealTimeChart';
import PendulumPhaser from './PendulumPhaser';
import './PendulumLab.css';

const PendulumLab = () => {
  const navigate = useNavigate();
  const phaserRef = useRef(null);
  const dataCollectorRef = useRef(null);

  // Trạng thái thí nghiệm
  const [experimentState, setExperimentState] = useState('setup');
  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0);
  const [showTheory, setShowTheory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Tham số con lắc
  const [length, setLength] = useState(1.0);
  const [amplitude, setAmplitude] = useState(10);
  const [mass, setMass] = useState(0.5);

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
  const [damping, setDamping] = useState(0);

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
    return () => {
      labSoundEngine.stopAll();
    };
  }, []);

  // Hướng dẫn thí nghiệm
  const guideSteps = [
    {
      title: 'Chào mừng đến với Thí nghiệm Con lắc đơn!',
      content: 'Trong thí nghiệm này, bạn sẽ khảo sát dao động của con lắc đơn và xác định gia tốc trọng trường g.',
    },
    {
      title: 'Bước 1: Thiết lập thông số',
      content: 'Điều chỉnh chiều dài dây L và biên độ góc ban đầu. Lưu ý: chu kỳ T chỉ phụ thuộc vào L, không phụ thuộc khối lượng.',
    },
    {
      title: 'Bước 2: Bắt đầu dao động',
      content: 'Nhấn nút "Thả" để bắt đầu. Con lắc sẽ dao động và hệ thống sẽ tự động đếm số dao động.',
    },
    {
      title: 'Bước 3: Thu thập số liệu',
      content: 'Sử dụng đồng hồ để đo thời gian cho nhiều dao động. Nhấn "Ghi số liệu" để lưu kết quả.',
    },
    {
      title: 'Bước 4: Phân tích kết quả',
      content: 'Xem bảng số liệu và biểu đồ. So sánh giá trị g tính được với giá trị chuẩn (9.8 m/s²).',
    }
  ];

  // Tính toán vật lý
  const theoreticalPeriod = SimplePendulum.calculatePeriod(length);
  const theoreticalG = PHYSICS_CONSTANTS.g;

  // Callbacks từ Phaser
  const handlePhaserUpdate = (newTime, newAngle) => {
    setTime(newTime);
    setAngle(newAngle);
    setChartData(prev => {
      const newPoint = { time: newTime, angle: newAngle };
      const updated = [...prev, newPoint];
      if (updated.length > 500) {
        return updated.slice(-500);
      }
      return updated;
    });
  };

  const handlePhaserTick = (newTime, tickType) => {
    if (tickType === 1) { // Phải qua trái
      labSoundEngine.playTick(1.0);
      setOscillationCount(prev => {
        const newCount = prev + 0.5;
        if (Number.isInteger(newCount)) {
          setMeasuredPeriods(periods => {
            if (periods.length > 0) {
              const lastTime = periods[periods.length - 1].time;
              const period = newTime - lastTime;
              return [...periods, { time: newTime, period }];
            }
            return [...periods, { time: newTime, period: 0 }];
          });
        }
        return newCount;
      });
    } else if (tickType === 2) { // Trái qua phải
      labSoundEngine.playTick(0.8);
      setOscillationCount(prev => prev + 0.5);
    }
  };

  // Bắt đầu thí nghiệm
  const startExperiment = () => {
    labSoundEngine.init();
    labSoundEngine.playDrop();
    setAngle(amplitude);
    setAngularVelocity(0);
    setTime(0);
    setOscillationCount(0);
    setMeasuredPeriods([]);
    setChartData([]);
    setExperimentState('running');
    if (phaserRef.current) phaserRef.current.startExperiment();
  };

  // Tạm dừng
  const pauseExperiment = () => {
    setExperimentState('paused');
    if (phaserRef.current) phaserRef.current.pauseExperiment();
  };

  // Tiếp tục
  const resumeExperiment = () => {
    setExperimentState('running');
    if (phaserRef.current) phaserRef.current.resumeExperiment();
  };

  // Reset
  const resetExperiment = () => {
    setAngle(0);
    setAngularVelocity(0);
    setTime(0);
    setOscillationCount(0);
    setMeasuredPeriods([]);
    setChartData([]);
    setExperimentState('setup');
    if (phaserRef.current) phaserRef.current.resetExperiment();
  };

  // Ghi số liệu
  const recordData = () => {
    if (oscillationCount < 1) {
      alert('Cần ít nhất 1 dao động để ghi số liệu!');
      return;
    }

    labSoundEngine.playSuccess();

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

  // Toggle sound
  const toggleSound = () => {
    labSoundEngine.init();
    const enabled = labSoundEngine.toggle();
    setSoundEnabled(enabled);
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
      <header className="pendulum-header">
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
                <span className="header-emoji">🔬</span>
                Thí nghiệm: Dao động điều hòa của Con lắc đơn
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
              <span className="hidden sm:inline">Hướng dẫn</span>
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                showSettings ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-gray-700/50 hover:bg-gray-600/50'
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
          <div className="canvas-container-pendulum">
            {/* Canvas */}
            <div className="relative" style={{ height: '450px' }}>
              <PendulumPhaser 
                ref={phaserRef}
                length={length}
                amplitude={amplitude}
                mass={mass}
                damping={damping}
                simulationSpeed={simulationSpeed}
                experimentState={experimentState}
                showTrail={showTrail}
                onUpdate={handlePhaserUpdate}
                onTick={handlePhaserTick}
              />

              {/* Overlay controls */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                {/* Control buttons */}
                <div className="flex gap-2">
                  {experimentState === 'setup' && (
                    <button
                      onClick={startExperiment}
                      className="pendulum-start-btn"
                    >
                      <Play size={18} />
                      Thả con lắc
                    </button>
                  )}
                  
                  {experimentState === 'running' && (
                    <button
                      onClick={pauseExperiment}
                      className="pendulum-pause-btn"
                    >
                      <Pause size={18} />
                      Tạm dừng
                    </button>
                  )}
                  
                  {experimentState === 'paused' && (
                    <button
                      onClick={resumeExperiment}
                      className="pendulum-start-btn"
                    >
                      <Play size={18} />
                      Tiếp tục
                    </button>
                  )}

                  {experimentState !== 'setup' && (
                    <>
                      <button
                        onClick={recordData}
                        className="pendulum-record-btn"
                      >
                        <Save size={18} />
                        Ghi số liệu
                      </button>
                      <button
                        onClick={resetExperiment}
                        className="pendulum-reset-btn"
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
            <div className="p-4 border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Thông số thí nghiệm</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Chiều dài */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Chiều dài dây L (m)</label>
                  <input
                    type="range" min="0.2" max="2" step="0.05"
                    value={length}
                    onChange={(e) => setLength(parseFloat(e.target.value))}
                    disabled={experimentState !== 'setup'}
                    className="w-full accent-blue-500"
                  />
                  <div className="text-center text-lg font-mono text-blue-400 param-value">
                    {length.toFixed(2)} m
                  </div>
                </div>

                {/* Biên độ */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Biên độ góc θ₀ (°)</label>
                  <input
                    type="range" min="5" max="30" step="1"
                    value={amplitude}
                    onChange={(e) => setAmplitude(parseInt(e.target.value))}
                    disabled={experimentState !== 'setup'}
                    className="w-full accent-green-500"
                  />
                  <div className="text-center text-lg font-mono text-green-400 param-value">
                    {amplitude}°
                  </div>
                </div>

                {/* Khối lượng */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Khối lượng m (kg)</label>
                  <input
                    type="range" min="0.1" max="1" step="0.1"
                    value={mass}
                    onChange={(e) => setMass(parseFloat(e.target.value))}
                    disabled={experimentState !== 'setup'}
                    className="w-full accent-blue-500"
                  />
                  <div className="text-center text-lg font-mono text-yellow-400 param-value">
                    {mass.toFixed(1)} kg
                  </div>
                </div>
              </div>

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
            <div className="stats-card-pendulum">
              <h3 className="text-lg font-bold text-white mb-3">📊 Kết quả phân tích</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">g trung bình:</span>
                  <span className="font-mono text-emerald-400 font-bold">{stats.avgG} m/s²</span>
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
          <div className="formula-card-pendulum">
            <h3 className="text-sm font-medium text-gray-400 mb-2">📐 Công thức</h3>
            <div className="formula-display-pendulum">
              <p className="text-xl font-mono text-blue-400">T = 2π√(L/g)</p>
              <p className="text-sm font-mono text-green-400 mt-1">g = 4π²L/T²</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              T: chu kỳ (s), L: chiều dài (m), g: gia tốc (m/s²)
            </p>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3 modal-emoji">🔬</div>
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
                className="flex items-center gap-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
              >
                <ChevronLeft size={18} /> Trước
              </button>

              {guideStep === guideSteps.length - 1 ? (
                <button
                  onClick={() => setShowGuide(false)}
                  className="px-5 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-all shadow-lg shadow-green-600/30"
                >
                  Bắt đầu thí nghiệm
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

      {/* Theory Panel */}
      {showTheory && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">📚 Lý thuyết con lắc đơn</h2>
              <button
                onClick={() => setShowTheory(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >✕</button>
            </div>

            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Định nghĩa</h3>
                <p>Con lắc đơn gồm một vật nhỏ khối lượng m treo ở đầu sợi dây không giãn, khối lượng không đáng kể, chiều dài l.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Chu kỳ dao động</h3>
                <div className="bg-gray-900/80 p-4 rounded-lg text-center border border-gray-700/50">
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
                <div className="bg-gray-900/80 p-4 rounded-lg text-center border border-gray-700/50">
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
        <div className="settings-panel">
          <h3 className="text-lg font-bold mb-4">⚙️ Cài đặt</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Tốc độ mô phỏng</label>
              <input
                type="range" min="0.5" max="3" step="0.5"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-400">x{simulationSpeed}</div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Hệ số tắt dần</label>
              <input
                type="range" min="0" max="0.1" step="0.01"
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


/**
 * InclinedPlaneLab.jsx - Thí nghiệm Mặt phẳng nghiêng (ENHANCED 3D)
 * 
 * Nâng cấp:
 * - 3D slab inclined plane with thickness and texture
 * - 3D box object with 3 visible faces
 * - Spark particles on impact
 * - Force vectors with glowing 3D arrows
 * - Dynamic shadows
 * - Friction sound + impact sound
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play,
  RotateCcw, 
  Save,
  HelpCircle,
  BookOpen,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PhysicsUtils, PHYSICS_CONSTANTS } from '../../core/PhysicsEngine';
import { ExperimentDataCollector } from '../../core/DataCollector';
import labSoundEngine from '../../core/LabSoundEngine';
import Stopwatch from '../../instruments/Stopwatch';
import DataTable from '../../charts/DataTable';
import RealTimeChart from '../../charts/RealTimeChart';
import InclinedPlanePhaser from './InclinedPlanePhaser';
import './InclinedPlaneLab.css';

const InclinedPlaneLab = () => {
  const navigate = useNavigate();
  const phaserRef = useRef(null);
  const dataCollectorRef = useRef(null);
  const frictionSoundRef = useRef(null);
  const screenShakeRef = useRef(0);

  // Trạng thái thí nghiệm
  const [experimentState, setExperimentState] = useState('setup');
  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0);
  const [showTheory, setShowTheory] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Tham số thí nghiệm
  const [angle, setAngle] = useState(30);
  const [planeLength, setPlaneLength] = useState(1.0);
  const [mass, setMass] = useState(0.5);
  const [frictionCoeff, setFrictionCoeff] = useState(0.1);

  // Trạng thái chuyển động
  const [position, setPosition] = useState(0);
  const [velocity, setVelocity] = useState(0);
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
    return () => {
      labSoundEngine.stopAll();
    };
  }, []);

  // Tính gia tốc lý thuyết
  useEffect(() => {
    const g = PHYSICS_CONSTANTS.g;
    const angleRad = (angle * Math.PI) / 180;
    const a = g * (Math.sin(angleRad) - frictionCoeff * Math.cos(angleRad));
    setTheoreticalAccel(Math.max(0, a));
  }, [angle, frictionCoeff]);

  // Hướng dẫn
  const guideSteps = [
    { title: 'Thí nghiệm Mặt phẳng nghiêng', content: 'Trong thí nghiệm này, bạn sẽ khảo sát chuyển động của vật trượt trên mặt phẳng nghiêng.' },
    { title: 'Bước 1: Thiết lập', content: 'Điều chỉnh góc nghiêng α, chiều dài mặt phẳng L, và hệ số ma sát μ.' },
    { title: 'Bước 2: Thả vật', content: 'Nhấn "Thả vật" để bắt đầu. Vật sẽ trượt xuống với gia tốc a = g(sinα - μcosα).' },
    { title: 'Bước 3: Đo đạc', content: 'Quan sát thời gian và vận tốc. Sử dụng đồng hồ bấm giờ để đo chính xác.' },
    { title: 'Bước 4: Tính toán', content: 'So sánh gia tốc thực nghiệm với gia tốc lý thuyết. Xác định hệ số ma sát.' }
  ];

  // Callbacks từ Phaser
  const handlePhaserUpdate = (t, p, v) => {
    setTime(t);
    setPosition(p);
    setVelocity(v);
    
    // Update friction sound
    if (frictionSoundRef.current) {
      frictionSoundRef.current.update(Math.min(1, v / 5));
    }

    setMotionData(prev => {
      const lastT = prev.length > 0 ? prev[prev.length - 1].time : -1;
      if (t - lastT > 0.05) {
        return [...prev, {
          time: PhysicsUtils.round(t, 2),
          position: PhysicsUtils.round(p, 3),
          velocity: PhysicsUtils.round(v, 3)
        }];
      }
      return prev;
    });
  };

  const handlePhaserFinish = (t, p, v) => {
    setTime(t);
    setPosition(p);
    setVelocity(v);
    setFinalVelocity(v);
    
    const g = PHYSICS_CONSTANTS.g;
    const angleRad = (angle * Math.PI) / 180;
    const a = g * (Math.sin(angleRad) - frictionCoeff * Math.cos(angleRad));
    setAcceleration(a);
    
    setIsRunning(false);
    setExperimentState('finished');
    screenShakeRef.current = 0.7;
    labSoundEngine.playImpact(0.6 + mass);

    if (frictionSoundRef.current) {
        frictionSoundRef.current.stop();
        frictionSoundRef.current = null;
    }

    setMotionData(prev => [...prev, {
        time: t,
        position: p,
        velocity: v
    }]);
  };

  // Bắt đầu thí nghiệm
  const startExperiment = () => {
    labSoundEngine.init();
    labSoundEngine.playDrop();
    setPosition(0);
    setVelocity(0);
    setTime(0);
    setMotionData([]);
    setIsRunning(true);
    setExperimentState('running');
    if (phaserRef.current) phaserRef.current.startExperiment();

    // Start friction sound
    if (frictionCoeff > 0) {
      frictionSoundRef.current = labSoundEngine.startFriction(frictionCoeff);
    }
  };

  // Reset
  const resetExperiment = () => {
    if (frictionSoundRef.current) {
      frictionSoundRef.current.stop();
      frictionSoundRef.current = null;
    }
    setPosition(0);
    setVelocity(0);
    setTime(0);
    setAcceleration(0);
    setFinalVelocity(0);
    setMotionData([]);
    setIsRunning(false);
    setExperimentState('setup');
    if (phaserRef.current) phaserRef.current.resetExperiment();
  };

  // Ghi số liệu
  const recordData = () => {
    if (experimentState !== 'finished') {
      alert('Hãy chờ vật trượt hết mặt phẳng!');
      return;
    }
    labSoundEngine.playSuccess();
    const record = {
      trial: collectedData.length + 1,
      angle, length: planeLength,
      time: PhysicsUtils.round(time, 3),
      vFinal: PhysicsUtils.round(finalVelocity, 3),
      accel: PhysicsUtils.round(acceleration, 3),
      friction: frictionCoeff
    };
    if (dataCollectorRef.current) dataCollectorRef.current.addRecord(record);
    setCollectedData(prev => [...prev, record]);
  };

  // Xóa dữ liệu
  const clearData = () => {
    setCollectedData([]);
    if (dataCollectorRef.current) dataCollectorRef.current.clearData();
  };

  // Toggle sound
  const toggleSound = () => {
    labSoundEngine.init();
    const enabled = labSoundEngine.toggle();
    setSoundEnabled(enabled);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="inclined-header">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/vatly/virtual-lab')}
              className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <span className="header-emoji">📐</span>
                Thí nghiệm: Mặt phẳng nghiêng
              </h1>
              <p className="text-gray-400 text-sm">Chuyển động có gia tốc</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleSound}
              className="p-2 rounded-lg transition-all bg-gray-700/50 hover:bg-gray-600/50"
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}>
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button onClick={() => setShowTheory(!showTheory)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                showTheory ? 'bg-purple-600 shadow-lg shadow-purple-600/30' : 'bg-gray-700/50 hover:bg-gray-600/50'
              }`}>
              <BookOpen size={18} />
              <span className="hidden sm:inline">Lý thuyết</span>
            </button>
            <button onClick={() => setShowGuide(true)}
              className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all">
              <HelpCircle size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto p-4 gap-4">
        {/* Main Canvas */}
        <div className="flex-1">
          <div className="canvas-container-inclined">
            <div className="relative" style={{ height: '450px' }}>
              <InclinedPlanePhaser 
                ref={phaserRef}
                angle={angle}
                planeLength={planeLength}
                mass={mass}
                frictionCoeff={frictionCoeff}
                isRunning={isRunning}
                experimentState={experimentState}
                onUpdate={handlePhaserUpdate}
                onFinish={handlePhaserFinish}
              />

              {/* Controls overlay */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                {experimentState === 'setup' && (
                  <button onClick={startExperiment}
                    disabled={theoreticalAccel <= 0}
                    className="inclined-start-btn">
                    <Play size={18} /> Thả vật
                  </button>
                )}
                {experimentState === 'finished' && (
                  <button onClick={recordData}
                    className="inclined-record-btn">
                    <Save size={18} /> Ghi số liệu
                  </button>
                )}
                <button onClick={resetExperiment}
                  className="inclined-reset-btn">
                  <RotateCcw size={18} /> Reset
                </button>
              </div>

              {/* Warning */}
              {theoreticalAccel <= 0 && (
                <div className="absolute top-4 right-4 warning-badge">
                  ⚠️ Ma sát quá lớn, vật không trượt được!
                </div>
              )}
            </div>

            {/* Parameters */}
            <div className="p-4 border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Điều chỉnh thông số</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Góc nghiêng α (°)</label>
                  <input type="range" min="5" max="60" step="5"
                    value={angle} onChange={(e) => setAngle(parseInt(e.target.value))}
                    disabled={isRunning} className="w-full accent-yellow-500" />
                  <div className="text-center text-lg font-mono text-yellow-400 param-value">{angle}°</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Chiều dài L (m)</label>
                  <input type="range" min="0.5" max="2.0" step="0.1"
                    value={planeLength} onChange={(e) => setPlaneLength(parseFloat(e.target.value))}
                    disabled={isRunning} className="w-full accent-green-500" />
                  <div className="text-center text-lg font-mono text-green-400 param-value">{planeLength.toFixed(1)} m</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Khối lượng m (kg)</label>
                  <input type="range" min="0.1" max="2.0" step="0.1"
                    value={mass} onChange={(e) => setMass(parseFloat(e.target.value))}
                    disabled={isRunning} className="w-full accent-blue-500" />
                  <div className="text-center text-lg font-mono text-blue-400 param-value">{mass.toFixed(1)} kg</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Hệ số ma sát μ</label>
                  <input type="range" min="0" max="0.5" step="0.05"
                    value={frictionCoeff} onChange={(e) => setFrictionCoeff(parseFloat(e.target.value))}
                    disabled={isRunning} className="w-full accent-purple-500" />
                  <div className="text-center text-lg font-mono text-purple-400 param-value">{frictionCoeff.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Motion Chart */}
          {motionData.length > 1 && (
            <div className="mt-4">
              <RealTimeChart data={motionData}
                xKey="time" yKey="velocity"
                xLabel="Thời gian" yLabel="Vận tốc"
                xUnit="s" yUnit="m/s"
                title="Đồ thị v-t" lineColor="#3b82f6" pointColor="#22c55e" height={180} />
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="lg:w-96 space-y-4">
          {/* Stopwatch */}
          <Stopwatch time={time} isRunning={isRunning}
            onStart={startExperiment}
            onStop={() => setIsRunning(false)}
            onReset={resetExperiment} />

          {/* Results */}
          <div className={`results-card ${experimentState === 'finished' ? 'results-finished' : 'results-active'}`}>
            <h3 className="text-lg font-bold text-white mb-3">📊 Kết quả</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="result-value-box">
                <div className="text-2xl font-mono text-blue-400">{PhysicsUtils.round(time, 2)}</div>
                <div className="text-xs text-gray-400">Thời gian (s)</div>
              </div>
              <div className="result-value-box">
                <div className="text-2xl font-mono text-green-400">{PhysicsUtils.round(velocity, 2)}</div>
                <div className="text-xs text-gray-400">Vận tốc (m/s)</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="result-value-box">
                <div className="text-xl font-mono text-yellow-400">{PhysicsUtils.round(theoreticalAccel, 2)}</div>
                <div className="text-xs text-gray-400">a lý thuyết (m/s²)</div>
              </div>
              <div className="result-value-box">
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
            onDeleteRecord={(id) => setCollectedData(prev => prev.filter(d => d.trial !== id))}
            maxHeight={150} />

          {/* Formula */}
          <div className="formula-card-inclined">
            <h3 className="text-sm font-medium text-gray-400 mb-2">📐 Công thức</h3>
            <div className="formula-display-inclined">
              <p className="text-lg font-mono text-yellow-400">a = g(sinα - μcosα)</p>
              <p className="text-sm font-mono text-gray-400 mt-1">v = at | s = ½at²</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3 modal-emoji">📐</div>
              <h2 className="text-xl font-bold">{guideSteps[guideStep].title}</h2>
            </div>
            <p className="text-gray-300 text-center mb-6">{guideSteps[guideStep].content}</p>
            <div className="flex justify-center gap-2 mb-6">
              {guideSteps.map((_, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === guideStep ? 'bg-yellow-500 scale-125' : 'bg-gray-600'
                }`} />
              ))}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setGuideStep(Math.max(0, guideStep - 1))}
                disabled={guideStep === 0}
                className="flex items-center gap-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-all">
                <ChevronLeft size={18} /> Trước
              </button>
              {guideStep === guideSteps.length - 1 ? (
                <button onClick={() => setShowGuide(false)}
                  className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-all shadow-lg shadow-yellow-600/30">
                  Bắt đầu
                </button>
              ) : (
                <button onClick={() => setGuideStep(guideStep + 1)}
                  className="flex items-center gap-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-all">
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
              <h2 className="text-xl font-bold">📚 Chuyển động trên mặt phẳng nghiêng</h2>
              <button onClick={() => setShowTheory(false)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">✕</button>
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
                <div className="bg-gray-900/80 p-4 rounded-lg text-center border border-gray-700/50">
                  <p className="text-xl font-mono text-yellow-400">a = g(sinα - μcosα)</p>
                </div>
                <p className="text-sm mt-2">Vật trượt được khi: sinα &gt; μcosα (tức tanα &gt; μ)</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Công thức động học</h3>
                <div className="bg-gray-900/80 p-4 rounded-lg space-y-2 text-center border border-gray-700/50">
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

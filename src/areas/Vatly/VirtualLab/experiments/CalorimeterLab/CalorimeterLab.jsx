/**
 * CalorimeterLab.jsx - Thí nghiệm Nhiệt lượng kế
 * 
 * Mục tiêu:
 * - Xác định nhiệt dung riêng của chất rắn
 * - Xác minh phương trình cân bằng nhiệt: Q_thu = Q_tỏa
 * - Đo nhiệt lượng trao đổi trong quá trình truyền nhiệt
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
  BookOpen,
  Thermometer,
  Droplets,
  Plus,
  Minus
} from 'lucide-react';
import { Thermodynamics, PhysicsUtils } from '../../core/PhysicsEngine';
import { ExperimentDataCollector } from '../../core/DataCollector';
import DataTable from '../../charts/DataTable';
import RealTimeChart from '../../charts/RealTimeChart';
import './CalorimeterLab.css';

// Nhiệt dung riêng của các chất (J/kg.K)
const MATERIALS = {
  aluminum: { name: 'Nhôm', c: 880, color: '#9ca3af' },
  copper: { name: 'Đồng', c: 380, color: '#f59e0b' },
  iron: { name: 'Sắt', c: 460, color: '#6b7280' },
  lead: { name: 'Chì', c: 130, color: '#374151' },
  unknown: { name: 'Chất X', c: 500, color: '#8b5cf6' }
};

const CalorimeterLab = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const dataCollectorRef = useRef(null);
  const animationRef = useRef(null);

  // Trạng thái thí nghiệm
  const [experimentState, setExperimentState] = useState('setup'); // setup | heating | mixing | equilibrium
  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0);
  const [showTheory, setShowTheory] = useState(false);
  const [time, setTime] = useState(0);

  // Tham số thí nghiệm
  const [waterMass, setWaterMass] = useState(200); // Khối lượng nước (g)
  const [waterTemp, setWaterTemp] = useState(25); // Nhiệt độ nước ban đầu (°C)
  const [sampleMaterial, setSampleMaterial] = useState('copper');
  const [sampleMass, setSampleMass] = useState(100); // Khối lượng mẫu (g)
  const [sampleTemp, setSampleTemp] = useState(100); // Nhiệt độ mẫu ban đầu (°C)

  // Trạng thái nhiệt độ hiện tại
  const [currentWaterTemp, setCurrentWaterTemp] = useState(25);
  const [currentSampleTemp, setCurrentSampleTemp] = useState(100);
  const [equilibriumTemp, setEquilibriumTemp] = useState(0);
  const [calculatedC, setCalculatedC] = useState(0);

  // Dữ liệu biểu đồ
  const [tempHistory, setTempHistory] = useState([]);
  const [collectedData, setCollectedData] = useState([]);

  // Khởi tạo DataCollector
  useEffect(() => {
    dataCollectorRef.current = new ExperimentDataCollector('Nhiệt lượng kế', [
      { name: 'trial', label: 'Lần đo', type: 'number' },
      { name: 'material', label: 'Chất', type: 'string' },
      { name: 'm1', label: 'm_nước (g)', type: 'number', unit: 'g' },
      { name: 't1', label: 't_nước (°C)', type: 'number', unit: '°C' },
      { name: 'm2', label: 'm_mẫu (g)', type: 'number', unit: 'g' },
      { name: 't2', label: 't_mẫu (°C)', type: 'number', unit: '°C' },
      { name: 'tCB', label: 't_CB (°C)', type: 'number', unit: '°C' },
      { name: 'c', label: 'c (J/kg.K)', type: 'number', unit: 'J/kg.K' }
    ]);
  }, []);

  // Hướng dẫn
  const guideSteps = [
    {
      title: 'Thí nghiệm Nhiệt lượng kế',
      content: 'Trong thí nghiệm này, bạn sẽ xác định nhiệt dung riêng của chất rắn bằng phương pháp cân bằng nhiệt.'
    },
    {
      title: 'Bước 1: Chuẩn bị',
      content: 'Đổ nước vào nhiệt lượng kế. Chọn chất mẫu và nung nóng đến nhiệt độ cao.'
    },
    {
      title: 'Bước 2: Tiến hành',
      content: 'Nhấn "Thả mẫu" để thả vật nóng vào nước. Quan sát sự thay đổi nhiệt độ.'
    },
    {
      title: 'Bước 3: Cân bằng',
      content: 'Chờ hệ đạt cân bằng nhiệt. Ghi nhận nhiệt độ cân bằng t_CB.'
    },
    {
      title: 'Bước 4: Tính toán',
      content: 'Áp dụng phương trình cân bằng nhiệt để tính nhiệt dung riêng c của mẫu.'
    }
  ];

  // Tính nhiệt độ cân bằng
  useEffect(() => {
    const material = MATERIALS[sampleMaterial];
    const c1 = 4186; // Nhiệt dung riêng của nước (J/kg.K)
    const c2 = material.c;
    const m1 = waterMass / 1000; // kg
    const m2 = sampleMass / 1000; // kg

    // Q_thu = Q_tỏa
    // m1 * c1 * (t_CB - t1) = m2 * c2 * (t2 - t_CB)
    // t_CB = (m1*c1*t1 + m2*c2*t2) / (m1*c1 + m2*c2)
    const tCB = (m1 * c1 * waterTemp + m2 * c2 * sampleTemp) / (m1 * c1 + m2 * c2);
    setEquilibriumTemp(tCB);
  }, [waterMass, waterTemp, sampleMass, sampleTemp, sampleMaterial]);

  // Animation - quá trình cân bằng nhiệt
  useEffect(() => {
    if (experimentState === 'mixing') {
      const material = MATERIALS[sampleMaterial];
      const targetTemp = equilibriumTemp;
      const duration = 5000; // 5 giây
      const startTime = Date.now();
      const initialWaterTemp = currentWaterTemp;
      const initialSampleTemp = currentSampleTemp;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const newWaterTemp = initialWaterTemp + (targetTemp - initialWaterTemp) * easeOut;
        const newSampleTemp = initialSampleTemp + (targetTemp - initialSampleTemp) * easeOut;
        
        setCurrentWaterTemp(newWaterTemp);
        setCurrentSampleTemp(newSampleTemp);
        setTime(elapsed / 1000);
        
        setTempHistory(prev => [...prev, {
          time: elapsed / 1000,
          water: newWaterTemp,
          sample: newSampleTemp
        }]);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setExperimentState('equilibrium');
          
          // Tính nhiệt dung riêng từ thí nghiệm
          const c1 = 4186;
          const m1 = waterMass / 1000;
          const m2 = sampleMass / 1000;
          const deltaT1 = targetTemp - waterTemp;
          const deltaT2 = sampleTemp - targetTemp;
          
          if (deltaT2 > 0) {
            const c2 = (m1 * c1 * deltaT1) / (m2 * deltaT2);
            setCalculatedC(c2);
          }
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [experimentState]);

  // Vẽ nhiệt lượng kế
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

    const centerX = width / 2;
    const baseY = height - 60;

    // Vẽ nhiệt lượng kế (bình cách nhiệt)
    const calorimeterWidth = 200;
    const calorimeterHeight = 180;
    const calorimeterX = centerX - calorimeterWidth / 2;
    const calorimeterY = baseY - calorimeterHeight;

    // Vỏ ngoài
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(calorimeterX - 20, calorimeterY - 20, calorimeterWidth + 40, calorimeterHeight + 30, 10);
    ctx.fill();
    ctx.stroke();

    // Lớp cách nhiệt
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(calorimeterX - 10, calorimeterY - 10, calorimeterWidth + 20, calorimeterHeight + 15, 8);
    ctx.fill();

    // Bình chứa trong
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(calorimeterX, calorimeterY, calorimeterWidth, calorimeterHeight, 5);
    ctx.fill();
    ctx.stroke();

    // Nước trong bình
    const waterLevel = calorimeterHeight * 0.7;
    const waterColor = `hsl(${200 - (currentWaterTemp - 20) * 2}, 70%, 50%)`;
    
    ctx.fillStyle = waterColor + '80';
    ctx.beginPath();
    ctx.roundRect(calorimeterX + 5, calorimeterY + calorimeterHeight - waterLevel - 5, 
                  calorimeterWidth - 10, waterLevel, [0, 0, 3, 3]);
    ctx.fill();

    // Hiệu ứng bong bóng nếu đang mixing
    if (experimentState === 'mixing') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      for (let i = 0; i < 8; i++) {
        const bubbleX = calorimeterX + 20 + Math.random() * (calorimeterWidth - 40);
        const bubbleY = calorimeterY + calorimeterHeight - 20 - Math.random() * (waterLevel - 20);
        const bubbleR = 2 + Math.random() * 4;
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, bubbleR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Vật mẫu trong nước (nếu đã thả)
    if (experimentState === 'mixing' || experimentState === 'equilibrium') {
      const material = MATERIALS[sampleMaterial];
      ctx.fillStyle = material.color;
      ctx.beginPath();
      ctx.roundRect(centerX - 25, calorimeterY + calorimeterHeight - 50, 50, 35, 5);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Nhiệt kế
    const thermometerX = calorimeterX + calorimeterWidth + 40;
    const thermometerY = calorimeterY - 20;
    const thermometerHeight = calorimeterHeight + 20;
    
    // Thân nhiệt kế
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(thermometerX, thermometerY, 25, thermometerHeight, 12);
    ctx.fill();
    ctx.stroke();

    // Bầu thủy ngân
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(thermometerX + 12.5, thermometerY + thermometerHeight - 15, 10, 0, Math.PI * 2);
    ctx.fill();

    // Cột thủy ngân
    const tempRange = 100; // 0-100°C
    const mercuryHeight = ((currentWaterTemp / tempRange) * (thermometerHeight - 50));
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(thermometerX + 8, thermometerY + thermometerHeight - 25 - mercuryHeight, 
                  9, mercuryHeight, 4);
    ctx.fill();

    // Vạch chia nhiệt kế
    ctx.fillStyle = '#475569';
    ctx.font = '10px sans-serif';
    for (let t = 0; t <= 100; t += 20) {
      const y = thermometerY + thermometerHeight - 25 - (t / tempRange) * (thermometerHeight - 50);
      ctx.fillRect(thermometerX + 25, y, 10, 1);
      ctx.textAlign = 'left';
      ctx.fillText(`${t}°`, thermometerX + 38, y + 4);
    }

    // Hiển thị nhiệt độ hiện tại
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${currentWaterTemp.toFixed(1)}°C`, thermometerX + 60, thermometerY + thermometerHeight + 30);

    // Vật mẫu chưa thả (bên trái)
    if (experimentState === 'setup') {
      const material = MATERIALS[sampleMaterial];
      
      // Bếp nung
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.roundRect(50, baseY - 80, 100, 70, 8);
      ctx.fill();
      
      // Lửa
      ctx.fillStyle = '#f97316';
      for (let i = 0; i < 5; i++) {
        const flameX = 70 + i * 15;
        const flameH = 15 + Math.random() * 10;
        ctx.beginPath();
        ctx.moveTo(flameX, baseY - 80);
        ctx.quadraticCurveTo(flameX + 5, baseY - 80 - flameH, flameX + 10, baseY - 80);
        ctx.fill();
      }
      
      // Vật mẫu trên bếp
      ctx.fillStyle = material.color;
      ctx.beginPath();
      ctx.roundRect(75, baseY - 120, 50, 35, 5);
      ctx.fill();
      
      // Nhãn
      ctx.fillStyle = '#f8fafc';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(material.name, 100, baseY - 130);
      ctx.fillText(`${sampleTemp}°C`, 100, baseY - 85);
    }

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Nhiệt lượng kế', centerX, baseY + 25);
    
    if (experimentState === 'setup') {
      ctx.fillText(`Nước: ${waterMass}g, ${waterTemp}°C`, centerX, calorimeterY - 35);
    }

  }, [experimentState, currentWaterTemp, currentSampleTemp, sampleMaterial, 
      waterMass, waterTemp, sampleTemp, sampleMass]);

  // Vẽ lại
  useEffect(() => {
    draw();
    const interval = setInterval(draw, 100);
    return () => clearInterval(interval);
  }, [draw]);

  // Bắt đầu thí nghiệm
  const startExperiment = () => {
    setExperimentState('mixing');
    setCurrentWaterTemp(waterTemp);
    setCurrentSampleTemp(sampleTemp);
    setTempHistory([{ time: 0, water: waterTemp, sample: sampleTemp }]);
  };

  // Reset
  const resetExperiment = () => {
    setExperimentState('setup');
    setCurrentWaterTemp(waterTemp);
    setCurrentSampleTemp(sampleTemp);
    setTime(0);
    setTempHistory([]);
    setCalculatedC(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Ghi số liệu
  const recordData = () => {
    if (experimentState !== 'equilibrium') {
      alert('Hãy chờ hệ đạt cân bằng nhiệt!');
      return;
    }

    const material = MATERIALS[sampleMaterial];
    const record = {
      trial: collectedData.length + 1,
      material: material.name,
      m1: waterMass,
      t1: waterTemp,
      m2: sampleMass,
      t2: sampleTemp,
      tCB: PhysicsUtils.round(equilibriumTemp, 1),
      c: PhysicsUtils.round(calculatedC, 0)
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

  // Tính sai số
  const calculateError = () => {
    const material = MATERIALS[sampleMaterial];
    if (calculatedC > 0) {
      const error = Math.abs(calculatedC - material.c) / material.c * 100;
      return PhysicsUtils.round(error, 1);
    }
    return null;
  };

  const error = calculateError();

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
              <h1 className="text-xl font-bold">🌡️ Thí nghiệm: Nhiệt lượng kế</h1>
              <p className="text-gray-400 text-sm">Xác định nhiệt dung riêng</p>
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
                style={{ height: '350px' }}
              />

              {/* Controls overlay */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                {experimentState === 'setup' && (
                  <button
                    onClick={startExperiment}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 rounded-lg font-medium transition-colors shadow-lg"
                  >
                    <Droplets size={18} />
                    Thả mẫu vào nước
                  </button>
                )}

                {experimentState === 'equilibrium' && (
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

              {/* Status */}
              <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className={`font-medium ${
                  experimentState === 'equilibrium' ? 'text-green-400' :
                  experimentState === 'mixing' ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {experimentState === 'setup' && '⚙️ Thiết lập'}
                  {experimentState === 'mixing' && '🔄 Đang cân bằng...'}
                  {experimentState === 'equilibrium' && '✓ Đã cân bằng'}
                </span>
              </div>
            </div>

            {/* Parameters */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Thiết lập thí nghiệm</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Water parameters */}
                <div className="space-y-3">
                  <h4 className="text-blue-400 font-medium flex items-center gap-2">
                    <Droplets size={16} /> Nước (nhiệt lượng kế)
                  </h4>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Khối lượng (g)</label>
                    <input
                      type="range"
                      min="100"
                      max="400"
                      step="20"
                      value={waterMass}
                      onChange={(e) => setWaterMass(parseInt(e.target.value))}
                      disabled={experimentState !== 'setup'}
                      className="w-full accent-blue-500"
                    />
                    <div className="text-center text-lg font-mono text-blue-400">{waterMass} g</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Nhiệt độ (°C)</label>
                    <input
                      type="range"
                      min="15"
                      max="35"
                      step="1"
                      value={waterTemp}
                      onChange={(e) => {
                        setWaterTemp(parseInt(e.target.value));
                        setCurrentWaterTemp(parseInt(e.target.value));
                      }}
                      disabled={experimentState !== 'setup'}
                      className="w-full accent-blue-500"
                    />
                    <div className="text-center text-lg font-mono text-blue-400">{waterTemp}°C</div>
                  </div>
                </div>

                {/* Sample parameters */}
                <div className="space-y-3">
                  <h4 className="text-orange-400 font-medium flex items-center gap-2">
                    <Thermometer size={16} /> Vật mẫu
                  </h4>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Chất liệu</label>
                    <select
                      value={sampleMaterial}
                      onChange={(e) => setSampleMaterial(e.target.value)}
                      disabled={experimentState !== 'setup'}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      {Object.entries(MATERIALS).map(([key, mat]) => (
                        <option key={key} value={key}>{mat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Khối lượng (g)</label>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="10"
                      value={sampleMass}
                      onChange={(e) => setSampleMass(parseInt(e.target.value))}
                      disabled={experimentState !== 'setup'}
                      className="w-full accent-orange-500"
                    />
                    <div className="text-center text-lg font-mono text-orange-400">{sampleMass} g</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Nhiệt độ (°C)</label>
                    <input
                      type="range"
                      min="80"
                      max="100"
                      step="5"
                      value={sampleTemp}
                      onChange={(e) => setSampleTemp(parseInt(e.target.value))}
                      disabled={experimentState !== 'setup'}
                      className="w-full accent-orange-500"
                    />
                    <div className="text-center text-lg font-mono text-orange-400">{sampleTemp}°C</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Temperature chart */}
          {tempHistory.length > 1 && (
            <div className="mt-4">
              <RealTimeChart
                data={tempHistory}
                xKey="time"
                yKey="water"
                xLabel="Thời gian"
                yLabel="Nhiệt độ"
                xUnit="s"
                yUnit="°C"
                title="Biến thiên nhiệt độ theo thời gian"
                lineColor="#3b82f6"
                pointColor="#22c55e"
                height={180}
              />
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="lg:w-96 space-y-4">
          {/* Results */}
          <div className={`rounded-xl p-4 border ${
            experimentState === 'equilibrium'
              ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-700/50'
              : 'bg-gradient-to-br from-orange-900/50 to-red-900/50 border-orange-700/50'
          }`}>
            <h3 className="text-lg font-bold text-white mb-3">📊 Kết quả</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-mono text-blue-400">
                  {PhysicsUtils.round(currentWaterTemp, 1)}
                </div>
                <div className="text-xs text-gray-400">t_nước (°C)</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-mono text-green-400">
                  {experimentState === 'equilibrium' 
                    ? PhysicsUtils.round(equilibriumTemp, 1)
                    : '-'}
                </div>
                <div className="text-xs text-gray-400">t_CB (°C)</div>
              </div>
            </div>

            {experimentState === 'equilibrium' && (
              <>
                <div className="bg-black/30 rounded-lg p-3 text-center mb-3">
                  <div className="text-2xl font-mono text-yellow-400">
                    {PhysicsUtils.round(calculatedC, 0)}
                  </div>
                  <div className="text-xs text-gray-400">c tính được (J/kg.K)</div>
                </div>

                <div className="bg-black/30 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Giá trị lý thuyết:</span>
                    <span className="text-white font-mono">
                      {MATERIALS[sampleMaterial].c} J/kg.K
                    </span>
                  </div>
                  {error !== null && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-400">Sai số:</span>
                      <span className={`font-mono ${error < 5 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {error}%
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Data Table */}
          <DataTable
            columns={[
              { name: 'trial', label: '#', type: 'number' },
              { name: 'material', label: 'Chất', type: 'string' },
              { name: 'tCB', label: 't_CB', type: 'number' },
              { name: 'c', label: 'c', type: 'number' }
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
            <h3 className="text-sm font-medium text-gray-400 mb-2">📐 Phương trình cân bằng nhiệt</h3>
            <div className="bg-gray-900 rounded-lg p-3 space-y-2 text-center">
              <p className="text-lg font-mono text-cyan-400">Q_thu = Q_tỏa</p>
              <p className="text-sm font-mono text-gray-400">m₁c₁Δt₁ = m₂c₂Δt₂</p>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <p>• c_nước = 4186 J/kg.K</p>
              <p>• Q = mcΔt</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-6 border border-gray-700">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🌡️</div>
              <h2 className="text-xl font-bold">{guideSteps[guideStep].title}</h2>
            </div>

            <p className="text-gray-300 text-center mb-6">
              {guideSteps[guideStep].content}
            </p>

            <div className="flex justify-center gap-2 mb-6">
              {guideSteps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === guideStep ? 'bg-orange-500' : 'bg-gray-600'}`}
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
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg"
                >
                  Bắt đầu
                </button>
              ) : (
                <button
                  onClick={() => setGuideStep(guideStep + 1)}
                  className="flex items-center gap-1 px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg"
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
              <h2 className="text-xl font-bold">📚 Nhiệt lượng kế và cân bằng nhiệt</h2>
              <button onClick={() => setShowTheory(false)} className="p-2 hover:bg-gray-700 rounded-lg">✕</button>
            </div>

            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Nhiệt lượng</h3>
                <p>Nhiệt lượng Q là phần năng lượng mà vật nhận được hay mất đi trong quá trình truyền nhiệt.</p>
                <div className="bg-gray-900 p-3 rounded-lg mt-2 text-center">
                  <p className="text-xl font-mono text-yellow-400">Q = mcΔt</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Nhiệt dung riêng</h3>
                <p>Nhiệt dung riêng c của một chất cho biết nhiệt lượng cần truyền cho 1 kg chất đó để nhiệt độ tăng thêm 1°C (hoặc 1K).</p>
                <ul className="list-disc list-inside text-sm mt-2">
                  <li>Nước: 4186 J/kg.K</li>
                  <li>Nhôm: 880 J/kg.K</li>
                  <li>Đồng: 380 J/kg.K</li>
                  <li>Sắt: 460 J/kg.K</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Phương trình cân bằng nhiệt</h3>
                <p>Khi có sự trao đổi nhiệt giữa các vật, nhiệt lượng tỏa ra bằng nhiệt lượng thu vào:</p>
                <div className="bg-gray-900 p-3 rounded-lg mt-2 text-center">
                  <p className="text-xl font-mono text-green-400">Q_thu = Q_tỏa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalorimeterLab;

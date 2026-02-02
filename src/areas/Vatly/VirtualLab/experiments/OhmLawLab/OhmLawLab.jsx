/**
 * OhmLawLab.jsx - Thí nghiệm Khảo sát định luật Ôm
 * 
 * Mục tiêu:
 * - Xác minh định luật Ôm: I = U/R
 * - Đo cường độ dòng điện I khi thay đổi U hoặc R
 * - Vẽ đồ thị U-I để xác định điện trở
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
  Zap,
  Plus,
  Minus
} from 'lucide-react';
import { OhmLaw, PhysicsUtils } from '../../core/PhysicsEngine';
import { ExperimentDataCollector } from '../../core/DataCollector';
import { Voltmeter, Ammeter } from '../../instruments/DigitalMeter';
import DataTable from '../../charts/DataTable';
import RealTimeChart from '../../charts/RealTimeChart';
import './OhmLawLab.css';

const OhmLawLab = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const dataCollectorRef = useRef(null);

  // Trạng thái thí nghiệm
  const [experimentState, setExperimentState] = useState('setup');
  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0);
  const [showTheory, setShowTheory] = useState(false);
  const [circuitOn, setCircuitOn] = useState(false);

  // Tham số mạch điện
  const [voltage, setVoltage] = useState(6); // Hiệu điện thế (V)
  const [resistance, setResistance] = useState(10); // Điện trở (Ω)
  const [current, setCurrent] = useState(0); // Cường độ dòng điện (A)

  // Dữ liệu thu thập
  const [collectedData, setCollectedData] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Animation
  const [electronPositions, setElectronPositions] = useState([]);
  const animationRef = useRef(null);

  // Khởi tạo DataCollector
  useEffect(() => {
    dataCollectorRef.current = new ExperimentDataCollector('Khảo sát định luật Ôm', [
      { name: 'trial', label: 'Lần đo', type: 'number' },
      { name: 'voltage', label: 'U (V)', type: 'number', unit: 'V' },
      { name: 'resistance', label: 'R (Ω)', type: 'number', unit: 'Ω' },
      { name: 'current', label: 'I (A)', type: 'number', unit: 'A' },
      { name: 'power', label: 'P (W)', type: 'number', unit: 'W' }
    ]);

    // Khởi tạo vị trí electron
    initElectrons();
  }, []);

  // Hướng dẫn
  const guideSteps = [
    {
      title: 'Thí nghiệm Định luật Ôm',
      content: 'Trong thí nghiệm này, bạn sẽ khảo sát mối quan hệ giữa hiệu điện thế U, cường độ dòng điện I và điện trở R.'
    },
    {
      title: 'Bước 1: Thiết lập mạch',
      content: 'Điều chỉnh nguồn điện (U) và điện trở (R). Quan sát sơ đồ mạch điện với Vôn kế và Ampe kế.'
    },
    {
      title: 'Bước 2: Đóng mạch',
      content: 'Nhấn công tắc để đóng mạch. Đọc giá trị dòng điện I trên Ampe kế.'
    },
    {
      title: 'Bước 3: Thu thập số liệu',
      content: 'Ghi lại các giá trị U, R, I. Thay đổi U hoặc R và lặp lại nhiều lần.'
    },
    {
      title: 'Bước 4: Phân tích',
      content: 'Xem đồ thị U-I. Độ dốc của đường thẳng chính là điện trở R.'
    }
  ];

  // Khởi tạo electron
  const initElectrons = () => {
    const electrons = [];
    for (let i = 0; i < 12; i++) {
      electrons.push({
        id: i,
        position: i * (100 / 12),
        speed: 0
      });
    }
    setElectronPositions(electrons);
  };

  // Tính dòng điện theo định luật Ôm
  useEffect(() => {
    if (circuitOn && resistance > 0) {
      const I = OhmLaw.calculateCurrent(voltage, resistance);
      setCurrent(I);
    } else {
      setCurrent(0);
    }
  }, [voltage, resistance, circuitOn]);

  // Animation electron
  useEffect(() => {
    if (circuitOn && current > 0) {
      const animate = () => {
        setElectronPositions(prev => 
          prev.map(e => ({
            ...e,
            position: (e.position + current * 2) % 100
          }))
        );
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [circuitOn, current]);

  // Vẽ mạch điện
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

    const centerX = width / 2;
    const centerY = height / 2;
    const circuitWidth = 300;
    const circuitHeight = 180;

    // Vẽ dây dẫn
    ctx.strokeStyle = circuitOn ? '#fbbf24' : '#6b7280';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Đường dẫn mạch (hình chữ nhật)
    const left = centerX - circuitWidth / 2;
    const right = centerX + circuitWidth / 2;
    const top = centerY - circuitHeight / 2;
    const bottom = centerY + circuitHeight / 2;

    // Vẽ mạch
    ctx.beginPath();
    // Cạnh trên (từ nguồn đến điện trở)
    ctx.moveTo(left + 40, top);
    ctx.lineTo(right - 60, top);
    // Cạnh phải
    ctx.moveTo(right, top + 30);
    ctx.lineTo(right, bottom - 30);
    // Cạnh dưới
    ctx.moveTo(right - 30, bottom);
    ctx.lineTo(left + 30, bottom);
    // Cạnh trái (qua công tắc)
    ctx.moveTo(left, bottom - 30);
    ctx.lineTo(left, top + 40);
    ctx.stroke();

    // Vẽ nguồn điện (pin)
    const batteryX = left;
    const batteryY = top + 20;
    
    // Cực dương (dài)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(batteryX - 15, batteryY - 10);
    ctx.lineTo(batteryX - 15, batteryY + 10);
    ctx.stroke();

    // Cực âm (ngắn)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(batteryX + 15, batteryY - 6);
    ctx.lineTo(batteryX + 15, batteryY + 6);
    ctx.stroke();

    // Nhãn nguồn
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${voltage}V`, batteryX, batteryY - 25);
    ctx.fillText('⊕', batteryX - 15, batteryY + 30);
    ctx.fillText('⊖', batteryX + 15, batteryY + 30);

    // Vẽ điện trở (zigzag)
    const resistorX = right - 30;
    const resistorY = top;
    
    ctx.strokeStyle = circuitOn ? '#22c55e' : '#6b7280';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(resistorX - 40, resistorY);
    
    // Zigzag
    const zigzagWidth = 60;
    const zigzagHeight = 12;
    const segments = 6;
    for (let i = 0; i < segments; i++) {
      const x = resistorX - 40 + (i + 0.5) * (zigzagWidth / segments);
      const y = resistorY + (i % 2 === 0 ? -zigzagHeight : zigzagHeight);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(resistorX + 20, resistorY);
    ctx.stroke();

    // Nhãn điện trở
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`R = ${resistance}Ω`, resistorX - 10, resistorY - 25);

    // Vẽ Ampe kế (vòng tròn với A)
    const ammeterX = right;
    const ammeterY = centerY;
    
    ctx.beginPath();
    ctx.arc(ammeterX, ammeterY, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#1e3a5f';
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('A', ammeterX, ammeterY + 6);

    // Vẽ Vôn kế (song song với nguồn)
    const voltmeterX = left - 50;
    const voltmeterY = centerY;

    ctx.beginPath();
    ctx.arc(voltmeterX, voltmeterY, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#3d2a1a';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('V', voltmeterX, voltmeterY + 6);

    // Dây nối vôn kế
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(voltmeterX + 25, voltmeterY - 15);
    ctx.lineTo(left, top + 40);
    ctx.moveTo(voltmeterX + 25, voltmeterY + 15);
    ctx.lineTo(left, bottom - 30);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vẽ công tắc
    const switchX = left;
    const switchY = bottom - 15;
    
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 3;
    
    if (circuitOn) {
      // Đóng
      ctx.beginPath();
      ctx.moveTo(switchX - 15, switchY);
      ctx.lineTo(switchX + 15, switchY);
      ctx.stroke();
    } else {
      // Mở
      ctx.beginPath();
      ctx.moveTo(switchX - 15, switchY);
      ctx.lineTo(switchX + 10, switchY - 20);
      ctx.stroke();
    }

    // Chấm tiếp xúc
    ctx.beginPath();
    ctx.arc(switchX - 15, switchY, 4, 0, Math.PI * 2);
    ctx.arc(switchX + 15, switchY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#9ca3af';
    ctx.fill();

    // Nhãn công tắc
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px sans-serif';
    ctx.fillText(circuitOn ? 'ĐÓNG' : 'MỞ', switchX, switchY + 25);

    // Vẽ electron di chuyển
    if (circuitOn && current > 0) {
      ctx.fillStyle = '#60a5fa';
      
      electronPositions.forEach(e => {
        // Tính vị trí trên đường mạch
        const totalLength = 2 * circuitWidth + 2 * circuitHeight;
        const pos = (e.position / 100) * totalLength;
        
        let ex, ey;
        
        if (pos < circuitWidth) {
          // Cạnh trên
          ex = left + 40 + pos;
          ey = top;
        } else if (pos < circuitWidth + circuitHeight) {
          // Cạnh phải
          ex = right;
          ey = top + (pos - circuitWidth);
        } else if (pos < 2 * circuitWidth + circuitHeight) {
          // Cạnh dưới
          ex = right - (pos - circuitWidth - circuitHeight);
          ey = bottom;
        } else {
          // Cạnh trái
          ex = left;
          ey = bottom - (pos - 2 * circuitWidth - circuitHeight);
        }

        // Vẽ electron
        ctx.beginPath();
        ctx.arc(ex, ey, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Hiển thị công suất
    if (circuitOn) {
      const power = OhmLaw.calculatePower(voltage, current);
      ctx.fillStyle = '#f472b6';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Công suất: P = U×I = ${power.toFixed(3)} W`, 20, height - 20);
    }

  }, [voltage, resistance, circuitOn, electronPositions, current]);

  // Vẽ lại khi thay đổi
  useEffect(() => {
    draw();
  }, [draw]);

  // Bật/tắt mạch
  const toggleCircuit = () => {
    setCircuitOn(!circuitOn);
    if (!circuitOn) {
      setExperimentState('running');
    }
  };

  // Reset
  const resetExperiment = () => {
    setCircuitOn(false);
    setCurrent(0);
    setExperimentState('setup');
    initElectrons();
  };

  // Ghi số liệu
  const recordData = () => {
    if (!circuitOn) {
      alert('Hãy đóng mạch trước!');
      return;
    }

    const power = OhmLaw.calculatePower(voltage, current);
    const record = {
      trial: collectedData.length + 1,
      voltage: PhysicsUtils.round(voltage, 2),
      resistance: PhysicsUtils.round(resistance, 1),
      current: PhysicsUtils.round(current, 4),
      power: PhysicsUtils.round(power, 4)
    };

    if (dataCollectorRef.current) {
      dataCollectorRef.current.addRecord(record);
    }

    setCollectedData(prev => [...prev, record]);
    setChartData(prev => [...prev, { voltage, current }]);
  };

  // Xóa dữ liệu
  const clearData = () => {
    setCollectedData([]);
    setChartData([]);
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

  // Thống kê - Tính R từ đồ thị U-I
  const calculateStats = () => {
    if (chartData.length < 2) return null;

    // Linear regression để tính R
    const n = chartData.length;
    const sumU = chartData.reduce((s, d) => s + d.voltage, 0);
    const sumI = chartData.reduce((s, d) => s + d.current, 0);
    const sumUI = chartData.reduce((s, d) => s + d.voltage * d.current, 0);
    const sumI2 = chartData.reduce((s, d) => s + d.current * d.current, 0);

    // R = ΣUI / ΣI² (khi đường thẳng qua gốc)
    const calculatedR = sumI2 > 0 ? sumUI / sumI2 : 0;
    
    return {
      calculatedR: PhysicsUtils.round(calculatedR, 2),
      dataPoints: n
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
              <h1 className="text-xl font-bold">⚡ Thí nghiệm: Khảo sát định luật Ôm</h1>
              <p className="text-gray-400 text-sm">Xác minh I = U/R</p>
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

              {/* Meters overlay */}
              <div className="absolute top-4 right-4 flex flex-col gap-3">
                <Voltmeter value={circuitOn ? voltage : 0} precision={1} size="small" />
                <Ammeter value={current} precision={3} size="small" />
              </div>

              {/* Controls overlay */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button
                  onClick={toggleCircuit}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg ${
                    circuitOn 
                      ? 'bg-red-600 hover:bg-red-500' 
                      : 'bg-green-600 hover:bg-green-500'
                  }`}
                >
                  {circuitOn ? <Pause size={18} /> : <Zap size={18} />}
                  {circuitOn ? 'Ngắt mạch' : 'Đóng mạch'}
                </button>

                {circuitOn && (
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
                </button>
              </div>
            </div>

            {/* Parameters */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Điều chỉnh thông số</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Voltage control */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Hiệu điện thế U (V)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setVoltage(v => Math.max(1, v - 1))}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      step="0.5"
                      value={voltage}
                      onChange={(e) => setVoltage(parseFloat(e.target.value))}
                      className="flex-1 accent-yellow-500"
                    />
                    <button
                      onClick={() => setVoltage(v => Math.min(12, v + 1))}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-center text-xl font-mono text-yellow-400 mt-1">
                    {voltage.toFixed(1)} V
                  </div>
                </div>

                {/* Resistance control */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Điện trở R (Ω)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setResistance(r => Math.max(1, r - 1))}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      step="1"
                      value={resistance}
                      onChange={(e) => setResistance(parseFloat(e.target.value))}
                      className="flex-1 accent-green-500"
                    />
                    <button
                      onClick={() => setResistance(r => Math.min(50, r + 1))}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-center text-xl font-mono text-green-400 mt-1">
                    {resistance} Ω
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-4">
            <RealTimeChart
              data={chartData}
              xKey="current"
              yKey="voltage"
              xLabel="Cường độ I"
              yLabel="Hiệu điện thế U"
              xUnit="A"
              yUnit="V"
              title="Đồ thị U-I (Đặc tuyến Vôn-Ampe)"
              lineColor="#f59e0b"
              pointColor="#22c55e"
              height={200}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:w-96 space-y-4">
          {/* Live values */}
          <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 rounded-xl p-4 border border-yellow-700/50">
            <h3 className="text-lg font-bold text-white mb-3">📐 Giá trị đo</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-2xl font-mono text-yellow-400">{voltage.toFixed(1)}</div>
                <div className="text-xs text-gray-400">U (V)</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-2xl font-mono text-blue-400">{current.toFixed(3)}</div>
                <div className="text-xs text-gray-400">I (A)</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-2xl font-mono text-green-400">{resistance}</div>
                <div className="text-xs text-gray-400">R (Ω)</div>
              </div>
            </div>

            {/* Verification */}
            {circuitOn && (
              <div className="mt-3 p-2 bg-black/30 rounded-lg text-center">
                <span className="text-gray-400">Kiểm tra: I = U/R = </span>
                <span className="text-white font-mono">
                  {voltage}/{resistance} = {(voltage/resistance).toFixed(4)} A
                </span>
                <span className={`ml-2 ${Math.abs(current - voltage/resistance) < 0.001 ? 'text-green-400' : 'text-red-400'}`}>
                  ✓
                </span>
              </div>
            )}
          </div>

          {/* Statistics */}
          {stats && (
            <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-xl p-4 border border-blue-700/50">
              <h3 className="text-lg font-bold text-white mb-3">📊 Phân tích</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Số điểm dữ liệu:</span>
                  <span className="font-mono text-blue-400">{stats.dataPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">R từ đồ thị U-I:</span>
                  <span className="font-mono text-green-400 font-bold">{stats.calculatedR} Ω</span>
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          <DataTable
            columns={[
              { name: 'trial', label: '#', type: 'number' },
              { name: 'voltage', label: 'U(V)', type: 'number', precision: 1 },
              { name: 'resistance', label: 'R(Ω)', type: 'number', precision: 0 },
              { name: 'current', label: 'I(A)', type: 'number', precision: 3 }
            ]}
            data={collectedData}
            onClearAll={clearData}
            onExport={exportData}
            onDeleteRecord={(id) => {
              setCollectedData(prev => prev.filter(d => d.trial !== id));
              setChartData(prev => prev.filter((_, i) => i !== id - 1));
            }}
            maxHeight={200}
          />

          {/* Formula */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">📐 Định luật Ôm</h3>
            <div className="bg-gray-900 rounded-lg p-3 text-center space-y-1">
              <p className="text-xl font-mono text-blue-400">I = U / R</p>
              <p className="text-sm text-gray-500">U = I × R | R = U / I</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-6 border border-gray-700">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">⚡</div>
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
              <h2 className="text-xl font-bold">📚 Định luật Ôm</h2>
              <button onClick={() => setShowTheory(false)} className="p-2 hover:bg-gray-700 rounded-lg">✕</button>
            </div>

            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Phát biểu</h3>
                <p>Cường độ dòng điện chạy qua dây dẫn tỉ lệ thuận với hiệu điện thế đặt vào hai đầu dây và tỉ lệ nghịch với điện trở của dây.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Công thức</h3>
                <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <p className="text-2xl font-mono text-yellow-400">I = U / R</p>
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• I: Cường độ dòng điện (A - Ampe)</li>
                  <li>• U: Hiệu điện thế (V - Vôn)</li>
                  <li>• R: Điện trở (Ω - Ôm)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Đồ thị U-I</h3>
                <p>Đồ thị U-I là đường thẳng đi qua gốc tọa độ. Độ dốc của đường thẳng bằng điện trở R.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OhmLawLab;

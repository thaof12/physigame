/**
 * ResistorCircuitLab.jsx - Thí nghiệm Mạch điện trở nối tiếp và song song
 * 
 * Mục tiêu:
 * - Khảo sát điện trở tương đương trong mạch nối tiếp: R_tđ = R₁ + R₂ + ...
 * - Khảo sát điện trở tương đương trong mạch song song: 1/R_tđ = 1/R₁ + 1/R₂ + ...
 * - Đo và so sánh với giá trị lý thuyết
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RotateCcw, 
  Save,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Zap,
  Plus,
  Minus,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { OhmLaw, PhysicsUtils } from '../../core/PhysicsEngine';
import { ExperimentDataCollector } from '../../core/DataCollector';
import { Voltmeter, Ammeter, Ohmmeter } from '../../instruments/DigitalMeter';
import DataTable from '../../charts/DataTable';
import './ResistorCircuitLab.css';

const ResistorCircuitLab = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const dataCollectorRef = useRef(null);

  // Trạng thái thí nghiệm
  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0);
  const [showTheory, setShowTheory] = useState(false);
  const [circuitOn, setCircuitOn] = useState(false);

  // Loại mạch
  const [circuitType, setCircuitType] = useState('series'); // series | parallel

  // Tham số mạch
  const [voltage, setVoltage] = useState(12); // Hiệu điện thế nguồn (V)
  const [r1, setR1] = useState(10); // Điện trở 1 (Ω)
  const [r2, setR2] = useState(20); // Điện trở 2 (Ω)
  const [r3, setR3] = useState(30); // Điện trở 3 (Ω)
  const [numResistors, setNumResistors] = useState(2); // Số điện trở (2 hoặc 3)

  // Kết quả tính toán
  const [totalResistance, setTotalResistance] = useState(0);
  const [current, setCurrent] = useState(0);
  const [voltages, setVoltages] = useState([0, 0, 0]); // Điện áp qua từng điện trở
  const [currents, setCurrents] = useState([0, 0, 0]); // Dòng qua từng điện trở

  // Dữ liệu thu thập
  const [collectedData, setCollectedData] = useState([]);

  // Khởi tạo DataCollector
  useEffect(() => {
    dataCollectorRef.current = new ExperimentDataCollector('Mạch điện trở', [
      { name: 'trial', label: 'Lần đo', type: 'number' },
      { name: 'type', label: 'Loại mạch', type: 'string' },
      { name: 'R1', label: 'R₁ (Ω)', type: 'number', unit: 'Ω' },
      { name: 'R2', label: 'R₂ (Ω)', type: 'number', unit: 'Ω' },
      { name: 'R3', label: 'R₃ (Ω)', type: 'number', unit: 'Ω' },
      { name: 'Rtd', label: 'R_tđ (Ω)', type: 'number', unit: 'Ω' },
      { name: 'I', label: 'I (A)', type: 'number', unit: 'A' }
    ]);
  }, []);

  // Hướng dẫn
  const guideSteps = [
    {
      title: 'Thí nghiệm Mạch điện trở',
      content: 'Trong thí nghiệm này, bạn sẽ khảo sát điện trở tương đương của mạch nối tiếp và song song.'
    },
    {
      title: 'Bước 1: Chọn loại mạch',
      content: 'Chọn mạch nối tiếp hoặc song song. Điều chỉnh giá trị các điện trở R₁, R₂, R₃.'
    },
    {
      title: 'Bước 2: Đóng mạch',
      content: 'Nhấn công tắc để đóng mạch. Quan sát giá trị dòng điện và điện áp.'
    },
    {
      title: 'Bước 3: Quan sát',
      content: 'Mạch nối tiếp: I chung, U chia theo R. Mạch song song: U chung, I chia theo R.'
    },
    {
      title: 'Bước 4: Xác minh',
      content: 'So sánh R_tđ đo được với công thức lý thuyết. Ghi số liệu để phân tích.'
    }
  ];

  // Tính toán mạch
  useEffect(() => {
    const resistors = numResistors === 3 ? [r1, r2, r3] : [r1, r2];
    
    let Rtd, I, Us, Is;
    
    if (circuitType === 'series') {
      // Mạch nối tiếp: R_tđ = R₁ + R₂ + R₃
      Rtd = resistors.reduce((sum, r) => sum + r, 0);
      I = circuitOn ? voltage / Rtd : 0;
      
      // Điện áp qua từng điện trở: U = I × R
      Us = resistors.map(r => I * r);
      // Dòng qua từng điện trở bằng nhau
      Is = resistors.map(() => I);
    } else {
      // Mạch song song: 1/R_tđ = 1/R₁ + 1/R₂ + 1/R₃
      const invRtd = resistors.reduce((sum, r) => sum + 1/r, 0);
      Rtd = 1 / invRtd;
      I = circuitOn ? voltage / Rtd : 0;
      
      // Điện áp qua từng điện trở bằng nhau = U nguồn
      Us = resistors.map(() => circuitOn ? voltage : 0);
      // Dòng qua từng điện trở: I = U/R
      Is = resistors.map(r => circuitOn ? voltage / r : 0);
    }
    
    setTotalResistance(Rtd);
    setCurrent(I);
    setVoltages(Us);
    setCurrents(Is);
  }, [circuitType, voltage, r1, r2, r3, numResistors, circuitOn]);

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
    const resistors = numResistors === 3 ? [r1, r2, r3] : [r1, r2];

    // Màu dây
    const wireColor = circuitOn ? '#fbbf24' : '#6b7280';
    ctx.strokeStyle = wireColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    if (circuitType === 'series') {
      // --- MẠCH NỐI TIẾP ---
      const startX = 80;
      const endX = width - 80;
      const wireY = centerY;
      const resistorWidth = 60;
      const totalWidth = endX - startX - 120;
      const spacing = totalWidth / (numResistors + 1);

      // Dây từ nguồn đến điện trở đầu tiên
      ctx.beginPath();
      ctx.moveTo(startX + 60, wireY);
      ctx.lineTo(startX + spacing - resistorWidth/2, wireY);
      ctx.stroke();

      // Vẽ các điện trở nối tiếp
      for (let i = 0; i < numResistors; i++) {
        const rx = startX + spacing * (i + 1);
        
        // Vẽ điện trở (zigzag)
        drawResistor(ctx, rx, wireY, resistorWidth, resistors[i], circuitOn);
        
        // Hiển thị điện áp và dòng
        if (circuitOn) {
          ctx.fillStyle = '#60a5fa';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`U${i+1}=${PhysicsUtils.round(voltages[i], 2)}V`, rx, wireY - 35);
        }

        // Dây nối giữa các điện trở
        if (i < numResistors - 1) {
          ctx.strokeStyle = wireColor;
          ctx.beginPath();
          ctx.moveTo(rx + resistorWidth/2, wireY);
          ctx.lineTo(startX + spacing * (i + 2) - resistorWidth/2, wireY);
          ctx.stroke();
        }
      }

      // Dây từ điện trở cuối về nguồn (qua đường dưới)
      const lastRx = startX + spacing * numResistors;
      ctx.strokeStyle = wireColor;
      ctx.beginPath();
      ctx.moveTo(lastRx + resistorWidth/2, wireY);
      ctx.lineTo(endX - 40, wireY);
      ctx.lineTo(endX - 40, wireY + 80);
      ctx.lineTo(startX + 40, wireY + 80);
      ctx.lineTo(startX + 40, wireY);
      ctx.stroke();

      // Nguồn điện
      drawBattery(ctx, startX, wireY, voltage);

      // Ampe kế trên đường chính
      drawAmmeter(ctx, endX - 40, wireY + 40, current);

    } else {
      // --- MẠCH SONG SONG ---
      const topY = centerY - 80;
      const bottomY = centerY + 80;
      const leftX = 120;
      const rightX = width - 120;
      const branchSpacing = (rightX - leftX - 100) / (numResistors + 1);

      // Dây chính phía trên
      ctx.strokeStyle = wireColor;
      ctx.beginPath();
      ctx.moveTo(leftX + 60, topY);
      ctx.lineTo(rightX - 30, topY);
      ctx.stroke();

      // Dây chính phía dưới
      ctx.beginPath();
      ctx.moveTo(leftX + 60, bottomY);
      ctx.lineTo(rightX - 30, bottomY);
      ctx.stroke();

      // Vẽ các nhánh song song
      for (let i = 0; i < numResistors; i++) {
        const branchX = leftX + 100 + branchSpacing * (i + 0.5);
        
        // Dây nối từ đường trên xuống điện trở
        ctx.strokeStyle = wireColor;
        ctx.beginPath();
        ctx.moveTo(branchX, topY);
        ctx.lineTo(branchX, centerY - 25);
        ctx.stroke();
        
        // Vẽ điện trở
        drawResistorVertical(ctx, branchX, centerY, 50, resistors[i], circuitOn);
        
        // Dây nối từ điện trở xuống đường dưới
        ctx.strokeStyle = wireColor;
        ctx.beginPath();
        ctx.moveTo(branchX, centerY + 25);
        ctx.lineTo(branchX, bottomY);
        ctx.stroke();

        // Hiển thị dòng qua từng nhánh
        if (circuitOn) {
          ctx.fillStyle = '#f472b6';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`I${i+1}=${PhysicsUtils.round(currents[i], 3)}A`, branchX, bottomY + 20);
        }
      }

      // Nguồn điện (bên trái)
      drawBattery(ctx, leftX, (topY + bottomY) / 2, voltage);

      // Dây nối nguồn
      ctx.strokeStyle = wireColor;
      ctx.beginPath();
      ctx.moveTo(leftX, topY + 30);
      ctx.lineTo(leftX, topY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(leftX, bottomY - 30);
      ctx.lineTo(leftX, bottomY);
      ctx.stroke();

      // Ampe kế chính (bên phải)
      drawAmmeter(ctx, rightX, (topY + bottomY) / 2, current);

      // Dây nối ampe kế
      ctx.strokeStyle = wireColor;
      ctx.beginPath();
      ctx.moveTo(rightX, topY);
      ctx.lineTo(rightX, topY + 35);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rightX, bottomY - 35);
      ctx.lineTo(rightX, bottomY);
      ctx.stroke();
    }

    // Thông tin
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Loại mạch: ${circuitType === 'series' ? 'Nối tiếp' : 'Song song'}`, 20, 25);
    ctx.fillText(`R_tđ = ${PhysicsUtils.round(totalResistance, 2)} Ω`, 20, 45);
    
    if (circuitOn) {
      ctx.fillStyle = '#22c55e';
      ctx.fillText(`I = ${PhysicsUtils.round(current, 4)} A`, 20, 65);
    }

  }, [circuitType, voltage, r1, r2, r3, numResistors, circuitOn, current, voltages, currents, totalResistance]);

  // Hàm vẽ điện trở ngang
  const drawResistor = (ctx, x, y, width, value, isOn) => {
    ctx.strokeStyle = isOn ? '#22c55e' : '#6b7280';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - width/2, y);
    
    const segments = 6;
    const segWidth = width / segments;
    const zigzagHeight = 12;
    
    for (let i = 0; i < segments; i++) {
      const sx = x - width/2 + (i + 0.5) * segWidth;
      const sy = y + (i % 2 === 0 ? -zigzagHeight : zigzagHeight);
      ctx.lineTo(sx, sy);
    }
    ctx.lineTo(x + width/2, y);
    ctx.stroke();

    // Nhãn
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${value}Ω`, x, y + 28);
  };

  // Hàm vẽ điện trở dọc
  const drawResistorVertical = (ctx, x, y, height, value, isOn) => {
    ctx.strokeStyle = isOn ? '#22c55e' : '#6b7280';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y - height/2);
    
    const segments = 6;
    const segHeight = height / segments;
    const zigzagWidth = 10;
    
    for (let i = 0; i < segments; i++) {
      const sy = y - height/2 + (i + 0.5) * segHeight;
      const sx = x + (i % 2 === 0 ? -zigzagWidth : zigzagWidth);
      ctx.lineTo(sx, sy);
    }
    ctx.lineTo(x, y + height/2);
    ctx.stroke();

    // Nhãn
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${value}Ω`, x + 20, y + 4);
  };

  // Hàm vẽ nguồn điện
  const drawBattery = (ctx, x, y, voltage) => {
    // Cực dương
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x, y + 20);
    ctx.stroke();

    // Cực âm
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 15, y - 12);
    ctx.lineTo(x + 15, y + 12);
    ctx.stroke();

    // Nhãn
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${voltage}V`, x + 7, y - 30);
  };

  // Hàm vẽ ampe kế
  const drawAmmeter = (ctx, x, y, current) => {
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#1e3a5f';
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A', x, y + 5);
  };

  // Vẽ lại
  useEffect(() => {
    draw();
  }, [draw]);

  // Toggle mạch
  const toggleCircuit = () => {
    setCircuitOn(!circuitOn);
  };

  // Reset
  const resetExperiment = () => {
    setCircuitOn(false);
    setCircuitType('series');
    setVoltage(12);
    setR1(10);
    setR2(20);
    setR3(30);
    setNumResistors(2);
  };

  // Ghi số liệu
  const recordData = () => {
    if (!circuitOn) {
      alert('Hãy đóng mạch trước!');
      return;
    }

    const record = {
      trial: collectedData.length + 1,
      type: circuitType === 'series' ? 'Nối tiếp' : 'Song song',
      R1: r1,
      R2: r2,
      R3: numResistors === 3 ? r3 : '-',
      Rtd: PhysicsUtils.round(totalResistance, 2),
      I: PhysicsUtils.round(current, 4)
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

  // Tính R_tđ lý thuyết để hiển thị
  const getTheoreticalFormula = () => {
    const resistors = numResistors === 3 ? [r1, r2, r3] : [r1, r2];
    if (circuitType === 'series') {
      return `${resistors.join(' + ')} = ${resistors.reduce((a, b) => a + b, 0)} Ω`;
    } else {
      const invSum = resistors.reduce((sum, r) => sum + 1/r, 0);
      return `1/(${resistors.map(r => `1/${r}`).join(' + ')}) = ${PhysicsUtils.round(1/invSum, 2)} Ω`;
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
              <h1 className="text-xl font-bold">🔌 Thí nghiệm: Mạch điện trở</h1>
              <p className="text-gray-400 text-sm">Nối tiếp và song song</p>
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

              {/* Meters overlay */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Voltmeter value={circuitOn ? voltage : 0} precision={1} size="small" />
                <Ammeter value={current} precision={4} size="small" />
                <Ohmmeter value={totalResistance} precision={2} size="small" />
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
                  <Zap size={18} />
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
              {/* Circuit type toggle */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={() => setCircuitType('series')}
                  disabled={circuitOn}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    circuitType === 'series'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } disabled:opacity-50`}
                >
                  🔗 Nối tiếp
                </button>
                <button
                  onClick={() => setCircuitType('parallel')}
                  disabled={circuitOn}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    circuitType === 'parallel'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } disabled:opacity-50`}
                >
                  ⚡ Song song
                </button>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-gray-400 text-sm">Số điện trở:</span>
                  <button
                    onClick={() => setNumResistors(2)}
                    disabled={circuitOn}
                    className={`px-3 py-1 rounded ${numResistors === 2 ? 'bg-yellow-600' : 'bg-gray-700'} disabled:opacity-50`}
                  >
                    2
                  </button>
                  <button
                    onClick={() => setNumResistors(3)}
                    disabled={circuitOn}
                    className={`px-3 py-1 rounded ${numResistors === 3 ? 'bg-yellow-600' : 'bg-gray-700'} disabled:opacity-50`}
                  >
                    3
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Voltage */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Nguồn U (V)</label>
                  <input
                    type="range"
                    min="3"
                    max="24"
                    step="1"
                    value={voltage}
                    onChange={(e) => setVoltage(parseInt(e.target.value))}
                    disabled={circuitOn}
                    className="w-full accent-yellow-500"
                  />
                  <div className="text-center text-lg font-mono text-yellow-400">{voltage} V</div>
                </div>

                {/* R1 */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">R₁ (Ω)</label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={r1}
                    onChange={(e) => setR1(parseInt(e.target.value))}
                    disabled={circuitOn}
                    className="w-full accent-green-500"
                  />
                  <div className="text-center text-lg font-mono text-green-400">{r1} Ω</div>
                </div>

                {/* R2 */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">R₂ (Ω)</label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={r2}
                    onChange={(e) => setR2(parseInt(e.target.value))}
                    disabled={circuitOn}
                    className="w-full accent-blue-500"
                  />
                  <div className="text-center text-lg font-mono text-blue-400">{r2} Ω</div>
                </div>

                {/* R3 */}
                {numResistors === 3 && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">R₃ (Ω)</label>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={r3}
                      onChange={(e) => setR3(parseInt(e.target.value))}
                      disabled={circuitOn}
                      className="w-full accent-purple-500"
                    />
                    <div className="text-center text-lg font-mono text-purple-400">{r3} Ω</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:w-96 space-y-4">
          {/* Results */}
          <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 rounded-xl p-4 border border-yellow-700/50">
            <h3 className="text-lg font-bold text-white mb-3">📊 Kết quả</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-mono text-yellow-400">
                  {PhysicsUtils.round(totalResistance, 2)}
                </div>
                <div className="text-xs text-gray-400">R_tđ (Ω)</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-mono text-blue-400">
                  {PhysicsUtils.round(current, 4)}
                </div>
                <div className="text-xs text-gray-400">I (A)</div>
              </div>
            </div>

            {/* Formula verification */}
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-sm text-gray-400 mb-1">Công thức:</p>
              <p className="text-sm font-mono text-green-400">
                R_tđ = {getTheoreticalFormula()}
              </p>
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            columns={[
              { name: 'trial', label: '#', type: 'number' },
              { name: 'type', label: 'Loại', type: 'string' },
              { name: 'Rtd', label: 'R_tđ', type: 'number' },
              { name: 'I', label: 'I', type: 'number', precision: 3 }
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
            <div className="bg-gray-900 rounded-lg p-3 space-y-3">
              <div>
                <p className="text-xs text-blue-400 mb-1">Nối tiếp:</p>
                <p className="text-lg font-mono text-blue-300">R_tđ = R₁ + R₂ + R₃</p>
                <p className="text-xs text-gray-500">I chung, U = U₁ + U₂ + U₃</p>
              </div>
              <div>
                <p className="text-xs text-green-400 mb-1">Song song:</p>
                <p className="text-sm font-mono text-green-300">1/R_tđ = 1/R₁ + 1/R₂ + 1/R₃</p>
                <p className="text-xs text-gray-500">U chung, I = I₁ + I₂ + I₃</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-6 border border-gray-700">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔌</div>
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
              <h2 className="text-xl font-bold">📚 Mạch điện trở</h2>
              <button onClick={() => setShowTheory(false)} className="p-2 hover:bg-gray-700 rounded-lg">✕</button>
            </div>

            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Mạch nối tiếp</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Các điện trở mắc liên tiếp nhau</li>
                  <li>Cường độ dòng điện bằng nhau: I = I₁ = I₂ = I₃</li>
                  <li>Hiệu điện thế: U = U₁ + U₂ + U₃</li>
                  <li>Điện trở tương đương: R_tđ = R₁ + R₂ + R₃</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Mạch song song</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Các điện trở mắc chung hai đầu</li>
                  <li>Hiệu điện thế bằng nhau: U = U₁ = U₂ = U₃</li>
                  <li>Cường độ dòng điện: I = I₁ + I₂ + I₃</li>
                  <li>Điện trở tương đương: 1/R_tđ = 1/R₁ + 1/R₂ + 1/R₃</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3. So sánh</h3>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400">
                        <th className="text-left py-1">Đặc điểm</th>
                        <th className="text-center py-1">Nối tiếp</th>
                        <th className="text-center py-1">Song song</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-1">Dòng điện</td>
                        <td className="text-center text-blue-400">I chung</td>
                        <td className="text-center text-green-400">I chia</td>
                      </tr>
                      <tr>
                        <td className="py-1">Hiệu điện thế</td>
                        <td className="text-center text-blue-400">U chia</td>
                        <td className="text-center text-green-400">U chung</td>
                      </tr>
                      <tr>
                        <td className="py-1">R_tđ so với R</td>
                        <td className="text-center text-blue-400">R_tđ &gt; R</td>
                        <td className="text-center text-green-400">R_tđ &lt; R</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResistorCircuitLab;

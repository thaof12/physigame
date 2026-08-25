/**
 * StandingWaveLab.jsx - Thí nghiệm Khảo sát sóng dừng trên dây
 * 
 * Mục tiêu:
 * - Quan sát hiện tượng sóng dừng trên dây
 * - Xác định bước sóng, tần số và vận tốc truyền sóng
 * - Xác định điều kiện có sóng dừng: L = n × λ/2
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
  Waves,
  Plus,
  Minus
} from 'lucide-react';
import { WavePhysics, PhysicsUtils } from '../../core/PhysicsEngine';
import { ExperimentDataCollector } from '../../core/DataCollector';
import DataTable from '../../charts/DataTable';
import './StandingWaveLab.css';

const StandingWaveLab = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const dataCollectorRef = useRef(null);
  const animationRef = useRef(null);

  // Trạng thái thí nghiệm
  const [isRunning, setIsRunning] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0);
  const [showTheory, setShowTheory] = useState(false);
  const [time, setTime] = useState(0);

  // Tham số sóng
  const [stringLength, setStringLength] = useState(600); // Chiều dài dây (mm)
  const [frequency, setFrequency] = useState(2); // Tần số (Hz)
  const [amplitude, setAmplitude] = useState(40); // Biên độ (mm)
  const [waveSpeed, setWaveSpeed] = useState(200); // Vận tốc truyền sóng (mm/s)
  const [harmonicMode, setHarmonicMode] = useState(2); // Số bụng sóng

  // Kết quả tính toán
  const [wavelength, setWavelength] = useState(0);
  const [isStandingWave, setIsStandingWave] = useState(false);
  const [numNodes, setNumNodes] = useState(0);
  const [numAntinodes, setNumAntinodes] = useState(0);

  // Dữ liệu thu thập
  const [collectedData, setCollectedData] = useState([]);

  // Khởi tạo DataCollector
  useEffect(() => {
    dataCollectorRef.current = new ExperimentDataCollector('Khảo sát sóng dừng', [
      { name: 'trial', label: 'Lần đo', type: 'number' },
      { name: 'L', label: 'L (mm)', type: 'number', unit: 'mm' },
      { name: 'f', label: 'f (Hz)', type: 'number', unit: 'Hz' },
      { name: 'v', label: 'v (mm/s)', type: 'number', unit: 'mm/s' },
      { name: 'lambda', label: 'λ (mm)', type: 'number', unit: 'mm' },
      { name: 'n', label: 'n (bụng)', type: 'number' },
      { name: 'standing', label: 'Sóng dừng', type: 'string' }
    ]);
  }, []);

  // Hướng dẫn
  const guideSteps = [
    {
      title: 'Thí nghiệm Sóng dừng',
      content: 'Trong thí nghiệm này, bạn sẽ khảo sát hiện tượng sóng dừng trên dây đàn hồi.'
    },
    {
      title: 'Bước 1: Thiết lập',
      content: 'Điều chỉnh chiều dài dây L, tần số f và vận tốc truyền sóng v.'
    },
    {
      title: 'Bước 2: Chạy mô phỏng',
      content: 'Nhấn Play để quan sát sóng. Điều chỉnh tần số để tìm điều kiện sóng dừng.'
    },
    {
      title: 'Bước 3: Quan sát',
      content: 'Khi có sóng dừng, bạn sẽ thấy các nút (không dao động) và bụng (dao động cực đại) rõ ràng.'
    },
    {
      title: 'Bước 4: Thu thập số liệu',
      content: 'Ghi lại các giá trị L, f, λ và số bụng sóng n để xác minh công thức L = n × λ/2.'
    }
  ];

  // Tính toán bước sóng và kiểm tra sóng dừng
  useEffect(() => {
    const lambda = waveSpeed / frequency;
    setWavelength(lambda);

    // Điều kiện sóng dừng: L = n × λ/2 (n = 1, 2, 3, ...)
    const halfWavelengths = (2 * stringLength) / lambda;
    const n = Math.round(halfWavelengths);
    const isStanding = Math.abs(halfWavelengths - n) < 0.1 && n >= 1;
    
    setIsStandingWave(isStanding);
    if (isStanding) {
      setNumNodes(n + 1);
      setNumAntinodes(n);
      setHarmonicMode(n);
    } else {
      setNumNodes(0);
      setNumAntinodes(0);
    }
  }, [stringLength, frequency, waveSpeed]);

  // Animation loop
  useEffect(() => {
    if (isRunning) {
      const animate = () => {
        setTime(t => t + 0.016); // ~60fps
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
  }, [isRunning]);

  // Vẽ sóng dừng
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

    const centerY = height / 2;
    const padding = 50;
    const drawLength = width - 2 * padding;
    const scale = drawLength / stringLength;

    // Vẽ đường nền (vị trí cân bằng)
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, centerY);
    ctx.lineTo(width - padding, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Vẽ điểm cố định hai đầu
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(padding, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width - padding, centerY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Vẽ sóng
    const omega = 2 * Math.PI * frequency;
    const k = 2 * Math.PI / wavelength;

    ctx.strokeStyle = isStandingWave ? '#22c55e' : '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let x = 0; x <= drawLength; x += 2) {
      const realX = x / scale; // Vị trí thực trên dây (mm)
      
      // Sóng dừng: y = 2A × sin(kx) × cos(ωt)
      // Sóng thường: y = A × sin(kx - ωt)
      let y;
      if (isStandingWave) {
        // Sóng dừng - biên độ cố định tại mỗi điểm
        y = 2 * amplitude * Math.sin(k * realX) * Math.cos(omega * time);
      } else {
        // Sóng chạy + sóng phản xạ (tạo hình ảnh giao thoa)
        const incident = amplitude * Math.sin(k * realX - omega * time);
        const reflected = amplitude * Math.sin(k * realX + omega * time);
        y = incident + reflected;
      }

      const screenX = padding + x;
      const screenY = centerY - y * scale * 0.5;

      if (x === 0) {
        ctx.moveTo(screenX, screenY);
      } else {
        ctx.lineTo(screenX, screenY);
      }
    }
    ctx.stroke();

    // Đánh dấu nút và bụng sóng nếu là sóng dừng
    if (isStandingWave) {
      const halfLambda = wavelength / 2;
      
      // Vẽ nút sóng (nodes)
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 12px sans-serif';
      for (let i = 0; i <= harmonicMode; i++) {
        const nodeX = padding + (i * halfLambda * scale);
        if (nodeX <= width - padding + 5) {
          ctx.beginPath();
          ctx.arc(nodeX, centerY, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillText('N', nodeX - 4, centerY + 25);
        }
      }

      // Vẽ bụng sóng (antinodes)
      ctx.fillStyle = '#f59e0b';
      for (let i = 0; i < harmonicMode; i++) {
        const antinodeX = padding + ((i + 0.5) * halfLambda * scale);
        if (antinodeX <= width - padding) {
          ctx.beginPath();
          ctx.arc(antinodeX, centerY, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillText('B', antinodeX - 4, centerY + 25);
        }
      }
    }

    // Thông tin
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`L = ${stringLength} mm`, 20, 30);
    ctx.fillText(`λ = ${PhysicsUtils.round(wavelength, 1)} mm`, 20, 50);
    ctx.fillText(`f = ${frequency} Hz`, 20, 70);
    ctx.fillText(`v = ${waveSpeed} mm/s`, 20, 90);

    // Trạng thái sóng dừng
    ctx.textAlign = 'right';
    if (isStandingWave) {
      ctx.fillStyle = '#22c55e';
      ctx.fillText(`✓ Sóng dừng (n = ${harmonicMode})`, width - 20, 30);
    } else {
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('○ Chưa có sóng dừng', width - 20, 30);
    }

  }, [stringLength, frequency, wavelength, amplitude, time, isStandingWave, harmonicMode, waveSpeed]);

  // Vẽ lại khi thay đổi
  useEffect(() => {
    draw();
  }, [draw]);

  // Toggle play/pause
  const togglePlay = () => {
    setIsRunning(!isRunning);
  };

  // Reset
  const resetExperiment = () => {
    setIsRunning(false);
    setTime(0);
    setStringLength(600);
    setFrequency(2);
    setAmplitude(40);
    setWaveSpeed(200);
  };

  // Tự động điều chỉnh tần số để có sóng dừng
  const autoTuneFrequency = (mode) => {
    // f = n × v / (2L)
    const f = (mode * waveSpeed) / (2 * stringLength);
    setFrequency(PhysicsUtils.round(f, 2));
  };

  // Ghi số liệu
  const recordData = () => {
    const record = {
      trial: collectedData.length + 1,
      L: stringLength,
      f: frequency,
      v: waveSpeed,
      lambda: PhysicsUtils.round(wavelength, 1),
      n: harmonicMode,
      standing: isStandingWave ? 'Có' : 'Không'
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

  // Xuất CSV
  const exportData = () => {
    if (dataCollectorRef.current) {
      dataCollectorRef.current.downloadCSV();
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
              <h1 className="text-xl font-bold">〰️ Thí nghiệm: Thí nghiệm Sóng dừng & Đo tốc độ truyền sóng</h1>
              <p className="text-gray-400 text-sm">Sóng dừng trên dây đàn hồi</p>
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
                className="w-full standing-wave-canvas"
                style={{ height: '350px' }}
              />

              {/* Controls overlay */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button
                  onClick={togglePlay}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg ${
                    isRunning 
                      ? 'bg-red-600 hover:bg-red-500' 
                      : 'bg-green-600 hover:bg-green-500'
                  }`}
                >
                  {isRunning ? <Pause size={18} /> : <Play size={18} />}
                  {isRunning ? 'Dừng' : 'Chạy'}
                </button>

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
                </button>
              </div>

              {/* Legend */}
              <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-300">N: Nút sóng</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-300">B: Bụng sóng</span>
                </div>
              </div>
            </div>

            {/* Parameters */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Điều chỉnh thông số</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* String Length */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Chiều dài dây L (mm)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="300"
                      max="800"
                      step="50"
                      value={stringLength}
                      onChange={(e) => setStringLength(parseInt(e.target.value))}
                      className="flex-1 accent-cyan-500"
                    />
                  </div>
                  <div className="text-center text-lg font-mono text-cyan-400 mt-1">
                    {stringLength} mm
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Tần số f (Hz)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.5"
                      max="5"
                      step="0.1"
                      value={frequency}
                      onChange={(e) => setFrequency(parseFloat(e.target.value))}
                      className="flex-1 accent-green-500"
                    />
                  </div>
                  <div className="text-center text-lg font-mono text-green-400 mt-1">
                    {frequency.toFixed(1)} Hz
                  </div>
                </div>

                {/* Wave Speed */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Vận tốc v (mm/s)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="100"
                      max="400"
                      step="20"
                      value={waveSpeed}
                      onChange={(e) => setWaveSpeed(parseInt(e.target.value))}
                      className="flex-1 accent-purple-500"
                    />
                  </div>
                  <div className="text-center text-lg font-mono text-purple-400 mt-1">
                    {waveSpeed} mm/s
                  </div>
                </div>

                {/* Amplitude */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Biên độ A (mm)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="20"
                      max="60"
                      step="5"
                      value={amplitude}
                      onChange={(e) => setAmplitude(parseInt(e.target.value))}
                      className="flex-1 accent-blue-500"
                    />
                  </div>
                  <div className="text-center text-lg font-mono text-yellow-400 mt-1">
                    {amplitude} mm
                  </div>
                </div>
              </div>

              {/* Quick tune buttons */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-2">Điều chỉnh nhanh (họa âm):</p>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => autoTuneFrequency(n)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isStandingWave && harmonicMode === n
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      n = {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:w-80 space-y-4">
          {/* Results */}
          <div className={`rounded-xl p-4 border ${
            isStandingWave 
              ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-700/50' 
              : 'bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border-yellow-700/50'
          }`}>
            <h3 className="text-lg font-bold text-white mb-3">📊 Kết quả</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-mono text-cyan-400">
                  {PhysicsUtils.round(wavelength, 1)}
                </div>
                <div className="text-xs text-gray-400">λ (mm)</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-mono text-green-400">
                  {isStandingWave ? harmonicMode : '-'}
                </div>
                <div className="text-xs text-gray-400">Số bụng (n)</div>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-3 text-center">
              <div className={`text-lg font-bold ${isStandingWave ? 'text-green-400' : 'text-yellow-400'}`}>
                {isStandingWave ? '✓ Có sóng dừng' : '○ Chưa có sóng dừng'}
              </div>
              {isStandingWave && (
                <div className="text-sm text-gray-400 mt-1">
                  {numNodes} nút, {numAntinodes} bụng
                </div>
              )}
            </div>
          </div>

          {/* Verification */}
          {isStandingWave && (
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-4 border border-purple-700/50">
              <h3 className="text-lg font-bold text-white mb-3">🔬 Xác minh</h3>
              <div className="bg-black/30 rounded-lg p-3 text-center space-y-2">
                <p className="text-lg font-mono text-purple-400">L = n × λ/2</p>
                <div className="text-sm">
                  <span className="text-gray-400">{stringLength} = {harmonicMode} × {PhysicsUtils.round(wavelength/2, 1)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">= </span>
                  <span className="text-green-400 font-mono">{PhysicsUtils.round(harmonicMode * wavelength/2, 1)} mm</span>
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          <DataTable
            columns={[
              { name: 'trial', label: '#', type: 'number' },
              { name: 'L', label: 'L', type: 'number' },
              { name: 'f', label: 'f', type: 'number' },
              { name: 'lambda', label: 'λ', type: 'number' },
              { name: 'n', label: 'n', type: 'number' }
            ]}
            data={collectedData}
            onClearAll={clearData}
            onExport={exportData}
            onDeleteRecord={(id) => {
              setCollectedData(prev => prev.filter(d => d.trial !== id));
            }}
            maxHeight={150}
          />

          {/* Formula */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">📐 Công thức</h3>
            <div className="bg-gray-900 rounded-lg p-3 space-y-2 text-center">
              <p className="text-lg font-mono text-cyan-400">λ = v / f</p>
              <p className="text-lg font-mono text-green-400">L = n × λ/2</p>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <p>• n = 1, 2, 3... (số bụng sóng)</p>
              <p>• Số nút = n + 1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-6 border border-gray-700">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">〰️</div>
              <h2 className="text-xl font-bold">{guideSteps[guideStep].title}</h2>
            </div>

            <p className="text-gray-300 text-center mb-6">
              {guideSteps[guideStep].content}
            </p>

            <div className="flex justify-center gap-2 mb-6">
              {guideSteps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === guideStep ? 'bg-cyan-500' : 'bg-gray-600'}`}
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
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg"
                >
                  Bắt đầu
                </button>
              ) : (
                <button
                  onClick={() => setGuideStep(guideStep + 1)}
                  className="flex items-center gap-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg"
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
              <h2 className="text-xl font-bold">📚 Sóng dừng</h2>
              <button onClick={() => setShowTheory(false)} className="p-2 hover:bg-gray-700 rounded-lg">✕</button>
            </div>

            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Định nghĩa</h3>
                <p>Sóng dừng là sóng có các nút và bụng cố định trong không gian, được tạo bởi sự giao thoa của hai sóng kết hợp truyền ngược chiều nhau.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Đặc điểm</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Nút sóng (Node): Điểm không dao động, biên độ = 0</li>
                  <li>Bụng sóng (Antinode): Điểm dao động mạnh nhất, biên độ = 2A</li>
                  <li>Khoảng cách 2 nút/bụng liên tiếp = λ/2</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Điều kiện sóng dừng</h3>
                <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <p className="text-xl font-mono text-cyan-400">L = n × λ/2</p>
                  <p className="text-sm text-gray-500 mt-2">(n = 1, 2, 3, ... là số bụng sóng)</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">4. Phương trình sóng dừng</h3>
                <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <p className="text-lg font-mono text-green-400">y = 2A × sin(kx) × cos(ωt)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandingWaveLab;


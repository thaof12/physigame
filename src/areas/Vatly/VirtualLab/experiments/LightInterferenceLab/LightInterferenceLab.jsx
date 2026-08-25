/**
 * LightInterferenceLab.jsx - Thí nghiệm Giao thoa ánh sáng
 * 
 * Mục tiêu:
 * - Quan sát hiện tượng giao thoa ánh sáng qua khe Young
 * - Đo khoảng vân i và xác định bước sóng ánh sáng
 * - Công thức: i = λD/a, λ = ia/D
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
  Eye,
  Lightbulb
} from 'lucide-react';
import { PhysicsUtils } from '../../core/PhysicsEngine';
import { ExperimentDataCollector } from '../../core/DataCollector';
import DataTable from '../../charts/DataTable';
import './LightInterferenceLab.css';

const LightInterferenceLab = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const patternRef = useRef(null);
  const dataCollectorRef = useRef(null);
  const animationRef = useRef(null);

  // Trạng thái thí nghiệm
  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0);
  const [showTheory, setShowTheory] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Tham số thí nghiệm
  const [wavelength, setWavelength] = useState(600); // Bước sóng (nm) - 400-700nm
  const [slitDistance, setSlitDistance] = useState(0.5); // Khoảng cách 2 khe a (mm)
  const [screenDistance, setScreenDistance] = useState(1.5); // Khoảng cách đến màn D (m)

  // Kết quả tính toán - tính giá trị ban đầu: i = λD/a = 600e-9 * 1.5 / 0.5e-3 = 1.8mm
  const [fringeSpacing, setFringeSpacing] = useState(1.8); // Khoảng vân i (mm)

  // Dữ liệu thu thập
  const [collectedData, setCollectedData] = useState([]);

  // Animation
  const [time, setTime] = useState(0);

  // Khởi tạo DataCollector
  useEffect(() => {
    dataCollectorRef.current = new ExperimentDataCollector('Giao thoa ánh sáng', [
      { name: 'trial', label: 'Lần đo', type: 'number' },
      { name: 'wavelength', label: 'λ (nm)', type: 'number', unit: 'nm' },
      { name: 'a', label: 'a (mm)', type: 'number', unit: 'mm' },
      { name: 'D', label: 'D (m)', type: 'number', unit: 'm' },
      { name: 'i', label: 'i (mm)', type: 'number', unit: 'mm' },
      { name: 'lambda_calc', label: 'λ tính (nm)', type: 'number', unit: 'nm' }
    ]);
  }, []);

  // Hướng dẫn
  const guideSteps = [
    {
      title: 'Thí nghiệm Giao thoa ánh sáng',
      content: 'Đây là thí nghiệm Young về giao thoa ánh sáng qua khe đôi. Bạn sẽ quan sát vân giao thoa và đo bước sóng ánh sáng.'
    },
    {
      title: 'Bước 1: Chọn bước sóng',
      content: 'Điều chỉnh bước sóng λ của nguồn sáng đơn sắc (400-700nm). Mỗi màu sẽ cho vân giao thoa khác nhau.'
    },
    {
      title: 'Bước 2: Điều chỉnh khe',
      content: 'Thay đổi khoảng cách a giữa hai khe. Khe càng hẹp, vân càng rộng.'
    },
    {
      title: 'Bước 3: Di chuyển màn',
      content: 'Điều chỉnh khoảng cách D từ khe đến màn. D càng lớn, vân càng rộng.'
    },
    {
      title: 'Bước 4: Đo khoảng vân',
      content: 'Quan sát hệ vân trên màn. Khoảng vân i = λD/a. Ghi số liệu để xác minh.'
    }
  ];

  // Tính khoảng vân
  useEffect(() => {
    // i = λD/a
    // λ (nm) = λ × 10^-9 m = λ × 10^-6 mm
    // a (mm), D (m) = D × 1000 mm
    // i = (λ × 10^-6) × (D × 1000) / a = λD/a × 10^-3 mm
    // Đổi về mm: i (mm) = λ(nm) × D(m) / a(mm) × 10^-3
    const lambda_m = wavelength * 1e-9; // nm -> m
    const a_m = slitDistance * 1e-3; // mm -> m
    const i_m = (lambda_m * screenDistance) / a_m; // m
    const i_mm = i_m * 1000; // m -> mm
    setFringeSpacing(i_mm);
  }, [wavelength, slitDistance, screenDistance]);

  // Animation loop
  useEffect(() => {
    if (isRunning) {
      const animate = () => {
        setTime(t => t + 0.05);
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

  // Màu từ bước sóng
  const wavelengthToColor = (wl) => {
    // Chuyển bước sóng (nm) sang màu RGB
    let r, g, b;
    
    if (wl >= 380 && wl < 440) {
      r = -(wl - 440) / (440 - 380);
      g = 0;
      b = 1;
    } else if (wl >= 440 && wl < 490) {
      r = 0;
      g = (wl - 440) / (490 - 440);
      b = 1;
    } else if (wl >= 490 && wl < 510) {
      r = 0;
      g = 1;
      b = -(wl - 510) / (510 - 490);
    } else if (wl >= 510 && wl < 580) {
      r = (wl - 510) / (580 - 510);
      g = 1;
      b = 0;
    } else if (wl >= 580 && wl < 645) {
      r = 1;
      g = -(wl - 645) / (645 - 580);
      b = 0;
    } else if (wl >= 645 && wl <= 700) {
      r = 1;
      g = 0;
      b = 0;
    } else {
      r = 0;
      g = 0;
      b = 0;
    }

    // Intensity correction at edges
    let factor;
    if (wl >= 380 && wl < 420) {
      factor = 0.3 + 0.7 * (wl - 380) / (420 - 380);
    } else if (wl >= 420 && wl <= 700) {
      factor = 1;
    } else if (wl > 700 && wl <= 780) {
      factor = 0.3 + 0.7 * (780 - wl) / (780 - 700);
    } else {
      factor = 0;
    }

    return {
      r: Math.round(255 * r * factor),
      g: Math.round(255 * g * factor),
      b: Math.round(255 * b * factor)
    };
  };

  const getColorString = (wl, alpha = 1) => {
    const { r, g, b } = wavelengthToColor(wl);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Vẽ setup thí nghiệm
  const drawSetup = useCallback(() => {
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

    const centerY = height / 2;
    const sourceX = 60;
    const slitX = 180;
    const screenX = width - 80;

    // Nguồn sáng
    const lightColor = getColorString(wavelength);
    const lightColorDim = getColorString(wavelength, 0.3);
    
    // Glow effect cho nguồn
    const gradient = ctx.createRadialGradient(sourceX, centerY, 0, sourceX, centerY, 40);
    gradient.addColorStop(0, lightColor);
    gradient.addColorStop(0.5, lightColorDim);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sourceX, centerY, 40, 0, Math.PI * 2);
    ctx.fill();

    // Nguồn sáng icon
    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.arc(sourceX, centerY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Nhãn
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Nguồn sáng', sourceX, centerY + 55);
    ctx.fillText(`λ = ${wavelength} nm`, sourceX, centerY + 70);

    // Tường chắn có 2 khe
    ctx.fillStyle = '#374151';
    ctx.fillRect(slitX - 5, 0, 10, height);

    // 2 khe
    const slitHalfGap = 25; // Khoảng cách hiển thị giữa 2 khe (pixel)
    const slitHeight = 30;
    
    ctx.fillStyle = '#0f172a';
    // Khe 1 (trên)
    ctx.fillRect(slitX - 5, centerY - slitHalfGap - slitHeight/2, 10, slitHeight);
    // Khe 2 (dưới)
    ctx.fillRect(slitX - 5, centerY + slitHalfGap - slitHeight/2, 10, slitHeight);

    // Ánh sáng từ nguồn đến khe
    ctx.strokeStyle = lightColorDim;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(sourceX + 15, centerY);
    ctx.lineTo(slitX - 5, centerY);
    ctx.stroke();

    // Vẽ sóng từ 2 khe (mô phỏng giao thoa)
    if (isRunning) {
      ctx.save();
      ctx.globalAlpha = 0.4;
      
      // Số sóng
      const numWaves = 8;
      const waveSpacing = (screenX - slitX) / numWaves;
      
      for (let i = 0; i < numWaves; i++) {
        const phase = time + i * 0.5;
        const radius = waveSpacing * (i + 1);
        const alpha = Math.max(0, 0.5 - i * 0.05) * (0.5 + 0.5 * Math.sin(phase));
        
        ctx.strokeStyle = getColorString(wavelength, alpha);
        ctx.lineWidth = 2;
        
        // Sóng từ khe 1
        ctx.beginPath();
        ctx.arc(slitX, centerY - slitHalfGap, radius, -Math.PI/3, Math.PI/3);
        ctx.stroke();
        
        // Sóng từ khe 2
        ctx.beginPath();
        ctx.arc(slitX, centerY + slitHalfGap, radius, -Math.PI/3, Math.PI/3);
        ctx.stroke();
      }
      
      ctx.restore();
    }

    // Nhãn khe
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Khe đôi', slitX, 25);
    ctx.fillText(`a = ${slitDistance} mm`, slitX, 40);

    // Màn quan sát
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(screenX - 3, 20, 6, height - 40);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(screenX - 3, 20, 6, height - 40);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Màn', screenX, 15);
    ctx.fillText(`D = ${screenDistance} m`, screenX, height - 5);

    // Khoảng cách D
    ctx.strokeStyle = '#6b7280';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(slitX + 20, height - 30);
    ctx.lineTo(screenX - 20, height - 30);
    ctx.stroke();
    ctx.setLineDash([]);

    // Mũi tên
    ctx.fillStyle = '#6b7280';
    ctx.beginPath();
    ctx.moveTo(slitX + 20, height - 30);
    ctx.lineTo(slitX + 30, height - 35);
    ctx.lineTo(slitX + 30, height - 25);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(screenX - 20, height - 30);
    ctx.lineTo(screenX - 30, height - 35);
    ctx.lineTo(screenX - 30, height - 25);
    ctx.fill();

    ctx.fillStyle = '#9ca3af';
    ctx.textAlign = 'center';
    ctx.fillText('D', (slitX + screenX) / 2, height - 35);

  }, [wavelength, slitDistance, screenDistance, isRunning, time]);

  // Vẽ hệ vân giao thoa
  const drawPattern = useCallback(() => {
    const canvas = patternRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Nền đen
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;

    // Tính khoảng vân theo pixel
    // fringeSpacing là mm thực, scale lên để hiển thị
    const pixelPerMm = 100; // 100 pixel = 1mm thực
    const i_pixel = fringeSpacing * pixelPerMm;

    // Kiểm tra giá trị hợp lệ trước khi vẽ
    if (!isFinite(i_pixel) || i_pixel <= 0) {
      // Hiển thị thông báo chờ
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Đang tính toán...', centerX, height / 2);
      return;
    }

    // Màu ánh sáng
    const { r, g, b } = wavelengthToColor(wavelength);

    // Vẽ các vân sáng và tối
    const numFringes = Math.min(Math.ceil(width / i_pixel) + 2, 100); // Giới hạn số vân
    
    for (let n = -numFringes; n <= numFringes; n++) {
      const x = centerX + n * i_pixel;
      
      if (x < -50 || x > width + 50) continue;

      // Vân sáng tại x = n × i
      // Cường độ giảm dần theo khoảng cách từ tâm
      const distanceFromCenter = Math.abs(n);
      const intensity = Math.max(0, 1 - distanceFromCenter * 0.08);
      
      // Vẽ vân sáng với gaussian profile
      const fringeWidth = i_pixel * 0.4; // Độ rộng vân sáng
      
      const gradient = ctx.createLinearGradient(x - fringeWidth, 0, x + fringeWidth, 0);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.3, `rgba(${r},${g},${b},${intensity * 0.3})`);
      gradient.addColorStop(0.5, `rgba(${r},${g},${b},${intensity})`);
      gradient.addColorStop(0.7, `rgba(${r},${g},${b},${intensity * 0.3})`);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(x - fringeWidth, 0, fringeWidth * 2, height);
    }

    // Đánh dấu vân trung tâm
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, height - 15);
    ctx.lineTo(centerX, height - 5);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('0', centerX, height - 2);

    // Đánh dấu khoảng vân
    if (i_pixel > 20) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(centerX, height - 25);
      ctx.lineTo(centerX + i_pixel, height - 25);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.textAlign = 'center';
      ctx.fillText(`i=${PhysicsUtils.round(fringeSpacing, 3)}mm`, centerX + i_pixel/2, height - 30);
    }

  }, [wavelength, fringeSpacing]);

  // Vẽ lại
  useEffect(() => {
    drawSetup();
    drawPattern();
  }, [drawSetup, drawPattern]);

  // Bật/tắt
  const toggleExperiment = () => {
    setIsRunning(!isRunning);
  };

  // Reset
  const resetExperiment = () => {
    setIsRunning(false);
    setWavelength(600);
    setSlitDistance(0.5);
    setScreenDistance(1.5);
    setTime(0);
  };

  // Ghi số liệu
  const recordData = () => {
    const record = {
      trial: collectedData.length + 1,
      wavelength: wavelength,
      a: slitDistance,
      D: screenDistance,
      i: PhysicsUtils.round(fringeSpacing, 4),
      lambda_calc: PhysicsUtils.round((fringeSpacing * slitDistance) / (screenDistance * 1000), 0) // Tính ngược λ
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

  // Tên màu từ bước sóng
  const getColorName = (wl) => {
    if (wl < 450) return 'Tím';
    if (wl < 495) return 'Lam';
    if (wl < 570) return 'Lục';
    if (wl < 590) return 'Vàng';
    if (wl < 620) return 'Cam';
    return 'Đỏ';
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
              <h1 className="text-xl font-bold">🌈 Thí nghiệm: Thí nghiệm Giao thoa ánh sáng Khe Y-ăng</h1>
              <p className="text-gray-400 text-sm">Khe Young - Đo bước sóng ánh sáng</p>
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
        {/* Main Area */}
        <div className="flex-1 space-y-4">
          {/* Setup view */}
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="w-full"
                style={{ height: '280px' }}
              />

              {/* Controls overlay */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button
                  onClick={toggleExperiment}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg ${
                    isRunning 
                      ? 'bg-red-600 hover:bg-red-500' 
                      : 'bg-green-600 hover:bg-green-500'
                  }`}
                >
                  <Lightbulb size={18} />
                  {isRunning ? 'Tắt nguồn' : 'Bật nguồn'}
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
            </div>

            {/* Parameters */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Wavelength */}
                <div>
                  <label className="flex items-center justify-between text-sm text-gray-300 mb-2">
                    <span>Bước sóng λ (nm)</span>
                    <span 
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: getColorString(wavelength, 0.3), color: getColorString(wavelength) }}
                    >
                      {getColorName(wavelength)}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="400"
                    max="700"
                    step="10"
                    value={wavelength}
                    onChange={(e) => setWavelength(parseInt(e.target.value))}
                    className="w-full wavelength-slider"
                    style={{
                      '--track-color': `linear-gradient(to right, 
                        violet 0%, blue 20%, cyan 35%, green 50%, 
                        yellow 65%, orange 80%, red 100%)`
                    }}
                  />
                  <div className="text-center text-lg font-mono" style={{ color: getColorString(wavelength) }}>
                    {wavelength} nm
                  </div>
                </div>

                {/* Slit distance */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Khoảng cách khe a (mm)</label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={slitDistance}
                    onChange={(e) => setSlitDistance(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="text-center text-lg font-mono text-cyan-400">{slitDistance} mm</div>
                </div>

                {/* Screen distance */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Khoảng cách màn D (m)</label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={screenDistance}
                    onChange={(e) => setScreenDistance(parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="text-center text-lg font-mono text-yellow-400">{screenDistance} m</div>
                </div>
              </div>
            </div>
          </div>

          {/* Fringe pattern */}
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            <div className="px-4 py-2 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <Eye size={18} className="text-purple-400" />
                Hệ vân trên màn
              </h3>
              <span className="text-sm text-gray-400">
                Khoảng vân: <span className="text-green-400 font-mono">{PhysicsUtils.round(fringeSpacing, 4)} mm</span>
              </span>
            </div>
            <canvas
              ref={patternRef}
              className="w-full"
              style={{ height: '120px' }}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:w-96 space-y-4">
          {/* Results */}
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-4 border border-purple-700/50">
            <h3 className="text-lg font-bold text-white mb-3">📊 Kết quả</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-mono" style={{ color: getColorString(wavelength) }}>
                  {wavelength}
                </div>
                <div className="text-xs text-gray-400">λ (nm)</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-mono text-green-400">
                  {PhysicsUtils.round(fringeSpacing, 4)}
                </div>
                <div className="text-xs text-gray-400">i (mm)</div>
              </div>
            </div>

            {/* Formula */}
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-sm text-gray-400 mb-1">Công thức:</p>
              <p className="text-lg font-mono text-white">i = λD/a</p>
              <p className="text-sm font-mono text-gray-300 mt-2">
                i = {wavelength}×10⁻⁹ × {screenDistance} / ({slitDistance}×10⁻³)
              </p>
              <p className="text-sm font-mono text-green-400">
                i = {PhysicsUtils.round(fringeSpacing, 4)} mm
              </p>
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            columns={[
              { name: 'trial', label: '#', type: 'number' },
              { name: 'wavelength', label: 'λ', type: 'number' },
              { name: 'i', label: 'i', type: 'number', precision: 3 },
              { name: 'lambda_calc', label: 'λ tính', type: 'number' }
            ]}
            data={collectedData}
            onClearAll={clearData}
            onExport={() => dataCollectorRef.current?.downloadCSV()}
            onDeleteRecord={(id) => {
              setCollectedData(prev => prev.filter(d => d.trial !== id));
            }}
            maxHeight={120}
          />

          {/* Formula */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">📐 Công thức giao thoa</h3>
            <div className="bg-gray-900 rounded-lg p-3 space-y-3 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Khoảng vân:</p>
                <p className="text-lg font-mono text-cyan-300">i = λD/a</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Vị trí vân sáng bậc k:</p>
                <p className="font-mono text-green-300">xₖ = k.i = kλD/a</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Vị trí vân tối bậc k:</p>
                <p className="font-mono text-red-300">x'ₖ = (k+0.5)i</p>
              </div>
              <div className="text-xs text-gray-500">
                • λ: bước sóng (m) <br/>
                • D: khoảng cách khe - màn (m) <br/>
                • a: khoảng cách 2 khe (m)
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
              <div className="text-4xl mb-3">🌈</div>
              <h2 className="text-xl font-bold">{guideSteps[guideStep].title}</h2>
            </div>

            <p className="text-gray-300 text-center mb-6">
              {guideSteps[guideStep].content}
            </p>

            <div className="flex justify-center gap-2 mb-6">
              {guideSteps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === guideStep ? 'bg-purple-500' : 'bg-gray-600'}`}
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg"
                >
                  Bắt đầu
                </button>
              ) : (
                <button
                  onClick={() => setGuideStep(guideStep + 1)}
                  className="flex items-center gap-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg"
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
              <h2 className="text-xl font-bold">📚 Giao thoa ánh sáng</h2>
              <button onClick={() => setShowTheory(false)} className="p-2 hover:bg-gray-700 rounded-lg">✕</button>
            </div>

            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Thí nghiệm Young</h3>
                <p className="text-sm">
                  Ánh sáng đơn sắc chiếu qua hai khe hẹp song song cách nhau khoảng cách a.
                  Trên màn quan sát ở khoảng cách D xuất hiện hệ vân giao thoa: các vân sáng
                  và vân tối xen kẽ nhau.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Điều kiện giao thoa</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Hai nguồn sáng kết hợp (cùng tần số, hiệu pha không đổi)</li>
                  <li>Nguồn sáng đơn sắc (một bước sóng)</li>
                  <li>Khoảng cách a nhỏ so với D</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Công thức</h3>
                <div className="bg-gray-900 p-4 rounded-lg space-y-2">
                  <p className="font-mono">Khoảng vân: <span className="text-cyan-400">i = λD/a</span></p>
                  <p className="font-mono">Vân sáng: <span className="text-green-400">xₖ = k.i</span> (k = 0, ±1, ±2, ...)</p>
                  <p className="font-mono">Vân tối: <span className="text-red-400">x'ₖ = (k + 0.5).i</span></p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">4. Ứng dụng</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Đo bước sóng ánh sáng: λ = ia/D</li>
                  <li>Kiểm tra tính đơn sắc của nguồn sáng</li>
                  <li>Ứng dụng trong quang phổ học</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">5. Bước sóng các màu</h3>
                <div className="grid grid-cols-6 gap-2 text-center text-xs">
                  <div className="p-2 rounded" style={{ backgroundColor: 'rgba(128, 0, 128, 0.3)' }}>
                    <div className="font-medium">Tím</div>
                    <div>380-450</div>
                  </div>
                  <div className="p-2 rounded" style={{ backgroundColor: 'rgba(0, 0, 255, 0.3)' }}>
                    <div className="font-medium">Lam</div>
                    <div>450-495</div>
                  </div>
                  <div className="p-2 rounded" style={{ backgroundColor: 'rgba(0, 255, 0, 0.3)' }}>
                    <div className="font-medium">Lục</div>
                    <div>495-570</div>
                  </div>
                  <div className="p-2 rounded" style={{ backgroundColor: 'rgba(255, 255, 0, 0.3)' }}>
                    <div className="font-medium">Vàng</div>
                    <div>570-590</div>
                  </div>
                  <div className="p-2 rounded" style={{ backgroundColor: 'rgba(255, 165, 0, 0.3)' }}>
                    <div className="font-medium">Cam</div>
                    <div>590-620</div>
                  </div>
                  <div className="p-2 rounded" style={{ backgroundColor: 'rgba(255, 0, 0, 0.3)' }}>
                    <div className="font-medium">Đỏ</div>
                    <div>620-700</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Đơn vị: nm (nanomet)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LightInterferenceLab;


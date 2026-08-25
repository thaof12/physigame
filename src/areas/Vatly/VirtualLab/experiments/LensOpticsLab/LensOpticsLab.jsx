/**
 * LensOpticsLab.jsx - Thí nghiệm Khảo sát thấu kính
 * 
 * Mục tiêu:
 * - Khảo sát sự tạo ảnh qua thấu kính hội tụ và phân kỳ
 * - Xác minh công thức thấu kính: 1/f = 1/d + 1/d'
 * - Tính độ phóng đại k = -d'/d
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RotateCcw, 
  Save,
  Download,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Eye,
  Plus,
  Minus,
  SwitchCamera
} from 'lucide-react';
import { LensOptics, PhysicsUtils } from '../../core/PhysicsEngine';
import { ExperimentDataCollector } from '../../core/DataCollector';
import DataTable from '../../charts/DataTable';
import './LensOpticsLab.css';

const LensOpticsLab = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const dataCollectorRef = useRef(null);

  // Trạng thái thí nghiệm
  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0);
  const [showTheory, setShowTheory] = useState(false);

  // Tham số quang học
  const [lensType, setLensType] = useState('converging'); // converging | diverging
  const [focalLength, setFocalLength] = useState(100); // Tiêu cự (mm) - hiển thị
  const [objectDistance, setObjectDistance] = useState(200); // Khoảng cách vật d (mm)
  const [objectHeight, setObjectHeight] = useState(40); // Chiều cao vật (mm)

  // Kết quả tính toán
  const [imageDistance, setImageDistance] = useState(0); // d' (mm)
  const [imageHeight, setImageHeight] = useState(0); // h' (mm)
  const [magnification, setMagnification] = useState(0); // k
  const [imageType, setImageType] = useState(''); // Loại ảnh

  // Dữ liệu thu thập
  const [collectedData, setCollectedData] = useState([]);

  // Khởi tạo DataCollector
  useEffect(() => {
    dataCollectorRef.current = new ExperimentDataCollector('Khảo sát thấu kính', [
      { name: 'trial', label: 'Lần đo', type: 'number' },
      { name: 'lensType', label: 'Loại TK', type: 'string' },
      { name: 'f', label: 'f (mm)', type: 'number', unit: 'mm' },
      { name: 'd', label: 'd (mm)', type: 'number', unit: 'mm' },
      { name: 'dPrime', label: "d' (mm)", type: 'number', unit: 'mm' },
      { name: 'k', label: 'k', type: 'number' },
      { name: 'imageType', label: 'Loại ảnh', type: 'string' }
    ]);
  }, []);

  // Hướng dẫn
  const guideSteps = [
    {
      title: 'Thí nghiệm Thấu kính',
      content: 'Trong thí nghiệm này, bạn sẽ khảo sát sự tạo ảnh qua thấu kính hội tụ và phân kỳ.'
    },
    {
      title: 'Bước 1: Chọn loại thấu kính',
      content: 'Chọn thấu kính hội tụ (f > 0) hoặc phân kỳ (f < 0). Điều chỉnh tiêu cự f.'
    },
    {
      title: 'Bước 2: Đặt vật',
      content: 'Di chuyển vật (mũi tên đỏ) để thay đổi khoảng cách d. Quan sát ảnh được tạo thành.'
    },
    {
      title: 'Bước 3: Phân tích',
      content: 'Xác định vị trí ảnh d\', độ phóng đại k, và tính chất ảnh (thật/ảo, cùng chiều/ngược chiều).'
    },
    {
      title: 'Bước 4: Thu thập số liệu',
      content: 'Ghi lại các cặp giá trị (d, d\') để xác minh công thức thấu kính.'
    }
  ];

  // Tính toán ảnh
  useEffect(() => {
    const f = lensType === 'converging' ? focalLength : -focalLength;
    const result = LensOptics.calculateImage(objectDistance, f, objectHeight);
    
    setImageDistance(result.imageDistance);
    setImageHeight(result.imageHeight);
    setMagnification(result.magnification);
    setImageType(result.imageType);
  }, [lensType, focalLength, objectDistance, objectHeight]);

  // Vẽ hệ quang học
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
    const scale = 0.8; // Scale để vẽ (1mm = 0.8px)

    // Trục chính
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Vẽ thấu kính
    const lensHeight = 150;
    ctx.strokeStyle = lensType === 'converging' ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 3;
    
    if (lensType === 'converging') {
      // Thấu kính hội tụ (rìa mỏng, giữa dày)
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - lensHeight);
      ctx.quadraticCurveTo(centerX + 15, centerY, centerX, centerY + lensHeight);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - lensHeight);
      ctx.quadraticCurveTo(centerX - 15, centerY, centerX, centerY + lensHeight);
      ctx.stroke();
      
      // Mũi tên đầu thấu kính
      ctx.beginPath();
      ctx.moveTo(centerX - 10, centerY - lensHeight + 10);
      ctx.lineTo(centerX, centerY - lensHeight);
      ctx.lineTo(centerX + 10, centerY - lensHeight + 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX - 10, centerY + lensHeight - 10);
      ctx.lineTo(centerX, centerY + lensHeight);
      ctx.lineTo(centerX + 10, centerY + lensHeight - 10);
      ctx.stroke();
    } else {
      // Thấu kính phân kỳ (rìa dày, giữa mỏng)
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - lensHeight);
      ctx.quadraticCurveTo(centerX - 15, centerY, centerX, centerY + lensHeight);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - lensHeight);
      ctx.quadraticCurveTo(centerX + 15, centerY, centerX, centerY + lensHeight);
      ctx.stroke();
      
      // Mũi tên đầu thấu kính (hướng ngược)
      ctx.beginPath();
      ctx.moveTo(centerX - 10, centerY - lensHeight - 10);
      ctx.lineTo(centerX, centerY - lensHeight);
      ctx.lineTo(centerX + 10, centerY - lensHeight - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX - 10, centerY + lensHeight + 10);
      ctx.lineTo(centerX, centerY + lensHeight);
      ctx.lineTo(centerX + 10, centerY + lensHeight + 10);
      ctx.stroke();
    }

    // Đánh dấu tiêu điểm F và F'
    const fPos = focalLength * scale;
    
    // F (tiêu điểm vật)
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(centerX - fPos, centerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('F', centerX - fPos - 5, centerY + 20);
    
    // F' (tiêu điểm ảnh)
    ctx.beginPath();
    ctx.arc(centerX + fPos, centerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText("F'", centerX + fPos - 5, centerY + 20);

    // Đánh dấu 2F và 2F'
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px sans-serif';
    ctx.beginPath();
    ctx.arc(centerX - 2 * fPos, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('2F', centerX - 2 * fPos - 8, centerY + 18);
    ctx.beginPath();
    ctx.arc(centerX + 2 * fPos, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText("2F'", centerX + 2 * fPos - 8, centerY + 18);

    // Vẽ vật (mũi tên đỏ)
    const objX = centerX - objectDistance * scale;
    const objH = objectHeight * scale;
    
    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(objX, centerY);
    ctx.lineTo(objX, centerY - objH);
    ctx.stroke();
    
    // Mũi tên vật
    ctx.beginPath();
    ctx.moveTo(objX - 8, centerY - objH + 12);
    ctx.lineTo(objX, centerY - objH);
    ctx.lineTo(objX + 8, centerY - objH + 12);
    ctx.fill();

    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Vật', objX - 15, centerY + 25);

    // Vẽ ảnh nếu có
    if (imageDistance !== 0 && isFinite(imageDistance)) {
      const imgX = centerX + imageDistance * scale;
      const imgH = imageHeight * scale;
      
      // Ảnh thật (nét liền) hoặc ảo (nét đứt)
      const isVirtual = imageDistance < 0;
      
      if (isVirtual) {
        ctx.setLineDash([5, 5]);
      }
      
      ctx.strokeStyle = '#3b82f6';
      ctx.fillStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(imgX, centerY);
      ctx.lineTo(imgX, centerY - imgH);
      ctx.stroke();
      
      // Mũi tên ảnh
      ctx.beginPath();
      if (imgH > 0) {
        ctx.moveTo(imgX - 8, centerY - imgH + 12);
        ctx.lineTo(imgX, centerY - imgH);
        ctx.lineTo(imgX + 8, centerY - imgH + 12);
      } else {
        ctx.moveTo(imgX - 8, centerY - imgH - 12);
        ctx.lineTo(imgX, centerY - imgH);
        ctx.lineTo(imgX + 8, centerY - imgH - 12);
      }
      ctx.fill();
      
      ctx.setLineDash([]);
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Ảnh', imgX - 15, centerY + 25);
    }

    // Vẽ tia sáng
    ctx.lineWidth = 1.5;
    
    // Tia 1: Song song trục chính -> qua F'
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
    ctx.beginPath();
    ctx.moveTo(objX, centerY - objH);
    ctx.lineTo(centerX, centerY - objH);
    ctx.stroke();
    
    if (lensType === 'converging') {
      // Tia khúc xạ qua F'
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - objH);
      ctx.lineTo(width, centerY + (width - centerX) * objH / fPos / scale);
      ctx.stroke();
    } else {
      // Tia khúc xạ có đường kéo dài qua F (phía vật)
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - objH);
      ctx.lineTo(centerX - fPos, centerY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - objH);
      ctx.lineTo(width, centerY - objH - (width - centerX) * objH / fPos / scale);
      ctx.stroke();
    }
    
    // Tia 2: Qua quang tâm O (đi thẳng)
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.7)';
    ctx.beginPath();
    ctx.moveTo(objX, centerY - objH);
    const slope = objH / objectDistance;
    ctx.lineTo(width, centerY - objH + (width - objX) * slope);
    ctx.stroke();
    
    // Tia 3: Qua F -> song song trục chính sau thấu kính
    if (objectDistance > focalLength) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.beginPath();
      ctx.moveTo(objX, centerY - objH);
      
      if (lensType === 'converging') {
        // Đến thấu kính
        const yAtLens = centerY - objH + (centerX - objX) * (objH / (objectDistance - focalLength)) * (focalLength / objectDistance);
        ctx.lineTo(centerX, yAtLens);
        ctx.stroke();
        
        // Song song sau thấu kính
        ctx.beginPath();
        ctx.moveTo(centerX, yAtLens);
        ctx.lineTo(width, yAtLens);
        ctx.stroke();
      }
    }

    // Nhãn thông tin
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`d = ${objectDistance} mm`, 20, 30);
    ctx.fillText(`f = ${lensType === 'converging' ? '+' : '-'}${focalLength} mm`, 20, 50);
    
    if (imageDistance !== 0 && isFinite(imageDistance)) {
      ctx.fillText(`d' = ${PhysicsUtils.round(imageDistance, 1)} mm`, 20, 70);
      ctx.fillText(`k = ${PhysicsUtils.round(magnification, 2)}`, 20, 90);
    }

  }, [lensType, focalLength, objectDistance, objectHeight, imageDistance, imageHeight, magnification]);

  // Vẽ lại khi thay đổi
  useEffect(() => {
    draw();
  }, [draw]);

  // Reset
  const resetExperiment = () => {
    setLensType('converging');
    setFocalLength(100);
    setObjectDistance(200);
    setObjectHeight(40);
  };

  // Ghi số liệu
  const recordData = () => {
    const record = {
      trial: collectedData.length + 1,
      lensType: lensType === 'converging' ? 'HT' : 'PK',
      f: lensType === 'converging' ? focalLength : -focalLength,
      d: objectDistance,
      dPrime: PhysicsUtils.round(imageDistance, 1),
      k: PhysicsUtils.round(magnification, 2),
      imageType: imageType
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

  // Xác minh công thức thấu kính
  const verifyFormula = () => {
    const f = lensType === 'converging' ? focalLength : -focalLength;
    const leftSide = 1 / f;
    const rightSide = 1 / objectDistance + 1 / imageDistance;
    return {
      leftSide: PhysicsUtils.round(leftSide * 1000, 4), // x1000 để dễ đọc
      rightSide: PhysicsUtils.round(rightSide * 1000, 4),
      match: Math.abs(leftSide - rightSide) < 0.0001
    };
  };

  const formula = imageDistance !== 0 ? verifyFormula() : null;

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
              <h1 className="text-xl font-bold">🔍 Thí nghiệm: Sự truyền ánh sáng & Tiêu cự Thấu kính</h1>
              <p className="text-gray-400 text-sm">Sự tạo ảnh qua thấu kính</p>
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
                className="w-full lens-optics-canvas"
                style={{ height: '400px' }}
              />

              {/* Controls overlay */}
              <div className="absolute bottom-4 left-4 flex gap-2">
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
                  <div className="w-4 h-1 bg-blue-500"></div>
                  <span className="text-gray-300">Tia song song</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-1 bg-green-500"></div>
                  <span className="text-gray-300">Tia qua tâm O</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-red-500"></div>
                  <span className="text-gray-300">Tia qua tiêu điểm</span>
                </div>
              </div>
            </div>

            {/* Parameters */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Điều chỉnh thông số</h3>
              
              {/* Lens Type Toggle */}
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">Loại thấu kính</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLensType('converging')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      lensType === 'converging'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    🔍 Hội tụ (f &gt; 0)
                  </button>
                  <button
                    onClick={() => setLensType('diverging')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      lensType === 'diverging'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    🔎 Phân kỳ (f &lt; 0)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Focal Length */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Tiêu cự |f| (mm)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFocalLength(f => Math.max(50, f - 10))}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="10"
                      value={focalLength}
                      onChange={(e) => setFocalLength(parseInt(e.target.value))}
                      className="flex-1 accent-blue-500"
                    />
                    <button
                      onClick={() => setFocalLength(f => Math.min(200, f + 10))}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-center text-lg font-mono text-yellow-400 mt-1">
                    {lensType === 'converging' ? '+' : '-'}{focalLength} mm
                  </div>
                </div>

                {/* Object Distance */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Khoảng cách vật d (mm)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setObjectDistance(d => Math.max(50, d - 20))}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="range"
                      min="50"
                      max="400"
                      step="10"
                      value={objectDistance}
                      onChange={(e) => setObjectDistance(parseInt(e.target.value))}
                      className="flex-1 accent-red-500"
                    />
                    <button
                      onClick={() => setObjectDistance(d => Math.min(400, d + 20))}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-center text-lg font-mono text-red-400 mt-1">
                    {objectDistance} mm
                  </div>
                </div>

                {/* Object Height */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Chiều cao vật h (mm)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setObjectHeight(h => Math.max(20, h - 10))}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="range"
                      min="20"
                      max="80"
                      step="5"
                      value={objectHeight}
                      onChange={(e) => setObjectHeight(parseInt(e.target.value))}
                      className="flex-1 accent-purple-500"
                    />
                    <button
                      onClick={() => setObjectHeight(h => Math.min(80, h + 10))}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-center text-lg font-mono text-purple-400 mt-1">
                    {objectHeight} mm
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:w-96 space-y-4">
          {/* Results */}
          <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-xl p-4 border border-blue-700/50">
            <h3 className="text-lg font-bold text-white mb-3">📐 Kết quả</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-mono text-blue-400">
                  {isFinite(imageDistance) ? PhysicsUtils.round(imageDistance, 1) : '∞'}
                </div>
                <div className="text-xs text-gray-400">d' (mm)</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-mono text-green-400">
                  {PhysicsUtils.round(magnification, 2)}
                </div>
                <div className="text-xs text-gray-400">k (độ phóng đại)</div>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-3 text-center">
              <div className={`text-lg font-medium ${
                imageType.includes('thật') ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {imageType || 'Không có ảnh'}
              </div>
              <div className="text-xs text-gray-400">Tính chất ảnh</div>
            </div>
          </div>

          {/* Formula Verification */}
          {formula && (
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-4 border border-purple-700/50">
              <h3 className="text-lg font-bold text-white mb-3">🔬 Xác minh công thức</h3>
              <div className="bg-black/30 rounded-lg p-3 text-center space-y-2">
                <p className="text-lg font-mono text-purple-400">1/f = 1/d + 1/d'</p>
                <div className="text-sm">
                  <span className="text-gray-400">1/f × 1000 = </span>
                  <span className="text-yellow-400 font-mono">{formula.leftSide}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">(1/d + 1/d') × 1000 = </span>
                  <span className="text-blue-400 font-mono">{formula.rightSide}</span>
                </div>
                <div className={`text-lg font-bold ${formula.match ? 'text-green-400' : 'text-red-400'}`}>
                  {formula.match ? '✓ Đúng!' : '✗ Sai lệch'}
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          <DataTable
            columns={[
              { name: 'trial', label: '#', type: 'number' },
              { name: 'lensType', label: 'TK', type: 'string' },
              { name: 'f', label: 'f', type: 'number' },
              { name: 'd', label: 'd', type: 'number' },
              { name: 'dPrime', label: "d'", type: 'number' },
              { name: 'k', label: 'k', type: 'number' }
            ]}
            data={collectedData}
            onClearAll={clearData}
            onExport={exportData}
            onDeleteRecord={(id) => {
              setCollectedData(prev => prev.filter(d => d.trial !== id));
            }}
            maxHeight={150}
          />

          {/* Quick Reference */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">📐 Công thức thấu kính</h3>
            <div className="bg-gray-900 rounded-lg p-3 space-y-2 text-center">
              <p className="text-lg font-mono text-blue-400">1/f = 1/d + 1/d'</p>
              <p className="text-lg font-mono text-green-400">k = -d'/d = h'/h</p>
            </div>
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              <p>• f &gt; 0: Thấu kính hội tụ</p>
              <p>• f &lt; 0: Thấu kính phân kỳ</p>
              <p>• d' &gt; 0: Ảnh thật | d' &lt; 0: Ảnh ảo</p>
              <p>• |k| &gt; 1: Ảnh lớn hơn vật</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full p-6 border border-gray-700">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔍</div>
              <h2 className="text-xl font-bold">{guideSteps[guideStep].title}</h2>
            </div>

            <p className="text-gray-300 text-center mb-6">
              {guideSteps[guideStep].content}
            </p>

            <div className="flex justify-center gap-2 mb-6">
              {guideSteps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === guideStep ? 'bg-blue-500' : 'bg-gray-600'}`}
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
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
              <h2 className="text-xl font-bold">📚 Thấu kính và sự tạo ảnh</h2>
              <button onClick={() => setShowTheory(false)} className="p-2 hover:bg-gray-700 rounded-lg">✕</button>
            </div>

            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Thấu kính hội tụ (f &gt; 0)</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Rìa mỏng, giữa dày</li>
                  <li>Chùm tia song song hội tụ tại tiêu điểm F'</li>
                  <li>Có thể tạo ảnh thật hoặc ảo tùy vị trí vật</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Thấu kính phân kỳ (f &lt; 0)</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Rìa dày, giữa mỏng</li>
                  <li>Chùm tia song song phân kỳ, kéo dài hội tụ tại F</li>
                  <li>Luôn tạo ảnh ảo, cùng chiều, nhỏ hơn vật</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Công thức thấu kính</h3>
                <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <p className="text-xl font-mono text-yellow-400">1/f = 1/d + 1/d'</p>
                  <p className="text-lg font-mono text-green-400 mt-2">k = -d'/d = h'/h</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">4. Quy ước dấu</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>d &gt; 0: Vật thật (trước thấu kính)</li>
                  <li>d' &gt; 0: Ảnh thật (sau thấu kính)</li>
                  <li>d' &lt; 0: Ảnh ảo (trước thấu kính)</li>
                  <li>k &gt; 0: Ảnh cùng chiều vật</li>
                  <li>k &lt; 0: Ảnh ngược chiều vật</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LensOpticsLab;


/**
 * RealTimeChart.jsx - Biểu đồ thời gian thực
 * 
 * Vẽ đồ thị dữ liệu real-time sử dụng Canvas
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TrendingUp, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const RealTimeChart = ({
  data = [],
  xKey = 'x',
  yKey = 'y',
  xLabel = 'X',
  yLabel = 'Y',
  xUnit = '',
  yUnit = '',
  width = 400,
  height = 250,
  lineColor = '#3b82f6',
  pointColor = '#f59e0b',
  gridColor = '#374151',
  showPoints = true,
  showGrid = true,
  showLine = true,
  autoScale = true,
  xRange,
  yRange,
  title
}) => {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Tính toán range tự động
  const calculateRange = useCallback(() => {
    if (data.length === 0) {
      return {
        xMin: 0, xMax: 10,
        yMin: 0, yMax: 10
      };
    }

    const xValues = data.map(d => d[xKey]).filter(v => typeof v === 'number');
    const yValues = data.map(d => d[yKey]).filter(v => typeof v === 'number');

    let xMin = Math.min(...xValues);
    let xMax = Math.max(...xValues);
    let yMin = Math.min(...yValues);
    let yMax = Math.max(...yValues);

    // Thêm padding
    const xPadding = (xMax - xMin) * 0.1 || 1;
    const yPadding = (yMax - yMin) * 0.1 || 1;

    return {
      xMin: xRange?.min ?? (xMin - xPadding),
      xMax: xRange?.max ?? (xMax + xPadding),
      yMin: yRange?.min ?? (yMin - yPadding),
      yMax: yRange?.max ?? (yMax + yPadding)
    };
  }, [data, xKey, yKey, xRange, yRange]);

  // Vẽ biểu đồ
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);

    const padding = { top: 30, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const range = calculateRange();

    // Chuyển đổi tọa độ
    const toCanvasX = (x) => {
      return padding.left + ((x - range.xMin) / (range.xMax - range.xMin)) * chartWidth;
    };

    const toCanvasY = (y) => {
      return height - padding.bottom - ((y - range.yMin) / (range.yMax - range.yMin)) * chartHeight;
    };

    // Vẽ grid
    if (showGrid) {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;

      // Vertical lines
      const xStep = (range.xMax - range.xMin) / 5;
      for (let x = range.xMin; x <= range.xMax; x += xStep) {
        ctx.beginPath();
        ctx.moveTo(toCanvasX(x), padding.top);
        ctx.lineTo(toCanvasX(x), height - padding.bottom);
        ctx.stroke();
      }

      // Horizontal lines
      const yStep = (range.yMax - range.yMin) / 5;
      for (let y = range.yMin; y <= range.yMax; y += yStep) {
        ctx.beginPath();
        ctx.moveTo(padding.left, toCanvasY(y));
        ctx.lineTo(width - padding.right, toCanvasY(y));
        ctx.stroke();
      }
    }

    // Vẽ trục
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;

    // Trục X
    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Trục Y
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.stroke();

    // Labels trục
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';

    // X axis labels
    const xStep = (range.xMax - range.xMin) / 5;
    for (let x = range.xMin; x <= range.xMax; x += xStep) {
      ctx.fillText(x.toFixed(1), toCanvasX(x), height - padding.bottom + 15);
    }

    // X axis title
    ctx.fillStyle = '#d1d5db';
    ctx.fillText(`${xLabel}${xUnit ? ` (${xUnit})` : ''}`, width / 2, height - 5);

    // Y axis labels
    ctx.textAlign = 'right';
    const yStep = (range.yMax - range.yMin) / 5;
    for (let y = range.yMin; y <= range.yMax; y += yStep) {
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(y.toFixed(2), padding.left - 5, toCanvasY(y) + 3);
    }

    // Y axis title
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#d1d5db';
    ctx.textAlign = 'center';
    ctx.fillText(`${yLabel}${yUnit ? ` (${yUnit})` : ''}`, 0, 0);
    ctx.restore();

    // Vẽ đường nối
    if (showLine && data.length > 1) {
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const sortedData = [...data].sort((a, b) => a[xKey] - b[xKey]);
      
      sortedData.forEach((point, i) => {
        const x = toCanvasX(point[xKey]);
        const y = toCanvasY(point[yKey]);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    }

    // Vẽ điểm dữ liệu
    if (showPoints) {
      data.forEach((point) => {
        const x = toCanvasX(point[xKey]);
        const y = toCanvasY(point[yKey]);

        // Outer circle
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = pointColor;
        ctx.fill();

        // Inner circle
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      });
    }

    // Title
    if (title) {
      ctx.fillStyle = '#f3f4f6';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, width / 2, 18);
    }

  }, [data, xKey, yKey, xLabel, yLabel, xUnit, yUnit, width, height, 
      lineColor, pointColor, gridColor, showPoints, showGrid, showLine, 
      calculateRange, title]);

  // Effect để vẽ lại khi data thay đổi
  useEffect(() => {
    draw();
  }, [draw]);

  // Reset zoom và pan
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <h3 className="text-white text-sm font-medium flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-400" />
          Biểu đồ
          {data.length > 0 && (
            <span className="text-gray-400">({data.length} điểm)</span>
          )}
        </h3>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(z => Math.min(z * 1.2, 5))}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Phóng to"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z / 1.2, 0.5))}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Thu nhỏ"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="p-2">
        <canvas
          ref={canvasRef}
          style={{ width, height }}
          className="rounded"
        />
      </div>

      {/* Legend/Info */}
      {data.length === 0 && (
        <div className="px-4 pb-3 text-center text-gray-500 text-sm">
          Thực hiện thí nghiệm để xem dữ liệu
        </div>
      )}
    </div>
  );
};

export default RealTimeChart;

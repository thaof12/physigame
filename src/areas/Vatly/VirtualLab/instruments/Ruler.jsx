/**
 * Ruler.jsx - Thước đo ảo
 * 
 * Cho phép đo khoảng cách trong thí nghiệm
 */

import React, { useState, useRef, useCallback } from 'react';
import { Move } from 'lucide-react';

const Ruler = ({
  length = 100, // Độ dài thước (cm)
  unit = 'cm',
  minValue = 0,
  maxValue = 100,
  divisions = 10, // Số khoảng chia nhỏ mỗi cm
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  onMeasure,
  draggable = true,
  initialPosition = { x: 0, y: 0 }
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [measureStart, setMeasureStart] = useState(null);
  const [measureEnd, setMeasureEnd] = useState(null);
  const rulerRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Pixel per unit
  const pxPerUnit = 8; // 8px = 1cm
  const totalWidth = length * pxPerUnit;
  const totalHeight = 40;

  // Xử lý kéo thước
  const handleMouseDown = useCallback((e) => {
    if (!draggable) return;
    setIsDragging(true);
    const rect = rulerRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, [draggable]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Xử lý đo khoảng cách
  const handleRulerClick = useCallback((e) => {
    if (isDragging) return;
    
    const rect = rulerRef.current.getBoundingClientRect();
    const clickPos = orientation === 'horizontal' 
      ? e.clientX - rect.left 
      : e.clientY - rect.top;
    
    const value = (clickPos / pxPerUnit) + minValue;

    if (measureStart === null) {
      setMeasureStart(value);
    } else {
      setMeasureEnd(value);
      const distance = Math.abs(value - measureStart);
      if (onMeasure) {
        onMeasure(distance);
      }
    }
  }, [isDragging, orientation, pxPerUnit, minValue, measureStart, onMeasure]);

  // Reset đo
  const resetMeasure = useCallback(() => {
    setMeasureStart(null);
    setMeasureEnd(null);
  }, []);

  // Render vạch chia
  const renderTicks = () => {
    const ticks = [];
    const totalTicks = length * divisions;
    
    for (let i = 0; i <= totalTicks; i++) {
      const pos = (i / divisions) * pxPerUnit;
      const isMajor = i % divisions === 0;
      const isHalf = i % (divisions / 2) === 0;
      
      let tickHeight = 5;
      if (isMajor) tickHeight = 15;
      else if (isHalf) tickHeight = 10;

      ticks.push(
        <g key={i}>
          {orientation === 'horizontal' ? (
            <>
              <line
                x1={pos}
                y1={0}
                x2={pos}
                y2={tickHeight}
                stroke="#fff"
                strokeWidth={isMajor ? 1 : 0.5}
              />
              {isMajor && (
                <text
                  x={pos}
                  y={28}
                  fill="#fff"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {Math.round(i / divisions + minValue)}
                </text>
              )}
            </>
          ) : (
            <>
              <line
                x1={0}
                y1={pos}
                x2={tickHeight}
                y2={pos}
                stroke="#fff"
                strokeWidth={isMajor ? 1 : 0.5}
              />
              {isMajor && (
                <text
                  x={28}
                  y={pos + 3}
                  fill="#fff"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {Math.round(i / divisions + minValue)}
                </text>
              )}
            </>
          )}
        </g>
      );
    }
    
    return ticks;
  };

  // Render điểm đo
  const renderMeasurePoints = () => {
    if (measureStart === null) return null;

    const startPos = (measureStart - minValue) * pxPerUnit;
    const endPos = measureEnd !== null ? (measureEnd - minValue) * pxPerUnit : null;

    return (
      <>
        {/* Điểm bắt đầu */}
        <circle
          cx={orientation === 'horizontal' ? startPos : 20}
          cy={orientation === 'horizontal' ? 20 : startPos}
          r={4}
          fill="#f59e0b"
        />

        {/* Điểm kết thúc và đường nối */}
        {endPos !== null && (
          <>
            <circle
              cx={orientation === 'horizontal' ? endPos : 20}
              cy={orientation === 'horizontal' ? 20 : endPos}
              r={4}
              fill="#f59e0b"
            />
            <line
              x1={orientation === 'horizontal' ? startPos : 20}
              y1={orientation === 'horizontal' ? 20 : startPos}
              x2={orientation === 'horizontal' ? endPos : 20}
              y2={orientation === 'horizontal' ? 20 : endPos}
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="4"
            />
            {/* Hiển thị khoảng cách */}
            <text
              x={orientation === 'horizontal' ? (startPos + endPos) / 2 : 30}
              y={orientation === 'horizontal' ? 35 : (startPos + endPos) / 2}
              fill="#f59e0b"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
            >
              {Math.abs(measureEnd - measureStart).toFixed(1)} {unit}
            </text>
          </>
        )}
      </>
    );
  };

  const containerStyle = {
    position: draggable ? 'absolute' : 'relative',
    left: draggable ? position.x : 'auto',
    top: draggable ? position.y : 'auto',
    cursor: isDragging ? 'grabbing' : (draggable ? 'grab' : 'pointer'),
    userSelect: 'none'
  };

  return (
    <div
      ref={rulerRef}
      style={containerStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleRulerClick}
      onDoubleClick={resetMeasure}
      className="select-none"
    >
      <svg
        width={orientation === 'horizontal' ? totalWidth + 20 : totalHeight + 20}
        height={orientation === 'horizontal' ? totalHeight + 20 : totalWidth + 20}
        className="drop-shadow-lg"
      >
        {/* Nền thước */}
        <rect
          x={0}
          y={0}
          width={orientation === 'horizontal' ? totalWidth : totalHeight}
          height={orientation === 'horizontal' ? totalHeight : totalWidth}
          fill="#1e3a5f"
          rx={4}
        />
        
        {/* Vạch chia */}
        <g transform={orientation === 'horizontal' ? 'translate(0, 0)' : 'translate(0, 0)'}>
          {renderTicks()}
        </g>

        {/* Điểm đo */}
        {renderMeasurePoints()}

        {/* Icon kéo */}
        {draggable && (
          <g transform={`translate(${totalWidth - 15}, 3)`}>
            <Move size={12} color="#666" />
          </g>
        )}
      </svg>

      {/* Hướng dẫn */}
      <div className="text-xs text-gray-400 text-center mt-1">
        Click để đo • Double-click để reset
      </div>
    </div>
  );
};

export default Ruler;

/**
 * Stopwatch.jsx - Đồng hồ bấm giờ ảo
 * 
 * Dùng để đo thời gian trong các thí nghiệm
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';

const Stopwatch = ({ 
  onTimeRecord,
  autoStart = false,
  precision = 2,
  maxLaps = 10,
  size = 'medium',
  showLaps = true
}) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Kích thước theo size
  const sizeClasses = {
    small: 'w-40 text-sm',
    medium: 'w-56 text-base',
    large: 'w-72 text-lg'
  };

  // Format thời gian
  const formatTime = useCallback((ms) => {
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.floor((ms % 1000) / (1000 / Math.pow(10, precision)));
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(precision, '0')}`;
  }, [precision]);

  // Bắt đầu đếm
  const start = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - time;
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    }
  }, [isRunning, time]);

  // Dừng đếm
  const stop = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      clearInterval(intervalRef.current);
    }
  }, [isRunning]);

  // Reset
  const reset = useCallback(() => {
    stop();
    setTime(0);
    setLaps([]);
  }, [stop]);

  // Ghi lap
  const recordLap = useCallback(() => {
    if (isRunning && laps.length < maxLaps) {
      const newLap = {
        id: laps.length + 1,
        time: time,
        formatted: formatTime(time)
      };
      setLaps(prev => [...prev, newLap]);
      
      if (onTimeRecord) {
        onTimeRecord(time / 1000); // Trả về giây
      }
    }
  }, [isRunning, laps, maxLaps, time, formatTime, onTimeRecord]);

  // Auto start
  useEffect(() => {
    if (autoStart) {
      start();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className={`bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-700 ${sizeClasses[size]}`}>
      {/* Tiêu đề */}
      <div className="text-center text-gray-400 text-xs mb-2 uppercase tracking-wider">
        Đồng hồ bấm giờ
      </div>

      {/* Màn hình hiển thị */}
      <div className="bg-black rounded-lg p-3 mb-3 font-mono">
        <div className="text-green-400 text-3xl text-center font-bold tracking-wider">
          {formatTime(time)}
        </div>
      </div>

      {/* Nút điều khiển */}
      <div className="flex justify-center gap-2 mb-3">
        {!isRunning ? (
          <button
            onClick={start}
            className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white transition-colors"
          >
            <Play size={16} />
            <span>Bắt đầu</span>
          </button>
        ) : (
          <button
            onClick={stop}
            className="flex items-center gap-1 px-4 py-2 bg-yellow-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
          >
            <Pause size={16} />
            <span>Dừng</span>
          </button>
        )}

        <button
          onClick={recordLap}
          disabled={!isRunning}
          className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
        >
          <Flag size={16} />
        </button>

        <button
          onClick={reset}
          className="flex items-center gap-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white transition-colors"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Danh sách lap */}
      {showLaps && laps.length > 0 && (
        <div className="max-h-32 overflow-y-auto">
          <div className="text-xs text-gray-400 mb-1">Các lần ghi:</div>
          <div className="space-y-1">
            {laps.map((lap) => (
              <div 
                key={lap.id} 
                className="flex justify-between text-sm bg-gray-800 rounded px-2 py-1"
              >
                <span className="text-gray-400">Lần {lap.id}</span>
                <span className="text-green-400 font-mono">{lap.formatted}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stopwatch;


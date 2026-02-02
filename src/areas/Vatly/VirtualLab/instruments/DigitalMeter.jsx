/**
 * DigitalMeter.jsx - Đồng hồ đo số (Vôn kế / Ampe kế / Ôm kế)
 * 
 * Component hiển thị giá trị đo điện
 */

import React from 'react';
import { Zap, Activity, CircleDot } from 'lucide-react';

const DigitalMeter = ({
  type = 'voltmeter', // 'voltmeter' | 'ammeter' | 'ohmmeter'
  value = 0,
  unit,
  range = 'auto',
  precision = 2,
  label,
  size = 'medium',
  showIcon = true,
  animated = true
}) => {
  // Cấu hình theo loại đồng hồ
  const meterConfig = {
    voltmeter: {
      icon: Zap,
      label: 'Vôn kế',
      unit: 'V',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/30',
      borderColor: 'border-yellow-600'
    },
    ammeter: {
      icon: Activity,
      label: 'Ampe kế',
      unit: 'A',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/30',
      borderColor: 'border-blue-600'
    },
    ohmmeter: {
      icon: CircleDot,
      label: 'Ôm kế',
      unit: 'Ω',
      color: 'text-green-400',
      bgColor: 'bg-green-900/30',
      borderColor: 'border-green-600'
    }
  };

  const config = meterConfig[type];
  const Icon = config.icon;
  const displayUnit = unit || config.unit;
  const displayLabel = label || config.label;

  // Kích thước
  const sizeClasses = {
    small: { container: 'w-32 p-2', display: 'text-lg', label: 'text-xs' },
    medium: { container: 'w-44 p-3', display: 'text-2xl', label: 'text-sm' },
    large: { container: 'w-56 p-4', display: 'text-3xl', label: 'text-base' }
  };

  const sizeClass = sizeClasses[size];

  // Format giá trị với auto-range
  const formatValue = () => {
    if (range === 'auto') {
      if (Math.abs(value) >= 1000) {
        return { val: (value / 1000).toFixed(precision), prefix: 'k' };
      } else if (Math.abs(value) >= 1) {
        return { val: value.toFixed(precision), prefix: '' };
      } else if (Math.abs(value) >= 0.001) {
        return { val: (value * 1000).toFixed(precision), prefix: 'm' };
      } else if (Math.abs(value) >= 0.000001) {
        return { val: (value * 1000000).toFixed(precision), prefix: 'μ' };
      }
    }
    return { val: value.toFixed(precision), prefix: '' };
  };

  const formatted = formatValue();

  return (
    <div className={`
      ${sizeClass.container}
      ${config.bgColor}
      rounded-xl border-2 ${config.borderColor}
      shadow-lg backdrop-blur-sm
    `}>
      {/* Header với icon và label */}
      <div className="flex items-center justify-between mb-2">
        {showIcon && (
          <Icon className={`${config.color} ${size === 'small' ? 'w-4 h-4' : 'w-5 h-5'}`} />
        )}
        <span className={`${config.color} ${sizeClass.label} font-medium`}>
          {displayLabel}
        </span>
      </div>

      {/* Màn hình hiển thị số */}
      <div className="bg-black rounded-lg p-2 relative overflow-hidden">
        {/* Hiệu ứng LCD */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        
        {/* Giá trị */}
        <div className={`
          ${sizeClass.display} 
          font-mono font-bold text-center
          ${config.color}
          ${animated ? 'transition-all duration-200' : ''}
        `}>
          <span>{formatted.val}</span>
          <span className="text-sm ml-1 opacity-80">
            {formatted.prefix}{displayUnit}
          </span>
        </div>
      </div>

      {/* Range indicator */}
      {range !== 'auto' && (
        <div className="text-xs text-gray-500 text-center mt-1">
          Range: {range}
        </div>
      )}
    </div>
  );
};

// Component Vôn kế
export const Voltmeter = (props) => <DigitalMeter type="voltmeter" {...props} />;

// Component Ampe kế
export const Ammeter = (props) => <DigitalMeter type="ammeter" {...props} />;

// Component Ôm kế
export const Ohmmeter = (props) => <DigitalMeter type="ohmmeter" {...props} />;

export default DigitalMeter;

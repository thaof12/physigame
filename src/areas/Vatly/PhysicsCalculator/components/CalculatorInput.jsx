/**
 * CalculatorInput - Component nhập liệu cho máy tính vật lý
 */

import React, { useState, useEffect, useCallback } from 'react';
import { UNIT_CATEGORIES, getUnitsForCategory } from '../data/units';
import { validateSingleInput } from '../utils/validation';
import { parseValue } from '../utils/calculator';

const CalculatorInput = ({ formula, solveFor, onSolveForChange, onValuesChange, values }) => {
  const [localValues, setLocalValues] = useState({});
  const [errors, setErrors] = useState({});
  const [units, setUnits] = useState({});

  // Khởi tạo giá trị khi formula thay đổi
  useEffect(() => {
    if (formula) {
      const initialValues = {};
      const initialUnits = {};
      
      formula.variables.forEach(variable => {
        initialValues[variable.symbol] = values[variable.symbol] || '';
        initialUnits[variable.symbol] = variable.unit;
      });
      
      setLocalValues(initialValues);
      setUnits(initialUnits);
      setErrors({});
    }
  }, [formula]);

  // Cập nhật giá trị lên parent
  useEffect(() => {
    onValuesChange(localValues);
  }, [localValues]);

  // Xử lý thay đổi giá trị
  const handleValueChange = useCallback((symbol, value) => {
    setLocalValues(prev => ({
      ...prev,
      [symbol]: value
    }));

    // Validate
    const variable = formula.variables.find(v => v.symbol === symbol);
    if (variable && value !== '') {
      const validation = validateSingleInput(value, variable);
      setErrors(prev => ({
        ...prev,
        [symbol]: validation.isValid ? null : validation.error
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        [symbol]: null
      }));
    }
  }, [formula]);

  // Xử lý thay đổi đơn vị
  const handleUnitChange = useCallback((symbol, unit) => {
    setUnits(prev => ({
      ...prev,
      [symbol]: unit
    }));
  }, []);

  // Lấy danh sách các biến có thể giải
  const solvableVariables = formula?.variants?.map(v => v.solve) || [];

  if (!formula) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center text-gray-500">
        <div className="text-5xl mb-4">🧮</div>
        <p>Vui lòng chọn một công thức để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Tiêu đề công thức */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <h3 className="text-xl font-bold text-gray-800">{formula.name}</h3>
        <p className="text-gray-600 mt-1">{formula.description}</p>
        <div className="mt-2 inline-block px-3 py-1 bg-white rounded-lg shadow-sm">
          <code className="text-lg font-mono text-blue-600">{formula.formula}</code>
        </div>
      </div>

      {/* Chọn biến cần tìm */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          🎯 Chọn đại lượng cần tìm:
        </label>
        <div className="flex flex-wrap gap-2">
          {solvableVariables.map(symbol => {
            const variable = formula.variables.find(v => v.symbol === symbol);
            return (
              <button
                key={symbol}
                onClick={() => onSolveForChange(symbol)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  solveFor === symbol
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                }`}
              >
                {variable?.name || symbol} ({symbol})
              </button>
            );
          })}
        </div>
      </div>

      {/* Các ô nhập liệu */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-700">
          📝 Nhập các giá trị đã biết:
        </label>
        
        {formula.variables.map(variable => {
          // Bỏ qua biến cần tìm
          if (variable.symbol === solveFor) {
            return (
              <div 
                key={variable.symbol}
                className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200"
              >
                <span className="text-purple-700 font-medium">
                  ➡️ {variable.name} ({variable.symbol}) - Đại lượng cần tìm
                </span>
              </div>
            );
          }

          // Lấy danh sách đơn vị
          const unitOptions = variable.unitCategory 
            ? getUnitsForCategory(variable.unitCategory)
            : [];

          return (
            <div key={variable.symbol} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                {variable.name} ({variable.symbol})
                {variable.constant && (
                  <span className="ml-2 text-xs text-green-600">
                    (Mặc định: {variable.constant} {variable.unit})
                  </span>
                )}
              </label>
              
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={localValues[variable.symbol] || ''}
                    onChange={(e) => handleValueChange(variable.symbol, e.target.value)}
                    placeholder={variable.constant ? `Mặc định: ${variable.constant}` : `Nhập ${variable.name}`}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                      errors[variable.symbol]
                        ? 'border-red-400 focus:border-red-500 bg-red-50'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                  {localValues[variable.symbol] && !errors[variable.symbol] && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                      ✓
                    </span>
                  )}
                </div>
                
                {/* Dropdown đơn vị */}
                {unitOptions.length > 0 ? (
                  <select
                    value={units[variable.symbol] || variable.unit}
                    onChange={(e) => handleUnitChange(variable.symbol, e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-white min-w-[100px]"
                  >
                    {unitOptions.map(unit => (
                      <option key={unit.key} value={unit.key}>
                        {unit.symbol}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-600 min-w-[80px] text-center">
                    {variable.unit || '-'}
                  </div>
                )}
              </div>
              
              {/* Thông báo lỗi */}
              {errors[variable.symbol] && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span>⚠️</span> {errors[variable.symbol]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Gợi ý nhập liệu */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-yellow-800">
          💡 <strong>Mẹo:</strong> Bạn có thể nhập số mũ bằng cách dùng ký tự "e" 
          (VD: 3e8 = 3×10⁸) hoặc "^" (VD: 10^-6 = 10⁻⁶)
        </p>
      </div>
    </div>
  );
};

export default CalculatorInput;

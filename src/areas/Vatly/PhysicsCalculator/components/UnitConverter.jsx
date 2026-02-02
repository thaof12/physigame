/**
 * UnitConverter - Component chuyển đổi đơn vị
 */

import React, { useState, useMemo } from 'react';
import { UNIT_CATEGORIES, convertUnit, getUnitsForCategory } from '../data/units';
import { formatResult, parseValue } from '../utils/calculator';
import { COMMON_CONVERSIONS } from '../utils/unitConverter';

const UnitConverter = () => {
  const [selectedCategory, setSelectedCategory] = useState('length');
  const [inputValue, setInputValue] = useState('');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('cm');
  const [result, setResult] = useState(null);

  // Danh sách category
  const categories = Object.entries(UNIT_CATEGORIES).map(([key, cat]) => ({
    key,
    name: cat.name
  }));

  // Danh sách đơn vị của category hiện tại
  const units = useMemo(() => {
    return getUnitsForCategory(selectedCategory);
  }, [selectedCategory]);

  // Xử lý khi đổi category
  const handleCategoryChange = (catKey) => {
    setSelectedCategory(catKey);
    const cat = UNIT_CATEGORIES[catKey];
    setFromUnit(cat.baseUnit);
    const unitKeys = Object.keys(cat.units);
    setToUnit(unitKeys.find(u => u !== cat.baseUnit) || cat.baseUnit);
    setResult(null);
  };

  // Xử lý chuyển đổi
  const handleConvert = () => {
    const value = parseValue(inputValue);
    if (value === null) {
      setResult({ success: false, error: 'Giá trị không hợp lệ' });
      return;
    }

    const converted = convertUnit(value, fromUnit, toUnit, selectedCategory);
    if (converted === null) {
      setResult({ success: false, error: 'Không thể chuyển đổi' });
      return;
    }

    setResult({
      success: true,
      value: converted,
      formatted: formatResult(converted)
    });
  };

  // Đổi chiều chuyển đổi
  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    setResult(null);
  };

  // Chuyển đổi nhanh
  const handleQuickConvert = (conv) => {
    setSelectedCategory(conv.category);
    setFromUnit(conv.from);
    setToUnit(conv.to);
    setResult(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="text-2xl">🔄</span>
        Chuyển đổi đơn vị
      </h2>

      {/* Chuyển đổi nhanh */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">⚡ Chuyển đổi nhanh:</h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_CONVERSIONS.slice(0, 8).map((conv, index) => (
            <button
              key={index}
              onClick={() => handleQuickConvert(conv)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors"
            >
              {conv.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chọn loại đơn vị */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Loại đại lượng:
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
        >
          {categories.map(cat => (
            <option key={cat.key} value={cat.key}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Input và đơn vị */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Từ */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">Từ:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập giá trị"
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleConvert()}
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
            >
              {units.map(unit => (
                <option key={unit.key} value={unit.key}>{unit.symbol}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Đến */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">Sang:</label>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg text-lg font-mono">
              {result?.success ? result.formatted : '−'}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
            >
              {units.map(unit => (
                <option key={unit.key} value={unit.key}>{unit.symbol}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Nút thao tác */}
      <div className="flex gap-2">
        <button
          onClick={handleConvert}
          className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Chuyển đổi
        </button>
        <button
          onClick={handleSwap}
          className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          title="Đổi chiều"
        >
          ⇄
        </button>
      </div>

      {/* Kết quả chi tiết */}
      {result && (
        <div className={`mt-4 p-4 rounded-lg ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {result.success ? (
            <div className="text-center">
              <p className="text-lg text-green-800">
                <span className="font-mono">{inputValue}</span>{' '}
                <span className="text-green-600">{UNIT_CATEGORIES[selectedCategory].units[fromUnit]?.symbol}</span>
                <span className="mx-2">=</span>
                <span className="font-mono font-bold">{result.formatted}</span>{' '}
                <span className="text-green-600">{UNIT_CATEGORIES[selectedCategory].units[toUnit]?.symbol}</span>
              </p>
            </div>
          ) : (
            <p className="text-red-700 text-center">❌ {result.error}</p>
          )}
        </div>
      )}

      {/* Bảng tham khảo */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">
          📊 Bảng đơn vị {UNIT_CATEGORIES[selectedCategory].name}:
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {units.map(unit => (
            <div key={unit.key} className="flex justify-between bg-white p-2 rounded">
              <span className="font-medium">{unit.name}</span>
              <span className="text-gray-500">{unit.symbol}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;

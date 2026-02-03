import { useState } from 'react';
import { ArrowLeftRight, RefreshCw, Repeat } from 'lucide-react';
import unitConversions from '../../data/unitConversions.json';

const UnitConverter = () => {
  const [selectedQuantity, setSelectedQuantity] = useState('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState(null);

  // Lấy thông tin quantity hiện tại
  const currentQuantity = unitConversions[selectedQuantity];

  // Xử lý thay đổi quantity
  const handleQuantityChange = (quantity) => {
    setSelectedQuantity(quantity);
    const units = Object.keys(unitConversions[quantity].units);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
    setInputValue('');
    setResult(null);
  };

  // Xử lý chuyển đổi nhiệt độ đặc biệt
  const convertTemperature = (value, from, to) => {
    if (from === to) return value;

    // Chuyển đổi sang K trước (nếu cần)
    let kelvin = value;
    if (from === '°C') {
      kelvin = value + 273.15;
    } else if (from === '°F') {
      kelvin = (value - 32) * 5/9 + 273.15;
    }

    // Chuyển đổi từ K sang đơn vị đích
    if (to === 'K') return kelvin;
    if (to === '°C') return kelvin - 273.15;
    if (to === '°F') return (kelvin - 273.15) * 9/5 + 32;

    return value;
  };

  // Xử lý chuyển đổi
  const handleConvert = () => {
    if (!inputValue || isNaN(inputValue)) {
      setResult(null);
      return;
    }

    const value = parseFloat(inputValue);

    // Xử lý nhiệt độ đặc biệt
    if (currentQuantity.special) {
      const converted = convertTemperature(value, fromUnit, toUnit);
      setResult(converted);
      return;
    }

    // Chuyển đổi thông thường
    const fromFactor = currentQuantity.units[fromUnit].toBase;
    const toFactor = currentQuantity.units[toUnit].toBase;
    
    // Chuyển sang đơn vị cơ sở rồi chuyển sang đơn vị đích
    const baseValue = value * fromFactor;
    const converted = baseValue / toFactor;
    
    setResult(converted);
  };

  // Hoán đổi đơn vị
  const handleSwapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (result !== null) {
      setInputValue(result.toString());
      setResult(parseFloat(inputValue));
    }
  };

  // Reset
  const handleReset = () => {
    setInputValue('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ArrowLeftRight className="w-12 h-12 text-green-600 dark:text-green-400" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Chuyển Đổi Đơn Vị
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Chuyển đổi nhanh các đơn vị đo lường vật lý
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar - Chọn đại lượng */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Chọn Đại Lượng
              </h2>
              <div className="space-y-2">
                {Object.entries(unitConversions).map(([key, quantity]) => (
                  <button
                    key={key}
                    onClick={() => handleQuantityChange(key)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedQuantity === key
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-semibold">{quantity.name}</div>
                    <div className="text-sm opacity-80">
                      Đơn vị cơ sở: {quantity.baseUnit}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Converter */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                {currentQuantity.name}
              </h2>

              {/* Converter Interface */}
              <div className="space-y-6">
                {/* From Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Từ đơn vị:
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      step="any"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        setResult(null);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleConvert();
                      }}
                      placeholder="Nhập giá trị"
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-lg"
                    />
                    <select
                      value={fromUnit}
                      onChange={(e) => setFromUnit(e.target.value)}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    >
                      {Object.entries(currentQuantity.units).map(([unit, info]) => (
                        <option key={unit} value={unit}>
                          {unit} - {info.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSwapUnits}
                    className="p-3 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-full transition-all hover:rotate-180 transform duration-300"
                    title="Hoán đổi đơn vị"
                  >
                    <Repeat className="w-6 h-6" />
                  </button>
                </div>

                {/* To Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sang đơn vị:
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="px-4 py-3 border-2 border-green-500 bg-green-50 dark:bg-green-900/30 rounded-lg text-lg font-bold text-green-700 dark:text-green-300 flex items-center justify-center">
                      {result !== null ? result.toFixed(6) : '---'}
                    </div>
                    <select
                      value={toUnit}
                      onChange={(e) => setToUnit(e.target.value)}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    >
                      {Object.entries(currentQuantity.units).map(([unit, info]) => (
                        <option key={unit} value={unit}>
                          {unit} - {info.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleConvert}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeftRight className="w-5 h-5" />
                    Chuyển Đổi
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Làm Lại
                  </button>
                </div>

                {/* Result Display */}
                {result !== null && (
                  <div className="p-6 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 rounded-lg border-l-4 border-green-500">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                      Kết quả:
                    </h3>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {inputValue} {fromUnit} = {result.toFixed(6)} {toUnit}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {currentQuantity.units[fromUnit].name} sang {currentQuantity.units[toUnit].name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick Reference Table */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                    Bảng Tham Khảo Nhanh
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Đơn vị</th>
                          <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Tên</th>
                          <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                            Quy đổi sang {currentQuantity.baseUnit}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(currentQuantity.units).map(([unit, info]) => (
                          <tr 
                            key={unit}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <td className="px-4 py-2 font-mono font-semibold text-green-600 dark:text-green-400">
                              {unit}
                            </td>
                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                              {info.name}
                            </td>
                            <td className="px-4 py-2 text-right font-mono text-gray-600 dark:text-gray-400">
                              {!currentQuantity.special ? (
                                <>1 {unit} = {info.toBase} {currentQuantity.baseUnit}</>
                              ) : (
                                <span className="text-xs italic">Xem công thức</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;

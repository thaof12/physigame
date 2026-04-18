import { useState } from 'react';
import { Calculator, Book, RefreshCw, Copy, Check } from 'lucide-react';
import physicsConstants from '../../data/physicsConstants.json';
import BackNavButton from '../ui/BackNavButton';

// Định nghĩa các công thức vật lý theo chủ đề
const physicsFormulas = {
  mechanics: {
    name: 'Cơ học',
    formulas: [
      {
        id: 'velocity',
        name: 'Vận tốc',
        formula: 'v = s / t',
        description: 'Vận tốc = Quãng đường / Thời gian',
        variables: [
          { id: 'v', name: 'Vận tốc (v)', unit: 'm/s' },
          { id: 's', name: 'Quãng đường (s)', unit: 'm' },
          { id: 't', name: 'Thời gian (t)', unit: 's' }
        ],
        calculate: (values) => {
          if (values.s && values.t) return { v: values.s / values.t };
          if (values.v && values.t) return { s: values.v * values.t };
          if (values.v && values.s) return { t: values.s / values.v };
          return null;
        }
      },
      {
        id: 'acceleration',
        name: 'Gia tốc',
        formula: 'a = (v - v₀) / t',
        description: 'Gia tốc = Thay đổi vận tốc / Thời gian',
        variables: [
          { id: 'a', name: 'Gia tốc (a)', unit: 'm/s²' },
          { id: 'v', name: 'Vận tốc cuối (v)', unit: 'm/s' },
          { id: 'v0', name: 'Vận tốc đầu (v₀)', unit: 'm/s' },
          { id: 't', name: 'Thời gian (t)', unit: 's' }
        ],
        calculate: (values) => {
          if (values.v !== undefined && values.v0 !== undefined && values.t) {
            return { a: (values.v - values.v0) / values.t };
          }
          if (values.a && values.v0 !== undefined && values.t) {
            return { v: values.v0 + values.a * values.t };
          }
          return null;
        }
      },
      {
        id: 'newton2',
        name: 'Định luật Newton 2',
        formula: 'F = m × a',
        description: 'Lực = Khối lượng × Gia tốc',
        variables: [
          { id: 'F', name: 'Lực (F)', unit: 'N' },
          { id: 'm', name: 'Khối lượng (m)', unit: 'kg' },
          { id: 'a', name: 'Gia tốc (a)', unit: 'm/s²' }
        ],
        calculate: (values) => {
          if (values.m && values.a) return { F: values.m * values.a };
          if (values.F && values.a) return { m: values.F / values.a };
          if (values.F && values.m) return { a: values.F / values.m };
          return null;
        }
      },
      {
        id: 'gravity',
        name: 'Trọng lực',
        formula: 'P = m × g',
        description: 'Trọng lực = Khối lượng × Gia tốc trọng trường',
        variables: [
          { id: 'P', name: 'Trọng lực (P)', unit: 'N' },
          { id: 'm', name: 'Khối lượng (m)', unit: 'kg' },
          { id: 'g', name: 'Gia tốc trọng trường (g)', unit: 'm/s²', default: 9.8 }
        ],
        calculate: (values) => {
          const g = values.g || 9.8;
          if (values.m) return { P: values.m * g };
          if (values.P) return { m: values.P / g };
          return null;
        }
      },
      {
        id: 'pressure',
        name: 'Áp suất',
        formula: 'p = F / S',
        description: 'Áp suất = Lực / Diện tích',
        variables: [
          { id: 'p', name: 'Áp suất (p)', unit: 'Pa' },
          { id: 'F', name: 'Lực (F)', unit: 'N' },
          { id: 'S', name: 'Diện tích (S)', unit: 'm²' }
        ],
        calculate: (values) => {
          if (values.F && values.S) return { p: values.F / values.S };
          if (values.p && values.S) return { F: values.p * values.S };
          if (values.p && values.F) return { S: values.F / values.p };
          return null;
        }
      },
      {
        id: 'work',
        name: 'Công',
        formula: 'A = F × s',
        description: 'Công = Lực × Quãng đường',
        variables: [
          { id: 'A', name: 'Công (A)', unit: 'J' },
          { id: 'F', name: 'Lực (F)', unit: 'N' },
          { id: 's', name: 'Quãng đường (s)', unit: 'm' }
        ],
        calculate: (values) => {
          if (values.F && values.s) return { A: values.F * values.s };
          if (values.A && values.s) return { F: values.A / values.s };
          if (values.A && values.F) return { s: values.A / values.F };
          return null;
        }
      },
      {
        id: 'power',
        name: 'Công suất',
        formula: 'P = A / t',
        description: 'Công suất = Công / Thời gian',
        variables: [
          { id: 'P', name: 'Công suất (P)', unit: 'W' },
          { id: 'A', name: 'Công (A)', unit: 'J' },
          { id: 't', name: 'Thời gian (t)', unit: 's' }
        ],
        calculate: (values) => {
          if (values.A && values.t) return { P: values.A / values.t };
          if (values.P && values.t) return { A: values.P * values.t };
          if (values.P && values.A) return { t: values.A / values.P };
          return null;
        }
      }
    ]
  },
  electricity: {
    name: 'Điện học',
    formulas: [
      {
        id: 'ohm',
        name: 'Định luật Ohm',
        formula: 'U = I × R',
        description: 'Hiệu điện thế = Cường độ dòng điện × Điện trở',
        variables: [
          { id: 'U', name: 'Hiệu điện thế (U)', unit: 'V' },
          { id: 'I', name: 'Cường độ dòng điện (I)', unit: 'A' },
          { id: 'R', name: 'Điện trở (R)', unit: 'Ω' }
        ],
        calculate: (values) => {
          if (values.I && values.R) return { U: values.I * values.R };
          if (values.U && values.R) return { I: values.U / values.R };
          if (values.U && values.I) return { R: values.U / values.I };
          return null;
        }
      },
      {
        id: 'electricPower',
        name: 'Công suất điện',
        formula: 'P = U × I',
        description: 'Công suất = Hiệu điện thế × Cường độ dòng điện',
        variables: [
          { id: 'P', name: 'Công suất (P)', unit: 'W' },
          { id: 'U', name: 'Hiệu điện thế (U)', unit: 'V' },
          { id: 'I', name: 'Cường độ dòng điện (I)', unit: 'A' }
        ],
        calculate: (values) => {
          if (values.U && values.I) return { P: values.U * values.I };
          if (values.P && values.I) return { U: values.P / values.I };
          if (values.P && values.U) return { I: values.P / values.U };
          return null;
        }
      },
      {
        id: 'electricEnergy',
        name: 'Điện năng',
        formula: 'A = P × t',
        description: 'Điện năng = Công suất × Thời gian',
        variables: [
          { id: 'A', name: 'Điện năng (A)', unit: 'J hoặc kWh' },
          { id: 'P', name: 'Công suất (P)', unit: 'W' },
          { id: 't', name: 'Thời gian (t)', unit: 's' }
        ],
        calculate: (values) => {
          if (values.P && values.t) return { A: values.P * values.t };
          if (values.A && values.t) return { P: values.A / values.t };
          if (values.A && values.P) return { t: values.A / values.P };
          return null;
        }
      },
      {
        id: 'jouleHeat',
        name: 'Định luật Jun-Lenxơ',
        formula: 'Q = I² × R × t',
        description: 'Nhiệt lượng tỏa ra = Bình phương cường độ dòng điện × Điện trở × Thời gian',
        variables: [
          { id: 'Q', name: 'Nhiệt lượng (Q)', unit: 'J' },
          { id: 'I', name: 'Cường độ dòng điện (I)', unit: 'A' },
          { id: 'R', name: 'Điện trở (R)', unit: 'Ω' },
          { id: 't', name: 'Thời gian (t)', unit: 's' }
        ],
        calculate: (values) => {
          if (values.I && values.R && values.t) {
            return { Q: values.I * values.I * values.R * values.t };
          }
          return null;
        }
      }
    ]
  },
  thermodynamics: {
    name: 'Nhiệt học',
    formulas: [
      {
        id: 'heat',
        name: 'Nhiệt lượng',
        formula: 'Q = m × c × Δt',
        description: 'Nhiệt lượng = Khối lượng × Nhiệt dung riêng × Độ thay đổi nhiệt độ',
        variables: [
          { id: 'Q', name: 'Nhiệt lượng (Q)', unit: 'J' },
          { id: 'm', name: 'Khối lượng (m)', unit: 'kg' },
          { id: 'c', name: 'Nhiệt dung riêng (c)', unit: 'J/(kg⋅K)' },
          { id: 'dt', name: 'Độ thay đổi nhiệt độ (Δt)', unit: 'K hoặc °C' }
        ],
        calculate: (values) => {
          if (values.m && values.c && values.dt) {
            return { Q: values.m * values.c * values.dt };
          }
          if (values.Q && values.c && values.dt) {
            return { m: values.Q / (values.c * values.dt) };
          }
          if (values.Q && values.m && values.dt) {
            return { c: values.Q / (values.m * values.dt) };
          }
          return null;
        }
      },
      {
        id: 'idealGas',
        name: 'Phương trình khí lý tưởng',
        formula: 'p × V = n × R × T',
        description: 'Áp suất × Thể tích = Số mol × Hằng số khí × Nhiệt độ',
        variables: [
          { id: 'p', name: 'Áp suất (p)', unit: 'Pa' },
          { id: 'V', name: 'Thể tích (V)', unit: 'm³' },
          { id: 'n', name: 'Số mol (n)', unit: 'mol' },
          { id: 'R', name: 'Hằng số khí (R)', unit: 'J/(mol⋅K)', default: 8.314 },
          { id: 'T', name: 'Nhiệt độ (T)', unit: 'K' }
        ],
        calculate: (values) => {
          const R = values.R || 8.314;
          if (values.p && values.V && values.n) {
            return { T: (values.p * values.V) / (values.n * R) };
          }
          if (values.n && values.T && values.V) {
            return { p: (values.n * R * values.T) / values.V };
          }
          if (values.p && values.n && values.T) {
            return { V: (values.n * R * values.T) / values.p };
          }
          return null;
        }
      }
    ]
  },
  optics: {
    name: 'Quang học',
    formulas: [
      {
        id: 'mirror',
        name: 'Công thức gương cầu',
        formula: '1/f = 1/d + 1/d\'',
        description: 'Tiêu cự gương cầu',
        variables: [
          { id: 'f', name: 'Tiêu cự (f)', unit: 'm' },
          { id: 'd', name: 'Khoảng cách vật (d)', unit: 'm' },
          { id: 'dp', name: 'Khoảng cách ảnh (d\')', unit: 'm' }
        ],
        calculate: (values) => {
          if (values.d && values.dp) {
            return { f: 1 / (1/values.d + 1/values.dp) };
          }
          if (values.f && values.d) {
            return { dp: 1 / (1/values.f - 1/values.d) };
          }
          if (values.f && values.dp) {
            return { d: 1 / (1/values.f - 1/values.dp) };
          }
          return null;
        }
      },
      {
        id: 'magnification',
        name: 'Số phóng đại',
        formula: 'k = h\' / h = -d\' / d',
        description: 'Số phóng đại ảnh',
        variables: [
          { id: 'k', name: 'Số phóng đại (k)', unit: '' },
          { id: 'h', name: 'Chiều cao vật (h)', unit: 'm' },
          { id: 'hp', name: 'Chiều cao ảnh (h\')', unit: 'm' }
        ],
        calculate: (values) => {
          if (values.hp && values.h) {
            return { k: values.hp / values.h };
          }
          if (values.k && values.h) {
            return { hp: values.k * values.h };
          }
          if (values.k && values.hp) {
            return { h: values.hp / values.k };
          }
          return null;
        }
      }
    ]
  }
};

const PhysicsCalculator = () => {
  const [selectedCategory, setSelectedCategory] = useState('mechanics');
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Chọn công thức đầu tiên khi thay đổi category
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedFormula(physicsFormulas[category].formulas[0]);
    setInputValues({});
    setResult(null);
  };

  // Chọn công thức
  const handleFormulaChange = (formula) => {
    setSelectedFormula(formula);
    setInputValues({});
    setResult(null);
  };

  // Thay đổi giá trị input
  const handleInputChange = (varId, value) => {
    setInputValues(prev => ({
      ...prev,
      [varId]: value === '' ? undefined : parseFloat(value)
    }));
  };

  // Tính toán
  const handleCalculate = () => {
    if (!selectedFormula) return;
    
    const calculatedResult = selectedFormula.calculate(inputValues);
    setResult(calculatedResult);
  };

  // Reset
  const handleReset = () => {
    setInputValues({});
    setResult(null);
  };

  // Copy kết quả
  const handleCopy = () => {
    if (!result) return;
    
    const resultText = Object.entries(result)
      .map(([key, value]) => `${key} = ${value.toFixed(4)}`)
      .join('\n');
    
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Khởi tạo công thức đầu tiên
  if (!selectedFormula && physicsFormulas[selectedCategory]) {
    setSelectedFormula(physicsFormulas[selectedCategory].formulas[0]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <BackNavButton fallbackPath="/physics-tools" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Máy Tính Vật Lý
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Tính toán các đại lượng vật lý theo công thức
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar - Danh mục và công thức */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Book className="w-5 h-5" />
                Chọn Công Thức
              </h2>

              {/* Categories */}
              <div className="space-y-2 mb-4">
                {Object.entries(physicsFormulas).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedCategory === key
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Formulas */}
              {selectedCategory && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-4 mb-2">
                    Công thức:
                  </h3>
                  {physicsFormulas[selectedCategory].formulas.map((formula) => (
                    <button
                      key={formula.id}
                      onClick={() => handleFormulaChange(formula)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedFormula?.id === formula.id
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-2 border-blue-500'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {formula.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Calculator */}
          <div className="lg:col-span-2">
            {selectedFormula && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                {/* Formula Info */}
                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-lg border-l-4 border-indigo-500">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    {selectedFormula.name}
                  </h3>
                  <p className="text-3xl font-mono text-indigo-600 dark:text-indigo-400 mb-2">
                    {selectedFormula.formula}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedFormula.description}
                  </p>
                </div>

                {/* Input Fields */}
                <div className="space-y-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Nhập giá trị:
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedFormula.variables.map((variable) => (
                      <div key={variable.id}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {variable.name}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="any"
                            value={inputValues[variable.id] ?? variable.default ?? ''}
                            onChange={(e) => handleInputChange(variable.id, e.target.value)}
                            placeholder={variable.default ? `Mặc định: ${variable.default}` : 'Nhập giá trị'}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                          />
                          <span className="flex items-center px-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm">
                            {variable.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={handleCalculate}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Calculator className="w-5 h-5" />
                    Tính Toán
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Làm Lại
                  </button>
                </div>

                {/* Result */}
                {result && (
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                        Kết Quả:
                      </h4>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Đã copy
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(result).map(([key, value]) => {
                        const variable = selectedFormula.variables.find(v => 
                          v.id === key || v.id.replace('p', '\'') === key
                        );
                        return (
                          <div key={key} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              {variable?.name || key}:
                            </span>
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {typeof value === 'number' ? value.toFixed(4) : value} {variable?.unit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsCalculator;

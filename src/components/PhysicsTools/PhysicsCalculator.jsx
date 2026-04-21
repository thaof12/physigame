import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Book, RefreshCw, Copy, Check, ArrowLeft, Terminal, Power } from 'lucide-react';
import physicsConstants from '../../data/physicsConstants.json';

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
            return { f: 1 / (1 / values.d + 1 / values.dp) };
          }
          if (values.f && values.d) {
            return { dp: 1 / (1 / values.f - 1 / values.d) };
          }
          if (values.f && values.dp) {
            return { d: 1 / (1 / values.f - 1 / values.dp) };
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
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('mechanics');
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

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
  const executeCalculation = () => {
    if (!selectedFormula) return;

    try {
      const calculatedResult = selectedFormula.calculate(inputValues);
      setResult(calculatedResult || false); // Use false to denote error explicitly if needed
    } catch (error) {
      console.error('Calculation Error:', error);
      setResult(false);
    }
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
      .map(([key, value]) => `${key} = ${typeof value === 'number' ? value.toFixed(4) : value}`)
      .join('\n');

    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Khởi tạo công thức đầu tiên
  useEffect(() => {
    if (!selectedFormula && physicsFormulas[selectedCategory]) {
      setSelectedFormula(physicsFormulas[selectedCategory].formulas[0]);
    }
  }, [selectedCategory, selectedFormula]);

  return (
    <div className="bg-[#FFFFFF] font-sans min-h-screen selection:bg-[#274dad]/20 selection:text-[#4A3728] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 graph-grid opacity-[0.25] pointer-events-none" />
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none bg-[#274dad]/10" />

      {/* Global CSS for Terminal Effect */}
      <style>{`
        @keyframes crt-flicker {
            0% { opacity: 0.95; text-shadow: 0 0 5px rgba(212,175,55,0.8); }
            5% { opacity: 0.8; }
            10% { opacity: 1; text-shadow: 0 0 10px rgba(212,175,55,1); }
            100% { opacity: 0.95; }
        }
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        .terminal-text {
            color: #44b5d7;
            text-shadow: 0 0 8px rgba(212,175,55,0.6);
            animation: crt-flicker 0.15s infinite;
        }
      `}</style>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/physics-tools')}
              className="group flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-[#E5E7EB] text-[#2099e9] shadow-sm hover:border-[#274dad]/30 hover:bg-[#e4f2f0] hover:shadow-md transition-all active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B] tracking-tight flex items-center gap-3">
                <Calculator className="w-8 h-8 text-[#274dad]" />
                Máy Trạm Xử Lý Số Liệu
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Lập trình và mô phỏng hệ thống đại lượng vật lý
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* Sidebar - Danh mục và công thức */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-[2rem] border border-[#E5E7EB] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#e4f2f0] rounded-bl-[100px] flex items-start justify-end p-5">
                <Power className="w-6 h-6 text-[#274dad]/20" />
              </div>

              <h2 className="text-lg font-black text-[#1E293B] mb-6 flex items-center gap-2 relative z-10">
                <span className="w-2 h-2 rounded-full bg-[#274dad]" />
                Bảng Công Tắc Logic
              </h2>

              {/* Advanced Toggle Switch Categories */}
              <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                {Object.entries(physicsFormulas).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key)}
                    className={`relative p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group
                      ${selectedCategory === key
                        ? 'bg-[#e4f2f0] border-[#274dad] shadow-[inset_0_2px_5px_rgba(0,0,0,0.05)]'
                        : 'bg-white border-[#E5E7EB] hover:border-[#274dad]/30'}`}
                  >
                    {/* Simulated LED Indicator */}
                    <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full shadow-[0_0_5px] 
                      ${selectedCategory === key ? 'bg-green-400 shadow-green-400 animate-pulse' : 'bg-slate-300 shadow-transparent'}`} />
                    <div className="font-bold text-xs text-center leading-tight mt-1">
                      <span className={selectedCategory === key ? 'text-[#2099e9]' : 'text-slate-500 group-hover:text-[#2099e9]'}>
                        {category.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Formulas */}
              {selectedCategory && (
                <div className="space-y-3 relative z-10 p-4 bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB]">
                  <div className="text-[10px] font-black text-[#274dad] tracking-[0.1em] uppercase mb-4 flex items-center gap-2">
                    <Terminal className="w-3 h-3" /> CHỌN CHƯƠNG TRÌNH:
                  </div>
                  {physicsFormulas[selectedCategory].formulas.map((formula) => (
                    <button
                      key={formula.id}
                      onClick={() => handleFormulaChange(formula)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group flex items-center justify-between ${selectedFormula?.id === formula.id
                          ? 'bg-[#1E293B] text-white shadow-md'
                          : 'bg-white text-slate-600 border border-[#E5E7EB] hover:border-[#274dad]/30 hover:bg-[#e4f2f0]'
                        }`}
                    >
                      <span className={`group-hover:translate-x-1 transition-transform ${selectedFormula?.id === formula.id ? 'text-[#44b5d7]' : ''}`}>{formula.name}</span>
                      {selectedFormula?.id === formula.id && (
                        <div className="w-2 h-2 rounded-full bg-[#44b5d7] shadow-[0_0_8px_#44b5d7] animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Calculator */}
          <div className="lg:col-span-8 flex flex-col gap-6 relative">
            {selectedFormula ? (
              <div className="bg-white rounded-[2rem] border border-[#E5E7EB] shadow-[0_20px_40px_-15px_rgba(184,115,51,0.05)] p-8 sm:p-10 relative overflow-hidden group/calc">

                <div className="absolute inset-0 opacity-0 group-hover/calc:opacity-100 transition-opacity duration-1000 border-2 border-[#274dad]/5 rounded-[2rem] pointer-events-none" />

                {/* Formula Header Info */}
                <div className="mb-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E5E7EB] pb-8">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-[#1E293B] border border-[#274dad]/20 text-[#44b5d7] font-black text-[10px] tracking-[0.2em] uppercase shadow-sm">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Mạch đang mở
                    </div>
                    <h3 className="text-3xl font-black text-[#1E293B] mb-2 tracking-tight">
                      {selectedFormula.name}
                    </h3>
                    <p className="text-slate-500 font-medium">
                      {selectedFormula.description}
                    </p>
                  </div>

                  {/* Digital Formula Display */}
                  <div className="px-6 py-4 bg-[#0F172A] rounded-xl relative overflow-hidden flex-shrink-0 border-2 border-black/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] max-w-full">
                    <div className="absolute inset-0 graph-grid opacity-20" />
                    <p className="text-xl md:text-2xl font-mono font-bold terminal-text relative z-10 whitespace-nowrap overflow-x-auto hide-scrollbar">
                      &gt; {selectedFormula.formula}
                    </p>
                  </div>
                </div>

                {/* Terminal Input Interfaces */}
                <div className="mb-10 relative z-10">
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                    {selectedFormula.variables.map((variable) => {
                      return (
                        <div key={variable.id} className="group">
                          <label className="flex justify-between text-sm font-bold text-slate-700 mb-2 group-focus-within:text-[#274dad] transition-colors uppercase tracking-wider text-[11px]">
                            <span>{variable.name}</span>
                            <span className="text-slate-400">[{variable.id}]</span>
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              step="any"
                              value={inputValues[variable.id] ?? variable.default ?? ''}
                              onChange={(e) => handleInputChange(variable.id, e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && executeCalculation()}
                              placeholder={variable.default ? `Mặc định: ${variable.default}` : '0.00'}
                              className="w-full bg-[#FFFFFF] border-2 border-[#E5E7EB] px-4 py-3.5 pr-16 rounded-xl font-mono text-lg font-bold text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#274dad]/20 focus:border-[#274dad] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-300"
                            />
                            <span className="absolute right-4 font-black text-[#2099e9] text-sm bg-white border border-[#E5E7EB] px-2 py-1 rounded shadow-sm select-none">
                              {variable.unit}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Operation Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4 relative z-10 pt-4 border-t border-[#E5E7EB]">
                  <button
                    onClick={executeCalculation}
                    disabled={isProcessing}
                    className="flex-1 pg-btn-brass py-4 rounded-xl flex items-center justify-center gap-3 font-bold shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-wait relative overflow-hidden group"
                  >
                    <Power className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
                    {isProcessing ? 'ĐANG BIÊN DỊCH...' : 'THỰC THI LỆNH'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-8 py-4 bg-white border-2 border-[#E5E7EB] hover:bg-[#e4f2f0] hover:border-[#274dad]/50 text-slate-600 hover:text-[#2099e9] rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 text-sm sm:text-base group"
                  >
                    <RefreshCw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
                    LÀM MỚI
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] border border-[#E5E7EB] border-dashed p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <Terminal className="w-16 h-16 text-slate-200 mb-4" />
                <p className="text-slate-500 font-medium">Hệ thống đang chờ. Vui lòng nạp chương trình công thức.</p>
              </div>
            )}

            {/* Instant Result Area */}
            {result !== null && selectedFormula && (
              <div className="bg-[#0F172A] rounded-[2rem] shadow-2xl p-8 sm:p-10 relative overflow-hidden border border-[#274dad]/20">
                <div className="absolute inset-0 bg-[#44b5d7]/5 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="w-full">
                    <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 mb-4 flex items-center gap-2">
                       <Terminal className="w-4 h-4 text-[#44b5d7]" />
                       Kết Quả Truy Xuất
                    </h4>
                    {result === false ? (
                      <p className="text-xl font-mono text-red-400 font-bold">LỖI: Thiếu tham số hoặc tham số không hợp lệ.</p>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {Object.entries(result).map(([key, value]) => {
                          const variable = selectedFormula.variables.find(v => v.id === key || v.id.replace('p', '\'') === key);
                          const displayValue = typeof value === 'number' ?
                            (Math.abs(value) > 10000 || (Math.abs(value) < 0.0001 && value !== 0) ? value.toExponential(4) : value.toFixed(4))
                            : value;
                          return (
                            <div key={key} className="flex items-baseline gap-4">
                                <span className="text-3xl font-mono text-slate-400 font-bold">{key} = </span>
                                <span className="text-4xl sm:text-5xl font-black text-[#44b5d7] font-mono tracking-wider truncate">
                                    {displayValue}
                                </span>
                                <span className="text-xl font-mono text-slate-300 ml-2">{variable?.unit || ''}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {result !== false && (
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-2 px-6 py-4 bg-[#1E293B] hover:bg-[#334155] border-2 border-white/10 text-[#44b5d7] rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5 text-green-400" />
                          <span className="text-green-400">Đã Sao Chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          Sao Chép Logs
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsCalculator;


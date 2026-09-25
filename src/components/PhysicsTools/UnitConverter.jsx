import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, RefreshCw, Repeat, ArrowLeft, Ruler, Activity, BookOpen, ChevronDown, Check } from 'lucide-react';
import unitConversions from '../../data/unitConversions.json';

// --- Smooth Custom Unit Dropdown Component (matching sample design) ---
const SmoothUnitSelect = ({ units, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentInfo = units?.[value] || { name: value };
  const unitList = Object.entries(units || {});

  return (
    <div className="relative font-body w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl border-2 border-[#0ea5e9] bg-white hover:bg-sky-50/40 text-[#0284c7] transition-all duration-200 cursor-pointer shadow-xs select-none focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 active:scale-[0.99]"
      >
        <div className="flex items-center gap-2 overflow-hidden text-left min-w-0">
          <span className="font-heading text-sm sm:text-base font-extrabold text-[#0284c7] truncate tracking-tight">
            {value} — {currentInfo.name}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 ml-2 flex-shrink-0 text-[#0ea5e9] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 z-[100] rounded-2xl bg-white border border-slate-100 shadow-[0_20px_45px_rgba(0,0,0,0.12)] p-2 transition-all animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="max-h-60 overflow-y-auto scrollbar-thin py-1 space-y-1">
            {unitList.map(([uKey, uInfo]) => {
              const isSelected = uKey === value;
              return (
                <button
                  key={uKey}
                  type="button"
                  onClick={() => {
                    onChange(uKey);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-[#eff8ff] text-[#0284c7] font-extrabold'
                      : 'text-[#1e293b] hover:bg-slate-50 hover:text-[#0284c7] font-bold'
                  }`}
                >
                  <span className="font-heading text-sm sm:text-base truncate">
                    {uKey} — {uInfo.name}
                  </span>
                  {isSelected && (
                    <Check
                      className="w-5 h-5 flex-shrink-0 ml-2 text-[#0ea5e9]"
                      strokeWidth={2.5}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const UnitConverter = () => {
  const navigate = useNavigate();
  const [selectedQuantity, setSelectedQuantity] = useState('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState(null);

  // Animation States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showSignal, setShowSignal] = useState(false);

  const currentQuantity = unitConversions[selectedQuantity];

  // Prepare options array for selectors
  const unitOptions = Object.entries(currentQuantity.units).map(([id, info]) => ({
    id,
    name: info.name
  }));

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
      kelvin = (value - 32) * 5 / 9 + 273.15;
    }

    // Chuyển đổi từ K sang đơn vị đích
    if (to === 'K') return kelvin;
    if (to === '°C') return kelvin - 273.15;
    if (to === '°F') return (kelvin - 273.15) * 9 / 5 + 32;

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

  // Tự động tính toán khi input hoặc unit thay đổi
  useEffect(() => {
    handleConvert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, fromUnit, toUnit]);

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
    <div className="bg-[#FFFFFF] font-body min-h-screen selection:bg-[#274dad]/20 selection:text-[#4A3728] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 graph-grid opacity-[0.25] pointer-events-none" />
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none bg-[#274dad]/10" />

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
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight flex items-center gap-3">
                <ArrowLeftRight className="w-8 h-8 text-[#274dad]" />
                Chuyển Đổi Đơn Vị
              </h1>
              <p className="font-body text-slate-500 font-medium mt-1">
                Bộ chuyển tiếp tiêu chuẩn hóa đo lường vật lý
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar - Chọn đại lượng */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-[2rem] border border-[#E5E7EB] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#e4f2f0] rounded-bl-[100px] flex items-start justify-end p-5">
                <Ruler className="w-6 h-6 text-[#274dad]/20" />
              </div>

              <h2 className="font-heading text-lg font-extrabold text-[#1E293B] mb-6 flex items-center gap-2 relative z-10">
                <span className="w-2 h-2 rounded-full bg-[#274dad]" />
                Danh mục Tham số
              </h2>

              <div className="space-y-3 relative z-10">
                {Object.entries(unitConversions).map(([key, quantity]) => (
                  <button
                    key={key}
                    onClick={() => handleQuantityChange(key)}
                    className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 group flex items-center justify-between ${selectedQuantity === key
                        ? 'bg-[#1E293B] text-white shadow-lg border border-transparent'
                        : 'bg-white text-slate-600 border border-[#E5E7EB] hover:border-[#274dad]/30 hover:bg-[#e4f2f0]'
                      }`}
                  >
                    <div>
                      <div className="font-heading font-bold text-sm tracking-wide group-hover:translate-x-1 transition-transform">{quantity.name}</div>
                      <div className={`text-xs mt-1 ${selectedQuantity === key ? 'text-slate-400' : 'text-slate-500'}`}>
                        Cơ sở: {quantity.baseUnit}
                      </div>
                    </div>
                    {selectedQuantity === key && (
                      <div className="w-2 h-2 rounded-full bg-[#44b5d7] shadow-[0_0_8px_#44b5d7] animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Converter */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-[2rem] border border-[#E5E7EB] shadow-[0_20px_40px_-15px_rgba(184,115,51,0.05)] p-8 sm:p-10 relative overflow-hidden group/conv">

              {/* Ambience border on hover */}
              <div className="absolute inset-0 opacity-0 group-hover/conv:opacity-100 transition-opacity duration-1000 border-2 border-[#274dad]/5 rounded-[2rem] pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-6 mb-8 relative z-10">
                <h2 className="font-heading text-3xl font-extrabold text-[#1E293B] tracking-tight">
                  {currentQuantity.name}
                </h2>
                <div className="font-heading px-3 py-1 bg-[#e4f2f0] border border-[#274dad]/20 rounded text-[#2099e9] text-xs font-extrabold uppercase tracking-wider">
                  {Object.keys(currentQuantity.units).length} Đơn vị
                </div>
              </div>

              {/* Converter Interface */}
              <div className="space-y-8 relative z-10">
                {/* From Unit */}
                <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5E7EB] group focus-within:border-[#274dad] transition-colors relative z-30">
                  <label className="font-heading block text-xs font-extrabold text-slate-400 tracking-[0.1em] uppercase mb-4 group-focus-within:text-[#274dad] transition-colors">
                    Nguồn đầu vào
                  </label>
                  <div className="grid grid-cols-[2fr_1fr] md:grid-cols-[3fr_2fr] gap-4">
                    <input
                      type="number"
                      step="any"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                      }}
                      placeholder="0.00"
                      className="w-full bg-white border border-[#E5E7EB] px-4 py-4 rounded-xl font-mono text-2xl font-bold text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#274dad]/20 focus:border-[#274dad] transition-all shadow-sm placeholder:text-slate-300"
                    />
                    <SmoothUnitSelect
                      units={currentQuantity.units}
                      value={fromUnit}
                      onChange={(unitKey) => setFromUnit(unitKey)}
                    />
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center -my-12 relative z-20">
                  <button
                    onClick={handleSwapUnits}
                    className="p-4 bg-white border-2 border-[#E5E7EB] hover:border-[#274dad] hover:bg-[#e4f2f0] hover:shadow-[0_0_15px_rgba(184,115,51,0.2)] text-[#2099e9] rounded-full transition-all hover:rotate-180 transform duration-500 shadow-sm"
                    title="Hoán đổi chiều dài"
                  >
                    <Repeat className="w-5 h-5" />
                  </button>
                </div>

                {/* To Unit */}
                <div className="bg-[#1E293B] p-6 rounded-2xl shadow-inner relative z-10">
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.05)_0%,transparent_60%)]" />
                  </div>

                  <label className="font-heading block text-xs font-extrabold text-slate-400 tracking-[0.1em] uppercase mb-4 relative z-10">
                    Kết xuất đầu ra
                  </label>
                  <div className="grid grid-cols-[2fr_1fr] md:grid-cols-[3fr_2fr] gap-4 relative z-10">
                    <div className="w-full bg-white/5 border border-white/10 px-4 py-4 rounded-xl flex items-center shadow-inner">
                      <span className={`font-mono text-2xl font-bold ${result !== null ? 'text-[#44b5d7]' : 'text-slate-600'}`}>
                        {result !== null ? (Math.abs(result) > 10000 || Math.abs(result) < 0.0001 && result !== 0 ? result.toExponential(4) : result.toFixed(6)) : '0.00'}
                      </span>
                    </div>
                    <SmoothUnitSelect
                      units={currentQuantity.units}
                      value={toUnit}
                      onChange={(unitKey) => setToUnit(unitKey)}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-4 bg-white border border-[#E5E7EB] hover:bg-[#e4f2f0] hover:border-[#274dad]/30 text-slate-600 hover:text-[#2099e9] rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 text-sm sm:text-base group"
                  >
                    <RefreshCw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
                    Làm trống kết quả
                  </button>
                </div>

                {/* Quick Reference Table */}
                <div className="mt-12 pt-8 border-t border-[#E5E7EB]">
                  <h3 className="font-heading text-lg font-extrabold text-[#1E293B] mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#274dad]" />
                    Bảng Tham Khảo Định Mức
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] shadow-sm">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#FFFFFF] border-b border-[#E5E7EB]">
                          <th className="px-6 py-4 text-left font-heading font-extrabold text-slate-500 tracking-wider">Mã đơn vị</th>
                          <th className="px-6 py-4 text-left font-heading font-extrabold text-slate-500 tracking-wider">Định danh</th>
                          <th className="px-6 py-4 text-right font-heading font-extrabold text-slate-500 tracking-wider">
                            Quy đổi sang <span className="text-[#274dad] px-1 bg-[#e4f2f0] rounded border border-[#274dad]/20">{currentQuantity.baseUnit}</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-[#E5E7EB]">
                        {Object.entries(currentQuantity.units).map(([unit, info]) => (
                          <tr
                            key={unit}
                            className="hover:bg-[#e4f2f0] transition-colors"
                          >
                            <td className="px-6 py-3 font-mono font-bold text-[#2099e9] whitespace-nowrap">
                              {unit}
                            </td>
                            <td className="px-6 py-3 font-medium text-slate-600">
                              {info.name}
                            </td>
                            <td className="px-6 py-3 text-right font-mono text-slate-500">
                              {!currentQuantity.special ? (
                                <><strong className="text-[#1E293B]">1 {unit}</strong> = {info.toBase} {currentQuantity.baseUnit}</>
                              ) : (
                                <span className="text-xs font-semibold bg-[#E5E7EB] px-2 py-1 rounded text-slate-500">Logics riêng rẽ</span>
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


import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Star, Filter, Copy, Check, ArrowLeft, Scan } from 'lucide-react';
import physicsConstants from '../../data/physicsConstants.json';

const ConstantsReference = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);
  // Kết hợp tất cả hằng số
  const allConstants = [
    ...physicsConstants.fundamentalConstants,
    ...physicsConstants.derivedConstants
  ];

  // Lấy danh sách categories
  const categories = ['all', ...new Set(allConstants.map(c => c.category))];

  // Lọc hằng số theo search và category
  const filteredConstants = useMemo(() => {
    return allConstants.filter(constant => {
      const matchesSearch =
        constant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        constant.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        constant.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || constant.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, allConstants]);

  // Copy giá trị
  const handleCopy = (constant) => {
    const text = `${constant.symbol} = ${constant.value} ${constant.unit}`;
    navigator.clipboard.writeText(text);
    setCopiedId(constant.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Format số khoa học
  const formatScientific = (value) => {
    if (typeof value !== 'number') return value;

    if (Math.abs(value) >= 1000 || (Math.abs(value) < 0.01 && value !== 0)) {
      return value.toExponential(10);
    }
    return value.toString();
  };

  // Nhóm hằng số theo category
  const groupedConstants = useMemo(() => {
    const groups = {};
    filteredConstants.forEach(constant => {
      if (!groups[constant.category]) {
        groups[constant.category] = [];
      }
      groups[constant.category].push(constant);
    });
    return groups;
  }, [filteredConstants]);

  return (
    <div className="bg-[#FDFCF8] font-sans min-h-screen selection:bg-[#B87333]/20 selection:text-[#4A3728] relative overflow-hidden perspective-1000">
      {/* Background Ambience */}
      <div className="absolute inset-0 graph-grid opacity-[0.25] pointer-events-none" />
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none bg-[#B87333]/10" />

      {/* Global CSS for 3D and Radar Effects */}
      <style>{`
        @keyframes radar-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .radar-sweep {
          background: conic-gradient(from 0deg, transparent 70%, rgba(184, 115, 51, 0.4) 100%);
          border-radius: 50%;
          animation: radar-spin 3s linear infinite;
        }
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .tilt-card { transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .tilt-card:hover { transform: translateY(-5px) rotateX(5deg) rotateY(-5deg) scale(1.02); box-shadow: 0 25px 50px -12px rgba(184, 115, 51, 0.25); z-index: 10; }
        .pulse-border { animation: pulse-border 2s infinite; }
        @keyframes pulse-border {
            0%, 100% { border-color: rgba(184, 115, 51, 0.3); }
            50% { border-color: rgba(184, 115, 51, 1); box-shadow: 0 0 10px rgba(184, 115, 51, 0.5); }
        }
      `}</style>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/physics-tools')}
              className="group flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-[#E5E7EB] text-[#8C5523] shadow-sm hover:border-[#B87333]/30 hover:bg-[#F8F4EF] hover:shadow-md transition-all active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1E293B] tracking-tight flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-[#B87333]" />
                Tra Cứu Hằng Số Vật Lý
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Lưu trữ định mức và trị số chuẩn quốc tế
              </p>
            </div>
          </div>
        </div>

        {/* Radar Search and Filter Area */}
        <div className="bg-white rounded-[2rem] border border-[#E5E7EB] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] p-8 mb-12 relative z-50 group">
          {/* Decorative Radar background (wrapped to keep corners clipped) */}
          <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
            <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 -translate-x-1/2 w-[300px] h-[300px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000">
              <div className="absolute inset-0 rounded-full border border-[#B87333]/20" />
              <div className="absolute inset-[30px] rounded-full border border-[#B87333]/15" />
              <div className="absolute inset-[60px] rounded-full border border-[#B87333]/10" />
              <div className="absolute inset-0 radar-sweep" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 relative z-30">
            {/* Search */}
            <div className="relative">
              <label className="flex items-center gap-2 text-xs font-black text-slate-400 tracking-[0.1em] uppercase mb-2">
                <Search className="w-3 h-3" /> Tìm Kiếm Hằng Số
              </label>
              <div className="relative group-focus-within/search">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within/search:text-[#B87333] transition-colors" />
                <input
                  type="text"
                  placeholder="Khởi chạy dò tìm hằng số..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#F8F4EF]/50 backdrop-blur-sm border-2 border-[#E5E7EB] rounded-2xl focus:ring-4 focus:ring-[#B87333]/10 focus:border-[#B87333] text-[#1E293B] font-semibold text-lg transition-all placeholder:text-slate-400 shadow-inner"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <label className="flex items-center gap-2 text-xs font-black text-slate-400 tracking-[0.1em] uppercase mb-2">
                Danh Mục Hằng Số
              </label>
              <div className="relative" ref={dropdownRef}>
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full pl-12 pr-4 py-4 bg-[#F8F4EF]/50 backdrop-blur-sm border-2 ${isDropdownOpen ? 'border-[#B87333] ring-4 ring-[#B87333]/10' : 'border-[#E5E7EB]'} rounded-2xl text-[#1E293B] font-semibold text-lg transition-all shadow-inner flex items-center justify-between outline-none`}
                >
                  <span className="truncate">{selectedCategory === 'all' ? 'Tất cả danh mục' : selectedCategory}</span>
                  <div className={`w-2 h-2 border-b-2 border-r-2 border-[#8C5523] transform origin-center transition-transform duration-300 ${isDropdownOpen ? '-rotate-135 -translate-y-1' : 'rotate-45'}`} />
                </button>
                
                {/* Custom Options List */}
                <div 
                  className={`absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] z-50 overflow-hidden transition-all duration-300 transform origin-top ${isDropdownOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}
                >
                  <div className="max-h-[300px] overflow-y-auto w-full custom-scrollbar">
                     {/* Option: All */}
                     <button
                        onClick={() => {
                           setSelectedCategory('all');
                           setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-5 py-3 hover:bg-[#F8F4EF] hover:text-[#B87333] transition-colors font-medium ${selectedCategory === 'all' ? 'bg-[#FDFCF8] text-[#B87333]' : 'text-slate-600'}`}
                     >
                        Tất cả danh mục
                     </button>
                     
                     {/* Categories */}
                     {categories.filter(c => c !== 'all').map(category => (
                        <button
                          key={category}
                          onClick={() => {
                             setSelectedCategory(category);
                             setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-5 py-3 hover:bg-[#F8F4EF] hover:text-[#B87333] transition-colors font-medium ${selectedCategory === category ? 'bg-[#FDFCF8] text-[#B87333]' : 'text-slate-600'}`}
                        >
                          {category}
                        </button>
                     ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 bg-[#1E293B] p-4 rounded-xl border border-white/10 relative z-10 shadow-inner">
            <span className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22C55E]" />
              <span className="text-slate-300">Tìm thấy:</span>
              <strong className="text-[#D4AF37] text-lg font-mono">{filteredConstants.length}</strong> <span className="text-slate-400">hằng số</span>
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-[#D4AF37] hover:text-white px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg shadow-sm border border-white/10 ml-auto transition-colors focus:ring-2 focus:ring-[#D4AF37]"
              >
                Hủy Bộ Lọc
              </button>
            )}
          </div>
        </div>

        {/* 3D Constants Grid - Grouped by Category */}
        <div className="space-y-16">
          {selectedCategory === 'all' ? (
            Object.entries(groupedConstants).map(([category, constants]) => (
              <div key={category} className="mb-8 relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-[#1E293B] rounded-xl shadow-lg border border-[#B87333]/30 shrink-0">
                    <Star className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <h2 className="text-2xl font-black text-[#1E293B] tracking-tight uppercase">
                    {category}
                  </h2>
                  <div className="flex-1 h-[2px] bg-gradient-to-r from-[#B87333]/50 to-transparent ml-4" />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {constants.map((constant) => (
                    <ConstantCard
                      key={constant.id}
                      constant={constant}
                      onCopy={handleCopy}
                      copied={copiedId === constant.id}
                      formatScientific={formatScientific}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
              {filteredConstants.map((constant) => (
                <ConstantCard
                  key={constant.id}
                  constant={constant}
                  onCopy={handleCopy}
                  copied={copiedId === constant.id}
                  formatScientific={formatScientific}
                />
              ))}
            </div>
          )}
        </div>

        {/* No results */}
        {filteredConstants.length === 0 && (
          <div className="bg-white rounded-[2rem] border-2 border-[#E5E7EB] p-16 text-center flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md">
            <div className="absolute inset-0 bg-[#F8F4EF] opacity-50 graph-grid" />
            <Scan className="w-20 h-20 text-slate-300 mb-6 relative z-10" />
            <p className="text-2xl font-black text-[#1E293B] tracking-tight relative z-10">
              Không tìm thấy tín hiệu
            </p>
            <p className="text-slate-500 mt-2 font-medium relative z-10">Vòng quét radar không thu được kết quả. Vui lòng mở rộng băng tần tìm kiếm.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Component Card cho mỗi hằng số (3D Style)
const ConstantCard = ({ constant, onCopy, copied, formatScientific }) => {
  return (
    <div className="transform-style-3d tilt-card bg-white/80 backdrop-blur-xl rounded-[1.5rem] shadow-[0_10px_20px_-10px_rgba(0,0,0,0.08)] p-6 border-y border-b-[#E5E7EB] border-t-white relative group flex flex-col h-full overflow-hidden before:absolute before:inset-0 before:border-2 before:border-transparent hover:before:border-[#B87333]/30 before:rounded-[1.5rem] before:transition-colors before:pointer-events-none">

      {/* Decorative tag background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#B87333]/[0.05] to-transparent pointer-events-none rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-6 relative z-10 transform translate-z-[20px]">
        <div className="flex-1 pr-4">
          <span className="inline-block px-3 py-1 text-[10px] font-black tracking-widest uppercase bg-[#1E293B] border border-black/20 text-[#D4AF37] rounded-full mb-3 shadow-inner">
            {constant.category}
          </span>
          <h3 className="text-xl font-bold text-[#1E293B] leading-tight drop-shadow-sm">
            {constant.name}
          </h3>
        </div>
        <button
          onClick={() => onCopy(constant)}
          className="p-3 bg-white border border-[#E5E7EB] group-hover:bg-[#1E293B] group-hover:border-[#1E293B] group-hover:shadow-[0_5px_15px_rgba(184,115,51,0.3)] rounded-xl transition-all shrink-0 active:scale-90"
          title="Trích xuất phân đoạn"
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-500 group-hover:text-green-400" />
          ) : (
            <Copy className="w-5 h-5 text-slate-400 group-hover:text-[#D4AF37]" />
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4 relative z-10 transform translate-z-[10px]">
        <div className="grid grid-cols-3 gap-0 bg-[#FDFCF8] border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-inner group-hover:border-[#B87333]/20 transition-colors">
          {/* Symbol */}
          <div className="col-span-1 p-4 bg-white/50 border-r border-[#E5E7EB] flex flex-col items-center justify-center text-center">
            <p className="text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase mb-2">Đinh danh</p>
            <p className="text-3xl font-black text-[#8C5523] font-mono leading-none drop-shadow-sm">
              {constant.symbol}
            </p>
          </div>

          {/* Value (Digital terminal screen inside card) */}
          <div className="col-span-2 p-4 bg-[#0F172A] relative overflow-hidden flex flex-col justify-center">
            <div className="absolute inset-0 bg-[#D4AF37]/5 pointer-events-none" />
            <p className="text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase mb-2 relative z-10">Thông số kỹ trị</p>
            <div className="flex items-baseline gap-2 relative z-10 w-full overflow-hidden">
              <p className="text-lg font-mono font-bold text-[#D4AF37] leading-tight truncate">
                {formatScientific(constant.value)}
              </p>
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase relative z-10">
              [{constant.unit}]
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="px-2 mt-3 transform translate-z-[5px]">
          <p className="text-[13px] font-medium text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors">
            {constant.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConstantsReference;

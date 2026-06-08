/**
 * VirtualLabHome.jsx — PHÒNG THÍ NGHIỆM VẬT LÝ ẢO
 * Redesigned: Eureka Arena Style — Clean, High-End & Professional
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, 
  FlaskConical, 
  Gauge, 
  Lightbulb, 
  Waves, 
  Thermometer,
  CircuitBoard, 
  Orbit, 
  Lock, 
  Star, 
  Search, 
  X, 
  BookOpen, 
  GraduationCap,
  Zap, 
  Microscope, 
  Play, 
  ChevronRight, 
  Filter,
  Beaker,
  Sparkles
} from 'lucide-react';

const VirtualLabHome = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('category');

  const grades = [
    { id: 'all', label: 'Tất cả' },
    { id: 8, label: 'Lớp 8' },
    { id: 9, label: 'Lớp 9' },
    { id: 10, label: 'Lớp 10' },
    { id: 11, label: 'Lớp 11' },
    { id: 12, label: 'Lớp 12' }
  ];

  const experimentCategories = [
    {
      id: 'mechanics', title: 'Cơ học', icon: Gauge,
      color: 'from-blue-500 to-blue-600', accent: '#3b82f6',
      experiments: [
        { id: 'free-fall', name: 'Đo gia tốc rơi tự do', description: 'Thả vật rơi tự do, đo thời gian và tính gia tốc g', grade: 10, difficulty: 2, available: true, path: '/vatly/virtual-lab/free-fall', chapterName: 'Động học' },
        { id: 'pendulum', name: 'Dao động con lắc đơn', description: 'Khảo sát dao động của con lắc đơn, xác định chu kỳ', grade: 10, difficulty: 3, available: true, path: '/vatly/virtual-lab/pendulum', chapterName: 'Dao động' },
        { id: 'inclined-plane', name: 'Mặt phẳng nghiêng', description: 'Khảo sát chuyển động có gia tốc trên mặt phẳng nghiêng', grade: 10, difficulty: 2, available: true, path: '/vatly/virtual-lab/inclined-plane', chapterName: 'Động lực học' }
      ]
    },
    {
      id: 'electricity', title: 'Điện học', icon: CircuitBoard,
      color: 'from-amber-500 to-orange-500', accent: '#f59e0b',
      experiments: [
        { id: 'ohm-law', name: 'Định luật Ôm', description: 'Xác minh mối quan hệ U-I-R trong mạch điện', grade: 9, difficulty: 2, available: true, path: '/vatly/virtual-lab/ohm-law', chapterName: 'Điện học' },
        { id: 'resistor-circuit', name: 'Mạch điện trở', description: 'Đo điện trở trong mạch nối tiếp và song song', grade: 9, difficulty: 3, available: true, path: '/vatly/virtual-lab/resistor-circuit', chapterName: 'Điện học' }
      ]
    },
    {
      id: 'optics', title: 'Quang học', icon: Lightbulb,
      color: 'from-purple-500 to-pink-500', accent: '#a855f7',
      experiments: [
        { id: 'lens-focal', name: 'Đo tiêu cự thấu kính', description: 'Xác định tiêu cự thấu kính hội tụ bằng phương pháp ảnh rõ nét', grade: 9, difficulty: 3, available: true, path: '/vatly/virtual-lab/lens-focal', chapterName: 'Quang học' },
        { id: 'light-interference', name: 'Giao thoa ánh sáng', description: 'Quan sát vân giao thoa và đo bước sóng ánh sáng', grade: 12, difficulty: 4, available: true, path: '/vatly/virtual-lab/light-interference', chapterName: 'Sóng ánh sáng' }
      ]
    },
    {
      id: 'waves', title: 'Dao động & Sóng', icon: Waves,
      color: 'from-cyan-500 to-teal-500', accent: '#06b6d4',
      experiments: [
        { id: 'standing-wave', name: 'Sóng dừng trên dây', description: 'Tạo sóng dừng và xác định bước sóng', grade: 12, difficulty: 3, available: true, path: '/vatly/virtual-lab/standing-wave', chapterName: 'Dao động cơ' }
      ]
    },
    {
      id: 'thermodynamics', title: 'Nhiệt học', icon: Thermometer,
      color: 'from-rose-500 to-red-500', accent: '#f43f5e',
      experiments: [
        { id: 'calorimeter', name: 'Nhiệt lượng kế', description: 'Xác định nhiệt dung riêng bằng phương pháp cân bằng nhiệt', grade: 8, difficulty: 3, available: true, path: '/vatly/virtual-lab/calorimeter', chapterName: 'Nhiệt học' }
      ]
    }
  ];

  const allExperiments = useMemo(() => {
    return experimentCategories.flatMap(cat =>
      cat.experiments.map(exp => ({ ...exp, categoryId: cat.id, categoryTitle: cat.title, categoryIcon: cat.icon, categoryColor: cat.color, categoryAccent: cat.accent }))
    );
  }, []);

  const filteredExperiments = useMemo(() => {
    return allExperiments.filter(exp => {
      if (selectedGrade !== 'all' && exp.grade !== selectedGrade) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return exp.name.toLowerCase().includes(q) || exp.description.toLowerCase().includes(q) || exp.chapterName?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allExperiments, selectedGrade, searchQuery]);

  const filteredCategories = useMemo(() => {
    return experimentCategories.map(cat => ({
      ...cat,
      experiments: cat.experiments.filter(exp => {
        if (selectedGrade !== 'all' && exp.grade !== selectedGrade) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return exp.name.toLowerCase().includes(q) || exp.description.toLowerCase().includes(q);
        }
        return true;
      })
    })).filter(cat => cat.experiments.length > 0);
  }, [selectedGrade, searchQuery]);

  const renderDifficulty = (level) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4].map(i => (
        <Star key={i} size={10} className={i <= level ? 'text-[#2a4095] fill-[#2a4095]' : 'text-slate-200 fill-slate-200'} />
      ))}
    </div>
  );

  const ExperimentCard = ({ exp }) => {
    const CatIcon = exp.categoryIcon;
    return (
      <div
        onClick={() => exp.available && navigate(exp.path)}
        className={`group relative bg-white/70 backdrop-blur-md rounded-[2rem] p-6 border-2 transition-all duration-500 overflow-hidden ${
          exp.available
            ? 'border-white/80 hover:border-[#274dad]/30 hover:shadow-[0_20px_50px_rgba(39,77,173,0.12)] hover:-translate-y-2 cursor-pointer'
            : 'border-slate-100 opacity-60 grayscale cursor-not-allowed'
        }`}
      >
        {/* Hover Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 opacity-0 group-hover:opacity-[0.03] ${exp.categoryColor}`}></div>

        {/* Status Badge */}
        {!exp.available && (
          <div className="absolute top-4 right-4 z-20">
             <div className="bg-slate-100 p-2 rounded-full border border-slate-200">
               <Lock className="text-slate-400 w-4 h-4" />
             </div>
          </div>
        )}

        {/* Icon & Grade */}
        <div className="flex items-start justify-between mb-6">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${exp.categoryColor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 p-3.5`}>
            {CatIcon && <CatIcon className="text-white w-full h-full" />}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Phase {exp.difficulty}</span>
            <span className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[11px] text-[#274dad] font-black shadow-sm">
                LỚP {exp.grade}
            </span>
          </div>
        </div>

        {/* Content */}
        <div>
           <h3 className="text-xl font-black text-slate-800 leading-tight mb-2 group-hover:text-[#274dad] transition-colors">
             {exp.name}
           </h3>
           <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-2 font-medium mb-6">
             {exp.description}
           </p>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <span className="text-[10px] font-bold text-slate-400">ĐỘ KHÓ</span>
             {renderDifficulty(exp.difficulty)}
           </div>
           
           {exp.available && (
             <div className="flex items-center gap-1.5 text-xs font-black text-[#274dad] uppercase tracking-wider group-hover:gap-2.5 transition-all duration-300">
                Thực hành <Play className="w-3 h-3 fill-current" />
             </div>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans overflow-x-hidden pb-20">
      {/* ── BACKGROUND ELEMENTS ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-cyan-100/30 blur-[100px] rounded-full"></div>
        <div className="absolute top-[30%] left-[60%] w-[25%] h-[25%] bg-indigo-100/20 blur-[90px] rounded-full"></div>
        
        {/* Subtle Geometric Grid */}
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'radial-gradient(#274dad 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-28">

        {/* ── HERO SECTION ── */}
        <div className="mb-16">
          <div className="flex flex-col lg:flex-row items-center gap-12 bg-white/60 backdrop-blur-3xl rounded-[3rem] p-10 md:p-16 border-2 border-white shadow-[0_20px_60px_rgba(39,77,173,0.08)] relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#274dad]/[0.02] to-transparent pointer-events-none"></div>

            <div className="flex-1 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-50 border border-cyan-100 rounded-full text-cyan-600 text-xs font-black tracking-widest mb-6 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                LAB SIMULATION — LIVE
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-slate-800 leading-tight mb-6">
                Phòng Thí Nghiệm <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a4095] to-[#274dad]">
                  Ảo Tương Tác
                </span>
              </h1>
              
              <p className="text-slate-500 text-lg md:text-xl max-w-2xl leading-relaxed mb-8 font-medium">
                Tương tác với hệ thống mô phỏng độ chính xác cao, thu thập dữ liệu thực tế và kiểm chứng các định luật vật lý nền tảng.
              </p>

              <div className="flex flex-wrap gap-5">
                {[
                  { icon: Gauge, text: 'Độ chính xác cao', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { icon: Beaker, text: 'Hơn 12 bài thí nghiệm', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { icon: Sparkles, text: 'Trải nghiệm Ảo hóa', color: 'text-cyan-600', bg: 'bg-cyan-50' },
                ].map((item, i) => {
                  const I = item.icon;
                  return (
                    <div key={i} className={`flex items-center gap-2.5 ${item.bg} px-4 py-2 rounded-2xl shadow-sm border border-white/50`}>
                      <I className={`w-4 h-4 ${item.color}`} />
                      <span className={`text-[13px] font-black ${item.color} tracking-tight uppercase`}>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
               <div className="absolute inset-0 bg-gradient-to-br from-[#274dad] to-[#2a4095] rounded-[3rem] rotate-6 opacity-10"></div>
               <div className="absolute inset-0 bg-white rounded-[3rem] -rotate-3 border border-slate-100 shadow-xl flex items-center justify-center transform group-hover:rotate-0 transition-transform duration-700">
                  <Microscope className="text-[#274dad] w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl" />
               </div>
               
               {/* Decorative floating dots */}
               <div className="absolute top-4 right-4 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
               <div className="absolute bottom-10 left-[-10px] w-6 h-6 bg-blue-500 rounded-full blur-[1px]"></div>
            </div>
          </div>
        </div>

        {/* ── CONSOLE (SEARCH & FILTERS) ── */}
        <div className="sticky top-28 z-30 mb-12">
          <div className="bg-white/80 backdrop-blur-2xl border-2 border-white rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col lg:flex-row gap-5 items-center">
              
              {/* Search Bar */}
              <div className="relative w-full lg:flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-[#274dad] transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm tên bài thí nghiệm hoặc chương học..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-12 py-4 bg-slate-50/50 hover:bg-white border-2 border-slate-50 focus:border-[#274dad]/30 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-sm font-bold shadow-inner"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* View/Filter Toggles */}
              <div className="flex items-center p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/40 w-full lg:w-fit">
                {[{ mode: 'category', icon: Filter, label: 'PHÂN LOẠI' }, { mode: 'grade', icon: GraduationCap, label: 'KHỐI LỚP' }].map(item => {
                  const I = item.icon;
                  return (
                    <button
                      key={item.mode}
                      onClick={() => setViewMode(item.mode)}
                      className={`flex flex-1 lg:flex-none items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-[11px] font-black tracking-widest transition-all ${
                        viewMode === item.mode 
                        ? 'bg-white text-[#2a4095] shadow-[0_4px_12px_rgba(0,0,0,0.06)] scale-105' 
                        : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <I className="w-4 h-4" />{item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Pills */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3">
               <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Khối lớp</span>
               </div>
               
               {grades.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGrade(g.id)}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
                      selectedGrade === g.id
                        ? 'bg-[#274dad] text-white shadow-[0_8px_20px_rgba(39,77,173,0.2)] scale-105'
                        : 'bg-white text-slate-500 hover:text-[#274dad] border border-slate-100 hover:border-[#274dad]/30 hover:scale-105'
                    }`}
                  >
                    {g.label}
                  </button>
               ))}

               <div className="ml-auto hidden md:flex items-center gap-2">
                  <span className="text-xs font-black text-slate-300 uppercase tracking-tighter">Results</span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-xs font-black">
                     {filteredExperiments.length}
                  </span>
               </div>
            </div>
          </div>
        </div>

        {/* ── GRID RENDERER ── */}
        <div className="relative">
          {filteredExperiments.length === 0 ? (
            <div className="text-center py-32 bg-white/40 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-slate-200 mt-8">
              <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-200 transform -rotate-6">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Không tìm thấy thí nghiệm</h3>
              <p className="text-slate-500 mb-8 font-medium">Bạn hãy thử từ khóa khác hoặc thay đổi lớp học xem sao!</p>
              <button
                onClick={() => { setSelectedGrade('all'); setSearchQuery(''); }}
                className="px-8 py-4 bg-[#274dad] text-white rounded-2xl shadow-xl hover:-translate-y-1 transition-all font-black text-sm tracking-widest active:scale-95"
              >
                HIỂN THỊ TẤT CẢ
              </button>
            </div>
          ) : viewMode === 'category' ? (
            <div className="space-y-16">
              {filteredCategories.map(category => {
                const CatIcon = category.icon;
                return (
                  <div key={category.id} className="animate-fade-in">
                    <div className="flex items-center gap-5 mb-8 pl-2">
                       <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                          <CatIcon className="text-white w-6 h-6" />
                       </div>
                       <div>
                         <h2 className="text-2xl font-black text-slate-800 tracking-tight">{category.title}</h2>
                         <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">{category.experiments.length} BÀI THỰC HÀNH</p>
                       </div>
                       <div className="flex-1 h-1 bg-slate-100 rounded-full ml-4"></div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {category.experiments.map(exp => (
                         <ExperimentCard key={exp.id} exp={{ ...exp, categoryColor: category.color, categoryIcon: category.icon }} />
                       ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-16">
              {[...new Set(filteredExperiments.map(e => e.grade))].sort((a,b) => a-b).map(grade => {
                const gradeExps = filteredExperiments.filter(e => e.grade === grade);
                return (
                  <div key={grade} className="animate-fade-in">
                    <div className="flex items-center gap-5 mb-8 pl-2">
                       <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2a4095] to-[#274dad] flex items-center justify-center shadow-lg">
                          <GraduationCap className="text-white w-6 h-6" />
                       </div>
                       <div>
                         <h2 className="text-2xl font-black text-slate-800 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">LỚP {grade}</h2>
                         <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">{gradeExps.length} BÀI THỰC HÀNH</p>
                       </div>
                       <div className="flex-1 h-1 bg-slate-100 rounded-full ml-4"></div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {gradeExps.map(exp => <ExperimentCard key={exp.id} exp={exp} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── FOOTER STATUS ── */}
        <div className="mt-24 pt-10 border-t border-slate-100 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </div>
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Hệ thống đang liên tục cập nhật thêm thí nghiệm mới</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualLabHome;


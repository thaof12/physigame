/**
 * VirtualLabHome.jsx — KHU MÔ PHỎNG VẬT LÝ ẢO
 * Redesigned: Sci-Fi VR Simulation Room — Dark Blue Aesthetic
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SolarSystemBackground from '../../../../components/animations/SolarSystemBackground';
import {
  ArrowLeft, FlaskConical, Gauge, Lightbulb, Waves, Thermometer,
  CircuitBoard, Orbit, Lock, Star, Search, X, BookOpen, GraduationCap,
  Zap, Microscope, Play, ChevronRight, Filter
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
      color: 'from-blue-500 to-cyan-500', glowColor: 'rgba(59,130,246,0.3)',
      experiments: [
        { id: 'free-fall', name: 'Đo gia tốc rơi tự do', description: 'Thả vật rơi tự do, đo thời gian và tính gia tốc g', grade: 10, difficulty: 2, available: true, path: '/vatly/virtual-lab/free-fall', chapterName: 'Động học' },
        { id: 'pendulum', name: 'Dao động con lắc đơn', description: 'Khảo sát dao động của con lắc đơn, xác định chu kỳ', grade: 10, difficulty: 3, available: true, path: '/vatly/virtual-lab/pendulum', chapterName: 'Dao động' },
        { id: 'inclined-plane', name: 'Mặt phẳng nghiêng', description: 'Khảo sát chuyển động có gia tốc trên mặt phẳng nghiêng', grade: 10, difficulty: 2, available: true, path: '/vatly/virtual-lab/inclined-plane', chapterName: 'Động lực học' }
      ]
    },
    {
      id: 'electricity', title: 'Điện học', icon: CircuitBoard,
      color: 'from-amber-500 to-orange-500', glowColor: 'rgba(245,158,11,0.3)',
      experiments: [
        { id: 'ohm-law', name: 'Định luật Ôm', description: 'Xác minh mối quan hệ U-I-R trong mạch điện', grade: 9, difficulty: 2, available: true, path: '/vatly/virtual-lab/ohm-law', chapterName: 'Điện học' },
        { id: 'resistor-circuit', name: 'Mạch điện trở', description: 'Đo điện trở trong mạch nối tiếp và song song', grade: 9, difficulty: 3, available: true, path: '/vatly/virtual-lab/resistor-circuit', chapterName: 'Điện học' }
      ]
    },
    {
      id: 'optics', title: 'Quang học', icon: Lightbulb,
      color: 'from-purple-500 to-pink-500', glowColor: 'rgba(168,85,247,0.3)',
      experiments: [
        { id: 'lens-focal', name: 'Đo tiêu cự thấu kính', description: 'Xác định tiêu cự thấu kính hội tụ bằng phương pháp ảnh rõ nét', grade: 9, difficulty: 3, available: true, path: '/vatly/virtual-lab/lens-focal', chapterName: 'Quang học' },
        { id: 'light-interference', name: 'Giao thoa ánh sáng', description: 'Quan sát vân giao thoa và đo bước sóng ánh sáng', grade: 12, difficulty: 4, available: true, path: '/vatly/virtual-lab/light-interference', chapterName: 'Sóng ánh sáng' }
      ]
    },
    {
      id: 'waves', title: 'Dao động & Sóng', icon: Waves,
      color: 'from-cyan-500 to-teal-500', glowColor: 'rgba(6,182,212,0.3)',
      experiments: [
        { id: 'standing-wave', name: 'Sóng dừng trên dây', description: 'Tạo sóng dừng và xác định bước sóng', grade: 12, difficulty: 3, available: true, path: '/vatly/virtual-lab/standing-wave', chapterName: 'Dao động cơ' }
      ]
    },
    {
      id: 'thermodynamics', title: 'Nhiệt học', icon: Thermometer,
      color: 'from-rose-500 to-red-500', glowColor: 'rgba(244,63,94,0.3)',
      experiments: [
        { id: 'calorimeter', name: 'Nhiệt lượng kế', description: 'Xác định nhiệt dung riêng bằng phương pháp cân bằng nhiệt', grade: 8, difficulty: 3, available: true, path: '/vatly/virtual-lab/calorimeter', chapterName: 'Nhiệt học' }
      ]
    }
  ];

  const allExperiments = useMemo(() => {
    return experimentCategories.flatMap(cat =>
      cat.experiments.map(exp => ({ ...exp, categoryId: cat.id, categoryTitle: cat.title, categoryIcon: cat.icon, categoryColor: cat.color }))
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
        <Star key={i} size={10} className={i <= level ? 'text-amber-400 fill-amber-400' : 'text-slate-700 fill-slate-700'} />
      ))}
    </div>
  );

  const ExperimentCard = ({ exp }) => {
    const CatIcon = exp.categoryIcon;
    return (
      <div
        onClick={() => exp.available && navigate(exp.path)}
        className={`group relative rounded-2xl border overflow-hidden transition-all duration-400 transform ${
          exp.available
            ? 'bg-slate-900/70 backdrop-blur-md border-slate-700 hover:border-cyan-500/50 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] cursor-pointer'
            : 'bg-slate-900/30 border-slate-800 opacity-50 grayscale cursor-not-allowed'
        }`}
      >
        {/* Top accent line */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${exp.categoryColor || 'from-cyan-500 to-blue-500'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

        {!exp.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 z-10">
            <div className="bg-slate-800 p-3 rounded-full border border-slate-600">
              <Lock className="text-slate-500 w-5 h-5" />
            </div>
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${exp.categoryColor || 'from-cyan-500 to-blue-500'} flex items-center justify-center shadow-lg flex-shrink-0`}>
              {CatIcon && <CatIcon className="text-white w-5 h-5" />}
            </div>
            <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 font-bold">
              Lớp {exp.grade}
            </span>
          </div>

          <h3 className="font-bold text-white text-base mb-2 leading-tight group-hover:text-cyan-300 transition-colors">
            {exp.name}
          </h3>
          <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">{exp.description}</p>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Độ khó:</span>
              {renderDifficulty(exp.difficulty)}
            </div>
            {exp.available && (
              <div className="flex items-center gap-1 text-xs text-cyan-400 font-bold group-hover:gap-2 transition-all">
                <Play className="w-3 h-3 fill-current" />
                Khởi động
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative bg-slate-950 font-sans pb-20">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <SolarSystemBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/70 to-slate-950"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-8">

        {/* ── MASTHEAD ── */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/program/physics')}
            className="group flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium mb-6 bg-cyan-950/30 px-5 py-2.5 rounded-full border border-cyan-800/50 w-fit backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            TRẠM ĐIỀU HÀNH
          </button>

          <div className="relative w-full rounded-[2rem] bg-slate-900/60 backdrop-blur-3xl border border-emerald-500/20 overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.1)] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-emerald-900/30 to-transparent pointer-events-none"></div>
            <div className="relative z-10 flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold mb-4 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                KHU MÔ PHỎNG VẬT LÝ ẢO — ONLINE
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                Phòng Thí Nghiệm <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Ảo Tương Tác
                </span>
              </h1>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed mb-6 font-medium">
                Tương tác với thiết bị mô phỏng độ chính xác cao, thu thập dữ liệu thực nghiệm và kiểm chứng các định luật vật lý cổ điển.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                {[
                  { icon: Gauge, text: 'Đo lường chính xác', color: 'text-blue-400' },
                  { icon: FlaskConical, text: 'Thu thập số liệu', color: 'text-amber-400' },
                  { icon: Orbit, text: 'Mô phỏng vật lý thực', color: 'text-emerald-400' },
                ].map((item, i) => {
                  const I = item.icon;
                  return (
                    <div key={i} className={`flex items-center gap-2 ${item.color} font-semibold`}>
                      <I className="w-4 h-4" /><span>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative z-10 w-40 h-40 flex-shrink-0 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[inset_0_0_40px_rgba(16,185,129,0.2)]">
              <Microscope className="text-emerald-400 w-20 h-20" />
            </div>
          </div>
        </div>

        {/* ── SEARCH & FILTER CONSOLE ── */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-5 mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm thí nghiệm..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors text-sm font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 h-fit self-center border border-slate-700">
              {[{ mode: 'category', icon: Filter, label: 'Chủ đề' }, { mode: 'grade', icon: GraduationCap, label: 'Lớp' }].map(item => {
                const I = item.icon;
                return (
                  <button
                    key={item.mode}
                    onClick={() => setViewMode(item.mode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      viewMode === item.mode ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <I className="w-4 h-4" />{item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grade Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800">
            <span className="text-slate-500 text-xs font-bold mr-1 tracking-wider">LỌC THEO LỚP:</span>
            {grades.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGrade(g.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedGrade === g.id
                    ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {g.label}
              </button>
            ))}
            {(selectedGrade !== 'all' || searchQuery) && (
              <button
                onClick={() => { setSelectedGrade('all'); setSearchQuery(''); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all ml-1"
              >
                <X className="w-3 h-3" />Xóa lọc
              </button>
            )}
            <span className="ml-auto text-xs text-slate-500 font-bold">
              <span className="text-emerald-400">{filteredExperiments.length}</span> thí nghiệm
            </span>
          </div>
        </div>

        {/* ── EXPERIMENT GRID ── */}
        {filteredExperiments.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
              <Search className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Không tìm thấy thí nghiệm</h3>
            <p className="text-slate-500 mb-6">Điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
            <button
              onClick={() => { setSelectedGrade('all'); setSearchQuery(''); }}
              className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all font-bold"
            >
              Hiển thị tất cả
            </button>
          </div>
        ) : viewMode === 'category' ? (
          <div className="space-y-10">
            {filteredCategories.map(category => {
              const CatIcon = category.icon;
              return (
                <div key={category.id}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${category.color} shadow-lg`}>
                      <CatIcon className="text-white w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-white">{category.title}</h2>
                    <span className="text-sm text-slate-500 font-medium">{category.experiments.length} thí nghiệm</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.experiments.map(exp => (
                      <ExperimentCard key={exp.id} exp={{ ...exp, categoryColor: category.color, categoryIcon: category.icon }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-10">
            {[...new Set(filteredExperiments.map(e => e.grade))].sort((a,b) => a-b).map(grade => {
              const gradeExps = filteredExperiments.filter(e => e.grade === grade);
              return (
                <div key={grade}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                      <GraduationCap className="text-white w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-white">Lớp {grade}</h2>
                    <span className="text-sm text-slate-500">{gradeExps.length} thí nghiệm</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gradeExps.map(exp => <ExperimentCard key={exp.id} exp={exp} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── BOTTOM PROMO ── */}
        <div className="mt-16 text-center py-10 border-t border-slate-800/60">
          <div className="inline-flex items-center gap-2 text-emerald-400/70 text-sm font-bold tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            ĐỘI NGŨ KỸ THUẬT ĐANG PHÁT TRIỂN THÊM THÍ NGHIỆM MỚI...
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualLabHome;

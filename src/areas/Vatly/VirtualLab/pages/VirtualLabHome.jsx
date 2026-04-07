/**
 * VirtualLabHome.jsx - Trang chủ Phòng thí nghiệm ảo
 * 
 * Danh sách các thí nghiệm có sẵn để người dùng chọn
 * Hỗ trợ lọc theo lớp, chương và tìm kiếm
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LabBackground from '../../../../components/animations/LabBackground';
import AuthorSignature from '../../../../components/ui/AuthorSignature';
import { 
  ArrowLeft, 
  FlaskConical, 
  Gauge, 
  Lightbulb, 
  Waves, 
  Thermometer,
  CircuitBoard,
  Orbit,
  Timer,
  Lock,
  Star,
  Search,
  Filter,
  ChevronDown,
  X,
  BookOpen,
  GraduationCap
} from 'lucide-react';

const VirtualLabHome = () => {
  const navigate = useNavigate();
  
  // State cho filter và search
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('category'); // 'category' hoặc 'grade'
  const [showFilters, setShowFilters] = useState(true);

  // Danh sách các lớp
  const grades = [
    { id: 'all', label: 'Tất cả lớp' },
    { id: 8, label: 'Lớp 8' },
    { id: 9, label: 'Lớp 9' },
    { id: 10, label: 'Lớp 10' },
    { id: 11, label: 'Lớp 11' },
    { id: 12, label: 'Lớp 12' }
  ];

  // Danh sách thí nghiệm theo chủ đề
  const experimentCategories = [
    {
      id: 'mechanics',
      title: 'Cơ học',
      icon: Gauge,
      color: 'from-blue-500 to-blue-700',
      experiments: [
        {
          id: 'free-fall',
          name: 'Đo gia tốc rơi tự do',
          description: 'Thả vật rơi tự do, đo thời gian và tính gia tốc g',
          grade: 10,
          chapter: 1,
          chapterName: 'Động học chất điểm',
          difficulty: 2,
          available: true,
          path: '/vatly/virtual-lab/free-fall'
        },
        {
          id: 'pendulum',
          name: 'Dao động con lắc đơn',
          description: 'Khảo sát dao động của con lắc đơn, xác định chu kỳ và g',
          grade: 10,
          chapter: 1,
          chapterName: 'Động học chất điểm',
          difficulty: 3,
          available: true,
          path: '/vatly/virtual-lab/pendulum'
        },
        {
          id: 'inclined-plane',
          name: 'Chuyển động trên mặt phẳng nghiêng',
          description: 'Khảo sát chuyển động có gia tốc trên mặt phẳng nghiêng',
          grade: 10,
          chapter: 2,
          chapterName: 'Động lực học chất điểm',
          difficulty: 2,
          available: true,
          path: '/vatly/virtual-lab/inclined-plane'
        }
      ]
    },
    {
      id: 'electricity',
      title: 'Điện học',
      icon: CircuitBoard,
      color: 'from-yellow-500 to-orange-600',
      experiments: [
        {
          id: 'ohm-law',
          name: 'Khảo sát định luật Ôm',
          description: 'Xác minh mối quan hệ U-I-R trong mạch điện',
          grade: 9,
          chapter: 1,
          chapterName: 'Điện học',
          difficulty: 2,
          available: true,
          path: '/vatly/virtual-lab/ohm-law'
        },
        {
          id: 'resistor-circuit',
          name: 'Mạch điện trở',
          description: 'Đo điện trở trong mạch nối tiếp và song song',
          grade: 9,
          chapter: 1,
          chapterName: 'Điện học',
          difficulty: 3,
          available: true,
          path: '/vatly/virtual-lab/resistor-circuit'
        },
        {
          id: 'capacitor-circuit',
          name: 'Tụ điện trong mạch RC',
          description: 'Khảo sát quá trình nạp xả tụ điện trong mạch RC',
          grade: 11,
          chapter: 1,
          chapterName: 'Điện tích - Điện trường',
          difficulty: 3,
          available: true,
          path: '/vatly/virtual-lab/capacitor-circuit'
        }
      ]
    },
    {
      id: 'optics',
      title: 'Quang học',
      icon: Lightbulb,
      color: 'from-purple-500 to-pink-600',
      experiments: [
        {
          id: 'lens-focal',
          name: 'Đo tiêu cự thấu kính',
          description: 'Xác định tiêu cự thấu kính hội tụ bằng phương pháp ảnh rõ nét',
          grade: 9,
          chapter: 3,
          chapterName: 'Quang học',
          difficulty: 3,
          available: true,
          path: '/vatly/virtual-lab/lens-focal'
        },
        {
          id: 'light-interference',
          name: 'Giao thoa ánh sáng',
          description: 'Quan sát vân giao thoa và đo bước sóng ánh sáng',
          grade: 12,
          chapter: 2,
          chapterName: 'Sóng ánh sáng',
          difficulty: 4,
          available: true,
          path: '/vatly/virtual-lab/light-interference'
        },
        {
          id: 'light-reflection',
          name: 'Phản xạ ánh sáng',
          description: 'Khảo sát định luật phản xạ ánh sáng qua gương phẳng',
          grade: 7,
          chapter: 2,
          chapterName: 'Ánh sáng',
          difficulty: 2,
          available: true,
          path: '/vatly/virtual-lab/light-reflection'
        }
      ]
    },
    {
      id: 'waves',
      title: 'Dao động & Sóng',
      icon: Waves,
      color: 'from-cyan-500 to-teal-600',
      experiments: [
        {
          id: 'standing-wave',
          name: 'Sóng dừng trên dây',
          description: 'Tạo sóng dừng và xác định bước sóng',
          grade: 12,
          chapter: 1,
          chapterName: 'Dao động cơ',
          difficulty: 3,
          available: true,
          path: '/vatly/virtual-lab/standing-wave'
        },
        {
          id: 'spring-oscillation',
          name: 'Dao động con lắc lò xo',
          description: 'Khảo sát dao động điều hòa của con lắc lò xo',
          grade: 11,
          chapter: 1,
          chapterName: 'Dao động cơ',
          difficulty: 2,
          available: true,
          path: '/vatly/virtual-lab/spring-oscillation'
        },
        {
          id: 'wave-interference',
          name: 'Giao thoa sóng nước',
          description: 'Quan sát hiện tượng giao thoa của hai nguồn sóng',
          grade: 11,
          chapter: 2,
          chapterName: 'Sóng cơ',
          difficulty: 3,
          available: true,
          path: '/vatly/virtual-lab/wave-interference'
        }
      ]
    },
    {
      id: 'thermodynamics',
      title: 'Nhiệt học',
      icon: Thermometer,
      color: 'from-orange-500 to-red-600',
      experiments: [
        {
          id: 'calorimeter',
          name: 'Nhiệt lượng kế',
          description: 'Xác định nhiệt dung riêng bằng phương pháp cân bằng nhiệt',
          grade: 8,
          chapter: 2,
          chapterName: 'Nhiệt học',
          difficulty: 3,
          available: true,
          path: '/vatly/virtual-lab/calorimeter'
        },
        {
          id: 'gas-laws',
          name: 'Định luật khí lý tưởng',
          description: 'Khảo sát mối quan hệ P-V-T của chất khí',
          grade: 10,
          chapter: 5,
          chapterName: 'Chất khí',
          difficulty: 3,
          available: true,
          path: '/vatly/virtual-lab/gas-laws'
        }
      ]
    }
  ];

  // Lấy tất cả thí nghiệm dưới dạng flat array
  const allExperiments = useMemo(() => {
    const experiments = [];
    experimentCategories.forEach(category => {
      category.experiments.forEach(exp => {
        experiments.push({
          ...exp,
          categoryId: category.id,
          categoryTitle: category.title,
          categoryIcon: category.icon,
          categoryColor: category.color
        });
      });
    });
    return experiments;
  }, []);

  // Lọc thí nghiệm theo điều kiện
  const filteredExperiments = useMemo(() => {
    return allExperiments.filter(exp => {
      // Lọc theo lớp
      if (selectedGrade !== 'all' && exp.grade !== selectedGrade) {
        return false;
      }
      // Lọc theo chủ đề
      if (selectedCategory !== 'all' && exp.categoryId !== selectedCategory) {
        return false;
      }
      // Lọc theo từ khóa tìm kiếm
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          exp.name.toLowerCase().includes(query) ||
          exp.description.toLowerCase().includes(query) ||
          exp.chapterName?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [allExperiments, selectedGrade, selectedCategory, searchQuery]);

  // Nhóm thí nghiệm theo lớp
  const experimentsByGrade = useMemo(() => {
    const grouped = {};
    filteredExperiments.forEach(exp => {
      if (!grouped[exp.grade]) {
        grouped[exp.grade] = {
          grade: exp.grade,
          chapters: {}
        };
      }
      if (!grouped[exp.grade].chapters[exp.chapter]) {
        grouped[exp.grade].chapters[exp.chapter] = {
          chapter: exp.chapter,
          chapterName: exp.chapterName,
          experiments: []
        };
      }
      grouped[exp.grade].chapters[exp.chapter].experiments.push(exp);
    });
    
    // Sắp xếp theo lớp
    return Object.values(grouped).sort((a, b) => a.grade - b.grade);
  }, [filteredExperiments]);

  // Nhóm thí nghiệm theo chủ đề (đã lọc)
  const filteredCategories = useMemo(() => {
    return experimentCategories.map(category => ({
      ...category,
      experiments: category.experiments.filter(exp => {
        if (selectedGrade !== 'all' && exp.grade !== selectedGrade) {
          return false;
        }
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            exp.name.toLowerCase().includes(query) ||
            exp.description.toLowerCase().includes(query) ||
            exp.chapterName?.toLowerCase().includes(query)
          );
        }
        return true;
      })
    })).filter(category => category.experiments.length > 0);
  }, [selectedGrade, searchQuery]);

  // Reset filters
  const resetFilters = () => {
    setSelectedGrade('all');
    setSelectedCategory('all');
    setSearchQuery('');
  };

  // Render difficulty stars
  const renderDifficulty = (level) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            size={12}
            className={i <= level ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
          />
        ))}
      </div>
    );
  };

  // Experiment Card Component
  const ExperimentCard = ({ experiment: exp, navigate, renderDifficulty, showCategory = false }) => {
    const CategoryIcon = exp.categoryIcon;
    
    return (
      <div
        className={`
          relative rounded-2xl border overflow-hidden
          transition-all duration-500 transform hover:-translate-y-1
          ${exp.available 
            ? 'bg-black/40 backdrop-blur-md border-white/10 hover:border-emerald-400/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:bg-black/60 cursor-pointer' 
            : 'bg-black/20 backdrop-blur-sm border-white/5 opacity-60 grayscale'
          }
        `}
        onClick={() => exp.available && navigate(exp.path)}
      >
        {/* Lock overlay for unavailable */}
        {!exp.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
            <div className="bg-gray-800 p-2 rounded-full">
              <Lock className="text-gray-500" size={24} />
            </div>
          </div>
        )}

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-white pr-2">
              {exp.name}
            </h3>
            <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300 whitespace-nowrap">
              Lớp {exp.grade}
            </span>
          </div>

          {/* Category badge (for grade view) */}
          {showCategory && exp.categoryTitle && (
            <div className="flex items-center gap-1.5 mb-2">
              {CategoryIcon && (
                <div className={`p-1 rounded bg-gradient-to-br ${exp.categoryColor}`}>
                  <CategoryIcon className="text-white" size={12} />
                </div>
              )}
              <span className="text-xs text-gray-400">{exp.categoryTitle}</span>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {exp.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Độ khó:</span>
              {renderDifficulty(exp.difficulty)}
            </div>

            {exp.available && (
              <span className="text-xs text-emerald-400 font-medium">
                Bắt đầu →
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 font-sans text-white">
      <LabBackground />
      <AuthorSignature />
      <div className="relative z-10 pb-20">
      {/* Header */}
      <div className="bg-black/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/program/physics')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="text-gray-400" size={24} />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <FlaskConical className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Phòng Thí Nghiệm Ảo</h1>
                <p className="text-gray-400 text-sm">
                  Thực hành thí nghiệm Vật lý trực tuyến
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Intro Section */}
      <div className="max-w-6xl mx-auto px-4 py-8 relative">
        <div className="bg-black/50 backdrop-blur-md rounded-3xl p-8 border border-white/10 mb-8 shadow-[0_0_40px_rgba(16,185,129,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] group-hover:bg-emerald-500/30 transition-all duration-700 pointer-events-none"></div>
          <div className="flex items-start gap-6 relative z-10">
            <div className="p-4 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Timer className="text-emerald-400 w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Học Vật lý qua Thực hành
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Tương tác với các thiết bị thí nghiệm ảo, quan sát hiện tượng vật lý 
                và thu thập số liệu như trong phòng thí nghiệm thực. Mỗi thí nghiệm 
                được thiết kế theo chuẩn chương trình THCS và THPT.
              </p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2 text-blue-400">
                  <Gauge size={16} />
                  <span>Thiết bị đo chính xác</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-400">
                  <FlaskConical size={16} />
                  <span>Thu thập số liệu</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <Orbit size={16} />
                  <span>Mô phỏng vật lý thực</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Section */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm thí nghiệm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-900 rounded-xl p-1">
              <button
                onClick={() => setViewMode('category')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'category'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Filter size={16} />
                <span>Theo chủ đề</span>
              </button>
              <button
                onClick={() => setViewMode('grade')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'grade'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <GraduationCap size={16} />
                <span>Theo lớp</span>
              </button>
            </div>
          </div>

          {/* Grade Filter Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-gray-400 text-sm mr-2">Lọc theo lớp:</span>
            {grades.map((grade) => (
              <button
                key={grade.id}
                onClick={() => setSelectedGrade(grade.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedGrade === grade.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {grade.label}
              </button>
            ))}
            
            {/* Reset Button */}
            {(selectedGrade !== 'all' || searchQuery) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all ml-2"
              >
                <X size={14} />
                <span>Xóa bộ lọc</span>
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Tìm thấy <span className="text-emerald-400 font-semibold">{filteredExperiments.length}</span> thí nghiệm
              {selectedGrade !== 'all' && <span> trong Lớp {selectedGrade}</span>}
              {searchQuery && <span> cho "{searchQuery}"</span>}
            </p>
          </div>
        </div>

        {/* No Results */}
        {filteredExperiments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy thí nghiệm</h3>
            <p className="text-gray-400 mb-4">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {/* View by Category */}
        {viewMode === 'category' && filteredCategories.length > 0 && (
          <div className="space-y-8">
            {filteredCategories.map((category) => {
              const CategoryIcon = category.icon;
              
              return (
                <div key={category.id}>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}>
                      <CategoryIcon className="text-white" size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-white">{category.title}</h2>
                    <span className="text-sm text-gray-500">({category.experiments.length} thí nghiệm)</span>
                    <div className="flex-1 h-px bg-gray-700" />
                  </div>

                  {/* Experiments Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.experiments.map((exp) => (
                      <ExperimentCard
                        key={exp.id}
                        experiment={exp}
                        navigate={navigate}
                        renderDifficulty={renderDifficulty}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View by Grade */}
        {viewMode === 'grade' && experimentsByGrade.length > 0 && (
          <div className="space-y-10">
            {experimentsByGrade.map((gradeGroup) => (
              <div key={gradeGroup.grade}>
                {/* Grade Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                    <GraduationCap className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Lớp {gradeGroup.grade}</h2>
                    <p className="text-gray-400 text-sm">
                      {Object.keys(gradeGroup.chapters).length} chương • 
                      {Object.values(gradeGroup.chapters).reduce((acc, ch) => acc + ch.experiments.length, 0)} thí nghiệm
                    </p>
                  </div>
                  <div className="flex-1 h-px bg-gray-700" />
                </div>

                {/* Chapters */}
                <div className="space-y-6 pl-4 border-l-2 border-gray-700">
                  {Object.values(gradeGroup.chapters)
                    .sort((a, b) => a.chapter - b.chapter)
                    .map((chapterGroup) => (
                      <div key={chapterGroup.chapter}>
                        {/* Chapter Header */}
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="text-emerald-400" size={18} />
                          <h3 className="text-lg font-semibold text-emerald-400">
                            Chương {chapterGroup.chapter}: {chapterGroup.chapterName}
                          </h3>
                        </div>

                        {/* Chapter Experiments Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {chapterGroup.experiments.map((exp) => (
                            <ExperimentCard
                              key={exp.id}
                              experiment={exp}
                              navigate={navigate}
                              renderDifficulty={renderDifficulty}
                              showCategory
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon */}
        <div className="mt-12 text-center py-8 border-t border-white/10 bg-black/20 backdrop-blur-sm rounded-2xl">
          <p className="text-emerald-300/80 font-medium tracking-wide">
            🔬 Các thí nghiệm mới đang được thiết kế dành riêng cho bạn...
          </p>
        </div>
      </div>
      </div> {/* End wrapper z-10 */}
    </div>
  );
};

export default VirtualLabHome;

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, ArrowLeft, Video, FileText, ChevronRight } from 'lucide-react';
import { getPublishedLessons } from '../utils/lessonStorage';

const InteractiveLectureHub = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState(8);
  const [searchQuery, setSearchQuery] = useState('');
  const [publishedLessons, setPublishedLessons] = useState([]);

  // Load published lessons on mount and listen to storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setPublishedLessons(getPublishedLessons());
    };

    handleStorageChange();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('admin_lessons_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('admin_lessons_updated', handleStorageChange);
    };
  }, []);

  const grades = [6, 7, 8, 9, 10, 11, 12];

  // Search or filter by grade
  const currentGradeLectures = useMemo(() => {
    if (searchQuery) {
      return publishedLessons.filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.chapterTitle && l.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    } else {
      return publishedLessons.filter(l => String(l.grade) === String(selectedGrade));
    }
  }, [publishedLessons, selectedGrade, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-20 font-body">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 pt-28 md:pt-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button 
                onClick={() => navigate('/')}
                className="p-2 hover:bg-blue-100/50 rounded-full transition-colors text-[#2099e9]"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-[#1E293B] tracking-tight">
                THƯ VIỆN <span className="text-[#274dad]">BÀI GIẢNG</span>
              </h1>
            </div>
            <p className="font-body text-slate-500 text-lg font-medium ml-12">
              Tra cứu lý thuyết và video bài giảng theo khối lớp
            </p>
          </div>

          <div className="relative group w-full md:w-80">
            <input
              type="text"
              placeholder="Tìm kiếm bài giảng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6 pr-12 py-4 bg-white border-2 border-slate-100 rounded-full shadow-sm focus:border-[#274dad] focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-700"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#274dad] transition-colors" />
          </div>
        </div>

        {/* Grade Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-12 border-b border-slate-100 pb-8">
          {grades.map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`px-8 py-2.5 rounded-full font-heading font-extrabold text-sm transition-all ${
                selectedGrade === grade
                  ? 'bg-[#274dad] text-white shadow-lg shadow-blue-700/20 scale-105'
                  : 'bg-white text-slate-600 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30'
              }`}
            >
              LỚP {grade}
            </button>
          ))}
        </div>

        {/* Lectures Grid */}
        {currentGradeLectures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentGradeLectures.map((lecture) => (
              <div
                key={lecture.id}
                onClick={() => navigate(`/interactive-lectures/physics/class${lecture.grade}/${lecture.rawId || lecture.id}`)}
                className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
              >
                {/* Decorative background accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10">
                  <div className="text-[#274dad] text-xs font-black tracking-widest uppercase mb-4 opacity-70">
                    LỚP {lecture.grade} • BÀI {lecture.lessonNumber || (lecture.rawId ? lecture.rawId.replace('b', '') : '1')}
                  </div>
                  
                  <h3 className="font-heading text-xl font-bold text-[#1E293B] mb-4 leading-tight group-hover:text-[#274dad] transition-colors">
                    {lecture.title}
                  </h3>
                  
                  <p className="font-body text-slate-500 text-sm mb-8 line-clamp-2 font-medium">
                    {lecture.chapterTitle}
                  </p>
                </div>

                <div className="relative z-10 flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-6 text-[10px] font-black tracking-tighter text-slate-400 uppercase">
                    <div className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                      <Video className="w-3.5 h-3.5" />
                      <span>1 VIDEO</span>
                    </div>
                    <div className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                      <FileText className="w-3.5 h-3.5" />
                      <span>LÝ THUYẾT</span>
                    </div>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-[#274dad] group-hover:text-white transition-all transform translate-x-2 group-hover:translate-x-0 overflow-hidden">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/50 rounded-3xl border-2 border-dashed border-slate-100">
            <div className="text-4xl mb-4">🔬</div>
            <h3 className="font-heading text-xl font-bold text-slate-400">Không tìm thấy bài giảng nào phù hợp</h3>
            <p className="font-body text-slate-400 mt-1">Vui lòng thử từ khóa khác hoặc chọn khối lớp khác</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveLectureHub;

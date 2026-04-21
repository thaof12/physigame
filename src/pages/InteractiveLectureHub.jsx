import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, ArrowLeft, Video, FileText, ChevronRight } from 'lucide-react';
import { lectureData } from '../data/lectureData';

const InteractiveLectureHub = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState(8);
  const [searchQuery, setSearchQuery] = useState('');

  const grades = [6, 7, 8, 9, 10, 11, 12];

  // Flatten all lessons for the selected grade into a searchable list
  const currentGradeLectures = useMemo(() => {
    const data = lectureData.physics?.[selectedGrade] || {};
    const flattened = [];
    
    Object.entries(data).forEach(([chapterId, chapter]) => {
      chapter.lessons.forEach((lesson) => {
        flattened.push({
          ...lesson,
          chapterTitle: chapter.title,
          chapterId: chapterId,
          grade: selectedGrade
        });
      });
    });

    if (!searchQuery) return flattened;
    
    return flattened.filter(l => 
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedGrade, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-20">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button 
                onClick={() => navigate('/')}
                className="p-2 hover:bg-blue-100/50 rounded-full transition-colors text-[#2099e9]"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-4xl md:text-5xl font-black text-[#1E293B] tracking-tight">
                THƯ VIỆN <span className="text-[#274dad]">BÀI GIẢNG</span>
              </h1>
            </div>
            <p className="text-slate-500 text-lg font-medium ml-12">
              Tra cứu lý thuyết và video bài giảng theo khối lớp
            </p>
          </div>

          <div className="relative group w-full md:w-80">
            <input
              type="text"
              placeholder="Tìm kiếm bài giảng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6 pr-12 py-4 bg-white border-2 border-slate-100 rounded-full shadow-sm focus:border-[#274dad] focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
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
              className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all ${
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
                key={`${lecture.grade}-${lecture.id}`}
                onClick={() => navigate(`/interactive-lectures/physics/class${lecture.grade}/${lecture.id}`)}
                className="group bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all cursor-pointer relative overflow-hidden"
              >
                {/* Decorative background accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10">
                  <div className="text-[#274dad] text-xs font-black tracking-widest uppercase mb-4 opacity-70">
                    BÀI {lecture.id.replace('b', '')}
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#1E293B] mb-4 leading-tight group-hover:text-[#274dad] transition-colors">
                    {lecture.title}
                  </h3>
                  
                  <p className="text-slate-500 text-sm mb-8 line-clamp-2 font-medium">
                    {lecture.chapterTitle}
                  </p>
                  
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
                </div>

                <div className="absolute bottom-8 right-8 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-[#274dad] group-hover:text-white transition-all transform translate-x-4 group-hover:translate-x-0 overflow-hidden">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/50 rounded-3xl border-2 border-dashed border-slate-100">
            <div className="text-4xl mb-4">🔬</div>
            <h3 className="text-xl font-bold text-slate-400">Không tìm thấy bài giảng nào phù hợp</h3>
            <p className="text-slate-300">Vui lòng thử từ khóa khác hoặc chọn khối lớp khác</p>
          </div>
        )}
      </div>
    </div>
  );
};


export default InteractiveLectureHub;



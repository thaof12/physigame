import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Search, 
  ArrowLeft, 
  CheckCircle, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  BookOpen
} from 'lucide-react';
import { getPublishedLessons, getCurriculumStructure } from '../utils/lessonStorage';

const LectureViewer = () => {
  const { subject, grade, lectureId } = useParams();
  const navigate = useNavigate();
  const [currentLesson, setCurrentLesson] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Parse grade
  const gradeNum = useMemo(() => {
    return grade.startsWith('class') ? parseInt(grade.replace('class', ''), 10) : parseInt(grade, 10);
  }, [grade]);

  // Curriculum for sidebar
  const curriculum = useMemo(() => {
    return getCurriculumStructure(gradeNum);
  }, [gradeNum]);

  // Find the specific lesson to display from published admin storage
  useEffect(() => {
    const loadLesson = () => {
      const published = getPublishedLessons();
      let found = published.find(l => 
        (l.rawId === lectureId || l.id === lectureId) && String(l.grade) === String(gradeNum)
      );

      if (!found) {
        found = published.find(l => l.rawId === lectureId || l.id === lectureId);
      }

      if (found) {
        setCurrentLesson({
          ...found,
          chapterDescription: found.description
        });
        if (found.chapterTitle) {
          setExpandedChapters(prev => ({ ...prev, [found.chapterTitle]: true }));
        }
      }
    };

    loadLesson();

    window.addEventListener('storage', loadLesson);
    window.addEventListener('admin_lessons_updated', loadLesson);

    return () => {
      window.removeEventListener('storage', loadLesson);
      window.removeEventListener('admin_lessons_updated', loadLesson);
    };
  }, [gradeNum, lectureId]);

  const toggleChapter = (chTitle) => {
    setExpandedChapters(prev => ({ ...prev, [chTitle]: !prev[chTitle] }));
  };

  if (!currentLesson) return (
    <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center">
      <div className="animate-pulse text-[#274dad] font-bold">Đang tải bài giảng...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex pt-24 font-body">
      {/* Sidebar - Desktop */}
      <aside className="w-80 h-[calc(100vh-6rem)] sticky top-24 bg-white border-r border-slate-100 flex flex-col overflow-hidden shrink-0 hidden md:flex">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-50">
          <button 
            onClick={() => navigate(`/interactive-lectures`)}
            className="flex items-center gap-2 text-slate-400 hover:text-[#274dad] mb-6 transition-colors text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> QUAY LẠI
          </button>
          
          <div className="mb-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">LỚP HỌC</h4>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-700 text-sm">Vật lý Lớp {gradeNum}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              <span>TIẾN ĐỘ HÀNH TRÌNH</span>
              <span className="text-[#274dad]">HOÀN THÀNH</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="w-[65%] h-full bg-[#274dad]"></div>
            </div>
          </div>
        </div>

        {/* Curriculum List */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-6">CẤU TRÚC CHƯƠNG TRÌNH</h4>
          
          <div className="space-y-4">
            {Object.entries(curriculum).map(([chTitle, chapter], idx) => {
              const filteredLessons = chapter.lessons.filter(l => 
                l.title.toLowerCase().includes(searchQuery.toLowerCase())
              );
              
              if (searchQuery && filteredLessons.length === 0) return null;
              
              const lessonsToRender = searchQuery ? filteredLessons : chapter.lessons;
              const isChapterExpanded = searchQuery ? true : !!expandedChapters[chTitle];

              return (
                <div key={chTitle} className="space-y-2">
                  <button 
                    onClick={() => toggleChapter(chTitle)}
                    className="w-full flex items-start gap-3 text-left group"
                  >
                    <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${isChapterExpanded ? 'bg-blue-100 text-[#274dad] border border-blue-200' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                      {idx + 1}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-tight group-hover:text-[#274dad] transition-colors ${isChapterExpanded ? 'text-[#274dad]' : 'text-slate-600'}`}>
                      {chapter.title}
                    </span>
                    {isChapterExpanded ? <ChevronUp className="w-3 h-3 ml-auto text-slate-400" /> : <ChevronDown className="w-3 h-3 ml-auto text-slate-400" />}
                  </button>

                  {isChapterExpanded && (
                    <div className="ml-8 space-y-1 pt-1">
                      {lessonsToRender.map((lesson) => {
                        const isActive = lesson.id === lectureId || lesson.fullId === lectureId;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => navigate(`/interactive-lectures/physics/class${gradeNum}/${lesson.id}`)}
                            className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all ${isActive ? 'bg-blue-50 border border-blue-100 shadow-sm' : 'hover:bg-slate-50'}`}
                          >
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-[#274dad] text-white' : 'bg-slate-100 text-slate-400'}`}>
                              {isActive ? <Play className="w-3 h-3 fill-current" /> : <span className="text-[10px] font-bold">{lesson.id.replace('b', '')}</span>}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <div className={`text-[11px] font-bold truncate ${isActive ? 'text-[#274dad]' : 'text-slate-600'}`}>
                                {lesson.title}
                              </div>
                              <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase">
                                <span>MODULE {lesson.id.replace('b', '')}</span>
                                <span>• 20P</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Search */}
        <div className="p-6 border-t border-slate-50">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm bài học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs outline-none focus:border-blue-200 transition-all font-medium"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow h-[calc(100vh-6rem)] overflow-y-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Breadcrumb Tag */}
          <div className="inline-block px-4 py-1.5 bg-[#274dad] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-900/20">
            VẬT LÝ LỚP {gradeNum}
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl md:text-5xl font-black text-[#1E293B] leading-tight tracking-tight">
            {currentLesson.title}
          </h1>

          {/* Video Player Card */}
          <div className="bg-white rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/50 border border-slate-50">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#274dad]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-700">{currentLesson.title}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PHÒNG HỌC TRỰC TUYẾN</div>
                </div>
              </div>
              <div className="text-xs font-bold text-slate-400">
                Phát triển bởi <span className="text-[#274dad]">PhysiGame Team</span>
              </div>
            </div>

            <div className="aspect-video mt-4 rounded-3xl overflow-hidden bg-slate-900 shadow-inner relative group">
              {currentLesson.videoId ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube-nocookie.com/embed/${currentLesson.videoId}?autoplay=1&rel=0`}
                  title={currentLesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Video className="w-12 h-12" />
                  <p className="font-bold text-sm">Chưa có video cho bài học này</p>
                </div>
              )}
            </div>
          </div>

          {/* Lesson Content - Theory */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-50">
            <h2 className="font-heading text-[#274dad] text-2xl font-black mb-6 flex items-center gap-3">
               Nội dung bài học
            </h2>
            <div className="prose prose-slate max-w-none prose-h3:text-[#274dad] prose-h3:font-black prose-p:text-slate-600 prose-p:font-medium prose-li:text-slate-600 prose-li:font-medium">
              <h3 className="font-heading font-bold text-lg mb-4">{currentLesson.title}</h3>
              
              {currentLesson.content ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: currentLesson.content }} 
                  className="font-body text-slate-600 font-medium leading-relaxed"
                />
              ) : (
                <p className="font-body text-slate-600 font-medium mt-2">
                  {currentLesson.chapterDescription || currentLesson.description || 'Nội dung lý thuyết chi tiết đang được cập nhật cho bài học này. Vui lòng theo dõi video bài giảng để nắm bắt kiến thức đầy đủ.'}
                </p>
              )}
              
              <div className="mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                <h4 className="font-heading text-[#2099e9] font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Tóm tắt kiến thức
                </h4>
                <ul className="space-y-3 font-body font-medium list-disc pl-5">
                  {Array.isArray(currentLesson.summary) && currentLesson.summary.length > 0 ? (
                    currentLesson.summary.map((item, idx) => (
                      <li key={idx} className="text-slate-700">{item}</li>
                    ))
                  ) : (
                    <>
                      <li className="text-slate-700">Hiểu rõ các khái niệm cơ bản liên quan đến bài học.</li>
                      <li className="text-slate-700">Vận dụng các công thức để giải bài tập thực hành.</li>
                      <li className="text-slate-700">Liên hệ kiến thức với các hiện tượng thực tiễn đời sống.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LectureViewer;

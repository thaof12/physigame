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
  MessageSquare, 
  Edit3,
  BookOpen
} from 'lucide-react';
import { lectureData } from '../data/lectureData';

const LectureViewer = () => {
  const { subject, grade, lectureId } = useParams();
  const navigate = useNavigate();
  const [currentLesson, setCurrentLesson] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [note, setNote] = useState('');
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'qa'

  // Parse grade
  const gradeNum = useMemo(() => {
    return grade.startsWith('class') ? parseInt(grade.replace('class', '')) : parseInt(grade);
  }, [grade]);

  // All lessons for the sidebar
  const curriculum = useMemo(() => {
    return lectureData[subject]?.[gradeNum] || {};
  }, [subject, gradeNum]);

  // Find the specific lesson to display
  useEffect(() => {
    let found = null;
    let foundChapterId = null;

    Object.entries(curriculum).forEach(([chId, chapter]) => {
      const lesson = chapter.lessons.find(l => l.id === lectureId);
      if (lesson) {
        found = { ...lesson, chapterTitle: chapter.title, chapterDescription: chapter.description };
        foundChapterId = chId;
      }
    });

    if (found) {
      setCurrentLesson(found);
      // Automatically expand the chapter of the current lesson
      setExpandedChapters(prev => ({ ...prev, [foundChapterId]: true }));
    }
  }, [curriculum, lectureId]);

  const toggleChapter = (chId) => {
    setExpandedChapters(prev => ({ ...prev, [chId]: !prev[chId] }));
  };

  if (!currentLesson) return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
      <div className="animate-pulse text-[#B87333] font-bold">Đang tải bài giảng...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex">
      {/* Sidebar - Desktop */}
      <aside className="w-80 h-screen sticky top-0 bg-white border-r border-slate-100 flex flex-col overflow-hidden shrink-0 hidden md:flex">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-50">
          <button 
            onClick={() => navigate(`/interactive-lectures`)}
            className="flex items-center gap-2 text-slate-400 hover:text-[#B87333] mb-6 transition-colors text-sm font-bold"
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
              <span className="text-[#B87333]">3/12 MODULE</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="w-[25%] h-full bg-[#B87333]"></div>
            </div>
          </div>
        </div>

        {/* Curriculum List */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-6">CẤU TRÚC CHƯƠNG TRÌNH</h4>
          
          <div className="space-y-4">
            {Object.entries(curriculum).map(([chId, chapter]) => (
              <div key={chId} className="space-y-2">
                <button 
                  onClick={() => toggleChapter(chId)}
                  className="w-full flex items-start gap-3 text-left group"
                >
                  <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${expandedChapters[chId] ? 'bg-amber-100 text-[#B87333] border border-amber-200' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                    {parseInt(chId) + 1}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-tight group-hover:text-[#B87333] transition-colors ${expandedChapters[chId] ? 'text-[#B87333]' : 'text-slate-600'}`}>
                    {chapter.title}
                  </span>
                  {expandedChapters[chId] ? <ChevronUp className="w-3 h-3 ml-auto text-slate-400" /> : <ChevronDown className="w-3 h-3 ml-auto text-slate-400" />}
                </button>

                {expandedChapters[chId] && (
                  <div className="ml-8 space-y-1 pt-1">
                    {chapter.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => navigate(`/interactive-lectures/physics/class${gradeNum}/${lesson.id}`)}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all ${lesson.id === lectureId ? 'bg-amber-50 border border-amber-100 shadow-sm' : 'hover:bg-slate-50'}`}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${lesson.id === lectureId ? 'bg-[#B87333] text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {lesson.id === lectureId ? <Play className="w-3 h-3 fill-current" /> : <span className="text-[10px] font-bold">{lesson.id.replace('b', '')}</span>}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className={`text-[11px] font-bold truncate ${lesson.id === lectureId ? 'text-[#B87333]' : 'text-slate-600'}`}>
                            {lesson.title}
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase">
                            <span>MODULE {lesson.id.replace('b', '')}</span>
                            <span>• 15P</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Search */}
        <div className="p-6 border-t border-slate-50">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm bài học..."
              className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs outline-none focus:border-amber-200 transition-all font-medium"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Breadcrumb Tag */}
          <div className="inline-block px-4 py-1.5 bg-[#B87333] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-900/20">
            VẬT LÝ LỚP {gradeNum}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-black text-[#1E293B] leading-tight tracking-tight">
            {currentLesson.title}
          </h1>

          {/* Video Player Card */}
          <div className="bg-white rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/50 border border-slate-50">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#B87333]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-700">{currentLesson.title}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PHÒNG HỌC TRỰC TUYẾN</div>
                </div>
              </div>
              <div className="text-xs font-bold text-slate-400">
                Phát triển bởi <span className="text-[#B87333]">PhysiGame Team</span>
              </div>
            </div>

            <div className="aspect-video mt-4 rounded-3xl overflow-hidden bg-slate-900 shadow-inner relative group">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${currentLesson.videoId}?autoplay=1&rel=0`}
                title={currentLesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>

          {/* Lesson Content - Theory */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-50">
            <h2 className="text-[#B87333] text-2xl font-black mb-6 flex items-center gap-3">
               Nội dung bài học
            </h2>
            <div className="prose prose-slate max-w-none prose-h3:text-[#B87333] prose-h3:font-black prose-p:text-slate-600 prose-p:font-medium prose-li:text-slate-600 prose-li:font-medium">
              <h3>1. {currentLesson.title}</h3>
              <p>{currentLesson.chapterDescription || 'Nội dung lý thuyết chi tiết đang được cập nhật cho bài học này. Vui lòng theo dõi video bài giảng để nắm bắt kiến thức đầy đủ.'}</p>
              
              <div className="mt-8 p-6 bg-amber-50/50 rounded-3xl border border-amber-100/50">
                <h4 className="text-[#8C5523] font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Tóm tắt kiến thức
                </h4>
                <ul className="space-y-3">
                  <li>Hiểu rõ các khái niệm cơ bản liên quan đến bài học.</li>
                  <li>Vận dụng các công thức để giải bài tập thực hiện.</li>
                  <li>Liên hệ kiến thức với các hiện tượng thực tiễn đời sống.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Notes & QA Tabs */}
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-50">
            <div className="flex bg-slate-50">
              <button 
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-5 flex items-center justify-center gap-2 font-bold transition-all ${activeTab === 'notes' ? 'bg-[#B87333] text-white shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Edit3 className="w-5 h-5" /> Ghi chú
              </button>
              <button 
                onClick={() => setActiveTab('qa')}
                className={`flex-1 py-5 flex items-center justify-center gap-2 font-bold transition-all ${activeTab === 'qa' ? 'bg-[#B87333] text-white shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <MessageSquare className="w-5 h-5" /> Hỏi đáp
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'notes' ? (
                <div className="space-y-4">
                  <textarea 
                    placeholder="Ghi lại các kiến thức quan trọng của bạn ở đây..."
                    className="w-full h-40 p-6 bg-slate-50 border border-slate-100 rounded-3xl resize-none outline-none focus:border-amber-200 transition-all font-medium text-slate-600"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                  <div className="flex justify-end">
                    <button className="px-8 py-3 bg-[#B87333] text-white font-bold rounded-2xl shadow-lg shadow-amber-900/20 hover:-translate-y-1 transition-all">
                      Lưu ghi chú
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-slate-300" />
                   </div>
                   <h3 className="font-bold text-slate-700">Chưa có câu hỏi nào</h3>
                   <p className="text-slate-400 text-sm mt-1">Hãy là người đầu tiên đặt câu hỏi cho bài học này!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button for Support/Help */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-[#B87333] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50">
        <MessageSquare className="w-8 h-8" />
      </button>
    </div>
  );
};

export default LectureViewer;

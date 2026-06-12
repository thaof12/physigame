import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  FileQuestion,
  FlaskConical,
  Search,
  Filter,
  Eye,
  ExternalLink,
  Star,
  Users,
  Layers,
  ChevronDown,
  X,
  FileText,
  Clock,
  Trophy,
  Check,
  Play
} from 'lucide-react';
import api from '../../../config/api';

const getEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }
  return url;
};

const BrowseContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [activeTab, setActiveTab] = useState('lessons');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filterGrade, setFilterGrade] = useState('all');
  const [lessons, setLessons] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Synchronize search query when URL parameters update
  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchQuery(q);
  }, [searchParams]);

  // Selected item state for preview modal
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchSystemContent = async () => {
    setLoading(true);
    try {
      const [lessonsRes, exercisesRes, experimentsRes] = await Promise.all([
        api.get('/lessons?teacherId=null'),
        api.get('/challenges?teacherId=null&category=exercise'),
        api.get('/challenges?teacherId=null&category=experiment')
      ]);
      setLessons(Array.isArray(lessonsRes.data) ? lessonsRes.data : []);
      setExercises(Array.isArray(exercisesRes.data) ? exercisesRes.data : []);
      setExperiments(Array.isArray(experimentsRes.data) ? experimentsRes.data : []);
    } catch (error) {
      console.error('Error fetching system content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemContent();
  }, []);

  const tabs = [
    { id: 'lessons', label: 'Bài học', icon: BookOpen, count: lessons.length },
    { id: 'exercises', label: 'Bài tập', icon: FileQuestion, count: exercises.length },
    { id: 'experiments', label: 'Thí nghiệm', icon: FlaskConical, count: experiments.length },
  ];

  const getFilteredContent = () => {
    let content = [];
    if (activeTab === 'lessons') content = lessons;
    else if (activeTab === 'exercises') content = exercises;
    else if (activeTab === 'experiments') content = experiments;

    return content.filter(item => {
      const titleVal = item.name || item.title || '';
      const gradeVal = (item.grade || item.class_id || '').toString();
      const matchesSearch = titleVal.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = filterGrade === 'all' || gradeVal === filterGrade;
      return matchesSearch && matchesGrade;
    });
  };

  const filteredContent = getFilteredContent();

  const handleAssignContent = (item) => {
    alert(`Tính năng giao bài học/bài tập "${item.name || item.title}" tới lớp học đang được thiết lập.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">Ngân hàng nội dung</h1>
        <p className="text-slate-500 font-bold text-sm mt-1">
          Khám phá và sử dụng nội dung có sẵn của hệ thống PhysiGame
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100/80 border border-slate-200/50 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded text-xs ml-1 font-black ${activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'bg-slate-200 text-slate-600'
                }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
          />
        </div>
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
        >
          <option value="all">Tất cả lớp</option>
          {[6, 7, 8, 9, 10, 11, 12].map(grade => (
            <option key={grade} value={grade}>Lớp {grade}</option>
          ))}
        </select>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold text-sm">Đang tải ngân hàng nội dung...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredContent.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md hover:border-slate-200 cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg shadow-indigo-500/10 ${activeTab === 'lessons' ? 'from-emerald-500 to-teal-600' :
                      activeTab === 'exercises' ? 'from-blue-500 to-cyan-600' :
                        'from-violet-500 to-purple-600'
                    }`}>
                    {activeTab === 'lessons' && <BookOpen className="w-6 h-6 text-white" />}
                    {activeTab === 'exercises' && <FileQuestion className="w-6 h-6 text-white" />}
                    {activeTab === 'experiments' && <FlaskConical className="w-6 h-6 text-white" />}
                  </div>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Hệ thống
                  </span>
                </div>

                <h3 className="text-slate-900 font-black text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                  {item.name || item.title}
                </h3>
                <p className="text-sm text-slate-400 font-bold mb-4">
                  Lớp {item.grade || item.class_id || 8}
                  {item.chapter_id ? ` • Chương ${item.chapter_id}` : (item.chapter ? ` • ${item.chapter}` : '')}
                  {Array.isArray(item.features) ? ` • ${item.features.length} câu hỏi` : (item.questions ? ` • ${item.questions} câu hỏi` : '')}
                  {item.time ? ` • ${item.time}` : (item.duration ? ` • ${item.duration} phút` : '')}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-slate-500 font-bold mb-6">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-slate-400" />
                    {(item.views || item.views_count || 0) > 1000
                      ? `${((item.views || item.views_count || 0) / 1000).toFixed(1)}k`
                      : (item.views || item.views_count || 0)} xem
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-slate-400" />
                    {(item.completions || item.completions_count || 0) > 1000
                      ? `${((item.completions || item.completions_count || 0) / 1000).toFixed(1)}k`
                      : (item.completions || item.completions_count || 0)} nộp
                  </span>
                  {(item.avg_score || item.avgScore || item.rating) !== undefined && (
                    <span className="text-emerald-600 font-black">
                      TB: {item.avg_score || item.avgScore || item.rating || 0}%
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-slate-600 hover:text-slate-900 font-bold rounded-xl text-sm transition-all"
                >
                  <Eye className="w-4 h-4" />
                  Chi tiết
                </button>
                <button
                  onClick={() => handleAssignContent(item)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100/50 hover:border-emerald-200 text-emerald-600 font-bold rounded-xl text-sm transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Giao bài
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredContent.length === 0 && !loading && (
        <div className="bg-white border border-slate-100 rounded-2xl py-16 text-center shadow-sm">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">Không tìm thấy nội dung phù hợp</p>
        </div>
      )}

      {/* DETAIL VIEW MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === 'lessons' ? 'bg-emerald-50 text-emerald-600' :
                    activeTab === 'exercises' ? 'bg-blue-50 text-blue-600' :
                      'bg-violet-50 text-violet-600'
                  }`}>
                  {activeTab === 'lessons' && <BookOpen className="w-5 h-5" />}
                  {activeTab === 'exercises' && <FileQuestion className="w-5 h-5" />}
                  {activeTab === 'experiments' && <FlaskConical className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{selectedItem.name || selectedItem.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded">
                      Lớp {selectedItem.grade || selectedItem.class_id}
                    </span>
                    {selectedItem.chapter_id && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded">
                        Chương {selectedItem.chapter_id}
                      </span>
                    )}
                    {selectedItem.time && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedItem.time}
                      </span>
                    )}
                    {selectedItem.difficulty && (
                      <span
                        style={{
                          color: selectedItem.difficulty_color || '#4f46e5',
                          backgroundColor: `${selectedItem.difficulty_color || '#4f46e5'}12`
                        }}
                        className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded"
                      >
                        {selectedItem.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lượt xem</p>
                  <p className="text-lg font-black text-slate-800">{selectedItem.views || selectedItem.views_count || 0}</p>
                </div>
                <div className="text-center border-x border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {activeTab === 'lessons' ? 'Học sinh hoàn thành' : 'Lượt nộp'}
                  </p>
                  <p className="text-lg font-black text-slate-800">{selectedItem.completions || selectedItem.completions_count || selectedItem.students_count || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {activeTab === 'lessons' ? 'Phân loại' : 'Điểm tối đa'}
                  </p>
                  <p className="text-lg font-black text-slate-800">
                    {activeTab === 'lessons' ? 'Hệ thống' : (selectedItem.points || 100)}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedItem.description && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Mô tả chi tiết</h4>
                  <p className="text-sm font-bold text-slate-700 bg-slate-50/50 p-4 rounded-xl border border-slate-100/30 leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>
              )}

              {/* Dynamic Content Display depending on Tab */}
              {activeTab === 'lessons' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Nội dung bài giảng</h4>
                  {selectedItem.theory && (selectedItem.theory.startsWith('http://') || selectedItem.theory.startsWith('https://')) ? (
                    <div className="space-y-3">
                      <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-800 font-medium leading-relaxed flex items-start gap-2">
                        <span className="text-base select-none mt-0.5">💡</span>
                        <div>
                          <strong>Lưu ý về tài liệu:</strong> Để xem trực tiếp, tệp Google Drive cần được chia sẻ ở chế độ công khai <strong>"Bất kỳ ai có liên kết đều có thể xem"</strong>. Nếu bạn thấy thông báo "Tệp không tồn tại", đây có thể là liên kết giả lập hoặc quyền truy cập của tệp bị hạn chế.
                        </div>
                      </div>
                      <div className="border border-slate-200 rounded-2xl overflow-hidden h-[450px] shadow-inner bg-slate-50 relative">
                        <iframe 
                          src={getEmbedUrl(selectedItem.theory)} 
                          className="w-full h-full border-none" 
                          allow="autoplay"
                          title="Xem trước tài liệu"
                        />
                      </div>
                      <button
                        onClick={() => window.open(selectedItem.theory, '_blank')}
                        className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-all border border-indigo-100/50"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Mở tài liệu trong tab mới
                      </button>
                    </div>
                  ) : selectedItem.theory ? (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 leading-relaxed max-h-[300px] overflow-y-auto scrollbar-thin">
                      <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">{selectedItem.theory}</p>
                    </div>
                  ) : (
                    <p className="text-sm italic text-slate-400 text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                      Bài giảng thuộc chương trình sách giáo khoa chuẩn hệ thống.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'exercises' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Nội dung bài tập / tài liệu</h4>
                  {selectedItem.link && (selectedItem.link.startsWith('http://') || selectedItem.link.startsWith('https://')) ? (
                    <div className="space-y-3">
                      <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-800 font-medium leading-relaxed flex items-start gap-2">
                        <span className="text-base select-none mt-0.5">💡</span>
                        <div>
                          <strong>Lưu ý về tài liệu:</strong> Để xem trực tiếp, tệp Google Drive cần được chia sẻ ở chế độ công khai <strong>"Bất kỳ ai có liên kết đều có thể xem"</strong>. Nếu bạn thấy thông báo "Tệp không tồn tại", đây có thể là liên kết giả lập hoặc quyền truy cập của tệp bị hạn chế.
                        </div>
                      </div>
                      <div className="border border-slate-200 rounded-2xl overflow-hidden h-[450px] shadow-inner bg-slate-50 relative">
                        <iframe 
                          src={getEmbedUrl(selectedItem.link)} 
                          className="w-full h-full border-none" 
                          allow="autoplay"
                          title="Xem trước bài tập"
                        />
                      </div>
                      <button
                        onClick={() => window.open(selectedItem.link, '_blank')}
                        className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-all border border-indigo-100/50"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Mở bài tập trong tab mới
                      </button>
                    </div>
                  ) : Array.isArray(selectedItem.features) && selectedItem.features.length > 0 ? (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                      {selectedItem.features.map((q, qIndex) => (
                        <div key={qIndex} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                          <p className="text-sm font-black text-slate-800">
                            Câu {qIndex + 1}: {q.questionText}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {(q.options || []).map((opt, oIndex) => {
                              const isCorrect = q.correctAnswer === oIndex;
                              const optionLetter = ['A', 'B', 'C', 'D'][oIndex];
                              return (
                                <div
                                  key={oIndex}
                                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 ${isCorrect
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm shadow-emerald-500/5'
                                      : 'bg-white border-slate-200 text-slate-600'
                                    }`}
                                >
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black uppercase ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {optionLetter}
                                  </span>
                                  <span>{opt}</span>
                                  {isCorrect && <Check className="w-3.5 h-3.5 ml-auto text-emerald-600" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic text-slate-400 text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                      Bài tập trắc nghiệm tự luyện trực quan trên hệ thống.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'experiments' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Các chủ đề trọng tâm</h4>
                    {Array.isArray(selectedItem.features) && selectedItem.features.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.features.map((topic, tIndex) => (
                          <span key={tIndex} className="px-3 py-1 bg-violet-50 text-violet-600 text-xs font-bold rounded-lg border border-violet-100">
                            {topic}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm italic text-slate-400">Không có danh sách chủ đề cụ thể.</p>
                    )}
                  </div>

                  {selectedItem.link && (
                    <div className="pt-2">
                      <button
                        onClick={() => window.open(selectedItem.link, '_blank')}
                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 text-sm flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        Trải nghiệm mô phỏng thí nghiệm
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-8 py-6 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => handleAssignContent(selectedItem)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black hover:bg-emerald-100 transition-colors border border-emerald-100/50"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Giao bài học này
              </button>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-black hover:bg-slate-900 transition-colors shadow-sm"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseContent;

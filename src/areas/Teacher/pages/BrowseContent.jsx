import { useState, useEffect } from 'react';
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
  ChevronDown
} from 'lucide-react';
import api from '../../../config/api';

const BrowseContent = () => {
  const [activeTab, setActiveTab] = useState('lessons');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [lessons, setLessons] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSystemContent = async () => {
    setLoading(true);
    try {
      const [lessonsRes, exercisesRes, experimentsRes] = await Promise.all([
        api.get('/lessons?teacherId=null'),
        api.get('/challenges?teacherId=null&category=exercise'),
        api.get('/challenges?teacherId=null&category=experiment')
      ]);
      setLessons(lessonsRes.data || []);
      setExercises(exercisesRes.data || []);
      setExperiments(experimentsRes.data || []);
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
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded text-xs ml-1 font-black ${
                activeTab === tab.id
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredContent.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg shadow-indigo-500/10 ${
                  activeTab === 'lessons' ? 'from-emerald-500 to-teal-600' :
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

              <h3 className="text-slate-900 font-black text-lg mb-1 group-hover:text-indigo-600 transition-colors">{item.name || item.title}</h3>
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
                  <span className="text-emerald-600">
                    TB: {item.avg_score || item.avgScore || item.rating || 0}%
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-slate-600 hover:text-slate-900 font-bold rounded-xl text-sm transition-all">
                <Eye className="w-4 h-4" />
                Chi tiết
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100/50 hover:border-emerald-200 text-emerald-600 font-bold rounded-xl text-sm transition-all">
                <ExternalLink className="w-4 h-4" />
                Giao bài
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl py-16 text-center shadow-sm">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">Không tìm thấy nội dung phù hợp</p>
        </div>
      )}
    </div>
  );
};

export default BrowseContent;


import { useState } from 'react';
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

// Mock data - Existing system content
const systemContent = {
  lessons: [
    { id: 1, title: 'Chuyển động thẳng đều', grade: 10, chapter: 'Động học', views: 15200, rating: 4.8, isSystem: true },
    { id: 2, title: 'Định luật Ôm', grade: 9, chapter: 'Điện học', views: 13800, rating: 4.9, isSystem: true },
    { id: 3, title: 'Nguyên tử và phân tử', grade: 8, chapter: 'Cấu tạo chất', views: 12450, rating: 4.7, isSystem: true },
    { id: 4, title: 'Lực đẩy Archimedes', grade: 8, chapter: 'Cơ học', views: 11800, rating: 4.6, isSystem: true },
  ],
  exercises: [
    { id: 1, title: 'Quiz Định luật Newton', grade: 10, questions: 20, completions: 8500, avgScore: 78, isSystem: true },
    { id: 2, title: 'Bài tập Điện học tổng hợp', grade: 9, questions: 30, completions: 7200, avgScore: 75, isSystem: true },
    { id: 3, title: 'Trắc nghiệm Quang học', grade: 7, questions: 15, completions: 6800, avgScore: 82, isSystem: true },
  ],
  experiments: [
    { id: 1, title: 'Dao động con lắc đơn', grade: 10, completions: 4500, duration: 25, isSystem: true },
    { id: 2, title: 'Đo gia tốc rơi tự do', grade: 10, completions: 3800, duration: 30, isSystem: true },
    { id: 3, title: 'Khảo sát định luật Ôm', grade: 9, completions: 5200, duration: 20, isSystem: true },
  ],
};

const BrowseContent = () => {
  const [activeTab, setActiveTab] = useState('lessons');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');

  const tabs = [
    { id: 'lessons', label: 'Bài học', icon: BookOpen, count: systemContent.lessons.length },
    { id: 'exercises', label: 'Bài tập', icon: FileQuestion, count: systemContent.exercises.length },
    { id: 'experiments', label: 'Thí nghiệm', icon: FlaskConical, count: systemContent.experiments.length },
  ];

  const getFilteredContent = () => {
    const content = systemContent[activeTab];
    return content.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = filterGrade === 'all' || item.grade.toString() === filterGrade;
      return matchesSearch && matchesGrade;
    });
  };

  const filteredContent = getFilteredContent();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Ngân hàng nội dung</h1>
        <p className="text-slate-400 text-sm mt-1">
          Khám phá và sử dụng nội dung có sẵn của hệ thống PhysiGame
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className="px-1.5 py-0.5 bg-slate-600/50 rounded text-xs">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
        >
          <option value="all">Tất cả lớp</option>
          {[6, 7, 8, 9, 10, 11, 12].map(grade => (
            <option key={grade} value={grade}>Lớp {grade}</option>
          ))}
        </select>
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredContent.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                activeTab === 'lessons' ? 'from-emerald-500 to-teal-600' :
                activeTab === 'exercises' ? 'from-blue-500 to-orange-600' :
                'from-violet-500 to-purple-600'
              }`}>
                {activeTab === 'lessons' && <BookOpen className="w-6 h-6 text-white" />}
                {activeTab === 'exercises' && <FileQuestion className="w-6 h-6 text-white" />}
                {activeTab === 'experiments' && <FlaskConical className="w-6 h-6 text-white" />}
              </div>
              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-lg flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Hệ thống
              </span>
            </div>

            <h3 className="text-white font-medium mb-1">{item.title}</h3>
            <p className="text-sm text-slate-400 mb-4">
              Lớp {item.grade}
              {item.chapter && ` • ${item.chapter}`}
              {item.questions && ` • ${item.questions} câu hỏi`}
              {item.duration && ` • ${item.duration} phút`}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
              {item.views && (
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {(item.views / 1000).toFixed(1)}k
                </span>
              )}
              {item.rating && (
                <span className="flex items-center gap-1 text-blue-400">
                  <Star className="w-4 h-4 fill-current" />
                  {item.rating}
                </span>
              )}
              {item.completions && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {(item.completions / 1000).toFixed(1)}k
                </span>
              )}
              {item.avgScore && (
                <span className="text-emerald-400">
                  TB: {item.avgScore}%
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg text-sm transition-colors">
                <Eye className="w-4 h-4" />
                Xem chi tiết
              </button>
              <button className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm transition-colors">
                <ExternalLink className="w-4 h-4" />
                Giao cho lớp
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl py-12 text-center">
          <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Không tìm thấy nội dung phù hợp</p>
        </div>
      )}
    </div>
  );
};

export default BrowseContent;


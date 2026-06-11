import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileQuestion,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  Clock,
  BarChart3,
  X,
  Upload,
  Loader2,
  FileText,
  Check,
  PlusCircle,
  HelpCircle,
  Trophy,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { useTeacherAuth } from '../contexts/TeacherAuthContext';
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

const MyExercises = () => {
  const navigate = useNavigate();
  const { teacher } = useTeacherAuth();
  
  // States
  const [exercises, setExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  // Creation form states
  const [createTab, setCreateTab] = useState('manual'); // 'manual' | 'upload'
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    grade: '8',
    time: '15',
    points: '100',
    difficulty: 'Trung bình',
    description: '',
    link: '',
    status: 'published'
  });

  // Manual questions builder state
  const [questions, setQuestions] = useState([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0 // Index 0-3 (A, B, C, D)
    }
  ]);

  const fetchExercises = async () => {
    if (!teacher?.id) return;
    try {
      const response = await api.get(`/challenges?teacherId=${teacher.id}&category=exercise`);
      setExercises(response.data || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [teacher]);

  const handleDeleteExercise = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài tập này?')) return;
    try {
      await api.delete(`/challenges/${id}`);
      setExercises(exercises.filter(ex => ex.id !== id));
      if (selectedExercise?.id === id) {
        setSelectedExercise(null);
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Không thể xóa bài tập.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusToggle = () => {
    setFormData(prev => ({
      ...prev,
      status: prev.status === 'published' ? 'draft' : 'published'
    }));
  };

  // Add question to manual builder
  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]);
  };

  // Remove question from manual builder
  const handleRemoveQuestion = (index) => {
    if (questions.length <= 1) {
      alert('Bài tập cần có ít nhất 1 câu hỏi.');
      return;
    }
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  // Update question field
  const handleQuestionChange = (index, value) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index].questionText = value;
      return updated;
    });
  };

  // Update option field
  const handleOptionChange = (qIndex, oIndex, value) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[qIndex].options[oIndex] = value;
      return updated;
    });
  };

  // Update correct option index
  const handleCorrectAnswerChange = (qIndex, optVal) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[qIndex].correctAnswer = parseInt(optVal, 10);
      return updated;
    });
  };

  // File upload simulation
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type
    });

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      grade: '8',
      time: '15',
      points: '100',
      difficulty: 'Trung bình',
      description: '',
      link: '',
      status: 'published'
    });
    setQuestions([
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]);
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setCreateTab('manual');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên bài tập.');
      return;
    }
    if (createTab === 'upload' && !uploadedFile) {
      alert('Vui lòng tải lên file bài tập.');
      return;
    }
    if (createTab === 'manual') {
      const isAnyQuestionEmpty = questions.some(
        q => !q.questionText.trim() || q.options.some(opt => !opt.trim())
      );
      if (isAnyQuestionEmpty) {
        alert('Vui lòng nhập đầy đủ nội dung câu hỏi và các lựa chọn đáp án.');
        return;
      }
    }
    if (createTab === 'link' && !formData.link.trim()) {
      alert('Vui lòng nhập đường dẫn bài tập.');
      return;
    }

    setSubmitting(true);
    try {
      const difficultyMap = {
        'Dễ': { level: 'easy', color: '#10b981' },
        'Trung bình': { level: 'medium', color: '#f59e0b' },
        'Khó': { level: 'hard', color: '#ef4444' }
      };
      const diffSettings = difficultyMap[formData.difficulty] || difficultyMap['Trung bình'];

      const payload = {
        challenge_id: Date.now() % 1000000,
        name: formData.name,
        description: formData.description || `Bài tập tự luyện lớp ${formData.grade}`,
        icon: 'FileQuestion',
        difficulty: formData.difficulty,
        difficulty_level: diffSettings.level,
        difficulty_color: diffSettings.color,
        category: 'game',
        grade: parseInt(formData.grade, 10),
        time: `${formData.time} phút`,
        points: parseInt(formData.points, 10),
        status: formData.status === 'published' ? 'available' : 'coming-soon',
        link: createTab === 'link' ? formData.link : '',
        features: createTab === 'manual' ? questions : (createTab === 'link' ? [] : { uploadedFile }),
        prerequisite: {},
        teacher_id: teacher?.id,
        completions_count: 0,
        views_count: 0,
        avg_score: 0
      };

      const response = await api.post('/challenges', payload);
      if (response.data) {
        setIsCreateOpen(false);
        resetForm();
        fetchExercises();
      }
    } catch (error) {
      console.error('Error creating exercise:', error);
      alert('Đã xảy ra lỗi khi tạo bài tập.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredExercises = exercises.filter(ex => {
    const titleVal = ex.name || ex.title || '';
    const gradeVal = (ex.grade || '').toString();
    const matchesSearch = titleVal.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === 'all' || gradeVal === filterGrade;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Bài tập của tôi</h1>
          <p className="text-slate-500 font-bold text-sm mt-1">Quản lý các bài tập và quiz bạn đã tạo</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-600 hover:brightness-110 text-white text-sm font-black rounded-[1.25rem] shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest"
        >
          <Plus className="w-5 h-5" />
          Tạo bài tập mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
          />
        </div>
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
        >
          <option value="all">Tất cả lớp</option>
          {[6, 7, 8, 9, 10, 11, 12].map(grade => (
            <option key={grade} value={grade}>Lớp {grade}</option>
          ))}
        </select>
      </div>

      {/* Exercises Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            onClick={() => setSelectedExercise(exercise)}
            className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md hover:border-slate-200 cursor-pointer transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <FileQuestion className="w-6 h-6 text-white" />
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                  exercise.status === 'available' || exercise.status === 'published'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-slate-50 text-slate-400'
                }`}>
                  {exercise.status === 'available' || exercise.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
              </div>

              <h3 className="text-slate-900 font-black text-lg mb-1 group-hover:text-blue-600 transition-colors">{exercise.name || exercise.title}</h3>
              <p className="text-sm text-slate-400 font-bold mb-4">
                Lớp {exercise.grade || 8} • {exercise.category === 'molecule' ? 'Hóa học Phân tử' : 'Vật lý'}
              </p>

              <div className="grid grid-cols-3 gap-2.5 mb-6">
                <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                  <p className="text-lg font-black text-slate-800">
                    {Array.isArray(exercise.features) ? exercise.features.length : (exercise.questions || 10)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Câu hỏi</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                  <p className="text-lg font-black text-slate-800">{exercise.completions_count || exercise.submissions || 0}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Lượt nộp</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                  <p className="text-lg font-black text-emerald-600">{exercise.avg_score || exercise.avgScore || 0}%</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Điểm TB</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setSelectedExercise(exercise)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-slate-600 hover:text-blue-600 font-bold rounded-xl text-sm transition-all"
              >
                <Eye className="w-4 h-4" />
                Xem
              </button>
              <button 
                onClick={() => handleDeleteExercise(exercise.id)}
                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-100/50 hover:border-rose-200 rounded-xl transition-all" 
                title="Xóa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl py-16 text-center shadow-sm">
          <FileQuestion className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">Không tìm thấy bài tập nào</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 text-blue-600 hover:text-blue-700 font-black text-sm flex items-center justify-center gap-1.5 mx-auto hover:underline"
          >
            + Tạo bài tập đầu tiên
          </button>
        </div>
      )}

      {/* CREATE EXERCISE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileQuestion className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Tạo bài tập mới</h3>
                  <p className="text-xs text-slate-400 font-bold">Thêm đề kiểm tra trắc nghiệm hoặc bài tập tự luyện</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsCreateOpen(false); resetForm(); }}
                className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin">
              
              {/* Name & Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Tên bài tập</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Kiểm tra 15 phút - Định luật Ôm"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Độ khó</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                  </select>
                </div>
              </div>

              {/* Grade, Time, Points */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Lớp</label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                  >
                    {[6, 7, 8, 9, 10, 11, 12].map(grade => (
                      <option key={grade} value={grade}>Lớp {grade}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Thời gian (phút)</label>
                  <input
                    type="number"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Điểm tối đa</label>
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleInputChange}
                    min="10"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Mô tả ngắn</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Mô tả sơ lược về mục tiêu kiểm tra..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                />
              </div>

              {/* Compilation Method */}
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Hình thức soạn đề</label>
                <div className="flex border border-slate-100 p-1.5 rounded-2xl bg-slate-50 gap-1">
                  <button
                    type="button"
                    onClick={() => setCreateTab('manual')}
                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
                      createTab === 'manual'
                        ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Soạn câu hỏi
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateTab('link')}
                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
                      createTab === 'link'
                        ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Link đề online (Drive, PDF...)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateTab('upload')}
                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
                      createTab === 'upload'
                        ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Tải đề từ file
                  </button>
                </div>

                {createTab === 'manual' && (
                  /* Dynamic Quiz Questions Builder */
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-sm font-black text-slate-700">Danh sách câu hỏi</h4>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Thêm câu hỏi
                      </button>
                    </div>

                    <div className="space-y-6 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                      {questions.map((q, qIndex) => (
                        <div key={qIndex} className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-4 relative">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-blue-600 uppercase tracking-wider">
                              Câu {qIndex + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIndex)}
                              className="text-xs text-rose-500 hover:text-rose-600 font-bold"
                            >
                              Xóa câu hỏi
                            </button>
                          </div>

                          <div>
                            <input
                              type="text"
                              placeholder="Nhập nội dung câu hỏi..."
                              value={q.questionText}
                              onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-bold"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt, oIndex) => {
                              const label = ['A', 'B', 'C', 'D'][oIndex];
                              return (
                                <div key={oIndex} className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl">
                                  <span className="text-xs font-black text-slate-400">{label}:</span>
                                  <input
                                    type="text"
                                    placeholder={`Đáp án ${label}`}
                                    value={opt}
                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                    className="flex-1 text-xs font-bold text-slate-700 placeholder-slate-300 focus:outline-none"
                                  />
                                </div>
                              );
                            })}
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Đáp án đúng</label>
                            <select
                              value={q.correctAnswer}
                              onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}
                              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-500"
                            >
                              <option value="0">Đáp án A</option>
                              <option value="1">Đáp án B</option>
                              <option value="2">Đáp án C</option>
                              <option value="3">Đáp án D</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {createTab === 'link' && (
                  <div>
                    <input
                      type="url"
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      placeholder="Nhập link Google Drive, link PDF, link bài tập..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all font-bold"
                    />
                    <p className="text-[10px] text-slate-400 font-bold mt-2 ml-1">
                      Mẹo: Nhập link Google Drive công khai để xem trước trực tuyến một cách dễ dàng nhất.
                    </p>
                  </div>
                )}

                {createTab === 'upload' && (
                  /* Upload panel */
                  <div className="space-y-4">
                    {!uploadedFile ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-blue-500 transition-all bg-slate-50/50 relative group">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
                        <p className="text-sm font-bold text-slate-700">Kéo thả hoặc nhấn để chọn đề thi tải lên</p>
                        <p className="text-xs text-slate-400 font-medium mt-1">Hỗ trợ PDF, Word, Excel lên tới 20MB</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            {isUploading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <FileText className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 truncate max-w-[320px]">{uploadedFile.name}</p>
                            <p className="text-xs text-slate-400 font-bold">
                              {isUploading ? `Đang tải lên: ${uploadProgress}%` : uploadedFile.size}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <X className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status publish */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-800">Xuất bản bài tập ngay</p>
                  <p className="text-xs text-slate-400 font-medium">Học sinh có thể tham gia giải đề ngay sau khi xuất bản</p>
                </div>
                <button
                  type="button"
                  onClick={handleStatusToggle}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    formData.status === 'published' ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${
                    formData.status === 'published' ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); resetForm(); }}
                  className="px-6 py-3 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-sm font-black transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting || isUploading}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl text-sm font-black hover:brightness-110 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Tạo bài tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL EXERCISE MODAL */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileQuestion className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{selectedExercise.name || selectedExercise.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider rounded">
                      Lớp {selectedExercise.grade}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded">
                      {selectedExercise.category === 'molecule' ? 'Hóa học Phân tử' : 'Vật lý'}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedExercise.time || '15 phút'}
                    </span>
                    <span 
                      style={{ color: selectedExercise.difficulty_color, backgroundColor: `${selectedExercise.difficulty_color}12` }}
                      className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded"
                    >
                      {selectedExercise.difficulty || 'Trung bình'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedExercise(null)}
                className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Số câu hỏi</p>
                  <p className="text-lg font-black text-slate-800">
                    {Array.isArray(selectedExercise.features) ? selectedExercise.features.length : (selectedExercise.questions || 10)}
                  </p>
                </div>
                <div className="text-center border-x border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng điểm</p>
                  <p className="text-lg font-black text-slate-800">{selectedExercise.points || 100}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lượt nộp</p>
                  <p className="text-lg font-black text-slate-800">{selectedExercise.completions_count || selectedExercise.submissions || 0}</p>
                </div>
              </div>

              {/* Stats Extra */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold">Điểm trung bình</p>
                    <p className="text-sm font-black text-slate-800">{selectedExercise.avg_score || selectedExercise.avgScore || 0}%</p>
                  </div>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold">Lượt xem bài</p>
                    <p className="text-sm font-black text-slate-800">{selectedExercise.views_count || 0} lượt</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedExercise.description && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Mô tả bài tập</h4>
                  <p className="text-sm font-bold text-slate-700 bg-slate-50/50 p-4 rounded-xl border border-slate-100/30 leading-relaxed">
                    {selectedExercise.description}
                  </p>
                </div>
              )}

              {/* Questions or File View */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Nội dung đề bài</h4>

                {selectedExercise.link && (selectedExercise.link.startsWith('http://') || selectedExercise.link.startsWith('https://')) ? (
                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-800 font-medium leading-relaxed flex items-start gap-2">
                      <span className="text-base select-none mt-0.5">💡</span>
                      <div>
                        <strong>Lưu ý về tài liệu:</strong> Để xem trực tiếp, tệp Google Drive cần được chia sẻ ở chế độ công khai <strong>"Bất kỳ ai có liên kết đều có thể xem"</strong>. Nếu bạn thấy thông báo "Tệp không tồn tại", đây có thể là liên kết giả lập hoặc quyền truy cập của tệp bị hạn chế.
                      </div>
                    </div>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden h-[450px] shadow-inner bg-slate-50 relative">
                      <iframe 
                        src={getEmbedUrl(selectedExercise.link)} 
                        className="w-full h-full border-none" 
                        allow="autoplay"
                        title="Xem trước bài tập"
                      />
                    </div>
                    <button
                      onClick={() => window.open(selectedExercise.link, '_blank')}
                      className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-all border border-blue-100/50"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Mở bài tập trong tab mới
                    </button>
                  </div>
                ) : selectedExercise.features && !Array.isArray(selectedExercise.features) && selectedExercise.features.uploadedFile ? (
                  /* Render as document download card */
                  <div className="flex items-center justify-between p-4 bg-blue-50/30 border border-blue-100/50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 truncate max-w-[320px]">
                          {selectedExercise.features.uploadedFile.name}
                        </p>
                        <p className="text-xs text-slate-400 font-bold">Tài liệu đề kiểm tra ({selectedExercise.features.uploadedFile.size})</p>
                      </div>
                    </div>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); alert('Tải xuống đề bài: ' + selectedExercise.features.uploadedFile.name); }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Tải xuống
                    </a>
                  </div>
                ) : Array.isArray(selectedExercise.features) && selectedExercise.features.length > 0 ? (
                  /* Render manual quiz list */
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {selectedExercise.features.map((q, qIndex) => (
                      <div key={qIndex} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                        <p className="text-sm font-black text-slate-800">
                          Câu {qIndex + 1}: {q.questionText}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {q.options.map((opt, oIndex) => {
                            const isCorrect = q.correctAnswer === oIndex;
                            const optionLetter = ['A', 'B', 'C', 'D'][oIndex];
                            return (
                              <div 
                                key={oIndex} 
                                className={`p-2.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 ${
                                  isCorrect 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm shadow-emerald-500/5' 
                                    : 'bg-white border-slate-200 text-slate-600'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black uppercase ${
                                  isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
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
                    Không có nội dung câu hỏi chi tiết.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-8 py-6 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-400 font-bold">
                Tạo lúc: {selectedExercise.created_at ? new Date(selectedExercise.created_at).toLocaleString('vi-VN') : 'Không rõ'}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteExercise(selectedExercise.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-black hover:bg-rose-100 transition-colors border border-rose-100/50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa bài tập
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedExercise(null)}
                  className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-black hover:bg-slate-900 transition-colors shadow-sm"
                >
                  Đóng lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyExercises;

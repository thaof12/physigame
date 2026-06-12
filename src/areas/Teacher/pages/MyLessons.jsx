import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  Clock,
  Users,
  ChevronDown,
  X,
  FileText,
  Upload,
  Check,
  Loader2,
  Paperclip,
  BookMarked,
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

const MyLessons = () => {
  const navigate = useNavigate();
  const { teacher } = useTeacherAuth();
  
  // States
  const [lessons, setLessons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  // Creation form states
  const [createTab, setCreateTab] = useState('manual'); // 'manual' | 'upload'
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    class_id: '10',
    chapter_id: '1',
    level: 'Beginner',
    description: '',
    theory: '',
    link: '',
    status: 'published'
  });

  const fetchLessons = async () => {
    if (!teacher?.id) return;
    try {
      const response = await api.get(`/lessons?teacherId=${teacher.id}`);
      setLessons(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [teacher]);

  const handleDeleteLesson = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
    try {
      await api.delete(`/lessons/${id}`);
      setLessons(lessons.filter(l => l.id !== id));
      if (selectedLesson?.id === id) {
        setSelectedLesson(null);
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Không thể xóa bài học.');
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

  // Simulate file upload
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
        return prev + 20;
      });
    }, 200);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      class_id: '10',
      chapter_id: '1',
      level: 'Beginner',
      description: '',
      theory: '',
      link: '',
      status: 'published'
    });
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setCreateTab('manual');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tên bài học.');
      return;
    }
    if (createTab === 'upload' && !uploadedFile) {
      alert('Vui lòng tải lên tài liệu bài học.');
      return;
    }
    if (createTab === 'manual' && !formData.theory.trim()) {
      alert('Vui lòng soạn thảo nội dung lý thuyết.');
      return;
    }
    if (createTab === 'link' && !formData.link.trim()) {
      alert('Vui lòng nhập đường dẫn tài liệu.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        class_id: parseInt(formData.class_id, 10),
        chapter_id: parseInt(formData.chapter_id, 10),
        lesson_id: Date.now() % 10000,
        description: formData.description,
        level: formData.level,
        theory: createTab === 'manual' 
          ? formData.theory 
          : (createTab === 'link' ? formData.link : `Tài liệu đã tải lên: ${uploadedFile.name} (${uploadedFile.size})`),
        content: createTab === 'manual' 
          ? '' 
          : (createTab === 'link' ? formData.link : uploadedFile.name),
        teacher_id: teacher?.id,
        status: formData.status,
        views: 0,
        students_count: 0
      };

      const response = await api.post('/lessons', payload);
      if (response.data) {
        setIsCreateOpen(false);
        resetForm();
        fetchLessons();
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      alert('Đã xảy ra lỗi khi tạo bài học.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLessons = lessons.filter(lesson => {
    const titleVal = lesson.title || '';
    const gradeVal = (lesson.class_id || lesson.grade || '').toString();
    const statusVal = lesson.status || 'published';

    const matchesSearch = titleVal.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === 'all' || gradeVal === filterGrade;
    const matchesStatus = filterStatus === 'all' || statusVal === filterStatus;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Bài học của tôi</h1>
          <p className="text-slate-500 font-bold text-sm mt-1">Quản lý các bài học bạn đã tạo</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white text-sm font-black rounded-[1.25rem] shadow-xl shadow-indigo-500/20 transition-all uppercase tracking-widest"
        >
          <Plus className="w-5 h-5" />
          Tạo bài học mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài học..."
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
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
        </select>
      </div>

      {/* Lessons List */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Bài học</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Lớp</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Chương</th>
                <th className="text-center py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Lượt xem</th>
                <th className="text-center py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Học sinh</th>
                <th className="text-center py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th className="text-right py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map((lesson) => (
                <tr
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className="border-b border-slate-100/50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/10">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{lesson.title}</p>
                        <p className="text-xs text-slate-400 font-medium">Cập nhật: {lesson.created_at ? new Date(lesson.created_at).toLocaleDateString('vi-VN') : 'Mới đây'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-600 font-bold">Lớp {lesson.class_id || lesson.grade || 10}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-600 font-medium">{lesson.chapter_id ? `Chương ${lesson.chapter_id}` : (lesson.chapter || 'Tổng quan')}</span>
                  </td>
                  <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5 text-slate-500 font-bold">
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">{lesson.views || 0}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5 text-slate-500 font-bold">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">{lesson.students_count || lesson.students || 0}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                      lesson.status === 'published'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {lesson.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </td>
                  <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedLesson(lesson)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLessons.length === 0 && (
          <div className="py-16 text-center">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">Không tìm thấy bài học nào</p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-black text-sm flex items-center justify-center gap-1.5 mx-auto hover:underline"
            >
              + Tạo bài học đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* CREATE LESSON MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookMarked className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Tạo bài học mới</h3>
                  <p className="text-xs text-slate-400 font-bold">Thêm tài liệu hoặc bài giảng vào thư viện của bạn</p>
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
              
              {/* Title & Level */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Tên bài học</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Định luật Vạn vật hấp dẫn"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Mức độ</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
                  >
                    <option value="Beginner">Cơ bản</option>
                    <option value="Intermediate">Trung bình</option>
                    <option value="Advanced">Nâng cao</option>
                  </select>
                </div>
              </div>

              {/* Class & Chapter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Lớp</label>
                  <select
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
                  >
                    {[6, 7, 8, 9, 10, 11, 12].map(grade => (
                      <option key={grade} value={grade}>Lớp {grade}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Chương (số thứ tự)</label>
                  <input
                    type="number"
                    name="chapter_id"
                    value={formData.chapter_id}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
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
                  placeholder="Nhập mô tả ngắn gọn về nội dung bài học..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
                />
              </div>

              {/* Creation Method Tabs */}
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Hình thức soạn thảo</label>
                <div className="flex border border-slate-100 p-1.5 rounded-2xl bg-slate-50 gap-1">
                  <button
                    type="button"
                    onClick={() => setCreateTab('manual')}
                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
                      createTab === 'manual'
                        ? 'bg-white text-indigo-600 shadow-sm border border-slate-100'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Gõ thủ công
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateTab('link')}
                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
                      createTab === 'link'
                        ? 'bg-white text-indigo-600 shadow-sm border border-slate-100'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Đường dẫn online (Google Drive,...)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateTab('upload')}
                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
                      createTab === 'upload'
                        ? 'bg-white text-indigo-600 shadow-sm border border-slate-100'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Tải tài liệu lên
                  </button>
                </div>

                {createTab === 'manual' && (
                  <div>
                    <textarea
                      name="theory"
                      value={formData.theory}
                      onChange={handleInputChange}
                      rows="6"
                      placeholder="Viết nội dung lý thuyết bài học tại đây (Hỗ trợ Markdown)..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium leading-relaxed"
                    />
                  </div>
                )}

                {createTab === 'link' && (
                  <div>
                    <input
                      type="url"
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      placeholder="Nhập link Google Drive, link PDF, link Word..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
                    />
                    <p className="text-[10px] text-slate-400 font-bold mt-2 ml-1">
                      Mẹo: Nhập link Google Drive ở chế độ chia sẻ công khai ("Bất kỳ ai có liên kết đều có thể xem") để có thể xem trước tài liệu trực tiếp.
                    </p>
                  </div>
                )}

                {createTab === 'upload' && (
                  <div className="space-y-4">
                    {!uploadedFile ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-500 transition-all bg-slate-50/50 relative group">
                        <input
                           type="file"
                           accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg"
                           onChange={handleFileUpload}
                           className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3 group-hover:text-indigo-500 transition-colors" />
                        <p className="text-sm font-bold text-slate-700">Kéo thả hoặc nhấn để chọn tệp tải lên</p>
                        <p className="text-xs text-slate-400 font-medium mt-1">Hỗ trợ PDF, Word, PowerPoint, Hình ảnh lên tới 20MB</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
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

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-800">Xuất bản bài học ngay</p>
                  <p className="text-xs text-slate-400 font-medium">Học sinh có thể xem bài học này ngay lập tức nếu được xuất bản</p>
                </div>
                <button
                  type="button"
                  onClick={handleStatusToggle}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    formData.status === 'published' ? 'bg-indigo-600' : 'bg-slate-200'
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
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-black hover:brightness-110 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Tạo bài học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL LESSON MODAL */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{selectedLesson.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-indigo-50 text-[#4f46e5] text-[10px] font-black uppercase tracking-wider rounded">
                      Lớp {selectedLesson.class_id || selectedLesson.grade}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded">
                      Chương {selectedLesson.chapter_id || selectedLesson.chapter}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded ${
                      selectedLesson.level === 'Advanced' 
                        ? 'bg-rose-50 text-rose-600' 
                        : selectedLesson.level === 'Intermediate'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {selectedLesson.level || 'Beginner'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLesson(null)}
                className="w-10 h-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin">
              {/* Info Stats Row */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lượt xem</p>
                  <p className="text-lg font-black text-slate-800">{selectedLesson.views || 0}</p>
                </div>
                <div className="text-center border-x border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Học sinh hoàn thành</p>
                  <p className="text-lg font-black text-slate-800">{selectedLesson.students_count || selectedLesson.students || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mt-1 ${
                    selectedLesson.status === 'published'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {selectedLesson.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                </div>
              </div>

              {/* Description */}
              {selectedLesson.description && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Mô tả bài học</h4>
                  <p className="text-sm font-bold text-slate-700 bg-slate-50/50 p-4 rounded-xl border border-slate-100/30 leading-relaxed">
                    {selectedLesson.description}
                  </p>
                </div>
              )}

              {/* Lesson Theory Content */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Nội dung bài giảng</h4>
                
                {selectedLesson.theory && (selectedLesson.theory.startsWith('http://') || selectedLesson.theory.startsWith('https://')) ? (
                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-800 font-medium leading-relaxed flex items-start gap-2">
                      <span className="text-base select-none mt-0.5">💡</span>
                      <div>
                        <strong>Lưu ý về tài liệu:</strong> Để xem trực tiếp, tệp Google Drive cần được chia sẻ ở chế độ công khai <strong>"Bất kỳ ai có liên kết đều có thể xem"</strong>. Nếu bạn thấy thông báo "Tệp không tồn tại", đây có thể là liên kết giả lập hoặc quyền truy cập của tệp bị hạn chế.
                      </div>
                    </div>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden h-[450px] shadow-inner bg-slate-50 relative">
                      <iframe 
                        src={getEmbedUrl(selectedLesson.theory)} 
                        className="w-full h-full border-none" 
                        allow="autoplay"
                        title="Xem trước tài liệu"
                      />
                    </div>
                    <button
                      onClick={() => window.open(selectedLesson.theory, '_blank')}
                      className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-all border border-indigo-100/50"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Mở tài liệu trong tab mới
                    </button>
                  </div>
                ) : selectedLesson.content ? (
                  /* Render as document download card */
                  <div className="flex items-center justify-between p-4 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{selectedLesson.content}</p>
                        <p className="text-xs text-slate-400 font-bold">Tài liệu bài giảng trực quan</p>
                      </div>
                    </div>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); alert('Tải xuống tài liệu: ' + selectedLesson.content); }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Tải xuống
                    </a>
                  </div>
                ) : (
                  /* Render text theory description */
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 leading-relaxed max-h-[300px] overflow-y-auto scrollbar-thin">
                    {selectedLesson.theory ? (
                      <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">{selectedLesson.theory}</p>
                    ) : (
                      <p className="text-sm italic text-slate-400 text-center py-4">Không có chi tiết nội dung lý thuyết cho bài học này.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-8 py-6 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-400 font-bold">
                Tạo lúc: {selectedLesson.created_at ? new Date(selectedLesson.created_at).toLocaleString('vi-VN') : 'Không rõ'}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteLesson(selectedLesson.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-black hover:bg-rose-100 transition-colors border border-rose-100/50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa bài học
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLesson(null)}
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

export default MyLessons;

import { useState, useEffect, useRef } from 'react';
import {
  Users,
  Plus,
  Search,
  Settings,
  Trash2,
  UserPlus,
  Copy,
  ExternalLink,
  MoreVertical,
  BookOpen,
  Clock,
  ArrowLeft,
  Megaphone,
  MessageSquare,
  Send,
  Video,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useTeacherAuth } from '../contexts/TeacherAuthContext';
import api from '../../../config/api';

const ClassManagement = () => {
  const { teacher } = useTeacherAuth();
  const [classes, setClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  // Active workspace state
  const [activeClass, setActiveClass] = useState(null);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'assignments', 'discussions', 'meetings', 'students'

  // Form states
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  
  // Assignment form states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgLink, setAsgLink] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('');

  // Meeting form states
  const [meetTitle, setMeetTitle] = useState('');
  const [meetDesc, setMeetDesc] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [meetStartTime, setMeetStartTime] = useState('');

  // Detail workspace data
  const [announcements, setAnnouncements] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [students, setStudents] = useState([]);
  
  // Detail tracking for individual assignments
  const [selectedAsgProgress, setSelectedAsgProgress] = useState(null);
  const [asgProgressData, setAsgProgressData] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Scroll ref
  const chatEndRef = useRef(null);

  const fetchClasses = async () => {
    if (!teacher?.id) return;
    try {
      const response = await api.get(`/classes/teacher/${teacher.id}`);
      if (response.data?.success) {
        setClasses(response.data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [teacher]);

  // Fetch active class details
  const fetchClassDetails = async () => {
    if (!activeClass?.id) return;
    try {
      // Fetch announcements
      const annRes = await api.get(`/classes/${activeClass.id}/announcements`);
      setAnnouncements(annRes.data?.announcements || []);

      // Fetch assignments
      const asgRes = await api.get(`/classes/${activeClass.id}/assignments`);
      setAssignments(asgRes.data?.assignments || []);

      // Fetch meetings
      const meetRes = await api.get(`/classes/${activeClass.id}/meetings`);
      setMeetings(meetRes.data?.meetings || []);

      // Fetch discussions
      const discRes = await api.get(`/classes/${activeClass.id}/discussions`);
      setDiscussions(discRes.data?.discussions || []);

      // Fetch students
      const studRes = await api.get(`/classes/${activeClass.id}/students`);
      setStudents(studRes.data?.students || []);
    } catch (error) {
      console.error('Error loading class details:', error);
    }
  };

  useEffect(() => {
    if (activeClass) {
      fetchClassDetails();
    }
  }, [activeClass]);

  useEffect(() => {
    if (activeTab === 'discussions') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [discussions, activeTab]);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateClass = async () => {
    if (!newClassName.trim() || !teacher?.id) return;

    try {
      const response = await api.post('/classes', {
        teacherId: teacher.id,
        name: newClassName
      });
      if (response.data?.success) {
        setClasses([response.data.class, ...classes]);
        setNewClassName('');
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Không thể tạo lớp học. Vui lòng thử lại.');
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lớp học này? Tất cả học sinh sẽ bị ngắt kết nối.')) return;
    try {
      const response = await api.delete(`/classes/${classId}`);
      if (response.data?.success) {
        setClasses(classes.filter(c => c.id !== classId));
        if (activeClass?.id === classId) setActiveClass(null);
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Không thể xóa lớp học.');
    }
  };

  const copyClassCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  // Class Management actions
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim() || !activeClass?.id) return;

    try {
      const response = await api.post(`/classes/${activeClass.id}/announcements`, {
        title: newAnnTitle.trim(),
        content: newAnnContent.trim()
      });

      if (response.data?.success) {
        setAnnouncements([response.data.announcement, ...announcements]);
        setNewAnnTitle('');
        setNewAnnContent('');
      }
    } catch (error) {
      console.error('Error posting announcement:', error);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!asgTitle.trim() || !asgLink.trim() || !activeClass?.id) return;

    try {
      const response = await api.post(`/classes/${activeClass.id}/assignments`, {
        title: asgTitle.trim(),
        description: asgDesc.trim(),
        link: asgLink.trim(),
        resourceId: asgLink.trim(),
        type: 'custom',
        dueDate: asgDueDate ? asgDueDate : null
      });

      if (response.data?.success) {
        setAssignments([response.data.assignment, ...assignments]);
        setAsgTitle('');
        setAsgLink('');
        setAsgDesc('');
        setAsgDueDate('');
        setShowAssignModal(false);
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Không thể giao bài tập. Vui lòng thử lại.');
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!meetTitle.trim() || !meetLink.trim() || !meetStartTime || !activeClass?.id) return;

    try {
      const response = await api.post(`/classes/${activeClass.id}/meetings`, {
        title: meetTitle.trim(),
        description: meetDesc.trim(),
        meetingLink: meetLink.trim(),
        startTime: meetStartTime
      });

      if (response.data?.success) {
        setMeetings([response.data.meeting, ...meetings]);
        setMeetTitle('');
        setMeetDesc('');
        setMeetLink('');
        setMeetStartTime('');
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || !activeClass?.id || !teacher?.id) return;

    try {
      const response = await api.post(`/classes/${activeClass.id}/discussions`, {
        userId: teacher.id,
        content: newPostContent.trim()
      });

      if (response.data?.success) {
        setDiscussions([...discussions, response.data.discussion]);
        setNewPostContent('');
      }
    } catch (error) {
      console.error('Error posting discussion:', error);
    }
  };

  // View individual assignment progress across all students
  const handleViewAsgProgress = async (asg) => {
    setSelectedAsgProgress(asg);
    setLoadingProgress(true);
    try {
      // For each student, query if they completed this resource
      const progress = await Promise.all(students.map(async (stud) => {
        let completed = false;
        let score = null;
        let completedAt = null;

        if (asg.type === 'lesson') {
          const res = await api.get(`/classes/${activeClass.id}/assignments?studentId=${stud.id}`);
          const matching = (Array.isArray(res.data?.assignments) ? res.data.assignments : []).find(a => a.id === asg.id);
          if (matching) {
            completed = matching.completed;
            score = matching.score;
          }
        } else {
          const res = await api.get(`/classes/${activeClass.id}/assignments?studentId=${stud.id}`);
          const matching = (Array.isArray(res.data?.assignments) ? res.data.assignments : []).find(a => a.id === asg.id);
          if (matching) {
            completed = matching.completed;
            score = matching.score;
          }
        }

        return {
          id: stud.id,
          name: stud.name,
          email: stud.email,
          completed,
          score
        };
      }));
      setAsgProgressData(progress);
    } catch (error) {
      console.error('Error loading assignment progress:', error);
    } finally {
      setLoadingProgress(false);
    }
  };

  // Render detail view if a class is selected
  if (activeClass) {
    return (
      <div className="space-y-6 animate-fade-in">
        
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setActiveClass(null);
                setSelectedAsgProgress(null);
              }}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-mono font-bold text-indigo-600">
                  MÃ LỚP: {activeClass.code}
                </span>
                <button
                  onClick={() => copyClassCode(activeClass.code)}
                  className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Sao chép mã lớp"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1">{activeClass.name}</h1>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Học sinh trong lớp</p>
              <p className="text-lg font-black text-indigo-600 mt-0.5">{students.length} học sinh</p>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Menu Sidebar */}
          <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-1">
            {[
              { id: 'feed', name: 'Đăng thông báo', icon: Megaphone },
              { id: 'assignments', name: 'Giao bài tập', icon: BookOpen },
              { id: 'discussions', name: 'Thảo luận lớp', icon: MessageSquare },
              { id: 'meetings', name: 'Lên lịch học', icon: Video },
              { id: 'students', name: 'Tiến độ học sinh', icon: Users }
            ].map(tab => {
              const TabIcon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedAsgProgress(null);
                  }}
                  className={`font-heading w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-extrabold text-sm transition-all ${
                    active 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <TabIcon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="lg:col-span-3 space-y-6">

            {/* TAB 1: ANNOUNCEMENTS */}
            {activeTab === 'feed' && (
              <div className="space-y-6">
                {/* Form */}
                <form onSubmit={handlePostAnnouncement} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-black text-slate-900">Tạo thông báo mới</h3>
                  <div>
                    <input
                      type="text"
                      placeholder="Tiêu đề thông báo..."
                      value={newAnnTitle}
                      onChange={(e) => setNewAnnTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Nội dung chi tiết thông báo..."
                      rows={3}
                      value={newAnnContent}
                      onChange={(e) => setNewAnnContent(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={!newAnnTitle.trim() || !newAnnContent.trim()}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-colors"
                  >
                    Đăng thông báo
                  </button>
                </form>

                {/* List */}
                <div className="space-y-4">
                  <h4 className="font-black text-slate-900">Các thông báo đã đăng</h4>
                  {announcements.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center text-slate-400">
                      Chưa có thông báo nào được tạo
                    </div>
                  ) : (
                    announcements.map(ann => (
                      <div key={ann.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
                        <h5 className="font-black text-slate-950 text-base">{ann.title}</h5>
                        <p className="text-sm text-slate-600 font-medium whitespace-pre-line">{ann.content}</p>
                        <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Đã đăng ngày {new Date(ann.created_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: ASSIGNMENTS */}
            {activeTab === 'assignments' && (
              <div className="space-y-6">
                {!selectedAsgProgress ? (
                  <>
                    {/* Header & Open Modal Button */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-900">Danh sách bài tập & Nhiệm vụ</h3>
                        <p className="text-xs text-slate-400 font-bold mt-1">Giao bài tập cho học sinh qua đường dẫn / tài liệu học tập bên ngoài</p>
                      </div>
                      <button
                        onClick={() => setShowAssignModal(true)}
                        className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Giao bài tập mới
                      </button>
                    </div>

                    {/* Assignments List */}
                    <div className="space-y-4">
                      <h4 className="font-black text-slate-900">Các nhiệm vụ đã giao ({assignments.length})</h4>
                      {assignments.length === 0 ? (
                        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
                          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                          <p className="font-bold text-slate-500 text-sm">Chưa có bài tập nào được giao cho lớp này.</p>
                          <p className="text-xs text-slate-400 mt-1">Bấm nút "Giao bài tập mới" ở trên để đính kèm link bài cho học sinh làm.</p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {assignments.map(asg => {
                            const link = asg.link || asg.resource_id;
                            return (
                              <div 
                                key={asg.id}
                                className="bg-white border border-slate-100 hover:border-indigo-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                              >
                                <div className="space-y-2 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                                      LINK BÀI TẬP
                                    </span>
                                    {asg.due_date && (
                                      <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Hạn nộp: {new Date(asg.due_date).toLocaleDateString('vi-VN')}
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="font-black text-slate-900 text-base group-hover:text-indigo-600 transition-colors">{asg.title}</h5>
                                  {asg.description && (
                                    <p className="text-xs text-slate-500 font-medium">{asg.description}</p>
                                  )}
                                  {link && (
                                    <div className="flex items-center gap-2 pt-1">
                                      <a
                                        href={link.startsWith('http') ? link : 'https://' + link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-indigo-600 rounded-xl text-xs font-bold transition-all"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        Mở link bài tập
                                      </a>
                                    </div>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleViewAsgProgress(asg)}
                                  className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0 self-end sm:self-center"
                                >
                                  Xem tiến độ <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // Single Assignment Progress Tracking
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedAsgProgress(null)}
                          className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                          <h3 className="font-black text-slate-950 text-base">{selectedAsgProgress.title}</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Theo dõi chi tiết kết quả</p>
                        </div>
                      </div>
                    </div>

                    {loadingProgress ? (
                      <div className="py-12 text-center text-slate-400 font-bold">
                        Đang lấy thông tin tiến độ...
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {asgProgressData.map(stud => (
                          <div key={stud.id} className="py-3 flex items-center justify-between gap-4">
                            <div>
                              <p className="font-black text-slate-800 text-sm">{stud.name}</p>
                              <p className="text-xs text-slate-400 font-semibold">{stud.email}</p>
                            </div>
                            <div>
                              {stud.completed ? (
                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-black flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành {stud.score !== null && `(${stud.score}đ)`}
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-100 rounded-lg text-xs font-bold">
                                  Chưa hoàn thành
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: DISCUSSIONS */}
            {activeTab === 'discussions' && (
              <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col h-[550px] overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Trao đổi lớp học</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lắng nghe và giải đáp học sinh</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                  {discussions.length === 0 ? (
                    <div className="text-center text-slate-400 py-16">
                      Chưa có trao đổi nào
                    </div>
                  ) : (
                    discussions.map(disc => {
                      const isOwn = disc.user_id === teacher.id;
                      return (
                        <div key={disc.id} className={`flex items-end gap-3 max-w-[85%] ${isOwn ? 'ml-auto flex-row-reverse' : ''}`}>
                          {!isOwn && (
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-600 border border-slate-200">
                              {disc.user?.name?.charAt(0) || 'H'}
                            </div>
                          )}

                          <div className="space-y-1">
                            {!isOwn && (
                              <span className="text-[10px] font-black text-slate-700">{disc.user?.name}</span>
                            )}
                            <div className={`p-3.5 rounded-2xl text-sm leading-relaxed font-semibold shadow-sm ${
                              isOwn 
                              ? 'bg-indigo-600 text-white rounded-br-none' 
                              : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                            }`}>
                              <p className="whitespace-pre-line">{disc.content}</p>
                            </div>
                            <p className={`text-[9px] text-slate-400 font-bold ${isOwn ? 'text-right' : ''}`}>
                              {new Date(disc.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handlePostDiscussion} className="p-4 border-t border-slate-100 bg-white flex items-center gap-3">
                  <input
                    type="text"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Nhập nội dung trả lời học sinh..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                  />
                  <button
                    type="submit"
                    disabled={!newPostContent.trim()}
                    className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl transition-all active:scale-95 disabled:scale-100 shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 4: MEETINGS */}
            {activeTab === 'meetings' && (
              <div className="space-y-6">
                {/* Form */}
                <form onSubmit={handleCreateMeeting} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-black text-slate-900">Lên lịch họp / Lịch học trực tuyến mới</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Tiêu đề buổi họp</label>
                      <input
                        type="text"
                        placeholder="VD: Ôn tập chương 1 - Động học chất điểm"
                        value={meetTitle}
                        onChange={(e) => setMeetTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Đường dẫn Zoom / Google Meet</label>
                      <input
                        type="text"
                        placeholder="VD: meet.google.com/abc-def-ghi"
                        value={meetLink}
                        onChange={(e) => setMeetLink(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Ghi chú hướng dẫn</label>
                      <input
                        type="text"
                        placeholder="VD: Chuẩn bị máy tính bỏ túi và tài liệu..."
                        value={meetDesc}
                        onChange={(e) => setMeetDesc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Thời gian bắt đầu</label>
                      <input
                        type="datetime-local"
                        value={meetStartTime}
                        onChange={(e) => setMeetStartTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!meetTitle.trim() || !meetLink.trim() || !meetStartTime}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-colors"
                  >
                    Tạo lịch học
                  </button>
                </form>

                {/* List */}
                <div className="space-y-4">
                  <h4 className="font-black text-slate-900">Các lịch học trực tuyến đã lên</h4>
                  {meetings.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center text-slate-400">
                      Chưa có lịch học nào
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {meetings.map(meet => (
                        <div key={meet.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                              <Video className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="font-black text-slate-900 text-sm">{meet.title}</h5>
                              <div className="flex gap-3 text-xs text-slate-400 font-bold mt-1">
                                <span className="text-indigo-600">{new Date(meet.start_time).toLocaleDateString('vi-VN')}</span>
                                <span>{new Date(meet.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </div>
                          <a
                            href={meet.meeting_link.startsWith('http') ? meet.meeting_link : 'https://' + meet.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-black rounded-lg transition-colors flex items-center gap-1"
                          >
                            Mở Link <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: STUDENTS */}
            {activeTab === 'students' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900">Chi tiết kết quả học tập của học sinh</h3>
                  <span className="text-xs text-slate-400 font-bold">{students.length} học sinh</span>
                </div>

                {students.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center text-slate-400">
                    Chưa có học sinh nào tham gia lớp học
                  </div>
                ) : (
                  <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                          <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Học sinh</th>
                          <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Cấp độ (XP)</th>
                          <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Bài học đã làm</th>
                          <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Điểm trung bình</th>
                          <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Hoạt động cuối</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700 text-sm">
                        {students.map(stud => (
                          <tr key={stud.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="p-4">
                              <p className="font-black text-slate-900">{stud.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold mt-0.5">{stud.email}</p>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-xs font-bold text-indigo-600">
                                Lvl {stud.level} ({stud.xp} XP)
                              </span>
                            </td>
                            <td className="p-4 font-bold text-slate-800">{stud.lessonsCompleted} bài</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-xs font-black ${
                                stud.avgScore >= 80 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : stud.avgScore >= 50 
                                ? 'bg-amber-50 text-amber-700' 
                                : 'bg-rose-50 text-rose-700'
                              }`}>
                                {stud.avgScore}%
                              </span>
                            </td>
                            <td className="p-4 text-xs text-slate-400 font-bold">{stud.lastActive}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Assign Homework Popup Modal inside activeClass view */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading text-2xl font-extrabold text-slate-900">Giao bài tập mới</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Dán liên kết (link) bài tập để giao cho học sinh</p>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all font-black text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Tên nhiệm vụ / Bài tập <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Bài tập Lực Ma Sát - Làm quiz trên Google Form"
                    value={asgTitle}
                    onChange={(e) => setAsgTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Đường dẫn (Link) Bài tập / Tài liệu <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://... (Google Drive, Form, Youtube, Quizizz...)"
                      value={asgLink}
                      onChange={(e) => setAsgLink(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                      required
                    />
                    <ExternalLink className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Hướng dẫn / Ghi chú cho học sinh
                  </label>
                  <textarea
                    rows={3}
                    placeholder="VD: Học sinh nhấp vào link để làm bài và nộp lại theo yêu cầu..."
                    value={asgDesc}
                    onChange={(e) => setAsgDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Hạn chót làm bài (Không bắt buộc)
                  </label>
                  <input
                    type="date"
                    value={asgDueDate}
                    onChange={(e) => setAsgDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 px-4 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-xl transition-all text-sm"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={!asgTitle.trim() || !asgLink.trim()}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white rounded-xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm shadow-lg shadow-emerald-500/20"
                  >
                    Giao bài tập
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {copiedCode && (
          <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-fade-in z-50">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
            <span>Đã sao chép mã lớp: {copiedCode}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Quản lý lớp học</h1>
          <p className="text-slate-500 font-bold text-sm mt-1">Tạo và quản lý các lớp học của bạn</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-sm font-black rounded-[1.25rem] shadow-xl shadow-emerald-500/20 transition-all uppercase tracking-widest"
        >
          <Plus className="w-5 h-5" />
          Tạo lớp mới
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm lớp học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold"
        />
      </div>

      {/* Classes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClasses.map((cls) => (
          <div
            key={cls.id}
            className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <button 
                  onClick={() => handleDeleteClass(cls.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Xóa lớp học"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-slate-900 font-black text-lg mb-2 group-hover:text-indigo-600 transition-colors">{cls.name}</h3>

              {/* Class Code */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-500 font-mono font-bold">
                  {cls.code}
                </span>
                <button
                  onClick={() => copyClassCode(cls.code)}
                  className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Sao chép mã lớp"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-slate-500 font-bold mb-6">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  {cls.students} học sinh
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  {cls.lessons} bài học
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setActiveClass(cls);
                  setActiveTab('feed');
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-slate-600 hover:text-slate-900 font-bold rounded-xl text-sm transition-all"
              >
                <Settings className="w-4 h-4" />
                Quản lý
              </button>
              <button 
                onClick={() => copyClassCode(cls.code)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100/50 hover:border-emerald-200 text-emerald-600 font-bold rounded-xl text-sm transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Mã lớp
              </button>
            </div>
          </div>
        ))}

        {/* Empty State / Create New */}
        {filteredClasses.length === 0 && (
          <div
            onClick={() => setShowCreateModal(true)}
            className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-slate-50 transition-all flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-slate-400 mb-1 font-bold">Chưa có lớp học nào</p>
            <p className="text-emerald-600 text-sm font-black">Tạo lớp đầu tiên của bạn</p>
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-4">Tạo lớp học mới</h2>

            <div className="mb-6">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                Tên lớp học
              </label>
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="VD: Lớp 10A1 - Vật lý nâng cao"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-xl transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateClass}
                disabled={!newClassName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white rounded-xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
              >
                Tạo lớp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Homework Popup Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-2xl font-extrabold text-slate-900">Giao bài tập mới</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Dán liên kết (link) bài tập để giao cho học sinh</p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all font-black text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên nhiệm vụ / Bài tập <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Bài tập Lực Ma Sát - Làm quiz trên Google Form"
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Đường dẫn (Link) Bài tập / Tài liệu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://... (Google Drive, Form, Youtube, Quizizz...)"
                    value={asgLink}
                    onChange={(e) => setAsgLink(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                    required
                  />
                  <ExternalLink className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Hướng dẫn / Ghi chú cho học sinh
                </label>
                <textarea
                  rows={3}
                  placeholder="VD: Học sinh nhấp vào link để làm bài và nộp lại theo yêu cầu..."
                  value={asgDesc}
                  onChange={(e) => setAsgDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  Hạn chót làm bài (Không bắt buộc)
                </label>
                <input
                  type="date"
                  value={asgDueDate}
                  onChange={(e) => setAsgDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-xl transition-all text-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={!asgTitle.trim() || !asgLink.trim()}
                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white rounded-xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm shadow-lg shadow-emerald-500/20"
                >
                  Giao bài tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {copiedCode && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-fade-in z-50">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
          <span>Đã sao chép mã lớp: {copiedCode}</span>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  GraduationCap,
  Users,
  Megaphone,
  BookOpen,
  MessageSquare,
  Video,
  Plus,
  Send,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronRight,
  User,
  ArrowRight,
  Search,
  ArrowLeft,
  Filter,
  Clock3,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import api from '../config/api';
import { openDocumentInNewTab } from '../utils/documentViewer';
import { logSessionActivity } from '../services/activityLogger';

const MyClass = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Enrolled / Requested classes of the student
  const [myClasses, setMyClasses] = useState([]);
  
  // All public/featured classes for browsing
  const [allClasses, setAllClasses] = useState([]);
  
  // Active class state (null = outer exploration view)
  const [activeClass, setActiveClass] = useState(null);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'assignments', 'discussions', 'meetings', 'members'
  
  // Filter & Search states
  const [selectedGrade, setSelectedGrade] = useState('all'); // 'all', '6', '7', '8', '9', '10', '11', '12'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & inputs
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCodeInput, setClassCodeInput] = useState('');
  const [newPostInput, setNewPostInput] = useState('');
  
  // Active Class Detail Data
  const [announcements, setAnnouncements] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [members, setMembers] = useState([]);
  
  // UI Loading/Message states
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [togglingAsgId, setTogglingAsgId] = useState(null);

  // Scroll ref for chat
  const chatEndRef = useRef(null);

  // 1. Fetch student enrolled & pending classes
  const fetchStudentClasses = async () => {
    if (!user?.id) return;
    try {
      const response = await api.get(`/classes/student/${user.id}`);
      if (response.data?.success) {
        setMyClasses(response.data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching student classes:', error);
    }
  };

  // 2. Fetch all available teacher classes for exploration
  const fetchAllClasses = async () => {
    if (!user?.id) return;
    try {
      const response = await api.get(`/classes/all?studentId=${user.id}`);
      if (response.data?.success) {
        setAllClasses(response.data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching all classes:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchStudentClasses(), fetchAllClasses()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // 3. Fetch active class details
  const fetchClassDetails = async () => {
    if (!activeClass?.id) return;
    try {
      setWarningMsg('');
      
      const annRes = await api.get(`/classes/${activeClass.id}/announcements`);
      if (annRes.data?.warning === 'needs_migration') {
        setWarningMsg('Hệ thống đang nâng cấp tính năng thông báo. Vui lòng thử lại sau.');
      }
      setAnnouncements(annRes.data?.announcements || []);

      const asgRes = await api.get(`/classes/${activeClass.id}/assignments?studentId=${user.id}`);
      setAssignments(asgRes.data?.assignments || []);

      const meetRes = await api.get(`/classes/${activeClass.id}/meetings`);
      setMeetings(meetRes.data?.meetings || []);

      const discRes = await api.get(`/classes/${activeClass.id}/discussions`);
      setDiscussions(discRes.data?.discussions || []);

      const memRes = await api.get(`/classes/${activeClass.id}/students`);
      setMembers(memRes.data?.students || []);
      
    } catch (error) {
      console.error('Error fetching class details:', error);
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

  // Handle joining a class via Code or Card click
  const handleJoinClass = async (e, codeOverride = null, targetClassId = null) => {
    if (e) e.preventDefault();
    const codeToUse = codeOverride || classCodeInput;
    if (!codeToUse.trim() && !targetClassId) return;
    if (!user?.id) return;

    setErrorMsg('');
    setSuccessMsg('');
    if (targetClassId) setJoiningId(targetClassId);

    try {
      const response = await api.post('/classes/join', {
        studentId: user.id,
        classCode: codeToUse ? codeToUse.trim().toUpperCase() : undefined,
        classId: targetClassId || undefined
      });

      if (response.data?.success) {
        setSuccessMsg(response.data.message || 'Đã gửi yêu cầu gia nhập thành công!');
        setClassCodeInput('');
        setShowJoinModal(false);
        // Refresh both lists
        await fetchStudentClasses();
        await fetchAllClasses();
      }
    } catch (error) {
      console.error('Error joining class:', error);
      setErrorMsg(error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu tham gia lớp');
    } finally {
      setJoiningId(null);
    }
  };

  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    if (!newPostInput.trim() || !activeClass?.id || !user?.id) return;

    try {
      const response = await api.post(`/classes/${activeClass.id}/discussions`, {
        userId: user.id,
        content: newPostInput.trim()
      });

      if (response.data?.success) {
        setDiscussions([...discussions, response.data.discussion]);
        setNewPostInput('');
      }
    } catch (error) {
      console.error('Error posting discussion:', error);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const navigateToAssignment = (asg) => {
    const targetUrl = asg.link || asg.resource_id;
    if (targetUrl && targetUrl.startsWith('data:')) {
      openDocumentInNewTab(targetUrl);
      return;
    }
    if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
      openDocumentInNewTab(targetUrl);
      return;
    }
    if (asg.type === 'lesson') {
      const parts = (asg.resource_id || '').split('-');
      if (parts.length >= 3) {
        navigate(`/physics-lesson/${parts[0]}/${parts[1]}/${parts[2]}`);
      } else {
        navigate('/physics-classes');
      }
    } else if (asg.type === 'challenge') {
      navigate(`/advanced-physics-challenge`);
    } else if (targetUrl) {
      openDocumentInNewTab(targetUrl);
    }
  };

  const handleToggleAssignmentComplete = async (e, asg) => {
    e.stopPropagation();
    if (!user?.id || !activeClass?.id) return;

    const targetCompleted = !asg.completed;
    setTogglingAsgId(asg.id);

    // Optimistic UI update
    setAssignments(prev => prev.map(a => a.id === asg.id ? { ...a, completed: targetCompleted, score: targetCompleted ? 100 : null } : a));

    try {
      const res = await api.post(`/classes/${activeClass.id}/assignments/${asg.id}/toggle-complete`, {
        studentId: user.id,
        completed: targetCompleted
      });

      if (res.data?.success) {
        if (targetCompleted) {
          logSessionActivity(
            'lesson',
            `Hoàn thành bài tập: ${asg.title}`,
            `Lớp: ${activeClass?.name || 'Vật lý'} • Giao diện bài tập`,
            50
          );
          setSuccessMsg(res.data.message || 'Đã báo cáo hoàn thành bài tập tới giáo viên!');
          setTimeout(() => setSuccessMsg(''), 4000);
        }
      } else {
        // Revert on failure
        setAssignments(prev => prev.map(a => a.id === asg.id ? { ...a, completed: asg.completed, score: asg.score } : a));
      }
    } catch (error) {
      console.error('Error toggling assignment complete:', error);
      setAssignments(prev => prev.map(a => a.id === asg.id ? { ...a, completed: asg.completed, score: asg.score } : a));
    } finally {
      setTogglingAsgId(null);
    }
  };

  // Filtered public classes for discovery (only show classes student HAS NOT joined yet)
  const filteredAllClasses = allClasses.filter(cls => {
    const notJoined = cls.myStatus !== 'approved';
    const matchGrade = selectedGrade === 'all' || cls.grade === parseInt(selectedGrade);
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || (cls.name && cls.name.toLowerCase().includes(q)) || (cls.code && cls.code.toLowerCase().includes(q));
    return notJoined && matchGrade && matchSearch;
  });

  // My Classes: ONLY show classes that the student has successfully joined ('approved')
  const approvedMyClasses = myClasses.filter(c => c.membershipStatus === 'approved');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold">Đang tải danh sách lớp học...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: ACTIVE CLASS WORKSPACE (When a specific class is selected)
  // =========================================================================
  if (activeClass) {
    const activeStatus = activeClass.membershipStatus || activeClass.myStatus || 'approved';
    if (activeStatus !== 'approved') {
      setActiveClass(null);
      return null;
    }

    return (
      <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Warning Banner for Migration */}
          {warningMsg && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-800 shadow-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-sm">Thông báo hệ thống</h4>
                <p className="text-xs font-semibold mt-0.5">{warningMsg}</p>
              </div>
            </div>
          )}

          {/* Top Class Header with BACK BUTTON */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
              {/* BACK BUTTON TO RETURN TO EXPLORE DASHBOARD */}
              <button
                onClick={() => setActiveClass(null)}
                className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 rounded-2xl transition-all shadow-sm flex items-center gap-2 font-black text-xs group shrink-0"
                title="Quay lại danh sách lớp học"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Quay lại</span>
              </button>

              <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
                <GraduationCap className="w-7 h-7 text-indigo-600" />
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                {/* Grade Badge & status tag */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-indigo-100/90 border border-indigo-200/80 rounded-lg text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                    Khối {activeClass.grade || 10}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">Lớp học chính thức</span>
                </div>

                {/* Class Title - Full width, wraps cleanly without awkward truncation */}
                <h1 className="font-heading text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug break-words">
                  {activeClass.name}
                </h1>

                {/* Class Code & Teacher Meta Row */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-0.5">
                  {/* Class Code */}
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1 text-xs font-bold text-slate-500 shadow-sm">
                    <span className="font-mono text-slate-700 tracking-wider">Mã lớp: {activeClass.code}</span>
                    <button
                      onClick={() => copyCode(activeClass.code)}
                      className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
                      title="Sao chép mã lớp"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Teacher info */}
                  {activeClass.teacher && (
                    <div className="flex items-center gap-2 bg-indigo-50/45 border border-indigo-100/30 rounded-xl px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                      {activeClass.teacher.avatar ? (
                        <img 
                          src={activeClass.teacher.avatar} 
                          alt="Teacher" 
                          className="w-5 h-5 rounded-full object-cover border border-white shadow-sm flex-shrink-0" 
                        />
                      ) : (
                        <div className="w-5 h-5 bg-indigo-100 border border-indigo-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-3 h-3 text-indigo-600" />
                        </div>
                      )}
                      <span>GV: {activeClass.teacher.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Switch Class Dropdown if Student enrolled in multiple approved classes */}
            <div className="flex items-center gap-3 self-end md:self-center">
              {approvedMyClasses.length > 1 && (
                <div className="relative">
                  <select
                    value={activeClass.id}
                    onChange={(e) => {
                      const selected = approvedMyClasses.find(c => c.id === e.target.value);
                      if (selected) setActiveClass(selected);
                    }}
                    className="bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-xs font-black focus:outline-none cursor-pointer transition-all pr-8 appearance-none shadow-sm hover:border-indigo-200"
                    style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundPosition: 'right 10px center', backgroundSize: '14px', backgroundRepeat: 'no-repeat' }}
                  >
                    {approvedMyClasses.map(c => (
                      <option key={c.id} value={c.id} className="text-slate-900 font-bold">Chuyển lớp: {c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={() => setActiveClass(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl transition-all flex items-center gap-1.5 text-xs uppercase tracking-wider"
              >
                <Search className="w-4 h-4" /> Tìm lớp khác
              </button>
            </div>
          </div>

          {/* Class Navigation & Content Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-1">
              {[
                { id: 'feed', name: 'Bảng tin', icon: Megaphone },
                { id: 'assignments', name: 'Nhiệm vụ của tôi', icon: BookOpen, count: assignments.filter(a => !a.completed).length },
                { id: 'discussions', name: 'Thảo luận lớp', icon: MessageSquare },
                { id: 'meetings', name: 'Lịch học trực tuyến', icon: Video },
                { id: 'members', name: 'Bạn cùng lớp', icon: Users }
              ].map(tab => {
                const TabIcon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`font-heading w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                      active 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TabIcon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{tab.name}</span>
                    </div>
                    {tab.count > 0 && (
                      <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full shadow-sm">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* TAB 1: BẢNG TIN */}
              {activeTab === 'feed' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-xl font-extrabold text-slate-900">Thông báo mới nhất</h2>
                    <span className="text-xs text-slate-400 font-bold">{announcements.length} thông báo</span>
                  </div>

                  {announcements.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
                      <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                      <p className="font-bold">Lớp học hiện tại chưa có thông báo nào từ giáo viên.</p>
                    </div>
                  ) : (
                    announcements.map(ann => (
                      <div key={ann.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-indigo-600" />
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-heading font-extrabold text-slate-900 text-lg mb-2">{ann.title}</h3>
                            <p className="font-body text-slate-600 leading-relaxed text-sm whitespace-pre-line font-medium">{ann.content}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-50 mt-6 pt-4 text-xs font-bold text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" /> Giáo viên
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {new Date(ann.created_at).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: NHIỆM VỤ */}
              {activeTab === 'assignments' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-xl font-extrabold text-slate-900">Bài tập & Thử thách được giao</h2>
                    <span className="text-xs text-slate-400 font-bold">{assignments.length} nhiệm vụ</span>
                  </div>

                  {assignments.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
                      <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                      <p className="font-bold">Hiện không có nhiệm vụ hoặc bài tập nào được giao cho bạn.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {assignments.map(asg => (
                        <div 
                          key={asg.id} 
                          className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 group ${
                            asg.completed ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                asg.type === 'link' || (asg.link && asg.link.startsWith('http'))
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : asg.type === 'lesson' 
                                ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                : 'bg-amber-50 text-amber-600 border border-amber-100'
                              }`}>
                                {asg.type === 'link' || (asg.link && asg.link.startsWith('http')) ? 'LINK BÀI TẬP' : asg.type === 'lesson' ? 'BÀI HỌC' : 'THỬ THÁCH'}
                              </span>
                              {asg.due_date && (
                                <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-rose-500" /> Hạn nộp: {new Date(asg.due_date).toLocaleDateString('vi-VN')}
                                </span>
                              )}
                              {asg.completed && (
                                <span className="text-[10px] text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã gửi kết quả cho GV
                                </span>
                              )}
                            </div>
                            <h3 
                              onClick={() => navigateToAssignment(asg)}
                              className="font-black text-slate-900 hover:text-indigo-600 transition-colors text-base cursor-pointer break-words"
                            >
                              {asg.title}
                            </h3>
                            {asg.description && (
                              <p className="text-xs text-slate-500 font-medium leading-relaxed break-words">{asg.description}</p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 shrink-0 self-start lg:self-center pt-2 lg:pt-0">
                            {/* Action: Open assignment */}
                            <button
                              type="button"
                              onClick={() => navigateToAssignment(asg)}
                              className="px-3.5 py-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                              title="Mở nội dung bài tập để làm"
                            >
                              <span>Làm bài</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>

                            {/* Action: Toggle completion status */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleAssignmentComplete(e, asg)}
                              disabled={togglingAsgId === asg.id}
                              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 group/btn ${
                                asg.completed
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                                  : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300'
                              } ${togglingAsgId === asg.id ? 'opacity-70 cursor-wait' : ''}`}
                              title={asg.completed ? 'Bấm để hủy trạng thái hoàn thành nếu muốn' : 'Bấm để đánh dấu hoàn thành và gửi báo cáo kết quả tới giáo viên'}
                            >
                              <CheckCircle2 className={`w-4 h-4 ${asg.completed ? 'text-white' : 'text-slate-400 group-hover/btn:text-emerald-600'}`} />
                              <span>{asg.completed ? '✓ Đã hoàn thành' : 'Đánh dấu đã hoàn thành'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: THẢO LUẬN */}
              {activeTab === 'discussions' && (
                <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col h-[600px] overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm">Phòng trao đổi chung</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gửi thắc mắc học tập trực tiếp cho lớp</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                    {discussions.length === 0 ? (
                      <div className="text-center text-slate-400 py-20">
                        <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                        <p className="font-bold text-sm">Chưa có thảo luận nào. Hãy gửi tin nhắn đầu tiên của bạn!</p>
                      </div>
                    ) : (
                      discussions.map(disc => {
                        const isOwn = disc.user_id === user.id;
                        const isTeacher = disc.user?.role === 'teacher';
                        return (
                          <div key={disc.id} className={`flex items-end gap-3 max-w-[85%] ${isOwn ? 'ml-auto flex-row-reverse' : ''}`}>
                            {!isOwn && (
                              disc.user?.avatar ? (
                                <img src={disc.user.avatar} alt="Avatar" className="w-8 h-8 rounded-lg object-cover border border-slate-100 shadow-sm" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-600 uppercase border border-slate-200">
                                  {disc.user?.name?.charAt(0) || 'U'}
                                </div>
                              )
                            )}
                            
                            <div className="space-y-1">
                              {!isOwn && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-black text-slate-700">{disc.user?.name}</span>
                                  {isTeacher && (
                                    <span className="px-1.5 py-0.5 bg-indigo-600 text-white rounded text-[7px] font-black uppercase tracking-wider">Giáo viên</span>
                                  )}
                                </div>
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
                      value={newPostInput}
                      onChange={(e) => setNewPostInput(e.target.value)}
                      placeholder="Nhập câu hỏi hoặc bài tập cần trao đổi..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                    />
                    <button
                      type="submit"
                      disabled={!newPostInput.trim()}
                      className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl shadow-md transition-all active:scale-95 disabled:scale-100"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 4: LỊCH HỌC */}
              {activeTab === 'meetings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-xl font-extrabold text-slate-900">Các buổi học trực tuyến</h2>
                    <span className="text-xs text-slate-400 font-bold">{meetings.length} buổi học</span>
                  </div>

                  {meetings.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
                      <Video className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                      <p className="font-bold">Không có lịch học trực tuyến nào sắp diễn ra.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {meetings.map(meet => {
                        const isHappening = new Date(meet.start_time).getTime() - Date.now() < 3600000 && new Date(meet.start_time).getTime() > Date.now() - 3600000;
                        return (
                          <div key={meet.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div className="flex gap-4 items-start">
                              <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Video className="w-6 h-6 text-rose-600" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-black text-slate-900 text-base">{meet.title}</h3>
                                {meet.description && (
                                  <p className="text-sm text-slate-500 font-medium">{meet.description}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400 mt-2">
                                  <span className="flex items-center gap-1 text-indigo-600">
                                    <Calendar className="w-3.5 h-3.5" /> {new Date(meet.start_time).toLocaleDateString('vi-VN')}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> {new Date(meet.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-auto">
                              {isHappening && (
                                <span className="px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider animate-pulse">
                                  Đang diễn ra
                                </span>
                              )}
                              <a
                                href={meet.meeting_link.startsWith('http') ? meet.meeting_link : 'https://' + meet.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 uppercase tracking-wider"
                              >
                                Tham gia Meet/Zoom <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: BẠN CÙNG LỚP */}
              {activeTab === 'members' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-xl font-extrabold text-slate-900">Danh sách học sinh trong lớp</h2>
                    <span className="text-xs text-slate-400 font-bold">{members.length} học sinh</span>
                  </div>

                  {members.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
                      <Users className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                      <p className="font-bold">Lớp học hiện tại chưa có thành viên nào khác.</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
                      <div className="divide-y divide-slate-100">
                        {members.map((mem, index) => (
                          <div key={mem.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="w-6 text-xs font-black text-slate-400 text-center">#{index + 1}</span>
                              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center font-black text-xs text-slate-600 border border-slate-200 uppercase">
                                {mem.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-black text-slate-800 text-sm">{mem.name}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Level {mem.level} • {mem.xp} XP</p>
                              </div>
                            </div>
                            <span className="text-xs text-slate-400 font-bold">Hoạt động: {mem.lastActive}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: OUTER DISCOVERY & CLASS MANAGEMENT DASHBOARD (Default outer view)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Success / Error Messages */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="text-sm font-bold">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-xs font-bold text-emerald-600 hover:underline">Đóng</button>
          </div>
        )}

        {/* SECTION 1: LỚP HỌC CỦA TÔI (My Approved Joined Classes) */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-extrabold text-slate-900">Lớp Học Của Tôi</h2>
                <p className="text-xs text-slate-400 font-bold">Các lớp học bạn đã được giáo viên chấp nhận tham gia chính thức</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-black text-slate-600">
                {approvedMyClasses.length} lớp
              </span>
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 text-slate-950 font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs uppercase tracking-wider active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nhập Mã Lớp</span>
              </button>
            </div>
          </div>

          {approvedMyClasses.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center text-slate-400 shadow-sm">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700 text-sm">Bạn chưa tham gia chính thức lớp học nào.</p>
              <p className="text-xs text-slate-400 mt-1">Hãy chọn một lớp từ danh sách khám phá bên dưới hoặc nhập Mã Lớp để gửi yêu cầu cho giáo viên nhé!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedMyClasses.map(cls => {
                return (
                  <div
                    key={cls.id}
                    className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-5 relative overflow-hidden group"
                  >
                    {/* Top Accent line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />

                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-[10px] uppercase rounded-lg">
                          Khối {cls.grade || 10}
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-[10px] rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã tham gia
                        </span>
                      </div>

                      <div>
                        <h3 className="font-heading font-extrabold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{cls.name}</h3>
                        <p className="text-xs text-slate-400 font-semibold mt-1">Mã lớp: <span className="font-mono font-bold text-slate-600">{cls.code}</span></p>
                      </div>

                      {/* Teacher info */}
                      {cls.teacher && (
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-50 text-xs font-semibold text-slate-500">
                          {cls.teacher.avatar ? (
                            <img src={cls.teacher.avatar} alt="Teacher" className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>GV: {cls.teacher.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-3 border-t border-slate-50">
                      <button
                        onClick={() => setActiveClass(cls)}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                      >
                        Vào Lớp Học <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: KHÁM PHÁ & TÌM KIẾM LỚP HỌC (Grade 6-12 filter & Class code search) */}
        <div className="space-y-6 pt-6 border-t border-slate-200/60">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-extrabold text-slate-900">Khám Phá Lớp Học Theo Khối</h2>
              <p className="text-xs text-slate-400 font-bold mt-0.5">Tìm kiếm lớp theo Khối do Giáo Viên đăng ký hoặc tìm bằng Mã Lớp</p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mã lớp (VD: AM1Z9Y) hoặc tên lớp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Grade Selector Tabs (Khối 6-12) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Lọc Khối:
            </span>
            {[
              { id: 'all', label: 'Tất cả khối' },
              { id: '6', label: 'Khối 6' },
              { id: '7', label: 'Khối 7' },
              { id: '8', label: 'Khối 8' },
              { id: '9', label: 'Khối 9' },
              { id: '10', label: 'Khối 10' },
              { id: '11', label: 'Khối 11' },
              { id: '12', label: 'Khối 12' }
            ].map(gradeTab => {
              const active = selectedGrade === gradeTab.id;
              return (
                <button
                  key={gradeTab.id}
                  onClick={() => setSelectedGrade(gradeTab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition-all ${
                    active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {gradeTab.label}
                </button>
              );
            })}
          </div>

          {/* Available Classes Grid */}
          {filteredAllClasses.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-600 text-sm">Không tìm thấy lớp học nào phù hợp.</p>
              <p className="text-xs text-slate-400 mt-1">Thử chọn lại bộ lọc khối lớp khác hoặc tìm bằng Mã Lớp chính xác.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAllClasses.map(cls => {
                const status = cls.myStatus; // 'approved', 'pending', 'rejected', or null
                const isApproved = status === 'approved';
                const isPending = status === 'pending';
                const isRejected = status === 'rejected';
                const isJoining = joiningId === cls.id;

                return (
                  <div key={cls.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-5 group">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-[10px] uppercase rounded-lg">
                          Khối {cls.grade || 10}
                        </span>

                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-lg text-xs font-bold text-slate-500">
                          <Users className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{cls.studentsCount} học sinh</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-heading font-extrabold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{cls.name}</h3>
                        {cls.description && (
                          <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1">{cls.description}</p>
                        )}
                      </div>

                      {/* Code and Teacher Info */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-50">
                        {cls.teacher ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            {cls.teacher.avatar ? (
                              <img src={cls.teacher.avatar} alt="Teacher" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-[10px]">
                                {cls.teacher.name.charAt(0)}
                              </div>
                            )}
                            <span className="truncate max-w-[120px]">{cls.teacher.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Giáo viên ẩn danh</span>
                        )}

                        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg text-[11px] font-mono font-bold text-slate-600">
                          <span>Mã: {cls.code}</span>
                          <button onClick={() => copyCode(cls.code)} className="p-0.5 text-slate-400 hover:text-indigo-600" title="Sao chép">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Join / Status Action Button */}
                    <div className="pt-3 border-t border-slate-50">
                      {isApproved ? (
                        <button
                          onClick={() => setActiveClass(cls)}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                        >
                          Vào Lớp Học <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : isPending ? (
                        <button
                          disabled
                          className="w-full py-3 bg-amber-50 border border-amber-200 text-amber-700 font-black rounded-2xl text-xs uppercase tracking-wider cursor-not-allowed opacity-90 flex items-center justify-center gap-1.5"
                        >
                          <Clock3 className="w-4 h-4 animate-spin text-amber-600" /> Đang Chờ Giáo Viên Duyệt
                        </button>
                      ) : isRejected ? (
                        <button
                          onClick={(e) => handleJoinClass(e, cls.code, cls.id)}
                          disabled={isJoining}
                          className="w-full py-3 bg-slate-100 hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-700 font-black rounded-2xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                        >
                          <ShieldAlert className="w-4 h-4 text-rose-600" /> Gửi Lại Yêu Cầu
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleJoinClass(e, cls.code, cls.id)}
                          disabled={isJoining}
                          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-110 disabled:opacity-50 text-white font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-95"
                        >
                          {isJoining ? 'Đang gửi...' : 'Gửi Yêu Cầu Tham Gia'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* JOIN CLASS VIA CODE MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="font-heading text-2xl font-extrabold text-slate-900 mb-1">Tham gia lớp học mới</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">Nhập Mã Lớp gồm 6 ký tự do giáo viên cung cấp</p>
            
            <form onSubmit={handleJoinClass} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={classCodeInput}
                  onChange={(e) => setClassCodeInput(e.target.value)}
                  placeholder="MÃ LỚP (VD: AM1Z9Y)"
                  maxLength={10}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-16 py-4 text-center text-xl font-black tracking-widest text-slate-900 uppercase placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setClassCodeInput(text.trim().toUpperCase());
                    } catch (err) {
                      console.error('Không thể đọc bộ nhớ tạm:', err);
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-black transition-colors"
                >
                  DÁN
                </button>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-2 text-rose-600 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setErrorMsg('');
                    setClassCodeInput('');
                  }}
                  className="flex-1 px-4 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-2xl transition-colors text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!classCodeInput.trim()}
                  className="flex-1 px-4 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm shadow-md"
                >
                  Gửi Yêu Cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Copy notification toast */}
      {copiedCode && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-xs font-bold animate-fade-in z-50">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
          <span>Đã sao chép mã lớp: {copiedCode}</span>
        </div>
      )}
    </div>
  );
};

export default MyClass;

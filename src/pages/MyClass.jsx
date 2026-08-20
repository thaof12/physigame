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
  ArrowRight
} from 'lucide-react';
import api from '../config/api';

const MyClass = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [classes, setClasses] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'assignments', 'discussions', 'meetings', 'members'
  
  // Modals & inputs
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCodeInput, setClassCodeInput] = useState('');
  const [newPostInput, setNewPostInput] = useState('');
  
  // Data states
  const [announcements, setAnnouncements] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [members, setMembers] = useState([]);
  
  // UI Loading/Warning states
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  // Scroll ref for chat
  const chatEndRef = useRef(null);

  // Fetch student classes
  const fetchStudentClasses = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await api.get(`/classes/student/${user.id}`);
      if (response.data?.success) {
        const fetchedClasses = response.data.classes;
        setClasses(fetchedClasses);
        if (fetchedClasses.length > 0) {
          // Default to first class if none active
          if (!activeClass) {
            setActiveClass(fetchedClasses[0]);
          } else {
            // Refresh active class data
            const updatedActive = fetchedClasses.find(c => c.id === activeClass.id);
            if (updatedActive) setActiveClass(updatedActive);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching student classes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentClasses();
  }, [user]);

  // Fetch active class features
  const fetchClassDetails = async () => {
    if (!activeClass?.id) return;
    try {
      setWarningMsg('');
      
      // Announcements
      const annRes = await api.get(`/classes/${activeClass.id}/announcements`);
      if (annRes.data?.warning === 'needs_migration') {
        setWarningMsg('Hệ thống đang được nâng cấp. Vui lòng liên hệ quản trị viên chạy SQL script.');
      }
      setAnnouncements(annRes.data?.announcements || []);

      // Assignments
      const asgRes = await api.get(`/classes/${activeClass.id}/assignments?studentId=${user.id}`);
      setAssignments(asgRes.data?.assignments || []);

      // Meetings
      const meetRes = await api.get(`/classes/${activeClass.id}/meetings`);
      setMeetings(meetRes.data?.meetings || []);

      // Discussions
      const discRes = await api.get(`/classes/${activeClass.id}/discussions`);
      setDiscussions(discRes.data?.discussions || []);

      // Members
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

  // Scroll to bottom on new discussion post
  useEffect(() => {
    if (activeTab === 'discussions') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [discussions, activeTab]);

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!classCodeInput.trim() || !user?.id) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await api.post('/classes/join', {
        studentId: user.id,
        classCode: classCodeInput.trim().toUpperCase()
      });

      if (response.data?.success) {
        setSuccessMsg('Tham gia lớp học thành công!');
        setClassCodeInput('');
        setShowJoinModal(false);
        // Refresh classes and select the new one
        await fetchStudentClasses();
        if (response.data.class) {
          setActiveClass(response.data.class);
        }
      }
    } catch (error) {
      console.error('Error joining class:', error);
      setErrorMsg(error.response?.data?.message || 'Có lỗi xảy ra khi tham gia lớp học');
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
    if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (asg.type === 'lesson') {
      // Parse resource_id "6-1-1" or similar
      const parts = (asg.resource_id || '').split('-');
      if (parts.length >= 3) {
        navigate(`/physics-lesson/${parts[0]}/${parts[1]}/${parts[2]}`);
      } else {
        // Fallback to lessons hub
        navigate('/physics-classes');
      }
    } else if (asg.type === 'challenge') {
      // Navigate to challenge
      navigate(`/advanced-physics-challenge`);
    } else if (targetUrl) {
      window.open(targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold">Đang tải dữ liệu lớp học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome / Empty State */}
        {classes.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-12 text-center shadow-xl shadow-slate-100/50 max-w-2xl mx-auto mt-10">
            <div className="w-20 h-20 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <GraduationCap className="w-10 h-10 text-indigo-600 animate-bounce" />
            </div>
            <h2 className="font-heading text-3xl font-extrabold text-slate-900 mb-3">Chưa có lớp học nào</h2>
            <p className="font-body text-slate-500 font-bold mb-8 leading-relaxed">
              Kết nối với thầy cô bằng cách nhập mã lớp học (Class Code) được cung cấp để tham gia các buổi thảo luận, nhận thông báo bài học và hoàn thành các thử thách được giao nhé!
            </p>
            <button
              onClick={() => setShowJoinModal(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-110 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 transition-all uppercase tracking-widest text-sm"
            >
              <Plus className="w-5 h-5" />
              Tham gia lớp học ngay
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Warning Banner for Migration */}
            {warningMsg && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-800 shadow-sm animate-pulse">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-sm">Hệ thống đang cấu hình bổ sung</h4>
                  <p className="text-xs font-semibold mt-0.5">{warningMsg}</p>
                </div>
              </div>
            )}

            {/* Redesigned Clean Card Header */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
                  <GraduationCap className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{activeClass?.name}</h1>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    {/* Class Code */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1 text-xs font-bold text-slate-500 shadow-sm">
                      <span className="font-mono text-slate-700 tracking-wider">Mã lớp: {activeClass?.code}</span>
                      <button
                        onClick={() => copyCode(activeClass?.code)}
                        className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
                        title="Sao chép mã lớp"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Teacher info */}
                    {activeClass?.teacher && (
                      <div className="flex items-center gap-2 bg-indigo-50/45 border border-indigo-100/30 rounded-xl px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                        {activeClass.teacher.avatar ? (
                          <img 
                            src={activeClass.teacher.avatar} 
                            alt="Teacher" 
                            className="w-6 h-6 rounded-full object-cover border border-white shadow-sm flex-shrink-0" 
                          />
                        ) : (
                          <div className="w-6 h-6 bg-indigo-100 border border-indigo-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-indigo-600" />
                          </div>
                        )}
                        <span>GV: {activeClass.teacher.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                {/* Select other class dropdown if student enrolled in multiple */}
                {classes.length > 1 && (
                  <div className="relative">
                    <select
                      value={activeClass?.id}
                      onChange={(e) => {
                        const selected = classes.find(c => c.id === e.target.value);
                        if (selected) setActiveClass(selected);
                      }}
                      className="bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-xs font-black focus:outline-none cursor-pointer transition-all pr-8 appearance-none shadow-sm hover:border-indigo-200"
                      style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundPosition: 'right 10px center', backgroundSize: '14px', backgroundRepeat: 'no-repeat' }}
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id} className="text-slate-900 font-bold">{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-110 text-white font-black rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-lg transition-all flex items-center gap-1.5 text-xs uppercase tracking-wider active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Tham gia lớp khác
                </button>
              </div>
            </div>

            {/* Navigation Tabs & Main Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              
              {/* Tab Selector Sidebar */}
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

              {/* Main Contents */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* 1. BẢNG TIN TAB */}
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

                {/* 2. NHIỆM VỤ TAB */}
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
                            onClick={() => navigateToAssignment(asg)}
                            className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                  asg.type === 'link' || (asg.link && asg.link.startsWith('http'))
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : asg.type === 'lesson' 
                                  ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                  : 'bg-amber-50 text-amber-600 border border-amber-100'
                                }`}>
                                  {asg.type === 'link' || (asg.link && asg.link.startsWith('http')) ? 'LINK BÀI TẬP' : asg.type === 'lesson' ? 'BÀI HỌC' : 'THỬ THÁCH'}
                                </span>
                                {asg.due_date && (
                                  <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Hạn: {new Date(asg.due_date).toLocaleDateString('vi-VN')}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors text-base">{asg.title}</h3>
                              {asg.description && (
                                <p className="text-xs text-slate-400 font-semibold">{asg.description}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-4 self-end sm:self-auto">
                              {asg.completed ? (
                                <span className="flex items-center gap-1 text-emerald-600 font-black text-xs bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                                  <CheckCircle2 className="w-4 h-4" /> Đã làm {asg.score !== null && `(${asg.score}đ)`}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-slate-500 font-black text-xs bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                                  Chưa hoàn thành
                                </span>
                              )}
                              <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. THẢO LUẬN TAB */}
                {activeTab === 'discussions' && (
                  <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col h-[600px] overflow-hidden">
                    {/* Header chat */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm">Phòng trao đổi chung</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mọi thành viên đều có thể gửi tin nhắn</p>
                      </div>
                    </div>

                    {/* Messages Body */}
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

                    {/* Chat Form */}
                    <form onSubmit={handlePostDiscussion} className="p-4 border-t border-slate-100 bg-white flex items-center gap-3">
                      <input
                        type="text"
                        value={newPostInput}
                        onChange={(e) => setNewPostInput(e.target.value)}
                        placeholder="Nhập nội dung thảo luận học tập..."
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

                {/* 4. LỊCH HỌC TAB */}
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

                {/* 5. THÀNH VIÊN TAB */}
                {activeTab === 'members' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="font-heading text-xl font-extrabold text-slate-900">Danh sách học sinh trong lớp</h2>
                      <span className="text-xs text-slate-400 font-bold">{members.length} học sinh</span>
                    </div>

                    {members.length === 0 ? (
                      <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                        <p className="font-bold">Lớp học hiện tại chưa có thành viên nào.</p>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
                        <div className="divide-y divide-slate-100">
                          {members.map((mem, index) => (
                            <div key={mem.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <span className="w-6 text-xs font-black text-slate-400 text-center">#{index + 1}</span>
                                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center font-black text-xs text-slate-600 border border-slate-200">
                                  {mem.name.charAt(0).toUpperCase()}
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
        )}

      </div>

      {/* JOIN CLASS MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="font-heading text-2xl font-extrabold text-slate-900 mb-2">Tham gia lớp học mới</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">Nhập mã lớp gồm 6 ký tự để kết nối</p>
            
            <form onSubmit={handleJoinClass} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={classCodeInput}
                  onChange={(e) => setClassCodeInput(e.target.value)}
                  placeholder="MÃ LỚP (VD: AM1Z9Y)"
                  maxLength={10}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-16 py-3.5 text-center text-lg font-black tracking-widest text-slate-900 uppercase placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-black transition-colors"
                >
                  DÁN
                </button>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-emerald-600 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setErrorMsg('');
                    setSuccessMsg('');
                    setClassCodeInput('');
                  }}
                  className="flex-1 px-4 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-xl transition-colors text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!classCodeInput.trim()}
                  className="flex-1 px-4 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm shadow-md"
                >
                  Kết nối lớp
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

export default MyClass;

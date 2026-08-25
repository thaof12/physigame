import React, { useState, useEffect, useRef } from 'react';
import { 
   MessageSquare, 
   Send, 
   User, 
   ShieldCheck, 
   HelpCircle, 
   Clock, 
   CheckCircle2, 
   Sparkles, 
   Headphones, 
   Bot,
   BookOpen,
   Wrench,
   Zap,
   Users,
   RefreshCw,
   Check,
   GraduationCap,
   Search,
   Filter,
   ArrowLeft,
   CheckCheck,
   AlertCircle
} from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';

// Default initial conversations if local storage is empty
const DEFAULT_STUDENT_FEEDBACK = [
   {
      id: 'student_thread_1',
      sender: 'student',
      senderName: 'Nguyễn Văn An (Học sinh)',
      role: 'student',
      avatar: null,
      topic: 'Bài tập',
      text: 'Thầy/Cô ơi cho em hỏi câu 3 bài Chuyển động thẳng biến đổi đều phần tính gia tốc a ạ?',
      timestamp: '10:15 - Hôm nay',
      status: 'pending'
   }
];

const DEFAULT_TEACHER_FEEDBACK = [
   {
      id: 'teacher_thread_1',
      sender: 'teacher',
      senderName: 'Cô Trần Thị Mai (Giảng viên)',
      role: 'teacher',
      avatar: null,
      topic: 'Học liệu',
      text: 'Chào Ban Quản Trị, tôi muốn đăng ký bổ sung bộ đề thi thử Vật Lý lớp 9 vào Ngân hàng câu hỏi được không?',
      timestamp: '09:30 - Hôm nay',
      status: 'pending'
   }
];

const AdminFeedback = () => {
   const { admin } = useAdminAuth();

   const [studentMessages, setStudentMessages] = useState([]);
   const [teacherMessages, setTeacherMessages] = useState([]);

   const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'student' | 'teacher'
   const [topicFilter, setTopicFilter] = useState('all');
   const [searchQuery, setSearchQuery] = useState('');

   const [activeThreadKey, setActiveThreadKey] = useState('student'); // 'student' | 'teacher'
   const [replyInput, setReplyInput] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [toastMessage, setToastMessage] = useState(null);

   const chatEndRef = useRef(null);

   // Load messages from localStorage on mount
   const loadAllMessages = () => {
      try {
         const studentData = localStorage.getItem('eureka_student_admin_messages');
         if (studentData) {
            const parsed = JSON.parse(studentData);
            if (Array.isArray(parsed) && parsed.length > 0) {
               setStudentMessages(parsed);
            } else {
               setStudentMessages(DEFAULT_STUDENT_FEEDBACK);
            }
         } else {
            setStudentMessages(DEFAULT_STUDENT_FEEDBACK);
         }

         const teacherData = localStorage.getItem('eureka_teacher_admin_messages');
         if (teacherData) {
            const parsed = JSON.parse(teacherData);
            if (Array.isArray(parsed) && parsed.length > 0) {
               setTeacherMessages(parsed);
            } else {
               setTeacherMessages(DEFAULT_TEACHER_FEEDBACK);
            }
         } else {
            setTeacherMessages(DEFAULT_TEACHER_FEEDBACK);
         }
      } catch (e) {
         console.warn('Error loading support messages in admin:', e);
      }
   };

   useEffect(() => {
      loadAllMessages();
   }, []);

   // Auto scroll chat
   useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [studentMessages, teacherMessages, activeThreadKey]);

   // Save messages back to localStorage
   const saveStudentMessages = (newMsgs) => {
      setStudentMessages(newMsgs);
      try {
         localStorage.setItem('eureka_student_admin_messages', JSON.stringify(newMsgs));
      } catch (e) {
         console.warn('Error saving student messages:', e);
      }
   };

   const saveTeacherMessages = (newMsgs) => {
      setTeacherMessages(newMsgs);
      try {
         localStorage.setItem('eureka_teacher_admin_messages', JSON.stringify(newMsgs));
      } catch (e) {
         console.warn('Error saving teacher messages:', e);
      }
   };

   const handleSendAdminReply = (e) => {
      e.preventDefault();
      if (!replyInput.trim()) return;

      setIsSubmitting(true);
      const now = new Date();
      const timeString = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - Hôm nay';

      const replyObj = {
         id: `admin_reply_${Date.now()}`,
         sender: 'admin',
         senderName: admin?.name || 'Quản trị viên Eureka',
         avatar: null,
         topic: activeThreadKey === 'student' 
            ? (studentMessages[studentMessages.length - 1]?.topic || 'Hỗ trợ') 
            : (teacherMessages[teacherMessages.length - 1]?.topic || 'Hỗ trợ'),
         text: replyInput.trim(),
         timestamp: timeString,
         isSystem: false
      };

      if (activeThreadKey === 'student') {
         const updated = [...studentMessages, replyObj];
         saveStudentMessages(updated);
      } else {
         const updated = [...teacherMessages, replyObj];
         saveTeacherMessages(updated);
      }

      setReplyInput('');
      setIsSubmitting(false);

      setToastMessage('Đã gửi phản hồi thành công và đồng bộ tới hệ thống!');
      setTimeout(() => setToastMessage(null), 3500);
   };

   // Threads calculation
   const getThreadsList = () => {
      const threads = [];

      // Student Thread
      if (studentMessages.length > 0) {
         const lastMsg = studentMessages[studentMessages.length - 1];
         const hasPending = studentMessages.some(m => m.sender === 'student');
         threads.push({
            key: 'student',
            role: 'student',
            roleLabel: 'Học sinh',
            title: 'Kênh Trao Đổi Học Sinh',
            subtitle: lastMsg?.senderName || 'Học sinh Eureka',
            topic: lastMsg?.topic || 'Bài tập',
            lastText: lastMsg?.text || '',
            timestamp: lastMsg?.timestamp || '',
            messageCount: studentMessages.length,
            isLastFromUser: lastMsg?.sender === 'student'
         });
      }

      // Teacher Thread
      if (teacherMessages.length > 0) {
         const lastMsg = teacherMessages[teacherMessages.length - 1];
         threads.push({
            key: 'teacher',
            role: 'teacher',
            roleLabel: 'Giáo viên',
            title: 'Kênh Đóng Góp Giảng Viên',
            subtitle: lastMsg?.senderName || 'Giảng viên Eureka',
            topic: lastMsg?.topic || 'Học liệu',
            lastText: lastMsg?.text || '',
            timestamp: lastMsg?.timestamp || '',
            messageCount: teacherMessages.length,
            isLastFromUser: lastMsg?.sender === 'teacher'
         });
      }

      // Filter by role
      let filtered = threads;
      if (roleFilter !== 'all') {
         filtered = filtered.filter(t => t.role === roleFilter);
      }

      // Filter by search query
      if (searchQuery.trim()) {
         const query = searchQuery.toLowerCase();
         filtered = filtered.filter(t => 
            t.title.toLowerCase().includes(query) || 
            t.subtitle.toLowerCase().includes(query) || 
            t.lastText.toLowerCase().includes(query) ||
            t.topic.toLowerCase().includes(query)
         );
      }

      return filtered;
   };

   const threadsList = getThreadsList();
   const activeMessages = activeThreadKey === 'student' ? studentMessages : teacherMessages;
   const activeThread = threadsList.find(t => t.key === activeThreadKey) || threadsList[0];

   return (
      <div className="w-full min-h-screen bg-[#faf8f5] p-6 sm:p-8 rounded-[2.5rem] space-y-6 font-body text-slate-800">
         
         {/* Top Banner Header */}
         <div className="bg-white rounded-3xl p-6 md:p-8 border border-amber-100/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
               <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[#4f46e5] text-xs font-heading font-extrabold tracking-wide uppercase">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Trung Tâm Phản Hồi & Tiếp Nhận Ý Kiến
               </div>
               <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] font-heading tracking-tight">
                  Quản Lý Phản Hồi <span className="text-[#4f46e5] italic font-premium-serif">Học Sinh & Giáo Viên</span>
               </h1>
               <p className="text-slate-500 font-bold text-xs sm:text-sm">
                  Tiếp nhận tin nhắn, hỗ trợ bài học và phản hồi trực tiếp các ý kiến đóng góp trên toàn hệ thống Eureka.
               </p>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex items-center gap-3 shrink-0">
               <div className="bg-[#faf8f5] px-4 py-3 rounded-2xl border border-amber-100/80 text-center">
                  <p className="text-[10px] font-heading font-extrabold uppercase text-slate-400">Hội thoại Học Sinh</p>
                  <p className="text-xl font-black text-[#4f46e5] font-heading">{studentMessages.length}</p>
               </div>
               <div className="bg-[#faf8f5] px-4 py-3 rounded-2xl border border-amber-100/80 text-center">
                  <p className="text-[10px] font-heading font-extrabold uppercase text-slate-400">Hội thoại Giảng Viên</p>
                  <p className="text-xl font-black text-emerald-600 font-heading">{teacherMessages.length}</p>
               </div>
            </div>
         </div>

         {/* Filters & Search Toolbar */}
         <div className="bg-white rounded-2xl p-4 border border-amber-100/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Role Filter Tabs */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
               <button
                  type="button"
                  onClick={() => setRoleFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-heading font-extrabold transition-all cursor-pointer ${
                     roleFilter === 'all'
                        ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
               >
                  Tất cả liên hệ
               </button>
               <button
                  type="button"
                  onClick={() => setRoleFilter('student')}
                  className={`px-4 py-2 rounded-xl text-xs font-heading font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                     roleFilter === 'student'
                        ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
               >
                  <User className="w-3.5 h-3.5" />
                  Học sinh
               </button>
               <button
                  type="button"
                  onClick={() => setRoleFilter('teacher')}
                  className={`px-4 py-2 rounded-xl text-xs font-heading font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                     roleFilter === 'teacher'
                        ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
               >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Giáo viên
               </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
               <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
               <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên hoặc nội dung..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-body font-bold text-slate-800 focus:bg-white focus:border-[#4f46e5] focus:outline-none transition-all"
               />
            </div>
         </div>

         {/* Main Content Grid: Thread List (Left) & Chat Workspace (Right) */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: List of Threads */}
            <div className="lg:col-span-4 space-y-3">
               <h3 className="font-heading font-extrabold text-slate-700 text-xs uppercase tracking-wider px-1">
                  Danh sách cuộc trò chuyện ({threadsList.length})
               </h3>

               {threadsList.map((thread) => {
                  const isActive = activeThreadKey === thread.key;
                  const isTeacher = thread.role === 'teacher';

                  return (
                     <div
                        key={thread.key}
                        onClick={() => setActiveThreadKey(thread.key)}
                        className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                           isActive 
                              ? 'bg-white border-[#4f46e5] shadow-lg shadow-indigo-500/10 ring-2 ring-[#4f46e5]/20' 
                              : 'bg-white border-amber-100/70 hover:border-slate-300 shadow-sm'
                        }`}
                     >
                        <div className="flex items-start gap-3">
                           <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-heading font-black text-xs shrink-0 shadow-sm ${
                              isTeacher ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'
                           }`}>
                              {isTeacher ? <GraduationCap className="w-5 h-5" /> : <User className="w-5 h-5" />}
                           </div>

                           <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                 <span className="font-heading font-extrabold text-slate-900 text-sm truncate">
                                    {thread.subtitle}
                                 </span>
                                 <span className="text-[10px] text-slate-400 font-bold shrink-0">
                                    {thread.timestamp}
                                 </span>
                              </div>

                              <div className="flex items-center gap-2">
                                 <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${
                                    isTeacher ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-700 border border-slate-200'
                                 }`}>
                                    {thread.roleLabel}
                                 </span>
                                 <span className="px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">
                                    {thread.topic}
                                 </span>
                              </div>

                              <p className="text-xs text-slate-500 font-medium truncate pt-1">
                                 {thread.lastText}
                              </p>
                           </div>
                        </div>

                        {/* Status Tag */}
                        {thread.isLastFromUser && (
                           <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-extrabold">
                              <span className="text-amber-600 flex items-center gap-1">
                                 <AlertCircle className="w-3 h-3" /> Chờ Admin phản hồi
                              </span>
                              <span className="text-slate-400">{thread.messageCount} tin nhắn</span>
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>

            {/* Right Column: Chat Feed & Response Composer */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-amber-100/70 shadow-sm flex flex-col min-h-[560px] overflow-hidden">
               
               {/* Chat Header Bar */}
               <div className="px-6 py-4 bg-[#0f172a] text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
                        activeThread?.role === 'teacher' ? 'bg-indigo-600' : 'bg-slate-700'
                     }`}>
                        {activeThread?.role === 'teacher' ? <GraduationCap className="w-5 h-5" /> : <User className="w-5 h-5" />}
                     </div>
                     <div>
                        <h3 className="font-heading font-extrabold text-white text-sm sm:text-base">
                           {activeThread?.subtitle || 'Giao diện trao đổi'}
                        </h3>
                        <p className="text-xs text-slate-300">
                           Đối tượng: <span className="font-bold text-indigo-300">{activeThread?.roleLabel}</span> | Chủ đề: <span className="font-bold text-amber-300">{activeThread?.topic}</span>
                        </p>
                     </div>
                  </div>

                  <button
                     type="button"
                     onClick={loadAllMessages}
                     title="Cập nhật tin nhắn"
                     className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-heading font-bold"
                  >
                     <RefreshCw className="w-3.5 h-3.5" />
                     <span>Đồng bộ</span>
                  </button>
               </div>

               {/* Messages Feed */}
               <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#faf8f5] min-h-[340px]">
                  {activeMessages.map((msg) => {
                     const isAdmin = msg.sender === 'admin';
                     return (
                        <div
                           key={msg.id}
                           className={`flex gap-3 max-w-[88%] ${isAdmin ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                        >
                           {/* Avatar */}
                           <div className={`w-9 h-9 rounded-2xl flex-shrink-0 flex items-center justify-center text-xs font-bold font-heading shadow-sm ${
                              isAdmin ? 'bg-[#4f46e5] text-white' : 'bg-[#0f172a] text-white'
                           }`}>
                              {isAdmin ? <Bot className="w-5 h-5" /> : (msg.senderName[0]?.toUpperCase() || <User className="w-4 h-4" />)}
                           </div>

                           {/* Message Bubble */}
                           <div className={`space-y-1 ${isAdmin ? 'items-end flex flex-col' : 'items-start'}`}>
                              <div className="flex items-center gap-2 px-1">
                                 <span className="font-heading font-extrabold text-xs text-slate-800">{msg.senderName}</span>
                                 <span className="px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider bg-slate-200 text-slate-700">
                                    {msg.topic || activeThread?.topic}
                                 </span>
                                 <span className="text-[10px] text-slate-400 font-body">{msg.timestamp}</span>
                              </div>

                              <div className={`p-4 rounded-2xl text-xs sm:text-sm font-body leading-relaxed shadow-sm ${
                                 isAdmin 
                                    ? 'bg-[#4f46e5] text-white rounded-tr-none' 
                                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                              }`}>
                                 {msg.text}
                              </div>
                           </div>
                        </div>
                     );
                  })}
                  <div ref={chatEndRef} />
               </div>

               {/* Toast Notification */}
               {toastMessage && (
                  <div className="mx-6 my-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-body font-semibold flex items-center gap-2 animate-fade-in">
                     <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                     <span>{toastMessage}</span>
                  </div>
               )}

               {/* Admin Reply Input Form */}
               <form onSubmit={handleSendAdminReply} className="p-4 sm:p-6 bg-white border-t border-slate-100 space-y-3">
                  <div className="relative flex items-center">
                     <textarea
                        value={replyInput}
                        onChange={(e) => setReplyInput(e.target.value)}
                        onKeyDown={(e) => {
                           if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendAdminReply(e);
                           }
                        }}
                        placeholder={`Soạn câu trả lời chính thức của Admin cho ${activeThread?.subtitle}...`}
                        rows={3}
                        className="w-full pl-4 pr-16 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-body text-slate-800 focus:bg-white focus:border-[#4f46e5] focus:outline-none transition-all resize-none font-medium"
                        required
                     />

                     <button
                        type="submit"
                        disabled={!replyInput.trim() || isSubmitting}
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-3 rounded-xl bg-[#4f46e5] text-white hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 cursor-pointer flex items-center gap-2 font-heading font-extrabold text-xs"
                        title="Gửi phản hồi"
                     >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Gửi Phản Hồi</span>
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
};

export default AdminFeedback;

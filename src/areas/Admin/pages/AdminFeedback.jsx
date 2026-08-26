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

const AdminFeedback = () => {
   const { admin } = useAdminAuth();
   const [allMessages, setAllMessages] = useState([]);
   const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'student' | 'teacher'
   const [topicFilter, setTopicFilter] = useState('all');
   const [searchQuery, setSearchQuery] = useState('');

   const [activeThreadKey, setActiveThreadKey] = useState(null);
   const [replyInput, setReplyInput] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isRefreshing, setIsRefreshing] = useState(false);
   const [toastMessage, setToastMessage] = useState(null);

   const chatEndRef = useRef(null);

   // Load real messages from Backend API
   const loadAllMessages = async () => {
      try {
         const res = await fetch('/api/support/all');
         if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.messages)) {
               setAllMessages(data.messages);
               localStorage.setItem('eureka_all_support_messages', JSON.stringify(data.messages));
               return;
            }
         }
      } catch (e) {
         console.warn('Backend API support fetch error in admin, fallback to localStorage:', e);
      }

      // Fallback to localStorage
      try {
         const cached = localStorage.getItem('eureka_all_support_messages');
         if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) {
               setAllMessages(parsed);
               return;
            }
         }
      } catch (e) {
         console.warn('Error loading cached support messages in admin:', e);
      }
      setAllMessages([]);
   };

   const handleRefresh = async () => {
      setIsRefreshing(true);
      await loadAllMessages();
      setTimeout(() => setIsRefreshing(false), 500);
      setToastMessage('Đã làm mới danh sách hội thoại!');
      setTimeout(() => setToastMessage(null), 3000);
   };

   useEffect(() => {
      loadAllMessages();
      const handleStorage = () => loadAllMessages();
      window.addEventListener('storage', handleStorage);
      window.addEventListener('eureka_support_updated', handleStorage);

      const intervalId = setInterval(() => {
         loadAllMessages();
      }, 2000);

      return () => {
         window.removeEventListener('storage', handleStorage);
         window.removeEventListener('eureka_support_updated', handleStorage);
         clearInterval(intervalId);
      };
   }, []);

   // Calculate overall thread counts across the entire system (independent of filter tabs)
   const getAllThreadRoles = () => {
      const threadsMap = {};
      allMessages.forEach(msg => {
         const role = msg.role || (msg.sender === 'teacher' ? 'teacher' : 'student');
         const uId = (msg.sender !== 'admin' && (msg.userId || msg.senderId)) || msg.userId || msg.targetUserId || 'all';
         const key = `${role}_${uId}`;
         if (!threadsMap[key]) {
            threadsMap[key] = role;
         }
      });
      return Object.values(threadsMap);
   };

   const allThreadRoles = getAllThreadRoles();
   const totalStudentThreads = allThreadRoles.filter(r => r === 'student').length;
   const totalTeacherThreads = allThreadRoles.filter(r => r === 'teacher').length;

   // Threads calculation per user with active filters
   const getThreadsList = () => {
      const threadsMap = {};

      allMessages.forEach(msg => {
         const role = msg.role || (msg.sender === 'teacher' ? 'teacher' : 'student');
         const uId = (msg.sender !== 'admin' && (msg.userId || msg.senderId)) || msg.userId || msg.targetUserId || 'all';
         const key = `${role}_${uId}`;

         if (!threadsMap[key]) {
            threadsMap[key] = {
               key,
               role,
               userId: uId,
               roleLabel: role === 'teacher' ? 'Giáo viên' : 'Học sinh',
               title: role === 'teacher' ? 'Kênh Đóng Góp Giảng Viên' : 'Kênh Trao Đổi Học Sinh',
               subtitle: msg.sender !== 'admin' ? (msg.senderName || (role === 'teacher' ? 'Giảng viên Eureka' : 'Học sinh Eureka')) : (role === 'teacher' ? 'Giảng viên Eureka' : 'Học sinh Eureka'),
               avatar: msg.avatar || null,
               topic: msg.topic || 'Hỗ trợ',
               messages: [],
               lastText: '',
               timestamp: '',
               isLastFromUser: false
            };
         }

         const thread = threadsMap[key];
         thread.messages.push(msg);

         if (msg.sender !== 'admin') {
            if (msg.senderName) thread.subtitle = msg.senderName;
            if (msg.avatar) thread.avatar = msg.avatar;
         }
         if (msg.topic) thread.topic = msg.topic;
         thread.lastText = msg.text;
         thread.timestamp = msg.timestamp;
         thread.isLastFromUser = msg.sender !== 'admin';
         thread.messageCount = thread.messages.length;
      });

      let list = Object.values(threadsMap);

      // Filter by role
      if (roleFilter !== 'all') {
         list = list.filter(t => t.role === roleFilter);
      }

      // Filter by search query
      if (searchQuery.trim()) {
         const query = searchQuery.toLowerCase();
         list = list.filter(t =>
            t.title.toLowerCase().includes(query) ||
            t.subtitle.toLowerCase().includes(query) ||
            t.lastText.toLowerCase().includes(query) ||
            t.topic.toLowerCase().includes(query)
         );
      }

      return list;
   };

   const threadsList = getThreadsList();

   // Sync activeThreadKey if not set or invalid
   useEffect(() => {
      if (threadsList.length > 0) {
         if (!activeThreadKey || !threadsList.some(t => t.key === activeThreadKey)) {
            setActiveThreadKey(threadsList[0].key);
         }
      }
   }, [threadsList.length]);

   const activeThread = threadsList.find(t => t.key === activeThreadKey) || threadsList[0] || null;
   const activeMessages = activeThread ? activeThread.messages : [];

   // Auto scroll internal chat container
   const chatContainerRef = useRef(null);
   useEffect(() => {
      if (chatContainerRef.current && activeMessages.length > 0) {
         chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
   }, [activeMessages.length, activeThreadKey]);

   const handleSendAdminReply = async (e) => {
      e.preventDefault();
      if (!replyInput.trim() || !activeThread) return;

      setIsSubmitting(true);
      const textToSubmit = replyInput.trim();
      const adminName = admin?.name || 'Quản trị viên Eureka';

      setReplyInput('');
      setIsSubmitting(false);

      // Sync to backend database API
      try {
         await fetch('/api/support/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               role: activeThread.role,
               userId: activeThread.userId,
               text: textToSubmit,
               topic: activeThread.topic,
               adminName
            })
         });
         await loadAllMessages();
      } catch (err) {
         console.warn('Error syncing admin reply to backend:', err);
      }

      setToastMessage('Đã gửi phản hồi thành công!');
      setTimeout(() => setToastMessage(null), 3500);
   };

   return (
      <div className="w-full min-h-screen bg-[#faf8f5] p-6 sm:p-8 rounded-[2.5rem] space-y-6 font-body text-slate-800">

         {/* Top Banner Header */}
         <div className="bg-white rounded-3xl p-6 md:p-8 border border-amber-100/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">

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
                  <p className="text-xl font-black text-[#4f46e5] font-heading">{totalStudentThreads}</p>
               </div>
               <div className="bg-[#faf8f5] px-4 py-3 rounded-2xl border border-amber-100/80 text-center">
                  <p className="text-[10px] font-heading font-extrabold uppercase text-slate-400">Hội thoại Giáo Viên</p>
                  <p className="text-xl font-black text-emerald-600 font-heading">{totalTeacherThreads}</p>
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
                  className={`px-4 py-2 rounded-xl text-xs font-heading font-extrabold transition-all cursor-pointer ${roleFilter === 'all'
                     ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-500/20'
                     : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                     }`}
               >
                  Tất cả liên hệ
               </button>
               <button
                  type="button"
                  onClick={() => setRoleFilter('student')}
                  className={`px-4 py-2 rounded-xl text-xs font-heading font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${roleFilter === 'student'
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
                  className={`px-4 py-2 rounded-xl text-xs font-heading font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${roleFilter === 'teacher'
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

               {threadsList.length === 0 ? (
                  <div className="bg-white rounded-2xl p-6 border border-amber-100/70 shadow-sm text-center space-y-2">
                     <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                     <p className="font-heading font-extrabold text-xs text-slate-700 uppercase tracking-wider">Chưa có liên hệ nào</p>
                     <p className="text-xs text-slate-400 font-body">Chưa có phản hồi thực tế từ Học sinh hoặc Giáo viên.</p>
                  </div>
               ) : (
                  threadsList.map((thread) => {
                     const isActive = activeThreadKey === thread.key;
                     const isTeacher = thread.role === 'teacher';

                     return (
                        <div
                           key={thread.key}
                           onClick={() => setActiveThreadKey(thread.key)}
                           className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden ${isActive
                              ? 'bg-white border-[#4f46e5] shadow-lg shadow-indigo-500/10 ring-2 ring-[#4f46e5]/20'
                              : 'bg-white border-amber-100/70 hover:border-slate-300 shadow-sm'
                              }`}
                        >
                           <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-black text-xs shrink-0 shadow-sm overflow-hidden bg-slate-900 text-white">
                                 {thread.avatar ? (
                                    <img
                                       src={thread.avatar}
                                       alt={thread.subtitle}
                                       className="w-full h-full rounded-full object-cover"
                                       onError={(e) => {
                                          e.currentTarget.onerror = null;
                                          e.currentTarget.style.display = 'none';
                                          if (e.currentTarget.nextElementSibling) {
                                             e.currentTarget.nextElementSibling.style.display = 'flex';
                                          }
                                       }}
                                    />
                                 ) : null}
                                 <div className={`w-full h-full flex items-center justify-center text-white rounded-full ${thread.avatar ? 'hidden' : 'flex'} ${isTeacher ? 'bg-indigo-600' : 'bg-slate-900'}`}>
                                    {isTeacher ? <GraduationCap className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                                 </div>
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
                                    <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${isTeacher ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-700 border border-slate-200'
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
                  })
               )}
            </div>

            {/* Right Column: Chat Feed & Response Composer */}
            <div className="lg:col-span-8 bg-white rounded-3xl border-2 border-[#4f46e5]/40 shadow-lg shadow-indigo-500/5 ring-1 ring-[#4f46e5]/10 flex flex-col min-h-[560px] overflow-hidden">
               {threadsList.length === 0 || !activeThread ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-[#faf8f5] min-h-[450px]">
                     <div className="w-14 h-14 rounded-full bg-amber-100/60 flex items-center justify-center text-[#4f46e5]">
                        <MessageSquare className="w-7 h-7" />
                     </div>
                     <h3 className="font-heading font-extrabold text-slate-800 text-base">Hệ Thống Tiếp Nhận Phản Hồi Dữ Liệu Thật</h3>
                     <p className="text-xs text-slate-500 max-w-md font-body leading-relaxed">
                        Hiện tại chưa có tin nhắn phản hồi thực tế nào. Khi Học sinh hoặc Giáo viên gửi liên hệ từ giao diện của họ, thông tin và cuộc trò chuyện thật sẽ tự động hiển thị tại đây để Admin xử lý.
                     </p>
                  </div>
               ) : (
                  <>
                     {/* Chat Header Bar */}
                     <div className="px-6 py-4 bg-[#faf8f5] border-b border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md overflow-hidden bg-slate-800 text-white shrink-0">
                              {activeThread?.avatar ? (
                                 <img
                                    src={activeThread.avatar}
                                    alt={activeThread.subtitle}
                                    className="w-full h-full rounded-full object-cover"
                                    onError={(e) => {
                                       e.currentTarget.onerror = null;
                                       e.currentTarget.style.display = 'none';
                                       if (e.currentTarget.nextElementSibling) {
                                          e.currentTarget.nextElementSibling.style.display = 'flex';
                                       }
                                    }}
                                 />
                              ) : null}
                              <div className={`w-full h-full flex items-center justify-center text-white rounded-full ${activeThread?.avatar ? 'hidden' : 'flex'} ${activeThread?.role === 'teacher' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                                 {activeThread?.role === 'teacher' ? <GraduationCap className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                              </div>
                           </div>
                           <div>
                              <h3 className="font-heading font-extrabold text-black text-sm sm:text-base">
                                 {activeThread?.subtitle || 'Giao diện trao đổi'}
                              </h3>
                              <p className="text-xs text-slate-600">
                                 Đối tượng: <span className="font-bold text-[#4f46e5]">{activeThread?.roleLabel}</span> | Chủ đề: <span className="font-bold text-amber-600">{activeThread?.topic}</span>
                              </p>
                           </div>
                        </div>

                        <button
                           type="button"
                           onClick={handleRefresh}
                           disabled={isRefreshing}
                           title="Làm mới hội thoại"
                           className="px-3 py-1.5 rounded-xl text-slate-700 bg-slate-100 hover:text-[#4f46e5] hover:bg-indigo-50 border border-slate-200/80 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-heading font-bold disabled:opacity-50"
                        >
                           <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#4f46e5]' : ''}`} />
                           <span>Làm mới</span>
                        </button>
                     </div>

                     {/* Messages Feed */}
                     <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#faf8f5] min-h-[340px]">
                        {activeMessages.map((msg) => {
                           const isAdmin = msg.sender === 'admin';
                           return (
                              <div
                                 key={msg.id}
                                 className={`flex gap-3 max-w-[88%] ${isAdmin ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                              >
                                 {/* Avatar */}
                                 <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold font-heading shadow-sm overflow-hidden bg-[#0f172a] text-white">
                                    {isAdmin ? (
                                       <div className="w-full h-full bg-[#4f46e5] flex items-center justify-center text-white rounded-full">
                                          <Bot className="w-5 h-5" />
                                       </div>
                                    ) : (
                                       <>
                                          {msg.avatar && (
                                             <img
                                                src={msg.avatar}
                                                alt={msg.senderName}
                                                className="w-full h-full rounded-full object-cover"
                                                onError={(e) => {
                                                   e.currentTarget.onerror = null;
                                                   e.currentTarget.style.display = 'none';
                                                   if (e.currentTarget.nextElementSibling) {
                                                      e.currentTarget.nextElementSibling.style.display = 'flex';
                                                   }
                                                }}
                                             />
                                          )}
                                          <div className={`w-full h-full bg-[#0f172a] flex items-center justify-center text-white rounded-full ${msg.avatar ? 'hidden' : 'flex'}`}>
                                             {msg.senderName[0]?.toUpperCase() || <User className="w-4 h-4" />}
                                          </div>
                                       </>
                                    )}
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

                                    <div className={`p-4 rounded-2xl text-xs sm:text-sm font-body leading-relaxed shadow-sm ${isAdmin
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
                     <form onSubmit={handleSendAdminReply} className="p-4 sm:p-6 bg-slate-50/50 border-t-2 border-indigo-200 space-y-3">
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
                              className="w-full pl-4 pr-24 py-3.5 bg-white border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-body font-medium text-slate-800 focus:bg-white focus:border-[#4f46e5] focus:outline-none transition-all resize-none min-h-[50px] max-h-[120px] shadow-sm"
                           />
                           <button
                              type="submit"
                              disabled={isSubmitting || !replyInput.trim()}
                              className="absolute right-2 px-4 py-2 bg-[#4f46e5] hover:bg-indigo-700 text-white rounded-xl text-xs font-heading font-extrabold shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
                           >
                              <Send className="w-3.5 h-3.5" />
                              <span>Gửi Phản Hồi</span>
                           </button>
                        </div>
                        <p className="text-[10px] text-slate-400 font-body px-1">
                           * Nhấn Enter để gửi phản hồi tới {activeThread?.subtitle}.
                        </p>
                     </form>
                  </>
               )}
            </div>
         </div>
      </div>
   );
};

export default AdminFeedback;

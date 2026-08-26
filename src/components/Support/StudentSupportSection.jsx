import React, { useState, useEffect, useRef } from 'react';
import {
   MessageSquare,
   Send,
   User,
   ShieldCheck,
   HelpCircle,
   CheckCircle2,
   Headphones,
   Bot,
   BookOpen,
   Wrench,
   Zap,
   Lightbulb,
   RefreshCw,
   Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const QUICK_TOPICS = [
   { id: 'exercise', label: 'Hỏi bài tập Vật Lý', icon: BookOpen, tag: 'Bài tập', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' },
   { id: 'technical', label: 'Báo lỗi kỹ thuật & Game', icon: Wrench, tag: 'Kỹ thuật', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
   { id: 'account_xp', label: 'Thắc mắc tài khoản', icon: Zap, tag: 'Tài khoản', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
   { id: 'feedback', label: 'Góp ý phát triển Eureka', icon: Lightbulb, tag: 'Góp ý', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' }
];

const StudentSupportSection = () => {
   const { user } = useAuth();
   const [messages, setMessages] = useState([]);
   const [selectedTopic, setSelectedTopic] = useState(QUICK_TOPICS[0].tag);
   const [inputMessage, setInputMessage] = useState('');
   const [studentName, setStudentName] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [successBanner, setSuccessBanner] = useState(false);
   const chatEndRef = useRef(null);

   // Load user name and cached messages from localStorage
   useEffect(() => {
      const displayName = user?.displayName || user?.username || user?.email?.split('@')[0] || '';
      setStudentName(displayName);

      const loadMessages = async () => {
         const uId = user?.id || user?.email || displayName || 'student';
         try {
            // First fetch from backend API for persistent real database storage
            const res = await fetch(`/api/support/messages?role=student&userId=${encodeURIComponent(uId)}`);
            if (res.ok) {
               const data = await res.json();
               if (data.success && Array.isArray(data.messages)) {
                  setMessages(data.messages);
                  localStorage.setItem('eureka_student_admin_messages', JSON.stringify(data.messages));
                  return;
               }
            }
         } catch (e) {
            console.warn('API fetch error, fallback to localStorage cache:', e);
         }

         // Fallback to localStorage cache
         try {
            const cached = localStorage.getItem('eureka_student_admin_messages');
            if (cached) {
               const parsed = JSON.parse(cached);
               if (Array.isArray(parsed)) {
                  setMessages(parsed);
                  return;
               }
            }
         } catch (e) {
            console.warn('Error reading cached support messages:', e);
         }
         setMessages([]);
      };

      loadMessages();

      const handleStorage = (e) => {
         if (!e || !e.key || e.key === 'eureka_student_admin_messages') {
            loadMessages();
         }
      };
      window.addEventListener('storage', handleStorage);
      window.addEventListener('eureka_support_updated', handleStorage);

      const intervalId = setInterval(() => {
         loadMessages();
      }, 2000);

      return () => {
         window.removeEventListener('storage', handleStorage);
         window.removeEventListener('eureka_support_updated', handleStorage);
         clearInterval(intervalId);
      };
   }, [user]);

   // Sync latest avatar to user's student messages
   useEffect(() => {
      const currentAv = user?.avatar || user?.photoURL || user?.profile?.avatar || localStorage.getItem('eureka_user_avatar') || null;
      if (currentAv) {
         setMessages(prev => {
            const needsUpdate = prev.some(m => m.sender === 'student' && m.avatar !== currentAv);
            if (needsUpdate) {
               const updated = prev.map(m => m.sender === 'student' ? { ...m, avatar: currentAv } : m);
               try {
                  localStorage.setItem('eureka_student_admin_messages', JSON.stringify(updated));
                  window.dispatchEvent(new Event('eureka_support_updated'));
               } catch (e) {}
               fetch('/api/support/update-avatar', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                     userId: user?.id || user?.email,
                     senderName: studentName,
                     avatar: currentAv
                  })
               }).catch(e => {});
               return updated;
            }
            return prev;
         });
      }
   }, [user, studentName]);

   // Save messages to localStorage on update
   const saveMessages = (newMessages) => {
      setMessages(newMessages);
      try {
         localStorage.setItem('eureka_student_admin_messages', JSON.stringify(newMessages));
         window.dispatchEvent(new Event('eureka_support_updated'));
      } catch (e) {
         console.warn('Error saving support messages:', e);
      }
   };

   // Scroll internal chat container ONLY (prevents pulling the whole browser page down)
   const chatContainerRef = useRef(null);
   useEffect(() => {
      if (chatContainerRef.current && messages.length > 0) {
         chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
   }, [messages.length]);

   const handleSelectTopic = (topicObj) => {
      setSelectedTopic(topicObj.tag);
   };

   const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!inputMessage.trim()) return;

      const now = new Date();
      const timeString = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const currentAv = user?.avatar || user?.photoURL || user?.profile?.avatar || localStorage.getItem('eureka_user_avatar') || null;
      const sName = studentName.trim() || 'Học sinh Eureka';
      const uId = user?.id || user?.email || sName;

      const newStudentMsg = {
         id: `student_msg_${Date.now()}`,
         role: 'student',
         userId: uId,
         senderId: uId,
         sender: 'student',
         senderName: sName,
         avatar: currentAv,
         topic: selectedTopic,
         text: inputMessage.trim(),
         timestamp: timeString
      };

      const updatedList = [...messages, newStudentMsg];
      saveMessages(updatedList);
      const messageText = inputMessage.trim();
      setInputMessage('');
      setSuccessBanner(true);

      // Send to Backend database API
      try {
         await fetch('/api/support/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               role: 'student',
               userId: uId,
               senderId: uId,
               senderName: sName,
               avatar: currentAv,
               topic: selectedTopic,
               text: messageText,
               sender: 'student',
               timestamp: timeString
            })
         });
      } catch (err) {
         console.warn('Error syncing message to backend database:', err);
      }

      setTimeout(() => {
         setSuccessBanner(false);
      }, 4000);
   };

   const handleResetChat = () => {
      saveMessages([]);
   };

   return (
      <section className="py-20 md:py-28 bg-[#FFFFFF] border-t border-slate-100 px-4 md:px-8 relative overflow-hidden">
         {/* Background Decor Ambient Glows */}
         <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[140px] pointer-events-none" />
         <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-blue-50/40 rounded-full blur-[120px] pointer-events-none" />

         <div className="max-w-7xl mx-auto relative z-10">
            {/* Section Header (Matching Homepage Typography) */}
            <div className="text-center mb-14">
               <div className="physics-annotation text-indigo-600 tracking-[0.4em] mb-3 uppercase text-[10px] md:text-xs font-semibold">
                  HỖ TRỢ & TRAO ĐỔI HỌC SINH
               </div>
               <h2 className="font-heading text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                  Trao Đổi Trực Tiếp <span className="text-indigo-600 italic font-premium-serif">Với Admin</span>
               </h2>
               <p className="font-body text-slate-500 font-medium text-base md:text-lg max-w-2xl mx-auto mt-3 leading-relaxed">
                  Gửi thắc mắc bài tập, báo lỗi hệ thống hoặc góp ý cho Eureka. Đội ngũ Admin luôn sẵn sàng lắng nghe và hỗ trợ bạn.
               </p>
            </div>

            {/* Main Interactive Support Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
               {/* Left Column: Admin Info Card & Quick Topics */}
               <div className="lg:col-span-4 space-y-6">
                  {/* Admin Status Card */}
                  <div className="bg-slate-50/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
                     <div className="flex items-center gap-4 mb-5">
                        <div className="relative">
                           <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                              <Headphones className="w-7 h-7" />
                           </div>
                           <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h3 className="font-heading font-extrabold text-slate-900 text-lg">Trung Tâm Hỗ Trợ</h3>
                              <ShieldCheck className="w-4 h-4 text-indigo-600" />
                           </div>
                           <p className="text-xs font-medium text-emerald-600 flex items-center gap-1.5 mt-0.5 font-body">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                              Admin đang trực tuyến 24/7
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Quick Topics Selection */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                     <h4 className="font-heading font-bold text-slate-900 text-sm mb-3.5 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-indigo-600" />
                        Chọn nhanh chủ đề cần hỗ trợ:
                     </h4>
                     <div className="space-y-2.5">
                        {QUICK_TOPICS.map((topic) => {
                           const IconComponent = topic.icon;
                           const isSelected = selectedTopic === topic.tag;
                           return (
                              <button
                                 key={topic.id}
                                 type="button"
                                 onClick={() => handleSelectTopic(topic)}
                                 className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between group cursor-pointer ${isSelected
                                       ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                                       : 'bg-slate-50/70 text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                                    }`}
                              >
                                 <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-indigo-600 border border-slate-100'
                                       }`}>
                                       <IconComponent className="w-4 h-4" />
                                    </div>
                                    <span className="font-heading font-bold text-xs md:text-sm">{topic.label}</span>
                                 </div>
                                 {isSelected && <Check className="w-4 h-4 text-white" />}
                              </button>
                           );
                        })}
                     </div>
                  </div>
               </div>

               {/* Right Column: Chat Exchange Thread & Message Form */}
               <div className="lg:col-span-8 bg-white rounded-[2.5rem] border-2 border-indigo-200 shadow-[0_15px_45px_-15px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col min-h-[580px]">
                  {/* Chat Box Top Header */}
                  <div className="px-6 py-4 bg-[#faf8f5] border-b border-slate-200/80 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-heading font-black text-sm shadow-md">
                           <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                           <h3 className="font-heading font-bold text-black text-sm md:text-base">Kênh Hội Thoại Trực Tuyến</h3>
                           <p className="text-[11px] font-body text-slate-600">Đang chọn: <span className="font-bold text-indigo-600">{selectedTopic}</span></p>
                        </div>
                     </div>

                     <button
                        type="button"
                        onClick={handleResetChat}
                        title="Tải lại cuộc trò chuyện"
                        className="p-2 rounded-xl text-slate-600 hover:text-black hover:bg-slate-200/60 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-body"
                     >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Làm mới</span>
                     </button>
                  </div>

                  {/* Messages Feed Area */}
                  <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[380px] bg-gradient-to-b from-slate-50/40 to-white">
                     {messages.map((msg) => {
                        const isAdmin = msg.sender === 'admin';
                        return (
                           <div
                              key={msg.id}
                              className={`flex gap-3 max-w-[85%] ${isAdmin ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                           >
                              {/* Avatar */}
                              <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold font-heading shadow-sm overflow-hidden ${isAdmin
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-900 text-white'
                                 }`}>
                                 {isAdmin ? (
                                     <Bot className="w-5 h-5" />
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
                                        <div className={`w-full h-full bg-slate-900 flex items-center justify-center text-white rounded-full ${msg.avatar ? 'hidden' : 'flex'}`}>
                                           {msg.senderName[0]?.toUpperCase() || <User className="w-4 h-4" />}
                                        </div>
                                     </>
                                  )}
                              </div>

                              {/* Bubble */}
                              <div className={`space-y-1 ${isAdmin ? 'items-start' : 'items-end flex flex-col'}`}>
                                 <div className="flex items-center gap-2 px-1">
                                    <span className="font-heading font-bold text-xs text-slate-700">{msg.senderName}</span>
                                    <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                                       {msg.topic}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-body">{msg.timestamp}</span>
                                 </div>

                                 <div className={`p-4 rounded-2xl text-xs md:text-sm font-body leading-relaxed shadow-sm ${isAdmin
                                       ? 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
                                       : 'bg-indigo-600 text-white rounded-tr-none'
                                    }`}>
                                    {msg.text}
                                 </div>
                              </div>
                           </div>
                        );
                     })}

                     {/* Typing indicator when submitting */}
                     {isSubmitting && (
                        <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                           <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                              <Bot className="w-4 h-4 animate-spin" />
                           </div>
                           <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-400 font-body italic flex items-center gap-2">
                              <span>Admin đang trả lời...</span>
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                           </div>
                        </div>
                     )}
                     <div ref={chatEndRef} />
                  </div>

                  {/* Success Toast Banner */}
                  {successBanner && (
                     <div className="mx-6 my-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-body font-semibold flex items-center justify-between animate-fade-in">
                        <div className="flex items-center gap-2">
                           <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                           <span>Đã gửi tin nhắn đến Admin! Admin đang phản hồi bạn.</span>
                        </div>
                     </div>
                  )}

                  {/* Message Form Inputs */}
                  <form onSubmit={handleSendMessage} className="p-4 md:p-6 bg-white border-t border-slate-200/80 space-y-3">
                     {/* Name input row */}
                     <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="w-full sm:w-1/2 relative">
                           <input
                              type="text"
                              value={studentName}
                              onChange={(e) => setStudentName(e.target.value)}
                              placeholder="Tên học sinh / Tên hiển thị..."
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs md:text-sm font-body text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                              required
                           />
                        </div>
                        <div className="w-full sm:w-1/2 flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-body text-slate-500">
                           <span className="font-bold text-slate-700">Chủ đề:</span>
                           <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md font-bold text-[11px]">
                              {selectedTopic}
                           </span>
                        </div>
                     </div>

                     {/* Textarea and Send button */}
                     <div className="relative flex items-center">
                        <textarea
                           value={inputMessage}
                           onChange={(e) => setInputMessage(e.target.value)}
                           onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                 e.preventDefault();
                                 handleSendMessage(e);
                              }
                           }}
                           placeholder={`Nhập nội dung cần Admin hỗ trợ về [${selectedTopic}] (Nhấn Enter để gửi)...`}
                           rows={2}
                           className="w-full pl-4 pr-14 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs md:text-sm font-body text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all resize-none shadow-inner"
                           required
                        />

                        <button
                           type="submit"
                           disabled={!inputMessage.trim() || isSubmitting}
                           className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 cursor-pointer"
                           title="Gửi tin nhắn"
                        >
                           <Send className="w-4 h-4" />
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </section>
   );
};

export default StudentSupportSection;

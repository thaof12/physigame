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
   { id: 'exercise', label: 'Hỏi bài tập Vật Lý', icon: BookOpen, tag: 'Bài tập' },
   { id: 'technical', label: 'Báo lỗi kỹ thuật & Game', icon: Wrench, tag: 'Kỹ thuật' },
   { id: 'account_xp', label: 'Thắc mắc tài khoản', icon: Zap, tag: 'Tài khoản' },
   { id: 'feedback', label: 'Góp ý phát triển Eureka', icon: Lightbulb, tag: 'Góp ý' }
];

const StudentSupportPage = () => {
   const { user } = useAuth();
   const [messages, setMessages] = useState([]);
   const [selectedTopic, setSelectedTopic] = useState(QUICK_TOPICS[0].tag);
   const [inputMessage, setInputMessage] = useState('');
   const [studentName, setStudentName] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [successBanner, setSuccessBanner] = useState(false);
   const chatEndRef = useRef(null);

   // Load user name & cached messages from localStorage
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
         if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
            loadMessages();
         }
      }, 10000);

      const handleFocus = () => {
         if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
            loadMessages();
         }
      };
      window.addEventListener('focus', handleFocus);

      return () => {
         window.removeEventListener('storage', handleStorage);
         window.removeEventListener('eureka_support_updated', handleStorage);
         window.removeEventListener('focus', handleFocus);
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

   // Save messages to localStorage
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
      <div className="w-full pt-32 pb-20 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto font-body">

         {/* Top Header Banner */}
         <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-heading tracking-tight">
               Trao Đổi Trực Tiếp <span className="text-[#274dad] italic font-premium-serif">Với Admin</span>
            </h1>

            <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed">
               Gửi báo lỗi hệ thống hoặc đóng góp ý kiến phát triển cho Eureka.
            </p>
         </div>

         {/* Main Interface Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Admin Status & Quick Topics */}
            <div className="lg:col-span-4 space-y-6">

               {/* Admin Status Card */}
               <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-5">
                     <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#274dad] flex items-center justify-center shrink-0 shadow-sm">
                        <ShieldCheck className="w-7 h-7" />
                     </div>
                     <div>
                        <h3 className="font-heading font-extrabold text-slate-900 text-lg">Ban Quản Trị Eureka</h3>
                        <p className="text-xs font-medium text-emerald-600 flex items-center gap-1.5 mt-1 font-body">
                           <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                           Trực tuyến sẵn sàng hỗ trợ
                        </p>
                     </div>
                  </div>
               </div>

               {/* Quick Topics Card */}
               <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                  <h4 className="font-heading font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
                     <HelpCircle className="w-4.5 h-4.5 text-[#274dad]" />
                     Chọn chủ đề bạn cần trao đổi:
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
                              className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${isSelected
                                 ? 'bg-[#274dad] text-white border-[#274dad] shadow-lg shadow-indigo-500/20'
                                 : 'bg-slate-50/80 text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:text-[#274dad]'
                                 }`}
                           >
                              <div className="flex items-center gap-3">
                                 <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-[#274dad] border border-slate-100 shadow-sm'
                                    }`}>
                                    <IconComponent className="w-4 h-4" />
                                 </div>
                                 <span className="font-heading font-extrabold text-xs sm:text-sm">{topic.label}</span>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-white" />}
                           </button>
                        );
                     })}
                  </div>
               </div>
            </div>

            {/* Right Column: Live Chat Interface */}
            <div className="lg:col-span-8 bg-white rounded-3xl border-2 border-indigo-200 shadow-[0_15px_40px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col min-h-[520px]">

               {/* Chat Header Bar */}
               <div className="px-6 py-4 bg-[#faf8f5] border-b border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-2xl bg-[#274dad] text-white flex items-center justify-center shadow-md">
                        <MessageSquare className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="font-heading font-extrabold text-black text-sm sm:text-base">Kênh Hội Thoại Trực Tuyến</h3>
                        <p className="text-xs text-slate-600">Đang chọn: <span className="font-bold text-[#274dad]">{selectedTopic}</span></p>
                     </div>
                  </div>

                  <button
                     type="button"
                     onClick={handleResetChat}
                     title="Tải lại đoạn chat"
                     className="p-2 rounded-xl text-slate-600 hover:text-black hover:bg-slate-200/60 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-heading font-bold"
                  >
                     <RefreshCw className="w-3.5 h-3.5" />
                     <span>Làm mới</span>
                  </button>
               </div>

               {/* Message Feed */}
               <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-50/60 to-white min-h-[320px]">
                  {messages.map((msg) => {
                     const isAdmin = msg.sender === 'admin';
                     return (
                        <div
                           key={msg.id}
                           className={`flex gap-3 max-w-[88%] ${isAdmin ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                        >
                           {/* Avatar */}
                           <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold font-heading shadow-sm overflow-hidden bg-slate-900 text-white">
                              {isAdmin ? (
                                 <div className="w-full h-full bg-[#274dad] flex items-center justify-center text-white rounded-full">
                                    <Bot className="w-5 h-5" />
                                 </div>
                              ) : (
                                 <>
                                    {msg.avatar && (
                                       <img src={msg.avatar} alt={msg.senderName} className="w-full h-full rounded-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = 'flex'; }} />
                                    )}
                                    <div className={`w-full h-full bg-slate-900 flex items-center justify-center text-white rounded-full ${msg.avatar ? 'hidden' : 'flex'}`}>
                                       {msg.senderName[0]?.toUpperCase() || <User className="w-4 h-4" />}
                                    </div>
                                 </>
                              )}
                           </div>

                           {/* Content Bubble */}
                           <div className={`space-y-1 ${isAdmin ? 'items-start' : 'items-end flex flex-col'}`}>
                              <div className="flex items-center gap-2 px-1">
                                 <span className="font-heading font-extrabold text-xs text-slate-800">{msg.senderName}</span>
                                 <span className="px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                                    {msg.topic}
                                 </span>
                                 <span className="text-[10px] text-slate-400 font-body">{msg.timestamp}</span>
                              </div>

                              <div className={`p-4 rounded-2xl text-xs sm:text-sm font-body leading-relaxed shadow-sm ${isAdmin
                                 ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                                 : 'bg-[#274dad] text-white rounded-tr-none'
                                 }`}>
                                 {msg.text}
                              </div>
                           </div>
                        </div>
                     );
                  })}

                  {/* Typing State */}
                  {isSubmitting && (
                     <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                        <div className="w-9 h-9 rounded-2xl bg-[#274dad] text-white flex items-center justify-center">
                           <Bot className="w-4 h-4 animate-spin" />
                        </div>
                        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-400 font-body italic flex items-center gap-2">
                           <span>Admin Eureka đang nhập phản hồi...</span>
                           <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                        </div>
                     </div>
                  )}
                  <div ref={chatEndRef} />
               </div>

               {/* Toast Notification */}
               {successBanner && (
                  <div className="mx-6 my-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-body font-semibold flex items-center justify-between animate-fade-in">
                     <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                        <span>Đã gửi yêu cầu tới Admin! Hệ thống đang tự động xử lý.</span>
                     </div>
                  </div>
               )}

               {/* Form Composer Area */}
               <form onSubmit={handleSendMessage} className="p-4 sm:p-6 bg-white border-t border-slate-100 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                     <div className="w-full sm:w-1/2">
                        <input
                           type="text"
                           value={studentName}
                           onChange={(e) => setStudentName(e.target.value)}
                           placeholder="Nhập tên học sinh..."
                           className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-body text-slate-800 focus:bg-white focus:border-[#274dad] focus:outline-none transition-all"
                           required
                        />
                     </div>
                     <div className="w-full sm:w-1/2 flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-body text-slate-500">
                        <span className="font-bold text-slate-700">Đang chọn:</span>
                        <span className="px-2.5 py-0.5 bg-indigo-100 text-[#274dad] rounded-md font-bold text-xs">
                           {selectedTopic}
                        </span>
                     </div>
                  </div>

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
                        placeholder={`Nhập câu hỏi hoặc thông tin cần Admin hỗ trợ về [${selectedTopic}]...`}
                        rows={3}
                        className="w-full pl-4 pr-14 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-body text-slate-800 focus:bg-white focus:border-[#274dad] focus:outline-none transition-all resize-none"
                        required
                     />

                     <button
                        type="submit"
                        disabled={!inputMessage.trim() || isSubmitting}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-[#274dad] text-white hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 cursor-pointer"
                        title="Gửi câu hỏi"
                     >
                        <Send className="w-4 h-4" />
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
};

export default StudentSupportPage;

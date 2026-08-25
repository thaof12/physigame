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
   GraduationCap
} from 'lucide-react';
import { useTeacherAuth } from '../contexts/TeacherAuthContext';

const QUICK_TOPICS = [
   { id: 'materials', label: 'Đóng góp bài giảng & Học liệu', icon: BookOpen, tag: 'Học liệu' },
   { id: 'class_mgmt', label: 'Hỗ trợ quản lý lớp & Học sinh', icon: Users, tag: 'Lớp học' },
   { id: 'technical', label: 'Báo lỗi kỹ thuật & Hệ thống', icon: Wrench, tag: 'Kỹ thuật' },
   { id: 'account_perms', label: 'Thắc mắc tài khoản & Quyền hạn', icon: Zap, tag: 'Tài khoản' }
];

const INITIAL_MESSAGES = [
   {
      id: 'msg_welcome_teacher',
      sender: 'admin',
      senderName: 'Admin Eureka',
      avatar: null,
      topic: 'Hệ thống',
      text: 'Kính chào Quý Thầy/Cô! Ban Quản Trị Eureka hân hạnh hỗ trợ Thầy/Cô. Thầy/Cô cần góp ý bài giảng, hỗ trợ quản lý lớp học hay báo lỗi kỹ thuật gì không ạ?',
      timestamp: 'Hôm nay',
      isSystem: true
   }
];

const TeacherSupportPage = () => {
   const { teacher } = useTeacherAuth();
   const [messages, setMessages] = useState([]);
   const [selectedTopic, setSelectedTopic] = useState(QUICK_TOPICS[0].tag);
   const [inputMessage, setInputMessage] = useState('');
   const [teacherName, setTeacherName] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [successBanner, setSuccessBanner] = useState(false);
   const chatEndRef = useRef(null);

   // Load teacher name & cached messages from localStorage
   useEffect(() => {
      const displayName = teacher?.displayName || teacher?.username || teacher?.email?.split('@')[0] || '';
      setTeacherName(displayName);

      try {
         const cached = localStorage.getItem('eureka_teacher_admin_messages');
         if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
               setMessages(parsed);
               return;
            }
         }
      } catch (e) {
         console.warn('Error reading cached teacher support messages:', e);
      }
      setMessages(INITIAL_MESSAGES);
   }, [teacher]);

   // Save messages to localStorage
   const saveMessages = (newMessages) => {
      setMessages(newMessages);
      try {
         localStorage.setItem('eureka_teacher_admin_messages', JSON.stringify(newMessages));
      } catch (e) {
         console.warn('Error saving teacher support messages:', e);
      }
   };

   // Auto scroll chat feed
   useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages]);

   const handleSelectTopic = (topicObj) => {
      setSelectedTopic(topicObj.tag);
   };

   const handleSendMessage = (e) => {
      e.preventDefault();
      if (!inputMessage.trim()) return;

      const now = new Date();
      const timeString = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      const newTeacherMsg = {
         id: `teacher_msg_${Date.now()}`,
         sender: 'teacher',
         senderName: teacherName.trim() ? `Thầy/Cô ${teacherName.trim()}` : 'Giảng viên Eureka',
         avatar: teacher?.avatar || null,
         topic: selectedTopic,
         text: inputMessage.trim(),
         timestamp: timeString,
         isSystem: false
      };

      const updatedList = [...messages, newTeacherMsg];
      saveMessages(updatedList);
      setInputMessage('');
      setIsSubmitting(true);
      setSuccessBanner(true);

      setTimeout(() => {
         setSuccessBanner(false);
      }, 4000);

      // Automated Admin Reply tailored for Teachers
      setTimeout(() => {
         const adminReply = {
            id: `admin_reply_${Date.now()}`,
            sender: 'admin',
            senderName: 'Admin Eureka',
            avatar: null,
            topic: selectedTopic,
            text: `Cảm ơn Quý Thầy/Cô ${newTeacherMsg.senderName}! Ban Quản Trị Eureka đã ghi nhận thông tin về [${selectedTopic}]. Chuyên viên kỹ thuật sẽ phản hồi trực tiếp tới Thầy/Cô trong thời gian sớm nhất!`,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            isSystem: false
         };
         saveMessages([...updatedList, adminReply]);
         setIsSubmitting(false);
      }, 1200);
   };

   const handleResetChat = () => {
      saveMessages(INITIAL_MESSAGES);
   };

   return (
      <div className="w-full space-y-8 font-body">

         {/* Top Header Section */}
         <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-900/5 relative overflow-hidden">
            <div className="max-w-3xl space-y-3">

               <h1 className="text-3xl sm:text-4xl font-black text-[#0f172a] font-heading tracking-tight">
                  Trao Đổi Trực Tiếp <span className="text-[#4f46e5] italic font-premium-serif">Với Admin</span>
               </h1>

               <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed">
                  Gửi phản hồi, đóng góp ý kiến về bài giảng học liệu, quản lý lớp học hoặc báo lỗi hệ thống. Ban Quản Trị Eureka luôn sẵn sàng lắng nghe và đồng hành cùng Quý Thầy/Cô.
               </p>
            </div>
         </div>

         {/* Main Content Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Admin Status Card & Quick Topics */}
            <div className="lg:col-span-4 space-y-6">

               {/* Admin Status Card */}
               <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-lg shadow-slate-900/5">
                  <div className="flex items-center gap-4 mb-5">
                     <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#4f46e5] flex items-center justify-center shrink-0 shadow-sm">
                        <ShieldCheck className="w-7 h-7" />
                     </div>
                     <div>
                        <h3 className="font-heading font-extrabold text-[#0f172a] text-lg">Ban Quản Trị Eureka</h3>
                        <p className="text-xs font-medium text-emerald-600 flex items-center gap-1.5 mt-1 font-body">
                           <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                           Trực tuyến ưu tiên Giảng viên
                        </p>
                     </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                     <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-slate-500">
                           <Clock className="w-4 h-4 text-[#4f46e5]" /> Phản hồi ưu tiên:
                        </span>
                        <span className="font-bold text-slate-900">&lt; 10 phút</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-slate-500">
                           <Sparkles className="w-4 h-4 text-amber-500" /> Tỷ lệ hỗ trợ thành công:
                        </span>
                        <span className="font-bold text-slate-900">100%</span>
                     </div>
                  </div>
               </div>

               {/* Quick Topics Card */}
               <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-lg shadow-slate-900/5">
                  <h4 className="font-heading font-extrabold text-[#0f172a] text-sm mb-4 flex items-center gap-2">
                     <HelpCircle className="w-4.5 h-4.5 text-[#4f46e5]" />
                     Chọn chủ đề cần trao đổi:
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
                                    ? 'bg-[#4f46e5] text-white border-[#4f46e5] shadow-lg shadow-indigo-500/20'
                                    : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100 hover:text-[#4f46e5]'
                                 }`}
                           >
                              <div className="flex items-center gap-3">
                                 <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-[#4f46e5] border border-slate-100 shadow-sm'
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
            <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden flex flex-col min-h-[540px]">

               {/* Chat Header Bar */}
               <div className="px-6 py-4 bg-[#0f172a] text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-2xl bg-[#4f46e5] text-white flex items-center justify-center shadow-md">
                        <MessageSquare className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="font-heading font-extrabold text-white text-sm sm:text-base">Kênh Hội Thoại Giảng Viên & Admin</h3>
                        <p className="text-xs text-slate-300">Đang chọn: <span className="font-bold text-indigo-400">{selectedTopic}</span></p>
                     </div>
                  </div>

                  <button
                     type="button"
                     onClick={handleResetChat}
                     title="Tải lại đoạn chat"
                     className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-heading font-bold"
                  >
                     <RefreshCw className="w-3.5 h-3.5" />
                     <span>Làm mới</span>
                  </button>
               </div>

               {/* Messages Feed */}
               <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-50/60 to-white min-h-[320px]">
                  {messages.map((msg) => {
                     const isAdmin = msg.sender === 'admin';
                     return (
                        <div
                           key={msg.id}
                           className={`flex gap-3 max-w-[88%] ${isAdmin ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                        >
                           {/* Avatar */}
                           <div className={`w-9 h-9 rounded-2xl flex-shrink-0 flex items-center justify-center text-xs font-bold font-heading shadow-sm ${isAdmin
                                 ? 'bg-[#4f46e5] text-white'
                                 : 'bg-[#0f172a] text-white'
                              }`}>
                              {isAdmin ? <Bot className="w-5 h-5" /> : (msg.senderName[0]?.toUpperCase() || <GraduationCap className="w-4 h-4" />)}
                           </div>

                           {/* Bubble Content */}
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
                                    : 'bg-[#4f46e5] text-white rounded-tr-none'
                                 }`}>
                                 {msg.text}
                              </div>
                           </div>
                        </div>
                     );
                  })}

                  {/* Typing Indicator */}
                  {isSubmitting && (
                     <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                        <div className="w-9 h-9 rounded-2xl bg-[#4f46e5] text-white flex items-center justify-center">
                           <Bot className="w-4 h-4 animate-spin" />
                        </div>
                        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-400 font-body italic flex items-center gap-2">
                           <span>Admin Eureka đang nhập phản hồi cho Thầy/Cô...</span>
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
                        <span>Đã gửi ý kiến tới Ban Quản Trị Eureka! Hệ thống đang tự động tiếp nhận.</span>
                     </div>
                  </div>
               )}

               {/* Form Input Area */}
               <form onSubmit={handleSendMessage} className="p-4 sm:p-6 bg-white border-t border-slate-100 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                     <div className="w-full sm:w-1/2">
                        <input
                           type="text"
                           value={teacherName}
                           onChange={(e) => setTeacherName(e.target.value)}
                           placeholder="Tên Thầy/Cô..."
                           className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-body text-slate-800 focus:bg-white focus:border-[#4f46e5] focus:outline-none transition-all"
                           required
                        />
                     </div>
                     <div className="w-full sm:w-1/2 flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-body text-slate-500">
                        <span className="font-bold text-slate-700">Đang chọn:</span>
                        <span className="px-2.5 py-0.5 bg-indigo-100 text-[#4f46e5] rounded-md font-bold text-xs">
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
                        placeholder={`Nhập nội dung trao đổi hoặc đóng góp ý kiến về [${selectedTopic}]...`}
                        rows={3}
                        className="w-full pl-4 pr-14 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-body text-slate-800 focus:bg-white focus:border-[#4f46e5] focus:outline-none transition-all resize-none"
                        required
                     />

                     <button
                        type="submit"
                        disabled={!inputMessage.trim() || isSubmitting}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-[#4f46e5] text-white hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 cursor-pointer"
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

export default TeacherSupportPage;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, BookOpen, ArrowLeftRight, ArrowLeft, Wrench, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import heroMaster from '../assets/images/hero_master.png';

const PhysicsToolsHub = () => {
  const navigate = useNavigate();

  const tools = [
    {
      id: 'calculator',
      name: 'Máy Tính Vật Lý',
      description: 'Hệ thống tính toán tích hợp chuẩn xác. Nhập số liệu và kết xuất đáp án tức thời cho Cơ học, Điện học, Nhiệt học.',
      icon: Calculator,
      path: '/physics-tools/calculator',
      features: ['Hỗ trợ công thức đa dạng', 'Quy đổi kết quả tự động', 'Biểu diễn phương trình']
    },
    {
      id: 'constants',
      name: 'Tra Cứu Hằng Số',
      description: 'Bảng trị số vật lý tiêu chuẩn hóa quốc tế. Tra cứu nhanh chóng các hằng số vũ trụ, lượng tử và vi mô.',
      icon: BookOpen,
      path: '/physics-tools/constants',
      features: ['Tìm kiếm nhanh thông tin', 'Hệ số siêu chính xác', 'Kèm giải thích tham chiếu']
    },
    {
      id: 'converter',
      name: 'Chuyển Đổi Đơn Vị',
      description: 'Thiết bị biến đổi định dạng đo lường đa năng. Chuyển tiếp mượt mà giữa các hệ quy chiếu khác nhau.',
      icon: ArrowLeftRight,
      path: '/physics-tools/converter',
      features: ['Đầy đủ hệ SI', 'Tính toán thời gian thực', 'Bao hàm 20+ danh mục đo lường']
    }
  ];

  return (
    <div className="bg-[#FFFFFF] font-sans overflow-x-hidden min-h-screen selection:bg-[#274dad]/20 selection:text-[#4A3728]">
      {/* ══════════════════════════════════════════
          HERO & HEADER BANNER
          ══════════════════════════════════════════ */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-[#FFFFFF]">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src={heroMaster}
            alt="Academy Background"
            className="w-full h-[500px] object-cover opacity-10 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFFFFF]/90 to-[#FFFFFF]" />
        </div>
        
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 graph-grid opacity-[0.25] pointer-events-none" />
        <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none bg-[#274dad]/10" />

        <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6">
          {/* Top Bar */}
          <div className="flex items-center gap-4 mb-10">
            <button
              onClick={() => navigate('/')}
              className="group flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-[#E5E7EB] text-[#2099e9] shadow-sm hover:border-[#274dad]/30 hover:bg-[#e4f2f0] hover:shadow-md transition-all active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1E293B] tracking-tight flex items-center gap-2">
                <Wrench className="w-6 h-6 text-[#274dad]" />
                Công Cụ Vật Lý
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-1">
                Bộ vi xử lý thông số và bộ công cụ học thuật
              </p>
            </div>
          </div>

          {/* Hero Banner Area */}
          <div className="bg-white rounded-[2.5rem] border border-[#E5E7EB] shadow-[0_20px_40px_-15px_rgba(184,115,51,0.15)] overflow-hidden relative group">
            {/* Inner Decoration */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 border-2 border-[#274dad]/10 rounded-[2.5rem] pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row items-stretch">
              <div className="p-8 sm:p-12 lg:w-3/5 lg:py-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#44b5d7]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e4f2f0] border border-[#274dad]/20 text-[#2099e9] font-black text-[10px] tracking-[0.2em] uppercase mb-6 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" /> Công cụ hỗ trợ độc quyền
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] leading-[1.2] mb-4 tracking-tight">
                    Giải quyết bài toán cơ học, nhiệt, điện từ nhanh chóng & chính xác
                  </h2>
                  <p className="text-slate-500 font-medium leading-relaxed mb-8 max-w-xl text-[15px]">
                    Sử dụng hệ thống ma trận công thức tính toán dưới đây để tra cứu và chuyển đổi các đại lượng vật lý. 
                    Mọi tham số đều được thiết lập chuẩn hóa, hỗ trợ bạn tiếp thu kiến thức một cách thuận lợi nhất.
                  </p>
                </div>
              </div>
              
              <div className="lg:w-2/5 relative bg-gradient-to-tr from-[#1E293B] to-[#0F172A] min-h-[200px] flex items-center justify-center border-l lg:border-l-[#E5E7EB] overflow-hidden">
                <div className="absolute inset-0 graph-grid opacity-10 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.15)_0%,transparent_70%)]" />
                <div className="p-8 relative z-10 animate-pulse-slow">
                  {/* Decorative Gear / Mechanism */}
                  <div className="w-32 h-32 rounded-full border border-[#44b5d7]/30 flex items-center justify-center relative backdrop-blur-sm">
                    <div className="absolute inset-2 rounded-full border border-[#44b5d7]/20 border-dashed animate-[spin_20s_linear_infinite]" />
                    <div className="absolute inset-6 rounded-full border border-[#274dad]/40 flex items-center justify-center shadow-[0_0_20px_rgba(184,115,51,0.2)]">
                       <Wrench className="w-10 h-10 text-[#44b5d7]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TOOLS GRID SECTIONS
          ══════════════════════════════════════════ */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  onClick={() => navigate(tool.path)}
                  className="bg-white rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-[#E5E7EB] hover:shadow-[0_25px_50px_-15px_rgba(184,115,51,0.2)] hover:border-[#274dad]/30 transition-all duration-500 cursor-pointer transform hover:-translate-y-2 group overflow-hidden relative flex flex-col"
                >
                  {/* Gradient flair on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#274dad]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Card Header */}
                  <div className="p-8 pb-6 border-b border-[#E5E7EB]/50 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-[1.25rem] bg-[#e4f2f0] border border-[#274dad]/20 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-[#274dad] group-hover:text-white text-[#274dad] transition-all duration-500">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black text-slate-400 tracking-[0.15em] uppercase">MODULE</div>
                        <div className="text-xl font-black text-[#2099e9] mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity">0{index + 1}</div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-[#1E293B] group-hover:text-[#2099e9] transition-colors tracking-tight">
                      {tool.name}
                    </h3>
                  </div>

                  {/* Card Content */}
                  <div className="p-8 flex-1 flex flex-col relative">
                    <p className="text-slate-500 font-medium leading-relaxed text-[14px] flex-1">
                      {tool.description}
                    </p>

                    <div className="mt-8 space-y-3 relative z-10">
                      <div className="text-[10px] font-black text-[#274dad] tracking-[0.1em] uppercase mb-2">TIỆN ÍCH TÍCH HỢP:</div>
                      {tool.features.map((feature, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-3 text-sm text-slate-600 font-medium"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#274dad]/60 group-hover:text-[#274dad] transition-colors" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-[#E5E7EB]/50">
                      <button 
                        onClick={() => navigate(tool.path)}
                        className="w-full flex items-center justify-center gap-2 pg-btn-brass py-3 rounded-xl shadow-md text-sm"
                      >
                        Khởi động <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ══════════════════════════════════════════
              ADDITIONAL INFO PANELS
              ══════════════════════════════════════════ */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            {/* Guide Panel */}
            <div className="bg-white rounded-3xl p-8 border border-[#E5E7EB] shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#e4f2f0] rounded-bl-[100px] flex items-start justify-end p-6">
                 <BookOpen className="w-8 h-8 text-[#274dad]/20" />
              </div>
              <h3 className="text-xl font-black text-[#1E293B] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center text-white text-sm shadow-sm">💡</span>
                Cẩm nang kích hoạt
              </h3>
              <ul className="space-y-4">
                {[
                  'Chọn thiết bị vi xử lý phù hợp với tham số của bạn',
                  'Nhập vào các biến số vật lý nguyên thủy',
                  'Gửi yêu cầu chuỗi mô phỏng logic để thu đáp án',
                  'Trích xuất (Sao chép) trực tiếp tới bộ nhớ đệm',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4">
                    <span className="font-black text-[#274dad] bg-[#e4f2f0] px-2 py-0.5 rounded leading-none text-xs border border-[#274dad]/20 shadow-sm">B.0{idx + 1}</span>
                    <span className="text-slate-600 font-medium text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits Panel */}
            <div className="bg-[#1E293B] rounded-3xl p-8 shadow-xl relative overflow-hidden group">
               {/* Ambient interior glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(184,115,51,0.2)_0%,transparent_60%)] pointer-events-none" />
              <div className="absolute inset-0 graph-grid opacity-10 pointer-events-none" />
              
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 relative z-10">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#44b5d7] border border-white/20 text-sm shadow-sm backdrop-blur-sm">🎯</span>
                Lợi ích cốt lõi
              </h3>
              <ul className="space-y-4 relative z-10">
                {[
                  'Cắt giảm cực hạn thời gian tiến trình học thuật',
                  'Độ chính xác chuẩn quốc tế qua các hằng số',
                  'Tiện dụng, tối ưu trên đa nền tảng',
                  'Tích hợp hoàn hảo với lộ trình lý thuyết',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4">
                    <span className="w-5 h-5 rounded-full bg-[#2099e9] flex items-center justify-center shrink-0 border border-[#44b5d7]/30">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </span>
                    <span className="text-slate-300 font-medium text-[14px] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
        </div>
      </section>
    </div>
  );
};

export default PhysicsToolsHub;


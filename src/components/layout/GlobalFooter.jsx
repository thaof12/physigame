import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Youtube, Instagram, MapPin, Phone, Mail, ChevronRight } from 'lucide-react';

const GlobalFooter = () => {
  return (
    <footer className="w-full bg-[#FDFCF8] border-t border-slate-100 pt-10 sm:pt-16 lg:pt-20 pb-24 lg:pb-10 relative overflow-hidden font-sans">
      {/* Graph grid background */}
      <div className="absolute inset-0 graph-grid opacity-[0.4] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">

          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-[#B87333] via-[#8C5523] to-[#4A3728] tracking-tighter">
                PhysiGame
              </span>
            </Link>
            <p className="text-slate-500 font-medium leading-relaxed text-sm max-w-xs">
              Học Vật lý thông qua trò chơi tương tác và thí nghiệm ảo chân thực. Nền tảng không gian học tập công nghệ hiện đại dành cho thế hệ tương lai.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {[Facebook, Youtube, Instagram].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#B87333] hover:border-[#B87333] hover:shadow-md transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Khám phá */}
          <div className="space-y-6">
            <h4 className="font-black text-[#4A3728] text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B87333]" />
              Khám phá
            </h4>
            <ul className="space-y-4">
              {[
                ['Trung tâm học tập', '/program/physics'],
                ['Công cụ Vật lý', '/physics-tools'],
                ['Bài giảng tương tác', '/interactive-lectures'],
                ['Phòng Thí nghiệm ảo', '/vatly/virtual-lab'],
                ['Cuộc đua PK', '/pk-battle'],
              ].map(([label, path]) => (
                <li key={label}>
                  <Link to={path} className="text-slate-500 hover:text-[#B87333] font-bold text-sm transition-colors flex items-center gap-2 group">
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div className="space-y-6">
            <h4 className="font-black text-[#4A3728] text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B87333]" />
              Hỗ trợ
            </h4>
            <ul className="space-y-4">
              {[
                'Hướng dẫn sử dụng',
                'Câu hỏi thường gặp',
                'Chính sách bảo mật',
                'Điều khoản dịch vụ',
              ].map(label => (
                <li key={label}>
                  <span className="text-slate-500 font-bold text-sm cursor-pointer hover:text-[#B87333] transition-colors">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Liên hệ */}
          <div className="space-y-6">
            <h4 className="font-black text-[#4A3728] text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              Liên hệ
            </h4>
            <ul className="space-y-6">
              {[
                { Icon: Mail, title: 'Email', body: 'support@physigame.edu.vn' },
                { Icon: Phone, title: 'Hotline', body: '(+84) 98 123 4567' },
                { Icon: MapPin, title: 'Trụ sở chính', body: 'ĐH Nguyễn Tất Thành TP.HCM\n3F Nguyễn Hữu Thọ, Tân Hưng' },
              ].map(({ Icon, title, body }) => (
                <li key={title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm text-[#B87333]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</div>
                    <div className="text-slate-600 font-bold text-sm leading-relaxed whitespace-pre-line">{body}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="md:hidden space-y-6 mb-10">
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-[#B87333] via-[#8C5523] to-[#4A3728] tracking-tighter">
                PhysiGame
              </span>
            </Link>
            <p className="text-slate-500 font-medium leading-relaxed text-sm max-w-sm">
              Học Vật lý thông qua trò chơi tương tác và thí nghiệm ảo chân thực.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {[Facebook, Youtube, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#B87333] hover:border-[#B87333] transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <details className="bg-white/80 rounded-2xl border border-slate-100 px-4 py-3" open>
            <summary className="font-black text-[#4A3728] text-sm cursor-pointer">Khám phá</summary>
            <ul className="space-y-3 mt-3">
              {[
                ['Trung tâm học tập', '/program/physics'],
                ['Công cụ Vật lý', '/physics-tools'],
                ['Bài giảng tương tác', '/interactive-lectures'],
                ['Phòng Thí nghiệm ảo', '/vatly/virtual-lab'],
                ['Cuộc đua PK', '/pk-battle'],
              ].map(([label, path]) => (
                <li key={label}>
                  <Link to={path} className="text-slate-600 hover:text-[#B87333] font-bold text-sm transition-colors flex items-center gap-2">
                    <ChevronRight className="w-3 h-3" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>

          <details className="bg-white/80 rounded-2xl border border-slate-100 px-4 py-3">
            <summary className="font-black text-[#4A3728] text-sm cursor-pointer">Liên hệ</summary>
            <ul className="space-y-4 mt-3">
              {[
                { Icon: Mail, title: 'Email', body: 'support@physigame.edu.vn' },
                { Icon: Phone, title: 'Hotline', body: '(+84) 98 123 4567' },
                { Icon: MapPin, title: 'Trụ sở', body: 'ĐH Nguyễn Tất Thành TP.HCM' },
              ].map(({ Icon, title, body }) => (
                <li key={title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 text-[#B87333]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</div>
                    <div className="text-slate-600 font-bold text-sm leading-relaxed">{body}</div>
                  </div>
                </li>
              ))}
            </ul>
          </details>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <p className="text-slate-400 font-bold text-xs">
            &copy; 2026 PhysiGame Universe. Built with passion for science.
          </p>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Tín hiệu ổn định</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;

import React from 'react';
import { Link } from 'react-router-dom';
import { Atom, Facebook, Youtube, Instagram, MapPin, Phone, Mail, ChevronRight } from 'lucide-react';

const GlobalFooter = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800 pt-16 pb-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-cyan-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-32 bg-purple-600/10 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
          
          {/* Brand & Socials (takes 4 columns on large screens) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2 group cursor-pointer inline-flex w-fit">
              <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Atom className="w-7 h-7 text-white group-hover:rotate-180 transition-transform duration-700" />
              </div>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
                Physi<span className="text-white">Game</span>
              </span>
            </Link>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Học Vật lý thông qua trò chơi tương tác và thí nghiệm ảo chân thực. Nền tảng không gian học tập công nghệ cao dành cho học sinh đam mê khám phá.
            </p>

            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-3 h-1 bg-cyan-500 rounded-full"></span>
              Khám phá
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                { name: 'Trung tâm học tập', path: '/program/physics/dashboard' },
                { name: 'Công cụ Vật lý', path: '/physics-tools' },
                { name: 'Bài giảng tương tác', path: '/interactive-lectures' },
                { name: 'Phòng Thí nghiệm ảo', path: '/vatly/virtual-lab' },
                { name: 'Cuộc đua PK', path: '/pk-battle' }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-slate-400 hover:text-cyan-400 text-sm font-medium flex items-center gap-2 group transition-colors">
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-3 h-1 bg-purple-500 rounded-full"></span>
              Hỗ trợ
            </h3>
            <ul className="flex flex-col gap-3">
              {['Hướng dẫn sử dụng', 'Câu hỏi thường gặp', 'Chính sách bảo mật', 'Điều khoản dịch vụ'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-slate-400 hover:text-purple-400 text-sm font-medium transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-3 h-1 bg-rose-500 rounded-full"></span>
              Liên hệ
            </h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 text-slate-400 text-sm">
                <div className="mt-1 bg-slate-900 border border-slate-800 p-1.5 rounded-lg text-cyan-500 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-300">Email</p>
                  <a href="mailto:support@physigame.edu.vn" className="hover:text-cyan-400 transition-colors">support@physigame.edu.vn</a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-400 text-sm">
                <div className="mt-1 bg-slate-900 border border-slate-800 p-1.5 rounded-lg text-emerald-500 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-300">Hotline</p>
                  <a href="tel:0981234567" className="hover:text-emerald-400 transition-colors">(+84) 98 123 4567</a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-slate-400 text-sm leading-relaxed">
                <div className="mt-1 bg-slate-900 border border-slate-800 p-1.5 rounded-lg text-rose-500 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-300">Trụ sở Viễn chinh</p>
                  <p>Trường Đại học Sư phạm TP.HCM<br/>280 An Dương Vương, Phường 4, Q.5, TP.HCM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} PhysiGame Universe. Bản quyền thuộc về Đội ngũ Phát triển.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400 text-xs font-semibold tracking-wider">HỆ THỐNG ĐANG HOẠT ĐỘNG TỐT</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;

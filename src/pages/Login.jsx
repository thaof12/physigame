import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, BookOpen, Mail, Lock, CheckCircle2, ChevronLeft, Lightbulb } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, setUser } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      // Supabase will redirect back, auth state change handler will navigate
    } catch (err) {
      setError('Đăng nhập với Google thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Sai thông tin đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#FDFCF8] items-center justify-center p-4 sm:p-8 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#B87333]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0E7490]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute inset-0 graph-grid pointer-events-none z-0 opacity-40"></div>

      {/* Container */}
      <div className="w-full max-w-6xl rounded-[2rem] bg-white border border-[#E5E7EB] overflow-hidden flex flex-col md:flex-row shadow-[0_20px_50px_-15px_rgba(184,115,51,0.12)] relative z-10 transition-all duration-500">

        {/* LEFT SIDE: Visuals & Value Proposition */}
        <div className="hidden md:flex flex-col md:w-5/12 lg:w-1/2 relative bg-[#F8F4EF] border-r border-[#E5E7EB] overflow-hidden p-10 lg:p-14">

          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#B87333]/5 pointer-events-none"></div>

          <Link to="/" className="relative z-10 flex items-center gap-2 mb-16 group w-fit">
            <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-[#B87333] transition-colors -ml-1" />
            <span className="text-slate-500 font-semibold group-hover:text-[#B87333] transition-colors">Trở về</span>
          </Link>

          <div className="relative z-10 flex flex-col h-full justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#B87333] to-[#8C5523] rounded-2xl flex items-center justify-center mb-6 shadow-[0_8px_20px_rgba(184,115,51,0.3)]">
              <Lightbulb className="w-8 h-8 text-white animate-pulse-soft" />
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-[#1E293B] mb-4 leading-tight tracking-tight">
              Khám Phá <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#B87333] via-[#8C5523] to-[#4A3728]">
                Kho Tàng Vật Lý
              </span>
            </h1>
            <p className="text-slate-500 text-lg mb-10 max-w-sm leading-relaxed">
              Mở cánh cửa tri thức với nền tảng học thuật hiện đại. Hành trình chinh phục các định luật vũ trụ bắt đầu từ đây!
            </p>

            <ul className="space-y-4">
              {[
                { title: 'Thí nghiệm thực tế ảo', desc: 'Mô phỏng đồ họa 3D chân thực, chuẩn xác.' },
                { title: 'Thi đua học thuật', desc: 'Sân chơi trí tuệ, mài giũa tư duy.' },
                { title: 'Ghi danh bảng vàng', desc: 'Tích lũy điểm năng lực, nhận chứng nhận.' }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/60 transition-colors border border-transparent hover:border-[#E5E7EB]">
                  <div className="mt-1 bg-[#B87333]/10 p-1.5 rounded-full border border-[#B87333]/20 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#B87333]" />
                  </div>
                  <div>
                    <h3 className="text-[#1E293B] font-bold text-base">{item.title}</h3>
                    <p className="text-slate-500 text-sm mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE: Auth Form */}
        <div className="w-full md:w-7/12 lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">

          <div className="w-full max-w-md relative z-10">

            <div className="text-center mb-8">
              {/* Mobile Only Back Button */}
              <Link to="/" className="md:hidden flex items-center gap-1 text-slate-400 mb-6 justify-center">
                <ChevronLeft className="w-4 h-4" /> Trở về
              </Link>

              <h2 className="text-3xl font-extrabold text-[#1E293B] mb-2">Đăng nhập</h2>
              <p className="text-slate-500">Chào mừng bạn trở lại học viện 👋</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium flex items-center gap-2 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div className="mb-6 flex p-1.5 bg-[#F8F4EF] border border-[#E5E7EB] rounded-2xl">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${selectedRole === 'student'
                    ? 'bg-white text-[#B87333] shadow-md border border-[#E5E7EB]/50'
                    : 'text-slate-500 hover:text-[#1E293B] hover:bg-white/50'
                  }`}
              >
                <BookOpen className="w-4 h-4" /> Học viên
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('teacher')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${selectedRole === 'teacher'
                    ? 'bg-white text-[#0E7490] shadow-md border border-[#E5E7EB]/50'
                    : 'text-slate-500 hover:text-[#1E293B] hover:bg-white/50'
                  }`}
              >
                <GraduationCap className="w-4 h-4" /> Giảng viên
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1E293B] pl-1">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-[#B87333] transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#FDFCF8] border-2 border-[#E5E7EB] text-[#1E293B] placeholder-slate-400 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#B87333] focus:ring-4 focus:ring-[#B87333]/10 transition-all font-medium"
                    placeholder="Nhập địa chỉ email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1E293B] pl-1">Mật khẩu</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#B87333] transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#FDFCF8] border-2 border-[#E5E7EB] text-[#1E293B] placeholder-slate-400 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#B87333] focus:ring-4 focus:ring-[#B87333]/10 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 border-2 border-slate-300 rounded bg-white group-hover:border-[#B87333] transition-colors">
                    <input type="checkbox" className="peer opacity-0 absolute inset-0 cursor-pointer" />
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B87333] opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Ghi nhớ tôi</span>
                </label>
                <a href="#" className="text-sm font-bold text-[#B87333] hover:text-[#8C5523] transition-colors">
                  Quên mật khẩu?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-[#B87333] to-[#8C5523] text-white rounded-2xl py-3.5 font-black text-lg transition-all hover:shadow-[0_8px_25px_rgba(184,115,51,0.3)] active:scale-[0.98] mt-4"
              >
                <span className="relative flex justify-center items-center gap-2 group-hover:text-white transition-colors duration-300">
                  {loading ? 'Đang xác thực...' : 'Đăng nhập'}
                </span>
              </button>
            </form>

            <div className="mt-8 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]"></div>
              </div>
              <span className="relative px-4 text-xs font-bold text-slate-400 uppercase bg-white">Hoặc tiếp tục với</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-3 py-3.5 bg-white text-[#1E293B] font-bold rounded-2xl hover:bg-slate-50 border-2 border-[#E5E7EB] hover:border-slate-300 transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span>Đăng nhập với Google</span>
            </button>

            <p className="mt-8 text-center text-slate-500 text-sm font-medium">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-bold text-[#B87333] hover:text-[#8C5523] transition-colors">
                Đăng ký ngay
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

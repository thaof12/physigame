import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, BookOpen, Mail, Lock, CheckCircle2, ChevronLeft, Lightbulb, ShieldCheck, ArrowRight } from 'lucide-react';


const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('student');
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const urlError = queryParams.get('error');
  let initialError = location.state?.error || '';
  if (urlError === 'deactivated') {
    initialError = 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.';
  }

  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRoleRedirect = (user) => {
    if (user.role === 'admin' || user.email === 'quantrivien@gmail.com') {
      navigate('/admin/dashboard');
    } else if (user.role === 'teacher') {
      if (user.teacherStatus === 'verified') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/teacher/pending');
      }
    } else {
      navigate('/');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle(selectedRole);
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
      const user = await login(formData.email, formData.password);
      handleRoleRedirect(user);
    } catch (err) {
      setError(err.message || 'Sai thông tin đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-100 items-center justify-center p-4 sm:p-8 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-black/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-black/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute inset-0 graph-grid pointer-events-none z-0 opacity-10"></div>

      {/* Container */}
      <div className="w-full max-w-6xl rounded-[2.5rem] bg-white border border-white/50 overflow-hidden flex flex-col md:flex-row shadow-[0_25px_80px_-15px_rgba(32,153,233,0.15)] relative z-10 transition-all duration-500">

        {/* LEFT SIDE: Visuals & Value Proposition */}
        <div className="hidden md:flex flex-col md:w-5/12 lg:w-1/2 relative bg-slate-950 overflow-hidden p-10 lg:p-14">

          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-10 -mb-10 blur-2xl"></div>

          <Link to="/" className="relative z-10 flex items-center gap-2 mb-16 group w-fit">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 group-hover:bg-white/20 transition-all">
              <ChevronLeft className="w-5 h-5 text-white" />
            </div>
            <span className="text-white/80 font-bold group-hover:text-white transition-colors">Về trang chủ</span>
          </Link>

          <div className="relative z-10 flex flex-col h-full justify-center">
            <div className="mb-10">
              <span className="font-premium-serif text-4xl font-bold text-white italic tracking-tight">Eureka</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
              Khám Phá <br />
              <span className="text-gray-300">
                Bí Mật Vũ Trụ
              </span>
            </h1>
            <p className="text-white/70 text-lg mb-12 max-w-sm leading-relaxed">
              Trở thành nhà vật lý tương lai với nền tảng học tập 3D sinh động. Chinh phục tri thức, khai thác tiềm năng.
            </p>

            <div className="grid grid-cols-1 gap-6">
              {[
                { title: 'Tương tác 3D', desc: 'Thí nghiệm vật lý chân thực ngay trong trình duyệt.' },
                { title: 'Học tập cá nhân', desc: 'Lộ trình phát triển riêng biệt cho mỗi học viên.' },
                { title: 'Chứng nhận uy tín', desc: 'Đánh giá năng lực theo chuẩn giáo dục hiện đại.' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="mt-1 bg-white/10 p-1.5 rounded-lg shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base group-hover:text-gray-300 transition-colors">{item.title}</h3>
                    <p className="text-white/50 text-sm mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Auth Form */}
        <div className="w-full md:w-7/12 lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">

          <div className="w-full max-w-md relative z-10">

            <div className="text-center mb-10">
              <div className="md:hidden flex justify-center mb-6">
                <span className="font-premium-serif text-3xl font-bold text-slate-900 italic tracking-tight">Eureka</span>
              </div>

              <h2 className="text-3xl font-black text-slate-900 mb-3">Chào mừng trở lại</h2>
              <p className="text-slate-500 font-medium">Bắt đầu hành trình khám phá mới hôm nay</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3 animate-shake">
                <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                {error}
              </div>
            )}


            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 ml-1">Email Học Viện</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-black transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border-2 border-transparent text-black placeholder-slate-400 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all font-bold"
                    placeholder="name@university.edu"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-slate-800">Mật mã Bảo mật</label>
                  <a href="#" className="text-xs font-bold text-gray-500 hover:text-black transition-colors">Quên?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-black transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50 border-2 border-transparent text-black placeholder-slate-400 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all font-bold"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-6 h-6 border-2 border-slate-300 rounded-lg bg-white group-hover:border-black transition-all peer-checked:border-black">
                    <input type="checkbox" className="peer opacity-0 absolute inset-0 cursor-pointer" />
                    <div className="w-2.5 h-2.5 bg-black rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-500 group-hover:text-black transition-colors">Duy trì đăng nhập</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-black text-white rounded-2xl py-4 font-black text-lg transition-all hover:-translate-y-0.5 hover:bg-slate-800 active:scale-95 shadow-xl hover:shadow-2xl mt-4"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative flex justify-center items-center gap-3">
                  {loading ? 'Đang giải mã...' : 'Vào Học Viện Ngay'}
                  {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> }
                </span>
              </button>
            </form>

            <div className="mt-10 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-slate-400">
                <span className="bg-white px-4 italic">Cổng kết nối</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-8 w-full flex items-center justify-center gap-4 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-50 border-2 border-slate-200 hover:border-slate-300 transition-all active:scale-[0.98] shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span>Đăng nhập qua Google (SSO)</span>
            </button>

            <p className="mt-10 text-center text-slate-500 font-bold">
              Bạn là lính mới?{' '}
              <Link to="/register" className="text-black hover:text-gray-600 underline underline-offset-4 decoration-2">
                Gia nhập ngay
              </Link>
            </p>


          </div>
        </div>
      </div>

      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400 text-xs font-bold tracking-widest uppercase opacity-50">
        © 2026 PhysiGame Academy • Version 2.0 Blue
      </p>
    </div>
  );
};

export default Login;


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, BookOpen, Mail, Lock, CheckCircle2, ChevronLeft, User, Sparkles, ArrowRight } from 'lucide-react';
import EurekaPremiumLogo from '../components/ui/EurekaPremiumLogo';

const Register = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [selectedRole, setSelectedRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    return true;
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');
    console.log(`%c🎯 [Register] Intent to register as: ${selectedRole}`, 'color: #274dad; font-weight: bold');
    try {
      await loginWithGoogle(selectedRole);
      // OAuth flow handles navigation
    } catch (err) {
      console.error('❌ [Register] Google register error:', err);
      setError('Đăng ký bằng Google thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError('');
    setLoading(true);

    try {
      await register(
        formData.username,
        formData.email, 
        formData.password,
        selectedRole
      );
      
      if (selectedRole === 'teacher') {
        navigate('/teacher/pending');
      } else {
        navigate('/placement-test/physics');
      }
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#e4f2f0] items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#85e4fb]/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2099e9]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute inset-0 graph-grid pointer-events-none z-0 opacity-10"></div>

      {/* Container */}
      <div className="w-full max-w-6xl rounded-[2.5rem] bg-white border border-white/50 overflow-hidden flex flex-col md:flex-row shadow-[0_25px_80px_-15px_rgba(32,153,233,0.15)] relative z-10 transition-all duration-500">
        
        {/* LEFT SIDE: Visuals & Value Proposition */}
        <div className="hidden md:flex flex-col md:w-5/12 lg:w-1/2 relative bg-gradient-to-br from-[#274dad] to-[#2099e9] overflow-hidden p-10 lg:p-14 order-2 md:order-1">
          
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#85e4fb]/10 rounded-full -mr-10 -mb-10 blur-2xl"></div>

          <Link to="/" className="relative z-10 flex items-center gap-2 mb-10 group w-fit">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 group-hover:bg-white/20 transition-all">
              <ChevronLeft className="w-5 h-5 text-white" />
            </div>
            <span className="text-white/80 font-bold group-hover:text-white transition-colors">Về trang chủ</span>
          </Link>

          <div className="relative z-10 flex flex-col h-full justify-center">
            <div className="mb-10 p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 w-fit">
              <Sparkles className="w-8 h-8 text-[#85e4fb] animate-pulse" />
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
              Bắt Đầu <br/>
              <span className="text-[#85e4fb]">
                Kỷ Nguyên Tri Thức
              </span>
            </h1>
            <p className="text-white/70 text-lg mb-10 max-w-sm leading-relaxed font-medium">
              Gia nhập cộng đồng học tập đa chiều. Mở khóa tiềm năng vô hạn của bản thân thông qua vật lý hiện đại.
            </p>

            <div className="space-y-6">
              {[
                { title: 'Tài nguyên vô tận', desc: 'Truy cập hàng nghìn bài giảng và thí nghiệm 3D.' },
                { title: 'Đội ngũ chuyên gia', desc: 'Tương tác trực tiếp với những giảng viên hàng đầu.' },
                { title: 'Công nghệ AI', desc: 'Trợ lý học tập thông minh hỗ trợ 24/7.' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                   <div className="mt-1 bg-[#85e4fb] p-1.5 rounded-lg shrink-0 shadow-[0_0_15px_rgba(133,228,251,0.5)]">
                    <CheckCircle2 className="w-4 h-4 text-[#274dad]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base group-hover:text-[#85e4fb] transition-colors">{item.title}</h3>
                    <p className="text-white/50 text-sm mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Auth Form */}
        <div className="w-full md:w-7/12 lg:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12 lg:p-16 relative order-1 md:order-2">
          
          <div className="w-full max-w-md relative z-10">
            
            <div className="text-center mb-10">
              <div className="md:hidden flex justify-center mb-6">
                <EurekaPremiumLogo className="h-10" />
              </div>
              <h2 className="text-3xl font-black text-[#274dad] mb-2">Tạo tài khoản</h2>
              <p className="text-slate-400 font-medium">Thiết lập hồ sơ học thuật của bạn</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3 animate-shake">
                <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                {error}
              </div>
            )}

            {/* Role Selection - MANDATORY */}
            <div className="mb-8 space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Bạn là ai?</label>
              <div className="flex p-1.5 bg-[#e4f2f0] border border-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all duration-300 ${
                    selectedRole === 'student'
                      ? 'bg-white text-[#2099e9] shadow-lg shadow-blue-500/5'
                      : 'text-slate-500 hover:text-[#274dad]'
                  }`}
                >
                  <BookOpen className="w-4 h-4" /> Học viên
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('teacher')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all duration-300 ${
                    selectedRole === 'teacher'
                      ? 'bg-white text-[#2099e9] shadow-lg shadow-blue-500/5'
                      : 'text-slate-500 hover:text-[#274dad]'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" /> Giảng viên
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#274dad] pl-1">Họ và tên</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-300 group-focus-within:text-[#2099e9] transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#e4f2f0]/30 border-2 border-transparent text-[#274dad] placeholder-slate-400 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:bg-white focus:border-[#2099e9] focus:ring-4 focus:ring-[#2099e9]/5 transition-all font-bold text-sm"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#274dad] pl-1">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-300 group-focus-within:text-[#2099e9] transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#e4f2f0]/30 border-2 border-transparent text-[#274dad] placeholder-slate-400 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:bg-white focus:border-[#2099e9] focus:ring-4 focus:ring-[#2099e9]/5 transition-all font-bold text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#274dad] pl-1">Mật khẩu</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-300 group-focus-within:text-[#2099e9] transition-colors" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#e4f2f0]/30 border-2 border-transparent text-[#274dad] placeholder-slate-400 rounded-2xl py-3.5 pl-11 pr-3 focus:outline-none focus:bg-white focus:border-[#2099e9] focus:ring-4 focus:ring-[#2099e9]/5 transition-all font-bold text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#274dad] pl-1">Xác nhận</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-300 group-focus-within:text-[#2099e9] transition-colors" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#e4f2f0]/30 border-2 border-transparent text-[#274dad] placeholder-slate-400 rounded-2xl py-3.5 pl-11 pr-3 focus:outline-none focus:bg-white focus:border-[#2099e9] focus:ring-4 focus:ring-[#2099e9]/5 transition-all font-bold text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-[#2099e9] text-white rounded-2xl py-4 font-black text-base transition-all hover:bg-[#274dad] hover:shadow-[0_15px_30px_rgba(32,153,233,0.3)] active:scale-[0.98] mt-4"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative flex justify-center items-center gap-3">
                  {loading ? 'Đang khởi tạo...' : 'Tạo tài khoản'}
                  {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> }
                </span>
              </button>
            </form>

            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                <span className="bg-white px-4 italic">Kích hoạt SSO</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-4 py-3.5 bg-white text-[#274dad] font-bold rounded-2xl hover:bg-[#e4f2f0]/30 border-2 border-slate-100 hover:border-[#2099e9]/30 transition-all active:scale-[0.98] text-sm shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span>Đăng ký qua Google (Dành cho {selectedRole === 'student' ? 'Học viên' : 'Giảng viên'})</span>
            </button>

            <p className="mt-8 text-center text-slate-400 font-bold text-sm">
              Đã thuộc về Học viện?{' '}
              <Link to="/login" className="text-[#2099e9] hover:text-[#274dad] underline underline-offset-4 decoration-2">
                Đăng nhập ngay
              </Link>
            </p>
            
          </div>
        </div>
      </div>
       <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400 text-xs font-bold tracking-widest uppercase opacity-50">
        © 2026 PhysiGame Academy • Membership Portal
      </p>
    </div>
  );
};

export default Register;


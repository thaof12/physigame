import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { API_BASE_URL } from '../config/api';
import { GraduationCap, BookOpen, Mail, Lock, CheckCircle2, ChevronLeft, User, Navigation } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register, setUser, updateGoogleUserRole } = useAuth();
  
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
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          displayName: user.displayName,
          avatar: user.photoURL,
          selectedProgram: 'physics',
          role: selectedRole,
          isRegistration: true
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token || '');

        if (data.user.role === 'teacher') {
          if (data.user.teacherStatus === 'pending') {
            navigate('/teacher/pending');
          } else if (data.user.teacherStatus === 'verified') {
            navigate('/teacher/dashboard');
          } else {
            navigate('/teacher/pending');
          }
        } else {
          navigate('/placement-test/physics');
        }
      } else {
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
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
      const result = await register(
        formData.email, 
        formData.password, 
        formData.username, 
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
    <div className="min-h-screen flex font-sans bg-[#FDFCF8] items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#B87333]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0E7490]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute inset-0 graph-grid pointer-events-none z-0 opacity-40"></div>

      {/* Container */}
      <div className="w-full max-w-6xl rounded-[2rem] bg-white border border-[#E5E7EB] overflow-hidden flex flex-col md:flex-row shadow-[0_20px_50px_-15px_rgba(184,115,51,0.12)] relative z-10 transition-all duration-500">
        
        {/* LEFT SIDE: Visuals & Value Proposition */}
        <div className="hidden md:flex flex-col md:w-5/12 lg:w-1/2 relative bg-[#F8F4EF] border-r border-[#E5E7EB] overflow-hidden p-10 lg:p-14">
          
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#B87333]/5 pointer-events-none"></div>

          <Link to="/" className="relative z-10 flex items-center gap-2 mb-10 group w-fit">
            <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-[#B87333] transition-colors -ml-1" />
            <span className="text-slate-500 font-semibold group-hover:text-[#B87333] transition-colors">Trở về</span>
          </Link>

          <div className="relative z-10 flex flex-col h-full justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#B87333] to-[#8C5523] rounded-2xl flex items-center justify-center mb-6 shadow-[0_8px_20px_rgba(184,115,51,0.3)]">
              <Navigation className="w-8 h-8 text-white animate-pulse-soft" />
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-[#1E293B] mb-4 leading-tight tracking-tight">
              Bắt Đầu <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#B87333] via-[#8C5523] to-[#4A3728]">
                Hành Trình Học Thuật
              </span>
            </h1>
            <p className="text-slate-500 text-lg mb-8 max-w-sm leading-relaxed">
              Tạo tài khoản và tham gia cùng hàng ngàn học viên, giáo viên trong nền tảng học tập tiên tiến nhất.
            </p>

            <ul className="space-y-4">
              {[
                { title: 'Hệ thống báo cáo chuẩn xác', desc: 'Đánh giá năng lực liên tục, chi tiết.' },
                { title: 'Kho học liệu khổng lồ', desc: 'Thư viện bài giảng, bài tập phong phú.' },
                { title: 'Cộng đồng ưu tú', desc: 'Kết nối và trao đổi cùng chuyên gia.' }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/60 transition-colors border border-transparent hover:border-[#E5E7EB]">
                  <div className="mt-1 bg-[#B87333]/10 p-1.5 rounded-full border border-[#B87333]/20 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#B87333]" />
                  </div>
                  <div>
                    <h3 className="text-[#1E293B] font-bold text-sm lg:text-base">{item.title}</h3>
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
            
            <div className="text-center mb-6">
              <Link to="/" className="md:hidden flex items-center gap-1 text-slate-400 mb-4 justify-center text-sm font-medium">
                <ChevronLeft className="w-4 h-4" /> Trở về
              </Link>
              <h2 className="text-3xl font-extrabold text-[#1E293B] mb-2">Đăng ký</h2>
              <p className="text-slate-500 text-sm">Thiết lập hồ sơ học thuật của bạn</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium flex items-center gap-2 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div className="mb-5 flex p-1 bg-[#F8F4EF] border border-[#E5E7EB] rounded-2xl">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  selectedRole === 'student'
                    ? 'bg-white text-[#B87333] shadow-md border border-[#E5E7EB]/50'
                    : 'text-slate-500 hover:text-[#1E293B] hover:bg-white/50'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Học viên
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('teacher')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  selectedRole === 'teacher'
                    ? 'bg-white text-[#0E7490] shadow-md border border-[#E5E7EB]/50'
                    : 'text-slate-500 hover:text-[#1E293B] hover:bg-white/50'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Giảng viên
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E293B] pl-1">Họ và tên</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400 group-focus-within:text-[#B87333] transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#FDFCF8] border-2 border-[#E5E7EB] text-[#1E293B] placeholder-slate-400 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#B87333] focus:ring-4 focus:ring-[#B87333]/10 transition-all font-medium text-sm"
                    placeholder="Nhập họ và tên"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1E293B] pl-1">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-[#B87333] transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#FDFCF8] border-2 border-[#E5E7EB] text-[#1E293B] placeholder-slate-400 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#B87333] focus:ring-4 focus:ring-[#B87333]/10 transition-all font-medium text-sm"
                    placeholder="Nhập địa chỉ email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1E293B] pl-1">Mật khẩu</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-[#B87333] transition-colors" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#FDFCF8] border-2 border-[#E5E7EB] text-[#1E293B] placeholder-slate-400 rounded-xl py-3 pl-9 pr-3 focus:outline-none focus:border-[#B87333] focus:ring-4 focus:ring-[#B87333]/10 transition-all font-medium text-sm"
                      placeholder="Ít nhất 6 ký tự"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1E293B] pl-1">Xác nhận</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-[#B87333] transition-colors" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#FDFCF8] border-2 border-[#E5E7EB] text-[#1E293B] placeholder-slate-400 rounded-xl py-3 pl-9 pr-3 focus:outline-none focus:border-[#B87333] focus:ring-4 focus:ring-[#B87333]/10 transition-all font-medium text-sm"
                      placeholder="Nhập lại"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-[#B87333] to-[#8C5523] text-white rounded-xl py-3.5 font-black text-base transition-all hover:shadow-[0_8px_25px_rgba(184,115,51,0.3)] active:scale-[0.98] mt-2"
              >
                <span className="relative flex justify-center items-center gap-2 group-hover:text-white transition-colors duration-300">
                  {loading ? 'Đang khởi tạo...' : 'Tạo tài khoản'}
                </span>
              </button>
            </form>

            <div className="mt-6 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]"></div>
              </div>
              <span className="relative px-4 text-xs font-bold text-slate-400 uppercase bg-white">Hoặc tiếp tục với</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="mt-5 w-full flex items-center justify-center gap-3 py-3 bg-white text-[#1E293B] font-bold rounded-xl hover:bg-slate-50 border-2 border-[#E5E7EB] hover:border-slate-300 transition-all active:scale-[0.98] text-sm shadow-sm hover:shadow-md"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span>Đăng ký với Google</span>
            </button>

            <p className="mt-6 text-center text-slate-500 text-xs sm:text-sm font-medium">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-bold text-[#B87333] hover:text-[#8C5523] transition-colors">
                Đăng nhập ngay
              </Link>
            </p>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

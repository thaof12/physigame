import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { API_BASE_URL } from '../config/api';
import { GraduationCap, BookOpen, Atom, Mail, Lock, CheckCircle2, ChevronLeft, Rocket, User } from 'lucide-react';

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
          selectedProgram: 'chemistry',
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
    <div className="min-h-screen flex font-sans bg-slate-950 items-center justify-center p-4 sm:p-0">
      
      {/* Container simulating a split screen */}
      <div className="w-full max-w-6xl sm:rounded-3xl sm:border border-slate-800/60 overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* LEFT SIDE: Visuals & Value Proposition */}
        <div className="hidden md:flex flex-col md:w-5/12 lg:w-1/2 relative bg-slate-900 border-r border-slate-800/80 overflow-hidden pt-12 p-10 lg:p-14">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full mix-blend-screen animate-pulse pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
          
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-900/50 to-slate-900 pointer-events-none z-0"></div>

          <Link to="/" className="relative z-10 flex items-center gap-2 mb-10 group w-fit">
            <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors -ml-1" />
            <span className="text-slate-400 font-medium group-hover:text-purple-400 transition-colors">Quay lại trang chủ</span>
          </Link>

          <div className="relative z-10 flex flex-col h-full justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(168,85,247,0.4)]">
              <Rocket className="w-10 h-10 text-white animate-bounce-slow" />
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
              Gia nhập trạm <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-500">
                PhysiGame Space
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-sm leading-relaxed">
              Tạo tài khoản và bắt đầu hành trình trở thành những nhà vật lý hàng đầu vũ trụ ngay hôm nay.
            </p>

            <ul className="space-y-4">
              {[
                { title: 'Tùy chỉnh vai trò', desc: 'Chọn giao diện học sinh hay giáo viên.' },
                { title: 'Theo dõi tiến độ', desc: 'Báo cáo cực kỳ chi tiết chuẩn tương lai.' },
                { title: 'Dữ liệu được mã hóa', desc: 'Mọi thông tin được bảo mật cực điểm.' }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/50">
                  <div className="mt-1 bg-purple-500/20 p-1 rounded-full border border-purple-500/30 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">{item.title}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE: Auth Form */}
        <div className="w-full md:w-7/12 lg:w-1/2 bg-[#020617] flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
          
          <div className="absolute top-1/4 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="w-full max-w-md relative z-10 bg-slate-900/40 p-8 sm:p-8 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl">
            
            <div className="text-center mb-6">
              <Link to="/" className="md:hidden flex items-center gap-1 text-slate-400 mb-4 justify-center text-sm">
                <ChevronLeft className="w-4 h-4" /> Quay lại
              </Link>
              <h2 className="text-3xl font-extrabold text-white mb-2">Đăng ký</h2>
              <p className="text-slate-400 text-sm">Thiết lập tài khoản của bạn</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div className="mb-5 flex p-1 bg-slate-950/50 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  selectedRole === 'student'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Học sinh
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('teacher')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  selectedRole === 'teacher'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Giáo viên
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 pl-1">Họ và tên</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-950/50 border border-slate-800 text-white placeholder-slate-500 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium text-sm"
                    placeholder="Nhập họ và tên"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 pl-1">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-950/50 border border-slate-800 text-white placeholder-slate-500 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium text-sm"
                    placeholder="Nhập địa chỉ email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 pl-1">Mật khẩu</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-950/50 border border-slate-800 text-white placeholder-slate-500 rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium text-sm"
                      placeholder="Ít nhất 6 ký tự"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 pl-1">Xác nhận</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-950/50 border border-slate-800 text-white placeholder-slate-500 rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium text-sm"
                      placeholder="Nhập lại"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-white text-slate-900 rounded-xl py-3.5 font-black text-base transition-transform active:scale-[0.98] mt-2 border border-transparent hover:border-purple-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex justify-center items-center gap-2 group-hover:text-white transition-colors duration-300">
                  {loading ? 'Đang khởi tạo...' : 'Tạo tài khoản'}
                </span>
              </button>
            </form>

            <div className="mt-6 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <span className="relative px-4 text-xs font-semibold text-slate-500 uppercase bg-slate-900/40">Hoặc</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="mt-5 w-full flex items-center justify-center gap-3 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all active:scale-[0.98] text-sm"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span>Đăng ký với Google</span>
            </button>

            <p className="mt-6 text-center text-slate-400 text-xs sm:text-sm">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-bold text-purple-400 hover:text-white transition-colors">
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

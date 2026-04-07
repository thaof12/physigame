import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { API_BASE_URL } from '../config/api';
import { GraduationCap, BookOpen, Atom, Mail, Lock, CheckCircle2, ChevronLeft, Rocket } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, setUser } = useAuth();
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
          role: selectedRole
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token || '');

        if (data.user.role === 'teacher') {
          if (data.user.teacherStatus === 'pending') {
            window.alert('Tài khoản giáo viên đang chờ duyệt.');
            navigate('/teacher/pending');
          } else if (data.user.teacherStatus === 'verified') {
            navigate('/teacher/dashboard');
          } else {
            navigate('/teacher/pending');
          }
        } else {
          if (data.user.programs && data.user.programs.length > 0) {
            const activeProgram = data.user.programs.find(p => p.isActive);
            if (activeProgram) {
              navigate(`/program/${activeProgram.programId}`);
            } else {
              navigate('/');
            }
          } else {
            navigate('/home');
          }
        }
      } else {
        setError(data.message || 'Đăng nhập thất bại');
      }
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
    <div className="min-h-screen flex font-sans bg-slate-950 items-center justify-center p-4 sm:p-0">
      
      {/* Container simulating a split screen but works on all devices */}
      <div className="w-full max-w-6xl sm:rounded-3xl sm:border border-slate-800/60 overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* LEFT SIDE: Visuals & Value Proposition */}
        <div className="hidden md:flex flex-col md:w-5/12 lg:w-1/2 relative bg-slate-900 border-r border-slate-800/80 overflow-hidden pt-12 p-10 lg:p-14">
          
          {/* Animated Background Gradients & Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/20 blur-[100px] rounded-full mix-blend-screen animate-pulse pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
          
          {/* Constellation overlay simulation */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-900/50 to-slate-900 pointer-events-none z-0"></div>

          <Link to="/" className="relative z-10 flex items-center gap-2 mb-16 group w-fit">
            <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors -ml-1" />
            <span className="text-slate-400 font-medium group-hover:text-cyan-400 transition-colors">Quay lại trang chủ</span>
          </Link>

          <div className="relative z-10 flex flex-col h-full justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(6,182,212,0.4)]">
              <Atom className="w-10 h-10 text-white animate-spin-slow" />
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
              Chào mừng đến với <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                PhysiGame
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-10 max-w-sm leading-relaxed">
              Khai mở sức mạnh vũ trụ qua lăng kính Vật lý. Hành trình khám phá không gian học tập tương tác đang chờ đón bạn!
            </p>

            <ul className="space-y-5">
              {[
                { title: 'Trải nghiệm đa giác quan', desc: 'Học qua mô hình 3D và thí nghiệm ảo.' },
                { title: 'Cuộc đua PK kịch tính', desc: 'Thách đấu bạn bè, tranh top xếp hạng.' },
                { title: 'Tích lũy huy hiệu', desc: 'Khám phá thành tựu, thăng hạng năng lực.' }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/50">
                  <div className="mt-1 bg-cyan-500/20 p-1.5 rounded-full border border-cyan-500/30 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">{item.title}</h3>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE: Auth Form */}
        <div className="w-full md:w-7/12 lg:w-1/2 bg-[#020617] flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
          
          <div className="absolute top-1/4 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="w-full max-w-md relative z-10 bg-slate-900/40 p-8 sm:p-10 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl">
            
            <div className="text-center mb-8">
              {/* Mobile Only Back Button */}
              <Link to="/" className="md:hidden flex items-center gap-1 text-slate-400 mb-6 justify-center">
                <ChevronLeft className="w-4 h-4" /> Quay lại
              </Link>

              <h2 className="text-3xl font-extrabold text-white mb-2">Đăng nhập</h2>
              <p className="text-slate-400">Trở lại trạm không gian của bạn 👋</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div className="mb-6 flex p-1 bg-slate-950/50 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
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
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  selectedRole === 'teacher'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Giáo viên
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-300 pl-1">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-950/50 border border-slate-800 text-white placeholder-slate-500 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-medium"
                    placeholder="Nhập địa chỉ email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-300 pl-1">Mật khẩu</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-950/50 border border-slate-800 text-white placeholder-slate-500 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 border-2 border-slate-700 rounded bg-slate-950 group-hover:border-cyan-500 transition-colors">
                    <input type="checkbox" className="peer opacity-0 absolute inset-0 cursor-pointer" />
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Ghi nhớ tôi</span>
                </label>
                <a href="#" className="text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                  Quên mật khẩu?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-white text-slate-900 rounded-2xl py-3.5 font-black text-lg transition-transform active:scale-[0.98] mt-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex justify-center items-center gap-2 group-hover:text-white transition-colors duration-300">
                  {loading ? 'Đang truy cập...' : 'Khởi hành'}
                  {!loading && <Rocket className="w-5 h-5 text-cyan-500 group-hover:text-white transition-colors" />}
                </span>
              </button>
            </form>

            <div className="mt-8 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <span className="relative px-4 text-xs font-semibold text-slate-500 uppercase bg-slate-900/40">Hoặc tiếp tục với</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-3 py-3.5 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all active:scale-[0.98]"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span>Google SSO</span>
            </button>

            <p className="mt-8 text-center text-slate-400 text-sm">
              Chưa có thẻ lên tàu?{' '}
              <Link to="/register" className="font-bold text-cyan-400 hover:text-white transition-colors">
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

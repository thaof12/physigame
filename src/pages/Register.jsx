import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, BookOpen, Mail, Lock, CheckCircle2, ChevronLeft, User, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
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
  const [allowRegistration, setAllowRegistration] = useState(true);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const settings = await response.json();
        if (settings.allowRegistration === false) {
          setAllowRegistration(false);
        }
      } catch (e) {
        console.error('Failed to fetch settings in Register', e);
      }
    };
    fetchSettings();
  }, []);

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
        navigate('/teacher/apply');
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
    <div className="min-h-screen flex font-body bg-gray-100 items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-black/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-black/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute inset-0 graph-grid pointer-events-none z-0 opacity-10"></div>

      {/* Container */}
      <div className="w-full max-w-6xl rounded-[2.5rem] bg-white border border-white/50 overflow-hidden flex flex-col md:flex-row shadow-[0_25px_80px_-15px_rgba(0,0,0,0.1)] relative z-10 transition-all duration-500">
        
        {/* LEFT SIDE: Visuals & Value Proposition */}
        <div className="hidden md:flex flex-col md:w-5/12 lg:w-1/2 relative bg-slate-950 overflow-hidden p-10 lg:p-14 order-2 md:order-1">
          
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-10 -mb-10 blur-2xl"></div>

          <Link to="/" className="relative z-10 flex items-center gap-2 mb-10 group w-fit">
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 group-hover:bg-white/20 transition-all">
              <ChevronLeft className="w-5 h-5 text-white" />
            </div>
            <span className="font-body text-white/80 font-bold group-hover:text-white transition-colors">Về trang chủ</span>
          </Link>

          <div className="relative z-10 flex flex-col h-full justify-center">
            <div className="mb-8">
              <span className="font-premium-serif text-6xl lg:text-7xl font-extrabold text-white italic tracking-tight">Eureka</span>
            </div>

            <h1 className="font-heading text-2xl lg:text-3xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Phát triển bản thân, <br/>
              <span className="text-gray-300">
                tích lũy kiến thức
              </span>
            </h1>

            <div className="space-y-6 mt-6">
              {[
                { title: 'Thí nghiệm vật lý ngay trong trình duyệt.' },
                { title: 'Game vật lý thao tác' },
                { title: 'Đấu trường vật lý' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                   <div className="mt-1 bg-white/10 p-1.5 rounded-lg shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    {item.title && <h3 className="font-heading text-white font-extrabold text-base group-hover:text-gray-300 transition-colors">{item.title}</h3>}
                    {item.desc && <p className="font-body text-white/50 text-sm mt-0.5">{item.desc}</p>}
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
                <span className="font-premium-serif text-3xl font-bold text-slate-900 italic tracking-tight">Eureka</span>
              </div>
              <h2 className="font-heading text-3xl font-extrabold text-slate-900 mb-2">Tạo tài khoản</h2>
              <p className="font-body text-slate-500 font-medium">Thiết lập hồ sơ học thuật của bạn</p>
            </div>

            {!allowRegistration ? (
              <div className="font-body text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
                <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="font-heading text-lg font-extrabold text-slate-800 mb-2">Đăng ký tạm đóng</h3>
                <p className="text-slate-500 font-medium text-sm">Hệ thống đang tạm ngừng tiếp nhận tài khoản mới. Vui lòng quay lại sau.</p>
                <div className="mt-8">
                  <Link to="/" className="text-blue-600 font-bold hover:underline">Quay về Trang chủ</Link>
                </div>
              </div>
            ) : (
              <>

            {error && (
              <div className="font-body mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3 animate-shake">
                <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                {error}
              </div>
            )}

            {/* Role Selection - MANDATORY */}
            <div className="mb-8 space-y-4">
              <label className="font-heading text-xs font-extrabold uppercase tracking-widest text-slate-400 ml-1">Bạn là ai?</label>
              <div className="flex p-1.5 bg-gray-100 border border-slate-200 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`font-heading flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold transition-all duration-300 ${
                    selectedRole === 'student'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-slate-500 hover:text-black'
                  }`}
                >
                  <BookOpen className="w-4 h-4" /> Học viên
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('teacher')}
                  className={`font-heading flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold transition-all duration-300 ${
                    selectedRole === 'teacher'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-slate-500 hover:text-black'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" /> Giảng viên
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="font-heading text-xs font-extrabold text-slate-800 pl-1">Họ và tên</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400 group-focus-within:text-black transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="font-body w-full bg-gray-50 border-2 border-transparent text-black placeholder-slate-400 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all font-bold text-sm"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-heading text-xs font-extrabold text-slate-800 pl-1">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-black transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="font-body w-full bg-gray-50 border-2 border-transparent text-black placeholder-slate-400 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all font-bold text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-heading text-xs font-extrabold text-slate-800 pl-1">Mật khẩu</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-black transition-colors" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="font-body w-full bg-gray-50 border-2 border-transparent text-black placeholder-slate-400 rounded-2xl py-3.5 pl-11 pr-3 focus:outline-none focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all font-bold text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-heading text-xs font-extrabold text-slate-800 pl-1">Xác nhận</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-black transition-colors" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="font-body w-full bg-gray-50 border-2 border-transparent text-black placeholder-slate-400 rounded-2xl py-3.5 pl-11 pr-3 focus:outline-none focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all font-bold text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="font-heading w-full relative group overflow-hidden bg-black text-white rounded-2xl py-4 font-extrabold text-base transition-all hover:-translate-y-0.5 hover:bg-slate-800 active:scale-95 shadow-xl hover:shadow-2xl mt-4"
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
              <div className="font-heading relative flex justify-center text-[10px] uppercase font-extrabold tracking-[0.2em] text-slate-400">
                <span className="bg-white px-4 italic">Kích hoạt SSO</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="font-heading mt-6 w-full flex items-center justify-center gap-4 py-3.5 bg-white text-black font-extrabold rounded-2xl hover:bg-gray-50 border-2 border-slate-200 hover:border-slate-300 transition-all active:scale-[0.98] text-sm shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span>Đăng ký qua Google (Dành cho {selectedRole === 'student' ? 'Học viên' : 'Giảng viên'})</span>
            </button>

            <p className="font-body mt-8 text-center text-slate-500 font-bold text-sm">
              Đã thuộc về Học viện?{' '}
              <Link to="/login" className="text-black hover:text-gray-600 underline underline-offset-4 decoration-2">
                Đăng nhập ngay
              </Link>
            </p>
            </>
            )}
            
          </div>
        </div>
      </div>
       <p className="font-body absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400 text-xs font-bold tracking-widest uppercase opacity-50">
        © 2026 PhysiGame Academy • Membership Portal
      </p>
    </div>
  );
};

export default Register;


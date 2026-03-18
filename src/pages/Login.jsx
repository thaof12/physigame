import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { API_BASE_URL } from '../config/api';
import { GraduationCap, BookOpen } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' or 'teacher'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleGoogleLogin = async () => {
    console.log('🔵 Google login button clicked, role:', selectedRole);
    setLoading(true);
    setError('');
    
    try {
      console.log('🔵 Opening Google Sign-In popup...');
      
      // Đăng nhập với Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log('✅ Google Sign-In successful:', {
        email: user.email,
        uid: user.uid,
        displayName: user.displayName
      });

      // Gửi thông tin đến backend
      console.log('🔵 Sending user data to backend...');
      const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
          displayName: user.displayName,
          avatar: user.photoURL,
          selectedProgram: 'chemistry',
          role: selectedRole // Gửi role đã chọn
        })
      });

      console.log('🔵 Backend response status:', response.status);
      const data = await response.json();
      console.log('🔵 Backend response data:', data);
      
      if (data.success) {
        console.log('✅ Login successful, saving user data...');

        // Cập nhật user trong context và localStorage
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token || '');

        // Kiểm tra role và redirect phù hợp
        if (data.user.role === 'teacher') {
          // Giáo viên
          if (data.user.teacherStatus === 'pending') {
            // Chờ duyệt
            window.alert('Tai khoan giao vien dang cho xet duyet. Vui long doi admin phe duyet truoc khi truy cap.');
            navigate('/teacher/pending');
          } else if (data.user.teacherStatus === 'verified') {
            // Đã được duyệt -> vào Teacher Dashboard
            navigate('/teacher/dashboard');
          } else {
            // Bị từ chối hoặc trạng thái khác
            navigate('/teacher/pending');
          }
        } else {
          // Học sinh - flow cũ
          if (data.user.programs && data.user.programs.length > 0) {
            console.log('✅ User has programs, redirecting to program...');
            const activeProgram = data.user.programs.find(p => p.isActive);
            if (activeProgram) {
              navigate(`/program/${activeProgram.programId}`);
            } else {
              navigate('/');
            }
          } else {
            console.log('✅ No programs, redirecting to program selection...');
            navigate('/home');
          }
        }
      } else {
        console.error('❌ Backend returned error:', data.message);
        setError(data.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      console.error('❌ Google login error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      
      // Hiển thị lỗi chi tiết hơn
      let errorMessage = 'Đăng nhập với Google thất bại';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Bạn đã đóng cửa sổ đăng nhập';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Trình duyệt đã chặn cửa sổ popup. Vui lòng cho phép popup cho trang web này';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Yêu cầu đăng nhập đã bị hủy';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('🔵 Login process finished');
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
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng Nhập</h1>
          <p className="text-gray-600">Chào mừng bạn trở lại!</p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3 text-center">Bạn là:</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                selectedRole === 'student'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Học sinh</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('teacher')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                selectedRole === 'teacher'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span className="font-medium">Giáo viên</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
              Quên mật khẩu?
            </a>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Hoặc</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span className="text-gray-700 font-medium">
              {loading ? 'Đang xử lý...' : 'Đăng nhập với Google'}
            </span>
          </button>
        </div>

        <p className="mt-6 text-center text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
            Đăng ký ngay
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;

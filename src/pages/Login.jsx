import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { API_BASE_URL } from '../config/api';

const Login = () => {
  const navigate = useNavigate();
  const { login, setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
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
    setLoading(true);
    setError('');
    
    try {
      console.log('🔵 Opening Google Sign-In popup...');
      
      // Đăng nhập với Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Gửi thông tin đến backend
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
          selectedProgram: 'chemistry' // Mặc định là Hóa học
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Cập nhật user trong context và localStorage
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token || '');
        
        // Kiểm tra xem user đã có programs chưa
        if (data.user.programs && data.user.programs.length > 0) {
          const activeProgram = data.user.programs.find(p => p.isActive);
          if (activeProgram) {
            navigate(`/program/${activeProgram.programId}`);
          } else {
            navigate('/');
          }
        } else {
          navigate('/program-selection');
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔵 Login attempt:', { email: formData.email });
      const result = await login(formData.email, formData.password);
      console.log('✅ Login successful:', result);
      navigate('/program-selection');
    } catch (err) {
      console.error('❌ Login error:', err);
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

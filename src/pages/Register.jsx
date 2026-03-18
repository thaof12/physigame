import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { API_BASE_URL } from '../config/api';
import { GraduationCap, BookOpen, Building, BookMarked, Users, AlertCircle } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register, setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [selectedRole, setSelectedRole] = useState('student');
  const [teacherInfo, setTeacherInfo] = useState({
    school: '',
    subject: '',
    teachingGrades: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const subjects = [
    'Vật lý',
    'Hóa học',
    'Toán học',
    'Sinh học',
    'Khác'
  ];

  const grades = [6, 7, 8, 9, 10, 11, 12];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleTeacherInfoChange = (e) => {
    setTeacherInfo({
      ...teacherInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleGradeToggle = (grade) => {
    setTeacherInfo(prev => ({
      ...prev,
      teachingGrades: prev.teachingGrades.includes(grade)
        ? prev.teachingGrades.filter(g => g !== grade)
        : [...prev.teachingGrades, grade].sort((a, b) => a - b)
    }));
  };

  const handleGoogleRegister = async () => {
    console.log('🔵 Google register button clicked, role:', selectedRole);
    setLoading(true);
    setError('');

    // Validate teacher info if teacher role selected
    if (selectedRole === 'teacher') {
      if (!teacherInfo.school.trim()) {
        setError('Vui lòng nhập tên trường');
        setLoading(false);
        return;
      }
      if (!teacherInfo.subject) {
        setError('Vui lòng chọn môn giảng dạy');
        setLoading(false);
        return;
      }
      if (teacherInfo.teachingGrades.length === 0) {
        setError('Vui lòng chọn ít nhất một lớp giảng dạy');
        setLoading(false);
        return;
      }
    }

    try {
      console.log('🔵 Opening Google Sign-In popup...');

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log('✅ Google Sign-In successful:', {
        email: user.email,
        uid: user.uid,
        displayName: user.displayName
      });

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
          role: selectedRole,
          teacherInfo: selectedRole === 'teacher' ? teacherInfo : undefined
        })
      });

      console.log('🔵 Backend response status:', response.status);
      const data = await response.json();
      console.log('🔵 Backend response data:', data);

      if (data.success) {
        console.log('✅ Register successful, saving user data...');

        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token || '');

        // Redirect based on role
        if (data.user.role === 'teacher') {
          window.alert('Tai khoan giao vien dang cho xet duyet. Vui long doi admin phe duyet truoc khi truy cap.');
          navigate('/teacher/pending');
        } else {
          navigate('/home');
        }
      } else {
        console.error('❌ Backend returned error:', data.message);
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      console.error('❌ Google register error:', err);

      let errorMessage = 'Đăng ký với Google thất bại';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Bạn đã đóng cửa sổ đăng nhập';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Trình duyệt đã chặn cửa sổ popup. Vui lòng cho phép popup cho trang web này';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Yêu cầu đăng ký đã bị hủy';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('🔵 Register process finished');
    }
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Tên người dùng phải có ít nhất 3 ký tự');
      return false;
    }
    if (selectedRole === 'teacher') {
      if (!teacherInfo.school.trim()) {
        setError('Vui lòng nhập tên trường');
        return false;
      }
      if (!teacherInfo.subject) {
        setError('Vui lòng chọn môn giảng dạy');
        return false;
      }
      if (teacherInfo.teachingGrades.length === 0) {
        setError('Vui lòng chọn ít nhất một lớp giảng dạy');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng Ký</h1>
          <p className="text-gray-600">Tạo tài khoản mới để bắt đầu học tập</p>
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

        {/* Teacher Notice */}
        {selectedRole === 'teacher' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Lưu ý quan trọng</p>
                <p className="text-sm text-amber-700 mt-1">
                  Tài khoản giáo viên cần được Admin xác minh trước khi sử dụng đầy đủ chức năng.
                  Quá trình xác minh thường mất 1-2 ngày làm việc.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Teacher Info Form */}
        {selectedRole === 'teacher' && (
          <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Thông tin giáo viên
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trường đang giảng dạy *
              </label>
              <input
                type="text"
                name="school"
                value={teacherInfo.school}
                onChange={handleTeacherInfoChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="VD: THPT Nguyễn Huệ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <BookMarked className="w-4 h-4 inline mr-1" />
                Môn giảng dạy *
              </label>
              <select
                name="subject"
                value={teacherInfo.subject}
                onChange={handleTeacherInfoChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              >
                <option value="">-- Chọn môn --</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Lớp giảng dạy *
              </label>
              <div className="flex flex-wrap gap-2">
                {grades.map(grade => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => handleGradeToggle(grade)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      teacherInfo.teachingGrades.includes(grade)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Lớp {grade}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Tên người dùng
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Nhập tên của bạn"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-gray-500">Ít nhất 6 ký tự</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              required
              className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
              Tôi đồng ý với{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700">
                Điều khoản sử dụng
              </a>{' '}
              và{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700">
                Chính sách bảo mật
              </a>
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 ${
              selectedRole === 'teacher'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
            }`}
          >
            {loading ? 'Đang đăng ký...' : selectedRole === 'teacher' ? 'Đăng ký Giáo viên' : 'Đăng Ký'}
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
            onClick={handleGoogleRegister}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span className="text-gray-700 font-medium">
              {loading ? 'Đang xử lý...' : 'Đăng ký với Google'}
            </span>
          </button>
        </div>

        <p className="mt-6 text-center text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Đăng nhập ngay
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;

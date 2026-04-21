import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Fingerprint,
  Server,
  Database
} from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/admin/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-3xl"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-2xl shadow-2xl shadow-violet-500/30 mb-6">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400">Hệ thống quản trị PhysiGame</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-2xl">
          {/* Security indicators */}
          <div className="flex items-center justify-center gap-6 mb-8 pb-6 border-b border-slate-800/50">
            <div className="flex items-center gap-2 text-slate-500">
              <Fingerprint className="w-4 h-4" />
              <span className="text-xs">Bảo mật</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Server className="w-4 h-4" />
              <span className="text-xs">SSL</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Database className="w-4 h-4" />
              <span className="text-xs">Encrypted</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
            <p className="text-slate-500 text-xs">
              Chỉ dành cho quản trị viên được ủy quyền
            </p>
          </div>
        </div>

        {/* Back to app link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            Quay lại ứng dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

import { useState } from 'react';
import { useTeacherAuth } from '../contexts/TeacherAuthContext';
import {
  User,
  Mail,
  Building,
  BookOpen,
  Users,
  Save,
  Camera,
  Shield,
  Bell,
  Key,
  CheckCircle
} from 'lucide-react';

const TeacherProfile = () => {
  const { teacher } = useTeacherAuth();
  const [formData, setFormData] = useState({
    displayName: teacher?.displayName || '',
    email: teacher?.email || '',
    school: teacher?.teacherProfile?.school || '',
    subject: teacher?.teacherProfile?.subject || '',
    bio: teacher?.teacherProfile?.bio || '',
    teachingGrades: teacher?.teacherProfile?.teachingGrades || []
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const subjects = ['Vật lý'];
  const grades = [6, 7, 8, 9, 10, 11, 12];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setSaved(false);
  };

  const handleGradeToggle = (grade) => {
    setFormData(prev => ({
      ...prev,
      teachingGrades: prev.teachingGrades.includes(grade)
        ? prev.teachingGrades.filter(g => g !== grade)
        : [...prev.teachingGrades, grade].sort((a, b) => a - b)
    }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    // TODO: API call to update profile
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Hồ sơ cá nhân</h1>
        <p className="text-slate-400 text-sm mt-1">Quản lý thông tin tài khoản giáo viên của bạn</p>
      </div>

      {/* Avatar Section */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {teacher?.displayName?.[0] || 'T'}
              </span>
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center transition-colors">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{teacher?.displayName}</h2>
            <p className="text-slate-400">{teacher?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Giáo viên đã xác minh
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            Thông tin cơ bản
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full bg-slate-800/30 border border-slate-700/30 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">Email không thể thay đổi</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Giới thiệu bản thân
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                placeholder="Viết vài dòng giới thiệu về bạn..."
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-400" />
            Thông tin giảng dạy
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Trường đang giảng dạy
              </label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleChange}
                placeholder="VD: THPT Nguyễn Huệ"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Môn giảng dạy
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="">-- Chọn môn --</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Lớp giảng dạy
              </label>
              <div className="flex flex-wrap gap-2">
                {grades.map(grade => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => handleGradeToggle(grade)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      formData.teachingGrades.includes(grade)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                    }`}
                  >
                    Lớp {grade}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          {saved && (
            <span className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              Đã lưu thay đổi
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-white font-medium transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherProfile;

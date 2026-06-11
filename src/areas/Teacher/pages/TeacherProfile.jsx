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

import api from '../../../config/api';

const TeacherProfile = () => {
  const { teacher, refreshTeacher } = useTeacherAuth();
  const [formData, setFormData] = useState({
    displayName: teacher?.displayName || teacher?.display_name || '',
    email: teacher?.email || '',
    school: teacher?.teacherProfile?.school || teacher?.teacher_profile?.school || '',
    subject: teacher?.teacherProfile?.subject || teacher?.teacher_profile?.subject || '',
    bio: teacher?.teacherProfile?.bio || teacher?.teacher_profile?.bio || '',
    teachingGrades: teacher?.teacherProfile?.teachingGrades || teacher?.teacher_profile?.teachingGrades || []
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
    if (!teacher?.id) return;
    setSaving(true);
    try {
      await api.put(`/users/profile/${teacher.id}`, {
        displayName: formData.displayName,
        school: formData.school,
        subject: formData.subject,
        bio: formData.bio,
        teachingGrades: formData.teachingGrades
      });
      await refreshTeacher();
      setSaved(true);
    } catch (error) {
      console.error('Error updating teacher profile:', error);
      alert('Không thể cập nhật hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">Hồ sơ cá nhân</h1>
        <p className="text-slate-500 font-bold text-sm mt-1">Quản lý thông tin tài khoản giáo viên của bạn</p>
      </div>

      {/* Avatar Section */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <span className="text-3xl font-black text-white">
                {(teacher?.displayName || teacher?.display_name)?.[0] || 'T'}
              </span>
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-800 hover:bg-slate-950 border-2 border-white rounded-xl flex items-center justify-center transition-colors shadow-md">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">{teacher?.displayName || teacher?.display_name}</h2>
            <p className="text-slate-400 font-bold text-sm mt-0.5">{teacher?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Giáo viên đã xác minh
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Thông tin cơ bản
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed font-bold"
              />
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">Email không thể thay đổi</p>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                Giới thiệu bản thân
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                placeholder="Viết vài dòng giới thiệu về bạn..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-600" />
            Thông tin giảng dạy
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                Trường đang giảng dạy
              </label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleChange}
                placeholder="VD: THPT Nguyễn Huệ"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                Môn giảng dạy
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
              >
                <option value="">-- Chọn môn --</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                Lớp giảng dạy
              </label>
              <div className="flex flex-wrap gap-2">
                {grades.map(grade => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => handleGradeToggle(grade)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      formData.teachingGrades.includes(grade)
                        ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-500/15 border border-indigo-600'
                        : 'bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 font-bold'
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
            <span className="flex items-center gap-2 text-emerald-600 font-black text-sm">
              <CheckCircle className="w-4 h-4" />
              Đã lưu thay đổi
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white text-sm font-black rounded-[1.25rem] shadow-xl shadow-indigo-500/20 transition-all uppercase tracking-widest disabled:opacity-50"
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

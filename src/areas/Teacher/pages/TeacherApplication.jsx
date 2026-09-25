import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../config/supabase';
import api from '../../../config/api';
import {
  GraduationCap, Phone, Building, BookOpen, Award,
  Upload, ArrowRight, X, FileText, Lock, ChevronDown, Check,
  User, Sparkles, AlertCircle, Image as ImageIcon, Clock, Mail
} from 'lucide-react';

const DEGREE_OPTIONS = [
  'Cử nhân Sư phạm',
  'Cử nhân chuyên ngành',
  'Thạc sĩ',
  'Tiến sĩ',
  'Chứng chỉ nghiệp vụ sư phạm',
  'Khác'
];

const EXPERIENCE_OPTIONS = [
  'Dưới 1 năm',
  '1–3 năm',
  '3–5 năm',
  '5–10 năm',
  'Trên 10 năm'
];

const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com', '10minutemail.com', 'tempmail.com', 'yopmail.com',
  'guerrillamail.com', 'trashmail.com', 'dispostable.com', 'getnada.com',
  'sharklasers.com', 'throwawaymail.com', 'mailnesia.com', 'maildrop.cc'
];

export const validateTeacherApplication = ({ fullName, email, phone, school, reason }) => {
  // 1. Họ và tên
  const trimmedName = fullName?.trim() || '';
  if (!trimmedName) return 'Vui lòng nhập họ và tên đầy đủ.';
  if (trimmedName.length < 3) return 'Họ và tên phải từ 3 đến 60 ký tự.';
  if (trimmedName.length > 60) return 'Họ và tên không được vượt quá 60 ký tự.';
  if (/^\d+$/.test(trimmedName.replace(/\s/g, ''))) {
    return 'Họ và tên không hợp lệ (không được chứa toàn chữ số). Vui lòng nhập họ và tên thật.';
  }
  if (!/^[a-zA-ZÀ-ỹ\s'.]+$/u.test(trimmedName)) {
    return 'Họ và tên chỉ được chứa chữ cái và khoảng trắng (không chứa số hoặc ký tự đặc biệt).';
  }

  // 2. Email
  const trimmedEmail = email?.trim() || '';
  if (!trimmedEmail) return 'Vui lòng nhập email liên hệ.';
  if (trimmedEmail.length > 100) return 'Email không được vượt quá 100 ký tự.';
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) return 'Định dạng email không hợp lệ (VD: teacher@gmail.com).';
  const domain = trimmedEmail.split('@')[1]?.toLowerCase();
  if (domain && DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return 'Hệ thống không tiếp nhận đăng ký từ địa chỉ email rác/tạm thời.';
  }

  // 3. Số điện thoại
  const cleanPhone = phone?.trim().replace(/\s/g, '') || '';
  if (!cleanPhone) return 'Vui lòng nhập số điện thoại liên hệ.';
  if (cleanPhone.length > 12) return 'Số điện thoại không được vượt quá 12 ký tự.';
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return 'Số điện thoại không hợp lệ. Phải là SĐT Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09 hoặc +84).';
  }
  const subscriberNumber = cleanPhone.replace(/^(0|\+84)/, '');
  if (/^(\d)\1{7,}$/.test(subscriberNumber)) {
    return 'Số điện thoại nghi vấn spam (chứa dãy số lặp lại ngẫu nhiên).';
  }

  // 4. Trường / Nơi công tác
  const trimmedSchool = school?.trim() || '';
  if (!trimmedSchool) return 'Vui lòng nhập trường / nơi công tác.';
  if (trimmedSchool.length < 5) return 'Tên trường/nơi công tác phải từ 5 ký tự trở lên.';
  if (trimmedSchool.length > 120) return 'Tên trường/nơi công tác không vượt quá 120 ký tự.';
  if (/^\d+$/.test(trimmedSchool.replace(/\s/g, ''))) {
    return 'Tên trường/nơi công tác không thể chỉ gồm các con số.';
  }
  if (/(.)\1{4,}/.test(trimmedSchool.replace(/\s/g, ''))) {
    return 'Tên trường/nơi công tác chứa chuỗi ký tự lặp lại bất thường.';
  }

  // 5. Lý do tham gia
  const trimmedReason = reason?.trim() || '';
  if (!trimmedReason || trimmedReason.length < 30) return 'Lý do tham gia cần tối thiểu 30 ký tự.';
  if (trimmedReason.length > 1000) return 'Lý do tham gia không vượt quá 1000 ký tự.';

  return null;
};

const labelClass = `block font-heading text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2`;

// Custom Select Component for ultra-smooth UI
const CustomSelect = ({ label, icon: Icon, options, value, onChange, placeholder = "Chọn..." }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {label && <label className={labelClass}>{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full bg-slate-50 border-2 text-left rounded-2xl py-3.5 ${Icon ? 'pl-11' : 'pl-4'} pr-10
          flex items-center justify-between font-body font-bold text-sm transition-all duration-200
          ${open ? 'bg-white border-indigo-400 ring-4 ring-indigo-500/10 text-slate-900 shadow-md' : 'border-transparent text-slate-800 hover:bg-slate-100/80'}`}
      >
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${open ? 'rotate-180 text-indigo-500' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-56 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = opt === value;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 font-body text-sm font-bold flex items-center justify-between transition-colors ${isSelected
                    ? 'bg-indigo-50 text-indigo-600 font-extrabold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                >
                  <span>{opt}</span>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const getCleanInitialName = (u) => {
  const name = u?.displayName || u?.display_name || '';
  if (name && /^\d+$/.test(name.trim())) return ''; // Clear pure digits
  return name;
};

const TeacherApplication = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    fullName: getCleanInitialName(user),
    email: user?.email && !user.email.includes('@example.com') ? user.email : '',
    phone: '',
    school: '',
    subject: 'Vật lý', // Hardcoded Physics
    experience: '1–3 năm',
    degree: 'Cử nhân Sư phạm',
    reason: ''
  });

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        fullName: prev.fullName || getCleanInitialName(user),
        email: prev.email || (user?.email && !user.email.includes('@example.com') ? user.email : '')
      }));
    }
  }, [user]);

  const [files, setFiles] = useState([]); // array of {file, preview, name}
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      let cleaned = value.replace(/(?!^\+)[^\d]/g, '');
      if (cleaned.startsWith('+')) {
        if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
      } else {
        if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);
      }
      setForm(prev => ({ ...prev, [name]: cleaned }));
      setError('');
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFiles = (selectedFiles) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const valid = Array.from(selectedFiles).filter(f => {
      if (!allowed.includes(f.type)) return false;
      if (f.size > 5 * 1024 * 1024) return false; // max 5MB
      return true;
    });

    const newEntries = valid.map(file => ({
      file,
      name: file.name,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      isPdf: file.type === 'application/pdf'
    }));

    setFiles(prev => {
      const combined = [...prev, ...newEntries].slice(0, 4); // max 4 files
      return combined;
    });
  };

  const removeFile = (index) => {
    setFiles(prev => {
      const copy = [...prev];
      if (copy[index].preview) URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const uploadFilesToSupabase = async (userId) => {
    const uploadedFiles = [];
    if (!files.length) return uploadedFiles;

    for (const entry of files) {
      try {
        const ext = entry.file.name.split('.').pop();
        const filePath = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        // Timeout storage upload after 8s per file so it never hangs
        const uploadPromise = supabase.storage
          .from('teacher-certificates')
          .upload(filePath, entry.file, { upsert: true });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Upload file quá thời hạn (timeout)')), 8000)
        );

        const res = await Promise.race([uploadPromise, timeoutPromise]);

        if (res?.error) {
          console.warn('⚠️ Storage upload warning for', entry.name, res.error.message);
          continue;
        }

        uploadedFiles.push({
          name: entry.name,
          path: filePath,
          type: entry.file.type
        });
      } catch (err) {
        console.warn('⚠️ Exception during file upload:', entry.name, err.message);
      }
    }
    return uploadedFiles;
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 900; // max dimension 900px for lightning-fast payload
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = () => resolve(event.target.result);
    };
    reader.onerror = (error) => reject(error);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErr = validateTeacherApplication(form);
    if (validationErr) return setError(validationErr);

    if (files.length === 0)
      return setError('Vui lòng upload ít nhất 1 file minh chứng (ảnh bằng cấp, thẻ GV...).');
    if (!agreed)
      return setError('Bạn cần đồng ý chia sẻ thông tin để tiếp tục.');

    const userId = user?.id || user?.uid;
    if (!userId) return setError('Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.');

    setSubmitting(true);
    try {
      // 1. Prepare Base64 certificate payload (auto-compressed)
      const certsPayload = await Promise.all(
        files.map(async (f) => ({
          name: f.name,
          type: f.file.type,
          base64: await fileToBase64(f.file)
        }))
      );

      // 2. Submit application via Backend API
      const payload = {
        userId,
        email: form.email.trim() || user?.email || '',
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        school: form.school.trim(),
        subject: 'Vật lý',
        experience: form.experience,
        degree: form.degree,
        reason: form.reason.trim(),
        certificates: certsPayload
      };

      const response = await api.post('/users/teacher-application', payload);

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Lưu hồ sơ không thành công.');
      }

      // 3. Update local user state
      const submittedEmail = form.email.trim() || user?.email;
      const updatedUser = {
        ...user,
        email: submittedEmail && !submittedEmail.includes('@example.com') ? submittedEmail : user?.email,
        displayName: form.fullName.trim(),
        display_name: form.fullName.trim(),
        role: 'teacher',
        teacherStatus: 'pending',
        teacher_status: 'pending',
        teacherProfile: {
          email: submittedEmail,
          phone: form.phone.trim(),
          school: form.school.trim(),
          subject: 'Vật lý',
          experience: form.experience,
          degree: form.degree,
          reason: form.reason.trim(),
          certificates: response.data.user?.teacherProfile?.certificates || certsPayload || []
        }
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (setUser) setUser(updatedUser);

      // 4. Navigate immediately to pending approval page
      navigate('/teacher/pending');
    } catch (err) {
      console.warn('⚠️ Backend API submission failed, attempting direct Supabase fallback:', err.message);

      try {
        // Fallback: try uploading files or direct profile update to Supabase
        const uploadedFiles = await uploadFilesToSupabase(userId);
        const submittedEmail = form.email.trim() || user?.email;

        const fallbackProfile = {
          email: submittedEmail,
          phone: form.phone.trim(),
          school: form.school.trim(),
          subject: 'Vật lý',
          experience: form.experience,
          degree: form.degree,
          reason: form.reason.trim(),
          certificates: uploadedFiles.length > 0 ? uploadedFiles : certsPayload,
          applied_at: new Date().toISOString(),
          agreed_to_share: true
        };

        const sbUpdates = {
          display_name: form.fullName.trim(),
          teacher_profile: fallbackProfile,
          teacher_status: 'pending',
          role: 'teacher',
          updated_at: new Date().toISOString()
        };

        if (submittedEmail && !submittedEmail.includes('@example.com')) {
          sbUpdates.email = submittedEmail;
        }

        const { error: sbErr } = await supabase
          .from('users')
          .update(sbUpdates)
          .eq('id', userId);

        if (sbErr) throw sbErr;

        const updatedUser = {
          ...user,
          email: submittedEmail && !submittedEmail.includes('@example.com') ? submittedEmail : user?.email,
          displayName: form.fullName.trim(),
          display_name: form.fullName.trim(),
          role: 'teacher',
          teacherStatus: 'pending',
          teacher_status: 'pending',
          teacherProfile: fallbackProfile
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (setUser) setUser(updatedUser);

        navigate('/teacher/pending');
      } catch (fallbackErr) {
        console.error('❌ All submit attempts failed:', fallbackErr);
        setError(err.message || 'Gửi hồ sơ thất bại. Vui lòng kiểm tra lại kết nối và thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `w-full bg-slate-50 border-2 border-transparent text-slate-800 placeholder-slate-400
    rounded-2xl py-3.5 px-4 focus:outline-none focus:bg-white focus:border-indigo-400
    focus:ring-4 focus:ring-indigo-500/10 transition-all font-body font-bold text-sm`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 flex items-start justify-center p-4 sm:p-8 py-12 font-body">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl font-extrabold text-slate-900 mb-2">
            Hồ Sơ Đăng Ký Giảng Viên
          </h1>
          <p className="font-body text-slate-500 font-medium text-sm max-w-sm mx-auto leading-relaxed">
            Vui lòng điền đầy đủ thông tin để Quản trị viên có thể xem xét và phê duyệt hồ sơ của bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <p className="text-sm font-bold text-rose-600 flex-1">{error}</p>
              <button type="button" onClick={() => setError('')} className="text-rose-400 hover:text-rose-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* === SECTION 1: Basic Info === */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-50 rounded-xl">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="font-heading text-base font-extrabold text-slate-900">Thông Tin Cá Nhân</h2>
            </div>

            {/* Full Name */}
            <div>
              <label className={labelClass}>Họ và tên đầy đủ *</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                maxLength={60}
                placeholder="Nhập họ và tên của bạn"
                className={inputClass}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email liên hệ *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="teacher@gmail.com"
                  className={`${inputClass} pl-11`}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>Số điện thoại *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={12}
                  placeholder="0901234567 (10 chữ số)"
                  className={`${inputClass} pl-11`}
                  required
                />
              </div>
            </div>

            {/* School */}
            <div>
              <label className={labelClass}>Trường / Nơi công tác *</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="school"
                  value={form.school}
                  onChange={handleChange}
                  maxLength={120}
                  placeholder="VD: THPT Lê Hồng Phong, TP.HCM"
                  className={`${inputClass} pl-11`}
                  required
                />
              </div>
            </div>

            {/* Subject (Hardcoded Physics) + Experience row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Subject - Hardcoded to Physics without default/lock badge */}
              <div>
                <label className={labelClass}>Môn giảng dạy *</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                  <div className="w-full bg-slate-50 border-2 border-transparent text-slate-800 font-body font-bold text-sm rounded-2xl py-3.5 pl-11 pr-4">
                    Vật lý
                  </div>
                </div>
              </div>

              {/* Experience - Custom Dropdown (No Icon) */}
              <div>
                <CustomSelect
                  label="Kinh nghiệm giảng dạy *"
                  options={EXPERIENCE_OPTIONS}
                  value={form.experience}
                  onChange={(val) => setForm(prev => ({ ...prev, experience: val }))}
                />
              </div>
            </div>

            {/* Degree - Custom Dropdown (No Icon) */}
            <div>
              <CustomSelect
                label="Bằng cấp / Chuyên môn *"
                options={DEGREE_OPTIONS}
                value={form.degree}
                onChange={(val) => setForm(prev => ({ ...prev, degree: val }))}
              />
            </div>

            {/* Reason */}
            <div>
              <label className={labelClass}>Lý do muốn tham gia hệ thống *</label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                rows={4}
                placeholder="Chia sẻ về mục tiêu giảng dạy của bạn, kinh nghiệm bạn có, và tại sao bạn muốn đồng hành cùng Eureka..."
                className={`${inputClass} resize-none leading-relaxed`}
                required
              />
              <p className={`text-xs font-body text-slate-400 mt-1.5 ${form.reason.length < 30 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {form.reason.length} ký tự {form.reason.length < 30 ? `(cần ít nhất ${30 - form.reason.length} ký tự nữa)` : '✓'}
              </p>
            </div>
          </div>

          {/* === SECTION 2: File Upload === */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-violet-50 rounded-xl">
                <Upload className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="font-heading text-base font-extrabold text-slate-900">Tài Liệu Minh Chứng *</h2>
                <p className="font-body text-xs text-slate-400 font-medium mt-0.5">Ảnh bằng cấp, thẻ giáo viên, hợp đồng lao động... (tối đa 4 file, mỗi file ≤ 5MB)</p>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragOver
                ? 'border-indigo-400 bg-indigo-50/50'
                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="w-6 h-6 text-slate-400" />
              </div>
              <p className="font-heading font-extrabold text-slate-700 text-sm mb-1">
                Kéo thả file vào đây hoặc click để chọn
              </p>
              <p className="font-body text-xs text-slate-400 font-medium">
                JPG, PNG, WEBP, PDF • Tối đa 5MB/file
              </p>
            </div>

            {/* File Previews */}
            {files.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                {files.map((entry, idx) => (
                  <div
                    key={idx}
                    className="relative group bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden"
                  >
                    {entry.preview ? (
                      <img src={entry.preview} alt={entry.name} className="w-full h-28 object-cover" />
                    ) : (
                      <div className="w-full h-28 flex flex-col items-center justify-center gap-2">
                        <FileText className="w-8 h-8 text-slate-400" />
                        <span className="font-body text-xs text-slate-400 font-bold px-2 text-center truncate w-full">
                          {entry.name}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-2 right-2 w-6 h-6 bg-slate-900/70 hover:bg-rose-600 rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                    <div className="px-3 py-2 truncate">
                      <p className="font-body text-[11px] text-slate-500 font-bold truncate">{entry.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* === SECTION 3: Agreement === */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
            <button
              type="button"
              onClick={() => setAgreed(prev => !prev)}
              className="flex items-start gap-4 w-full text-left group"
            >
              <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${agreed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 group-hover:border-indigo-400'
                }`}>
                {agreed && (
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-heading font-extrabold text-slate-800 text-sm">
                  Tôi đồng ý chia sẻ thông tin cá nhân và tài liệu minh chứng
                </p>
                <p className="font-body text-xs text-slate-400 font-medium mt-1 leading-relaxed">
                  Thông tin của bạn chỉ được sử dụng cho mục đích xác minh tư cách giảng viên bởi Quản trị viên Eureka. Chúng tôi cam kết bảo mật và không chia sẻ dữ liệu cho bên thứ ba.
                </p>
              </div>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !agreed}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700
              text-white rounded-2xl py-4 font-heading font-extrabold text-base transition-all
              hover:-translate-y-0.5 active:scale-[0.98] shadow-xl shadow-indigo-500/30
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative flex justify-center items-center gap-3">
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Đang gửi hồ sơ...
                </>
              ) : (
                <>
                  Gửi Hồ Sơ Đăng Ký
                </>
              )}
            </span>
          </button>

          <p className="text-center font-body text-xs text-slate-400 font-medium pb-4">
            Sau khi gửi, hồ sơ sẽ được xem xét trong vòng <strong>1–3 ngày làm việc</strong>. Bạn sẽ nhận thông báo qua email khi có kết quả.
          </p>
        </form>
      </div>
    </div>
  );
};

export default TeacherApplication;

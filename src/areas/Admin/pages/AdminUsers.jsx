import { useState, useEffect, useRef } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  UserCheck,
  UserX,
  X,
  Clock,
  Building,
  BookOpen,
  RefreshCw,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  Check,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '../../../config/supabase';
import api from '../../../config/api';
import { sendTeacherStatusEmail } from '../../../services/emailService';

const CustomSelect = ({ value, onChange, options, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => String(opt.value) === String(value)) || options[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="font-body w-full bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-xl px-4 py-2.5 text-sm text-[#274dad] font-bold flex items-center justify-between gap-3 focus:outline-none focus:bg-white focus:border-[#2099e9] transition-all cursor-pointer shadow-sm hover:border-[#2099e9]/40"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#2099e9]' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[60] bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden p-1.5 animate-in fade-in zoom-in-95 duration-150 min-w-[170px]">
          <div className="max-h-52 overflow-y-auto overflow-x-hidden space-y-1 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-3.5 py-2.5 rounded-xl font-body font-bold text-sm cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 text-[#2099e9]'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#2099e9]'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#2099e9] shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const roleFilterOptions = [
  { value: 'all', label: 'Tất cả vai trò' },
  { value: 'student', label: 'Học sinh' },
  { value: 'teacher', label: 'Giáo viên' },
  { value: 'admin', label: 'Quản trị viên' }
];

const statusFilterOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
  { value: 'pending', label: 'Chờ xác nhận' }
];

// Mock data for users list
const mockUsers = [
  { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', role: 'student', grade: '10', status: 'active', joinDate: '2025-01-15', lastActive: '2025-03-17', lessonsCompleted: 45, exercisesCompleted: 120 },
  { id: 2, name: 'Trần Thị B', email: 'tranthib@gmail.com', role: 'student', grade: '9', status: 'active', joinDate: '2025-02-20', lastActive: '2025-03-16', lessonsCompleted: 32, exercisesCompleted: 85 },
  { id: 3, name: 'Lê Minh C', email: 'leminhc@gmail.com', role: 'teacher', grade: null, status: 'active', joinDate: '2024-11-10', lastActive: '2025-03-17', lessonsCompleted: 0, exercisesCompleted: 0 },
  { id: 4, name: 'Phạm Hồng D', email: 'phamhongd@gmail.com', role: 'student', grade: '8', status: 'inactive', joinDate: '2025-01-05', lastActive: '2025-02-28', lessonsCompleted: 18, exercisesCompleted: 42 },
  { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@gmail.com', role: 'student', grade: '7', status: 'active', joinDate: '2025-03-01', lastActive: '2025-03-15', lessonsCompleted: 12, exercisesCompleted: 28 },
  { id: 6, name: 'Vũ Thị F', email: 'vuthif@gmail.com', role: 'teacher', grade: null, status: 'active', joinDate: '2024-09-15', lastActive: '2025-03-17', lessonsCompleted: 0, exercisesCompleted: 0 },
  { id: 7, name: 'Đỗ Văn G', email: 'dovang@gmail.com', role: 'student', grade: '10', status: 'active', joinDate: '2024-12-20', lastActive: '2025-03-14', lessonsCompleted: 56, exercisesCompleted: 145 },
  { id: 8, name: 'Bùi Thị H', email: 'buithih@gmail.com', role: 'student', grade: '6', status: 'pending', joinDate: '2025-03-16', lastActive: '2025-03-16', lessonsCompleted: 2, exercisesCompleted: 5 },
];
const PendingTeachersTab = () => {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('pending');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data: usersData, error: usersErr } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'teacher');

      if (usersErr) throw usersErr;

      const formatted = (usersData || []).map(t => ({
        _id: t.id,
        id: t.id,
        username: t.display_name || t.username || 'Giáo viên',
        displayName: t.display_name || t.username || 'Giáo viên',
        email: t.email,
        avatar: t.avatar || null,
        teacherStatus: t.teacher_status || 'pending',
        teacherProfile: {
          school: t.teacher_profile?.school || t.profile?.school || 'Chưa cập nhật',
          subject: t.teacher_profile?.subject || t.profile?.subject || 'Vật lý',
          appliedAt: t.created_at,
          rejectionReason: t.profile?.rejectionReason
        },
        originalData: t
      }));

      setAllTeachers(formatted);
      setPendingTeachers(formatted.filter(t => (t.teacherStatus || '').toLowerCase() === 'pending'));
    } catch (err) {
      console.error('Error fetching real teachers:', err);
      setError('Không thể tải danh sách giáo viên từ database');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (teacherId) => {
    const teacher = allTeachers.find(t => t.id === teacherId);
    setActionLoading(teacherId);
    try {
      console.log('📡 [AdminUsers] Elevating approval through backend API...');
      const response = await api.post(`/users/verify-teacher/${teacherId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Approval failed');
      }

      if (teacher?.email) {
        await sendTeacherStatusEmail(teacher.email, teacher.displayName, 'verified');
      }
      
      await fetchTeachers();
    } catch (err) {
      console.error('Error verifying teacher:', err);
      setError('Lỗi khi duyệt giáo viên');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const teacherId = rejectModal;
    const teacher = allTeachers.find(t => t.id === teacherId);
    
    setActionLoading(teacherId);
    try {
      console.log('📡 [AdminUsers] Elevating rejection through backend API...');
      const response = await api.post(`/users/reject-teacher/${teacherId}`, {
        reason: rejectReason
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Rejection failed');
      }

      if (teacher?.email) {
        await sendTeacherStatusEmail(teacher.email, teacher.displayName, 'rejected', rejectReason);
      }

      setRejectModal(null);
      setRejectReason('');
      await fetchTeachers();
    } catch (err) {
      console.error('Error rejecting teacher:', err);
      setError('Lỗi khi từ chối giáo viên');
    } finally {
      setActionLoading(null);
    }
  };

  const getFilteredTeachers = () => {
    if (teacherFilter === 'pending') return pendingTeachers;
    if (teacherFilter === 'all') return allTeachers;
    return allTeachers.filter(t => t.teacherStatus === teacherFilter);
  };

  const filteredTeachers = getFilteredTeachers();

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setTeacherFilter('pending')}
          className={`bg-white border-2 rounded-[1.5rem] p-5 cursor-pointer transition-all shadow-sm ${
            teacherFilter === 'pending' ? 'border-indigo-400 bg-indigo-50/50 shadow-indigo-100' : 'border-slate-100 hover:border-indigo-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 rounded-xl">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-heading text-2xl font-extrabold text-slate-900">{pendingTeachers.length}</p>
              <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Chờ duyệt</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setTeacherFilter('verified')}
          className={`bg-white border-2 rounded-[1.5rem] p-5 cursor-pointer transition-all shadow-sm ${
            teacherFilter === 'verified' ? 'border-emerald-400 bg-emerald-50/50 shadow-emerald-100' : 'border-slate-100 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-heading text-2xl font-extrabold text-slate-900">
                {allTeachers.filter(t => t.teacherStatus === 'verified').length}
              </p>
              <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Đã duyệt</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setTeacherFilter('rejected')}
          className={`bg-white border-2 rounded-[1.5rem] p-5 cursor-pointer transition-all shadow-sm ${
            teacherFilter === 'rejected' ? 'border-rose-400 bg-rose-50/50 shadow-rose-100' : 'border-slate-100 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 rounded-xl">
              <UserX className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="font-heading text-2xl font-extrabold text-slate-900">
                {allTeachers.filter(t => t.teacherStatus === 'rejected').length}
              </p>
              <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Đã từ chối</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setTeacherFilter('all')}
          className={`bg-white border-2 rounded-[1.5rem] p-5 cursor-pointer transition-all shadow-sm ${
            teacherFilter === 'all' ? 'border-violet-400 bg-violet-50/50 shadow-violet-100' : 'border-slate-100 hover:border-violet-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-100 rounded-xl">
              <GraduationCap className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="font-heading text-2xl font-extrabold text-slate-900">{allTeachers.length}</p>
              <p className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Tổng hồ sơ</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <p className="text-sm font-bold text-rose-600">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-rose-400 hover:text-rose-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Refresh */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base font-extrabold text-slate-900">
          {teacherFilter === 'pending' ? 'Giáo viên chờ duyệt' :
           teacherFilter === 'verified' ? 'Giáo viên đã duyệt' :
           teacherFilter === 'rejected' ? 'Giáo viên bị từ chối' :
           'Tất cả giáo viên'}
        </h3>
        <button
          onClick={fetchTeachers}
          disabled={loading}
          className="font-heading flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all font-extrabold text-sm shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Teachers list */}
      {loading ? (
        <div className="bg-white border border-slate-100 rounded-[2rem] p-16 text-center shadow-sm font-body">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold text-sm">Đang tải dữ liệu...</p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-[2rem] p-16 text-center shadow-sm font-body">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 font-heading font-extrabold">
            {teacherFilter === 'pending' ? 'Không có giáo viên nào đang chờ duyệt' : 'Không có dữ liệu'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher._id}
              className="bg-white border border-slate-100 rounded-[2rem] p-6 hover:border-indigo-200 hover:shadow-md transition-all shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Teacher info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20 overflow-hidden">
                    {teacher.avatar ? (
                      <img src={teacher.avatar} alt={teacher.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-heading text-white font-extrabold text-lg">{(teacher.displayName || teacher.username || 'G')[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-heading font-extrabold text-slate-900">{teacher.displayName || teacher.username}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-heading font-extrabold uppercase tracking-widest ${
                        teacher.teacherStatus === 'pending' ? 'bg-indigo-100 text-indigo-600' :
                        teacher.teacherStatus === 'verified' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-rose-100 text-rose-600'
                      }`}>
                        {teacher.teacherStatus === 'pending' ? 'Chờ duyệt' :
                         teacher.teacherStatus === 'verified' ? 'Đã duyệt' : 'Từ chối'}
                      </span>
                    </div>
                    <div className="font-body flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{teacher.email}</span>
                      {teacher.teacherProfile?.school && (
                        <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" />{teacher.teacherProfile.school}</span>
                      )}
                      {teacher.teacherProfile?.subject && (
                        <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{teacher.teacherProfile.subject}</span>
                      )}
                    </div>
                    <p className="font-body text-xs text-slate-300 mt-1">Đăng ký: {formatDate(teacher.teacherProfile?.appliedAt || teacher.createdAt)}</p>
                  </div>
                </div>

                {/* Actions */}
                {teacher.teacherStatus === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleVerify(teacher._id)}
                      disabled={actionLoading === teacher._id}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {actionLoading === teacher._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Phê duyệt
                    </button>
                    <button
                      onClick={() => setRejectModal(teacher._id)}
                      disabled={actionLoading === teacher._id}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Từ chối
                    </button>
                  </div>
                )}
                {teacher.teacherStatus === 'verified' && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-black text-emerald-600">Đã xác minh</span>
                  </div>
                )}
                {teacher.teacherStatus === 'rejected' && (
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-xl">
                      <XCircle className="w-5 h-5 text-rose-500" />
                      <span className="text-sm font-black text-rose-600">Đã từ chối</span>
                    </div>
                    {teacher.teacherProfile?.rejectionReason && (
                      <p className="text-xs text-slate-400 max-w-xs text-right mt-1">Lý do: {teacher.teacherProfile.rejectionReason}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-[#274dad]/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-[#85e4fb]/20 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-rose-50 rounded-xl">
                <XCircle className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="font-heading text-xl font-extrabold text-[#274dad]">Từ chối giáo viên</h3>
            </div>
            <div className="mb-8 font-body">
              <label className="font-heading block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">
                Lý do từ chối (tùy chọn)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="VD: Thông tin không đầy đủ, cần bổ sung giấy tờ xác minh chuyên môn..."
                className="w-full bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-bold placeholder:text-slate-300 focus:outline-none focus:border-[#2099e9]/50 transition-all resize-none shadow-inner"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="font-heading flex-1 px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-extrabold text-xs uppercase tracking-widest transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectModal}
                className="font-heading flex-1 px-6 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50"
              >
                {actionLoading === rejectModal ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getInitialUsersCache = () => {
  try {
    const cached = localStorage.getItem('physigame_admin_users_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return mockUsers.map(u => ({
    ...u,
    avatar: u.avatar || null,
    teacher_status: u.role === 'teacher' ? 'verified' : null
  }));
};

// ==================== Main AdminUsers Component ====================
const AdminUsers = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState(() => getInitialUsersCache());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    if (showEditModal) {
      setEditFormData({
        id: showEditModal.id,
        name: showEditModal.name || '',
        avatar: showEditModal.avatar || '',
        role: showEditModal.role || 'student',
        status: showEditModal.status || 'active',
        grade: showEditModal.grade || '6',
        email: showEditModal.email || ''
      });
    } else {
      setEditFormData(null);
    }
  }, [showEditModal]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted = data.map(u => {
          // Resolve display status — status field takes priority if explicitly 'inactive'
          let resolvedStatus = u.status || 'active';
          if (u.role === 'teacher') {
            // Explicit inactive check first (both fields)
            if (u.status === 'inactive' || u.teacher_status === 'inactive') resolvedStatus = 'inactive';
            else if (u.teacher_status === 'pending') resolvedStatus = 'pending';
            else if (u.teacher_status === 'rejected') resolvedStatus = 'rejected';
            else if (u.teacher_status === 'verified') resolvedStatus = 'active';
          }
          const userAvatar = u.avatar || u.avatar_url || u.profile?.avatar || u.teacher_profile?.avatar || null;
          return {
            id: u.id,
            name: u.display_name || u.username || 'Người dùng',
            email: u.email,
            avatar: userAvatar,
            role: u.role || 'student',
            teacher_status: u.teacher_status || null,
            grade: u.profile?.grade || u.grade || (u.programs && u.programs[0]?.currentClass) || '?',
            status: resolvedStatus,
            joinDate: u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '—',
            lastActive: u.updated_at ? new Date(u.updated_at).toLocaleDateString('vi-VN') : '—',
            lessonsCompleted: u.profile?.lessonsCompleted || (u.programs && u.programs[0]?.progress?.completedLessons?.length) || 0,
            exercisesCompleted: u.profile?.exercisesCompleted || 0,
            originalData: u
          };
        });

        setUsers(formatted);
        try {
          localStorage.setItem('physigame_admin_users_cache', JSON.stringify(formatted));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error fetching real users from Supabase:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    setActionLoading(userId);
    try {
      // Use backend API (service role) instead of Supabase anon key (blocked by RLS)
      const response = await api.delete(`/users/delete/${userId}`);
      if (response.data.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
      }
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      // Fallback: remove from local UI even if API fails
      setUsers(prev => prev.filter(u => u.id !== userId));
      setShowDeleteConfirm(null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateUser = async (userData) => {
    // Determine teacher_status based on updated role & status
    let resolvedTeacherStatus = userData.teacher_status;
    if (userData.role === 'student') {
      resolvedTeacherStatus = null;
    } else if (userData.role === 'teacher') {
      if (userData.status === 'active') resolvedTeacherStatus = 'verified';
      else if (userData.status === 'pending') resolvedTeacherStatus = 'pending';
      else if (userData.status === 'rejected') resolvedTeacherStatus = 'rejected';
      else if (userData.status === 'inactive') resolvedTeacherStatus = 'inactive';
    }

    const updatedUserObj = {
      ...userData,
      name: userData.name,
      avatar: userData.avatar || null,
      role: userData.role,
      status: userData.status,
      grade: userData.grade || '?',
      teacher_status: resolvedTeacherStatus
    };

    // 1. OPTIMISTIC UPDATE: Update Admin users list & save to localStorage cache
    setUsers(prev => {
      const nextUsers = prev.map(u => (u.id === userData.id || (u.email && u.email === userData.email)) ? { ...u, ...updatedUserObj } : u);
      try {
        localStorage.setItem('physigame_admin_users_cache', JSON.stringify(nextUsers));
      } catch (e) {}
      return nextUsers;
    });

    setShowEditModal(null);
    setActionLoading(null);

    // 2. BroadcastChannel: Send instant message to all open tabs / teacher sessions (1ms latency)
    try {
      const bc = new BroadcastChannel('physigame_admin_actions');
      bc.postMessage({
        type: 'USER_STATUS_UPDATED',
        id: userData.id,
        email: userData.email,
        name: userData.name,
        username: userData.username,
        status: userData.status,
        role: userData.role
      });
      bc.close();
    } catch (e) {}

    // 3. If editing active user session in localStorage, update it directly or kick out if inactive
    const currentUserStr = localStorage.getItem('user');
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        const isMatch = (currentUser.id && String(currentUser.id) === String(userData.id)) ||
                        (currentUser.email && userData.email && currentUser.email.toLowerCase() === userData.email.toLowerCase());
        if (isMatch) {
          if (userData.status === 'inactive') {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          } else {
            const updatedCurrentUser = {
              ...currentUser,
              displayName: userData.name,
              display_name: userData.name,
              avatar_url: userData.avatar,
              avatar: userData.avatar,
              role: userData.role,
              status: userData.status,
              grade: userData.grade,
              teacherStatus: resolvedTeacherStatus,
              teacher_status: resolvedTeacherStatus
            };
            localStorage.setItem('user', JSON.stringify(updatedCurrentUser));
          }
          window.dispatchEvent(new Event('storage'));
        }
      } catch (e) {}
    }

    // 4. Backend API Update (service role — bypasses RLS)
    try {
      let resolvedTeacherStatus2 = resolvedTeacherStatus;
      const response = await api.post('/users/update-status', {
        id: userData.id,
        email: userData.email,
        status: userData.status,
        teacher_status: resolvedTeacherStatus2,
        name: userData.name,
        role: userData.role
      });
      if (response.data.success) {
        console.log('✅ [AdminUsers] Backend update succeeded:', response.data.user);
      } else {
        console.warn('⚠️ [AdminUsers] Backend update returned failure:', response.data);
      }
    } catch (err) {
      console.error('❌ [AdminUsers] Backend API update failed:', err.message);
      // Fallback: try direct Supabase (may fail due to RLS)
      try {
        const updatePayload = {
          display_name: userData.name,
          avatar: userData.avatar || null,
          role: userData.role,
          status: userData.status,
          teacher_status: resolvedTeacherStatus
        };
        if (userData.email) {
          const { error } = await supabase.from('users').update(updatePayload).eq('email', userData.email);
          if (error) console.warn('Supabase fallback also failed:', error.message);
        }
      } catch (fbErr) {
        console.warn('Both update methods failed');
      }
    }
  };

  const handleBatchStatusUpdate = async (status) => {
    if (selectedUsers.length === 0) return;
    setLoading(true);
    try {
      const selectedList = users.filter(u => selectedUsers.includes(u.id));
      const updatedList = users.map(u => selectedUsers.includes(u.id) ? { ...u, status } : u);
      setUsers(updatedList);
      try {
        localStorage.setItem('physigame_admin_users_cache', JSON.stringify(updatedList));
      } catch (e) {}

      // Broadcast each updated user status
      selectedList.forEach(u => {
        try {
          const bc = new BroadcastChannel('physigame_admin_actions');
          bc.postMessage({
            type: 'USER_STATUS_UPDATED',
            id: u.id,
            email: u.email,
            name: u.name,
            status: status
          });
          bc.close();
        } catch (e) {}
      });

      // Use batch API endpoint (service role)
      try {
        const response = await api.post('/users/batch-update-status', {
          userIds: selectedUsers,
          status
        });
        if (response.data.success) {
          console.log('✅ [AdminUsers] Batch update succeeded:', response.data.message);
        } else {
          console.warn('⚠️ Batch update issue:', response.data);
        }
      } catch (apiErr) {
        console.error('❌ Batch API failed, trying Supabase fallback:', apiErr.message);
        // Fallback with Supabase (may be blocked by RLS)
        const teacherEmails = selectedList.filter(u => u.role === 'teacher').map(u => u.email).filter(Boolean);
        const studentEmails = selectedList.filter(u => u.role !== 'teacher').map(u => u.email).filter(Boolean);
        if (teacherEmails.length > 0) {
          await supabase.from('users').update({ status, teacher_status: status === 'active' ? 'verified' : 'inactive' }).in('email', teacherEmails);
        }
        if (studentEmails.length > 0) {
          await supabase.from('users').update({ status }).in('email', studentEmails);
        }
      }

      setSelectedUsers([]);
    } catch (err) {
      console.error('Error during batch status update:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedUsers.length} người dùng đã chọn? Hành động này không thể hoàn tác.`)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .in('id', selectedUsers);

      if (error) throw error;

      await fetchUsers();
      setSelectedUsers([]);
    } catch (err) {
      console.error('Error during batch delete:', err);
      alert('Không thể xóa các tài khoản được chọn.');
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'all' || user.role === filterRole;
    const matchStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher' && u.status === 'active').length,
    active: users.filter(u => u.status === 'active').length
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-[#274dad]">Quản lý người dùng</h1>
          <p className="font-body text-slate-500 font-bold text-sm mt-1">Quản lý học sinh và giáo viên trên hệ thống</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[#e4f2f0] rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('users')}
          className={`font-heading flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-extrabold transition-all ${
            activeTab === 'users' ? 'bg-white text-[#2099e9] shadow-sm' : 'text-slate-400 hover:text-[#2099e9]'
          }`}
        >
          <Users className="w-4 h-4" />
          Người dùng
        </button>
        <button
          onClick={() => setActiveTab('pending-teachers')}
          className={`font-heading flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-extrabold transition-all ${
            activeTab === 'pending-teachers' ? 'bg-white text-[#2099e9] shadow-sm' : 'text-slate-400 hover:text-[#2099e9]'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Duyệt giáo viên
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'pending-teachers' ? (
        <PendingTeachersTab />
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#85e4fb]/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Users className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <p className="font-heading text-2xl font-extrabold text-[#274dad]">{stats.total}</p>
                  <p className="font-heading text-xs font-extrabold text-slate-400">Tổng người dùng</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#85e4fb]/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-50 rounded-xl">
                  <Users className="w-6 h-6 text-violet-500" />
                </div>
                <div>
                  <p className="font-heading text-2xl font-extrabold text-[#274dad]">{stats.students}</p>
                  <p className="font-heading text-xs font-extrabold text-slate-400">Học sinh</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#85e4fb]/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-heading text-2xl font-extrabold text-[#274dad]">{stats.teachers}</p>
                  <p className="font-heading text-xs font-extrabold text-slate-400">Giáo viên</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#85e4fb]/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <UserCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="font-heading text-2xl font-extrabold text-[#274dad]">{stats.active}</p>
                  <p className="font-heading text-xs font-extrabold text-slate-400">Đang hoạt động</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters with CustomSelect */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#85e4fb]/20">
            <div className="flex flex-col sm:flex-row gap-4 font-body items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#274dad] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#2099e9] font-bold transition-all"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <CustomSelect
                  value={filterRole}
                  onChange={setFilterRole}
                  options={roleFilterOptions}
                  className="w-full sm:w-48"
                />
                <CustomSelect
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={statusFilterOptions}
                  className="w-full sm:w-52"
                />
                <button 
                  onClick={fetchUsers}
                  className="p-2.5 bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-xl text-slate-400 hover:text-[#2099e9] hover:bg-white transition-all shrink-0"
                  title="Làm mới"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#e4f2f0]">
                <span className="text-sm font-bold text-slate-400 font-body">Đã chọn {selectedUsers.length} người dùng</span>
                <button 
                  onClick={() => handleBatchStatusUpdate('active')}
                  className="font-heading px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-extrabold hover:bg-emerald-100 transition-colors"
                >
                  KÍCH HOẠT
                </button>
                <button 
                  onClick={() => handleBatchStatusUpdate('inactive')}
                  className="font-heading px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-extrabold hover:bg-blue-100 transition-colors"
                >
                  VÔ HIỆU HÓA
                </button>
                <button 
                  onClick={handleBatchDelete}
                  className="font-heading px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-extrabold hover:bg-rose-100 transition-colors"
                >
                  XÓA
                </button>
              </div>
            )}
          </div>

          {/* Users table */}
          <>
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#85e4fb]/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/60 border-b border-[#e4f2f0]">
                        <th className="w-[4%] px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-slate-300 text-[#2099e9] focus:ring-[#2099e9]/20 transition-all cursor-pointer"
                          />
                        </th>
                        <th className="font-heading w-[24%] px-4 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Người dùng</th>
                        <th className="font-heading w-[17%] px-4 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Vai trò</th>
                        <th className="font-heading w-[17%] px-4 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                        <th className="font-heading w-[16%] px-4 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Tiến độ</th>
                        <th className="font-heading w-[16%] px-4 py-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider whitespace-nowrap">Hoạt động cuối</th>
                        <th className="font-heading w-[6%] px-4 py-4 text-right text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4f2f0]">
                      {paginatedUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                           <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleSelectUser(user.id)}
                              className="w-4 h-4 rounded border-slate-300 text-[#2099e9] focus:ring-[#2099e9]/20 transition-all cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div 
                              onClick={() => setShowUserDetail(user)}
                              className="flex items-center gap-3.5 cursor-pointer group/name"
                            >
                              <div className="w-11 h-11 rounded-full bg-white border border-slate-200/90 shadow-sm flex items-center justify-center overflow-hidden shrink-0 group-hover/name:border-[#2099e9] group-hover/name:shadow-md transition-all">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : user.role === 'teacher' ? (
                                  <GraduationCap className="w-5 h-5 text-slate-900" />
                                ) : (
                                  <span className="font-heading text-slate-900 font-extrabold text-base">
                                    {user.name ? user.name[0].toUpperCase() : 'U'}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-heading text-sm font-extrabold text-[#274dad] group-hover/name:text-[#2099e9] transition-colors">
                                  {user.name}
                                </p>
                                <p className="font-body text-xs font-medium text-slate-400">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`font-heading inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              user.role === 'teacher'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                : user.role === 'admin'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-sky-50 text-sky-700 border border-sky-100'
                            }`}>
                              {user.role === 'teacher' ? (
                                <>
                                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                                  {user.status === 'rejected'
                                    ? 'Giáo viên (Từ chối)'
                                    : user.status === 'pending'
                                    ? 'Giáo viên (Chờ duyệt)'
                                    : 'Giáo viên'}
                                </>
                              ) : user.role === 'admin' ? (
                                <>
                                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                                  Quản trị viên
                                </>
                              ) : (
                                <>
                                  <Users className="w-3.5 h-3.5 text-sky-600" />
                                  Lớp {user.grade || '?'}
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`font-heading inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                              user.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : user.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : user.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {user.status === 'active' ? (
                                <>
                                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                  Hoạt động
                                </>
                              ) : user.status === 'pending' ? (
                                <>
                                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                                  Chờ duyệt
                                </>
                              ) : user.status === 'rejected' ? (
                                <>
                                  <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                                  Từ chối
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                                  Không hoạt động
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {user.role === 'student' ? (
                              <div className="font-body text-xs font-bold text-slate-600">
                                <span>{user.lessonsCompleted || 0} bài học</span>
                                <span className="mx-1 text-slate-300">•</span>
                                <span>{user.exercisesCompleted || 0} bài tập</span>
                              </div>
                            ) : (
                              <span className="font-body text-xs text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="font-body text-xs font-bold text-slate-400">{user.lastActive || '—'}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setShowUserDetail(user)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-[#2099e9] hover:bg-blue-50 transition-all"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowEditModal(user)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                title="Chỉnh sửa"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(user)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-8 py-6 border-t border-[#e4f2f0] bg-slate-50/30">
                    <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} / {filteredUsers.length} người dùng
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2.5 text-slate-400 hover:text-[#2099e9] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`font-heading w-10 h-10 rounded-xl text-xs font-extrabold transition-all ${
                              page === currentPage
                                ? 'bg-[#2099e9] text-white shadow-lg shadow-blue-500/20'
                                : 'text-slate-400 hover:text-[#274dad] hover:bg-[#e4f2f0]'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2.5 text-slate-400 hover:text-[#2099e9] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          </>
        )}

      {/* Horizontal User Detail Modal */}
      {showUserDetail && (
        <div className="fixed inset-0 bg-[#274dad]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl border border-[#85e4fb]/20 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 px-8 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#2099e9]/10 rounded-xl text-[#2099e9]">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-extrabold text-[#274dad]">Chi tiết người dùng</h3>
                  <p className="font-body text-xs font-bold text-slate-400">Thông tin tài khoản và tiến độ học tập</p>
                </div>
              </div>
              <button
                onClick={() => setShowUserDetail(null)}
                className="p-2.5 text-slate-400 hover:text-[#2099e9] hover:bg-white rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Horizontal Two-Column Layout */}
            <div className="p-8 flex flex-col md:flex-row gap-8">
              {/* Left Column: Avatar & Profile Card */}
              <div className="w-full md:w-64 bg-slate-50/70 border border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center shrink-0">
                <div className="w-24 h-24 rounded-full bg-white border-2 border-slate-200 shadow-md flex items-center justify-center overflow-hidden mb-4 shrink-0">
                  {showUserDetail.avatar ? (
                    <img src={showUserDetail.avatar} alt={showUserDetail.name} className="w-full h-full object-cover" />
                  ) : showUserDetail.role === 'teacher' ? (
                    <GraduationCap className="w-10 h-10 text-slate-900" />
                  ) : (
                    <span className="font-heading text-slate-900 font-black text-3xl">
                      {showUserDetail.name ? showUserDetail.name[0].toUpperCase() : 'U'}
                    </span>
                  )}
                </div>

                <h4 className="font-heading text-lg font-extrabold text-[#274dad] mb-1 break-words w-full">
                  {showUserDetail.name}
                </h4>
                <p className="font-body text-xs font-bold text-slate-400 mb-4 break-all w-full">
                  {showUserDetail.email}
                </p>

                <div className="flex flex-col gap-2 w-full items-center">
                  <span className={`font-heading inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                    showUserDetail.role === 'teacher'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : showUserDetail.role === 'admin'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-sky-50 text-sky-700 border border-sky-100'
                  }`}>
                    {showUserDetail.role === 'teacher' ? (
                      <>
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        Giáo viên
                      </>
                    ) : showUserDetail.role === 'admin' ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        Quản trị viên
                      </>
                    ) : (
                      <>
                        <Users className="w-3.5 h-3.5 text-sky-600" />
                        Học sinh Lớp {showUserDetail.grade || '?'}
                      </>
                    )}
                  </span>

                  <span className={`font-heading inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                    showUserDetail.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : showUserDetail.status === 'pending'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : showUserDetail.status === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border border-rose-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {showUserDetail.status === 'active' ? (
                      <>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Hoạt động
                      </>
                    ) : showUserDetail.status === 'pending' ? (
                      <>
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        Chờ duyệt
                      </>
                    ) : showUserDetail.status === 'rejected' ? (
                      <>
                        <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                        Từ chối
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                        Không hoạt động
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Right Column: Detailed Grid Cards */}
              <div className="flex-1 space-y-4 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#e4f2f0]/30 rounded-2xl p-4 border border-[#e4f2f0]">
                    <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Vai trò hệ thống</p>
                    <p className="font-heading font-extrabold text-[#2099e9] text-sm uppercase">
                      {showUserDetail.role === 'teacher' ? (
                        showUserDetail.status === 'rejected'
                          ? 'Giáo viên (Từ chối)'
                          : showUserDetail.status === 'pending'
                          ? 'Giáo viên (Chờ duyệt)'
                          : 'Giáo viên'
                      ) : showUserDetail.role === 'admin' ? 'Quản trị viên' : `Học sinh (Lớp ${showUserDetail.grade || '?'})`}
                    </p>
                  </div>

                  <div className="bg-[#e4f2f0]/30 rounded-2xl p-4 border border-[#e4f2f0]">
                    <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Trạng thái tài khoản</p>
                    <p className={`font-heading font-extrabold text-sm uppercase ${
                      showUserDetail.status === 'active' ? 'text-emerald-500' :
                      showUserDetail.status === 'pending' ? 'text-amber-500' :
                      showUserDetail.status === 'rejected' ? 'text-rose-500' :
                      'text-slate-400'
                    }`}>
                      {showUserDetail.status === 'active' ? 'Hoạt động' :
                       showUserDetail.status === 'pending' ? 'Chờ duyệt' :
                       showUserDetail.status === 'rejected' ? 'Từ chối' :
                       'Không hoạt động'}
                    </p>
                  </div>

                  <div className="bg-[#e4f2f0]/30 rounded-2xl p-4 border border-[#e4f2f0]">
                    <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Ngày tham gia</p>
                    <p className="font-heading font-extrabold text-[#274dad] text-sm">{showUserDetail.joinDate || '—'}</p>
                  </div>

                  <div className="bg-[#e4f2f0]/30 rounded-2xl p-4 border border-[#e4f2f0]">
                    <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Hoạt động cuối</p>
                    <p className="font-heading font-extrabold text-[#274dad] text-sm">{showUserDetail.lastActive || '—'}</p>
                  </div>
                </div>

                {showUserDetail.role === 'student' && (
                  <div className="bg-[#e4f2f0]/30 rounded-2xl p-5 border border-[#e4f2f0]">
                    <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Tiến độ học tập</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
                        <p className="font-heading text-2xl font-extrabold text-[#274dad]">{showUserDetail.lessonsCompleted || 0}</p>
                        <p className="font-body text-xs font-bold text-slate-400">Bài học hoàn thành</p>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
                        <p className="font-heading text-2xl font-extrabold text-[#274dad]">{showUserDetail.exercisesCompleted || 0}</p>
                        <p className="font-body text-xs font-bold text-slate-400">Bài tập hoàn thành</p>
                      </div>
                    </div>
                  </div>
                )}

                {showUserDetail.role === 'teacher' && showUserDetail.teacherProfile && (
                  <div className="bg-[#e4f2f0]/30 rounded-2xl p-5 border border-[#e4f2f0]">
                    <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Hồ sơ giáo viên</p>
                    <div className="grid grid-cols-2 gap-4 font-body text-xs font-bold text-slate-600">
                      <p>Trường: <span className="text-[#274dad]">{showUserDetail.teacherProfile?.school || 'Chưa cập nhật'}</span></p>
                      <p>Môn dạy: <span className="text-[#274dad]">{showUserDetail.teacherProfile?.subject || 'Vật lý'}</span></p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 px-8 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setShowUserDetail(null)}
                className="font-heading px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-extrabold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  const userToEdit = showUserDetail;
                  setShowUserDetail(null);
                  setShowEditModal(userToEdit);
                }}
                className="font-heading px-6 py-3.5 bg-gradient-to-r from-[#2099e9] to-[#85e4fb] text-white rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-md shadow-blue-500/20 hover:brightness-110 transition-all cursor-pointer flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh sửa thông tin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Edit User Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-[#274dad]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl border border-[#85e4fb]/20 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 px-8 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-extrabold text-[#274dad]">Chỉnh sửa thành viên</h3>
                  <p className="font-body text-xs font-bold text-slate-400">Cập nhật thông tin tài khoản và thông số hệ thống</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(null)}
                className="p-2.5 text-slate-400 hover:text-[#2099e9] hover:bg-white rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Horizontal Layout */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateUser(editFormData);
              }}
            >
              <div className="p-8 flex flex-col md:flex-row gap-8">
                {/* Left Column: Live Avatar & Profile Card */}
                <div className="w-full md:w-64 bg-slate-50/70 border border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center shrink-0">
                  <div className="w-24 h-24 rounded-full bg-white border-2 border-slate-200 shadow-md flex items-center justify-center overflow-hidden mb-4 shrink-0 transition-all">
                    {editFormData.avatar ? (
                      <img src={editFormData.avatar} alt={editFormData.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : editFormData.role === 'teacher' ? (
                      <GraduationCap className="w-10 h-10 text-slate-900" />
                    ) : (
                      <span className="font-heading text-slate-900 font-black text-3xl">
                        {editFormData.name ? editFormData.name[0].toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>

                  <h4 className="font-heading text-base font-extrabold text-[#274dad] mb-1 break-words w-full">
                    {editFormData.name || 'Chưa nhập tên'}
                  </h4>
                  <p className="font-body text-xs font-bold text-slate-400 mb-4 break-all w-full">
                    {editFormData.email}
                  </p>

                  <div className="flex flex-col gap-2 w-full items-center">
                    <span className={`font-heading inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      editFormData.role === 'teacher'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        : editFormData.role === 'admin'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-sky-50 text-sky-700 border border-sky-100'
                    }`}>
                      {editFormData.role === 'teacher' ? (
                        <>
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                          Giáo viên
                        </>
                      ) : editFormData.role === 'admin' ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                          Quản trị viên
                        </>
                      ) : (
                        <>
                          <Users className="w-3.5 h-3.5 text-sky-600" />
                          Học sinh Lớp {editFormData.grade || '?'}
                        </>
                      )}
                    </span>

                    <span className={`font-heading inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                      editFormData.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : editFormData.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : editFormData.status === 'rejected'
                        ? 'bg-rose-50 text-rose-700 border border-rose-100'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {editFormData.status === 'active' ? (
                        <>
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                          Hoạt động
                        </>
                      ) : editFormData.status === 'pending' ? (
                        <>
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                          Chờ duyệt
                        </>
                      ) : editFormData.status === 'rejected' ? (
                        <>
                          <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                          Từ chối
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                          Khóa tài khoản
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Right Column: Form Fields */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Họ và tên</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="font-body w-full bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-2xl px-5 py-3.5 text-[#274dad] font-bold focus:outline-none focus:bg-white focus:border-[#2099e9] transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Link ảnh đại diện (URL)</label>
                    <input
                      type="text"
                      value={editFormData.avatar}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, avatar: e.target.value }))}
                      placeholder="https://example.com/avatar.jpg"
                      className="font-body w-full bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-2xl px-5 py-3.5 text-sm text-[#274dad] font-bold focus:outline-none focus:bg-white focus:border-[#2099e9] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Vai trò</label>
                      <CustomSelect
                        value={editFormData.role}
                        onChange={(val) => setEditFormData(prev => {
                          let newStatus = prev.status;
                          if (val !== 'teacher' && prev.status === 'rejected') {
                            newStatus = 'active';
                          }
                          return { ...prev, role: val, status: newStatus };
                        })}
                        options={[
                          { value: 'student', label: 'Học sinh' },
                          { value: 'teacher', label: 'Giáo viên' },
                          { value: 'admin', label: 'Quản trị viên' }
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Trạng thái</label>
                      <CustomSelect
                        value={editFormData.status}
                        onChange={(val) => setEditFormData(prev => ({ ...prev, status: val }))}
                        options={
                          editFormData.role === 'teacher'
                            ? [
                                { value: 'active', label: 'Hoạt động' },
                                { value: 'pending', label: 'Chờ duyệt' },
                                { value: 'rejected', label: 'Từ chối' },
                                { value: 'inactive', label: 'Khóa tài khoản' }
                              ]
                            : [
                                { value: 'active', label: 'Hoạt động' },
                                { value: 'pending', label: 'Chờ duyệt' },
                                { value: 'inactive', label: 'Khóa tài khoản' }
                              ]
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Khối lớp học</label>
                    <CustomSelect
                      value={String(editFormData.grade || '?')}
                      onChange={(val) => setEditFormData(prev => ({ ...prev, grade: val }))}
                      options={[
                        { value: '6', label: 'Lớp 6' },
                        { value: '7', label: 'Lớp 7' },
                        { value: '8', label: 'Lớp 8' },
                        { value: '9', label: 'Lớp 9' },
                        { value: '10', label: 'Lớp 10' },
                        { value: '11', label: 'Lớp 11' },
                        { value: '12', label: 'Lớp 12' },
                        { value: '?', label: 'Khác' }
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 px-8 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="font-heading px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-extrabold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === showEditModal.id}
                  className="font-heading px-8 py-3.5 bg-gradient-to-r from-[#2099e9] to-[#85e4fb] text-white rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-md shadow-blue-500/20 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === showEditModal.id ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-[#274dad]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-[#85e4fb]/20 animate-in zoom-in-95 duration-200">
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-2xl font-extrabold text-[#274dad]">Xác nhận xóa?</h3>
                <p className="font-body text-slate-400 font-bold">Bạn có chắc chắn muốn xóa người dùng <span className="text-[#274dad]">{showDeleteConfirm.name}</span>? Hành động này không thể hoàn tác.</p>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="font-heading flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-extrabold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={() => handleDeleteUser(showDeleteConfirm.id)}
                  disabled={actionLoading === showDeleteConfirm.id}
                  className="font-heading flex-1 py-4 bg-rose-500 text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all disabled:opacity-50"
                >
                  {actionLoading === showDeleteConfirm.id ? 'ĐANG XÓA...' : 'XÓA NGAY'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;



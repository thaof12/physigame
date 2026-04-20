import { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../../config/supabase';
import api from '../../../config/api';
import { sendTeacherStatusEmail } from '../../../services/emailService';

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
    console.log('%c📊 [AdminUsers] Fetching teachers from schema-validated users table...', 'color: #44b5d7; font-weight: bold');
    
    try {
      const { data: usersData, error: usersErr } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'teacher');

      if (usersErr) throw usersErr;

      // Map to consistent format
      const formatted = (usersData || []).map(t => ({
        _id: t.id,
        id: t.id,
        username: t.display_name || t.username || 'Giáo viên',
        displayName: t.display_name || t.username || 'Giáo viên',
        email: t.email,
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
      
      console.log(`✅ [AdminUsers] Loaded ${formatted.length} teachers`);
    } catch (err) {
      console.error('Error fetching teachers:', err);
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
          className={`bg-slate-900/50 backdrop-blur border rounded-xl p-4 cursor-pointer transition-all ${
            teacherFilter === 'pending' ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-800/50 hover:border-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingTeachers.length}</p>
              <p className="text-xs text-slate-400">Chờ duyệt</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setTeacherFilter('verified')}
          className={`bg-slate-900/50 backdrop-blur border rounded-xl p-4 cursor-pointer transition-all ${
            teacherFilter === 'verified' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800/50 hover:border-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-lg">
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {allTeachers.filter(t => t.teacherStatus === 'verified').length}
              </p>
              <p className="text-xs text-slate-400">Đã duyệt</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setTeacherFilter('rejected')}
          className={`bg-slate-900/50 backdrop-blur border rounded-xl p-4 cursor-pointer transition-all ${
            teacherFilter === 'rejected' ? 'border-red-500/50 bg-red-500/5' : 'border-slate-800/50 hover:border-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/20 rounded-lg">
              <UserX className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {allTeachers.filter(t => t.teacherStatus === 'rejected').length}
              </p>
              <p className="text-xs text-slate-400">Đã từ chối</p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setTeacherFilter('all')}
          className={`bg-slate-900/50 backdrop-blur border rounded-xl p-4 cursor-pointer transition-all ${
            teacherFilter === 'all' ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-800/50 hover:border-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-lg">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{allTeachers.length}</p>
              <p className="text-xs text-slate-400">Tổng giáo viên</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {teacherFilter === 'pending' ? 'Giáo viên chờ duyệt' :
           teacherFilter === 'verified' ? 'Giáo viên đã duyệt' :
           teacherFilter === 'rejected' ? 'Giáo viên bị từ chối' :
           'Tất cả giáo viên'}
        </h3>
        <button
          onClick={fetchTeachers}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm">Làm mới</span>
        </button>
      </div>

      {/* Teachers list */}
      {loading ? (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-12 text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải...</p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-12 text-center">
          <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">
            {teacherFilter === 'pending'
              ? 'Không có giáo viên nào đang chờ duyệt'
              : 'Không có dữ liệu'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher._id}
              className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700/50 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Teacher info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-medium">{teacher.displayName || teacher.username}</h4>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                        teacher.teacherStatus === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                        teacher.teacherStatus === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {teacher.teacherStatus === 'pending' ? 'Chờ duyệt' :
                         teacher.teacherStatus === 'verified' ? 'Đã duyệt' : 'Từ chối'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {teacher.email}
                      </span>
                      {teacher.teacherProfile?.school && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          {teacher.teacherProfile.school}
                        </span>
                      )}
                      {teacher.teacherProfile?.subject && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          {teacher.teacherProfile.subject}
                        </span>
                      )}
                      {teacher.teacherProfile?.teachingGrades?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          Lớp {teacher.teacherProfile.teachingGrades.join(', ')}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      Đăng ký: {formatDate(teacher.teacherProfile?.appliedAt || teacher.createdAt)}
                      {teacher.teacherProfile?.verifiedAt && ` • Duyệt: ${formatDate(teacher.teacherProfile.verifiedAt)}`}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {teacher.teacherStatus === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleVerify(teacher._id)}
                      disabled={actionLoading === teacher._id}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {actionLoading === teacher._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Duyệt
                    </button>
                    <button
                      onClick={() => setRejectModal(teacher._id)}
                      disabled={actionLoading === teacher._id}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Từ chối
                    </button>
                  </div>
                )}
                {teacher.teacherStatus === 'verified' && (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Đã xác minh</span>
                  </div>
                )}
                {teacher.teacherStatus === 'rejected' && (
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 text-red-400">
                      <XCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Đã từ chối</span>
                    </div>
                    {teacher.teacherProfile?.rejectionReason && (
                      <p className="text-xs text-slate-500 max-w-xs text-right">
                        Lý do: {teacher.teacherProfile.rejectionReason}
                      </p>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Từ chối giáo viên</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Lý do từ chối (tùy chọn)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="VD: Thông tin không đầy đủ, cần bổ sung giấy tờ..."
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectModal}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {actionLoading === rejectModal ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Main AdminUsers Component ====================
const AdminUsers = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(null);

  const itemsPerPage = 10;

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
    teachers: users.filter(u => u.role === 'teacher').length,
    active: users.filter(u => u.status === 'active').length
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý người dùng</h1>
          <p className="text-slate-400 text-sm mt-1">Quản lý học sinh và giáo viên trên hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Nhập</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Xuất</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white text-sm font-medium hover:from-indigo-500 hover:to-violet-500 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mới</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'users' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Người dùng
        </button>
        <button
          onClick={() => setActiveTab('pending-teachers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'pending-teachers' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
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
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-xs text-slate-400">Tổng người dùng</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.students}</p>
                  <p className="text-xs text-slate-400">Học sinh</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.teachers}</p>
                  <p className="text-xs text-slate-400">Giáo viên</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 rounded-lg">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.active}</p>
                  <p className="text-xs text-slate-400">Đang hoạt động</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="student">Học sinh</option>
                <option value="teacher">Giáo viên</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="pending">Chờ xác nhận</option>
              </select>
            </div>
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-800/50">
                <span className="text-sm text-slate-400">Đã chọn {selectedUsers.length} người dùng</span>
                <button className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors">
                  Kích hoạt
                </button>
                <button className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30 transition-colors">
                  Vô hiệu hóa
                </button>
                <button className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors">
                  Xóa
                </button>
              </div>
            )}
          </div>

          {/* Users table */}
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800/50">
                    <th className="px-4 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500/20"
                      />
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Người dùng</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Vai trò</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Tiến độ</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Hoạt động cuối</th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleSelectUser(user.id)}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500/20"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            user.role === 'teacher'
                              ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                              : 'bg-gradient-to-br from-indigo-500 to-violet-600'
                          }`}>
                            {user.role === 'teacher' ? (
                              <GraduationCap className="w-5 h-5 text-white" />
                            ) : (
                              <span className="text-white font-bold text-sm">{user.name[0]}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                          user.role === 'teacher'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-indigo-500/20 text-indigo-400'
                        }`}>
                          {user.role === 'teacher' ? (
                            <>
                              <GraduationCap className="w-3 h-3" />
                              Giáo viên
                            </>
                          ) : (
                            <>
                              <Users className="w-3 h-3" />
                              Lớp {user.grade}
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : user.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {user.status === 'active' ? (
                            <>
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                              Hoạt động
                            </>
                          ) : user.status === 'pending' ? (
                            <>
                              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                              Chờ xác nhận
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                              Không hoạt động
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {user.role === 'student' ? (
                          <div className="text-xs text-slate-400">
                            <p>{user.lessonsCompleted} bài học</p>
                            <p>{user.exercisesCompleted} bài tập</p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-slate-400">{user.lastActive}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setShowUserDetail(user)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
              <div className="flex items-center justify-between px-4 py-4 border-t border-slate-800/50">
                <p className="text-sm text-slate-400">
                  Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} / {filteredUsers.length} người dùng
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* User Detail Modal */}
      {showUserDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">Chi tiết người dùng</h3>
              <button
                onClick={() => setShowUserDetail(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  showUserDetail.role === 'teacher'
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                    : 'bg-gradient-to-br from-indigo-500 to-violet-600'
                }`}>
                  {showUserDetail.role === 'teacher' ? (
                    <GraduationCap className="w-8 h-8 text-white" />
                  ) : (
                    <span className="text-white font-bold text-xl">{showUserDetail.name[0]}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">{showUserDetail.name}</h4>
                  <p className="text-slate-400">{showUserDetail.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Vai trò</p>
                  <p className="font-medium text-white">
                    {showUserDetail.role === 'teacher' ? 'Giáo viên' : `Học sinh lớp ${showUserDetail.grade}`}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Trạng thái</p>
                  <p className="font-medium text-white">
                    {showUserDetail.status === 'active' ? 'Hoạt động' : showUserDetail.status === 'pending' ? 'Chờ xác nhận' : 'Không hoạt động'}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Ngày tham gia</p>
                  <p className="font-medium text-white">{showUserDetail.joinDate}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Hoạt động cuối</p>
                  <p className="font-medium text-white">{showUserDetail.lastActive}</p>
                </div>
              </div>
              {showUserDetail.role === 'student' && (
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-3">Tiến độ học tập</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-white">{showUserDetail.lessonsCompleted}</p>
                      <p className="text-sm text-slate-400">Bài học hoàn thành</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{showUserDetail.exercisesCompleted}</p>
                      <p className="text-sm text-slate-400">Bài tập hoàn thành</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 p-5 border-t border-slate-800">
              <button className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors">
                Chỉnh sửa
              </button>
              <button
                onClick={() => setShowUserDetail(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

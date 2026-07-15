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

// ==================== Main AdminUsers Component ====================
const AdminUsers = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers((data || []).map(u => {
        let resolvedStatus = u.status || 'active';
        if (u.role === 'teacher') {
          if (u.teacher_status === 'pending') resolvedStatus = 'pending';
          else if (u.teacher_status === 'rejected') resolvedStatus = 'rejected';
          else if (u.teacher_status === 'verified') resolvedStatus = 'active';
        }
        return {
          id: u.id,
          name: u.display_name || u.username || 'Người dùng',
          email: u.email,
          avatar: u.avatar || null,
          role: u.role || 'student',
          teacher_status: u.teacher_status || null,
          grade: u.profile?.grade || u.grade || '?',
          status: resolvedStatus,
          joinDate: new Date(u.created_at).toLocaleDateString('vi-VN'),
          lastActive: u.updated_at ? new Date(u.updated_at).toLocaleDateString('vi-VN') : '—',
          lessonsCompleted: u.profile?.lessonsCompleted || 0,
          exercisesCompleted: u.profile?.exercisesCompleted || 0,
          originalData: u
        };
      }));
    } catch (err) {
      console.error('Error fetching users:', err);
      // Fallback to mock data for demonstration if DB is empty/fails
      setUsers(mockUsers.map(u => ({
        ...u,
        avatar: u.avatar || null,
        teacher_status: u.role === 'teacher' ? 'verified' : null
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== userId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      // Even if DB fails, remove from local state for UI demonstration if it's mock data
      setUsers(prev => prev.filter(u => u.id !== userId));
      setShowDeleteConfirm(null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateUser = async (userData) => {
    setActionLoading(userData.id);
    try {
      const updatePayload = {
        display_name: userData.name,
        role: userData.role
      };

      // Handle teacher_status updates based on edited status/role
      if (userData.role === 'student') {
        updatePayload.teacher_status = null;
      } else if (userData.role === 'teacher') {
        if (userData.status === 'active') {
          updatePayload.teacher_status = 'verified';
        } else if (userData.status === 'pending') {
          updatePayload.teacher_status = 'pending';
        } else if (userData.status === 'rejected') {
          updatePayload.teacher_status = 'rejected';
        }
      }

      const { error } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('id', userData.id);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === userData.id ? { ...u, ...userData, teacher_status: updatePayload.teacher_status || null } : u));
      setShowEditModal(null);
    } catch (err) {
      console.error('Error updating user:', err);
      // Fallback update local state
      setUsers(prev => prev.map(u => u.id === userData.id ? { ...u, ...userData } : u));
      setShowEditModal(null);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBatchStatusUpdate = async (status) => {
    if (selectedUsers.length === 0) return;
    setLoading(true);
    try {
      const selectedList = users.filter(u => selectedUsers.includes(u.id));
      const teacherIds = selectedList.filter(u => u.role === 'teacher').map(u => u.id);
      const studentIds = selectedList.filter(u => u.role !== 'teacher').map(u => u.id);

      if (teacherIds.length > 0) {
        const payload = { status: status === 'active' ? 'active' : 'inactive' };
        if (status === 'active') {
          payload.teacher_status = 'verified';
        } else {
          payload.teacher_status = null; // deactivate teacher
        }

        const { error } = await supabase
          .from('users')
          .update(payload)
          .in('id', teacherIds);

        if (error) throw error;
      }

      if (studentIds.length > 0) {
        const { error } = await supabase
          .from('users')
          .update({ status: status === 'active' ? 'active' : 'inactive' })
          .in('id', studentIds);

        if (error) throw error;
      }

      await fetchUsers();
      setSelectedUsers([]);
    } catch (err) {
      console.error('Error during batch status update:', err);
      alert('Không thể cập nhật trạng thái các tài khoản được chọn.');
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
        <div className="flex items-center gap-3">
          <button className="font-heading flex items-center gap-2 px-4 py-2.5 bg-[#e4f2f0] border border-transparent rounded-xl text-slate-500 hover:text-[#2099e9] transition-all font-extrabold text-sm">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Nhập</span>
          </button>
          <button className="font-heading flex items-center gap-2 px-4 py-2.5 bg-[#e4f2f0] border border-transparent rounded-xl text-slate-500 hover:text-[#2099e9] transition-all font-extrabold text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="font-heading flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#2099e9] to-[#85e4fb] rounded-xl text-white text-sm font-extrabold shadow-lg shadow-blue-500/10 hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>THÊM MỚI</span>
          </button>
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

          {/* Filters */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#85e4fb]/20">
            <div className="flex flex-col lg:flex-row gap-4 font-body">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#274dad] placeholder-slate-400 focus:outline-none focus:border-[#2099e9]/50 font-bold"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-xl px-4 py-2.5 text-sm text-[#274dad] focus:outline-none focus:border-[#2099e9]/50 font-bold"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="student">Học sinh</option>
                <option value="teacher">Giáo viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-xl px-4 py-2.5 text-sm text-[#274dad] focus:outline-none focus:border-[#2099e9]/50 font-bold"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="pending">Chờ xác nhận</option>
              </select>
              <button 
                onClick={fetchUsers}
                className="p-2.5 bg-[#e4f2f0]/30 border border-[#e4f2f0] rounded-xl text-slate-400 hover:text-[#2099e9] transition-colors"
                title="Làm mới"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
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

          {/* Loading state */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
               <div className="w-12 h-12 border-4 border-[#2099e9] border-t-transparent rounded-full animate-spin mb-6"></div>
               <p className="font-heading font-extrabold text-[#274dad]">Đang truy vấn dữ liệu học viên...</p>
            </div>
          )}

          {/* Users table */}
          {!loading && (
            <>
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#85e4fb]/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e4f2f0]">
                        <th className="w-[5%] px-6 py-6 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                            onChange={toggleSelectAll}
                            className="w-5 h-5 rounded-lg border-[#85e4fb] bg-[#e4f2f0]/30 text-[#2099e9] focus:ring-[#2099e9]/20 transition-all cursor-pointer"
                          />
                        </th>
                        <th className="font-heading w-[35%] px-6 py-6 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Người dùng</th>
                        <th className="font-heading w-[15%] px-6 py-6 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Vai trò</th>
                        <th className="font-heading w-[15%] px-6 py-6 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Trạng thái</th>
                        <th className="font-heading w-[15%] px-6 py-6 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Tiến độ</th>
                        <th className="font-heading w-[10%] px-6 py-6 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Hoạt động cuối</th>
                        <th className="font-heading w-[5%] px-6 py-6 text-right text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4f2f0]">
                      {paginatedUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-[#e4f2f0]/20 transition-colors group">
                           <td className="px-6 py-6">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleSelectUser(user.id)}
                              className="w-5 h-5 rounded-lg border-[#85e4fb] bg-[#e4f2f0]/30 text-[#2099e9] focus:ring-[#2099e9]/20 transition-all cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-6">
                            <div 
                              onClick={() => setShowUserDetail(user)}
                              className="flex items-center gap-4 cursor-pointer group/name"
                            >
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10 overflow-hidden shrink-0 ${
                                user.role === 'teacher'
                                  ? 'bg-gradient-to-br from-blue-500 to-orange-600'
                                  : 'bg-gradient-to-br from-[#2099e9] to-[#85e4fb]'
                              }`}>
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : user.role === 'teacher' ? (
                                  <GraduationCap className="w-6 h-6 text-white" />
                                ) : (
                                  <span className="font-heading text-white font-extrabold text-sm">{user.name[0]?.toUpperCase()}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-heading text-sm font-extrabold text-[#274dad] group-hover/name:text-[#2099e9] transition-colors">{user.name}</p>
                                <p className="font-body text-xs font-bold text-slate-400">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <span className={`font-heading inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest ${
                              user.role === 'teacher'
                                ? (user.status === 'rejected'
                                    ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                    : user.status === 'pending'
                                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                    : 'bg-blue-50 text-blue-500')
                                : 'bg-[#e4f2f0] text-[#2099e9]'
                            }`}>
                              {user.role === 'teacher' ? (
                                <>
                                  <GraduationCap className="w-3.5 h-3.5" />
                                  {user.status === 'rejected'
                                    ? 'Giáo viên (Từ chối)'
                                    : user.status === 'pending'
                                    ? 'Giáo viên (Chờ duyệt)'
                                    : 'Giáo viên'}
                                </>
                              ) : (
                                <>
                                  <Users className="w-3.5 h-3.5" />
                                  Lớp {user.grade}
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <span className={`font-heading inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest ${
                              user.status === 'active'
                                ? 'bg-emerald-50 text-emerald-500'
                                : user.status === 'pending'
                                ? 'bg-blue-50 text-blue-500'
                                : user.status === 'rejected'
                                ? 'bg-rose-50 text-rose-500'
                                : 'bg-slate-50 text-slate-400'
                            }`}>
                              {user.status === 'active' ? (
                                <>
                                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                  Hoạt động
                                </>
                              ) : user.status === 'pending' ? (
                                <>
                                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
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
                          <td className="px-6 py-6">
                            {user.role === 'student' ? (
                              <div className="font-body text-xs font-bold text-slate-400">
                                <p>{user.lessonsCompleted} BÀI HỌC</p>
                                <p>{user.exercisesCompleted} BÀI TẬP</p>
                              </div>
                            ) : (
                              <span className="font-body text-xs text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-6 py-6">
                            <span className="font-body text-xs font-bold text-slate-400 uppercase">{user.lastActive}</span>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => setShowUserDetail(user)}
                                className="p-2.5 text-slate-400 hover:text-[#2099e9] hover:bg-[#e4f2f0] rounded-xl transition-all shadow-sm"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setShowEditModal(user)}
                                className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all shadow-sm"
                                title="Chỉnh sửa"
                              >
                                <Edit3 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(user)}
                                className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm"
                                title="Xóa"
                              >
                                <Trash2 className="w-5 h-5" />
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
          )}
      </>
    )}

      {/* User Detail Modal */}
      {showUserDetail && (
        <div className="fixed inset-0 bg-[#274dad]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-[#85e4fb]/20">
            <div className="flex items-center justify-between p-8 border-b border-[#e4f2f0]">
              <h3 className="font-heading text-xl font-extrabold text-[#274dad]">Chi tiết người dùng</h3>
              <button
                onClick={() => setShowUserDetail(null)}
                className="p-2.5 text-slate-400 hover:text-[#2099e9] hover:bg-[#e4f2f0] rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg text-white font-black text-2xl overflow-hidden shrink-0 ${
                  showUserDetail.role === 'teacher'
                    ? 'bg-gradient-to-br from-blue-500 to-orange-600'
                    : 'bg-gradient-to-br from-[#2099e9] to-[#85e4fb]'
                }`}>
                  {showUserDetail.avatar ? (
                    <img src={showUserDetail.avatar} alt={showUserDetail.name} className="w-full h-full object-cover" />
                  ) : showUserDetail.role === 'teacher' ? (
                    <GraduationCap className="w-10 h-10" />
                  ) : (
                    <span className="font-heading text-white font-extrabold text-2xl">{showUserDetail.name[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-heading text-2xl font-extrabold text-[#274dad]">{showUserDetail.name}</h4>
                  <p className="font-body text-slate-400 font-bold">{showUserDetail.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#e4f2f0]/30 rounded-2xl p-5 border border-[#e4f2f0]">
                  <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Vai trò</p>
                  <p className="font-heading font-extrabold text-[#2099e9] text-sm uppercase">
                    {showUserDetail.role === 'teacher' ? (
                      showUserDetail.status === 'rejected'
                        ? 'Giáo viên (Từ chối)'
                        : showUserDetail.status === 'pending'
                        ? 'Giáo viên (Chờ duyệt)'
                        : 'Giáo viên'
                    ) : `Học sinh lớp ${showUserDetail.grade}`}
                  </p>
                </div>
                <div className="bg-[#e4f2f0]/30 rounded-2xl p-5 border border-[#e4f2f0]">
                  <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Trạng thái</p>
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
                <div className="bg-[#e4f2f0]/30 rounded-2xl p-5 border border-[#e4f2f0]">
                  <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Ngày tham gia</p>
                  <p className="font-heading font-extrabold text-[#274dad] text-sm">{showUserDetail.joinDate}</p>
                </div>
                <div className="bg-[#e4f2f0]/30 rounded-2xl p-5 border border-[#e4f2f0]">
                  <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Hoạt động cuối</p>
                  <p className="font-heading font-extrabold text-[#274dad] text-sm">{showUserDetail.lastActive}</p>
                </div>
              </div>
              {showUserDetail.role === 'student' && (
                <div className="bg-[#e4f2f0]/30 rounded-2xl p-6 border border-[#e4f2f0]">
                  <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Tiến độ học tập</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="font-heading text-3xl font-extrabold text-[#274dad]">{showUserDetail.lessonsCompleted}</p>
                      <p className="font-body text-xs font-bold text-slate-400">Bài học hoàn thành</p>
                    </div>
                    <div>
                      <p className="font-heading text-3xl font-extrabold text-[#274dad]">{showUserDetail.exercisesCompleted}</p>
                      <p className="font-body text-xs font-bold text-slate-400">Bài tập hoàn thành</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 p-8 border-t border-[#e4f2f0] bg-slate-50/50">
              <button className="font-heading flex-1 py-4 bg-gradient-to-r from-[#2099e9] to-[#85e4fb] text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/10 hover:brightness-110 transition-all">
                Chỉnh sửa
              </button>
              <button
                onClick={() => setShowUserDetail(null)}
                className="font-heading flex-1 py-4 bg-white border border-[#e4f2f0] text-slate-500 rounded-2xl font-extrabold text-xs uppercase tracking-widest hover:bg-[#e4f2f0]/30 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#274dad]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-[#85e4fb]/20">
            <div className="p-8 bg-gradient-to-br from-indigo-500 to-[#274dad] text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading text-2xl font-extrabold">Chỉnh sửa thành viên</h3>
                <button onClick={() => setShowEditModal(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="font-body font-bold opacity-80">Cập nhật thông tin cho {showEditModal.name}</p>
            </div>
            
            <form className="p-8 space-y-6" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleUpdateUser({
                ...showEditModal,
                name: formData.get('name'),
                role: formData.get('role'),
                status: formData.get('status'),
                grade: formData.get('grade')
              });
            }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Họ và tên</label>
                  <input 
                    name="name"
                    defaultValue={showEditModal.name}
                    className="font-body w-full bg-[#e4f2f0]/50 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-bold focus:outline-none focus:border-[#2099e9] transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Vai trò</label>
                    <select 
                      name="role"
                      defaultValue={showEditModal.role}
                      className="font-body w-full bg-[#e4f2f0]/50 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-bold focus:outline-none focus:border-[#2099e9] transition-all"
                    >
                      <option value="student">Học sinh</option>
                      <option value="teacher">Giáo viên</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Trạng thái</label>
                    <select 
                      name="status"
                      defaultValue={showEditModal.status}
                      className="font-body w-full bg-[#e4f2f0]/50 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-bold focus:outline-none focus:border-[#2099e9] transition-all"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="pending">Chờ duyệt</option>
                      {showEditModal.role === 'teacher' && (
                        <option value="rejected">Từ chối</option>
                      )}
                      <option value="inactive">Khóa</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-heading text-xs font-extrabold text-slate-400 uppercase tracking-widest">Lớp học</label>
                  <select 
                    name="grade"
                    defaultValue={showEditModal.grade}
                    className="font-body w-full bg-[#e4f2f0]/50 border border-[#e4f2f0] rounded-2xl px-5 py-4 text-[#274dad] font-bold focus:outline-none focus:border-[#2099e9] transition-all"
                  >
                    {[6, 7, 8, 9, 10, 11, 12].map(g => (
                      <option key={g} value={g}>Lớp {g}</option>
                    ))}
                    <option value="?">Khác</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="font-heading flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-extrabold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading === showEditModal.id}
                  className="font-heading flex-[2] py-4 bg-gradient-to-r from-[#2099e9] to-[#85e4fb] text-white rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {actionLoading === showEditModal.id ? 'ĐANG CẬP NHẬT...' : 'LƯU THAY ĐỔI'}
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



/**
 * Send an email notification to a teacher regarding their account status
 * (verified, rejected, pending, inactive/banned, deleted)
 * Embedded with official Eureka logo via backend CID attachment
 */
export const sendTeacherStatusEmail = async (to, teacherName, status, rejectionReason = '') => {
  let subject = `[Eureka Physics] Thông báo về tài khoản của bạn`;
  if (status === 'verified') {
    subject = `[Eureka Physics] Chúc mừng! Hồ sơ Giảng viên của bạn đã được phê duyệt`;
  } else if (status === 'rejected') {
    subject = `[Eureka Physics] Thông báo kết quả xét duyệt hồ sơ giảng viên - ${teacherName || 'Ứng viên'}`;
  } else if (status === 'pending') {
    subject = `[Eureka Physics] Xác nhận tiếp nhận hồ sơ đăng ký giảng viên - ${teacherName || 'Ứng viên'}`;
  } else if (status === 'inactive' || status === 'banned') {
    subject = `[Eureka Physics] Thông báo tạm khóa tài khoản giảng viên - ${teacherName || 'Quý Thầy/Cô'}`;
  } else if (status === 'deleted') {
    subject = `[Eureka Physics] Thông báo về việc xóa tài khoản - ${teacherName || 'Người dùng'}`;
  }

  try {
    console.log(`📡 [emailService] Routing ${status} email request through backend for ${to}...`);
    const response = await fetch('/api/email/send-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        teacherName,
        status,
        rejectionReason,
        subject
      })
    });

    if (response.ok) {
      console.log(`✅ [emailService] Status email (${status}) sent successfully to ${to}`);
      return { success: true };
    } else {
      const errorData = await response.json();
      console.warn('⚠️ [emailService] Backend Email failed:', errorData);
      return { success: false, error: errorData };
    }
  } catch (error) {
    console.warn('❌ [emailService] Could not reach email backend:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a custom feedback email message directly to a teacher applicant
 * Features official Eureka logo and direct admin message
 */
export const sendCustomFeedbackEmail = async (to, teacherName, message) => {
  try {
    const response = await fetch('/api/email/send-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        teacherName,
        message
      })
    });

    const data = await response.json();
    if (response.ok && data.success) {
      console.log(`✅ [emailService] Feedback email sent to ${to}`);
      return { success: true, message: data.message };
    } else {
      console.warn('⚠️ [emailService] Feedback email failed:', data);
      return { success: false, error: data.message || 'Lỗi gửi email' };
    }
  } catch (error) {
    console.error('❌ [emailService] Send feedback exception:', error);
    return { success: false, error: error.message };
  }
};

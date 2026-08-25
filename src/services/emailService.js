const BACKEND_API_URL = 'http://localhost:5002/api/email/send-status';

/**
 * Send an email notification to a teacher regarding their account status
 * NOW ROUTED THROUGH BACKEND TO AVOID CORS
 */
export const sendTeacherStatusEmail = async (to, teacherName, status, rejectionReason = '') => {
  const isApproved = status === 'verified';
  const subject = isApproved
    ? 'Chúc mừng! Tài khoản Giảng viên của bạn đã được xác duyệt'
    : 'Thông báo về yêu cầu đăng ký Giảng viên của bạn';

  // [UI logic for htmlContent as before...]
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #3b82f6;">
        <div style="display: inline-block; text-align: center; vertical-align: middle;">
          <span style="font-family: 'Dancing Script', 'Great Vibes', 'Brush Script MT', 'Lucida Calligraphy', cursive; font-size: 44px; font-weight: 700; font-style: italic; color: #101828; line-height: 1; vertical-align: middle;">Eureka</span>
        </div>
      </div>
      <p>Xin chào <strong>${teacherName}</strong>,</p>
      <p>Chúng tôi cập nhật về trạng thái hồ sơ giảng viên của bạn trên PhysiGame.</p>
      <div style="padding: 20px; background-color: ${isApproved ? '#e4f2f0' : '#fff1f2'}; border-radius: 15px; margin: 25px 0; text-align: center;">
        <p style="font-weight: bold; color: ${isApproved ? '#2099e9' : '#e11d48'}; font-size: 18px;">
          Trạng thái: ${isApproved ? 'ĐÃ ĐƯỢC CHẤP THUẬN' : 'CHƯA ĐƯỢC CHẤP THUẬN'}
        </p>
      </div>
      ${!isApproved && rejectionReason ? `<p>Lý do: <em>${rejectionReason}</em></p>` : ''}
      <p>${isApproved ? 'Bạn đã có thể đăng nhập.' : 'Vui lòng cập nhật lại thông tin.'}</p>
    </div>
  `;

  try {
    console.log('📡 [emailService] Routing email request through backend...');
    const response = await fetch('/api/email/send-status', { // Relative path works if proxied, or use full URL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        teacherName,
        status,
        rejectionReason,
        subject,
        htmlContent
      })
    });

    if (response.ok) {
      console.log(`✅ [Frontend Sync] Email sent via backend to ${to}`);
      return { success: true };
    } else {
      const errorData = await response.json();
      console.warn('⚠️ [Frontend Sync] Backend Email failed:', errorData);
      return { success: false, error: errorData };
    }
  } catch (error) {
    console.warn('❌ [Frontend Sync] Could not reach email backend- proxying might be required');
    return { success: false, error: error.message };
  }
};

/**
 * Send a custom feedback email message directly to a teacher applicant
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

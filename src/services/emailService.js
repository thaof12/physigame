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
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4f2f0; border-radius: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #274dad; margin-bottom: 10px;">Eureka Physics</h1>
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

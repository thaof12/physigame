const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const GMAIL_USER = process.env.GMAIL_USER || 'phandangnhatminh0908@gmail.com';
const GMAIL_PASS = process.env.GMAIL_PASS || 'qhybiykbgnrwcocd';

// Create Nodemailer Transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS
  }
});

/**
 * Universal Email Sender Helper via Gmail SMTP
 * Includes both HTML and plain-text (text) fallback to guarantee inbox deliverability and prevent Spam classification.
 */
async function sendViaGmail({ to, subject, htmlContent, textContent, teacherName }) {
  const targetEmail = Array.isArray(to) ? to[0] : to;

  // Fallback plain text version if none provided (Crucial to bypass Gmail Spam Filters)
  const plainText = textContent || `Kính gửi thầy/cô ${teacherName || 'Ứng viên'},\n\nBan quản trị hệ thống Eureka Physics xin gửi lời phản hồi trực tiếp tới thầy/cô về đơn đăng ký làm Giảng viên.\n\nTrân trọng,\nBan Quản Trị Eureka Physics`;

  const mailOptions = {
    from: `"Eureka Physics" <${GMAIL_USER}>`,
    to: targetEmail,
    subject: subject,
    text: plainText,
    html: htmlContent
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ [Gmail SMTP] Real email delivered to ${targetEmail}. MessageId: ${info.messageId}`);
  return {
    success: true,
    message: `Đã gửi email thành công tới ${targetEmail}!`,
    messageId: info.messageId
  };
}

/**
 * Endpoint to send status update emails to teachers
 * POST /api/email/send-status
 */
router.post('/send-status', async (req, res) => {
  try {
    const { to, teacherName, status, rejectionReason, htmlContent, subject, textContent } = req.body;

    if (!to) {
      return res.status(400).json({ success: false, message: 'Thiếu email người nhận' });
    }

    console.log(`📧 [Backend Email] Sending status mail via Gmail SMTP to: ${to} (Status: ${status})`);

    const defaultSubject = subject || (status === 'verified'
      ? 'Chúc mừng! Tài khoản Giảng viên của bạn đã được xác duyệt'
      : 'Thông báo về yêu cầu đăng ký Giảng viên của bạn');

    const result = await sendViaGmail({ to, subject: defaultSubject, htmlContent, textContent, teacherName });
    res.json(result);
  } catch (error) {
    console.error('❌ [Backend Email] Gmail SMTP Status Error:', error.message || error);

    res.status(500).json({
      success: false,
      message: 'Gửi email thất bại: ' + (error.message || 'Lỗi không xác định'),
      error: error.message
    });
  }
});

/**
 * Endpoint to send custom feedback emails to teacher applicants
 * POST /api/email/send-feedback
 */
router.post('/send-feedback', async (req, res) => {
  try {
    const { to, teacherName, message, subject, htmlContent, textContent } = req.body;

    if (!to || (!message && !htmlContent)) {
      return res.status(400).json({ success: false, message: 'Thiếu email người nhận hoặc nội dung phản hồi' });
    }

    console.log(`📧 [Backend Email] Sending custom feedback mail via Gmail SMTP to: ${to}`);

    const defaultSubject = subject || `[Eureka Physics] Phản hồi về hồ sơ đăng ký giảng viên của ${teacherName || 'bạn'}`;

    const defaultHtml = htmlContent || `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #3b82f6;">
          <div style="display: inline-block; text-align: center; vertical-align: middle;">
            <span style="font-family: 'Dancing Script', 'Great Vibes', 'Brush Script MT', 'Lucida Calligraphy', cursive; font-size: 44px; font-weight: 700; font-style: italic; color: #101828; line-height: 1; vertical-align: middle;">Eureka</span>
          </div>
          <p style="color: #64748b; margin-top: 8px; margin-bottom: 0; font-size: 14px; font-weight: 500; font-family: 'Segoe UI', Arial, sans-serif;">Thông báo phản hồi từ Ban Quản Trị</p>
        </div>
        <div style="padding: 24px 0;">
          <p style="font-size: 16px; color: #1e293b;">Kính gửi thầy/cô <strong>${teacherName || 'Ứng viên'}</strong>,</p>
          <p style="font-size: 15px; color: #334155; line-height: 1.6;">Ban quản trị hệ thống Eureka Physics xin gửi lời phản hồi trực tiếp tới thầy/cô về đơn đăng ký làm Giảng viên:</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 15px; color: #0f172a; white-space: pre-wrap; font-style: italic; line-height: 1.6;">"${message || ''}"</p>
          </div>

          <p style="font-size: 14px; color: #475569;">Nếu thầy/cô có thắc mắc hoặc cần hỗ trợ bổ sung thông tin, vui lòng phản hồi lại email này.</p>
        </div>
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0;">Trân trọng,<br><strong style="color: #1e293b;">Ban Quản Trị Eureka Physics</strong></p>
        </div>
      </div>
    `;

    const defaultText = textContent || `Kính gửi thầy/cô ${teacherName || 'Ứng viên'},\n\nBan quản trị hệ thống Eureka Physics xin gửi lời phản hồi trực tiếp tới thầy/cô về đơn đăng ký làm Giảng viên:\n\n"${message || ''}"\n\nNếu thầy/cô có thắc mắc hoặc cần hỗ trợ bổ sung thông tin, vui lòng phản hồi lại email này.\n\nTrân trọng,\nBan Quản Trị Eureka Physics`;

    const result = await sendViaGmail({ to, subject: defaultSubject, htmlContent: defaultHtml, textContent: defaultText, teacherName });
    res.json(result);
  } catch (error) {
    console.error('❌ [Backend Email] Gmail SMTP Feedback Error:', error.message || error);

    res.status(500).json({
      success: false,
      message: 'Gửi email phản hồi thất bại: ' + (error.message || 'Lỗi không xác định'),
      error: error.message
    });
  }
});

module.exports = router;

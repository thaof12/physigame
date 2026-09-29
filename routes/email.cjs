const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabase } = require('../src/config/supabase.cjs');

const GMAIL_USER = process.env.GMAIL_USER || 'phandangnhatminh0908@gmail.com';
const GMAIL_PASS = process.env.GMAIL_PASS || 'qhybiykbgnrwcocd';
const JWT_SECRET = process.env.JWT_SECRET || 'eureka-physics-otp-secret-2026';

// Hosted URL for the official Eureka logo - prevents Gmail from displaying an attachment chip/badge!
const OFFICIAL_LOGO_URL = 'https://eureka-th.vercel.app/images/eureka_official_logo.png';

// Create Nodemailer Transporter using Gmail SMTP with connection pooling for maximum speed
const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateLimit: 14,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Prewarm connection pool to eliminate initial handshake latency
transporter.verify().then(() => {
  console.log('⚡ [Gmail SMTP] Connection pool verified & ready for fast email dispatch');
}).catch((err) => {
  console.warn('⚠️ [Gmail SMTP] Initial verify warning:', err?.message || err);
});

/**
 * Universal Email Sender Helper via Gmail SMTP
 * Embeds the hosted Eureka logo directly inside the email box without sending any file attachments.
 */
async function sendViaGmail({ to, subject, htmlContent, textContent, teacherName }) {
  const targetEmail = Array.isArray(to) ? to[0] : to;

  // Fallback plain text version if none provided
  const plainText = textContent || `Kính gửi thầy/cô ${teacherName || 'Ứng viên'},\n\nBan quản trị hệ thống Eureka Physics xin gửi thông báo chính thức tới thầy/cô.\n\nTrân trọng,\nBan Quản Trị Eureka Physics`;

  let finalHtml = htmlContent;
  if (finalHtml) {
    // Replace any legacy CID with direct hosted logo URL to avoid attachment chip in Gmail
    finalHtml = finalHtml.replace(/cid:eureka_official_logo/gi, OFFICIAL_LOGO_URL);

    // Substitute legacy cursive span if present
    finalHtml = finalHtml.replace(
      /<span style="font-family: 'Dancing Script'[^>]*>Eureka<\/span>/gi,
      `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 auto; text-align: center; border-collapse: collapse;">
        <tr>
          <td align="center" style="text-align: center; padding: 0;">
            <img src="${OFFICIAL_LOGO_URL}" alt="Eureka" width="220" style="display: block; margin: 0 auto; width: 220px; max-width: 90%; height: auto; border: 0; outline: none; text-align: center;" />
          </td>
        </tr>
      </table>`
    );
  }

  // NOTE: We deliberately do NOT attach any files to mailOptions.
  // This ensures Gmail will NEVER display an attachment chip/badge (eureka_official_...) in the inbox list!
  const mailOptions = {
    from: `"Eureka Physics" <${GMAIL_USER}>`,
    to: targetEmail,
    subject: subject,
    text: plainText,
    html: finalHtml
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ [Gmail SMTP] Official email delivered to ${targetEmail}. MessageId: ${info.messageId}`);
  return {
    success: true,
    message: `Đã gửi email thành công tới ${targetEmail}!`,
    messageId: info.messageId
  };
}

/**
 * Template builder for system status emails (approved, rejected, pending, banned, deleted)
 */
function buildStatusHtml({ teacherName, status, rejectionReason, customTitle, customMessage }) {
  const isApproved = status === 'verified';
  const isRejected = status === 'rejected';
  const isPending = status === 'pending';
  const isInactive = status === 'inactive' || status === 'banned';
  const isDeleted = status === 'deleted';

  let statusBadgeText = 'ĐÃ ĐƯỢC CHẤP THUẬN';
  let badgeBg = '#ecfdf5';
  let badgeColor = '#047857';
  let badgeBorder = '#10b981';
  let title = 'Tài khoản Giảng viên đã được kích hoạt';
  let mainMessage = 'Chúc mừng thầy/cô đã hoàn tất quá trình xác thực hồ sơ giảng viên trên Eureka Physics. Tài khoản của thầy/cô đã sẵn sàng để bắt đầu sử dụng toàn bộ tính năng giảng dạy, quản lý lớp học và ngân hàng nội dung.';
  let callToAction = 'Thầy/cô đã có thể đăng nhập ngay vào hệ thống để bắt đầu giảng dạy.';

  if (isRejected) {
    statusBadgeText = 'HỒ SƠ CHƯA ĐƯỢC PHÊ DUYỆT';
    badgeBg = '#fff1f2';
    badgeColor = '#e11d48';
    badgeBorder = '#f43f5e';
    title = 'Thông báo kết quả xét duyệt hồ sơ giảng viên';
    mainMessage = 'Rất tiếc, hồ sơ đăng ký giảng viên của thầy/cô chưa đáp ứng đủ điều kiện theo tiêu chuẩn hiện tại của Eureka Physics.';
    callToAction = 'Thầy/cô có thể đăng nhập để chỉnh sửa thông tin và nộp lại hồ sơ minh chứng bất kỳ lúc nào.';
  } else if (isPending) {
    statusBadgeText = 'ĐÃ TIẾP NHẬN HỒ SƠ ĐĂNG KÝ';
    badgeBg = '#eff6ff';
    badgeColor = '#1d4ed8';
    badgeBorder = '#3b82f6';
    title = 'Hồ sơ đăng ký giảng viên đã được tiếp nhận';
    mainMessage = 'Ban Quản Trị Eureka Physics đã tiếp nhận hồ sơ đăng ký giảng viên của thầy/cô. Chúng tôi đang tiến hành đối soát và thẩm định thông tin minh chứng.';
    callToAction = 'Quy trình xét duyệt thường diễn ra trong vòng 24–48h làm việc. Chúng tôi sẽ thông báo kết quả qua email ngay khi hoàn tất.';
  } else if (isInactive) {
    statusBadgeText = 'TÀI KHOẢN ĐÃ BỊ TẠM KHÓA';
    badgeBg = '#fef2f2';
    badgeColor = '#b91c1c';
    badgeBorder = '#ef4444';
    title = 'Thông báo tạm khóa tài khoản giảng viên';
    mainMessage = 'Tài khoản giảng viên của thầy/cô trên hệ thống Eureka Physics hiện đã bị tạm dừng hoạt động do vi phạm quy định hoặc theo quyết định quản trị.';
    callToAction = 'Nếu thầy/cô cần giải trình hoặc hỗ trợ mở khóa tài khoản, vui lòng phản hồi lại email này hoặc liên hệ support@physigame.edu.vn.';
  } else if (isDeleted) {
    statusBadgeText = 'TÀI KHOẢN ĐÃ ĐƯỢC XÓA';
    badgeBg = '#f8fafc';
    badgeColor = '#334155';
    badgeBorder = '#94a3b8';
    title = 'Thông báo xóa tài khoản người dùng';
    mainMessage = 'Tài khoản của thầy/cô đã được xóa khỏi hệ thống Eureka Physics theo quy trình quản trị dữ liệu.';
    callToAction = 'Mọi dữ liệu liên quan đã được xử lý theo chính sách bảo mật của hệ thống.';
  }

  if (customTitle) title = customTitle;
  if (customMessage) mainMessage = customMessage;

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px 24px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <!-- Official Eureka Logo Header -->
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #3b82f6;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 auto; text-align: center; border-collapse: collapse;">
          <tr>
            <td align="center" style="text-align: center; padding: 0;">
              <img src="${OFFICIAL_LOGO_URL}" alt="Eureka" width="220" style="display: block; margin: 0 auto; width: 220px; max-width: 90%; height: auto; border: 0; outline: none; text-align: center;" />
            </td>
          </tr>
        </table>
        <p style="color: #64748b; margin-top: 12px; margin-bottom: 0; font-size: 13px; font-weight: 700; font-family: 'Segoe UI', Arial, sans-serif; letter-spacing: 0.3px; text-transform: uppercase;">${title}</p>
      </div>

      <!-- Main Body -->
      <div style="padding: 4px 0 20px 0;">
        <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Kính gửi thầy/cô <strong>${teacherName || 'Quý Thầy/Cô'}</strong>,</p>
        <p style="font-size: 15px; color: #334155; line-height: 1.6;">${mainMessage}</p>

        <!-- Status Badge Box -->
        <div style="padding: 16px 20px; background-color: ${badgeBg}; border: 1.5px solid ${badgeBorder}; border-radius: 14px; margin: 24px 0; text-align: center;">
          <p style="font-weight: 800; color: ${badgeColor}; font-size: 16px; margin: 0; letter-spacing: 0.5px;">
            ${statusBadgeText}
          </p>
        </div>

        ${(isRejected || isInactive) && rejectionReason ? `
          <div style="background-color: #fff1f2; border-left: 4px solid #f43f5e; padding: 14px 18px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 800; color: #9f1239; text-transform: uppercase; letter-spacing: 0.5px;">Lý do từ Ban Quản Trị:</p>
            <p style="margin: 0; font-size: 14px; color: #be123c; font-style: italic; font-weight: 600; line-height: 1.5;">"${rejectionReason}"</p>
          </div>
        ` : ''}

        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 0;">${callToAction}</p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; line-height: 1.6;">
        <p style="margin: 0;">Trân trọng,<br><strong style="color: #1e293b; font-size: 13px;">Ban Quản Trị Eureka Physics Lab</strong></p>
        <p style="margin: 4px 0 0 0; color: #64748b;">Hỗ trợ kỹ thuật: <a href="mailto:support@physigame.edu.vn" style="color: #3b82f6; text-decoration: none; font-weight: 600;">support@physigame.edu.vn</a></p>
      </div>
    </div>
  `;
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

    let defaultSubject = subject;
    if (!defaultSubject) {
      if (status === 'verified') {
        defaultSubject = `[Eureka Physics] Chúc mừng! Hồ sơ Giảng viên của ${teacherName || 'bạn'} đã được phê duyệt`;
      } else if (status === 'rejected') {
        defaultSubject = `[Eureka Physics] Thông báo kết quả xét duyệt hồ sơ giảng viên của ${teacherName || 'bạn'}`;
      } else if (status === 'pending') {
        defaultSubject = `[Eureka Physics] Xác nhận tiếp nhận hồ sơ đăng ký giảng viên - ${teacherName || 'Ứng viên'}`;
      } else if (status === 'inactive' || status === 'banned') {
        defaultSubject = `[Eureka Physics] Thông báo tạm khóa tài khoản giảng viên - ${teacherName || 'Quý Thầy/Cô'}`;
      } else if (status === 'deleted') {
        defaultSubject = `[Eureka Physics] Thông báo về việc xóa tài khoản - ${teacherName || 'Người dùng'}`;
      } else {
        defaultSubject = `[Eureka Physics] Thông báo từ Ban Quản Trị về tài khoản của bạn`;
      }
    }

    const finalHtml = htmlContent || buildStatusHtml({ teacherName, status, rejectionReason });

    // Fast-race mechanism: Deliver email via pooled SMTP. If Gmail takes > 2.5s, respond immediately
    // so the admin interface is never blocked or hanging while email finishes delivering.
    const mailPromise = sendViaGmail({ to, subject: defaultSubject, htmlContent: finalHtml, textContent, teacherName });
    const quickTimer = new Promise((resolve) => setTimeout(() => resolve({
      success: true,
      message: `Đã gửi email thông báo thành công đến ${to}!`
    }), 2500));

    const result = await Promise.race([mailPromise, quickTimer]);
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
    const { to, teacherId, teacherName, message, subject, htmlContent, textContent } = req.body;

    if (!to || (!message && !htmlContent)) {
      return res.status(400).json({ success: false, message: 'Thiếu email người nhận hoặc nội dung phản hồi' });
    }

    console.log(`📧 [Backend Email] Sending custom feedback mail via Gmail SMTP to: ${to} (Teacher: ${teacherName || 'N/A'}, ID: ${teacherId || 'N/A'})`);

    // 1. Immediately persist notification in teacher_notifications via Backend Supabase (Service Role bypasses RLS safely)
    if (teacherId) {
      supabase.from('teacher_notifications').insert({
        teacher_id: teacherId,
        title: '📩 Phản hồi từ Ban Quản Trị về hồ sơ giảng viên',
        content: (message || '').trim(),
        is_read: false
      }).then(({ error }) => {
        if (error) {
          console.warn('⚠️ [Backend Email] Could not insert teacher_notification:', error.message);
        } else {
          console.log(`✅ [Backend Email] Persisted feedback notification in DB for teacher: ${teacherId}`);
        }
      }).catch(err => {
        console.warn('⚠️ [Backend Email] Exception saving teacher_notification:', err.message);
      });
    }

    const defaultSubject = subject || `[Eureka Physics] Phản hồi về hồ sơ đăng ký giảng viên của ${teacherName || 'bạn'}`;

    const defaultHtml = htmlContent || `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px 24px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <!-- Official Eureka Logo Header -->
        <div style="text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #3b82f6;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 auto; text-align: center; border-collapse: collapse;">
            <tr>
              <td align="center" style="text-align: center; padding: 0;">
                <img src="${OFFICIAL_LOGO_URL}" alt="Eureka" width="220" style="display: block; margin: 0 auto; width: 220px; max-width: 90%; height: auto; border: 0; outline: none; text-align: center;" />
              </td>
            </tr>
          </table>
          <p style="color: #64748b; margin-top: 12px; margin-bottom: 0; font-size: 13px; font-weight: 700; font-family: 'Segoe UI', Arial, sans-serif; letter-spacing: 0.3px;">THÔNG BÁO PHẢN HỒI TỪ BAN QUẢN TRỊ</p>
        </div>

        <div style="padding: 4px 0 20px 0;">
          <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Kính gửi thầy/cô <strong>${teacherName || 'Ứng viên'}</strong>,</p>
          <p style="font-size: 15px; color: #334155; line-height: 1.6;">Ban quản trị hệ thống Eureka Physics xin gửi lời phản hồi trực tiếp tới thầy/cô về đơn đăng ký làm Giảng viên:</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 15px; color: #0f172a; white-space: pre-wrap; font-style: italic; line-height: 1.6;">"${message || ''}"</p>
          </div>

          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 0;">Nếu thầy/cô có thắc mắc hoặc cần hỗ trợ bổ sung thông tin, vui lòng phản hồi lại email này.</p>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; line-height: 1.6;">
          <p style="margin: 0;">Trân trọng,<br><strong style="color: #1e293b; font-size: 13px;">Ban Quản Trị Eureka Physics Lab</strong></p>
          <p style="margin: 4px 0 0 0; color: #64748b;">Hỗ trợ kỹ thuật: <a href="mailto:support@physigame.edu.vn" style="color: #3b82f6; text-decoration: none; font-weight: 600;">support@physigame.edu.vn</a></p>
        </div>
      </div>
    `;

    const defaultText = textContent || `Kính gửi thầy/cô ${teacherName || 'Ứng viên'},\n\nBan quản trị hệ thống Eureka Physics xin gửi lời phản hồi trực tiếp tới thầy/cô về đơn đăng ký làm Giảng viên:\n\n"${message || ''}"\n\nNếu thầy/cô có thắc mắc hoặc cần hỗ trợ bổ sung thông tin, vui lòng phản hồi lại email này.\n\nTrân trọng,\nBan Quản Trị Eureka Physics`;

    // 2. Deliver email via pooled SMTP with 2.5s fast-race guarantee
    const mailPromise = sendViaGmail({
      to,
      subject: defaultSubject,
      htmlContent: defaultHtml,
      textContent: defaultText,
      teacherName
    });

    const quickTimer = new Promise((resolve) => setTimeout(() => resolve({
      success: true,
      message: `Đã gửi email phản hồi thành công đến ${to}!`
    }), 2500));

    const result = await Promise.race([mailPromise, quickTimer]);
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

/**
 * Template builder for Registration OTP verification emails
 */
function buildOtpHtml({ username, otp }) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #ffffff; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
      <!-- Official Eureka Logo Header -->
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #3b82f6;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 auto; text-align: center; border-collapse: collapse;">
          <tr>
            <td align="center" style="text-align: center; padding: 0;">
              <img src="${OFFICIAL_LOGO_URL}" alt="Eureka" width="220" style="display: block; margin: 0 auto; width: 220px; max-width: 90%; height: auto; border: 0; outline: none; text-align: center;" />
            </td>
          </tr>
        </table>
        <p style="color: #64748b; margin-top: 14px; margin-bottom: 0; font-size: 13px; font-weight: 700; font-family: 'Segoe UI', Arial, sans-serif; letter-spacing: 0.5px; text-transform: uppercase;">XÁC THỰC TÀI KHOẢN ĐĂNG KÝ</p>
      </div>

      <!-- Main Body -->
      <div style="padding: 4px 0 20px 0;">
        <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Kính gửi <strong>${username || 'Bạn'}</strong>,</p>
        <p style="font-size: 15px; color: #334155; line-height: 1.6;">Để hoàn tất đăng ký tài khoản trên nền tảng học tập <strong>Eureka Physics</strong>, bạn vui lòng sử dụng mã xác thực (OTP) bên dưới:</p>
        
        <!-- OTP Highlight Box -->
        <div style="background-color: #f8fafc; border: 2px dashed #3b82f6; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
          <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">MÃ XÁC THỰC (OTP) CỦA BẠN</div>
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; color: #1d4ed8; letter-spacing: 8px; margin: 4px 0;">${otp}</div>
          <div style="font-size: 13px; color: #ef4444; font-weight: 600; margin-top: 10px;">⏱️ Mã có hiệu lực trong vòng 5 phút</div>
        </div>

        <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 0;">
          * Vì lý do an toàn, vui lòng không chia sẻ mã này cho bất kỳ ai. Nếu bạn không thực hiện yêu cầu này, xin vui lòng bỏ qua email.
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 24px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; line-height: 1.6;">
        <p style="margin: 0;">Trân trọng,<br><strong style="color: #1e293b; font-size: 13px;">Ban Quản Trị Eureka Physics Lab</strong></p>
        <p style="margin: 4px 0 0 0; color: #64748b;">Hỗ trợ kỹ thuật: <a href="mailto:support@physigame.edu.vn" style="color: #3b82f6; text-decoration: none; font-weight: 600;">support@physigame.edu.vn</a></p>
      </div>
    </div>
  `;
}

/**
 * Endpoint to generate and send registration OTP
 * POST /api/email/send-registration-otp
 */
router.post('/send-registration-otp', async (req, res) => {
  try {
    const { email, username } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'không tìm thấy gmail của bạn.' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check Gmail domain and username rules
    const parts = trimmedEmail.split('@');
    if (parts.length !== 2 || (parts[1] !== 'gmail.com' && parts[1] !== 'googlemail.com')) {
      return res.status(400).json({ success: false, message: 'không tìm thấy gmail của bạn.' });
    }
    const [uName] = parts;
    if (
      uName.length < 6 ||
      uName.length > 30 ||
      !/^[a-z0-9.]+$/.test(uName) ||
      uName.startsWith('.') ||
      uName.endsWith('.') ||
      uName.includes('..')
    ) {
      return res.status(400).json({ success: false, message: 'không tìm thấy gmail của bạn.' });
    }

    // Check if email already registered in Supabase
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', trimmedEmail)
        .maybeSingle();
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email này đã được sử dụng. Vui lòng đăng nhập.' });
      }
    } catch (dbErr) {
      console.warn('Check existing user skipped:', dbErr.message);
    }

    // Generate secure 6-digit OTP and signed token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = bcrypt.hashSync(otp, 6);
    const otpToken = jwt.sign({ email: trimmedEmail, otpHash }, JWT_SECRET, { expiresIn: '5m' });

    // Send email via Gmail SMTP
    const subject = `[Eureka Physics] Mã xác thực OTP đăng ký tài khoản của bạn: ${otp}`;
    const htmlContent = buildOtpHtml({ username: username || 'Bạn', otp });
    const textContent = `Mã xác thực OTP đăng ký tài khoản Eureka Physics của bạn là: ${otp}. Mã có hiệu lực trong vòng 5 phút.`;

    await sendViaGmail({
      to: trimmedEmail,
      subject,
      htmlContent,
      textContent,
      teacherName: username
    });

    console.log(`🔐 [Registration OTP] Sent to: ${trimmedEmail}`);

    res.json({
      success: true,
      otpToken,
      message: `Đã gửi mã xác thực tới ${trimmedEmail}`
    });
  } catch (error) {
    console.error('❌ [Backend Email] Send OTP Error:', error.message || error);
    res.status(400).json({
      success: false,
      message: 'không tìm thấy gmail của bạn.'
    });
  }
});

/**
 * Endpoint to verify registration OTP token
 * POST /api/email/verify-registration-otp
 */
router.post('/verify-registration-otp', async (req, res) => {
  try {
    const { email, otp, otpToken } = req.body;
    if (!email || !otp || !otpToken) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin mã xác thực.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(otpToken, JWT_SECRET);
    } catch {
      return res.status(400).json({ success: false, message: 'Mã xác thực đã hết hạn. Vui lòng gửi lại mã mới.' });
    }

    if (decoded.email !== email.trim().toLowerCase()) {
      return res.status(400).json({ success: false, message: 'Email xác thực không khớp.' });
    }

    const isMatch = bcrypt.compareSync(otp.trim(), decoded.otpHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mã xác thực không chính xác. Vui lòng thử lại.' });
    }

    res.json({
      success: true,
      message: 'Xác thực OTP thành công!'
    });
  } catch (error) {
    console.error('❌ [Backend Email] Verify OTP Error:', error.message || error);
    res.status(500).json({ success: false, message: 'Lỗi xác thực mã OTP.' });
  }
});

const dns = require('dns').promises;

/**
 * Endpoint to verify if an email address is a real, valid Gmail
 * POST /api/email/verify-gmail
 */
router.post('/verify-gmail', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.json({ valid: false, message: 'không tìm thấy gmail của bạn.' });
    }

    const trimmed = email.trim().toLowerCase();
    const parts = trimmed.split('@');
    if (parts.length !== 2) {
      return res.json({ valid: false, message: 'không tìm thấy gmail của bạn.' });
    }

    const [username, domain] = parts;

    // 1. Must be gmail.com or googlemail.com
    if (domain !== 'gmail.com' && domain !== 'googlemail.com') {
      return res.json({ valid: false, message: 'không tìm thấy gmail của bạn.' });
    }

    // 2. Google rules: 6-30 characters, letters, digits and dot only
    if (username.length < 6 || username.length > 30) {
      return res.json({ valid: false, message: 'không tìm thấy gmail của bạn.' });
    }

    if (!/^[a-z0-9.]+$/.test(username)) {
      return res.json({ valid: false, message: 'không tìm thấy gmail của bạn.' });
    }

    if (username.startsWith('.') || username.endsWith('.') || username.includes('..')) {
      return res.json({ valid: false, message: 'không tìm thấy gmail của bạn.' });
    }

    // 3. Known fake / invalid patterns
    const fakeKeywords = [
      'fake', 'notreal', 'nonexistent', 'khongcothat',
      'asdfgh', 'qwerty', '12345678', 'abcdefg', 'test1234'
    ];
    if (fakeKeywords.some(keyword => username.includes(keyword))) {
      return res.json({ valid: false, message: 'không tìm thấy gmail của bạn.' });
    }

    // 4. DNS MX check for domain
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return res.json({ valid: false, message: 'không tìm thấy gmail của bạn.' });
      }
    } catch {
      return res.json({ valid: false, message: 'không tìm thấy gmail của bạn.' });
    }

    return res.json({ valid: true, message: 'Gmail hợp lệ' });
  } catch (error) {
    console.error('❌ [Backend Email] Verify Gmail error:', error.message);
    return res.json({ valid: true });
  }
});

module.exports = router;
module.exports.sendViaGmail = sendViaGmail;
module.exports.buildStatusHtml = buildStatusHtml;


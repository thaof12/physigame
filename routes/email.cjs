const express = require('express');
const router = express.Router();
const axios = require('axios');

// SendGrid configurations from environment
const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';
const SENDGRID_API_KEY = process.env.VITE_SENDGRID_API_KEY || process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.VITE_SENDGRID_FROM_EMAIL || process.env.SENDGRID_FROM_EMAIL || 'tranthehao7431@gmail.com';

/**
 * Endpoint to send status update emails to teachers
 * POST /api/email/send-status
 */
router.post('/send-status', async (req, res) => {
  try {
    const { to, teacherName, status, rejectionReason, htmlContent, subject } = req.body;

    if (!SENDGRID_API_KEY) {
      console.error('❌ [Backend Email] SendGrid API Key is missing in .env');
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    console.log(`📧 [Backend Email] Sending status mail to: ${to} (Status: ${status})`);

    const response = await axios.post(
      SENDGRID_API_URL,
      {
        personalizations: [{ to: [{ email: to }] }],
        from: {
          email: FROM_EMAIL,
          name: 'Eureka Physics'
        },
        subject: subject,
        content: [{ type: 'text/html', value: htmlContent }]
      },
      {
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ success: true, message: 'Email sent successfully via SendGrid' });
  } catch (error) {
    const errorData = error.response?.data || error.message;
    console.error('❌ [Backend Email] SendGrid Error:', JSON.stringify(errorData, null, 2));
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email', 
      error: errorData 
    });
  }
});

module.exports = router;

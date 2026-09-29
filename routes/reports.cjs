const express = require('express');
const router = express.Router();
const { supabase } = require('../src/config/supabase.cjs');

// Fixed system UUIDs for persisting admin data in PostgreSQL
const ADMIN_REPORTS_UUID = '00000000-0000-0000-0000-000000000001';
const ADMIN_LOCKS_UUID = '00000000-0000-0000-0000-000000000002';

// In-memory runtime cache
let inMemoryReports = [];
let lockedContentSet = new Set();
let inMemoryWarnings = [];

// Helper to get active locked IDs across DB and memory
const getMergedLockedIds = async () => {
  const lockedIds = new Set(Array.from(lockedContentSet));
  try {
    const [lessonsResult, challengesResult, locksNotifResult] = await Promise.allSettled([
      supabase.from('lessons').select('id').eq('status', 'locked'),
      supabase.from('challenges').select('id').eq('status', 'locked'),
      supabase.from('teacher_notifications').select('title').eq('teacher_id', ADMIN_LOCKS_UUID)
    ]);

    if (lessonsResult.status === 'fulfilled' && lessonsResult.value.data) {
      lessonsResult.value.data.forEach(item => lockedIds.add(String(item.id)));
    }
    if (challengesResult.status === 'fulfilled' && challengesResult.value.data) {
      challengesResult.value.data.forEach(item => lockedIds.add(String(item.id)));
    }
    if (locksNotifResult.status === 'fulfilled' && locksNotifResult.value.data) {
      locksNotifResult.value.data.forEach(item => {
        if (item.title) lockedIds.add(String(item.title));
      });
    }
  } catch (err) {
    console.warn('Error fetching locked IDs from DB:', err.message);
  }
  return Array.from(lockedIds);
};

// Helper to fetch all active reports from DB (reports table or teacher_notifications system records)
const getAllActiveReports = async () => {
  const reportMap = new Map();

  // 1. Try reports table if exists
  try {
    const { data: dbReports, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(dbReports)) {
      dbReports.forEach(r => {
        const key = r.id || `${r.content_id}_${r.reason}`;
        reportMap.set(key, r);
      });
    }
  } catch (e) {}

  // 2. Fetch from persistent teacher_notifications with ADMIN_REPORTS_UUID
  try {
    const { data: notifReports, error } = await supabase
      .from('teacher_notifications')
      .select('*')
      .eq('teacher_id', ADMIN_REPORTS_UUID)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(notifReports)) {
      notifReports.forEach(n => {
        try {
          const parsed = typeof n.content === 'string' ? JSON.parse(n.content) : n.content;
          const r = {
            id: parsed.id || n.id,
            db_id: n.id,
            content_id: parsed.content_id || n.title,
            content_title: parsed.content_title || 'Nội dung bài học',
            content_type: parsed.content_type || 'lesson',
            reporter_id: parsed.reporter_id || null,
            reporter_name: parsed.reporter_name || 'Giáo viên',
            reason: parsed.reason || 'Báo cáo vi phạm',
            status: 'pending',
            created_at: parsed.created_at || n.created_at
          };
          const key = r.id || `${r.content_id}_${r.reason}`;
          reportMap.set(key, r);
        } catch (parseErr) {}
      });
    }
  } catch (e) {}

  // 3. Fallback / merge in-memory reports
  inMemoryReports.forEach(r => {
    const key = r.id || `${r.content_id}_${r.reason}`;
    if (!reportMap.has(key)) {
      reportMap.set(key, r);
    }
  });

  return Array.from(reportMap.values());
};

// POST /api/reports - Submit a report for a lesson or exercise
router.post('/', async (req, res) => {
  try {
    const { content_id, content_title, content_type, reporter_id, reporter_name, reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung báo cáo.' });
    }

    const reportId = 'rep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const reportData = {
      id: reportId,
      content_id: content_id ? String(content_id) : null,
      content_title: content_title || 'Nội dung không có tên',
      content_type: content_type || 'lesson',
      reporter_id: reporter_id || null,
      reporter_name: reporter_name || 'Giáo viên',
      reason: reason.trim(),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // Always persist to teacher_notifications with ADMIN_REPORTS_UUID so it survives serverless restarts & redeployments
    try {
      await supabase
        .from('teacher_notifications')
        .insert({
          teacher_id: ADMIN_REPORTS_UUID,
          title: String(content_id || reportId),
          content: JSON.stringify(reportData),
          is_read: false
        });
    } catch (dbErr) {
      console.warn('Error saving report to teacher_notifications:', dbErr.message);
    }

    // Also attempt reports table
    try {
      await supabase
        .from('reports')
        .insert([reportData]);
    } catch (dbErr) {}

    inMemoryReports.unshift(reportData);
    return res.json({ success: true, message: 'Đã gửi báo cáo vi phạm tới Quản trị viên.', data: reportData });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reports - Admin retrieve all reports
router.get('/', async (req, res) => {
  try {
    const [reports, locked_ids] = await Promise.all([
      getAllActiveReports(),
      getMergedLockedIds()
    ]);

    return res.json({
      success: true,
      reports,
      locked_ids
    });
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/reports/lock - Toggle content lock status (Admin function)
router.put('/lock', async (req, res) => {
  try {
    const { content_id, content_type, is_locked } = req.body;
    if (!content_id) {
      return res.status(400).json({ success: false, message: 'Thiếu content_id.' });
    }

    const cId = String(content_id);

    if (is_locked) {
      lockedContentSet.add(cId);
      // Persist lock record in teacher_notifications
      try {
        await supabase
          .from('teacher_notifications')
          .insert({
            teacher_id: ADMIN_LOCKS_UUID,
            title: cId,
            content: JSON.stringify({ locked_at: new Date().toISOString() }),
            is_read: true
          });
      } catch (e) {}
    } else {
      lockedContentSet.delete(cId);
      try {
        await supabase
          .from('teacher_notifications')
          .delete()
          .eq('teacher_id', ADMIN_LOCKS_UUID)
          .eq('title', cId);
      } catch (e) {}
    }

    // Update status in lessons or challenges table
    const targetStatus = is_locked ? 'locked' : 'published';
    try {
      if (content_type === 'exercise' || content_type === 'challenge') {
        await supabase
          .from('challenges')
          .update({ status: targetStatus })
          .eq('id', cId);
      } else {
        await supabase
          .from('lessons')
          .update({ status: targetStatus })
          .eq('id', cId);
      }
    } catch (e) {
      console.warn('Status update warning in DB:', e.message);
    }

    const currentLockedIds = await getMergedLockedIds();

    return res.json({
      success: true,
      message: is_locked ? 'Đã vô hiệu hóa (khóa) thao tác của giáo viên đối với bài này.' : 'Đã mở khóa bài này cho giáo viên.',
      is_locked: !!is_locked,
      locked_ids: currentLockedIds
    });
  } catch (error) {
    console.error('Error toggling lock:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/reports/warning - Admin send warning feedback to warned teacher
router.post('/warning', async (req, res) => {
  try {
    const { content_id, content_title, teacher_id, warning_message } = req.body;
    if (!warning_message || !warning_message.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung cảnh báo.' });
    }

    const warningObj = {
      id: 'warn_' + Date.now(),
      content_id,
      content_title: content_title || 'Bài vi phạm',
      teacher_id: teacher_id || null,
      message: warning_message.trim(),
      created_at: new Date().toISOString()
    };

    inMemoryWarnings.unshift(warningObj);

    // Send notification to warned teacher's bell icon
    if (teacher_id) {
      try {
        await supabase
          .from('teacher_notifications')
          .insert({
            teacher_id: teacher_id,
            title: '⚠️ Cảnh báo vi phạm nội dung từ Admin',
            content: `Bài "${content_title || 'Học liệu'}" của bạn đã nhận cảnh báo từ Quản trị viên: "${warning_message.trim()}"`,
            is_read: false
          });
      } catch (notifErr) {
        console.warn('Supabase insert teacher notification warning error:', notifErr.message);
      }
    }

    return res.json({
      success: true,
      message: 'Đã gửi phản hồi cảnh báo thành công tới giáo viên.',
      warning: warningObj
    });
  } catch (error) {
    console.error('Error sending warning:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/reports/reply - Admin reply to the teacher who submitted the report
router.post('/reply', async (req, res) => {
  try {
    const { report_id, reporter_id, content_title, reply_message } = req.body;
    if (!reply_message || !reply_message.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung phản hồi.' });
    }

    // Send notification to reporting teacher's bell icon
    if (reporter_id) {
      try {
        await supabase
          .from('teacher_notifications')
          .insert({
            teacher_id: reporter_id,
            title: '💬 Phản hồi báo cáo từ Quản trị viên',
            content: `Admin đã phản hồi báo cáo của bạn về bài "${content_title || 'Nội dung'}": "${reply_message.trim()}"`,
            is_read: false
          });
      } catch (notifErr) {
        console.warn('Supabase insert teacher notification reply error:', notifErr.message);
      }
    }

    return res.json({
      success: true,
      message: 'Đã gửi phản hồi báo cáo thành công tới giáo viên gửi báo cáo.'
    });
  } catch (error) {
    console.error('Error replying to report:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reports/locks - Retrieve set of locked content IDs
router.get('/locks', async (req, res) => {
  try {
    const locked_ids = await getMergedLockedIds();
    return res.json({ success: true, locked_ids });
  } catch (e) {
    return res.json({ success: true, locked_ids: Array.from(lockedContentSet) });
  }
});

// DELETE /api/reports/content/:contentId - Resolve/Delete all reports for a specific content ID
router.delete('/content/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    if (!contentId) {
      return res.status(400).json({ success: false, message: 'Thiếu contentId.' });
    }

    const cId = String(contentId);

    // Delete or mark resolved in teacher_notifications
    try {
      await supabase
        .from('teacher_notifications')
        .delete()
        .eq('teacher_id', ADMIN_REPORTS_UUID)
        .eq('title', cId);
    } catch (e) {}

    // Also attempt deleting from reports table
    try {
      await supabase
        .from('reports')
        .delete()
        .eq('content_id', cId);
    } catch (dbErr) {}

    inMemoryReports = inMemoryReports.filter(r => String(r.content_id) !== cId);

    return res.json({
      success: true,
      message: 'Đã hoàn tất xử lý và dọn dẹp các báo cáo của nội dung này.'
    });
  } catch (error) {
    console.error('Error resolving content reports:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/reports/:id - Delete/Resolve a single report by report ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Thiếu ID báo cáo.' });
    }

    try {
      await supabase
        .from('teacher_notifications')
        .delete()
        .eq('teacher_id', ADMIN_REPORTS_UUID)
        .eq('id', id);
    } catch (e) {}

    try {
      await supabase
        .from('reports')
        .delete()
        .eq('id', id);
    } catch (dbErr) {}

    inMemoryReports = inMemoryReports.filter(r => String(r.id) !== String(id) && String(r.db_id) !== String(id));

    return res.json({
      success: true,
      message: 'Đã xóa báo cáo thành công.'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.getMergedLockedIds = getMergedLockedIds;
module.exports = router;

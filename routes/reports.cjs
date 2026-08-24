const express = require('express');
const router = express.Router();
const { supabase } = require('../src/config/supabase.cjs');

// In-memory fallbacks if database tables are not yet created
let inMemoryReports = [];
let lockedContentSet = new Set();
let inMemoryWarnings = [];

// POST /api/reports - Submit a report for a lesson or exercise
router.post('/', async (req, res) => {
  try {
    const { content_id, content_title, content_type, reporter_id, reporter_name, reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung báo cáo.' });
    }

    const reportData = {
      id: 'rep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      content_id: content_id || null,
      content_title: content_title || 'Nội dung không có tên',
      content_type: content_type || 'lesson',
      reporter_id: reporter_id || null,
      reporter_name: reporter_name || 'Giáo viên',
      reason: reason.trim(),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([reportData])
        .select();

      if (!error && data && data.length > 0) {
        return res.json({ success: true, message: 'Đã gửi báo cáo vi phạm tới Quản trị viên.', data: data[0] });
      }
    } catch (dbErr) {
      console.warn('Supabase reports insert fallback to memory:', dbErr.message);
    }

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
    try {
      // Fetch reports and locked content IDs in parallel
      const [reportsResult, lockedLessonsResult, lockedChallengesResult] = await Promise.allSettled([
        supabase.from('reports').select('*').order('created_at', { ascending: false }),
        supabase.from('lessons').select('id').eq('is_locked', true),
        supabase.from('challenges').select('id').eq('is_locked', true)
      ]);

      const reportsData = reportsResult.status === 'fulfilled' && !reportsResult.value.error
        ? reportsResult.value.data || []
        : null;

      // Build locked IDs set: combine in-memory set with DB-persisted locks
      const dbLockedIds = [];
      if (lockedLessonsResult.status === 'fulfilled' && !lockedLessonsResult.value.error) {
        (lockedLessonsResult.value.data || []).forEach(r => dbLockedIds.push(String(r.id)));
      }
      if (lockedChallengesResult.status === 'fulfilled' && !lockedChallengesResult.value.error) {
        (lockedChallengesResult.value.data || []).forEach(r => dbLockedIds.push(String(r.id)));
      }
      // Merge DB locks with in-memory set (in-memory may have locks set during this session)
      const mergedLockedIds = Array.from(new Set([...Array.from(lockedContentSet), ...dbLockedIds]));

      if (reportsData !== null) {
        return res.json({ success: true, reports: reportsData, locked_ids: mergedLockedIds });
      }
    } catch (dbErr) {
      console.warn('Supabase reports select fallback:', dbErr.message);
    }

    return res.json({ success: true, reports: inMemoryReports, locked_ids: Array.from(lockedContentSet) });
  } catch (error) {
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

    if (is_locked) {
      lockedContentSet.add(String(content_id));
    } else {
      lockedContentSet.delete(String(content_id));
    }

    // Try updating Supabase table if column exists
    const tableName = (content_type === 'exercise' || content_type === 'challenge') ? 'challenges' : 'lessons';
    try {
      await supabase
        .from(tableName)
        .update({ is_locked: !!is_locked, status: is_locked ? 'locked' : 'available' })
        .eq('id', content_id);
    } catch (e) {
      console.warn('Supabase lock status update warning:', e.message);
    }

    return res.json({
      success: true,
      message: is_locked ? 'Đã vô hiệu hóa (khóa) thao tác của giáo viên đối với bài này.' : 'Đã mở khóa bài này cho giáo viên.',
      is_locked: !!is_locked,
      locked_ids: Array.from(lockedContentSet)
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
router.get('/locks', (req, res) => {
  return res.json({ success: true, locked_ids: Array.from(lockedContentSet) });
});

// DELETE /api/reports/content/:contentId - Resolve/Delete all reports for a specific content ID
router.delete('/content/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    if (!contentId) {
      return res.status(400).json({ success: false, message: 'Thiếu contentId.' });
    }

    try {
      await supabase
        .from('reports')
        .delete()
        .eq('content_id', contentId);
    } catch (dbErr) {
      console.warn('Supabase delete reports by content_id fallback:', dbErr.message);
    }

    inMemoryReports = inMemoryReports.filter(r => String(r.content_id) !== String(contentId));

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
        .from('reports')
        .delete()
        .eq('id', id);
    } catch (dbErr) {
      console.warn('Supabase delete report by ID fallback:', dbErr.message);
    }

    inMemoryReports = inMemoryReports.filter(r => String(r.id) !== String(id));

    return res.json({
      success: true,
      message: 'Đã xóa báo cáo thành công.'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;


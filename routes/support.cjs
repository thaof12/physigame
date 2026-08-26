const express = require('express');
const router = express.Router();
const { supabase } = require('../src/config/supabase.cjs');

// Sanitize avatars (support both URLs and data URLs, return clean string)
const sanitizeAvatar = (avatar) => {
  if (!avatar || typeof avatar !== 'string') return null;
  const trimmed = avatar.trim();
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return null;
  return trimmed;
};

// Helper: Read all messages directly from Supabase Database and dynamically join with Users table for real-time updated avatars
const readMessages = async () => {
  const { data: messages, error } = await supabase
    .from('support_messages')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('⚠️ Supabase support_messages read error:', error.message);
    return [];
  }

  const rawList = messages || [];

  // Gather unique user IDs to fetch their latest real-time profile avatar from 'users' table
  const userIds = [...new Set(rawList.map(m => m.user_id || m.sender_id).filter(id => id && id !== 'admin' && id !== 'all'))];

  let userAvatarMap = {};
  if (userIds.length > 0) {
    try {
      const { data: users, error: userErr } = await supabase
        .from('users')
        .select('id, avatar, display_name')
        .in('id', userIds);

      if (!userErr && users && users.length > 0) {
        users.forEach(u => {
          if (u.id && u.avatar) {
            userAvatarMap[u.id] = sanitizeAvatar(u.avatar);
          }
        });
      }
    } catch (e) {
      console.warn('⚠️ Error reading users table for avatars:', e.message);
    }
  }

  return rawList.map(m => {
    const uId = m.user_id || m.sender_id;
    // Priority: User's latest updated avatar from 'users' table -> Message's stored avatar -> null
    const finalAvatar = userAvatarMap[uId] || sanitizeAvatar(m.avatar) || null;

    return {
      id: m.id,
      role: m.role || 'student',
      userId: m.user_id,
      senderId: m.sender_id,
      senderName: m.sender_name,
      avatar: finalAvatar,
      topic: m.topic || 'Chung',
      text: m.text,
      sender: m.sender || 'student',
      timestamp: m.timestamp,
      createdAt: m.created_at
    };
  });
};

// GET /api/support/all -> Returns all support threads/messages for Admin
router.get('/all', async (req, res) => {
  try {
    const messages = await readMessages();
    res.json({ success: true, messages });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/support/messages?userId=xxx&role=student|teacher
router.get('/messages', async (req, res) => {
  try {
    const { userId, role } = req.query;
    const messages = await readMessages();

    let filtered = messages;
    if (role) {
      filtered = filtered.filter(m => m.role === role);
    }
    if (userId) {
      filtered = filtered.filter(m => m.userId === userId || m.senderId === userId || m.targetUserId === userId || m.userId === 'all');
    }

    res.json({ success: true, messages: filtered });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/support/send -> Post a new message from Student, Teacher, or Admin
router.post('/send', async (req, res) => {
  try {
    const {
      id,
      role = 'student', // 'student' | 'teacher'
      userId,
      senderId,
      senderName,
      avatar,
      topic = 'Chung',
      text,
      sender = 'user', // 'student' | 'teacher' | 'admin'
      timestamp
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const uId = userId || senderId || 'anonymous';
    const cleanAv = sanitizeAvatar(avatar);
    const now = new Date();

    const msgId = id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const timeStr = timestamp || now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const createdAtStr = now.toISOString();

    // 1. Insert new message directly into Supabase PostgreSQL
    const { error: insertErr } = await supabase
      .from('support_messages')
      .insert({
        id: msgId,
        role: role,
        user_id: uId,
        sender_id: senderId || uId,
        sender_name: senderName || (role === 'teacher' ? 'Giáo viên' : 'Học sinh'),
        avatar: cleanAv,
        topic: topic || 'Chung',
        text: text.trim(),
        sender: sender,
        timestamp: timeStr,
        created_at: createdAtStr
      });

    if (insertErr) {
      console.error('❌ Supabase insert error:', insertErr.message);
      return res.status(500).json({ error: insertErr.message });
    }

    // 2. If avatar is provided, sync avatar across support_messages and users table
    if (cleanAv && uId && uId !== 'anonymous') {
      await supabase
        .from('support_messages')
        .update({ avatar: cleanAv })
        .or(`user_id.eq.${uId},sender_id.eq.${uId}`);

      try {
        await supabase
          .from('users')
          .update({ avatar: cleanAv })
          .eq('id', uId);
      } catch (e) {}
    }

    const allMessages = await readMessages();
    const newMsg = allMessages.find(m => m.id === msgId) || {
      id: msgId,
      role,
      userId: uId,
      senderId: senderId || uId,
      senderName: senderName || (role === 'teacher' ? 'Giáo viên' : 'Học sinh'),
      avatar: cleanAv,
      topic: topic || 'Chung',
      text: text.trim(),
      sender,
      timestamp: timeStr,
      createdAt: createdAtStr
    };

    res.json({ success: true, message: newMsg, allMessages });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/support/reply -> Admin replies to a specific student or teacher thread
router.post('/reply', async (req, res) => {
  try {
    const {
      role = 'student', // 'student' | 'teacher'
      userId,
      text,
      topic = 'Chung',
      adminName = 'Quản trị viên Eureka'
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Reply text is required' });
    }

    const now = new Date();
    const msgId = `msg_admin_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const createdAtStr = now.toISOString();

    const { error: insertErr } = await supabase
      .from('support_messages')
      .insert({
        id: msgId,
        role: role,
        user_id: userId || 'all',
        sender_id: 'admin',
        sender_name: adminName,
        avatar: null,
        topic: topic || 'Chung',
        text: text.trim(),
        sender: 'admin',
        timestamp: timeStr,
        created_at: createdAtStr
      });

    if (insertErr) {
      console.error('❌ Supabase reply error:', insertErr.message);
      return res.status(500).json({ error: insertErr.message });
    }

    const allMessages = await readMessages();
    const replyMsg = allMessages.find(m => m.id === msgId) || {
      id: msgId,
      role,
      userId: userId || 'all',
      senderId: 'admin',
      senderName: adminName,
      avatar: null,
      topic: topic || 'Chung',
      text: text.trim(),
      sender: 'admin',
      timestamp: timeStr,
      createdAt: createdAtStr
    };

    res.json({ success: true, message: replyMsg, allMessages });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/support/update-avatar -> Sync new avatar for user messages & users table
router.post('/update-avatar', async (req, res) => {
  try {
    const { userId, senderName, avatar } = req.body;
    const cleanAv = sanitizeAvatar(avatar);

    if (!cleanAv) return res.json({ success: true, updated: false });

    // Update in support_messages
    let query = supabase.from('support_messages').update({ avatar: cleanAv });
    if (userId) {
      query = query.or(`user_id.eq.${userId},sender_id.eq.${userId}`);
    } else if (senderName) {
      query = query.eq('sender_name', senderName);
    }
    await query;

    // Also update in users table
    if (userId) {
      try {
        await supabase.from('users').update({ avatar: cleanAv }).eq('id', userId);
      } catch (e) {}
    }

    res.json({ success: true, updated: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

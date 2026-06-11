// Auth middleware - Supabase version
// Verifies Supabase JWT or custom JWT tokens
const { supabase } = require('../src/config/supabase.cjs');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token' });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check status in database
    const { data: dbUser } = await supabase
      .from('users')
      .select('status')
      .eq('id', user.id)
      .single();

    if (dbUser && dbUser.status === 'inactive') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.' });
    }

    req.userId = user.id;
    req.email = user.email;
    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;

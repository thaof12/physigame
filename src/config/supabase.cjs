// Supabase client for backend (Node.js/Express)
// Uses Service Role Key for admin-level access
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('   Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  throw new Error('Missing Supabase environment variables');
}

// Service role client - bypasses RLS, use only on backend
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create a client with user's token for RLS-aware queries
const createUserClient = (accessToken) => {
  return createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
};

module.exports = { supabase, createUserClient };

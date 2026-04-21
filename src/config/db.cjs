// Supabase connection helper (replaces old MongoDB connectDB)
const { supabase } = require('./supabase.cjs');

const connectDB = async () => {
  try {
    // Test connection with simple query
    const { error } = await supabase.from('users').select('id', { count: 'exact', head: true });
    if (error && error.code !== '42P01') {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }
    console.log("✅ Supabase connected successfully!");
    console.log("📊 Database: PostgreSQL (Supabase)");
  } catch (error) {
    console.error("❌ Supabase connection failed!");
    console.error("Error:", error.message);
    console.error("\n🔧 Solutions:");
    console.error("1. Check SUPABASE_URL in .env");
    console.error("2. Check SUPABASE_SERVICE_ROLE_KEY in .env");
    console.error("3. Ensure database schema has been created");
    throw error;
  }
};

module.exports = connectDB;
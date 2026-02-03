const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // MongoDB Atlas connection - sử dụng database 'test' của bạn
    const atlasUri = "mongodb+srv://trancongviet0710_db_user:TIpYFg6BN3mzqsRk@cluster0.aixbbzb.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";
    
    await mongoose.connect(atlasUri, {
      serverSelectionTimeoutMS: 10000, // Tăng timeout lên 10 giây
    });
    console.log("✅ MongoDB Atlas connected successfully!");
    console.log("📊 Database:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ MongoDB Atlas connection failed!");
    console.error("Error:", error.message);
    console.error("\n🔧 Solutions:");
    console.error("1. Whitelist your IP (1.54.56.32) in MongoDB Atlas Network Access");
    console.error("2. Or allow access from anywhere (0.0.0.0/0)");
    console.error("3. Check your internet connection");
    console.error("4. Verify MongoDB Atlas cluster is running");
    
    // Không dùng fallback - báo lỗi rõ ràng
    throw error;
  }
};

module.exports = connectDB;
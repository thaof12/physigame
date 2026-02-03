const express = require('express');
<<<<<<< HEAD
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
=======
const cors = require('cors');
require('dotenv').config();
const connectDB = require("./src/config/db.cjs");
>>>>>>> d7d3174 (new push)

const app = express();

// Middleware
app.use(cors({
<<<<<<< HEAD
  origin: ['http://localhost:5173', 'http://localhost:3000'],
=======
  origin: ['http://localhost:5173', 'http://localhost:8000'],
>>>>>>> d7d3174 (new push)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

<<<<<<< HEAD
// Add COOP headers to prevent popup blocking
=======
// COOP headers
>>>>>>> d7d3174 (new push)
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

<<<<<<< HEAD
// Request logging middleware
=======
// Logging middleware
>>>>>>> d7d3174 (new push)
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});

<<<<<<< HEAD
// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://physiquiz:0vh7aFYgpoz90AsR@cluster0.kpsduay.mongodb.net/physicslearn?retryWrites=true&w=majority&appName=Cluster0';

// Set mongoose options
mongoose.set('strictQuery', false);
mongoose.set('bufferTimeoutMS', 30000); // Increase buffer timeout to 30 seconds

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of default 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  })
  .then(() => {
    console.log('✓ Connected to MongoDB');
    console.log('✓ Database:', mongoose.connection.name);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('⚠️  Please check:');
    console.error('   1. Your IP is whitelisted in MongoDB Atlas Network Access');
    console.error('   2. Your credentials are correct');
    console.error('   3. Your cluster is running');
    process.exit(1); // Exit if cannot connect to database
  });

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});

// Routes
app.use('/api/auth', require('./routes/auth.cjs'));
app.use('/api/users', require('./routes/users.cjs'));
app.use('/api/lessons', require('./routes/lessons.cjs'));
app.use('/api/challenges', require('./routes/challenges.cjs'));
=======
// Connect MongoDB Local
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes.cjs'));
app.use('/api/users', require('./routes/users.cjs'));
app.use('/api/lessons', require('./routes/lessons.cjs'));
app.use('/api/challenges', require('./routes/challenges.cjs'));
app.use('/api/lesson-completions', require('./routes/lessonCompletions.cjs'));
app.use('/api/game-results', require('./routes/gameResults.cjs'));
>>>>>>> d7d3174 (new push)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

<<<<<<< HEAD
// Error handling middleware
=======
app.get('/viet', (req, res)=> {
  res.json({ status: "OK", message: "Viet" });
})
// Error handling
>>>>>>> d7d3174 (new push)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

<<<<<<< HEAD
const PORT = process.env.PORT || 5000;
=======
const PORT = process.env.PORT || 8000;
>>>>>>> d7d3174 (new push)

app.listen(PORT, () => {
  console.log(`✓ Server is running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

const express = require('express');
const cors = require('cors');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

// Verify Supabase connection
const { supabase } = require('./src/config/supabase.cjs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add COOP headers to prevent popup blocking
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});

// Test Supabase connection
(async () => {
  try {
    const { data, error } = await supabase.from('users').select('id', { count: 'exact', head: true });
    if (error && error.code !== '42P01') {
      console.error('❌ Supabase connection error:', error.message);
      console.error('⚠️  Please check:');
      console.error('   1. SUPABASE_URL is correct in .env');
      console.error('   2. SUPABASE_SERVICE_ROLE_KEY is correct in .env');
      console.error('   3. Database schema has been created (run supabase_schema.sql)');
    } else {
      console.log('✓ Connected to Supabase');
      console.log('✓ Database: PostgreSQL (Supabase)');
    }
  } catch (err) {
    console.error('❌ Supabase connection error:', err.message);
  }
})();

// Routes
app.use('/api/auth', require('./routes/auth.cjs'));
app.use('/api/users', require('./routes/users.cjs'));
app.use('/api/email', require('./routes/email.cjs'));
app.use('/api/lessons', require('./routes/lessons.cjs'));
app.use('/api/challenges', require('./routes/challenges.cjs'));
app.use('/api/battles', require('./routes/battles.cjs'));
app.use('/api/quests', require('./routes/quests.cjs'));
app.use('/api/leaderboard', require('./routes/leaderboard.cjs'));
app.use('/api/auth', require('./routes/authRoutes.cjs'));
app.use('/api/game-results', require('./routes/gameResults.cjs'));
app.use('/api/lesson-completions', require('./routes/lessonCompletions.cjs'));
app.use('/api/study-progress', require('./routes/StudyProgress.cjs'));
app.use('/api/games-progress', require('./routes/GamesProgress.cjs'));
app.use('/api/classes', require('./routes/classes.cjs'));

// API Endpoints
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

app.get('/api/settings', (req, res) => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json({
        siteName: 'Eureka',
        siteDescription: 'Nền tảng học Vật lý tương tác',
        maintenanceMode: false,
        allowRegistration: true,
        emailNotifications: true,
        autoBackup: true,
        backupFrequency: 'daily',
        maxUploadSize: 10,
        sessionTimeout: 30
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read settings' });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', database: 'Supabase' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', database: 'Supabase' });
});

// ================================
// SOCKET.IO - PK BATTLE SYSTEM
// ================================

// Store for matchmaking queue and active rooms
const matchmakingQueue = [];
const activeRooms = new Map();
const playerSockets = new Map();

// Sample physics questions for battles
const BATTLE_QUESTIONS = [
  {
    id: 1,
    question: "Đơn vị của lực trong hệ SI là gì?",
    options: ["Joule", "Newton", "Watt", "Pascal"],
    correctAnswer: 1,
    difficulty: "easy",
    points: 100,
    timeLimit: 30
  },
  {
    id: 2,
    question: "Công thức tính vận tốc trung bình là?",
    options: ["v = s/t", "v = a.t", "v = s.t", "v = a/t"],
    correctAnswer: 0,
    difficulty: "easy",
    points: 100,
    timeLimit: 30
  },
  {
    id: 3,
    question: "Định luật bảo toàn năng lượng phát biểu rằng:",
    options: [
      "Năng lượng có thể tự sinh ra",
      "Năng lượng không thể chuyển hóa",
      "Năng lượng không tự sinh ra và không tự mất đi",
      "Năng lượng chỉ tồn tại ở dạng cơ năng"
    ],
    correctAnswer: 2,
    difficulty: "medium",
    points: 150,
    timeLimit: 30
  },
  {
    id: 4,
    question: "Gia tốc trọng trường trên Trái Đất xấp xỉ bằng:",
    options: ["9.8 m/s²", "10 m/s", "9.8 m/s", "10 m/s²"],
    correctAnswer: 0,
    difficulty: "easy",
    points: 100,
    timeLimit: 30
  },
  {
    id: 5,
    question: "Áp suất được tính bằng công thức nào?",
    options: ["P = F.S", "P = F/S", "P = S/F", "P = F + S"],
    correctAnswer: 1,
    difficulty: "easy",
    points: 100,
    timeLimit: 30
  },
  {
    id: 6,
    question: "Công suất của một thiết bị điện có điện trở R khi có dòng điện I chạy qua là:",
    options: ["P = I.R", "P = I².R", "P = I/R", "P = R/I²"],
    correctAnswer: 1,
    difficulty: "medium",
    points: 150,
    timeLimit: 30
  },
  {
    id: 7,
    question: "Hiện tượng khúc xạ ánh sáng xảy ra khi:",
    options: [
      "Ánh sáng đi qua lăng kính",
      "Ánh sáng truyền từ môi trường này sang môi trường khác",
      "Ánh sáng gặp gương phẳng",
      "Ánh sáng đi trong chân không"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    points: 150,
    timeLimit: 30
  },
  {
    id: 8,
    question: "Định luật Ôm phát biểu mối quan hệ giữa:",
    options: [
      "Điện áp, cường độ dòng điện và công suất",
      "Điện áp, cường độ dòng điện và điện trở",
      "Điện trở, công suất và thời gian",
      "Cường độ dòng điện, thời gian và điện lượng"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    points: 100,
    timeLimit: 30
  },
  {
    id: 9,
    question: "Trong dao động điều hòa, gia tốc có giá trị cực đại khi:",
    options: [
      "Vật ở vị trí cân bằng",
      "Vật ở biên dương",
      "Vận tốc cực đại",
      "Vật ở biên (dương hoặc âm)"
    ],
    correctAnswer: 3,
    difficulty: "hard",
    points: 200,
    timeLimit: 30
  },
  {
    id: 10,
    question: "Sóng điện từ truyền trong chân không với vận tốc:",
    options: ["300,000 m/s", "3 × 10⁸ m/s", "3 × 10⁶ m/s", "30,000 km/s"],
    correctAnswer: 1,
    difficulty: "medium",
    points: 150,
    timeLimit: 30
  }
];

// Generate room ID
const generateRoomId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let roomId = '';
  for (let i = 0; i < 6; i++) {
    roomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return roomId;
};

// Get random questions
const getRandomQuestions = (count = 10) => {
  const shuffled = [...BATTLE_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

io.on('connection', (socket) => {
  console.log('🎮 Player connected:', socket.id);

  // Broadcast online players count
  io.emit('pk:players-online', io.sockets.sockets.size);

  // Join matchmaking queue
  socket.on('pk:join-queue', (data) => {
    const { firebaseUid, displayName, avatar, gameSettings } = data;

    playerSockets.set(socket.id, {
      firebaseUid,
      displayName,
      avatar,
      gameSettings,
      socketId: socket.id
    });

    const waitingPlayer = matchmakingQueue.find(p => p.socketId !== socket.id);

    if (waitingPlayer) {
      const roomId = generateRoomId();
      const questions = getRandomQuestions(gameSettings?.totalQuestions || 10);

      activeRooms.set(roomId, {
        roomId,
        players: [], // Will join via pk:join-room in PKBattleRoom
        questions,
        currentQuestion: 0,
        scores: {},
        gameSettings,
        status: 'waiting'
      });

      const idx = matchmakingQueue.findIndex(p => p.socketId === waitingPlayer.socketId);
      if (idx > -1) matchmakingQueue.splice(idx, 1);

      const player1Socket = io.sockets.sockets.get(waitingPlayer.socketId);
      const player2Socket = socket;

      if (player1Socket) {
        player1Socket.join(roomId);
        player1Socket.emit('pk:match-found', {
          roomId,
          opponent: playerSockets.get(socket.id),
          questions,
          gameSettings
        });
      }

      player2Socket.join(roomId);
      player2Socket.emit('pk:match-found', {
        roomId,
        opponent: waitingPlayer,
        questions,
        gameSettings
      });

      console.log(`⚔️ Match created: ${roomId}`);
    } else {
      matchmakingQueue.push(playerSockets.get(socket.id));
      socket.emit('pk:queue-position', matchmakingQueue.length);
      console.log(`👤 Player added to queue. Queue size: ${matchmakingQueue.length}`);
    }
  });

  // Leave matchmaking queue
  socket.on('pk:leave-queue', () => {
    const idx = matchmakingQueue.findIndex(p => p.socketId === socket.id);
    if (idx > -1) {
      matchmakingQueue.splice(idx, 1);
      console.log(`👤 Player left queue. Queue size: ${matchmakingQueue.length}`);
    }
  });

  // Join specific room
  socket.on('pk:join-room', async (data) => {
    const { roomId, firebaseUid, displayName, avatar, gameSettings } = data;

    console.log(`📥 pk:join-room received: ${displayName} wants to join room ${roomId}`);

    socket.join(roomId);
    const playerData = { firebaseUid, displayName, avatar, socketId: socket.id };
    playerSockets.set(socket.id, playerData);

    if (!activeRooms.has(roomId)) {
      let dbGameSettings = {};
      try {
        const Battle = require('./models/Battle.cjs');
        const battle = await Battle.findByRoomId(roomId);
        if (battle) {
          dbGameSettings = {
            gameMode: battle.game_mode || 'quiz',
            grade: battle.grade || 'all',
            topic: battle.topic || 'all',
            difficulty: battle.difficulty || 'mixed',
            totalQuestions: battle.total_questions || 10,
            timePerQuestion: battle.time_per_question || 30
          };
          console.log(`📂 Loaded gameSettings from DB for room ${roomId}:`, dbGameSettings);
        } else {
          console.log(`⚠️ No battle found in DB for room ${roomId}, using client settings`);
          dbGameSettings = gameSettings || {};
        }
      } catch (err) {
        console.log(`⚠️ Error loading battle from DB: ${err.message}`);
        dbGameSettings = gameSettings || {};
      }

      activeRooms.set(roomId, {
        roomId,
        players: [playerData],
        questions: [],
        currentQuestion: 0,
        scores: {},
        gameSettings: dbGameSettings,
        status: 'waiting'
      });
      console.log(`🏠 Room created in memory: ${roomId} by ${displayName}`);
    } else {
      const room = activeRooms.get(roomId);
      const alreadyInRoom = room.players.find(p => p.socketId === socket.id);
      if (room.players.length < 2 && !alreadyInRoom) {
        room.players.push(playerData);
        console.log(`👤 ${displayName} joined room: ${roomId} (now ${room.players.length} players)`);

        const existingPlayer = room.players[0];
        socket.emit('pk:player-joined', {
          firebaseUid: existingPlayer.firebaseUid,
          displayName: existingPlayer.displayName,
          avatar: existingPlayer.avatar
        });
      }
    }

    socket.to(roomId).emit('pk:player-joined', { firebaseUid, displayName, avatar });

    const room = activeRooms.get(roomId);
    if (room && room.players.length === 2 && room.status === 'waiting') {
      room.status = 'playing';
      console.log(`⚔️ Battle starting in room: ${roomId}`);

      setTimeout(() => {
        io.to(roomId).emit('pk:game-start', {
          gameSettings: room.gameSettings,
          questions: room.questions?.length ? room.questions : getRandomQuestions(room.gameSettings?.totalQuestions || 10)
        });
      }, 500);
    }
  });

  // Submit answer
  socket.on('pk:submit-answer', (data) => {
    const { roomId, questionIndex, answer, isCorrect, pointsEarned, responseTime } = data;

    const room = activeRooms.get(roomId);
    if (room) {
      const player = playerSockets.get(socket.id);
      if (player) {
        room.scores[player.firebaseUid] = (room.scores[player.firebaseUid] || 0) + pointsEarned;
      }

      socket.to(roomId).emit('pk:opponent-answered', {
        questionIndex,
        opponentScore: room.scores[player?.firebaseUid] || 0
      });
    }
  });

  // Player finished all rounds
  socket.on('pk:player-finished', (data) => {
    const { roomId } = data;
    const room = activeRooms.get(roomId);
    if (room) {
      const player = playerSockets.get(socket.id);
      if (player) {
        if (!room.finishedPlayers) {
          room.finishedPlayers = new Set();
        }
        room.finishedPlayers.add(player.firebaseUid);
        console.log(`🏁 Player ${player.displayName} finished in room ${roomId}. Total finished: ${room.finishedPlayers.size}/${room.players.length}`);

        // Check if all active players in the room have finished
        // (or if only 1 player is left in the room)
        const activePlayerUids = room.players.map(p => p.firebaseUid);
        const allFinished = activePlayerUids.every(uid => room.finishedPlayers.has(uid));

        if (allFinished || room.players.length < 2) {
          // Calculate winner based on scores
          let winnerUid = 'draw';
          const p1 = room.players[0];
          const p2 = room.players[1];
          
          if (p1 && p2) {
            const score1 = room.scores[p1.firebaseUid] || 0;
            const score2 = room.scores[p2.firebaseUid] || 0;
            if (score1 > score2) {
              winnerUid = p1.firebaseUid;
            } else if (score2 > score1) {
              winnerUid = p2.firebaseUid;
            }
          } else if (p1) {
            winnerUid = p1.firebaseUid;
          }

          console.log(`🏆 Game ended in room ${roomId}. Winner: ${winnerUid}`);
          io.to(roomId).emit('pk:game-end', {
            scores: room.scores,
            winner: winnerUid
          });
        }
      }
    }
  });

  // Leave room
  socket.on('pk:leave-room', (data) => {
    const { roomId } = data;
    socket.leave(roomId);
    
    const room = activeRooms.get(roomId);
    if (room) {
      const playerIdx = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIdx > -1) {
        const removedPlayer = room.players.splice(playerIdx, 1)[0];
        console.log(`🚪 ${removedPlayer.displayName} left room ${roomId}`);
        socket.to(roomId).emit('pk:player-left', { displayName: removedPlayer.displayName });
        
        // Remove from finished list
        if (room.finishedPlayers) {
          room.finishedPlayers.delete(removedPlayer.firebaseUid);
        }

        // If remaining player is alone, end game if they finished
        if (room.players.length === 1) {
          const remainingPlayer = room.players[0];
          if (room.finishedPlayers && room.finishedPlayers.has(remainingPlayer.firebaseUid)) {
            io.to(roomId).emit('pk:game-end', {
              scores: room.scores,
              winner: remainingPlayer.firebaseUid
            });
          }
        }

        if (room.players.length === 0) {
          activeRooms.delete(roomId);
        }
      }
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('👋 Player disconnected:', socket.id);

    const idx = matchmakingQueue.findIndex(p => p.socketId === socket.id);
    if (idx > -1) matchmakingQueue.splice(idx, 1);

    for (const [roomId, room] of activeRooms.entries()) {
      const playerIdx = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIdx > -1) {
        const removedPlayer = room.players.splice(playerIdx, 1)[0];
        console.log(`🚪 ${removedPlayer.displayName} removed from room ${roomId}`);
        io.to(roomId).emit('pk:player-left', { displayName: removedPlayer.displayName });
        
        // Remove from finished list
        if (room.finishedPlayers) {
          room.finishedPlayers.delete(removedPlayer.firebaseUid);
        }

        // If remaining player is alone, end game if they finished
        if (room.players.length === 1) {
          const remainingPlayer = room.players[0];
          if (room.finishedPlayers && room.finishedPlayers.has(remainingPlayer.firebaseUid)) {
            io.to(roomId).emit('pk:game-end', {
              scores: room.scores,
              winner: remainingPlayer.firebaseUid
            });
          }
        }

        if (room.players.length === 0) {
          activeRooms.delete(roomId);
          console.log(`🗑️ Room ${roomId} deleted (empty)`);
        }
      }
    }

    playerSockets.delete(socket.id);
    io.emit('pk:players-online', io.sockets.sockets.size);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5002;

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`✓ Server is running on port ${PORT}`);
    console.log(`✓ Socket.io enabled for PK Battle`);
    console.log(`✓ Database: Supabase (PostgreSQL)`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;

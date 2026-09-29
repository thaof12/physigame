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
// Allowed origins for CORS (local dev + Vercel production)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://eureka-th.vercel.app',
  /https:\/\/.*\.vercel\.app$/,  // Match any Vercel preview deployment
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(allowed =>
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    );
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

const io = new Server(server, {
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add COOP headers to prevent popup blocking
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// Request logging middleware (filter out high frequency pings to prevent I/O lag)
app.use((req, res, next) => {
  if (!req.url.startsWith('/api/users/check-status') && !req.url.startsWith('/api/health')) {
    console.log(`📝 ${req.method} ${req.url}`);
  }
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
app.use('/api/users', require('./routes/users.cjs')); // Teacher application route included
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
app.use('/api/reports', require('./routes/reports.cjs'));
app.use('/api/support', require('./routes/support.cjs'));

// API Endpoints - System Settings (Persistent across local and Vercel serverless)
const SETTINGS_FILE = path.join(__dirname, 'settings.json');
const SYSTEM_SETTINGS_UUID = '00000000-0000-0000-0000-000000000007';

let cachedSettings = null;
let cachedSettingsTime = 0;
const SETTINGS_CACHE_TTL = 10000; // 10 seconds cache

const defaultSettings = {
  siteName: 'Eureka',
  siteDescription: 'Nền tảng học Vật lý tương tác',
  maintenanceMode: false,
  allowRegistration: true,
  emailNotifications: true,
  autoBackup: true,
  backupFrequency: 'daily',
  maxUploadSize: 10,
  sessionTimeout: 30
};

app.get('/api/settings', async (req, res) => {
  try {
    const now = Date.now();
    if (cachedSettings && (now - cachedSettingsTime < SETTINGS_CACHE_TTL)) {
      return res.json(cachedSettings);
    }

    // 1. Try reading from Supabase persistent storage (works everywhere, including Vercel Serverless)
    try {
      const { data: dbData } = await supabase
        .from('teacher_notifications')
        .select('content')
        .eq('teacher_id', SYSTEM_SETTINGS_UUID)
        .eq('title', 'system_settings_config')
        .maybeSingle();

      if (dbData?.content) {
        const parsed = typeof dbData.content === 'string' ? JSON.parse(dbData.content) : dbData.content;
        cachedSettings = { ...defaultSettings, ...parsed };
        cachedSettingsTime = now;
        return res.json(cachedSettings);
      }
    } catch (dbErr) {
      console.warn('⚠️ [Settings] Supabase read fallback:', dbErr.message);
    }

    // 2. Fallback to local settings.json if exists
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
        cachedSettings = { ...defaultSettings, ...JSON.parse(data) };
        cachedSettingsTime = now;
        return res.json(cachedSettings);
      }
    } catch (fsErr) {}

    cachedSettings = defaultSettings;
    cachedSettingsTime = now;
    return res.json(defaultSettings);
  } catch (error) {
    if (cachedSettings) return res.json(cachedSettings);
    res.json(defaultSettings);
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const newSettings = { ...defaultSettings, ...(cachedSettings || {}), ...(req.body || {}) };

    // 1. Update in-memory cache immediately
    cachedSettings = newSettings;
    cachedSettingsTime = Date.now();

    // 2. Persist to Supabase so it survives Vercel serverless restarts & instances
    try {
      await supabase
        .from('teacher_notifications')
        .delete()
        .eq('teacher_id', SYSTEM_SETTINGS_UUID)
        .eq('title', 'system_settings_config');

      await supabase
        .from('teacher_notifications')
        .insert({
          teacher_id: SYSTEM_SETTINGS_UUID,
          title: 'system_settings_config',
          content: JSON.stringify(newSettings),
          is_read: false
        });
      console.log('✅ [Settings] Saved to Supabase persistent store');
    } catch (dbErr) {
      console.warn('⚠️ [Settings] Supabase save warning:', dbErr.message);
    }

    // 3. Try writing to local file if environment allows (safe on read-only serverless)
    try {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
    } catch (fsErr) {
      // Safely ignore read-only file system on Vercel
      console.log('ℹ️ [Settings] Read-only filesystem detected on serverless, persisted in Supabase');
    }

    res.json({ success: true, settings: newSettings });
  } catch (error) {
    console.error('❌ [Settings] Save error:', error);
    res.status(500).json({ error: 'Failed to save settings: ' + error.message });
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

// Sample physics questions for battles organized by grade
const quizQuestions = {
  '6': [
    {
      id: "q6-1",
      question: "Đơn vị đo độ dài hợp pháp của nước Việt Nam là gì?",
      options: [
        "Mét (m)",
        "Ki-lô-mét (km)",
        "Xăng-ti-mét (cm)",
        "Mi-li-mét (mm)"
      ],
      correctAnswer: 0,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-2",
      question: "Giới hạn đo (GHĐ) của một thước đo là gì?",
      options: [
        "Độ dài nhỏ nhất ghi trên thước.",
        "Độ dài giữa hai vạch chia liên tiếp trên thước.",
        "Độ dài lớn nhất ghi trên thước.",
        "Độ dài của cây thước đó."
      ],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-3",
      question: "Khi đo thể tích chất lỏng bằng bình chia độ, ta cần đặt mắt nhìn như thế nào?",
      options: [
        "Đặt mắt nhìn từ trên xuống.",
        "Đặt mắt nhìn từ dưới lên.",
        "Đặt mắt nhìn ngang với độ cao mực chất lỏng trong bình.",
        "Đặt mắt nhìn xiên."
      ],
      correctAnswer: 2,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-4",
      question: "Dụng cụ nào sau đây dùng để đo khối lượng?",
      options: [
        "Cân",
        "Bình chia độ",
        "Lực kế",
        "Thước"
      ],
      correctAnswer: 0,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-5",
      question: "Một lít (1 lít) tương đương với thể tích nào sau đây?",
      options: [
        "1 m³",
        "1 mm³",
        "1 cm³",
        "1 dm³"
      ],
      correctAnswer: 3,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-6",
      question: "Gió thổi vào buồm làm thuyền buồm chuyển động. Lực nào đã gây ra tác dụng đó?",
      options: [
        "Lực cản của nước.",
        "Lực đẩy của gió.",
        "Lực hút của trái đất.",
        "Lực căng của dây buồm."
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-7",
      question: "Khi một quả bóng đập vào một bức tường thì lực mà bức tường tác dụng lên quả bóng sẽ gây ra kết quả gì?",
      options: [
        "Làm biến đổi chuyển động của quả bóng.",
        "Chỉ làm biến dạng quả bóng.",
        "Làm bức tường chuyển động.",
        "Không làm biến dạng cũng không làm biến đổi chuyển động."
      ],
      correctAnswer: 0,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-8",
      question: "Hai lực cân bằng là hai lực như thế nào?",
      options: [
        "Mạnh như nhau, khác phương, ngược chiều.",
        "Mạnh như nhau, cùng phương nhưng ngược chiều, cùng tác dụng vào một vật.",
        "Mạnh như nhau, cùng phương, cùng chiều.",
        "Tác dụng vào hai vật khác nhau."
      ],
      correctAnswer: 1,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-9",
      question: "Trọng lực là gì?",
      options: [
        "Lực hút của Trái Đất tác dụng lên vật.",
        "Lực làm vật nổi trên mặt nước.",
        "Lực ma sát của không khí.",
        "Lực đẩy của Trái Đất lên vật."
      ],
      correctAnswer: 0,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-10",
      question: "Trọng lượng của một quả cân 100 g là bao nhiêu?",
      options: [
        "0,1 N",
        "1 N",
        "100 N",
        "10 N"
      ],
      correctAnswer: 1,
      difficulty: "hard",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-11",
      question: "Dụng cụ nào sau đây là một ứng dụng của lò xo có tính chất đàn hồi?",
      options: [
        "Bình chia độ",
        "Lực kế lò xo",
        "Thước cuộn",
        "Cân Robecvan"
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-12",
      question: "Khối lượng riêng của một chất được xác định bằng công thức nào?",
      options: [
        "D = V / m",
        "D = m * V",
        "D = P * V",
        "D = m / V"
      ],
      correctAnswer: 3,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-13",
      question: "Đơn vị của trọng lượng riêng là gì?",
      options: [
        "N",
        "kg/m³",
        "N/m³",
        "kg"
      ],
      correctAnswer: 2,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-14",
      question: "Máy cơ đơn giản nào sau đây không thể làm thay đổi độ lớn của lực (chỉ thay đổi hướng)?",
      options: [
        "Đòn bẩy",
        "Mặt phẳng nghiêng",
        "Ròng rọc cố định",
        "Ròng rọc động"
      ],
      correctAnswer: 2,
      difficulty: "hard",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-15",
      question: "Để kéo một thùng hàng nặng từ mặt đất lên sàn xe tải, người ta thường dùng tấm ván đặt nghiêng. Tấm ván này đóng vai trò là máy cơ đơn giản nào?",
      options: [
        "Đòn bẩy",
        "Mặt phẳng nghiêng",
        "Ròng rọc",
        "Bánh xe"
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-essay-1",
      type: "essay",
      question: "Một sợi dây dãn ra thêm 3 cm khi treo một vật có trọng lượng 2 N. Hỏi nếu treo thêm một vật có trọng lượng 4 N nữa (tổng cộng là 6 N) thì sợi dây sẽ dãn ra tổng cộng bao nhiêu xăng-ti-mét?",
      correctAnswer: "9 cm",
      explanation: "Độ dãn tỉ lệ thuận với trọng lượng treo. 2 N dãn 3 cm nên 6 N (gấp 3 lần) sẽ dãn 3 * 3 = 9 cm.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-essay-2",
      type: "essay",
      question: "Hãy nêu tên dụng cụ dùng để đo lực trong Vật Lý.",
      correctAnswer: "lực kế",
      explanation: "Lực kế là dụng cụ dùng để đo độ lớn của một lực.",
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-essay-3",
      type: "essay",
      question: "Một khối đá có thể tích là 0,5 m3 và có khối lượng riêng là 2600 kg/m3. Tính khối lượng của khối đá đó. (Ghi rõ số và đơn vị).",
      correctAnswer: "1300 kg",
      explanation: "Áp dụng công thức m = D * V = 2600 * 0,5 = 1300 kg.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-essay-4",
      type: "essay",
      question: "Khi treo một quả nặng vào đầu dưới của một lò xo được gắn cố định trên giá đỡ, quả nặng đứng yên. Hãy cho biết quả nặng đứng yên chịu tác dụng của hai lực cân bằng nào?",
      correctAnswer: "trọng lực và lực đàn hồi",
      explanation: "Quả nặng chịu tác dụng của trọng lực hướng xuống dưới và lực đàn hồi của lò xo kéo ngược lên trên.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q6-essay-5",
      type: "essay",
      question: "Muốn đi xe đạp lên một con dốc đỡ mệt hơn (tốn ít lực hơn), ta nên đi thẳng băng lên dốc hay đi theo đường ngoằn ngoèo từ bên này sang bên kia dốc?",
      correctAnswer: "đi theo đường ngoằn ngoèo",
      explanation: "Đi đường ngoằn ngoèo làm giảm độ dốc (tăng chiều dài mặt phẳng nghiêng), giúp lực đạp nhỏ hơn, đỡ mệt hơn.",
      difficulty: "easy",
      points: 100,
      category: "physics"
    }
  ],
  '7': [
    {
      id: "q7-1",
      question: "Ta nhìn thấy một vật khi nào?",
      options: [
        "Khi vật được chiếu sáng.",
        "Khi mắt ta phát ra các tia sáng chiếu vào vật.",
        "Khi có ánh sáng từ vật đó truyền vào mắt ta.",
        "Khi vật có kích thước đủ lớn."
      ],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-2",
      question: "Trong môi trường trong suốt và đồng tính, ánh sáng truyền đi theo đường nào?",
      options: ["Đường cong.", "Đường thẳng.", "Đường gấp khúc.", "Đường làn sóng."],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-3",
      question: "Định luật phản xạ ánh sáng quy định tia phản xạ nằm trong cùng mặt phẳng với tia tới và pháp tuyến, đồng thời góc phản xạ (i') và góc tới (i) có quan hệ thế nào?",
      options: ["i' > i", "i' < i", "i' = i", "i' = 2i"],
      correctAnswer: 2,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-4",
      question: "Ảnh của một vật tạo bởi gương phẳng có tính chất nào sau đây?",
      options: [
        "Là ảnh ảo, lớn bằng vật.",
        "Là ảnh ảo, lớn hơn vật.",
        "Là ảnh thật, lớn bằng vật.",
        "Là ảnh thật, nhỏ hơn vật."
      ],
      correctAnswer: 0,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-5",
      question: "So với một vật đặt trước gương, vùng nhìn thấy của gương cầu lồi như thế nào so với vùng nhìn thấy của gương phẳng có cùng kích thước?",
      options: ["Hẹp hơn.", "Rộng hơn.", "Bằng nhau.", "Không thể so sánh được."],
      correctAnswer: 1,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-6",
      question: "Số dao động trong một giây được gọi là gì?",
      options: ["Biên độ dao động.", "Vận tốc dao động.", "Tần số dao động.", "Thời gian dao động."],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-7",
      question: "Âm phát ra càng cao (càng bổng) khi nào?",
      options: [
        "Tần số dao động càng lớn.",
        "Tần số dao động càng nhỏ.",
        "Biên độ dao động càng lớn.",
        "Vật dao động càng mạnh."
      ],
      correctAnswer: 0,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-8",
      question: "Độ to của âm được đo bằng đơn vị nào?",
      options: ["Héc (Hz)", "Mét trên giây (m/s)", "Đề-xi-ben (dB)", "Niêu-tơn (N)"],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-9",
      question: "Âm thanh truyền nhanh nhất trong môi trường nào sau đây?",
      options: ["Chất rắn.", "Chất lỏng.", "Chất khí.", "Chân không."],
      correctAnswer: 0,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-10",
      question: "Vật nào sau đây phản xạ âm tốt (hấp thụ âm kém)?",
      options: ["Miếng xốp.", "Tấm thảm len.", "Mặt gương phẳng.", "Đệm cao su."],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-11",
      question: "Có thể làm cho một thước nhựa nhiễm điện bằng cách nào?",
      options: ["Cọ xát thước nhựa vào mảnh vải khô.", "Nung nóng thước nhựa.", "Nhúng thước nhựa vào nước ấm.", "Phơi thước nhựa ra ngoài nắng."],
      correctAnswer: 0,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-12",
      question: "Hai điện tích cùng loại (ví dụ cùng nhiễm điện dương) khi đặt gần nhau sẽ có hiện tượng gì?",
      options: ["Hút nhau.", "Đẩy nhau.", "Không có tác dụng gì.", "Vừa hút vừa đẩy."],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-13",
      question: "Dòng điện là dòng các điện tích dịch chuyển như thế nào?",
      options: ["Dịch chuyển hỗn loạn.", "Dịch chuyển có hướng.", "Dịch chuyển đứng yên.", "Dịch chuyển vòng tròn."],
      correctAnswer: 1,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-14",
      question: "Chất nào sau đây là chất cách điện?",
      options: ["Đồng", "Nhôm", "Nhựa", "Sắt"],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-15",
      question: "Tác dụng nào của dòng điện được ứng dụng để làm bóng đèn dây tóc phát sáng?",
      options: ["Tác dụng từ", "Tác dụng nhiệt", "Tác dụng hóa học", "Tác dụng sinh lí"],
      correctAnswer: 1,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-essay-1",
      type: "essay",
      question: "Một người đứng cách một vách đá 17 mét và hét to. Biết vận tốc truyền âm trong không khí là 340 m/s. Hỏi sau bao nhiêu giây kể từ khi hét thì người đó nghe thấy tiếng vang của chính mình?",
      correctAnswer: "0.1 s",
      explanation: "Quãng đường âm đi từ người đến vách đá rồi quay lại là S = 17 * 2 = 34 m. Thời gian nghe thấy tiếng vang là t = S / v = 34 / 340 = 0,1 giây.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-essay-2",
      type: "essay",
      question: "Điền từ còn thiếu vào chỗ trống: Chiều dòng điện là chiều từ cực ...... qua dây dẫn và các thiết bị điện tới cực âm của nguồn điện.",
      correctAnswer: "dương",
      explanation: "Theo quy ước, chiều dòng điện đi từ cực dương qua mạch ngoài về cực âm của nguồn điện.",
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-essay-3",
      type: "essay",
      question: "Trong 10 giây, một lá thép thực hiện được 500 dao động. Hãy tính tần số dao động của lá thép đó (chỉ ghi số và đơn vị Hz).",
      correctAnswer: "50 Hz",
      explanation: "Tần số là số dao động trong 1 giây: f = 500 / 10 = 50 Hz.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-essay-4",
      type: "essay",
      question: "Chiếu một tia sáng lên một gương phẳng sao cho góc tới bằng 40 độ. Hỏi góc hợp bởi tia tới và tia phản xạ bằng bao nhiêu độ? (Chỉ ghi số và đơn vị độ hoặc viết tắt).",
      correctAnswer: "80 độ",
      explanation: "Theo định luật phản xạ, góc phản xạ bằng góc tới (40 độ). Góc hợp bởi tia tới và tia phản xạ là i + i' = 40 + 40 = 80 độ.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q7-essay-5",
      type: "essay",
      question: "Hãy nêu tên dụng cụ dùng để đo cường độ dòng điện trong mạch điện.",
      correctAnswer: "ampe kế",
      explanation: "Ampe kế là dụng cụ chuyên dụng dùng để đo cường độ dòng điện.",
      difficulty: "easy",
      points: 100,
      category: "physics"
    }
  ],
  '8': [
    {
      id: "q8-1",
      question: "Chuyển động của một vật được coi là chuyển động đều khi nào?",
      options: [
        "Vận tốc có độ lớn không thay đổi theo thời gian.",
        "Vật đi được những quãng đường bằng nhau.",
        "Quỹ đạo chuyển động của vật là một đường thẳng.",
        "Vận tốc của vật lúc tăng lúc giảm."
      ],
      correctAnswer: 0,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-2",
      question: "Lực ma sát trượt xuất hiện trong trường hợp nào sau đây?",
      options: [
        "Một quả bóng đang lăn trên sân cỏ.",
        "Một chiếc vali nằm yên trên băng chuyền hành lý.",
        "Khi ta phanh xe, má phanh ép sát và cọ xát vào vành bánh xe đang quay.",
        "Đặt một cuốn sách nằm yên trên mặt bàn nằm nghiêng."
      ],
      correctAnswer: 2,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-3",
      question: "Công thức nào sau đây dùng để tính áp suất?",
      options: [
        "p = F * S",
        "p = F / S",
        "p = S / F",
        "p = d * V"
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-4",
      question: "Càng lên cao thì áp suất khí quyển thay đổi như thế nào?",
      options: [
        "Càng tăng.",
        "Không thay đổi.",
        "Càng giảm.",
        "Lúc tăng lúc giảm tùy thời tiết."
      ],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-5",
      question: "Một vật nhúng trong chất lỏng chịu tác dụng của lực đẩy Ác-si-mét. Lực này có đặc điểm gì?",
      options: [
        "Phương thẳng đứng, chiều từ trên xuống dưới.",
        "Phương nằm ngang, chiều từ trái sang phải.",
        "Phương thẳng đứng, chiều từ dưới lên trên.",
        "Phương xiên góc, hướng vào tâm vật."
      ],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-6",
      question: "Một vật sẽ nổi lên trên mặt chất lỏng khi nào? (Gọi d_v là trọng lượng riêng của vật, d_l là trọng lượng riêng của chất lỏng)",
      options: [
        "d_v > d_l",
        "d_v = d_l",
        "d_v < d_l",
        "Không phụ thuận vào d_v và d_l"
      ],
      correctAnswer: 2,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-7",
      question: "Trường hợp nào sau đây có công cơ học?",
      options: [
        "Một người lực sĩ đang đỡ quả tạ nặng đứng yên trên cao.",
        "Một học sinh đang ngồi chăm chú đọc sách.",
        "Hòn bi đang lăn đều trên mặt sàn nhẵn phẳng coi như không có ma sát.",
        "Lực kéo của con ngựa làm chiếc xe chuyển động trên đường."
      ],
      correctAnswer: 3,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-8",
      question: "Định luật về công khẳng định các máy cơ đơn giản không cho ta lợi về đường đi thì cho ta lợi về lực. Nhận định nào sau đây là đúng nhất?",
      options: [
        "Không một máy cơ đơn giản nào cho ta lợi về công.",
        "Mặt phẳng nghiêng cho ta lợi về công nhiều nhất.",
        "Ròng rọc động cho ta lợi về công gấp hai lần.",
        "Đòn bẩy luôn cho ta lợi cả về lực lẫn về công."
      ],
      correctAnswer: 0,
      difficulty: "hard",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-9",
      question: "Công suất được xác định bằng đại lượng nào?",
      options: [
        "Công thực hiện được trong một đơn vị thời gian.",
        "Tích của công và thời gian thực hiện.",
        "Thời gian cần thiết để thực hiện một công.",
        "Lực tác dụng trong một đơn vị thời gian."
      ],
      correctAnswer: 0,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-10",
      question: "Cơ năng của một mũi tên được bắn ra từ chiếc cung đang căng thuộc dạng nào?",
      options: [
        "Chỉ có thế năng hấp dẫn.",
        "Chỉ có động năng.",
        "Gồm động năng và thế năng đàn hồi.",
        "Chỉ có thế năng đàn hồi."
      ],
      correctAnswer: 2,
      difficulty: "hard",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-11",
      question: "Các phân tử, nguyên tử cấu tạo nên vật có đặc điểm gì?",
      options: [
        "Luôn đứng yên hoàn toàn trong vật.",
        "Chỉ chuyển động khi vật được đun nóng.",
        "Chuyển động không ngừng về mọi phía.",
        "Chuyển động theo một hướng cố định duy nhất."
      ],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-12",
      question: "Nhiệt năng của một vật là gì?",
      options: [
        "Tổng động năng của các phân tử cấu tạo nên vật.",
        "Tổng thế năng liên kết giữa các nguyên tử.",
        "Năng lượng ánh sáng vật hấp thụ được.",
        "Động năng chuyển động của toàn bộ vật."
      ],
      correctAnswer: 0,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-13",
      question: "Hình thức truyền nhiệt chủ yếu ở môi trường chất rắn là gì?",
      options: [
        "Đối lưu.",
        "Dẫn nhiệt.",
        "Bức xạ nhiệt.",
        "Không có hình thức nào."
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-14",
      question: "Đối lưu là hình thức truyền nhiệt chủ yếu xảy ra trong các môi trường nào?",
      options: [
        "Chất rắn và chất lỏng.",
        "Chất lỏng và chất khí.",
        "Chất khí và chất rắn.",
        "Chân không và chất rắn."
      ],
      correctAnswer: 1,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-15",
      question: "Đơn vị đo nhiệt lượng là gì?",
      options: [
        "Oát (W)",
        "Niêu-tơn (N)",
        "Jun (J)",
        "Ki-lô-gam (kg)"
      ],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-essay-1",
      type: "essay",
      question: "Một người đi bộ đều trên một quãng đường dài 3 km trong thời gian 45 phút. Hãy tính vận tốc của người đó theo đơn vị km/h (chỉ ghi số và đơn vị viết tắt).",
      correctAnswer: "4 km/h",
      explanation: "Đổi 45 phút = 0,75 giờ. Vận tốc v = S / t = 3 / 0,75 = 4 km/h.",
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-essay-2",
      type: "essay",
      question: "Một container có trọng lượng 20000 N, diện tích tiếp xúc của các bánh xe với mặt đường là 0,5 m2. Tính áp suất của container tác dụng lên mặt đường (chỉ ghi số và đơn vị Pa hoặc N/m2).",
      correctAnswer: "40000 Pa",
      explanation: "Áp suất p = F / S = P / S = 20000 / 0,5 = 40000 Pa.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-essay-3",
      type: "essay",
      question: "Một lực sĩ nâng một quả tạ nặng 1200 N lên cao 2 mét trong thời gian 2 giây. Tính công suất của người lực sĩ này (chỉ ghi số và đơn vị W).",
      correctAnswer: "1200 W",
      explanation: "Công thực hiện là A = F * s = 1200 * 2 = 2400 J. Công suất P = A / t = 2400 / 2 = 1200 W.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-essay-4",
      type: "essay",
      question: "Khi ta cọ xát miếng đồng vào một mặt bàn gỗ ráp, miếng đồng nóng lên. Nhiệt năng của miếng đồng thay đổi bằng cách thực hiện công hay truyền nhiệt?",
      correctAnswer: "thực hiện công",
      explanation: "Việc cọ xát là tác dụng lực làm dịch chuyển cơ học, tức là làm thay đổi nhiệt năng của vật bằng cách thực hiện công.",
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q8-essay-5",
      type: "essay",
      question: "Cần cung cấp một nhiệt lượng bao nhiêu để đun nóng 2 kg nước từ 20 độ C lên 80 độ C? Biết nhiệt dung riêng của nước là 4200 J/kg.K (chỉ ghi số và đơn vị J).",
      correctAnswer: "504000 J",
      explanation: "Độ tăng nhiệt độ dt = 80 - 20 = 60 độ C. Nhiệt lượng Q = m * c * dt = 2 * 4200 * 60 = 504000 J.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    }
  ],
  '9': [
    {
      id: "q9-1",
      question: "Hệ thức của định luật Ôm đối với đoạn mạch chỉ chứa điện trở là gì?",
      options: [
        "I = U / R",
        "I = U * R",
        "R = U / I",
        "U = I / R"
      ],
      correctAnswer: 0,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-2",
      question: "Khi mắc hai điện trở R1 và R2 song song vào mạch điện, điện trở tương đương (Rtđ) của đoạn mạch được tính theo công thức nào?",
      options: [
        "Rtd = R1 + R2",
        "Rtđ = (R1 * R2) / (R1 + R2)",
        "Rtđ = (R1 + R2) / (R1 * R2)",
        "Rtđ = 1 / R1 + 1 / R2"
      ],
      correctAnswer: 1,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-3",
      question: "Điện trở của một dây dẫn hình trụ, đồng chất phụ thuộc vào những yếu tố nào?",
      options: [
        "Tỉ lệ thuận với chiều dài, tỉ lệ nghịch với tiết diện và phụ thuộc vào vật liệu làm dây.",
        "Tỉ lệ nghịch với chiều dài, tỉ lệ thuận với tiết diện và phụ thuận vào vật liệu làm dây.",
        "Chỉ phụ thuộc vào hiệu điện thế đặt vào hai đầu dây dẫn.",
        "Tỉ lệ thuận với cả chiều dài và tiết diện của dây dẫn."
      ],
      correctAnswer: 0,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-4",
      question: "Công thức nào sau đây KHÔNG PHẢI là công thức tính công suất điện P?",
      options: [
        "P = U * I",
        "P = I² * R",
        "P = U² / R",
        "P = U * I²"
      ],
      correctAnswer: 3,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-5",
      question: "Theo định luật Jun - Len-xơ, nhiệt lượng tỏa ra trên một dây dẫn tỉ lệ thuận với yếu tố nào?",
      options: [
        "Cường độ dòng điện chạy qua dây dẫn.",
        "Bình phương cường độ dòng điện chạy qua dây dẫn.",
        "Bình phương điện trở của dây dẫn.",
        "Hiệu điện thế đặt vào hai đầu dây."
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-6",
      question: "Để quy tắc nắm tay phải xác định đúng chiều đường sức từ của ống dây, ngón tay cái choãi ra 90 độ chỉ chiều nào?",
      options: [
        "Chiều dòng điện chạy qua các vòng dây.",
        "Chiều của lực điện từ tác dụng lên ống dây.",
        "Chiều của đường sức từ trong lòng ống dây.",
        "Chiều chuyển động của ống dây."
      ],
      correctAnswer: 2,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-7",
      question: "Lực do từ trường tác dụng lên một đoạn dây dẫn có dòng điện chạy qua đặt trong từ trường được gọi là gì?",
      options: [
        "Lực đàn hồi.",
        "Lực điện từ.",
        "Lực ma sát từ.",
        "Lực hấp dẫn."
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-8",
      question: "Điều kiện để xuất hiện dòng điện cảm ứng trong một cuộn dây dẫn kín là gì?",
      options: [
        "Đặt một nam châm đứng yên bên cạnh cuộn dây.",
        "Số đường sức từ xuyên qua tiết diện S của cuộn dây biến thiên (tăng hoặc giảm).",
        "Cho dòng điện một chiều chạy qua cuộn dây.",
        "Giữ cho số đường sức từ xuyên qua tiết diện cuộn dây luôn không đổi."
      ],
      correctAnswer: 1,
      difficulty: "hard",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-9",
      question: "Để giảm hao phí do tỏa nhiệt trên đường dây tải điện đi xa, biện pháp nào hiệu quả và kinh tế nhất?",
      options: [
        "Giảm điện trở của dây dẫn bằng cách dùng dây thật to.",
        "Thay dây đồng bằng dây bạc nguyên chất.",
        "Tăng hiệu điện thế đặt vào hai đầu dây tải điện trước khi truyền tải.",
        "Giảm công suất điện cần truyền đi ở nơi cấp."
      ],
      correctAnswer: 2,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-10",
      question: "Máy biến thế có tác dụng gì?",
      options: [
        "Biến đổi dòng điện một chiều thành dòng điện xoay chiều.",
        "Làm thay đổi công suất của dòng điện trong mạch.",
        "Biến đổi hiệu điện thế của dòng điện xoay chiều.",
        "Giữ cho hiệu điện thế luôn ổn định không đổi."
      ],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-11",
      question: "Hiện tượng tia sáng bị gãy khúc tại mặt phân cách khi truyền từ môi trường trong suốt này sang môi trường trong suốt khác gọi là gì?",
      options: [
        "Hiện tượng phản xạ ánh sáng.",
        "Hiện tượng khúc xạ ánh sáng.",
        "Hiện tượng phân tán ánh sáng.",
        "Hiện tượng tán xạ ánh sáng."
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-12",
      question: "Một thấu kính hội tụ thường có đặc điểm hình học nào?",
      options: [
        "Có phần rìa dày hơn phần giữa.",
        "Có độ dày đều nhau ở mọi điểm.",
        "Có phần rìa mỏng hơn phần giữa.",
        "Mặt thấu kính luôn là mặt phẳng tuyệt đối."
      ],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-13",
      question: "Về mặt quang học, hai bộ phận quan trọng nhất của mắt tương đương với thấu kính hội tụ và màn hứng ảnh trong máy ảnh là gì?",
      options: [
        "Thể thủy tinh và màng lưới (võng mạc).",
        "Giác mạc và lòng đen.",
        "Màng lưới và con ngươi.",
        "Thể thủy tinh và giác mạc."
      ],
      correctAnswer: 0,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-14",
      question: "Mắt cận thị là mắt có đặc điểm nào và cần khắc phục bằng loại thấu kính nào?",
      options: [
        "Chỉ nhìn rõ các vật ở xa, cần đeo thấu kính hội tụ.",
        "Chỉ nhìn rõ các vật ở gần, cần đeo thấu kính phân kỳ.",
        "Chỉ nhìn rõ các vật ở gần, cần đeo thấu kính hội tụ.",
        "Không nhìn rõ cả xa lẫn gần, cần đeo gương phẳng."
      ],
      correctAnswer: 1,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-15",
      question: "Định luật bảo toàn và chuyển hóa năng lượng khẳng định điều gì?",
      options: [
        "Năng lượng có thể tự sinh ra hoặc tự mất đi nếu có tác động hóa học.",
        "Năng lượng không tự sinh ra cũng không tự mất đi, nó chỉ truyền từ vật này sang vật khác, chuyển hóa từ dạng này sang dạng khác.",
        "Tổng năng lượng của một hệ kín luôn tăng dần theo thời gian.",
        "Cơ năng luôn luôn được bảo toàn tuyệt đối trong mọi môi trường có ma sát."
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-essay-1",
      type: "essay",
      question: "Đặt một hiệu điện thế 12 V vào hai đầu một điện trở R thì cường độ dòng điện qua nó là 0,5 A. Tính giá trị của điện trở R đó (chỉ ghi số và đơn vị ôm hoặc ký hiệu ôm).",
      correctAnswer: "24 ôm",
      explanation: "Theo định luật Ôm: R = U / I = 12 / 0,5 = 24 ôm.",
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-essay-2",
      type: "essay",
      question: "Một bóng đèn có ghi 220V - 100W được mắc vào hiệu điện thế đúng 220 V. Hãy tính điện năng tiêu thụ của bóng đèn này trong thời gian 2 giờ theo đơn vị Wh (chỉ ghi số và đơn vị Wh).",
      correctAnswer: "200 Wh",
      explanation: "Vì đèn hoạt động đúng hiệu điện thế định mức nên công suất thực tế P = 100 W. Điện năng tiêu thụ A = P * t = 100 * 2 = 200 Wh.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-essay-3",
      type: "essay",
      question: "Cuộn sơ cấp của một máy biến thế có 4400 vòng, cuộn thứ cấp có 200 vòng. Khi đặt vào hai đầu cuộn sơ cấp một hiệu điện thế xoay chiều 220 V thì hiệu điện thế ở hai đầu cuộn thứ cấp là bao nhiêu vôn? (Chỉ ghi số và đơn vị V).",
      correctAnswer: "10 V",
      explanation: "Áp dụng công thức máy biến thế: U1 / U2 = N1 / N2 => U2 = (U1 * N2) / N1 = (220 * 200) / 4400 = 10 V.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-essay-4",
      type: "essay",
      question: "Một vật sáng AB đặt vuông góc với trục chính của một thấu kính hội tụ và cách thấu kính một khoảng d = 30 cm. Biết tiêu cự của thấu kính f = 10 cm. Xác định khoảng cách từ ảnh thu được đến thấu kính (ký hiệu d') theo đơn vị cm (chỉ ghi số và đơn vị cm).",
      correctAnswer: "15 cm",
      explanation: "Vì d > f nên thấu kính cho ảnh thật. Áp dụng công thức thấu kính hội tụ: 1/f = 1/d + 1/d' => 1/10 = 1/30 + 1/d' => 1/d' = 1/15 => d' = 15 cm.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q9-essay-5",
      type: "essay",
      question: "Khi dòng điện chạy qua một ấm điện để đun nước, điện năng tiêu thụ của ấm đã được chuyển hóa chủ yếu thành dạng năng lượng nào?",
      correctAnswer: "nhiệt năng",
      explanation: "Ấm điện sử dụng tác dụng nhiệt của dòng điện để đun sôi nước, do đó điện năng được chuyển hóa chủ yếu thành nhiệt năng.",
      difficulty: "easy",
      points: 100,
      category: "physics"
    }
  ],
  '10': [
    {
      id: "q10-1",
      question: "Đại lượng nào sau đây là một đại lượng vectơ?",
      options: [
        "Quãng đường đi được.",
        "Thời gian chuyển động.",
        "Độ dịch chuyển.",
        "Tốc độ trung bình."
      ],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-2",
      question: "Công thức tính gia tốc trong chuyển động thẳng biến đổi đều là gì?",
      options: [
        "a = (v - v0) / t",
        "a = (v + v0) / t",
        "a = (v² - v0²) / t",
        "a = v * t"
      ],
      correctAnswer: 0,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-3",
      question: "Một vật được thả rơi tự do từ độ cao h xuống đất tại nơi có gia tốc trọng trường g. Công thức tính vận tốc v của vật ngay trước khi chạm đất là gì?",
      options: [
        "v = g * h",
        "v = √(g * h)",
        "v = 2 * g * h",
        "v = √(2 * g * h)"
      ],
      correctAnswer: 3,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-4",
      question: "Theo định luật I Newton, nếu một vật không chịu tác dụng của lực nào hoặc chịu tác dụng của các lực cân bằng thì vật sẽ như thế nào?",
      options: [
        "Vật đang đứng yên sẽ chuyển động thẳng đều.",
        "Vật sẽ lập tức dừng lại.",
        "Vật đang đứng yên sẽ tiếp tục đứng yên, đang chuyển động sẽ tiếp tục chuyển động thẳng đều.",
        "Vật sẽ chuyển động biến đổi đều."
      ],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-5",
      question: "Đại lượng đặc trưng cho mức quán tính của một vật là gì?",
      options: [
        "Trọng lượng.",
        "Khối lượng.",
        "Vận tốc.",
        "Gia tốc."
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-6",
      question: "Hợp lực của hai lực đồng quy song song cùng chiều F1 và F2 có độ lớn là bao nhiêu?",
      options: [
        "F = F1 - F2",
        "F = √(F1² + F2²)",
        "F = F1 + F2",
        "F = |F1 - F2|"
      ],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-7",
      question: "Quy tắc mômen lực đối với một trục quay cố định phát biểu rằng vật sẽ ở trạng thái cân bằng khi nào?",
      options: [
        "Tổng các mômen lực có xu hướng làm vật quay theo chiều kim đồng hồ bằng tổng các mômen lực có xu hướng làm vật quay ngược chiều kim đồng hồ.",
        "Tổng độ lớn các lực tác dụng lên vật bằng không.",
        "Tích các lực với các cánh tay đòn tương ứng bằng không.",
        "Lực tác dụng hướng thẳng vào tâm quay của trục."
      ],
      correctAnswer: 0,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-8",
      question: "Công của một lực F không đổi tác dụng lên vật làm vật dịch chuyển một đoạn s theo hướng hợp với lực một góc α được tính bằng công thức nào?",
      options: [
        "A = F * s * sin(α)",
        "A = F * s * cos(α)",
        "A = F * s * tan(α)",
        "A = F * s"
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-9",
      question: "Một vật có khối lượng m chuyển động với vận tốc v thì động năng (Wđ) của vật được xác định bằng biểu thức nào?",
      options: [
        "Wđ = m * v²",
        "Wđ = 1/2 * m * v",
        "Wđ = 1/2 * m * v²",
        "Wđ = m * g * h"
      ],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-10",
      question: "Đại lượng nào sau đây đo bằng đơn vị Oát (W)?",
      options: [
        "Công cơ học.",
        "Động năng.",
        "Hiệu suất.",
        "Công suất."
      ],
      correctAnswer: 3,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-11",
      question: "Động lượng của một vật có khối lượng m đang chuyển động với vận tốc v là một đại lượng vectơ được tính bằng công thức nào?",
      options: [
        "p = m * v",
        "p = 1/2 * m * v²",
        "p = m * a",
        "p = F * t"
      ],
      correctAnswer: 0,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-12",
      question: "Trong một hệ kín (hệ cô lập), đại lượng nào sau đây luôn được bảo toàn?",
      options: [
        "Động năng.",
        "Động lượng toàn phần.",
        "Vận tốc của từng vật.",
        "Cơ năng biến đổi."
      ],
      correctAnswer: 1,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-13",
      question: "Va chạm nào sau đây mà sau khi va chạm, hai vật dính vào nhau và chuyển động với cùng một vận tốc?",
      options: [
        "Va chạm đàn hồi.",
        "Va chạm mềm (va chạm không đàn hồi hoàn toàn).",
        "Va chạm siêu đàn hồi.",
        "Va chạm một phần."
      ],
      correctAnswer: 1,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-14",
      question: "Độ dịch chuyển góc θ của một vật chuyển động tròn được xác định bởi công thức nào? (với s là độ dài cung tròn, r là bán kính đường tròn)",
      options: [
        "θ = s * r",
        "θ = r / s",
        "θ = s / r",
        "θ = v / r"
      ],
      correctAnswer: 2,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-15",
      question: "Gia tốc hướng tâm trong chuyển động tròn đều có đặc điểm gì?",
      options: [
        "Độ lớn thay đổi theo thời gian.",
        "Phương tiếp tuyến với quỹ đạo tròn.",
        "Luôn hướng vào tâm của quỹ đạo tròn.",
        "Luôn hướng ra xa tâm của quỹ đạo tròn."
      ],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-essay-1",
      type: "essay",
      question: "Một ô tô đang chạy với vận tốc 10 m/s thì hãm phanh chuyển động thẳng chậm dần đều, sau 5 giây thì dừng lại hẳn. Tính gia tốc của ô tô trong quá trình hãm phanh (chỉ ghi số kèm dấu và đơn vị m/s2).",
      correctAnswer: "-2 m/s2",
      explanation: "Vận tốc lúc sau v = 0 m/s. Gia tốc a = (v - v0) / t = (0 - 10) / 5 = -2 m/s2.",
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-essay-2",
      type: "essay",
      question: "Một vật có khối lượng 2 kg đang đứng yên trên mặt bàn nằm ngang không ma sát. Tác dụng một lực F = 6 N theo phương ngang vào vật. Tính gia tốc mà vật thu được (chỉ ghi số và đơn vị m/s2).",
      correctAnswer: "3 m/s2",
      explanation: "Theo định luật II Newton: a = F / m = 6 / 2 = 3 m/s2.",
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-essay-3",
      type: "essay",
      question: "Một vật có khối lượng 0,5 kg được thả rơi tự do tại nơi có g = 10 m/s2 từ độ cao 20 mét so với mặt đất. Chọn mốc thế năng tại mặt đất, hãy tính cơ năng của vật (chỉ ghi số và đơn vị J).",
      correctAnswer: "100 J",
      explanation: "Lực cản không khí không đáng kể, cơ năng bảo toàn và bằng thế năng cực đại ở vị trí thả: W = Wt_max = m * g * h = 0,5 * 10 * 20 = 100 J.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-essay-4",
      type: "essay",
      question: "Một vật có khối lượng 1 kg chuyển động với vận tốc 4 m/s đến va chạm mềm vào một vật có khối lượng 1 kg khác đang đứng yên. Tính vận tốc của hai vật sau va chạm (chỉ ghi số và đơn vị m/s).",
      correctAnswer: "2 m/s",
      explanation: "Áp dụng định luật bảo toàn động lượng cho va chạm mềm: m1 * v1 = (m1 + m2) * v => 1 * 4 = (1 + 1) * v => v = 2 m/s.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q10-essay-5",
      type: "essay",
      question: "Một ô tô chuyển động đều trên một đường tròn bán kính 100 mét với tốc độ không đổi là 20 m/s. Hãy tính độ lớn gia tốc hướng tâm của ô tô đó (chỉ ghi số và đơn vị m/s2).",
      correctAnswer: "4 m/s2",
      explanation: "Công thức gia tốc hướng tâm: a_ht = v² / r = 20² / 100 = 400 / 100 = 4 m/s2.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    }
  ],
  '11': [
    {
      id: "q11-1",
      question: "Một vật dao động điều hòa dọc theo trục Ox có phương trình x = A * cos(ωt + φ). Đại lượng ω được gọi là gì?",
      options: [
        "Biên độ dao động.",
        "Tần số góc của dao động.",
        "Pha của dao động.",
        "Chu kỳ dao động."
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-2",
      question: "Trong dao động điều hòa của con lắc lò xo, cơ năng của con lắc biến đổi như thế nào?",
      options: [
        "Biên thiên điều hòa theo thời gian cùng chu kỳ với li độ.",
        "Tăng dần khi vật đi từ vị trí biên về vị trí cân bằng.",
        "Được bảo toàn và tỉ lệ thuận với bình phương biên độ dao động.",
        "Biên thiên tuần hoàn với tần số gấp đôi tần số của li độ."
      ],
      correctAnswer: 2,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-3",
      question: "Hiện tượng biên độ của dao động cưỡng bức tăng đến giá trị cực đại khi tần số của lực cưỡng bức bằng tần số dao động riêng của hệ được gọi là gì?",
      options: [
        "Hiện tượng cộng hưởng.",
        "Hiện tượng dao động duy trì.",
        "Hiện tượng tắt dần.",
        "Hiện tượng giao thoa."
      ],
      correctAnswer: 0,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-4",
      question: "Sóng dọc là sóng có các phần tử môi trường dao động theo phương nào?",
      options: [
        "Vuông góc với phương truyền sóng.",
        "Trùng hoặc song song với phương truyền sóng.",
        "Luôn là phương thẳng đứng.",
        "Luôn là phương nằm ngang."
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-5",
      question: "Khoảng cách giữa hai nút sóng hoặc hai bụng sóng liên tiếp trên một sợi dây đang có sóng dừng là bao nhiêu?",
      options: [
        "Một bước sóng (λ).",
        "Một phần tư bước sóng (λ / 4).",
        "Một nửa bước sóng (λ / 2).",
        "Hai lần bước sóng (2λ)."
      ],
      correctAnswer: 2,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-6",
      question: "Trong hiện tượng giao thoa ánh sáng đơn sắc qua khe Y-âng, khoảng vân i được tính bằng công thức nào?",
      options: [
        "i = λ * D / a",
        "i = λ * a / D",
        "i = a * D / λ",
        "i = λ / (a * D)"
      ],
      correctAnswer: 0,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-7",
      question: "Độ lớn của lực tương tác tĩnh điện giữa hai điện tích điểm đặt trong chân không tuân theo định luật Culông tỉ lệ với yếu tố nào?",
      options: [
        "Tỉ lệ thuận với khoảng cách giữa hai điện tích.",
        "Tỉ lệ nghịch với tích độ lớn của hai điện tích.",
        "Tỉ lệ thuận với tích độ lớn của hai điện tích và tỉ lệ nghịch với bình phương khoảng cách giữa chúng.",
        "Tỉ lệ thuận với bình phương khoảng cách giữa hai điện tích."
      ],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-8",
      question: "Đơn vị đo của cường độ điện trường E là gì?",
      options: [
        "Vôn nhân mét (V.m)",
        "Vôn trên mét (V/m)",
        "Cu-lông (C)",
        "Fara (F)"
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-9",
      question: "Đại lượng đặc trưng cho khả năng tích điện của tụ điện ở một hiệu điện thế nhất định gọi là gì?",
      options: [
        "Điện tích cực đại.",
        "Cường độ điện trường tụ.",
        "Điện dung của tụ điện.",
        "Năng lượng điện trường."
      ],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-10",
      question: "Công của lực điện trường dịch chuyển một điện tích q trong điện trường đều E đi một quãng đường d dọc theo chiều đường sức được tính theo biểu thức nào?",
      options: [
        "A = q * E * d",
        "A = q * U²",
        "A = E * d / q",
        "A = q * E / d"
      ],
      correctAnswer: 0,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-11",
      question: "Đại lượng đặc trưng cho khả năng thực hiện công của nguồn điện khi dịch chuyển các điện tích dương bên trong nguồn từ cực âm sang cực dương được gọi là gì?",
      options: [
        "Hiệu điện thế.",
        "Công suất điện.",
        "Suất điện động.",
        "Điện trở trong."
      ],
      correctAnswer: 2,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-12",
      question: "Một dây dẫn có dòng điện không đổi cường độ I chạy qua. Điện lượng q dịch chuyển qua tiết diện thẳng của dây dẫn trong thời gian t được tính bằng công thức nào?",
      options: [
        "q = I / t",
        "q = I * t",
        "q = t / I",
        "q = I * t²"
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-13",
      question: "Định luật Ôm đối với toàn mạch gồm một nguồn điện (E, r) mắc với mạch ngoài có điện trở R phát biểu cường độ dòng điện I bằng gì?",
      options: [
        "I = E / R",
        "I = E / (R - r)",
        "I = E / (R + r)",
        "I = U / r"
      ],
      correctAnswer: 2,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-14",
      question: "Sóng điện từ là sóng như thế nào?",
      options: [
        "Sóng dọc và truyền được trong chân không.",
        "Sóng ngang và truyền được trong chân không.",
        "Sóng dọc và không truyền được trong chân không.",
        "Sóng ngang và không truyền được trong chân không."
      ],
      correctAnswer: 1,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-15",
      question: "Hạt tải điện trong chất điện phân là các loại hạt nào?",
      options: [
        "Các electron tự do.",
        "Các electron tự do và lỗ trống.",
        "Các ion dương và ion âm.",
        "Các ion dương và electron."
      ],
      correctAnswer: 2,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-essay-1",
      type: "essay",
      question: "Một vật dao động điều hòa với chu kỳ T = 0,5 giây. Hãy tính tần số góc của dao động đó theo đơn vị rad/s (lấy pi xấp xỉ 3,14, chỉ ghi số và đơn vị rad/s).",
      correctAnswer: "12.56 rad/s",
      explanation: "Công thức tính tần số góc: ω = 2 * pi / T = 2 * 3,14 / 0,5 = 12,56 rad/s.",
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-essay-2",
      type: "essay",
      question: "Trong thí nghiệm Y-âng về giao thoa ánh sáng, khoảng cách giữa hai khe là 1 mm, khoảng cách từ hai khe đến màn là 2 mét. Người ta đo được khoảng cách từ vân sáng trung tâm đến vân sáng bậc 3 là 3 mm. Tính khoảng vân i của hệ giao thoa (chỉ ghi số và đơn vị mm).",
      correctAnswer: "1 mm",
      explanation: "Vân sáng bậc 3 cách vân trung tâm một khoảng x = 3 * i = 3 mm => i = 1 mm.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-essay-3",
      type: "essay",
      question: "Hai điện tích điểm q1 = 2*10^-9 C và q2 = 4*10^-9 C đặt cách nhau một khoảng r = 3 cm trong chân không. Tính độ lớn lực tương tác Culông giữa chúng (biết k = 9*10^9 N.m2/C2, chỉ ghi số và đơn vị N).",
      correctAnswer: "0.00008 N",
      explanation: "Đổi 3 cm = 0,03 m. Lực F = k * |q1 * q2| / r² = 9*10^9 * (2*10^-9 * 4*10^-9) / 0,03² = 72*10^-9 / 0,0009 = 0,00008 N (hoặc viết 8*10^-5 N).",
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-essay-4",
      type: "essay",
      question: "Một tụ điện có điện dung C = 5 microF được mắc vào hiệu điện thế U = 12 V. Tính điện tích q tích được trên tụ điện theo đơn vị microC (chỉ ghi số và đơn vị microC).",
      correctAnswer: "60 microC",
      explanation: "Công thức điện tích tụ điện: q = C * U = 5 * 12 = 60 microC.",
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q11-essay-5",
      type: "essay",
      question: "Mạch điện gồm nguồn điện có suất điện động E = 9 V, điện trở trong r = 1 ôm cung cấp dòng điện cho mạch ngoài là một điện trở R = 8 ôm. Tính cường độ dòng điện chạy trong mạch (chỉ ghi số và đơn vị A).",
      correctAnswer: "1 A",
      explanation: "Áp dụng định luật Ôm toàn mạch: I = E / (R + r) = 9 / (8 + 1) = 9 / 9 = 1 A.",
      difficulty: "easy",
      points: 100,
      category: "physics"
    }
  ],
  '12': [
    {
      id: "q12-1",
      question: "Nhiệt độ mà tại đó các hạt cấu tạo nên chất dừng chuyển động nhiệt được gọi là gì?",
      options: [
        "0 độ C",
        "0 K (Độ tuyệt đối)",
        "100 độ C",
        "-273 độ C"
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-2",
      question: "Mối liên hệ giữa nhiệt độ Kenvin (T) và nhiệt độ Xen-xi-út (t) được xác định bằng công thức nào?",
      options: [
        "T = t + 273,15",
        "T = t - 273,15",
        "t = T + 273,15",
        "T = 273,15 - t"
      ],
      correctAnswer: 0,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-3",
      question: "Nhiệt lượng cần cung cấp cho một lượng chất rắn trong quá trình nóng chảy hoàn toàn ở nhiệt độ nóng chảy không phụ thuận vào yếu tố nào?",
      options: [
        "Khối lượng của chất rắn.",
        "Nhiệt nóng chảy riêng của chất.",
        "Bản chất của chất rắn.",
        "Thời gian đun chất rắn."
      ],
      correctAnswer: 3,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-4",
      question: "Phương trình trạng thái của khí lí tưởng (Phương trình Claperon - Mendeleev) đối với n mol khí là gì?",
      options: [
        "P * V = n * R / T",
        "P * V = n * R * T",
        "P / V = n * R * T",
        "P * T = n * R * V"
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-5",
      question: "Trong quá trình đẳng nhiệt của một lượng khí lí tưởng xác định, áp suất của chất khí tỉ lệ như thế nào với thể tích?",
      options: [
        "Tỉ lệ thuận.",
        "Tỉ lệ nghịch.",
        "Tỉ lệ với bình phương thể tích.",
        "Không thay đổi khi thể tích thay đổi."
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-6",
      question: "Lực do từ trường tác dụng lên một hạt mang điện tích chuyển động trong từ trường được gọi là gì?",
      options: [
        "Lực Cu-lông.",
        "Lực điện từ tổng hợp.",
        "Lực Lo-ren-xơ (Lorentz).",
        "Lực hấp dẫn từ tính."
      ],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-7",
      question: "Đơn vị của cảm ứng từ B trong hệ SI là gì?",
      options: [
        "Vê-be (Wb)",
        "Hen-ri (H)",
        "Tét-la (T)",
        "Farad (F)"
      ],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-8",
      question: "Theo thuyết lượng tử ánh sáng của Plank và Einstein, năng lượng của mỗi photon ánh sáng đơn sắc phụ thuộc vào yếu tố nào?",
      options: [
        "Cường độ của chùm sáng.",
        "Tần số của ánh sáng đơn sắc đó.",
        "Khoảng cách từ nguồn sáng đến môi trường nhận.",
        "Tốc độ lan truyền của chùm sáng."
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-9",
      question: "Hiện tượng ánh sáng kích thích làm bật các electron ra khỏi bề mặt kim loại được gọi là hiện tượng gì?",
      options: [
        "Hiện tượng quang điện trong.",
        "Hiện tượng quang điện ngoài.",
        "Hiện tượng quang - phát quang.",
        "Hiện tượng phát xạ ion."
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-10",
      question: "Hạt nhân nguyên tử được cấu tạo từ các hạt nào sau đây?",
      options: [
        "Các hạt electron và proton.",
        "Các hạt proton và neutron.",
        "Các hạt electron và neutron.",
        "Chỉ gồm các hạt neutron."
      ],
      correctAnswer: 1,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-11",
      question: "Đại lượng nào sau đây của hạt nhân đặc trưng cho mức độ bền vững của hạt nhân đó?",
      options: [
        "Năng lượng liên kết.",
        "Năng lượng liên kết riêng.",
        "Độ hụt khối.",
        "Số khối A."
      ],
      correctAnswer: 1,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-12",
      question: "Phóng xạ là hiện tượng hạt nhân nguyên tử tự động phát ra các tia phóng xạ và biến đổi thành hạt nhân khác. Quá trình này phụ thuộc vào yếu tố ngoại cảnh nào?",
      options: [
        "Nhiệt độ môi trường cực cao.",
        "Áp suất môi trường xung quanh.",
        "Sự tác động của chất xúc tác hóa học.",
        "Hoàn toàn không phụ thuộc vào các yếu tố ngoại cảnh."
      ],
      correctAnswer: 3,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-13",
      question: "Phản ứng hạt nhân trong đó một hạt nhân rất nặng hấp thụ một neutron chậm rồi vỡ thành hai hạt nhân trung bình gọi là gì?",
      options: [
        "Phản ứng phân hạch.",
        "Phản ứng nhiệt hạch.",
        "Sự phóng xạ alpha.",
        "Phản ứng thu nhiệt."
      ],
      correctAnswer: 0,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-14",
      question: "Tia phóng xạ nào sau đây có bản chất là dòng các hạt nhân của nguyên tử Heli (He 2-4)?",
      options: [
        "Tia beta cộng.",
        "Tia beta trừ.",
        "Tia alpha.",
        "Tia gamma."
      ],
      correctAnswer: 2,
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-15",
      question: "Lực gắn kết các nucleon lại với nhau để hình thành nên hạt nhân nguyên tử bền vững thuộc loại tương tác nào?",
      options: [
        "Tương tác tĩnh điện Culông.",
        "Tương tác hấp dẫn.",
        "Tương tác mạnh (Lực hạt nhân).",
        "Tương tác yếu."
      ],
      correctAnswer: 2,
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-essay-1",
      type: "essay",
      question: "Tính nhiệt lượng cần cung cấp để làm nóng chảy hoàn toàn 2 kg nước đá ở nhiệt độ 0 độ C. Biết nhiệt nóng chảy riêng của nước đá là 3,4*10^5 J/kg (chỉ ghi số và đơn vị J).",
      correctAnswer: "680000 J",
      explanation: "Công thức tính nhiệt lượng nóng chảy: Q = lambda * m = 3,4*10^5 * 2 = 680000 J.",
      difficulty: "easy",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-essay-2",
      type: "essay",
      question: "Một khối khí lí tưởng có thể tích 4 lít ở áp suất 1 atm. Nếu nén đẳng nhiệt khối khí đó xuống thể tích còn 2 lít thì áp suất của khối khí lúc này là bao nhiêu atm? (Chỉ ghi số và đơn vị atm).",
      correctAnswer: "2 atm",
      explanation: "Áp dụng định luật Boy-ler Ma-ri-ốt cho quá trình đẳng nhiệt: P1 * V1 = P2 * V2 => 1 * 4 = P2 * 2 => P2 = 2 atm.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-essay-3",
      type: "essay",
      question: "Một hạt mang điện tích q = 3,2*10^-19 C bay vào một từ trường đều có cảm ứng từ B = 0,5 T với vận tốc v = 10^6 m/s theo phương vuông góc với các đường sức từ. Tính độ lớn lực Lo-ren-xơ tác dụng lên hạt (chỉ ghi số và đơn vị N).",
      correctAnswer: "1.6*10^-13 N",
      explanation: "Công thức lực Lo-ren-xơ: f = |q| * v * B * sin(alpha). Vì bay vuông góc nên sin(90) = 1 => f = 3,2*10^-19 * 10^6 * 0,5 = 1,6*10^-13 N.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-essay-4",
      type: "essay",
      question: "Công thoát electron của một kim loại là A = 3,2*10^-19 J. Tính giới hạn quang điện (bước sóng tối đa có thể gây ra hiện tượng quang điện) của kim loại này theo đơn vị mét (biết h = 6,625*10^-34 J.s và c = 3*10^8 m/s, làm tròn 2 chữ số thập phân sau dấu phẩy của hệ số mũ, ghi dạng số*10^mũ).",
      correctAnswer: "6.21*10^-7 m",
      explanation: "Công thức giới hạn quang điện: lambda_0 = (h * c) / A = (6,625*10^-34 * 3*10^8) / (3,2*10^-19) = 1,9875*10^-25 / 3,2*10^-19 = 6,21*10^-7 m.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    },
    {
      id: "q12-essay-5",
      type: "essay",
      question: "Chất phóng xạ I-ốt (I 53-131) có chu kỳ bán rã là 8 ngày đêm. Ban đầu có một mẫu I-ốt nguyên chất có khối lượng 100 gram. Hỏi sau 24 ngày đêm, khối lượng I-ốt còn lại trong mẫu là bao nhiêu gram? (Chỉ ghi số và đơn vị g).",
      correctAnswer: "12.5 g",
      explanation: "Số chu kỳ bán rã đã trôi qua: k = t / T = 24 / 8 = 3 chu kỳ. Khối lượng còn lại: m = m0 / (2^k) = 100 / (2^3) = 100 / 8 = 12,5 g.",
      difficulty: "medium",
      points: 100,
      category: "physics"
    }
  ]
};

// Generate room ID
const generateRoomId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let roomId = '';
  for (let i = 0; i < 6; i++) {
    roomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return roomId;
};

// Get random questions based on grade and difficulty
const getRandomQuestions = (grade = 'all', difficulty = 'mixed', count = 10) => {
  let allQuestions = [];
  
  if (grade === 'all') {
    Object.values(quizQuestions).forEach(gradeQuestions => {
      allQuestions = [...allQuestions, ...gradeQuestions];
    });
  } else {
    allQuestions = quizQuestions[grade] || [];
  }
  
  if (difficulty !== 'mixed') {
    allQuestions = allQuestions.filter(q => q.difficulty === difficulty);
  }
  
  // If grade is '6', '7', '8', '9', '10', '11', or '12', guarantee some essay questions are mixed in
  if ((grade === '6' || grade === '7' || grade === '8' || grade === '9' || grade === '10' || grade === '11' || grade === '12') && allQuestions.length > 0) {
    const mcQuestions = allQuestions.filter(q => q.type !== 'essay');
    const essayQuestions = allQuestions.filter(q => q.type === 'essay');
    
    if (essayQuestions.length > 0) {
      // Determine target essay count
      let targetEssayCount = 1;
      if (count >= 15) targetEssayCount = 4;
      else if (count >= 10) targetEssayCount = 2;
      
      // Shuffle both lists
      const shuffledMC = mcQuestions.sort(() => Math.random() - 0.5);
      const shuffledEssay = essayQuestions.sort(() => Math.random() - 0.5);
      
      const selectedEssay = shuffledEssay.slice(0, targetEssayCount);
      const selectedMC = shuffledMC.slice(0, count - selectedEssay.length);
      
      // Combine and shuffle the final list
      return [...selectedMC, ...selectedEssay].sort(() => Math.random() - 0.5);
    }
  }
  
  const shuffled = allQuestions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Get exactly 7 MCQs and 3 Essay questions from all grades 6, 7, 8, 9, 10, 11, 12
const getMatchmakingQuestions = () => {
  const grades = ['6', '7', '8', '9', '10', '11', '12'];
  let allMC = [];
  let allEssay = [];

  grades.forEach(grade => {
    const gradeQuestions = quizQuestions[grade] || [];
    gradeQuestions.forEach(q => {
      if (q.type === 'essay') {
        allEssay.push(q);
      } else {
        allMC.push(q);
      }
    });
  });

  // Shuffle and pick 7 MCQs
  const shuffledMC = allMC.sort(() => Math.random() - 0.5);
  const selectedMC = shuffledMC.slice(0, 7);

  // Shuffle and pick 3 Essay questions
  const shuffledEssay = allEssay.sort(() => Math.random() - 0.5);
  const selectedEssay = shuffledEssay.slice(0, 3);

  // Combine and shuffle the final 10 questions
  return [...selectedMC, ...selectedEssay].sort(() => Math.random() - 0.5);
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
      const questions = getMatchmakingQuestions();

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
          questions: room.questions?.length ? room.questions : getRandomQuestions(room.gameSettings?.grade || 'all', room.gameSettings?.difficulty || 'mixed', room.gameSettings?.totalQuestions || 10)
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
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use by another node process.`);
      console.log(`💡 Automatic cleanup requested or run: Get-Process node | Stop-Process -Force`);
    } else {
      console.error('❌ Server error:', err);
    }
  });
}

module.exports = app;

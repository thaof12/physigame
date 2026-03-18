# 🎮 Physics Learning Platform - Hệ Thống Tính Điểm Game

## 📌 Tóm Tắt

Hệ thống scoring cho phép các game vật lý theo dõi và quản lý điểm số của người chơi. Bao gồm:

- 🎯 **GameScoreContext**: Quản lý trạng thái điểm toàn app
- 📊 **GameScoreHeader**: Hiển thị điểm theo thời gian thực
- 🏆 **GameScoreModal**: Hiển thị kết quả với xếp hạng sao
- 🎮 **BalanceChallengeExample**: Game ví dụ hoàn chỉnh với scoring
- 💾 **API Endpoint**: `/api/game-scores` để lưu trữ scores

## 🗂️ Cấu Trúc File

```
src/
├── components/
│   ├── GameScoreHeader.jsx          # Header hiển thị điểm
│   ├── GameScoreModal.jsx           # Modal kết quả game
│   └── PhysicsGameTemplate.jsx      # Template wrapper cho games
├── contexts/
│   └── GameScoreContext.jsx         # Context quản lý scores
└── areas/Vatly/
    ├── challenges/
    │   └── BalanceChallengeExample.jsx  # Game ví dụ mẫu
    └── gamelist/
        └── gameRouteMap.js          # Ánh xạ slug → component

routes/
└── api/
    └── game-scores.js               # API endpoint POST/GET

Documentation/
├── SCORING_INTEGRATION_GUIDE.md     # Hướng dẫn tích hợp
└── TEST_SCORING_SYSTEM.md           # Hướng dẫn kiểm tra
```

## 🚀 Quick Start

### 1. Kiểm Tra Build

```bash
npm run dev
# Mở http://localhost:5173
```

### 2. Test Game Scoring

1. Nhấn "Thử Thách" → "Cân Bằng Lực"
2. Chơi game: Cân bằng 2 bên lực để điểm
3. Xem modal kết quả với sao
4. Thử lại hoặc tiếp tục

### 3. Kiểm Tra Scores

```javascript
// Console: F12
localStorage.getItem('gameScores')
// Xem JSON scores được lưu
```

## 📊 Architects

### GameScoreContext API

```jsx
const { 
  submitScore,          // submitScore(gameSlug, score, userId)
  getGameScore,         // getGameScore(gameSlug) → {score, bestScore, ...}
  getTotalScore,        // getTotalScore() → number
  getCompletedGames,    // getCompletedGames() → number
  resetGameScore,       // resetGameScore(gameSlug)
  setCurrentScore       // setCurrentScore(score) - cho header live update
} = useGameScore();
```

### GameScoreHeader Props

```jsx
<GameScoreHeader
  gameTitle="Game Name"        // Tên game
  gameSlug="game-slug"         // Slug game (key trong storage)
  onClose={() => {}}           // Callback khi nhấn nút back
/>
```

### GameScoreModal Props

```jsx
<GameScoreModal
  gameSlug="game-slug"         // Slug game
  gameTitle="Game Name"        // Tên game
  finalScore={85}              // Điểm cuối cùng
  onContinue={() => {}}        // Nút "Tiếp Tục"
  onRetry={() => {}}           // Nút "Thử Lại"
/>
```

## ⭐ Xếp Hạng Sao

Hệ thống xếp hạng dựa trên tỷ lệ điểm:

```
Tỷ lệ điểm → Sao
0-33%       → 0 sao
34-65%      → 1 sao ⭐
66-89%      → 2 sao ⭐⭐
90-100%     → 3 sao ⭐⭐⭐

Ví dụ (max = 100):
100 điểm → 100% → 3 sao ⭐⭐⭐
89 điểm  → 89%  → 2 sao ⭐⭐
65 điểm  → 65%  → 1 sao ⭐
30 điểm  → 30%  → 0 sao
```

## 🎯 Cách Sử Dụng Trong Game

### Đơn Giản Nhất

```jsx
import { useGameScore } from '../contexts/GameScoreContext';
import GameScoreHeader from '../components/GameScoreHeader';
import GameScoreModal from '../components/GameScoreModal';

const MyGame = () => {
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const { submitScore } = useGameScore();

  const handleComplete = () => {
    setGameEnded(true);
  };

  return (
    <div>
      <GameScoreHeader 
        gameTitle="My Game" 
        gameSlug="my-game"
        onClose={() => navigate('/')}
      />
      
      {/* Game UI */}
      
      {gameEnded && (
        <GameScoreModal
          gameSlug="my-game"
          gameTitle="My Game"
          finalScore={score}
          onContinue={() => navigate('/')}
          onRetry={() => {
            setGameEnded(false);
            setScore(0);
          }}
        />
      )}
    </div>
  );
};
```

## 📈 Công Thức Tính Điểm Gợi Ý

### 1. Dựa Trên Số Lần Thử

```javascript
const calculateScore = (attempts) => {
  const baseScore = 100;
  const penalty = (attempts - 1) * 10;
  return Math.max(0, baseScore - penalty);
};

// BalanceChallengeExample dùng công thức này
```

### 2. Dựa Trên Độ Chính Xác

```javascript
const calculateAccuracyScore = (correct, total) => {
  return Math.round((correct / total) * 100);
};
```

### 3. Dựa Trên Thời Gian

```javascript
const calculateTimeScore = (timeSpent, maxTime) => {
  const ratio = Math.min(1, timeSpent / maxTime);
  return Math.round(100 * (1 - ratio));
};
```

### 4. Kết Hợp (Ví Dụ)

```javascript
const calculateCompositeScore = (accuracy, timeBonus, attemptPenalty) => {
  return Math.max(0, accuracy * 0.6 + timeBonus * 0.25 - attemptPenalty * 0.15);
};
```

## 💾 Lưu Trữ Dữ Liệu

### LocalStorage (Hiện Tại)

Scores được lưu vào `localStorage['gameScores']`:

```json
{
  "balance": {
    "score": 90,
    "bestScore": 100,
    "attempts": 3,
    "lastAttempt": "2024-03-18T10:30:00.000Z"
  },
  "color-master": {
    "score": 85,
    "bestScore": 92,
    "attempts": 2,
    "lastAttempt": "2024-03-18T10:28:00.000Z"
  }
}
```

### API Backend (Cần Implement)

**Endpoint**: `POST /api/game-scores`
**Request**:
```json
{
  "userId": "user123",
  "gameSlug": "balance",
  "score": 90,
  "bestScore": 100,
  "attempts": 3,
  "timestamp": "2024-03-18T10:30:00.000Z"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "score123",
    "userId": "user123",
    "gameSlug": "balance",
    "lastScore": 90,
    "bestScore": 100,
    "attempts": 3,
    "lastAttempt": "2024-03-18T10:30:00.000Z"
  }
}
```

## 🎮 Game Hiện Có

| Tên Game | Slug | Grade | Status | Scoring |
|----------|------|-------|--------|---------|
| Cân Bằng Lực | balance | 6 | ✅ | ✅ Có |
| Màu Sắc | color-master | 7 | ✅ | ❌ Chưa |
| Điện Từ | electromagnetic | 8 | ✅ | ❌ Chưa |
| NanoLab | nanolab | 8 | ✅ | ❌ Chưa |
| Plasma | plasma | 8 | ✅ | ❌ Chưa |
| Nhiệt Lực | thermo | 8 | ✅ | ❌ Chưa |
| Chuyển Động Ném | projectile | 9 | ✅ | ❌ Chưa |
| Điện Tĩnh | static | 9 | ✅ | ❌ Chưa |
| Phòng Nước | water | 9 | ✅ | ❌ Chưa |

## 📋 Tích Hợp Checklist

### Cho Mỗi Game

- [ ] Import `useGameScore` hook
- [ ] Import `GameScoreHeader` component
- [ ] Import `GameScoreModal` component
- [ ] Thêm state: `score`, `gameEnded`, `finalScore`
- [ ] Render GameScoreHeader ở đầu game
- [ ] Gọi `handleGameComplete(finalScore)` khi game kết thúc
- [ ] Render GameScoreModal khi `gameEnded === true`
- [ ] Test tất cả flows (chơi, thử lại, tiếp tục)

### Backend

- [ ] Tạo MongoDB schema: `GameScore`
- [ ] Implement `POST /api/game-scores`
- [ ] Implement `GET /api/game-scores?userId=...&gameSlug=...`
- [ ] Thêm authentication
- [ ] Test API endpoints

### Leaderboard (Optional)

- [ ] Tạo route: `/leaderboard`
- [ ] Tạo component: `LeaderboardPage.jsx`
- [ ] Hiển thị Top 10 per game
- [ ] Hiển thị Top 10 overall
- [ ] Sort by: Best Score, Most Played, etc.

## 🧪 Testing

### Unit Tests

```javascript
// Test GameScoreContext
describe('GameScoreContext', () => {
  test('submitScore should update bestScore', () => {
    // ...
  });
  
  test('getGameScore should return correct data', () => {
    // ...
  });
});
```

### E2E Tests

```bash
# Chạy game start to finish
npm run test:e2e
```

Xem [TEST_SCORING_SYSTEM.md](./TEST_SCORING_SYSTEM.md) cho chi tiết.

## 📚 Documents

- [SCORING_INTEGRATION_GUIDE.md](./SCORING_INTEGRATION_GUIDE.md) - Hướng dẫn tích hợp chi tiết
- [TEST_SCORING_SYSTEM.md](./TEST_SCORING_SYSTEM.md) - Hướng dẫn kiểm tra toàn bộ

## 🐛 Troubleshooting

**Q: Modal không hiển thị**
A: Kiểm tra `gameEnded` state được set đúng khi game kết thúc

**Q: Scores không lưu**
A: Mở DevTools → Application → LocalStorage, tìm key `gameScores`

**Q: GameScoreContext không hoạt động**
A: Đảm bảo `<GameScoreProvider>` bao bọc toàn bộ App

**Q: Stars không hiển thị đúng**
A: Kiểm tra công thức tính điểm và ngưỡng sao (0-33%, 34-65%, 66-89%, 90-100%)

## 🔗 Related Files

- Context: [src/contexts/GameScoreContext.jsx](./src/contexts/GameScoreContext.jsx)
- Header: [src/components/GameScoreHeader.jsx](./src/components/GameScoreHeader.jsx)
- Modal: [src/components/GameScoreModal.jsx](./src/components/GameScoreModal.jsx)
- Game Example: [src/areas/Vatly/challenges/BalanceChallengeExample.jsx](./src/areas/Vatly/challenges/BalanceChallengeExample.jsx)
- Route Map: [src/areas/Vatly/gamelist/gameRouteMap.js](./src/areas/Vatly/gamelist/gameRouteMap.js)

## 📞 Support

Nếu gặp lỗi:
1. Kiểm tra console errors (F12)
2. Kiểm tra localStorage (F12 → Application)
3. Xem [SCORING_INTEGRATION_GUIDE.md](./SCORING_INTEGRATION_GUIDE.md)
4. Xem [TEST_SCORING_SYSTEM.md](./TEST_SCORING_SYSTEM.md)

---

**Last Updated**: March 18, 2024
**Status**: ✅ Development Phase 1 Complete - Ready for Testing

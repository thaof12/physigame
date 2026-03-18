# Hướng Dẫn Tích Hợp Hệ Thống Scoring Vào Game Vật Lý

## 📋 Tổng Quan

Hệ thống scoring cho phép các game vật lý:
- Hiển thị điểm theo thời gian thực
- Tính toán xếp hạng (0-3 sao)
- Lưu trữ điểm tốt nhất
- Theo dõi số lần thử
- Gửi dữ liệu lên server

## 🎮 Cấu Trúc 

### Components Có Sẵn

1. **GameScoreContext** (`src/contexts/GameScoreContext.jsx`)
   - Quản lý trạng thái điểm toàn app
   - Methods: `submitScore()`, `getGameScore()`, `getTotalScore()`
   - Hook: `useGameScore()`

2. **GameScoreHeader** (`src/components/GameScoreHeader.jsx`)
   - Hiển thị thanh trên cùng khi chơi game
   - Hiển thị: Điểm hiện tại, Best score, Số lần thử, Sao
   - Nút "Quay lại"

3. **GameScoreModal** (`src/components/GameScoreModal.jsx`)
   - Hiển thị modal sau khi game kết thúc
   - Hiển thị: Điểm cuối, Xếp hạng sao, Nút Thử lại/Tiếp tục
   - Tự động gọi `submitScore()`

## 📝 Cách Tích Hợp

### Step 1: Thêm Imports

```jsx
import { useGameScore } from '../../../contexts/GameScoreContext';
import GameScoreHeader from '../../../components/GameScoreHeader';
import GameScoreModal from '../../../components/GameScoreModal';
```

### Step 2: Sử Dụng Hook

```jsx
const MyGameComponent = () => {
  const { submitScore, getGameScore } = useGameScore();
  const [score, setScore] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Khi game kết thúc
  const handleGameComplete = (finalScore) => {
    setFinalScore(finalScore);
    setShowModal(true);
  };

  return (
    <div>
      {/* Hiển thị header scoring */}
      <GameScoreHeader
        gameTitle="Tên Game"
        gameSlug="game-slug"
        onClose={() => navigate('/advanced-physics-challenge')}
      />

      {/* Game logic */}
      <YourGameUI onComplete={handleGameComplete} />

      {/* Modal kết thúc */}
      {showModal && (
        <GameScoreModal
          gameSlug="game-slug"
          gameTitle="Tên Game"
          finalScore={finalScore}
          onContinue={() => navigate('/advanced-physics-challenge')}
          onRetry={() => {
            setShowModal(false);
            // Reset game
          }}
        />
      )}
    </div>
  );
};
```

### Step 3: Tính Điểm

```jsx
// Ví dụ: Tính điểm dựa trên lần thử
const calculateScore = (attempts) => {
  const baseScore = 100;
  const attemptPenalty = Math.max(0, (attempts - 1) * 10);
  return Math.max(0, baseScore - attemptPenalty);
};

// Ví dụ: Tính điểm dựa trên độ chính xác
const calculateAccuracyScore = (correct, total) => {
  return Math.round((correct / total) * 100);
};

// Ví dụ: Tính điểm dựa trên thời gian
const calculateTimeScore = (timeSpentSeconds, maxTimeSeconds) => {
  const ratio = Math.min(1, timeSpentSeconds / maxTimeSeconds);
  return Math.round(100 * (1 - ratio));
};
```

## 🎯 Ví Dụ Đầy Đủ

Xem file `src/areas/Vatly/challenges/BalanceChallengeExample.jsx` để có ví dụ hoàn chỉnh.

```bash
# Game: Cân Bằng Lực
# Slug: balance
# Điểm: 100 - (lần thử - 1) * 10
# Sao: 0-3 tùy theo điểm
```

## 🔌 API Endpoint

**POST** `/api/game-scores`

```json
{
  "userId": "user123",
  "gameSlug": "balance",
  "score": 85,
  "bestScore": 100,
  "attempts": 3,
  "timestamp": "2024-03-18T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "score123",
    "userId": "user123",
    "gameSlug": "balance",
    "lastScore": 85,
    "bestScore": 100,
    "attempts": 3,
    "lastAttempt": "2024-03-18T10:30:00Z"
  }
}
```

## 📊 Xếp Hạng Sao

Sao tự động được tính dựa trên điểm:
- **0 sao**: < 33%
- **1 sao**: 33% - 65%
- **2 sao**: 66% - 89%
- **3 sao**: ≥ 90%

Ví dụ:
- 100 điểm → 3 sao ⭐⭐⭐
- 80 điểm → 2 sao ⭐⭐
- 50 điểm → 1 sao ⭐
- 20 điểm → 0 sao

## 🔄 Các Bước Tích Hợp Tiếp Theo

1. **Cập nhật tất cả 9 games**
   - [ ] ColorMaster
   - [ ] ElectromagneticLab
   - [ ] NanoLab
   - [ ] PlasmaGame
   - [ ] ProjectileMotion
   - [ ] StaticElectricity
   - [ ] ThermoLab
   - [ ] WaterLab
   - [ ] BalanceChallenge (hoặc BalanceChallengeExample)

2. **Kiểm tra Backend**
   - Tạo MongoDB schema cho GameScore
   - Implement `/api/game-scores` endpoint
   - Thêm authentication

3. **Leaderboard (Tương Lai)**
   - Hiển thị Top 10 per game
   - Hiển thị Top 10 overall
   - Filter by grade level

## ⚡ Tips & Tricks

### Kích Hoạt Debug Mode
```jsx
const { submitScore, getGameScore, debugMode } = useGameScore();
// Scores được lưu vào localStorage 'gameScores'
```

### Reset Scores (Development)
```javascript
// Trong browser console
localStorage.removeItem('gameScores');
```

### Kiểm Tra Scores
```jsx
const { getTotalScore, getCompletedGames } = useGameScore();
console.log('Total:', getTotalScore()); // Tổng tất cả điểm
console.log('Completed:', getCompletedGames()); // Số game hoàn thành
```

## 🐛 Troubleshooting

**Vấn đề**: Modal không hiển thị
- **Giải pháp**: Đảm bảo `showModal` state được set đúng khi game kết thúc

**Vấn đề**: Scores không lưu
- **Giải pháp**: Kiểm tra localStorage hoặc mở browser DevTools → Application

**Vấn đề**: Context không hoạt động
- **Giải pháp**: Đảm bảo `<GameScoreProvider>` wrap toàn bộ App

## 📚 Reference

- React Hooks: https://react.dev/reference/react/hooks
- Context API: https://react.dev/reference/react/useContext
- React Router: https://reactrouter.com/

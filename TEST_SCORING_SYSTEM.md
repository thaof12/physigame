# 🧪 Hướng Dẫn Kiểm Tra Hệ Thống Scoring

## 📋 Checklist Kiểm Tra

### 1️⃣ Kiểm Tra Build & Imports

```bash
# Chạy dev server
npm run dev

# Kiểm tra không có errors trong console
# Tìm errors: "Cannot find module", "import ... not found"
```

**Expected**: Không có lỗi import, app chạy bình thường

### 2️⃣ Kiểm Tra Physics Tools Loading

1. Mở http://localhost:5173
2. Nhấn nút "Công Cụ Vật Lý" (cyan button)
3. Xem các tool: Máy tính, Hằng số, Chuyển đơn vị

**Expected**: Tất cả 3 tools hiển thị bình thường

### 3️⃣ Kiểm Tra Game Router

1. Từ PhysicsHome, nhấn nút "Thử Thách" (Challenge)
2. Xem grid 9 games các card
3. **⭐ NEW**: Nhấn card "Cân Bằng Lực" (balance)
4. Xem BalanceChallengeExample load

**Expected**: Game screen mở, không lỗi

### 4️⃣ Kiểm Tra GameScoreHeader

Khi game mở, xem header phía trên cùng:

```
╔════════════════════════════════════════════╗
║  🎮 Cân Bằng Lực                      ← ←  ║
║  Điểm: 0  |  Best: 0  |  Lần: 0  | ★  ║
╚════════════════════════════════════════════╝
```

**Kiểm tra**:
- [ ] Title "Cân Bằng Lực" hiển thị
- [ ] Điểm: 0 → cập nhật khi chơi
- [ ] Best: 0 → cập nhật sau game
- [ ] Lần: 0 → tăng mỗi khi nhấn nút
- [ ] Sao: rỗng → cập nhật khi kết thúc
- [ ] Nút quay lại hoạt động

### 5️⃣ Kiểm Tra Gameplay

**Cân Bằng Lực Game Logic**:

```
Mục đích: Đặt trọng lượng trái = trọng lượng phải

Bước:
1. Nhấn "+ 10kg" bên trái → leftWeight = 10
2. Nhấn "+ 10kg" bên phải → rightWeight = 10
3. Khi |leftWeight - rightWeight| ≤ 5 → "✓ Cân Bằng!"
4. Nút "Hoàn Thành" xanh lá → có thể nhấn
5. Nhấn "Hoàn Thành" → game kết thúc
```

**Kiểm tra trong header**:
- [ ] Điểm tăng lên 90 (100 - 1*10)
- [ ] Sao hiển thị 3 sao ⭐⭐⭐
- [ ] Lần tăng lên 2

### 6️⃣ Kiểm Tra GameScoreModal

Sau khi nhấn "Hoàn Thành", xem modal:

```
╔══════════════════════════════╗
║     🎉 Kết Quả               ║
║                              ║
║  Điểm: 90/100               ║
║  ⭐⭐⭐ (3 sao)               ║
║                              ║
║  Best: 90                    ║
║  Lần: 2                      ║
║                              ║
║  [Thử Lại]  [Tiếp Tục]      ║
╚══════════════════════════════╝
```

**Kiểm tra**:
- [ ] Điểm cuối hiện đúng: 90
- [ ] Sao hiển thị: 3 ⭐
- [ ] Best score cập nhật: 90
- [ ] Nút "Thử Lại" được nhấn → game reset
- [ ] Nút "Tiếp Tục" được nhấn → về AdvancedPhysicsChallenge

### 7️⃣ Kiểm Tra State Persistence

**Kiểm tra localStorage**:

1. Mở Developer Tools (F12)
2. Application → Local Storage → localhost:5173
3. Tìm key `gameScores`
4. Xem value JSON:

```json
{
  "balance": {
    "score": 90,
    "bestScore": 90,
    "attempts": 2,
    "lastAttempt": "2024-03-18T10:30:00.000Z"
  }
}
```

**Kiểm tra**:
- [ ] Key `gameScores` tồn tại
- [ ] Có entry cho "balance"
- [ ] Score = 90, bestScore = 90

### 8️⃣ Kiểm Tra Multiple Games

Chơi game Cân Bằng lần thứ 2:

1. Về Challenge page
2. Chơi lại Cân Bằng
3. Lần này cố gắng được điểm cao hơn (ít lần thử)
   - Nhấn + bên trái: [10kg]
   - Nhấn + bên phải: [10kg]
   - Cân bằng ngay → Score = 100
4. Xem modal: Best = 100 (cập nhật)

**Kiểm tra**:
- [ ] localStorage: bestScore = 100
- [ ] Header cũ game: bestScore = 100

### 9️⃣ Kiểm Tra Sao System

**Test các ngưỡng sao**:

Công thức hiện tại: `score / 100 * 100%`
- 100 điểm = 100% → 3 sao ⭐⭐⭐
- 90 điểm = 90% → 2 sao ⭐⭐
- 50 điểm = 50% → 1 sao ⭐
- 20 điểm = 20% → 0 sao

Để test thay đổi score:
1. Mở DevTools Console
2. Chạy:
```javascript
// Thay đổi localStorage
const gameScores = JSON.parse(localStorage.getItem('gameScores') || '{}');
gameScores.balance.score = 50; // Test 50 điểm
localStorage.setItem('gameScores', JSON.stringify(gameScores));
location.reload();
```

**Kiểm tra**:
- [ ] 100 pt → 3 sao ⭐⭐⭐
- [ ] 90 pt → 2 sao ⭐⭐
- [ ] 50 pt → 1 sao ⭐
- [ ] 20 pt → 0 sao

### 🔟 Kiểm Tra Các Games Khác

Lặp lại steps 3-7 cho game thứ 2 (ColorMaster từ grade 7):

1. Chạy lại app
2. Chọn Challenge → Grade 7
3. Chọn ColorMaster
4. **Expected**: Hiển thị placeholder "Game đang được cập nhật"
   - Vì ColorMaster chưa được cập nhật để sử dụng GameScoreHeader/Modal

## 📊 Test Report Template

```markdown
## Test Report - Scoring System

**Date**: 2024-03-18
**Tester**: [Your Name]
**Build**: dev

### Passed Tests
- [x] Build không lỗi
- [x] GameScoreHeader hiển thị
- [x] Game Logic hoạt động
- [x] GameScoreModal hiển thị
- [x] localStorage persist scores
- [x] Star system works

### Failed Tests
- [ ] [Test name]
  - **Issue**: [Description]
  - **Expected**: [What should happen]
  - **Actual**: [What happened]
  - **Steps to reproduce**: [Steps]

### Notes
- [Any additional notes]
```

## 🐛 Debug Commands

**Console Commands untuk Debug**:

```javascript
// Xem tất cả scores
console.log('Scores:', JSON.parse(localStorage.getItem('gameScores')))

// Reset all scores
localStorage.removeItem('gameScores'); location.reload()

// Set specific game score
const s = JSON.parse(localStorage.getItem('gameScores') || '{}');
s.balance = { score: 75, bestScore: 90, attempts: 3, lastAttempt: new Date() };
localStorage.setItem('gameScores', JSON.stringify(s));

// Check if context is working
// (Add breakpoint trong GameScoreContext hook để verify)
```

## 📝 Tiếp Theo - Checklist

Sau khi test xong:

- [ ] Xác nhận tất cả components load bình thường
- [ ] Xác nhận scores lưu được vào localStorage
- [ ] Xác nhận GameScoreHeader/Modal hiển thị đúng
- [ ] Xác nhận star system hoạt động
- [ ] Cập nhật các game khác để sử dụng scoring
- [ ] Tạo backend `/api/game-scores` endpoint
- [ ] Test API submission
- [ ] Tạo leaderboard page

## 💡 Quick Start Command

```bash
# 1. Build project
npm run dev

# 2. Open browser
# http://localhost:5173

# 3. Navigate to game
# Thử Thách → Balance → Play

# 4. Check DevTools
# F12 → Application → Local Storage
```

## ✅ Success Criteria

Hệ thống scoring hoạt động đầy đủ khi:

1. ✅ Game mở bình thường từ challenge page
2. ✅ Header hiển thị và cập nhật tracking lần thử
3. ✅ Modal hiển thị sau game với điểm cuối
4. ✅ Sao tính toán đúng (0-3 sao)
5. ✅ Scores lưu vào localStorage
6. ✅ Best score cập nhật đúng
7. ✅ "Thử Lại" reset game
8. ✅ "Tiếp Tục" về challenge page

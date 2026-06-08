# 📦 CHATBOT AI - FILES SUMMARY

## ✅ Các File Đã Tạo

### 📄 1. **CHATBOT_FILES_EXPORT.md**
   - **Nội dung:** Hướng dẫn chi tiết cách tích hợp chatbot
   - **Dùng để:** Tham khảo cấu trúc thư mục, cấu hình env, schema SQL
   - **Kích thước:** ~2KB

### 💻 2. **CHATBOT_COMPONENT_DifyChatbot.jsx**
   - **Nội dung:** Component React chatbot hoàn chỉnh
   - **Dùng để:** Copy vào `src/components/AIChatbot/DifyChatbot.jsx` trong project khác
   - **Dòng code:** 418 lines
   - **Dependencies:** 
     - React hooks (useEffect, useState, useRef, useMemo)
     - useAuth() context
     - supabase client
     - dify-chatbot.css

### 🎨 3. **CHATBOT_STYLES_dify-chatbot.css**
   - **Nội dung:** CSS styling cho chatbot
   - **Dùng để:** Copy vào `src/components/AIChatbot/dify-chatbot.css`
   - **Features:** 
     - Fixed positioning (bottom-right)
     - Responsive design (mobile & desktop)
     - Gradient backgrounds
     - Smooth animations
     - Dark mode compatible

### 📋 4. **CHATBOT_INTEGRATION_GUIDE.js**
   - **Nội dung:** Code snippets + hướng dẫn tích hợp chi tiết
   - **Gồm:**
     - Cách thêm vào App.jsx
     - Setup AuthContext
     - Setup Supabase config
     - .env configuration
     - SQL schema
     - Customization options
     - Troubleshooting
   - **Kích thước:** ~6KB

---

## 🚀 QUICK START

### Bước 1: Copy Files
```
Project_Folder/
└── src/
    └── components/
        └── AIChatbot/
            ├── DifyChatbot.jsx          ← Copy từ CHATBOT_COMPONENT_DifyChatbot.jsx
            └── dify-chatbot.css         ← Copy từ CHATBOT_STYLES_dify-chatbot.css
```

### Bước 2: Cấu hình .env
```
VITE_DIFY_API_BASE_URL=https://api.dify.ai/v1
VITE_DIFY_APP_API_KEY=your_api_key_here
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### Bước 3: Tạo Supabase Table
Chạy SQL:
```sql
CREATE TABLE chat_histories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL,
  conversation_id TEXT NOT NULL,
  messages JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, conversation_id)
);
ALTER TABLE chat_histories ENABLE ROW LEVEL SECURITY;
```

### Bước 4: Update App.jsx
```jsx
import DifyChatbot from './components/AIChatbot/DifyChatbot';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <GameProgressProvider>
            <AppContent />
            <DifyChatbot />  {/* ← Thêm dòng này */}
          </GameProgressProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}
```

### Bước 5: Setup AuthContext (nếu cần)
```jsx
// contexts/AuthContext.jsx
export const useAuth = () => {
  return { user: { id: 'user-123' } };
};
```

---

## 📊 COMPONENT DETAILS

### DifyChatbot Features
✅ Chat với Dify AI
✅ Lưu lịch sử (localStorage + Supabase)
✅ Multiple conversations
✅ Responsive mobile/desktop
✅ Error handling
✅ Auto formatting response
✅ Vietnamese language
✅ Fixed UI position

### Component Props
**Không có props** - Component tự quản lý state

### Component Hooks
- `useAuth()` - Lấy user ID
- `useEffect` - Load/save history, auto-scroll
- `useState` - Messages, input, UI state
- `useRef` - Chat history scroll ref
- `useMemo` - Compute canSend state

---

## 🔧 CUSTOMIZATION

### 1. Thay đổi vị trí
```css
.dify-chatbot-shell {
  right: 16px;  /* Từ phải */
  bottom: 16px; /* Từ dưới */
}
```

### 2. Thay đổi màu
```css
.dify-chatbot-launcher {
  background: radial-gradient(circle at top, #YOUR_COLOR1, #YOUR_COLOR2);
}
```

### 3. Thay đổi text
```jsx
// Trong DifyChatbot.jsx
<p className="dify-chatbot-kicker">Trợ lý học tập</p>
<h3>Hỏi đáp vật lý</h3>
<span>{isOpen ? '−' : 'Chat'}</span>
```

### 4. Thay đổi kích thước
```css
.dify-chatbot-panel {
  width: min(39rem, calc(100vw - 24px));  /* Thay đổi đây */
  height: min(42rem, calc(100vh - 96px)); /* Hoặc đây */
}
```

---

## 🐛 TROUBLESHOOTING

| Lỗi | Giải pháp |
|-----|----------|
| Chat không hoạt động | Kiểm tra VITE_DIFY_APP_API_KEY |
| Lịch sử không lưu | Kiểm tra Supabase table & RLS policy |
| Responsive không đúng | Kiểm tra @media queries trong CSS |
| useAuth error | Kiểm tra AuthContext setup |
| Supabase lỗi | Kiểm tra credentials & RLS policy |

---

## 📁 FILE LOCATIONS

```
physigame-main/
├── CHATBOT_FILES_EXPORT.md                    ← Hướng dẫn
├── CHATBOT_COMPONENT_DifyChatbot.jsx          ← Copy → src/components/AIChatbot/
├── CHATBOT_STYLES_dify-chatbot.css            ← Copy → src/components/AIChatbot/
├── CHATBOT_INTEGRATION_GUIDE.js               ← Tham khảo code snippets
└── src/
    └── components/
        └── AIChatbot/
            ├── DifyChatbot.jsx
            └── dify-chatbot.css
```

---

## ✨ API REFERENCES

### Dify API Endpoint
```
POST https://api.dify.ai/v1/chat-messages
```

Headers:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_API_KEY"
}
```

Body:
```json
{
  "inputs": {},
  "query": "User question",
  "response_mode": "blocking",
  "user": "physigame-web-user",
  "conversation_id": "optional-id"
}
```

Response:
```json
{
  "message_id": "...",
  "conversation_id": "...",
  "answer": "AI response"
}
```

### Supabase Operations
- **Load:** SELECT từ chat_histories nơi user_id = current_user
- **Save:** UPSERT vào chat_histories với unique constraint
- **Update:** UPDATE khi messages thay đổi

---

## 📝 NOTES

- Component được tạo cho project physigame (Vietnamese physics learning game)
- Hỗ trợ tiếng Việt
- Có support cho fallback localStorage nếu Supabase không available
- Auto-format response để xóa ký tự đặc biệt
- Responsive design đã built-in

---

**Tạo: 2026-06-08**
**Version: 1.0**

# 🚀 HƯỚNG DẪN TRIỂN KHAI - INTERACTIVE LECTURE LIBRARY

## 🎯 Mục Đích
Thêm tính năng **Thư Viện Bài Giảng Tương Tác** vào dự án - cho phép học sinh xem video, đọc tài liệu, và trả lời câu hỏi pop-up để kiểm tra hiểu bài.

---

## ✅ Danh Sách Tệp Tạo/Sửa

### 📁 Tệp Mới Tạo

```
src/
├── pages/
│   └── InteractiveLectureHub.jsx          (180 dòng)
├── components/
│   ├── LectureViewer.jsx                 (400 dòng)
│   ├── PopupQuiz.jsx                     (200 dòng)
│   └── LectureClassSelector.jsx          (220 dòng)
└── data/
    └── lectureData.js                    (300 dòng)

root/
├── INTERACTIVE_LECTURES_README.md        (Hướng dẫn chi tiết)
├── LECTURE_EXAMPLES.js                   (Ví dụ bài giảng)
├── FEATURE_SUMMARY.md                    (Tóm tắt tính năng)
└── TEST_CHECKLIST.js                     (Kiểm tra
```

### 📝 Tệp Sửa Đổi

1. **src/App.jsx**
   - Thêm 3 imports mới (lines 212-214)
   - Thêm 3 routes mới (lines 278-281)

2. **src/pages/ProgramSelection.jsx**
   - Thêm 1 program mới trong array (lines 29-39)
   - Cập nhật hàm handleProgramSelect (lines 57-62)

---

## ⚙️ Cài Đặt

### 1️⃣ Sao Chép Tệp
```bash
# Tệp mới
- src/pages/InteractiveLectureHub.jsx
- src/components/LectureViewer.jsx
- src/components/PopupQuiz.jsx
- src/components/LectureClassSelector.jsx
- src/data/lectureData.js

# Tài liệu
- INTERACTIVE_LECTURES_README.md
- LECTURE_EXAMPLES.js
- FEATURE_SUMMARY.md
- TEST_CHECKLIST.js
```

### 2️⃣ Cập Nhật App.jsx
```javascript
// Thêm imports (sau UnitConverter import):
import InteractiveLectureHub from './pages/InteractiveLectureHub';
import LectureViewer from './components/LectureViewer';
import LectureClassSelector from './components/LectureClassSelector';

// Thêm routes (trong <Routes> section):
{/* Interactive Lecture Hub Routes */}
<Route path="/interactive-lectures" element={<InteractiveLectureHub />} />
<Route path="/interactive-lectures/:subject/:grade" element={<LectureClassSelector />} />
<Route path="/interactive-lectures/:subject/:grade/:lectureId" element={<LectureViewer />} />
```

### 3️⃣ Cập Nhật ProgramSelection.jsx
```javascript
// Thêm program vào array (sau physics):
{
  id: 'interactive-lectures',
  name: 'Thư Viện Bài Giảng',
  icon: '📚',
  description: 'Xem video bài giảng, đọc tài liệu chi tiết và trả lời câu hỏi pop-up để kiểm tra mức độ hiểu bài ngay lập tức.',
  gradient: 'from-orange-500 to-red-600',
  hoverGradient: 'from-orange-600 to-red-700',
  available: true,
  grades: [6, 7, 8, 9, 10, 11, 12],
  totalLessons: 85,
  highlights: ['Video HD', 'Tài liệu chi tiết', 'Câu hỏi pop-up']
}

// Thêm logic trong handleProgramSelect (trước if (!user)):
if (program.id === 'interactive-lectures') {
  navigate('/interactive-lectures');
  return;
}
```

### 4️⃣ Kiểm Tra Dependencies
```bash
# Đảm bảo đã có:
npm list react-router-dom        # ✓ Required
npm list lucide-react            # ✓ Required (icons)
npm list tailwindcss             # ✓ Required (styling)
```

---

## 🧪 Kiểm Tra

### 1️⃣ Kiểm Tra Syntax
```bash
# Chạy linter
npm run lint

# Hoặc VS Code: F1 → Problems
# Không nên có error
```

### 2️⃣ Kiểm Tra Routes
```bash
# Start dev server
npm run dev

# Truy cập:
# http://localhost:5173/interactive-lectures
# http://localhost:5173/interactive-lectures/physics/class6
# http://localhost:5173/interactive-lectures/physics/class6/0
```

### 3️⃣ Kiểm Tra Functionality
Xem file: `TEST_CHECKLIST.js`
- 25 tests cụ thể để kiểm tra từng feature
- Chia thành 7 phần (Navigation, Content, Quiz, Progress, etc.)

---

## 📊 Cấu Trúc URL

```
/interactive-lectures
  ├── / (Chọn môn)
  ├── /:subject/:grade (Chọn bài)
  │   ├── /physics/class6
  │   ├── /physics/class7
  │   └── /chemistry/class8
  └── /:subject/:grade/:lectureId (Xem bài)
      └── /physics/class6/0
```

---

## 🎨 Customization

### 1️⃣ Thêm Bài Giảng Mới
```javascript
// src/data/lectureData.js

physics: {
  8: {  // Lớp 8
    0: { // Bài 1
      title: 'Chuyên Đề...',
      description: '...',
      videoUrl: 'https://www.youtube.com/embed/VIDEO_ID',
      sections: [
        {
          title: '1. Phần 1',
          content: 'Nội dung...',
          keyPoints: ['Điểm 1', 'Điểm 2'],
          examples: [
            { title: 'Ví dụ 1', description: '...' }
          ],
          questions: [
            {
              question: '...',
              answers: ['A', 'B', 'C', 'D'],
              correctAnswer: 0,
              explanation: '...'
            }
          ]
        }
      ]
    }
  }
}
```

### 2️⃣ Thay Đổi Màu Sắc
```javascript
// InteractiveLectureHub.jsx - Thay đổi gradient
'from-orange-500 to-red-600'  // Hiện tại

// Có thể thay bằng:
'from-pink-500 to-rose-600'   // Pink
'from-yellow-500 to-amber-600' // Yellow
'from-indigo-500 to-purple-600' // Purple
```

### 3️⃣ Thay Đổi Video URL
Chuyển đổi YouTube link thường sang embed format:
```
Thường: https://www.youtube.com/watch?v=VIDEO_ID
Embed:  https://www.youtube.com/embed/VIDEO_ID
```

---

## 🚀 Deploy

### Local Testing
```bash
npm run dev
# Truy cập: http://localhost:5173/interactive-lectures
```

### Build Production
```bash
npm run build
npm run preview
```

### Deploy (Vercel/Netlify)
```bash
# Vercel
vercel deploy

# Hoặc commit vào Git
git add .
git commit -m "Add Interactive Lecture Library"
git push origin main
```

---

## 🐛 Troubleshooting

### Problem: PopupQuiz không hiện
**Solution**: 
- Kiểm tra import trong LectureViewer.jsx
- Đảm bảo PopupQuiz.jsx được import đúng

### Problem: Video không load
**Solution**:
- Kiểm tra URL có phải embed format không
- Thử URL khác để test

### Problem: Styling sai lệch
**Solution**:
- Clear cache: Ctrl+Shift+Delete
- Restart dev server: npm run dev
- Kiểm tra Tailwind config

### Problem: Routes không hoạt động
**Solution**:
- Kiểm tra imports trong App.jsx
- Kiểm tra spelling params (:subject, :grade, :lectureId)
- React Router version?

---

## 📚 Tài Liệu Tham Khảo

| Tệp | Nội Dung |
|-----|----------|
| `INTERACTIVE_LECTURES_README.md` | Hướng dẫn chi tiết, cách thêm bài |
| `LECTURE_EXAMPLES.js` | Ví dụ 3 bài giảng mở rộng |
| `FEATURE_SUMMARY.md` | Tóm tắt tính năng, thống kê |
| `TEST_CHECKLIST.js` | 25 tests cần kiểm tra |

---

## 📱 Responsive Breakpoints

```css
/* Tailwind breakpoints */
sm: 640px   /* Phone */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large Desktop */

/* Ứng dụng trong project */
lg:col-span-2   /* Desktop: 2 columns */
lg:col-span-1   /* Tablet: 1 column */
                /* Mobile: 1 column (default) */
```

---

## ♿ Accessibility

- ✅ Semantic HTML (button, section, etc.)
- ✅ Color contrast (WCAG AA standard)
- ✅ Keyboard navigation (Tab, Enter)
- ✅ ARIA labels untuk icons

---

## 🔐 Security Notes

- ✅ No sensitive data stored locally
- ✅ Quiz answers in frontend (OK cho testing)
- ✅ No API keys exposed
- ✅ Future: Add backend validation

---

## 📈 Metrics để Track

- **Users**: Số học sinh truy cập
- **Engagement**: Số câu hỏi trả lời
- **Completion**: % bài học hoàn thành
- **Performance**: Load time, memory usage

---

## 🎯 Lộ Trình Phát Triển

### Phase 1 ✅ (Hiện tại)
- Video + Nội dung + Pop-up Quiz
- UI/UX cơ bản
- 2 môn (Vật Lý, Hóa Học)

### Phase 2 (Tiếp theo)
- Lưu tiến độ (Database)
- Thêm ghi chú
- Bài kiểm tra tổng hợp

### Phase 3 (Future)
- Thảo luận/Q&A
- Tải tài liệu (PDF)
- Sertifikat hoàn thành

---

## 💡 Tips & Tricks

1. **Tăng Tốc Dev**
   - Sử dụng `npm run dev` (Fast Refresh)
   - Không cần reload page thủ công

2. **Debug Quiz**
   - Open DevTools → Console
   - Kiểm tra `questionData` object

3. **Thêm Ảnh**
   - URL format: `<img src="url" alt="description">`
   - Hoặc upload vào public folder

4. **Cải Thiện SEO**
   - Thêm meta tags trong index.html
   - Structured data cho bài giảng

---

## 📞 Support

**Vấn đề với code?**
1. Kiểm tra syntax (VS Code red squiggle)
2. Xem browser console (F12)
3. Kiểm tra TEST_CHECKLIST.js

**Muốn thêm bài?**
- Xem INTERACTIVE_LECTURES_README.md
- Copy format từ LECTURE_EXAMPLES.js

**Customization?**
- Tailwind classes: https://tailwindcss.com
- React icons: lucide-react library
- React Router: https://reactrouter.com

---

## ✨ Success Criteria

✅ Tất cả components render đúng
✅ Routes hoạt động không error
✅ Quiz functionality đầy đủ
✅ Responsive trên mọi device
✅ Dark mode hoạt động
✅ No console errors
✅ Performance tốt (< 2s load)

---

**🎉 Sẵn sàng triển khai! Chúc bạn thành công!**

---

## 📝 Notes

- File lectureData.js chỉ có 5 bài mẫu - **cần thêm nhiều bài hơn**
- YouTube video URLs là placeholder - **thay bằng URL thực**
- Tiến độ lưu tạm thời trong state - **cần lưu vào DB (future)**
- Không có auth check - **có thể thêm sau (future)**

---

Hỏi gì cũng được! 😊

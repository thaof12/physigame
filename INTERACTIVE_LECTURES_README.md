# 📚 Thư Viện Bài Giảng Tương Tác - Interactive Lecture Library

## 🎯 Tổng Quan

Thư viện bài giảng tương tác là một tính năng mới cho phép học sinh:
- 👁️ **Xem video bài giảng chất lượng cao**
- 📖 **Đọc tài liệu chi tiết và cấu trúc**
- ❓ **Trả lời câu hỏi pop-up dừa** để kiểm tra mức độ hiểu bài
- 📊 **Theo dõi tiến độ học tập** qua thanh progress

---

## ✨ Tính Năng Chính

### 1. **Chọn Môn Học & Lớp**
- Hỗ trợ 2 môn: **Vật Lý** (lớp 6-12) và **Hóa Học** (lớp 8-12)
- Giao diện thân thiện, dễ dàng chọn lớp học

### 2. **Xem Bài Giảng**
Mỗi bài giảng bao gồm:
- 🎥 **Video bài giảng** nhúng từ YouTube
- 📝 **Nội dung bài học** được chia thành các phần nhỏ
- 📌 **Điểm chính** (Key Points) được làm nổi bật
- 📌 **Ví dụ minh họa** để dễ hiểu
- ❓ **Câu hỏi kiểm tra** tích hợp

### 3. **Câu Hỏi Pop-up (Pop-up Quiz)**
- Câu hỏi xuất hiện dưới dạng modal
- 4 lựa chọn (A, B, C, D)
- Phản hồi tức thì về đúng/sai
- Giải thích chi tiết cho mỗi câu hỏi
- Theo dõi kết quả để cải thiện

### 4. **Thanh Tiến độ & Bảng Tóm Tắt**
- Thanh progress bar hiển thị % hoàn thành
- Danh sách các phần nội dung
- Đánh dấu phần đã hoàn thành ✓

---

## 🗂️ Cấu Trúc Thư Mục

```
src/
├── pages/
│   └── InteractiveLectureHub.jsx          # Trang chính (chọn môn & lớp)
├── components/
│   ├── LectureViewer.jsx                 # Component xem bài giảng
│   ├── PopupQuiz.jsx                     # Component câu hỏi pop-up
│   └── LectureClassSelector.jsx          # Component chọn bài giảng
├── data/
│   └── lectureData.js                    # Dữ liệu bài giảng
```

---

## 📋 Cách Sử Dụng

### Bước 1: Truy Cập Thư Viện
1. Từ trang chọn chương trình (ProgramSelection)
2. Nhấp vào "Thư Viện Bài Giảng" 📚

### Bước 2: Chọn Môn Học
- Chọn giữa **Vật Lý** hoặc **Hóa Học**

### Bước 3: Chọn Lớp Học
- Chọn lớp từ 6 đến 12 tùy theo môn

### Bước 4: Chọn Bài Giảng
- Xem danh sách bài giảng available
- Nhấp vào bài để bắt đầu

### Bước 5: Học Bài
1. Xem video bài giảng
2. Đọc từng phần nội dung
3. Trả lời các câu hỏi pop-up
4. Đánh dấu phần đã hoàn thành
5. Tiếp tục phần tiếp theo

---

## 🔧 Cách Thêm Bài Giảng Mới

### Chỉnh Sửa File: `src/data/lectureData.js`

#### Cấu Trúc dữ liệu:
```javascript
export const lectureData = {
  // Môn học
  physics: {
    // Lớp học (số)
    6: {
      // ID bài giảng (string hoặc số)
      0: {
        // Dữ liệu bài
        title: 'Tên bài giảng',
        description: 'Mô tả ngắn',
        videoUrl: 'https://www.youtube.com/embed/VIDEO_ID',
        sections: [
          {
            title: 'Tên phần 1',
            content: 'Nội dung bài học...',
            keyPoints: [
              'Điểm chính 1',
              'Điểm chính 2'
            ],
            examples: [
              {
                title: 'Ví dụ 1',
                description: 'Mô tả ví dụ'
              }
            ],
            questions: [
              {
                question: 'Nội dung câu hỏi?',
                answers: [
                  'Lựa chọn A',
                  'Lựa chọn B',
                  'Lựa chọn C',
                  'Lựa chọn D'
                ],
                correctAnswer: 0,  // Index (0, 1, 2, 3)
                explanation: 'Giải thích câu trả lời đúng'
              }
            ]
          }
        ]
      }
    }
  }
}
```

#### Ví dụ Thêm Bài Mới:
```javascript
chemistry: {
  9: {
    1: {
      title: 'Phản ứng Hóa Học',
      description: 'Hiểu về các loại phản ứng hóa học cơ bản',
      videoUrl: 'https://www.youtube.com/embed/abc123',
      sections: [
        {
          title: '1. Phản ứng Tổng Hợp',
          content: 'Phản ứng tổng hợp là khi hai hay nhiều chất kết hợp...',
          keyPoints: [
            'Là kết hợp của hai hay nhiều chất',
            'Tạo thành một chất mới',
            'Ví dụ: H₂ + O₂ → H₂O'
          ],
          examples: [
            {
              title: 'Cháy của Magnesium',
              description: '2Mg + O₂ → 2MgO'
            }
          ],
          questions: [
            {
              question: 'Phản ứng tổng hợp là gì?',
              answers: [
                'Là phân hủy một chất',
                'Là kết hợp của 2+ chất tạo chất mới',
                'Là trao đổi các chất',
                'Là oxy hóa khử'
              ],
              correctAnswer: 1,
              explanation: 'Phản ứng tổng hợp là sự kết hợp...'
            }
          ]
        }
      ]
    }
  }
}
```

---

## 🎨 Tùy Chỉnh Giao Diện

### Màu Sắc Chính
- **Vật Lý**: Xanh lá (Green/Teal)
- **Hóa Học**: Xanh da trời (Blue/Indigo)
- **Thư viện**: Cam/Đỏ (Orange/Red) - nhấn mạnh

### Component Styling
Sử dụng Tailwind CSS, có thể tùy chỉnh:
- `bg-gradient-to-r` - gradient background
- `dark:` - dark mode support
- Responsive: `md:`, `lg:` breakpoints

---

## 🚀 Route Điều Hướng

| Route | Component | Mục Đích |
|-------|-----------|---------|
| `/interactive-lectures` | InteractiveLectureHub | Trang chính |
| `/interactive-lectures/:subject/:grade` | LectureClassSelector | Danh sách bài |
| `/interactive-lectures/:subject/:grade/:lectureId` | LectureViewer | Xem bài giảng |

**Ví dụ:**
- `/interactive-lectures/physics/class6` - Vật lý lớp 6
- `/interactive-lectures/chemistry/class9/0` - Hóa học lớp 9, bài 1
- `/interactive-lectures/physics/class10/2` - Vật lý lớp 10, bài 3

---

## 💾 Lưu Tiến Độ (Future)

Hiện tại, tiến độ được lưu tạm thời trong component state. 
Để lưu vĩnh viễn, cần:
1. Thêm API endpoint: `POST /api/lecture-progress`
2. Cập nhật Database (Firebase/MongoDB)
3. Load tiến độ khi vào bài giảng

---

## 📱 Responsive Design

- ✅ Desktop: Full 3-column layout (content + sidebar)
- ✅ Tablet: 2-column layout
- ✅ Mobile: 1-column layout (full width)

---

## 🎓 Nội Dung Mẫu

### Vật Lý - Lớp 6
- Bài 1: Đại cương về cơ học
- Bài 2: Cân bằng và không cân bằng lực

### Vật Lý - Lớp 7
- Bài 1: Quang học cơ bản

### Hóa Học - Lớp 8
- Bài 1: Nguyên tử và Phân tử

---

## 🔐 Bảo Mật & Quyền Truy Cập

- Hiện tại: **Cho phép truy cập miễn phí** (không cần đăng nhập)
- Tương lai: Có thể thêm yêu cầu đăng nhập để theo dõi tiến độ

---

## 📝 Lưu Ý

- Video URL cần là dạng `/embed/` từ YouTube
- Nội dung câu hỏi `correctAnswer` là index (0-3)
- Hỗ trợ dark mode tự động qua Tailwind
- Sử dụng iconography từ `lucide-react`

---

## 🤝 Hỗ Trợ & Phát Triển

Để thêm bài giảng hoặc tính năng mới, hãy:
1. Cập nhật dữ liệu trong `lectureData.js`
2. Test trên các breakpoint khác nhau
3. Kiểm tra dark mode
4. Xác nhận toàn bộ routes hoạt động

---

**Happy Learning! 🎉**

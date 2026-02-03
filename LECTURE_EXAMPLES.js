/**
 * 📚 HƯỚNG DẪN THÊM CÁC BÀI GIẢNG THÊM
 * 
 * File này chứa các ví dụ về cách thêm bài giảng mới vào hệ thống
 * Sao chép các phần dưới vào src/data/lectureData.js
 */

// ==================== VẬT LÝ - LỚP 8 ====================
const Physics_Grade8_Examples = {
  0: {
    title: 'Tốc độ và Vận tốc',
    description: 'Phân biệt giữa tốc độ và vận tốc, công thức tính và ứng dụng',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    sections: [
      {
        title: '1. Khái niệm Tốc độ',
        content: `Tốc độ là quãng đường một vật đi được trong một đơn vị thời gian.

Công thức:
v = s / t

Trong đó:
- v: tốc độ (m/s)
- s: quãng đường (m)
- t: thời gian (s)

Tốc độ là đại lượng vô hướng (chỉ có độ lớn, không có hướng).

Ví dụ: Một chiếc ô tô chạy với tốc độ 60 km/h có nghĩa là trung bình nó đi được 60 km trong 1 giờ.`,
        keyPoints: [
          'Tốc độ = quãng đường / thời gian',
          'Tốc độ là đại lượng vô hướng',
          'Đơn vị: m/s hoặc km/h',
          'Tốc độ cho biết mức độ nhanh/chậm'
        ],
        examples: [
          {
            title: 'Tính tốc độ xe đạp',
            description: 'Một bạn đi xe đạp được 500m trong 50 giây. Tốc độ = 500/50 = 10 m/s'
          },
          {
            title: 'Tính tốc độ ô tô',
            description: 'Một ô tô chạy 120 km trong 2 giờ. Tốc độ = 120/2 = 60 km/h'
          }
        ],
        questions: [
          {
            question: 'Một người chạy 100m trong 20 giây. Tốc độ của người đó là bao nhiêu?',
            answers: [
              '5 m/s',
              '10 m/s',
              '2 m/s',
              '20 m/s'
            ],
            correctAnswer: 0,
            explanation: 'Tốc độ = 100/20 = 5 m/s'
          },
          {
            question: 'Tốc độ 72 km/h bằng bao nhiêu m/s?',
            answers: [
              '72 m/s',
              '20 m/s',
              '36 m/s',
              '10 m/s'
            ],
            correctAnswer: 1,
            explanation: 'Chuyển đổi: 72 km/h = 72 × 1000 / 3600 = 20 m/s'
          }
        ]
      },
      {
        title: '2. Vận tốc là gì?',
        content: `Vận tốc là đại lượng mô tả tốc độ và hướng của chuyển động.

So sánh Tốc độ vs Vận tốc:
- Tốc độ: Chỉ có độ lớn (ví dụ: 60 km/h)
- Vận tốc: Có độ lớn và hướng (ví dụ: 60 km/h hướng tây)

Công thức:
v⃗ = Δx⃗ / Δt

Δx⃗: độ dịch chuyển (có hướng)
Δt: khoảng thời gian

Vận tốc là đại lượng véctơ (có độ lớn và hướng).`,
        keyPoints: [
          'Vận tốc = độ dịch chuyển / thời gian',
          'Vận tốc là đại lượng véctơ',
          'Vận tốc có độ lớn và hướng',
          'Khác với tốc độ (vô hướng)'
        ],
        examples: [
          {
            title: 'Chuyển động thẳng',
            description: 'Một ô tô đi thẳng từ A đến B, quãng đường AB = 100m mất 10 giây. Vận tốc = 100/10 = 10 m/s hướng từ A đến B'
          },
          {
            title: 'Chuyển động tròn',
            description: 'Một điểm trên vành bánh xe quay. Tốc độ không bằng 0, nhưng vận tốc trung bình = 0 (quay về vị trí cũ)'
          }
        ],
        questions: [
          {
            question: 'Sự khác biệt giữa tốc độ và vận tốc là gì?',
            answers: [
              'Không có khác biệt',
              'Tốc độ có hướng, vận tốc không',
              'Vận tốc có hướng, tốc độ không',
              'Vận tốc luôn lớn hơn tốc độ'
            ],
            correctAnswer: 2,
            explanation: 'Vận tốc là đại lượng véctơ (có hướng), tốc độ là đại lượng vô hướng (không có hướng)'
          }
        ]
      }
    ]
  }
};

// ==================== HÓA HỌC - LỚP 9 ====================
const Chemistry_Grade9_Examples = {
  0: {
    title: 'Phản Ứng Trao Đổi',
    description: 'Hiểu về phản ứng trao đổi và cách viết phương trình',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    sections: [
      {
        title: '1. Khái Niệm Phản Ứng Trao Đổi',
        content: `Phản ứng trao đổi là phản ứng giữa hai chất hợp chất, các nguyên tố hoặc nhóm nguyên tố trao đổi vị trí với nhau.

Dạng tổng quát:
AB + CD → AD + CB

Hoặc:
AB + CD → AC + BD

Ví dụ phổ biến:
1. Phản ứng Axit - Bazơ: HCl + NaOH → NaCl + H₂O
2. Phản ứng Axit - Muối: HCl + Na₂CO₃ → NaCl + H₂O + CO₂
3. Phản ứng Muối - Muối: AgNO₃ + NaCl → AgCl↓ + NaNO₃

Điều kiện xảy ra phản ứng trao đổi:
- Có chất kết tủa (↓)
- Có khí thoát ra (↑)
- Có nước được sinh ra`,
        keyPoints: [
          'Phản ứng trao đổi: AB + CD → AD + CB',
          'Các nguyên tố/nhóm trao đổi vị trí',
          'Cần có điều kiện để xảy ra (kết tủa, khí, nước)',
          'Phổ biến trong hóa học'
        ],
        examples: [
          {
            title: 'Phản ứng Axit-Bazơ',
            description: 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O\nAxit và Bazơ trao đổi tạo muối và nước'
          },
          {
            title: 'Phản ứng Kết Tủa',
            description: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃\nTạo thành kết tủa trắng AgCl không tan trong nước'
          }
        ],
        questions: [
          {
            question: 'Phản ứng trao đổi có dạng tổng quát là gì?',
            answers: [
              'A + B → AB',
              'AB → A + B',
              'AB + CD → AD + CB',
              'A + B + C → ABC'
            ],
            correctAnswer: 2,
            explanation: 'Phản ứng trao đổi có dạng: AB + CD → AD + CB hoặc AB + CD → AC + BD'
          },
          {
            question: 'Điều kiện nào để phản ứng trao đổi xảy ra?',
            answers: [
              'Không cần điều kiện gì',
              'Chỉ cần nhiệt độ cao',
              'Có chất kết tủa, khí thoát ra hoặc nước',
              'Chỉ cần có ánh sáng'
            ],
            correctAnswer: 2,
            explanation: 'Phản ứng trao đổi xảy ra khi có sự hình thành chất kết tủa (↓), khí thoát ra (↑), hoặc nước'
          }
        ]
      }
    ]
  }
};

// ==================== VẬT LÝ - LỚP 10 ====================
const Physics_Grade10_Examples = {
  0: {
    title: 'Định Luật I Newton',
    description: 'Hiểu về quán tính và định luật chuyển động đầu tiên',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    sections: [
      {
        title: '1. Quán Tính',
        content: `Quán tính là tính chất của vật khó thay đổi trạng thái chuyển động của nó.

Định luật I Newton (Định luật Quán Tính):
"Nếu tổng hợp lực tác dụng lên một vật bằng 0, thì vật sẽ giữ nguyên trạng thái đang có:
- Nếu đang đứng yên, vật sẽ tiếp tục đứng yên
- Nếu đang chuyển động, vật sẽ tiếp tục chuyển động với vận tốc không đổi"

Biểu thức toán học:
Nếu ΣF = 0 thì v = hằng số

Điều này có nghĩa:
- Không cần lực để giữ vật chuyển động
- Lực chỉ cần thiết để thay đổi trạng thái chuyển động`,
        keyPoints: [
          'Quán tính: khó thay đổi trạng thái chuyển động',
          'Định luật I Newton về quán tính',
          'ΣF = 0 ⟹ v = const',
          'Không cần lực để duy trì chuyển động'
        ],
        examples: [
          {
            title: 'Hành khách trên xe bus',
            description: 'Khi xe bus phanh đột ngột, hành khách vẫn có xu hướng tiếp tục chuyển động phía trước do quán tính'
          },
          {
            title: 'Bảng trên một chiếc khăn',
            description: 'Nếu kéo khăn nhanh, bảng sẽ giữ nguyên trên chỗ cũ do quán tính, không bị rơi'
          }
        ],
        questions: [
          {
            question: 'Định luật I Newton nói gì?',
            answers: [
              'F = ma',
              'Lực tác dụng luôn thay đổi vận tốc',
              'Nếu ΣF = 0 thì vật giữ nguyên trạng thái',
              'Mỗi tác dụng có phản tác dụng bằng và ngược'
            ],
            correctAnswer: 2,
            explanation: 'Định luật I Newton: Nếu hợp lực = 0, vật giữ nguyên trạng thái (đứng yên hoặc chuyển động đều)'
          }
        ]
      }
    ]
  }
};

// ==================== CÁCH SỬ DỤNG ====================
/*
 * 1. Sao chép toàn bộ object của môn/lớp vào lectureData.js
 * 2. Thay đổi videoUrl thành link YouTube thực tế
 * 3. Sửa nội dung theo môn học của bạn
 * 4. Đảm bảo mỗi câu hỏi có 4 lựa chọn và correctAnswer là index (0, 1, 2, 3)
 * 5. Test trên giao diện để đảm bảo hiển thị đúng
 */

export { Physics_Grade8_Examples, Chemistry_Grade9_Examples, Physics_Grade10_Examples };

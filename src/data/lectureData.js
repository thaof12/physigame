export const lectureData = {
  physics: {
    6: {
      0: {
        title: 'Đại cương về cơ học',
        description: 'Hiểu các khái niệm cơ bản về chuyển động và lực',
        sections: [
          {
            title: '1. Chuyển động là gì?',
            content: 'Chuyển động là sự thay đổi vị trí của một vật theo thời gian.\n\nVí dụ: ô tô chạy, người đi bộ, quả bóng lăn, máy bay bay.\n\nĐể mô tả chuyển động cần biết:\n1. Điểm xuất phát\n2. Quãng đường\n3. Thời gian\n4. Hướng',
            keyPoints: [
              'Chuyển động = thay đổi vị trí theo thời gian',
              'Cần hệ quy chiếu để xác định chuyển động',
              'Quãng đường ≠ độ dịch chuyển'
            ],
            examples: [
              {
                title: 'Ô tô Hà Nội → Hải Phòng',
                description: 'Khoảng cách 100 km, thời gian 2 giờ'
              }
            ],
            questions: [
              {
                question: 'Chuyển động là gì?',
                answers: [
                  'Thay đổi vị trí theo thời gian',
                  'Quay tròn của vật',
                  'Rơi của vật',
                  'Tăng tốc độ'
                ],
                correctAnswer: 0,
                explanation: 'Chuyển động = sự thay đổi vị trí theo thời gian.'
              }
            ]
          },
          {
            title: '2. Vận tốc',
            content: 'Vận tốc = quãng đường / thời gian\nv = s / t\n\nĐơn vị: m/s, km/h\nVận tốc lớn → chuyển động nhanh',
            keyPoints: [
              'v = s / t',
              'Đơn vị: m/s hoặc km/h',
              'Vận tốc càng lớn, chuyển động càng nhanh'
            ],
            examples: [
              {
                title: 'Xe đạp 12 km/h',
                description: '3 km trong 0,25 giờ'
              }
            ],
            questions: [
              {
                question: 'Công thức vận tốc?',
                answers: [
                  'v = t/s',
                  'v = s/t',
                  'v = s×t',
                  'v = s-t'
                ],
                correctAnswer: 1,
                explanation: 'v = s/t'
              }
            ]
          },
          {
            title: '3. Lực',
            content: 'Lực = tác dụng của một vật lên vật khác.\n\nLực có thể:\n- Làm thay đổi vận tốc\n- Làm thay đổi hình dáng\n\nCác loại lực:\n- Trọng lực (Trái Đất)\n- Lực đàn hồi (vật bị nén)\n- Lực ma sát (tiếp xúc)\n- Lực điện từ',
            keyPoints: [
              'Lực có điểm, phương, chiều, độ lớn',
              'Lực là đại lượng véctơ',
              'Lực làm thay đổi chuyển động hoặc hình dáng'
            ],
            examples: [
              {
                title: 'Đá bóng',
                description: 'Lực từ chân → quả bóng thay đổi vận tốc'
              }
            ],
            questions: [
              {
                question: 'Lực có tác dụng gì?',
                answers: [
                  'Chỉ thay đổi vận tốc',
                  'Chỉ thay đổi hình dáng',
                  'Thay đổi vận tốc hoặc hình dáng',
                  'Không tác dụng'
                ],
                correctAnswer: 2,
                explanation: 'Lực thay đổi vận tốc hoặc hình dáng vật.'
              }
            ]
          }
        ]
      },
      1: {
        title: 'Cân bằng lực',
        description: 'Khám phá khi nào các lực cân bằng',
        sections: [
          {
            title: '1. Cân bằng lực',
            content: 'Hai lực cân bằng khi:\n- Cùng độ lớn\n- Ngược chiều\n- Cùng phương\n\nKhi cân bằng → hợp lực = 0\nVật giữ nguyên trạng thái',
            keyPoints: [
              'Cùng độ lớn + ngược chiều',
              'Hợp lực = 0',
              'Vật giữ nguyên trạng thái'
            ],
            examples: [
              {
                title: 'Vật nằm yên trên bàn',
                description: 'Trọng lực xuống = phản lực lên'
              }
            ],
            questions: [
              {
                question: 'Lực cân bằng khi nào?',
                answers: [
                  'Cùng phương',
                  'Cùng độ lớn',
                  'Cùng độ lớn + ngược chiều',
                  'Cùng chiều'
                ],
                correctAnswer: 2,
                explanation: 'Hai lực cân bằng: cùng độ lớn + ngược chiều'
              }
            ]
          }
        ]
      }
    },
    7: {
      0: {
        title: 'Quang học cơ bản',
        description: 'Hiểu về ánh sáng và các hiện tượng quang học',
        sections: [
          {
            title: '1. Ánh sáng',
            content: 'Ánh sáng = năng lượng cho phép nhìn thấy vật.\n\nNguồn sáng:\n- Tự nhiên: Mặt Trời, sao, lửa\n- Nhân tạo: Đèn điện, LED\n\nTính chất:\n- Truyền theo đường thẳng\n- Tốc độ: 3×10⁸ m/s\n- Có thể phản xạ, khúc xạ',
            keyPoints: [
              'Ánh sáng truyền theo đường thẳng',
              'Tốc độ: 3×10⁸ m/s',
              'Bước sóng: 400-700 nm'
            ],
            examples: [
              {
                title: 'Bóng của vật',
                description: 'Ánh sáng truyền thẳng → tạo bóng'
              }
            ],
            questions: [
              {
                question: 'Tốc độ ánh sáng?',
                answers: [
                  '3×10⁶ m/s',
                  '3×10⁸ m/s',
                  '3×10¹⁰ m/s',
                  '3×10⁵ m/s'
                ],
                correctAnswer: 1,
                explanation: 'Tốc độ ánh sáng = 3×10⁸ m/s'
              }
            ]
          }
        ]
      }
    },
    8: {
      0: {
        title: 'Động học chất điểm',
        description: 'Nghiên cứu chuyển động của vật mà không xét đến nguyên nhân',
        sections: [
          {
            title: '1. Chuyển động thẳng đều',
            content: 'Chuyển động thẳng đều là chuyển động mà quãng đường được di chuyển trong những khoảng thời gian bằng nhau là bằng nhau.\n\nVận tốc không đổi: v = s/t = const\n\nĐặc điểm:\n- Quỹ đạo là đường thẳng\n- Vận tốc không thay đổi\n- Gia tốc = 0',
            keyPoints: [
              'Quãng đường bằng nhau trong thời gian bằng nhau',
              'v = const',
              'a = 0'
            ],
            examples: [
              {
                title: 'Ô tô chạy trên đường cao tốc',
                description: 'Duy trì tốc độ 100 km/h không đổi'
              }
            ],
            questions: [
              {
                question: 'Gia tốc trong chuyển động thẳng đều là bao nhiêu?',
                answers: [
                  'a = 1 m/s²',
                  'a = 0',
                  'a = 9.8 m/s²',
                  'a = 2v/t'
                ],
                correctAnswer: 1,
                explanation: 'Chuyển động thẳng đều có gia tốc bằng 0'
              }
            ]
          }
        ]
      }
    },
    9: {
      0: {
        title: 'Dao động điều hòa',
        description: 'Khám phá chuyển động tuần hoàn của lò xo và con lắc',
        sections: [
          {
            title: '1. Định nghĩa dao động điều hòa',
            content: 'Dao động điều hòa là chuyển động mà li độ của vật biến thiên theo thời gian theo quy luật: x = A.cos(ωt + φ)\n\nĐặc điểm:\n- Có tâm cân bằng\n- Dao động quanh vị trí cân bằng\n- Lực phục hồi tỉ lệ với li độ',
            keyPoints: [
              'Li độ: x = A.cos(ωt + φ)',
              'Biên độ A không đổi',
              'Chu kỳ T không đổi'
            ],
            examples: [
              {
                title: 'Con lắc đơn',
                description: 'Dao động quanh vị trí cân bằng dưới tác dụng của lực phục hồi'
              }
            ],
            questions: [
              {
                question: 'Phương trình dao động điều hòa là gì?',
                answers: [
                  'x = A.sin(ωt)',
                  'x = A.cos(ωt + φ)',
                  'x = ωt',
                  'x = A.tan(ωt)'
                ],
                correctAnswer: 1,
                explanation: 'Phương trình dao động điều hòa: x = A.cos(ωt + φ)'
              }
            ]
          }
        ]
      }
    },
    10: {
      0: {
        title: 'Điện tích và điện trường',
        description: 'Hiểu về điện tích, định luật Coulomb và điện trường',
        sections: [
          {
            title: '1. Điện tích',
            content: 'Điện tích là tính chất vật lý của vật quyết định lực tương tác điện từ.\n\nCó 2 loại điện tích:\n- Điện tích dương (+)\n- Điện tích âm (-)\n\nĐơn vị: Coulomb (C)\n\nQuy tắc:\n- Cùng dấu → đẩy nhau\n- Khác dấu → hút nhau',
            keyPoints: [
              'Có 2 loại điện tích: + và -',
              'Đơn vị: Coulomb (C)',
              'Cùng dấu đẩy, khác dấu hút'
            ],
            examples: [
              {
                title: 'Que thủy tinh và lụa',
                description: 'Cọ que thủy tinh bằng lụa tạo ra điện tích'
              }
            ],
            questions: [
              {
                question: 'Hai điện tích cùng dấu sẽ?',
                answers: [
                  'Hút nhau',
                  'Đẩy nhau',
                  'Không tác dụng',
                  'Quay quanh nhau'
                ],
                correctAnswer: 1,
                explanation: 'Hai điện tích cùng dấu sẽ đẩy nhau'
              }
            ]
          }
        ]
      }
    },
    11: {
      0: {
        title: 'Con lắc lò xo',
        description: 'Phân tích chuyển động của lò xo và năng lượng',
        sections: [
          {
            title: '1. Con lắc lò xo nằm ngang',
            content: 'Con lắc lò xo là hệ gồm lò xo có độ cứng k và vật nặng m.\n\nPhương trình chuyển động:\nm.a = -k.x\n\nTần số góc: ω = √(k/m)\nChu kỳ: T = 2π√(m/k)',
            keyPoints: [
              'Lực phục hồi: F = -kx',
              'ω = √(k/m)',
              'T = 2π√(m/k)'
            ],
            examples: [
              {
                title: 'Lò xo nằm ngang với vật',
                description: 'Kéo vật ra rồi thả, lò xo dao động'
              }
            ],
            questions: [
              {
                question: 'Công thức chu kỳ con lắc lò xo?',
                answers: [
                  'T = π√(m/k)',
                  'T = 2π√(m/k)',
                  'T = √(m/k)',
                  'T = k/m'
                ],
                correctAnswer: 1,
                explanation: 'Chu kỳ con lắc lò xo: T = 2π√(m/k)'
              }
            ]
          }
        ]
      }
    },
    12: {
      0: {
        title: 'Các định luật Newton',
        description: 'Nắm vững 3 định luật Newton về chuyển động',
        sections: [
          {
            title: '1. Định luật 1 Newton (Quán tính)',
            content: 'Nếu không có lực tác dụng, một vật đang chuyển động sẽ tiếp tục chuyển động, một vật đang đứng yên sẽ tiếp tục đứng yên.\n\nMục phát biểu:\n- Một vật sẽ giữ nguyên trạng thái chuyển động hoặc đứng yên nếu không có lực tác dụng\n- Hoặc tổng lực tác dụng bằng 0',
            keyPoints: [
              'Vật giữ nguyên trạng thái nếu F = 0',
              'Định luật quán tính',
              'ΣF = 0 → a = 0'
            ],
            examples: [
              {
                title: 'Ô tô đột ngừng',
                description: 'Hành khách bị chúi về phía trước vì quán tính'
              }
            ],
            questions: [
              {
                question: 'Định luật 1 Newton nói gì?',
                answers: [
                  'F = ma',
                  'Vật giữ nguyên trạng thái nếu F=0',
                  'Lực tác dụng ngược',
                  'Gia tốc = lực'
                ],
                correctAnswer: 1,
                explanation: 'Định luật 1: Vật giữ nguyên trạng thái nếu lực = 0'
              }
            ]
          }
        ]
      }
    }
  }
};

import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

// ==================== CÂU HỎI HÓA HỌC ====================
const chemistryQuestions = [
  // Lớp 8 (5 câu)
  {
    question: "Chất nào sau đây là đơn chất?",
    options: ["H2O", "O2", "NaCl", "CO2"],
    answer: "O2",
    level: 8
  },
  {
    question: "Công thức hóa học của axit sunfuric là gì?",
    options: ["H2SO4", "HCl", "NaOH", "H2O"],
    answer: "H2SO4",
    level: 8
  },
  {
    question: "Phản ứng hóa học là gì?",
    options: ["Quá trình chất biến đổi tạo ra chất mới", "Quá trình hòa tan một chất", "Quá trình thay đổi trạng thái", "Quá trình vật lý"],
    answer: "Quá trình chất biến đổi tạo ra chất mới",
    level: 8
  },
  {
    question: "Ký hiệu hóa học của Sắt là gì?",
    options: ["S", "Fe", "Si", "Na"],
    answer: "Fe",
    level: 8
  },
  {
    question: "Trong không khí, khí nào chiếm tỉ lệ lớn nhất?",
    options: ["Oxi", "Cacbonic", "Nito", "Heli"],
    answer: "Nito",
    level: 8
  },
  // Lớp 9 (5 câu)
  {
    question: "Dung dịch làm quỳ tím hóa xanh là?",
    options: ["Axit", "Bazo", "Muối", "Nước"],
    answer: "Bazo",
    level: 9
  },
  {
    question: "Kim loại nào sau đây tác dụng được với nước ở nhiệt độ thường?",
    options: ["Cu", "Fe", "Na", "Ag"],
    answer: "Na",
    level: 9
  },
  {
    question: "Chất nào được dùng để sản xuất vôi sống?",
    options: ["CaCO3", "NaCl", "H2SO4", "SO2"],
    answer: "CaCO3",
    level: 9
  },
  {
    question: "Dãy kim loại nào sau đây được sắp xếp theo chiều hoạt động hóa học giảm dần?",
    options: ["K, Na, Mg, Al", "Al, Mg, Na, K", "Na, K, Al, Mg", "Mg, Al, K, Na"],
    answer: "K, Na, Mg, Al",
    level: 9
  },
  {
    question: "Khí metan (CH4) có nhiều trong đâu?",
    options: ["Mỏ than", "Không khí", "Nước biển", "Mỏ đá vôi"],
    answer: "Mỏ than",
    level: 9
  },
  // Lớp 10 (10 câu)
  {
    question: "Số electron tối đa ở lớp M (n=3) là?",
    options: ["2", "8", "18", "32"],
    answer: "18",
    level: 10
  },
  {
    question: "Nguyên tử của nguyên tố X có Z=11. Cấu hình electron của X là?",
    options: ["1s2 2s2 2p6 3s1", "1s2 2s2 2p5 3s2", "1s2 2s2 2p6", "1s2 2s2 2p6 3s2"],
    answer: "1s2 2s2 2p6 3s1",
    level: 10
  },
  {
    question: "Liên kết trong phân tử NaCl là liên kết gì?",
    options: ["Cộng hóa trị", "Ion", "Kim loại", "Hydro"],
    answer: "Ion",
    level: 10
  },
  {
    question: "Số oxi hóa của S trong H2SO4 là?",
    options: ["+2", "+4", "+6", "-2"],
    answer: "+6",
    level: 10
  },
  {
    question: "Trong bảng tuần hoàn, Flo (F) thuộc nhóm nào?",
    options: ["IA", "IIA", "VIIA", "VIIIA"],
    answer: "VIIA",
    level: 10
  },
  {
    question: "Phản ứng tỏa nhiệt là phản ứng có Delta H...?",
    options: ["< 0", "> 0", "= 0", "Không xác định"],
    answer: "< 0",
    level: 10
  },
  {
    question: "Tốc độ phản ứng KHÔNG phụ thuộc vào yếu tố nào sau đây?",
    options: ["Nồng độ", "Nhiệt độ", "Chất xúc tác", "Màu sắc chất"],
    answer: "Màu sắc chất",
    level: 10
  },
  {
    question: "Chất nào sau đây là chất điện li mạnh?",
    options: ["H2O", "CH3COOH", "HCl", "C2H5OH"],
    answer: "HCl",
    level: 10
  },
  {
    question: "Halogen nào có tính oxi hóa mạnh nhất?",
    options: ["Flo", "Clo", "Brom", "Iot"],
    answer: "Flo",
    level: 10
  },
  {
    question: "Khí SO2 là nguyên nhân chính gây ra hiện tượng gì?",
    options: ["Hiệu ứng nhà kính", "Mưa axit", "Thủng tầng ozon", "Thủy triều đỏ"],
    answer: "Mưa axit",
    level: 10
  },
  // Lớp 11 (5 câu)
  {
    question: "Công thức chung của ankan là?",
    options: ["CnH2n+2 (n>=1)", "CnH2n (n>=2)", "CnH2n-2 (n>=2)", "CnH2n-6 (n>=6)"],
    answer: "CnH2n+2 (n>=1)",
    level: 11
  },
  {
    question: "Chất nào sau đây là anken?",
    options: ["CH4", "C2H4", "C2H2", "C6H6"],
    answer: "C2H4",
    level: 11
  },
  {
    question: "Dẫn xuất halogen nào được dùng làm chất gây mê?",
    options: ["Freon", "Cloroform", "DDT", "Teflon"],
    answer: "Cloroform",
    level: 11
  },
  {
    question: "Ancol etylic có công thức là?",
    options: ["CH3OH", "C2H5OH", "C3H7OH", "CH3COOH"],
    answer: "C2H5OH",
    level: 11
  },
  {
    question: "Phenol (C6H5OH) có tính chất hóa học đặc trưng là?",
    options: ["Tính axit yếu", "Tính bazo yếu", "Trung tính", "Lưỡng tính"],
    answer: "Tính axit yếu",
    level: 11
  },
  // Lớp 12 (5 câu)
  {
    question: "Chất nào sau đây là este?",
    options: ["CH3COOH", "CH3COOCH3", "C2H5OH", "HCHO"],
    answer: "CH3COOCH3",
    level: 12
  },
  {
    question: "Chất béo là trieste của axit béo với chất nào sau đây?",
    options: ["Etanol", "Glixerol", "Metanol", "Phenol"],
    answer: "Glixerol",
    level: 12
  },
  {
    question: "Saccarozơ và glucozơ đều có phản ứng nào?",
    options: ["Tráng gương", "Thủy phân", "Với Cu(OH)2", "Màu với iot"],
    answer: "Với Cu(OH)2",
    level: 12
  },
  {
    question: "Polime nào sau đây được điều chế bằng phản ứng trùng hợp?",
    options: ["Tơ nilon-6,6", "Poli(etylen terephtalat)", "Poli(vinyl clorua)", "Tơ lapsan"],
    answer: "Poli(vinyl clorua)",
    level: 12
  },
  {
    question: "Kim loại nào sau đây có tính khử mạnh nhất?",
    options: ["K", "Mg", "Cu", "Ag"],
    answer: "K",
    level: 12
  }
];

// ==================== CÂU HỎI VẬT LÝ ====================
const physicsQuestions = [
  // Lớp 6 (5 câu)
  {
    question: "Đơn vị đo độ dài trong hệ SI là gì?",
    options: ["Kilômét (km)", "Mét (m)", "Centimét (cm)", "Milimét (mm)"],
    answer: "Mét (m)",
    level: 6
  },
  {
    question: "Dụng cụ nào dùng để đo khối lượng?",
    options: ["Thước dây", "Cân", "Đồng hồ", "Nhiệt kế"],
    answer: "Cân",
    level: 6
  },
  {
    question: "1 kilôgam bằng bao nhiêu gam?",
    options: ["10 g", "100 g", "1000 g", "10000 g"],
    answer: "1000 g",
    level: 6
  },
  {
    question: "Đơn vị đo thời gian trong hệ SI là gì?",
    options: ["Phút", "Giờ", "Giây (s)", "Ngày"],
    answer: "Giây (s)",
    level: 6
  },
  {
    question: "Khi đo độ dài, ta cần đặt mắt như thế nào?",
    options: ["Nhìn nghiêng sang trái", "Nhìn nghiêng sang phải", "Nhìn vuông góc với thước", "Nhìn từ trên xuống"],
    answer: "Nhìn vuông góc với thước",
    level: 6
  },
  // Lớp 7 (5 câu)
  {
    question: "Ánh sáng truyền theo đường nào trong môi trường trong suốt đồng nhất?",
    options: ["Đường cong", "Đường gấp khúc", "Đường thẳng", "Đường xoắn ốc"],
    answer: "Đường thẳng",
    level: 7
  },
  {
    question: "Vật màu đen có đặc điểm gì?",
    options: ["Phản xạ tất cả ánh sáng", "Hấp thụ tất cả ánh sáng", "Cho ánh sáng đi qua", "Phát ra ánh sáng"],
    answer: "Hấp thụ tất cả ánh sáng",
    level: 7
  },
  {
    question: "Âm thanh truyền được trong môi trường nào?",
    options: ["Chỉ trong chất rắn", "Chỉ trong chất lỏng", "Chỉ trong chất khí", "Trong chất rắn, lỏng và khí"],
    answer: "Trong chất rắn, lỏng và khí",
    level: 7
  },
  {
    question: "Tần số âm càng cao thì âm nghe càng?",
    options: ["Trầm", "Bổng", "To", "Nhỏ"],
    answer: "Bổng",
    level: 7
  },
  {
    question: "Có hai loại điện tích là?",
    options: ["Dương và trung hòa", "Âm và trung hòa", "Dương và âm", "Lớn và nhỏ"],
    answer: "Dương và âm",
    level: 7
  },
  // Lớp 8 (5 câu)
  {
    question: "Công thức tính vận tốc là gì?",
    options: ["v = s × t", "v = s / t", "v = t / s", "v = s + t"],
    answer: "v = s / t",
    level: 8
  },
  {
    question: "Đơn vị của lực trong hệ SI là gì?",
    options: ["Kilôgam (kg)", "Mét (m)", "Niutơn (N)", "Jun (J)"],
    answer: "Niutơn (N)",
    level: 8
  },
  {
    question: "Áp suất được tính bằng công thức nào?",
    options: ["p = F × S", "p = F / S", "p = S / F", "p = F + S"],
    answer: "p = F / S",
    level: 8
  },
  {
    question: "Lực đẩy Ác-si-mét phụ thuộc vào yếu tố nào?",
    options: ["Khối lượng vật", "Hình dạng vật", "Thể tích phần chất lỏng bị vật chiếm chỗ", "Màu sắc vật"],
    answer: "Thể tích phần chất lỏng bị vật chiếm chỗ",
    level: 8
  },
  {
    question: "Nhiệt lượng được đo bằng đơn vị nào?",
    options: ["Oát (W)", "Jun (J)", "Niutơn (N)", "Vôn (V)"],
    answer: "Jun (J)",
    level: 8
  },
  // Lớp 9 (5 câu)
  {
    question: "Định luật Ôm phát biểu rằng cường độ dòng điện tỉ lệ thuận với?",
    options: ["Điện trở", "Hiệu điện thế", "Công suất", "Điện năng"],
    answer: "Hiệu điện thế",
    level: 9
  },
  {
    question: "Công thức của định luật Ôm là?",
    options: ["I = U × R", "I = U / R", "I = R / U", "I = U + R"],
    answer: "I = U / R",
    level: 9
  },
  {
    question: "Khi mắc nối tiếp các điện trở, điện trở tương đương được tính bằng?",
    options: ["R = R1 × R2", "R = R1 + R2", "1/R = 1/R1 + 1/R2", "R = R1 - R2"],
    answer: "R = R1 + R2",
    level: 9
  },
  {
    question: "Đơn vị của điện trở là gì?",
    options: ["Ampe (A)", "Vôn (V)", "Ôm (Ω)", "Oát (W)"],
    answer: "Ôm (Ω)",
    level: 9
  },
  {
    question: "Thấu kính hội tụ có đặc điểm gì?",
    options: ["Phần rìa dày hơn phần giữa", "Phần giữa dày hơn phần rìa", "Dày đều", "Không có hình dạng cố định"],
    answer: "Phần giữa dày hơn phần rìa",
    level: 9
  },
  // Lớp 10 (5 câu)
  {
    question: "Chuyển động thẳng đều là chuyển động có?",
    options: ["Vận tốc thay đổi", "Gia tốc không đổi", "Vận tốc không đổi", "Quỹ đạo cong"],
    answer: "Vận tốc không đổi",
    level: 10
  },
  {
    question: "Công thức tính gia tốc trong chuyển động thẳng biến đổi đều là?",
    options: ["a = v / t", "a = (v - v₀) / t", "a = v × t", "a = v + v₀"],
    answer: "a = (v - v₀) / t",
    level: 10
  },
  {
    question: "Định luật II Newton được phát biểu: F = ?",
    options: ["m / a", "m × a", "m + a", "m - a"],
    answer: "m × a",
    level: 10
  },
  {
    question: "Đơn vị của công trong hệ SI là?",
    options: ["Niutơn (N)", "Jun (J)", "Oát (W)", "Vôn (V)"],
    answer: "Jun (J)",
    level: 10
  },
  {
    question: "Động năng của một vật được tính bằng công thức?",
    options: ["Wđ = mv", "Wđ = mv²", "Wđ = ½mv²", "Wđ = 2mv²"],
    answer: "Wđ = ½mv²",
    level: 10
  },
  // Lớp 11 (5 câu)
  {
    question: "Định luật Coulomb mô tả lực tương tác giữa?",
    options: ["Hai vật có khối lượng", "Hai điện tích điểm", "Hai nam châm", "Hai dòng điện"],
    answer: "Hai điện tích điểm",
    level: 11
  },
  {
    question: "Đơn vị của điện tích trong hệ SI là?",
    options: ["Vôn (V)", "Ampe (A)", "Culông (C)", "Fara (F)"],
    answer: "Culông (C)",
    level: 11
  },
  {
    question: "Công thức tính điện dung của tụ điện phẳng là?",
    options: ["C = εS/d", "C = ε₀εS/d", "C = εd/S", "C = S/εd"],
    answer: "C = ε₀εS/d",
    level: 11
  },
  {
    question: "Cường độ dòng điện trong mạch kín được tính bằng công thức?",
    options: ["I = E/R", "I = E/(R+r)", "I = E×R", "I = R/E"],
    answer: "I = E/(R+r)",
    level: 11
  },
  {
    question: "Lực từ tác dụng lên dây dẫn mang dòng điện được tính bằng?",
    options: ["F = BIl", "F = BI/l", "F = Bl/I", "F = I/Bl"],
    answer: "F = BIl",
    level: 11
  },
  // Lớp 12 (5 câu)
  {
    question: "Chu kỳ dao động của con lắc đơn được tính bằng công thức?",
    options: ["T = 2π√(l/g)", "T = 2π√(g/l)", "T = π√(l/g)", "T = 2π(l/g)"],
    answer: "T = 2π√(l/g)",
    level: 12
  },
  {
    question: "Bước sóng được tính bằng công thức?",
    options: ["λ = v/f", "λ = v×f", "λ = f/v", "λ = v+f"],
    answer: "λ = v/f",
    level: 12
  },
  {
    question: "Hiện tượng giao thoa sóng xảy ra khi hai sóng có?",
    options: ["Cùng biên độ", "Cùng tần số và hiệu số pha không đổi", "Cùng vận tốc", "Cùng hướng truyền"],
    answer: "Cùng tần số và hiệu số pha không đổi",
    level: 12
  },
  {
    question: "Năng lượng của photon được tính bằng công thức?",
    options: ["E = hf", "E = h/f", "E = f/h", "E = h+f"],
    answer: "E = hf",
    level: 12
  },
  {
    question: "Hạt nhân nguyên tử được cấu tạo bởi?",
    options: ["Proton và electron", "Neutron và electron", "Proton và neutron", "Proton, neutron và electron"],
    answer: "Proton và neutron",
    level: 12
  }
];

// ==================== THÔNG TIN CHƯƠNG TRÌNH ====================
const programConfig = {
  chemistry: {
    name: 'Hóa học',
    icon: '⚗️',
    color: 'from-purple-500 to-pink-600',
    questions: chemistryQuestions,
    gradeLevels: [8, 9, 10, 11, 12]
  },
  physics: {
    name: 'Vật lý',
    icon: '⚛️',
    color: 'from-blue-500 to-cyan-600',
    questions: physicsQuestions,
    gradeLevels: [6, 7, 8, 9, 10, 11, 12]
  }
};

const PlacementTest = () => {
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const { programId } = useParams();
  const { user, setUser } = useAuth();

  // Lấy config và câu hỏi theo chương trình
  const config = programConfig[programId] || programConfig.chemistry;
  const questions = config.questions;

  const handleOptionChange = (questionIndex, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: option
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Tính điểm theo từng cấp độ
    const scoresByLevel = {};
    questions.forEach((q, index) => {
      if (!scoresByLevel[q.level]) {
        scoresByLevel[q.level] = { correct: 0, total: 0 };
      }
      scoresByLevel[q.level].total++;
      if (answers[index] === q.answer) {
        scoresByLevel[q.level].correct++;
      }
    });

    // Xác định lớp phù hợp dựa trên kết quả
    let assignedGrade = config.gradeLevels[0]; // Bắt đầu từ lớp thấp nhất của chương trình
    const gradeLevels = config.gradeLevels;

    for (const level of gradeLevels) {
      const levelScore = scoresByLevel[level];
      if (levelScore && levelScore.total > 0) {
        const percentage = (levelScore.correct / levelScore.total);
        if (percentage >= 0.7) { // Đạt 70% trở lên
          assignedGrade = Math.min(level + 1, gradeLevels[gradeLevels.length - 1]); // Chuyển lên lớp cao hơn
        } else {
          assignedGrade = level; // Ở lại lớp hiện tại
          break;
        }
      }
    }
    
    const totalScore = Object.values(scoresByLevel).reduce((acc, level) => acc + level.correct, 0);
    const totalQuestions = questions.length;
    const wrongAnswers = totalQuestions - totalScore;
    const percentage = Math.round((totalScore / totalQuestions) * 100);

    try {
      if (!user || !user.email) {
        console.error('User object:', user);
        throw new Error('Bạn cần đăng nhập để hoàn thành bài kiểm tra');
      }

      console.log('Submitting placement test for user:', user.email);

      // Gọi API để lưu kết quả và đăng ký chương trình
      const response = await fetch(`${API_BASE_URL}/users/enroll-program`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user.email,
          programId: programId,
          programName: config.name,
          initialClassId: assignedGrade,
          placementTestScore: totalScore,
          placementTestTotal: totalQuestions
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.message || 'Không thể lưu kết quả kiểm tra');
      }

      console.log('✅ Placement test submitted successfully');

      // Cập nhật user trong context với data từ server
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Hiển thị kết quả đẹp
      setResult({
        totalScore,
        totalQuestions,
        wrongAnswers,
        percentage,
        assignedGrade,
        programName: config.name,
        scoresByLevel
      });
      setShowResult(true);

    } catch (error) {
      console.error("Error submitting placement test:", error);
      // Hiển thị thông báo lỗi đẹp hơn
      setResult({
        error: true,
        message: error.message
      });
      setShowResult(true);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate(`/program/${programId}`);
  };

  // Component hiển thị kết quả
  const ResultModal = () => {
    if (!showResult || !result) return null;

    if (result.error) {
      return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">❌</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Có lỗi xảy ra</h2>
              <p className="text-gray-600 mb-6">{result.message}</p>
              <button
                onClick={() => setShowResult(false)}
                className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      );
    }

    const getGradeEmoji = () => {
      if (result.percentage >= 90) return '🏆';
      if (result.percentage >= 70) return '🌟';
      if (result.percentage >= 50) return '👍';
      return '💪';
    };

    const getGradeMessage = () => {
      if (result.percentage >= 90) return 'Xuất sắc! Bạn có nền tảng rất vững chắc!';
      if (result.percentage >= 70) return 'Tốt lắm! Bạn đã sẵn sàng tiến lên!';
      if (result.percentage >= 50) return 'Khá tốt! Hãy cùng củng cố thêm nhé!';
      return 'Không sao! Chúng tôi sẽ giúp bạn tiến bộ!';
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
          {/* Header */}
          <div className={`bg-gradient-to-r ${config.color} p-6 text-white text-center`}>
            <div className="text-5xl mb-3">{getGradeEmoji()}</div>
            <h2 className="text-2xl font-bold mb-2">Hoàn thành bài kiểm tra!</h2>
            <p className="text-white/90">{config.icon} {config.name}</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Score Card */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <div className="text-3xl font-bold text-green-600">{result.totalScore}</div>
                  <div className="text-sm text-gray-500">Câu đúng</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-500">{result.wrongAnswers}</div>
                  <div className="text-sm text-gray-500">Câu sai</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">{result.percentage}%</div>
                  <div className="text-sm text-gray-500">Tỉ lệ đúng</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${config.color} transition-all duration-1000`}
                  style={{ width: `${result.percentage}%` }}
                />
              </div>
            </div>

            {/* Assigned Grade */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {result.assignedGrade}
                </div>
                <div>
                  <div className="text-sm text-amber-700 font-medium">Lớp học phù hợp</div>
                  <div className="text-xl font-bold text-gray-800">Lớp {result.assignedGrade}</div>
                </div>
              </div>
            </div>

            {/* Message */}
            <p className="text-center text-gray-600 mb-6">{getGradeMessage()}</p>

            {/* Button */}
            <button
              onClick={handleContinue}
              className={`w-full py-4 bg-gradient-to-r ${config.color} hover:opacity-90 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]`}
            >
              Bắt đầu học ngay 🚀
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Card */}
        <div className={`bg-gradient-to-r ${config.color} rounded-2xl shadow-xl p-6 mb-6 text-white`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">{config.icon}</div>
            <div>
              <h1 className="text-2xl font-bold">Bài kiểm tra đánh giá năng lực</h1>
              <p className="text-white/80">{config.name}</p>
            </div>
          </div>
          <p className="text-white/90">
            Hoàn thành {questions.length} câu hỏi để chúng tôi đề xuất lộ trình học phù hợp nhất cho bạn.
          </p>
        </div>

        {/* Questions Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {questions.map((q, index) => (
                <div key={index} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="flex items-start gap-3 mb-4">
                    <span className={`flex-shrink-0 w-8 h-8 bg-gradient-to-r ${config.color} text-white rounded-lg flex items-center justify-center text-sm font-bold`}>
                      {index + 1}
                    </span>
                    <p className="text-lg font-medium text-gray-800 pt-0.5">{q.question}</p>
                  </div>
                  <div className="space-y-2 ml-11">
                    {q.options.map((option, i) => (
                      <label 
                        key={i} 
                        className={`flex items-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                          answers[index] === option 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={answers[index] === option}
                          onChange={() => handleOptionChange(index, option)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-3 text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress & Submit */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  Đã trả lời: {Object.keys(answers).length}/{questions.length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round((Object.keys(answers).length / questions.length) * 100)}% hoàn thành
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
                <div 
                  className={`h-full bg-gradient-to-r ${config.color} transition-all duration-300`}
                  style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || Object.keys(answers).length < questions.length}
                className={`w-full bg-gradient-to-r ${config.color} hover:opacity-90 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  `Nộp bài và xem kết quả`
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Result Modal */}
      <ResultModal />

      {/* Animation styles */}
      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PlacementTest;

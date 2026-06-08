import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "Làm thế nào để đổi ảnh đại diện (Avatar)?",
      a: "Bạn có thể nhấp vào tên hoặc ảnh hiện tại của mình ở góc trên cùng bên phải, sau đó chọn 'Trang cá nhân'. Nhấp vào biểu tượng camera ở ảnh đại diện để tải ảnh mới từ thiết bị của bạn lên."
    },
    {
      q: "Tại sao tôi không thể vào phòng Đấu trường (PK Battle)?",
      a: "Hãy đảm bảo bạn đã đăng nhập và phòng Đấu trường đó vẫn còn trống (chưa đầy hoặc chưa bắt đầu). Ngoài ra, hãy kiểm tra lại mã phòng nếu bạn vào phòng do bạn bè tạo."
    },
    {
      q: "Phòng thí nghiệm ảo yêu cầu cấu hình máy tính như thế nào?",
      a: "Eureka sử dụng công nghệ WebGL (React Three Fiber) trực tiếp trên trình duyệt. Bạn chỉ cần một trình duyệt web hiện đại (Chrome, Edge, Firefox, Safari) được cập nhật mới nhất. Tuy nhiên, thiết bị có card đồ họa rời sẽ cho trải nghiệm 3D mượt mà hơn ở tần số quét cao (120Hz)."
    },
    {
      q: "Tôi có thể xem lại lịch sử đấu trường và thành tích ở đâu?",
      a: "Toàn bộ lịch sử học tập, chuỗi ngày liên tục (streak), kho huy hiệu và lịch sử đấu trường đều được lưu trữ trong 'Trang cá nhân' của bạn. Dữ liệu được cập nhật theo thời gian thực mỗi khi bạn hoàn thành bài học hoặc trận đấu."
    },
    {
      q: "Giáo viên và học sinh có tính năng khác nhau không?",
      a: "Có. Tài khoản Học sinh tập trung vào việc học, giải bài tập và tham gia đấu trường. Tài khoản Giáo viên (nếu được phê duyệt) sẽ có thêm bảng điều khiển (Admin/Teacher Panel) để tạo bài giảng, giao bài tập và xem thống kê tiến độ của học sinh."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Câu hỏi thường gặp (FAQ)</h1>
          <p className="text-slate-500 font-medium">Giải đáp nhanh các thắc mắc trong quá trình sử dụng Eureka</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === idx ? 'border-blue-300 shadow-md' : 'border-slate-200 shadow-sm hover:border-blue-200'}`}
            >
              <button 
                className="w-full px-6 py-5 text-left flex items-center justify-between font-bold text-slate-800"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                {faq.q}
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openIndex === idx ? 'rotate-180 text-blue-500' : ''}`} />
              </button>
              
              <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;

import React from 'react';
import { Scale } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-12 border-b border-slate-100 flex items-center gap-4">
          <Scale className="w-10 h-10 text-indigo-500" />
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Điều khoản dịch vụ</h1>
            <p className="text-slate-500 font-medium mt-2">Cập nhật lần cuối: Tháng 6, 2026</p>
          </div>
        </div>
        
        <div className="p-8 md:p-12 space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Chấp nhận điều khoản</h2>
            <p className="text-slate-600">
              Bằng việc truy cập và sử dụng nền tảng học tập trực tuyến Eureka, bạn đồng ý tuân thủ các quy định và điều khoản được nêu dưới đây. Nếu bạn không đồng ý với bất kỳ phần nào của điều khoản này, vui lòng ngừng sử dụng dịch vụ.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Quy định về tài khoản</h2>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-600">
              <li>Bạn phải cung cấp thông tin chính xác khi đăng ký tài khoản.</li>
              <li>Mỗi người dùng chịu trách nhiệm bảo mật thông tin đăng nhập của mình. Cấm hành vi chia sẻ tài khoản với nhiều người.</li>
              <li>Hệ thống có quyền khóa tài khoản vĩnh viễn nếu phát hiện hành vi gian lận trong Đấu trường (PK Battle) hoặc trong các bài kiểm tra.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. Quy tắc ứng xử</h2>
            <p className="mb-2">Môi trường giáo dục yêu cầu sự tôn trọng và văn minh. Chúng tôi nghiêm cấm các hành vi:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-600">
              <li>Sử dụng ngôn ngữ thiếu chuẩn mực, xúc phạm người khác trong chatbox hoặc trong tên hiển thị.</li>
              <li>Spam, gửi tin nhắn rác gây cản trở hoạt động của Phòng học hoặc Đấu trường.</li>
              <li>Sử dụng phần mềm thứ ba để can thiệp vào kết quả mô phỏng của Phòng thí nghiệm ảo.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Bản quyền tài liệu</h2>
            <p className="text-slate-600">
              Toàn bộ nội dung bài giảng, hình ảnh 3D, mô hình thí nghiệm và cấu trúc trò chơi thuộc bản quyền của Eureka Physics Lab. Nghiêm cấm sao chép, phát tán hoặc sử dụng cho mục đích thương mại khi chưa có sự cho phép bằng văn bản từ chúng tôi.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

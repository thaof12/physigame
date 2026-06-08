import React from 'react';
import { ShieldCheck } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-12 border-b border-slate-100 flex items-center gap-4">
          <ShieldCheck className="w-10 h-10 text-emerald-500" />
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Chính sách bảo mật</h1>
            <p className="text-slate-500 font-medium mt-2">Cập nhật lần cuối: Tháng 6, 2026</p>
          </div>
        </div>
        
        <div className="p-8 md:p-12 space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Thu thập thông tin</h2>
            <p className="mb-2">Khi bạn đăng ký và sử dụng nền tảng Eureka, chúng tôi thu thập các thông tin sau:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-600">
              <li>Thông tin tài khoản: Tên đăng nhập, Mật khẩu (đã được mã hóa), Email (nếu có).</li>
              <li>Dữ liệu học tập: Tiến độ bài giảng, kết quả bài kiểm tra, thành tích và danh hiệu.</li>
              <li>Dữ liệu thi đấu: Điểm số, xếp hạng ELO trong các trận PK Battle.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Cách chúng tôi sử dụng thông tin</h2>
            <p className="mb-2">Dữ liệu của bạn được sử dụng vào mục đích duy nhất là nâng cao trải nghiệm học tập:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-600">
              <li>Cá nhân hóa lộ trình học và đề xuất bài giảng phù hợp.</li>
              <li>Ghép cặp thi đấu công bằng trong hệ thống Đấu trường.</li>
              <li>Hiển thị bảng xếp hạng thành tích minh bạch.</li>
              <li>Cho phép Giáo viên (nếu bạn tham gia lớp học) theo dõi tiến độ để hỗ trợ tốt hơn.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. Bảo vệ dữ liệu</h2>
            <p className="text-slate-600">
              Chúng tôi cam kết không bán, trao đổi hoặc cho thuê thông tin cá nhân của người dùng cho bên thứ ba. Mật khẩu của bạn được mã hóa an toàn bằng công nghệ Bcrypt trước khi lưu trữ vào cơ sở dữ liệu. Mọi kết nối truyền tải dữ liệu đều được mã hóa (HTTPS).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Quyền lợi của bạn</h2>
            <p className="text-slate-600">
              Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa toàn bộ dữ liệu tài khoản của mình bất cứ lúc nào. Việc cập nhật ảnh đại diện (avatar) hoặc đổi mật khẩu có thể được thực hiện dễ dàng ngay tại Trang cá nhân.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

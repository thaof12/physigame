import React from 'react';
import { BookOpen, FlaskConical, Swords, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const UserGuide = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#274dad] to-[#2099e9] p-12 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Hướng dẫn sử dụng</h1>
          <p className="text-blue-100 font-medium text-lg">Khám phá toàn bộ tính năng trên hệ sinh thái Eureka</p>
        </div>
        
        <div className="p-8 md:p-12 space-y-12 text-slate-700">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#274dad] mb-6">
              <BookOpen className="w-8 h-8" />
              <h2 className="text-2xl font-bold">1. Bài giảng Tương tác (Interactive Lectures)</h2>
            </div>
            <p className="leading-relaxed">
              Hệ thống cung cấp các bài giảng lý thuyết bám sát chương trình phổ thông. Để học một bài:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-600">
              <li>Truy cập mục <strong>Hành trình &gt; Bài giảng</strong> từ thanh điều hướng (Header).</li>
              <li>Chọn khối lớp phù hợp (từ lớp 6 đến lớp 12).</li>
              <li>Chọn chương và bài học bạn muốn tham gia. Tại đây, bạn sẽ thấy kết hợp giữa lý thuyết trực quan và video minh họa.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-600 mb-6">
              <FlaskConical className="w-8 h-8" />
              <h2 className="text-2xl font-bold">2. Phòng thí nghiệm Ảo (Virtual Lab)</h2>
            </div>
            <p className="leading-relaxed">
              Đây là không gian giả lập 3D giúp bạn kiểm chứng các định luật vật lý bằng cách thao tác trực tiếp:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-600">
              <li>Đi đến <strong>Thử thách &gt; Thí nghiệm</strong>.</li>
              <li>Mỗi thí nghiệm cung cấp công cụ có thể tùy chỉnh thông số (khối lượng, vận tốc, chiều dài dây treo...).</li>
              <li>Hệ thống 120Hz Core sẽ mô phỏng kết quả chính xác theo thời gian thực (Real-time).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-red-500 mb-6">
              <Swords className="w-8 h-8" />
              <h2 className="text-2xl font-bold">3. Đấu trường (PK Battle)</h2>
            </div>
            <p className="leading-relaxed">
              Tham gia thi đấu kiến thức trực tiếp với bạn bè hoặc người học khác:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-600">
              <li>Trong <strong>Thử thách &gt; Đấu trường</strong>, bạn có thể Tự động ghép cặp (Matchmaking) hoặc Tạo/Vào phòng riêng (Room).</li>
              <li>Hai bên sẽ trả lời các câu hỏi tính toán và tư duy vật lý có tính thời gian.</li>
              <li>Người chiến thắng sẽ được cộng điểm vinh quang và xếp hạng trên Leaderboard toàn cầu.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-purple-600 mb-6">
              <Play className="w-8 h-8" />
              <h2 className="text-2xl font-bold">4. Trò chơi Thử thách (Physics Games)</h2>
            </div>
            <p className="leading-relaxed">
              Nâng cao tư duy bằng cách vượt qua các mini-game mô phỏng quy luật tự nhiên như Cân bằng, Mạch điện, Quang học. Hãy tự do "bẻ cong" giới hạn và tìm ra lời giải sáng tạo nhất.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;

import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { ChevronRight } from 'lucide-react';
import grade6 from '../../../assets/images/grade_6.png';
import grade7 from '../../../assets/images/grade_7.png';
import grade8 from '../../../assets/images/grade_8.png';
import grade9 from '../../../assets/images/grade_9.png';
import grade10 from '../../../assets/images/grade_10.png';
import grade11 from '../../../assets/images/grade_11.png';
import grade12 from '../../../assets/images/grade_12.png';

const PhysicsClasses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="bg-[#FFFFFF] font-sans overflow-x-hidden min-h-screen selection:bg-[#274dad]/20 selection:text-[#4A3728]">
      <section className="py-24 sm:py-32 bg-[#FFFFFF] relative overflow-hidden">
        <div className="absolute inset-0 graph-grid opacity-[0.2] pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10 text-center">
          <div className="mb-16 sm:mb-24">
            <h2 className="text-4xl sm:text-5xl font-black text-[#1E293B] tracking-tight mb-6">Bắt đầu hành trình học tập tại đây</h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
              Mỗi cấp độ là một hành trình mới với câu chuyện riêng và thử thách thú vị, giúp bạn khám phá Vật Lý một cách tự nhiên và phát triển toàn diện.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                title: 'Khoa học tự nhiên 6',
                desc: 'Đo lường, Chuyển thể của chất và Năng lượng cơ bản trong đời sống.',
                img: grade6,
                grades: 'Lớp 6',
                path: 6
              },
              {
                title: 'Khoa học tự nhiên 7',
                desc: 'Khám phá Tốc độ, Sóng âm, Ánh sáng và Từ trường thực nghiệm.',
                img: grade7,
                grades: 'Lớp 7',
                path: 7
              },
              {
                title: 'Khoa học tự nhiên 8',
                desc: 'Nghiên cứu Lực, Áp suất, Công và Năng lượng cơ học ứng dụng.',
                img: grade8,
                grades: 'Lớp 8',
                path: 8
              },
              {
                title: 'Khoa học tự nhiên 9',
                desc: 'Điện học, Định luật Ohm và Khúc xạ ánh sáng nâng cao với tương tác 3D.',
                img: grade9,
                grades: 'Lớp 9',
                path: 9
              },
              {
                title: 'Vật lý 10',
                desc: 'Động học, Động lực học, Năng lượng và các định luật Bảo toàn động lượng.',
                img: grade10,
                grades: 'Lớp 10',
                path: 10
              },
              {
                title: 'Vật lý 11',
                desc: 'Dao động điều hòa, Sóng cơ, Điện trường và quy luật Vật lý nhiệt.',
                img: grade11,
                grades: 'Lớp 11',
                path: 11
              },
              {
                title: 'Vật lý 12',
                desc: 'Vật lý hạt nhân, Khí lý tưởng và Từ trường theo chuẩn Kết nối tri thức.',
                img: grade12,
                grades: 'Lớp 12',
                path: 12
              }
            ].map((card, idx) => (
              <div
                key={idx}
                className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-[#E5E7EB] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(184,115,51,0.15)] hover:-translate-y-2 transition-all duration-700 cursor-pointer"
                onClick={() => navigate(`/physics-class/${card.path}`)}
              >
                {/* Image Container */}
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#274dad]/10 to-transparent group-hover:opacity-40 transition-opacity" />

                  {/* Grade Badge */}
                  <div className="absolute top-5 left-5 px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-md border border-white/50 text-[#2099e9] font-black text-[9px] tracking-[0.1em] uppercase shadow-sm">
                    {card.grades}
                  </div>

                  {/* Program Badge */}
                  <div className="absolute bottom-5 left-5 right-5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md text-white font-bold text-[8px] tracking-[0.05em] uppercase opacity-0 group-hover:opacity-100 transition-opacity text-center">
                    Kết nối tri thức với cuộc sống
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 text-left">
                  <h3 className="text-xl font-black text-[#1E293B] mb-3 group-hover:text-[#274dad] transition-colors leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-slate-500 font-medium leading-relaxed text-[13px]">
                    {card.desc}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-[#274dad] font-black text-[10px] tracking-widest uppercase group-hover:gap-4 transition-all">
                    Bắt đầu học <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PhysicsClasses;


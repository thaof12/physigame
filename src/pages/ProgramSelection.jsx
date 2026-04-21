import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import SolarSystemBackground from '../components/animations/SolarSystemBackground';
import AuthorSignature from '../components/ui/AuthorSignature';

const ProgramSelection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const programs = [
    {
      id: 'physics',
      name: 'Vật lý',
      icon: '⚛️',
      description: 'Tìm hiểu về các định luật cơ bản của vũ trụ, từ chuyển động, năng lượng cho đến các hiện tượng điện từ và quang học.',
      gradient: 'from-green-500 to-teal-600',
      hoverGradient: 'from-green-600 to-teal-700',
      available: true,
      grades: [6, 7, 8, 9, 10, 11, 12],
      totalLessons: 200,
      highlights: ['Mô phỏng vật lý', 'Game tương tác', 'Thí nghiệm ảo']
    }
  ];

  const handleProgramSelect = (program) => {
    if (!program.available) {
      alert(`Chương trình ${program.name} sắp ra mắt!`);
      return;
    }

    if (!user) {
      navigate('/login', { state: { from: `/program/${program.id}` } });
      return;
    }

    // Với môn Vật lý: vào thẳng trang học
    navigate(`/program/${program.id}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white font-sans">
      <SolarSystemBackground />
      <AuthorSignature />
      
      {/* Content wrapper with z-10 to stay above background */}
      <div className="relative z-10">
        
        {/* Hero Section */}
        <section className="py-16 px-4 text-center">
          <div className="container mx-auto mt-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-cyan-400 to-emerald-300 drop-shadow-[0_2px_10px_rgba(34,211,238,0.5)]">
              Chọn chương trình học của bạn
            </h1>
            <p className="text-xl md:text-2xl text-cyan-50/90 mb-8 font-light drop-shadow-md">
              Bắt đầu hành trình khám phá vũ trụ tri thức
            </p>
            {user && user.programs && user.programs.length > 0 && (
              <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.5)] rounded-full px-6 py-3">
                <p className="text-lg text-cyan-200 font-medium tracking-wide">
                  📚 Bạn đã đăng ký {user.programs.filter(p => p.isActive).length} chương trình học
                </p>
              </div>
            )}
          </div>
        </section>

      {/* Programs Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {programs.map((program) => {
            const isEnrolled = user?.programs?.some(p => p.programId === program.id && p.isActive);
            
            return (
              <div
                key={program.id}
                className={`bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] hover:shadow-[0_8px_32px_0_rgba(34,211,238,0.2)] hover:bg-slate-800/60 transition-all duration-500 overflow-hidden group ${
                  !program.available ? 'opacity-70 grayscale hover:grayscale-0' : ''
                }`}
              >
                <div className="p-8 relative">
                  {/* Decorative glow */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${program.gradient} rounded-full blur-[60px] opacity-30 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none`} />
                  
                  {/* Icon and Badge */}
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${program.gradient} rounded-2xl flex items-center justify-center text-white text-4xl transform group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-500 shadow-xl`}
                    >
                      {program.icon}
                    </div>
                    {isEnrolled && (
                      <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-4 py-1.5 rounded-full text-sm font-semibold shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        ✓ Đã đăng ký
                      </span>
                    )}
                    {!program.available && (
                      <span className="bg-white/10 border border-white/20 text-gray-300 px-4 py-1.5 rounded-full text-sm font-semibold">
                        Sắp ra mắt
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl font-bold mb-3 text-white tracking-wide relative z-10">
                    {program.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-300 font-light mb-6 h-20 leading-relaxed relative z-10">
                    {program.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-8 text-sm text-cyan-200 relative z-10">
                    <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                      <span className="text-lg">📚</span>
                      <span className="font-medium">{program.totalLessons}+ bài học</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                      <span className="text-lg">🎓</span>
                      <span className="font-medium">Lớp {program.grades[0]}-{program.grades[program.grades.length - 1]}</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="mb-8 relative z-10">
                    <div className="flex flex-wrap gap-2">
                      {program.highlights.map((highlight, idx) => (
                        <span
                          key={idx}
                          className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors text-gray-200 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleProgramSelect(program)}
                    className={`relative z-10 w-full overflow-hidden bg-gradient-to-r ${program.gradient} hover:${program.hoverGradient} text-white py-4 px-6 rounded-xl font-bold tracking-wide shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all duration-300 transform hover:-translate-y-1 ${
                      !program.available ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    disabled={!program.available}
                  >
                    {!program.available ? (
                      'Sắp ra mắt'
                    ) : isEnrolled ? (
                      <span className="flex items-center justify-center gap-2">Tiếp tục học {program.name} <span className="text-xl">→</span></span>
                    ) : (
                      `Bắt đầu hành trình ${program.name}`
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-white/10 bg-black/40 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-400 to-emerald-300">
            Tại sao chọn nền tảng của chúng tôi?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:scale-110 group-hover:bg-blue-500/30 transition-all duration-500">
                🎯
              </div>
              <h3 className="text-xl font-bold mb-3 text-blue-100 tracking-wide">Học theo cấp độ</h3>
              <p className="text-blue-200/60 font-light px-4">
                Nội dung được phân chia theo từng lớp học, phù hợp với trình độ của bạn
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-purple-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-[0_0_15px_rgba(168,85,247,0.3)] group-hover:scale-110 group-hover:bg-purple-500/30 transition-all duration-500">
                📊
              </div>
              <h3 className="text-xl font-bold mb-3 text-purple-100 tracking-wide">Theo dõi tiến độ</h3>
              <p className="text-purple-200/60 font-light px-4">
                Hệ thống đánh giá và thống kê giúp bạn nắm rõ quá trình học tập
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:scale-110 group-hover:bg-emerald-500/30 transition-all duration-500">
                🏆
              </div>
              <h3 className="text-xl font-bold mb-3 text-emerald-100 tracking-wide">Gamification</h3>
              <p className="text-emerald-200/60 font-light px-4">
                Hệ thống điểm, sao và thành tích giúp việc học trở nên thú vị hơn
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for login/register if not logged in */}
      {!user && (
        <section className="relative z-10 py-24 bg-gradient-to-t from-black/80 to-transparent">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white drop-shadow-md">
              Bạn chưa đăng nhập?
            </h2>
            <p className="text-xl text-cyan-100/80 mb-10 max-w-2xl mx-auto font-light">
              Hãy đăng nhập hoặc tạo tài khoản để trải nghiệm không gian vật lý thực tế ảo tuyệt đỉnh này
            </p>
            <div className="flex justify-center gap-6 flex-wrap">
              <Link to="/login">
                <Button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-full font-bold tracking-wide hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300">
                  ĐĂNG NHẬP
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 px-10 py-4 rounded-full font-bold tracking-wide shadow-[0_0_15px_rgba(34,211,238,0.5)] hover:shadow-[0_0_25px_rgba(34,211,238,0.8)] hover:scale-105 transition-all duration-300">
                  ĐĂNG KÝ NGAY
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
      
      </div> {/* End Content Wrapper */}
    </div>
  );
};

export default ProgramSelection;

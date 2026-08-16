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



      {/* CTA Section */}
      {!user && (
        <section className="py-24 bg-white relative z-10 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-slate-950 rounded-[3rem] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl">
              
              {/* Subtle background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>

              <div className="relative z-10">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Khám phá tiềm năng</div>
                <h2 className="text-5xl md:text-7xl font-black text-white mb-12 tracking-tight leading-[1.1]">
                  Sẵn sàng <br />
                  bắt đầu?
                </h2>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/register">
                    <Button className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-all duration-300 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl border-none">
                      Bắt đầu ngay
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button className="w-full sm:w-auto bg-slate-800 text-white hover:bg-slate-700 hover:scale-105 transition-all duration-300 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm border border-slate-700">
                      Xem Demo
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-16 flex justify-center gap-12 text-slate-600 font-mono text-xs opacity-50">
                   <span>F = ma</span>
                   <span>E = mc²</span>
                   <span>ΔS &gt; 0</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      
      </div> {/* End Content Wrapper */}
    </div>
  );
};

export default ProgramSelection;

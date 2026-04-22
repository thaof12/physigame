import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trophy, 
  Zap, 
  Target, 
  Gamepad2, 
  ChevronRight,
  Shield,
  Star,
  Swords,
  Layers,
  Sparkles
} from 'lucide-react';

const AdvancedPhysicsChallenge = () => {
  const navigate = useNavigate();

  const challenges = [
    {
      id: 'balance',
      title: 'Trò chơi cân bằng',
      description: 'Khám phá các nguyên lý cân bằng và trọng tâm qua các thử thách thú vị',
      icon: '⚖️',
      path: '/advanced-physics-challenge/balance',
      color: 'from-blue-500 to-indigo-600',
      tag: 'Cơ học'
    },
    {
      id: 'water',
      title: 'Phòng thí nghiệm nước',
      description: 'Tìm hiểu về các tính chất vật lý của nước và áp suất thủy tĩnh',
      icon: '💧',
      path: '/advanced-physics-challenge/water',
      color: 'from-cyan-400 to-blue-500',
      tag: 'Thủy học'
    },
    {
      id: 'force-world',
      title: 'Thế giới lực',
      description: 'Khám phá thế giới của các loại lực và cách chúng tác động lên vật thể',
      icon: '🌍',
      path: '/advanced-physics-challenge/force-world',
      color: 'from-blue-600 to-blue-800',
      tag: 'Lực học'
    },
    {
      id: 'boiling',
      title: 'Sự sôi',
      description: 'Mô phỏng quá trình chuyển thể và các yếu tố ảnh hưởng đến sự sôi',
      icon: '🌡️',
      path: '/advanced-physics-challenge/boiling',
      color: 'from-orange-400 to-red-500',
      tag: 'Nhiệt học'
    },
    {
      id: 'thermal-energy',
      title: 'Năng lượng nhiệt',
      description: 'Nghiên cứu về nhiệt lượng và sự truyền nhiệt trong môi trường',
      icon: '🔥',
      path: '/advanced-physics-challenge/thermal-energy',
      color: 'from-red-500 to-orange-600',
      tag: 'Nhiệt học'
    },
    {
      id: 'light-reflection',
      title: 'Phản xạ ánh sáng',
      description: 'Thực hành định luật phản xạ và ứng dụng trong các trò chơi',
      icon: '🔦',
      path: '/advanced-physics-challenge/light-reflection',
      color: 'from-yellow-400 to-orange-500',
      tag: 'Quang học'
    },
    {
      id: 'mirror-lab',
      title: 'Phòng thí nghiệm gương',
      description: 'Mô phỏng sự tạo ảnh qua các loại gương phẳng, gương cầu',
      icon: '🪞',
      path: '/advanced-physics-challenge/mirror-lab',
      color: 'from-slate-400 to-slate-600',
      tag: 'Quang học'
    },
    {
      id: 'light-path',
      title: 'Đường đi của ánh sáng',
      description: 'Khám phá cách ánh sáng truyền đi và bẻ cong trong môi trường',
      icon: '✨',
      path: '/advanced-physics-challenge/light-path',
      color: 'from-indigo-400 to-purple-600',
      tag: 'Quang học'
    },
    {
      id: 'circuit-builder',
      title: 'Xây dựng mạch điện',
      description: 'Tự tay thiết kế và lắp ráp các mạch điện từ cơ bản đến phức tạp',
      icon: '🔌',
      path: '/advanced-physics-challenge/circuit-builder',
      color: 'from-yellow-500 to-amber-600',
      tag: 'Điện học'
    },
    {
      id: 'race-tracker',
      title: 'Đua xe tốc độ',
      description: 'Thử thách về vận tốc, gia tốc và quãng đường trên đường đua',
      icon: '🏎️',
      path: '/advanced-physics-challenge/race-tracker',
      color: 'from-red-600 to-rose-700',
      tag: 'Động lực học'
    },
    {
      id: 'force-arena',
      title: 'Võ đài lực học',
      description: 'Sử dụng kiến thức về lực để chiến thắng trong các trận đấu kịch tính',
      icon: '🏟️',
      path: '/advanced-physics-challenge/force-arena',
      color: 'from-stone-600 to-neutral-800',
      tag: 'Cơ học'
    },
    {
      id: 'projectile',
      title: 'Chuyển động ném xiên',
      description: 'Tính toán góc bắn và lực để đạt mục tiêu trong chuyển động ném',
      icon: '🎯',
      path: '/advanced-physics-challenge/projectile',
      color: 'from-emerald-500 to-teal-600',
      tag: 'Động học'
    }
  ];

  return (
    <div className="min-h-screen relative bg-[#FFFFFF] pb-20">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] bg-blue-50/50" />
        <div className="absolute bottom-20 right-10 w-[400px] h-[400px] rounded-full blur-[120px] bg-purple-50/40" />
        <div className="absolute inset-0 opacity-[0.025]"
             style={{ backgroundImage:'linear-gradient(#274dad 1px,transparent 1px),linear-gradient(90deg,#274dad 1px,transparent 1px)', backgroundSize:'40px 40px' }} />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl px-4 pt-24">
        
        {/* Header Section */}
        <div className="mb-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-3xl">
               <h1 className="text-5xl md:text-6xl font-black text-slate-800 leading-tight">
                 Trò chơi <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2a4095] to-[#274dad]">vật lý</span>
               </h1>
               <p className="text-xl text-slate-500 mt-4 font-medium leading-relaxed">
                 Thử thách bản thân với những trò chơi mô phỏng thế giới thực. 
                 Mỗi trò chơi là một vũ trụ kiến thức khác nhau, chứa đầy nhiệm vụ game tương tác.
               </p>
            </div>
            
            {/* Quick Stats Panel */}
            <div className="bg-white border-2 border-slate-100 p-6 rounded-3xl w-full md:w-80 shadow-[0_8px_30px_rgba(39,77,173,0.05)]">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-200">
                    <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Trình độ của bạn</p>
                    <p className="text-xl font-black text-slate-800">Tập Sự Vật Lý</p>
                  </div>
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-500">Tiến độ hoàn thành</span>
                    <span className="text-[#274dad]">0/12</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#274dad] to-[#2099e9] rounded-full w-0 transition-all duration-1000"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>



        {/* Challenges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {challenges.map((game, index) => (
            <div
              key={game.id}
              onClick={() => navigate(game.path)}
              className="group relative bg-white border-2 border-slate-100 rounded-[2.5rem] p-2 transition-all duration-500 hover:border-[#274dad]/30 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(39,77,173,0.1)] cursor-pointer overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Inner Card */}
              <div className="relative bg-white rounded-[2.2rem] h-full flex flex-col p-6">
                {/* Icon Container */}
                <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-500 mb-6 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  <span className="relative z-10">{game.icon}</span>
                </div>

                {/* Badge */}
                <div className="absolute top-8 right-8 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {game.tag}
                </div>

                {/* Content */}
                <h3 className="text-xl font-black text-slate-800 mb-3 group-hover:text-[#274dad] transition-colors line-clamp-1">
                  {game.title}
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3 mb-6">
                  {game.description}
                </p>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between">
                   <div className="flex items-center gap-2 text-[#274dad] font-black text-xs uppercase tracking-widest">
                     Bắt đầu <Sparkles className="w-3 h-3" />
                   </div>
                   <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-[#274dad] group-hover:text-white transition-all duration-300">
                     <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                   </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl pointer-events-none"></div>
            </div>
          ))}
        </div>



      </div>
    </div>
  );
};

export default AdvancedPhysicsChallenge;

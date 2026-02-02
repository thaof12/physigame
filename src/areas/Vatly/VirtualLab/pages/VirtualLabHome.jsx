/**
 * VirtualLabHome.jsx - Trang chủ Phòng thí nghiệm ảo
 * 
 * Danh sách các thí nghiệm có sẵn để người dùng chọn
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FlaskConical, 
  Gauge, 
  Lightbulb, 
  Waves, 
  Thermometer,
  CircuitBoard,
  Orbit,
  Timer,
  Lock,
  Star
} from 'lucide-react';

const VirtualLabHome = () => {
  const navigate = useNavigate();

  // Danh sách thí nghiệm theo chủ đề
  const experimentCategories = [
    {
      id: 'mechanics',
      title: 'Cơ học',
      icon: Gauge,
      color: 'from-blue-500 to-blue-700',
      experiments: [
        {
          id: 'free-fall',
          name: 'Đo gia tốc rơi tự do',
          description: 'Thả vật rơi tự do, đo thời gian và tính gia tốc g',
          grade: 10,
          difficulty: 2,
          available: true,
          path: '/vatly/virtual-lab/free-fall'
        },
        {
          id: 'pendulum',
          name: 'Dao động con lắc đơn',
          description: 'Khảo sát dao động của con lắc đơn, xác định chu kỳ và g',
          grade: 10,
          difficulty: 3,
          available: true,
          path: '/vatly/virtual-lab/pendulum'
        },
        {
          id: 'inclined-plane',
          name: 'Chuyển động trên mặt phẳng nghiêng',
          description: 'Khảo sát chuyển động có gia tốc trên mặt phẳng nghiêng',
          grade: 10,
          difficulty: 2,
          available: true,
          path: '/vatly/virtual-lab/inclined-plane'
        }
      ]
    },
    {
      id: 'electricity',
      title: 'Điện học',
      icon: CircuitBoard,
      color: 'from-yellow-500 to-orange-600',
      experiments: [
        {
          id: 'ohm-law',
          name: 'Khảo sát định luật Ôm',
          description: 'Xác minh mối quan hệ U-I-R trong mạch điện',
          grade: 9,
          difficulty: 2,
          available: true,
          path: '/vatly/virtual-lab/ohm-law'
        },
        {
          id: 'resistor-circuit',
          name: 'Mạch điện trở',
          description: 'Đo điện trở trong mạch nối tiếp và song song',
          grade: 9,
          difficulty: 3,
          available: true,
          path: '/vatly/virtual-lab/resistor-circuit'
        }
      ]
    },
    {
      id: 'optics',
      title: 'Quang học',
      icon: Lightbulb,
      color: 'from-purple-500 to-pink-600',
      experiments: [
        {
          id: 'lens-focal',
          name: 'Đo tiêu cự thấu kính',
          description: 'Xác định tiêu cự thấu kính hội tụ bằng phương pháp ảnh rõ nét',
          grade: 9,
          difficulty: 3,
          available: true,
          path: '/vatly/virtual-lab/lens-focal'
        },
        {
          id: 'light-interference',
          name: 'Giao thoa ánh sáng',
          description: 'Quan sát vân giao thoa và đo bước sóng ánh sáng',
          grade: 12,
          difficulty: 4,
          available: true,
          path: '/vatly/virtual-lab/light-interference'
        }
      ]
    },
    {
      id: 'waves',
      title: 'Dao động & Sóng',
      icon: Waves,
      color: 'from-cyan-500 to-teal-600',
      experiments: [
        {
          id: 'standing-wave',
          name: 'Sóng dừng trên dây',
          description: 'Tạo sóng dừng và xác định bước sóng',
          grade: 12,
          difficulty: 3,
          available: true,
          path: '/vatly/virtual-lab/standing-wave'
        }
      ]
    },
    {
      id: 'thermodynamics',
      title: 'Nhiệt học',
      icon: Thermometer,
      color: 'from-orange-500 to-red-600',
      experiments: [
        {
          id: 'calorimeter',
          name: 'Nhiệt lượng kế',
          description: 'Xác định nhiệt dung riêng bằng phương pháp cân bằng nhiệt',
          grade: 8,
          difficulty: 3,
          available: true,
          path: '/vatly/virtual-lab/calorimeter'
        }
      ]
    }
  ];

  // Render difficulty stars
  const renderDifficulty = (level) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            size={12}
            className={i <= level ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/program/physics')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="text-gray-400" size={24} />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <FlaskConical className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Phòng Thí Nghiệm Ảo</h1>
                <p className="text-gray-400 text-sm">
                  Thực hành thí nghiệm Vật lý trực tuyến
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Intro Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 rounded-2xl p-6 border border-emerald-700/50 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Timer className="text-emerald-400" size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Học Vật lý qua Thực hành
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Tương tác với các thiết bị thí nghiệm ảo, quan sát hiện tượng vật lý 
                và thu thập số liệu như trong phòng thí nghiệm thực. Mỗi thí nghiệm 
                được thiết kế theo chuẩn chương trình THCS và THPT.
              </p>
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2 text-blue-400">
                  <Gauge size={16} />
                  <span>Thiết bị đo chính xác</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-400">
                  <FlaskConical size={16} />
                  <span>Thu thập số liệu</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <Orbit size={16} />
                  <span>Mô phỏng vật lý thực</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Experiment Categories */}
        <div className="space-y-8">
          {experimentCategories.map((category) => {
            const CategoryIcon = category.icon;
            
            return (
              <div key={category.id}>
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}>
                    <CategoryIcon className="text-white" size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-white">{category.title}</h2>
                  <div className="flex-1 h-px bg-gray-700" />
                </div>

                {/* Experiments Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.experiments.map((exp) => (
                    <div
                      key={exp.id}
                      className={`
                        relative rounded-xl border overflow-hidden
                        transition-all duration-300
                        ${exp.available 
                          ? 'bg-gray-800 border-gray-700 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer' 
                          : 'bg-gray-800/50 border-gray-700/50 opacity-60'
                        }
                      `}
                      onClick={() => exp.available && navigate(exp.path)}
                    >
                      {/* Lock overlay for unavailable */}
                      {!exp.available && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                          <div className="bg-gray-800 p-2 rounded-full">
                            <Lock className="text-gray-500" size={24} />
                          </div>
                        </div>
                      )}

                      <div className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-white pr-2">
                            {exp.name}
                          </h3>
                          <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300 whitespace-nowrap">
                            Lớp {exp.grade}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {exp.description}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Độ khó:</span>
                            {renderDifficulty(exp.difficulty)}
                          </div>

                          {exp.available && (
                            <span className="text-xs text-emerald-400 font-medium">
                              Bắt đầu →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming Soon */}
        <div className="mt-12 text-center py-8 border-t border-gray-700">
          <p className="text-gray-400">
            🔬 Thêm nhiều thí nghiệm đang được phát triển...
          </p>
        </div>
      </div>
    </div>
  );
};

export default VirtualLabHome;

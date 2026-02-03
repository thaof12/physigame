import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, BookOpen, ArrowLeftRight, ArrowLeft, Zap, Target } from 'lucide-react';

const PhysicsToolsHub = () => {
  const navigate = useNavigate();

  const tools = [
    {
      id: 'calculator',
      name: 'Máy Tính Vật Lý',
      description: 'Tính toán các đại lượng vật lý theo công thức. Hỗ trợ cơ học, điện học, nhiệt học, quang học.',
      icon: Calculator,
      color: 'from-blue-500 to-indigo-600',
      path: '/physics-tools/calculator',
      features: ['Công thức cơ học', 'Định luật Ohm', 'Nhiệt lượng', 'Quang học']
    },
    {
      id: 'constants',
      name: 'Tra Cứu Hằng Số',
      description: 'Tra cứu nhanh các hằng số vật lý quan trọng như c, G, h, k, e và nhiều hơn nữa.',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-600',
      path: '/physics-tools/constants',
      features: ['Hằng số cơ bản', 'Hằng số lượng tử', 'Hằng số điện từ', 'Khối lượng hạt']
    },
    {
      id: 'converter',
      name: 'Chuyển Đổi Đơn Vị',
      description: 'Chuyển đổi nhanh giữa các đơn vị đo lường vật lý như độ dài, khối lượng, năng lượng.',
      icon: ArrowLeftRight,
      color: 'from-green-500 to-teal-600',
      path: '/physics-tools/converter',
      features: ['Độ dài', 'Khối lượng', 'Năng lượng', 'Công suất', 'Nhiệt độ']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-500" />
                Công Cụ Vật Lý
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Bộ công cụ hỗ trợ học tập và giải quyết bài toán vật lý
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-8 mb-12 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Target className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">
                Giải quyết bài toán vật lý nhanh chóng và chính xác
              </h2>
              <p className="text-blue-100 leading-relaxed">
                Sử dụng các công cụ dưới đây để tính toán, tra cứu và chuyển đổi các đại lượng vật lý. 
                Tất cả đều được thiết kế để hỗ trợ học tập hiệu quả từ lớp 6 đến lớp 12.
              </p>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => navigate(tool.path)}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 overflow-hidden group"
              >
                {/* Color Header */}
                <div className={`bg-gradient-to-r ${tool.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm opacity-80">Công cụ</div>
                      <div className="text-2xl font-bold">#{tools.indexOf(tool) + 1}</div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold">
                    {tool.name}
                  </h3>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {tool.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Tính năng:
                    </div>
                    {tool.features.map((feature, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${tool.color}`} />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <button className={`w-full py-3 px-4 bg-gradient-to-r ${tool.color} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-4`}>
                    Mở công cụ
                    <ArrowLeftRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Hướng dẫn sử dụng
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">1.</span>
                <span>Chọn công cụ phù hợp với nhu cầu của bạn</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">2.</span>
                <span>Nhập các giá trị cần thiết vào form</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">3.</span>
                <span>Nhấn nút tính toán để xem kết quả</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">4.</span>
                <span>Sử dụng nút Copy để sao chép kết quả</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Lợi ích
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Tiết kiệm thời gian khi làm bài tập</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Kiểm tra kết quả tính toán nhanh chóng</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Tra cứu hằng số và đơn vị dễ dàng</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Học cách áp dụng công thức vật lý</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsToolsHub;

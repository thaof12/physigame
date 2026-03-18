import { useParams, useNavigate } from 'react-router-dom';
import { gameComponentMap } from './gameRouteMap';
import { AlertCircle } from 'lucide-react';

const PhysicsChallengeRouter = () => {
  const { slug, gameSlug, gradeId } = useParams();
  const navigate = useNavigate();

  const normalizedSlug = (slug || gameSlug || '').toLowerCase();
  const GameComponent = gameComponentMap[normalizedSlug];

  // Nếu tìm thấy game component, render nó
  if (GameComponent) {
    return <GameComponent />;
  }

  // Nếu không tìm thấy, hiển thị trang lỗi
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-16 h-16 text-orange-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Game Không Tìm Thấy</h1>
        <p className="text-gray-600 mb-6">
          Game với slug <span className="font-semibold">"{normalizedSlug}"</span> không tồn tại hoặc đang được cập nhật.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => navigate('/advanced-physics-challenge')}
            className="px-5 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all"
          >
            Quay lại Thử thách
          </button>
          <button
            onClick={() => navigate(`/physics-games/grade/${gradeId || 6}`)}
            className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            Về Danh Sách Lớp
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhysicsChallengeRouter;

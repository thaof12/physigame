import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import BackNavButton from '../../../components/ui/BackNavButton';
import { Trophy, Lock, Clock, Award, CheckCircle2 } from 'lucide-react';
import api from '../../../config/api';
import { useAuth } from '../../../contexts/AuthContext';

const AdvancedChallenge = () => {
  const { user } = useAuth();
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedSort, setSelectedSort] = useState('default');

  // Categories and difficulties removed here (moved to a centralized source or loaded from API)
  // Placeholders kept to avoid runtime errors; replace with real data source as needed.
  const categories = [];
  const difficulties = [];

  // Lớp học
  const grades = [
    { id: 'all', name: 'Tất cả' },
    { id: 8, name: 'Lớp 8' },
    { id: 9, name: 'Lớp 9' },
    { id: 10, name: 'Lớp 10' },
    { id: 11, name: 'Lớp 11' },
    { id: 12, name: 'Lớp 12' }
  ];

  // Sắp xếp
  const sortOptions = [
    { id: 'default', name: 'Mặc định' },
    { id: 'grade-asc', name: 'Lớp ↑' },
    { id: 'grade-desc', name: 'Lớp ↓' },
    { id: 'difficulty', name: 'Mức độ' },
    { id: 'points-desc', name: 'Điểm giảm dần' }
  ];

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching challenges for user:', user);
        // If user is logged in, fetch challenges with unlock status
        const userId = user?._id || user?.id; // Support both _id and id
        if (user && userId) {
          console.log('✅ User logged in, fetching with unlock status:', userId);
          const response = await api.get(`/challenges/user/${userId}`);
          console.log('📊 Challenges received:', response.data);
          console.log('🎯 Challenge 1 unlock status:', response.data.find(c => c.id === 1)?.isUnlocked);
          setChallenges(response.data);
        } else {
          console.log('⚠️ No user, fetching all challenges as locked');
          // If not logged in, fetch all challenges (all will be locked)
          const response = await api.get('/challenges');
          setChallenges(response.data.map(c => ({ ...c, isUnlocked: false })));
        }
        setError(null);
      } catch (error) {
        console.error('❌ Error fetching challenges:', error);
        setError('Không thể tải dữ liệu thử thách. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [user]);

  // Lọc thử thách
  const filteredChallenges = challenges.filter(challenge => {
    const categoryMatch = selectedCategory === 'all' || challenge.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || challenge.difficultyLevel === selectedDifficulty;
    const gradeMatch = selectedGrade === 'all' || challenge.grade === selectedGrade;
    return categoryMatch && difficultyMatch && gradeMatch;
  });

  // Áp dụng sắp xếp lên kết quả đã lọc
  const sortedChallenges = [...filteredChallenges].sort((a, b) => {
    const getDifficultyOrder = (d) => {
      if (!d) return 2; // trung bình nếu không xác định
      const key = (d || '').toString().toLowerCase();
      if (key.includes('easy') || key === 'easy' || key === 'dễ') return 1;
      if (key.includes('hard') || key === 'hard' || key === 'khó') return 3;
      return 2;
    };

    switch (selectedSort) {
      case 'grade-asc': {
        const ga = Number(a.grade || 0);
        const gb = Number(b.grade || 0);
        return ga - gb;
      }
      case 'grade-desc': {
        const ga = Number(a.grade || 0);
        const gb = Number(b.grade || 0);
        return gb - ga;
      }
      case 'difficulty': {
        return getDifficultyOrder(a.difficulty || a.difficultyLevel) - getDifficultyOrder(b.difficulty || b.difficultyLevel);
      }
      case 'points-desc': {
        return (b.points || 0) - (a.points || 0);
      }
      default:
        return 0;
    }
  });

  const getDifficultyBadge = (difficulty, color) => {
    return (
      <span className={`${color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
        {difficulty}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="relative border-b border-gray-200 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('src/assets/images/bannerchallenge.jpg')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-white/40"></div>
        
        {/* Content */}
        <div className="container mx-auto max-w-7xl px-4 py-12 relative z-10">
          <div className="mb-6 text-left">
            <BackNavButton fallbackPath="/program/chemistry" />
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full mb-4 shadow-2xl border-2 border-gray-200">
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-3 drop-shadow-sm">
              Thử Thách Nâng Cao
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Kiểm tra và nâng cao kỹ năng Hóa học của bạn qua các thử thách đa dạng và thú vị!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto max-w-7xl">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Đang tải thử thách...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg m-4">
            {error}
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div className="flex flex-col gap-0">
            {/* Compact Filter Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Grade Filter (moved first) */}
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Lớp học
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm font-medium"
                  >
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="min-w-[160px]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Sắp xếp
                  </label>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm font-medium"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>

                {/* Stats & Clear Button */}
                <div className="flex items-end gap-3">
                  <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-500 mb-0.5">Kết quả</div>
                      <div className="text-lg font-bold text-primary-600">{filteredChallenges.length}</div>
                  </div>
                  
                  {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedGrade !== 'all' || selectedSort !== 'default') && (
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedDifficulty('all');
                        setSelectedGrade('all');
                        setSelectedSort('default');
                      }}
                      className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors border border-primary-200"
                    >
                      Xóa bộ lọc
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {/* Challenges Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredChallenges.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">
                    Không tìm thấy thử thách
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Không có thử thách nào phù hợp với bộ lọc đã chọn
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedDifficulty('all');
                      setSelectedGrade('all');
                    }}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              ) : (
                sortedChallenges.map((challenge) => {
                  const isLocked = !challenge.isUnlocked && challenge.prerequisite?.classId;
                  return (
                  <div
                    key={challenge.id}
                    className={`bg-white rounded-xl shadow-lg transition-all duration-300 overflow-hidden group ${isLocked ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-2xl cursor-pointer'}`}
                    onClick={() => !isLocked && setSelectedChallenge(challenge)}
                  >
                    {/* Card Header */}
                    <div className={`bg-gradient-to-r p-6 text-white relative ${isLocked ? 'from-gray-400 to-gray-600' : 'from-primary-500 to-primary-700'}`}>
                      <div className="absolute top-2 right-2">
                        {(challenge.status === 'coming-soon' || isLocked) && (
                          <Lock className="w-5 h-5 opacity-75" />
                        )}
                      </div>
                      <div className="text-5xl mb-3">{challenge.icon}</div>
                      <h3 className="text-xl font-bold mb-2">{challenge.name}</h3>
                      {getDifficultyBadge(challenge.difficulty, challenge.difficultyColor)}
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <p className="text-gray-600 mb-4 h-20">
                        {challenge.description}
                      </p>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-2" />
                          {challenge.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Award className="w-4 h-4 mr-2" />
                          {challenge.points} điểm
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2 mb-4">
                        {challenge.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-sm text-gray-600">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-gray-400" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      {isLocked ? (
                        <div>
                          <button
                            disabled
                            className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-semibold cursor-not-allowed mb-2"
                          >
                            <Lock className="w-4 h-4 inline mr-2" />
                            Đã khóa
                          </button>
                          {challenge.prerequisiteInfo && (
                            <p className="text-xs text-gray-500 text-center">
                              Hoàn thành bài {challenge.prerequisiteInfo.lessonId} lớp {challenge.prerequisiteInfo.classId} để mở khóa
                            </p>
                          )}
                        </div>
                      ) : challenge.status === 'coming-soon' ? (
                        <button
                          disabled
                          className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-semibold cursor-not-allowed"
                        >
                          Sắp ra mắt
                        </button>
                      ) : challenge.link ? (
                        <Link to={challenge.link} className="block">
                          <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors">
                            Bắt đầu thử thách
                          </button>
                        </Link>
                      ) : (
                        <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors">
                          Bắt đầu thử thách
                        </button>
                      )}
                    </div>
                  </div>
                  );
                })
              )}
              </div>

              {/* Back Button */}
              <div className="text-center mt-8">
                <Link to="/">
                  <Button variant="secondary" className="px-8 py-3">
                    ← Quay về trang chủ
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Challenge Detail Modal (Optional - for future) */}
      {selectedChallenge && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedChallenge(null)}
          >
            <div 
              className="bg-white rounded-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-5xl mb-3">{selectedChallenge.icon}</div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {selectedChallenge.name}
                  </h2>
                  {getDifficultyBadge(selectedChallenge.difficulty, selectedChallenge.difficultyColor)}
                </div>
                <button 
                  onClick={() => setSelectedChallenge(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">{selectedChallenge.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Thời gian</div>
                  <div className="font-bold text-lg">{selectedChallenge.time}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Điểm thưởng</div>
                  <div className="font-bold text-lg text-yellow-600">{selectedChallenge.points} điểm</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3">Tính năng nổi bật:</h3>
                <ul className="space-y-2">
                  {selectedChallenge.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-gray-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lock info if challenge is locked */}
              {!selectedChallenge.isUnlocked && selectedChallenge.prerequisiteInfo && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">Thử thách đã khóa</h4>
                      <p className="text-sm text-yellow-700">
                        Bạn cần hoàn thành <strong>Bài {selectedChallenge.prerequisiteInfo.lessonId} - Lớp {selectedChallenge.prerequisiteInfo.classId}</strong> để mở khóa thử thách này.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {!selectedChallenge.isUnlocked && selectedChallenge.prerequisite?.classId ? (
                  <button
                    disabled
                    className="flex-1 bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Đã khóa
                  </button>
                ) : selectedChallenge.status === 'coming-soon' ? (
                  <button
                    disabled
                    className="flex-1 bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Sắp ra mắt
                  </button>
                ) : selectedChallenge.link ? (
                  <Link to={selectedChallenge.link} className="flex-1">
                    <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors">
                      Bắt đầu ngay
                    </button>
                  </Link>
                ) : (
                  <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors">
                    Bắt đầu ngay
                  </button>
                )}
                <button 
                  onClick={() => setSelectedChallenge(null)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdvancedChallenge;

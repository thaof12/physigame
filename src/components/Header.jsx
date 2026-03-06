import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Target, User, Trophy } from 'lucide-react';
import QuestModal from './Quest/QuestModal';
import Leaderboard from './Leaderboard/Leaderboard';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

<<<<<<< HEAD
  const handleLogout = async () => {
    try {
      await logout();
=======
  const handleLogout = () => {
    try {
      logout();
>>>>>>> d7d3174 (new push)
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <header className="w-full bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div 
            className="text-lg font-bold cursor-pointer flex items-center gap-2"
            onClick={() => navigate('/')}
          >
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-1 rounded-lg">
              Physi
            </span>
            <span className="text-gray-700">Game</span>
          </div>
          
          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quest Button */}
              <button
                onClick={() => setShowQuestModal(true)}
                className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
                title="Nhiệm vụ"
              >
                <Target size={18} />
                <span className="hidden sm:inline">Nhiệm vụ</span>
                {/* Notification dot */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </button>

              {/* Leaderboard Button */}
              <button
                onClick={() => setShowLeaderboard(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
                title="Bảng xếp hạng"
              >
                <Trophy size={18} />
                <span className="hidden md:inline">Xếp hạng</span>
              </button>

              {/* Profile Button */}
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
                title="Hồ sơ"
              >
                <User size={18} className="text-gray-600" />
                <span className="hidden sm:inline text-gray-700 font-medium">
                  {user.displayName || 'Tài khoản'}
                </span>
              </button>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                title="Đăng xuất"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Quest Modal */}
      <QuestModal 
        isOpen={showQuestModal} 
        onClose={() => setShowQuestModal(false)} 
      />

      {/* Leaderboard Modal */}
      <Leaderboard 
        isOpen={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)} 
      />
    </>
  );
};

export default Header;

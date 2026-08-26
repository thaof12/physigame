import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Crown, TrendingUp, Users, Flame, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import './Leaderboard.css';

const Leaderboard = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('xp'); // 'xp' | 'streak' | 'pk'
  const [timeRange, setTimeRange] = useState('weekly'); // 'daily' | 'weekly' | 'alltime'
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, activeTab, timeRange]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/leaderboard`, {
        params: {
          type: activeTab,
          range: timeRange,
          userId: user?.uid
        }
      });
      setLeaderboardData(response.data.leaderboard || []);
      setUserRank(response.data.userRank);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboardData([]);
      setUserRank(null);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400 fill-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-blue-600 fill-blue-500" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</span>;
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case 1:
        return 'leaderboard-item-gold';
      case 2:
        return 'leaderboard-item-silver';
      case 3:
        return 'leaderboard-item-bronze';
      default:
        return '';
    }
  };

  const getValue = (item) => {
    switch (activeTab) {
      case 'xp':
        return { value: item.xp?.toLocaleString(), label: 'XP', icon: <Star className="w-4 h-4 text-blue-500" /> };
      case 'streak':
        return { value: item.streak, label: 'ngày', icon: <Flame className="w-4 h-4 text-cyan-500" /> };
      case 'pk':
        return { value: item.pkRating, label: 'Rating', icon: <TrendingUp className="w-4 h-4 text-purple-500" /> };
      default:
        return { value: item.xp, label: 'XP', icon: null };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="leaderboard-overlay" onClick={onClose}>
      <div className="leaderboard-modal font-body" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="leaderboard-header">
          <div className="leaderboard-header-content">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h2 className="leaderboard-title font-heading">Bảng Xếp Hạng</h2>
          </div>
          <button className="leaderboard-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="leaderboard-tabs">
          <button
            className={`leaderboard-tab font-heading ${activeTab === 'xp' ? 'active' : ''}`}
            onClick={() => setActiveTab('xp')}
          >
            <Star className="w-4 h-4" />
            <span>XP</span>
          </button>
          <button
            className={`leaderboard-tab font-heading ${activeTab === 'streak' ? 'active' : ''}`}
            onClick={() => setActiveTab('streak')}
          >
            <Flame className="w-4 h-4" />
            <span>Chuỗi ngày</span>
          </button>
          <button
            className={`leaderboard-tab font-heading ${activeTab === 'pk' ? 'active' : ''}`}
            onClick={() => setActiveTab('pk')}
          >
            <TrendingUp className="w-4 h-4" />
            <span>PK Rating</span>
          </button>
        </div>

        {/* Time Range */}
        <div className="leaderboard-time-range">
          {['daily', 'weekly', 'alltime'].map((range) => (
            <button
              key={range}
              className={`time-range-btn font-heading ${timeRange === range ? 'active' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range === 'daily' ? 'Hôm nay' : range === 'weekly' ? 'Tuần này' : 'Tất cả'}
            </button>
          ))}
        </div>

        {/* Leaderboard List */}
        <div className="leaderboard-content">
          {loading ? (
            <div className="leaderboard-loading">
              <div className="loading-spinner"></div>
              <p>Đang tải...</p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              <div className="leaderboard-podium">
                {leaderboardData.slice(0, 3).map((item, index) => {
                  const positions = [1, 0, 2]; // Display order: 2nd, 1st, 3rd
                  const actualIndex = positions[index];
                  const podiumItem = leaderboardData[actualIndex];
                  if (!podiumItem) return null;

                  const valueData = getValue(podiumItem);

                  return (
                    <div key={podiumItem.rank} className={`podium-item podium-${actualIndex + 1}`}>
                      <div className="podium-avatar">
                        {podiumItem.avatar ? (
                          <img src={podiumItem.avatar} alt="" />
                        ) : (
                          <span className="font-heading">{podiumItem.displayName?.[0] || podiumItem.username?.[0] || '?'}</span>
                        )}
                        <div className="podium-rank">{getRankIcon(podiumItem.rank)}</div>
                      </div>
                      <div className="podium-name font-heading">{podiumItem.displayName || podiumItem.username}</div>
                      <div className="podium-value font-heading">
                        {valueData.icon}
                        <span>{valueData.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rest of the list */}
              <div className="leaderboard-list">
                {leaderboardData.slice(3).map((item) => {
                  const valueData = getValue(item);

                  return (
                    <div key={item.rank} className={`leaderboard-item ${getRankClass(item.rank)}`}>
                      <div className="leaderboard-item-rank">
                        {getRankIcon(item.rank)}
                      </div>
                      <div className="leaderboard-item-avatar">
                        {item.avatar ? (
                          <img src={item.avatar} alt="" />
                        ) : (
                          <span>{item.displayName?.[0] || item.username?.[0] || '?'}</span>
                        )}
                      </div>
                      <div className="leaderboard-item-info">
                        <div className="leaderboard-item-name font-heading">{item.displayName || item.username}</div>
                        <div className="leaderboard-item-username font-body">@{item.username}</div>
                      </div>
                      <div className="leaderboard-item-value font-heading">
                        {valueData.icon}
                        <span className="value">{valueData.value}</span>
                        <span className="label font-body">{valueData.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* User's Rank */}
              {userRank && userRank.rank > 10 && (
                <div className="leaderboard-user-rank">
                  <div className="user-rank-separator font-heading">
                    <ChevronDown className="w-4 h-4" />
                    <span>Vị trí của bạn</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                  <div className="leaderboard-item leaderboard-item-user">
                    <div className="leaderboard-item-rank">
                      <span className="w-6 h-6 flex items-center justify-center text-purple-600 font-heading font-extrabold">
                        {userRank.rank}
                      </span>
                    </div>
                    <div className="leaderboard-item-avatar user">
                      <span className="font-heading">{user?.displayName?.[0] || user?.email?.[0] || '?'}</span>
                    </div>
                    <div className="leaderboard-item-info">
                      <div className="leaderboard-item-name font-heading">{user?.displayName || 'Bạn'}</div>
                      <div className="leaderboard-item-username font-body">@{user?.email?.split('@')[0]}</div>
                    </div>
                    <div className="leaderboard-item-value font-heading">
                      {getValue({ ...userRank }).icon}
                      <span className="value">
                        {activeTab === 'xp' ? userRank.xp?.toLocaleString() :
                          activeTab === 'streak' ? userRank.streak : userRank.pkRating}
                      </span>
                      <span className="label font-body">{getValue({ ...userRank }).label}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;


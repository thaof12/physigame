import React, { useState, useEffect, useCallback } from 'react';
import { X, Maximize2, Gift, Target, Trophy, Clock, Flame, Star, Check, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import { logSessionActivity } from '../../services/activityLogger';
import './QuestModal.css';

const QuestModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'weekly' | 'achievements'
  const [questData, setQuestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get user ID - could be firebaseUid, uid, or id depending on context
  const userId = user?.firebaseUid || user?.uid || user?.id;

  const fetchQuests = useCallback(async () => {
    if (!userId) {
      console.log('No userId available for fetching quests');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching quests for userId:', userId);
      const response = await api.get(`/quests/${userId}`);
      console.log('Quest data received:', response.data);
      setQuestData(response.data);
    } catch (error) {
      console.error('Error fetching quests:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen && userId) {
      fetchQuests();
    }
  }, [isOpen, userId, fetchQuests]);

  const handleClaimReward = async (questType, questId) => {
    if (!userId || claiming) return;
    
    try {
      setClaiming(questId);
      const endpoint = questType === 'achievement' 
        ? `/quests/${userId}/achievement/claim`
        : `/quests/${userId}/claim`;
      
      const response = await api.post(endpoint, {
        questType,
        questId,
        achievementId: questType === 'achievement' ? questId : undefined
      });
      
      if (response.data.success) {
        // Log session activity
        if (questData) {
          let questItem = null;
          let title = '';
          if (questType === 'daily') {
            questItem = questData.dailyQuests?.find(q => q.odId === questId);
            title = 'Nhận thưởng nhiệm vụ ngày';
          } else if (questType === 'weekly') {
            questItem = questData.weeklyQuests?.find(q => q.odId === questId);
            title = 'Nhận thưởng nhiệm vụ tuần';
          } else if (questType === 'achievement') {
            questItem = questData.achievements?.find(q => q.id === questId);
            title = 'Nhận thưởng thành tựu';
          }
          
          if (questItem) {
            const xpGained = questItem.reward?.xp || 0;
            if (xpGained > 0) {
              logSessionActivity(
                'quest',
                title,
                `Hoàn thành: "${questItem.name || questItem.title || questId}"`,
                xpGained
              );
            }
          }
        }

        // Refresh quest data
        fetchQuests();
        
        // Show success notification (can be enhanced)
        if (response.data.leveledUp) {
          alert(`🎉 Chúc mừng! Bạn đã lên Level ${response.data.newLevel}!`);
        }
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    } finally {
      setClaiming(null);
    }
  };

  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Phân loại quests
  const categorizeQuests = (quests) => {
    const readyToClaim = quests.filter(q => q.completed && !q.claimed);
    const inProgress = quests.filter(q => !q.completed);
    const claimed = quests.filter(q => q.claimed);
    
    return { readyToClaim, inProgress, claimed };
  };

  if (!isOpen) return null;

  const dailyCategories = questData ? categorizeQuests(questData.dailyQuests) : { readyToClaim: [], inProgress: [], claimed: [] };
  const weeklyCategories = questData ? categorizeQuests(questData.weeklyQuests) : { readyToClaim: [], inProgress: [], claimed: [] };
  
  const unlockedAchievements = questData?.achievements?.filter(a => a.unlocked) || [];
  const lockedAchievements = questData?.achievements?.filter(a => !a.unlocked) || [];
  const claimableAchievements = unlockedAchievements.filter(a => !a.claimed);

  const totalReadyToClaim = dailyCategories.readyToClaim.length + weeklyCategories.readyToClaim.length + claimableAchievements.length;

  return (
    <div className="quest-modal-overlay" onClick={onClose}>
      <div 
        className={`quest-modal ${isExpanded ? 'expanded' : ''}`} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="quest-modal-header">
          <div className="quest-header-left">
            <div className="quest-icon-wrapper">
              <Target size={24} />
            </div>
            <div className="quest-header-info">
              <h2>Nhiệm vụ</h2>
              <span className="quest-user-level">
                {questData?.userXP || 0} XP • Level {questData?.userLevel || 1}
              </span>
            </div>
          </div>
          <div className="quest-header-actions">
            <button 
              className="quest-expand-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'}
            >
              <Maximize2 size={18} />
            </button>
            <button className="quest-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="quest-tabs">
          <button 
            className={`quest-tab ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            <Clock size={16} />
            <span>Hàng ngày</span>
            {dailyCategories.readyToClaim.length > 0 && (
              <span className="quest-tab-badge">{dailyCategories.readyToClaim.length}</span>
            )}
          </button>
          <button 
            className={`quest-tab ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            <Trophy size={16} />
            <span>Thưởng</span>
            {(weeklyCategories.readyToClaim.length + claimableAchievements.length) > 0 && (
              <span className="quest-tab-badge">
                {weeklyCategories.readyToClaim.length + claimableAchievements.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="quest-content">
          {loading ? (
            <div className="quest-loading">
              <div className="quest-spinner"></div>
              <p>Đang tải...</p>
            </div>
          ) : (
            <>
              {/* Reset Timer */}
              <div className="quest-reset-notice">
                <Clock size={14} />
                <span>Nhiệm vụ ngày sẽ reset vào 00:00 mỗi ngày</span>
              </div>

              {activeTab === 'daily' && (
                <div className="quest-list-container">
                  {/* Ready to Claim */}
                  {dailyCategories.readyToClaim.length > 0 && (
                    <div className="quest-section">
                      <div className="quest-section-header">
                        <Gift size={16} />
                        <span>SẴN SÀNG NHẬN ({dailyCategories.readyToClaim.length})</span>
                      </div>
                      {dailyCategories.readyToClaim.map(quest => (
                        <QuestItem 
                          key={quest.odId}
                          quest={quest}
                          onClaim={() => handleClaimReward('daily', quest.odId)}
                          claiming={claiming === quest.odId}
                          claimable
                        />
                      ))}
                    </div>
                  )}

                  {/* In Progress */}
                  {dailyCategories.inProgress.length > 0 && (
                    <div className="quest-section">
                      <div className="quest-section-header">
                        <Target size={16} />
                        <span>ĐANG THỰC HIỆN ({dailyCategories.inProgress.length})</span>
                      </div>
                      {dailyCategories.inProgress.map(quest => (
                        <QuestItem key={quest.odId} quest={quest} />
                      ))}
                    </div>
                  )}

                  {/* Completed */}
                  {dailyCategories.claimed.length > 0 && (
                    <div className="quest-section completed-section">
                      <div className="quest-section-header">
                        <Check size={16} />
                        <span>ĐÃ HOÀN THÀNH ({dailyCategories.claimed.length})</span>
                      </div>
                      {dailyCategories.claimed.map(quest => (
                        <QuestItem key={quest.odId} quest={quest} claimed />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'weekly' && (
                <div className="quest-list-container">
                  {/* Weekly Quests */}
                  <div className="quest-subsection-title">
                    <Star size={16} />
                    <span>Nhiệm vụ tuần</span>
                  </div>
                  
                  {weeklyCategories.readyToClaim.length > 0 && (
                    <div className="quest-section">
                      <div className="quest-section-header highlight">
                        <Gift size={16} />
                        <span>SẴN SÀNG NHẬN</span>
                      </div>
                      {weeklyCategories.readyToClaim.map(quest => (
                        <QuestItem 
                          key={quest.odId}
                          quest={quest}
                          onClaim={() => handleClaimReward('weekly', quest.odId)}
                          claiming={claiming === quest.odId}
                          claimable
                        />
                      ))}
                    </div>
                  )}

                  {weeklyCategories.inProgress.length > 0 && (
                    <div className="quest-section">
                      <div className="quest-section-header">
                        <Target size={16} />
                        <span>ĐANG THỰC HIỆN</span>
                      </div>
                      {weeklyCategories.inProgress.map(quest => (
                        <QuestItem key={quest.odId} quest={quest} />
                      ))}
                    </div>
                  )}

                  {/* Achievements */}
                  <div className="quest-subsection-title" style={{ marginTop: '20px' }}>
                    <Trophy size={16} />
                    <span>Thành tựu</span>
                  </div>

                  {claimableAchievements.length > 0 && (
                    <div className="quest-section">
                      <div className="quest-section-header highlight">
                        <Sparkles size={16} />
                        <span>MỚI MỞ KHÓA</span>
                      </div>
                      {claimableAchievements.map(achievement => (
                        <AchievementItem 
                          key={achievement.id}
                          achievement={achievement}
                          onClaim={() => handleClaimReward('achievement', achievement.id)}
                          claiming={claiming === achievement.id}
                          claimable
                        />
                      ))}
                    </div>
                  )}

                  <div className="achievements-grid">
                    {unlockedAchievements.filter(a => a.claimed).map(achievement => (
                      <AchievementItem 
                        key={achievement.id}
                        achievement={achievement}
                        compact
                        unlocked
                      />
                    ))}
                    {lockedAchievements.slice(0, 6).map(achievement => (
                      <AchievementItem 
                        key={achievement.id}
                        achievement={achievement}
                        compact
                        locked
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Login Streak */}
        {questData?.loginStreak && (
          <div className="quest-streak-bar">
            <Flame size={18} className="streak-icon" />
            <span className="streak-text">
              {questData.loginStreak.current} ngày liên tiếp
            </span>
            <span className="streak-best">
              Kỷ lục: {questData.loginStreak.longest} ngày
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Quest Item Component
const QuestItem = ({ quest, onClaim, claiming, claimable, claimed }) => {
  const progress = Math.min((quest.progress / quest.target) * 100, 100);
  
  return (
    <div className={`quest-item ${claimable ? 'claimable' : ''} ${claimed ? 'claimed' : ''}`}>
      <div className="quest-item-icon">
        <span>{quest.icon || '📋'}</span>
      </div>
      <div className="quest-item-content">
        <div className="quest-item-header">
          <span className="quest-item-name">{quest.name}</span>
          <span className="quest-item-progress-text">
            {quest.progress}/{quest.target}
          </span>
        </div>
        <span className="quest-item-reward">+{quest.reward?.xp || 0} EXP</span>
        <div className="quest-item-progress-bar">
          <div 
            className="quest-item-progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      {claimable && (
        <button 
          className="quest-claim-btn"
          onClick={onClaim}
          disabled={claiming}
        >
          {claiming ? '...' : 'Nhận'}
        </button>
      )}
      {claimed && (
        <div className="quest-claimed-badge">
          <Check size={16} />
        </div>
      )}
    </div>
  );
};

// Achievement Item Component
const AchievementItem = ({ achievement, onClaim, claiming, claimable, compact, locked, unlocked }) => {
  const rarityColors = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b'
  };

  if (compact) {
    return (
      <div className={`achievement-compact ${locked ? 'locked' : ''} ${unlocked ? 'unlocked' : ''}`}>
        <div 
          className="achievement-compact-icon"
          style={{ borderColor: locked ? '#4b5563' : rarityColors[achievement.rarity] }}
        >
          <span>{locked ? '🔒' : achievement.icon}</span>
        </div>
        <span className="achievement-compact-name">
          {locked ? '???' : achievement.name}
        </span>
      </div>
    );
  }

  return (
    <div className={`achievement-item ${claimable ? 'claimable' : ''}`}>
      <div 
        className="achievement-item-icon"
        style={{ borderColor: rarityColors[achievement.rarity] }}
      >
        <span>{achievement.icon}</span>
      </div>
      <div className="achievement-item-content">
        <span className="achievement-item-name">{achievement.name}</span>
        <span className="achievement-item-desc">{achievement.description}</span>
        <span className="achievement-item-reward">+{achievement.reward?.xp || 0} EXP</span>
      </div>
      {claimable && (
        <button 
          className="quest-claim-btn"
          onClick={onClaim}
          disabled={claiming}
        >
          {claiming ? '...' : 'Nhận'}
        </button>
      )}
    </div>
  );
};

export default QuestModal;

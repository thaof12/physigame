import React from 'react';
import { Trophy, Star, Flame, Zap, Target, Shield, Crown, Medal, Award, BookOpen, Swords, CheckCircle } from 'lucide-react';
import './BadgeDisplay.css';

// Định nghĩa các badge/huy hiệu
const BADGE_DEFINITIONS = {
  // Streak badges
  streak_3: {
    id: 'streak_3',
    name: 'Khởi Đầu',
    description: '3 ngày học liên tục',
    icon: Flame,
    color: '#f97316',
    bgGradient: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
    rarity: 'common',
    category: 'streak'
  },
  streak_7: {
    id: 'streak_7',
    name: 'Tuần Lễ Rực Lửa',
    description: '7 ngày học liên tục',
    icon: Flame,
    color: '#ef4444',
    bgGradient: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    rarity: 'uncommon',
    category: 'streak'
  },
  streak_14: {
    id: 'streak_14',
    name: 'Kiên Trì',
    description: '14 ngày học liên tục',
    icon: Flame,
    color: '#dc2626',
    bgGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    rarity: 'rare',
    category: 'streak'
  },
  streak_30: {
    id: 'streak_30',
    name: 'Huyền Thoại',
    description: '30 ngày học liên tục',
    icon: Crown,
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    rarity: 'legendary',
    category: 'streak'
  },
  
  // XP badges
  xp_100: {
    id: 'xp_100',
    name: 'Tập Sự',
    description: 'Đạt 100 XP',
    icon: Star,
    color: '#22c55e',
    bgGradient: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
    rarity: 'common',
    category: 'xp'
  },
  xp_500: {
    id: 'xp_500',
    name: 'Học Viên',
    description: 'Đạt 500 XP',
    icon: Star,
    color: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    rarity: 'uncommon',
    category: 'xp'
  },
  xp_1000: {
    id: 'xp_1000',
    name: 'Chuyên Gia',
    description: 'Đạt 1000 XP',
    icon: Zap,
    color: '#8b5cf6',
    bgGradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
    rarity: 'rare',
    category: 'xp'
  },
  xp_5000: {
    id: 'xp_5000',
    name: 'Bậc Thầy',
    description: 'Đạt 5000 XP',
    icon: Crown,
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    rarity: 'legendary',
    category: 'xp'
  },
  
  // Lesson badges
  lessons_1: {
    id: 'lessons_1',
    name: 'Bước Đầu',
    description: 'Hoàn thành bài học đầu tiên',
    icon: BookOpen,
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
    rarity: 'common',
    category: 'lessons'
  },
  lessons_10: {
    id: 'lessons_10',
    name: 'Nhà Khoa Học Nhí',
    description: 'Hoàn thành 10 bài học',
    icon: BookOpen,
    color: '#6366f1',
    bgGradient: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
    rarity: 'uncommon',
    category: 'lessons'
  },
  lessons_50: {
    id: 'lessons_50',
    name: 'Học Giả',
    description: 'Hoàn thành 50 bài học',
    icon: Award,
    color: '#8b5cf6',
    bgGradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
    rarity: 'rare',
    category: 'lessons'
  },
  
  // Perfect score badges
  perfect_1: {
    id: 'perfect_1',
    name: 'Hoàn Hảo',
    description: 'Đạt điểm tuyệt đối lần đầu',
    icon: Target,
    color: '#f43f5e',
    bgGradient: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)',
    rarity: 'uncommon',
    category: 'perfect'
  },
  perfect_10: {
    id: 'perfect_10',
    name: 'Thiên Tài',
    description: '10 điểm tuyệt đối',
    icon: Trophy,
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    rarity: 'rare',
    category: 'perfect'
  },
  
  // PK badges
  pk_first_win: {
    id: 'pk_first_win',
    name: 'Chiến Thắng Đầu Tiên',
    description: 'Thắng trận PK đầu tiên',
    icon: Swords,
    color: '#ef4444',
    bgGradient: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    rarity: 'common',
    category: 'pk'
  },
  pk_10_wins: {
    id: 'pk_10_wins',
    name: 'Chiến Binh',
    description: 'Thắng 10 trận PK',
    icon: Shield,
    color: '#6366f1',
    bgGradient: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
    rarity: 'uncommon',
    category: 'pk'
  },
  pk_champion: {
    id: 'pk_champion',
    name: 'Vô Địch',
    description: 'Đạt Top 10 bảng xếp hạng PK',
    icon: Crown,
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    rarity: 'legendary',
    category: 'pk'
  }
};

const RARITY_COLORS = {
  common: { border: '#9ca3af', glow: 'rgba(156, 163, 175, 0.3)' },
  uncommon: { border: '#22c55e', glow: 'rgba(34, 197, 94, 0.3)' },
  rare: { border: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
  epic: { border: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' },
  legendary: { border: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' }
};

// Component Badge đơn lẻ
export const Badge = ({ badgeId, size = 'medium', showTooltip = true, unlocked = true }) => {
  const badge = BADGE_DEFINITIONS[badgeId];
  if (!badge) return null;
  
  const Icon = badge.icon;
  const rarityStyle = RARITY_COLORS[badge.rarity];
  
  const sizeClasses = {
    small: 'badge-small',
    medium: 'badge-medium',
    large: 'badge-large'
  };
  
  return (
    <div 
      className={`badge ${sizeClasses[size]} ${unlocked ? 'badge-unlocked' : 'badge-locked'} badge-${badge.rarity}`}
      title={showTooltip ? `${badge.name}: ${badge.description}` : undefined}
      style={{
        '--badge-color': badge.color,
        '--badge-gradient': badge.bgGradient,
        '--badge-border': rarityStyle.border,
        '--badge-glow': rarityStyle.glow
      }}
    >
      <div className="badge-icon-wrapper">
        <Icon className="badge-icon" />
      </div>
      {unlocked && badge.rarity === 'legendary' && (
        <div className="badge-sparkle" />
      )}
    </div>
  );
};

// Component hiển thị danh sách badges
const BadgeDisplay = ({ unlockedBadges = [], showLocked = true, maxDisplay = 12 }) => {
  const allBadgeIds = Object.keys(BADGE_DEFINITIONS);
  const unlockedSet = new Set(unlockedBadges);
  
  // Sắp xếp: unlocked trước, sau đó theo rarity
  const sortedBadges = allBadgeIds
    .map(id => ({ id, unlocked: unlockedSet.has(id), ...BADGE_DEFINITIONS[id] }))
    .sort((a, b) => {
      // Unlocked trước
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      // Sau đó theo rarity
      const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
      return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
    });
  
  const displayBadges = showLocked 
    ? sortedBadges.slice(0, maxDisplay)
    : sortedBadges.filter(b => b.unlocked).slice(0, maxDisplay);
  
  return (
    <div className="badge-display">
      <div className="badge-grid">
        {displayBadges.map((badge) => (
          <div key={badge.id} className="badge-item">
            <Badge badgeId={badge.id} unlocked={badge.unlocked} size="medium" />
            <div className="badge-name">{badge.name}</div>
          </div>
        ))}
      </div>
      
      {unlockedBadges.length > 0 && (
        <div className="badge-summary">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>{unlockedBadges.length} / {allBadgeIds.length} huy hiệu</span>
        </div>
      )}
    </div>
  );
};

// Export cả definitions để sử dụng ở nơi khác
export { BADGE_DEFINITIONS, RARITY_COLORS };
export default BadgeDisplay;

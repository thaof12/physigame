import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Swords, 
  Home, 
  Search, 
  UserPlus, 
  Trophy, 
  Sparkles,
  Shuffle,
  Copy,
  X,
  Users,
  Zap,
  Target,
  Clock,
  ChevronRight,
  Gamepad2,
  BookOpen,
  Dices,
  ChevronLeft
} from 'lucide-react';
import { pkGameModeConfig, difficultyConfig, physicsTopics, getRankByPoints } from './pkGameModes';
import './PKBattle.css';

// DiceBear Avatar Styles - Các style có sẵn từ dicebear.com
const DICEBEAR_STYLES = [
  { id: 'adventurer', name: 'Adventurer', icon: '🧙' },
  { id: 'adventurer-neutral', name: 'Adventurer Neutral', icon: '🧑' },
  { id: 'avataaars', name: 'Avataaars', icon: '👤' },
  { id: 'avataaars-neutral', name: 'Avataaars Neutral', icon: '😊' },
  { id: 'big-ears', name: 'Big Ears', icon: '👂' },
  { id: 'big-ears-neutral', name: 'Big Ears Neutral', icon: '🐻' },
  { id: 'big-smile', name: 'Big Smile', icon: '😄' },
  { id: 'bottts', name: 'Bottts (Robot)', icon: '🤖' },
  { id: 'bottts-neutral', name: 'Bottts Neutral', icon: '🔧' },
  { id: 'croodles', name: 'Croodles', icon: '🎨' },
  { id: 'croodles-neutral', name: 'Croodles Neutral', icon: '✏️' },
  { id: 'fun-emoji', name: 'Fun Emoji', icon: '😜' },
  { id: 'icons', name: 'Icons', icon: '⭐' },
  { id: 'identicon', name: 'Identicon', icon: '🔷' },
  { id: 'initials', name: 'Initials', icon: '🔤' },
  { id: 'lorelei', name: 'Lorelei', icon: '👩' },
  { id: 'lorelei-neutral', name: 'Lorelei Neutral', icon: '👱' },
  { id: 'micah', name: 'Micah', icon: '🧒' },
  { id: 'miniavs', name: 'Miniavs', icon: '👾' },
  { id: 'notionists', name: 'Notionists', icon: '📝' },
  { id: 'notionists-neutral', name: 'Notionists Neutral', icon: '📋' },
  { id: 'open-peeps', name: 'Open Peeps', icon: '🙋' },
  { id: 'personas', name: 'Personas', icon: '🎭' },
  { id: 'pixel-art', name: 'Pixel Art', icon: '👾' },
  { id: 'pixel-art-neutral', name: 'Pixel Art Neutral', icon: '🕹️' },
  { id: 'shapes', name: 'Shapes', icon: '🔶' },
  { id: 'thumbs', name: 'Thumbs', icon: '👍' }
];

// Background colors for avatars
const AVATAR_BG_COLORS = [
  'b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 
  'f4d9b2', 'a3e4d7', 'f9e79f', 'fadbd8', 'aed6f1',
  'f5b7b1', 'd5f5e3', 'fdebd0', 'e8daef', 'fadbd8'
];

const PKLobby = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Avatar state - New system with style selection
  const [avatarStyle, setAvatarStyle] = useState('big-smile');
  const [avatarSeed, setAvatarSeed] = useState(user?.uid || 'player');
  const [avatarBgColor, setAvatarBgColor] = useState('b6e3f4');
  const [playerName, setPlayerName] = useState(user?.displayName || 'Người chơi');
  
  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [createdRoomId, setCreatedRoomId] = useState('');
  
  // Game settings
  const [gameSettings, setGameSettings] = useState({
    gameMode: 'mixed', // 'quiz', 'challenge', 'mixed'
    difficulty: 'mixed',
    totalQuestions: 10,
    timePerQuestion: 30,
    grade: 'all', // 'all', '6', '7', '8', '9', '10', '11', '12'
    topic: 'all' // 'all' hoặc topic cụ thể
  });
  
  // Player stats (will be fetched from API)
  const [stats, setStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    rank: 'Bronze',
    rankIcon: '🥉',
    totalPoints: 0
  });

  // Generate avatar URL - New simple system
  const getAvatarUrl = useCallback(() => {
    return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed}&backgroundColor=${avatarBgColor}`;
  }, [avatarStyle, avatarSeed, avatarBgColor]);

  // Randomize avatar - select random style and seed
  const randomizeAvatar = () => {
    const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    setAvatarStyle(randomChoice(DICEBEAR_STYLES).id);
    setAvatarSeed(Math.random().toString(36).substring(7));
    setAvatarBgColor(randomChoice(AVATAR_BG_COLORS));
  };

  // Fetch player stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.uid) return;
      try {
        const response = await fetch(`/api/battles/stats/${user.uid}`);
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, [user]);

  // Navigate to matchmaking
  const handleFindMatch = () => {
    const avatarUrl = getAvatarUrl();
    navigate('/pk-battle/matchmaking', {
      state: {
        playerName,
        avatarUrl,
        gameSettings
      }
    });
  };

  // Create room
  const handleCreateRoom = async () => {
    try {
      const response = await fetch('/api/battles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user?.uid,
          displayName: playerName,
          avatar: getAvatarUrl(),
          ...gameSettings
        })
      });
      const data = await response.json();
      if (data.success) {
        setCreatedRoomId(data.roomId);
        setShowCreateRoomModal(false);
        setShowInviteModal(true);
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  // Join room by ID
  const handleJoinRoom = async () => {
    if (!roomIdInput.trim()) return;
    
    navigate('/pk-battle/room/' + roomIdInput.toUpperCase(), {
      state: {
        playerName,
        avatarUrl: getAvatarUrl(),
        gameSettings // Pass game settings when joining
      }
    });
  };

  // Copy room ID
  const copyRoomId = () => {
    navigator.clipboard.writeText(createdRoomId);
  };

  return (
    <div className="pk-lobby">
      <div className="pk-lobby-container">
        {/* Header */}
        <div className="pk-lobby-header">
          <button className="pk-back-btn" onClick={() => navigate('/')}>
            <Home size={20} />
            <span>Trang chủ</span>
          </button>
          
          <div className="pk-lobby-title">
            <h1>⚔️ ĐẤU TRƯỜNG VẬT LÝ ⚔️</h1>
            <p>Thách đấu và chinh phục kiến thức!</p>
          </div>
          
          <div style={{ width: 140 }}></div>
        </div>

        {/* Main Content */}
        <div className="pk-lobby-content">
          {/* Avatar Section */}
          <div className="pk-avatar-section">
            <h3>
              <Sparkles size={20} />
              Nhân vật của bạn
            </h3>
            
            <div className="pk-avatar-preview">
              <img src={getAvatarUrl()} alt="Avatar" />
            </div>
            
            <div className="pk-avatar-name">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Nhập tên của bạn"
                maxLength={20}
              />
            </div>
            
            {/* Avatar Style Selector - New Grid of Styles */}
            <div className="pk-avatar-style-selector">
              <div className="pk-style-grid">
                {DICEBEAR_STYLES.slice(0, 8).map((style) => (
                  <button
                    key={style.id}
                    className={`pk-style-btn ${avatarStyle === style.id ? 'active' : ''}`}
                    onClick={() => setAvatarStyle(style.id)}
                    title={style.name}
                  >
                    <img 
                      src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=${avatarSeed}&size=40`}
                      alt={style.name}
                    />
                  </button>
                ))}
              </div>
              
              {/* More styles button */}
              <button 
                className="pk-more-styles-btn"
                onClick={() => {
                  // Cycle through more styles
                  const currentIdx = DICEBEAR_STYLES.findIndex(s => s.id === avatarStyle);
                  const nextIdx = (currentIdx + 1) % DICEBEAR_STYLES.length;
                  setAvatarStyle(DICEBEAR_STYLES[nextIdx].id);
                }}
              >
                <ChevronRight size={16} /> Thêm kiểu ({DICEBEAR_STYLES.length} styles)
              </button>
            </div>

            {/* Background Color Selector */}
            <div className="pk-bg-color-selector">
              <span className="pk-label">🎨 Màu nền:</span>
              <div className="pk-color-dots">
                {AVATAR_BG_COLORS.slice(0, 8).map((color) => (
                  <button
                    key={color}
                    className={`pk-color-dot ${avatarBgColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: `#${color}` }}
                    onClick={() => setAvatarBgColor(color)}
                  />
                ))}
              </div>
            </div>
            
            <button className="pk-randomize-btn" onClick={randomizeAvatar}>
              <Shuffle size={18} />
              Ngẫu nhiên
            </button>
          </div>

          {/* Center Actions */}
          <div className="pk-center-actions">
            <div className="pk-battle-icon">
              <Swords size={80} />
            </div>
            
            <button className="pk-main-btn pk-find-match-btn" onClick={handleFindMatch}>
              <Search size={24} />
              Tìm trận đấu
            </button>
            
            <button 
              className="pk-main-btn pk-create-room-btn" 
              onClick={() => setShowCreateRoomModal(true)}
            >
              <Users size={24} />
              Tạo phòng
            </button>
            
            <button 
              className="pk-main-btn pk-invite-btn" 
              onClick={() => setShowJoinModal(true)}
            >
              <UserPlus size={24} />
              Nhập mã phòng
            </button>

            {/* Game Settings Quick View */}
            <div style={{ 
              marginTop: 20, 
              display: 'flex', 
              gap: 15, 
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.9rem',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Gamepad2 size={16} /> {
                  gameSettings.gameMode === 'quiz' ? 'Trắc nghiệm' :
                  gameSettings.gameMode === 'challenge' ? 'Game thử thách' : 'Hỗn hợp'
                }
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Target size={16} /> {gameSettings.totalQuestions} lượt
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={16} /> {gameSettings.timePerQuestion}s/lượt
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={16} /> {
                  gameSettings.difficulty === 'mixed' ? 'Hỗn hợp' :
                  gameSettings.difficulty === 'easy' ? 'Dễ' :
                  gameSettings.difficulty === 'medium' ? 'Trung bình' : 'Khó'
                }
              </span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="pk-stats-section">
            <h3>
              <Trophy size={20} />
              Thống kê của bạn
            </h3>
            
            <div className="pk-stat-item">
              <span className="pk-stat-label">Tổng trận</span>
              <span className="pk-stat-value">{stats.totalGames}</span>
            </div>
            
            <div className="pk-stat-item">
              <span className="pk-stat-label">Thắng</span>
              <span className="pk-stat-value wins">{stats.wins}</span>
            </div>
            
            <div className="pk-stat-item">
              <span className="pk-stat-label">Thua</span>
              <span className="pk-stat-value losses">{stats.losses}</span>
            </div>
            
            <div className="pk-stat-item">
              <span className="pk-stat-label">Tỷ lệ thắng</span>
              <span className="pk-stat-value">{stats.winRate}%</span>
            </div>

            <div className="pk-stat-item">
              <span className="pk-stat-label">Tổng điểm</span>
              <span className="pk-stat-value" style={{ color: '#fbbf24' }}>{stats.totalPoints}</span>
            </div>
            
            <div className="pk-rank-badge">
              <span style={{ fontSize: '3rem' }}>{stats.rankIcon}</span>
              <div className="pk-rank-info">
                <h4>{stats.rank}</h4>
                <p>Hạng hiện tại</p>
              </div>
            </div>
            
            <button 
              style={{
                width: '100%',
                marginTop: 20,
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 12,
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
              onClick={() => navigate('/pk-battle/leaderboard')}
            >
              Bảng xếp hạng <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateRoomModal && (
        <div className="pk-modal-overlay" onClick={() => setShowCreateRoomModal(false)}>
          <div className="pk-modal pk-modal-large" onClick={e => e.stopPropagation()}>
            <h2>⚙️ Cài đặt phòng đấu</h2>
            
            {/* Game Mode Selection */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 10, fontSize: '0.95rem' }}>
                <Gamepad2 size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Chế độ chơi
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { value: 'quiz', label: 'Trắc nghiệm', icon: <BookOpen size={20} />, desc: 'Chỉ câu hỏi' },
                  { value: 'challenge', label: 'Game thử thách', icon: <Gamepad2 size={20} />, desc: 'Chỉ mini game' },
                  { value: 'mixed', label: 'Hỗn hợp', icon: <Dices size={20} />, desc: 'Cả hai loại' }
                ].map(mode => (
                  <button
                    key={mode.value}
                    onClick={() => setGameSettings({ ...gameSettings, gameMode: mode.value })}
                    style={{
                      padding: '14px 10px',
                      background: gameSettings.gameMode === mode.value 
                        ? 'linear-gradient(135deg, var(--pk-primary), var(--pk-secondary))' 
                        : 'rgba(255,255,255,0.08)',
                      border: gameSettings.gameMode === mode.value 
                        ? '2px solid var(--pk-primary)' 
                        : '2px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {mode.icon}
                    <span style={{ fontWeight: 600 }}>{mode.label}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grade Selection */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 10, fontSize: '0.95rem' }}>
                📚 Cấp độ lớp
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setGameSettings({ ...gameSettings, grade: 'all' })}
                  style={{
                    padding: '10px 16px',
                    background: gameSettings.grade === 'all' ? 'var(--pk-primary)' : 'rgba(255,255,255,0.08)',
                    border: gameSettings.grade === 'all' ? '2px solid var(--pk-primary)' : '2px solid transparent',
                    borderRadius: 8,
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Tất cả
                </button>
                {['6', '7', '8', '9', '10', '11', '12'].map(grade => (
                  <button
                    key={grade}
                    onClick={() => setGameSettings({ ...gameSettings, grade })}
                    style={{
                      padding: '10px 14px',
                      background: gameSettings.grade === grade ? 'var(--pk-primary)' : 'rgba(255,255,255,0.08)',
                      border: gameSettings.grade === grade ? '2px solid var(--pk-primary)' : '2px solid transparent',
                      borderRadius: 8,
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    Lớp {grade}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Number of Rounds */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 10, fontSize: '0.95rem' }}>
                <Target size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Số lượt chơi
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[5, 10, 15, 20].map(num => (
                  <button
                    key={num}
                    onClick={() => setGameSettings({ ...gameSettings, totalQuestions: num })}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: gameSettings.totalQuestions === num ? 'var(--pk-primary)' : 'rgba(255,255,255,0.08)',
                      border: gameSettings.totalQuestions === num ? '2px solid var(--pk-primary)' : '2px solid transparent',
                      borderRadius: 8,
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Time per Round */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 10, fontSize: '0.95rem' }}>
                <Clock size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Thời gian mỗi lượt (giây)
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[15, 30, 45, 60].map(time => (
                  <button
                    key={time}
                    onClick={() => setGameSettings({ ...gameSettings, timePerQuestion: time })}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: gameSettings.timePerQuestion === time ? 'var(--pk-primary)' : 'rgba(255,255,255,0.08)',
                      border: gameSettings.timePerQuestion === time ? '2px solid var(--pk-primary)' : '2px solid transparent',
                      borderRadius: 8,
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    {time}s
                  </button>
                ))}
              </div>
            </div>
            
            {/* Difficulty */}
            <div style={{ marginBottom: 30 }}>
              <label style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 10, fontSize: '0.95rem' }}>
                <Zap size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Độ khó
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { value: 'easy', label: '😊 Dễ', color: '#4ade80' },
                  { value: 'medium', label: '🤔 Trung bình', color: '#facc15' },
                  { value: 'hard', label: '😤 Khó', color: '#f97316' },
                  { value: 'mixed', label: '🎲 Hỗn hợp', color: '#a855f7' }
                ].map(diff => (
                  <button
                    key={diff.value}
                    onClick={() => setGameSettings({ ...gameSettings, difficulty: diff.value })}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: gameSettings.difficulty === diff.value 
                        ? `linear-gradient(135deg, ${diff.color}33, ${diff.color}11)` 
                        : 'rgba(255,255,255,0.08)',
                      border: gameSettings.difficulty === diff.value 
                        ? `2px solid ${diff.color}` 
                        : '2px solid transparent',
                      borderRadius: 8,
                      color: gameSettings.difficulty === diff.value ? diff.color : 'white',
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div style={{ 
              background: 'rgba(139, 92, 246, 0.1)', 
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 24
            }}>
              <h4 style={{ margin: '0 0 10px', color: 'var(--pk-primary)', fontSize: '0.9rem' }}>
                📋 Tóm tắt cài đặt
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                <span>• Chế độ: <strong>{
                  gameSettings.gameMode === 'quiz' ? 'Trắc nghiệm' :
                  gameSettings.gameMode === 'challenge' ? 'Game thử thách' : 'Hỗn hợp'
                }</strong></span>
                <span>• Lớp: <strong>{gameSettings.grade === 'all' ? 'Tất cả' : `Lớp ${gameSettings.grade}`}</strong></span>
                <span>• {gameSettings.totalQuestions} lượt × {gameSettings.timePerQuestion}s</span>
                <span>• Độ khó: <strong>{
                  gameSettings.difficulty === 'easy' ? 'Dễ' :
                  gameSettings.difficulty === 'medium' ? 'Trung bình' :
                  gameSettings.difficulty === 'hard' ? 'Khó' : 'Hỗn hợp'
                }</strong></span>
              </div>
            </div>
            
            <div className="pk-modal-actions">
              <button className="pk-modal-btn secondary" onClick={() => setShowCreateRoomModal(false)}>
                Hủy
              </button>
              <button className="pk-modal-btn primary" onClick={handleCreateRoom}>
                🚀 Tạo phòng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal - Show Room ID */}
      {showInviteModal && (
        <div className="pk-modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="pk-modal" onClick={e => e.stopPropagation()}>
            <h2>🎮 Phòng đã tạo!</h2>
            
            <div className="pk-room-id">
              <label>Mã phòng của bạn</label>
              <div className="pk-room-id-value">{createdRoomId}</div>
              <button className="pk-copy-btn" onClick={copyRoomId}>
                <Copy size={16} /> Sao chép
              </button>
            </div>
            
            <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 20 }}>
              Chia sẻ mã này cho bạn bè để họ tham gia
            </p>
            
            <div className="pk-modal-actions">
              <button className="pk-modal-btn secondary" onClick={() => setShowInviteModal(false)}>
                Đóng
              </button>
              <button 
                className="pk-modal-btn primary" 
                onClick={() => navigate('/pk-battle/room/' + createdRoomId, {
                  state: { 
                    playerName, 
                    avatarUrl: getAvatarUrl(), 
                    isHost: true,
                    gameSettings // Pass game settings when entering room as host
                  }
                })}
              >
                Vào phòng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="pk-modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="pk-modal" onClick={e => e.stopPropagation()}>
            <h2>🚪 Nhập mã phòng</h2>
            
            <input
              type="text"
              className="pk-modal-input"
              placeholder="Nhập mã phòng (VD: ABC123)"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
              maxLength={6}
              style={{ textAlign: 'center', letterSpacing: 5, fontSize: '1.5rem' }}
            />
            
            <div className="pk-modal-actions">
              <button className="pk-modal-btn secondary" onClick={() => setShowJoinModal(false)}>
                Hủy
              </button>
              <button className="pk-modal-btn primary" onClick={handleJoinRoom}>
                Vào phòng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PKLobby;

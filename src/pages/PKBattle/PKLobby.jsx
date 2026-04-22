/**
 * PKLobby.jsx — ĐẤU TRƯỜNG VẬT LÝ (PK BATTLE LOBBY)
 * Redesigned: Eureka Arena Style — Clean, High-End & Competitive
 */

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
  ChevronLeft,
  Star,
  Settings,
  Activity,
  Award
} from 'lucide-react';
import { pkGameModeConfig, difficultyConfig, physicsTopics, getRankByPoints } from './pkGameModes';

// DiceBear Avatar Styles
const DICEBEAR_STYLES = [
  { id: 'adventurer', name: 'Adventurer', icon: '🧙' },
  { id: 'adventurer-neutral', name: 'Adventurer Neutral', icon: '🧑' },
  { id: 'avataaars', name: 'Avataaars', icon: '👤' },
  { id: 'avataaars-neutral', name: 'Avataaars Neutral', icon: '😊' },
  { id: 'big-ears', name: 'Big Ears', icon: '👂' },
  { id: 'big-ears-neutral', name: 'Big Ears Neutral', icon: '🐻' },
  { id: 'big-smile', name: 'Big Smile', icon: '😄' },
  { id: 'bottts', name: 'Bottts', icon: '🤖' },
  { id: 'croodles', name: 'Croodles', icon: '🎨' },
  { id: 'fun-emoji', name: 'Emoji', icon: '😜' },
  { id: 'miniavs', name: 'Miniavs', icon: '👾' },
  { id: 'open-peeps', name: 'Peeps', icon: '🙋' },
  { id: 'personas', name: 'Personas', icon: '🎭' },
  { id: 'pixel-art', name: 'Pixel', icon: '👾' }
];

const AVATAR_BG_COLORS = [
  'b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 
  'f4d9b2', 'a3e4d7', 'f9e79f', 'fadbd8', 'aed6f1'
];

const PKLobby = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [avatarStyle, setAvatarStyle] = useState('big-smile');
  const [avatarSeed, setAvatarSeed] = useState(user?.uid || 'player');
  const [avatarBgColor, setAvatarBgColor] = useState('b6e3f4');
  const [playerName, setPlayerName] = useState(user?.displayName || 'Người chơi');
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [createdRoomId, setCreatedRoomId] = useState('');
  
  const [gameSettings, setGameSettings] = useState({
    gameMode: 'mixed',
    difficulty: 'mixed',
    totalQuestions: 10,
    timePerQuestion: 30,
    grade: 'all',
    topic: 'all'
  });
  
  const [stats, setStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    rank: 'Đồng',
    rankIcon: '🥉',
    totalPoints: 0
  });

  const getAvatarUrl = useCallback(() => {
    return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed}&backgroundColor=${avatarBgColor}`;
  }, [avatarStyle, avatarSeed, avatarBgColor]);

  const randomizeAvatar = () => {
    const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
    setAvatarStyle(randomChoice(DICEBEAR_STYLES).id);
    setAvatarSeed(Math.random().toString(36).substring(7));
    setAvatarBgColor(randomChoice(AVATAR_BG_COLORS));
  };

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

  const handleFindMatch = () => {
    const avatarUrl = getAvatarUrl();
    navigate('/pk-battle/matchmaking', {
      state: { playerName, avatarUrl, gameSettings }
    });
  };

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

  const handleJoinRoom = async () => {
    if (!roomIdInput.trim()) return;
    navigate('/pk-battle/room/' + roomIdInput.toUpperCase(), {
      state: { playerName, avatarUrl: getAvatarUrl(), gameSettings }
    });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(createdRoomId);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20 overflow-x-hidden">
      {/* ── BACKGROUND ELEMENTS ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/20 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-100/30 blur-[120px] rounded-full"></div>
        
        {/* Subtle Geometric Grid */}
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'radial-gradient(#274dad 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32">

        {/* ── HEADER TITLE ── */}
        <div className="text-center mb-16">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 rounded-full text-red-500 text-[10px] font-black tracking-[0.2em] mb-6 shadow-sm uppercase">
              <Swords className="w-3.5 h-3.5" />
              Arena Competitive Mode
           </div>
           
           <h1 className="text-4xl md:text-6xl font-black text-slate-800 leading-tight mb-4 tracking-tighter">
             Đấu Trường <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#21439b] to-[#274dad]">Vật Lý</span>
           </h1>
           <p className="text-slate-400 text-lg font-medium">Thách đấu, chinh phục kiến thức và leo hạng đỉnh cao!</p>
        </div>

        {/* ── MAIN CONTENT GRID ── */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Avatar Column (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 border-2 border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(39,77,173,0.08)] transition-all duration-500">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-[#274dad]" /> Nhân vật
               </h3>
               
               <div className="relative w-40 h-40 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#274dad] to-[#21439b] rounded-[2.5rem] rotate-6 opacity-5"></div>
                  <div className="absolute inset-0 bg-white rounded-[2.5rem] border-2 border-slate-50 flex items-center justify-center shadow-lg overflow-hidden group">
                     <img src={getAvatarUrl()} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <button 
                    onClick={randomizeAvatar}
                    className="absolute -bottom-3 -right-3 w-12 h-12 bg-[#274dad] text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                  >
                    <Shuffle className="w-5 h-5" />
                  </button>
               </div>

               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Tên hiển thị</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-800 font-bold focus:outline-none focus:border-[#274dad]/20 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block ml-1">Kiểu dáng</label>
                    <div className="grid grid-cols-4 gap-3">
                      {DICEBEAR_STYLES.slice(0, 8).map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setAvatarStyle(style.id)}
                          className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
                            avatarStyle === style.id 
                            ? 'bg-[#274dad] shadow-lg scale-105' 
                            : 'bg-slate-50 hover:bg-white border border-slate-100'
                          }`}
                        >
                           <img 
                            src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=${avatarSeed}&size=30`}
                            alt={style.name}
                            className={`w-full h-full ${avatarStyle === style.id ? 'opacity-100' : 'opacity-60'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Center: Main Actions (6 Cols) */}
          <div className="lg:col-span-6 space-y-8">
            <div className="bg-white/60 backdrop-blur-3xl rounded-[3rem] p-10 border-2 border-white shadow-[0_20px_60px_rgba(0,0,0,0.05)] text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500"></div>

               <div className="w-28 h-28 bg-gradient-to-br from-red-500 to-orange-500 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl relative">
                  <div className="absolute inset-0 bg-red-400 blur-2xl opacity-20 animate-pulse"></div>
                  <Swords className="text-white w-14 h-14 drop-shadow-lg" />
               </div>

               <div className="grid gap-4 max-w-sm mx-auto">
                  <button 
                    onClick={handleFindMatch}
                    className="group relative w-full py-5 bg-gradient-to-r from-[#21439b] to-[#274dad] text-white rounded-3xl font-black text-lg shadow-[0_15px_35px_rgba(39,77,173,0.3)] hover:-translate-y-1 active:scale-95 transition-all overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                     <span className="relative flex items-center justify-center gap-3">
                        <Search className="w-6 h-6" /> TÌM TRẬN ĐẤU
                     </span>
                  </button>

                  <div className="grid grid-cols-2 gap-4">
                     <button 
                       onClick={() => setShowCreateRoomModal(true)}
                       className="py-4 bg-white border-2 border-slate-100 text-slate-800 rounded-2xl font-black text-sm hover:border-[#274dad]/30 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                     >
                        <Users className="w-5 h-5 text-blue-500" /> TẠO PHÒNG
                     </button>
                     <button 
                       onClick={() => setShowJoinModal(true)}
                       className="py-4 bg-white border-2 border-slate-100 text-slate-800 rounded-2xl font-black text-sm hover:border-[#274dad]/30 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                     >
                        <UserPlus className="w-5 h-5 text-indigo-500" /> VÀO PHÒNG
                     </button>
                  </div>
               </div>

               {/* Quick Settings Bar */}
               <div className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap justify-center gap-6">
                  {[
                    { icon: Gamepad2, text: gameSettings.gameMode === 'quiz' ? 'Trắc nghiệm' : gameSettings.gameMode === 'challenge' ? 'Thử thách' : 'Hỗn hợp' },
                    { icon: Target, text: `${gameSettings.totalQuestions} lượt` },
                    { icon: Clock, text: `${gameSettings.timePerQuestion}s/lượt` },
                    { icon: Zap, text: gameSettings.difficulty === 'mixed' ? 'Hỗn hợp' : 'Chọn lọc' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                       <item.icon className="w-4 h-4" /> <span>{item.text}</span>
                    </div>
                  ))}
               </div>
            </div>
            
            {/* Promo Card / Tip */}
            <div className="bg-gradient-to-br from-[#274dad] to-[#21439b] rounded-3xl p-6 text-white flex items-center gap-6 shadow-xl relative overflow-hidden group">
               <div className="absolute top-[-50%] left-[-10%] w-40 h-40 bg-white/10 blur-[50px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
               <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 animate-bounce">
                  <Trophy className="w-7 h-7 text-yellow-300" />
               </div>
               <div>
                  <h4 className="font-black text-lg">Mẹo đấu trường</h4>
                  <p className="text-white/70 text-sm font-medium">Trả lời nhanh hơn để nhận được điểm thưởng Combo tối đa!</p>
               </div>
               <button className="ml-auto w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <ChevronRight />
               </button>
            </div>
          </div>

          {/* Right: Stats Column (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 border-2 border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                 <Activity className="w-4 h-4 text-emerald-500" /> Thống kê
               </h3>

               <div className="space-y-4 mb-10">
                  {[
                    { label: 'Tổng trận', value: stats.totalGames, color: 'text-slate-800' },
                    { label: 'Số trận thắng', value: stats.wins, color: 'text-emerald-500' },
                    { label: 'Số trận thua', value: stats.losses, color: 'text-rose-500' },
                    { label: 'Tỷ lệ thắng', value: `${stats.winRate}%`, color: 'text-blue-600' },
                    { label: 'Tổng điểm', value: stats.totalPoints, color: 'text-amber-500' },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                       <span className="text-[13px] font-bold text-slate-400">{stat.label}</span>
                       <span className={`text-base font-black ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
               </div>

               {/* Rank Display */}
               <div className="bg-slate-50/50 rounded-3xl p-6 text-center border border-slate-100">
                  <div className="text-5xl mb-3 drop-shadow-xl animate-bounce">{stats.rankIcon}</div>
                  <h4 className="text-xl font-black text-slate-800 mb-1">{stats.rank}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">HẠNG HIỆN TẠI</p>
               </div>

               <button 
                 onClick={() => navigate('/pk-battle/leaderboard')}
                 className="w-full mt-6 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black tracking-widest text-[#274dad] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
               >
                  BẢNG XẾP HẠNG <ChevronRight size={16} />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      
      {/* Create Room Modal */}
      {showCreateRoomModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCreateRoomModal(false)}></div>
          <div className="relative bg-white rounded-[3rem] p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-[#274dad]/10 animate-scale-in">
             <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
                   <Settings className="w-8 h-8 text-[#274dad]" /> Cấu hình trận đấu
                </h2>
                <button onClick={() => setShowCreateRoomModal(false)} className="p-2 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
                   <X className="w-6 h-6" />
                </button>
             </div>

             <div className="space-y-8">
                {/* Mode Selection */}
                <div>
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">1. CHẾ ĐỘ THÁCH ĐẤU</label>
                   <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'quiz', label: 'Trắc nghiệm', icon: BookOpen, color: 'text-blue-500' },
                      { value: 'challenge', label: 'Mini Game', icon: Gamepad2, color: 'text-emerald-500' },
                      { value: 'mixed', label: 'Hợp nhất', icon: Dices, color: 'text-amber-500' }
                    ].map(mode => (
                      <button
                        key={mode.value}
                        onClick={() => setGameSettings({ ...gameSettings, gameMode: mode.value })}
                        className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${
                          gameSettings.gameMode === mode.value 
                          ? 'border-[#274dad] bg-blue-50/30' 
                          : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:border-[#274dad]/20'
                        }`}
                      >
                         <mode.icon className={`w-8 h-8 ${mode.color}`} />
                         <span className="text-[13px] font-black text-slate-800 tracking-tight">{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rounds & Time */}
                <div className="grid md:grid-cols-2 gap-8">
                   <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">2. SỐ LƯỢT CHƠI</label>
                      <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                        {[5, 10, 15].map(num => (
                          <button
                            key={num}
                            onClick={() => setGameSettings({ ...gameSettings, totalQuestions: num })}
                            className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all ${
                              gameSettings.totalQuestions === num ? 'bg-[#274dad] text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                   </div>
                   <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">3. THỜI GIAN (GIÂY)</label>
                      <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                        {[15, 30, 60].map(time => (
                          <button
                            key={time}
                            onClick={() => setGameSettings({ ...gameSettings, timePerQuestion: time })}
                            className={`flex-1 py-3.5 rounded-xl text-xs font-black transition-all ${
                              gameSettings.timePerQuestion === time ? 'bg-[#274dad] text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {time}s
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

                {/* Grade selection */}
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">4. KIẾN THỨC THEO KHỐI LỚP</label>
                   <div className="flex flex-wrap gap-2">
                    {['all', '6', '7', '8', '9', '10', '11', '12'].map(grade => (
                      <button
                        key={grade}
                        onClick={() => setGameSettings({ ...gameSettings, grade })}
                        className={`px-5 py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                          gameSettings.grade === grade 
                          ? 'border-[#274dad] bg-blue-50/50 text-[#21439b]' 
                          : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-[#274dad]/20'
                        }`}
                      >
                        {grade === 'all' ? 'TẤT CẢ' : `LỚP ${grade}`}
                      </button>
                    ))}
                  </div>
                </div>
             </div>

             <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-end gap-4">
                <button 
                  onClick={() => setShowCreateRoomModal(false)}
                  className="px-8 py-4 bg-white text-slate-400 font-bold hover:text-slate-600 transition-colors"
                >
                  Hủy thao tác
                </button>
                <button 
                  onClick={handleCreateRoom}
                  className="px-10 py-5 bg-[#274dad] text-white rounded-[2rem] font-black text-sm tracking-widest shadow-xl shadow-blue-200 hover:-translate-y-1 active:scale-95 transition-all"
                >
                  BẮT ĐẦU TẠO PHÒNG
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowInviteModal(false)}></div>
          <div className="relative bg-white rounded-[3.5rem] p-12 max-w-md w-full text-center shadow-2xl animate-scale-in border-4 border-emerald-500/10">
             <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Sparkles className="w-10 h-10 text-emerald-500" />
             </div>
             
             <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Phòng đã mở!</h2>
             <p className="text-slate-400 font-medium mb-8">Hãy mời đối thủ của bạn vào tham gia ngay nhé.</p>
             
             <div className="bg-slate-50 rounded-[2rem] p-8 border-2 border-slate-100 mb-8 relative group">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">MÃ PHÒNG ĐẤU</div>
                <div className="text-5xl font-black text-[#274dad] tracking-[0.2em] mb-4">{createdRoomId}</div>
                <button 
                  onClick={copyRoomId}
                  className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black tracking-widest text-slate-500 hover:text-[#274dad] hover:border-[#274dad]/30 transition-all flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" /> SAO CHÉP MÃ
                </button>
             </div>
             
             <button 
                className="w-full py-5 bg-[#274dad] text-white rounded-[2rem] font-black tracking-[0.2em] shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all"
                onClick={() => navigate('/pk-battle/room/' + createdRoomId, {
                  state: { playerName, avatarUrl: getAvatarUrl(), isHost: true, gameSettings }
                })}
              >
                VÀO PHÒNG CHỜ
              </button>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowJoinModal(false)}></div>
          <div className="relative bg-white rounded-[3.5rem] p-12 max-w-md w-full text-center shadow-2xl animate-scale-in">
             <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <UserPlus className="w-10 h-10 text-[#274dad]" />
             </div>
             
             <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-8">Nhập mã phòng</h2>
             
             <input
               type="text"
               className="w-full py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-4xl font-black text-center text-[#274dad] tracking-[0.5em] placeholder:text-slate-200 focus:outline-none focus:border-[#274dad]/30 mb-8"
               placeholder="******"
               value={roomIdInput}
               onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
               maxLength={6}
             />
             
             <div className="flex gap-4">
                <button onClick={() => setShowJoinModal(false)} className="flex-1 py-5 text-slate-400 font-bold hover:text-slate-600 transition-colors">Hủy</button>
                <button 
                  onClick={handleJoinRoom}
                  className="flex-[2] py-5 bg-[#274dad] text-white rounded-[2rem] font-black tracking-[0.2em] shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all"
                >
                  XÁC NHẬN
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PKLobby;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { X, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client';
import './PKBattle.css';

const PKMatchmaking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const socketRef = useRef(null);
  
  const { playerName, avatarUrl, gameSettings } = location.state || {};
  
  const [status, setStatus] = useState('connecting'); // connecting, searching, found, error
  const [searchTime, setSearchTime] = useState(0);
  const [opponent, setOpponent] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [playersOnline, setPlayersOnline] = useState(0);

  useEffect(() => {
    // Connect to socket
    const serverUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5002' : window.location.origin);
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to server');
      setStatus('searching');
      
      // Join matchmaking queue
      socket.emit('pk:join-queue', {
        firebaseUid: user?.uid,
        displayName: playerName,
        avatar: avatarUrl,
        gameSettings
      });
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setStatus('error');
    });

    socket.on('pk:players-online', (count) => {
      setPlayersOnline(count);
    });

    socket.on('pk:match-found', (data) => {
      setStatus('found');
      setOpponent(data.opponent);
      setRoomId(data.roomId);
      
      // Navigate to battle room after short delay
      setTimeout(() => {
        navigate(`/pk-battle/room/${data.roomId}`, {
          state: {
            playerName,
            avatarUrl,
            opponent: data.opponent,
            questions: data.questions,
            gameSettings: data.gameSettings
          }
        });
      }, 2000);
    });

    socket.on('pk:queue-position', (position) => {
      console.log('Queue position:', position);
    });

    // Search timer
    const timer = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (socketRef.current) {
        socketRef.current.emit('pk:leave-queue');
        socketRef.current.disconnect();
      }
    };
  }, [user, playerName, avatarUrl, gameSettings, navigate]);

  const handleCancel = () => {
    if (socketRef.current) {
      socketRef.current.emit('pk:leave-queue');
    }
    navigate('/pk-battle');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col items-center justify-center relative overflow-hidden pt-24">
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

      <div className="relative z-10 max-w-4xl w-full mx-auto px-6 flex flex-col items-center justify-center text-center">
        {status === 'connecting' && (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#274dad] border-t-transparent mb-6"></div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Đang kết nối...</h2>
          </div>
        )}

        {status === 'searching' && (
          <>
            <h2 className="text-2xl md:text-4xl font-black text-slate-800 leading-tight mb-2 tracking-tighter">
              Đang tìm đối thủ<span className="animate-pulse">.</span><span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span><span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
            </h2>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 w-full max-w-2xl my-10">
              {/* Player Card */}
              <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 border-2 border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col items-center w-64 hover:shadow-[0_20px_50px_rgba(39,77,173,0.08)] transition-all duration-300">
                <div className="relative w-32 h-32 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#274dad] to-[#21439b] rounded-[2rem] rotate-6 opacity-5"></div>
                  <div className="absolute inset-0 bg-white rounded-[2rem] border-2 border-slate-100 flex items-center justify-center shadow-md overflow-hidden">
                    <img src={avatarUrl} alt="You" className="w-full h-full object-cover" />
                  </div>
                </div>
                <h3 className="text-slate-800 font-black text-lg mb-2 truncate max-w-[180px]">{playerName}</h3>
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold animate-pulse">
                  Đang tìm trận...
                </div>
              </div>
              
              {/* VS Icon */}
              <div className="relative shrink-0 w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg rotate-45">
                <div className="absolute inset-0 bg-red-400 blur-xl opacity-20 animate-pulse"></div>
                <span className="text-white font-black text-xl -rotate-45">VS</span>
              </div>
              
              {/* Opponent Card - Unknown */}
              <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 border-2 border-slate-200 border-dashed flex flex-col items-center w-64 transition-all duration-300 bg-white/40">
                <div className="relative w-32 h-32 mb-6">
                  <div className="absolute inset-0 bg-slate-50 rounded-[2rem] border-2 border-slate-200 border-dashed flex items-center justify-center shadow-sm overflow-hidden">
                    <Loader2 className="animate-spin text-slate-400" size={40} />
                  </div>
                </div>
                <h3 className="text-slate-400 font-black text-lg mb-2">???</h3>
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-xs font-bold animate-pulse">
                  Đang tìm...
                </div>
              </div>
            </div>
            
            <div className="text-slate-500 font-bold text-sm mb-6 flex flex-col items-center gap-2">
              <div className="bg-white/60 px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
                ⏱️ Thời gian tìm: <span className="text-[#274dad] font-black">{formatTime(searchTime)}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                <span>{playersOnline} người chơi đang online</span>
              </div>
            </div>
            
            <button 
              className="px-8 py-3.5 bg-white hover:bg-rose-50 border-2 border-rose-100 hover:border-rose-200 text-rose-500 rounded-2xl font-black text-sm tracking-wider shadow-sm transition-all"
              onClick={handleCancel}
            >
              Hủy tìm kiếm
            </button>
          </>
        )}

        {status === 'found' && opponent && (
          <>
            <h2 className="text-2xl md:text-4xl font-black text-emerald-600 leading-tight mb-2 tracking-tighter animate-bounce">
              🎯 ĐÃ TÌM THẤY ĐỐI THỦ!
            </h2>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 w-full max-w-2xl my-10">
              {/* Player Card */}
              <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 border-2 border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col items-center w-64 hover:shadow-[0_20px_50px_rgba(39,77,173,0.08)] transition-all duration-300">
                <div className="relative w-32 h-32 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#274dad] to-[#21439b] rounded-[2rem] rotate-6 opacity-5"></div>
                  <div className="absolute inset-0 bg-white rounded-[2rem] border-2 border-slate-100 flex items-center justify-center shadow-md overflow-hidden">
                    <img src={avatarUrl} alt="You" className="w-full h-full object-cover" />
                  </div>
                </div>
                <h3 className="text-slate-800 font-black text-lg mb-2 truncate max-w-[180px]">{playerName}</h3>
              </div>
              
              {/* VS Icon */}
              <div className="relative shrink-0 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg rotate-45">
                <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-20 animate-pulse"></div>
                <span className="text-white font-black text-xl -rotate-45">⚔️</span>
              </div>
              
              {/* Opponent Card */}
              <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 border-2 border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col items-center w-64 hover:shadow-[0_20px_50px_rgba(39,77,173,0.08)] transition-all duration-300">
                <div className="relative w-32 h-32 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-[2rem] rotate-6 opacity-5"></div>
                  <div className="absolute inset-0 bg-white rounded-[2rem] border-2 border-slate-100 flex items-center justify-center shadow-md overflow-hidden">
                    <img src={opponent.avatar} alt="Opponent" className="w-full h-full object-cover" />
                  </div>
                </div>
                <h3 className="text-slate-800 font-black text-lg mb-2 truncate max-w-[180px]">{opponent.displayName}</h3>
              </div>
            </div>
            
            <div className="text-slate-500 font-black text-lg animate-pulse mt-6">
              Chuẩn bị vào trận...
            </div>
          </>
        )}

        {status === 'error' && (
          <div className="bg-white/85 backdrop-blur-2xl rounded-[2.5rem] p-10 border-2 border-rose-100 shadow-2xl max-w-md w-full">
            <h2 className="text-2xl font-black text-rose-500 mb-4 flex items-center justify-center gap-2">
              ❌ Lỗi kết nối
            </h2>
            <p className="text-slate-500 font-bold mb-8">
              Không thể kết nối đến máy chủ. Vui lòng thử lại.
            </p>
            <button 
              className="px-8 py-3.5 bg-white hover:bg-rose-50 border-2 border-rose-100 hover:border-rose-200 text-rose-500 rounded-2xl font-black text-sm tracking-wider shadow-sm transition-all"
              onClick={() => navigate('/pk-battle')}
            >
              Quay lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PKMatchmaking;

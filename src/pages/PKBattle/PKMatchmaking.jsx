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
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to server');
      setStatus('searching');
      
      // Join matchmaking queue
      socket.emit('pk:join-queue', {
        odbaseUId: user?.uid,
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
    <div className="pk-matchmaking">
      <div className="pk-matchmaking-container">
        {status === 'connecting' && (
          <>
            <div className="pk-spinner" style={{ margin: '0 auto 30px' }}></div>
            <h2 style={{ color: 'white', fontSize: '1.5rem' }}>Đang kết nối...</h2>
          </>
        )}

        {status === 'searching' && (
          <>
            <h2 className="pk-searching-text">
              Đang tìm đối thủ<span>.</span><span>.</span><span>.</span>
            </h2>
            
            <div className="pk-vs-container">
              {/* Player Card */}
              <div className="pk-player-card">
                <div className="pk-player-avatar">
                  <img src={avatarUrl} alt="You" />
                </div>
                <div className="pk-player-name">{playerName}</div>
                <div className="pk-player-rank">Đang tìm trận...</div>
              </div>
              
              {/* VS Icon */}
              <div className="pk-vs-icon">VS</div>
              
              {/* Opponent Card - Unknown */}
              <div className="pk-player-card searching">
                <div className="pk-player-avatar unknown">
                  <Loader2 className="animate-spin" size={40} />
                </div>
                <div className="pk-player-name">???</div>
                <div className="pk-player-rank">Đang tìm...</div>
              </div>
            </div>
            
            <div className="pk-timer">
              ⏱️ Thời gian tìm: {formatTime(searchTime)}
            </div>
            
            <div style={{ 
              color: 'rgba(255,255,255,0.5)', 
              marginTop: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}>
              <span style={{ 
                width: 8, 
                height: 8, 
                background: '#10b981', 
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }}></span>
              {playersOnline} người chơi đang online
            </div>
            
            <button className="pk-cancel-btn" onClick={handleCancel}>
              <X size={20} />
              Hủy tìm kiếm
            </button>
          </>
        )}

        {status === 'found' && opponent && (
          <>
            <h2 style={{ 
              color: '#10b981', 
              fontSize: '2rem', 
              marginBottom: 30,
              animation: 'pulse 1s infinite'
            }}>
              🎯 ĐÃ TÌM THẤY ĐỐI THỦ!
            </h2>
            
            <div className="pk-vs-container">
              {/* Player Card */}
              <div className="pk-player-card">
                <div className="pk-player-avatar">
                  <img src={avatarUrl} alt="You" />
                </div>
                <div className="pk-player-name">{playerName}</div>
              </div>
              
              {/* VS Icon */}
              <div className="pk-vs-icon" style={{ animation: 'none', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                ⚔️
              </div>
              
              {/* Opponent Card */}
              <div className="pk-player-card">
                <div className="pk-player-avatar">
                  <img src={opponent.avatar} alt="Opponent" />
                </div>
                <div className="pk-player-name">{opponent.displayName}</div>
              </div>
            </div>
            
            <div style={{ color: 'white', marginTop: 30, fontSize: '1.2rem' }}>
              Chuẩn bị vào trận...
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: 20 }}>
              ❌ Lỗi kết nối
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 30 }}>
              Không thể kết nối đến server. Vui lòng thử lại.
            </p>
            <button className="pk-cancel-btn" onClick={() => navigate('/pk-battle')}>
              Quay lại
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PKMatchmaking;

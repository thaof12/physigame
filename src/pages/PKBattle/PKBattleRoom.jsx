import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { io } from 'socket.io-client';
import { Clock, Zap, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { generateBattleRounds } from './pkRoundGenerator';
import './PKBattle.css';

const PKBattleRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams();
  const { user } = useAuth();
  const socketRef = useRef(null);
  
  const { playerName, avatarUrl, opponent: initialOpponent, questions: initialQuestions } = location.state || {};

  // Game state
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, countdown, playing, finished
  const [countdown, setCountdown] = useState(3);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [rounds, setRounds] = useState([]);
  const [questions, setQuestions] = useState(initialQuestions || []); // Fallback to empty array instead of legacy questions
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerStatus, setAnswerStatus] = useState(null); // null, 'correct', 'wrong'
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [essayInput, setEssayInput] = useState('');
  
  // Scores
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponent, setOpponent] = useState(initialOpponent || null); // No default bot opponent

  // Answer tracking
  const [myAnswers, setMyAnswers] = useState([]);
  const [opponentAnswered, setOpponentAnswered] = useState(false);

  // Ref to hold latest state for socket event closures
  const latestStateRef = useRef({
    opponent,
    myAnswers,
    myScore,
    opponentScore,
    user
  });

  useEffect(() => {
    latestStateRef.current = {
      opponent,
      myAnswers,
      myScore,
      opponentScore,
      user
    };
  }, [opponent, myAnswers, myScore, opponentScore, user]);

  // Get current round/question
  const currentQuestion = rounds.length > 0 ? rounds[currentRoundIndex] : questions[currentRoundIndex];

  // Get game settings from location state
  const gameSettings = location.state?.gameSettings || {};

  // Socket connection
  useEffect(() => {
    const serverUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5002' : window.location.origin);
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to battle room, socket id:', socket.id);
      console.log('Joining room:', roomId, 'as', playerName);
      socket.emit('pk:join-room', {
        roomId,
        firebaseUid: user?.uid,
        displayName: playerName,
        avatar: avatarUrl,
        gameSettings // Pass game settings to server
      });
    });

    socket.on('pk:player-joined', (data) => {
      console.log('pk:player-joined received:', data);
      if (data.firebaseUid !== user?.uid) {
        console.log('Setting opponent:', data.displayName);
        setOpponent(data);
      } else {
        console.log('Ignoring own join event');
      }
    });

    socket.on('pk:game-start', (data) => {
      console.log('Game starting:', data);
      console.log('Game settings received:', data.gameSettings);
      
      const settings = data.gameSettings || gameSettings;
      
      // Generate rounds (always quiz mode)
      if (data.questions) {
        setQuestions(data.questions);
        const quizRounds = data.questions.map((q, i) => ({
          index: i,
          type: q.type || 'quiz',
          ...q
        }));
        setRounds(quizRounds);
        console.log('Generated quiz rounds:', quizRounds.length);
      } else {
        console.log('=== GENERATING ROUNDS ===');
        const generatedRounds = generateBattleRounds({
          ...settings,
          gameMode: 'quiz',
          totalQuestions: settings?.totalQuestions || 10
        });
        setRounds(generatedRounds);
      }
      
      setGameStatus('countdown');
    });

    socket.on('pk:opponent-answered', (data) => {
      setOpponentAnswered(true);
      if (data && typeof data.opponentScore === 'number') {
        setOpponentScore(data.opponentScore);
      }
    });

    socket.on('pk:player-left', (data) => {
      console.log('Opponent left:', data?.displayName);
      setOpponent(prev => prev ? { ...prev, disconnected: true } : null);
    });

    socket.on('pk:game-end', (data) => {
      console.log('pk:game-end received:', data);
      
      const { opponent: currentOpponent, myAnswers: currentMyAnswers, user: currentUser } = latestStateRef.current;
      
      const opponentUid = currentOpponent?.firebaseUid;
      const finalOpponentScore = data.scores[opponentUid] || 0;
      const finalMyScore = data.scores[currentUser?.uid] || 0;
      
      let finalWinner = 'draw';
      if (data.winner === currentUser?.uid) {
        finalWinner = 'me';
      } else if (data.winner === 'draw') {
        finalWinner = 'draw';
      } else {
        finalWinner = 'opponent';
      }

      navigate('/pk-battle/result', {
        state: {
          roomId,
          playerName,
          avatarUrl,
          myScore: finalMyScore,
          opponentScore: finalOpponentScore,
          opponent: currentOpponent,
          winner: finalWinner,
          myAnswers: currentMyAnswers,
          gameSettings,
          rewards: {
            xp: finalWinner === 'me' ? 100 : finalWinner === 'draw' ? 50 : 25,
            coins: finalWinner === 'me' ? 50 : finalWinner === 'draw' ? 25 : 10
          }
        }
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('pk:leave-room', { roomId });
        socketRef.current.disconnect();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]); // Only depend on roomId - don't reconnect when other values change

  // Countdown timer
  useEffect(() => {
    if (gameStatus === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameStatus === 'countdown' && countdown === 0) {
      const firstRound = rounds[0];
      setGameStatus('playing');
      setTimeLeft(firstRound?.timeLimit || 30);
    }
  }, [gameStatus, countdown, rounds]);

  // Quiz timer (only for quiz rounds)
  useEffect(() => {
    if (gameStatus === 'playing' && timeLeft > 0 && !selectedAnswer) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameStatus === 'playing' && timeLeft === 0 && !selectedAnswer) {
      // Time's up - auto select wrong
      handleTimeout();
    }
  }, [gameStatus, timeLeft, selectedAnswer]);

  // REMOVED: Auto-start game - now waits for real opponent
  // Game only starts when server emits 'pk:game-start' after both players join
  useEffect(() => {
    if (gameStatus === 'waiting' && opponent) {
      // Only show "ready to start" when opponent has joined
      console.log('Opponent joined, waiting for game start signal from server');
    }
  }, [gameStatus, opponent]);

  const checkEssayAnswer = (userInput, correctAnswer) => {
    if (!userInput || !correctAnswer) return false;
    const cleanInput = userInput.trim().toLowerCase().replace(/\s+/g, '');
    const cleanCorrect = correctAnswer.trim().toLowerCase().replace(/\s+/g, '');
    return cleanInput === cleanCorrect;
  };

  const handleTimeout = () => {
    setAnswerStatus('timeout');
    setShowCorrectAnswer(true);
    
    const isEssay = currentQuestion?.type === 'essay';
    
    setMyAnswers(prev => [...prev, {
      roundIndex: currentRoundIndex,
      type: isEssay ? 'essay' : 'quiz',
      selected: isEssay ? '' : null,
      correct: currentQuestion?.correctAnswer,
      isCorrect: false,
      responseTime: currentQuestion?.timeLimit || 30
    }]);

    setTimeout(() => moveToNextRound(), isEssay ? 3000 : 2000);
  };

  const handleEssaySubmit = () => {
    if (selectedAnswer !== null) return;
    
    const userInput = essayInput;
    setSelectedAnswer(userInput);
    
    const isCorrect = checkEssayAnswer(userInput, currentQuestion?.correctAnswer);
    setAnswerStatus(isCorrect ? 'correct' : 'wrong');
    setShowCorrectAnswer(true);

    // Calculate points based on time left
    const basePoints = currentQuestion?.points || 100;
    const timeBonus = Math.floor((timeLeft / (currentQuestion?.timeLimit || 30)) * 50);
    const pointsEarned = isCorrect ? basePoints + timeBonus : 0;
    
    setMyScore(prev => prev + pointsEarned);
    
    setMyAnswers(prev => [...prev, {
      roundIndex: currentRoundIndex,
      type: 'essay',
      selected: userInput,
      correct: currentQuestion?.correctAnswer,
      isCorrect,
      responseTime: (currentQuestion?.timeLimit || 30) - timeLeft,
      pointsEarned
    }]);

    // Emit answer to server
    if (socketRef.current) {
      socketRef.current.emit('pk:submit-answer', {
        roomId,
        roundIndex: currentRoundIndex,
        answer: userInput,
        isCorrect,
        pointsEarned,
        responseTime: (currentQuestion?.timeLimit || 30) - timeLeft
      });
    }

    setTimeout(() => moveToNextRound(), 3000);
  };

  const handleAnswer = (answerIndex) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === currentQuestion?.correctAnswer;
    setAnswerStatus(isCorrect ? 'correct' : 'wrong');
    setShowCorrectAnswer(true);

    // Calculate points based on time left
    const basePoints = currentQuestion?.points || 100;
    const timeBonus = Math.floor((timeLeft / (currentQuestion?.timeLimit || 30)) * 50);
    const pointsEarned = isCorrect ? basePoints + timeBonus : 0;
    
    setMyScore(prev => prev + pointsEarned);
    
    setMyAnswers(prev => [...prev, {
      roundIndex: currentRoundIndex,
      type: 'quiz',
      selected: answerIndex,
      correct: currentQuestion?.correctAnswer,
      isCorrect,
      responseTime: (currentQuestion?.timeLimit || 30) - timeLeft,
      pointsEarned
    }]);

    // Emit answer to server
    if (socketRef.current) {
      socketRef.current.emit('pk:submit-answer', {
        roomId,
        roundIndex: currentRoundIndex,
        answer: answerIndex,
        isCorrect,
        pointsEarned,
        responseTime: (currentQuestion?.timeLimit || 30) - timeLeft
      });
    }

    // REMOVED: No longer simulate opponent scoring
    // Real opponent score will come from socket 'pk:question-result' event

    setTimeout(() => moveToNextRound(), 2500);
  };

  const moveToNextRound = () => {
    const totalRounds = rounds.length > 0 ? rounds.length : questions.length;
    
    if (currentRoundIndex < totalRounds - 1) {
      const nextRoundIndex = currentRoundIndex + 1;
      const nextRound = rounds[nextRoundIndex];
      
      setCurrentRoundIndex(nextRoundIndex);
      setSelectedAnswer(null);
      setAnswerStatus(null);
      setShowCorrectAnswer(false);
      setOpponentAnswered(false);
      setEssayInput('');
      
      setTimeLeft(nextRound?.timeLimit || questions[nextRoundIndex]?.timeLimit || 30);
      setGameStatus('playing');
    } else {
      // Game finished - notify server and enter waiting status
      if (socketRef.current) {
        socketRef.current.emit('pk:player-finished', { roomId });
      }
      setGameStatus('waiting-opponent');
    }
  };

  // Waiting for opponent screen
  if (gameStatus === 'waiting-opponent') {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-sans pb-20 overflow-x-hidden flex flex-col items-center justify-center relative">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/20 blur-[130px] rounded-full"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-100/30 blur-[120px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-md w-full mx-auto px-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white/80 backdrop-blur-2xl rounded-[2rem] border-2 border-white shadow-xl flex items-center justify-center mb-8 animate-bounce">
            <span className="text-4xl">🏁</span>
          </div>
          
          <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">
            Bạn đã hoàn thành!
          </h1>
          <p className="text-slate-500 font-bold mb-8 text-sm leading-relaxed">
            Đang chờ đối thủ {opponent?.displayName ? `(${opponent.displayName})` : ''} hoàn thành các câu hỏi còn lại...
          </p>

          <div className="flex items-center gap-3 px-6 py-4 bg-white/80 backdrop-blur-xl border-2 border-white shadow-lg rounded-2xl">
            <div className="animate-spin rounded-full h-5 w-5 border-3 border-[#274dad] border-t-transparent"></div>
            <span className="text-slate-600 font-black text-xs uppercase tracking-wider">Đang đồng bộ kết quả</span>
          </div>
        </div>
      </div>
    );
  }

  // Waiting screen
  if (gameStatus === 'waiting') {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-sans pb-20 overflow-x-hidden flex flex-col items-center justify-center relative">
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

        <div className="relative z-10 max-w-4xl w-full mx-auto px-6 flex flex-col items-center justify-center">
          {/* ── HEADER TITLE ── */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-[#274dad] text-[10px] font-black tracking-[0.2em] mb-4 shadow-sm uppercase">
              ⚔️ Đấu trường PK
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 leading-tight mb-2 tracking-tighter">
              Phòng: <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#21439b] to-[#274dad]">{roomId}</span>
            </h1>
            <p className="text-slate-400 text-base font-medium">
              {opponent ? 'Đối thủ đã vào phòng!' : 'Đang chờ đối thủ tham gia...'}
            </p>
          </div>

          {/* ── SHARE INFO CARD ── */}
          <div className="bg-white/80 backdrop-blur-2xl rounded-2xl px-6 py-3 border-2 border-white shadow-[0_15px_35px_rgba(39,77,173,0.05)] text-center mb-8 flex flex-col sm:flex-row items-center gap-3">
            <span className="text-slate-500 font-bold text-sm">📋 Chia sẻ mã phòng cho bạn bè:</span>
            <span className="text-[#274dad] font-black text-lg tracking-wider bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100">{roomId}</span>
          </div>
          
          {/* ── VS CARD CONTAINER ── */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 w-full max-w-2xl mb-12">
            {/* Player Card */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 border-2 border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col items-center w-64 hover:shadow-[0_20px_50px_rgba(39,77,173,0.08)] transition-all duration-300">
              <div className="relative w-32 h-32 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#274dad] to-[#21439b] rounded-[2rem] rotate-6 opacity-5"></div>
                <div className="absolute inset-0 bg-white rounded-[2rem] border-2 border-slate-100 flex items-center justify-center shadow-md overflow-hidden">
                  <img src={avatarUrl} alt="You" className="w-full h-full object-cover" />
                </div>
              </div>
              <h3 className="text-slate-800 font-black text-lg mb-2 truncate max-w-[180px]">{playerName}</h3>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                ✓ Sẵn sàng
              </div>
            </div>

            {/* VS Icon */}
            <div className="relative shrink-0 w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg rotate-45">
              <div className="absolute inset-0 bg-red-400 blur-xl opacity-20 animate-pulse"></div>
              <span className="text-white font-black text-xl -rotate-45">VS</span>
            </div>

            {/* Opponent Card */}
            <div className={`bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 border-2 border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col items-center w-64 transition-all duration-300 ${!opponent ? 'border-dashed border-slate-300 bg-white/40' : 'hover:shadow-[0_20px_50px_rgba(39,77,173,0.08)]'}`}>
              <div className="relative w-32 h-32 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-[2rem] rotate-6 opacity-5"></div>
                <div className="absolute inset-0 bg-white rounded-[2rem] border-2 border-slate-100 flex items-center justify-center shadow-md overflow-hidden">
                  {opponent?.avatar ? (
                    <img src={opponent.avatar} alt="Opponent" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#274dad] border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="text-slate-800 font-black text-lg mb-2 truncate max-w-[180px]">
                {opponent?.displayName || 'Đang tìm...'}
              </h3>
              {opponent ? (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                  ✓ Sẵn sàng
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-xs font-bold animate-pulse">
                  Đang chờ...
                </div>
              )}
            </div>
          </div>

          {/* ── BOTTOM ACTIONS ── */}
          <div className="flex flex-col items-center gap-4">
            {opponent && (
              <p className="text-emerald-500 font-bold text-sm animate-bounce">
                🎮 Trận đấu sẽ bắt đầu khi cả hai sẵn sàng...
              </p>
            )}

            <div className="flex items-center gap-4">
              {/* Dev mode: Start without opponent for testing */}
              {!opponent && process.env.NODE_ENV === 'development' && (
                <button 
                  className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 border-dashed rounded-2xl text-slate-600 font-bold text-sm transition-all" 
                  onClick={() => {
                    // Generate rounds for testing
                    const testRounds = generateBattleRounds(gameSettings);
                    setRounds(testRounds);
                    setOpponent({
                      displayName: 'Bot Tester',
                      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=bot&backgroundColor=b6e3f4`
                    });
                    setGameStatus('countdown');
                  }}
                >
                  🧪 Test Mode - Bắt đầu (dev)
                </button>
              )}
              
              <button 
                className="px-8 py-3.5 bg-white hover:bg-rose-50 border-2 border-rose-100 hover:border-rose-200 text-rose-500 rounded-2xl font-black text-sm tracking-wider shadow-sm transition-all"
                onClick={() => navigate('/pk-battle')}
              >
                Rời phòng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Countdown screen
  if (gameStatus === 'countdown') {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/20 blur-[130px] rounded-full"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-100/30 blur-[120px] rounded-full"></div>
          <div className="absolute inset-0 opacity-[0.03]" 
            style={{ 
              backgroundImage: 'radial-gradient(#274dad 1px, transparent 1px)', 
              backgroundSize: '40px 40px' 
            }}
          ></div>
        </div>

        <div className="relative z-10 text-center flex flex-col items-center justify-center min-h-[350px]">
          <h2 className="text-xl md:text-2xl font-bold text-slate-400 tracking-wider uppercase mb-6">
            Trận đấu sắp bắt đầu!
          </h2>
          
          <div 
            key={countdown} 
            className="text-[12rem] md:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-[#274dad] via-[#4f46e5] to-[#6366f1] leading-none select-none filter drop-shadow-[0_15px_35px_rgba(79,70,229,0.2)] animate-[pulse_1s_infinite] transition-all duration-300"
          >
            {countdown}
          </div>
          
          <p className="text-slate-500 font-semibold text-base mt-6 tracking-wide animate-pulse">
            Chuẩn bị sẵn sàng!
          </p>
        </div>
      </div>
    );
  }

  // Calculate total rounds for display
  const totalRounds = rounds.length > 0 ? rounds.length : questions.length;

  // Battle screen (Quiz mode)
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] font-sans pt-24 px-4 pb-12 relative overflow-hidden flex flex-col items-center">
      {/* Ambient background decoration */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-100/40 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[55%] h-[55%] bg-indigo-50/50 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 opacity-[0.02]" 
          style={{ 
            backgroundImage: 'radial-gradient(#274dad 1px, transparent 1px)', 
            backgroundSize: '45px 45px' 
          }}
        ></div>
      </div>

      {/* Header with scores */}
      <div className="relative z-10 w-full max-w-4xl bg-white/85 backdrop-blur-md border border-slate-200/60 rounded-3xl p-5 mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex justify-between items-center transition-all duration-300">
        {/* Left Player: You */}
        <div className="flex items-center gap-4 flex-1">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#274dad] shadow-md shadow-blue-500/10 shrink-0">
            <img className="w-full h-full object-cover" src={avatarUrl} alt="You" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bạn</span>
            <span className="text-slate-800 font-extrabold text-sm truncate md:text-base">{playerName}</span>
            <span className="text-2xl font-black text-[#274dad] leading-none mt-1">{myScore}</span>
          </div>
        </div>

        {/* Center: Timer & Round */}
        <div className="flex flex-col items-center justify-center px-4 md:px-6 py-2 bg-slate-50 border border-slate-100 rounded-2xl min-w-[120px] md:min-w-[140px] shadow-inner mx-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Câu {currentRoundIndex + 1}/{totalRounds}
          </div>
          <div className="flex items-center gap-1.5 text-xl md:text-2xl font-black transition-all duration-300" style={{ 
            color: timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#d97706' : '#0f172a' 
          }}>
            <Clock size={18} className={timeLeft <= 10 ? "animate-pulse" : ""} />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Right Player: Opponent */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="flex flex-col text-right min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đối thủ</span>
            <span className="text-slate-800 font-extrabold text-sm truncate md:text-base">{opponent?.displayName || 'Opponent'}</span>
            <span className="text-2xl font-black text-[#6366f1] leading-none mt-1">{opponentScore}</span>
          </div>
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#6366f1] shadow-md shadow-indigo-500/10 shrink-0">
            <img 
              className="w-full h-full object-cover"
              src={opponent?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=opponent&backgroundColor=b6e3f4`} 
              alt="Opponent" 
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="relative z-10 w-full max-w-4xl">
        <div className="w-full bg-white border border-slate-100 rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] flex flex-col relative">
          
          {/* Question Metadata Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md shadow-indigo-600/15">
                Câu {currentRoundIndex + 1}
              </span>
              <span className={`px-4 py-1.5 rounded-xl text-xs font-bold ${
                currentQuestion?.difficulty === 'easy' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                  : currentQuestion?.difficulty === 'medium' 
                    ? 'bg-amber-50 text-amber-700 border border-amber-200/50' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200/50'
              }`}>
                {currentQuestion?.difficulty === 'easy' ? '🟢 Dễ' :
                 currentQuestion?.difficulty === 'medium' ? '🟡 Trung bình' : '🔴 Khó'}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-xl text-xs font-bold border border-amber-200/50">
              <Zap size={14} className="fill-amber-500 stroke-amber-700" />
              <span>+{currentQuestion?.points || 100} Điểm</span>
            </div>
          </div>

          {/* Question Body */}
          <div className="text-slate-800 text-lg md:text-xl font-bold leading-relaxed mb-8 select-none">
            {currentQuestion?.question}
          </div>

          {/* Essay Layout */}
          {currentQuestion?.type === 'essay' ? (
            <div className="w-full flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <input
                  type="text"
                  value={essayInput}
                  onChange={(e) => setEssayInput(e.target.value)}
                  disabled={selectedAnswer !== null}
                  placeholder="Nhập câu trả lời ngắn của bạn ở đây..."
                  className="flex-1 px-5 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-slate-800 text-base font-semibold outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && essayInput.trim() && selectedAnswer === null) {
                      handleEssaySubmit();
                    }
                  }}
                />
                <button
                  onClick={handleEssaySubmit}
                  disabled={selectedAnswer !== null || !essayInput.trim()}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-base shadow-lg shadow-indigo-600/25 hover:from-indigo-700 hover:to-blue-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-300"
                >
                  Gửi đáp án
                </button>
              </div>

              {/* Essay Explanation and Correct Answer */}
              {showCorrectAnswer && (
                <div className="w-full bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-6 text-left shadow-sm animate-fadeIn">
                  <div className="flex items-center gap-2 font-black text-emerald-800 text-base mb-2">
                    <CheckCircle size={18} />
                    <span>Đáp án đúng: {currentQuestion?.correctAnswer}</span>
                  </div>
                  {currentQuestion?.explanation && (
                    <div className="text-sm text-emerald-700/90 leading-relaxed pl-6 border-l-2 border-emerald-300 mt-2">
                      <strong className="text-emerald-800">Hướng dẫn giải: </strong>
                      {currentQuestion.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* MCQ Layout */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion?.options?.map((option, index) => {
                let btnStyles = "flex items-center w-full p-5 rounded-2xl border text-left text-base font-semibold transition-all duration-300 relative group ";
                let circleStyles = "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mr-4 shrink-0 transition-all duration-300 ";

                if (selectedAnswer === null) {
                  btnStyles += "bg-white border-slate-200 text-slate-700 hover:bg-slate-50/80 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5";
                  circleStyles += "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600";
                } else if (selectedAnswer === index) {
                  if (answerStatus === 'correct') {
                    btnStyles += "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-md shadow-emerald-500/5";
                    circleStyles += "bg-emerald-500 text-white";
                  } else {
                    btnStyles += "bg-rose-50 border-rose-500 text-rose-900 shadow-md shadow-rose-500/5";
                    circleStyles += "bg-rose-500 text-white";
                  }
                } else if (showCorrectAnswer && index === currentQuestion.correctAnswer) {
                  btnStyles += "bg-emerald-50 border-emerald-500 text-emerald-900";
                  circleStyles += "bg-emerald-500 text-white";
                } else {
                  btnStyles += "bg-slate-50/50 border-slate-100 text-slate-400 opacity-60 cursor-not-allowed";
                  circleStyles += "bg-slate-200 text-slate-400";
                }

                return (
                  <button
                    key={index}
                    className={btnStyles}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                  >
                    <span className={circleStyles}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 pr-6">{option}</span>
                    
                    {showCorrectAnswer && index === currentQuestion.correctAnswer && (
                      <CheckCircle size={20} className="text-emerald-500 shrink-0 absolute right-5" />
                    )}
                    {selectedAnswer === index && answerStatus === 'wrong' && (
                      <XCircle size={20} className="text-rose-500 shrink-0 absolute right-5" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Feedback Status Pill */}
          {answerStatus && (
            <div className={`mt-8 p-4 rounded-2xl flex items-center justify-center gap-2 text-base font-bold text-center border ${
              answerStatus === 'correct' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : answerStatus === 'timeout' 
                  ? 'bg-amber-50 text-amber-800 border-amber-200' 
                  : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {answerStatus === 'correct' ? (
                <>
                  <CheckCircle size={18} />
                  <span>Chính xác! Bạn đã trả lời đúng.</span>
                </>
              ) : answerStatus === 'timeout' ? (
                <>
                  <Clock size={18} />
                  <span>Hết thời gian! Hãy nhanh hơn ở câu sau.</span>
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  <span>Sai rồi! Cố gắng thử lại ở câu tiếp theo.</span>
                </>
              )}
            </div>
          )}

          {/* Progress Bar Container */}
          <div className="w-full mt-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiến trình</span>
              <span className="text-xs font-black text-[#274dad]">{Math.round(((currentRoundIndex + 1) / totalRounds) * 100)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-[#274dad] rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${((currentRoundIndex + 1) / totalRounds) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Opponent Answer Status indicator */}
          {opponentAnswered && !showCorrectAnswer && (
            <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-sm font-semibold animate-pulse">
              <AlertCircle size={16} className="text-indigo-400" />
              <span>Đối thủ đã hoàn thành câu hỏi này!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PKBattleRoom;

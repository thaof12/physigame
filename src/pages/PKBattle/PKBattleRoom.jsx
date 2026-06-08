import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { io } from 'socket.io-client';
import { Clock, Zap, CheckCircle, XCircle, AlertCircle, Gamepad2, Loader2 } from 'lucide-react';
import { generateBattleRounds } from './pkRoundGenerator';
import './PKBattle.css';

// Lazy load challenge games
const challengeGameComponents = {
  // Mechanical & Motion
  'ProjectileMotion': lazy(() => import('../../areas/Vatly/challenges/ProjectileMotion/ProjectileMotion')),
  'BalanceChallenge': lazy(() => import('../../areas/Vatly/challenges/BalanceChallenge/BalanceChallenge')),
  'ForceArena': lazy(() => import('../../areas/Vatly/challenges/ForceArena/ForceArena')),
  'ForceWorldGame': lazy(() => import('../../areas/Vatly/challenges/ForceWorldGame/ForceWorldGame')),
  'RaceTracker': lazy(() => import('../../areas/Vatly/challenges/RaceTracker/RaceTracker')),
  
  // Optics
  'LightReflectionGame': lazy(() => import('../../areas/Vatly/challenges/LightReflectionGame/LightReflectionGame')),
  'LightPathGame': lazy(() => import('../../areas/Vatly/challenges/LightPathGame/LightPathGame')),
  'MirrorLabGame': lazy(() => import('../../areas/Vatly/challenges/MirrorLabGame/MirrorLabGame')),
  
  // Thermal
  'BoilingGame': lazy(() => import('../../areas/Vatly/challenges/BoilingGame/BoilingGame')),
  'ThermalEnergyGame': lazy(() => import('../../areas/Vatly/challenges/ThermalEnergyGame/ThermalEnergyGame')),
  'WaterLab': lazy(() => import('../../areas/Vatly/challenges/WaterLab/WaterLab')),
  
  // Electricity
  'CircuitBuilderGame': lazy(() => import('../../areas/Vatly/challenges/CircuitBuilderGame/CircuitBuilderGame')),
};

// Sample physics questions - In production, these would come from the server
const SAMPLE_QUESTIONS = [
  {
    id: 1,
    question: "Đơn vị của lực trong hệ SI là gì?",
    options: ["Joule", "Newton", "Watt", "Pascal"],
    correctAnswer: 1,
    difficulty: "easy",
    points: 100,
    timeLimit: 30
  },
  {
    id: 2,
    question: "Công thức tính vận tốc trung bình là?",
    options: ["v = s/t", "v = a.t", "v = s.t", "v = a/t"],
    correctAnswer: 0,
    difficulty: "easy",
    points: 100,
    timeLimit: 30
  },
  {
    id: 3,
    question: "Định luật bảo toàn năng lượng phát biểu rằng:",
    options: [
      "Năng lượng có thể tự sinh ra",
      "Năng lượng không thể chuyển hóa",
      "Năng lượng không tự sinh ra và không tự mất đi",
      "Năng lượng chỉ tồn tại ở dạng cơ năng"
    ],
    correctAnswer: 2,
    difficulty: "medium",
    points: 150,
    timeLimit: 30
  },
  {
    id: 4,
    question: "Gia tốc trọng trường trên Trái Đất xấp xỉ bằng:",
    options: ["9.8 m/s²", "10 m/s", "9.8 m/s", "10 m/s²"],
    correctAnswer: 0,
    difficulty: "easy",
    points: 100,
    timeLimit: 30
  },
  {
    id: 5,
    question: "Áp suất được tính bằng công thức nào?",
    options: ["P = F.S", "P = F/S", "P = S/F", "P = F + S"],
    correctAnswer: 1,
    difficulty: "easy",
    points: 100,
    timeLimit: 30
  },
  {
    id: 6,
    question: "Công suất của một thiết bị điện có điện trở R khi có dòng điện I chạy qua là:",
    options: ["P = I.R", "P = I².R", "P = I/R", "P = R/I²"],
    correctAnswer: 1,
    difficulty: "medium",
    points: 150,
    timeLimit: 30
  },
  {
    id: 7,
    question: "Hiện tượng khúc xạ ánh sáng xảy ra khi:",
    options: [
      "Ánh sáng đi qua lăng kính",
      "Ánh sáng truyền từ môi trường này sang môi trường khác",
      "Ánh sáng gặp gương phẳng",
      "Ánh sáng đi trong chân không"
    ],
    correctAnswer: 1,
    difficulty: "medium",
    points: 150,
    timeLimit: 30
  },
  {
    id: 8,
    question: "Định luật Ôm phát biểu mối quan hệ giữa:",
    options: [
      "Điện áp, cường độ dòng điện và công suất",
      "Điện áp, cường độ dòng điện và điện trở",
      "Điện trở, công suất và thời gian",
      "Cường độ dòng điện, thời gian và điện lượng"
    ],
    correctAnswer: 1,
    difficulty: "easy",
    points: 100,
    timeLimit: 30
  },
  {
    id: 9,
    question: "Trong dao động điều hòa, gia tốc có giá trị cực đại khi:",
    options: [
      "Vật ở vị trí cân bằng",
      "Vật ở biên dương",
      "Vận tốc cực đại",
      "Vật ở biên (dương hoặc âm)"
    ],
    correctAnswer: 3,
    difficulty: "hard",
    points: 200,
    timeLimit: 30
  },
  {
    id: 10,
    question: "Sóng điện từ truyền trong chân không với vận tốc:",
    options: ["300,000 m/s", "3 × 10⁸ m/s", "3 × 10⁶ m/s", "30,000 km/s"],
    correctAnswer: 1,
    difficulty: "medium",
    points: 150,
    timeLimit: 30
  }
];

const PKBattleRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams();
  const { user } = useAuth();
  const socketRef = useRef(null);
  
  const { playerName, avatarUrl, opponent: initialOpponent, questions: initialQuestions } = location.state || {};

  // Game state
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, countdown, playing, playing-challenge, finished
  const [countdown, setCountdown] = useState(3);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [rounds, setRounds] = useState([]); // Rounds can be quiz or challenge
  const [questions, setQuestions] = useState(initialQuestions || SAMPLE_QUESTIONS); // Legacy fallback
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerStatus, setAnswerStatus] = useState(null); // null, 'correct', 'wrong'
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  
  // Scores
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponent, setOpponent] = useState(initialOpponent || null); // No default bot opponent

  // Answer tracking
  const [myAnswers, setMyAnswers] = useState([]);
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  
  // Challenge game state
  const [challengeStarted, setChallengeStarted] = useState(false);

  // Get current round (either from new rounds system or legacy questions)
  const currentRound = rounds.length > 0 ? rounds[currentRoundIndex] : null;
  const currentQuestion = currentRound?.type === 'quiz' ? currentRound : questions[currentRoundIndex];

  // Get game settings from location state
  const gameSettings = location.state?.gameSettings || {};

  // Socket connection
  useEffect(() => {
    const serverUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);
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
      
      // Use gameSettings from server or local state
      const settings = data.gameSettings || gameSettings;
      const gameMode = settings?.gameMode || 'mixed';
      
      console.log('Game Mode:', gameMode);
      
      // Generate rounds based on game mode
      if (gameMode === 'quiz' && data.questions) {
        // Quiz mode: use server questions
        setQuestions(data.questions);
        const quizRounds = data.questions.map((q, i) => ({
          index: i,
          type: 'quiz',
          ...q
        }));
        setRounds(quizRounds);
        console.log('Generated quiz rounds:', quizRounds.length);
      } else {
        // Challenge or Mixed mode: generate rounds locally with correct settings
        console.log('=== GENERATING ROUNDS ===');
        console.log('Settings:', settings);
        console.log('Game Mode:', gameMode);
        
        const generatedRounds = generateBattleRounds({
          ...settings,
          gameMode: gameMode,
          totalQuestions: settings?.totalQuestions || 10
        });
        
        console.log('Generated rounds:', generatedRounds);
        console.log('Round count:', generatedRounds.length);
        console.log('First round:', generatedRounds[0]);
        
        setRounds(generatedRounds);
      }
      
      setGameStatus('countdown');
    });

    socket.on('pk:opponent-answered', () => {
      setOpponentAnswered(true);
    });

    socket.on('pk:question-result', (data) => {
      setOpponentScore(data.opponentScore);
    });

    socket.on('pk:game-end', (data) => {
      navigate('/pk-battle/result', {
        state: {
          roomId,
          playerName,
          avatarUrl,
          myScore: data.myScore,
          opponentScore: data.opponentScore,
          opponent,
          winner: data.winner,
          myAnswers: data.myAnswers,
          rewards: data.rewards
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
      // Check what type of round this is
      const firstRound = rounds[0];
      if (firstRound?.type === 'challenge') {
        setGameStatus('playing-challenge');
        setTimeLeft(firstRound.timeLimit || 60);
      } else {
        setGameStatus('playing');
        setTimeLeft(firstRound?.timeLimit || 30);
      }
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

  // Challenge timer (for challenge game rounds)
  useEffect(() => {
    if (gameStatus === 'playing-challenge' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameStatus === 'playing-challenge' && timeLeft === 0) {
      // Challenge time's up - auto complete with partial score
      handleChallengeTimeout();
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

  const handleTimeout = () => {
    setAnswerStatus('timeout');
    setShowCorrectAnswer(true);
    
    setMyAnswers(prev => [...prev, {
      roundIndex: currentRoundIndex,
      type: 'quiz',
      selected: null,
      correct: currentQuestion?.correctAnswer,
      isCorrect: false,
      responseTime: currentQuestion?.timeLimit || 30
    }]);

    setTimeout(() => moveToNextRound(), 2000);
  };

  // Handler for challenge game timeout
  const handleChallengeTimeout = () => {
    setChallengeStarted(false);
    
    setMyAnswers(prev => [...prev, {
      roundIndex: currentRoundIndex,
      type: 'challenge',
      gameId: currentRound?.gameId,
      gameName: currentRound?.gameName,
      completed: false,
      score: 0,
      responseTime: currentRound?.timeLimit || 60
    }]);

    // Emit challenge result to server
    if (socketRef.current) {
      socketRef.current.emit('pk:submit-challenge', {
        roomId,
        roundIndex: currentRoundIndex,
        gameId: currentRound?.gameId,
        completed: false,
        score: 0,
        responseTime: currentRound?.timeLimit || 60
      });
    }

    setTimeout(() => moveToNextRound(), 2000);
  };

  // Handler for challenge game completion
  const handleChallengeComplete = useCallback((result) => {
    setChallengeStarted(false);
    
    const pointsEarned = result.completed ? 
      (currentRound?.points || 100) + Math.floor((timeLeft / (currentRound?.timeLimit || 60)) * 50) :
      Math.floor((result.score || 0) * 0.3);
    
    setMyScore(prev => prev + pointsEarned);
    
    setMyAnswers(prev => [...prev, {
      roundIndex: currentRoundIndex,
      type: 'challenge',
      gameId: currentRound?.gameId,
      gameName: currentRound?.gameName,
      completed: result.completed,
      score: result.score || 0,
      pointsEarned,
      responseTime: (currentRound?.timeLimit || 60) - timeLeft
    }]);

    // Emit challenge result to server
    if (socketRef.current) {
      socketRef.current.emit('pk:submit-challenge', {
        roomId,
        roundIndex: currentRoundIndex,
        gameId: currentRound?.gameId,
        completed: result.completed,
        score: result.score || 0,
        pointsEarned,
        responseTime: (currentRound?.timeLimit || 60) - timeLeft
      });
    }

    setTimeout(() => moveToNextRound(), 2500);
  }, [currentRound, currentRoundIndex, timeLeft, roomId]);

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
      setChallengeStarted(false);
      setOpponentAnswered(false);
      
      // Set timer and game status based on round type
      if (nextRound?.type === 'challenge') {
        setTimeLeft(nextRound.timeLimit || 60);
        setGameStatus('playing-challenge');
      } else {
        setTimeLeft(nextRound?.timeLimit || questions[nextRoundIndex]?.timeLimit || 30);
        setGameStatus('playing');
      }
    } else {
      // Game finished
      const winner = myScore > opponentScore ? 'me' : myScore < opponentScore ? 'opponent' : 'draw';
      navigate('/pk-battle/result', {
        state: {
          roomId,
          playerName,
          avatarUrl,
          myScore,
          opponentScore,
          opponent,
          winner,
          myAnswers,
          gameSettings,
          rewards: {
            xp: winner === 'me' ? 100 : winner === 'draw' ? 50 : 25,
            coins: winner === 'me' ? 50 : winner === 'draw' ? 25 : 10
          }
        }
      });
    }
  };

  // Waiting screen
  if (gameStatus === 'waiting') {
    return (
      <div className="pk-matchmaking">
        <div className="pk-matchmaking-container">
          <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: 20 }}>
            ⚔️ Phòng: {roomId}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>
            {opponent ? 'Đối thủ đã vào phòng!' : 'Đang chờ đối thủ tham gia...'}
          </p>
          <p style={{ 
            color: '#fbbf24', 
            marginBottom: 40, 
            fontSize: '0.9rem',
            background: 'rgba(251, 191, 36, 0.1)',
            padding: '10px 20px',
            borderRadius: 10,
            border: '1px solid rgba(251, 191, 36, 0.3)'
          }}>
            📋 Chia sẻ mã phòng <strong>{roomId}</strong> cho bạn bè để tham gia!
          </p>
          
          <div className="pk-vs-container">
            <div className="pk-player-card">
              <div className="pk-player-avatar">
                <img src={avatarUrl} alt="You" />
              </div>
              <div className="pk-player-name">{playerName}</div>
              <div style={{ color: '#10b981', marginTop: 10 }}>✓ Sẵn sàng</div>
            </div>
            
            <div className="pk-vs-icon">VS</div>
            
            <div className="pk-player-card searching">
              <div className="pk-player-avatar">
                {opponent?.avatar ? (
                  <img src={opponent.avatar} alt="Opponent" />
                ) : (
                  <div className="pk-spinner"></div>
                )}
              </div>
              <div className="pk-player-name">{opponent?.displayName || '???'}</div>
              <div style={{ color: opponent ? '#10b981' : 'rgba(255,255,255,0.5)', marginTop: 10 }}>
                {opponent?.displayName ? '✓ Sẵn sàng' : 'Đang chờ...'}
              </div>
            </div>
          </div>

          {opponent && (
            <p style={{ color: '#10b981', marginTop: 20, marginBottom: 20 }}>
              🎮 Trận đấu sẽ bắt đầu khi cả hai sẵn sàng...
            </p>
          )}
          
          {/* Dev mode: Start without opponent for testing */}
          {!opponent && process.env.NODE_ENV === 'development' && (
            <button 
              className="pk-start-btn" 
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
              style={{
                marginBottom: 15,
                padding: '12px 24px',
                background: 'rgba(139, 92, 246, 0.3)',
                border: '1px dashed rgba(139, 92, 246, 0.5)',
                borderRadius: 12,
                color: '#a78bfa',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              🧪 Test Mode - Bắt đầu (dev)
            </button>
          )}
          
          <button className="pk-cancel-btn" onClick={() => navigate('/pk-battle')}>
            Rời phòng
          </button>
        </div>
      </div>
    );
  }

  // Countdown screen
  if (gameStatus === 'countdown') {
    return (
      <div className="pk-matchmaking">
        <div className="pk-matchmaking-container">
          <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: 40 }}>
            Trận đấu sắp bắt đầu!
          </h2>
          
          <div style={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'var(--pk-gradient-battle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '6rem',
            fontWeight: 900,
            color: 'white',
            margin: '0 auto',
            animation: 'pulse 1s infinite',
            boxShadow: '0 0 100px rgba(255, 107, 107, 0.5)'
          }}>
            {countdown}
          </div>
          
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 40, fontSize: '1.2rem' }}>
            Chuẩn bị sẵn sàng!
          </p>
        </div>
      </div>
    );
  }

  // Calculate total rounds for display
  const totalRounds = rounds.length > 0 ? rounds.length : questions.length;

  // Challenge game screen
  if (gameStatus === 'playing-challenge') {
    const ChallengeGame = currentRound?.gameComponent ? 
      challengeGameComponents[currentRound.gameComponent] : null;

    return (
      <div className="pk-battle-room">
        {/* Header with scores */}
        <div className="pk-battle-header">
          <div className="pk-battle-player">
            <div className="pk-battle-player-avatar">
              <img src={avatarUrl} alt="You" />
            </div>
            <div className="pk-battle-player-info">
              <h4>{playerName}</h4>
              <div className="score">{myScore}</div>
            </div>
          </div>
          
          <div className="pk-battle-timer">
            <div className="time" style={{ 
              color: timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : 'white' 
            }}>
              <Clock size={24} style={{ display: 'inline', marginRight: 8 }} />
              {timeLeft}s
            </div>
            <div className="round">
              <Gamepad2 size={16} style={{ display: 'inline', marginRight: 5 }} />
              Vòng {currentRoundIndex + 1}/{totalRounds}
            </div>
          </div>
          
          <div className="pk-battle-player right">
            <div className="pk-battle-player-avatar">
              <img 
                src={opponent?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=opponent&backgroundColor=b6e3f4`} 
                alt="Opponent" 
              />
            </div>
            <div className="pk-battle-player-info" style={{ textAlign: 'right' }}>
              <h4>{opponent?.displayName || 'Opponent'}</h4>
              <div className="score">{opponentScore}</div>
            </div>
          </div>
        </div>

        {/* Challenge Game Content */}
        <div className="pk-battle-content pk-challenge-content">
          <div className="pk-challenge-info">
            <div className="pk-challenge-header">
              <Gamepad2 size={24} />
              <h3>{currentRound?.gameName || 'Challenge Game'}</h3>
              <span className={`pk-question-difficulty ${currentRound?.difficulty}`}>
                {currentRound?.difficulty === 'easy' ? '🟢 Dễ' :
                 currentRound?.difficulty === 'medium' ? '🟡 TB' : '🔴 Khó'}
              </span>
              <span style={{ 
                color: 'var(--pk-accent)', 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}>
                <Zap size={18} />
                +{currentRound?.points || 100} điểm
              </span>
            </div>
          </div>

          <div className="pk-challenge-game-wrapper">
            {ChallengeGame ? (
              <Suspense fallback={
                <div className="pk-challenge-loading">
                  <Loader2 size={48} className="animate-spin" />
                  <p>Đang tải mini game...</p>
                </div>
              }>
                <ChallengeGame 
                  isPKMode={true}
                  pkTimeLimit={timeLeft}
                  onComplete={handleChallengeComplete}
                  onExit={() => handleChallengeComplete({ completed: false, score: 0 })}
                />
              </Suspense>
            ) : (
              <div className="pk-challenge-not-found">
                <AlertCircle size={48} />
                <p>Không tìm thấy mini game: {currentRound?.gameComponent}</p>
                <button 
                  className="pk-btn pk-btn-primary"
                  onClick={() => handleChallengeComplete({ completed: false, score: 0 })}
                >
                  Bỏ qua
                </button>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="pk-progress-container">
            <div className="pk-progress-bar">
              <div 
                className="pk-progress-fill" 
                style={{ width: `${((currentRoundIndex + 1) / totalRounds) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Battle screen (Quiz mode)
  return (
    <div className="pk-battle-room">
      {/* Header with scores */}
      <div className="pk-battle-header">
        <div className="pk-battle-player">
          <div className="pk-battle-player-avatar">
            <img src={avatarUrl} alt="You" />
          </div>
          <div className="pk-battle-player-info">
            <h4>{playerName}</h4>
            <div className="score">{myScore}</div>
          </div>
        </div>
        
        <div className="pk-battle-timer">
          <div className="time" style={{ 
            color: timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : 'white' 
          }}>
            <Clock size={24} style={{ display: 'inline', marginRight: 8 }} />
            {timeLeft}s
          </div>
          <div className="round">Câu {currentRoundIndex + 1}/{totalRounds}</div>
        </div>
        
        <div className="pk-battle-player right">
          <div className="pk-battle-player-avatar">
            <img 
              src={opponent?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=opponent&backgroundColor=b6e3f4`} 
              alt="Opponent" 
            />
          </div>
          <div className="pk-battle-player-info" style={{ textAlign: 'right' }}>
            <h4>{opponent?.displayName || 'Opponent'}</h4>
            <div className="score">{opponentScore}</div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="pk-battle-content">
        <div className="pk-question-card">
          <div className="pk-question-header">
            <span className="pk-question-number">
              Câu {currentRoundIndex + 1}
            </span>
            <span className={`pk-question-difficulty ${currentQuestion?.difficulty}`}>
              {currentQuestion?.difficulty === 'easy' ? '🟢 Dễ' :
               currentQuestion?.difficulty === 'medium' ? '🟡 Trung bình' : '🔴 Khó'}
            </span>
            <span style={{ 
              color: 'var(--pk-accent)', 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}>
              <Zap size={18} />
              +{currentQuestion?.points || 100} điểm
            </span>
          </div>
          
          <div className="pk-question-text">
            {currentQuestion?.question}
          </div>
          
          <div className="pk-answers-grid">
            {currentQuestion?.options.map((option, index) => {
              let buttonClass = 'pk-answer-btn';
              
              if (selectedAnswer === index) {
                buttonClass += answerStatus === 'correct' ? ' correct' : ' wrong';
              } else if (showCorrectAnswer && index === currentQuestion.correctAnswer) {
                buttonClass += ' correct';
              }
              
              return (
                <button
                  key={index}
                  className={buttonClass}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    marginRight: 12,
                    fontWeight: 700
                  }}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                  
                  {showCorrectAnswer && index === currentQuestion.correctAnswer && (
                    <CheckCircle size={20} style={{ marginLeft: 'auto', color: '#10b981' }} />
                  )}
                  {selectedAnswer === index && answerStatus === 'wrong' && (
                    <XCircle size={20} style={{ marginLeft: 'auto', color: '#ef4444' }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer feedback */}
          {answerStatus && (
            <div style={{
              marginTop: 20,
              padding: 15,
              borderRadius: 12,
              background: answerStatus === 'correct' ? 'rgba(16, 185, 129, 0.2)' : 
                         answerStatus === 'timeout' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: answerStatus === 'correct' ? '#10b981' : 
                     answerStatus === 'timeout' ? '#f59e0b' : '#ef4444',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '1.1rem'
            }}>
              {answerStatus === 'correct' ? '✓ Chính xác!' : 
               answerStatus === 'timeout' ? '⏱️ Hết thời gian!' : '✗ Sai rồi!'}
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="pk-progress-container">
            <div className="pk-progress-bar">
              <div 
                className="pk-progress-fill" 
                style={{ width: `${((currentRoundIndex + 1) / totalRounds) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Opponent status */}
          {opponentAnswered && !showCorrectAnswer && (
            <div style={{
              marginTop: 15,
              color: 'rgba(255,255,255,0.6)',
              textAlign: 'center',
              fontSize: '0.9rem'
            }}>
              <AlertCircle size={16} style={{ display: 'inline', marginRight: 5 }} />
              Đối thủ đã trả lời!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PKBattleRoom;

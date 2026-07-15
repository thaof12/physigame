import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, RotateCcw, Star, Coins, TrendingUp, Award, Target, CheckCircle2, Clock } from 'lucide-react';
import Confetti from 'react-confetti';
import { useAuth } from '../../contexts/AuthContext';
import { logSessionActivity } from '../../services/activityLogger';

const PKResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [saved, setSaved] = useState(false);

  const {
    playerName = 'Bạn',
    avatarUrl,
    myScore = 0,
    opponentScore = 0,
    opponent = { displayName: 'Đối thủ', avatar: '' },
    winner = 'me', // 'me', 'opponent', 'draw'
    myAnswers = [],
    rewards: stateRewards,
    roomId = ''
  } = location.state || {};

  // Recalculate winner based on scores to prevent socket sync / timing issues
  let finalWinner = winner;
  if (typeof myScore === 'number' && typeof opponentScore === 'number') {
    if (myScore > opponentScore) {
      finalWinner = 'me';
    } else if (opponentScore > myScore) {
      finalWinner = 'opponent';
    } else {
      finalWinner = 'draw';
    }
  }

  const isVictory = finalWinner === 'me';
  const isDraw = finalWinner === 'draw';

  // Recalculate rewards based on the true winner
  const rewards = {
    xp: finalWinner === 'me' ? 100 : finalWinner === 'draw' ? 50 : 25,
    coins: finalWinner === 'me' ? 50 : finalWinner === 'draw' ? 25 : 10
  };

  // Save battle result to database
  useEffect(() => {
    const saveBattleResult = async () => {
      if (saved || !user?.uid) return;

      try {
        const response = await fetch('/api/battles/save-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId,
            firebaseUid: user.uid,
            playerName,
            myScore,
            opponentScore,
            opponentName: opponent?.displayName,
            opponentFirebaseUid: opponent?.firebaseUid,
            winner: finalWinner,
            correctAnswers: myAnswers.filter(a => a.isCorrect).length,
            totalQuestions: myAnswers.length || 10,
            avgResponseTime: myAnswers.length > 0
              ? myAnswers.reduce((sum, a) => sum + (a.responseTime || 0), 0) / myAnswers.length
              : 0,
            rewards
          })
        });

        if (response.ok) {
          setSaved(true);
          console.log('Battle result saved successfully');

          const xpGained = rewards?.xp || (finalWinner === 'me' ? 100 : finalWinner === 'draw' ? 50 : 25);
          logSessionActivity(
            'pk',
            finalWinner === 'me' ? 'Chiến thắng PK' : finalWinner === 'draw' ? 'Trận PK hòa' : 'Hoàn thành trận PK',
            `Đối đầu với ${opponent?.displayName || 'Đối thủ'} (Phòng ${roomId})`,
            xpGained
          );
        }
      } catch (error) {
        console.error('Error saving battle result:', error);
      }
    };

    saveBattleResult();
  }, [user, saved, roomId, playerName, myScore, opponentScore, opponent, finalWinner, myAnswers, rewards]);

  // Confetti effect for victory
  useEffect(() => {
    if (isVictory) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000);
    }

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVictory]);

  // Calculate stats
  const totalQuestions = myAnswers.length || 10;
  const correctAnswers = myAnswers.filter(a => a.isCorrect).length;
  const accuracy = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(0) : 0;
  const avgTime = myAnswers.length > 0
    ? (myAnswers.reduce((sum, a) => sum + (a.responseTime || 0), 0) / myAnswers.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-6 pt-6 overflow-x-hidden flex flex-col items-center justify-center relative">
      {/* ── BACKGROUND BLUR DECORATIONS ── */}
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

      {/* Confetti for victory */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={400}
          colors={['#10b981', '#fbbf24', '#274dad', '#f43f5e', '#8b5cf6', '#2099e9']}
          style={{ background: 'transparent' }}
        />
      )}

      <div className="relative z-10 max-w-5xl w-full mx-auto px-6 flex flex-col items-center">
        {/* Result Header Badge */}
        <div className="text-center mb-4 shrink-0">
          <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-[9px] font-black tracking-[0.2em] mb-2 shadow-sm uppercase ${isVictory
            ? 'bg-emerald-50 border border-emerald-100 text-emerald-600'
            : isDraw
              ? 'bg-amber-50 border border-amber-100 text-amber-600'
              : 'bg-rose-50 border border-rose-100 text-rose-600'
            }`}>
            {isVictory ? '🏆 Chiến thắng!' : isDraw ? '🤝 Hòa trận' : '💔 Thua cuộc'}
          </div>

          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tighter mb-1">
            {isVictory ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                CHIẾN THẮNG!
              </span>
            ) : isDraw ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">
                HÒA TRẬN!
              </span>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-red-500">
                THU CUỘC
              </span>
            )}
          </h1>
          <p className="text-slate-400 text-xs font-bold">
            Trận đấu đã kết thúc • Phòng: {roomId}
          </p>
        </div>

        {/* ── TWO COLUMN MAIN LAYOUT ── */}
        <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch justify-center">
          {/* LEFT SIDE: PLAYERS & ACTIONS */}
          <div className="flex-1 flex flex-col justify-between bg-white/60 backdrop-blur-xl border border-slate-100 rounded-[2rem] p-6 shadow-md">
            <div>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 text-center lg:text-left">So tài điểm số</h2>
              <div className="flex items-center justify-center gap-4 mb-6">
                {/* Player 1 (You) */}
                <div className={`bg-white rounded-2xl p-4 border flex flex-col items-center flex-1 max-w-[160px] shadow-sm transition-all ${isVictory ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100'
                  }`}>
                  <div className="relative w-16 h-16 mb-3">
                    <div className="absolute inset-0 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm overflow-hidden">
                      <img src={avatarUrl} alt="You" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <h3 className="text-slate-800 font-black text-xs truncate max-w-[120px]">{playerName}</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bạn</span>
                  <div className={`text-2xl font-black ${isVictory ? 'text-emerald-500' : 'text-slate-700'}`}>
                    {myScore}
                  </div>
                </div>

                {/* VS Divider */}
                <div className="shrink-0 w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                  <span className="text-slate-400 font-black text-xs">VS</span>
                </div>

                {/* Player 2 (Opponent) */}
                <div className={`bg-white rounded-2xl p-4 border flex flex-col items-center flex-1 max-w-[160px] shadow-sm transition-all ${!isVictory && !isDraw ? 'border-rose-200 bg-rose-50/10' : 'border-slate-100'
                  }`}>
                  <div className="relative w-16 h-16 mb-3">
                    <div className="absolute inset-0 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm overflow-hidden">
                      <img src={opponent?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=opponent'} alt="Opponent" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <h3 className="text-slate-800 font-black text-xs truncate max-w-[120px]">
                    {opponent?.displayName || 'Đối thủ'}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Đối thủ</span>
                  <div className={`text-2xl font-black ${!isVictory && !isDraw ? 'text-rose-500' : 'text-slate-700'}`}>
                    {opponentScore}
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS (at the bottom of left column) */}
            <div className="flex items-center gap-3 mt-4">
              <button
                className="flex-1 py-3 bg-gradient-to-r from-[#2099e9] to-[#85e4fb] text-white rounded-xl font-black text-[11px] uppercase tracking-wider shadow-md shadow-blue-500/10 hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
                onClick={() => navigate('/pk-battle')}
              >
                <RotateCcw size={14} />
                <span>Chơi lại</span>
              </button>

              <button
                className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                onClick={() => navigate('/')}
              >
                <Home size={14} />
                <span>Trang chủ</span>
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: STATS, REWARDS, DETAIL */}
          <div className="flex-1 flex flex-col gap-4">
            {/* STATS SECTION */}
            <div className="grid grid-cols-3 gap-3 w-full">
              {[
                { label: 'Đúng', value: `${correctAnswers}/${totalQuestions}`, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50/50 border-emerald-100/50' },
                { label: 'Chính xác', value: `${accuracy}%`, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50/50 border-blue-100/50' },
                { label: 'TB Thời gian', value: `${avgTime}s`, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50/50 border-amber-100/50' }
              ].map((stat, idx) => (
                <div key={idx} className={`bg-white/80 border border-slate-100 rounded-2xl p-3 flex flex-col items-center text-center shadow-sm ${stat.bg}`}>
                  <stat.icon className={`w-4 h-4 mb-1.5 ${stat.color}`} />
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                  <p className={`text-sm font-black ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* REWARDS & RANK CONTAINER */}
            <div className="bg-white/60 backdrop-blur-xl border border-slate-100 rounded-[2rem] p-5 shadow-sm flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 text-[10px] font-black shadow-sm">
                  <Star size={14} className="fill-indigo-500 text-indigo-500" />
                  <span>+{rewards.xp} XP</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-amber-600 text-[10px] font-black shadow-sm">
                  <Coins size={14} className="fill-amber-500 text-amber-500" />
                  <span>+{rewards.coins} XU</span>
                </div>
                {isVictory && (
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-[10px] font-black shadow-sm">
                    <TrendingUp size={14} />
                    <span>+1 THẮNG</span>
                  </div>
                )}
              </div>

              {/* RANK PROGRESS */}
              <div className="border-t border-slate-100/80 pt-3">
                <div className="flex items-center justify-between text-slate-500 font-bold text-[10px] mb-2">
                  <span className="flex items-center gap-1"><Award size={14} className="text-indigo-500" /> Tiến trình hạng</span>
                  <span className="text-[9px] text-slate-400 font-black">SILVER 🥈 ➔ 🥇 GOLD</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(65 + (isVictory ? 10 : 0), 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* DETAIL EXPANDABLE CARD */}
            {myAnswers.length > 0 && (
              <div className="bg-white/60 border border-slate-100 rounded-[2rem] p-4 shadow-sm flex-1 max-h-[160px] overflow-hidden flex flex-col">
                <h3 className="text-slate-600 font-black text-[10px] uppercase tracking-wider mb-2">
                  📋 Chi tiết câu trả lời
                </h3>
                <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 scrollbar-thin">
                  {myAnswers.map((answer, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-center px-3 py-1.5 rounded-lg border text-[10px] ${answer.isCorrect
                        ? 'bg-emerald-50/40 border-emerald-100/50 text-emerald-700'
                        : 'bg-rose-50/40 border-rose-100/50 text-rose-700'
                        }`}
                    >
                      <span className="font-bold">
                        Câu {idx + 1}: Trắc nghiệm
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-400 font-semibold">{answer.responseTime}s</span>
                        <span className="font-black text-xs">{answer.isCorrect ? `+${answer.pointsEarned || 100}` : '0'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PKResult;

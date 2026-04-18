import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Lock, CheckCircle, Star, PlayCircle, Crown } from 'lucide-react';
import { grade6Games } from '../areas/Vatly/data/grade6Games';
import { grade7Games } from '../areas/Vatly/data/grade7Games';
import { grade8Games } from '../areas/Vatly/data/grade8Games';
import { grade9Games } from '../areas/Vatly/data/grade9Games';
import { grade10Games } from '../areas/Vatly/data/grade10Games';
import { grade11Games } from '../areas/Vatly/data/grade11Games';
import { grade12Games } from '../areas/Vatly/data/grade12Games';
import { useAuth } from '../contexts/AuthContext';
import { useGameProgress } from '../contexts/GameProgressContext';
import './GameJourney.css';

const GRADE_ITEMS = [
  { id: 6, label: 'Lớp 6', subtitle: 'Khởi động nền tảng', icon: '🌱' },
  { id: 7, label: 'Lớp 7', subtitle: 'Nâng cấp kỹ năng', icon: '🚀' },
  { id: 8, label: 'Lớp 8', subtitle: 'Tăng tốc tư duy', icon: '⚡' },
  { id: 9, label: 'Lớp 9', subtitle: 'Vững chắc kiến thức', icon: '🛡️' },
  { id: 10, label: 'Lớp 10', subtitle: 'Bứt phá nâng cao', icon: '🔥' },
  { id: 11, label: 'Lớp 11', subtitle: 'Chiến thuật chuyên sâu', icon: '🎯' },
  { id: 12, label: 'Lớp 12', subtitle: 'Chinh phục đỉnh cao', icon: '👑' }
];

const GAMES_BY_GRADE = {
  6: grade6Games,
  7: grade7Games,
  8: grade8Games,
  9: grade9Games,
  10: grade10Games,
  11: grade11Games,
  12: grade12Games
};

const GameJourney = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    progressByGrade,
    gameResults,
    loading,
    loadGradeProgress,
    isGameCompleted,
    isGameUnlocked,
    getCurrentGame,
    getTotalTrophies
  } = useGameProgress();

  const [selectedGrade, setSelectedGrade] = useState(6);

  useEffect(() => {
    GRADE_ITEMS.forEach((grade) => {
      loadGradeProgress(grade.id);
    });
  }, [loadGradeProgress]);

  const getGamesForGrade = (grade) => GAMES_BY_GRADE[grade] || [];

  const getGradeStats = (gradeId) => {
    const gradeProgress = progressByGrade[gradeId] || { completed: [] };
    const games = getGamesForGrade(gradeId);
    const completed = (gradeProgress.completed || []).length;
    const total = games.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      total,
      percent,
      isCompleted: total > 0 && completed >= total
    };
  };

  const isGradeUnlocked = (gradeId) => {
    if (gradeId === 6) {
      return true;
    }

    const previousGradeStats = getGradeStats(gradeId - 1);
    return previousGradeStats.isCompleted;
  };

  const journeyNodes = useMemo(() => {
    return GRADE_ITEMS.map((grade) => {
      const stats = getGradeStats(grade.id);
      const unlocked = isGradeUnlocked(grade.id);

      return {
        ...grade,
        ...stats,
        unlocked,
        status: !unlocked ? 'locked' : stats.isCompleted ? 'done' : 'active'
      };
    });
  }, [progressByGrade]);

  useEffect(() => {
    const firstActive = journeyNodes.find((node) => node.status === 'active');
    const fallbackNode = journeyNodes.find((node) => node.unlocked) || journeyNodes[0];
    const targetGrade = firstActive?.id || fallbackNode?.id || 6;

    setSelectedGrade((current) => {
      const selectedNode = journeyNodes.find((node) => node.id === current);
      if (selectedNode?.unlocked) {
        return current;
      }
      return targetGrade;
    });
  }, [journeyNodes]);

  const games = getGamesForGrade(selectedGrade);
  const selectedNode = journeyNodes.find((node) => node.id === selectedGrade);
  const completedGames = progressByGrade[selectedGrade]?.completed || [];
  const currentGame = getCurrentGame(selectedGrade, games);
  const selectedResults = gameResults[selectedGrade] || {};

  const completedGrades = journeyNodes.filter((node) => node.isCompleted).length;
  const totalTrophies = getTotalTrophies();

  const checkCompleted = (gameId) => isGameCompleted(gameId, selectedGrade);
  const isCurrent = (gameId) => gameId === currentGame;
  const isLocked = (gameId) => !isGameUnlocked(gameId, selectedGrade, games);

  const handleBack = () => {
    const hasHistory = window.history.state && window.history.state.idx > 0;
    if (hasHistory) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  const handleGameClick = (game) => {
    if (isLocked(game.id)) {
      return;
    }
    navigate(game.path);
  };

  const totalGames = games.length;
  const completedCount = completedGames.length;
  const progressPercent = totalGames > 0 ? Math.round((completedCount / totalGames) * 100) : 0;

  const renderStars = (gameId) => {
    const result = selectedResults[gameId];
    const stars = result?.stars || 0;

    return (
      <div className="journey-stars">
        {[1, 2, 3].map(i => (
          <Star
            key={i}
            size={14}
            className={i <= stars ? 'filled' : 'empty'}
            fill={i <= stars ? '#FFD700' : 'none'}
            stroke={i <= stars ? '#FFD700' : '#666'}
          />
        ))}
      </div>
    );
  };

  const formatEstimatedTime = (value) => {
    if (typeof value === 'number') {
      return `${value} phút`;
    }
    if (typeof value === 'string') {
      return value.includes('phút') ? value : `${value} phút`;
    }
    return '-';
  };

  const getCurrentMilestoneLabel = () => {
    const firstActive = journeyNodes.find((node) => node.status === 'active');
    if (firstActive) {
      return `Bạn đang ở ${firstActive.label}`;
    }
    return 'Bạn đã hoàn thành toàn bộ hành trình';
  };

  return (
    <div className="journey-page">
      <div className="journey-header">
        <button onClick={handleBack} className="journey-back-button">
          <ArrowLeft size={24} />
        </button>
        <div className="journey-header-content">
          <h1>Hành Trình Game Vượt Ải</h1>
          <p>Mỗi chương là một lớp từ 6 đến 12. Hoàn thành lớp trước để mở lớp kế tiếp.</p>
        </div>
      </div>

      <div className="journey-overview">
        <div className="overview-card">
          <div className="overview-title">Tiến độ hành trình</div>
          <div className="overview-value">{completedGrades}/7 lớp</div>
        </div>
        <div className="overview-card">
          <div className="overview-title">Tổng cúp</div>
          <div className="overview-value">
            <Trophy size={18} />
            <span>{totalTrophies}</span>
          </div>
        </div>
        <div className="overview-card">
          <div className="overview-title">Mốc hiện tại</div>
          <div className="overview-value milestone">
            <Crown size={18} />
            <span>{getCurrentMilestoneLabel()}</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="journey-loading">
          <div className="spinner" />
          <span>Đang tải tiến độ...</span>
        </div>
      )}

      <div className="journey-layout">
        <section className="milestone-track" aria-label="Hành trình lớp học">
          {journeyNodes.map((node, index) => (
            <div key={node.id} className="milestone-item">
              {index > 0 && <div className={`milestone-line ${node.unlocked ? 'open' : 'locked'}`} />}
              <button
                type="button"
                className={`milestone-node ${node.status}`}
                onClick={() => node.unlocked && setSelectedGrade(node.id)}
                disabled={!node.unlocked}
              >
                <div className="milestone-icon-wrap">
                  {node.unlocked ? (
                    node.isCompleted ? <Trophy size={22} /> : <PlayCircle size={22} />
                  ) : (
                    <Lock size={20} />
                  )}
                </div>
                <div className="milestone-info">
                  <div className="milestone-top-row">
                    <span className="milestone-name">{node.label}</span>
                    <span className="milestone-emoji">{node.icon}</span>
                  </div>
                  <div className="milestone-subtitle">{node.subtitle}</div>
                  <div className="milestone-progress">
                    <span>{node.completed}/{node.total} game</span>
                    <span>{node.percent}%</span>
                  </div>
                  <div className="mini-progress-bar">
                    <div className="mini-progress-fill" style={{ width: `${node.percent}%` }} />
                  </div>
                </div>
              </button>
            </div>
          ))}
        </section>

        <section className="grade-detail-panel">
          <div className="grade-detail-header">
            <div>
              <h2>{selectedNode?.label || `Lớp ${selectedGrade}`}</h2>
              <p>{selectedNode?.subtitle || 'Danh sách game theo lớp'}</p>
            </div>
            <div className="grade-detail-stats">
              <span>
                <CheckCircle size={16} />
                {completedCount}/{totalGames}
              </span>
              <span>
                <Trophy size={16} />
                {selectedNode?.isCompleted ? 'Đã lấy cúp lớp' : 'Chưa hoàn thành'}
              </span>
            </div>
          </div>

          <div className="grade-progress-block">
            <div className="grade-progress-row">
              <strong>Tiến độ lớp {selectedGrade}</strong>
              <span>{progressPercent}%</span>
            </div>
            <div className="grade-progress-bar">
              <div className="grade-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="grade-games-grid">
            {games.map((game) => {
              const completed = checkCompleted(game.id);
              const locked = isLocked(game.id);
              const current = isCurrent(game.id);
              const result = selectedResults[game.id];

              return (
                <article
                  key={game.id}
                  className={`grade-game-card ${completed ? 'done' : ''} ${current ? 'current' : ''} ${locked ? 'locked' : ''}`}
                >
                  <div className="game-card-top">
                    <h3>{game.title}</h3>
                    {locked ? <Lock size={16} /> : completed ? <CheckCircle size={16} /> : <PlayCircle size={16} />}
                  </div>

                  <p>{game.description}</p>

                  <div className="game-card-meta">
                    <span>Chương {game.chapter}</span>
                    <span>{formatEstimatedTime(game.estimatedTime)}</span>
                    <span>
                      {game.difficulty === 'easy' ? 'Dễ' : game.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                    </span>
                  </div>

                  {completed && renderStars(game.id)}

                  {result?.score !== undefined && (
                    <div className="game-score">Điểm: {result.score}/{result.maxScore || 100}</div>
                  )}

                  <button
                    type="button"
                    className={`play-btn ${completed ? 'replay' : ''}`}
                    onClick={() => handleGameClick(game)}
                    disabled={locked}
                  >
                    {locked ? 'Đang khóa' : completed ? 'Chơi lại' : current ? 'Bắt đầu ngay' : 'Vào chơi'}
                  </button>
                </article>
              );
            })}

            {games.length === 0 && (
              <div className="empty-grade-games">
                Chưa có game cho lớp này.
              </div>
            )}
          </div>
        </section>
      </div>

      {!user && (
        <div className="login-prompt">
          <p>Đăng nhập để lưu tiến độ của bạn!</p>
          <button onClick={() => navigate('/login')} className="login-button">
            Đăng nhập
          </button>
        </div>
      )}
    </div>
  );
};

export default GameJourney;

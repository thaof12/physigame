import React, { useMemo, useState } from 'react';
import { Home, FlaskConical, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './NuclearReactionChamber.css';

const nuclei = [
  { symbol: 'U-235', type: 'fission', note: 'Dễ phân hạch khi hấp thụ nơtron chậm.' },
  { symbol: 'Pu-239', type: 'fission', note: 'Đồng vị quan trọng trong lò phản ứng.' },
  { symbol: 'D + T', type: 'fusion', note: 'Phản ứng nhiệt hạch tạo He và nơtron năng lượng cao.' },
  { symbol: 'H + H', type: 'fusion', note: 'Mô phỏng phản ứng trong lõi sao.' }
];

const randomScenario = () => nuclei[Math.floor(Math.random() * nuclei.length)];

const NuclearReactionChamber = () => {
  const navigate = useNavigate();
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [scenario, setScenario] = useState(() => randomScenario());
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);

  const progress = useMemo(() => Math.min((round / 8) * 100, 100), [round]);

  const handleChoice = (choice) => {
    const correct = choice === scenario.type;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 10);
      setFeedback(`Chuẩn rồi. ${scenario.symbol} thuộc nhóm ${scenario.type === 'fission' ? 'phân hạch' : 'nhiệt hạch'}.`);
    } else {
      setFeedback(`Chưa đúng. ${scenario.symbol} là phản ứng ${scenario.type === 'fission' ? 'phân hạch' : 'nhiệt hạch'}.`);
    }
  };

  const nextRound = () => {
    if (round >= 8) {
      setFeedback(`Bạn hoàn thành buồng phản ứng với ${score} điểm.`);
      setIsCorrect(null);
      return;
    }

    setRound((prev) => prev + 1);
    setScenario(randomScenario());
    setFeedback('');
    setIsCorrect(null);
  };

  return (
    <div className="nuclear-game">
      <header className="nuclear-header">
        <button className="nuclear-back" onClick={() => navigate('/physics-games/grades')}>
          <Home size={18} />
          Về roadmap
        </button>
        <h1><FlaskConical size={22} /> Nuclear Reaction Chamber</h1>
      </header>

      <main className="nuclear-main">
        <section className="nuclear-card">
          <p className="nuclear-kicker">Lượt {round}/8</p>
          <div className="nuclear-progress-track">
            <div className="nuclear-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <h2>Phân loại phản ứng</h2>
          <p className="nucleus">{scenario.symbol}</p>
          <p className="hint">{scenario.note}</p>

          <div className="nuclear-actions">
            <button onClick={() => handleChoice('fission')} disabled={isCorrect !== null}>Phân hạch</button>
            <button onClick={() => handleChoice('fusion')} disabled={isCorrect !== null}>Nhiệt hạch</button>
          </div>

          {feedback && (
            <div className={`nuclear-feedback ${isCorrect ? 'ok' : 'bad'}`}>
              {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              {feedback}
            </div>
          )}

          <div className="nuclear-footer">
            <span>Điểm: {score}</span>
            <button className="next" onClick={nextRound}>Lượt tiếp theo</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default NuclearReactionChamber;

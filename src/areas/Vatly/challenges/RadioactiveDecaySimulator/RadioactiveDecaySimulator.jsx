import React, { useMemo, useState } from 'react';
import { Home, Atom, TimerReset } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './RadioactiveDecaySimulator.css';

const RadioactiveDecaySimulator = () => {
  const navigate = useNavigate();
  const [halfLife, setHalfLife] = useState(5);
  const [elapsed, setElapsed] = useState(10);
  const [initialNuclei, setInitialNuclei] = useState(1000);

  const remaining = useMemo(() => {
    const ratio = Math.pow(0.5, elapsed / halfLife);
    return Math.max(0, Math.round(initialNuclei * ratio));
  }, [elapsed, halfLife, initialNuclei]);

  const decayed = initialNuclei - remaining;

  return (
    <div className="decay-game">
      <header className="decay-header">
        <button onClick={() => navigate('/physics-games/grades')}>
          <Home size={18} />
          Về roadmap
        </button>
        <h1><Atom size={22} /> Radioactive Decay Simulator</h1>
      </header>

      <main className="decay-main">
        <section className="decay-panel">
          <h2>Mô phỏng định luật phóng xạ</h2>
          <p>Dùng công thức N = N0 × (1/2)<sup>t/T</sup> để theo dõi số hạt nhân còn lại theo thời gian.</p>

          <label>
            Chu kỳ bán rã T (đơn vị thời gian): {halfLife}
            <input type="range" min="1" max="20" value={halfLife} onChange={(e) => setHalfLife(Number(e.target.value))} />
          </label>

          <label>
            Thời gian trôi qua t: {elapsed}
            <input type="range" min="0" max="50" value={elapsed} onChange={(e) => setElapsed(Number(e.target.value))} />
          </label>

          <label>
            Số hạt nhân ban đầu N0
            <input type="number" min="100" max="100000" value={initialNuclei} onChange={(e) => setInitialNuclei(Number(e.target.value) || 100)} />
          </label>

          <div className="decay-stats">
            <div>
              <span>Còn lại</span>
              <strong>{remaining}</strong>
            </div>
            <div>
              <span>Đã phân rã</span>
              <strong>{decayed}</strong>
            </div>
            <div>
              <span>Tỷ lệ còn lại</span>
              <strong>{((remaining / initialNuclei) * 100).toFixed(1)}%</strong>
            </div>
          </div>

          <button className="reset" onClick={() => { setHalfLife(5); setElapsed(10); setInitialNuclei(1000); }}>
            <TimerReset size={16} />
            Đặt lại tham số
          </button>
        </section>
      </main>
    </div>
  );
};

export default RadioactiveDecaySimulator;

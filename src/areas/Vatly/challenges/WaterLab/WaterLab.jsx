// WaterLab.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WATER_LAB_DATA } from '../../../data/waterLabData';
import GameIntro from '../GameIntro/GameIntro';
import { GAME_INTRO_DATA } from '../../../data/gameIntroData';
import './WaterLab.css';

// --- Hằng số Vật lý ---
const TICK_RATE = 100; // ms
const HEAT_RATE = 0.5; // °C mỗi tick
const MELT_RATE = 1.0; // ml mỗi tick
const FREEZE_RATE = 1.0; // ml mỗi tick
const BOIL_RATE = 0.2; // ml mỗi tick
const CONDENSE_RATE = 0.1; // giọt mỗi tick

// --- Hằng số Điểm ---
const BASE_SCORE = 1000;
const MAX_TIME_BONUS = 500;
const EFFICIENCY_BONUS = 300;

const WaterLab = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [levelData, setLevelData] = useState(WATER_LAB_DATA[0]);
  const [gameState, setGameState] = useState(WATER_LAB_DATA[0]?.initialState || {
    iceVolume: 100,
    waterVolume: 0,
    temperature: -10,
    condensedDrops: 0,
    isLidOn: false,
  });
  const [targetTemp, setTargetTemp] = useState(20);
  const [gameTime, setGameTime] = useState(0);
  const [isGameActive, setIsGameActive] = useState(true);
  const [finalScore, setFinalScore] = useState(null);
  const [message, setMessage] = useState('');

  // Kiểm tra dữ liệu có tồn tại không
  if (!WATER_LAB_DATA || WATER_LAB_DATA.length === 0) {
    return (
      <div className="water-lab-container">
        <div className="lab-header">
          <h1>❌ Lỗi: Không tìm thấy dữ liệu game</h1>
          <p>Vui lòng kiểm tra file waterLabData.js</p>
        </div>
      </div>
    );
  }

  // --- BỘ MÁY VẬT LÝ (STATE MACHINE) ---
  const updatePhysics = useCallback(() => {
    if (!isGameActive) return;

    setGameState((prev) => {
      const newState = { ...prev };
      const currentTemp = newState.temperature;
      const tempDiff = targetTemp - currentTemp;

      let isPhaseChanging = false;

      // 1. XỬ LÝ CHUYỂN THỂ (ƯU TIÊN HÀNG ĐẦU)

      // 1a. Đang Nóng Chảy (Có đá, nhiệt độ >= 0, đang đun nóng)
      if (newState.iceVolume > 0 && currentTemp >= 0 && targetTemp > 0) {
        isPhaseChanging = true;
        newState.temperature = 0; // Nhiệt độ giữ nguyên ở 0°C
        const meltAmount = Math.min(newState.iceVolume, MELT_RATE);
        newState.iceVolume -= meltAmount;
        newState.waterVolume += meltAmount;
      }
      // 1b. Đang Đông Đặc (Có nước, nhiệt độ <= 0, đang làm lạnh)
      else if (newState.waterVolume > 0 && currentTemp <= 0 && targetTemp < 0) {
        isPhaseChanging = true;
        newState.temperature = 0; // Nhiệt độ giữ nguyên ở 0°C
        const freezeAmount = Math.min(newState.waterVolume, FREEZE_RATE);
        newState.waterVolume -= freezeAmount;
        newState.iceVolume += freezeAmount;
      }
      // 1c. Đang Sôi (Có nước, nhiệt độ >= 100, đang đun nóng)
      else if (newState.waterVolume > 0 && currentTemp >= 100 && targetTemp > 100) {
        isPhaseChanging = true;
        newState.temperature = 100; // Nhiệt độ giữ nguyên ở 100°C
        
        // Bay hơi
        const boilAmount = Math.min(newState.waterVolume, BOIL_RATE);
        newState.waterVolume -= boilAmount;

        // Ngưng tụ (nếu có nắp)
        if (newState.isLidOn) {
          newState.condensedDrops += CONDENSE_RATE;
        }
      }

      // 2. XỬ LÝ THAY ĐỔI NHIỆT ĐỘ (Nếu không chuyển thể)
      if (!isPhaseChanging && tempDiff !== 0) {
        if (tempDiff > 0) {
          // Đang nóng lên
          newState.temperature = Math.min(targetTemp, currentTemp + HEAT_RATE);
        } else {
          // Đang lạnh đi
          newState.temperature = Math.max(targetTemp, currentTemp - HEAT_RATE);
        }
      }

      return newState;
    });
  }, [isGameActive, targetTemp]);

  // --- VÒNG LẶP GAME ---
  // Chạy bộ máy vật lý
  useEffect(() => {
    const gameInterval = setInterval(updatePhysics, TICK_RATE);
    return () => clearInterval(gameInterval);
  }, [updatePhysics]);

  // Chạy đồng hồ bấm giờ
  useEffect(() => {
    if (!isGameActive) return;
    const timerInterval = setInterval(() => {
      setGameTime((t) => t + TICK_RATE / 1000);
    }, TICK_RATE);
    return () => clearInterval(timerInterval);
  }, [isGameActive]);

  // --- XỬ LÝ THẮNG/THUA ---
  const calculateScore = useCallback(() => {
    const timeBonus = Math.max(0, MAX_TIME_BONUS - Math.floor(gameTime * 10));
    const efficiencyPenalty = levelData.efficiencyCheck(gameState);
    const totalEfficiencyBonus = EFFICIENCY_BONUS + efficiencyPenalty;
    
    const totalScore = BASE_SCORE + timeBonus + totalEfficiencyBonus;
    
    setFinalScore({
      base: BASE_SCORE,
      time: timeBonus,
      efficiency: totalEfficiencyBonus,
      total: totalScore,
    });
    setMessage("Hoàn thành thí nghiệm!");

  }, [gameTime, levelData, gameState]);

  // Kiểm tra điều kiện thắng
  useEffect(() => {
    if (!isGameActive) return;

    if (levelData.winCondition(gameState)) {
      setIsGameActive(false);
      calculateScore();
    }
  }, [gameState, levelData, isGameActive, calculateScore]);


  // --- XỬ LÝ TƯƠNG TÁC ---
  const handleSliderChange = (e) => {
    setTargetTemp(parseFloat(e.target.value));
  };

  const resetLevel = (levelIdx) => {
    const newLevel = WATER_LAB_DATA[levelIdx];
    setLevelData(newLevel);
    setGameState(newLevel.initialState);
    setTargetTemp(20);
    setGameTime(0);
    setIsGameActive(true);
    setFinalScore(null);
    setMessage('');
  };

  const handleNextLevel = () => {
    const nextIndex = (currentLevelIndex + 1) % WATER_LAB_DATA.length;
    setCurrentLevelIndex(nextIndex);
    resetLevel(nextIndex);
  };

  const handleReset = () => {
    resetLevel(currentLevelIndex);
  };

  // --- TÍNH TOÁN HIỂN THỊ (VISUALS) ---
  const { waterHeight, iceHeight, totalFill, currentPhase } = useMemo(() => {
    const maxVolume = 200; // Cốc 200ml
    const waterH = (gameState.waterVolume / maxVolume) * 100;
    const iceH = (gameState.iceVolume / maxVolume) * 100;
    const totalH = Math.min(100, (waterH + iceH));

    let phase = "liquid"; // Mặc định
    if (gameState.iceVolume > 0 && gameState.waterVolume <= 0) phase = "solid";
    if (gameState.iceVolume > 0 && gameState.waterVolume > 0) phase = "melting";
    if (gameState.temperature >= 100 && gameState.waterVolume > 0) phase = "boiling";
    if (gameState.temperature <= 0 && gameState.waterVolume > 0) phase = "freezing";
    
    return { 
      waterHeight: waterH, 
      iceHeight: iceH, 
      totalFill: totalH,
      currentPhase: phase,
    };
  }, [gameState]);

  // Màu sắc của thanh nhiệt (từ lạnh sang nóng)
  const sliderColor = `linear-gradient(90deg, var(--cold-color) 0%, #FFF 33%, var(--heat-color) 100%)`;

  // Hiển thị intro nếu chưa bắt đầu
  if (showIntro) {
    return <GameIntro gameInfo={GAME_INTRO_DATA['lop6-4']} onStart={() => setShowIntro(false)} />;
  }

  return (
    <div className="water-lab-container">
      {/* --- MODAL HOÀN THÀNH --- */}
      {finalScore && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{message}</h2>
            <p>Điểm cơ bản: {finalScore.base}</p>
            <p>Thưởng thời gian: {finalScore.time}</p>
            <p>Thưởng hiệu suất: {finalScore.efficiency}</p>
            <h3>Tổng điểm: {finalScore.total}</h3>
            <div className="modal-buttons">
              <button onClick={handleReset}>Chơi lại</button>
              <button onClick={handleNextLevel}>Thí nghiệm tiếp</button>
            </div>
          </div>
        </div>
      )}

      {/* --- GIAO DIỆN CHÍNH --- */}
      <div className="lab-header">
        <h1>{levelData.title}</h1>
        <p className="goal-text">{levelData.goalText}</p>
        <div className="stats">
          <span>Thời gian: {gameTime.toFixed(1)}s</span>
        </div>
      </div>

      <div className="lab-main">
        <div className="beaker-area">
          {/* --- CỐC THÍ NGHIỆM --- */}
          <div className="beaker">
            {/* Nắp (cho màn 4) */}
            {gameState.isLidOn && (
              <div className="lid">
                <div className="condensed-drops">
                  {Math.floor(gameState.condensedDrops)} giọt
                </div>
              </div>
            )}

            {/* Phần chất lỏng/rắn */}
            <div 
              className={`substance ${currentPhase}`} 
              style={{ height: `${totalFill}%` }}
            >
              {/* Hiệu ứng sôi */}
              {currentPhase === 'boiling' && (
                <div className="bubbles">
                  <span></span><span></span><span></span><span></span>
                </div>
              )}
              {/* Hiệu ứng bay hơi */}
              {currentPhase === 'boiling' && !gameState.isLidOn && (
                 <div className="steam">
                  <span></span><span></span><span></span>
                </div>
              )}
            </div>
            
            {/* Các vạch chia ml */}
            <div className="beaker-marks">
              <span>- 200ml</span>
              <span>- 150ml</span>
              <span>- 100ml</span>
              <span>- 50ml</span>
            </div>
          </div>

          {/* --- NHIỆT KẾ --- */}
          <div className="thermometer">
            <div className="thermo-level" style={{ height: `${(gameState.temperature + 50) / 2}%` }}></div>
            <span className="thermo-reading">{gameState.temperature.toFixed(1)}°C</span>
          </div>
        </div>
      </div>

      {/* --- BẢNG ĐIỀU KHIỂN --- */}
      <div className="lab-controls">
        <div className="slider-wrapper">
          <span className="slider-icon">❄️</span>
          <input
            type="range"
            min="-50"
            max="150"
            value={targetTemp}
            onChange={handleSliderChange}
            className="temperature-slider"
            style={{ background: sliderColor }}
            disabled={!isGameActive}
          />
          <span className="slider-icon">🔥</span>
        </div>
        <span className="slider-label">Nhiệt độ mục tiêu: {targetTemp}°C</span>
      </div>
    </div>
  );
};

export default WaterLab;
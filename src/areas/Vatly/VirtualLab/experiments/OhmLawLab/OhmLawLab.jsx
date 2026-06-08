/**
 * OhmLawLab.jsx - Thí nghiệm Khảo sát định luật Ôm (ENHANCED R3F 3D)
 * 
 * Nâng cấp:
 * - React Three Fiber 3D scene
 * - 3D battery, resistor with color bands, wires
 * - Animated electron particles flowing through circuit
 * - Glowing wires proportional to current
 * - 3D gauges (Ammeter, Voltmeter)
 * - 3D lever switch
 * - OrbitControls
 * - Sound effects (click, buzz, zap)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  ArrowLeft, Play, Pause, RotateCcw, Save, HelpCircle, ChevronRight, ChevronLeft,
  BookOpen, Zap, Plus, Minus, Volume2, VolumeX
} from 'lucide-react';
import { OhmLaw, PhysicsUtils } from '../../core/PhysicsEngine';
import { ExperimentDataCollector } from '../../core/DataCollector';
import { Voltmeter, Ammeter } from '../../instruments/DigitalMeter';
import labSoundEngine from '../../core/LabSoundEngine';
import DataTable from '../../charts/DataTable';
import RealTimeChart from '../../charts/RealTimeChart';
import './OhmLawLab.css';

// ═══════════════ 3D COMPONENTS ═══════════════

// Lab table
function LabTable() {
  return (
    <group>
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[7, 0.15, 4]} />
        <meshStandardMaterial color="#2a1f14" roughness={0.7} metalness={0.1} />
      </mesh>
      {[[-3, -1.1, -1.6], [3, -1.1, -1.6], [-3, -1.1, 1.6], [3, -1.1, 1.6]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.06, 0.06, 1.9, 8]} />
          <meshStandardMaterial color="#444" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// Battery
function Battery3D({ voltage }) {
  return (
    <group position={[-2.5, 0.3, 0]}>
      {/* Battery body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.8, 16]} />
        <meshStandardMaterial color="#1a2744" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Positive terminal */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.12, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ff0000" emissiveIntensity={0.3} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Negative terminal */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.06, 8]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Label */}
      <Text position={[0.32, 0, 0]} rotation={[0, 0, -Math.PI / 2]} fontSize={0.12} color="#fbbf24" anchorX="center">
        {voltage}V
      </Text>
      {/* Body stripe */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.305, 0.305, 0.15, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.6} />
      </mesh>
    </group>
  );
}

// Resistor with color bands
function Resistor3D({ resistance, position, isOn }) {
  const glowIntensity = isOn ? 0.15 : 0;
  return (
    <group position={position}>
      {/* Ceramic body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.6, 16]} />
        <meshStandardMaterial color="#c4a882" roughness={0.8} metalness={0.1}
          emissive="#ffaa00" emissiveIntensity={glowIntensity} />
      </mesh>
      {/* Color bands */}
      {[-0.15, -0.05, 0.05, 0.18].map((z, i) => (
        <mesh key={i} position={[0, z, 0]}>
          <cylinderGeometry args={[0.155, 0.155, 0.04, 16]} />
          <meshStandardMaterial color={['#8b4513', '#000000', '#ff0000', '#ffd700'][i]}
            roughness={0.4} metalness={0.2} />
        </mesh>
      ))}
      {/* Leads */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Label */}
      <Text position={[0.2, 0, 0]} fontSize={0.1} color="#22c55e" anchorX="left">
        {resistance}Ω
      </Text>
    </group>
  );
}

// Gauge (Ammeter or Voltmeter)
function Gauge3D({ type, value, position }) {
  const color = type === 'A' ? '#3b82f6' : '#f59e0b';
  const bgColor = type === 'A' ? '#0f2647' : '#3d2a0a';
  
  return (
    <group position={position}>
      {/* Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.2, 24]} />
        <meshStandardMaterial color={bgColor} roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Face */}
      <mesh position={[0, 0.105, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.33, 24]} />
        <meshStandardMaterial color="#f0f0e8" roughness={0.8} />
      </mesh>
      {/* Rim */}
      <mesh position={[0, 0.11, 0]}>
        <torusGeometry args={[0.34, 0.02, 8, 24]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2}
          emissive={color} emissiveIntensity={0.2} />
      </mesh>
      {/* Label */}
      <Text position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.18}
        color={color} anchorX="center" anchorY="middle">
        {type}
      </Text>
      {/* Terminals */}
      <mesh position={[-0.15, -0.12, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.06, 8]} />
        <meshStandardMaterial color="#ef4444" metalness={0.9} />
      </mesh>
      <mesh position={[0.15, -0.12, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.06, 8]} />
        <meshStandardMaterial color="#333" metalness={0.9} />
      </mesh>
    </group>
  );
}

// Switch
function Switch3D({ isOn, position }) {
  const leverRef = useRef();
  
  useFrame((_, delta) => {
    if (!leverRef.current) return;
    const targetAngle = isOn ? 0 : -Math.PI / 4;
    leverRef.current.rotation.z += (targetAngle - leverRef.current.rotation.z) * 5 * delta;
  });

  return (
    <group position={position}>
      {/* Base */}
      <mesh>
        <boxGeometry args={[0.4, 0.06, 0.3]} />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Contact points */}
      <mesh position={[-0.12, 0.04, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.9} />
      </mesh>
      <mesh position={[0.12, 0.04, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.9} />
      </mesh>
      {/* Lever */}
      <group ref={leverRef} position={[-0.12, 0.04, 0]}>
        <mesh position={[0.12, 0.06, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.28, 0.03, 0.04]} />
          <meshStandardMaterial color={isOn ? '#22c55e' : '#9ca3af'} metalness={0.7} roughness={0.3}
            emissive={isOn ? '#22c55e' : '#000'} emissiveIntensity={isOn ? 0.3 : 0} />
        </mesh>
      </group>
    </group>
  );
}

// Wire segment as a tube
function Wire({ points, isOn, current }) {
  const curve = useMemo(() => {
    const vectors = points.map(p => new THREE.Vector3(...p));
    return new THREE.CatmullRomCurve3(vectors);
  }, [points]);

  const glowIntensity = isOn ? Math.min(0.4, current * 0.3) : 0;

  return (
    <mesh>
      <tubeGeometry args={[curve, 20, 0.025, 8, false]} />
      <meshStandardMaterial
        color={isOn ? '#fbbf24' : '#6b7280'}
        metalness={0.7}
        roughness={0.3}
        emissive={isOn ? '#ff8800' : '#000000'}
        emissiveIntensity={glowIntensity}
      />
    </mesh>
  );
}

// Electron particles flowing through circuit
function ElectronFlow({ isOn, current }) {
  const particlesRef = useRef();
  const electronCount = 20;
  const progressRef = useRef(new Float32Array(electronCount).fill(0).map((_, i) => i / electronCount));

  // Circuit path points
  const circuitPath = useMemo(() => {
    const pts = [
      [-2.5, 0.8, 0], [-2.5, 0.3, 0.6], [-1.5, 0.3, 0.8],
      [0, 0.3, 0.8], [1.0, 0.3, 0.8],
      [2.0, 0.3, 0.6], [2.5, 0.3, 0],
      [2.5, 0.3, -0.6], [1.5, 0.3, -0.8],
      [0, 0.3, -0.8], [-1.5, 0.3, -0.8],
      [-2.5, 0.3, -0.6], [-2.5, 0.3, 0],
    ];
    return new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), true);
  }, []);

  useFrame((_, delta) => {
    if (!particlesRef.current || !isOn) return;
    const positions = particlesRef.current.geometry.attributes.position;
    const speed = current * 0.15;

    for (let i = 0; i < electronCount; i++) {
      progressRef.current[i] = (progressRef.current[i] + speed * delta) % 1;
      const point = circuitPath.getPoint(progressRef.current[i]);
      positions.setXYZ(i, point.x, point.y, point.z);
    }
    positions.needsUpdate = true;
  });

  if (!isOn) return null;

  const initPositions = new Float32Array(electronCount * 3);
  for (let i = 0; i < electronCount; i++) {
    const pt = circuitPath.getPoint(i / electronCount);
    initPositions[i * 3] = pt.x;
    initPositions[i * 3 + 1] = pt.y;
    initPositions[i * 3 + 2] = pt.z;
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={electronCount} array={initPositions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#60a5fa" size={0.08} transparent opacity={0.9} sizeAttenuation
        depthWrite={false} />
    </points>
  );
}

// ═══════════════ MAIN 3D SCENE ═══════════════
function CircuitScene({ voltage, resistance, current, circuitOn }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 3]} intensity={1.0} castShadow />
      <pointLight position={[-2, 3, 1]} intensity={0.4} color="#ffe4b5" />
      <Environment preset="studio" />

      <OrbitControls enablePan={false} minDistance={3} maxDistance={12}
        minPolarAngle={0.2} maxPolarAngle={Math.PI / 2 + 0.1} target={[0, 0.2, 0]} />

      <LabTable />
      <Battery3D voltage={voltage} />
      <Resistor3D resistance={resistance} position={[1.5, 0.55, 0.8]} isOn={circuitOn} />
      <Gauge3D type="A" value={current} position={[2.3, 0.15, -0.5]} />
      <Gauge3D type="V" value={voltage} position={[-1.5, 0.15, -0.8]} />
      <Switch3D isOn={circuitOn} position={[0, 0.05, -0.8]} />

      {/* Circuit wires */}
      <Wire points={[[-2.5, 0.75, 0], [-2.5, 0.3, 0.5], [-0.5, 0.3, 0.8], [1.5, 0.55, 0.8]]}
        isOn={circuitOn} current={current} />
      <Wire points={[[1.5, 0.55, 0.8], [2.5, 0.3, 0.5], [2.3, 0.15, -0.5]]}
        isOn={circuitOn} current={current} />
      <Wire points={[[2.3, 0.15, -0.5], [1, 0.08, -0.8], [0.2, 0.05, -0.8]]}
        isOn={circuitOn} current={current} />
      <Wire points={[[0, 0.05, -0.8], [-1, 0.08, -0.8], [-2.5, 0.15, -0.5], [-2.5, -0.1, 0]]}
        isOn={circuitOn} current={current} />
      {/* Voltmeter parallel wires */}
      <Wire points={[[-2.5, 0.3, 0.2], [-2, 0.15, -0.5], [-1.5, 0.15, -0.8]]}
        isOn={circuitOn} current={0} />

      <ElectronFlow isOn={circuitOn} current={current} />

      {/* Power display */}
      {circuitOn && (
        <Text position={[0, 2.2, 0]} fontSize={0.18} color="#f472b6" anchorX="center">
          P = {(voltage * current).toFixed(3)} W
        </Text>
      )}
    </>
  );
}

// ═══════════════ MAIN COMPONENT ═══════════════
const OhmLawLab = () => {
  const navigate = useNavigate();
  const dataCollectorRef = useRef(null);
  const animationRef = useRef(null);

  const [experimentState, setExperimentState] = useState('setup');
  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0);
  const [showTheory, setShowTheory] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [circuitOn, setCircuitOn] = useState(false);

  const [voltage, setVoltage] = useState(6);
  const [resistance, setResistance] = useState(10);
  const [current, setCurrent] = useState(0);

  const [collectedData, setCollectedData] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    dataCollectorRef.current = new ExperimentDataCollector('Khảo sát định luật Ôm', [
      { name: 'trial', label: 'Lần đo', type: 'number' },
      { name: 'voltage', label: 'U (V)', type: 'number', unit: 'V' },
      { name: 'resistance', label: 'R (Ω)', type: 'number', unit: 'Ω' },
      { name: 'current', label: 'I (A)', type: 'number', unit: 'A' },
      { name: 'power', label: 'P (W)', type: 'number', unit: 'W' }
    ]);
    return () => { labSoundEngine.stopAll(); };
  }, []);

  const guideSteps = [
    { title: 'Thí nghiệm Định luật Ôm', content: 'Khảo sát mối quan hệ U, I, R. Xoay chuột để xem mạch điện 3D!' },
    { title: 'Bước 1: Thiết lập', content: 'Điều chỉnh nguồn U và điện trở R. Quan sát sơ đồ mạch 3D.' },
    { title: 'Bước 2: Đóng mạch', content: 'Nhấn công tắc để đóng mạch. Quan sát electron chạy trong dây!' },
    { title: 'Bước 3: Thu thập', content: 'Ghi lại U, R, I. Thay đổi U hoặc R và đo lại nhiều lần.' },
    { title: 'Bước 4: Phân tích', content: 'Xem đồ thị U-I. Độ dốc = R.' }
  ];

  useEffect(() => {
    if (circuitOn && resistance > 0) {
      setCurrent(OhmLaw.calculateCurrent(voltage, resistance));
    } else {
      setCurrent(0);
    }
  }, [voltage, resistance, circuitOn]);

  const toggleCircuit = () => {
    labSoundEngine.init();
    labSoundEngine.playClick();
    setCircuitOn(!circuitOn);
    if (!circuitOn) setExperimentState('running');
  };

  const resetExperiment = () => {
    setCircuitOn(false);
    setCurrent(0);
    setExperimentState('setup');
  };

  const recordData = () => {
    if (!circuitOn) { alert('Hãy đóng mạch trước!'); return; }
    labSoundEngine.playSuccess();
    const power = OhmLaw.calculatePower(voltage, current);
    const record = {
      trial: collectedData.length + 1,
      voltage: PhysicsUtils.round(voltage, 2),
      resistance: PhysicsUtils.round(resistance, 1),
      current: PhysicsUtils.round(current, 4),
      power: PhysicsUtils.round(power, 4)
    };
    if (dataCollectorRef.current) dataCollectorRef.current.addRecord(record);
    setCollectedData(prev => [...prev, record]);
    setChartData(prev => [...prev, { voltage, current }]);
  };

  const clearData = () => { setCollectedData([]); setChartData([]); if (dataCollectorRef.current) dataCollectorRef.current.clearData(); };
  const toggleSound = () => { labSoundEngine.init(); setSoundEnabled(labSoundEngine.toggle()); };

  const calculateStats = () => {
    if (chartData.length < 2) return null;
    const n = chartData.length;
    const sumUI = chartData.reduce((s, d) => s + d.voltage * d.current, 0);
    const sumI2 = chartData.reduce((s, d) => s + d.current * d.current, 0);
    const calculatedR = sumI2 > 0 ? sumUI / sumI2 : 0;
    return { calculatedR: PhysicsUtils.round(calculatedR, 2), dataPoints: n };
  };
  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="ohm-header">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/vatly/virtual-lab')} className="p-2 hover:bg-white/10 rounded-lg transition-all">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <span className="header-emoji">⚡</span> Thí nghiệm: Định luật Ôm
              </h1>
              <p className="text-gray-400 text-sm">Xác minh I = U/R • 3D Interactive</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleSound} className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-all">
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button onClick={() => setShowTheory(!showTheory)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${showTheory ? 'bg-purple-600 shadow-lg shadow-purple-600/30' : 'bg-gray-700/50 hover:bg-gray-600/50'}`}>
              <BookOpen size={18} /><span className="hidden sm:inline">Lý thuyết</span>
            </button>
            <button onClick={() => setShowGuide(true)} className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all">
              <HelpCircle size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto p-4 gap-4">
        {/* 3D Canvas */}
        <div className="flex-1">
          <div className="ohm-canvas-container">
            <div className="relative" style={{ height: '400px' }}>
              <Canvas camera={{ position: [0, 5, 6], fov: 40 }} shadows>
                <CircuitScene voltage={voltage} resistance={resistance} current={current} circuitOn={circuitOn} />
              </Canvas>

              <div className="absolute top-3 left-3 badge-3d">🎮 3D • Kéo chuột để xoay</div>

              {/* Meters overlay */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <Voltmeter value={circuitOn ? voltage : 0} precision={1} size="small" />
                <Ammeter value={current} precision={3} size="small" />
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button onClick={toggleCircuit}
                  className={`ohm-toggle-btn ${circuitOn ? 'ohm-toggle-on' : 'ohm-toggle-off'}`}>
                  {circuitOn ? <Pause size={18} /> : <Zap size={18} />}
                  {circuitOn ? 'Ngắt mạch' : 'Đóng mạch'}
                </button>
                {circuitOn && (
                  <button onClick={recordData} className="ohm-record-btn">
                    <Save size={18} /> Ghi số liệu
                  </button>
                )}
                <button onClick={resetExperiment} className="ohm-reset-btn">
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>

            {/* Parameters */}
            <div className="p-4 border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Điều chỉnh thông số</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Hiệu điện thế U (V)</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setVoltage(v => Math.max(1, v - 1))} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"><Minus size={16} /></button>
                    <input type="range" min="1" max="12" step="0.5" value={voltage}
                      onChange={(e) => setVoltage(parseFloat(e.target.value))} className="flex-1 accent-blue-500" />
                    <button onClick={() => setVoltage(v => Math.min(12, v + 1))} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"><Plus size={16} /></button>
                  </div>
                  <div className="text-center text-xl font-mono text-yellow-400 mt-1 param-value">{voltage.toFixed(1)} V</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Điện trở R (Ω)</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setResistance(r => Math.max(1, r - 1))} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"><Minus size={16} /></button>
                    <input type="range" min="1" max="50" step="1" value={resistance}
                      onChange={(e) => setResistance(parseFloat(e.target.value))} className="flex-1 accent-green-500" />
                    <button onClick={() => setResistance(r => Math.min(50, r + 1))} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"><Plus size={16} /></button>
                  </div>
                  <div className="text-center text-xl font-mono text-green-400 mt-1 param-value">{resistance} Ω</div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-4">
            <RealTimeChart data={chartData} xKey="current" yKey="voltage"
              xLabel="Cường độ I" yLabel="Hiệu điện thế U" xUnit="A" yUnit="V"
              title="Đồ thị U-I (Đặc tuyến Vôn-Ampe)" lineColor="#f59e0b" pointColor="#22c55e" height={200} />
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:w-96 space-y-4">
          <div className="ohm-results-card">
            <h3 className="text-lg font-bold text-white mb-3">📐 Giá trị đo</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="result-value-box">
                <div className="text-2xl font-mono text-yellow-400">{voltage.toFixed(1)}</div>
                <div className="text-xs text-gray-400">U (V)</div>
              </div>
              <div className="result-value-box">
                <div className="text-2xl font-mono text-blue-400">{current.toFixed(3)}</div>
                <div className="text-xs text-gray-400">I (A)</div>
              </div>
              <div className="result-value-box">
                <div className="text-2xl font-mono text-green-400">{resistance}</div>
                <div className="text-xs text-gray-400">R (Ω)</div>
              </div>
            </div>
            {circuitOn && (
              <div className="mt-3 p-2 bg-black/30 rounded-lg text-center text-sm">
                <span className="text-gray-400">I = U/R = </span>
                <span className="text-white font-mono">{voltage}/{resistance} = {(voltage/resistance).toFixed(4)} A</span>
                <span className="ml-2 text-green-400">✓</span>
              </div>
            )}
          </div>

          {stats && (
            <div className="ohm-stats-card">
              <h3 className="text-lg font-bold text-white mb-3">📊 Phân tích</h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-gray-300">Số điểm:</span><span className="font-mono text-blue-400">{stats.dataPoints}</span></div>
                <div className="flex justify-between"><span className="text-gray-300">R từ đồ thị:</span><span className="font-mono text-green-400 font-bold">{stats.calculatedR} Ω</span></div>
              </div>
            </div>
          )}

          <DataTable columns={[
            { name: 'trial', label: '#', type: 'number' },
            { name: 'voltage', label: 'U(V)', type: 'number', precision: 1 },
            { name: 'resistance', label: 'R(Ω)', type: 'number', precision: 0 },
            { name: 'current', label: 'I(A)', type: 'number', precision: 3 }
          ]} data={collectedData} onClearAll={clearData}
            onExport={() => dataCollectorRef.current?.downloadCSV()}
            onDeleteRecord={(id) => { setCollectedData(prev => prev.filter(d => d.trial !== id)); setChartData(prev => prev.filter((_, i) => i !== id - 1)); }}
            maxHeight={200} />

          <div className="ohm-formula-card">
            <h3 className="text-sm font-medium text-gray-400 mb-2">📐 Định luật Ôm</h3>
            <div className="ohm-formula-display">
              <p className="text-xl font-mono text-blue-400">I = U / R</p>
              <p className="text-sm text-gray-500 mt-1">U = I × R | R = U / I</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3 modal-emoji">⚡</div>
              <h2 className="text-xl font-bold">{guideSteps[guideStep].title}</h2>
            </div>
            <p className="text-gray-300 text-center mb-6">{guideSteps[guideStep].content}</p>
            <div className="flex justify-center gap-2 mb-6">
              {guideSteps.map((_, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i === guideStep ? 'bg-blue-500 scale-125' : 'bg-gray-600'}`} />
              ))}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setGuideStep(Math.max(0, guideStep - 1))} disabled={guideStep === 0}
                className="flex items-center gap-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg">
                <ChevronLeft size={18} /> Trước
              </button>
              {guideStep === guideSteps.length - 1 ? (
                <button onClick={() => setShowGuide(false)} className="px-5 py-2 bg-yellow-600 hover:bg-blue-500 rounded-lg shadow-lg shadow-yellow-600/30">Bắt đầu</button>
              ) : (
                <button onClick={() => setGuideStep(guideStep + 1)} className="flex items-center gap-1 px-4 py-2 bg-yellow-600 hover:bg-blue-500 rounded-lg">Tiếp <ChevronRight size={18} /></button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Theory Modal */}
      {showTheory && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">📚 Định luật Ôm</h2>
              <button onClick={() => setShowTheory(false)} className="p-2 hover:bg-gray-700 rounded-lg">✕</button>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Phát biểu</h3>
                <p>Cường độ dòng điện qua dây dẫn tỉ lệ thuận với hiệu điện thế U và tỉ lệ nghịch với điện trở R.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Công thức</h3>
                <div className="bg-gray-900/80 p-4 rounded-lg text-center border border-gray-700/50">
                  <p className="text-2xl font-mono text-blue-400">I = U / R</p>
                  <p className="text-sm mt-2 text-gray-400">U = I × R &nbsp;|&nbsp; R = U / I</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Đồ thị U-I</h3>
                <p>Đồ thị U-I là đường thẳng qua gốc tọa độ. Hệ số góc = R.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OhmLawLab;


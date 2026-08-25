/**
 * ResistorCircuitLab.jsx - Thí nghiệm Mạch điện trở nối tiếp/song song (ENHANCED R3F 3D)
 * 
 * Nâng cấp:
 * - React Three Fiber 3D scene
 * - 3D breadboard, resistors with color bands
 * - Animated electron flow with different paths for series vs parallel
 * - Camera transition when switching circuit type
 * - Sound effects
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  ArrowLeft, RotateCcw, Save, HelpCircle, ChevronRight, ChevronLeft,
  BookOpen, Zap, Volume2, VolumeX
} from 'lucide-react';
import { OhmLaw, PhysicsUtils } from '../../core/PhysicsEngine';
import { ExperimentDataCollector } from '../../core/DataCollector';
import { Voltmeter, Ammeter, Ohmmeter } from '../../instruments/DigitalMeter';
import labSoundEngine from '../../core/LabSoundEngine';
import DataTable from '../../charts/DataTable';
import './ResistorCircuitLab.css';

// ═══════════════ 3D COMPONENTS ═══════════════

function LabTable() {
  return (
    <group>
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[8, 0.12, 4.5]} />
        <meshStandardMaterial color="#2a1f14" roughness={0.7} metalness={0.1} />
      </mesh>
      {[[-3.5, -1.1, -1.8], [3.5, -1.1, -1.8], [-3.5, -1.1, 1.8], [3.5, -1.1, 1.8]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.06, 0.06, 1.9, 8]} />
          <meshStandardMaterial color="#444" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Battery3D({ voltage, position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.7, 16]} />
        <meshStandardMaterial color="#1a2744" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.1, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ff0000" emissiveIntensity={0.3} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.38, 0]}>
        <cylinderGeometry args={[0.10, 0.10, 0.05, 8]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.255, 0.255, 0.12, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.6} />
      </mesh>
      <Text position={[0.28, 0, 0]} rotation={[0, 0, -Math.PI / 2]} fontSize={0.1} color="#fbbf24" anchorX="center">
        {voltage}V
      </Text>
    </group>
  );
}

function Resistor3D({ value, position, rotation, isOn, label }) {
  const glow = isOn ? 0.12 : 0;
  const colors = ['#8b4513', '#000', '#ff0000', '#ffd700'];
  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.5, 16]} />
        <meshStandardMaterial color="#c4a882" roughness={0.8} metalness={0.1}
          emissive="#ffaa00" emissiveIntensity={glow} />
      </mesh>
      {[-0.12, -0.04, 0.04, 0.14].map((z, i) => (
        <mesh key={i} position={[0, z, 0]}>
          <cylinderGeometry args={[0.125, 0.125, 0.03, 16]} />
          <meshStandardMaterial color={colors[i]} roughness={0.4} metalness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.38, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
      </mesh>
      <Text position={[0.18, 0, 0]} fontSize={0.09} color="#22c55e" anchorX="left">
        {label || `${value}Ω`}
      </Text>
    </group>
  );
}

function Gauge3D({ type, position }) {
  const color = type === 'A' ? '#3b82f6' : type === 'V' ? '#f59e0b' : '#22c55e';
  const bg = type === 'A' ? '#0f2647' : type === 'V' ? '#3d2a0a' : '#0a3d1a';
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.15, 24]} />
        <meshStandardMaterial color={bg} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.26, 24]} />
        <meshStandardMaterial color="#f0f0e8" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.085, 0]}>
        <torusGeometry args={[0.27, 0.015, 8, 24]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <Text position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.15} color={color} anchorX="center" anchorY="middle">
        {type}
      </Text>
    </group>
  );
}

function Wire({ points, isOn, current }) {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  }, [points]);
  const glow = isOn ? Math.min(0.35, (current || 0) * 0.25) : 0;
  return (
    <mesh>
      <tubeGeometry args={[curve, 16, 0.02, 8, false]} />
      <meshStandardMaterial color={isOn ? '#fbbf24' : '#6b7280'} metalness={0.7} roughness={0.3}
        emissive={isOn ? '#ff8800' : '#000'} emissiveIntensity={glow} />
    </mesh>
  );
}

function ElectronFlow({ isOn, current, pathPoints }) {
  const particlesRef = useRef();
  const count = 15;
  const progressRef = useRef(new Float32Array(count).fill(0).map((_, i) => i / count));

  const path = useMemo(() => {
    if (!pathPoints || pathPoints.length < 2) return null;
    return new THREE.CatmullRomCurve3(pathPoints.map(p => new THREE.Vector3(...p)), false);
  }, [pathPoints]);

  useFrame((_, delta) => {
    if (!particlesRef.current || !isOn || !path) return;
    const positions = particlesRef.current.geometry.attributes.position;
    const speed = Math.min(0.5, (current || 0.1) * 0.12);
    for (let i = 0; i < count; i++) {
      progressRef.current[i] = (progressRef.current[i] + speed * delta) % 1;
      const pt = path.getPoint(progressRef.current[i]);
      positions.setXYZ(i, pt.x, pt.y, pt.z);
    }
    positions.needsUpdate = true;
  });

  if (!isOn || !path) return null;

  const init = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const pt = path.getPoint(i / count);
    init[i * 3] = pt.x; init[i * 3 + 1] = pt.y; init[i * 3 + 2] = pt.z;
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={init} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#60a5fa" size={0.06} transparent opacity={0.9} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// ═══════════════ CIRCUIT SCENES ═══════════════
function SeriesCircuit({ resistors, isOn, current, voltage }) {
  const spacing = 1.6;
  const n = resistors.length;
  const startX = -(n - 1) * spacing / 2;

  return (
    <group>
      {/* Battery on left */}
      <Battery3D voltage={voltage} position={[-n * spacing / 2 - 1, 0.4, 0]} />
      
      {/* Resistors in series */}
      {resistors.map((r, i) => (
        <Resistor3D key={i} value={r} position={[startX + i * spacing, 0.6, 0.8]}
          isOn={isOn} label={`R${i + 1}=${r}Ω`} />
      ))}
      
      {/* Ammeter on right */}
      <Gauge3D type="A" position={[n * spacing / 2, 0.12, -0.6]} />

      {/* Top wire: battery → R1 → R2 → ... */}
      <Wire points={[
        [-n * spacing / 2 - 1, 0.75, 0],
        [-n * spacing / 2 - 0.5, 0.3, 0.5],
        [startX - 0.3, 0.3, 0.8],
        ...resistors.map((_, i) => [startX + i * spacing, 0.6, 0.8]).flat().reduce((acc, _, j, arr) => {
          if (j % 3 === 0) acc.push([arr[j], arr[j + 1], arr[j + 2]]);
          return acc;
        }, []),
        [startX + (n - 1) * spacing + 0.5, 0.3, 0.5],
        [n * spacing / 2, 0.3, 0],
      ].filter(Boolean)} isOn={isOn} current={current} />

      {/* Bottom return wire */}
      <Wire points={[
        [n * spacing / 2, 0.12, -0.6],
        [n * spacing / 2 - 0.3, 0.1, -0.8],
        [0, 0.08, -0.8],
        [-n * spacing / 2, 0.1, -0.8],
        [-n * spacing / 2 - 1, 0.05, 0],
      ]} isOn={isOn} current={current} />

      {/* Electron flow along main path */}
      <ElectronFlow isOn={isOn} current={current} pathPoints={[
        [-n * spacing / 2 - 1, 0.75, 0],
        [-n * spacing / 2 - 0.5, 0.3, 0.5],
        ...resistors.map((_, i) => [startX + i * spacing, 0.6, 0.8]),
        [n * spacing / 2, 0.3, 0],
        [n * spacing / 2, 0.12, -0.6],
        [0, 0.08, -0.8],
        [-n * spacing / 2 - 1, 0.05, 0],
      ]} />

      {/* Info labels */}
      <Text position={[0, 2.0, 0]} fontSize={0.15} color="#e2e8f0" anchorX="center">Mạch Nối Tiếp</Text>
    </group>
  );
}

function ParallelCircuit({ resistors, isOn, current, currents, voltage }) {
  const spacing = 1.4;
  const n = resistors.length;

  return (
    <group>
      {/* Battery on left */}
      <Battery3D voltage={voltage} position={[-2.8, 0.4, 0]} />
      
      {/* Resistors in parallel branches */}
      {resistors.map((r, i) => {
        const z = (i - (n - 1) / 2) * spacing;
        return (
          <group key={i}>
            <Resistor3D value={r} position={[0, 0.6, z]} isOn={isOn} label={`R${i + 1}=${r}Ω`} />
            {/* Branch wires */}
            <Wire points={[[-1.5, 0.3, z], [-0.3, 0.35, z], [0, 0.6, z]]} isOn={isOn} current={currents[i]} />
            <Wire points={[[0, 0.6, z], [0.3, 0.35, z], [1.5, 0.3, z]]} isOn={isOn} current={currents[i]} />
            {/* Branch electron flow */}
            <ElectronFlow isOn={isOn} current={currents[i]} pathPoints={[
              [-1.5, 0.3, z], [0, 0.6, z], [1.5, 0.3, z],
            ]} />
            {/* Current label per branch */}
            {isOn && (
              <Text position={[0, 1.1, z]} fontSize={0.09} color="#f472b6" anchorX="center">
                I{i + 1}={PhysicsUtils.round(currents[i], 3)}A
              </Text>
            )}
          </group>
        );
      })}

      {/* Top bus wire */}
      <Wire points={[[-2.8, 0.75, 0], [-2, 0.3, 0], [-1.5, 0.3, 0]]} isOn={isOn} current={current} />
      {/* Bottom bus wire */}
      <Wire points={[[1.5, 0.3, 0], [2, 0.3, 0], [2.5, 0.12, -0.5]]} isOn={isOn} current={current} />
      {/* Return wire */}
      <Wire points={[[2.5, 0.12, -0.5], [1, 0.08, -1.2], [-1, 0.08, -1.2], [-2.8, 0.05, 0]]}
        isOn={isOn} current={current} />
      
      {/* Ammeter */}
      <Gauge3D type="A" position={[2.5, 0.12, -0.5]} />

      <Text position={[0, 2.0, 0]} fontSize={0.15} color="#e2e8f0" anchorX="center">Mạch Song Song</Text>
    </group>
  );
}

// ═══════════════ MAIN 3D SCENE ═══════════════
function CircuitScene({ circuitType, resistors, voltage, isOn, current, currents }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 3]} intensity={1.0} castShadow />
      <pointLight position={[-2, 3, 2]} intensity={0.4} color="#ffe4b5" />
      <Environment preset="studio" />

      <OrbitControls enablePan={false} minDistance={3} maxDistance={14}
        minPolarAngle={0.2} maxPolarAngle={Math.PI / 2 + 0.1} target={[0, 0.3, 0]} />

      <LabTable />

      {circuitType === 'series' ? (
        <SeriesCircuit resistors={resistors} isOn={isOn} current={current} voltage={voltage} />
      ) : (
        <ParallelCircuit resistors={resistors} isOn={isOn} current={current} currents={currents} voltage={voltage} />
      )}
    </>
  );
}

// ═══════════════ MAIN COMPONENT ═══════════════
const ResistorCircuitLab = () => {
  const navigate = useNavigate();
  const dataCollectorRef = useRef(null);

  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0);
  const [showTheory, setShowTheory] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [circuitOn, setCircuitOn] = useState(false);
  const [circuitType, setCircuitType] = useState('series');
  const [voltage, setVoltage] = useState(12);
  const [r1, setR1] = useState(10);
  const [r2, setR2] = useState(20);
  const [r3, setR3] = useState(30);
  const [numResistors, setNumResistors] = useState(2);

  const [totalResistance, setTotalResistance] = useState(0);
  const [current, setCurrent] = useState(0);
  const [voltages, setVoltages] = useState([0, 0, 0]);
  const [currents, setCurrents] = useState([0, 0, 0]);
  const [collectedData, setCollectedData] = useState([]);

  useEffect(() => {
    dataCollectorRef.current = new ExperimentDataCollector('Mạch điện trở', [
      { name: 'trial', label: 'Lần đo', type: 'number' },
      { name: 'type', label: 'Loại mạch', type: 'string' },
      { name: 'R1', label: 'R₁ (Ω)', type: 'number', unit: 'Ω' },
      { name: 'R2', label: 'R₂ (Ω)', type: 'number', unit: 'Ω' },
      { name: 'R3', label: 'R₃ (Ω)', type: 'number', unit: 'Ω' },
      { name: 'Rtd', label: 'R_tđ (Ω)', type: 'number', unit: 'Ω' },
      { name: 'I', label: 'I (A)', type: 'number', unit: 'A' }
    ]);
    return () => { labSoundEngine.stopAll(); };
  }, []);

  const guideSteps = [
    { title: 'Thí nghiệm Mạch điện trở', content: 'Khảo sát R_tđ nối tiếp/song song. Xoay 3D để xem mạch!' },
    { title: 'Bước 1: Chọn mạch', content: 'Chọn nối tiếp hoặc song song, điều chỉnh R₁, R₂, R₃.' },
    { title: 'Bước 2: Đóng mạch', content: 'Nhấn công tắc, quan sát electron chạy qua các nhánh.' },
    { title: 'Bước 3: Quan sát', content: 'Nối tiếp: I chung, U chia. Song song: U chung, I chia.' },
    { title: 'Bước 4: Xác minh', content: 'So sánh R_tđ đo được với lý thuyết. Ghi số liệu phân tích.' }
  ];

  const resistors = useMemo(() => numResistors === 3 ? [r1, r2, r3] : [r1, r2], [r1, r2, r3, numResistors]);

  // Calculate circuit values
  useEffect(() => {
    let Rtd, I, Us, Is;
    if (circuitType === 'series') {
      Rtd = resistors.reduce((s, r) => s + r, 0);
      I = circuitOn ? voltage / Rtd : 0;
      Us = resistors.map(r => I * r);
      Is = resistors.map(() => I);
    } else {
      const invRtd = resistors.reduce((s, r) => s + 1 / r, 0);
      Rtd = 1 / invRtd;
      I = circuitOn ? voltage / Rtd : 0;
      Us = resistors.map(() => circuitOn ? voltage : 0);
      Is = resistors.map(r => circuitOn ? voltage / r : 0);
    }
    setTotalResistance(Rtd);
    setCurrent(I);
    setVoltages(Us);
    setCurrents(Is);
  }, [circuitType, voltage, resistors, circuitOn]);

  const toggleCircuit = () => { labSoundEngine.init(); labSoundEngine.playClick(); setCircuitOn(!circuitOn); };
  const resetExperiment = () => { setCircuitOn(false); setCircuitType('series'); setVoltage(12); setR1(10); setR2(20); setR3(30); setNumResistors(2); };
  const toggleSound = () => { labSoundEngine.init(); setSoundEnabled(labSoundEngine.toggle()); };

  const recordData = () => {
    if (!circuitOn) { alert('Hãy đóng mạch trước!'); return; }
    labSoundEngine.playSuccess();
    const record = {
      trial: collectedData.length + 1,
      type: circuitType === 'series' ? 'Nối tiếp' : 'Song song',
      R1: r1, R2: r2, R3: numResistors === 3 ? r3 : '-',
      Rtd: PhysicsUtils.round(totalResistance, 2),
      I: PhysicsUtils.round(current, 4)
    };
    if (dataCollectorRef.current) dataCollectorRef.current.addRecord(record);
    setCollectedData(prev => [...prev, record]);
  };

  const clearData = () => { setCollectedData([]); if (dataCollectorRef.current) dataCollectorRef.current.clearData(); };

  const getTheoreticalFormula = () => {
    if (circuitType === 'series') {
      return `${resistors.join(' + ')} = ${resistors.reduce((a, b) => a + b, 0)} Ω`;
    } else {
      const invSum = resistors.reduce((s, r) => s + 1 / r, 0);
      return `1/(${resistors.map(r => `1/${r}`).join(' + ')}) = ${PhysicsUtils.round(1 / invSum, 2)} Ω`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="resistor-header">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/vatly/virtual-lab')} className="p-2 hover:bg-white/10 rounded-lg transition-all"><ArrowLeft size={24} /></button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2"><span className="header-emoji">🔌</span> Thí nghiệm: Mạch điện nối tiếp và song song</h1>
              <p className="text-gray-400 text-sm">Nối tiếp & Song song • 3D Interactive</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleSound} className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-all">
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button onClick={() => setShowTheory(!showTheory)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${showTheory ? 'bg-purple-600' : 'bg-gray-700/50 hover:bg-gray-600/50'}`}>
              <BookOpen size={18} /><span className="hidden sm:inline">Lý thuyết</span>
            </button>
            <button onClick={() => setShowGuide(true)} className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all"><HelpCircle size={18} /></button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto p-4 gap-4">
        <div className="flex-1">
          <div className="resistor-canvas-container">
            <div className="relative" style={{ height: '400px' }}>
              <Canvas camera={{ position: [0, 5, 7], fov: 38 }} shadows>
                <CircuitScene circuitType={circuitType} resistors={resistors} voltage={voltage}
                  isOn={circuitOn} current={current} currents={currents} />
              </Canvas>

              <div className="absolute top-3 left-3 badge-3d">🎮 3D • Kéo chuột để xoay</div>

              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <Voltmeter value={circuitOn ? voltage : 0} precision={1} size="small" />
                <Ammeter value={current} precision={4} size="small" />
                <Ohmmeter value={totalResistance} precision={2} size="small" />
              </div>

              <div className="absolute bottom-4 left-4 flex gap-2">
                <button onClick={toggleCircuit}
                  className={`resistor-toggle-btn ${circuitOn ? 'resistor-toggle-on' : 'resistor-toggle-off'}`}>
                  <Zap size={18} /> {circuitOn ? 'Ngắt mạch' : 'Đóng mạch'}
                </button>
                {circuitOn && (
                  <button onClick={recordData} className="resistor-record-btn"><Save size={18} /> Ghi số liệu</button>
                )}
                <button onClick={resetExperiment} className="resistor-reset-btn"><RotateCcw size={18} /></button>
              </div>
            </div>

            <div className="p-4 border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-4 mb-4">
                <button onClick={() => { setCircuitType('series'); setCircuitOn(false); }} disabled={circuitOn}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${circuitType === 'series' ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-gray-700 hover:bg-gray-600'} disabled:opacity-50`}>
                  🔗 Nối tiếp
                </button>
                <button onClick={() => { setCircuitType('parallel'); setCircuitOn(false); }} disabled={circuitOn}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${circuitType === 'parallel' ? 'bg-green-600 shadow-lg shadow-green-600/30' : 'bg-gray-700 hover:bg-gray-600'} disabled:opacity-50`}>
                  ⚡ Song song
                </button>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-gray-400 text-sm">Số R:</span>
                  {[2, 3].map(n => (
                    <button key={n} onClick={() => { setNumResistors(n); setCircuitOn(false); }} disabled={circuitOn}
                      className={`px-3 py-1 rounded transition-all ${numResistors === n ? 'bg-yellow-600 shadow-lg shadow-yellow-600/30' : 'bg-gray-700'} disabled:opacity-50`}>{n}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">U (V)</label>
                  <input type="range" min="3" max="24" step="1" value={voltage}
                    onChange={(e) => setVoltage(parseInt(e.target.value))} disabled={circuitOn} className="w-full accent-blue-500" />
                  <div className="text-center text-lg font-mono text-yellow-400 param-value">{voltage} V</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">R₁ (Ω)</label>
                  <input type="range" min="5" max="100" step="5" value={r1}
                    onChange={(e) => setR1(parseInt(e.target.value))} disabled={circuitOn} className="w-full accent-green-500" />
                  <div className="text-center text-lg font-mono text-green-400 param-value">{r1} Ω</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">R₂ (Ω)</label>
                  <input type="range" min="5" max="100" step="5" value={r2}
                    onChange={(e) => setR2(parseInt(e.target.value))} disabled={circuitOn} className="w-full accent-blue-500" />
                  <div className="text-center text-lg font-mono text-blue-400 param-value">{r2} Ω</div>
                </div>
                {numResistors === 3 && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">R₃ (Ω)</label>
                    <input type="range" min="5" max="100" step="5" value={r3}
                      onChange={(e) => setR3(parseInt(e.target.value))} disabled={circuitOn} className="w-full accent-purple-500" />
                    <div className="text-center text-lg font-mono text-purple-400 param-value">{r3} Ω</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-96 space-y-4">
          <div className="resistor-results-card">
            <h3 className="text-lg font-bold text-white mb-3">📊 Kết quả</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="result-value-box">
                <div className="text-2xl font-mono text-yellow-400">{PhysicsUtils.round(totalResistance, 2)}</div>
                <div className="text-xs text-gray-400">R_tđ (Ω)</div>
              </div>
              <div className="result-value-box">
                <div className="text-2xl font-mono text-blue-400">{PhysicsUtils.round(current, 4)}</div>
                <div className="text-xs text-gray-400">I (A)</div>
              </div>
            </div>
            <div className="result-value-box">
              <p className="text-sm text-gray-400 mb-1">Công thức:</p>
              <p className="text-sm font-mono text-green-400">R_tđ = {getTheoreticalFormula()}</p>
            </div>
          </div>

          <DataTable columns={[
            { name: 'trial', label: '#', type: 'number' },
            { name: 'type', label: 'Loại', type: 'string' },
            { name: 'Rtd', label: 'R_tđ', type: 'number' },
            { name: 'I', label: 'I', type: 'number', precision: 3 }
          ]} data={collectedData} onClearAll={clearData}
            onExport={() => dataCollectorRef.current?.downloadCSV()}
            onDeleteRecord={(id) => setCollectedData(prev => prev.filter(d => d.trial !== id))} maxHeight={150} />

          <div className="resistor-formula-card">
            <h3 className="text-sm font-medium text-gray-400 mb-2">📐 Công thức</h3>
            <div className="resistor-formula-display space-y-3">
              <div>
                <p className="text-xs text-blue-400 mb-1">Nối tiếp:</p>
                <p className="text-lg font-mono text-blue-300">R_tđ = R₁ + R₂ + R₃</p>
                <p className="text-xs text-gray-500">I chung, U = U₁ + U₂ + U₃</p>
              </div>
              <div>
                <p className="text-xs text-green-400 mb-1">Song song:</p>
                <p className="text-sm font-mono text-green-300">1/R_tđ = 1/R₁ + 1/R₂ + 1/R₃</p>
                <p className="text-xs text-gray-500">U chung, I = I₁ + I₂ + I₃</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3 modal-emoji">🔌</div>
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
              <h2 className="text-xl font-bold">📚 Mạch điện trở</h2>
              <button onClick={() => setShowTheory(false)} className="p-2 hover:bg-gray-700 rounded-lg">✕</button>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Nối tiếp</h3>
                <div className="bg-gray-900/80 p-3 rounded-lg text-center border border-gray-700/50">
                  <p className="text-lg font-mono text-blue-400">R_tđ = R₁ + R₂ + ... + Rₙ</p>
                </div>
                <p className="text-sm mt-1">I chung, U tổng = tổng U các điện trở</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Song song</h3>
                <div className="bg-gray-900/80 p-3 rounded-lg text-center border border-gray-700/50">
                  <p className="text-lg font-mono text-green-400">1/R_tđ = 1/R₁ + 1/R₂ + ... + 1/Rₙ</p>
                </div>
                <p className="text-sm mt-1">U chung, I tổng = tổng I các nhánh</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResistorCircuitLab;


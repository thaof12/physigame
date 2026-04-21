/**
 * CalorimeterLab.jsx - Thí nghiệm Nhiệt lượng kế (ENHANCED R3F 3D)
 * 
 * Nâng cấp:
 * - React Three Fiber 3D scene
 * - Transparent glass calorimeter 
 * - Animated water with fresnel
 * - Metallic sample with glow
 * - Fire/steam particles
 * - OrbitControls cho xoay 360°
 * - Sound effects
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { 
  ArrowLeft, Play, RotateCcw, Save, HelpCircle, ChevronRight, ChevronLeft,
  BookOpen, Thermometer, Droplets, Volume2, VolumeX
} from 'lucide-react';
import { Thermodynamics, PhysicsUtils } from '../../core/PhysicsEngine';
import { ExperimentDataCollector } from '../../core/DataCollector';
import labSoundEngine from '../../core/LabSoundEngine';
import DataTable from '../../charts/DataTable';
import RealTimeChart from '../../charts/RealTimeChart';
import './CalorimeterLab.css';

// ═══════════════ CONSTANTS ═══════════════
const MATERIALS = {
  aluminum: { name: 'Nhôm', c: 880, color: '#b0b8c4', metalness: 0.8 },
  copper: { name: 'Đồng', c: 380, color: '#d4883a', metalness: 0.95 },
  iron: { name: 'Sắt', c: 460, color: '#707882', metalness: 0.85 },
  lead: { name: 'Chì', c: 130, color: '#505862', metalness: 0.7 },
  unknown: { name: 'Chất X', c: 500, color: '#7c5cbf', metalness: 0.6 }
};

// ═══════════════ 3D COMPONENTS ═══════════════

// Glass Calorimeter
function Calorimeter() {
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#88aacc',
    transparent: true,
    opacity: 0.15,
    roughness: 0.05,
    metalness: 0.0,
    transmission: 0.85,
    thickness: 0.3,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    side: THREE.DoubleSide,
  }), []);

  const outerMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#334455',
    roughness: 0.3,
    metalness: 0.6,
  }), []);

  return (
    <group position={[0, 0, 0]}>
      {/* Outer insulation shell */}
      <mesh position={[0, 0.8, 0]} material={outerMat}>
        <cylinderGeometry args={[1.15, 1.2, 1.7, 32, 1, true]} />
      </mesh>
      {/* Bottom plate */}
      <mesh position={[0, -0.05, 0]} material={outerMat}>
        <cylinderGeometry args={[1.2, 1.25, 0.12, 32]} />
      </mesh>
      {/* Inner glass container */}
      <mesh position={[0, 0.85, 0]} material={glassMat}>
        <cylinderGeometry args={[0.9, 0.92, 1.6, 32, 1, true]} />
      </mesh>
      {/* Glass bottom */}
      <mesh position={[0, 0.05, 0]} material={glassMat}>
        <cylinderGeometry args={[0.92, 0.92, 0.05, 32]} />
      </mesh>
      {/* Rim highlight */}
      <mesh position={[0, 1.65, 0]}>
        <torusGeometry args={[1.0, 0.04, 8, 32]} />
        <meshStandardMaterial color="#667788" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Animated Water
function Water({ temperature, waterLevel }) {
  const waterRef = useRef();
  const surfaceRef = useRef();
  
  const tempColor = useMemo(() => {
    const t = Math.min(1, Math.max(0, (temperature - 20) / 80));
    const r = 0.15 + t * 0.6;
    const g = 0.4 + t * 0.15 - t * t * 0.3;
    const b = 0.8 - t * 0.5;
    return new THREE.Color(r, g, b);
  }, [temperature]);

  useFrame((state) => {
    if (surfaceRef.current) {
      surfaceRef.current.position.y = 0.05 + waterLevel * 1.4 + Math.sin(state.clock.elapsedTime * 2) * 0.008;
    }
  });

  return (
    <group>
      {/* Water body */}
      <mesh ref={waterRef} position={[0, 0.05 + waterLevel * 0.7, 0]}>
        <cylinderGeometry args={[0.85, 0.87, waterLevel * 1.4, 32]} />
        <meshPhysicalMaterial
          color={tempColor}
          transparent
          opacity={0.55}
          roughness={0.1}
          metalness={0.0}
          transmission={0.4}
          thickness={0.5}
        />
      </mesh>
      {/* Water surface */}
      <mesh ref={surfaceRef} position={[0, 0.05 + waterLevel * 1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.85, 32]} />
        <meshPhysicalMaterial
          color={tempColor}
          transparent
          opacity={0.3}
          roughness={0.0}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

// The sample block
function SampleBlock({ material, isDropped, temperature }) {
  const meshRef = useRef();
  const dropProgress = useRef(0);
  const [localY, setLocalY] = useState(3.5);

  const matData = MATERIALS[material];

  const glowIntensity = useMemo(() => {
    return Math.max(0, (temperature - 50) / 50) * 0.3;
  }, [temperature]);

  useFrame((_, delta) => {
    if (isDropped && dropProgress.current < 1) {
      dropProgress.current = Math.min(1, dropProgress.current + delta * 0.8);
      const ease = 1 - Math.pow(1 - dropProgress.current, 3);
      const startY = 3.5;
      const endY = 0.5;
      setLocalY(startY + (endY - startY) * ease);
      
      if (meshRef.current) {
        meshRef.current.rotation.x += delta * 2;
        meshRef.current.rotation.z += delta * 1.5;
      }
    }
    if (!isDropped) {
      dropProgress.current = 0;
      setLocalY(3.5);
    }
  });

  return (
    <Float speed={isDropped ? 0 : 2} rotationIntensity={isDropped ? 0 : 0.2}>
      <mesh ref={meshRef} position={[isDropped ? 0 : -2.2, localY, 0]} castShadow>
        <boxGeometry args={[0.45, 0.32, 0.45]} />
        <meshStandardMaterial
          color={matData.color}
          metalness={matData.metalness}
          roughness={0.25}
          emissive={matData.color}
          emissiveIntensity={glowIntensity}
        />
      </mesh>
    </Float>
  );
}

// Thermometer 3D
function Thermometer3D({ temperature }) {
  const mercuryHeight = useMemo(() => {
    return Math.max(0.15, (temperature / 100) * 2.0);
  }, [temperature]);

  return (
    <group position={[1.5, 1.2, 0]}>
      {/* Glass tube */}
      <mesh>
        <cylinderGeometry args={[0.06, 0.06, 2.4, 16]} />
        <meshPhysicalMaterial
          color="#eef4ff"
          transparent
          opacity={0.3}
          transmission={0.7}
          roughness={0.0}
          thickness={0.1}
        />
      </mesh>
      {/* Mercury column */}
      <mesh position={[0, -1.0 + mercuryHeight / 2, 0]}>
        <cylinderGeometry args={[0.035, 0.035, mercuryHeight, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ff2222" emissiveIntensity={0.3} />
      </mesh>
      {/* Bulb */}
      <mesh position={[0, -1.1, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ff2222" emissiveIntensity={0.4} />
      </mesh>
      {/* Scale markings */}
      {[0, 20, 40, 60, 80, 100].map(t => (
        <mesh key={t} position={[0.08, -1.0 + (t / 100) * 2.0, 0]}>
          <boxGeometry args={[0.04, 0.005, 0.005]} />
          <meshBasicMaterial color="#888" />
        </mesh>
      ))}
    </group>
  );
}

// Steam particles
function SteamParticles({ active, intensity }) {
  const particles = useRef([]);
  const meshRef = useRef();

  useEffect(() => {
    particles.current = Array.from({ length: 30 }, () => ({
      x: (Math.random() - 0.5) * 1.4,
      y: 1.7 + Math.random() * 0.5,
      z: (Math.random() - 0.5) * 1.4,
      speed: 0.3 + Math.random() * 0.5,
      size: 0.02 + Math.random() * 0.04,
      offset: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current || !active) return;
    const positions = meshRef.current.geometry.attributes.position;
    const sizes = meshRef.current.geometry.attributes.size;
    
    particles.current.forEach((p, i) => {
      p.y += p.speed * 0.016;
      if (p.y > 3.5) {
        p.y = 1.7;
        p.x = (Math.random() - 0.5) * 1.2;
        p.z = (Math.random() - 0.5) * 1.2;
      }
      positions.setXYZ(i, 
        p.x + Math.sin(state.clock.elapsedTime + p.offset) * 0.1, 
        p.y, 
        p.z + Math.cos(state.clock.elapsedTime + p.offset) * 0.1
      );
      if (sizes) {
        sizes.setX(i, p.size * intensity);
      }
    });
    positions.needsUpdate = true;
    if (sizes) sizes.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={30}
          array={new Float32Array(90)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.06 * intensity}
        transparent
        opacity={0.3 * intensity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// Fire under the heater
function FireParticles({ active }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current || !active) return;
    groupRef.current.children.forEach((child, i) => {
      const t = state.clock.elapsedTime * 3 + i * 0.7;
      child.position.y = -0.1 + Math.abs(Math.sin(t)) * 0.25;
      child.scale.setScalar(0.6 + Math.sin(t * 1.3) * 0.3);
      child.material.opacity = 0.5 + Math.sin(t) * 0.3;
    });
  });

  if (!active) return null;

  return (
    <group ref={groupRef} position={[-2.2, 0.1, 0]}>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[(i - 2) * 0.15, 0, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#ff6622" transparent opacity={0.6} />
        </mesh>
      ))}
      {/* Heater glow below */}
      <pointLight color="#ff6622" intensity={1.5} distance={2} />
    </group>
  );
}

// Heater/Stove
function Heater({ visible }) {
  if (!visible) return null;
  return (
    <group position={[-2.2, 0, 0]}>
      {/* Stove body */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.8, 0.3, 0.6]} />
        <meshStandardMaterial color="#5c2a0a" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Coil */}
      <mesh position={[0, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.02, 8, 16]} />
        <meshStandardMaterial color="#ff3300" emissive="#ff3300" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

// Lab Table
function LabTable() {
  return (
    <group>
      {/* Table top */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[6, 0.12, 3]} />
        <meshStandardMaterial color="#2a1f14" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Legs */}
      {[[-2.5, -1.1, -1.2], [2.5, -1.1, -1.2], [-2.5, -1.1, 1.2], [2.5, -1.1, 1.2]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.06, 0.06, 1.8, 8]} />
          <meshStandardMaterial color="#444" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// Temp label floating
function TempLabel({ temperature, position }) {
  return (
    <Text
      position={position}
      fontSize={0.22}
      color="#fbbf24"
      anchorX="center"
      anchorY="middle"
      font={undefined}
    >
      {temperature.toFixed(1)}°C
    </Text>
  );
}

// ═══════════════ MAIN 3D SCENE ═══════════════
function CalorimeterScene({ experimentState, currentWaterTemp, sampleMaterial, sampleTemp, waterMass }) {
  const waterLevel = useMemo(() => Math.min(0.85, waterMass / 450), [waterMass]);
  const isDropped = experimentState === 'mixing' || experimentState === 'equilibrium';
  const steamIntensity = useMemo(() => Math.max(0, (currentWaterTemp - 40) / 60), [currentWaterTemp]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 2]} intensity={1.2} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[-2, 3, 1]} intensity={0.5} color="#ffe4b5" />
      <Environment preset="studio" />

      {/* Camera controls */}
      <OrbitControls 
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2 + 0.2}
        target={[0, 0.8, 0]}
      />

      {/* Scene objects */}
      <LabTable />
      <Calorimeter />
      <Water temperature={currentWaterTemp} waterLevel={waterLevel} />
      <SampleBlock material={sampleMaterial} isDropped={isDropped} temperature={isDropped ? currentWaterTemp : sampleTemp} />
      <Thermometer3D temperature={currentWaterTemp} />
      <Heater visible={experimentState === 'setup'} />
      <FireParticles active={experimentState === 'setup'} />
      <SteamParticles active={currentWaterTemp > 35} intensity={steamIntensity} />
      <TempLabel temperature={currentWaterTemp} position={[1.5, 2.8, 0]} />
    </>
  );
}

// ═══════════════ MAIN COMPONENT ═══════════════
const CalorimeterLab = () => {
  const navigate = useNavigate();
  const dataCollectorRef = useRef(null);
  const animationRef = useRef(null);

  const [experimentState, setExperimentState] = useState('setup');
  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0);
  const [showTheory, setShowTheory] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [time, setTime] = useState(0);

  const [waterMass, setWaterMass] = useState(200);
  const [waterTemp, setWaterTemp] = useState(25);
  const [sampleMaterial, setSampleMaterial] = useState('copper');
  const [sampleMass, setSampleMass] = useState(100);
  const [sampleTemp, setSampleTemp] = useState(100);

  const [currentWaterTemp, setCurrentWaterTemp] = useState(25);
  const [currentSampleTemp, setCurrentSampleTemp] = useState(100);
  const [equilibriumTemp, setEquilibriumTemp] = useState(0);
  const [calculatedC, setCalculatedC] = useState(0);

  const [tempHistory, setTempHistory] = useState([]);
  const [collectedData, setCollectedData] = useState([]);

  useEffect(() => {
    dataCollectorRef.current = new ExperimentDataCollector('Nhiệt lượng kế', [
      { name: 'trial', label: 'Lần đo', type: 'number' },
      { name: 'material', label: 'Chất', type: 'string' },
      { name: 'm1', label: 'm_nước (g)', type: 'number', unit: 'g' },
      { name: 't1', label: 't_nước (°C)', type: 'number', unit: '°C' },
      { name: 'm2', label: 'm_mẫu (g)', type: 'number', unit: 'g' },
      { name: 't2', label: 't_mẫu (°C)', type: 'number', unit: '°C' },
      { name: 'tCB', label: 't_CB (°C)', type: 'number', unit: '°C' },
      { name: 'c', label: 'c (J/kg.K)', type: 'number', unit: 'J/kg.K' }
    ]);
    return () => { labSoundEngine.stopAll(); };
  }, []);

  const guideSteps = [
    { title: 'Thí nghiệm Nhiệt lượng kế', content: 'Xác định nhiệt dung riêng của chất rắn bằng cân bằng nhiệt. Xoay chuột để xem 3D!' },
    { title: 'Bước 1: Chuẩn bị', content: 'Đổ nước vào nhiệt lượng kế. Chọn chất mẫu và nung nóng đến nhiệt độ cao.' },
    { title: 'Bước 2: Tiến hành', content: 'Nhấn "Thả mẫu" để thả vật nóng vào nước. Quan sát sự thay đổi nhiệt độ.' },
    { title: 'Bước 3: Cân bằng', content: 'Chờ hệ đạt cân bằng nhiệt. Ghi nhận nhiệt độ cân bằng t_CB.' },
    { title: 'Bước 4: Tính toán', content: 'Áp dụng phương trình cân bằng nhiệt: Q_thu = Q_tỏa để tính c.' }
  ];

  // Equilibrium temperature
  useEffect(() => {
    const material = MATERIALS[sampleMaterial];
    const c1 = 4186;
    const c2 = material.c;
    const m1 = waterMass / 1000;
    const m2 = sampleMass / 1000;
    const tCB = (m1 * c1 * waterTemp + m2 * c2 * sampleTemp) / (m1 * c1 + m2 * c2);
    setEquilibriumTemp(tCB);
  }, [waterMass, waterTemp, sampleMass, sampleTemp, sampleMaterial]);

  // Mixing animation
  useEffect(() => {
    if (experimentState === 'mixing') {
      const targetTemp = equilibriumTemp;
      const duration = 5000;
      const startTime = Date.now();
      const initialWaterTemp = currentWaterTemp;
      const initialSampleTemp = currentSampleTemp;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);

        const newWaterTemp = initialWaterTemp + (targetTemp - initialWaterTemp) * easeOut;
        const newSampleTemp = initialSampleTemp + (targetTemp - initialSampleTemp) * easeOut;

        setCurrentWaterTemp(newWaterTemp);
        setCurrentSampleTemp(newSampleTemp);
        setTime(elapsed / 1000);

        setTempHistory(prev => [...prev, { time: elapsed / 1000, water: newWaterTemp, sample: newSampleTemp }]);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setExperimentState('equilibrium');
          labSoundEngine.playSuccess();
          const c1 = 4186;
          const m1 = waterMass / 1000;
          const m2 = sampleMass / 1000;
          const deltaT1 = targetTemp - waterTemp;
          const deltaT2 = sampleTemp - targetTemp;
          if (deltaT2 > 0) {
            setCalculatedC((m1 * c1 * deltaT1) / (m2 * deltaT2));
          }
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [experimentState]);

  const startExperiment = () => {
    labSoundEngine.init();
    labSoundEngine.playDrop();
    setExperimentState('mixing');
    setCurrentWaterTemp(waterTemp);
    setCurrentSampleTemp(sampleTemp);
    setTempHistory([{ time: 0, water: waterTemp, sample: sampleTemp }]);
  };

  const resetExperiment = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setExperimentState('setup');
    setCurrentWaterTemp(waterTemp);
    setCurrentSampleTemp(sampleTemp);
    setTime(0);
    setTempHistory([]);
    setCalculatedC(0);
  };

  const recordData = () => {
    if (experimentState !== 'equilibrium') { alert('Hãy chờ hệ đạt cân bằng nhiệt!'); return; }
    labSoundEngine.playSuccess();
    const material = MATERIALS[sampleMaterial];
    const record = {
      trial: collectedData.length + 1, material: material.name,
      m1: waterMass, t1: waterTemp, m2: sampleMass, t2: sampleTemp,
      tCB: PhysicsUtils.round(equilibriumTemp, 1), c: PhysicsUtils.round(calculatedC, 0)
    };
    if (dataCollectorRef.current) dataCollectorRef.current.addRecord(record);
    setCollectedData(prev => [...prev, record]);
  };

  const clearData = () => { setCollectedData([]); if (dataCollectorRef.current) dataCollectorRef.current.clearData(); };
  const toggleSound = () => { labSoundEngine.init(); setSoundEnabled(labSoundEngine.toggle()); };

  const calculateError = () => {
    const material = MATERIALS[sampleMaterial];
    if (calculatedC > 0) return PhysicsUtils.round(Math.abs(calculatedC - material.c) / material.c * 100, 1);
    return null;
  };
  const error = calculateError();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="calori-header">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/vatly/virtual-lab')} className="p-2 hover:bg-white/10 rounded-lg transition-all">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <span className="header-emoji">🌡️</span> Thí nghiệm: Nhiệt lượng kế
              </h1>
              <p className="text-gray-400 text-sm">Xác định nhiệt dung riêng • 3D Interactive</p>
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
          <div className="calori-canvas-container">
            <div className="relative" style={{ height: '400px' }}>
              <Canvas camera={{ position: [4, 3.5, 4], fov: 42 }} shadows>
                <CalorimeterScene
                  experimentState={experimentState}
                  currentWaterTemp={currentWaterTemp}
                  sampleMaterial={sampleMaterial}
                  sampleTemp={sampleTemp}
                  waterMass={waterMass}
                />
              </Canvas>

              {/* 3D badge */}
              <div className="absolute top-3 left-3 badge-3d">🎮 3D • Kéo chuột để xoay</div>

              {/* Status */}
              <div className="absolute top-3 right-3 status-badge">
                {experimentState === 'setup' && '⚙️ Thiết lập'}
                {experimentState === 'mixing' && '🔄 Đang cân bằng...'}
                {experimentState === 'equilibrium' && '✅ Đã cân bằng'}
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                {experimentState === 'setup' && (
                  <button onClick={startExperiment} className="calori-start-btn">
                    <Droplets size={18} /> Thả mẫu vào nước
                  </button>
                )}
                {experimentState === 'equilibrium' && (
                  <button onClick={recordData} className="calori-record-btn">
                    <Save size={18} /> Ghi số liệu
                  </button>
                )}
                <button onClick={resetExperiment} className="calori-reset-btn">
                  <RotateCcw size={18} /> Reset
                </button>
              </div>
            </div>

            {/* Parameters */}
            <div className="p-4 border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Thiết lập thí nghiệm</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-blue-400 font-medium flex items-center gap-2"><Droplets size={16} /> Nước</h4>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Khối lượng (g)</label>
                    <input type="range" min="100" max="400" step="20" value={waterMass}
                      onChange={(e) => setWaterMass(parseInt(e.target.value))}
                      disabled={experimentState !== 'setup'} className="w-full accent-blue-500" />
                    <div className="text-center text-lg font-mono text-blue-400 param-value">{waterMass} g</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Nhiệt độ (°C)</label>
                    <input type="range" min="15" max="35" step="1" value={waterTemp}
                      onChange={(e) => { setWaterTemp(parseInt(e.target.value)); setCurrentWaterTemp(parseInt(e.target.value)); }}
                      disabled={experimentState !== 'setup'} className="w-full accent-blue-500" />
                    <div className="text-center text-lg font-mono text-blue-400 param-value">{waterTemp}°C</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-orange-400 font-medium flex items-center gap-2"><Thermometer size={16} /> Vật mẫu</h4>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Chất liệu</label>
                    <select value={sampleMaterial} onChange={(e) => setSampleMaterial(e.target.value)}
                      disabled={experimentState !== 'setup'}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                      {Object.entries(MATERIALS).map(([key, mat]) => (
                        <option key={key} value={key}>{mat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Khối lượng (g)</label>
                    <input type="range" min="50" max="200" step="10" value={sampleMass}
                      onChange={(e) => setSampleMass(parseInt(e.target.value))}
                      disabled={experimentState !== 'setup'} className="w-full accent-cyan-500" />
                    <div className="text-center text-lg font-mono text-orange-400 param-value">{sampleMass} g</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Nhiệt độ (°C)</label>
                    <input type="range" min="80" max="100" step="5" value={sampleTemp}
                      onChange={(e) => setSampleTemp(parseInt(e.target.value))}
                      disabled={experimentState !== 'setup'} className="w-full accent-cyan-500" />
                    <div className="text-center text-lg font-mono text-orange-400 param-value">{sampleTemp}°C</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Temperature chart */}
          {tempHistory.length > 1 && (
            <div className="mt-4">
              <RealTimeChart data={tempHistory} xKey="time" yKey="water"
                xLabel="Thời gian" yLabel="Nhiệt độ" xUnit="s" yUnit="°C"
                title="Biến thiên nhiệt độ" lineColor="#3b82f6" pointColor="#22c55e" height={180} />
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="lg:w-96 space-y-4">
          {/* Results */}
          <div className={`calori-results ${experimentState === 'equilibrium' ? 'calori-results-done' : ''}`}>
            <h3 className="text-lg font-bold text-white mb-3">📊 Kết quả</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="result-value-box">
                <div className="text-2xl font-mono text-blue-400">{PhysicsUtils.round(currentWaterTemp, 1)}</div>
                <div className="text-xs text-gray-400">t_nước (°C)</div>
              </div>
              <div className="result-value-box">
                <div className="text-2xl font-mono text-green-400">
                  {experimentState === 'equilibrium' ? PhysicsUtils.round(equilibriumTemp, 1) : '-'}
                </div>
                <div className="text-xs text-gray-400">t_CB (°C)</div>
              </div>
            </div>
            {experimentState === 'equilibrium' && (
              <>
                <div className="result-value-box mb-3">
                  <div className="text-2xl font-mono text-yellow-400">{PhysicsUtils.round(calculatedC, 0)}</div>
                  <div className="text-xs text-gray-400">c tính được (J/kg.K)</div>
                </div>
                <div className="result-value-box">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Lý thuyết:</span>
                    <span className="text-white font-mono">{MATERIALS[sampleMaterial].c} J/kg.K</span>
                  </div>
                  {error !== null && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-400">Sai số:</span>
                      <span className={`font-mono font-bold ${error < 5 ? 'text-green-400' : 'text-yellow-400'}`}>{error}%</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Data Table */}
          <DataTable columns={[
            { name: 'trial', label: '#', type: 'number' },
            { name: 'material', label: 'Chất', type: 'string' },
            { name: 'tCB', label: 't_CB', type: 'number' },
            { name: 'c', label: 'c', type: 'number' }
          ]} data={collectedData} onClearAll={clearData}
            onExport={() => dataCollectorRef.current?.downloadCSV()}
            onDeleteRecord={(id) => setCollectedData(prev => prev.filter(d => d.trial !== id))} maxHeight={150} />

          {/* Formula */}
          <div className="calori-formula-card">
            <h3 className="text-sm font-medium text-gray-400 mb-2">📐 Phương trình cân bằng nhiệt</h3>
            <div className="calori-formula-display">
              <p className="text-lg font-mono text-cyan-400">Q_thu = Q_tỏa</p>
              <p className="text-sm font-mono text-gray-400 mt-1">m₁c₁Δt₁ = m₂c₂Δt₂</p>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <p>• c_nước = 4186 J/kg.K</p>
              <p>• Q = mcΔt</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3 modal-emoji">🌡️</div>
              <h2 className="text-xl font-bold">{guideSteps[guideStep].title}</h2>
            </div>
            <p className="text-gray-300 text-center mb-6">{guideSteps[guideStep].content}</p>
            <div className="flex justify-center gap-2 mb-6">
              {guideSteps.map((_, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === guideStep ? 'bg-cyan-500 scale-125' : 'bg-gray-600'}`} />
              ))}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setGuideStep(Math.max(0, guideStep - 1))} disabled={guideStep === 0}
                className="flex items-center gap-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-all">
                <ChevronLeft size={18} /> Trước
              </button>
              {guideStep === guideSteps.length - 1 ? (
                <button onClick={() => setShowGuide(false)}
                  className="px-5 py-2 bg-orange-600 hover:bg-cyan-500 rounded-lg transition-all shadow-lg shadow-orange-600/30">
                  Bắt đầu
                </button>
              ) : (
                <button onClick={() => setGuideStep(guideStep + 1)}
                  className="flex items-center gap-1 px-4 py-2 bg-orange-600 hover:bg-cyan-500 rounded-lg transition-all">
                  Tiếp <ChevronRight size={18} />
                </button>
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
              <h2 className="text-xl font-bold">📚 Nhiệt lượng kế và cân bằng nhiệt</h2>
              <button onClick={() => setShowTheory(false)} className="p-2 hover:bg-gray-700 rounded-lg">✕</button>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Nhiệt lượng</h3>
                <p>Q = mcΔt, trong đó m: khối lượng (kg), c: nhiệt dung riêng (J/kg.K), Δt: độ thay đổi nhiệt độ (K)</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Cân bằng nhiệt</h3>
                <div className="bg-gray-900/80 p-4 rounded-lg text-center border border-gray-700/50">
                  <p className="text-xl font-mono text-cyan-400">Q_thu = Q_tỏa</p>
                  <p className="text-sm font-mono text-gray-400 mt-1">m₁c₁(t_CB - t₁) = m₂c₂(t₂ - t_CB)</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Nhiệt dung riêng</h3>
                <div className="bg-gray-900/80 p-4 rounded-lg text-center border border-gray-700/50">
                  <p className="text-xl font-mono text-yellow-400">c₂ = m₁c₁Δt₁ / (m₂Δt₂)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalorimeterLab;


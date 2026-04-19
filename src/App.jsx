import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GameProgressProvider } from './contexts/GameProgressContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
import GameJourney from './pages/GameJourney';
import "./index.css";

// Physics Tools Hub
import PhysicsToolsHub from './pages/PhysicsToolsHub';
import PhysicsCalculator from './components/PhysicsTools/PhysicsCalculator';
import ConstantsReference from './components/PhysicsTools/ConstantsReference';
import UnitConverter from './components/PhysicsTools/UnitConverter';

// Interactive Lecture Hub
import InteractiveLectureHub from './pages/InteractiveLectureHub';
import LectureGradeSelector from './pages/LectureGradeSelector';
import LectureViewer from './components/LectureViewer';
import LectureClassSelector from './components/LectureClassSelector';
import Profile from './pages/Profile';
import PlacementTest from './pages/PlacementTest';
import Login from './pages/Login';
import Register from './pages/Register';
import MainLayout from './components/layout/MainLayout';

// Physics area
import PhysicsHome from './areas/Vatly/pages/PhysicsHome';
import PhysicsClassDashboard from './areas/Vatly/pages/PhysicsClassDashboard';
import PhysicsClasses from './areas/Vatly/pages/PhysicsClasses';
import PhysicsLesson from './areas/Vatly/pages/PhysicsLesson';
import AdvancedPhysicsChallenge from './areas/Vatly/gamelist/AdvancedPhysicsChallenge';
import PhysicsGradeSelector from './areas/Vatly/gamelist/PhysicsGradeSelector';
import PhysicsGradeGames from './areas/Vatly/gamelist/PhysicsGradeGames';

// Physics challenge games
import BalanceChallenge from './areas/Vatly/challenges/BalanceChallenge/BalanceChallenge';
import ColorMaster from './areas/Vatly/challenges/ColorMaster/ColorMaster';
import ElectromagneticLab from './areas/Vatly/challenges/ElectromagneticLab/ElectromagneticLab';
import NanoLab from './areas/Vatly/challenges/NanoLab/NanoLab';
import PlasmaGame from './areas/Vatly/challenges/PlasmaGame/PlasmaGame';
import ProjectileMotion from './areas/Vatly/challenges/ProjectileMotion/ProjectileMotion';
import StaticElectricity from './areas/Vatly/challenges/StaticElectricity/StaticElectricity';
import ThermoLab from './areas/Vatly/challenges/ThermoLab/ThermoLab';
import WaterLab from './areas/Vatly/challenges/WaterLab/WaterLab';
import MeasurementGame from './areas/Vatly/challenges/MeasurementGame/MeasurementGame';
import MassBalanceGame from './areas/Vatly/challenges/MassBalanceGame/MassBalanceGame';
import ForceWorldGame from './areas/Vatly/challenges/ForceWorldGame/ForceWorldGame';
import WeightMassGame from './areas/Vatly/challenges/WeightMassGame/WeightMassGame';
import SimpleMachineGame from './areas/Vatly/challenges/SimpleMachineGame/SimpleMachineGame';
import PressureChallengeGame from './areas/Vatly/challenges/PressureChallengeGame/PressureChallengeGame';
import ThermometerGame from './areas/Vatly/challenges/ThermometerGame/ThermometerGame';
import ThermalExpansionGame from './areas/Vatly/challenges/ThermalExpansionGame/ThermalExpansionGame';
import EvaporationGame from './areas/Vatly/challenges/EvaporationGame/EvaporationGame';
import BoilingGame from './areas/Vatly/challenges/BoilingGame/BoilingGame';
import HeatTransferGame from './areas/Vatly/challenges/HeatTransferGame/HeatTransferGame';
import ThermalEnergyGame from './areas/Vatly/challenges/ThermalEnergyGame/ThermalEnergyGame';

// Grade 7 Physics Games - Chapter 1: Optics (Quang học)
import LightReflectionGame from './areas/Vatly/challenges/LightReflectionGame/LightReflectionGame';
import MirrorLabGame from './areas/Vatly/challenges/MirrorLabGame/MirrorLabGame';
import LightPathGame from './areas/Vatly/challenges/LightPathGame/LightPathGame';

// Grade 7 Physics Games - Chapter 2: Acoustics (Âm học)
import WaveFrequencyGame from './areas/Vatly/challenges/WaveFrequencyGame/WaveFrequencyGame';
import SoundTransmissionGame from './areas/Vatly/challenges/SoundTransmissionGame/SoundTransmissionGame';
import EchoExplorerGame from './areas/Vatly/challenges/EchoExplorerGame/EchoExplorerGame';

// Grade 7 Physics Games - Chapter 3: Electricity (Điện học)
import ElectricChargeLab from './areas/Vatly/challenges/ElectricChargeLab/ElectricChargeLab';
import CircuitBuilderGame from './areas/Vatly/challenges/CircuitBuilderGame/CircuitBuilderGame';
import ElectricEffectsGame from './areas/Vatly/challenges/ElectricEffectsGame/ElectricEffectsGame';

// Grade 8 Physics Games - Chapter 1: Mechanics (Cơ học)
import RaceTracker from './areas/Vatly/challenges/RaceTracker/RaceTracker';
import ForceArena from './areas/Vatly/challenges/ForceArena/ForceArena';
import PressureMaster from './areas/Vatly/challenges/PressureMaster/PressureMaster';
import ArchimedesChallenge from './areas/Vatly/challenges/ArchimedesChallenge/ArchimedesChallenge';
import EnergyLab from './areas/Vatly/challenges/EnergyLab/EnergyLab';

// Grade 8 Physics Games - Chapter 2: Thermodynamics (Nhiệt học)
import MoleculeMotion from './areas/Vatly/challenges/MoleculeMotion/MoleculeMotion';
import HeatTransferLabGrade8 from './areas/Vatly/challenges/HeatTransferLabGrade8/HeatTransferLabGrade8';
import Calorimeter from './areas/Vatly/challenges/Calorimeter/Calorimeter';
import FuelEnergy from './areas/Vatly/challenges/FuelEnergy/FuelEnergy';
import HeatEngine from './areas/Vatly/challenges/HeatEngine/HeatEngine';

// Grade 9 Physics Games - Chapter 1: Electricity (Điện học)
import OhmLawCircuitLab from './areas/Vatly/challenges/OhmLawCircuitLab/OhmLawCircuitLab';
import CircuitBuilderPro from './areas/Vatly/challenges/CircuitBuilderPro/CircuitBuilderPro';
import PowerHeatMaster from './areas/Vatly/challenges/PowerHeatMaster/PowerHeatMaster';

// Grade 9 Physics Games - Chapter 2: Electromagnetism (Điện từ học)
import MagneticFieldExplorer from './areas/Vatly/challenges/MagneticFieldExplorer/MagneticFieldExplorer';
import ElectromagneticInductionLab from './areas/Vatly/challenges/ElectromagneticInductionLab/ElectromagneticInductionLab';
import ACGeneratorSimulator from './areas/Vatly/challenges/ACGeneratorSimulator/ACGeneratorSimulator';

// Grade 9 Physics Games - Chapter 3: Optics (Quang học)
import LightRefractionLab from './areas/Vatly/challenges/LightRefractionLab/LightRefractionLab';
import LensOpticsChallenge from './areas/Vatly/challenges/LensOpticsChallenge/LensOpticsChallenge';
import ColorSpectrumStudio from './areas/Vatly/challenges/ColorSpectrumStudio/ColorSpectrumStudio';

// Grade 9 Physics Games - Chapter 4: Energy (Năng lượng)
import EnergyTransformationQuest from './areas/Vatly/challenges/EnergyTransformationQuest/EnergyTransformationQuest';
import PowerPlantManager from './areas/Vatly/challenges/PowerPlantManager/PowerPlantManager';
import EnergyConservationHero from './areas/Vatly/challenges/EnergyConservationHero/EnergyConservationHero';

// Grade 10 Physics Games - Chapter 1: Kinematics (Động học)
import MotionTracker from './areas/Vatly/challenges/MotionTracker/MotionTracker';
import FreeFallLab from './areas/Vatly/challenges/FreeFallLab/FreeFallLab';

// Grade 10 Physics Games - Chapter 2: Dynamics (Động lực học)
import NewtonsLawsArena from './areas/Vatly/challenges/NewtonsLawsArena/NewtonsLawsArena';
import FrictionTensionMaster from './areas/Vatly/challenges/FrictionTensionMaster/FrictionTensionMaster';

// Grade 10 Physics Games - Chapter 3: Statics (Tĩnh học)
import EquilibriumChallenge from './areas/Vatly/challenges/EquilibriumChallenge/EquilibriumChallenge';
import RotationDynamics from './areas/Vatly/challenges/RotationDynamics/RotationDynamics';

// Grade 10 Physics Games - Chapter 4: Work & Energy (Công & Năng lượng)
import WorkEnergyTheoremLab from './areas/Vatly/challenges/WorkEnergyTheoremLab/WorkEnergyTheoremLab';
import MechanicalEnergyQuest from './areas/Vatly/challenges/MechanicalEnergyQuest/MechanicalEnergyQuest';

// Grade 10 Physics Games - Chapter 5: Thermodynamics (Nhiệt động lực học)
import HeatTransferSimulator from './areas/Vatly/challenges/HeatTransferSimulator/HeatTransferSimulator';
import GasLawsExplorer from './areas/Vatly/challenges/GasLawsExplorer/GasLawsExplorer';

// Grade 10 Physics Games - Chapter 6: Gas Physics (Chất khí)
import IdealGasPlayground from './areas/Vatly/challenges/IdealGasPlayground/IdealGasPlayground';
import MolecularMotionStudio from './areas/Vatly/challenges/MolecularMotionStudio/MolecularMotionStudio';

// Grade 10 Physics Games - Chapter 7: Thermodynamic Cycles (Chu trình nhiệt động)
import ThermodynamicCycles from './areas/Vatly/challenges/ThermodynamicCycles/ThermodynamicCycles';
import HeatEngineOptimizer from './areas/Vatly/challenges/HeatEngineOptimizer/HeatEngineOptimizer';

// Grade 11 Physics Games - Chapter 1: Oscillations (Dao động)
import SimpleHarmonicMotionLab from './areas/Vatly/challenges/SimpleHarmonicMotionLab/SimpleHarmonicMotionLab';
import OscillationEnergyMaster from './areas/Vatly/challenges/OscillationEnergyMaster/OscillationEnergyMaster';
import ResonanceArena from './areas/Vatly/challenges/ResonanceArena/ResonanceArena';

// Grade 11 Physics Games - Chapter 2: Waves (Sóng)
import WaveInterferenceStudio from './areas/Vatly/challenges/WaveInterferenceStudio/WaveInterferenceStudio';
import SoundWaveExplorer from './areas/Vatly/challenges/SoundWaveExplorer/SoundWaveExplorer';
import UltrasoundApplicationLab from './areas/Vatly/challenges/UltrasoundApplicationLab/UltrasoundApplicationLab';

// Grade 11 Physics Games - Chapter 3: Electricity (Điện học)
import ElectricFieldVisualizer from './areas/Vatly/challenges/ElectricFieldVisualizer/ElectricFieldVisualizer';
import CapacitorCircuitLab from './areas/Vatly/challenges/CapacitorCircuitLab/CapacitorCircuitLab';
import DCCircuitMaster from './areas/Vatly/challenges/DCCircuitMaster/DCCircuitMaster';

// Grade 11 Physics Games - Chapter 4: Magnetism (Từ học)
import MagneticFieldExplorerGrade11 from './areas/Vatly/challenges/MagneticFieldExplorer/MagneticFieldExplorer';
import ElectromagneticInductionLabGrade11 from './areas/Vatly/challenges/ElectromagneticInductionLab/ElectromagneticInductionLab';
import ACCircuitSimulator from './areas/Vatly/challenges/ACCircuitSimulator/ACCircuitSimulator';

// Grade 12 Physics Games - Chapter 1: Electromagnetic Oscillations & Waves (Dao động & sóng điện từ)
import LCOscillatorLab from './areas/Vatly/challenges/LCOscillatorLab/LCOscillatorLab';
import ElectromagneticWaveStudio from './areas/Vatly/challenges/ElectromagneticWaveStudio/ElectromagneticWaveStudio';

// Grade 12 Physics Games - Chapter 2: Light Waves (Sóng ánh sáng)
import LightInterferenceSimulator from './areas/Vatly/challenges/LightInterferenceSimulator/LightInterferenceSimulator';
import SpectrumExplorer from './areas/Vatly/challenges/SpectrumExplorer/SpectrumExplorer';

// Grade 12 Physics Games - Chapter 3: Quantum of Light (Lượng tử ánh sáng)
import PhotoelectricEffectLab from './areas/Vatly/challenges/PhotoelectricEffectLab/PhotoelectricEffectLab';
import SolarCellOptimizer from './areas/Vatly/challenges/SolarCellOptimizer/SolarCellOptimizer';

// Grade 12 Physics Games - Chapter 4: Nuclear Physics (Vật lý hạt nhân)
import NuclearReactionChamber from './areas/Vatly/challenges/NuclearReactionChamber/NuclearReactionChamber';
import RadioactiveDecaySimulator from './areas/Vatly/challenges/RadioactiveDecaySimulator/RadioactiveDecaySimulator';

// PK Battle System
import PKLobby from './pages/PKBattle/PKLobby';
import PKMatchmaking from './pages/PKBattle/PKMatchmaking';
import PKBattleRoom from './pages/PKBattle/PKBattleRoom';
import PKResult from './pages/PKBattle/PKResult';

// Virtual Lab (Phòng thí nghiệm ảo)
import VirtualLabHome from './areas/Vatly/VirtualLab/pages/VirtualLabHome';
import PendulumLab from './areas/Vatly/VirtualLab/experiments/PendulumLab';
import FreeFallLabVirtual from './areas/Vatly/VirtualLab/experiments/FreeFallLab';
import OhmLawLab from './areas/Vatly/VirtualLab/experiments/OhmLawLab';
import LensOpticsLab from './areas/Vatly/VirtualLab/experiments/LensOpticsLab';
import StandingWaveLab from './areas/Vatly/VirtualLab/experiments/StandingWaveLab';
import CalorimeterLab from './areas/Vatly/VirtualLab/experiments/CalorimeterLab';
import InclinedPlaneLab from './areas/Vatly/VirtualLab/experiments/InclinedPlaneLab';
import ResistorCircuitLab from './areas/Vatly/VirtualLab/experiments/ResistorCircuitLab';
import LightInterferenceLab from './areas/Vatly/VirtualLab/experiments/LightInterferenceLab';

// Admin Panel
import { AdminAuthProvider } from './areas/Admin/contexts/AdminAuthContext';
import AdminLayout from './areas/Admin/layouts/AdminLayout';
import AdminLogin from './areas/Admin/pages/AdminLogin';
import AdminDashboard from './areas/Admin/pages/AdminDashboard';
import AdminUsers from './areas/Admin/pages/AdminUsers';
import AdminLessons from './areas/Admin/pages/AdminLessons';
import AdminExercises from './areas/Admin/pages/AdminExercises';
import AdminStatistics from './areas/Admin/pages/AdminStatistics';
import AdminSettings from './areas/Admin/pages/AdminSettings';

// Teacher Panel
import { TeacherAuthProvider } from './areas/Teacher/contexts/TeacherAuthContext';
import TeacherLayout from './areas/Teacher/layouts/TeacherLayout';
import TeacherDashboard from './areas/Teacher/pages/TeacherDashboard';
import PendingApproval from './areas/Teacher/pages/PendingApproval';
import MyLessons from './areas/Teacher/pages/MyLessons';
import MyExercises from './areas/Teacher/pages/MyExercises';
import MyExperiments from './areas/Teacher/pages/MyExperiments';
import BrowseContent from './areas/Teacher/pages/BrowseContent';
import StudentStats from './areas/Teacher/pages/StudentStats';
import ClassManagement from './areas/Teacher/pages/ClassManagement';
import TeacherProfile from './areas/Teacher/pages/TeacherProfile';


const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppContent = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Core Pages with Global Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<PhysicsHome />} />
          <Route path="/home" element={<Home />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/placement-test/:programId?" element={<ProtectedRoute><PlacementTest /></ProtectedRoute>} />
          <Route path="/program/physics" element={<PhysicsHome />} />
          <Route path="/program/physics/dashboard" element={<Navigate to="/program/physics" replace />} />
          <Route path="/physics-classes" element={<ProtectedRoute><PhysicsClasses /></ProtectedRoute>} />
          <Route path="/game-journey" element={<ProtectedRoute><GameJourney /></ProtectedRoute>} />

          {/* PK Battle Routes */}
          <Route path="/pk-battle" element={<ProtectedRoute><PKLobby /></ProtectedRoute>} />
          <Route path="/pk-battle/matchmaking" element={<ProtectedRoute><PKMatchmaking /></ProtectedRoute>} />
          <Route path="/pk-battle/result" element={<ProtectedRoute><PKResult /></ProtectedRoute>} />

          {/* Physics Routes */}
          <Route path="/physics-class/:classId" element={<ProtectedRoute><PhysicsClassDashboard /></ProtectedRoute>} />
          <Route path="/physics-lesson/:classId/:chapterId/:lessonId" element={<ProtectedRoute><PhysicsLesson /></ProtectedRoute>} />
          
          {/* Physics Tools Hub */}
          <Route path="/physics-tools" element={<ProtectedRoute><PhysicsToolsHub /></ProtectedRoute>} />
          <Route path="/physics-tools/calculator" element={<ProtectedRoute><PhysicsCalculator /></ProtectedRoute>} />
          <Route path="/physics-tools/constants" element={<ProtectedRoute><ConstantsReference /></ProtectedRoute>} />
          <Route path="/physics-tools/converter" element={<ProtectedRoute><UnitConverter /></ProtectedRoute>} />
          
          {/* Interactive Lecture Hub Routes */}
          <Route path="/interactive-lectures" element={<ProtectedRoute><InteractiveLectureHub /></ProtectedRoute>} />
          <Route path="/interactive-lectures/:subject" element={<ProtectedRoute><LectureGradeSelector /></ProtectedRoute>} />
          <Route path="/interactive-lectures/:subject/:grade" element={<ProtectedRoute><LectureClassSelector /></ProtectedRoute>} />
          <Route path="/interactive-lectures/:subject/:grade/:lectureId" element={<ProtectedRoute><LectureViewer /></ProtectedRoute>} />
          
          {/* Legacy Physics Calculator - redirect to new hub */}
          <Route path="/physics-calculator" element={<PhysicsToolsHub />} />
          
          {/* Virtual Lab - Phòng thí nghiệm ảo */}
          <Route path="/vatly/virtual-lab" element={<ProtectedRoute><VirtualLabHome /></ProtectedRoute>} />
          
          {/* Physics Games - New grade-based navigation */}
          <Route path="/physics-games/grades" element={<ProtectedRoute><PhysicsGradeSelector /></ProtectedRoute>} />
          <Route path="/physics-games/grade/:gradeId" element={<ProtectedRoute><PhysicsGradeGames /></ProtectedRoute>} />
          
          {/* Legacy route - redirect to grade selector */}
          <Route path="/advanced-physics-challenge" element={<PhysicsGradeSelector />} />
        </Route>

        {/* PK Battle Room (Keep fullscreen) */}
        <Route path="/pk-battle/room/:roomId" element={<ProtectedRoute><PKBattleRoom /></ProtectedRoute>} />

        {/* Virtual Lab Experiments (Keep fullscreen or focused) */}
        <Route path="/vatly/virtual-lab/pendulum" element={<ProtectedRoute><PendulumLab /></ProtectedRoute>} />
        <Route path="/vatly/virtual-lab/free-fall" element={<ProtectedRoute><FreeFallLabVirtual /></ProtectedRoute>} />
        <Route path="/vatly/virtual-lab/ohm-law" element={<ProtectedRoute><OhmLawLab /></ProtectedRoute>} />
        <Route path="/vatly/virtual-lab/lens-focal" element={<ProtectedRoute><LensOpticsLab /></ProtectedRoute>} />
        <Route path="/vatly/virtual-lab/standing-wave" element={<ProtectedRoute><StandingWaveLab /></ProtectedRoute>} />
        <Route path="/vatly/virtual-lab/calorimeter" element={<ProtectedRoute><CalorimeterLab /></ProtectedRoute>} />
        <Route path="/vatly/virtual-lab/inclined-plane" element={<ProtectedRoute><InclinedPlaneLab /></ProtectedRoute>} />
        <Route path="/vatly/virtual-lab/resistor-circuit" element={<ProtectedRoute><ResistorCircuitLab /></ProtectedRoute>} />
        <Route path="/vatly/virtual-lab/light-interference" element={<ProtectedRoute><LightInterferenceLab /></ProtectedRoute>} />


        {/* Physics Challenge Games */}
        <Route path="/advanced-physics-challenge/balance" element={<ProtectedRoute><BalanceChallenge /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/color-master" element={<ProtectedRoute><ColorMaster /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/electromagnetic" element={<ProtectedRoute><ElectromagneticLab /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/nanolab" element={<ProtectedRoute><NanoLab /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/plasma" element={<ProtectedRoute><PlasmaGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/projectile" element={<ProtectedRoute><ProjectileMotion /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/static" element={<ProtectedRoute><StaticElectricity /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/thermo" element={<ProtectedRoute><ThermoLab /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/water" element={<ProtectedRoute><WaterLab /></ProtectedRoute>} />
        
        {/* Grade 6 Physics Games - Chapter 1: Mechanics */}
        <Route path="/advanced-physics-challenge/measurement" element={<ProtectedRoute><MeasurementGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/mass-balance" element={<ProtectedRoute><MassBalanceGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/force-world" element={<ProtectedRoute><ForceWorldGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/weight-mass" element={<ProtectedRoute><WeightMassGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/simple-machine" element={<ProtectedRoute><SimpleMachineGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/pressure-challenge" element={<ProtectedRoute><PressureChallengeGame /></ProtectedRoute>} />
        
        {/* Grade 6 Physics Games - Chapter 2: Thermodynamics */}
        <Route path="/advanced-physics-challenge/thermometer" element={<ProtectedRoute><ThermometerGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/thermal-expansion" element={<ProtectedRoute><ThermalExpansionGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/evaporation" element={<ProtectedRoute><EvaporationGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/boiling" element={<ProtectedRoute><BoilingGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/heat-transfer" element={<ProtectedRoute><HeatTransferGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/thermal-energy" element={<ProtectedRoute><ThermalEnergyGame /></ProtectedRoute>} />
        
        {/* Grade 7 Physics Games - Chapter 1: Optics (Quang học) */}
        <Route path="/advanced-physics-challenge/light-reflection" element={<ProtectedRoute><LightReflectionGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/mirror-lab" element={<ProtectedRoute><MirrorLabGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/light-path" element={<ProtectedRoute><LightPathGame /></ProtectedRoute>} />
        
        {/* Grade 7 Physics Games - Chapter 2: Acoustics (Âm học) */}
        <Route path="/physics-games/grade/7/wave-frequency" element={<ProtectedRoute><WaveFrequencyGame /></ProtectedRoute>} />
        <Route path="/physics-games/grade/7/sound-transmission" element={<ProtectedRoute><SoundTransmissionGame /></ProtectedRoute>} />
        <Route path="/physics-games/grade/7/echo-explorer" element={<ProtectedRoute><EchoExplorerGame /></ProtectedRoute>} />
        
        {/* Grade 7 Physics Games - Chapter 3: Electricity (Điện học) */}
        <Route path="/physics-games/grade/7/electric-charge-lab" element={<ProtectedRoute><ElectricChargeLab /></ProtectedRoute>} />
        <Route path="/physics-games/grade/7/circuit-builder" element={<ProtectedRoute><CircuitBuilderGame /></ProtectedRoute>} />
        <Route path="/physics-games/grade/7/electric-effects" element={<ProtectedRoute><ElectricEffectsGame /></ProtectedRoute>} />
        
        {/* Grade 8 Physics Games - Chapter 1: Mechanics (Cơ học) */}
        <Route path="/physics-games/grade/8/race-tracker" element={<ProtectedRoute><RaceTracker /></ProtectedRoute>} />
        <Route path="/physics-games/grade/8/force-arena" element={<ProtectedRoute><ForceArena /></ProtectedRoute>} />
        <Route path="/physics-games/grade/8/pressure-master" element={<ProtectedRoute><PressureMaster /></ProtectedRoute>} />
        <Route path="/physics-games/grade/8/archimedes-challenge" element={<ProtectedRoute><ArchimedesChallenge /></ProtectedRoute>} />
        <Route path="/physics-games/grade/8/energy-lab" element={<ProtectedRoute><EnergyLab /></ProtectedRoute>} />
        
        {/* Grade 8 Physics Games - Chapter 2: Thermodynamics (Nhiệt học) */}
        <Route path="/physics-games/grade/8/molecule-motion" element={<ProtectedRoute><MoleculeMotion /></ProtectedRoute>} />
        <Route path="/physics-games/grade/8/heat-transfer-lab" element={<ProtectedRoute><HeatTransferLabGrade8 /></ProtectedRoute>} />
        <Route path="/physics-games/grade/8/calorimeter" element={<ProtectedRoute><Calorimeter /></ProtectedRoute>} />
        <Route path="/physics-games/grade/8/fuel-energy" element={<ProtectedRoute><FuelEnergy /></ProtectedRoute>} />
        <Route path="/physics-games/grade/8/heat-engine" element={<ProtectedRoute><HeatEngine /></ProtectedRoute>} />
        
        {/* Grade 9 Physics Games - Chapter 1: Electricity (Điện học) */}
        <Route path="/physics-games/grade/9/ohm-law-circuit-lab" element={<ProtectedRoute><OhmLawCircuitLab /></ProtectedRoute>} />
        <Route path="/physics-games/grade/9/circuit-builder-pro" element={<ProtectedRoute><CircuitBuilderPro /></ProtectedRoute>} />
        <Route path="/physics-games/grade/9/power-heat-master" element={<ProtectedRoute><PowerHeatMaster /></ProtectedRoute>} />
        
        {/* Grade 9 Physics Games - Chapter 2: Electromagnetism (Điện từ học) */}
        <Route path="/physics-games/grade/9/magnetic-field-explorer" element={<ProtectedRoute><MagneticFieldExplorer /></ProtectedRoute>} />
        <Route path="/physics-games/grade/9/electromagnetic-induction-lab" element={<ProtectedRoute><ElectromagneticInductionLab /></ProtectedRoute>} />
        <Route path="/physics-games/grade/9/ac-generator-simulator" element={<ProtectedRoute><ACGeneratorSimulator /></ProtectedRoute>} />
        
        {/* Grade 9 Physics Games - Chapter 3: Optics (Quang học) */}
        <Route path="/physics-games/grade/9/light-refraction-lab" element={<ProtectedRoute><LightRefractionLab /></ProtectedRoute>} />
        <Route path="/physics-games/grade/9/lens-optics-challenge" element={<ProtectedRoute><LensOpticsChallenge /></ProtectedRoute>} />
        <Route path="/physics-games/grade/9/color-spectrum-studio" element={<ProtectedRoute><ColorSpectrumStudio /></ProtectedRoute>} />
        
        {/* Grade 9 Physics Games - Chapter 4: Energy (Năng lượng) */}
        <Route path="/physics-games/grade/9/energy-transformation-quest" element={<ProtectedRoute><EnergyTransformationQuest /></ProtectedRoute>} />
        <Route path="/physics-games/grade/9/power-plant-manager" element={<ProtectedRoute><PowerPlantManager /></ProtectedRoute>} />
        <Route path="/physics-games/grade/9/energy-conservation-hero" element={<ProtectedRoute><EnergyConservationHero /></ProtectedRoute>} />

        {/* Grade 10 Physics Games - Chapter 1: Kinematics (Động học) */}
        <Route path="/physics-games/grade/10/motion-tracker" element={<ProtectedRoute><MotionTracker /></ProtectedRoute>} />
        <Route path="/physics-games/grade/10/free-fall-lab" element={<ProtectedRoute><FreeFallLab /></ProtectedRoute>} />
        
        {/* Grade 10 Physics Games - Chapter 2: Dynamics (Động lực học) */}
        <Route path="/physics-games/grade/10/newtons-laws-arena" element={<ProtectedRoute><NewtonsLawsArena /></ProtectedRoute>} />
        <Route path="/physics-games/grade/10/friction-tension-master" element={<ProtectedRoute><FrictionTensionMaster /></ProtectedRoute>} />
        
        {/* Grade 10 Physics Games - Chapter 3: Statics (Tĩnh học) */}
        <Route path="/physics-games/grade/10/equilibrium-challenge" element={<ProtectedRoute><EquilibriumChallenge /></ProtectedRoute>} />
        <Route path="/physics-games/grade/10/rotation-dynamics" element={<ProtectedRoute><RotationDynamics /></ProtectedRoute>} />
        
        {/* Grade 10 Physics Games - Chapter 4: Work & Energy (Công & Năng lượng) */}
        <Route path="/physics-games/grade/10/work-energy-theorem-lab" element={<ProtectedRoute><WorkEnergyTheoremLab /></ProtectedRoute>} />
        <Route path="/physics-games/grade/10/mechanical-energy-quest" element={<ProtectedRoute><MechanicalEnergyQuest /></ProtectedRoute>} />
        
        {/* Grade 10 Physics Games - Chapter 5: Thermodynamics (Nhiệt động lực học) */}
        <Route path="/physics-games/grade/10/heat-transfer-simulator" element={<ProtectedRoute><HeatTransferSimulator /></ProtectedRoute>} />
        <Route path="/physics-games/grade/10/gas-laws-explorer" element={<ProtectedRoute><GasLawsExplorer /></ProtectedRoute>} />
        
        {/* Grade 10 Physics Games - Chapter 6: Gas Physics (Chất khí) */}
        <Route path="/physics-games/grade/10/ideal-gas-playground" element={<ProtectedRoute><IdealGasPlayground /></ProtectedRoute>} />
        <Route path="/physics-games/grade/10/molecular-motion-studio" element={<ProtectedRoute><MolecularMotionStudio /></ProtectedRoute>} />
        
        {/* Grade 10 Physics Games - Chapter 7: Thermodynamic Cycles (Chu trình nhiệt động) */}
        <Route path="/physics-games/grade/10/thermodynamic-cycles" element={<ProtectedRoute><ThermodynamicCycles /></ProtectedRoute>} />
        <Route path="/physics-games/grade/10/heat-engine-optimizer" element={<ProtectedRoute><HeatEngineOptimizer /></ProtectedRoute>} />
        
        {/* Grade 11 Physics Games - Chapter 1: Oscillations (Dao động) */}
        <Route path="/physics-games/grade/11/simple-harmonic-motion-lab" element={<ProtectedRoute><SimpleHarmonicMotionLab /></ProtectedRoute>} />
        <Route path="/physics-games/grade/11/oscillation-energy-master" element={<ProtectedRoute><OscillationEnergyMaster /></ProtectedRoute>} />
        <Route path="/physics-games/grade/11/resonance-arena" element={<ProtectedRoute><ResonanceArena /></ProtectedRoute>} />
        
        {/* Grade 11 Physics Games - Chapter 2: Waves (Sóng) */}
        <Route path="/physics-games/grade/11/wave-interference-studio" element={<ProtectedRoute><WaveInterferenceStudio /></ProtectedRoute>} />
        <Route path="/physics-games/grade/11/sound-wave-explorer" element={<ProtectedRoute><SoundWaveExplorer /></ProtectedRoute>} />
        <Route path="/physics-games/grade/11/ultrasound-application-lab" element={<ProtectedRoute><UltrasoundApplicationLab /></ProtectedRoute>} />
        
        {/* Grade 11 Physics Games - Chapter 3: Electricity (Điện học) */}
        <Route path="/physics-games/grade/11/electric-field-visualizer" element={<ProtectedRoute><ElectricFieldVisualizer /></ProtectedRoute>} />
        <Route path="/physics-games/grade/11/capacitor-circuit-lab" element={<ProtectedRoute><CapacitorCircuitLab /></ProtectedRoute>} />
        <Route path="/physics-games/grade/11/dc-circuit-master" element={<ProtectedRoute><DCCircuitMaster /></ProtectedRoute>} />
        
        {/* Grade 11 Physics Games - Chapter 4: Magnetism (Từ học) */}
        <Route path="/physics-games/grade/11/magnetic-field-explorer" element={<ProtectedRoute><MagneticFieldExplorerGrade11 /></ProtectedRoute>} />
        <Route path="/physics-games/grade/11/electromagnetic-induction-lab" element={<ProtectedRoute><ElectromagneticInductionLabGrade11 /></ProtectedRoute>} />
        <Route path="/physics-games/grade/11/ac-circuit-simulator" element={<ProtectedRoute><ACCircuitSimulator /></ProtectedRoute>} />
        
        {/* Grade 12 Physics Games - Chapter 1: Electromagnetic Oscillations & Waves (Dao động & sóng điện từ) */}
        <Route path="/physics-games/grade/12/lc-oscillator-lab" element={<ProtectedRoute><LCOscillatorLab /></ProtectedRoute>} />
        <Route path="/physics-games/grade/12/electromagnetic-wave-studio" element={<ProtectedRoute><ElectromagneticWaveStudio /></ProtectedRoute>} />
        
        {/* Grade 12 Physics Games - Chapter 2: Light Waves (Sóng ánh sáng) */}
        <Route path="/physics-games/grade/12/light-interference-simulator" element={<ProtectedRoute><LightInterferenceSimulator /></ProtectedRoute>} />
        <Route path="/physics-games/grade/12/spectrum-explorer" element={<ProtectedRoute><SpectrumExplorer /></ProtectedRoute>} />
        
        {/* Grade 12 Physics Games - Chapter 3: Quantum of Light (Lượng tử ánh sáng) */}
        <Route path="/physics-games/grade/12/photoelectric-effect-lab" element={<ProtectedRoute><PhotoelectricEffectLab /></ProtectedRoute>} />
        <Route path="/physics-games/grade/12/solar-cell-optimizer" element={<ProtectedRoute><SolarCellOptimizer /></ProtectedRoute>} />
        
        {/* Grade 12 Physics Games - Chapter 4: Nuclear Physics (Vật lý hạt nhân) */}
        <Route path="/physics-games/grade/12/nuclear-reaction-chamber" element={<ProtectedRoute><NuclearReactionChamber /></ProtectedRoute>} />
        <Route path="/physics-games/grade/12/radioactive-decay-simulator" element={<ProtectedRoute><RadioactiveDecaySimulator /></ProtectedRoute>} />

        {/* Admin Panel Routes */}
        <Route path="/admin/login" element={
          <AdminAuthProvider>
            <AdminLogin />
          </AdminAuthProvider>
        } />
        <Route path="/admin" element={
          <AdminAuthProvider>
            <AdminLayout />
          </AdminAuthProvider>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="lessons" element={<AdminLessons />} />
          <Route path="exercises" element={<AdminExercises />} />
          <Route path="statistics" element={<AdminStatistics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Teacher Panel Routes */}
        <Route path="/teacher/pending" element={
          <TeacherAuthProvider>
            <PendingApproval />
          </TeacherAuthProvider>
        } />
        <Route path="/teacher" element={
          <TeacherAuthProvider>
            <TeacherLayout />
          </TeacherAuthProvider>
        }>
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="my-lessons" element={<MyLessons />} />
          <Route path="my-exercises" element={<MyExercises />} />
          <Route path="my-experiments" element={<MyExperiments />} />
          <Route path="browse" element={<BrowseContent />} />
          <Route path="students" element={<StudentStats />} />
          <Route path="classes" element={<ClassManagement />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="create" element={<TeacherDashboard />} />
        </Route>
      </Routes>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <GameProgressProvider>
            <AppContent />
          </GameProgressProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

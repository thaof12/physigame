import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

// Physics challenge games
import BalanceChallenge from './areas/Vatly/challenges/BalanceChallenge/BalanceChallenge';
import ForceWorldGame from './areas/Vatly/challenges/ForceWorldGame/ForceWorldGame';
import WaterLab from './areas/Vatly/challenges/WaterLab/WaterLab';
import BoilingGame from './areas/Vatly/challenges/BoilingGame/BoilingGame';
import ThermalEnergyGame from './areas/Vatly/challenges/ThermalEnergyGame/ThermalEnergyGame';
import LightReflectionGame from './areas/Vatly/challenges/LightReflectionGame/LightReflectionGame';
import LightPathGame from './areas/Vatly/challenges/LightPathGame/LightPathGame';
import MirrorLabGame from './areas/Vatly/challenges/MirrorLabGame/MirrorLabGame';
import RaceTracker from './areas/Vatly/challenges/RaceTracker/RaceTracker';
import ForceArena from './areas/Vatly/challenges/ForceArena/ForceArena';
import ProjectileMotion from './areas/Vatly/challenges/ProjectileMotion/ProjectileMotion';
import CircuitBuilderGame from './areas/Vatly/challenges/CircuitBuilderGame/CircuitBuilderGame';


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
          
          <Route path="/physics-games" element={<AdvancedPhysicsChallenge />} />
          <Route path="/advanced-physics-challenge" element={<AdvancedPhysicsChallenge />} />
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
        <Route path="/advanced-physics-challenge/projectile" element={<ProtectedRoute><ProjectileMotion /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/water" element={<ProtectedRoute><WaterLab /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/boiling" element={<ProtectedRoute><BoilingGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/thermal-energy" element={<ProtectedRoute><ThermalEnergyGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/light-reflection" element={<ProtectedRoute><LightReflectionGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/mirror-lab" element={<ProtectedRoute><MirrorLabGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/light-path" element={<ProtectedRoute><LightPathGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/circuit-builder" element={<ProtectedRoute><CircuitBuilderGame /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/race-tracker" element={<ProtectedRoute><RaceTracker /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/force-arena" element={<ProtectedRoute><ForceArena /></ProtectedRoute>} />
        <Route path="/advanced-physics-challenge/force-world" element={<ProtectedRoute><ForceWorldGame /></ProtectedRoute>} />


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

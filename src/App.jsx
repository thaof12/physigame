import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Wrench } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GameProgressProvider } from './contexts/GameProgressContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';

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
import MyClass from './pages/MyClass';
import Login from './pages/Login';
import Register from './pages/Register';
import MainLayout from './components/layout/MainLayout';

// Support Pages
import UserGuide from './pages/support/UserGuide';
import FAQ from './pages/support/FAQ';
import PrivacyPolicy from './pages/support/PrivacyPolicy';
import TermsOfService from './pages/support/TermsOfService';

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
import BrowseContent from './areas/Teacher/pages/BrowseContent';
import StudentStats from './areas/Teacher/pages/StudentStats';
import ClassManagement from './areas/Teacher/pages/ClassManagement';
import TeacherProfile from './areas/Teacher/pages/TeacherProfile';


const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.status === 'inactive') {
    return <Navigate to="/login" replace state={{ error: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.' }} />;
  }
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const { user, refreshUser } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    if (user && user.uid !== 'admin-hardcoded') {
      refreshUser().catch((err) => console.log('Status verification skipped:', err.message));
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/settings');
        const settings = await response.json();
        
        // Cập nhật tiêu đề và mô tả website
        if (settings.siteName) {
          document.title = settings.siteName;
        }
        if (settings.siteDescription) {
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = "description";
            document.head.appendChild(metaDesc);
          }
          metaDesc.content = settings.siteDescription;
        }

        if (settings.maintenanceMode) {
          setMaintenanceMode(true);
        }
      } catch (e) {
        console.error('Failed to fetch settings in App', e);
      }
    };
    fetchSettings();
  }, []);

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (maintenanceMode && !isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-24 h-24 mb-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
          <Wrench className="w-12 h-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Hệ thống đang bảo trì</h1>
        <p className="text-slate-500 text-lg font-medium max-w-md mx-auto mb-8 leading-relaxed">
          Chúng tôi đang tiến hành một số thay đổi nhằm nâng cấp hệ thống để mang lại trải nghiệm sử dụng tốt hơn. Xin lỗi vì sự bất tiện này.
        </p>
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-full shadow-sm text-sm font-bold text-slate-500 uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          Đang cập nhật...
        </div>
      </div>
    );
  }

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
          <Route path="/my-class" element={<ProtectedRoute><MyClass /></ProtectedRoute>} />


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

          {/* Support Pages */}
          <Route path="/support/guide" element={<UserGuide />} />
          <Route path="/support/faq" element={<FAQ />} />
          <Route path="/support/privacy" element={<PrivacyPolicy />} />
          <Route path="/support/terms" element={<TermsOfService />} />
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



        <Route path="/admin/login" element={<Navigate to="/login" replace />} />

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
          <Route path="browse" element={<BrowseContent />} />
          <Route path="students" element={<Navigate to="/teacher/dashboard" replace />} />
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

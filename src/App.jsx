import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Wrench } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GameProgressProvider } from './contexts/GameProgressContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MainLayout from './components/layout/MainLayout';
import PhysicsHome from './areas/Vatly/pages/PhysicsHome';

import "./index.css";

// Lazy-loaded components for better load performance (code splitting)

// Physics Tools Hub
const PhysicsToolsHub = lazy(() => import('./pages/PhysicsToolsHub'));
const PhysicsCalculator = lazy(() => import('./components/PhysicsTools/PhysicsCalculator'));
const ConstantsReference = lazy(() => import('./components/PhysicsTools/ConstantsReference'));
const UnitConverter = lazy(() => import('./components/PhysicsTools/UnitConverter'));

// Interactive Lecture Hub
const InteractiveLectureHub = lazy(() => import('./pages/InteractiveLectureHub'));
const LectureGradeSelector = lazy(() => import('./pages/LectureGradeSelector'));
const LectureViewer = lazy(() => import('./components/LectureViewer'));
const LectureClassSelector = lazy(() => import('./components/LectureClassSelector'));
const Profile = lazy(() => import('./pages/Profile'));
const PlacementTest = lazy(() => import('./pages/PlacementTest'));
const MyClass = lazy(() => import('./pages/MyClass'));

// Support Pages
const UserGuide = lazy(() => import('./pages/support/UserGuide'));
const FAQ = lazy(() => import('./pages/support/FAQ'));
const PrivacyPolicy = lazy(() => import('./pages/support/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/support/TermsOfService'));

// Physics area pages
const PhysicsClassDashboard = lazy(() => import('./areas/Vatly/pages/PhysicsClassDashboard'));
const PhysicsClasses = lazy(() => import('./areas/Vatly/pages/PhysicsClasses'));
const PhysicsLesson = lazy(() => import('./areas/Vatly/pages/PhysicsLesson'));
const AdvancedPhysicsChallenge = lazy(() => import('./areas/Vatly/gamelist/AdvancedPhysicsChallenge'));

// Physics challenge games
const BalanceChallenge = lazy(() => import('./areas/Vatly/challenges/BalanceChallenge/BalanceChallenge'));
const ForceWorldGame = lazy(() => import('./areas/Vatly/challenges/ForceWorldGame/ForceWorldGame'));
const WaterLab = lazy(() => import('./areas/Vatly/challenges/WaterLab/WaterLab'));
const BoilingGame = lazy(() => import('./areas/Vatly/challenges/BoilingGame/BoilingGame'));
const ThermalEnergyGame = lazy(() => import('./areas/Vatly/challenges/ThermalEnergyGame/ThermalEnergyGame'));
const LightReflectionGame = lazy(() => import('./areas/Vatly/challenges/LightReflectionGame/LightReflectionGame'));
const LightPathGame = lazy(() => import('./areas/Vatly/challenges/LightPathGame/LightPathGame'));
const MirrorLabGame = lazy(() => import('./areas/Vatly/challenges/MirrorLabGame/MirrorLabGame'));
const RaceTracker = lazy(() => import('./areas/Vatly/challenges/RaceTracker/RaceTracker'));
const ForceArena = lazy(() => import('./areas/Vatly/challenges/ForceArena/ForceArena'));
const ProjectileMotion = lazy(() => import('./areas/Vatly/challenges/ProjectileMotion/ProjectileMotion'));
const CircuitBuilderGame = lazy(() => import('./areas/Vatly/challenges/CircuitBuilderGame/CircuitBuilderGame'));

// PK Battle System
const PKLobby = lazy(() => import('./pages/PKBattle/PKLobby'));
const PKMatchmaking = lazy(() => import('./pages/PKBattle/PKMatchmaking'));
const PKBattleRoom = lazy(() => import('./pages/PKBattle/PKBattleRoom'));
const PKResult = lazy(() => import('./pages/PKBattle/PKResult'));

// Virtual Lab (Phòng thí nghiệm ảo)
const VirtualLabHome = lazy(() => import('./areas/Vatly/VirtualLab/pages/VirtualLabHome'));
const PendulumLab = lazy(() => import('./areas/Vatly/VirtualLab/experiments/PendulumLab'));
const FreeFallLabVirtual = lazy(() => import('./areas/Vatly/VirtualLab/experiments/FreeFallLab'));
const OhmLawLab = lazy(() => import('./areas/Vatly/VirtualLab/experiments/OhmLawLab'));
const LensOpticsLab = lazy(() => import('./areas/Vatly/VirtualLab/experiments/LensOpticsLab'));
const StandingWaveLab = lazy(() => import('./areas/Vatly/VirtualLab/experiments/StandingWaveLab'));
const CalorimeterLab = lazy(() => import('./areas/Vatly/VirtualLab/experiments/CalorimeterLab'));
const InclinedPlaneLab = lazy(() => import('./areas/Vatly/VirtualLab/experiments/InclinedPlaneLab'));
const ResistorCircuitLab = lazy(() => import('./areas/Vatly/VirtualLab/experiments/ResistorCircuitLab'));
const LightInterferenceLab = lazy(() => import('./areas/Vatly/VirtualLab/experiments/LightInterferenceLab'));

// Admin Panel
import { AdminAuthProvider } from './areas/Admin/contexts/AdminAuthContext';
const AdminLayout = lazy(() => import('./areas/Admin/layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./areas/Admin/pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./areas/Admin/pages/AdminUsers'));
const AdminLessons = lazy(() => import('./areas/Admin/pages/AdminLessons'));
const AdminExercises = lazy(() => import('./areas/Admin/pages/AdminExercises'));
const AdminStatistics = lazy(() => import('./areas/Admin/pages/AdminStatistics'));
const AdminSettings = lazy(() => import('./areas/Admin/pages/AdminSettings'));

// Teacher Panel
import { TeacherAuthProvider } from './areas/Teacher/contexts/TeacherAuthContext';
const TeacherLayout = lazy(() => import('./areas/Teacher/layouts/TeacherLayout'));
const TeacherDashboard = lazy(() => import('./areas/Teacher/pages/TeacherDashboard'));
const PendingApproval = lazy(() => import('./areas/Teacher/pages/PendingApproval'));
const MyLessons = lazy(() => import('./areas/Teacher/pages/MyLessons'));
const MyExercises = lazy(() => import('./areas/Teacher/pages/MyExercises'));
const BrowseContent = lazy(() => import('./areas/Teacher/pages/BrowseContent'));
const ClassManagement = lazy(() => import('./areas/Teacher/pages/ClassManagement'));
const TeacherProfile = lazy(() => import('./areas/Teacher/pages/TeacherProfile'));


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
      const isPendingTeacher = user.role === 'teacher' && 
        (user.teacherStatus === 'pending' || user.teacher_status === 'pending');
      
      // Only refresh user profile on page change if they are a pending teacher waiting for approval
      if (isPendingTeacher) {
        refreshUser().catch((err) => console.log('Status verification skipped:', err.message));
      }
    }
  }, [location.pathname, user?.role, user?.teacherStatus, user?.teacher_status]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
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

          {/* Physics Tools - redirect hub to calculator */}
          <Route path="/physics-tools" element={<Navigate to="/physics-tools/calculator" replace />} />
          <Route path="/physics-tools/calculator" element={<ProtectedRoute><PhysicsCalculator /></ProtectedRoute>} />
          <Route path="/physics-tools/constants" element={<ProtectedRoute><ConstantsReference /></ProtectedRoute>} />
          <Route path="/physics-tools/converter" element={<ProtectedRoute><UnitConverter /></ProtectedRoute>} />

          {/* Interactive Lecture Hub Routes */}
          <Route path="/interactive-lectures" element={<ProtectedRoute><InteractiveLectureHub /></ProtectedRoute>} />
          <Route path="/interactive-lectures/:subject" element={<ProtectedRoute><LectureGradeSelector /></ProtectedRoute>} />
          <Route path="/interactive-lectures/:subject/:grade" element={<ProtectedRoute><LectureClassSelector /></ProtectedRoute>} />
          <Route path="/interactive-lectures/:subject/:grade/:lectureId" element={<ProtectedRoute><LectureViewer /></ProtectedRoute>} />

          {/* Legacy Physics Calculator - redirect to calculator */}
          <Route path="/physics-calculator" element={<Navigate to="/physics-tools/calculator" replace />} />

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
            <Suspense fallback={
              <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-[#274dad] border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-lg shadow-[#274dad]/10"></div>
                  <h2 className="font-heading text-2xl font-extrabold text-[#274dad] italic tracking-tight mb-2">Eureka</h2>
                  <p className="font-body text-slate-500 font-bold text-sm tracking-wide uppercase">Đang tải tài nguyên học tập...</p>
                </div>
              </div>
            }>
              <AppContent />
            </Suspense>
          </GameProgressProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

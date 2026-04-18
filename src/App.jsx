import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GameProgressProvider } from './contexts/GameProgressContext';
import { GameScoreProvider } from './contexts/GameScoreContext';
import GameJourney from './pages/GameJourney';
import "./index.css";

// Hóa học area
import ChemistryHome from './areas/Hoahoc/pages/ChemistryHome';
import Dashboard from './areas/Hoahoc/pages/Dashboard';
import ClassDashboard from './areas/Hoahoc/pages/ClassDashboard';
import LessonSimple from './areas/Hoahoc/pages/LessonSimple';
import GamePlay from './areas/Hoahoc/pages/GamePlay';
import AdvancedChallenge from './areas/Hoahoc/pages/AdvancedChallenge';
import GhepNguyenTu from './areas/Hoahoc/challenges/GhepNguyenTu';
import TroChoiCanBang from './areas/Hoahoc/challenges/TroChoiCanBang';
import SuyLuanPhanUng from './areas/Hoahoc/challenges/SuyLuanPhanUng';
import DuoiHinhBatChu from './areas/Hoahoc/challenges/DuoiHinhBatChu';
import NhanBietDungDich from './areas/Hoahoc/challenges/NhanBietDungDich';
import XayDungPhanTu from './areas/Hoahoc/challenges/XayDungPhanTu';
import PhaCheDungDich from './areas/Hoahoc/challenges/PhaCheDungDich';
import CauTrucNguyenTu from './areas/Hoahoc/challenges/CauTrucNguyenTu';
import PhongThiNghiem from './areas/Hoahoc/challenges/PhongThiNghiem';
import TinhOxiHoa from './areas/Hoahoc/challenges/TinhOxiHoa';

// Physics area
import PhysicsHome from './areas/Vatly/pages/PhysicsHome';
import PhysicsDashboard from './areas/Vatly/pages/PhysicsDashboard';
import PhysicsClassDashboard from './areas/Vatly/pages/PhysicsClassDashboard';
import PhysicsLesson from './areas/Vatly/pages/PhysicsLesson';
import AdvancedPhysicsChallenge from './areas/Vatly/gamelist/AdvancedPhysicsChallenge';
import PhysicsGradeSelector from './areas/Vatly/gamelist/PhysicsGradeSelector';
import PhysicsGradeGames from './areas/Vatly/gamelist/PhysicsGradeGames';
import PhysicsChallengeRouter from './areas/Vatly/gamelist/PhysicsChallengeRouter';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import ProgramSelection from './pages/ProgramSelection';
import Home from './pages/Home';
import Profile from './pages/Profile';
import PlacementTest from './pages/PlacementTest';

// Physics Tools
import PhysicsToolsHub from './pages/PhysicsToolsHub';
import PhysicsCalculator from './components/PhysicsTools/PhysicsCalculator';
import ConstantsReference from './components/PhysicsTools/ConstantsReference';
import UnitConverter from './components/PhysicsTools/UnitConverter';
import DialogflowChatbot from './components/DialogflowChatbot';

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/program-selection" element={<ProgramSelection />} />
      <Route path="/home" element={<Home />} />
      <Route path="/game-journey" element={<GameJourney />} />
      <Route path="/program/chemistry" element={<ChemistryHome />} />
      <Route path="/advanced-challenge" element={<AdvancedChallenge />} />
      <Route path="/advanced-challenge/ghep-nguyen-tu" element={<GhepNguyenTu />} />
      <Route path="/advanced-challenge/can-bang" element={<TroChoiCanBang />} />
      <Route path="/advanced-challenge/suy-luan" element={<SuyLuanPhanUng />} />
      <Route path="/advanced-challenge/duoi-hinh" element={<DuoiHinhBatChu />} />
      <Route path="/advanced-challenge/nhan-biet-dung-dich" element={<NhanBietDungDich />} />
      <Route path="/advanced-challenge/xay-dung-phan-tu" element={<XayDungPhanTu />} />
      <Route path="/advanced-challenge/pha-che-dung-dich" element={<PhaCheDungDich />} />
      <Route path="/advanced-challenge/cau-truc-nguyen-tu" element={<CauTrucNguyenTu />} />
      <Route path="/advanced-challenge/phong-thi-nghiem" element={<PhongThiNghiem />} />
      <Route path="/advanced-challenge/tinh-oxi-hoa" element={<TinhOxiHoa />} />
      <Route path="/program/chemistry/dashboard" element={<Dashboard />} />
      <Route path="/class/:classId" element={<ClassDashboard />} />
      <Route path="/lesson/:classId/:chapterId/:lessonId" element={<LessonSimple />} />
      <Route path="/gameplay/:classId/:chapterId/:lessonId/:level?" element={<GamePlay />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/placement-test/:programId?" element={<PlacementTest />} />
      
      {/* Physics Routes */}
      <Route path="/program/physics" element={<PhysicsHome />} />
      <Route path="/program/physics/dashboard" element={<PhysicsDashboard />} />
      <Route path="/physics-class/:classId" element={<PhysicsClassDashboard />} />
      <Route path="/physics-lesson/:classId/:chapterId/:lessonId" element={<PhysicsLesson />} />
      
      {/* Physics Tools Routes */}
      <Route path="/physics-tools" element={<PhysicsToolsHub />} />
      <Route path="/physics-tools/calculator" element={<PhysicsCalculator />} />
      <Route path="/physics-tools/constants" element={<ConstantsReference />} />
      <Route path="/physics-tools/converter" element={<UnitConverter />} />
      
      {/* Physics Games Routes */}
      <Route path="/advanced-physics-challenge" element={<AdvancedPhysicsChallenge />} />
      <Route path="/advanced-physics-challenge/:slug" element={<PhysicsChallengeRouter />} />
      <Route path="/physics-games/grades" element={<PhysicsGradeSelector />} />
      <Route path="/physics-games/grade/:gradeId" element={<PhysicsGradeGames />} />
      <Route path="/physics-games/grade/:gradeId/:gameSlug" element={<PhysicsChallengeRouter />} />
    </Routes>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <GameProgressProvider>
          <GameScoreProvider>
            <AppContent />
            <DialogflowChatbot />
          </GameScoreProvider>
        </GameProgressProvider>
      </AuthProvider>
    </Router>
  );
}



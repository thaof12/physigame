import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import ProgramSelection from './pages/ProgramSelection';
import Profile from './pages/Profile';
import PlacementTest from './pages/PlacementTest';
import Login from './pages/Login';
import Register from './pages/Register';

// Hóa học area
import ChemistryHome from './areas/Hoahoc/pages/ChemistryHome';
import Dashboard from './areas/Hoahoc/pages/Dashboard';
import ClassDashboard from './areas/Hoahoc/pages/ClassDashboard';
import Lesson from './areas/Hoahoc/pages/Lesson';
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
import AdvancedPhysicsChallenge from './areas/Vatly/gamelist/AdvancedPhysicsChallenge';

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


const AppContent = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProgramSelection />} />
        <Route path="/home" element={<Home />} />
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
        <Route 
          path="/program/chemistry/dashboard" 
          element={
              <Dashboard />
          } 
        />
        <Route 
          path="/class/:classId" 
          element={<ClassDashboard />}
        />
        <Route 
          path="/lesson/:classId/:chapterId/:lessonId" 
          element={<LessonSimple />}
        />
       <Route 
         path="/gameplay/:classId/:chapterId/:lessonId/:level?" 
         element={<GamePlay />}
       />
        <Route 
          path="/profile" 
          element={
              <Profile />
          } 
        />
        <Route 
          path="/placement-test/:programId?" 
          element={<PlacementTest />}
        />

        {/* Physics Routes */}
        <Route path="/program/physics" element={<PhysicsHome />} />
        <Route path="/program/physics/dashboard" element={<PhysicsDashboard />} />
        <Route path="/physics-class/:classId" element={<PhysicsClassDashboard />} />
        <Route path="/advanced-physics-challenge" element={<AdvancedPhysicsChallenge />} />

        {/* Physics Challenge Games */}
        <Route path="/advanced-physics-challenge/balance" element={<BalanceChallenge />} />
        <Route path="/advanced-physics-challenge/color-master" element={<ColorMaster />} />
        <Route path="/advanced-physics-challenge/electromagnetic" element={<ElectromagneticLab />} />
        <Route path="/advanced-physics-challenge/nanolab" element={<NanoLab />} />
        <Route path="/advanced-physics-challenge/plasma" element={<PlasmaGame />} />
        <Route path="/advanced-physics-challenge/projectile" element={<ProjectileMotion />} />
        <Route path="/advanced-physics-challenge/static" element={<StaticElectricity />} />
        <Route path="/advanced-physics-challenge/thermo" element={<ThermoLab />} />
        <Route path="/advanced-physics-challenge/water" element={<WaterLab />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

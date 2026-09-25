/**
 * Route preloading utility
 * Preloads code-split components on hover/intent to achieve 0ms transition latency.
 */
const routeModules = {
  '/physics-classes': () => import('../areas/Vatly/pages/PhysicsClasses'),
  '/interactive-lectures': () => import('../pages/InteractiveLectureHub'),
  '/my-class': () => import('../pages/MyClass'),
  '/physics-tools/calculator': () => import('../components/PhysicsTools/PhysicsCalculator'),
  '/physics-tools/constants': () => import('../components/PhysicsTools/ConstantsReference'),
  '/physics-tools/converter': () => import('../components/PhysicsTools/UnitConverter'),
  '/advanced-physics-challenge': () => import('../areas/Vatly/gamelist/AdvancedPhysicsChallenge'),
  '/vatly/virtual-lab': () => import('../areas/Vatly/VirtualLab/pages/VirtualLabHome'),
  '/pk-battle': () => import('../pages/PKBattle/PKLobby'),
  '/support/contact': () => import('../pages/support/StudentSupportPage'),
  '/profile': () => import('../pages/Profile'),
  '/teacher/dashboard': () => import('../areas/Teacher/pages/TeacherDashboard'),
  '/teacher/classes': () => import('../areas/Teacher/pages/ClassManagement'),
  '/teacher/browse': () => import('../areas/Teacher/pages/BrowseContent'),
};

const preloadedSet = new Set();

export const preloadRoute = (path) => {
  if (!path || preloadedSet.has(path)) return;
  const loader = routeModules[path];
  if (loader) {
    preloadedSet.add(path);
    loader().catch(() => {
      preloadedSet.delete(path);
    });
  }
};

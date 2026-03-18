// Game router map - ánh xạ slug sang component
// ⭐ BalanceChallengeExample là ví dụ game mới có hỗ trợ scoring
import BalanceChallengeExample from '../challenges/BalanceChallengeExample';
import ColorMaster from '../challenges/ColorMaster/ColorMaster';
import ElectromagneticLab from '../challenges/ElectromagneticLab/ElectromagneticLab';
import NanoLab from '../challenges/NanoLab/NanoLab';
// import PlasmaGame from '../challenges/PlasmaGame/PlasmaGame'; // ⚠️ Temp fix syntax error
import ProjectileMotion from '../challenges/ProjectileMotion/ProjectileMotion';
import StaticElectricity from '../challenges/StaticElectricity/StaticElectricity';
import ThermoLab from '../challenges/ThermoLab/ThermoLab';
import WaterLab from '../challenges/WaterLab/WaterLab';

// Game component mapping
export const gameComponentMap = {
  'balance': BalanceChallengeExample, // ⭐ Ví dụ game mới có scoring
  'color-master': ColorMaster,
  'electromagnetic': ElectromagneticLab,
  'nanolab': NanoLab,
  // 'plasma': PlasmaGame, // ⚠️ Temp fix
  'projectile': ProjectileMotion,
  'static': StaticElectricity,
  'thermo': ThermoLab,
  'water': WaterLab,
};

// Grade games mapping
export const gradeGamesMap = {
  6: ['balance'],
  7: ['color-master'],
  8: ['electromagnetic', 'nanolab', 'thermo'],
  9: ['projectile', 'static', 'water'],
  10: [],
  11: [],
  12: []
};

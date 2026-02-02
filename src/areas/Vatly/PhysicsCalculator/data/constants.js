/**
 * Hằng số vật lý cơ bản
 * Sử dụng trong các công thức tính toán
 */

export const PHYSICS_CONSTANTS = {
  // Hằng số cơ học
  g: {
    value: 9.8,
    name: 'Gia tốc trọng trường',
    symbol: 'g',
    unit: 'm/s²',
    description: 'Gia tốc rơi tự do trên Trái Đất'
  },
  G: {
    value: 6.674e-11,
    name: 'Hằng số hấp dẫn',
    symbol: 'G',
    unit: 'N·m²/kg²',
    description: 'Hằng số hấp dẫn vũ trụ'
  },

  // Hằng số điện từ
  k: {
    value: 9e9,
    name: 'Hằng số Coulomb',
    symbol: 'k',
    unit: 'N·m²/C²',
    description: 'Hằng số trong định luật Coulomb'
  },
  epsilon0: {
    value: 8.854e-12,
    name: 'Hằng số điện môi chân không',
    symbol: 'ε₀',
    unit: 'F/m',
    description: 'Độ điện thẩm của chân không'
  },
  mu0: {
    value: 4 * Math.PI * 1e-7,
    name: 'Độ từ thẩm chân không',
    symbol: 'μ₀',
    unit: 'H/m',
    description: 'Độ từ thẩm của chân không'
  },
  e: {
    value: 1.6e-19,
    name: 'Điện tích electron',
    symbol: 'e',
    unit: 'C',
    description: 'Độ lớn điện tích nguyên tố'
  },

  // Hằng số quang học & lượng tử
  c: {
    value: 3e8,
    name: 'Tốc độ ánh sáng',
    symbol: 'c',
    unit: 'm/s',
    description: 'Tốc độ ánh sáng trong chân không'
  },
  h: {
    value: 6.626e-34,
    name: 'Hằng số Planck',
    symbol: 'h',
    unit: 'J·s',
    description: 'Hằng số Planck'
  },
  hBar: {
    value: 1.055e-34,
    name: 'Hằng số Planck rút gọn',
    symbol: 'ℏ',
    unit: 'J·s',
    description: 'h/2π'
  },

  // Hằng số nhiệt động lực học
  R: {
    value: 8.314,
    name: 'Hằng số khí lý tưởng',
    symbol: 'R',
    unit: 'J/(mol·K)',
    description: 'Hằng số khí'
  },
  kB: {
    value: 1.381e-23,
    name: 'Hằng số Boltzmann',
    symbol: 'kB',
    unit: 'J/K',
    description: 'Hằng số Boltzmann'
  },
  NA: {
    value: 6.022e23,
    name: 'Số Avogadro',
    symbol: 'NA',
    unit: '1/mol',
    description: 'Số hạt trong 1 mol'
  },

  // Hằng số hạt nhân
  u: {
    value: 1.66054e-27,
    name: 'Đơn vị khối lượng nguyên tử',
    symbol: 'u',
    unit: 'kg',
    description: '1 đơn vị khối lượng nguyên tử'
  },
  me: {
    value: 9.109e-31,
    name: 'Khối lượng electron',
    symbol: 'mₑ',
    unit: 'kg',
    description: 'Khối lượng nghỉ của electron'
  },
  mp: {
    value: 1.673e-27,
    name: 'Khối lượng proton',
    symbol: 'mₚ',
    unit: 'kg',
    description: 'Khối lượng nghỉ của proton'
  },
  mn: {
    value: 1.675e-27,
    name: 'Khối lượng neutron',
    symbol: 'mₙ',
    unit: 'kg',
    description: 'Khối lượng nghỉ của neutron'
  },

  // Hằng số toán học
  pi: {
    value: Math.PI,
    name: 'Pi',
    symbol: 'π',
    unit: '',
    description: 'Số pi'
  }
};

// Hàm lấy giá trị hằng số
export const getConstant = (key) => {
  return PHYSICS_CONSTANTS[key]?.value || null;
};

// Danh sách hằng số theo nhóm
export const CONSTANT_GROUPS = {
  mechanics: ['g', 'G'],
  electromagnetic: ['k', 'epsilon0', 'mu0', 'e'],
  optics: ['c', 'h', 'hBar'],
  thermodynamics: ['R', 'kB', 'NA'],
  nuclear: ['u', 'me', 'mp', 'mn'],
  math: ['pi']
};

export default PHYSICS_CONSTANTS;

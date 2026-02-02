/**
 * PhysicsEngine.js - Xử lý vật lý cho Virtual Lab
 * 
 * Hỗ trợ:
 * - Cơ học: Rơi tự do, dao động, chuyển động
 * - Điện học: Định luật Ôm, mạch điện
 * - Quang học: Khúc xạ, phản xạ, thấu kính
 * - Sóng: Giao thoa, sóng dừng
 */

// Các hằng số vật lý
export const PHYSICS_CONSTANTS = {
  g: 9.8,           // Gia tốc trọng trường (m/s²)
  c: 3e8,           // Tốc độ ánh sáng (m/s)
  h: 6.626e-34,     // Hằng số Planck (J.s)
  k: 8.99e9,        // Hằng số Coulomb (N.m²/C²)
  e: 1.6e-19,       // Điện tích electron (C)
  me: 9.109e-31,    // Khối lượng electron (kg)
  R: 8.314,         // Hằng số khí lý tưởng (J/mol.K)
  Na: 6.022e23,     // Số Avogadro
  sigma: 5.67e-8,   // Hằng số Stefan-Boltzmann (W/m².K⁴)
};

/**
 * Cơ học - Rơi tự do
 */
export const FreeFall = {
  // Tính thời gian rơi: t = √(2h/g)
  calculateTime: (height, g = PHYSICS_CONSTANTS.g) => {
    if (height < 0) return 0;
    return Math.sqrt((2 * height) / g);
  },

  // Tính vận tốc cuối: v = √(2gh)
  calculateFinalVelocity: (height, g = PHYSICS_CONSTANTS.g) => {
    if (height < 0) return 0;
    return Math.sqrt(2 * g * height);
  },

  // Tính độ cao tại thời điểm t: h(t) = h0 - 0.5*g*t²
  calculateHeight: (initialHeight, time, g = PHYSICS_CONSTANTS.g) => {
    const h = initialHeight - 0.5 * g * time * time;
    return Math.max(0, h);
  },

  // Tính vận tốc tại thời điểm t: v(t) = g*t
  calculateVelocity: (time, g = PHYSICS_CONSTANTS.g) => {
    return g * time;
  },

  // Tính gia tốc từ h và t: g = 2h/t²
  calculateG: (height, time) => {
    if (time <= 0) return 0;
    return (2 * height) / (time * time);
  }
};

/**
 * Cơ học - Dao động điều hòa (Con lắc đơn)
 */
export const SimplePendulum = {
  // Tính chu kỳ: T = 2π√(L/g)
  calculatePeriod: (length, g = PHYSICS_CONSTANTS.g) => {
    if (length <= 0) return 0;
    return 2 * Math.PI * Math.sqrt(length / g);
  },

  // Tính tần số: f = 1/T
  calculateFrequency: (length, g = PHYSICS_CONSTANTS.g) => {
    const T = SimplePendulum.calculatePeriod(length, g);
    return T > 0 ? 1 / T : 0;
  },

  // Tính gia tốc g từ T và L: g = 4π²L/T²
  calculateG: (length, period) => {
    if (period <= 0) return 0;
    return (4 * Math.PI * Math.PI * length) / (period * period);
  },

  // Tính vị trí góc theo thời gian: θ(t) = θ₀ * cos(ωt + φ)
  calculateAngle: (amplitude, length, time, phase = 0, g = PHYSICS_CONSTANTS.g) => {
    const omega = Math.sqrt(g / length);
    return amplitude * Math.cos(omega * time + phase);
  },

  // Tính vận tốc góc: ω = dθ/dt = -θ₀ * ω * sin(ωt + φ)
  calculateAngularVelocity: (amplitude, length, time, phase = 0, g = PHYSICS_CONSTANTS.g) => {
    const omega = Math.sqrt(g / length);
    return -amplitude * omega * Math.sin(omega * time + phase);
  },

  // Tính tọa độ x, y của quả cầu
  calculatePosition: (pivotX, pivotY, length, angle) => {
    const x = pivotX + length * Math.sin(angle);
    const y = pivotY + length * Math.cos(angle);
    return { x, y };
  }
};

/**
 * Điện học - Định luật Ôm
 */
export const OhmLaw = {
  // I = U/R
  calculateCurrent: (voltage, resistance) => {
    if (resistance <= 0) return 0;
    return voltage / resistance;
  },

  // U = I*R
  calculateVoltage: (current, resistance) => {
    return current * resistance;
  },

  // R = U/I
  calculateResistance: (voltage, current) => {
    if (current <= 0) return Infinity;
    return voltage / current;
  },

  // Công suất: P = U*I = I²R = U²/R
  calculatePower: (voltage, current) => {
    return voltage * current;
  },

  // Điện trở nối tiếp: R = R1 + R2 + ... + Rn
  seriesResistance: (resistances) => {
    return resistances.reduce((sum, r) => sum + r, 0);
  },

  // Điện trở song song: 1/R = 1/R1 + 1/R2 + ... + 1/Rn
  parallelResistance: (resistances) => {
    const sum = resistances.reduce((s, r) => s + (r > 0 ? 1 / r : 0), 0);
    return sum > 0 ? 1 / sum : 0;
  }
};

/**
 * Quang học - Thấu kính
 */
export const LensOptics = {
  // Công thức thấu kính: 1/f = 1/d + 1/d'
  calculateImageDistance: (focalLength, objectDistance) => {
    if (objectDistance === focalLength) return Infinity;
    return (focalLength * objectDistance) / (objectDistance - focalLength);
  },

  // Tính tiêu cự từ d và d'
  calculateFocalLength: (objectDistance, imageDistance) => {
    if (objectDistance + imageDistance === 0) return Infinity;
    return (objectDistance * imageDistance) / (objectDistance + imageDistance);
  },

  // Độ phóng đại: k = -d'/d = h'/h
  calculateMagnification: (objectDistance, imageDistance) => {
    if (objectDistance === 0) return 0;
    return -imageDistance / objectDistance;
  },

  // Tính chiều cao ảnh
  calculateImageHeight: (objectHeight, magnification) => {
    return objectHeight * Math.abs(magnification);
  },

  // Xác định tính chất ảnh
  getImageProperties: (objectDistance, imageDistance, magnification) => {
    return {
      isReal: imageDistance > 0,
      isVirtual: imageDistance < 0,
      isUpright: magnification > 0,
      isInverted: magnification < 0,
      isEnlarged: Math.abs(magnification) > 1,
      isReduced: Math.abs(magnification) < 1
    };
  },

  // Tính toán tổng hợp ảnh qua thấu kính (được dùng bởi LensOpticsLab)
  calculateImage: (objectDistance, focalLength, objectHeight) => {
    // Tính khoảng cách ảnh d' = d*f / (d - f)
    const imageDistance = objectDistance === focalLength 
      ? Infinity 
      : (focalLength * objectDistance) / (objectDistance - focalLength);
    
    // Tính độ phóng đại k = -d'/d
    const magnification = objectDistance === 0 ? 0 : -imageDistance / objectDistance;
    
    // Tính chiều cao ảnh h' = k * h
    const imageHeight = objectHeight * magnification;
    
    // Xác định loại ảnh
    let imageType = '';
    if (isFinite(imageDistance)) {
      const isReal = imageDistance > 0;
      const isUpright = magnification > 0;
      const size = Math.abs(magnification) > 1 ? 'lớn hơn' : Math.abs(magnification) < 1 ? 'nhỏ hơn' : 'bằng';
      
      imageType = `${isReal ? 'Thật' : 'Ảo'}, ${isUpright ? 'cùng chiều' : 'ngược chiều'}, ${size} vật`;
    } else {
      imageType = 'Không tạo ảnh (vật tại tiêu điểm)';
    }
    
    return {
      imageDistance: isFinite(imageDistance) ? imageDistance : 0,
      imageHeight,
      magnification,
      imageType
    };
  }
};

/**
 * Sóng - Giao thoa và sóng dừng
 */
export const WavePhysics = {
  // Bước sóng: λ = v/f
  calculateWavelength: (velocity, frequency) => {
    if (frequency <= 0) return 0;
    return velocity / frequency;
  },

  // Tần số: f = v/λ
  calculateFrequency: (velocity, wavelength) => {
    if (wavelength <= 0) return 0;
    return velocity / wavelength;
  },

  // Chu kỳ: T = 1/f
  calculatePeriod: (frequency) => {
    if (frequency <= 0) return 0;
    return 1 / frequency;
  },

  // Phương trình sóng: y = A*sin(ωt - kx + φ)
  calculateDisplacement: (amplitude, omega, time, k, x, phase = 0) => {
    return amplitude * Math.sin(omega * time - k * x + phase);
  },

  // Giao thoa: Vị trí cực đại - khoảng vân: i = λD/a
  calculateFringeSpacing: (wavelength, screenDistance, slitSeparation) => {
    if (slitSeparation <= 0) return 0;
    return (wavelength * screenDistance) / slitSeparation;
  },

  // Vị trí vân sáng thứ k: x = k * λD/a
  calculateBrightFringePosition: (k, wavelength, screenDistance, slitSeparation) => {
    const i = WavePhysics.calculateFringeSpacing(wavelength, screenDistance, slitSeparation);
    return k * i;
  },

  // Vị trí vân tối thứ k: x = (k + 0.5) * λD/a
  calculateDarkFringePosition: (k, wavelength, screenDistance, slitSeparation) => {
    const i = WavePhysics.calculateFringeSpacing(wavelength, screenDistance, slitSeparation);
    return (k + 0.5) * i;
  },

  // Sóng dừng - Điều kiện: L = n * λ/2
  calculateStandingWaveWavelength: (stringLength, harmonicNumber) => {
    if (harmonicNumber <= 0) return 0;
    return (2 * stringLength) / harmonicNumber;
  }
};

/**
 * Nhiệt học
 */
export const Thermodynamics = {
  // Chuyển đổi nhiệt độ
  celsiusToKelvin: (celsius) => celsius + 273.15,
  kelvinToCelsius: (kelvin) => kelvin - 273.15,
  celsiusToFahrenheit: (celsius) => (celsius * 9/5) + 32,
  fahrenheitToCelsius: (fahrenheit) => (fahrenheit - 32) * 5/9,

  // Nhiệt lượng: Q = mcΔT
  calculateHeat: (mass, specificHeat, deltaTemp) => {
    return mass * specificHeat * deltaTemp;
  },

  // Phương trình trạng thái khí lý tưởng: PV = nRT
  calculatePressure: (moles, temperature, volume) => {
    if (volume <= 0) return 0;
    return (moles * PHYSICS_CONSTANTS.R * temperature) / volume;
  },

  calculateVolume: (moles, temperature, pressure) => {
    if (pressure <= 0) return 0;
    return (moles * PHYSICS_CONSTANTS.R * temperature) / pressure;
  }
};

/**
 * Utilities - Hàm tiện ích
 */
export const PhysicsUtils = {
  // Làm tròn số với n chữ số thập phân
  round: (value, decimals = 2) => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  // Tính sai số tuyệt đối
  absoluteError: (measured, theoretical) => {
    return Math.abs(measured - theoretical);
  },

  // Tính sai số tương đối (%)
  relativeError: (measured, theoretical) => {
    if (theoretical === 0) return 0;
    return (Math.abs(measured - theoretical) / Math.abs(theoretical)) * 100;
  },

  // Tính giá trị trung bình
  average: (values) => {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  },

  // Tính độ lệch chuẩn
  standardDeviation: (values) => {
    if (values.length < 2) return 0;
    const avg = PhysicsUtils.average(values);
    const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1));
  },

  // Chuyển đổi đơn vị
  convertUnit: (value, fromUnit, toUnit) => {
    const conversions = {
      // Độ dài
      'm-cm': 100,
      'cm-m': 0.01,
      'm-mm': 1000,
      'mm-m': 0.001,
      // Thời gian
      's-ms': 1000,
      'ms-s': 0.001,
      'min-s': 60,
      's-min': 1/60,
      // Khối lượng
      'kg-g': 1000,
      'g-kg': 0.001,
    };
    
    const key = `${fromUnit}-${toUnit}`;
    const factor = conversions[key];
    return factor ? value * factor : value;
  },

  // Random trong khoảng với độ chính xác
  randomInRange: (min, max, decimals = 2) => {
    const value = min + Math.random() * (max - min);
    return PhysicsUtils.round(value, decimals);
  },

  // Thêm nhiễu ngẫu nhiên (mô phỏng sai số thực nghiệm)
  addNoise: (value, noisePercent = 2) => {
    const noise = (Math.random() - 0.5) * 2 * (noisePercent / 100) * value;
    return value + noise;
  }
};

export default {
  PHYSICS_CONSTANTS,
  FreeFall,
  SimplePendulum,
  OhmLaw,
  LensOptics,
  WavePhysics,
  Thermodynamics,
  PhysicsUtils
};

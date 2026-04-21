/**
 * Hệ thống đơn vị đo lường vật lý
 * Hỗ trợ chuyển đổi giữa các đơn vị
 */

export const UNIT_CATEGORIES = {
  length: {
    name: 'Chiều dài',
    baseUnit: 'm',
    units: {
      km: { factor: 1000, name: 'Kilômét', symbol: 'km' },
      m: { factor: 1, name: 'Mét', symbol: 'm' },
      dm: { factor: 0.1, name: 'Đềximét', symbol: 'dm' },
      cm: { factor: 0.01, name: 'Xentimét', symbol: 'cm' },
      mm: { factor: 0.001, name: 'Milimét', symbol: 'mm' },
      um: { factor: 1e-6, name: 'Micrômét', symbol: 'μm' },
      nm: { factor: 1e-9, name: 'Nanômét', symbol: 'nm' }
    }
  },

  mass: {
    name: 'Khối lượng',
    baseUnit: 'kg',
    units: {
      t: { factor: 1000, name: 'Tấn', symbol: 't' },
      kg: { factor: 1, name: 'Kilôgam', symbol: 'kg' },
      g: { factor: 0.001, name: 'Gam', symbol: 'g' },
      mg: { factor: 1e-6, name: 'Miligam', symbol: 'mg' }
    }
  },

  time: {
    name: 'Thời gian',
    baseUnit: 's',
    units: {
      h: { factor: 3600, name: 'Giờ', symbol: 'h' },
      min: { factor: 60, name: 'Phút', symbol: 'min' },
      s: { factor: 1, name: 'Giây', symbol: 's' },
      ms: { factor: 0.001, name: 'Miligiây', symbol: 'ms' }
    }
  },

  velocity: {
    name: 'Vận tốc',
    baseUnit: 'm/s',
    units: {
      'km/h': { factor: 1/3.6, name: 'Kilômét/giờ', symbol: 'km/h' },
      'm/s': { factor: 1, name: 'Mét/giây', symbol: 'm/s' },
      'cm/s': { factor: 0.01, name: 'Xentimét/giây', symbol: 'cm/s' }
    }
  },

  acceleration: {
    name: 'Gia tốc',
    baseUnit: 'm/s²',
    units: {
      'm/s²': { factor: 1, name: 'Mét/giây²', symbol: 'm/s²' },
      'cm/s²': { factor: 0.01, name: 'Xentimét/giây²', symbol: 'cm/s²' }
    }
  },

  force: {
    name: 'Lực',
    baseUnit: 'N',
    units: {
      kN: { factor: 1000, name: 'Kilôniutơn', symbol: 'kN' },
      N: { factor: 1, name: 'Niutơn', symbol: 'N' },
      mN: { factor: 0.001, name: 'Miliniutơn', symbol: 'mN' }
    }
  },

  energy: {
    name: 'Năng lượng',
    baseUnit: 'J',
    units: {
      kJ: { factor: 1000, name: 'Kilôjun', symbol: 'kJ' },
      J: { factor: 1, name: 'Jun', symbol: 'J' },
      cal: { factor: 4.186, name: 'Calo', symbol: 'cal' },
      kcal: { factor: 4186, name: 'Kilôcalo', symbol: 'kcal' },
      eV: { factor: 1.6e-19, name: 'Electron-vôn', symbol: 'eV' },
      MeV: { factor: 1.6e-13, name: 'Mega electron-vôn', symbol: 'MeV' },
      kWh: { factor: 3.6e6, name: 'Kilôoát giờ', symbol: 'kWh' }
    }
  },

  power: {
    name: 'Công suất',
    baseUnit: 'W',
    units: {
      MW: { factor: 1e6, name: 'Mêgaoát', symbol: 'MW' },
      kW: { factor: 1000, name: 'Kilôoát', symbol: 'kW' },
      W: { factor: 1, name: 'Oát', symbol: 'W' },
      mW: { factor: 0.001, name: 'Milioát', symbol: 'mW' }
    }
  },

  pressure: {
    name: 'Áp suất',
    baseUnit: 'Pa',
    units: {
      atm: { factor: 101325, name: 'Átmốtphe', symbol: 'atm' },
      bar: { factor: 100000, name: 'Bar', symbol: 'bar' },
      Pa: { factor: 1, name: 'Pascan', symbol: 'Pa' },
      kPa: { factor: 1000, name: 'Kilôpascan', symbol: 'kPa' },
      mmHg: { factor: 133.322, name: 'Milimét thủy ngân', symbol: 'mmHg' }
    }
  },

  temperature: {
    name: 'Nhiệt độ',
    baseUnit: 'K',
    units: {
      K: { factor: 1, offset: 0, name: 'Kelvin', symbol: 'K' },
      C: { factor: 1, offset: 273.15, name: 'Độ C', symbol: '°C' }
    }
  },

  frequency: {
    name: 'Tần số',
    baseUnit: 'Hz',
    units: {
      GHz: { factor: 1e9, name: 'Gigahéc', symbol: 'GHz' },
      MHz: { factor: 1e6, name: 'Mêgahéc', symbol: 'MHz' },
      kHz: { factor: 1000, name: 'Kilôhéc', symbol: 'kHz' },
      Hz: { factor: 1, name: 'Héc', symbol: 'Hz' }
    }
  },

  electricCurrent: {
    name: 'Cường độ dòng điện',
    baseUnit: 'A',
    units: {
      A: { factor: 1, name: 'Ampe', symbol: 'A' },
      mA: { factor: 0.001, name: 'Miliampe', symbol: 'mA' },
      uA: { factor: 1e-6, name: 'Micrôampe', symbol: 'μA' }
    }
  },

  voltage: {
    name: 'Hiệu điện thế',
    baseUnit: 'V',
    units: {
      kV: { factor: 1000, name: 'Kilôvôn', symbol: 'kV' },
      V: { factor: 1, name: 'Vôn', symbol: 'V' },
      mV: { factor: 0.001, name: 'Milivôn', symbol: 'mV' }
    }
  },

  resistance: {
    name: 'Điện trở',
    baseUnit: 'Ω',
    units: {
      'MΩ': { factor: 1e6, name: 'Mêgaôm', symbol: 'MΩ' },
      'kΩ': { factor: 1000, name: 'Kilôôm', symbol: 'kΩ' },
      'Ω': { factor: 1, name: 'Ôm', symbol: 'Ω' },
      'mΩ': { factor: 0.001, name: 'Miliôm', symbol: 'mΩ' }
    }
  },

  capacitance: {
    name: 'Điện dung',
    baseUnit: 'F',
    units: {
      F: { factor: 1, name: 'Fara', symbol: 'F' },
      mF: { factor: 0.001, name: 'Milifara', symbol: 'mF' },
      uF: { factor: 1e-6, name: 'Micrôfara', symbol: 'μF' },
      nF: { factor: 1e-9, name: 'Nanôfara', symbol: 'nF' },
      pF: { factor: 1e-12, name: 'Picôfara', symbol: 'pF' }
    }
  },

  inductance: {
    name: 'Độ tự cảm',
    baseUnit: 'H',
    units: {
      H: { factor: 1, name: 'Henry', symbol: 'H' },
      mH: { factor: 0.001, name: 'Milihenry', symbol: 'mH' },
      uH: { factor: 1e-6, name: 'Micrôhenry', symbol: 'μH' }
    }
  },

  charge: {
    name: 'Điện tích',
    baseUnit: 'C',
    units: {
      C: { factor: 1, name: 'Culông', symbol: 'C' },
      mC: { factor: 0.001, name: 'Miliculông', symbol: 'mC' },
      uC: { factor: 1e-6, name: 'Micrôculông', symbol: 'μC' },
      nC: { factor: 1e-9, name: 'Nanôculông', symbol: 'nC' }
    }
  },

  angle: {
    name: 'Góc',
    baseUnit: 'rad',
    units: {
      rad: { factor: 1, name: 'Radian', symbol: 'rad' },
      deg: { factor: Math.PI / 180, name: 'Độ', symbol: '°' }
    }
  },

  area: {
    name: 'Diện tích',
    baseUnit: 'm²',
    units: {
      'km²': { factor: 1e6, name: 'Kilômét vuông', symbol: 'km²' },
      'm²': { factor: 1, name: 'Mét vuông', symbol: 'm²' },
      'dm²': { factor: 0.01, name: 'Đềximét vuông', symbol: 'dm²' },
      'cm²': { factor: 1e-4, name: 'Xentimét vuông', symbol: 'cm²' },
      'mm²': { factor: 1e-6, name: 'Milimét vuông', symbol: 'mm²' }
    }
  },

  volume: {
    name: 'Thể tích',
    baseUnit: 'm³',
    units: {
      'm³': { factor: 1, name: 'Mét khối', symbol: 'm³' },
      'dm³': { factor: 0.001, name: 'Đềximét khối', symbol: 'dm³' },
      'cm³': { factor: 1e-6, name: 'Xentimét khối', symbol: 'cm³' },
      L: { factor: 0.001, name: 'Lít', symbol: 'L' },
      mL: { factor: 1e-6, name: 'Mililít', symbol: 'mL' }
    }
  },

  density: {
    name: 'Khối lượng riêng',
    baseUnit: 'kg/m³',
    units: {
      'kg/m³': { factor: 1, name: 'Kilôgam/mét khối', symbol: 'kg/m³' },
      'g/cm³': { factor: 1000, name: 'Gam/xentimét khối', symbol: 'g/cm³' }
    }
  }
};

/**
 * Chuyển đổi đơn vị
 * @param {number} value - Giá trị cần chuyển
 * @param {string} fromUnit - Đơn vị gốc
 * @param {string} toUnit - Đơn vị đích
 * @param {string} category - Loại đơn vị
 */
export const convertUnit = (value, fromUnit, toUnit, category) => {
  const cat = UNIT_CATEGORIES[category];
  if (!cat) return null;

  const from = cat.units[fromUnit];
  const to = cat.units[toUnit];
  if (!from || !to) return null;

  // Xử lý đặc biệt cho nhiệt độ
  if (category === 'temperature') {
    const kelvin = value + (from.offset || 0);
    return kelvin - (to.offset || 0);
  }

  // Chuyển về đơn vị cơ sở rồi sang đơn vị đích
  const baseValue = value * from.factor;
  return baseValue / to.factor;
};

/**
 * Lấy danh sách đơn vị cho một loại đại lượng
 */
export const getUnitsForCategory = (category) => {
  const cat = UNIT_CATEGORIES[category];
  if (!cat) return [];
  return Object.entries(cat.units).map(([key, unit]) => ({
    key,
    ...unit
  }));
};

/**
 * Tìm category từ đơn vị
 */
export const findCategoryByUnit = (unit) => {
  for (const [catKey, cat] of Object.entries(UNIT_CATEGORIES)) {
    if (cat.units[unit]) {
      return catKey;
    }
  }
  return null;
};

export default UNIT_CATEGORIES;

/**
 * UNIT CONVERTER UTILS - Chuyển đổi đơn vị
 */

import { UNIT_CATEGORIES, convertUnit as baseConvertUnit } from '../data/units';

/**
 * Chuyển đổi đơn vị với validation
 * @param {number} value - Giá trị cần chuyển
 * @param {string} fromUnit - Đơn vị gốc
 * @param {string} toUnit - Đơn vị đích
 * @param {string} category - Loại đơn vị
 * @returns {object} - { success, result, error }
 */
export const convertWithValidation = (value, fromUnit, toUnit, category) => {
  if (value === null || value === undefined || isNaN(value)) {
    return { success: false, result: null, error: 'Giá trị không hợp lệ' };
  }

  if (!UNIT_CATEGORIES[category]) {
    return { success: false, result: null, error: 'Loại đơn vị không tồn tại' };
  }

  const cat = UNIT_CATEGORIES[category];
  if (!cat.units[fromUnit]) {
    return { success: false, result: null, error: `Đơn vị ${fromUnit} không hợp lệ` };
  }
  if (!cat.units[toUnit]) {
    return { success: false, result: null, error: `Đơn vị ${toUnit} không hợp lệ` };
  }

  const result = baseConvertUnit(value, fromUnit, toUnit, category);
  
  if (result === null) {
    return { success: false, result: null, error: 'Lỗi chuyển đổi' };
  }

  return { success: true, result, error: null };
};

/**
 * Chuyển đổi nhiều giá trị cùng lúc
 * @param {array} conversions - Mảng { value, fromUnit, toUnit, category }
 * @returns {array} - Mảng kết quả
 */
export const batchConvert = (conversions) => {
  return conversions.map(conv => ({
    ...conv,
    ...convertWithValidation(conv.value, conv.fromUnit, conv.toUnit, conv.category)
  }));
};

/**
 * Lấy đơn vị chuẩn của một category
 */
export const getBaseUnit = (category) => {
  return UNIT_CATEGORIES[category]?.baseUnit || null;
};

/**
 * Chuyển về đơn vị chuẩn
 */
export const convertToBase = (value, fromUnit, category) => {
  const baseUnit = getBaseUnit(category);
  if (!baseUnit) return null;
  return baseConvertUnit(value, fromUnit, baseUnit, category);
};

/**
 * Chuyển từ đơn vị chuẩn
 */
export const convertFromBase = (value, toUnit, category) => {
  const baseUnit = getBaseUnit(category);
  if (!baseUnit) return null;
  return baseConvertUnit(value, baseUnit, toUnit, category);
};

/**
 * Format đơn vị với prefix
 */
export const formatWithPrefix = (value, category) => {
  if (!value || !category) return { value, unit: '' };

  const cat = UNIT_CATEGORIES[category];
  if (!cat) return { value, unit: '' };

  const baseUnit = cat.baseUnit;
  const absValue = Math.abs(value);

  // Tìm đơn vị phù hợp nhất
  let bestUnit = baseUnit;
  let bestValue = value;

  for (const [unitKey, unitData] of Object.entries(cat.units)) {
    const converted = value / unitData.factor;
    if (Math.abs(converted) >= 1 && Math.abs(converted) < 1000) {
      if (Math.abs(converted) > Math.abs(bestValue) / 1000) {
        bestUnit = unitKey;
        bestValue = converted;
      }
    }
  }

  return {
    value: bestValue,
    unit: bestUnit,
    symbol: cat.units[bestUnit]?.symbol || bestUnit
  };
};

/**
 * Danh sách các chuyển đổi phổ biến
 */
export const COMMON_CONVERSIONS = [
  { from: 'km/h', to: 'm/s', category: 'velocity', label: 'km/h → m/s' },
  { from: 'm/s', to: 'km/h', category: 'velocity', label: 'm/s → km/h' },
  { from: 'g', to: 'kg', category: 'mass', label: 'g → kg' },
  { from: 'kg', to: 'g', category: 'mass', label: 'kg → g' },
  { from: 'cm', to: 'm', category: 'length', label: 'cm → m' },
  { from: 'm', to: 'cm', category: 'length', label: 'm → cm' },
  { from: 'C', to: 'K', category: 'temperature', label: '°C → K' },
  { from: 'K', to: 'C', category: 'temperature', label: 'K → °C' },
  { from: 'J', to: 'kJ', category: 'energy', label: 'J → kJ' },
  { from: 'kWh', to: 'J', category: 'energy', label: 'kWh → J' },
  { from: 'atm', to: 'Pa', category: 'pressure', label: 'atm → Pa' },
  { from: 'Pa', to: 'atm', category: 'pressure', label: 'Pa → atm' }
];

export default {
  convertWithValidation,
  batchConvert,
  getBaseUnit,
  convertToBase,
  convertFromBase,
  formatWithPrefix,
  COMMON_CONVERSIONS
};

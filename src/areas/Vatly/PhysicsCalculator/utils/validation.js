/**
 * VALIDATION UTILS - Kiểm tra dữ liệu đầu vào
 */

import { parseValue } from './calculator';

/**
 * Kiểm tra một giá trị đầu vào
 * @param {any} value - Giá trị cần kiểm tra
 * @param {object} variable - Thông tin biến
 * @returns {object} - { isValid, error, parsedValue }
 */
export const validateSingleInput = (value, variable) => {
  // Cho phép giá trị rỗng nếu là hằng số
  if ((value === '' || value === null || value === undefined) && variable.constant) {
    return { isValid: true, error: null, parsedValue: variable.constant };
  }

  // Kiểm tra giá trị rỗng
  if (value === '' || value === null || value === undefined) {
    return { isValid: false, error: 'Vui lòng nhập giá trị', parsedValue: null };
  }

  // Parse giá trị
  const parsed = parseValue(value);
  
  if (parsed === null) {
    return { isValid: false, error: 'Giá trị không hợp lệ', parsedValue: null };
  }

  // Kiểm tra NaN và Infinity
  if (isNaN(parsed) || !isFinite(parsed)) {
    return { isValid: false, error: 'Giá trị không hợp lệ', parsedValue: null };
  }

  // Kiểm tra giá trị âm cho các đại lượng không thể âm
  const nonNegativeTypes = [
    'mass', 'length', 'time', 'frequency', 'resistance', 
    'capacitance', 'inductance', 'temperature', 'area', 'volume'
  ];
  
  if (variable.unitCategory && nonNegativeTypes.includes(variable.unitCategory) && parsed < 0) {
    return { 
      isValid: false, 
      error: `${variable.name} không thể là số âm`, 
      parsedValue: null 
    };
  }

  // Kiểm tra giá trị bằng 0 cho các đại lượng nguy hiểm
  const nonZeroSymbols = ['t', 'r', 'R', 'S', 'd', 'λ', 'f', 'T', 'V', 'a'];
  if (parsed === 0 && nonZeroSymbols.includes(variable.symbol)) {
    return { 
      isValid: false, 
      error: `${variable.name} không thể bằng 0 (tránh chia cho 0)`, 
      parsedValue: null 
    };
  }

  // Kiểm tra nhiệt độ Kelvin
  if (variable.unitCategory === 'temperature' && variable.unit === 'K' && parsed < 0) {
    return { 
      isValid: false, 
      error: 'Nhiệt độ Kelvin không thể âm', 
      parsedValue: null 
    };
  }

  return { isValid: true, error: null, parsedValue: parsed };
};

/**
 * Kiểm tra tất cả đầu vào cho một công thức
 * @param {object} formula - Object công thức
 * @param {string} solveFor - Biến cần tìm
 * @param {object} inputValues - Các giá trị đầu vào
 * @returns {object} - { isValid, errors, parsedValues }
 */
export const validateAllInputs = (formula, solveFor, inputValues) => {
  const errors = {};
  const parsedValues = {};
  let isValid = true;

  for (const variable of formula.variables) {
    // Bỏ qua biến cần tìm
    if (variable.symbol === solveFor) continue;

    const value = inputValues[variable.symbol];
    const validation = validateSingleInput(value, variable);

    if (!validation.isValid) {
      errors[variable.symbol] = validation.error;
      isValid = false;
    } else {
      parsedValues[variable.symbol] = validation.parsedValue;
    }
  }

  return { isValid, errors, parsedValues };
};

/**
 * Kiểm tra xem đã nhập đủ dữ liệu chưa
 * @param {object} formula - Object công thức
 * @param {string} solveFor - Biến cần tìm
 * @param {object} inputValues - Các giá trị đầu vào
 * @returns {object} - { isComplete, missingFields }
 */
export const checkCompleteness = (formula, solveFor, inputValues) => {
  const missingFields = [];

  for (const variable of formula.variables) {
    if (variable.symbol === solveFor) continue;
    
    // Bỏ qua nếu là hằng số
    if (variable.constant) continue;

    const value = inputValues[variable.symbol];
    if (value === '' || value === null || value === undefined) {
      missingFields.push({
        symbol: variable.symbol,
        name: variable.name
      });
    }
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields
  };
};

/**
 * Tạo thông báo lỗi thân thiện
 */
export const formatValidationErrors = (errors) => {
  const messages = [];
  for (const [symbol, error] of Object.entries(errors)) {
    messages.push(`• ${error}`);
  }
  return messages.join('\n');
};

/**
 * Kiểm tra giá trị có trong khoảng hợp lý không
 */
export const checkReasonableValue = (value, variable) => {
  const warnings = [];

  // Kiểm tra vận tốc > c
  if (variable.unitCategory === 'velocity' && value > 3e8) {
    warnings.push('Cảnh báo: Vận tốc vượt quá tốc độ ánh sáng');
  }

  // Kiểm tra nhiệt độ cực thấp
  if (variable.unitCategory === 'temperature' && variable.unit === 'K' && value < 0) {
    warnings.push('Cảnh báo: Nhiệt độ dưới 0K không tồn tại');
  }

  // Kiểm tra khối lượng cực nhỏ
  if (variable.unitCategory === 'mass' && value > 0 && value < 1e-35) {
    warnings.push('Cảnh báo: Khối lượng rất nhỏ, có thể không thực tế');
  }

  return warnings;
};

export default {
  validateSingleInput,
  validateAllInputs,
  checkCompleteness,
  formatValidationErrors,
  checkReasonableValue
};

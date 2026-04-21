/**
 * CALCULATOR UTILS - Logic tính toán công thức vật lý
 */

import { convertUnit, UNIT_CATEGORIES } from '../data/units';
import { PHYSICS_CONSTANTS } from '../data/constants';

/**
 * Parse giá trị đầu vào (hỗ trợ số mũ)
 * @param {string|number} value - Giá trị cần parse
 * @returns {number|null}
 */
export const parseValue = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  // Nếu là số rồi
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }

  // Xử lý string
  let str = String(value).trim();
  
  // Thay thế các ký tự đặc biệt
  str = str.replace(/×/g, '*')
           .replace(/÷/g, '/')
           .replace(/−/g, '-')
           .replace(/,/g, '.');

  // Xử lý số mũ dạng 10^x hoặc e
  str = str.replace(/(\d+)\s*\^\s*(-?\d+)/g, '$1e$2');
  str = str.replace(/(\d+)\s*[xX×]\s*10\s*\^\s*(-?\d+)/g, '$1e$2');

  try {
    const result = parseFloat(str);
    return isNaN(result) ? null : result;
  } catch {
    return null;
  }
};

/**
 * Format kết quả với số chữ số có nghĩa phù hợp
 * @param {number} value - Giá trị cần format
 * @param {number} precision - Số chữ số có nghĩa (mặc định 4)
 * @returns {string}
 */
export const formatResult = (value, precision = 4) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'Không xác định';
  }

  if (!isFinite(value)) {
    return value > 0 ? '∞' : '-∞';
  }

  const absValue = Math.abs(value);

  // Số rất nhỏ hoặc rất lớn -> dạng khoa học
  if (absValue !== 0 && (absValue < 0.001 || absValue >= 1e6)) {
    return value.toExponential(precision - 1);
  }

  // Số bình thường
  const result = parseFloat(value.toPrecision(precision));
  
  // Loại bỏ số 0 thừa ở cuối
  return result.toString();
};

/**
 * Tính toán công thức
 * @param {object} formula - Object công thức
 * @param {string} solveFor - Biến cần tìm
 * @param {object} inputValues - Các giá trị đầu vào
 * @returns {object} - Kết quả tính toán
 */
export const calculateFormula = (formula, solveFor, inputValues) => {
  try {
    // Tìm variant phù hợp
    const variant = formula.variants.find(v => v.solve === solveFor);
    
    if (!variant) {
      return {
        success: false,
        error: `Không tìm thấy công thức giải cho ${solveFor}`,
        result: null
      };
    }

    // Chuẩn bị giá trị đầu vào
    const vars = {};
    
    for (const variable of formula.variables) {
      const symbol = variable.symbol;
      
      // Bỏ qua biến cần tìm
      if (symbol === solveFor) continue;
      
      // Lấy giá trị từ input hoặc hằng số
      let value = inputValues[symbol];
      
      // Nếu là hằng số và không có input
      if ((value === null || value === undefined || value === '') && variable.constant) {
        value = variable.constant;
      }
      
      // Parse giá trị
      const parsedValue = parseValue(value);
      
      if (parsedValue === null && !variable.constant) {
        return {
          success: false,
          error: `Thiếu giá trị cho ${variable.name} (${symbol})`,
          result: null
        };
      }
      
      vars[symbol] = parsedValue !== null ? parsedValue : variable.constant;
    }

    // Thực hiện tính toán
    const result = variant.formula(vars);

    // Kiểm tra kết quả
    if (result === null || result === undefined || isNaN(result)) {
      return {
        success: false,
        error: 'Không thể tính toán với các giá trị đã cho',
        result: null
      };
    }

    // Lấy thông tin đơn vị của biến kết quả
    const resultVariable = formula.variables.find(v => v.symbol === solveFor);

    return {
      success: true,
      result: result,
      formattedResult: formatResult(result),
      unit: resultVariable?.unit || '',
      variableName: resultVariable?.name || solveFor,
      calculation: {
        formula: formula.formula,
        solveFor,
        inputs: vars
      }
    };

  } catch (error) {
    return {
      success: false,
      error: `Lỗi tính toán: ${error.message}`,
      result: null
    };
  }
};

/**
 * Tính toán với chuyển đổi đơn vị
 * @param {object} formula - Object công thức
 * @param {string} solveFor - Biến cần tìm
 * @param {object} inputValues - Các giá trị đầu vào { symbol: { value, unit } }
 * @returns {object} - Kết quả tính toán
 */
export const calculateWithUnits = (formula, solveFor, inputValues) => {
  try {
    // Chuyển đổi tất cả về đơn vị chuẩn
    const convertedInputs = {};
    
    for (const variable of formula.variables) {
      if (variable.symbol === solveFor) continue;
      
      const input = inputValues[variable.symbol];
      if (!input) {
        if (variable.constant) {
          convertedInputs[variable.symbol] = variable.constant;
        }
        continue;
      }

      let value = parseValue(input.value);
      
      // Chuyển đổi đơn vị nếu cần
      if (value !== null && input.unit && variable.unitCategory) {
        const category = UNIT_CATEGORIES[variable.unitCategory];
        if (category && input.unit !== variable.unit) {
          value = convertUnit(value, input.unit, variable.unit, variable.unitCategory);
        }
      }
      
      convertedInputs[variable.symbol] = value;
    }

    // Tính toán
    return calculateFormula(formula, solveFor, convertedInputs);

  } catch (error) {
    return {
      success: false,
      error: `Lỗi chuyển đổi đơn vị: ${error.message}`,
      result: null
    };
  }
};

/**
 * Sinh các bước giải chi tiết
 * @param {object} formula - Object công thức
 * @param {string} solveFor - Biến cần tìm
 * @param {object} inputValues - Các giá trị đầu vào
 * @param {number} result - Kết quả
 * @returns {array} - Danh sách các bước
 */
export const generateSolutionSteps = (formula, solveFor, inputValues, result) => {
  const steps = [];
  
  // Bước 1: Ghi công thức gốc
  steps.push({
    step: 1,
    title: 'Công thức sử dụng',
    content: formula.formula,
    latex: formula.latex
  });

  // Bước 2: Liệt kê các đại lượng đã biết
  const knownValues = [];
  for (const variable of formula.variables) {
    if (variable.symbol !== solveFor) {
      const value = inputValues[variable.symbol];
      if (value !== null && value !== undefined) {
        knownValues.push(`${variable.name} (${variable.symbol}) = ${value} ${variable.unit}`);
      }
    }
  }
  
  steps.push({
    step: 2,
    title: 'Đại lượng đã biết',
    content: knownValues.join('\n'),
    latex: null
  });

  // Bước 3: Đại lượng cần tìm
  const targetVar = formula.variables.find(v => v.symbol === solveFor);
  steps.push({
    step: 3,
    title: 'Đại lượng cần tìm',
    content: `${targetVar?.name || solveFor} (${solveFor})`,
    latex: null
  });

  // Bước 4: Biến đổi công thức
  const variant = formula.variants.find(v => v.solve === solveFor);
  if (variant) {
    steps.push({
      step: 4,
      title: 'Biến đổi công thức',
      content: `Từ công thức gốc, suy ra công thức tính ${solveFor}`,
      latex: null
    });
  }

  // Bước 5: Thay số và tính
  steps.push({
    step: 5,
    title: 'Thay số và tính toán',
    content: `Thay các giá trị vào công thức`,
    latex: null
  });

  // Bước 6: Kết quả
  steps.push({
    step: 6,
    title: 'Kết quả',
    content: `${targetVar?.name || solveFor} = ${formatResult(result)} ${targetVar?.unit || ''}`,
    latex: `${solveFor} = ${formatResult(result)}\\text{ ${targetVar?.unit || ''}}`
  });

  return steps;
};

/**
 * Validate giá trị đầu vào
 * @param {object} variable - Thông tin biến
 * @param {any} value - Giá trị cần validate
 * @returns {object} - { valid: boolean, error: string }
 */
export const validateInput = (variable, value) => {
  const parsed = parseValue(value);
  
  if (parsed === null) {
    return { valid: false, error: 'Giá trị không hợp lệ' };
  }

  // Kiểm tra giá trị âm cho một số đại lượng
  const nonNegativeSymbols = ['m', 'V', 'S', 'T', 'f', 'λ', 'R', 'L', 'C', 'A'];
  if (nonNegativeSymbols.includes(variable.symbol) && parsed < 0) {
    return { valid: false, error: `${variable.name} không thể âm` };
  }

  // Kiểm tra chia cho 0
  if (parsed === 0) {
    const dangerousSymbols = ['t', 'r', 'R', 'S', 'd', 'λ', 'f', 'T'];
    if (dangerousSymbols.includes(variable.symbol)) {
      return { valid: false, error: `${variable.name} không thể bằng 0` };
    }
  }

  return { valid: true, error: null };
};

export default {
  parseValue,
  formatResult,
  calculateFormula,
  calculateWithUnits,
  generateSolutionSteps,
  validateInput
};

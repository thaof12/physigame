/**
 * PhysicsCalculator - Main Export File
 * Công cụ giải bài tập vật lý thông minh
 * 
 * Cấu trúc:
 * - /data: Database công thức, đơn vị, hằng số
 * - /components: Các React component UI
 * - /utils: Logic tính toán, validation
 * - /hooks: Custom hooks
 * - /pages: Trang chính
 */

// Pages
export { default as PhysicsCalculatorPage } from './pages/PhysicsCalculatorPage';

// Components
export { default as FormulaSelector } from './components/FormulaSelector';
export { default as CalculatorInput } from './components/CalculatorInput';
export { default as ResultDisplay } from './components/ResultDisplay';
export { default as FormulaVisualizer } from './components/FormulaVisualizer';
export { default as UnitConverter } from './components/UnitConverter';
export { default as ConstantsReference } from './components/ConstantsReference';

// Data
export { PHYSICS_FORMULAS, GRADE_LIST, searchFormulas, getFormulaById } from './data/formulas';
export { PHYSICS_CONSTANTS, getConstant } from './data/constants';
export { UNIT_CATEGORIES, convertUnit, getUnitsForCategory } from './data/units';

// Utils
export { calculateFormula, parseValue, formatResult, generateSolutionSteps } from './utils/calculator';
export { validateSingleInput, validateAllInputs, checkCompleteness } from './utils/validation';
export { convertWithValidation, COMMON_CONVERSIONS } from './utils/unitConverter';

// Hooks
export { default as useCalculator } from './hooks/useCalculator';

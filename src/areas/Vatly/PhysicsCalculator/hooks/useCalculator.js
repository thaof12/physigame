/**
 * useCalculator - Custom hook quản lý state máy tính vật lý
 */

import { useState, useCallback, useMemo } from 'react';
import { calculateFormula, formatResult } from '../utils/calculator';
import { validateAllInputs, checkCompleteness } from '../utils/validation';

const HISTORY_MAX_LENGTH = 20;

const useCalculator = () => {
  // State chính
  const [selectedFormula, setSelectedFormula] = useState(null);
  const [solveFor, setSolveFor] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [history, setHistory] = useState([]);

  // Chọn công thức
  const selectFormula = useCallback((formula) => {
    setSelectedFormula(formula);
    setInputValues({});
    setResult(null);
    
    // Tự động chọn biến đầu tiên có thể giải
    if (formula?.variants?.length > 0) {
      setSolveFor(formula.variants[0].solve);
    } else {
      setSolveFor(null);
    }
  }, []);

  // Đổi biến cần tìm
  const changeSolveFor = useCallback((variable) => {
    setSolveFor(variable);
    setResult(null);
  }, []);

  // Cập nhật giá trị input
  const updateInputValues = useCallback((values) => {
    setInputValues(values);
    setResult(null);
  }, []);

  // Cập nhật một giá trị
  const updateSingleValue = useCallback((symbol, value) => {
    setInputValues(prev => ({
      ...prev,
      [symbol]: value
    }));
    setResult(null);
  }, []);

  // Thực hiện tính toán
  const calculate = useCallback(() => {
    if (!selectedFormula || !solveFor) {
      setResult({
        success: false,
        error: 'Vui lòng chọn công thức và đại lượng cần tìm'
      });
      return;
    }

    setIsCalculating(true);

    // Validate inputs
    const validation = validateAllInputs(selectedFormula, solveFor, inputValues);
    
    if (!validation.isValid) {
      setResult({
        success: false,
        error: Object.values(validation.errors).filter(Boolean).join(', ')
      });
      setIsCalculating(false);
      return;
    }

    // Tính toán
    const calcResult = calculateFormula(selectedFormula, solveFor, validation.parsedValues);
    setResult(calcResult);

    // Lưu vào lịch sử nếu thành công
    if (calcResult.success) {
      const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        formula: {
          id: selectedFormula.id,
          name: selectedFormula.name,
          formula: selectedFormula.formula
        },
        solveFor,
        inputs: { ...inputValues },
        result: calcResult.formattedResult,
        unit: calcResult.unit
      };

      setHistory(prev => {
        const newHistory = [historyEntry, ...prev];
        return newHistory.slice(0, HISTORY_MAX_LENGTH);
      });
    }

    setIsCalculating(false);
  }, [selectedFormula, solveFor, inputValues]);

  // Reset
  const reset = useCallback(() => {
    setInputValues({});
    setResult(null);
  }, []);

  // Reset hoàn toàn
  const resetAll = useCallback(() => {
    setSelectedFormula(null);
    setSolveFor(null);
    setInputValues({});
    setResult(null);
  }, []);

  // Xóa lịch sử
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Tải lại từ lịch sử
  const loadFromHistory = useCallback((entry) => {
    // Tìm công thức gốc
    // (Cần import từ formulas.js nếu muốn)
    setInputValues(entry.inputs);
    setSolveFor(entry.solveFor);
  }, []);

  // Kiểm tra có thể tính được không
  const canCalculate = useMemo(() => {
    if (!selectedFormula || !solveFor) return false;
    const { isComplete } = checkCompleteness(selectedFormula, solveFor, inputValues);
    return isComplete;
  }, [selectedFormula, solveFor, inputValues]);

  // Danh sách biến có thể giải
  const solvableVariables = useMemo(() => {
    return selectedFormula?.variants?.map(v => {
      const variable = selectedFormula.variables.find(var_ => var_.symbol === v.solve);
      return {
        symbol: v.solve,
        name: variable?.name || v.solve
      };
    }) || [];
  }, [selectedFormula]);

  return {
    // State
    selectedFormula,
    solveFor,
    inputValues,
    result,
    isCalculating,
    history,
    canCalculate,
    solvableVariables,
    
    // Actions
    selectFormula,
    changeSolveFor,
    updateInputValues,
    updateSingleValue,
    calculate,
    reset,
    resetAll,
    clearHistory,
    loadFromHistory
  };
};

export default useCalculator;

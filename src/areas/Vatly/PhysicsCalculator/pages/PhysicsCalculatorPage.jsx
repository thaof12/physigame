/**
 * PhysicsCalculatorPage - Trang chính của công cụ giải bài tập vật lý
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCalculator from '../hooks/useCalculator';
import FormulaSelector from '../components/FormulaSelector';
import CalculatorInput from '../components/CalculatorInput';
import ResultDisplay from '../components/ResultDisplay';
import FormulaVisualizer from '../components/FormulaVisualizer';
import UnitConverter from '../components/UnitConverter';
import ConstantsReference from '../components/ConstantsReference';
import { getTotalFormulasCount } from '../data/formulas';

const PhysicsCalculatorPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('calculator');
  
  const {
    selectedFormula,
    solveFor,
    inputValues,
    result,
    isCalculating,
    history,
    canCalculate,
    selectFormula,
    changeSolveFor,
    updateInputValues,
    calculate,
    reset,
    resetAll,
    clearHistory
  } = useCalculator();

  // Tabs
  const tabs = [
    { id: 'calculator', name: 'Máy tính', icon: '🧮' },
    { id: 'converter', name: 'Đổi đơn vị', icon: '🔄' },
    { id: 'constants', name: 'Hằng số', icon: '📖' },
    { id: 'history', name: 'Lịch sử', icon: '📜' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Quay lại
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-3xl">🧮</span>
                  Máy Tính Vật Lý Thông Minh
                </h1>
                <p className="text-sm text-gray-500">
                  {getTotalFormulasCount()} công thức từ lớp 6 đến lớp 12
                </p>
              </div>
            </div>
            
            {/* Nút reset */}
            {selectedFormula && (
              <button
                onClick={resetAll}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                🔄 Làm mới
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                  {tab.id === 'history' && history.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                      {history.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab: Máy tính */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cột trái: Chọn công thức & Nhập liệu */}
            <div className="space-y-6">
              {/* Chọn công thức */}
              <FormulaSelector
                onSelectFormula={selectFormula}
                selectedFormula={selectedFormula}
              />

              {/* Hiển thị công thức */}
              {selectedFormula && (
                <FormulaVisualizer
                  formula={selectedFormula}
                  highlightVariable={solveFor}
                />
              )}
            </div>

            {/* Cột phải: Nhập liệu & Kết quả */}
            <div className="space-y-6">
              {/* Nhập liệu */}
              <CalculatorInput
                formula={selectedFormula}
                solveFor={solveFor}
                onSolveForChange={changeSolveFor}
                onValuesChange={updateInputValues}
                values={inputValues}
              />

              {/* Nút tính toán */}
              {selectedFormula && (
                <button
                  onClick={calculate}
                  disabled={!canCalculate || isCalculating}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    canCalculate && !isCalculating
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isCalculating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Đang tính...
                    </span>
                  ) : (
                    '⚡ Tính Toán'
                  )}
                </button>
              )}

              {/* Kết quả */}
              <ResultDisplay
                result={result}
                formula={selectedFormula}
                solveFor={solveFor}
                onReset={reset}
              />
            </div>
          </div>
        )}

        {/* Tab: Đổi đơn vị */}
        {activeTab === 'converter' && (
          <div className="max-w-2xl mx-auto">
            <UnitConverter />
          </div>
        )}

        {/* Tab: Hằng số */}
        {activeTab === 'constants' && (
          <div className="max-w-4xl mx-auto">
            <ConstantsReference />
          </div>
        )}

        {/* Tab: Lịch sử */}
        {activeTab === 'history' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">📜</span>
                  Lịch sử tính toán
                </h2>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    🗑️ Xóa tất cả
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-5xl">📝</span>
                  <p className="mt-4">Chưa có lịch sử tính toán</p>
                  <p className="text-sm">Các phép tính sẽ được lưu tự động</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {entry.formula.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            <code>{entry.formula.formula}</code>
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(entry.timestamp).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-gray-600">Kết quả:</span>
                        <span className="font-bold text-green-700">
                          {entry.solveFor} = {entry.result} {entry.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>🧮 Công cụ giải bài tập Vật lý thông minh - Hỗ trợ từ lớp 6 đến lớp 12</p>
        </div>
      </footer>
    </div>
  );
};

export default PhysicsCalculatorPage;

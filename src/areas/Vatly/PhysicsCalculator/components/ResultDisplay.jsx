/**
 * ResultDisplay - Component hiển thị kết quả tính toán
 */

import React, { useState } from 'react';
import { formatResult } from '../utils/calculator';

const ResultDisplay = ({ result, formula, solveFor, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  // Xử lý copy kết quả
  const handleCopy = async () => {
    if (result?.success) {
      const textToCopy = `${result.variableName} = ${result.formattedResult} ${result.unit}`;
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
  };

  // Nếu chưa có kết quả
  if (!result) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-500">Kết quả sẽ hiển thị ở đây</p>
        <p className="text-sm text-gray-400 mt-2">
          Chọn công thức, nhập giá trị và bấm "Tính toán"
        </p>
      </div>
    );
  }

  // Kết quả lỗi
  if (!result.success) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">❌</span>
            <div>
              <h4 className="font-semibold text-red-700">Không thể tính toán</h4>
              <p className="text-red-600">{result.error}</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={onReset}
          className="mt-4 w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          🔄 Thử lại
        </button>
      </div>
    );
  }

  // Lấy thông tin biến kết quả
  const resultVariable = formula?.variables.find(v => v.symbol === solveFor);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Kết quả chính */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-green-700">✅ Kết quả</span>
          <button
            onClick={handleCopy}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              copied 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-green-100'
            }`}
          >
            {copied ? '✓ Đã copy' : '📋 Copy'}
          </button>
        </div>
        
        <div className="text-center py-4">
          <div className="text-lg text-gray-600 mb-2">
            {resultVariable?.name || solveFor}
          </div>
          <div className="text-4xl font-bold text-green-700">
            {result.formattedResult}
            <span className="text-2xl ml-2 font-normal text-green-600">
              {result.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Công thức đã dùng */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-blue-700 mb-2">📐 Công thức sử dụng</h4>
        <code className="text-lg font-mono text-blue-800">{formula?.formula}</code>
      </div>

      {/* Các giá trị đầu vào */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">📝 Giá trị đã nhập</h4>
        <div className="grid grid-cols-2 gap-2">
          {result.calculation?.inputs && 
            Object.entries(result.calculation.inputs).map(([symbol, value]) => {
              const variable = formula?.variables.find(v => v.symbol === symbol);
              return (
                <div key={symbol} className="flex justify-between text-sm">
                  <span className="text-gray-600">{variable?.name || symbol}:</span>
                  <span className="font-mono">
                    {formatResult(value)} {variable?.unit || ''}
                  </span>
                </div>
              );
            })
          }
        </div>
      </div>

      {/* Nút hiển thị các bước */}
      <button
        onClick={() => setShowSteps(!showSteps)}
        className="w-full py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors mb-4"
      >
        {showSteps ? '🔼 Ẩn các bước giải' : '🔽 Xem các bước giải'}
      </button>

      {/* Các bước giải (đơn giản) */}
      {showSteps && (
        <div className="bg-purple-50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="bg-purple-200 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
            <div>
              <p className="font-medium text-purple-800">Xác định công thức</p>
              <code className="text-sm bg-white px-2 py-1 rounded">{formula?.formula}</code>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="bg-purple-200 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
            <div>
              <p className="font-medium text-purple-800">Liệt kê đại lượng đã biết</p>
              <div className="text-sm text-purple-700">
                {result.calculation?.inputs && 
                  Object.entries(result.calculation.inputs).map(([symbol, value]) => {
                    const variable = formula?.variables.find(v => v.symbol === symbol);
                    return (
                      <div key={symbol}>
                        {symbol} = {formatResult(value)} {variable?.unit || ''}
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="bg-purple-200 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
            <div>
              <p className="font-medium text-purple-800">Biến đổi và thay số</p>
              <p className="text-sm text-purple-700">
                Từ công thức gốc, giải tìm {solveFor} và thay các giá trị vào
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
            <div>
              <p className="font-medium text-green-800">Kết quả</p>
              <code className="text-lg bg-white px-2 py-1 rounded text-green-700">
                {solveFor} = {result.formattedResult} {result.unit}
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Nút thao tác */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={onReset}
          className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          🔄 Tính lại
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          🖨️ In
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;

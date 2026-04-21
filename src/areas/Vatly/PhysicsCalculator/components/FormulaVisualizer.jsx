/**
 * FormulaVisualizer - Hiển thị công thức dạng đẹp
 */

import React from 'react';

const FormulaVisualizer = ({ formula, highlightVariable }) => {
  if (!formula) return null;

  // Render công thức với syntax highlighting đơn giản
  const renderFormula = (formulaStr) => {
    // Thay thế các ký hiệu đặc biệt
    let html = formulaStr
      .replace(/×/g, ' × ')
      .replace(/÷/g, ' ÷ ')
      .replace(/\//g, ' / ')
      .replace(/\+/g, ' + ')
      .replace(/-/g, ' − ')
      .replace(/=/g, ' = ');

    // Highlight subscript
    html = html.replace(/(\w)_(\w+)/g, '$1<sub>$2</sub>');
    
    // Highlight superscript (số mũ)
    html = html.replace(/(\w)\^(\d+)/g, '$1<sup>$2</sup>');
    html = html.replace(/²/g, '<sup>2</sup>');
    html = html.replace(/³/g, '<sup>3</sup>');

    return html;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 shadow-inner">
      {/* Tên công thức */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-indigo-800">{formula.name}</h3>
        <p className="text-sm text-indigo-600">{formula.description}</p>
      </div>

      {/* Công thức chính */}
      <div className="bg-white rounded-lg p-6 shadow-md text-center mb-4">
        <div 
          className="text-3xl font-mono text-gray-800"
          dangerouslySetInnerHTML={{ __html: renderFormula(formula.formula) }}
        />
      </div>

      {/* Giải thích các biến */}
      <div className="bg-white/50 rounded-lg p-4">
        <h4 className="font-semibold text-indigo-700 mb-3">📌 Chú thích:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {formula.variables.map(variable => (
            <div 
              key={variable.symbol}
              className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                highlightVariable === variable.symbol 
                  ? 'bg-blue-100 border border-yellow-300' 
                  : 'bg-white/70'
              }`}
            >
              <span className="font-mono font-bold text-indigo-600 min-w-[40px]">
                {variable.symbol}
              </span>
              <span className="text-gray-600">−</span>
              <span className="text-gray-700">{variable.name}</span>
              <span className="text-sm text-gray-500 ml-auto">
                ({variable.unit || 'không đơn vị'})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Các biến thể công thức */}
      {formula.variants && formula.variants.length > 1 && (
        <div className="mt-4 bg-white/50 rounded-lg p-4">
          <h4 className="font-semibold text-indigo-700 mb-3">🔄 Các dạng biến đổi:</h4>
          <div className="flex flex-wrap gap-2">
            {formula.variants.map((variant, index) => {
              const varInfo = formula.variables.find(v => v.symbol === variant.solve);
              return (
                <div 
                  key={index}
                  className="px-3 py-1 bg-white rounded-lg text-sm border border-indigo-200"
                >
                  <span className="text-indigo-600 font-medium">
                    Tìm {varInfo?.name || variant.solve}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hằng số được sử dụng */}
      {formula.variables.some(v => v.constant) && (
        <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-green-700 mb-2">📗 Hằng số sử dụng:</h4>
          <div className="space-y-1">
            {formula.variables
              .filter(v => v.constant)
              .map(variable => (
                <div key={variable.symbol} className="text-sm text-green-800">
                  <span className="font-mono">{variable.symbol}</span> = {variable.constant} {variable.unit}
                  <span className="text-green-600 ml-2">({variable.name})</span>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default FormulaVisualizer;


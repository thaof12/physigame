/**
 * ConstantsReference - Bảng tra cứu hằng số vật lý
 */

import React, { useState } from 'react';
import { PHYSICS_CONSTANTS, CONSTANT_GROUPS } from '../data/constants';
import { formatResult } from '../utils/calculator';

const ConstantsReference = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [copiedKey, setCopiedKey] = useState(null);

  // Nhóm hằng số
  const groups = [
    { key: 'all', name: 'Tất cả', icon: '📚' },
    { key: 'mechanics', name: 'Cơ học', icon: '⚙️' },
    { key: 'electromagnetic', name: 'Điện từ', icon: '⚡' },
    { key: 'optics', name: 'Quang học', icon: '💡' },
    { key: 'thermodynamics', name: 'Nhiệt động', icon: '🌡️' },
    { key: 'nuclear', name: 'Hạt nhân', icon: '⚛️' },
    { key: 'math', name: 'Toán học', icon: '➗' }
  ];

  // Lọc hằng số
  const filteredConstants = Object.entries(PHYSICS_CONSTANTS).filter(([key, constant]) => {
    // Lọc theo nhóm
    if (selectedGroup !== 'all') {
      const groupKeys = CONSTANT_GROUPS[selectedGroup] || [];
      if (!groupKeys.includes(key)) return false;
    }

    // Lọc theo tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        constant.name.toLowerCase().includes(query) ||
        constant.symbol.toLowerCase().includes(query) ||
        key.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Copy giá trị
  const handleCopy = async (key, value) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="text-2xl">📖</span>
        Bảng hằng số vật lý
      </h2>

      {/* Thanh tìm kiếm */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm hằng số..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Chọn nhóm */}
      <div className="mb-4 flex flex-wrap gap-2">
        {groups.map(group => (
          <button
            key={group.key}
            onClick={() => setSelectedGroup(group.key)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              selectedGroup === group.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {group.icon} {group.name}
          </button>
        ))}
      </div>

      {/* Bảng hằng số */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Ký hiệu</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tên</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Giá trị</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Đơn vị</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Copy</th>
            </tr>
          </thead>
          <tbody>
            {filteredConstants.map(([key, constant]) => (
              <tr key={key} className="border-t hover:bg-blue-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-mono text-lg font-bold text-blue-600">
                    {constant.symbol}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <span className="font-medium text-gray-800">{constant.name}</span>
                    <p className="text-xs text-gray-500">{constant.description}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-mono text-gray-800">
                    {constant.value < 0.001 || constant.value >= 1e6
                      ? constant.value.toExponential(3)
                      : constant.value}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {constant.unit || '−'}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleCopy(key, constant.value)}
                    className={`px-2 py-1 rounded text-sm transition-colors ${
                      copiedKey === key
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    {copiedKey === key ? '✓' : '📋'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Không có kết quả */}
      {filteredConstants.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl">🔍</span>
          <p className="mt-2">Không tìm thấy hằng số phù hợp</p>
        </div>
      )}

      {/* Ghi chú */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-yellow-800">
        💡 <strong>Ghi chú:</strong> Các giá trị được làm tròn. Click vào nút copy để sao chép giá trị chính xác.
      </div>
    </div>
  );
};

export default ConstantsReference;

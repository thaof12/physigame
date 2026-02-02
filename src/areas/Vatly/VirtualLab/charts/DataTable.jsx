/**
 * DataTable.jsx - Bảng số liệu thí nghiệm
 * 
 * Hiển thị và quản lý số liệu thu thập được
 */

import React, { useState } from 'react';
import { Trash2, Download, RefreshCw, Plus, Edit2, Check, X } from 'lucide-react';

const DataTable = ({
  columns = [],
  data = [],
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onClearAll,
  onExport,
  editable = true,
  showActions = true,
  showStats = true,
  maxHeight = 300
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Bắt đầu chỉnh sửa
  const startEdit = (record) => {
    setEditingId(record.id);
    setEditValues({ ...record });
  };

  // Lưu chỉnh sửa
  const saveEdit = () => {
    if (onUpdateRecord) {
      onUpdateRecord(editingId, editValues);
    }
    setEditingId(null);
    setEditValues({});
  };

  // Hủy chỉnh sửa
  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  // Tính thống kê cho cột số
  const calculateStats = (columnName) => {
    const values = data
      .map(row => row[columnName])
      .filter(v => typeof v === 'number' && !isNaN(v));
    
    if (values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { avg: avg.toFixed(3), min: min.toFixed(3), max: max.toFixed(3) };
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header với actions */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <h3 className="text-white font-medium flex items-center gap-2">
          📊 Bảng số liệu
          <span className="text-sm text-gray-400">({data.length} bản ghi)</span>
        </h3>

        {showActions && (
          <div className="flex items-center gap-2">
            {onAddRecord && (
              <button
                onClick={onAddRecord}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-colors"
              >
                <Plus size={14} />
                Thêm
              </button>
            )}

            {onExport && data.length > 0 && (
              <button
                onClick={onExport}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-sm text-white transition-colors"
              >
                <Download size={14} />
                Xuất
              </button>
            )}

            {onClearAll && data.length > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm text-white transition-colors"
              >
                <RefreshCw size={14} />
                Xóa hết
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto" style={{ maxHeight }}>
        <table className="w-full">
          <thead className="bg-gray-800 sticky top-0">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.name}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-300 whitespace-nowrap"
                >
                  {col.label}
                  {col.unit && (
                    <span className="text-gray-500 ml-1">({col.unit})</span>
                  )}
                </th>
              ))}
              {editable && <th className="px-4 py-2 w-20"></th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (editable ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Chưa có dữ liệu. Thực hiện thí nghiệm để thu thập số liệu.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-800/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.name} className="px-4 py-2">
                      {editingId === row.id ? (
                        <input
                          type={col.type === 'number' ? 'number' : 'text'}
                          value={editValues[col.name] ?? ''}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            [col.name]: col.type === 'number' 
                              ? parseFloat(e.target.value) 
                              : e.target.value
                          })}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          step={col.type === 'number' ? 'any' : undefined}
                        />
                      ) : (
                        <span className="text-gray-200 text-sm font-mono">
                          {typeof row[col.name] === 'number'
                            ? row[col.name].toFixed(col.precision ?? 3)
                            : row[col.name] ?? '-'}
                        </span>
                      )}
                    </td>
                  ))}

                  {editable && (
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        {editingId === row.id ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className="p-1 text-green-400 hover:text-green-300"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 text-gray-400 hover:text-gray-300"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(row)}
                              className="p-1 text-blue-400 hover:text-blue-300"
                            >
                              <Edit2 size={14} />
                            </button>
                            {onDeleteRecord && (
                              <button
                                onClick={() => onDeleteRecord(row.id)}
                                className="p-1 text-red-400 hover:text-red-300"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>

          {/* Footer với thống kê */}
          {showStats && data.length > 0 && (
            <tfoot className="bg-gray-800 border-t border-gray-600">
              <tr>
                {columns.map((col) => (
                  <td key={col.name} className="px-4 py-2">
                    {col.type === 'number' && col.name !== 'trial' && col.name !== 'id' ? (
                      <div className="text-xs">
                        {(() => {
                          const stats = calculateStats(col.name);
                          if (!stats) return null;
                          return (
                            <span className="text-yellow-400 font-mono">
                              TB: {stats.avg}
                            </span>
                          );
                        })()}
                      </div>
                    ) : col.name === 'trial' ? (
                      <span className="text-xs text-gray-400">Thống kê</span>
                    ) : null}
                  </td>
                ))}
                {editable && <td></td>}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default DataTable;

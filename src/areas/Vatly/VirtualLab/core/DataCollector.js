/**
 * DataCollector.js - Thu thập và xử lý số liệu thí nghiệm
 * 
 * Chức năng:
 * - Ghi nhận số liệu từ các lần đo
 * - Tính toán thống kê (trung bình, sai số)
 * - Xuất dữ liệu (CSV, JSON)
 * - Tạo báo cáo thí nghiệm
 */

import { PhysicsUtils } from './PhysicsEngine';

/**
 * Class quản lý dữ liệu thí nghiệm
 */
export class ExperimentDataCollector {
  constructor(experimentName, columns = []) {
    this.experimentName = experimentName;
    this.columns = columns; // Định nghĩa các cột dữ liệu
    this.data = []; // Mảng chứa các bản ghi
    this.startTime = new Date();
    this.metadata = {};
  }

  /**
   * Thêm một bản ghi mới
   */
  addRecord(record) {
    const newRecord = {
      id: this.data.length + 1,
      timestamp: new Date().toISOString(),
      ...record
    };
    this.data.push(newRecord);
    return newRecord;
  }

  /**
   * Xóa bản ghi theo ID
   */
  removeRecord(id) {
    this.data = this.data.filter(record => record.id !== id);
    // Cập nhật lại ID
    this.data.forEach((record, index) => {
      record.id = index + 1;
    });
  }

  /**
   * Cập nhật bản ghi
   */
  updateRecord(id, updates) {
    const index = this.data.findIndex(record => record.id === id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updates };
      return this.data[index];
    }
    return null;
  }

  /**
   * Lấy tất cả dữ liệu
   */
  getAllData() {
    return [...this.data];
  }

  /**
   * Lấy giá trị của một cột
   */
  getColumnValues(columnName) {
    return this.data.map(record => record[columnName]).filter(v => v !== undefined);
  }

  /**
   * Tính giá trị trung bình của một cột
   */
  getColumnAverage(columnName) {
    const values = this.getColumnValues(columnName);
    return PhysicsUtils.average(values);
  }

  /**
   * Tính độ lệch chuẩn của một cột
   */
  getColumnStdDev(columnName) {
    const values = this.getColumnValues(columnName);
    return PhysicsUtils.standardDeviation(values);
  }

  /**
   * Tính sai số tương đối so với giá trị lý thuyết
   */
  getRelativeError(columnName, theoreticalValue) {
    const average = this.getColumnAverage(columnName);
    return PhysicsUtils.relativeError(average, theoreticalValue);
  }

  /**
   * Lấy thống kê tổng hợp cho một cột
   */
  getColumnStats(columnName) {
    const values = this.getColumnValues(columnName);
    if (values.length === 0) {
      return { count: 0, min: 0, max: 0, average: 0, stdDev: 0 };
    }

    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      average: PhysicsUtils.round(PhysicsUtils.average(values), 4),
      stdDev: PhysicsUtils.round(PhysicsUtils.standardDeviation(values), 4)
    };
  }

  /**
   * Xóa toàn bộ dữ liệu
   */
  clearData() {
    this.data = [];
    this.startTime = new Date();
  }

  /**
   * Thiết lập metadata
   */
  setMetadata(key, value) {
    this.metadata[key] = value;
  }

  /**
   * Xuất dữ liệu dạng CSV
   */
  exportToCSV() {
    if (this.data.length === 0) return '';

    // Header
    const headers = Object.keys(this.data[0]).filter(key => key !== 'timestamp');
    let csv = headers.join(',') + '\n';

    // Data rows
    this.data.forEach(record => {
      const row = headers.map(header => {
        const value = record[header];
        // Xử lý giá trị có dấu phẩy
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value ?? '';
      });
      csv += row.join(',') + '\n';
    });

    return csv;
  }

  /**
   * Tải xuống file CSV
   */
  downloadCSV(filename) {
    const csv = this.exportToCSV();
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename || `${this.experimentName}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /**
   * Xuất dữ liệu dạng JSON
   */
  exportToJSON() {
    return JSON.stringify({
      experimentName: this.experimentName,
      startTime: this.startTime.toISOString(),
      exportTime: new Date().toISOString(),
      metadata: this.metadata,
      columns: this.columns,
      recordCount: this.data.length,
      data: this.data
    }, null, 2);
  }

  /**
   * Tải xuống file JSON
   */
  downloadJSON(filename) {
    const json = this.exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename || `${this.experimentName}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /**
   * Import dữ liệu từ JSON
   */
  importFromJSON(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.experimentName = imported.experimentName || this.experimentName;
      this.columns = imported.columns || this.columns;
      this.metadata = imported.metadata || {};
      this.data = imported.data || [];
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  /**
   * Tạo báo cáo thí nghiệm
   */
  generateReport(theoreticalValues = {}) {
    const report = {
      title: `BÁO CÁO THÍ NGHIỆM: ${this.experimentName}`,
      date: new Date().toLocaleDateString('vi-VN'),
      time: new Date().toLocaleTimeString('vi-VN'),
      metadata: this.metadata,
      summary: {
        totalRecords: this.data.length,
        duration: this.getDuration()
      },
      statistics: {},
      errors: {}
    };

    // Tính thống kê cho từng cột số
    this.columns.forEach(col => {
      if (col.type === 'number') {
        report.statistics[col.name] = this.getColumnStats(col.name);
        
        // Tính sai số nếu có giá trị lý thuyết
        if (theoreticalValues[col.name] !== undefined) {
          const avg = this.getColumnAverage(col.name);
          report.errors[col.name] = {
            theoretical: theoreticalValues[col.name],
            measured: PhysicsUtils.round(avg, 4),
            absoluteError: PhysicsUtils.round(
              PhysicsUtils.absoluteError(avg, theoreticalValues[col.name]), 
              4
            ),
            relativeError: PhysicsUtils.round(
              PhysicsUtils.relativeError(avg, theoreticalValues[col.name]), 
              2
            ) + '%'
          };
        }
      }
    });

    return report;
  }

  /**
   * Tính thời gian thực hiện thí nghiệm
   */
  getDuration() {
    const now = new Date();
    const diff = now - this.startTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes} phút ${seconds} giây`;
  }
}

/**
 * Factory function tạo DataCollector cho các thí nghiệm cụ thể
 */
export const createDataCollector = {
  // Thí nghiệm đo gia tốc rơi tự do
  freeFall: () => new ExperimentDataCollector('Đo gia tốc rơi tự do', [
    { name: 'trial', label: 'Lần đo', type: 'number' },
    { name: 'height', label: 'Độ cao h (m)', type: 'number', unit: 'm' },
    { name: 'time', label: 'Thời gian t (s)', type: 'number', unit: 's' },
    { name: 'g', label: 'Gia tốc g (m/s²)', type: 'number', unit: 'm/s²' }
  ]),

  // Thí nghiệm dao động con lắc đơn
  simplePendulum: () => new ExperimentDataCollector('Dao động con lắc đơn', [
    { name: 'trial', label: 'Lần đo', type: 'number' },
    { name: 'length', label: 'Chiều dài L (m)', type: 'number', unit: 'm' },
    { name: 'oscillations', label: 'Số dao động n', type: 'number' },
    { name: 'totalTime', label: 'Thời gian t (s)', type: 'number', unit: 's' },
    { name: 'period', label: 'Chu kỳ T (s)', type: 'number', unit: 's' },
    { name: 'g', label: 'Gia tốc g (m/s²)', type: 'number', unit: 'm/s²' }
  ]),

  // Thí nghiệm định luật Ôm
  ohmLaw: () => new ExperimentDataCollector('Khảo sát định luật Ôm', [
    { name: 'trial', label: 'Lần đo', type: 'number' },
    { name: 'voltage', label: 'Hiệu điện thế U (V)', type: 'number', unit: 'V' },
    { name: 'current', label: 'Cường độ dòng điện I (A)', type: 'number', unit: 'A' },
    { name: 'resistance', label: 'Điện trở R (Ω)', type: 'number', unit: 'Ω' }
  ]),

  // Thí nghiệm thấu kính
  lensOptics: () => new ExperimentDataCollector('Đo tiêu cự thấu kính', [
    { name: 'trial', label: 'Lần đo', type: 'number' },
    { name: 'd', label: 'Khoảng cách vật d (cm)', type: 'number', unit: 'cm' },
    { name: 'dPrime', label: 'Khoảng cách ảnh d\' (cm)', type: 'number', unit: 'cm' },
    { name: 'f', label: 'Tiêu cự f (cm)', type: 'number', unit: 'cm' }
  ]),

  // Thí nghiệm giao thoa ánh sáng
  lightInterference: () => new ExperimentDataCollector('Giao thoa ánh sáng', [
    { name: 'trial', label: 'Lần đo', type: 'number' },
    { name: 'fringeOrder', label: 'Bậc vân k', type: 'number' },
    { name: 'position', label: 'Vị trí x (mm)', type: 'number', unit: 'mm' },
    { name: 'fringeSpacing', label: 'Khoảng vân i (mm)', type: 'number', unit: 'mm' },
    { name: 'wavelength', label: 'Bước sóng λ (nm)', type: 'number', unit: 'nm' }
  ])
};

export default ExperimentDataCollector;

/**
 * PHYSICS FORMULAS - TỔNG HỢP TẤT CẢ CÔNG THỨC VẬT LÝ
 * Từ lớp 6 đến lớp 12
 */

import { GRADE_6_FORMULAS, GRADE_7_FORMULAS } from './formulas-grade6-7';
import { GRADE_8_FORMULAS } from './formulas-grade8';
import { GRADE_9_FORMULAS } from './formulas-grade9';
import { GRADE_10_FORMULAS } from './formulas-grade10';
import { GRADE_11_FORMULAS } from './formulas-grade11';
import { GRADE_12_FORMULAS } from './formulas-grade12';

// Tổng hợp tất cả công thức
export const PHYSICS_FORMULAS = {
  6: GRADE_6_FORMULAS,
  7: GRADE_7_FORMULAS,
  8: GRADE_8_FORMULAS,
  9: GRADE_9_FORMULAS,
  10: GRADE_10_FORMULAS,
  11: GRADE_11_FORMULAS,
  12: GRADE_12_FORMULAS
};

// Danh sách lớp
export const GRADE_LIST = [
  { value: 6, label: 'Lớp 6' },
  { value: 7, label: 'Lớp 7' },
  { value: 8, label: 'Lớp 8' },
  { value: 9, label: 'Lớp 9' },
  { value: 10, label: 'Lớp 10' },
  { value: 11, label: 'Lớp 11' },
  { value: 12, label: 'Lớp 12' }
];

/**
 * Lấy tất cả công thức của một lớp
 */
export const getFormulasByGrade = (grade) => {
  return PHYSICS_FORMULAS[grade] || null;
};

/**
 * Lấy tất cả chương của một lớp
 */
export const getChaptersByGrade = (grade) => {
  const gradeData = PHYSICS_FORMULAS[grade];
  return gradeData?.chapters || [];
};

/**
 * Lấy công thức theo ID
 */
export const getFormulaById = (formulaId) => {
  for (const grade of Object.values(PHYSICS_FORMULAS)) {
    for (const chapter of grade.chapters) {
      const formula = chapter.formulas.find(f => f.id === formulaId);
      if (formula) {
        return { ...formula, grade: grade.grade, chapter: chapter.name };
      }
    }
  }
  return null;
};

/**
 * Tìm kiếm công thức theo tên
 */
export const searchFormulas = (query) => {
  const results = [];
  const lowerQuery = query.toLowerCase();

  for (const grade of Object.values(PHYSICS_FORMULAS)) {
    for (const chapter of grade.chapters) {
      for (const formula of chapter.formulas) {
        if (
          formula.name.toLowerCase().includes(lowerQuery) ||
          formula.description.toLowerCase().includes(lowerQuery) ||
          formula.formula.toLowerCase().includes(lowerQuery)
        ) {
          results.push({
            ...formula,
            grade: grade.grade,
            gradeName: grade.name,
            chapter: chapter.name,
            chapterId: chapter.id
          });
        }
      }
    }
  }

  return results;
};

/**
 * Lấy tất cả công thức (flat list)
 */
export const getAllFormulas = () => {
  const all = [];
  for (const grade of Object.values(PHYSICS_FORMULAS)) {
    for (const chapter of grade.chapters) {
      for (const formula of chapter.formulas) {
        all.push({
          ...formula,
          grade: grade.grade,
          gradeName: grade.name,
          chapter: chapter.name,
          chapterId: chapter.id
        });
      }
    }
  }
  return all;
};

/**
 * Đếm tổng số công thức
 */
export const getTotalFormulasCount = () => {
  let count = 0;
  for (const grade of Object.values(PHYSICS_FORMULAS)) {
    for (const chapter of grade.chapters) {
      count += chapter.formulas.length;
    }
  }
  return count;
};

export default PHYSICS_FORMULAS;

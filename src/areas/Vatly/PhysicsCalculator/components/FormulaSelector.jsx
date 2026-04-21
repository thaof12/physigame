/**
 * FormulaSelector - Component chọn công thức
 */

import React, { useState, useMemo } from 'react';
import { 
  PHYSICS_FORMULAS, 
  GRADE_LIST, 
  getChaptersByGrade,
  searchFormulas 
} from '../data/formulas';

const FormulaSelector = ({ onSelectFormula, selectedFormula }) => {
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Lấy danh sách chương theo lớp
  const chapters = useMemo(() => {
    if (!selectedGrade) return [];
    return getChaptersByGrade(selectedGrade);
  }, [selectedGrade]);

  // Lấy danh sách công thức theo chương
  const formulas = useMemo(() => {
    if (!selectedChapter) return [];
    const chapter = chapters.find(c => c.id === selectedChapter);
    return chapter?.formulas || [];
  }, [selectedChapter, chapters]);

  // Kết quả tìm kiếm
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchFormulas(searchQuery);
  }, [searchQuery]);

  // Xử lý chọn lớp
  const handleGradeSelect = (grade) => {
    setSelectedGrade(grade);
    setSelectedChapter(null);
    setIsSearching(false);
    setSearchQuery('');
  };

  // Xử lý chọn chương
  const handleChapterSelect = (chapterId) => {
    setSelectedChapter(chapterId);
  };

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(query.trim().length > 0);
  };

  // Xử lý chọn công thức
  const handleFormulaSelect = (formula) => {
    onSelectFormula(formula);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Thanh tìm kiếm */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm công thức (VD: vận tốc, định luật Ohm...)"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
          />
          <svg 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Kết quả tìm kiếm */}
      {isSearching && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Kết quả tìm kiếm ({searchResults.length})
          </h3>
          {searchResults.length > 0 ? (
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {searchResults.map((formula) => (
                <button
                  key={formula.id}
                  onClick={() => handleFormulaSelect(formula)}
                  className={`p-3 text-left rounded-lg border-2 transition-all hover:shadow-md ${
                    selectedFormula?.id === formula.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-gray-800">{formula.name}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({formula.gradeName} - {formula.chapter})
                      </span>
                    </div>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {formula.formula}
                    </code>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{formula.description}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Không tìm thấy công thức phù hợp
            </p>
          )}
        </div>
      )}

      {/* Chọn theo lớp/chương */}
      {!isSearching && (
        <>
          {/* Chọn lớp */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">📚 Chọn lớp</h3>
            <div className="flex flex-wrap gap-2">
              {GRADE_LIST.map((grade) => (
                <button
                  key={grade.value}
                  onClick={() => handleGradeSelect(grade.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedGrade === grade.value
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {grade.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chọn chương */}
          {selectedGrade && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">📖 Chọn chương</h3>
              <div className="grid gap-2">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterSelect(chapter.id)}
                    className={`p-3 text-left rounded-lg border-2 transition-all ${
                      selectedChapter === chapter.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <span className="font-medium">{chapter.name}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({chapter.formulas.length} công thức)
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chọn công thức */}
          {selectedChapter && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">📐 Chọn công thức</h3>
              <div className="grid gap-2 max-h-60 overflow-y-auto">
                {formulas.map((formula) => (
                  <button
                    key={formula.id}
                    onClick={() => handleFormulaSelect(formula)}
                    className={`p-3 text-left rounded-lg border-2 transition-all hover:shadow-md ${
                      selectedFormula?.id === formula.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">{formula.name}</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {formula.formula}
                      </code>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{formula.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FormulaSelector;

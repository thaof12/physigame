import { useState, useMemo } from 'react';
import { Search, BookOpen, Star, Filter, Copy, Check } from 'lucide-react';
import physicsConstants from '../../data/physicsConstants.json';

const ConstantsReference = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  // Kết hợp tất cả hằng số
  const allConstants = [
    ...physicsConstants.fundamentalConstants,
    ...physicsConstants.derivedConstants
  ];

  // Lấy danh sách categories
  const categories = ['all', ...new Set(allConstants.map(c => c.category))];

  // Lọc hằng số theo search và category
  const filteredConstants = useMemo(() => {
    return allConstants.filter(constant => {
      const matchesSearch = 
        constant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        constant.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        constant.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'all' || constant.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, allConstants]);

  // Copy giá trị
  const handleCopy = (constant) => {
    const text = `${constant.symbol} = ${constant.value} ${constant.unit}`;
    navigator.clipboard.writeText(text);
    setCopiedId(constant.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Format số khoa học
  const formatScientific = (value) => {
    if (typeof value !== 'number') return value;
    
    if (Math.abs(value) >= 1000 || (Math.abs(value) < 0.01 && value !== 0)) {
      return value.toExponential(10);
    }
    return value.toString();
  };

  // Nhóm hằng số theo category
  const groupedConstants = useMemo(() => {
    const groups = {};
    filteredConstants.forEach(constant => {
      if (!groups[constant.category]) {
        groups[constant.category] = [];
      }
      groups[constant.category].push(constant);
    });
    return groups;
  }, [filteredConstants]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-12 h-12 text-purple-600 dark:text-purple-400" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Tra Cứu Hằng Số Vật Lý
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Tra cứu nhanh các hằng số vật lý quan trọng
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm hằng số, ký hiệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.filter(c => c !== 'all').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Tìm thấy: <strong className="text-purple-600 dark:text-purple-400">{filteredConstants.length}</strong> hằng số</span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Constants Grid - Grouped by Category */}
        {selectedCategory === 'all' ? (
          Object.entries(groupedConstants).map(([category, constants]) => (
            <div key={category} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                {category}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {constants.map((constant) => (
                  <ConstantCard 
                    key={constant.id} 
                    constant={constant} 
                    onCopy={handleCopy}
                    copied={copiedId === constant.id}
                    formatScientific={formatScientific}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConstants.map((constant) => (
              <ConstantCard 
                key={constant.id} 
                constant={constant} 
                onCopy={handleCopy}
                copied={copiedId === constant.id}
                formatScientific={formatScientific}
              />
            ))}
          </div>
        )}

        {/* No results */}
        {filteredConstants.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Không tìm thấy hằng số nào phù hợp
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Component Card cho mỗi hằng số
const ConstantCard = ({ constant, onCopy, copied, formatScientific }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 border-t-4 border-purple-500">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
            {constant.name}
          </h3>
          <span className="inline-block px-2 py-1 text-xs font-semibold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
            {constant.category}
          </span>
        </div>
        <button
          onClick={() => onCopy(constant)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Copy giá trị"
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      <div className="space-y-3">
        {/* Symbol */}
        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ký hiệu:</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {constant.symbol}
          </p>
        </div>

        {/* Value */}
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Giá trị:</p>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-lg font-mono font-semibold text-gray-800 dark:text-white break-all">
              {formatScientific(constant.value)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {constant.unit}
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {constant.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConstantsReference;

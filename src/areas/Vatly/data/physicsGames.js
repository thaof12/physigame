// Physics Games Data for KL Integration
export const physicsGames = [
  {
    id: 'lop6-1',
    title: 'Trò chơi cân bằng',
    slug: 'balance',
    description: 'Khám phá các nguyên lý cân bằng và trọng tâm qua các thử thách thú vị',
    difficulty: 'easy',
    grade: 6,
    icon: '⚖️',
    color: 'from-blue-400 to-blue-600',
    topics: ['Cân bằng', 'Trọng tâm', 'Lực'],
    estimatedTime: '15 phút'
  },
  {
    id: 'lop7-1',
    title: 'Chủ nhân màu sắc',
    slug: 'color-master',
    description: 'Khám phá thế giới ánh sáng và màu sắc, hiểu về phổ ánh sáng',
    difficulty: 'medium',
    grade: 7,
    icon: '🌈',
    color: 'from-purple-400 to-pink-600',
    topics: ['Ánh sáng', 'Màu sắc', 'Phổ'],
    estimatedTime: '20 phút'
  },
  {
    id: 'lop8-1',
    title: 'Phòng thí nghiệm điện từ',
    slug: 'electromagnetic',
    description: 'Tìm hiểu về điện trường, từ trường và hiện tượng cảm ứng điện từ',
    difficulty: 'medium',
    grade: 8,
    icon: '⚡',
    color: 'from-yellow-400 to-orange-600',
    topics: ['Điện trường', 'Từ trường', 'Cảm ứng điện từ'],
    estimatedTime: '25 phút'
  },
  {
    id: 'lop8-2',
    title: 'Phòng thí nghiệm Nano',
    slug: 'nanolab',
    description: 'Khám phá thế giới vi mô và công nghệ nano',
    difficulty: 'hard',
    grade: 8,
    icon: '🔬',
    color: 'from-teal-400 to-cyan-600',
    topics: ['Công nghệ nano', 'Vật liệu', 'Vi mô'],
    estimatedTime: '30 phút'
  },
  {
    id: 'lop9-1',
    title: 'Trò chơi Plasma',
    slug: 'plasma',
    description: 'Tương tác với trạng thái plasma - trạng thái thứ tư của vật chất',
    difficulty: 'hard',
    grade: 9,
    icon: '⚛️',
    color: 'from-indigo-400 to-purple-600',
    topics: ['Plasma', 'Trạng thái vật chất', 'Năng lượng'],
    estimatedTime: '25 phút'
  },
  {
    id: 'lop9-2',
    title: 'Chuyển động ném xiên',
    slug: 'projectile',
    description: 'Mô phỏng và tính toán chuyển động của vật thể ném xiên',
    difficulty: 'medium',
    grade: 9,
    icon: '🎯',
    color: 'from-green-400 to-emerald-600',
    topics: ['Chuyển động', 'Gia tốc', 'Quỹ đạo'],
    estimatedTime: '20 phút'
  },
  {
    id: 'lop9-3',
    title: 'Điện tích tĩnh',
    slug: 'static',
    description: 'Khám phá hiện tượng nhiễm điện và tương tác điện tích',
    difficulty: 'easy',
    grade: 9,
    icon: '⚡',
    color: 'from-amber-400 to-orange-600',
    topics: ['Điện tích', 'Nhiễm điện', 'Lực Coulomb'],
    estimatedTime: '15 phút'
  },
  {
    id: 'lop10-1',
    title: 'Phòng thí nghiệm nhiệt',
    slug: 'thermo',
    description: 'Nghiên cứu về nhiệt độ, nhiệt lượng và các quy trình nhiệt động',
    difficulty: 'medium',
    grade: 10,
    icon: '🌡️',
    color: 'from-red-400 to-rose-600',
    topics: ['Nhiệt độ', 'Nhiệt lượng', 'Nhiệt động học'],
    estimatedTime: '25 phút'
  },
  {
    id: 'lop6-2',
    title: 'Phòng thí nghiệm nước',
    slug: 'water',
    description: 'Tìm hiểu về các tính chất vật lý của nước và áp suất thủy tĩnh',
    difficulty: 'easy',
    grade: 6,
    icon: '💧',
    color: 'from-blue-400 to-sky-600',
    topics: ['Áp suất', 'Thủy tĩnh', 'Lực đẩy Archimedes'],
    estimatedTime: '20 phút'
  }
];

// Grade configuration
export const physicsGrades = [
  {
    id: 6,
    title: 'Lớp 6',
    description: 'Làm quen với Vật lý',
    color: 'from-blue-400 to-blue-600',
    icon: '🔭',
    topics: ['Đại cương vật lý', 'Đo lường', 'Chuyển động', 'Lực'],
    type: 'class'
  },
  {
    id: 7,
    title: 'Lớp 7',
    description: 'Ánh sáng và Âm thanh',
    color: 'from-green-400 to-green-600',
    icon: '🌟',
    topics: ['Ánh sáng', 'Âm thanh', 'Nhiệt học cơ bản'],
    type: 'class'
  },
  {
    id: 8,
    title: 'Lớp 8',
    description: 'Cơ học và Điện học',
    color: 'from-yellow-400 to-yellow-600',
    icon: '⚙️',
    topics: ['Cơ học', 'Áp suất', 'Điện học cơ bản'],
    type: 'class'
  },
  {
    id: 9,
    title: 'Lớp 9',
    description: 'Điện từ và Quang học',
    color: 'from-purple-400 to-purple-600',
    icon: '🔌',
    topics: ['Điện từ trường', 'Sóng điện từ', 'Quang học'],
    type: 'class'
  },
  {
    id: 10,
    title: 'Lớp 10',
    description: 'Vật lý nâng cao',
    color: 'from-red-400 to-red-600',
    icon: '🚀',
    topics: ['Động học', 'Nhiệt động học', 'Dao động sóng'],
    type: 'class'
  },
  {
    id: 'challenge',
    title: 'Thử thách',
    description: 'Trò chơi Vật lý',
    color: 'from-orange-400 to-orange-600',
    icon: '🏆',
    topics: ['Mô phỏng', 'Thí nghiệm ảo', 'Game tương tác'],
    type: 'challenge'
  }
];

/**
 * DATABASE CÔNG THỨC VẬT LÝ - LỚP 6 & 7
 * Tách riêng để dễ quản lý
 */

export const GRADE_6_FORMULAS = {
  grade: 6,
  name: 'Vật lý lớp 6',
  chapters: [
    {
      id: 'g6-c1',
      name: 'Cơ học',
      formulas: [
        {
          id: 'velocity-basic',
          name: 'Vận tốc',
          description: 'Công thức tính vận tốc trung bình',
          formula: 'v = s / t',
          latex: 'v = \\frac{s}{t}',
          variables: [
            { symbol: 'v', name: 'Vận tốc', unit: 'm/s', unitCategory: 'velocity' },
            { symbol: 's', name: 'Quãng đường', unit: 'm', unitCategory: 'length' },
            { symbol: 't', name: 'Thời gian', unit: 's', unitCategory: 'time' }
          ],
          variants: [
            { solve: 'v', formula: (vars) => vars.s / vars.t },
            { solve: 's', formula: (vars) => vars.v * vars.t },
            { solve: 't', formula: (vars) => vars.s / vars.v }
          ]
        },
        {
          id: 'density',
          name: 'Khối lượng riêng',
          description: 'Công thức tính khối lượng riêng',
          formula: 'D = m / V',
          latex: 'D = \\frac{m}{V}',
          variables: [
            { symbol: 'D', name: 'Khối lượng riêng', unit: 'kg/m³', unitCategory: 'density' },
            { symbol: 'm', name: 'Khối lượng', unit: 'kg', unitCategory: 'mass' },
            { symbol: 'V', name: 'Thể tích', unit: 'm³', unitCategory: 'volume' }
          ],
          variants: [
            { solve: 'D', formula: (vars) => vars.m / vars.V },
            { solve: 'm', formula: (vars) => vars.D * vars.V },
            { solve: 'V', formula: (vars) => vars.m / vars.D }
          ]
        }
      ]
    },
    {
      id: 'g6-c2',
      name: 'Nhiệt học',
      formulas: [
        {
          id: 'temp-celsius-kelvin',
          name: 'Chuyển đổi nhiệt độ',
          description: 'Chuyển đổi giữa độ C và Kelvin',
          formula: 'T = t + 273',
          latex: 'T = t + 273',
          variables: [
            { symbol: 'T', name: 'Nhiệt độ Kelvin', unit: 'K', unitCategory: 'temperature' },
            { symbol: 't', name: 'Nhiệt độ Celsius', unit: '°C', unitCategory: 'temperature' }
          ],
          variants: [
            { solve: 'T', formula: (vars) => vars.t + 273 },
            { solve: 't', formula: (vars) => vars.T - 273 }
          ]
        }
      ]
    }
  ]
};

export const GRADE_7_FORMULAS = {
  grade: 7,
  name: 'Vật lý lớp 7',
  chapters: [
    {
      id: 'g7-c1',
      name: 'Quang học',
      formulas: [
        {
          id: 'light-reflection',
          name: 'Định luật phản xạ ánh sáng',
          description: 'Góc phản xạ bằng góc tới',
          formula: "i' = i",
          latex: "i' = i",
          variables: [
            { symbol: 'i', name: 'Góc tới', unit: '°', unitCategory: 'angle' },
            { symbol: "i'", name: 'Góc phản xạ', unit: '°', unitCategory: 'angle' }
          ],
          variants: [
            { solve: "i'", formula: (vars) => vars.i },
            { solve: 'i', formula: (vars) => vars["i'"] }
          ]
        },
        {
          id: 'mirror-image-distance',
          name: 'Khoảng cách ảnh qua gương phẳng',
          description: 'Khoảng cách từ ảnh đến gương bằng khoảng cách từ vật đến gương',
          formula: "d' = d",
          latex: "d' = d",
          variables: [
            { symbol: 'd', name: 'Khoảng cách vật đến gương', unit: 'cm', unitCategory: 'length' },
            { symbol: "d'", name: 'Khoảng cách ảnh đến gương', unit: 'cm', unitCategory: 'length' }
          ],
          variants: [
            { solve: "d'", formula: (vars) => vars.d },
            { solve: 'd', formula: (vars) => vars["d'"] }
          ]
        }
      ]
    },
    {
      id: 'g7-c2',
      name: 'Âm học',
      formulas: [
        {
          id: 'sound-speed',
          name: 'Vận tốc âm thanh',
          description: 'Tính vận tốc truyền âm',
          formula: 'v = s / t',
          latex: 'v = \\frac{s}{t}',
          variables: [
            { symbol: 'v', name: 'Vận tốc âm', unit: 'm/s', unitCategory: 'velocity' },
            { symbol: 's', name: 'Quãng đường', unit: 'm', unitCategory: 'length' },
            { symbol: 't', name: 'Thời gian', unit: 's', unitCategory: 'time' }
          ],
          variants: [
            { solve: 'v', formula: (vars) => vars.s / vars.t },
            { solve: 's', formula: (vars) => vars.v * vars.t },
            { solve: 't', formula: (vars) => vars.s / vars.v }
          ]
        },
        {
          id: 'frequency',
          name: 'Tần số dao động',
          description: 'Số dao động trong một giây',
          formula: 'f = N / t',
          latex: 'f = \\frac{N}{t}',
          variables: [
            { symbol: 'f', name: 'Tần số', unit: 'Hz', unitCategory: 'frequency' },
            { symbol: 'N', name: 'Số dao động', unit: '', unitCategory: null },
            { symbol: 't', name: 'Thời gian', unit: 's', unitCategory: 'time' }
          ],
          variants: [
            { solve: 'f', formula: (vars) => vars.N / vars.t },
            { solve: 'N', formula: (vars) => vars.f * vars.t },
            { solve: 't', formula: (vars) => vars.N / vars.f }
          ]
        },
        {
          id: 'period',
          name: 'Chu kỳ dao động',
          description: 'Thời gian để thực hiện một dao động',
          formula: 'T = 1 / f',
          latex: 'T = \\frac{1}{f}',
          variables: [
            { symbol: 'T', name: 'Chu kỳ', unit: 's', unitCategory: 'time' },
            { symbol: 'f', name: 'Tần số', unit: 'Hz', unitCategory: 'frequency' }
          ],
          variants: [
            { solve: 'T', formula: (vars) => 1 / vars.f },
            { solve: 'f', formula: (vars) => 1 / vars.T }
          ]
        }
      ]
    },
    {
      id: 'g7-c3',
      name: 'Điện học',
      formulas: [
        {
          id: 'electric-charge-basic',
          name: 'Điện tích',
          description: 'Điện tích cơ bản',
          formula: 'q = n × e',
          latex: 'q = n \\times e',
          variables: [
            { symbol: 'q', name: 'Điện tích', unit: 'C', unitCategory: 'charge' },
            { symbol: 'n', name: 'Số electron', unit: '', unitCategory: null },
            { symbol: 'e', name: 'Điện tích nguyên tố', unit: 'C', unitCategory: 'charge', constant: 1.6e-19 }
          ],
          variants: [
            { solve: 'q', formula: (vars) => vars.n * 1.6e-19 },
            { solve: 'n', formula: (vars) => vars.q / 1.6e-19 }
          ]
        }
      ]
    }
  ]
};

export default { GRADE_6_FORMULAS, GRADE_7_FORMULAS };

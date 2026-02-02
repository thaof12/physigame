/**
 * DATABASE CÔNG THỨC VẬT LÝ - LỚP 9
 */

export const GRADE_9_FORMULAS = {
  grade: 9,
  name: 'Vật lý lớp 9',
  chapters: [
    {
      id: 'g9-c1',
      name: 'Điện học',
      formulas: [
        {
          id: 'ohm-law',
          name: 'Định luật Ohm',
          description: 'Cường độ dòng điện qua dây dẫn',
          formula: 'I = U / R',
          latex: 'I = \\frac{U}{R}',
          variables: [
            { symbol: 'I', name: 'Cường độ dòng điện', unit: 'A', unitCategory: 'electricCurrent' },
            { symbol: 'U', name: 'Hiệu điện thế', unit: 'V', unitCategory: 'voltage' },
            { symbol: 'R', name: 'Điện trở', unit: 'Ω', unitCategory: 'resistance' }
          ],
          variants: [
            { solve: 'I', formula: (vars) => vars.U / vars.R },
            { solve: 'U', formula: (vars) => vars.I * vars.R },
            { solve: 'R', formula: (vars) => vars.U / vars.I }
          ]
        },
        {
          id: 'resistance-series',
          name: 'Điện trở mắc nối tiếp',
          description: 'Điện trở tương đương mạch nối tiếp',
          formula: 'R_tđ = R₁ + R₂',
          latex: 'R_{tđ} = R_1 + R_2',
          variables: [
            { symbol: 'R_td', name: 'Điện trở tương đương', unit: 'Ω', unitCategory: 'resistance' },
            { symbol: 'R1', name: 'Điện trở 1', unit: 'Ω', unitCategory: 'resistance' },
            { symbol: 'R2', name: 'Điện trở 2', unit: 'Ω', unitCategory: 'resistance' }
          ],
          variants: [
            { solve: 'R_td', formula: (vars) => vars.R1 + vars.R2 },
            { solve: 'R1', formula: (vars) => vars.R_td - vars.R2 },
            { solve: 'R2', formula: (vars) => vars.R_td - vars.R1 }
          ]
        },
        {
          id: 'resistance-parallel',
          name: 'Điện trở mắc song song',
          description: 'Điện trở tương đương mạch song song',
          formula: '1/R_tđ = 1/R₁ + 1/R₂',
          latex: '\\frac{1}{R_{tđ}} = \\frac{1}{R_1} + \\frac{1}{R_2}',
          variables: [
            { symbol: 'R_td', name: 'Điện trở tương đương', unit: 'Ω', unitCategory: 'resistance' },
            { symbol: 'R1', name: 'Điện trở 1', unit: 'Ω', unitCategory: 'resistance' },
            { symbol: 'R2', name: 'Điện trở 2', unit: 'Ω', unitCategory: 'resistance' }
          ],
          variants: [
            { solve: 'R_td', formula: (vars) => (vars.R1 * vars.R2) / (vars.R1 + vars.R2) },
            { solve: 'R1', formula: (vars) => (vars.R_td * vars.R2) / (vars.R2 - vars.R_td) },
            { solve: 'R2', formula: (vars) => (vars.R_td * vars.R1) / (vars.R1 - vars.R_td) }
          ]
        },
        {
          id: 'resistance-wire',
          name: 'Điện trở dây dẫn',
          description: 'Điện trở theo chiều dài và tiết diện',
          formula: 'R = ρ × l / S',
          latex: 'R = \\rho \\times \\frac{l}{S}',
          variables: [
            { symbol: 'R', name: 'Điện trở', unit: 'Ω', unitCategory: 'resistance' },
            { symbol: 'ρ', name: 'Điện trở suất', unit: 'Ω·m', unitCategory: null },
            { symbol: 'l', name: 'Chiều dài dây', unit: 'm', unitCategory: 'length' },
            { symbol: 'S', name: 'Tiết diện dây', unit: 'm²', unitCategory: 'area' }
          ],
          variants: [
            { solve: 'R', formula: (vars) => vars['ρ'] * vars.l / vars.S },
            { solve: 'ρ', formula: (vars) => vars.R * vars.S / vars.l },
            { solve: 'l', formula: (vars) => vars.R * vars.S / vars['ρ'] },
            { solve: 'S', formula: (vars) => vars['ρ'] * vars.l / vars.R }
          ]
        },
        {
          id: 'electric-power',
          name: 'Công suất điện',
          description: 'Công suất tiêu thụ điện năng',
          formula: 'P = U × I',
          latex: 'P = U \\times I',
          variables: [
            { symbol: 'P', name: 'Công suất', unit: 'W', unitCategory: 'power' },
            { symbol: 'U', name: 'Hiệu điện thế', unit: 'V', unitCategory: 'voltage' },
            { symbol: 'I', name: 'Cường độ dòng điện', unit: 'A', unitCategory: 'electricCurrent' }
          ],
          variants: [
            { solve: 'P', formula: (vars) => vars.U * vars.I },
            { solve: 'U', formula: (vars) => vars.P / vars.I },
            { solve: 'I', formula: (vars) => vars.P / vars.U }
          ]
        },
        {
          id: 'electric-power-r',
          name: 'Công suất điện (theo R)',
          description: 'Công suất theo điện trở',
          formula: 'P = I² × R = U² / R',
          latex: 'P = I^2 \\times R = \\frac{U^2}{R}',
          variables: [
            { symbol: 'P', name: 'Công suất', unit: 'W', unitCategory: 'power' },
            { symbol: 'I', name: 'Cường độ dòng điện', unit: 'A', unitCategory: 'electricCurrent' },
            { symbol: 'R', name: 'Điện trở', unit: 'Ω', unitCategory: 'resistance' }
          ],
          variants: [
            { solve: 'P', formula: (vars) => vars.I * vars.I * vars.R },
            { solve: 'I', formula: (vars) => Math.sqrt(vars.P / vars.R) },
            { solve: 'R', formula: (vars) => vars.P / (vars.I * vars.I) }
          ]
        },
        {
          id: 'electric-energy',
          name: 'Điện năng tiêu thụ',
          description: 'Năng lượng điện tiêu thụ',
          formula: 'A = P × t = U × I × t',
          latex: 'A = P \\times t = U \\times I \\times t',
          variables: [
            { symbol: 'A', name: 'Điện năng', unit: 'J', unitCategory: 'energy' },
            { symbol: 'P', name: 'Công suất', unit: 'W', unitCategory: 'power' },
            { symbol: 't', name: 'Thời gian', unit: 's', unitCategory: 'time' }
          ],
          variants: [
            { solve: 'A', formula: (vars) => vars.P * vars.t },
            { solve: 'P', formula: (vars) => vars.A / vars.t },
            { solve: 't', formula: (vars) => vars.A / vars.P }
          ]
        },
        {
          id: 'joule-lenz',
          name: 'Định luật Joule-Lenz',
          description: 'Nhiệt lượng tỏa ra trên điện trở',
          formula: 'Q = I² × R × t',
          latex: 'Q = I^2 \\times R \\times t',
          variables: [
            { symbol: 'Q', name: 'Nhiệt lượng', unit: 'J', unitCategory: 'energy' },
            { symbol: 'I', name: 'Cường độ dòng điện', unit: 'A', unitCategory: 'electricCurrent' },
            { symbol: 'R', name: 'Điện trở', unit: 'Ω', unitCategory: 'resistance' },
            { symbol: 't', name: 'Thời gian', unit: 's', unitCategory: 'time' }
          ],
          variants: [
            { solve: 'Q', formula: (vars) => vars.I * vars.I * vars.R * vars.t },
            { solve: 'I', formula: (vars) => Math.sqrt(vars.Q / (vars.R * vars.t)) },
            { solve: 'R', formula: (vars) => vars.Q / (vars.I * vars.I * vars.t) },
            { solve: 't', formula: (vars) => vars.Q / (vars.I * vars.I * vars.R) }
          ]
        }
      ]
    },
    {
      id: 'g9-c2',
      name: 'Điện từ học',
      formulas: [
        {
          id: 'transformer',
          name: 'Máy biến thế',
          description: 'Tỉ số biến đổi điện áp',
          formula: 'U₁/U₂ = n₁/n₂',
          latex: '\\frac{U_1}{U_2} = \\frac{n_1}{n_2}',
          variables: [
            { symbol: 'U1', name: 'Điện áp sơ cấp', unit: 'V', unitCategory: 'voltage' },
            { symbol: 'U2', name: 'Điện áp thứ cấp', unit: 'V', unitCategory: 'voltage' },
            { symbol: 'n1', name: 'Số vòng sơ cấp', unit: '', unitCategory: null },
            { symbol: 'n2', name: 'Số vòng thứ cấp', unit: '', unitCategory: null }
          ],
          variants: [
            { solve: 'U1', formula: (vars) => vars.U2 * vars.n1 / vars.n2 },
            { solve: 'U2', formula: (vars) => vars.U1 * vars.n2 / vars.n1 },
            { solve: 'n1', formula: (vars) => vars.n2 * vars.U1 / vars.U2 },
            { solve: 'n2', formula: (vars) => vars.n1 * vars.U2 / vars.U1 }
          ]
        }
      ]
    },
    {
      id: 'g9-c3',
      name: 'Quang học',
      formulas: [
        {
          id: 'refraction-law',
          name: 'Định luật khúc xạ',
          description: 'Chiết suất và góc khúc xạ',
          formula: 'n = sin(i) / sin(r)',
          latex: 'n = \\frac{\\sin i}{\\sin r}',
          variables: [
            { symbol: 'n', name: 'Chiết suất', unit: '', unitCategory: null },
            { symbol: 'i', name: 'Góc tới', unit: '°', unitCategory: 'angle' },
            { symbol: 'r', name: 'Góc khúc xạ', unit: '°', unitCategory: 'angle' }
          ],
          variants: [
            { solve: 'n', formula: (vars) => Math.sin(vars.i * Math.PI / 180) / Math.sin(vars.r * Math.PI / 180) },
            { solve: 'i', formula: (vars) => Math.asin(vars.n * Math.sin(vars.r * Math.PI / 180)) * 180 / Math.PI },
            { solve: 'r', formula: (vars) => Math.asin(Math.sin(vars.i * Math.PI / 180) / vars.n) * 180 / Math.PI }
          ]
        },
        {
          id: 'lens-formula',
          name: 'Công thức thấu kính',
          description: 'Quan hệ tiêu cự, vị trí vật và ảnh',
          formula: '1/f = 1/d + 1/d\'',
          latex: '\\frac{1}{f} = \\frac{1}{d} + \\frac{1}{d\'}',
          variables: [
            { symbol: 'f', name: 'Tiêu cự', unit: 'cm', unitCategory: 'length' },
            { symbol: 'd', name: 'Khoảng cách vật', unit: 'cm', unitCategory: 'length' },
            { symbol: "d'", name: 'Khoảng cách ảnh', unit: 'cm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'f', formula: (vars) => (vars.d * vars["d'"]) / (vars.d + vars["d'"]) },
            { solve: 'd', formula: (vars) => (vars.f * vars["d'"]) / (vars["d'"] - vars.f) },
            { solve: "d'", formula: (vars) => (vars.f * vars.d) / (vars.d - vars.f) }
          ]
        },
        {
          id: 'magnification',
          name: 'Độ phóng đại',
          description: 'Tỉ số chiều cao ảnh và vật',
          formula: 'k = h\'/h = d\'/d',
          latex: 'k = \\frac{h\'}{h} = \\frac{d\'}{d}',
          variables: [
            { symbol: 'k', name: 'Độ phóng đại', unit: '', unitCategory: null },
            { symbol: "h'", name: 'Chiều cao ảnh', unit: 'cm', unitCategory: 'length' },
            { symbol: 'h', name: 'Chiều cao vật', unit: 'cm', unitCategory: 'length' },
            { symbol: "d'", name: 'Khoảng cách ảnh', unit: 'cm', unitCategory: 'length' },
            { symbol: 'd', name: 'Khoảng cách vật', unit: 'cm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'k', formula: (vars) => vars["d'"] / vars.d },
            { solve: "h'", formula: (vars) => vars.k * vars.h },
            { solve: 'h', formula: (vars) => vars["h'"] / vars.k }
          ]
        }
      ]
    },
    {
      id: 'g9-c4',
      name: 'Năng lượng & Bảo toàn',
      formulas: [
        {
          id: 'kinetic-energy',
          name: 'Động năng',
          description: 'Năng lượng do chuyển động',
          formula: 'W_đ = ½mv²',
          latex: 'W_{đ} = \\frac{1}{2}mv^2',
          variables: [
            { symbol: 'W_đ', name: 'Động năng', unit: 'J', unitCategory: 'energy' },
            { symbol: 'm', name: 'Khối lượng', unit: 'kg', unitCategory: 'mass' },
            { symbol: 'v', name: 'Vận tốc', unit: 'm/s', unitCategory: 'velocity' }
          ],
          variants: [
            { solve: 'W_đ', formula: (vars) => 0.5 * vars.m * vars.v * vars.v },
            { solve: 'm', formula: (vars) => 2 * vars['W_đ'] / (vars.v * vars.v) },
            { solve: 'v', formula: (vars) => Math.sqrt(2 * vars['W_đ'] / vars.m) }
          ]
        },
        {
          id: 'potential-energy',
          name: 'Thế năng trọng trường',
          description: 'Năng lượng do vị trí',
          formula: 'W_t = mgh',
          latex: 'W_t = mgh',
          variables: [
            { symbol: 'W_t', name: 'Thế năng', unit: 'J', unitCategory: 'energy' },
            { symbol: 'm', name: 'Khối lượng', unit: 'kg', unitCategory: 'mass' },
            { symbol: 'g', name: 'Gia tốc trọng trường', unit: 'm/s²', constant: 9.8 },
            { symbol: 'h', name: 'Độ cao', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'W_t', formula: (vars) => vars.m * (vars.g || 9.8) * vars.h },
            { solve: 'm', formula: (vars) => vars.W_t / ((vars.g || 9.8) * vars.h) },
            { solve: 'h', formula: (vars) => vars.W_t / (vars.m * (vars.g || 9.8)) }
          ]
        }
      ]
    }
  ]
};

export default GRADE_9_FORMULAS;

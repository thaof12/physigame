/**
 * DATABASE CÔNG THỨC VẬT LÝ - LỚP 11
 */

export const GRADE_11_FORMULAS = {
  grade: 11,
  name: 'Vật lý lớp 11',
  chapters: [
    {
      id: 'g11-c1',
      name: 'Dao động cơ',
      formulas: [
        {
          id: 'shm-position',
          name: 'Phương trình dao động điều hòa',
          description: 'Li độ theo thời gian',
          formula: 'x = A×cos(ωt + φ)',
          latex: 'x = A\\cos(\\omega t + \\varphi)',
          variables: [
            { symbol: 'x', name: 'Li độ', unit: 'm', unitCategory: 'length' },
            { symbol: 'A', name: 'Biên độ', unit: 'm', unitCategory: 'length' },
            { symbol: 'ω', name: 'Tần số góc', unit: 'rad/s', unitCategory: null },
            { symbol: 't', name: 'Thời gian', unit: 's', unitCategory: 'time' },
            { symbol: 'φ', name: 'Pha ban đầu', unit: 'rad', unitCategory: 'angle' }
          ],
          variants: [
            { solve: 'x', formula: (vars) => vars.A * Math.cos(vars['ω'] * vars.t + vars['φ']) },
            { solve: 'A', formula: (vars) => vars.x / Math.cos(vars['ω'] * vars.t + vars['φ']) }
          ]
        },
        {
          id: 'shm-velocity',
          name: 'Vận tốc dao động điều hòa',
          description: 'Vận tốc theo thời gian',
          formula: 'v = -Aω×sin(ωt + φ)',
          latex: 'v = -A\\omega\\sin(\\omega t + \\varphi)',
          variables: [
            { symbol: 'v', name: 'Vận tốc', unit: 'm/s', unitCategory: 'velocity' },
            { symbol: 'A', name: 'Biên độ', unit: 'm', unitCategory: 'length' },
            { symbol: 'ω', name: 'Tần số góc', unit: 'rad/s', unitCategory: null },
            { symbol: 't', name: 'Thời gian', unit: 's', unitCategory: 'time' },
            { symbol: 'φ', name: 'Pha ban đầu', unit: 'rad', unitCategory: 'angle' }
          ],
          variants: [
            { solve: 'v', formula: (vars) => -vars.A * vars['ω'] * Math.sin(vars['ω'] * vars.t + vars['φ']) }
          ]
        },
        {
          id: 'shm-max-velocity',
          name: 'Vận tốc cực đại',
          description: 'Vận tốc lớn nhất trong dao động',
          formula: 'v_max = Aω',
          latex: 'v_{max} = A\\omega',
          variables: [
            { symbol: 'v_max', name: 'Vận tốc cực đại', unit: 'm/s', unitCategory: 'velocity' },
            { symbol: 'A', name: 'Biên độ', unit: 'm', unitCategory: 'length' },
            { symbol: 'ω', name: 'Tần số góc', unit: 'rad/s', unitCategory: null }
          ],
          variants: [
            { solve: 'v_max', formula: (vars) => vars.A * vars['ω'] },
            { solve: 'A', formula: (vars) => vars.v_max / vars['ω'] },
            { solve: 'ω', formula: (vars) => vars.v_max / vars.A }
          ]
        },
        {
          id: 'shm-period-spring',
          name: 'Chu kỳ con lắc lò xo',
          description: 'Chu kỳ dao động lò xo',
          formula: 'T = 2π√(m/k)',
          latex: 'T = 2\\pi\\sqrt{\\frac{m}{k}}',
          variables: [
            { symbol: 'T', name: 'Chu kỳ', unit: 's', unitCategory: 'time' },
            { symbol: 'm', name: 'Khối lượng', unit: 'kg', unitCategory: 'mass' },
            { symbol: 'k', name: 'Độ cứng lò xo', unit: 'N/m', unitCategory: null }
          ],
          variants: [
            { solve: 'T', formula: (vars) => 2 * Math.PI * Math.sqrt(vars.m / vars.k) },
            { solve: 'm', formula: (vars) => vars.k * vars.T * vars.T / (4 * Math.PI * Math.PI) },
            { solve: 'k', formula: (vars) => 4 * Math.PI * Math.PI * vars.m / (vars.T * vars.T) }
          ]
        },
        {
          id: 'shm-period-pendulum',
          name: 'Chu kỳ con lắc đơn',
          description: 'Chu kỳ dao động con lắc đơn',
          formula: 'T = 2π√(l/g)',
          latex: 'T = 2\\pi\\sqrt{\\frac{l}{g}}',
          variables: [
            { symbol: 'T', name: 'Chu kỳ', unit: 's', unitCategory: 'time' },
            { symbol: 'l', name: 'Chiều dài dây', unit: 'm', unitCategory: 'length' },
            { symbol: 'g', name: 'Gia tốc trọng trường', unit: 'm/s²', constant: 9.8 }
          ],
          variants: [
            { solve: 'T', formula: (vars) => 2 * Math.PI * Math.sqrt(vars.l / (vars.g || 9.8)) },
            { solve: 'l', formula: (vars) => (vars.g || 9.8) * vars.T * vars.T / (4 * Math.PI * Math.PI) },
            { solve: 'g', formula: (vars) => 4 * Math.PI * Math.PI * vars.l / (vars.T * vars.T) }
          ]
        },
        {
          id: 'shm-energy',
          name: 'Năng lượng dao động',
          description: 'Cơ năng trong dao động điều hòa',
          formula: 'W = ½kA² = ½mω²A²',
          latex: 'W = \\frac{1}{2}kA^2 = \\frac{1}{2}m\\omega^2 A^2',
          variables: [
            { symbol: 'W', name: 'Cơ năng', unit: 'J', unitCategory: 'energy' },
            { symbol: 'k', name: 'Độ cứng', unit: 'N/m', unitCategory: null },
            { symbol: 'A', name: 'Biên độ', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'W', formula: (vars) => 0.5 * vars.k * vars.A * vars.A },
            { solve: 'k', formula: (vars) => 2 * vars.W / (vars.A * vars.A) },
            { solve: 'A', formula: (vars) => Math.sqrt(2 * vars.W / vars.k) }
          ]
        }
      ]
    },
    {
      id: 'g11-c2',
      name: 'Sóng cơ',
      formulas: [
        {
          id: 'wave-velocity',
          name: 'Vận tốc sóng',
          description: 'Mối quan hệ v, λ, f',
          formula: 'v = λf = λ/T',
          latex: 'v = \\lambda f = \\frac{\\lambda}{T}',
          variables: [
            { symbol: 'v', name: 'Vận tốc sóng', unit: 'm/s', unitCategory: 'velocity' },
            { symbol: 'λ', name: 'Bước sóng', unit: 'm', unitCategory: 'length' },
            { symbol: 'f', name: 'Tần số', unit: 'Hz', unitCategory: 'frequency' }
          ],
          variants: [
            { solve: 'v', formula: (vars) => vars['λ'] * vars.f },
            { solve: 'λ', formula: (vars) => vars.v / vars.f },
            { solve: 'f', formula: (vars) => vars.v / vars['λ'] }
          ]
        },
        {
          id: 'wave-equation',
          name: 'Phương trình sóng',
          description: 'Li độ tại điểm M cách nguồn d',
          formula: 'u = A×cos(ωt - 2πd/λ)',
          latex: 'u = A\\cos\\left(\\omega t - \\frac{2\\pi d}{\\lambda}\\right)',
          variables: [
            { symbol: 'u', name: 'Li độ', unit: 'm', unitCategory: 'length' },
            { symbol: 'A', name: 'Biên độ', unit: 'm', unitCategory: 'length' },
            { symbol: 'ω', name: 'Tần số góc', unit: 'rad/s', unitCategory: null },
            { symbol: 't', name: 'Thời gian', unit: 's', unitCategory: 'time' },
            { symbol: 'd', name: 'Khoảng cách', unit: 'm', unitCategory: 'length' },
            { symbol: 'λ', name: 'Bước sóng', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'u', formula: (vars) => vars.A * Math.cos(vars['ω'] * vars.t - 2 * Math.PI * vars.d / vars['λ']) }
          ]
        },
        {
          id: 'standing-wave-two-fixed',
          name: 'Sóng dừng hai đầu cố định',
          description: 'Điều kiện có sóng dừng',
          formula: 'l = n×λ/2',
          latex: 'l = n\\frac{\\lambda}{2}',
          variables: [
            { symbol: 'l', name: 'Chiều dài dây', unit: 'm', unitCategory: 'length' },
            { symbol: 'n', name: 'Số bụng sóng', unit: '', unitCategory: null },
            { symbol: 'λ', name: 'Bước sóng', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'l', formula: (vars) => vars.n * vars['λ'] / 2 },
            { solve: 'λ', formula: (vars) => 2 * vars.l / vars.n },
            { solve: 'n', formula: (vars) => 2 * vars.l / vars['λ'] }
          ]
        },
        {
          id: 'sound-intensity-level',
          name: 'Mức cường độ âm',
          description: 'Đơn vị decibel',
          formula: 'L = 10×log(I/I₀)',
          latex: 'L = 10\\log\\frac{I}{I_0}',
          variables: [
            { symbol: 'L', name: 'Mức cường độ âm', unit: 'dB', unitCategory: null },
            { symbol: 'I', name: 'Cường độ âm', unit: 'W/m²', unitCategory: null },
            { symbol: 'I0', name: 'Cường độ âm chuẩn', unit: 'W/m²', constant: 1e-12 }
          ],
          variants: [
            { solve: 'L', formula: (vars) => 10 * Math.log10(vars.I / (vars.I0 || 1e-12)) },
            { solve: 'I', formula: (vars) => (vars.I0 || 1e-12) * Math.pow(10, vars.L / 10) }
          ]
        }
      ]
    },
    {
      id: 'g11-c3',
      name: 'Điện tích - Điện trường',
      formulas: [
        {
          id: 'coulomb-law',
          name: 'Định luật Coulomb',
          description: 'Lực tương tác giữa hai điện tích',
          formula: 'F = k×|q₁q₂|/r²',
          latex: 'F = k\\frac{|q_1 q_2|}{r^2}',
          variables: [
            { symbol: 'F', name: 'Lực điện', unit: 'N', unitCategory: 'force' },
            { symbol: 'k', name: 'Hằng số Coulomb', unit: 'N·m²/C²', constant: 9e9 },
            { symbol: 'q1', name: 'Điện tích 1', unit: 'C', unitCategory: 'charge' },
            { symbol: 'q2', name: 'Điện tích 2', unit: 'C', unitCategory: 'charge' },
            { symbol: 'r', name: 'Khoảng cách', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'F', formula: (vars) => (vars.k || 9e9) * Math.abs(vars.q1 * vars.q2) / (vars.r * vars.r) },
            { solve: 'r', formula: (vars) => Math.sqrt((vars.k || 9e9) * Math.abs(vars.q1 * vars.q2) / vars.F) }
          ]
        },
        {
          id: 'electric-field',
          name: 'Cường độ điện trường',
          description: 'Điện trường của điện tích điểm',
          formula: 'E = k×|q|/r²',
          latex: 'E = k\\frac{|q|}{r^2}',
          variables: [
            { symbol: 'E', name: 'Cường độ điện trường', unit: 'V/m', unitCategory: null },
            { symbol: 'k', name: 'Hằng số Coulomb', unit: 'N·m²/C²', constant: 9e9 },
            { symbol: 'q', name: 'Điện tích', unit: 'C', unitCategory: 'charge' },
            { symbol: 'r', name: 'Khoảng cách', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'E', formula: (vars) => (vars.k || 9e9) * Math.abs(vars.q) / (vars.r * vars.r) },
            { solve: 'q', formula: (vars) => vars.E * vars.r * vars.r / (vars.k || 9e9) },
            { solve: 'r', formula: (vars) => Math.sqrt((vars.k || 9e9) * Math.abs(vars.q) / vars.E) }
          ]
        },
        {
          id: 'electric-force-field',
          name: 'Lực điện trường',
          description: 'Lực tác dụng lên điện tích trong điện trường',
          formula: 'F = qE',
          latex: 'F = qE',
          variables: [
            { symbol: 'F', name: 'Lực điện', unit: 'N', unitCategory: 'force' },
            { symbol: 'q', name: 'Điện tích', unit: 'C', unitCategory: 'charge' },
            { symbol: 'E', name: 'Cường độ điện trường', unit: 'V/m', unitCategory: null }
          ],
          variants: [
            { solve: 'F', formula: (vars) => vars.q * vars.E },
            { solve: 'q', formula: (vars) => vars.F / vars.E },
            { solve: 'E', formula: (vars) => vars.F / vars.q }
          ]
        },
        {
          id: 'voltage-field',
          name: 'Hiệu điện thế và điện trường đều',
          description: 'Quan hệ U và E',
          formula: 'U = E×d',
          latex: 'U = Ed',
          variables: [
            { symbol: 'U', name: 'Hiệu điện thế', unit: 'V', unitCategory: 'voltage' },
            { symbol: 'E', name: 'Cường độ điện trường', unit: 'V/m', unitCategory: null },
            { symbol: 'd', name: 'Khoảng cách', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'U', formula: (vars) => vars.E * vars.d },
            { solve: 'E', formula: (vars) => vars.U / vars.d },
            { solve: 'd', formula: (vars) => vars.U / vars.E }
          ]
        },
        {
          id: 'capacitor',
          name: 'Điện dung tụ điện',
          description: 'Tụ điện phẳng',
          formula: 'C = ε₀εS/d',
          latex: 'C = \\frac{\\varepsilon_0 \\varepsilon S}{d}',
          variables: [
            { symbol: 'C', name: 'Điện dung', unit: 'F', unitCategory: 'capacitance' },
            { symbol: 'ε0', name: 'Hằng số điện môi chân không', unit: 'F/m', constant: 8.854e-12 },
            { symbol: 'ε', name: 'Hằng số điện môi', unit: '', unitCategory: null },
            { symbol: 'S', name: 'Diện tích bản', unit: 'm²', unitCategory: 'area' },
            { symbol: 'd', name: 'Khoảng cách bản', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'C', formula: (vars) => (vars['ε0'] || 8.854e-12) * vars['ε'] * vars.S / vars.d },
            { solve: 'S', formula: (vars) => vars.C * vars.d / ((vars['ε0'] || 8.854e-12) * vars['ε']) },
            { solve: 'd', formula: (vars) => (vars['ε0'] || 8.854e-12) * vars['ε'] * vars.S / vars.C }
          ]
        },
        {
          id: 'capacitor-energy',
          name: 'Năng lượng tụ điện',
          description: 'Năng lượng điện trường trong tụ',
          formula: 'W = ½CU² = ½QU',
          latex: 'W = \\frac{1}{2}CU^2 = \\frac{1}{2}QU',
          variables: [
            { symbol: 'W', name: 'Năng lượng', unit: 'J', unitCategory: 'energy' },
            { symbol: 'C', name: 'Điện dung', unit: 'F', unitCategory: 'capacitance' },
            { symbol: 'U', name: 'Hiệu điện thế', unit: 'V', unitCategory: 'voltage' }
          ],
          variants: [
            { solve: 'W', formula: (vars) => 0.5 * vars.C * vars.U * vars.U },
            { solve: 'C', formula: (vars) => 2 * vars.W / (vars.U * vars.U) },
            { solve: 'U', formula: (vars) => Math.sqrt(2 * vars.W / vars.C) }
          ]
        }
      ]
    },
    {
      id: 'g11-c4',
      name: 'Dòng điện không đổi',
      formulas: [
        {
          id: 'current-definition',
          name: 'Định nghĩa cường độ dòng điện',
          description: 'Điện lượng qua tiết diện',
          formula: 'I = q/t',
          latex: 'I = \\frac{q}{t}',
          variables: [
            { symbol: 'I', name: 'Cường độ dòng điện', unit: 'A', unitCategory: 'electricCurrent' },
            { symbol: 'q', name: 'Điện lượng', unit: 'C', unitCategory: 'charge' },
            { symbol: 't', name: 'Thời gian', unit: 's', unitCategory: 'time' }
          ],
          variants: [
            { solve: 'I', formula: (vars) => vars.q / vars.t },
            { solve: 'q', formula: (vars) => vars.I * vars.t },
            { solve: 't', formula: (vars) => vars.q / vars.I }
          ]
        },
        {
          id: 'emf-full-circuit',
          name: 'Định luật Ohm toàn mạch',
          description: 'Mạch điện kín với nguồn',
          formula: 'I = ξ/(R + r)',
          latex: 'I = \\frac{\\xi}{R + r}',
          variables: [
            { symbol: 'I', name: 'Cường độ dòng điện', unit: 'A', unitCategory: 'electricCurrent' },
            { symbol: 'ξ', name: 'Suất điện động', unit: 'V', unitCategory: 'voltage' },
            { symbol: 'R', name: 'Điện trở ngoài', unit: 'Ω', unitCategory: 'resistance' },
            { symbol: 'r', name: 'Điện trở trong', unit: 'Ω', unitCategory: 'resistance' }
          ],
          variants: [
            { solve: 'I', formula: (vars) => vars['ξ'] / (vars.R + vars.r) },
            { solve: 'ξ', formula: (vars) => vars.I * (vars.R + vars.r) },
            { solve: 'R', formula: (vars) => vars['ξ'] / vars.I - vars.r },
            { solve: 'r', formula: (vars) => vars['ξ'] / vars.I - vars.R }
          ]
        }
      ]
    }
  ]
};

export default GRADE_11_FORMULAS;

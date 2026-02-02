/**
 * DATABASE CÔNG THỨC VẬT LÝ - LỚP 10
 */

export const GRADE_10_FORMULAS = {
  grade: 10,
  name: 'Vật lý lớp 10',
  chapters: [
    {
      id: 'g10-c1',
      name: 'Động học chất điểm',
      formulas: [
        {
          id: 'uniform-motion',
          name: 'Chuyển động thẳng đều',
          description: 'Phương trình chuyển động thẳng đều',
          formula: 'x = x₀ + v×t',
          latex: 'x = x_0 + vt',
          variables: [
            { symbol: 'x', name: 'Vị trí', unit: 'm', unitCategory: 'length' },
            { symbol: 'x0', name: 'Vị trí ban đầu', unit: 'm', unitCategory: 'length' },
            { symbol: 'v', name: 'Vận tốc', unit: 'm/s', unitCategory: 'velocity' },
            { symbol: 't', name: 'Thời gian', unit: 's', unitCategory: 'time' }
          ],
          variants: [
            { solve: 'x', formula: (vars) => vars.x0 + vars.v * vars.t },
            { solve: 'x0', formula: (vars) => vars.x - vars.v * vars.t },
            { solve: 'v', formula: (vars) => (vars.x - vars.x0) / vars.t },
            { solve: 't', formula: (vars) => (vars.x - vars.x0) / vars.v }
          ]
        },
        {
          id: 'uniformly-accelerated-velocity',
          name: 'Vận tốc chuyển động biến đổi đều',
          description: 'Công thức vận tốc theo thời gian',
          formula: 'v = v₀ + a×t',
          latex: 'v = v_0 + at',
          variables: [
            { symbol: 'v', name: 'Vận tốc', unit: 'm/s', unitCategory: 'velocity' },
            { symbol: 'v0', name: 'Vận tốc ban đầu', unit: 'm/s', unitCategory: 'velocity' },
            { symbol: 'a', name: 'Gia tốc', unit: 'm/s²', unitCategory: 'acceleration' },
            { symbol: 't', name: 'Thời gian', unit: 's', unitCategory: 'time' }
          ],
          variants: [
            { solve: 'v', formula: (vars) => vars.v0 + vars.a * vars.t },
            { solve: 'v0', formula: (vars) => vars.v - vars.a * vars.t },
            { solve: 'a', formula: (vars) => (vars.v - vars.v0) / vars.t },
            { solve: 't', formula: (vars) => (vars.v - vars.v0) / vars.a }
          ]
        },
        {
          id: 'uniformly-accelerated-position',
          name: 'Quãng đường chuyển động biến đổi đều',
          description: 'Công thức quãng đường',
          formula: 's = v₀t + ½at²',
          latex: 's = v_0t + \\frac{1}{2}at^2',
          variables: [
            { symbol: 's', name: 'Quãng đường', unit: 'm', unitCategory: 'length' },
            { symbol: 'v0', name: 'Vận tốc ban đầu', unit: 'm/s', unitCategory: 'velocity' },
            { symbol: 'a', name: 'Gia tốc', unit: 'm/s²', unitCategory: 'acceleration' },
            { symbol: 't', name: 'Thời gian', unit: 's', unitCategory: 'time' }
          ],
          variants: [
            { solve: 's', formula: (vars) => vars.v0 * vars.t + 0.5 * vars.a * vars.t * vars.t },
            { solve: 'v0', formula: (vars) => (vars.s - 0.5 * vars.a * vars.t * vars.t) / vars.t },
            { solve: 'a', formula: (vars) => 2 * (vars.s - vars.v0 * vars.t) / (vars.t * vars.t) }
          ]
        },
        {
          id: 'velocity-position-relation',
          name: 'Liên hệ v, a, s',
          description: 'Công thức không phụ thuộc thời gian',
          formula: 'v² - v₀² = 2as',
          latex: 'v^2 - v_0^2 = 2as',
          variables: [
            { symbol: 'v', name: 'Vận tốc cuối', unit: 'm/s', unitCategory: 'velocity' },
            { symbol: 'v0', name: 'Vận tốc đầu', unit: 'm/s', unitCategory: 'velocity' },
            { symbol: 'a', name: 'Gia tốc', unit: 'm/s²', unitCategory: 'acceleration' },
            { symbol: 's', name: 'Quãng đường', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'v', formula: (vars) => Math.sqrt(vars.v0 * vars.v0 + 2 * vars.a * vars.s) },
            { solve: 'v0', formula: (vars) => Math.sqrt(vars.v * vars.v - 2 * vars.a * vars.s) },
            { solve: 'a', formula: (vars) => (vars.v * vars.v - vars.v0 * vars.v0) / (2 * vars.s) },
            { solve: 's', formula: (vars) => (vars.v * vars.v - vars.v0 * vars.v0) / (2 * vars.a) }
          ]
        },
        {
          id: 'free-fall',
          name: 'Rơi tự do',
          description: 'Vật rơi từ độ cao h',
          formula: 'h = ½gt²',
          latex: 'h = \\frac{1}{2}gt^2',
          variables: [
            { symbol: 'h', name: 'Độ cao', unit: 'm', unitCategory: 'length' },
            { symbol: 'g', name: 'Gia tốc trọng trường', unit: 'm/s²', constant: 9.8 },
            { symbol: 't', name: 'Thời gian rơi', unit: 's', unitCategory: 'time' }
          ],
          variants: [
            { solve: 'h', formula: (vars) => 0.5 * (vars.g || 9.8) * vars.t * vars.t },
            { solve: 't', formula: (vars) => Math.sqrt(2 * vars.h / (vars.g || 9.8)) }
          ]
        },
        {
          id: 'projectile-range',
          name: 'Tầm bay xa',
          description: 'Quãng đường bay ngang của vật ném xiên',
          formula: 'L = v₀²sin(2α)/g',
          latex: 'L = \\frac{v_0^2 \\sin 2\\alpha}{g}',
          variables: [
            { symbol: 'L', name: 'Tầm bay xa', unit: 'm', unitCategory: 'length' },
            { symbol: 'v0', name: 'Vận tốc ban đầu', unit: 'm/s', unitCategory: 'velocity' },
            { symbol: 'α', name: 'Góc ném', unit: '°', unitCategory: 'angle' },
            { symbol: 'g', name: 'Gia tốc trọng trường', unit: 'm/s²', constant: 9.8 }
          ],
          variants: [
            { solve: 'L', formula: (vars) => (vars.v0 * vars.v0 * Math.sin(2 * vars['α'] * Math.PI / 180)) / (vars.g || 9.8) },
            { solve: 'v0', formula: (vars) => Math.sqrt(vars.L * (vars.g || 9.8) / Math.sin(2 * vars['α'] * Math.PI / 180)) }
          ]
        }
      ]
    },
    {
      id: 'g10-c2',
      name: 'Động lực học chất điểm',
      formulas: [
        {
          id: 'newton-2',
          name: 'Định luật II Newton',
          description: 'Mối quan hệ lực, khối lượng, gia tốc',
          formula: 'F = ma',
          latex: '\\vec{F} = m\\vec{a}',
          variables: [
            { symbol: 'F', name: 'Lực', unit: 'N', unitCategory: 'force' },
            { symbol: 'm', name: 'Khối lượng', unit: 'kg', unitCategory: 'mass' },
            { symbol: 'a', name: 'Gia tốc', unit: 'm/s²', unitCategory: 'acceleration' }
          ],
          variants: [
            { solve: 'F', formula: (vars) => vars.m * vars.a },
            { solve: 'm', formula: (vars) => vars.F / vars.a },
            { solve: 'a', formula: (vars) => vars.F / vars.m }
          ]
        },
        {
          id: 'friction-force',
          name: 'Lực ma sát',
          description: 'Lực ma sát trượt/nghỉ',
          formula: 'F_ms = μN',
          latex: 'F_{ms} = \\mu N',
          variables: [
            { symbol: 'F_ms', name: 'Lực ma sát', unit: 'N', unitCategory: 'force' },
            { symbol: 'μ', name: 'Hệ số ma sát', unit: '', unitCategory: null },
            { symbol: 'N', name: 'Phản lực', unit: 'N', unitCategory: 'force' }
          ],
          variants: [
            { solve: 'F_ms', formula: (vars) => vars['μ'] * vars.N },
            { solve: 'μ', formula: (vars) => vars.F_ms / vars.N },
            { solve: 'N', formula: (vars) => vars.F_ms / vars['μ'] }
          ]
        },
        {
          id: 'gravitational-force',
          name: 'Lực hấp dẫn',
          description: 'Định luật vạn vật hấp dẫn',
          formula: 'F = G×m₁×m₂/r²',
          latex: 'F = G\\frac{m_1 m_2}{r^2}',
          variables: [
            { symbol: 'F', name: 'Lực hấp dẫn', unit: 'N', unitCategory: 'force' },
            { symbol: 'G', name: 'Hằng số hấp dẫn', unit: 'N·m²/kg²', constant: 6.674e-11 },
            { symbol: 'm1', name: 'Khối lượng 1', unit: 'kg', unitCategory: 'mass' },
            { symbol: 'm2', name: 'Khối lượng 2', unit: 'kg', unitCategory: 'mass' },
            { symbol: 'r', name: 'Khoảng cách', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'F', formula: (vars) => (vars.G || 6.674e-11) * vars.m1 * vars.m2 / (vars.r * vars.r) },
            { solve: 'r', formula: (vars) => Math.sqrt((vars.G || 6.674e-11) * vars.m1 * vars.m2 / vars.F) }
          ]
        },
        {
          id: 'centripetal-force',
          name: 'Lực hướng tâm',
          description: 'Lực trong chuyển động tròn',
          formula: 'F_ht = mv²/r = mω²r',
          latex: 'F_{ht} = \\frac{mv^2}{r} = m\\omega^2 r',
          variables: [
            { symbol: 'F_ht', name: 'Lực hướng tâm', unit: 'N', unitCategory: 'force' },
            { symbol: 'm', name: 'Khối lượng', unit: 'kg', unitCategory: 'mass' },
            { symbol: 'v', name: 'Tốc độ dài', unit: 'm/s', unitCategory: 'velocity' },
            { symbol: 'r', name: 'Bán kính', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'F_ht', formula: (vars) => vars.m * vars.v * vars.v / vars.r },
            { solve: 'm', formula: (vars) => vars.F_ht * vars.r / (vars.v * vars.v) },
            { solve: 'v', formula: (vars) => Math.sqrt(vars.F_ht * vars.r / vars.m) },
            { solve: 'r', formula: (vars) => vars.m * vars.v * vars.v / vars.F_ht }
          ]
        }
      ]
    },
    {
      id: 'g10-c3',
      name: 'Cân bằng và chuyển động quay',
      formulas: [
        {
          id: 'moment-force',
          name: 'Moment lực',
          description: 'Moment của lực đối với trục quay',
          formula: 'M = F×d',
          latex: 'M = F \\times d',
          variables: [
            { symbol: 'M', name: 'Moment lực', unit: 'N·m', unitCategory: null },
            { symbol: 'F', name: 'Lực', unit: 'N', unitCategory: 'force' },
            { symbol: 'd', name: 'Cánh tay đòn', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'M', formula: (vars) => vars.F * vars.d },
            { solve: 'F', formula: (vars) => vars.M / vars.d },
            { solve: 'd', formula: (vars) => vars.M / vars.F }
          ]
        },
        {
          id: 'equilibrium-moment',
          name: 'Điều kiện cân bằng',
          description: 'Tổng moment bằng không',
          formula: 'ΣM = 0 → F₁d₁ = F₂d₂',
          latex: '\\sum M = 0 \\Rightarrow F_1 d_1 = F_2 d_2',
          variables: [
            { symbol: 'F1', name: 'Lực 1', unit: 'N', unitCategory: 'force' },
            { symbol: 'd1', name: 'Cánh tay đòn 1', unit: 'm', unitCategory: 'length' },
            { symbol: 'F2', name: 'Lực 2', unit: 'N', unitCategory: 'force' },
            { symbol: 'd2', name: 'Cánh tay đòn 2', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'F1', formula: (vars) => vars.F2 * vars.d2 / vars.d1 },
            { solve: 'F2', formula: (vars) => vars.F1 * vars.d1 / vars.d2 },
            { solve: 'd1', formula: (vars) => vars.F2 * vars.d2 / vars.F1 },
            { solve: 'd2', formula: (vars) => vars.F1 * vars.d1 / vars.F2 }
          ]
        }
      ]
    },
    {
      id: 'g10-c4',
      name: 'Công và năng lượng',
      formulas: [
        {
          id: 'work-force',
          name: 'Công của lực',
          description: 'Công khi lực tạo góc với chuyển động',
          formula: 'A = F×s×cos(α)',
          latex: 'A = Fs\\cos\\alpha',
          variables: [
            { symbol: 'A', name: 'Công', unit: 'J', unitCategory: 'energy' },
            { symbol: 'F', name: 'Lực', unit: 'N', unitCategory: 'force' },
            { symbol: 's', name: 'Quãng đường', unit: 'm', unitCategory: 'length' },
            { symbol: 'α', name: 'Góc hợp bởi F và s', unit: '°', unitCategory: 'angle' }
          ],
          variants: [
            { solve: 'A', formula: (vars) => vars.F * vars.s * Math.cos(vars['α'] * Math.PI / 180) },
            { solve: 'F', formula: (vars) => vars.A / (vars.s * Math.cos(vars['α'] * Math.PI / 180)) },
            { solve: 's', formula: (vars) => vars.A / (vars.F * Math.cos(vars['α'] * Math.PI / 180)) }
          ]
        },
        {
          id: 'kinetic-energy-10',
          name: 'Động năng',
          description: 'Năng lượng của vật chuyển động',
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
          id: 'potential-energy-10',
          name: 'Thế năng trọng trường',
          description: 'Năng lượng theo vị trí',
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
        },
        {
          id: 'elastic-potential-energy',
          name: 'Thế năng đàn hồi',
          description: 'Năng lượng lò xo',
          formula: 'W_đh = ½kx²',
          latex: 'W_{đh} = \\frac{1}{2}kx^2',
          variables: [
            { symbol: 'W_đh', name: 'Thế năng đàn hồi', unit: 'J', unitCategory: 'energy' },
            { symbol: 'k', name: 'Độ cứng lò xo', unit: 'N/m', unitCategory: null },
            { symbol: 'x', name: 'Độ biến dạng', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'W_đh', formula: (vars) => 0.5 * vars.k * vars.x * vars.x },
            { solve: 'k', formula: (vars) => 2 * vars['W_đh'] / (vars.x * vars.x) },
            { solve: 'x', formula: (vars) => Math.sqrt(2 * vars['W_đh'] / vars.k) }
          ]
        },
        {
          id: 'mechanical-energy',
          name: 'Cơ năng',
          description: 'Tổng động năng và thế năng',
          formula: 'W = W_đ + W_t',
          latex: 'W = W_{đ} + W_t',
          variables: [
            { symbol: 'W', name: 'Cơ năng', unit: 'J', unitCategory: 'energy' },
            { symbol: 'W_đ', name: 'Động năng', unit: 'J', unitCategory: 'energy' },
            { symbol: 'W_t', name: 'Thế năng', unit: 'J', unitCategory: 'energy' }
          ],
          variants: [
            { solve: 'W', formula: (vars) => vars['W_đ'] + vars.W_t },
            { solve: 'W_đ', formula: (vars) => vars.W - vars.W_t },
            { solve: 'W_t', formula: (vars) => vars.W - vars['W_đ'] }
          ]
        }
      ]
    },
    {
      id: 'g10-c5',
      name: 'Chất khí',
      formulas: [
        {
          id: 'ideal-gas-law',
          name: 'Phương trình trạng thái khí lý tưởng',
          description: 'Mối quan hệ P, V, T',
          formula: 'PV/T = P₀V₀/T₀',
          latex: '\\frac{PV}{T} = \\frac{P_0 V_0}{T_0}',
          variables: [
            { symbol: 'P', name: 'Áp suất', unit: 'Pa', unitCategory: 'pressure' },
            { symbol: 'V', name: 'Thể tích', unit: 'm³', unitCategory: 'volume' },
            { symbol: 'T', name: 'Nhiệt độ', unit: 'K', unitCategory: 'temperature' },
            { symbol: 'P0', name: 'Áp suất ban đầu', unit: 'Pa', unitCategory: 'pressure' },
            { symbol: 'V0', name: 'Thể tích ban đầu', unit: 'm³', unitCategory: 'volume' },
            { symbol: 'T0', name: 'Nhiệt độ ban đầu', unit: 'K', unitCategory: 'temperature' }
          ],
          variants: [
            { solve: 'P', formula: (vars) => vars.P0 * vars.V0 * vars.T / (vars.T0 * vars.V) },
            { solve: 'V', formula: (vars) => vars.P0 * vars.V0 * vars.T / (vars.T0 * vars.P) },
            { solve: 'T', formula: (vars) => vars.P * vars.V * vars.T0 / (vars.P0 * vars.V0) }
          ]
        },
        {
          id: 'ideal-gas-pv-nrt',
          name: 'Phương trình Clapeyron',
          description: 'PV = nRT',
          formula: 'PV = nRT',
          latex: 'PV = nRT',
          variables: [
            { symbol: 'P', name: 'Áp suất', unit: 'Pa', unitCategory: 'pressure' },
            { symbol: 'V', name: 'Thể tích', unit: 'm³', unitCategory: 'volume' },
            { symbol: 'n', name: 'Số mol', unit: 'mol', unitCategory: null },
            { symbol: 'R', name: 'Hằng số khí', unit: 'J/(mol·K)', constant: 8.314 },
            { symbol: 'T', name: 'Nhiệt độ', unit: 'K', unitCategory: 'temperature' }
          ],
          variants: [
            { solve: 'P', formula: (vars) => vars.n * (vars.R || 8.314) * vars.T / vars.V },
            { solve: 'V', formula: (vars) => vars.n * (vars.R || 8.314) * vars.T / vars.P },
            { solve: 'n', formula: (vars) => vars.P * vars.V / ((vars.R || 8.314) * vars.T) },
            { solve: 'T', formula: (vars) => vars.P * vars.V / (vars.n * (vars.R || 8.314)) }
          ]
        }
      ]
    }
  ]
};

export default GRADE_10_FORMULAS;

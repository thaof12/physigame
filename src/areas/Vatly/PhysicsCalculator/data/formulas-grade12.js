/**
 * DATABASE CÔNG THỨC VẬT LÝ - LỚP 12
 */

export const GRADE_12_FORMULAS = {
  grade: 12,
  name: 'Vật lý lớp 12',
  chapters: [
    {
      id: 'g12-c1',
      name: 'Dao động và sóng điện từ',
      formulas: [
        {
          id: 'lc-frequency',
          name: 'Tần số dao động LC',
          description: 'Tần số riêng của mạch LC',
          formula: 'f = 1/(2π√(LC))',
          latex: 'f = \\frac{1}{2\\pi\\sqrt{LC}}',
          variables: [
            { symbol: 'f', name: 'Tần số', unit: 'Hz', unitCategory: 'frequency' },
            { symbol: 'L', name: 'Độ tự cảm', unit: 'H', unitCategory: 'inductance' },
            { symbol: 'C', name: 'Điện dung', unit: 'F', unitCategory: 'capacitance' }
          ],
          variants: [
            { solve: 'f', formula: (vars) => 1 / (2 * Math.PI * Math.sqrt(vars.L * vars.C)) },
            { solve: 'L', formula: (vars) => 1 / (4 * Math.PI * Math.PI * vars.f * vars.f * vars.C) },
            { solve: 'C', formula: (vars) => 1 / (4 * Math.PI * Math.PI * vars.f * vars.f * vars.L) }
          ]
        },
        {
          id: 'lc-period',
          name: 'Chu kỳ dao động LC',
          description: 'Chu kỳ mạch dao động',
          formula: 'T = 2π√(LC)',
          latex: 'T = 2\\pi\\sqrt{LC}',
          variables: [
            { symbol: 'T', name: 'Chu kỳ', unit: 's', unitCategory: 'time' },
            { symbol: 'L', name: 'Độ tự cảm', unit: 'H', unitCategory: 'inductance' },
            { symbol: 'C', name: 'Điện dung', unit: 'F', unitCategory: 'capacitance' }
          ],
          variants: [
            { solve: 'T', formula: (vars) => 2 * Math.PI * Math.sqrt(vars.L * vars.C) },
            { solve: 'L', formula: (vars) => vars.T * vars.T / (4 * Math.PI * Math.PI * vars.C) },
            { solve: 'C', formula: (vars) => vars.T * vars.T / (4 * Math.PI * Math.PI * vars.L) }
          ]
        },
        {
          id: 'em-wave-velocity',
          name: 'Vận tốc sóng điện từ',
          description: 'Tốc độ sóng điện từ trong chân không',
          formula: 'c = λf',
          latex: 'c = \\lambda f',
          variables: [
            { symbol: 'c', name: 'Tốc độ ánh sáng', unit: 'm/s', constant: 3e8 },
            { symbol: 'λ', name: 'Bước sóng', unit: 'm', unitCategory: 'length' },
            { symbol: 'f', name: 'Tần số', unit: 'Hz', unitCategory: 'frequency' }
          ],
          variants: [
            { solve: 'c', formula: (vars) => vars['λ'] * vars.f },
            { solve: 'λ', formula: (vars) => (vars.c || 3e8) / vars.f },
            { solve: 'f', formula: (vars) => (vars.c || 3e8) / vars['λ'] }
          ]
        }
      ]
    },
    {
      id: 'g12-c2',
      name: 'Sóng ánh sáng',
      formulas: [
        {
          id: 'interference-bright',
          name: 'Vị trí vân sáng',
          description: 'Giao thoa ánh sáng - vân sáng',
          formula: 'x_s = k×λD/a',
          latex: 'x_s = k\\frac{\\lambda D}{a}',
          variables: [
            { symbol: 'x_s', name: 'Vị trí vân sáng', unit: 'm', unitCategory: 'length' },
            { symbol: 'k', name: 'Bậc vân (0,±1,±2...)', unit: '', unitCategory: null },
            { symbol: 'λ', name: 'Bước sóng', unit: 'm', unitCategory: 'length' },
            { symbol: 'D', name: 'Khoảng cách đến màn', unit: 'm', unitCategory: 'length' },
            { symbol: 'a', name: 'Khoảng cách hai khe', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'x_s', formula: (vars) => vars.k * vars['λ'] * vars.D / vars.a },
            { solve: 'λ', formula: (vars) => vars.x_s * vars.a / (vars.k * vars.D) },
            { solve: 'D', formula: (vars) => vars.x_s * vars.a / (vars.k * vars['λ']) },
            { solve: 'a', formula: (vars) => vars.k * vars['λ'] * vars.D / vars.x_s }
          ]
        },
        {
          id: 'fringe-spacing',
          name: 'Khoảng vân',
          description: 'Khoảng cách giữa hai vân sáng liên tiếp',
          formula: 'i = λD/a',
          latex: 'i = \\frac{\\lambda D}{a}',
          variables: [
            { symbol: 'i', name: 'Khoảng vân', unit: 'm', unitCategory: 'length' },
            { symbol: 'λ', name: 'Bước sóng', unit: 'm', unitCategory: 'length' },
            { symbol: 'D', name: 'Khoảng cách đến màn', unit: 'm', unitCategory: 'length' },
            { symbol: 'a', name: 'Khoảng cách hai khe', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'i', formula: (vars) => vars['λ'] * vars.D / vars.a },
            { solve: 'λ', formula: (vars) => vars.i * vars.a / vars.D },
            { solve: 'D', formula: (vars) => vars.i * vars.a / vars['λ'] },
            { solve: 'a', formula: (vars) => vars['λ'] * vars.D / vars.i }
          ]
        }
      ]
    },
    {
      id: 'g12-c3',
      name: 'Lượng tử ánh sáng',
      formulas: [
        {
          id: 'photon-energy',
          name: 'Năng lượng photon',
          description: 'Năng lượng của một photon',
          formula: 'ε = hf = hc/λ',
          latex: '\\varepsilon = hf = \\frac{hc}{\\lambda}',
          variables: [
            { symbol: 'ε', name: 'Năng lượng photon', unit: 'J', unitCategory: 'energy' },
            { symbol: 'h', name: 'Hằng số Planck', unit: 'J·s', constant: 6.626e-34 },
            { symbol: 'f', name: 'Tần số', unit: 'Hz', unitCategory: 'frequency' },
            { symbol: 'c', name: 'Tốc độ ánh sáng', unit: 'm/s', constant: 3e8 },
            { symbol: 'λ', name: 'Bước sóng', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'ε', formula: (vars) => (vars.h || 6.626e-34) * vars.f },
            { solve: 'f', formula: (vars) => vars['ε'] / (vars.h || 6.626e-34) },
            { solve: 'λ', formula: (vars) => (vars.h || 6.626e-34) * (vars.c || 3e8) / vars['ε'] }
          ]
        },
        {
          id: 'photoelectric-equation',
          name: 'Công thức Einstein về quang điện',
          description: 'Phương trình quang điện',
          formula: 'hf = A + ½mv²_max',
          latex: 'hf = A + \\frac{1}{2}mv^2_{max}',
          variables: [
            { symbol: 'hf', name: 'Năng lượng photon', unit: 'J', unitCategory: 'energy' },
            { symbol: 'A', name: 'Công thoát', unit: 'J', unitCategory: 'energy' },
            { symbol: 'm', name: 'Khối lượng electron', unit: 'kg', constant: 9.109e-31 },
            { symbol: 'v_max', name: 'Vận tốc cực đại electron', unit: 'm/s', unitCategory: 'velocity' }
          ],
          variants: [
            { solve: 'hf', formula: (vars) => vars.A + 0.5 * (vars.m || 9.109e-31) * vars.v_max * vars.v_max },
            { solve: 'A', formula: (vars) => vars.hf - 0.5 * (vars.m || 9.109e-31) * vars.v_max * vars.v_max },
            { solve: 'v_max', formula: (vars) => Math.sqrt(2 * (vars.hf - vars.A) / (vars.m || 9.109e-31)) }
          ]
        },
        {
          id: 'threshold-wavelength',
          name: 'Bước sóng giới hạn',
          description: 'Bước sóng giới hạn quang điện',
          formula: 'λ₀ = hc/A',
          latex: '\\lambda_0 = \\frac{hc}{A}',
          variables: [
            { symbol: 'λ0', name: 'Bước sóng giới hạn', unit: 'm', unitCategory: 'length' },
            { symbol: 'h', name: 'Hằng số Planck', unit: 'J·s', constant: 6.626e-34 },
            { symbol: 'c', name: 'Tốc độ ánh sáng', unit: 'm/s', constant: 3e8 },
            { symbol: 'A', name: 'Công thoát', unit: 'J', unitCategory: 'energy' }
          ],
          variants: [
            { solve: 'λ0', formula: (vars) => (vars.h || 6.626e-34) * (vars.c || 3e8) / vars.A },
            { solve: 'A', formula: (vars) => (vars.h || 6.626e-34) * (vars.c || 3e8) / vars['λ0'] }
          ]
        }
      ]
    },
    {
      id: 'g12-c4',
      name: 'Vật lý hạt nhân',
      formulas: [
        {
          id: 'mass-energy',
          name: 'Hệ thức Einstein',
          description: 'Tương đương khối lượng - năng lượng',
          formula: 'E = mc²',
          latex: 'E = mc^2',
          variables: [
            { symbol: 'E', name: 'Năng lượng', unit: 'J', unitCategory: 'energy' },
            { symbol: 'm', name: 'Khối lượng', unit: 'kg', unitCategory: 'mass' },
            { symbol: 'c', name: 'Tốc độ ánh sáng', unit: 'm/s', constant: 3e8 }
          ],
          variants: [
            { solve: 'E', formula: (vars) => vars.m * (vars.c || 3e8) * (vars.c || 3e8) },
            { solve: 'm', formula: (vars) => vars.E / ((vars.c || 3e8) * (vars.c || 3e8)) }
          ]
        },
        {
          id: 'binding-energy',
          name: 'Năng lượng liên kết',
          description: 'Năng lượng liên kết hạt nhân',
          formula: 'W_lk = Δm×c²',
          latex: 'W_{lk} = \\Delta m \\cdot c^2',
          variables: [
            { symbol: 'W_lk', name: 'Năng lượng liên kết', unit: 'J', unitCategory: 'energy' },
            { symbol: 'Δm', name: 'Độ hụt khối', unit: 'kg', unitCategory: 'mass' },
            { symbol: 'c', name: 'Tốc độ ánh sáng', unit: 'm/s', constant: 3e8 }
          ],
          variants: [
            { solve: 'W_lk', formula: (vars) => vars['Δm'] * (vars.c || 3e8) * (vars.c || 3e8) },
            { solve: 'Δm', formula: (vars) => vars.W_lk / ((vars.c || 3e8) * (vars.c || 3e8)) }
          ]
        },
        {
          id: 'radioactive-decay',
          name: 'Định luật phân rã phóng xạ',
          description: 'Số hạt nhân còn lại theo thời gian',
          formula: 'N = N₀×e^(-λt) = N₀×2^(-t/T)',
          latex: 'N = N_0 e^{-\\lambda t} = N_0 \\cdot 2^{-t/T}',
          variables: [
            { symbol: 'N', name: 'Số hạt nhân còn lại', unit: '', unitCategory: null },
            { symbol: 'N0', name: 'Số hạt nhân ban đầu', unit: '', unitCategory: null },
            { symbol: 't', name: 'Thời gian', unit: 's', unitCategory: 'time' },
            { symbol: 'T', name: 'Chu kỳ bán rã', unit: 's', unitCategory: 'time' }
          ],
          variants: [
            { solve: 'N', formula: (vars) => vars.N0 * Math.pow(2, -vars.t / vars.T) },
            { solve: 'N0', formula: (vars) => vars.N / Math.pow(2, -vars.t / vars.T) },
            { solve: 't', formula: (vars) => -vars.T * Math.log2(vars.N / vars.N0) }
          ]
        },
        {
          id: 'half-life-constant',
          name: 'Hằng số phân rã',
          description: 'Liên hệ hằng số phân rã và chu kỳ bán rã',
          formula: 'λ = ln(2)/T',
          latex: '\\lambda = \\frac{\\ln 2}{T}',
          variables: [
            { symbol: 'λ', name: 'Hằng số phân rã', unit: '1/s', unitCategory: null },
            { symbol: 'T', name: 'Chu kỳ bán rã', unit: 's', unitCategory: 'time' }
          ],
          variants: [
            { solve: 'λ', formula: (vars) => Math.LN2 / vars.T },
            { solve: 'T', formula: (vars) => Math.LN2 / vars['λ'] }
          ]
        },
        {
          id: 'activity',
          name: 'Độ phóng xạ',
          description: 'Số phân rã trong một giây',
          formula: 'H = λN = H₀×e^(-λt)',
          latex: 'H = \\lambda N = H_0 e^{-\\lambda t}',
          variables: [
            { symbol: 'H', name: 'Độ phóng xạ', unit: 'Bq', unitCategory: null },
            { symbol: 'λ', name: 'Hằng số phân rã', unit: '1/s', unitCategory: null },
            { symbol: 'N', name: 'Số hạt nhân', unit: '', unitCategory: null }
          ],
          variants: [
            { solve: 'H', formula: (vars) => vars['λ'] * vars.N },
            { solve: 'N', formula: (vars) => vars.H / vars['λ'] },
            { solve: 'λ', formula: (vars) => vars.H / vars.N }
          ]
        },
        {
          id: 'nuclear-reaction-energy',
          name: 'Năng lượng phản ứng hạt nhân',
          description: 'Năng lượng tỏa ra hoặc thu vào',
          formula: 'ΔE = (m_trước - m_sau)×c²',
          latex: '\\Delta E = (m_{trước} - m_{sau}) \\cdot c^2',
          variables: [
            { symbol: 'ΔE', name: 'Năng lượng phản ứng', unit: 'J', unitCategory: 'energy' },
            { symbol: 'm_truoc', name: 'Tổng khối lượng trước', unit: 'kg', unitCategory: 'mass' },
            { symbol: 'm_sau', name: 'Tổng khối lượng sau', unit: 'kg', unitCategory: 'mass' },
            { symbol: 'c', name: 'Tốc độ ánh sáng', unit: 'm/s', constant: 3e8 }
          ],
          variants: [
            { solve: 'ΔE', formula: (vars) => (vars.m_truoc - vars.m_sau) * (vars.c || 3e8) * (vars.c || 3e8) }
          ]
        }
      ]
    }
  ]
};

export default GRADE_12_FORMULAS;

/**
 * DATABASE CÔNG THỨC VẬT LÝ - LỚP 8
 */

export const GRADE_8_FORMULAS = {
  grade: 8,
  name: 'Vật lý lớp 8',
  chapters: [
    {
      id: 'g8-c1',
      name: 'Cơ học',
      formulas: [
        {
          id: 'average-velocity',
          name: 'Vận tốc trung bình',
          description: 'Tính vận tốc trung bình của chuyển động',
          formula: 'v_tb = (s₁ + s₂) / (t₁ + t₂)',
          latex: 'v_{tb} = \\frac{s_1 + s_2}{t_1 + t_2}',
          variables: [
            { symbol: 'v_tb', name: 'Vận tốc trung bình', unit: 'm/s', unitCategory: 'velocity' },
            { symbol: 's1', name: 'Quãng đường 1', unit: 'm', unitCategory: 'length' },
            { symbol: 's2', name: 'Quãng đường 2', unit: 'm', unitCategory: 'length' },
            { symbol: 't1', name: 'Thời gian 1', unit: 's', unitCategory: 'time' },
            { symbol: 't2', name: 'Thời gian 2', unit: 's', unitCategory: 'time' }
          ],
          variants: [
            { solve: 'v_tb', formula: (vars) => (vars.s1 + vars.s2) / (vars.t1 + vars.t2) }
          ]
        },
        {
          id: 'force-newton2',
          name: 'Định luật II Newton',
          description: 'Lực tác dụng lên vật',
          formula: 'F = m × a',
          latex: 'F = m \\times a',
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
          id: 'weight',
          name: 'Trọng lượng',
          description: 'Lực hút của Trái Đất',
          formula: 'P = m × g',
          latex: 'P = m \\times g',
          variables: [
            { symbol: 'P', name: 'Trọng lượng', unit: 'N', unitCategory: 'force' },
            { symbol: 'm', name: 'Khối lượng', unit: 'kg', unitCategory: 'mass' },
            { symbol: 'g', name: 'Gia tốc trọng trường', unit: 'm/s²', unitCategory: 'acceleration', constant: 9.8 }
          ],
          variants: [
            { solve: 'P', formula: (vars) => vars.m * (vars.g || 9.8) },
            { solve: 'm', formula: (vars) => vars.P / (vars.g || 9.8) }
          ]
        },
        {
          id: 'pressure',
          name: 'Áp suất',
          description: 'Áp suất trên bề mặt',
          formula: 'p = F / S',
          latex: 'p = \\frac{F}{S}',
          variables: [
            { symbol: 'p', name: 'Áp suất', unit: 'Pa', unitCategory: 'pressure' },
            { symbol: 'F', name: 'Áp lực', unit: 'N', unitCategory: 'force' },
            { symbol: 'S', name: 'Diện tích', unit: 'm²', unitCategory: 'area' }
          ],
          variants: [
            { solve: 'p', formula: (vars) => vars.F / vars.S },
            { solve: 'F', formula: (vars) => vars.p * vars.S },
            { solve: 'S', formula: (vars) => vars.F / vars.p }
          ]
        },
        {
          id: 'liquid-pressure',
          name: 'Áp suất chất lỏng',
          description: 'Áp suất tại độ sâu h trong chất lỏng',
          formula: 'p = D × g × h',
          latex: 'p = D \\times g \\times h',
          variables: [
            { symbol: 'p', name: 'Áp suất', unit: 'Pa', unitCategory: 'pressure' },
            { symbol: 'D', name: 'Khối lượng riêng', unit: 'kg/m³', unitCategory: 'density' },
            { symbol: 'g', name: 'Gia tốc trọng trường', unit: 'm/s²', constant: 9.8 },
            { symbol: 'h', name: 'Độ sâu', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'p', formula: (vars) => vars.D * (vars.g || 9.8) * vars.h },
            { solve: 'D', formula: (vars) => vars.p / ((vars.g || 9.8) * vars.h) },
            { solve: 'h', formula: (vars) => vars.p / (vars.D * (vars.g || 9.8)) }
          ]
        },
        {
          id: 'archimedes',
          name: 'Lực đẩy Archimedes',
          description: 'Lực đẩy lên vật nhúng trong chất lỏng',
          formula: 'F_A = D × g × V',
          latex: 'F_A = D \\times g \\times V',
          variables: [
            { symbol: 'F_A', name: 'Lực đẩy Archimedes', unit: 'N', unitCategory: 'force' },
            { symbol: 'D', name: 'Khối lượng riêng chất lỏng', unit: 'kg/m³', unitCategory: 'density' },
            { symbol: 'g', name: 'Gia tốc trọng trường', unit: 'm/s²', constant: 9.8 },
            { symbol: 'V', name: 'Thể tích phần chìm', unit: 'm³', unitCategory: 'volume' }
          ],
          variants: [
            { solve: 'F_A', formula: (vars) => vars.D * (vars.g || 9.8) * vars.V },
            { solve: 'D', formula: (vars) => vars.F_A / ((vars.g || 9.8) * vars.V) },
            { solve: 'V', formula: (vars) => vars.F_A / (vars.D * (vars.g || 9.8)) }
          ]
        },
        {
          id: 'work',
          name: 'Công cơ học',
          description: 'Công của lực tác dụng',
          formula: 'A = F × s',
          latex: 'A = F \\times s',
          variables: [
            { symbol: 'A', name: 'Công', unit: 'J', unitCategory: 'energy' },
            { symbol: 'F', name: 'Lực', unit: 'N', unitCategory: 'force' },
            { symbol: 's', name: 'Quãng đường', unit: 'm', unitCategory: 'length' }
          ],
          variants: [
            { solve: 'A', formula: (vars) => vars.F * vars.s },
            { solve: 'F', formula: (vars) => vars.A / vars.s },
            { solve: 's', formula: (vars) => vars.A / vars.F }
          ]
        },
        {
          id: 'power-mechanical',
          name: 'Công suất',
          description: 'Công thực hiện trong một đơn vị thời gian',
          formula: 'P = A / t',
          latex: 'P = \\frac{A}{t}',
          variables: [
            { symbol: 'P', name: 'Công suất', unit: 'W', unitCategory: 'power' },
            { symbol: 'A', name: 'Công', unit: 'J', unitCategory: 'energy' },
            { symbol: 't', name: 'Thời gian', unit: 's', unitCategory: 'time' }
          ],
          variants: [
            { solve: 'P', formula: (vars) => vars.A / vars.t },
            { solve: 'A', formula: (vars) => vars.P * vars.t },
            { solve: 't', formula: (vars) => vars.A / vars.P }
          ]
        }
      ]
    },
    {
      id: 'g8-c2',
      name: 'Nhiệt học',
      formulas: [
        {
          id: 'heat-quantity',
          name: 'Nhiệt lượng',
          description: 'Nhiệt lượng thu vào hoặc tỏa ra',
          formula: 'Q = m × c × Δt',
          latex: 'Q = m \\times c \\times \\Delta t',
          variables: [
            { symbol: 'Q', name: 'Nhiệt lượng', unit: 'J', unitCategory: 'energy' },
            { symbol: 'm', name: 'Khối lượng', unit: 'kg', unitCategory: 'mass' },
            { symbol: 'c', name: 'Nhiệt dung riêng', unit: 'J/(kg·K)', unitCategory: null },
            { symbol: 'Δt', name: 'Độ biến thiên nhiệt độ', unit: 'K', unitCategory: 'temperature' }
          ],
          variants: [
            { solve: 'Q', formula: (vars) => vars.m * vars.c * vars['Δt'] },
            { solve: 'm', formula: (vars) => vars.Q / (vars.c * vars['Δt']) },
            { solve: 'c', formula: (vars) => vars.Q / (vars.m * vars['Δt']) },
            { solve: 'Δt', formula: (vars) => vars.Q / (vars.m * vars.c) }
          ]
        },
        {
          id: 'heat-balance',
          name: 'Phương trình cân bằng nhiệt',
          description: 'Nhiệt lượng tỏa ra bằng nhiệt lượng thu vào',
          formula: 'Q_tỏa = Q_thu',
          latex: 'Q_{tỏa} = Q_{thu}',
          variables: [
            { symbol: 'Q_tỏa', name: 'Nhiệt lượng tỏa ra', unit: 'J', unitCategory: 'energy' },
            { symbol: 'Q_thu', name: 'Nhiệt lượng thu vào', unit: 'J', unitCategory: 'energy' }
          ],
          variants: [
            { solve: 'Q_tỏa', formula: (vars) => vars.Q_thu },
            { solve: 'Q_thu', formula: (vars) => vars.Q_tỏa }
          ]
        },
        {
          id: 'fuel-energy',
          name: 'Năng lượng nhiên liệu',
          description: 'Nhiệt lượng tỏa ra khi đốt cháy nhiên liệu',
          formula: 'Q = q × m',
          latex: 'Q = q \\times m',
          variables: [
            { symbol: 'Q', name: 'Nhiệt lượng', unit: 'J', unitCategory: 'energy' },
            { symbol: 'q', name: 'Năng suất tỏa nhiệt', unit: 'J/kg', unitCategory: null },
            { symbol: 'm', name: 'Khối lượng nhiên liệu', unit: 'kg', unitCategory: 'mass' }
          ],
          variants: [
            { solve: 'Q', formula: (vars) => vars.q * vars.m },
            { solve: 'q', formula: (vars) => vars.Q / vars.m },
            { solve: 'm', formula: (vars) => vars.Q / vars.q }
          ]
        },
        {
          id: 'heat-engine-efficiency',
          name: 'Hiệu suất động cơ nhiệt',
          description: 'Tỉ số giữa công có ích và nhiệt lượng',
          formula: 'H = A / Q × 100%',
          latex: 'H = \\frac{A}{Q} \\times 100\\%',
          variables: [
            { symbol: 'H', name: 'Hiệu suất', unit: '%', unitCategory: null },
            { symbol: 'A', name: 'Công có ích', unit: 'J', unitCategory: 'energy' },
            { symbol: 'Q', name: 'Nhiệt lượng', unit: 'J', unitCategory: 'energy' }
          ],
          variants: [
            { solve: 'H', formula: (vars) => (vars.A / vars.Q) * 100 },
            { solve: 'A', formula: (vars) => (vars.H / 100) * vars.Q },
            { solve: 'Q', formula: (vars) => vars.A / (vars.H / 100) }
          ]
        }
      ]
    }
  ]
};

export default GRADE_8_FORMULAS;

# Công Cụ Vật Lý - Physics Tools

## Tổng Quan

Hệ thống công cụ vật lý tích hợp vào ứng dụng học tập, bao gồm 3 công cụ chính:

1. **Máy Tính Vật Lý** - Tính toán các đại lượng theo công thức
2. **Tra Cứu Hằng Số** - Tra cứu nhanh các hằng số vật lý
3. **Chuyển Đổi Đơn Vị** - Chuyển đổi giữa các đơn vị đo lường

## Cấu Trúc File

```
src/
├── data/
│   ├── physicsConstants.json      # Dữ liệu hằng số vật lý
│   └── unitConversions.json       # Dữ liệu bảng đơn vị
├── components/
│   └── PhysicsTools/
│       ├── PhysicsCalculator.jsx  # Máy tính vật lý
│       ├── ConstantsReference.jsx # Tra cứu hằng số
│       └── UnitConverter.jsx      # Chuyển đổi đơn vị
└── pages/
    └── PhysicsToolsHub.jsx        # Trang tổng hợp công cụ
```

## Tính Năng

### 1. Máy Tính Vật Lý (`/physics-tools/calculator`)

**Các danh mục công thức:**
- **Cơ học**: Vận tốc, gia tốc, lực, áp suất, công, công suất
- **Điện học**: Định luật Ohm, công suất điện, điện năng, định luật Jun-Lenxơ
- **Nhiệt học**: Nhiệt lượng, phương trình khí lý tưởng
- **Quang học**: Công thức gương cầu, số phóng đại

**Tính năng:**
- Tự động tính toán kết quả khi nhập đủ dữ liệu
- Hỗ trợ tính ngược (tìm ẩn số bất kỳ)
- Copy kết quả nhanh
- Giao diện trực quan với màu sắc phân biệt

### 2. Tra Cứu Hằng Số (`/physics-tools/constants`)

**Các danh mục hằng số:**
- Hằng số cơ bản (c, G, g, atm)
- Hằng số lượng tử (h, ℏ, α)
- Hằng số điện từ (e, ε₀, μ₀, kₑ)
- Hằng số nhiệt động (k, NA, R, σ)
- Khối lượng hạt (mₑ, mₚ, mₙ)

**Tính năng:**
- Tìm kiếm nhanh theo tên/ký hiệu
- Lọc theo danh mục
- Hiển thị ký hiệu khoa học
- Copy giá trị nhanh
- Mô tả chi tiết từng hằng số

### 3. Chuyển Đổi Đơn Vị (`/physics-tools/converter`)

**Các đại lượng hỗ trợ:**
- Độ dài (km, m, cm, mm, μm, nm, Å, mile, yard, ft, in)
- Khối lượng (t, kg, g, mg, μg, lb, oz)
- Thời gian (năm, ngày, giờ, phút, giây, ms, μs, ns)
- Diện tích (km², ha, m², dm², cm², mm²)
- Thể tích (m³, dm³, cm³, mm³, L, mL)
- Vận tốc (km/h, m/s, cm/s, mph, knot)
- Lực (kN, N, dyne, kgf)
- Áp suất (GPa, MPa, kPa, Pa, bar, atm, mmHg, cmH₂O)
- Năng lượng (GJ, MJ, kJ, J, kWh, eV, cal, kcal)
- Công suất (GW, MW, kW, W, mW, hp)
- Nhiệt độ (K, °C, °F)
- Dòng điện (kA, A, mA, μA)
- Điện áp (MV, kV, V, mV, μV)
- Điện trở (MΩ, kΩ, Ω, mΩ)
- Tần số (GHz, MHz, kHz, Hz)

**Tính năng:**
- Chuyển đổi 2 chiều
- Hoán đổi đơn vị nhanh
- Bảng tham khảo quy đổi
- Hỗ trợ nhiệt độ với công thức đặc biệt

## Routes

```javascript
// Trang tổng hợp
/physics-tools              → PhysicsToolsHub

// Các công cụ
/physics-tools/calculator   → PhysicsCalculator
/physics-tools/constants    → ConstantsReference
/physics-tools/converter    → UnitConverter
```

## Cách Sử Dụng

### Từ Trang Physics Home

1. Truy cập `/program/physics`
2. Click vào nút **"Công Cụ Vật Lý"** (màu cyan)
3. Chọn công cụ cần sử dụng

### Trực Tiếp

Truy cập trực tiếp các URL:
- `/physics-tools` - Trang tổng hợp
- `/physics-tools/calculator` - Máy tính
- `/physics-tools/constants` - Tra cứu hằng số
- `/physics-tools/converter` - Chuyển đổi đơn vị

## Ví Dụ Sử Dụng

### Máy Tính Vật Lý

**Tính vận tốc:**
1. Chọn danh mục "Cơ học"
2. Chọn công thức "Vận tốc"
3. Nhập: s = 100 (m), t = 5 (s)
4. Click "Tính Toán"
5. Kết quả: v = 20 m/s

**Tính điện trở:**
1. Chọn danh mục "Điện học"
2. Chọn công thức "Định luật Ohm"
3. Nhập: U = 220 (V), I = 2 (A)
4. Click "Tính Toán"
5. Kết quả: R = 110 Ω

### Tra Cứu Hằng Số

**Tìm tốc độ ánh sáng:**
1. Gõ "ánh sáng" vào ô tìm kiếm
2. Hoặc lọc theo danh mục "Cơ bản"
3. Tìm thấy: c = 299,792,458 m/s
4. Click icon Copy để sao chép

### Chuyển Đổi Đơn Vị

**Chuyển đổi km sang m:**
1. Chọn đại lượng "Độ dài"
2. Nhập giá trị: 5
3. Chọn từ đơn vị: km
4. Chọn sang đơn vị: m
5. Click "Chuyển Đổi"
6. Kết quả: 5 km = 5000 m

## Công Thức Được Hỗ Trợ

### Cơ Học
- v = s / t (Vận tốc)
- a = (v - v₀) / t (Gia tốc)
- F = m × a (Định luật Newton 2)
- P = m × g (Trọng lực)
- p = F / S (Áp suất)
- A = F × s (Công)
- P = A / t (Công suất)

### Điện Học
- U = I × R (Định luật Ohm)
- P = U × I (Công suất điện)
- A = P × t (Điện năng)
- Q = I² × R × t (Định luật Jun-Lenxơ)

### Nhiệt Học
- Q = m × c × Δt (Nhiệt lượng)
- p × V = n × R × T (Phương trình khí lý tưởng)

### Quang Học
- 1/f = 1/d + 1/d' (Công thức gương cầu)
- k = h' / h (Số phóng đại)

## Hằng Số Vật Lý Quan Trọng

| Ký hiệu | Tên | Giá trị | Đơn vị |
|---------|-----|---------|--------|
| c | Tốc độ ánh sáng | 2.998 × 10⁸ | m/s |
| G | Hằng số hấp dẫn | 6.674 × 10⁻¹¹ | N⋅m²/kg² |
| h | Hằng số Planck | 6.626 × 10⁻³⁴ | J⋅s |
| k | Hằng số Boltzmann | 1.381 × 10⁻²³ | J/K |
| NA | Số Avogadro | 6.022 × 10²³ | mol⁻¹ |
| e | Điện tích nguyên tố | 1.602 × 10⁻¹⁹ | C |
| g | Gia tốc trọng trường | 9.807 | m/s² |

## Đặc Điểm Kỹ Thuật

### Responsive Design
- Mobile-first approach
- Tối ưu cho màn hình nhỏ
- Grid layout linh hoạt

### Dark Mode Support
- Tự động theo theme của hệ thống
- Màu sắc tối ưu cho cả light và dark mode

### Performance
- Lazy loading components
- Memo hooks cho tính toán
- Tối ưu re-render

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation

## Mở Rộng Tương Lai

### Máy Tính Vật Lý
- [ ] Thêm công thức lượng tử
- [ ] Công thức tương đối tính
- [ ] Lưu lịch sử tính toán
- [ ] Export kết quả PDF

### Tra Cứu Hằng Số
- [ ] So sánh nhiều hằng số
- [ ] Biểu đồ trực quan
- [ ] Lịch sử tra cứu
- [ ] Bookmark hằng số yêu thích

### Chuyển Đổi Đơn Vị
- [ ] Chuyển đổi nhiều đơn vị cùng lúc
- [ ] Tạo bảng chuyển đổi tùy chỉnh
- [ ] Lưu preset thường dùng
- [ ] Mode calculator tích hợp

## Hỗ Trợ

Nếu có vấn đề hoặc câu hỏi:
1. Kiểm tra file này trước
2. Xem console log để debug
3. Liên hệ team phát triển

## Cập Nhật

**v1.0.0 - 2026-01-09**
- ✅ Tích hợp máy tính vật lý
- ✅ Tra cứu hằng số vật lý
- ✅ Chuyển đổi đơn vị
- ✅ Tích hợp vào PhysicsHome
- ✅ Responsive design
- ✅ Dark mode support

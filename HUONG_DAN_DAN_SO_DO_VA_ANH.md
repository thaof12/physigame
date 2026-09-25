# TỔNG HỢP HƯỚNG DẪN DÁN SƠ ĐỒ, BẢNG DỮ LIỆU VÀ ẢNH GIAO DIỆN VÀO BÁO CÁO KHÓA LUẬN
### HỆ THỐNG HỌC TẬP VÀ ĐẤU TRƯỜNG VẬT LÝ EUREKA (EUREKA PHYSICS PLATFORM)

---

## 🎨 PHẦN 1: VỊ TRÍ DÁN CÁC SƠ ĐỒ (UML & ARCHITECTURE DIAGRAMS)

Tất cả các sơ đồ UML và kiến trúc được dán chủ yếu tại **CHƯƠNG 3 (Phân tích & Thiết kế)** và **CHƯƠNG 4 (Triển khai)**:

| STT | Loại Sơ đồ | Mục chính xác trong Mục lục | Tên Caption gợi ý trong Báo cáo |
| :---: | :--- | :--- | :--- |
| 1 | **Sơ đồ Cấu trúc Chức năng (FDD)** | **Mục 3.2.1 / 3.2.2** | *Hình 3.1: Sơ đồ Cấu trúc Chức năng hệ thống Eureka Physics (FDD)* |
| 2 | **Sơ đồ Use Case Tổng quan Hệ thống (Đủ 29 UCs)** | **Mục 3.3.1** | *Hình 3.2: Sơ đồ Use Case Tổng quan Hệ thống Eureka Physics* |
| 3 | **Sơ đồ Use Case Chi tiết cho Khách (Guest)** | **Mục 3.3.2** | *Hình 3.3: Sơ đồ Use Case Chi tiết Tác nhân Guest* |
| 4 | **Sơ đồ Use Case Chi tiết cho Học sinh (Student)** | **Mục 3.3.3** | *Hình 3.4: Sơ đồ Use Case Chi tiết Tác nhân Student* |
| 5 | **Sơ đồ Use Case Chi tiết cho Giáo viên (Teacher)** | **Mục 3.3.4** | *Hình 3.5: Sơ đồ Use Case Chi tiết Tác nhân Teacher* |
| 6 | **Sơ đồ Use Case Chi tiết cho Admin** | **Mục 3.3.5** | *Hình 3.6: Sơ đồ Use Case Chi tiết Tác nhân Admin* |
| 7 | **Sơ đồ Kiến trúc Hệ thống 3 lớp** | **Mục 3.4.1 / 3.4.4** | *Hình 3.7: Sơ đồ Kiến trúc Tổng thể Hệ thống Eureka Physics* |
| 8 | **Sơ đồ Cơ sở Dữ liệu (ERD 20 Bảng)** | **Mục 3.5.4** | *Hình 3.8: Sơ đồ Thực thể Quan hệ ERD (20 Bảng Supabase PostgreSQL)* |
| 9 | **Sơ đồ Trình tự 1: Đăng nhập (Sequence 1 - UC02)** | **Mục 3.6.1** | *Hình 3.9: Sơ đồ Trình tự Luồng Đăng nhập (Authentication)* |
| 10 | **Sơ đồ Trình tự 2: Duyệt Giáo viên (Sequence 2 - UC04/25)** | **Mục 3.6.2** | *Hình 3.10: Sơ đồ Trình tự Luồng Nộp & Duyệt hồ sơ Giáo viên* |
| 11 | **Sơ đồ Trình tự 3: Đấu trường PK (Sequence 3 - UC14/15)** | **Mục 3.6.3** | *Hình 3.11: Sơ đồ Trình tự Luồng Ghép trận & Thi đấu PK Real-time* |
| 12 | **Sơ đồ Trình tự 4: Support Chat (Sequence 4 - UC19/28)** | **Mục 3.6.4** | *Hình 3.12: Sơ đồ Trình tự Luồng Hỗ trợ Chat Real-time* |
| 13 | **25 Sơ đồ Trình tự còn lại (Sequence 05-29)** | **Phụ lục D (Appendix D)** | *Hình D.1 đến D.25: Tập hợp các Sơ đồ Trình tự chi tiết UC05-UC29* |
| 14 | **Sơ đồ Trạng thái 1: Duyệt Giáo viên (State 1)** | **Mục 3.7.1** | *Hình 3.13: Sơ đồ Trạng thái Vòng đời Hồ sơ Duyệt Giáo viên* |
| 15 | **Sơ đồ Trạng thái 2: Đấu trường PK (State 2)** | **Mục 3.7.2** | *Hình 3.14: Sơ đồ Trạng thái Vòng đời Trận đấu PK Arena* |
| 16 | **Sơ đồ Trạng thái 3: Bảo trì System (State 3)** | **Mục 3.7.3** | *Hình 3.15: Sơ đồ Trạng thái Vòng đời Chế độ Bảo trì Hệ thống* |
| 17 | **Sơ đồ Triển khai (Deployment Diagram)** | **Mục 4.1.3** | *Hình 4.1: Sơ đồ Triển khai Hạ tầng Cloud (Deployment Diagram)* |

---

## 📊 PHẦN 2: VỊ TRÍ DÁN CÁC BẢNG DỮ LIỆU (TABLE DATA & SPECIFICATIONS)

Tất cả các bảng dữ liệu cấu trúc CSDL, ma trận yêu cầu và kịch bản kiểm thử:

| STT | Loại Bảng Dữ liệu (Table Data) | Mục chính xác trong Mục lục | Tên Caption gợi ý trong Báo cáo |
| :---: | :--- | :--- | :--- |
| 1 | **Bảng Ma trận Yêu cầu Chức năng (29 Use Cases)** | **Mục 3.1.2** | *Bảng 3.1: Bảng Ma trận Yêu cầu Chức năng Hệ thống* |
| 2 | **Bảng Ma trận Yêu cầu Phi Chức năng (NFR)** | **Mục 3.1.3** | *Bảng 3.2: Danh mục Yêu cầu Phi Chức năng Hệ thống* |
| 3 | **Các Bảng Đặc tả Chi tiết Use Case (Use Case Specs)** | **Mục 3.3.6** | *Bảng 3.3 đến 3.7: Bảng Đặc tả Chi tiết các Use Case chính* |
| 4 | **Bảng Dữ liệu Cấu trúc 20 Bảng CSDL (Data Dictionary)** | **Mục 3.5.2** | *Bảng 3.8 đến 3.27: Cấu trúc chi tiết 20 bảng Supabase PostgreSQL (`users`, `profiles`, `lessons`, `battles`, `support_messages`...)* |
| 5 | **Bảng Danh mục các API Endpoints** | **Mục 3.8.3 / Phụ lục C** | *Bảng 3.28: Danh sách các API Endpoints Express.js* |
| 6 | **Bảng Cấu hình Môi trường Phát triển & Kiểm thử** | **Mục 4.1.1** | *Bảng 4.1: Cấu hình Môi trường Phần cứng & Phần mềm* |
| 7 | **Bảng Kịch bản Kiểm thử Chức năng (Test Cases)** | **Mục 4.3.3** | *Bảng 4.2 đến 4.6: Bảng Kịch bản Kiểm thử Chức năng (Test Cases)* |
| 8 | **Bảng Kết quả Khảo sát Chấp nhận Người dùng (UAT)** | **Mục 4.4.1** | *Bảng 4.7: Kết quả Đánh giá Khảo sát UAT* |
| 9 | **Bảng Ma trận Truy vết Yêu cầu (Traceability Matrix)** | **Phụ lục B (Appendix B)** | *Bảng B.1: Ma trận Truy vết Yêu cầu Chức năng* |

---

## 🖼️ PHẦN 3: VỊ TRÍ DÁN CÁC ẢNH HỆ THỐNG / GIAO DIỆN (UI SCREENSHOTS)

Tất cả ảnh chụp màn hình giao diện thực tế ứng dụng được dán tại **CHƯƠNG 4 (MỤC 4.2 & 4.4)**:

| STT | Tên Ảnh chụp Giao diện Thực tế (UI Screenshot) | Mục chính xác trong Mục lục | Tên Caption gợi ý trong Báo cáo |
| :---: | :--- | :--- | :--- |
| 1 | **Giao diện Trang chủ Landing Page & Banner** | **Mục 4.2.1** | *Hình 4.2: Giao diện Trang chủ Eureka Physics Platform* |
| 2 | **Giao diện Form Đăng ký & Đăng nhập** | **Mục 4.2.1** | *Hình 4.3: Giao diện Đăng ký và Đăng nhập Tài khoản* |
| 3 | **Giao diện Profile Cá nhân & Đổi Avatar** | **Mục 4.2.1** | *Hình 4.4: Giao diện Quản lý Hồ sơ Cá nhân* |
| 4 | **Giao diện Form Nộp đơn xin làm Giáo viên** | **Mục 4.2.1** | *Hình 4.5: Giao diện Nộp hồ sơ xét duyệt Giáo viên* |
| 5 | **Giao diện Danh mục Bài giảng Khối 7 - 12** | **Mục 4.2.2** | *Hình 4.6: Giao diện Danh mục Bài giảng phân loại Khối 7-12* |
| 6 | **Giao diện Xem Bài giảng Lý thuyết & Tóm tắt** | **Mục 4.2.2** | *Hình 4.7: Giao diện Trang Học Bài giảng Lý thuyết Tương tác* |
| 7 | **Giao diện Làm Bài Test Đánh giá Năng lực Đầu vào** | **Mục 4.2.2** | *Hình 4.8: Giao diện Làm bài Test Đánh giá Đầu vào* |
| 8 | **Giao diện Danh mục Thí nghiệm Ảo (Virtual Lab Hub)** | **Mục 4.2.3** | *Hình 4.9: Giao diện Danh mục Thí nghiệm Ảo* |
| 9 | **Giao diện Thí nghiệm Ảo (Con lắc đơn, Định luật Ohm...)** | **Mục 4.2.3** | *Hình 4.10: Giao diện Thí nghiệm Ảo Con lắc đơn trên HTML5 Canvas* |
| 10 | **Giao diện Máy tính Công thức Vật lý** | **Mục 4.2.4** | *Hình 4.11: Giao diện Máy tính Công thức Vật lý Tương tác* |
| 11 | **Giao diện Tra cứu Hằng số & Quy đổi Đơn vị** | **Mục 4.2.4** | *Hình 4.12: Giao diện Tra cứu Hằng số & Quy đổi Đơn vị* |
| 12 | **Giao diện Sảnh Đấu trường PK (Matchmaking)** | **Mục 4.2.5** | *Hình 4.13: Giao diện Sảnh Ghép trận PK Battle Arena* |
| 13 | **Giao diện Phòng Thi đấu PK Real-time** | **Mục 4.2.5** | *Hình 4.14: Giao diện Phòng Thi đấu PK Real-time Trực tiếp* |
| 14 | **Giao diện Bảng xếp hạng XP Leaderboard** | **Mục 4.2.5** | *Hình 4.15: Giao diện Bảng xếp hạng XP Leaderboard* |
| 15 | **Giao diện Gửi Chat Hỗ trợ Real-time (Student/Teacher)** | **Mục 4.2.6** | *Hình 4.16: Giao diện Gửi tin nhắn Hỗ trợ Real-time* |
| 16 | **Giao diện Trang Quản lý Lớp học của Giáo viên** | **Mục 4.2.7** | *Hình 4.17: Giao diện Quản lý Lớp học dành cho Giáo viên* |
| 17 | **Giao diện Admin Dashboard Thống kê** | **Mục 4.2.8** | *Hình 4.18: Giao diện Admin Dashboard Thống kê Hệ thống* |
| 18 | **Giao diện Admin Duyệt Giáo viên & Quản lý User** | **Mục 4.2.8** | *Hình 4.19: Giao diện Admin Duyệt hồ sơ Giáo viên* |
| 19 | **Giao diện Admin Trả lời Support (Admin Feedback)** | **Mục 4.2.8** | *Hình 4.20: Giao diện Admin Trả lời Chat Hỗ trợ Real-time* |
| 20 | **Giao diện Admin Cấu hình Bảo trì (Maintenance Mode)** | **Mục 4.2.8** | *Hình 4.21: Giao diện Admin Cấu hình Chế độ Bảo trì* |
| 21 | **Ảnh Kết quả Điểm số Hiệu năng Google Lighthouse** | **Mục 4.4.4** | *Hình 4.22: Báo cáo Kết quả Điểm số Google Lighthouse* |

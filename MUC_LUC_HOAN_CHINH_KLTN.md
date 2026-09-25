# MỤC LỤC HOÀN CHỈNH BÁO CÁO KHÓA LUẬN TỐT NGHIỆP
## HỆ THỐNG HỌC TẬP & ĐẤU TRƯỜNG VẬT LÝ EUREKA (EUREKA PHYSICS PLATFORM)

---

> **Ghi chú**: Mục lục này được xây dựng dựa trên sự kết hợp chuẩn mực giữa:
> 1. Mẫu cấu trúc chuẩn đồ án/khóa luận CNTT (`I22_401_Lan01.docx`)
> 2. Nội dung lý luận và thực nghiệm hiện có (`KLTN_Final(Fixed2).docx`)
> 3. Cấu trúc thực tế mã nguồn & CSDL 20 bảng của hệ thống Eureka Physics (`physigame`)

---

## 📌 PHẦN THỦ TỤC VÀ ĐẦU TRANG (PRELIMINARY PAGES)

- **TRANG BÌA CHÍNH (TITLE PAGE)**
- **TRANG BÌA PHỤ (SUB-TITLE PAGE)**
- **NHẬN XÉT CỦA GIẢNG VIÊN HƯỚNG DẪN (INSTRUCTOR'S EVALUATION)**
- **NHẬN XÉT CỦA GIẢNG VIÊN PHẢN BIỆN (REVIEWER'S EVALUATION)**
- **LỜI CAM ĐOAN (DECLARATION OF AUTHORSHIP)**
- **LỜI CẢM ƠN (ACKNOWLEDGEMENTS)**
- **TÓM TẮT BÁO CÁO / ABSTRACT (VIETNAMESE & ENGLISH)**
- **MỤC LỤC (TABLE OF CONTENTS)**
- **DANH MỤC BẢNG (LIST OF TABLES)**
- **DANH MỤC HÌNH ẢNH & SƠ ĐỒ (LIST OF FIGURES & DIAGRAMS)**
- **DANH MỤC TỪ VIẾT TẮT (LIST OF ABBREVIATIONS)**

---

## 📘 CHƯƠNG 1: TỔNG QUAN VỀ ĐỀ TÀI (INTRODUCTION)

- **1.1. Đặt vấn đề và Lý do chọn đề tài (Background and Motivation)**
  - 1.1.1. Thực trạng giảng dạy và học tập môn Vật lý tại các trường phổ thông (Context of Physics Education in Vietnam)
  - 1.1.2. Hạn chế của các phương pháp và giải pháp e-learning hiện hữu (Limitations of Existing Solutions)
  - 1.1.3. Động lực thực hiện dự án Eureka Physics (Project Motivation)
- **1.2. Phát biểu bài toán nghiên cứu (Research Problem)**
  - 1.2.1. Thách thức trong việc trực quan hóa kiến thức lý thuyết Vật lý
  - 1.2.2. Thách thức trong duy trì động lực tự học và tương tác real-time
- **1.3. Mục tiêu của đề tài (Project Objectives)**
  - 1.3.1. Mục tiêu tổng quát (General Objective)
  - 1.3.2. Các mục tiêu cụ thể O1 - O5 (Specific Operational Objectives: Content, Assessment, Simulation, Gamification, Technical Robustness)
- **1.4. Đối tượng sử dụng và Phạm vi nghiên cứu (Target Users and Research Scope)**
  - 1.4.1. Phân loại đối tượng sử dụng (Học sinh Khối 7-12, Giáo viên, Quản trị viên)
  - 1.4.2. Phạm vi nghiên cứu của đề tài (In-Scope & Out-of-Scope Elements)
- **1.5. Phương pháp nghiên cứu (Research Methodology)**
  - 1.5.1. Phương pháp Nghiên cứu Khoa học Thiết kế DSR (Design Science Research Framework)
  - 1.5.2. Các giai đoạn triển khai nghiên cứu (Giai đoạn 1: Thu thập yêu cầu ➔ Giai đoạn 2: Thiết kế & Phát triển ➔ Giai đoạn 3: Kiểm thử & Đánh giá)
- **1.6. Cấu trúc của báo cáo khóa luận (Thesis Organization)**

---

## 📙 CHƯƠNG 2: CƠ SỞ LÝ LUẬN VÀ NỀN TẢNG CÔNG NGHỆ (THEORETICAL FOUNDATION AND CORE TECHNOLOGIES)

- **2.1. Cơ sở lý luận về Giáo dục số (E-Learning and Educational Theory)**
  - 2.1.1. Định nghĩa và vai trò của E-Learning trong giáo dục hiện đại
  - 2.1.2. Trò chơi hóa trong giáo dục (Gamification in Education & Flow Theory)
  - 2.1.3. Phương pháp học tập dựa trên mô phỏng (Simulation-Based Learning in Physics)
- **2.2. Nền tảng công nghệ sử dụng trong hệ thống (Core Technologies Stack)**
  - 2.2.1. Kiến trúc Frontend: React 18, Vite và Tailwind CSS Framework
  - 2.2.2. Công nghệ mô phỏng đồ họa: HTML5 Canvas API & WebGL Engine
  - 2.2.3. Môi trường Backend & RESTful API: Node.js và Express.js Server
  - 2.2.4. Nền tảng Backend-as-a-Service (BaaS): Supabase Cloud (PostgreSQL, Auth Gateway, Realtime Channels, Object Storage)
  - 2.2.5. Hạ tầng triển khai: Vercel Cloud Serverless Hosting
- **2.3. Phân tích các sản phẩm liên quan và Khe hổng nghiên cứu (Related Work & Gap Analysis)**
  - 2.3.1. Phân tích so sánh các nền tảng học Vật lý hiện có (PhET Interactive Simulations, Kahoot, Quizizz, edX)
  - 2.3.2. Định vị tính mới và điểm khác biệt của Eureka Physics Platform

---

## 📗 CHƯƠNG 3: PHÂN TÍCH YÊU CẦU VÀ THIẾT KẾ HỆ THỐNG (SYSTEM ANALYSIS AND DESIGN)

- **3.1. Phân tích Yêu cầu Hệ thống (System Requirements Analysis)**
  - 3.1.1. Các bên liên quan (Stakeholders Analysis)
  - 3.1.2. Yêu cầu Chức năng (Functional Requirements - 29 Use Cases)
  - 3.1.3. Yêu cầu Phi chức năng (Non-Functional Requirements: Security, Performance, Scalability, Responsiveness)
  - 3.1.4. Ràng buộc hệ thống (System Constraints)
- **3.2. Sơ đồ Cấu trúc Chức năng (Functional Decomposition Diagram - FDD)**
  - 3.2.1. Tổng quan Cấu trúc 8 Phân hệ Chức năng
  - 3.2.2. Phân rã chi tiết các Phân hệ (Auth, Lessons, Virtual Lab, Tools, PK Arena, Support, Teacher Panel, Admin Panel)
- **3.3. Mô hình hóa Use Case (Use Case Modeling)**
  - 3.3.1. Sơ đồ Use Case Tổng quan Hệ thống
  - 3.3.2. Sơ đồ Use Case Chi tiết cho Tác nhân Khách (Guest Actor Use Case Diagram)
  - 3.3.3. Sơ đồ Use Case Chi tiết cho Tác nhân Học sinh (Student Actor Use Case Diagram)
  - 3.3.4. Sơ đồ Use Case Chi tiết cho Tác nhân Giáo viên (Teacher Actor Use Case Diagram)
  - 3.3.5. Sơ đồ Use Case Chi tiết cho Tác nhân Quản trị viên (Admin Actor Use Case Diagram)
  - 3.3.6. Đặc tả chi tiết các Use Case chính (Use Case Specifications)
- **3.4. Thiết kế Kiến trúc Hệ thống (System Architecture Design)**
  - 3.4.1. Kiến trúc tổng thể 3 lớp (3-Tier Architecture Pattern)
  - 3.4.2. Kiến trúc phía Client (Presentation Layer & State Management Contexts)
  - 3.4.3. Kiến trúc phía Server (Application & API Middleware Layer)
  - 3.4.4. Lớp Dữ liệu & Dịch vụ Cloud (Data & Supabase BaaS Layer)
  - 3.4.5. Cơ chế giao tiếp Real-time qua Supabase WebSockets Channels
- **3.5. Thiết kế Cơ sở Dữ liệu (Database Design)**
  - 3.5.1. Tổng quan CSDL PostgreSQL trên Supabase
  - 3.5.2. Chi tiết Danh mục 20 Bảng Dữ liệu (Tables Catalog: users, profiles, classes, class_members, lessons, lesson_completions, battles, support_messages, etc.)
  - 3.5.3. Quan hệ giữa các bảng và Ràng buộc Toàn vẹn (Integrity Constraints)
  - 3.5.4. Sơ đồ Quan hệ Thực thể ERD (Entity-Relationship Diagram - 20 Bảng)
- **3.6. Thiết kế Trình tự các Luồng Nghiệp vụ (Sequence Diagrams Design)**
  - 3.6.1. Sơ đồ Trình tự Luồng Xác thực & Đăng nhập (Authentication & Login Flow - UC02)
  - 3.6.2. Sơ đồ Trình tự Luồng Nộp & Duyệt Hồ sơ Giáo viên (Teacher Application & Approval Flow - UC04 & UC25)
  - 3.6.3. Sơ đồ Trình tự Luồng Ghép trận & Thi đấu PK Real-time (PK Battle Matchmaking & Arena Flow - UC14 & UC15)
  - 3.6.4. Sơ đồ Trình tự Luồng Hỗ trợ & Trả lời Real-time Chat (Support Ticket & Response Flow - UC19 & UC28)
  - 3.6.5. Danh mục các Sơ đồ Trình tự bổ trợ (UC01 - UC29 Sequence Diagrams Overview)
- **3.7. Thiết kế Sơ đồ Trạng thái (State Machine Diagrams Design)**
  - 3.7.1. Sơ đồ Trạng thái Vòng đời Xét duyệt Giáo viên (Teacher Application Lifecycle)
  - 3.7.2. Sơ đồ Trạng thái Vòng đời Trận đấu PK Arena (PK Battle Arena Lifecycle)
  - 3.7.3. Sơ đồ Trạng thái Vòng đời Chế độ Bảo trì Hệ thống (System Maintenance Lifecycle)
  - 3.7.4. Tổng quan các Sơ đồ Trạng thái Bổ trợ (Tài khoản, Tiến độ Học bài, Test Đầu vào, Support Ticket, Virtual Lab Session)
- **3.8. Thiết kế Bảo mật và An toàn Dữ liệu (Security Architecture Design)**
  - 3.8.1. Mã hóa Mật khẩu và Quản lý Session Token
  - 3.8.2. Phân quyền người dùng dựa trên Vai trò (Role-Based Access Control - RBAC)
  - 3.8.3. Bảo mật API Routes và Bảo vệ API Keys
- **3.9. Tổng kết Chương 3**

---

## 📕 CHƯƠNG 4: TRIỂN KHAI, KIỂM THỬ VÀ ĐÁNH GIÁ HỆ THỐNG (SYSTEM IMPLEMENTATION, TESTING AND EVALUATION)

- **4.1. Môi trường Phát triển và Triển khai (Development & Deployment Environment)**
  - 4.1.1. Cấu hình Phần cứng và Phần mềm phát triển
  - 4.1.2. Cấu trúc Mã nguồn Dự án (`physigame` Directory Structure)
  - 4.1.3. Sơ đồ Triển khai Hạ tầng Cloud (Deployment Diagram: Client, Server, Supabase Cloud)
- **4.2. Triển khai các Phân hệ Chức năng (Modules Implementation)**
  - 4.2.1. Phân hệ Xác thực và Quản lý Tài khoản (Auth & Profile Modules)
  - 4.2.2. Phân hệ Bài giảng Lý thuyết và Tương tác (Interactive Lectures Module - Lớp 7 đến Lớp 12)
  - 4.2.3. Phân hệ Thí nghiệm Vật lý Ảo (Virtual Physics Laboratory Module - HTML5 Canvas Engine)
  - 4.2.4. Phân hệ Công cụ Vật lý (Physics Utilities Module: Calculator, Constants, Converter)
  - 4.2.5. Phân hệ Đấu trường PK Battle và Trò chơi hóa (PK Arena & Gamification Module: Matchmaking, Live Score, Leaderboard)
  - 4.2.6. Phân hệ Hỗ trợ Real-time và Chat (Support & Messaging Module)
  - 4.2.7. Phân hệ Quản trị dành cho Giáo viên (Teacher Management Panel)
  - 4.2.8. Phân hệ Quản trị Hệ thống dành cho Admin (Admin Console Panel: Users, Lessons, Feedback, Maintenance Mode)
- **4.3. Kiểm thử Hệ thống (System Testing)**
  - 4.3.1. Mục tiêu và Phương pháp Kiểm thử (Testing Objectives & Methodology)
  - 4.3.2. Môi trường và Kịch bản Kiểm thử (Test Environment & Test Cases)
  - 4.3.3. Kiểm thử Chức năng (Functional Testing: Auth, Learning, Virtual Lab, PK Arena, Admin)
  - 4.3.4. Kiểm thử Tương thích và Responsive (Cross-Browser & Responsive Device Testing)
  - 4.3.5. Kiểm thử Xử lý Lỗi và Trường hợp Ngoại lệ (Exception & Edge Case Handling)
- **4.4. Đánh giá Hệ thống và Kiểm thử Chấp nhận Người dùng (System Evaluation & UAT)**
  - 4.4.1. Kết quả Đánh giá Chấp nhận Người dùng (User Acceptance Testing Results - UAT)
  - 4.4.2. Đánh giá về Mức độ Đáp ứng Mục tiêu (Achievements Against Objectives O1 - O5)
  - 4.4.3. Đánh giá Về Giao diện và Trải nghiệm Người dùng (UI/UX Usability Evaluation)
  - 4.4.4. Đánh giá Hiệu năng và Độ ổn định Real-time (Lighthouse Metrics & Realtime Latency)
- **4.5. Tổng kết Chương 4**

---

## 📓 CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN (CONCLUSION AND FUTURE WORK)

- **5.1. Kết quả đạt được của Đề tài (Summary of Main Contributions)**
- **5.2. Các Hạn chế còn tồn tại (Limitations of the Current System)**
- **5.3. Hướng phát triển trong Tương lai (Recommendations for Future Work)**
  - 5.3.1. Phát triển Ứng dụng Di động PWA / Native App (iOS & Android)
  - 5.3.2. Tích hợp Trí tuệ Nhân tạo AI Tự điều chỉnh Lộ trình Học tập (AI Adaptive Learning)
  - 5.3.3. Mở rộng Thí nghiệm Ảo 3D / VR cho Chương trình Chuyên sâu
- **5.4. Lời kết (Concluding Remarks)**

---

## 📚 TÀI LIỆU THAM KHẢO (REFERENCES)

- [1] Bộ Giáo dục và Đào tạo, *Chương trình Giáo dục phổ thông môn Vật lý*, 2018.
- [2] Hevner, A. R., March, S. T., Park, J., & Ram, S., "Design Science in Information Systems Research," *MIS Quarterly*, vol. 28, no. 1, pp. 75-105, 2004.
- [3] Deterding, S., Dixon, D., Khaled, R., & Nacke, L., "From game design elements to gamefulness: defining gamification," *Proc. 15th MindTrek*, 2011.
- [4] React & Vite Documentation: https://react.dev/
- [5] Supabase Documentation & PostgreSQL Architecture: https://supabase.com/docs
- ... *(Bổ sung đầy đủ danh mục tài liệu tham khảo Việt - Anh)*

---

## 📎 PHỤ LỤC (APPENDICES)

- **Phụ lục A: Bảng Câu hỏi Kiểm thử Chấp nhận Người dùng (UAT Questionnaire)**
- **Phụ lục B: Bảng Ma trận Truy vết Yêu cầu Chức năng (Functional Requirements Traceability Matrix)**
- **Phụ lục C: Chi tiết Mã Nguồn và Cấu hình CSDL Supabase (Database Schema & API Specifications)**
- **Phụ lục D: Tập hợp 29 Sơ đồ Trình tự Chi tiết (Complete 29 Sequence Diagrams Catalog)**

# TABLE OF CONTENTS (MỤC LỤC BÁO CÁO KHÓA LUẬN TỐT NGHIỆP)
## EUREKA PHYSICS LEARNING AND PK ARENA PLATFORM
### (HỆ THỐNG HỌC TẬP VÀ ĐẤU TRƯỜNG VẬT LÝ EUREKA)

---

## 📌 PRELIMINARY PAGES *(Phần Thủ tục và Đầu trang)*

- **TITLE PAGE** *(Trang bìa chính)*
- **SUB-TITLE PAGE** *(Trang bìa phụ)*
- **INSTRUCTOR'S EVALUATION SHEET** *(Phiếu nhận xét của Giảng viên hướng dẫn)*
- **REVIEWER'S EVALUATION SHEET** *(Phiếu nhận xét của Giảng viên phản biện)*
- **DECLARATION OF AUTHORSHIP** *(Lời cam đoan của tác giả)*
- **ACKNOWLEDGEMENTS** *(Lời cảm ơn)*
- **ABSTRACT (ENGLISH & VIETNAMESE)** *(Tóm tắt báo cáo Tiếng Anh & Tiếng Việt)*
- **TABLE OF CONTENTS** *(Mục lục)*
- **LIST OF TABLES** *(Danh mục Bảng biểu)*
- **LIST OF FIGURES & DIAGRAMS** *(Danh mục Hình ảnh & Sơ đồ)*
- **LIST OF ABBREVIATIONS** *(Danh mục Từ viết tắt)*

---

## 📘 CHAPTER 1: INTRODUCTION *(Chương 1: Giới thiệu & Tổng quan Đề tài)*

- **1.1 Background and Motivation** *(Bối cảnh và Động lực thực hiện đề tài)*
  - 1.1.1 Context of Physics Education in Vietnamese High Schools *(Thực trạng giáo dục môn Vật lý tại các trường phổ thông Việt Nam)*
  - 1.1.2 Limitations of Existing E-Learning Solutions *(Hạn chế của các giải pháp E-Learning hiện có)*
  - 1.1.3 Project Motivation for Eureka Physics Platform *(Động lực phát triển nền tảng Eureka Physics)*
- **1.2 Research Problem Statement** *(Phát biểu bài toán nghiên cứu)*
  - 1.2.1 Challenges in Visualizing Abstract Physics Theories *(Thách thức trong việc trực quan hóa lý thuyết Vật lý trừu tượng)*
  - 1.2.2 Challenges in Maintaining Self-Study Engagement and Real-Time Interaction *(Thách thức trong việc duy trì động lực tự học và tương tác thời gian thực)*
- **1.3 Project Objectives** *(Mục tiêu của đề tài)*
  - 1.3.1 General Objective *(Mục tiêu tổng quát)*
  - 1.3.2 Specific Operational Objectives O1 - O5 *(Các mục tiêu cụ thể O1 - O5: Nội dung, Đánh giá, Mô phỏng, Trò chơi hóa, Kỹ thuật)*
- **1.4 Target Users and Research Scope** *(Đối tượng sử dụng và Phạm vi nghiên cứu)*
  - 1.4.1 User Roles Classification: Student (Grades 7-12), Teacher, Administrator *(Phân loại vai trò người dùng)*
  - 1.4.2 Research Scope and Operational Boundaries *(Phạm vi nghiên cứu và Ranh giới triển khai hệ thống)*
- **1.5 Research Methodology** *(Phương pháp nghiên cứu)*
  - 1.5.1 Design Science Research (DSR) Framework *(Khung phương pháp Nghiên cứu Khoa học Thiết kế DSR)*
  - 1.5.2 Phased Implementation Workflow *(Các giai đoạn triển khai: Thu thập yêu cầu ➔ Thiết kế & Phát triển ➔ Kiểm thử & Đánh giá)*
- **1.6 Thesis Organization** *(Cấu trúc cuốn báo cáo khóa luận)*

---

## 📙 CHAPTER 2: THEORETICAL FOUNDATION AND CORE TECHNOLOGIES *(Chương 2: Cơ sở Lý luận và Nền tảng Công nghệ)*

- **2.1 Pedagogical and Theoretical Foundations** *(Cơ sở lý luận về giáo dục số)*
  - 2.1.1 Definition and Significance of E-Learning in Modern Education *(Định nghĩa và vai trò của E-Learning)*
  - 2.1.2 Gamification in Education and Flow Theory *(Trò chơi hóa trong giáo dục và Thuyết Dòng chảy Flow)*
  - 2.1.3 Simulation-Based Learning in Physics Education *(Phương pháp học tập dựa trên mô phỏng trong Vật lý)*
- **2.2 Core Technology Stack** *(Nền tảng công nghệ cốt lõi)*
  - 2.2.1 Frontend Stack: React 18, Vite, and Tailwind CSS Framework *(Công nghệ Frontend)*
  - 2.2.2 Graphical Simulation Engine: HTML5 Canvas API and WebGL Engine *(Engine mô phỏng đồ họa Thí nghiệm ảo)*
  - 2.2.3 Backend Runtime & RESTful API: Node.js and Express.js Server *(Công nghệ Backend API)*
  - 2.2.4 Backend-as-a-Service (BaaS): Supabase Cloud (PostgreSQL, Auth Gateway, Realtime Channels, Object Storage) *(Hạ tầng đám mây Supabase BaaS)*
  - 2.2.5 Cloud Hosting Infrastructure: Vercel Serverless Platform *(Hạ tầng triển khai Vercel)*
- **2.3 Related Work and Gap Analysis** *(Các công trình liên quan và Phân tích khe hổng nghiên cứu)*
  - 2.3.1 Comparative Analysis of Existing Physics Platforms (PhET, Kahoot, Quizizz, edX) *(Phân tích so sánh các nền tảng hiện có)*
  - 2.3.2 Positioning and Novelty of Eureka Physics Platform *(Định vị tính mới và điểm khác biệt của Eureka Physics)*

---

## 📗 CHAPTER 3: SYSTEM ANALYSIS AND DESIGN *(Chương 3: Phân tích Yêu cầu và Thiết kế Hệ thống)*

- **3.1 Requirements Analysis** *(Phân tích yêu cầu hệ thống)*
  - 3.1.1 Stakeholders Analysis *(Phân tích các bên liên quan)*
  - 3.1.2 Functional Requirements (29 Detailed Use Cases) *(Yêu cầu chức năng - 29 Use Cases)*
  - 3.1.3 Non-Functional Requirements: Security, Performance, Scalability, Responsiveness *(Yêu cầu phi chức năng: Bảo mật, Hiệu năng, Mở rộng, Tương thích)*
  - 3.1.4 System Constraints *(Ràng buộc hệ thống)*
- **3.2 Functional Decomposition Diagram (FDD)** *(Sơ đồ Cấu trúc Chức năng)*
  - 3.2.1 Overview of 8 Functional Subsystems *(Tổng quan cấu trúc 8 Phân hệ Chức năng)*
  - 3.2.2 Subsystem Decomposition: Auth, Lessons, Virtual Lab, Tools, PK Arena, Support, Teacher Panel, Admin Panel *(Phân rã chi tiết 8 Phân hệ)*
- **3.3 Use Case Modeling** *(Mô hình hóa Use Case)*
  - 3.3.1 Global System Use Case Diagram *(Sơ đồ Use Case tổng quan hệ thống)*
  - 3.3.2 Guest Actor Use Case Diagram *(Sơ đồ Use Case chi tiết cho Khách)*
  - 3.3.3 Student Actor Use Case Diagram *(Sơ đồ Use Case chi tiết cho Học sinh)*
  - 3.3.4 Teacher Actor Use Case Diagram *(Sơ đồ Use Case chi tiết cho Giáo viên)*
  - 3.3.5 Admin Actor Use Case Diagram *(Sơ đồ Use Case chi tiết cho Admin)*
  - 3.3.6 Primary Use Case Specifications *(Bản đặc tả các Use Case chính)*
- **3.4 System Architecture Design** *(Thiết kế Kiến trúc Hệ thống)*
  - 3.4.1 3-Tier Architectural Pattern *(Mô hình kiến trúc 3 lớp)*
  - 3.4.2 Presentation Layer and State Management Contexts *(Kiến trúc lớp Giao diện Client và Contexts quản lý trạng thái)*
  - 3.4.3 Application & Middleware Server Layer *(Kiến trúc lớp Server API và Middleware)*
  - 3.4.4 Database & Supabase BaaS Infrastructure Layer *(Kiến trúc lớp CSDL và Dịch vụ Cloud Supabase)*
  - 3.4.5 Real-time Communication Mechanism via WebSockets Channels *(Cơ chế giao tiếp thời gian thực WebSockets)*
- **3.5 Database Design** *(Thiết kế Cơ sở Dữ liệu)*
  - 3.5.1 Supabase PostgreSQL Database Overview *(Tổng quan CSDL PostgreSQL trên Supabase)*
  - 3.5.2 Complete Catalog of 20 Database Tables *(Chi tiết danh mục 20 bảng CSDL)*
  - 3.5.3 Entity Relationships and Integrity Constraints *(Mối quan hệ giữa các bảng và Ràng buộc toàn vẹn)*
  - 3.5.4 Entity-Relationship Diagram (ERD 20 Tables) *(Sơ đồ ERD 20 bảng CSDL)*
- **3.6 Behavioral Sequence Diagrams Design** *(Thiết kế Sơ đồ Trình tự các Luồng nghiệp vụ)*
  - 3.6.1 Authentication and Login Flow Sequence Diagram (UC02) *(Sơ đồ Trình tự luồng Đăng nhập)*
  - 3.6.2 Teacher Application and Approval Flow Sequence Diagram (UC04 & UC25) *(Sơ đồ Trình tự luồng Nộp & Duyệt hồ sơ Giáo viên)*
  - 3.6.3 Real-time PK Battle Matchmaking and Arena Flow Sequence Diagram (UC14 & UC15) *(Sơ đồ Trình tự luồng Ghép trận & Thi đấu PK Real-time)*
  - 3.6.4 Real-time Support Chat Messaging Flow Sequence Diagram (UC19 & UC28) *(Sơ đồ Trình tự luồng Chat Hỗ trợ Real-time)*
  - 3.6.5 Overview Catalog of 29 Behavioral Sequence Diagrams (UC01 - UC29) *(Tổng quan danh mục 29 sơ đồ Trình tự UC01-UC29)*
- **3.7 State Machine Diagrams Design** *(Thiết kế Sơ đồ Trạng thái Vòng đời)*
  - 3.7.1 Teacher Application Lifecycle State Machine Diagram *(Sơ đồ Trạng thái vòng đời Duyệt Giáo viên)*
  - 3.7.2 PK Battle Arena Lifecycle State Machine Diagram *(Sơ đồ Trạng thái vòng đời Trận đấu PK)*
  - 3.7.3 System Maintenance Mode Lifecycle State Machine Diagram *(Sơ đồ Trạng thái vòng đời Chế độ Bảo trì)*
  - 3.7.4 Overview of Auxiliary State Machines (Account Status, Lesson Progress, Placement Test, Support Ticket, Lab Session) *(Tổng quan các sơ đồ Trạng thái bổ trợ)*
- **3.8 Security Architecture Design** *(Thiết kế Kiến trúc Bảo mật)*
  - 3.8.1 Password Hashing and Session Token Management *(Mã hóa mật khẩu và Quản lý Session Token)*
  - 3.8.2 Role-Based Access Control (RBAC) *(Phân quyền người dùng theo vai trò RBAC)*
  - 3.8.3 API Endpoint Protection and Security Keys Management *(Bảo mật đường dẫn API và Quản lý API Key)*
- **3.9 Chapter Summary** *(Tổng kết Chương 3)*

---

## 📕 CHAPTER 4: SYSTEM IMPLEMENTATION, TESTING AND EVALUATION *(Chương 4: Triển khai, Kiểm thử và Đánh giá Hệ thống)*

- **4.1 Development Environment and Deployment Architecture** *(Môi trường phát triển và Kiến trúc triển khai)*
  - 4.1.1 Hardware and Software Development Configurations *(Cấu hình phần cứng và phần mềm phát triển)*
  - 4.1.2 Source Code Directory Structure (`physigame`) *(Cấu trúc thư mục mã nguồn dự án)*
  - 4.1.3 Production Deployment Diagram (Client Device, Server, Supabase Cloud) *(Sơ đồ Triển khai hạ tầng Production)*
- **4.2 Functional Modules Implementation** *(Triển khai các Phân hệ Chức năng)*
  - 4.2.1 Authentication and Profile Management Modules *(Triển khai Phân hệ Xác thực & Profile)*
  - 4.2.2 Interactive Physics Lectures Module (Grades 7-12) *(Triển khai Phân hệ Bài giảng Lý thuyết Lớp 7-12)*
  - 4.2.3 Virtual Physics Laboratory Module (HTML5 Canvas Engine) *(Triển khai Phân hệ Phòng thí nghiệm ảo Canvas)*
  - 4.2.4 Physics Utilities Module (Calculator, Constants, Unit Converter) *(Triển khai Phân hệ Công cụ Vật lý)*
  - 4.2.5 PK Battle Arena and Gamification Module (Matchmaking, Live Score Sync, Leaderboard) *(Triển khai Phân hệ Đấu trường PK & Gamification)*
  - 4.2.6 Real-Time Support Messaging Module *(Triển khai Phân hệ Hỗ trợ Real-time)*
  - 4.2.7 Teacher Management Console Module *(Triển khai Phân hệ Quản trị dành cho Giáo viên)*
  - 4.2.8 System Administrator Console Module (Users, Content CRUD, Feedback, Maintenance Mode) *(Triển khai Phân hệ Quản trị Admin)*
- **4.3 System Testing** *(Kiểm thử Hệ thống)*
  - 4.3.1 Testing Objectives and Methodology *(Mục tiêu và Phương pháp kiểm thử)*
  - 4.3.2 Test Environment and Test Cases Setup *(Môi trường và Thiết lập Kịch bản kiểm thử)*
  - 4.3.3 Functional Testing Execution (Auth, Learning, Virtual Lab, PK Arena, Admin) *(Thực thi Kiểm thử Chức năng)*
  - 4.3.4 Cross-Browser and Responsive Device Testing *(Kiểm thử Tương thích Trình duyệt và Thiết bị)*
  - 4.3.5 Exception Handling and Edge Case Testing *(Kiểm thử Xử lý Lỗi và Trường hợp Ngoại lệ)*
- **4.4 System Evaluation and User Acceptance Testing (UAT)** *(Đánh giá Hệ thống và Kiểm thử Chấp nhận Người dùng)*
  - 4.4.1 User Acceptance Testing (UAT) Survey Results *(Kết quả khảo sát Kiểm thử Chấp nhận Người dùng UAT)*
  - 4.4.2 Achievements Evaluation Against Objectives O1 - O5 *(Đánh giá Mức độ Đạt được so với Mục tiêu O1 - O5)*
  - 4.4.3 UI/UX Usability and Interface Aesthetics Evaluation *(Đánh giá Giao diện và Trải nghiệm Người dùng UI/UX)*
  - 4.4.4 Performance Metrics and Real-time Latency Evaluation (Lighthouse Score & WebSocket Latency) *(Đánh giá Hiệu năng và Độ trễ Real-time)*
- **4.5 Chapter Summary** *(Tổng kết Chương 4)*

---

## 📓 CHAPTER 5: CONCLUSION AND FUTURE WORK *(Chương 5: Kết luận và Hướng phát triển)*

- **5.1 Summary of Main Contributions** *(Tóm tắt các Đóng góp chính của Đề tài)*
  - 5.1.1 Theoretical and Pedagogical Contributions *(Đóng góp về mặt Lý luận và Sư phạm)*
  - 5.1.2 Practical Engineering Artifact Contributions *(Đóng góp về mặt Sản phẩm Kỹ thuật Thực tiễn)*
- **5.2 Limitations of Current System Implementation** *(Các Hạn chế còn tồn tại của Hệ thống)*
- **5.3 Recommendations for Future Work** *(Đề xuất Hướng phát triển trong Tương lai)*
  - 5.3.1 Progressive Web App (PWA) and Native Mobile Application Development *(Phát triển Ứng dụng Di động PWA / Native App)*
  - 5.3.2 Artificial Intelligence (AI) Adaptive Learning Path Integration *(Tích hợp AI Tự điều chỉnh Lộ trình Học tập)*
  - 5.3.3 3D Simulation & VR Virtual Physics Laboratory Expansion *(Mở rộng Thí nghiệm ảo 3D và Thực tế ảo VR)*
- **5.4 Concluding Remarks** *(Lời kết)*

---

## 📚 REFERENCES *(Tài liệu Tham khảo)*

## 📎 APPENDICES *(Phụ lục)*

- **Appendix A: User Acceptance Testing (UAT) Questionnaire** *(Phụ lục A: Bảng câu hỏi Kiểm thử UAT)*
- **Appendix B: Functional Requirements Traceability Matrix** *(Phụ lục B: Bảng Ma trận Truy vết Yêu cầu Chức năng)*
- **Appendix C: Database Schema Specifications and API Endpoints Catalog** *(Phụ lục C: Đặc tả CSDL Supabase và Danh mục API Endpoints)*
- **Appendix D: Complete 29 Behavioral Sequence Diagrams Catalog** *(Phụ lục D: Tập hợp 29 Sơ đồ Trình tự Chi tiết)*

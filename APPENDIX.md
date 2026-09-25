# APPENDICES

---

## APPENDIX A: USER ACCEPTANCE TESTING (UAT) QUESTIONNAIRE

### A.1 Participant Demographic Profile
The User Acceptance Testing (UAT) cohort consisted of **50 High School Students** (Grades 7–12) and **10 Physics Teachers**. Survey responses were collected via a structured online feedback questionnaire using a 5-point Likert scale (1 = Strongly Disagree, 5 = Strongly Agree).

### A.2 UAT Survey Questionnaire Form

> [!NOTE]
> **[INSERT TABLE DATA HERE]**  
> **Table A.1**: User Acceptance Testing (UAT) Standardized Evaluation Questionnaire.

| Section ID | Evaluation Question | Measurement Focus | Likert Options |
| :---: | :--- | :--- | :---: |
| **Q1** | The interface design is modern, visually engaging, and easy to navigate. | UI/UX Aesthetics | 1 - 5 |
| **Q2** | The HTML5 virtual laboratory simulations run smoothly with responsive controls. | Virtual Lab Usability | 1 - 5 |
| **Q3** | Real-time PK Battle matches enhance your motivation to learn physics. | Gamification Value | 1 - 5 |
| **Q4** | Page transitions and real-time chat messages load instantly without noticeable delay. | Performance & Latency | 1 - 5 |
| **Q5** | The interactive theory and formulas provide effective support for physics study. | Pedagogical Value | 1 - 5 |

---

## APPENDIX B: FUNCTIONAL REQUIREMENTS TRACEABILITY MATRIX

### B.1 Complete 29-Use Case Traceability Matrix

> [!NOTE]
> **[INSERT TABLE DATA HERE]**  
> **Table B.1**: Full Requirements Traceability Matrix (UC01 - UC29).

| Subsystem | Use Case ID | Use Case Name | Primary Actor | Associated Database Tables |
| :--- | :---: | :--- | :--- | :--- |
| **Auth & Profile** | **UC01** | Browse System Overview | Guest | N/A |
| **Auth & Profile** | **UC02** | User Authentication & Login | Guest / Student | `profiles` |
| **Auth & Profile** | **UC03** | Manage Profile & Avatars | Student / Teacher | `profiles` |
| **Auth & Profile** | **UC04** | Submit Teacher Credentials | Candidate Teacher | `teacher_applications` |
| **Auth & Profile** | **UC05** | Diagnostic Placement Assessment | Student | `placement_tests` |
| **Learning** | **UC06** | Browse Physics Lectures Catalog | Student / Teacher | `lessons` |
| **Learning** | **UC07** | Read Interactive Theory & Summaries | Student | `lessons` |
| **Learning** | **UC08** | Take End-of-Lesson Quiz | Student | `quiz_attempts` |
| **Virtual Lab** | **UC09** | Access Virtual Laboratory Hub | Student / Teacher | `experiments` |
| **Virtual Lab** | **UC10** | Perform Simple Pendulum Simulation | Student / Teacher | `experiments` |
| **Virtual Lab** | **UC11** | Perform Ohm's Law Circuit Simulation | Student / Teacher | `experiments` |
| **Virtual Lab** | **UC12** | Perform Free Fall Motion Simulation | Student / Teacher | `experiments` |
| **Physics Tools**| **UC13** | Use Formula Solver & Constants Converter | Student / Teacher | N/A |
| **PK Arena** | **UC14** | Join Matchmaking Queue | Student | `battles` |
| **PK Arena** | **UC15** | Participate in Synchronous PK Match | Student | `battles`, `user_scores` |
| **PK Arena** | **UC16** | View Global XP Leaderboard | Guest / Student | `user_scores` |
| **Support** | **UC17** | Read User Guide & FAQs | Guest / Student | `faqs` |
| **Support** | **UC18** | Send Support Chat Message | Student / Teacher | `support_messages` |
| **Teacher Panel**| **UC19** | Manage Virtual Class Roster | Teacher | `classes`, `class_members` |
| **Teacher Panel**| **UC20** | Issue Physics Assignments | Teacher | `class_assignments` |
| **Teacher Panel**| **UC21** | Access Teaching Materials Repository | Teacher | `teaching_materials` |
| **Teacher Panel**| **UC22** | Submit Teacher Priority Ticket | Teacher | `support_messages` |
| **Admin Panel** | **UC23** | Admin Console Authentication | Admin | `profiles` |
| **Admin Panel** | **UC24** | View Analytics Dashboard | Admin | System Aggregates |
| **Admin Panel** | **UC25** | Approve / Reject Teacher Applications | Admin | `teacher_applications`, `profiles` |
| **Admin Panel** | **UC26** | Manage Physics Lessons CRUD | Admin | `lessons` |
| **Admin Panel** | **UC27** | Manage System Materials Resources | Admin | `teaching_materials` |
| **Admin Panel** | **UC28** | Resolve Real-Time Support Tickets | Admin | `support_messages` |
| **Admin Panel** | **UC29** | Toggle Maintenance Mode | Admin | `system_settings` |

---

## APPENDIX C: DATABASE SCHEMA SPECIFICATIONS AND API ENDPOINTS CATALOG

### C.1 Catalog of 20 Supabase PostgreSQL Relational Tables
1. `profiles`: User account profiles, XP totals, and role access permissions (`student`, `teacher`, `admin`).
2. `teacher_applications`: Submission records for candidate teacher diploma reviews (`pending`, `approved`, `rejected`).
3. `battles`: PK Arena battle room records, player scores, and victory timestamps.
4. `support_messages`: Bi-directional support messaging tickets and read status flags.
5. `lessons`: Grade 7–12 physics curriculum content, rich HTML theory text, and unit metadata.
6. `questions`: Physics quiz question payloads, choices, correct options, and formula parameters.
7. `experiments`: Virtual laboratory simulation metadata and initial differential parameters.
8. `classes`: Teacher-created virtual classroom rosters and enrollment join codes.
9. `class_members`: Junction table mapping enrolled students to virtual classroom IDs.
10. `class_assignments`: Physics homework assignments and submission deadlines.
11. `class_announcements`: Virtual class announcements and discussion board posts.
12. `class_discussions`: Interactive classroom discussion threads between students and teachers.
13. `class_meetings`: Virtual video meeting room links and schedule timestamps.
14. `quiz_attempts`: Student quiz scoring logs, time spent, and performance analytics.
15. `placement_tests`: Diagnostic placement assessment scores and recommended grade enrollments.
16. `user_scores`: Aggregated XP leaderboard rankings and achievement badges.
17. `user_progress`: Student lesson completion tracking and grade level progress bars.
18. `teaching_materials`: Resource repository files, lecture slides, and formula sheets for teachers.
19. `faqs`: Help desk frequently asked questions and system documentation articles.
20. `system_settings`: Platform-wide configuration flags (e.g., Maintenance Mode toggle).

### C.2 Primary Backend REST API Endpoints Catalog

> [!NOTE]
> **[INSERT TABLE DATA HERE]**  
> **Table C.1**: Primary Express.js REST API Endpoints Specifications.

| Endpoint URI | HTTP Method | Access Level | Description & Payload |
| :--- | :---: | :---: | :--- |
| `/api/auth/login` | `POST` | Public | Authenticates credentials, returns JWT token & user profile |
| `/api/leaderboard` | `GET` | Public | Fetches top-ranked student XP records for leaderboard |
| `/api/teacher-application` | `POST` | Student | Uploads diploma file URL & creates application record |
| `/api/admin/teacher-applications` | `GET` | Admin | Retrieves pending teacher applications list |
| `/api/admin/approve-teacher` | `POST` | Admin | Updates user role to `teacher` & marks application `approved` |
| `/api/admin/feedback` | `GET` / `POST` | Admin | Manages real-time support message threads and replies |
| `/api/settings` | `GET` / `POST` | Admin | Retrieves & updates global Maintenance Mode state |

---

## APPENDIX D: COMPLETE BEHAVIORAL SEQUENCE DIAGRAMS CATALOG

### D.1 Overview of Behavioral Sequence Diagrams Catalog
The primary four core sequence diagrams covering high-complexity workflows are integrated into Chapter 3 (`Figure 3.9` through `Figure 3.12`). The remaining 22 sequence diagrams detailing sub-module interactions across all functional Use Cases are cataloged below:

---

### D.2 Catalog of 22 Auxiliary Behavioral Sequence Diagrams

#### 1. UC01: Browse System Overview Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC01 VÀO ĐÂY]**  
> **Figure D.1**: Sequence Diagram - UC01: Browse System Overview Flow.

#### 2. UC03: User Profile & Avatar Management Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC03 VÀO ĐÂY]**  
> **Figure D.2**: Sequence Diagram - UC03: User Profile & Avatar Management Flow.

#### 3. UC05: Placement Assessment Test Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC05 VÀO ĐÂY]**  
> **Figure D.3**: Sequence Diagram - UC05: Placement Assessment Test Flow.

#### 4. UC06: Browse Physics Lectures Catalog Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC06 VÀO ĐÂY]**  
> **Figure D.4**: Sequence Diagram - UC06: Browse Physics Lectures Catalog Flow.

#### 5. UC07: Interactive Theory Reader Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC07 VÀO ĐÂY]**  
> **Figure D.5**: Sequence Diagram - UC07: Interactive Theory Reader Flow.

#### 6. UC08: End-of-Lesson Quiz Attempt Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC08 VÀO ĐÂY]**  
> **Figure D.6**: Sequence Diagram - UC08: End-of-Lesson Quiz Attempt Flow.

#### 7. UC09: Virtual Laboratory Hub Navigation Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC09 VÀO ĐÂY]**  
> **Figure D.7**: Sequence Diagram - UC09: Virtual Laboratory Hub Navigation Flow.

#### 8. UC10: Simple Pendulum Simulation Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC10 VÀO ĐÂY]**  
> **Figure D.8**: Sequence Diagram - UC10: Simple Pendulum Simulation Flow.

#### 9. UC11: Ohm's Law Circuit Simulation Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC11 VÀO ĐÂY]**  
> **Figure D.9**: Sequence Diagram - UC11: Ohm's Law Circuit Simulation Flow.

#### 10. UC12: Free Fall Motion Simulation Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC12 VÀO ĐÂY]**  
> **Figure D.10**: Sequence Diagram - UC12: Free Fall Motion Simulation Flow.

#### 11. UC13: Physics Utilities & Formula Converter Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC13 VÀO ĐÂY]**  
> **Figure D.11**: Sequence Diagram - UC13: Physics Utilities & Formula Converter Flow.

#### 12. UC16: Global XP Leaderboard Retrieval Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC16 VÀO ĐÂY]**  
> **Figure D.12**: Sequence Diagram - UC16: Global XP Leaderboard Retrieval Flow.

#### 13. UC17: User Guide & FAQs Reading Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC17 VÀO ĐÂY]**  
> **Figure D.13**: Sequence Diagram - UC17: User Guide & FAQs Reading Flow.

#### 14. UC18: Student Support Message Transmission Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC18 VÀO ĐÂY]**  
> **Figure D.14**: Sequence Diagram - UC18: Student Support Message Transmission Flow.

#### 15. UC20: Teacher Assignment Creation Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC20 VÀO ĐÂY]**  
> **Figure D.15**: Sequence Diagram - UC20: Teacher Assignment Creation Flow.

#### 16. UC21: Teaching Materials Resource Access Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC21 VÀO ĐÂY]**  
> **Figure D.16**: Sequence Diagram - UC21: Teaching Materials Resource Access Flow.

#### 17. UC22: Teacher Priority Ticket Submission Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC22 VÀO ĐÂY]**  
> **Figure D.17**: Sequence Diagram - UC22: Teacher Priority Ticket Submission Flow.

#### 18. UC23: System Administrator Authentication Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC23 VÀO ĐÂY]**  
> **Figure D.18**: Sequence Diagram - UC23: System Administrator Authentication Flow.

#### 19. UC24: System Analytics Dashboard Loading Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC24 VÀO ĐÂY]**  
> **Figure D.19**: Sequence Diagram - UC24: System Analytics Dashboard Loading Flow.

#### 20. UC26: Physics Lessons Content CRUD Management Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC26 VÀO ĐÂY]**  
> **Figure D.20**: Sequence Diagram - UC26: Physics Lessons Content CRUD Management Flow.

#### 21. UC27: Educational Materials Management Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC27 VÀO ĐÂY]**  
> **Figure D.21**: Sequence Diagram - UC27: Educational Materials Management Flow.

#### 22. UC29: System Maintenance Mode Configuration Flow
👉 **[DÁN HÌNH SƠ ĐỒ TRÌNH TỰ UC29 VÀO ĐÂY]**  
> **Figure D.22**: Sequence Diagram - UC29: System Maintenance Mode Configuration Flow.

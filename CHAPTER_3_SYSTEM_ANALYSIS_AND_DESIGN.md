# CHAPTER 3: SYSTEM ANALYSIS AND DESIGN

---

## 3.1 REQUIREMENTS ANALYSIS

### 3.1.1 Stakeholders Analysis
Four primary actors govern system operations as documented in Table 3.1 below:

> [!NOTE]
> **[INSERT TABLE DATA HERE]**  
> **Table 3.1**: Stakeholders and User Roles Access Permission Matrix.

| Actor / Stakeholder Role | Access Scope | Operational Responsibilities | Primary Interface Access |
| :--- | :--- | :--- | :--- |
| **Guest (Visitor)** | Public Unauthenticated | Browses landing page, views grade lecture catalogs, reads FAQs, registers/logins. | Public Portal, Auth Views |
| **Student (Learner)** | Authenticated Learner | Studies lectures, takes placement tests, runs Canvas labs, plays PK battles, views leaderboards. | Student Workspace (`/vatly`, `/pk`) |
| **Teacher (Educator)** | Verified Educator | Manages virtual classes, tracks student rosters, accesses curated pedagogical repositories. | Teacher Console (`/teacher`) |
| **Administrator (Admin)** | Super-User Governance | Oversees analytics, approves teacher applications, resolves support tickets, toggles maintenance. | Admin Console (`/admin`) |

---

### 3.1.2 Functional Requirements (29 Detailed Use Cases)
Table 3.2 below presents the functional requirements traceability matrix mapping all 29 Use Cases across system actors:

> [!NOTE]
> **[INSERT TABLE DATA HERE]**  
> **Table 3.2**: System Functional Requirements Traceability Matrix (29 Use Cases).

| Use Case ID | Use Case Name | Primary Actor | Functional Description Summary |
| :---: | :--- | :--- | :--- |
| **UC01** | Register Account | Guest | Registers a new user account via Email, Password, and Full Name. |
| **UC02** | Login / Logout | All Users | Authenticates users securely via Supabase Auth Gateway and manages sessions. |
| **UC03** | Manage Profile & Avatar | Student, Teacher | Updates personal bio details, changes avatar image, and modifies passwords. |
| **UC04** | Apply for Teacher Role | Student | Uploads degree certificates to request account elevation to Teacher status. |
| **UC05** | View Grade Lectures | Guest, Student | Browses curated physics lecture catalogs categorized by Grades 7 through 12. |
| **UC06** | Study Interactive Lesson | Student | Consumes rich interactive theory content and core formula summaries. |
| **UC07** | Take Placement Test | Student | Completes diagnostic placement assessments to evaluate physics proficiency. |
| **UC08** | View Enrolled Classes | Student | Displays the roster of virtual classrooms in which the student is enrolled. |
| **UC09** | Access Virtual Lab Hub | Student | Enters the virtual physics laboratory hub to select experiment topics. |
| **UC10** | Perform Virtual Experiments| Student | Interacts with HTML5 Canvas simulations (Simple Pendulum, Ohm's Law...). |
| **UC11** | Use Physics Calculator | Student | Computes physics formula outputs automatically based on user parameters. |
| **UC12** | Lookup Physical Constants | Student | Queries standard international physical constants and scientific values. |
| **UC13** | Convert Physical Units | Student | Converts measurement units across length, mass, force, pressure, and energy. |
| **UC14** | Matchmaking Lobby | Student | Joins automated real-time queues to pair against online opponents for PK battles. |
| **UC15** | PK Battle & Results | Student | Competes in synchronous PK quizzes with live score sync and XP awards. |
| **UC16** | Play Balance Game | Student | Engages in gamified force-balance physics mini-game challenges. |
| **UC17** | View XP Leaderboard | Student | Displays global top-ranked students based on accumulated XP points. |
| **UC18** | Read User Guide & FAQ | Guest, Student | Accesses platform user guides, system documentation, and FAQs. |
| **UC19** | Send Support Message | Student | Transmits real-time support messaging tickets to system administrators. |
| **UC20** | Manage Teacher Classes | Teacher | Creates virtual classrooms, invites students, and monitors progress statistics. |
| **UC21** | Browse Learning Materials| Teacher | Accesses and downloads curated physics exam papers and pedagogical resources. |
| **UC22** | Send Teacher Support Ticket| Teacher | Submits priority technical support tickets reserved for verified teachers. |
| **UC23** | Admin Login | Admin | Authenticates system administrators into the private administrative console. |
| **UC24** | View System Analytics | Admin | Monitors system health metrics, active user counts, and platform statistics. |
| **UC25** | Approve Teachers & Users | Admin | Evaluates teacher applications and manages user account active/banned status. |
| **UC26** | Manage Lessons Content | Admin | Performs CRUD operations on physics lecture curriculum data repositories. |
| **UC27** | Manage Materials Resources| Admin | Manages exam repositories, question banks, and learning resource files. |
| **UC28** | Resolve Support Messages | Admin | Responds to incoming student and teacher support tickets in real-time. |
| **UC29** | Maintenance & Settings | Admin | Configures global platform parameters and toggles System Maintenance Mode. |

---

### 3.1.3 Non-Functional Requirements: Security, Performance, Scalability, Responsiveness
- **Security**: JWT session tokens, Bcrypt password hashing, and PostgreSQL Row Level Security (RLS).
- **Performance**: Frontend load latency < 1.5s, WebSocket state sync < 200ms, and Canvas rendering at 60 FPS.
- **Scalability**: Serverless Vercel deployment paired with Supabase Cloud targeting 1,000 concurrent sessions and 99.8% availability.
- **Responsiveness**: Mobile, tablet, and desktop layout adaptation featuring Dark/Light Glassmorphism UI styling.

---

### 3.1.4 System Constraints
- **Browser Compatibility**: Requires modern ECMAScript 6+ and HTML5 Canvas API support.
- **Network Dependence**: Active Internet connection mandatory for real-time matchmaking, chat, and data sync.

---

## 3.2 FUNCTIONAL DECOMPOSITION DIAGRAM (FDD)

### 3.2.1 Overview of 8 Functional Subsystems
The functional decomposition of the platform into eight modular subsystems is illustrated in Figure 3.1 below:

> [!IMPORTANT]
> **[INSERT DIAGRAM HERE]**  
> **Figure 3.1**: Functional Decomposition Diagram (FDD) of Eureka Physics Platform.

---

### 3.2.2 Subsystem Decomposition: Auth, Lessons, Virtual Lab, Tools, PK Arena, Support, Teacher Panel, Admin Panel
Functional capabilities are distributed across eight core subsystems:
1. **Authentication & Profile**: Account registration, JWT sessions, user profiles, and teacher credential uploads.
2. **Core Learning**: Lecture catalogs (Grades 7-12), interactive theory viewers, and diagnostic placement tests.
3. **Virtual Laboratory**: HTML5 Canvas 2D simulation engine for experiments (Pendulum, Ohm's Law, Free Fall).
4. **Physics Utilities**: Parameter-driven formula solvers, physical constant lookups, and unit converters.
5. **PK Battle Arena & Gamification**: Matchmaking queues, live score WebSocket broadcasts, XP engine, and leaderboards.
6. **Support & Real-Time Messaging**: Bi-directional messaging channels connecting users and administrators.
7. **Teacher Management**: Virtual class creation, student progress tracking, and learning material downloads.
8. **System Administration**: Analytics dashboard, teacher approvals, curriculum CRUD, chat resolution, and maintenance controls.

---

## 3.3 USE CASE MODELING

### 3.3.1 Global System Use Case Diagram
Figure 3.2 below demonstrates the global system use case model connecting all four primary actors across 29 functional use cases:

> [!IMPORTANT]
> **[INSERT DIAGRAM HERE]**  
> **Figure 3.2**: Global System Use Case Diagram (UC01 - UC29).

---

### 3.3.2 Guest Actor Use Case Diagram
The detailed Use Case diagram for the Guest actor is depicted in Figure 3.3 below, highlighting unauthenticated interaction workflows (UC01, UC02, UC05, UC18):

> [!IMPORTANT]
> **[INSERT DIAGRAM HERE]**  
> **Figure 3.3**: Detailed Use Case Diagram for Guest Actor.

---

### 3.3.3 Student Actor Use Case Diagram
Figure 3.4 below illustrates the functional scope of the Student actor across core learning, virtual lab, physics tools, PK arena, and support messaging modules (UC02-UC19):

> [!IMPORTANT]
> **[INSERT DIAGRAM HERE]**  
> **Figure 3.4**: Detailed Use Case Diagram for Student Actor.

---

### 3.3.4 Teacher Actor Use Case Diagram
The operational workflows allocated to the Teacher actor are presented in Figure 3.5 below, covering classroom management, resources, and support ticketing (UC20-UC22):

> [!IMPORTANT]
> **[INSERT DIAGRAM HERE]**  
> **Figure 3.5**: Detailed Use Case Diagram for Teacher Actor.

---

### 3.3.5 Admin Actor Use Case Diagram
Figure 3.6 below depicts the administrative management and governance capabilities assigned to the System Administrator actor (UC23-UC29):

> [!IMPORTANT]
> **[INSERT DIAGRAM HERE]**  
> **Figure 3.6**: Detailed Use Case Diagram for System Administrator Actor.

---

### 3.3.6 Primary Use Case Specifications
Detailed operational specifications for core high-impact Use Cases are documented in Table 3.3 and Table 3.4 below:

> [!NOTE]
> **[INSERT TABLE DATA HERE]**  
> **Table 3.3**: Primary Use Case Specification - UC15: Real-Time PK Battle & Results.

| Specification Field | Operational Description Details |
| :--- | :--- |
| **Use Case Name** | **UC15 - Real-Time PK Battle & Results** |
| **Primary Actors** | Student A (Host), Student B (Opponent) |
| **Pre-Conditions** | Both students connected to active WebSocket room channel (`pk_room_{id}`). |
| **Main Flow** | 1. Room initializes and broadcasts synchronized question payload to both clients.<br>2. Students submit answer choices over WebSocket Channel.<br>3. System updates live scores based on response speed and correctness.<br>4. Room broadcasts `finish_game` after question 10, records result in `battles`, and awards XP to `profiles`. |
| **Alternative Flow** | Premature disconnect flags forfeit victory for the remaining player. |
| **Post-Conditions** | Battle summary rendered on UI, XP credited to winner, battle history persisted. |

---

> [!NOTE]
> **[INSERT TABLE DATA HERE]**  
> **Table 3.4**: Primary Use Case Specification - UC25: Approve Teachers & Manage Users.

| Specification Field | Operational Description Details |
| :--- | :--- |
| **Use Case Name** | **UC25 - Approve Teachers & Manage Users** |
| **Primary Actor** | System Administrator |
| **Pre-Conditions** | Administrator authenticated with `admin` role privileges (`UC23`). |
| **Main Flow** | 1. Admin opens Teacher Approvals panel on Admin Console.<br>2. System fetches pending applications from `teacher_applications` table.<br>3. Admin reviews degree diploma file stored in Supabase Storage.<br>4. Admin clicks "Approve", updating `status = 'approved'` and `profiles.role = 'teacher'`. |
| **Alternative Flow** | Admin clicks "Reject" for invalid credentials, recording rejection reason. |
| **Post-Conditions** | User account role elevated to `teacher`, application status set to `approved`. |

---

## 3.4 SYSTEM ARCHITECTURE DESIGN

### 3.4.1 3-Tier Architectural Pattern
The 3-tier architectural topology of the Eureka Physics Platform is illustrated in Figure 3.7 below:

> [!IMPORTANT]
> **[INSERT DIAGRAM HERE]**  
> **Figure 3.7**: 3-Tier System Architecture Diagram of Eureka Physics Platform.

---

### 3.4.2 Presentation Layer and State Management Contexts
The Presentation Layer is built as a single-page application (SPA) using React 18, Vite, and Tailwind CSS. Client-side state management is organized via React Context API providers:
- `AuthContext`: Manages active user authentication state, JWT session tokens, user profile metadata, and role-based route guards (`student`, `teacher`, `admin`).
- `RealtimeContext`: Controls the lifecycle of Supabase Realtime WebSocket socket channels, room subscriptions (`pk_room_{id}`), and live message state buffers.

---

### 3.4.3 Application & Middleware Server Layer
The Application Server layer is powered by Node.js and Express.js RESTful API endpoints (`api/index.js`). Core responsibilities include processing analytical query aggregation, handling complex formula evaluations, enforcing business rules, and protecting private routes via custom JWT verification middleware (`verifyToken`).

---

### 3.4.4 Database & Supabase BaaS Infrastructure Layer
The infrastructure layer relies on Supabase Backend-as-a-Service (BaaS) running on cloud infrastructure:
- **Managed PostgreSQL 15**: Relational database storage enforcing ACID compliance and schema integrity.
- **Supabase Auth Gateway**: Identity service handling signup, signin, password hashing, and token issuance.
- **Supabase Object Storage**: File storage buckets storing uploaded teacher diploma credentials (`degree_url`) and user avatars.

---

### 3.4.5 Real-time Communication Mechanism via WebSockets Channels
Real-time bi-directional messaging is driven by Supabase Realtime WebSocket channels:
- **PK Arena Channels**: Broadcast live player answers, score updates, and battle termination events across connected clients with sub-150ms latency.
- **Support Chat Channels**: Enable instant message transmission between students/teachers and system administrators without page refreshes.

---

## 3.5 DATABASE DESIGN

### 3.5.1 Supabase PostgreSQL Database Overview
The database layer of the Eureka Physics Platform is engineered on a cloud-hosted Supabase PostgreSQL 15 relational instance. The schema adheres strictly to Third Normal Form (3NF) principles, mitigating data redundancy while enforcing ACID compliance across transactional operations. Security policies are natively integrated via PostgreSQL Row Level Security (RLS) policies.

---

### 3.5.2 Complete Catalog of 20 Database Tables
The structural database specifications for the primary entity tables are detailed in Tables 3.5 through 3.8 below:

> [!NOTE]
> **[INSERT TABLE DATA HERE]**  
> **Table 3.5**: Database Schema Specification - `profiles` Table.

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :---: | :--- |
| `id` | `UUID` | PK, FK | References `auth.users.id` (ON DELETE CASCADE) |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | User account email address |
| `full_name` | `VARCHAR(255)` | NOT NULL | User display name |
| `avatar_url` | `TEXT` | NULLABLE | Storage URL for profile avatar image |
| `role` | `VARCHAR(50)` | DEFAULT `'student'` | Access role (`'student'`, `'teacher'`, `'admin'`) |
| `xp` | `INTEGER` | DEFAULT `0` | Accumulated experience points |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Account creation timestamp |

---

> [!NOTE]
> **[INSERT TABLE DATA HERE]**  
> **Table 3.6**: Database Schema Specification - `teacher_applications` Table.

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :---: | :--- |
| `id` | `UUID` | PK | Primary key UUID |
| `user_id` | `UUID` | FK | References `profiles.id` |
| `degree_url` | `TEXT` | NOT NULL | Supabase Storage URL for diploma file |
| `status` | `VARCHAR(50)` | DEFAULT `'pending'` | State (`'pending'`, `'approved'`, `'rejected'`) |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Application submission timestamp |

---

> [!NOTE]
> **[INSERT TABLE DATA HERE]**  
> **Table 3.7**: Database Schema Specification - `battles` Table.

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :---: | :--- |
| `id` | `UUID` | PK | Primary key UUID |
| `player1_id` | `UUID` | FK | References `profiles.id` (Player 1) |
| `player2_id` | `UUID` | FK | References `profiles.id` (Player 2) |
| `winner_id` | `UUID` | FK | References `profiles.id` (Winner) |
| `player1_score`| `INTEGER` | DEFAULT `0` | Score achieved by Player 1 |
| `player2_score`| `INTEGER` | DEFAULT `0` | Score achieved by Player 2 |
| `status` | `VARCHAR(50)` | DEFAULT `'ongoing'` | Battle status (`'ongoing'`, `'finished'`) |

---

> [!NOTE]
> **[INSERT TABLE DATA HERE]**  
> **Table 3.8**: Database Schema Specification - `support_messages` Table.

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :---: | :--- |
| `id` | `UUID` | PK | Primary key UUID |
| `sender_id` | `UUID` | FK | References `profiles.id` |
| `receiver_id` | `UUID` | FK | References `profiles.id` |
| `message` | `TEXT` | NOT NULL | Support ticket message content |
| `is_read` | `BOOLEAN` | DEFAULT `FALSE` | Message read status flag |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Message dispatch timestamp |

*(The remaining 16 database tables—including `lessons`, `classes`, `questions`, `experiments`, and `leaderboard_cache`—are detailed in Appendix E).*

---

### 3.5.3 Entity Relationships and Integrity Constraints
Referential integrity across the 20 database entities is enforced through primary key (PK) and foreign key (FK) constraints:
- **One-to-One (1:1)**: `auth.users` ➔ `profiles` (enforced via shared UUID primary key and `ON DELETE CASCADE`).
- **One-to-Many (1:N)**: `profiles` ➔ `teacher_applications`, `profiles` ➔ `support_messages`, `lessons` ➔ `questions`.
- **Many-to-Many (N:M)**: `students` ➔ `classes` (resolved via `class_enrollments` junction table).

---

### 3.5.4 Entity-Relationship Diagram (ERD 20 Tables)
Figure 3.8 below presents the complete Entity-Relationship Diagram (ERD) mapping relational constraints across all 20 database tables:

> [!IMPORTANT]
> **[INSERT DIAGRAM HERE]**  
> **Figure 3.8**: Entity-Relationship Diagram (ERD 20 Tables Supabase PostgreSQL).

---

## 3.6 BEHAVIORAL SEQUENCE DIAGRAMS DESIGN

### 3.6.1 Authentication and Login Flow Sequence Diagram (UC02)
The behavioral sequence flow for User Authentication and Login (UC02) is depicted in Figure 3.9 below:

> [!IMPORTANT]
> **[INSERT DIAGRAM HERE]**  
> **Figure 3.9**: Sequence Diagram - UC02: User Authentication & Login Flow.

---

### 3.6.2 Teacher Application and Approval Flow Sequence Diagram (UC04 & UC25)
Figure 3.10 below models the sequence flow for Teacher Role Application and Administrative Approval (UC04 & UC25):

> [!IMPORTANT]
> **[INSERT DIAGRAM HERE]**  
> **Figure 3.10**: Sequence Diagram - UC04/UC25: Teacher Role Application & Approval Flow.

---

### 3.6.3 Real-time PK Battle Matchmaking and Arena Flow Sequence Diagram (UC14 & UC15)
The real-time sequence flow for PK Battle Matchmaking and Synchronous Arena Execution (UC14 & UC15) is presented in Figure 3.11 below:

> [!IMPORTANT]
> **[INSERT DIAGRAM HERE]**  
> **Figure 3.11**: Sequence Diagram - UC14/UC15: Real-Time PK Battle Matchmaking & Arena Flow.

---

### 3.6.4 Real-time Support Chat Messaging Flow Sequence Diagram (UC19 & UC28)
Figure 3.12 below illustrates the bi-directional sequence flow for Real-Time Support Chat Messaging (UC19 & UC28):

> [!IMPORTANT]
> **[INSERT DIAGRAM HERE]**  
> **Figure 3.12**: Sequence Diagram - UC19/UC28: Real-Time Support Chat Messaging Flow.

---

### 3.6.5 Overview Catalog of 29 Behavioral Sequence Diagrams (UC01 - UC29)
The four sequence diagrams detailed in Sections 3.6.1 through 3.6.4 represent the core architectural interaction patterns across authentication, administrative workflows, real-time gaming, and WebSocket messaging. To maintain thesis conciseness while providing 100% architectural coverage, the sequence flow diagrams for the remaining 25 Use Cases (UC01, UC03, UC05 through UC13, UC16 through UC18, UC20 through UC24, UC26 through UC27, and UC29) are compiled in Appendix D.

---

## 3.7 STATE MACHINE DIAGRAMS DESIGN

### 3.7.1 Teacher Application Lifecycle State Machine Diagram
The lifecycle state transitions for Teacher Role Applications are modeled in Figure 3.13 below:

> [!IMPORTANT]
> **[INSERT DIAGRAM HERE]**  
> **Figure 3.13**: State Machine Diagram - Teacher Application Lifecycle.

---

### 3.7.2 PK Battle Arena Lifecycle State Machine Diagram
Figure 3.14 below presents the state machine lifecycle governing PK Battle Arena room states:

> [!IMPORTANT]
> **[INSERT DIAGRAM HERE]**  
> **Figure 3.14**: State Machine Diagram - PK Battle Arena Lifecycle.

---

### 3.7.3 System Maintenance Mode Lifecycle State Machine Diagram
The lifecycle state transitions for System Maintenance Mode are depicted in Figure 3.15 below:

> [!IMPORTANT]
> **[INSERT DIAGRAM HERE]**  
> **Figure 3.15**: State Machine Diagram - System Maintenance Mode Lifecycle.

---

### 3.7.4 Overview of Auxiliary State Machines (Account Status, Lesson Progress, Placement Test, Support Ticket, Lab Session)
In addition to the three core state machines modeled in Figures 3.13 through 3.15, the system incorporates five auxiliary state machines to govern entity transitions:
- **Account Status Lifecycle**: `Active` ➔ `Banned` (Admin restriction) ➔ `Active Restored`.
- **Lesson Progress Lifecycle**: `Unstarted` ➔ `In Progress` ➔ `Completed` (XP awarded).
- **Placement Test Lifecycle**: `Not Started` ➔ `Testing` ➔ `Evaluated` (Grade level recommendation assigned).
- **Support Ticket Lifecycle**: `Open` ➔ `Pending Admin Response` ➔ `Resolved` / `Closed`.
- **Virtual Lab Session Lifecycle**: `Initialized` ➔ `Simulating` ➔ `Reset / Terminated`.

---

### 3.8.1 Password Hashing and Session Token Management
Security compliance for authentication and session management is implemented through cryptographic standards:
- **Password Encryption**: User passwords are never stored in plaintext. Passwords are hashed using the Bcrypt salted hashing algorithm (work factor salt = 10) managed natively by the Supabase Auth Gateway.
- **JWT Session Tokens**: Upon authentication, the client receives a JSON Web Token (JWT) containing cryptographically signed payload claims (User ID, Role, Token Expiry).
- **Session Lifecycle**: Tokens are assigned a 24-hour expiration window with automated refresh token rotation, stored securely in HTTP-only cookies to prevent Cross-Site Scripting (XSS) token theft.

---

### 3.8.2 Role-Based Access Control (RBAC)
User authorization adheres to a strict three-tier Role-Based Access Control (RBAC) model across four primary actors (`Guest`, `Student`, `Teacher`, `Admin`):
- **Frontend Route Protection**: Client-side navigation is governed by higher-order `ProtectedRoute` components in React Router, evaluating `AuthContext` role states before rendering protected routes (`/vatly`, `/teacher`, `/admin`).
- **Database Row Level Security (RLS)**: PostgreSQL tables employ explicit RLS policies (`CREATE POLICY`) ensuring users can only read or mutate records matching their authenticated UUID (`auth.uid() = user_id`).
- **Administrative Privileges**: Administrative actions (such as teacher approvals in `UC25` or curriculum modifications in `UC26`) require explicit `role = 'admin'` claims validated at both API and database layers.

---

### 3.8.3 API Endpoint Protection and Security Keys Management
Backend infrastructure enforcement isolates sensitive operations and credentials:
- **API Middleware Guards**: Express.js REST routes (`api/index.js`) enforce custom `verifyToken` middleware, intercepting incoming HTTP requests to validate JWT signatures before executing business logic.
- **CORS & Rate Limiting**: Cross-Origin Resource Sharing (CORS) is locked strictly to trusted application origins, combined with middleware rate-limiting to prevent brute-force login attempts and denial-of-service (DDoS) exploitation.
- **Environment Variables**: Sensitive secret keys (Supabase Service Role Keys, Database Connection Strings, JWT Secret Keys) are isolated in server-side environment configurations (`.env`), ensuring private keys are never exposed in compiled frontend client bundles.

---

## 3.9 CHAPTER SUMMARY
Chapter 3 has presented a comprehensive technical analysis and system design specification for the Eureka Physics Platform. Key accomplishments established in this chapter include:
1. **Requirements Specification**: Detailed stakeholder role definitions and a 29-Use Case traceability matrix bridging functional requirements with non-functional constraints.
2. **Functional Decomposition**: Modular breakdown of platform features into eight core subsystems (Auth, Lessons, Virtual Lab, Tools, PK Arena, Support, Teacher Panel, Admin Panel).
3. **Behavioral & Structural Modeling**: Architectural representation incorporating global/actor-specific Use Case diagrams, 3-Tier System Topology, a normalized 20-table PostgreSQL Entity-Relationship Diagram (ERD), behavioral Sequence Diagrams, and State Machine Lifecycles.
4. **Security Architecture**: Multi-layered security design incorporating Bcrypt password hashing, JWT session rotation, React Router RBAC guards, and PostgreSQL Row Level Security (RLS) policies.

The architectural blueprints established in Chapter 3 serve as the foundation for physical implementation, module deployment, unit testing, and system evaluation detailed in Chapter 4.

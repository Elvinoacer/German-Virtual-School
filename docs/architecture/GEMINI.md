# **German Virtual School**

## **1\. Vision & Goals**

A secure, scalable virtual school platform for delivering German education online. The system enables live classes with verified attendance, structured courses, fee management, assignments, evaluations, student forums, and end-of-cycle reporting.

---

## **2\. User Roles & Permissions**

### **2.1 Roles**

- **Student** – attends classes, accesses resources, submits assignments, pays fees, participates in forums, receives reports.
- **Teacher** – hosts sessions, uploads resources, creates courses, assignments, evaluations, sets fees, reviews progress.
- **Admin / School Manager** – manages users, compliance, billing rules, reporting templates, and system configuration.

  ### **2.2 Access Control**

- Role-Based Access Control (RBAC)
- ## Course-level permissions (only enrolled students can access content & sessions)

  ## **3\. Core Functional Modules**

  ### **3.1 Authentication & Identity**

- Secure login (email/password, optional SSO)
- Mandatory authentication before joining any live session
- Session validation (user, role, course enrollment, schedule)

  ### **3.2 Virtual Classes & Attendance Tracking**

- Live virtual sessions using third-party video SDKs
- Features:

  - Join only after backend validation
  - Auto check-in/check-out timestamps
  - Active presence tracking (join/leave, duration)
  - Manual teacher override (mark excused/absent)

  ### **3.3 Course Management**

- Teachers can:
  - Create courses (title, description, duration, price)
  - Set free courses with price \= 0
  - Define learning outcomes & modules
- Student tracking:

  - Hours spent per course
  - Progress per module
  - Completion status (Not Started / In Progress / Completed)

  ### **3.4 Learning Resources**

- Teacher uploads:
  - PDFs, videos, DOCX, PPTs, links
- Features:

  - Versioning
  - Access control per course
  - Download & view analytics

  ### **3.5 Assignments & Submissions**

- Teachers can:
  - Create assignments with deadlines
  - Attach resources & grading rubrics
- Students can:
  - Submit files or text
- Tracking:

  - Submitted / Late / Missing
  - Completion status

  ### **3.6 Fees & Billing**

- Teacher-defined fee structure:
  - Monthly, quarterly, custom cycles
  - Fixed duration (e.g., 6 months)
- Billing logic:
  - Current cycle fees visible to students
  - Arrears automatically rolled into next cycle
- Payment tracking:

  - Paid / Partial / Overdue

  ### **3.7 Student Evaluation & Metrics**

- Teacher-defined evaluation metrics:
  - Attendance
  - Assignment performance
  - Participation
  - Language proficiency
- Scoring:

  - Quantitative (scores)
  - Qualitative (comments)

  ### **3.8 Open Forum & Communication**

- Discussion forum with:
  - Public threads
  - Teacher-specific threads
  - Student-to-student threads
- Anonymity options:
  - Anonymous
  - Identified
- Moderation tools for teachers/admins

  ### **3.9 Reporting & Analytics**

- End-of-cycle reports per student:
  - Attendance summary
  - Course progress
  - Assignment completion
  - Teacher evaluations
- Export formats:

  - PDF
  - Dashboard view

  ***

  ## **4\. Non-Functional Requirements**

- Security & data privacy (GDPR-compliant)
- Scalability for concurrent live sessions
- High availability
- ## Audit logs (attendance, grading, payments)

  ## **5\. Technical Architecture**

  ### **5.1 High-Level Architecture**

**Client Layer**

- Web App (Student, Teacher, Admin dashboards)

**Backend Layer**

- API Gateway
- Auth & Identity Service
- Core School Services

**Integration Layer**

- Video Conferencing SDK
- Payment Gateway
- Notification Services

**Data Layer**

- Relational DB
- Object Storage
- ## Analytics Store

  ### **5.2 Frontend Architecture**

- **Framework**: Next.js (App Router)
- **State Management**: React Query \+ Redux Toolkit
- **UI**: Tailwind CSS
- ## **Real-time**: WebSockets for live presence & forums

  ### **5.3 Backend Architecture**

  #### **Core Services**

- **Auth Service**
  - JWT / Session tokens
  - Role & permission checks
- **Classroom Service**
  - Session scheduling
  - Attendance tracking
- **Course & Content Service**
  - Courses, modules, resources
- **Assignment & Evaluation Service**
  - Submissions
  - Grading
  - Evaluations
- **Billing Service**
  - Fee cycles
  - Arrears calculation
  - Payment reconciliation
- **Reporting Service**

  - Aggregates data
  - Generates reports

  ***

  ### **5.4 Video Session Flow (Secure Join)**

1. User logs in
2. Frontend requests session token
3. Backend validates:
   - User role
   - Course enrollment
   - Schedule
4. Backend issues short-lived meeting token
5. Client joins video session
6. ## Attendance events streamed to backend

   ### **5.5 Data Storage**

- **PostgreSQL** (via Prisma)
  - Users, roles, courses, fees, attendance
- **Object Storage** (S3-compatible) --for now we will use vercel blob(docs) and cloudinary(images and videos)
  - PDFs, videos, documents
- **Redis**

  - Session state, presence tracking

  ***

  ### **5.6 Third-Party Integrations**

- **Video**: Zoom SDK / Jitsi / Daily / Agora -use JITSI
- **Payments**: Stripe / PayPal (localized options) -just use Intasend
- ## **Notifications**: Email \+ in-app notifications

  ## **6\. Security & Compliance**

- Encrypted file storage
- Short-lived session tokens
- Access logging
- ## GDPR-compliant data handling (important for German context)

  ## **7\. Future Enhancements**

- AI-assisted progress insights
- Automated attendance anomaly detection
- Language proficiency testing
- ## Mobile app support

  ## **8\. Summary**

This architecture supports a fully traceable, secure, and scalable German virtual school with strong accountability across attendance, learning, billing, and evaluation, while remaining flexible for future AI-driven enhancements.

all the pages at PAGES.md file

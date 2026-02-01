# German Virtual School - Comprehensive System Features & Functionality Analysis

This document provides a detailed breakdown of every feature and functionality within the German Virtual School platform. It analyzes the system from the perspective of its three core user roles—**Student**, **Teacher**, and **Admin**—and outlines the underlying **System** capabilities that power the platform.

For each feature, we detail its functionality and its strategic importance to the relevant stakeholders.

---

## 1. System-Wide Core Features
These features form the backbone of the platform, ensuring security, scalability, and seamless operation for all users.

### 1.1 Authentication & Identity (NextAuth.js)
*   **Functionality**: 
    *   Secure login via Email/Password.
    *   Role-Based Access Control (RBAC) automatically routing users to their specific dashboards (Student, Teacher, Admin).
    *   Short-lived session tokens for enhanced security.
    *   Email verification flows with resend capability.
    *   Password reset with secure token-based recovery.
    *   Automatic session refresh for seamless user experience.
*   **Importance**:
    *   **All Roles**: Ensures data privacy and that users only access what they are authorized to see. Critical for GDPR compliance.

### 1.2 Notification Orchestrator (Multi-Channel)
*   **Functionality**:
    *   **In-App Notifications**: Real-time alerts visible within the dashboard.
    *   **Email Notifications**: Templated emails via Resend for class reminders, grade updates, payment confirmations, and forum replies.
    *   **Push Notifications**: Firebase Cloud Messaging (FCM) for mobile/browser push alerts.
    *   **User-Configurable Preferences**: Individual opt-in/opt-out per channel (Email, Push, In-App) and per category (Class Reminders, Assignment Alerts, Grade Notifications, Message Alerts, Payment Reminders, Forum Updates).
    *   **Event-Driven Triggers**: Automatic notifications for:
        - Class reminders (before scheduled sessions)
        - New assignments posted
        - Grades/Feedback posted
        - Payment due/confirmation
        - Forum replies/new posts
        - Direct messages received
*   **Importance**:
    *   **Student**: Never miss a class, deadline, or important update.
    *   **Teacher**: Instant awareness of submissions, messages, or admin announcements.
    *   **Admin**: System-wide broadcasts for maintenance, announcements, or urgent alerts.

### 1.3 Real-Time Infrastructure (WebSockets/Redis)
*   **Functionality**:
    *   Live presence tracking (who is online).
    *   Instant messaging updates without page refresh.
    *   Real-time notification delivery.
    *   Live attendance tracking during virtual classes.
*   **Importance**:
    *   **Student/Teacher**: Creates a feeling of a "live" campus rather than a static website.

### 1.4 Global Calendar System
*   **Functionality**:
    *   Unified calendar view for all scheduled sessions.
    *   Monthly navigation with visual event indicators.
    *   Session details with quick access (Join button for live sessions).
    *   Color-coded events by status (Scheduled, Live, Completed, Cancelled).
    *   Day-wise event listing for detailed view.
*   **Importance**:
    *   **All Roles**: Central hub for time management and planning.

### 1.5 Direct Messaging System
*   **Functionality**:
    *   **Real-Time Chat**: WebSocket-powered instant messaging.
    *   **Conversations List**: View all active conversations with unread indicators.
    *   **Contact Discovery**: Search and start new conversations with any platform user.
    *   **Read Receipts**: Track message delivery and read status.
    *   **Role Display**: See the role (Student/Teacher/Admin) of conversation partners.
    *   **Avatar Support**: Profile pictures in chat interface.
*   **Importance**:
    *   **Student**: Direct communication with teachers for questions or clarifications.
    *   **Teacher**: Private feedback and communication with individual students.
    *   **Admin**: Direct outreach to any user on the platform.

### 1.6 User Profile Management
*   **Functionality**:
    *   **Profile Page**: View and display personal information, avatar, role, and stats.
    *   **Avatar Upload**: Secure image upload with Cloudinary integration.
    *   **Profile Statistics**: Courses enrolled, attendance rate, and verification status.
    *   **Role-Specific Profiles**:
        - Students: Date of birth, phone number, address, emergency contact.
        - Teachers: Bio, specialization, qualifications, hourly rate, contact details.
*   **Importance**:
    *   **All Roles**: Personalization and professional identity within the platform.

### 1.7 User Settings & Preferences
*   **Functionality**:
    *   **Personal Information Editing**: Update name, contact details, and role-specific fields.
    *   **Notification Preferences**: Granular control over notification channels and categories.
    *   **Account Security**: Password change, session management.
    *   **Profile Visibility**: Control over publicly visible information.
*   **Importance**:
    *   **All Roles**: Customization and control over personal experience.

### 1.8 Dark Mode Support
*   **Functionality**:
    *   System-wide dark/light theme toggle.
    *   Consistent styling across all pages and components.
    *   Automatic detection of system preference.
*   **Importance**:
    *   **All Roles**: Improved accessibility and reduced eye strain during extended use.

---

## 2. Student Features
*Empowering learners with tools for success, engagement, and transparency.*

### 2.1 Learning & Classroom

#### **Student Dashboard**
*   **Functionality**: 
    *   Overview of enrolled courses with progress indicators.
    *   Upcoming sessions with countdown timers.
    *   Quick stats (attendance rate, assignments pending, overall progress).
    *   Recent notifications and announcements.
*   **Importance**: Central command center for daily learning activities.

#### **Live Virtual Classroom (Jitsi Integration)**
*   **Functionality**: 
    *   Secure video conferencing embedded in the app.
    *   Includes hand-raising, screen sharing, and mute controls.
    *   Join permitted only if enrolled and authentication validated.
    *   **Auto Check-In/Check-Out**: Timestamps recorded automatically on join/leave.
    *   **Attendance Logs**: Detailed timestamps of join/leave events for the session.
    *   Participant list visible showing all attendees.
*   **Importance**: The core value proposition. Replicates the physical classroom experience remotely.

#### **Course Dashboard & Progress Tracking**
*   **Functionality**: 
    *   Visual progress bars per course and module.
    *   "Resume Learning" button taking them to the specific resource (video timestamp/PDF page) where they left off.
    *   Module-by-module breakdown of completion status.
    *   Learning outcomes checklist.
*   **Importance**: Enhancing motivation via gamification elements (completion percentages) and helping students manage their study time.

#### **Course Catalog (Public & Enrolled)**
*   **Functionality**: 
    *   Browse published courses with filtering by level (A1-C2).
    *   Course details: description, duration, price, learning outcomes, teacher info.
    *   Enrollment button with seamless onboarding.
    *   Public course preview for prospective students.
*   **Importance**: Discoverability and informed enrollment decisions.

#### **Resource Library Access**
*   **Functionality**: 
    *   Access to PDFs, videos, documents, and external links.
    *   Offline capabilities (downloadable resources) where permitted.
    *   View count and download count tracking.
    *   Version history for updated resources.
    *   Progress tracking per resource (last position for videos).
*   **Importance**: Supports asynchronous learning and revision outside of live hours.

#### **Session Schedule View**
*   **Functionality**: 
    *   List of all scheduled and past sessions for enrolled courses.
    *   Session details: title, description, start/end times, status.
    *   Quick join button for live or upcoming sessions.
    *   Session objectives and homework visibility.
*   **Importance**: Planning and preparation for upcoming classes.

### 2.2 Assignments & Evaluation

#### **Assignment Submission Portal**
*   **Functionality**: 
    *   View all assignments across enrolled courses.
    *   Upload files or type text responses.
    *   View deadlines, rubrics, and status (Pending/Submitted/Late/Graded/Returned).
    *   Attachment support for multiple file uploads.
    *   View teacher feedback and rubric breakdown after grading.
*   **Importance**: Centralizes academic work, removing the chaos of emails.

#### **Gradebook & Grades View**
*   **Functionality**: 
    *   View graded assignments with detailed feedback.
    *   Rubric breakdowns showing per-criterion scores.
    *   Grade trends over time.
    *   Course-wise grade summary.
*   **Importance**: Provides immediate feedback loops, essential for learning improvement.

#### **Student Evaluations View**
*   **Functionality**: 
    *   View detailed evaluations created by teachers.
    *   Quantitative metrics: Attendance Score, Participation Score, Assignment Score, Language Proficiency.
    *   Qualitative feedback: Overall comments and improvement suggestions.
    *   Term-wise evaluation history.
    *   Trend indicators (up/down/flat).
    *   Print/Download evaluation as PDF.
*   **Importance**: Holistic understanding of performance beyond just grades.

#### **Progress Reports View**
*   **Functionality**: 
    *   Comprehensive end-of-term PDF reports.
    *   Attendance summary with visual breakdown (Present/Late/Absent).
    *   Performance metrics and grading summary.
    *   Teacher evaluation notes.
    *   Downloadable PDF generation (client-side with jsPDF).
*   **Importance**: Official documentation for academic progress.

### 2.3 Attendance Management

#### **Attendance History View**
*   **Functionality**: 
    *   View personal attendance log per session.
    *   Status categories: Present, Late, Absent, Excused.
    *   Detailed logs showing check-in/check-out times.
    *   Duration spent in each session.
    *   Attendance percentage calculations with breakdown (Full/Partial/Missing).
    *   Statistics: Total sessions, average attendance, total minutes attended.
    *   Filtering by status category.
*   **Importance**: Helps students track their requirement fulfillment for certification.

### 2.4 Financial & Billing

#### **How Students Are Charged**
*   **Workflow**:
    1.  **Enrollment**: When you join a course, you are automatically registered for the current academic term.
    2.  **Invoicing**: You do **not** pay immediately upon clicking "Enroll". Instead, the system (or Admin) generates a consolidated invoice for the term/course.
    3.  **Notification**: You receive a "Payment Due" notification via Email/Push.
    4.  **Payment**: You pay the invoice via the student portal using Mobile Money (M-Pesa) or Card (Intasend Integration).

#### **Billing Dashboard**
*   **Functionality**: 
    *   View current invoice with amount due.
    *   Payment history showing all past transactions.
    *   Pending balances and arrears visibility.
    *   Invoice breakdown with due dates.
*   **Importance**: Clear, consolidated billing rather than hidden immediate charges. Students know exactly what they owe for the term.

#### **Payment Portal**
*   **Functionality**: 
    *   Secure payment via Mobile Money (M-Pesa) or Card.
    *   Intasend payment gateway integration.
    *   Real-time payment status updates via webhooks.
    *   Payment confirmation notifications.
    *   Receipt generation for completed payments.
*   **Importance**: Convenient, secure payment options with immediate confirmation.

#### **Billing Access Guard**
*   **Functionality**: 
    *   Automatic enforcement of fee compliance.
    *   Students with overdue invoices may have restricted access to certain features.
    *   Visual warnings on payment status.
*   **Importance**: Ensures revenue collection while maintaining transparency.

### 2.5 Social & Community

#### **Student Forums**
*   **Functionality**: 
    *   Participate in course-specific or general threads.
    *   Post questions anonymously if desired.
    *   Thread audiences: Public, Course-Only, Teachers-Only.
    *   Pinned threads for important announcements.
    *   Locked threads for archived discussions.
    *   Nested replies for threaded conversations.
*   **Importance**: Builds a peer-support network, reducing isolation in online learning.

#### **Testimonial Submission**
*   **Functionality**: 
    *   Submit feedback and ratings (1-5 stars) about the learning experience.
    *   Written testimonials for public display.
    *   Moderated by admin before featuring on landing page.
*   **Importance**: Voice in shaping the platform and helping prospective students.

### 2.6 Student Verification

#### **Verification Status Page**
*   **Functionality**: 
    *   View current verification status (Pending/Verified).
    *   Understand what verification unlocks (full access to all features).
*   **Importance**: Transparency about account status and access levels.

---

## 3. Teacher Features
*Tools for efficient course delivery, student management, and academic rigor.*

### 3.1 Course Management

#### **Teacher Dashboard**
*   **Functionality**: 
    *   Overview of all courses created.
    *   Upcoming sessions with quick actions.
    *   Pending assignments to grade.
    *   Recent student submissions.
    *   Quick stats (total students, sessions this week, pending grades).
*   **Importance**: Command center for daily teaching activities.

#### **Course Creator Studio**
*   **Functionality**: 
    *   Create courses with complete details:
        - Title, description, slug (URL-friendly name)
        - Level (A1-C2), duration in weeks, price
        - Thumbnail image upload
        - Learning outcomes definition
    *   Course status management: Draft → Published → Archived.
    *   **Module Management**: Structure content into logical modules with ordering.
    *   **Resource Upload**: Within modules, upload:
        - PDFs, Videos, Documents, Links
        - Bulk upload capabilities
        - Version management for updated resources
        - Download permissions control
*   **Importance**: Gives teachers full pedagogical control over their curriculum structure.

#### **Course Editing & Management**
*   **Functionality**: 
    *   Edit any aspect of existing courses.
    *   Archive courses to hide from public view.
    *   View enrolled students list per course.
    *   Access course-specific analytics.
*   **Importance**: Ongoing curriculum refinement and adaptation.

#### **Live Class Management**
*   **Functionality**: 
    *   Schedule sessions with:
        - Title, description, start/end times
        - Learning objectives
        - Homework assignments
    *   Start/End meetings from the classroom interface.
    *   Manage participant mute states.
    *   **Automatic Attendance Logging**: Based on join/leave events.
    *   Session recording URL storage.
    *   Session status management (Scheduled → Live → Completed/Cancelled).
*   **Importance**: Streamlines the administrative burden of attendance taking, allowing more time for teaching.

### 3.2 Grading & Assessment

#### **Assignment Creation**
*   **Functionality**: 
    *   Create assignments with:
        - Title, description, due date
        - Maximum points
        - Rubric definition (structured grading criteria)
        - Attachment resources for the assignment
    *   Assign to all enrolled students automatically.
*   **Importance**: Standardized assignment distribution.

#### **Rubric Builder & Grading Tool**
*   **Functionality**: 
    *   Distinct criteria for grading (e.g., "Grammar", "Creativity", "Accuracy").
    *   Inline grading of submissions with:
        - Per-criterion score assignment
        - Overall grade calculation
        - Private feedback comments
    *   Submission status management (Pending → Graded → Returned).
    *   View submission timestamps (on-time vs late).
    *   Attachment viewing for student submissions.
*   **Importance**: Ensures objectiveness and consistency in grading. Saves time compared to manual spreadsheet tracking.

#### **Grading Overview Page**
*   **Functionality**: 
    *   List all pending submissions across courses.
    *   Filter by course or assignment.
    *   Bulk actions for efficient grading.
*   **Importance**: Efficient workflow for managing multiple assignments.

#### **Student Evaluation System**
*   **Functionality**: 
    *   Create comprehensive evaluations per student per course:
        - **Quantitative Metrics** (0-100 scale):
            - Attendance Score
            - Participation Score
            - Assignment Score
            - Language Proficiency
        - **Overall Grade** with trend indicator (up/down/flat)
        - **Qualitative Feedback**:
            - Overall comment
            - Improvement suggestions
    *   Link evaluations to academic terms.
    *   Evaluation categories (e.g., "Mid-Term", "Final").
*   **Importance**: Allows for holistic assessment beyond just exam grades, crucial for language learning.

### 3.3 Student Management

#### **Students Directory**
*   **Functionality**: 
    *   List all students enrolled in teacher's courses.
    *   Quick overview: name, email, enrolled courses, overall progress.
    *   Access to individual student profiles.
*   **Importance**: Central roster management.

#### **Student Profile View (Teacher Perspective)**
*   **Functionality**: 
    *   View detailed student information.
    *   Enrollment history and progress across courses.
    *   Update editable student fields (profile updates).
    *   **Teacher Notes**: Private notes on student profiles:
        - e.g., "Student struggles with dative case"
        - Categorized notes (Academic, Behavior, General)
        - Timestamped entries
        - Edit/Delete capabilities
    *   Start direct message with student.
*   **Importance**: Personalizes instruction and helps track behavioral or academic patterns over time.

#### **Session Attendance Management**
*   **Functionality**: 
    *   View attendance for specific sessions.
    *   Manual override capabilities:
        - Mark individual students as Present/Absent/Late/Excused
        - Add attendance notes
    *   View auto-logged check-in/check-out times.
    *   Duration tracking per student.
*   **Importance**: Accuracy in attendance records with teacher discretion.

#### **Forum Moderation**
*   **Functionality**: 
    *   Pin important threads.
    *   Lock heated or concluded discussions.
    *   Answer student queries officially.
    *   Moderate content in course-specific forums.
*   **Importance**: Maintains a healthy, focused learning environment.

### 3.4 Teacher Finance

#### **Fee Plan Management**
*   **Functionality**: 
    *   Create fee plans for courses:
        - Amount, billing cycle (Monthly/Quarterly/Fixed)
        - Installment options
    *   View existing fee plans across courses.
*   **Importance**: Control over course pricing and payment structure.

#### **Teacher Calendar**
*   **Functionality**: 
    *   Personal view of all scheduled sessions.
    *   Color-coded by status.
    *   Quick session creation/editing.
*   **Importance**: Time management and planning.

---

## 4. Admin Features
*Operational control, oversight, and strategic business management.*

### 4.1 User & Role Management

#### **Admin Dashboard**
*   **Functionality**: 
    *   System-wide statistics:
        - Total students, teachers, courses
        - Revenue overview
        - Active sessions today
    *   Quick actions for common tasks.
    *   Recent activity feed.
*   **Importance**: High-level health check of the platform.

#### **Students Directory**
*   **Functionality**: 
    *   List all students on the platform.
    *   Filter by verification status, enrollment status.
    *   Search by name or email.
    *   **Verification Actions**: Verify/Unverify student accounts.
    *   View detailed student profiles.
    *   Reset passwords, suspend accounts.
*   **Importance**: Fundamental security and operational control.

#### **Teachers Directory**
*   **Functionality**: 
    *   List all teachers on the platform.
    *   Filter by specialization, courses taught.
    *   View teacher profiles and qualifications.
    *   Manage teacher accounts.
*   **Importance**: Faculty oversight and management.

#### **Audit Logs**
*   **Functionality**: 
    *   Immutable record of sensitive actions:
        - Who deleted a course?
        - Who changed a grade?
        - Who verified a payment?
        - Login events
    *   Details include: User ID, Action, Entity, Entity ID, Timestamp, IP Address, User Agent.
    *   Filterable and searchable logs.
*   **Importance**: Critical for accountability, security audits, and dispute resolution.

### 4.2 Financial Operations

#### **Global Billing Settings**
*   **Functionality**: 
    *   Set default currency (KES/EUR).
    *   Configure default fee amount.
    *   Define billing cycle defaults (Monthly/Quarterly/One-Time).
    *   Late fee policies (e.g., "Roll to Next", "Add Penalty").
    *   Tax rate configuration.
*   **Importance**: Allows the business model to adapt without code changes.

#### **Invoice Generation & Management**
*   **Functionality**:
    *   **Bulk Invoice Generation**: Trigger invoice creation for all enrolled students in a term.
    *   **Manual Invoice Creation**: Create individual invoices with custom amounts and descriptions.
    *   **Invoice List**: View all invoices with:
        - Status (Pending/Paid/Partial/Overdue/Failed/Refunded)
        - Amount due vs paid
        - Student information
        - Term association
    *   **Invoice Reminders**: Send payment reminder notifications.
    *   **Invoice Notification System**: Automated email notifications for new invoices.
*   **Importance**: The core revenue driver. Ensures no student slips through the cracks and that revenue is recognized in the correct fiscal period.

#### **Revenue Dashboard**
*   **Functionality**: 
    *   Visual charts of income over time.
    *   Outstanding invoices summary.
    *   Collection rate percentage.
    *   Breakdown by: Paid, Partial, Overdue invoices.
    *   Total revenue vs total outstanding.
*   **Importance**: Provides financial health visibility for strategic planning.

#### **Payment Tracking**
*   **Functionality**: 
    *   View all payments received.
    *   Payment method breakdown (Card, M-Pesa, Bank Transfer).
    *   Transaction references and checkout IDs.
    *   Payment status tracking.
    *   Webhook integration for real-time payment updates (Intasend).
*   **Importance**: Reconciliation and financial accuracy.

### 4.3 Academic Oversight

#### **Courses Management**
*   **Functionality**: 
    *   View all courses on the platform.
    *   Filter by status (Draft/Published/Archived), level, teacher.
    *   Course analytics and enrollment counts.
    *   Administrative actions on courses.
*   **Importance**: Quality control and content oversight.

#### **Term Management**
*   **Functionality**: 
    *   Define academic terms (name, start/end dates).
    *   Set current active term.
    *   View term history.
    *   Link evaluations and invoices to terms.
*   **Importance**: Structures the academic year for reporting and enrollment cycles.

#### **System Reports Generation**
*   **Functionality**: 
    *   Generate aggregate reports:
        - Academic Summary
        - Financial Statement
        - Attendance Summary
        - Student Progress Reports
    *   Report formats: PDF, Excel.
    *   Report status tracking (Processing/Ready/Failed).
    *   Downloadable report storage.
    *   Key Performance Indicators (KPIs) dashboard:
        - Average grade
        - Attendance rate
        - Revenue
        - Active classrooms
*   **Importance**: Mandatory for compliance, board reporting, and high-level decision making.

### 4.4 Communication & Announcements

#### **Broadcast Center**
*   **Functionality**: 
    *   Compose and send system-wide notifications.
    *   Target audience selection:
        - All Users
        - All Students
        - All Teachers
        - Course-Specific Students
    *   Alert types: Information, Warning, Success, Critical.
    *   **Live Preview**: See how the broadcast will appear before sending.
    *   Recipient count tracking.
*   **Importance**: Efficient mass communication for announcements, maintenance alerts, or urgent information.

#### **Notification History**
*   **Functionality**: 
    *   View all sent broadcasts.
    *   Track delivery statistics.
*   **Importance**: Audit trail for communications.

### 4.5 Content & Marketing

#### **Testimonials Management**
*   **Functionality**: 
    *   Review submitted student testimonials.
    *   Approve/Reject testimonials.
    *   Feature testimonials on public landing page (limit of 3).
    *   Star rating display.
    *   Delete inappropriate testimonials.
*   **Importance**: Controls brand narrative and social proof.

### 4.6 System Configuration

#### **System Settings**
*   **Functionality**: 
    *   Configure platform basics:
        - System name
        - Support email
        - Maximum students per class
        - Default currency
    *   **Notification Settings**: Global toggles for notification channels.
    *   **Integration Settings**: Configure API keys for third-party tools:
        - Jitsi domain
        - Payment gateway credentials
        - Email provider settings
*   **Importance**: Reduces reliance on developers for minor configuration changes.

---

## 5. Public & Marketing Features
*For prospective students and SEO optimization.*

### 5.1 Landing Page
*   **Functionality**: 
    *   Professional homepage with:
        - Hero section with call-to-action
        - Feature highlights
        - Course level overview (A1-C2)
        - Student testimonials carousel
        - Platform statistics (students, courses, teachers)
    *   Registration and login links.
*   **Importance**: First impression and conversion for prospective students.

### 5.2 Public Course Catalog
*   **Functionality**: 
    *   Browse all published courses without login.
    *   Filter by level.
    *   Course preview with basic details.
    *   Registration prompt for enrollment.
*   **Importance**: Lead generation and course discovery.

### 5.3 Course Detail Pages
*   **Functionality**: 
    *   Detailed course information:
        - Description, learning outcomes
        - Module breakdown
        - Teacher information
        - Price and duration
    *   Session schedule preview.
    *   Resource preview (limited).
    *   Enrollment call-to-action.
*   **Importance**: Informed decision-making for prospective students.

### 5.4 About/Privacy/Terms Pages
*   **Functionality**: 
    *   About Us page with school mission and vision.
    *   Privacy Policy (GDPR-compliant).
    *   Terms of Service.
*   **Importance**: Legal compliance and trust building.

### 5.5 SEO Optimization
*   **Functionality**: 
    *   Proper meta tags, title tags, descriptions.
    *   OpenGraph and Twitter cards for social sharing.
    *   Sitemap generation.
    *   robots.txt configuration.
    *   Web manifest for PWA capability.
*   **Importance**: Discoverability and professional web presence.

---

## 6. Technical Infrastructure Features

### 6.1 File Upload & Storage
*   **Functionality**: 
    *   Secure file uploads via API routes.
    *   **DigitalOcean Spaces / S3**: For documents, PDFs, videos.
    *   **Cloudinary**: For images and avatar uploads.
    *   **Vercel Blob**: For lightweight document storage.
    *   File size and type validation.
    *   Secure signed URLs for downloads.
*   **Importance**: Reliable content delivery and storage.

### 6.2 Payment Gateway Integration (Intasend)
*   **Functionality**: 
    *   Mobile Money (M-Pesa) support.
    *   Card payment processing.
    *   Webhook handlers for payment status updates.
    *   Secure checkout flow.
    *   Transaction logging.
*   **Importance**: Revenue collection with local payment methods.

### 6.3 Email Service (Resend)
*   **Functionality**: 
    *   Transactional emails:
        - Email verification
        - Password reset
        - Payment confirmations
        - Invoice notifications
        - Session reminders
    *   Templated, branded emails.
*   **Importance**: Reliable communication channel.

### 6.4 Video Conferencing (Jitsi)
*   **Functionality**: 
    *   Embedded video conferencing.
    *   Configurable Jitsi domain.
    *   JWT-based session security.
    *   Integration with attendance tracking.
*   **Importance**: Core virtual classroom functionality.

### 6.5 API Architecture
*   **Functionality**: 
    *   RESTful API routes organized by role and feature.
    *   Authentication middleware for protected endpoints.
    *   Standardized API response format.
    *   Error handling and validation.
*   **Importance**: Scalable, maintainable backend structure.

### 6.6 Database (PostgreSQL with Prisma)
*   **Functionality**: 
    *   Comprehensive data model covering all entities.
    *   Type-safe database access via Prisma.
    *   Migrations for schema versioning.
    *   Seed data for development/testing.
*   **Importance**: Data integrity and developer productivity.

---

## Summary of Value Proposition

| Role | Key Value Driver |
| :--- | :--- |
| **Student** | **Convenience & clarity.** A single portal for learning, paying, and tracking progress without administrative friction. Complete visibility into attendance, grades, evaluations, and billing. |
| **Teacher** | **Efficiency & Autonomy.** Tools that automate low-value tasks (attendance tracking, progress calculation) and empower high-value tasks (curriculum design, personalized feedback, holistic evaluation). |
| **Admin** | **Control & Insight.** Complete oversight of the business's academic and financial health with tools to enforce policy, manage users, and generate compliance-ready reports. |

---

## Feature Summary by Page Count

| Category | Feature Count |
| :--- | :--- |
| System-Wide Core | 8 major features |
| Student Features | 18 major features |
| Teacher Features | 15 major features |
| Admin Features | 14 major features |
| Public Features | 5 major features |
| Technical Infrastructure | 6 major features |
| **Total** | **66+ distinct features** |

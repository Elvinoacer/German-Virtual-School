# Features of German Virtual School

This document provides an end-to-end analysis of the implemented features in the application.

## 1. Authentication & User Management
- **Secure Authentication**: Supports credentials (email/password) and OAuth (Google, Microsoft Entra ID).
- **Role-Based Access Control (RBAC)**: Distinct roles for `STUDENT`, `TEACHER`, and `ADMIN`.
- **Profile Management**: Profile creation and editing for students and teachers, including avatar uploads and bio.
- **Verification System**: Student verification workflow managed by admins.

## 2. Course Management
- **Course Creation**: Teachers can create courses with title, description, level (A1-C2), price, and duration.
- **Module Structure**: Courses are organized into ordered modules.
- **Resource Management**: Upload and manage resources (PDFs, Videos, Docs) per module.
- **Enrollment System**: Students can enroll in courses, tracking progress and grades.
- **Search & Filtering**: Browse courses by level, teacher, or search queries.

## 3. Virtual Classroom & Attendance
- **Live Sessions**: Integration with Jitsi Meet for virtual classes.
- **Scheduling**: Teachers can schedule class sessions with start/end times.
- **Attendance Tracking**: Automated tracking of student attendance (Present, Absent, Excused, Late).
- **Session logs**: Detailed logs of join/leave events.

## 4. Assignments & Grading
- **Assignment Management**: Teachers create assignments with due dates and max points.
- **Submissions**: Students submit work (text or file attachments).
- **Grading System**: Teachers grade submissions and provide feedback.
- **Rubrics**: Support for structured grading rubrics.

## 5. Communication
- **Direct Messaging**: real-time messaging between users.
  - **Faculty Priority**: Contact list prioritizes teachers and admins.
  - **Search**: Filter contacts by name.
  - **Unread Counters**: Track unread messages.
- **Discussion Forums**: Course-specific and public threads for community interaction.
  - **Thread Management**: Create, reply to, pin, and lock threads.
  - **Anonymity**: Option for anonymous posts.

## 6. Finance & Billing
- **Invoicing**: Automated generation of invoices for course enrollments.
- **Payment Processing**: Integration with IntaSend for payments (Card, Mobile Money).
- **Billing Cycles**: Support for Monthly, Quarterly, and One-time billing.
- **Financial Reporting**: Track paid, pending, and overdue payments.

## 7. Reporting & Analytics
- **Student Reports**: Comprehensive reports on attendance, grades, and progress.
- **Admin Dashboard**: High-level metrics on enrollment, revenue, and system health.
- **Teacher Dashboard**: Insights into student performance and course engagement.
- **Export Options**: Generate PDF reports for students.

## 8. Notifications
- **Multi-channel**: In-app notifications with support for Email (Resend) and Push (Firebase) notifications.
- **Real-time Updates**: Socket-based events for messages and notifications.
- **Preferences**: Configurable notification settings.

## 9. Admin Administration
- **User Management**: Verify students, manage teachers, and oversee system users.
- **System Settings**: Configure global billing settings, school information, and integrations.
- **Audit & Compliance**: View system reports and logs.

## 10. Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (via Prisma ORM 7.x)
- **Styling**: Tailwind CSS
- **Real-time**: Custom WebSocket server (Socket.io compatible)
- **Video**: Jitsi Meet SDK
- **Storage**: Vercel Blob & Cloudinary

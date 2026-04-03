# Student User Flows

This document outlines the complete user journey for a Student on the German Virtual School (GVS) platform, from initial account creation to course completion.

## 1. Account Setup & Authentication

### 1.1 Registration
- **Entry Point**: `/register` (Public)
- **Action**: User provides First Name, Last Name, Email, Password.
- **Role Assignment**: User selects "I am a Student" (Role: `STUDENT`).
- **Post-Action**: Account created in `User` table.
- **Verification**: User redirected to `student/verification-status` until email/admin verified? (Check logic: `isVerified` flag on User model).

### 1.2 Login
- **Entry Point**: `/login` (Public)
- **Action**: Email/Password authentication via NextAuth.
- **Redirection**:
  - Success: Redirects to `/student/dashboard`.
  - Failure: Error message displayed.

### 1.3 Onboarding
- **Trigger**: First login.
- **Action**: User prompted to complete `StudentProfile` (Phone, Address, Emergency Contact).
- **Location**: `/student/profile` or `/settings`.

---

## 2. Academic Journey

### 2.1 Course Discovery & Enrollment
- **Browse**: `/student/courses` - View available courses, filter by level (A1-C2).
- **Purchase**:
  - Select Course -> View Details.
  - Click "Enroll" -> Invoice created in `PENDING` state.
  - Redirect to Payment Gateway (Intasend).
  - **Success**: Enrollment status `ACTIVE`, Invoice `PAID`.

### 2.2 Learning Access
- **My Courses**: `/student/courses` - List of enrolled active courses.
- **Course View**: `/student/courses/[id]`
  - **Modules**: View timeline of modules.
  - **Resources**: Download PDFs, watch videos (`ResourceProgress` tracked).
  - **Progress**: % completion updated automatically.

### 2.3 Live Classes
- **Schedule**: `/student/schedule` - Calendar view of upcoming sessions.
- **Join**:
  - Click "Join Class" button (active 5 mins before start).
  - Validates enrollment and `isVerified` status.
  - Redirects to `/classroom/[sessionId]` (Jitsi Meet integration).
- **Attendance**: Auto-marked `PRESENT`/`LATE` based on join time.

### 2.4 Assignments
- **Dashboard**: `/student/assignments` - Pending vs. Submitted list.
- **Action**:
  - View Assignment details & resources.
  - **Submit**: Upload file or enter text content.
  - Status updates to `SUBMITTED`.
- **Feedback**: Receive grade and comments from teacher.

### 2.5 Evaluations & Reports
- **Grades**: `/student/grades` - View assignment scores.
- **Evaluations**: `/student/evaluations` - Teacher qualitative feedback (mid-term/final).
- **Reports**: `/student/reports` - Download academic transcripts (PDF).

---

## 3. Financial Management

### 3.1 Billing Dashboard
- **Overview**: `/student/billing` - Current balance, next invoice due.
- **Invoices**: List of paid and unpaid invoices.
- **History**: Transaction logs of all payments.

### 3.2 Making Payments
- **Action**: Click "Pay Now" on pending invoice.
- **Gateway**: Integrated Payment Processing.
- **Receipt**: Auto-generated receipt and email confirmation.

---

## 4. Communication & Community

### 4.1 Messages
- **Route**: `/messages`
- **Features**: Direct chat with enrolled teachers. Real-time updates via polling/socket.

### 4.2 Forum
- **Route**: `/forum`
- **Features**:
  - Course-specific threads.
  - General community discussions.
  - Post questions, reply to peers.

### 4.3 Notifications
- **Channels**: In-App, Email, Push.
- **Triggers**:
  - New Assignment
  - Class Reminder (15 mins before)
  - Grade Posted
  - Payment Due
- **Preferences**: Manage in `/settings` (Email/Push toggles).

---

## 5. Account Management

### 5.1 Profile
- **Route**: `/settings`
- **Actions**: Update bio, avatar, contact info, change password.

### 5.2 Notification Settings
- **Route**: `/settings#notifications`
- **Actions**: Toggle categories (Class, Assignment, Payment) and channels (Email, Push).

---

## 6. End of Life
- **Course Completion**: Certificate generation upon finishing modules + passing grades.
- **Data Export**: Request data download (GDPR).

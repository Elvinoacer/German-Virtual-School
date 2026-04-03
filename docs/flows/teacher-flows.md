# Teacher User Flows

This document outlines the complete user journey for a Teacher on the German Virtual School (GVS) platform.

## 1. Account Setup & Onboarding

### 1.1 Registration
- **Entry Point**: `/register`
- **Action**: Select "I am a Teacher".
- **Verification**: Teacher accounts may require admin approval or manual verification of credentials before publishing courses? (Check `isVerified` logic).

### 1.2 Profile Setup
- **Route**: `/settings` (or `/teacher/profile` if separate)
- **Details**: Bio, Qualifications, Specialization, Hourly Rate (for private tutoring), Avatar.

---

## 2. Course Management

### 2.1 Course Creation
- **Route**: `/teacher/courses/create`
- **Steps**:
  1. **Basic Info**: Title, Level (A1-C2), Description, Thumbnail.
  2. **Curriculum**: Create Modules -> Add Lessons.
  3. **Resources**: Upload PDFs, slides, extra materials.
  4. **Pricing**: Set course fee (if not standard).
  5. **Publish**: Submit for review or publish directly (depending on system settings).

### 2.2 Course Administration
- **My Courses**: `/teacher/courses` - List of created courses.
- **Manage**: Edit content, view enrollment stats, manage specific course resources.

---

## 3. Teaching Operations

### 3.1 Class Scheduling
- **Route**: `/teacher/calendar` or `/teacher/courses/[id]/schedule`
- **Action**: Schedule live sessions (recurring or one-off).
- **Details**: Date, Time, Duration, Topic.

### 3.2 Hosting Classes
- **Route**: `/teacher/dashboard` (Upcoming Classes) or Calendar.
- **Action**: Click "Start Class".
- **System**: Redirects to Jitsi Meet room (as Moderator).
- **Attendance**: System auto-tracks student join/leave times.

### 3.3 Grading & Feedback
- **Route**: `/teacher/grading`
- **Action**: View pending submissions.
- **Detail**: Preview student work (file/text).
- **Grade**: Assign score (0-100) and written feedback.
- **Return**: Status becomes `GRADED`.

---

## 4. Student Management

### 4.1 Student Directory
- **Route**: `/teacher/students`
- **View**: List of enrolled students across all courses.
- **Detail**: Click student to view their progress, attendance history, and past grades.

### 4.2 Evaluations
- **Route**: `/teacher/students/[id]/evaluate` ?
- **Action**: Create end-of-term qualitative reports.
- **Metric**: Assess participation, language proficiency, etc.

---

## 5. Financials

### 5.1 Earnings Overview
- **Route**: `/teacher/finance`
- **Metrics**: Total Revenue, Pending Payouts, Completed Payouts.
- **Breakdown**: Earnings per course or per student enrollment.

### 5.2 Payouts
- **Action**: Request payout or view automated monthly payout status (via Intasend/Bank).

---

## 6. Communication

### 6.1 Messages
- **Route**: `/messages`
- **Action**: Chat with individual students or course groups.

### 6.2 Forum Management
- **Route**: `/forum`
- **Action**: Moderate discussions, answer course-related questions.

### 6.3 Announcements
- **Action**: Send broadcast notifications to all students in a course (via `/teacher/courses/[id]/announcements`?).

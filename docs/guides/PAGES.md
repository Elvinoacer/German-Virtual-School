# Project Pages

This document lists all the UI pages implemented in the German Virtual School application.

## Public & Authentication
- **Landing Page**: `/` (`app/page.tsx`)
- **About Us**: `/about` (`app/about/page.tsx`)
- **Privacy Policy**: `/privacy` (`app/privacy/page.tsx`)
- **Terms of Service**: `/terms` (`app/terms/page.tsx`)
- **Login**: `/login` (`app/(auth)/login/page.tsx`)
- **Register**: `/register` (`app/(auth)/register/page.tsx`)
- **Forgot Password**: `/forgot-password` (`app/(auth)/forgot-password/page.tsx`)

## Student Workspace
- **Dashboard**: `/student/dashboard` (`app/student/dashboard/page.tsx`)
- **My Courses**: `/student/courses` (`app/student/courses/page.tsx`)
- **Course Detail**: `/student/courses/[courseId]` (`app/student/courses/[courseId]/page.tsx`)
- **Schedule**: `/student/schedule` (`app/student/schedule/page.tsx`)
- **Assignments**: `/student/assignments` (`app/student/assignments/page.tsx`)
- **Assignment Detail**: `/student/assignments/[assignmentId]` (`app/student/assignments/[assignmentId]/page.tsx`)
- **Grades**: `/student/grades` (`app/student/grades/page.tsx`)
- **Progress Reports**: `/student/reports` (`app/student/reports/page.tsx`)
- **Evaluation Details**: `/student/evaluations/[evaluationId]` (`app/student/evaluations/[evaluationId]/page.tsx`)
- **Billing Overview**: `/student/billing` (`app/student/billing/page.tsx`)
- **Pay Invoice**: `/student/billing/pay` (`app/student/billing/pay/page.tsx`)
- **Billing History**: `/student/billing/history` (`app/student/billing/history/page.tsx`)
- **Verification Status**: `/student/verification-status` (`app/student/verification-status/page.tsx`)

## Teacher Workspace
- **Dashboard**: `/teacher/dashboard` (`app/teacher/dashboard/page.tsx`)
- **Courses**: `/teacher/courses` (`app/teacher/courses/page.tsx`)
- **Course Detail**: `/teacher/courses/[courseId]` (`app/teacher/courses/[courseId]/page.tsx`)
- **New Course**: `/teacher/courses/new` (`app/teacher/courses/new/page.tsx`)
- **Edit Course**: `/teacher/courses/[courseId]/edit` (`app/teacher/courses/[courseId]/edit/page.tsx`)
- **Students**: `/teacher/students` (`app/teacher/students/page.tsx`)
- **Student Profile**: `/teacher/students/[studentId]` (`app/teacher/students/[studentId]/page.tsx`)
- **Evaluate Student**: `/teacher/students/[studentId]/evaluate/[courseId]` (`app/teacher/students/[studentId]/evaluate/[courseId]/page.tsx`)
- **Assignments**: `/teacher/assignments` (`app/teacher/assignments/page.tsx`)
- **Grading Detail**: `/teacher/assignments/[assignmentId]/grading` (`app/teacher/assignments/[assignmentId]/grading/page.tsx`)
- **Grading Overview**: `/teacher/grading` (`app/teacher/grading/page.tsx`)
- **Attendance**: `/teacher/sessions/[sessionId]/attendance` (`app/teacher/sessions/[sessionId]/attendance/page.tsx`)
- **Calendar**: `/teacher/calendar` (`app/teacher/calendar/page.tsx`)
- **Finance**: `/teacher/finance` (`app/teacher/finance/page.tsx`)

## Admin Workspace
- **Dashboard**: `/admin/dashboard` (`app/admin/dashboard/page.tsx`)
- **Courses**: `/admin/courses` (`app/admin/courses/page.tsx`)
- **Students**: `/admin/students` (`app/admin/students/page.tsx`)
- **Teachers**: `/admin/teachers` (`app/admin/teachers/page.tsx`)
- **Reports**: `/admin/reports` (`app/admin/reports/page.tsx`)
- **Finance**: `/admin/finance` (`app/admin/finance/page.tsx`)
- **Settings**: `/admin/settings` (`app/admin/settings/page.tsx`)
- **Compose Notification**: `/admin/notifications/compose` (`app/admin/notifications/compose/page.tsx`)

## Common & Shared Features
- **Public Course List**: `/courses` (`app/courses/page.tsx`)
- **Public Course Detail**: `/courses/[courseId]` (`app/courses/[courseId]/page.tsx`)
- **Course Resources**: `/courses/[courseId]/resources` (`app/courses/[courseId]/resources/page.tsx`)
- **Session Details**: `/courses/[courseId]/sessions/[sessionId]` (`app/courses/[courseId]/sessions/[sessionId]/page.tsx`)
- **Classroom**: `/classroom/[sessionId]` (`app/classroom/[sessionId]/page.tsx`)
- **Forum**: `/forum` (`app/forum/page.tsx`)
- **Forum Thread**: `/forum/[threadId]` (`app/forum/[threadId]/page.tsx`)
- **New Forum Thread**: `/forum/new` (`app/forum/new/page.tsx`)
- **Messages**: `/messages` (`app/messages/page.tsx`)
- **Notifications**: `/notifications` (`app/notifications/page.tsx`)
- **Calendar**: `/calendar` (`app/calendar/page.tsx`)
- **Profile**: `/profile` (`app/profile/page.tsx`)
- **Settings**: `/settings` (`app/settings/page.tsx`)
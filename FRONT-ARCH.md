# **1\. Global App Structure**

### **1.1 App Shell (Persistent UI)**

Used across almost all authenticated pages.

**Components**

- `AppLayout`
- `SidebarNavigation`
- `TopNavbar`
- `UserAvatarMenu`
- `RoleSwitcher` (Teacher / Student / Admin if applicable)
- `NotificationBell`
- `GlobalSearch`
- `Breadcrumbs`

---

# **2\. Authentication & Access Pages**

### **Pages**

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/unauthorized`

### **Components**

- `AuthForm`
- `InputField`
- `PasswordField`
- `SubmitButton`
- `AuthErrorAlert`
- `OAuthButton` (optional)
- `TermsAndPrivacyLinks`

---

# **3\. Dashboards (Role-Based)**

## **3.1 Student Dashboard**

**Page**

- `/student/dashboard`

**Components**

- `DashboardStatsCard` (attendance %, progress, balance)
- `UpcomingClassesList`
- `EnrolledCoursesOverview`
- `OutstandingFeesCard`
- `RecentAssignments`
- `PerformanceSnapshot`
- `QuickActionsPanel`

---

## **3.2 Teacher Dashboard**

**Page**

- `/teacher/dashboard`

**Components**

- `ClassesTodayCard`
- `CourseManagementSummary`
- `AssignmentsToGrade`
- `StudentEngagementChart`
- `RevenueSummaryCard`
- `QuickCreateButtons` (course, class, assignment)

---

## **3.3 Admin Dashboard**

**Page**

- `/admin/dashboard`

**Components**

- `SystemOverviewStats`
- `UserGrowthChart`
- `PaymentsOverview`
- `ActiveSessionsMonitor`
- `ReportsAccessPanel`

---

# **4\. Virtual Classes & Attendance**

### **Pages**

- `/classes`
- `/classes/[classId]`
- `/classes/[classId]/live`

### **Components**

- `ClassScheduleTable`
- `ClassDetailsCard`
- `JoinSessionButton`
- `SessionCountdownTimer`
- `VideoContainer` (SDK wrapper)
- `AttendanceTracker`
- `PresenceIndicator`
- `SessionControlsBar`
- `SessionValidationLoader`
- `LeaveSessionModal`

---

# **5\. Course Management**

## **5.1 Course Listing**

**Pages**

- `/courses`
- `/courses/[courseId]`

**Components**

- `CourseCard`
- `CourseFilterBar`
- `CourseProgressRing`
- `CourseMetaInfo`
- `EnrollButton`

---

## **5.2 Course Creation & Editing (Teacher)**

**Pages**

- `/teacher/courses/new`
- `/teacher/courses/[courseId]/edit`

**Components**

- `CourseForm`
- `PricingInput`
- `DurationSelector`
- `ModuleBuilder`
- `LearningOutcomeEditor`
- `PublishToggle`

---

# **6\. Learning Resources**

### **Pages**

- `/courses/[courseId]/resources`

### **Components**

- `ResourceUploadModal`
- `ResourceList`
- `ResourceCard`
- `FilePreviewer` (PDF, video, doc)
- `DownloadButton`
- `ResourceAnalyticsBadge`
- `VersionHistoryDrawer`

---

# **7\. Assignments & Submissions**

## **7.1 Student View**

**Pages**

- `/assignments`
- `/assignments/[assignmentId]`

**Components**

- `AssignmentCard`
- `AssignmentDetails`
- `DeadlineCountdown`
- `SubmissionUploader`
- `SubmissionStatusBadge`
- `ResubmitButton`

---

## **7.2 Teacher View**

**Pages**

- `/teacher/assignments`
- `/teacher/assignments/[assignmentId]/submissions`

**Components**

- `AssignmentCreationForm`
- `SubmissionTable`
- `GradingPanel`
- `RubricViewer`
- `GradeInput`
- `FeedbackEditor`

---

# **8\. Fees & Payments**

### **Pages**

- `/billing`
- `/billing/history`
- `/billing/pay`

### **Components**

- `CurrentFeesCard`
- `FeeCycleSelector`
- `ArrearsBreakdown`
- `PaymentButton`
- `PaymentMethodSelector`
- `InvoiceList`
- `PaymentStatusBadge`

---

# **9\. Student Evaluation & Metrics**

### **Pages**

- `/teacher/students`
- `/teacher/students/[studentId]/evaluation`

### **Components**

- `StudentProfileHeader`
- `EvaluationMetricsForm`
- `ScoreSlider`
- `ScoreInput`
- `TeacherCommentsEditor`
- `EvaluationHistoryTimeline`
- `SaveEvaluationButton`

---

# **10\. Open Forum & Communication**

### **Pages**

- `/forum`
- `/forum/new`
- `/forum/[threadId]`

### **Components**

- `ForumThreadList`
- `ThreadCard`
- `CreateThreadForm`
- `AnonymityToggle`
- `AudienceSelector` (public / teacher / student)
- `PostEditor`
- `ReplyList`
- `ModerationActions`
- `ReportPostButton`

---

# **11\. Reports & Analytics**

### **Pages**

- `/reports`
- `/reports/student/[studentId]`
- `/reports/download`

### **Components**

- `ReportSummaryCard`
- `AttendanceChart`
- `PerformanceChart`
- `EvaluationBreakdown`
- `ReportExportButton`
- `CycleSelector`

---

# **12\. Notifications & Messaging**

### **Pages**

- `/notifications`
- `/messages`

### **Components**

- `NotificationList`
- `NotificationItem`
- `UnreadBadge`
- `MessageThreadList`
- `ChatWindow`
- `MessageInput`
- `TypingIndicator`

---

# **13\. Settings & Profile**

### **Pages**

- `/settings`
- `/profile`

### **Components**

- `ProfileForm`
- `PasswordChangeForm`
- `LanguageSelector`
- `PrivacySettings`
- `NotificationPreferences`
- `AccountSecurityPanel`

---

# **14\. Shared / System Components**

These will be used everywhere.

- `Modal`
- `Drawer`
- `Tooltip`
- `ToastNotifications`
- `LoadingSkeleton`
- `ErrorBoundary`
- `EmptyState`
- `ConfirmDialog`
- `Pagination`
- `DataTable`
- `Tabs`
- `Accordion`

---

# **15\. Frontend Folder Structure (Recommended)**

src/

├─ app/

│ ├─ (auth)/

│ ├─ (student)/

│ ├─ (teacher)/

│ ├─ (admin)/

│ ├─ forum/

│ ├─ billing/

│ ├─ reports/

├─ components/

│ ├─ ui/

│ ├─ layout/

│ ├─ forms/

│ ├─ charts/

│ ├─ video/

├─ hooks/

├─ services/

├─ store/

├─ utils/

---

## **Straight Talk**

If you build **exactly this UI map**, you won’t hit rework later. This structure supports:

- Role isolation
- Feature growth
- Clean permission enforcement
- Easy mobile adaptation later

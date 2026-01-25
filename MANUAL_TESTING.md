# Manual Testing Documentation - German Virtual School

This document outlines the manual testing procedures for the German Virtual School application. It covers all user roles (Student, Teacher, Admin) and core functional modules.

## 1. Prerequisites & Setup
- **Browser**: Chrome (latest), Firefox (latest).
- **Network**: Stable internet connection (required for video/WebSockets).
- **Accounts**:
    - **Admin Account**: Has access to `/admin`.
    - **Teacher Account**: Has access to `/teacher`.
    - **Student Account**: Has access to `/student`.
    - **Unregistered/Guest**: No session.

---

## 2. Authentication & Identity
**Goal**: Verify secure access and role-based redirection.

| Test ID | Feature | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AUTH-01** | Student Registration | 1. Go to `/register`.<br>2. Fill in details as a Student.<br>3. Submit. | Account created, redirected to Student Dashboard `/student/dashboard`. |
| **AUTH-02** | Teacher Registration | 1. Go to `/register`.<br>2. Fill in details as a Teacher.<br>3. Submit. | Account created, redirected to Teacher Dashboard (or pending approval if applicable). |
| **AUTH-03** | Login (Student) | 1. Go to `/login`.<br>2. Enter valid Student credentials. | Redirected to `/student/dashboard`. |
| **AUTH-04** | Login (Teacher) | 1. Go to `/login`.<br>2. Enter valid Teacher credentials. | Redirected to `/teacher/dashboard`. |
| **AUTH-05** | Login (Admin) | 1. Admin logs in via `/login`. | Redirected to `/admin/dashboard`. |
| **AUTH-06** | Invalid Login | 1. Enter incorrect password. | Error message displayed, user remains on login page. |
| **AUTH-07** | Forgot Password | 1. Click "Forgot Password".<br>2. Enter email.<br>3. Check simulated email/log. | Recovery link sent/displayed. |
| **AUTH-08** | Protected Routes | 1. Logout.<br>2. Try to access `/student/dashboard`. | Redirected to `/login`. |

---

## 3. Student Workspace
**Goal**: Verify the student learning journey.

### 3.1 Courses & Content
| Test ID | Feature | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **STU-01** | View Enrolled Courses | 1. Go to `/student/courses`. | List of enrolled courses is visible. |
| **STU-02** | Course Detail | 1. Click a course. | Course overview, modules, and progress bar are visible. |
| **STU-03** | Access Resources | 1. Go to Course > Resources.<br>2. Click a PDF/Video. | Content opens/downloads correctly. |
| **STU-04** | Track Progress | 1. Complete a module item.<br>2. Refresh dashboard. | Course progress % increases. |

### 3.2 Live Classes (Jitsi)
| Test ID | Feature | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **STU-05** | Join Class | 1. Go to `/student/schedule`.<br>2. Click "Join" on active session. | Redirected to `/classroom/[id]`, video interface loads. |
| **STU-06** | Attendance Log | 1. Stay in class for >1 min.<br>2. Leave.<br>3. Check `/student/reports`. | Attendance recorded for that date. |

### 3.3 Assignments
| Test ID | Feature | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **STU-07** | View Assignments | 1. Go to `/student/assignments`. | List of pending/submitted assignments visible. |
| **STU-08** | Submit Assignment | 1. Open pending assignment.<br>2. Upload file/text.<br>3. Submit. | Status changes to "Submitted". |

### 3.4 Billing
| Test ID | Feature | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **STU-09** | View Fees | 1. Go to `/student/billing`. | Current invoice and arrears displayed. |
| **STU-10** | Pay Fee (Sandbox) | 1. Click "Pay".<br>2. Complete Intasend sandbox flow. | Payment marked "Successful", balance updates. |

---

## 4. Teacher Workspace
**Goal**: Verify course management and student assessment.

### 4.1 Course & Resource Management
| Test ID | Feature | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TCH-01** | Create Course | 1. Go to `/teacher/courses/new`.<br>2. Fill details (Price, Description).<br>3. Save. | Course appears in list. |
| **TCH-02** | Edit Course | 1. Open course.<br>2. Add a module.<br>3. Save. | Module visible to enrolled students. |
| **TCH-03** | Upload Resource | 1. Go to Course > Resources.<br>2. Upload PDF. | File listed, accessible to students. |

### 4.2 Class Management
| Test ID | Feature | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TCH-04** | Start Session | 1. Go to `/teacher/calendar`.<br>2. Start scheduled class. | Video room opens as moderator. |
| **TCH-05** | Attendance Manual | 1. Go to `/teacher/sessions/[id]/attendance`.<br>2. Mark student "Excused". | Record updates in system. |

### 4.3 Grading
| Test ID | Feature | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TCH-06** | Grade Assignment | 1. Go to `/teacher/assignments`.<br>2. Open submission.<br>3. Enter score/feedback. | Student sees grade in their portal. |
| **TCH-07** | Evaluate Student | 1. Go to Student Profile > Evaluate.<br>2. Add qualitative feedback. | Evaluation saved to student report. |

---

## 5. Admin Workspace
**Goal**: Verify system oversight and configuration.

| Test ID | Feature | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **ADM-01** | User Management | 1. Go to `/admin/students`.<br>2. Ban/Edit a user. | User access restricted or details updated. |
| **ADM-02** | Finance Overview | 1. Go to `/admin/finance`. | Total revenue and pending payments visible. |
| **ADM-03** | Send Notification | 1. Go to `/admin/notifications/compose`.<br>2. Send to "All Students". | Students receive in-app/email notification. |

---

## 6. Shared Features & UI
**Goal**: Verify common functionality across the platform.

| Test ID | Feature | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **SHR-01** | Forum Posting | 1. Go to `/forum`.<br>2. Create new thread. | Thread appears in public list. |
| **SHR-02** | Dark Mode | 1. Toggle Theme Switcher. | UI colors invert correctly, text remains readable. |
| **SHR-03** | Mobile Responsive | 1. Resize browser to mobile width. | Navigation becomes hamburger menu, tables scrollable. |
| **SHR-04** | Profile Update | 1. Go to `/profile`.<br>2. Change avatar/bio. | New details persist on refresh. |

---

## 7. Edge Cases to Test
- **Concurrent Logins**: Try logging in with the same account on two devices.
- **Expired Tokens**: Wait for session timeout and try to perform an action (should redirect to login).
- **Large File Uploads**: Try uploading a file > expected limit.
- **Zero Fees**: Create a free course and ensure students can enroll without payment.

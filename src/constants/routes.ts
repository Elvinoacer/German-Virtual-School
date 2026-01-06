/**
 * Application route constants
 * Organized by role and feature
 */

// Public routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
} as const;

// Auth routes
export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  UNAUTHORIZED: '/unauthorized',
} as const;

// Student routes
export const STUDENT_ROUTES = {
  DASHBOARD: '/student/dashboard',
  COURSES: '/courses',
  COURSE_DETAIL: (id: string) => `/courses/${id}`,
  ASSIGNMENTS: '/assignments',
  ASSIGNMENT_DETAIL: (id: string) => `/assignments/${id}`,
  BILLING: '/billing',
  BILLING_HISTORY: '/billing/history',
  BILLING_PAY: '/billing/pay',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// Teacher routes
export const TEACHER_ROUTES = {
  DASHBOARD: '/teacher/dashboard',
  COURSES: '/teacher/courses',
  COURSE_NEW: '/teacher/courses/new',
  COURSE_EDIT: (id: string) => `/teacher/courses/${id}/edit`,
  ASSIGNMENTS: '/teacher/assignments',
  ASSIGNMENT_SUBMISSIONS: (id: string) => `/teacher/assignments/${id}/submissions`,
  STUDENTS: '/teacher/students',
  STUDENT_EVALUATION: (id: string) => `/teacher/students/${id}/evaluation`,
  SETTINGS: '/teacher/settings',
} as const;

// Admin routes
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/users',
  SETTINGS: '/admin/settings',
  REPORTS: '/reports',
} as const;

// Shared routes
export const SHARED_ROUTES = {
  CLASSES: '/classes',
  CLASS_DETAIL: (id: string) => `/classes/${id}`,
  CLASS_LIVE: (id: string) => `/classes/${id}/live`,
  FORUM: '/forum',
  FORUM_THREAD: (id: string) => `/forum/${id}`,
  FORUM_NEW: '/forum/new',
  NOTIFICATIONS: '/notifications',
  MESSAGES: '/messages',
  REPORTS: '/reports',
  REPORT_STUDENT: (id: string) => `/reports/student/${id}`,
  REPORT_DOWNLOAD: '/reports/download',
} as const;

// All routes combined
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...AUTH_ROUTES,
  ...STUDENT_ROUTES,
  ...TEACHER_ROUTES,
  ...ADMIN_ROUTES,
  ...SHARED_ROUTES,
} as const;

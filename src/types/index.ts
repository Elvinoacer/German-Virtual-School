// ============================================
// USER & AUTH TYPES
// ============================================

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student extends User {
  role: 'student';
  enrolledCourses: string[]; // Course IDs
  studentId: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
}

export interface Teacher extends User {
  role: 'teacher';
  createdCourses: string[]; // Course IDs
  teacherId: string;
  bio?: string;
  specialization?: string;
  qualifications?: string[];
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

// ============================================
// COURSE TYPES
// ============================================

export interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacher?: Teacher;
  price: number; // 0 for free courses
  duration: number; // in weeks
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  thumbnail?: string;
  modules: CourseModule[];
  learningOutcomes: string[];
  isPublished: boolean;
  enrollmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  resources: Resource[];
  duration: number; // in hours
}

export interface CourseEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'dropped';
  progress: number; // 0-100
  hoursSpent: number;
  completionDate?: string;
}

// ============================================
// RESOURCE TYPES
// ============================================

export type ResourceType = 'pdf' | 'video' | 'document' | 'link' | 'other';

export interface Resource {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  type: ResourceType;
  url: string;
  fileSize?: number;
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  viewCount: number;
  downloadCount: number;
}

// ============================================
// CLASS & ATTENDANCE TYPES
// ============================================

export interface Class {
  id: string;
  courseId: string;
  course?: Course;
  teacherId: string;
  teacher?: Teacher;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number; // in minutes
  meetingUrl?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  maxStudents?: number;
  enrolledStudents: string[]; // Student IDs
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  classId: string;
  studentId: string;
  student?: Student;
  checkedInAt?: string;
  checkedOutAt?: string;
  duration?: number; // in minutes
  status: 'present' | 'absent' | 'excused' | 'late';
  markedBy?: string; // Teacher ID for manual override
  notes?: string;
}

// ============================================
// ASSIGNMENT TYPES
// ============================================

export interface Assignment {
  id: string;
  courseId: string;
  course?: Course;
  teacherId: string;
  teacher?: Teacher;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string;
  maxScore: number;
  attachments: Resource[];
  rubric?: GradingRubric;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GradingRubric {
  criteria: {
    name: string;
    description: string;
    maxPoints: number;
  }[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignment?: Assignment;
  studentId: string;
  student?: Student;
  content?: string;
  attachments: Resource[];
  submittedAt: string;
  status: 'submitted' | 'late' | 'graded' | 'returned';
  score?: number;
  feedback?: string;
  gradedBy?: string; // Teacher ID
  gradedAt?: string;
}

// ============================================
// BILLING & PAYMENT TYPES
// ============================================

export type PaymentCycle = 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'custom';
export type PaymentStatus = 'paid' | 'partial' | 'overdue' | 'pending';

export interface FeeStructure {
  id: string;
  courseId: string;
  amount: number;
  cycle: PaymentCycle;
  duration: number; // Total duration in months
  description?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  studentId: string;
  student?: Student;
  courseId: string;
  course?: Course;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  cycle: PaymentCycle;
  arrears: number;
  totalAmount: number; // amount + arrears
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoice?: Invoice;
  studentId: string;
  amount: number;
  method: 'card' | 'mpesa' | 'bank_transfer';
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paidAt?: string;
  createdAt: string;
}

// ============================================
// EVALUATION TYPES
// ============================================

export interface Evaluation {
  id: string;
  studentId: string;
  student?: Student;
  courseId: string;
  course?: Course;
  teacherId: string;
  teacher?: Teacher;
  cycle: string; // e.g., "Q1 2024"
  metrics: EvaluationMetric[];
  overallScore?: number;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationMetric {
  category: 'attendance' | 'assignment' | 'participation' | 'proficiency' | 'other';
  name: string;
  score: number; // 0-100
  maxScore: number;
  weight?: number; // for weighted averages
  comments?: string;
}

// ============================================
// FORUM TYPES
// ============================================

export type ThreadAudience = 'public' | 'teacher' | 'student';

export interface ForumThread {
  id: string;
  authorId: string;
  author?: User;
  title: string;
  content: string;
  audience: ThreadAudience;
  isAnonymous: boolean;
  isPinned: boolean;
  isLocked: boolean;
  courseId?: string; // Optional: thread related to specific course
  tags: string[];
  viewCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ForumPost {
  id: string;
  threadId: string;
  thread?: ForumThread;
  authorId: string;
  author?: User;
  content: string;
  isAnonymous: boolean;
  parentPostId?: string; // For nested replies
  isModerated: boolean;
  moderatedBy?: string;
  moderationReason?: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// REPORT TYPES
// ============================================

export interface StudentReport {
  id: string;
  studentId: string;
  student?: Student;
  courseId: string;
  course?: Course;
  cycle: string;
  attendance: {
    total: number;
    present: number;
    absent: number;
    excused: number;
    percentage: number;
  };
  assignments: {
    total: number;
    submitted: number;
    late: number;
    missing: number;
    averageScore: number;
  };
  courseProgress: {
    modulesCompleted: number;
    modulesTotal: number;
    percentage: number;
    hoursSpent: number;
  };
  evaluation?: Evaluation;
  generatedAt: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'class_reminder'
  | 'assignment_new'
  | 'assignment_graded'
  | 'payment_due'
  | 'forum_reply';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// FORM TYPES
// ============================================

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher';
  agreeToTerms: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

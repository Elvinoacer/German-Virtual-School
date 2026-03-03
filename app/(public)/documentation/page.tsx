"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Section data structure
interface Feature {
  title: string;
  functionality: string[];
  importance?: { [role: string]: string };
}

interface SubSection {
  id: string;
  title: string;
  features: Feature[];
}

interface Section {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  subSections: SubSection[];
}

// Complete documentation data from FEATURES_AND_FUNCTIONALITY.md
const documentationData: Section[] = [
  {
    id: "system-wide",
    title: "System-Wide Core Features",
    icon: "settings_suggest",
    color: "blue",
    description: "These features form the backbone of the platform, ensuring security, scalability, and seamless operation for all users.",
    subSections: [
      {
        id: "auth",
        title: "Authentication & Identity (NextAuth.js)",
        features: [
          {
            title: "Authentication & Identity",
            functionality: [
              "Secure login via Email/Password",
              "Role-Based Access Control (RBAC) automatically routing users to their specific dashboards (Student, Teacher, Admin)",
              "Short-lived session tokens for enhanced security",
              "Email verification flows with resend capability",
              "Password reset with secure token-based recovery",
              "Automatic session refresh for seamless user experience"
            ],
            importance: {
              "All Roles": "Ensures data privacy and that users only access what they are authorized to see. Critical for GDPR compliance."
            }
          }
        ]
      },
      {
        id: "notifications",
        title: "Notification Orchestrator (Multi-Channel)",
        features: [
          {
            title: "Multi-Channel Notifications",
            functionality: [
              "In-App Notifications: Real-time alerts visible within the dashboard",
              "Email Notifications: Templated emails via Resend for class reminders, grade updates, payment confirmations, and forum replies",
              "Push Notifications: Firebase Cloud Messaging (FCM) for mobile/browser push alerts",
              "User-Configurable Preferences: Individual opt-in/opt-out per channel (Email, Push, In-App) and per category",
              "Event-Driven Triggers: Automatic notifications for class reminders, new assignments, grades, payments, forum replies, and direct messages"
            ],
            importance: {
              "Student": "Never miss a class, deadline, or important update",
              "Teacher": "Instant awareness of submissions, messages, or admin announcements",
              "Admin": "System-wide broadcasts for maintenance, announcements, or urgent alerts"
            }
          }
        ]
      },
      {
        id: "realtime",
        title: "Real-Time Infrastructure",
        features: [
          {
            title: "WebSockets & Redis",
            functionality: [
              "Live presence tracking (who is online)",
              "Instant messaging updates without page refresh",
              "Real-time notification delivery",
              "Live attendance tracking during virtual classes"
            ],
            importance: {
              "Student/Teacher": "Creates a feeling of a 'live' campus rather than a static website"
            }
          }
        ]
      },
      {
        id: "calendar",
        title: "Global Calendar System",
        features: [
          {
            title: "Unified Calendar",
            functionality: [
              "Unified calendar view for all scheduled sessions",
              "Monthly navigation with visual event indicators",
              "Session details with quick access (Join button for live sessions)",
              "Color-coded events by status (Scheduled, Live, Completed, Cancelled)",
              "Day-wise event listing for detailed view"
            ],
            importance: {
              "All Roles": "Central hub for time management and planning"
            }
          }
        ]
      },
      {
        id: "messaging",
        title: "Direct Messaging System",
        features: [
          {
            title: "Real-Time Chat",
            functionality: [
              "WebSocket-powered instant messaging",
              "Conversations list with unread indicators",
              "Contact discovery: Search and start new conversations with any platform user",
              "Read receipts: Track message delivery and read status",
              "Role display: See the role (Student/Teacher/Admin) of conversation partners",
              "Avatar support in chat interface"
            ],
            importance: {
              "Student": "Direct communication with teachers for questions or clarifications",
              "Teacher": "Private feedback and communication with individual students",
              "Admin": "Direct outreach to any user on the platform"
            }
          }
        ]
      },
      {
        id: "profile",
        title: "User Profile Management",
        features: [
          {
            title: "Profile Features",
            functionality: [
              "Profile Page: View and display personal information, avatar, role, and stats",
              "Avatar Upload: Secure image upload with Cloudinary integration",
              "Profile Statistics: Courses enrolled, attendance rate, and verification status",
              "Role-Specific Profiles: Students (DOB, phone, address, emergency contact) and Teachers (Bio, specialization, qualifications, hourly rate)"
            ],
            importance: {
              "All Roles": "Personalization and professional identity within the platform"
            }
          }
        ]
      },
      {
        id: "settings",
        title: "User Settings & Preferences",
        features: [
          {
            title: "Settings Management",
            functionality: [
              "Personal Information Editing: Update name, contact details, and role-specific fields",
              "Notification Preferences: Granular control over notification channels and categories",
              "Account Security: Password change, session management",
              "Profile Visibility: Control over publicly visible information"
            ],
            importance: {
              "All Roles": "Customization and control over personal experience"
            }
          }
        ]
      },
      {
        id: "darkmode",
        title: "Dark Mode Support",
        features: [
          {
            title: "Theme Toggle",
            functionality: [
              "System-wide dark/light theme toggle",
              "Consistent styling across all pages and components",
              "Automatic detection of system preference"
            ],
            importance: {
              "All Roles": "Improved accessibility and reduced eye strain during extended use"
            }
          }
        ]
      }
    ]
  },
  {
    id: "student",
    title: "Student Features",
    icon: "school",
    color: "indigo",
    description: "Empowering learners with tools for success, engagement, and transparency.",
    subSections: [
      {
        id: "student-dashboard",
        title: "Student Dashboard",
        features: [
          {
            title: "Dashboard Overview",
            functionality: [
              "Overview of enrolled courses with progress indicators",
              "Upcoming sessions with countdown timers",
              "Quick stats (attendance rate, assignments pending, overall progress)",
              "Recent notifications and announcements"
            ],
            importance: {
              "Student": "Central command center for daily learning activities"
            }
          }
        ]
      },
      {
        id: "virtual-classroom",
        title: "Live Virtual Classroom (Jitsi Integration)",
        features: [
          {
            title: "Video Conferencing",
            functionality: [
              "Secure video conferencing embedded in the app",
              "Includes hand-raising, screen sharing, and mute controls",
              "Join permitted only if enrolled and authentication validated",
              "Auto Check-In/Check-Out: Timestamps recorded automatically on join/leave",
              "Attendance Logs: Detailed timestamps of join/leave events for the session",
              "Participant list visible showing all attendees"
            ],
            importance: {
              "Student": "The core value proposition. Replicates the physical classroom experience remotely"
            }
          }
        ]
      },
      {
        id: "course-progress",
        title: "Course Dashboard & Progress Tracking",
        features: [
          {
            title: "Progress Tracking",
            functionality: [
              "Visual progress bars per course and module",
              "'Resume Learning' button taking to specific resource (video timestamp/PDF page) where they left off",
              "Module-by-module breakdown of completion status",
              "Learning outcomes checklist"
            ],
            importance: {
              "Student": "Enhancing motivation via gamification elements and helping manage study time"
            }
          }
        ]
      },
      {
        id: "course-catalog",
        title: "Course Catalog (Public & Enrolled)",
        features: [
          {
            title: "Course Discovery",
            functionality: [
              "Browse published courses with filtering by level (A1-C2)",
              "Course details: description, duration, price, learning outcomes, teacher info",
              "Enrollment button with seamless onboarding",
              "Public course preview for prospective students"
            ],
            importance: {
              "Student": "Discoverability and informed enrollment decisions"
            }
          }
        ]
      },
      {
        id: "resources",
        title: "Resource Library Access",
        features: [
          {
            title: "Learning Resources",
            functionality: [
              "Access to PDFs, videos, documents, and external links",
              "Offline capabilities (downloadable resources) where permitted",
              "View count and download count tracking",
              "Version history for updated resources",
              "Progress tracking per resource (last position for videos)"
            ],
            importance: {
              "Student": "Supports asynchronous learning and revision outside of live hours"
            }
          }
        ]
      },
      {
        id: "schedule",
        title: "Session Schedule View",
        features: [
          {
            title: "Schedule Management",
            functionality: [
              "List of all scheduled and past sessions for enrolled courses",
              "Session details: title, description, start/end times, status",
              "Quick join button for live or upcoming sessions",
              "Session objectives and homework visibility"
            ],
            importance: {
              "Student": "Planning and preparation for upcoming classes"
            }
          }
        ]
      },
      {
        id: "assignments",
        title: "Assignment Submission Portal",
        features: [
          {
            title: "Assignment Management",
            functionality: [
              "View all assignments across enrolled courses",
              "Upload files or type text responses",
              "View deadlines, rubrics, and status (Pending/Submitted/Late/Graded/Returned)",
              "Attachment support for multiple file uploads",
              "View teacher feedback and rubric breakdown after grading"
            ],
            importance: {
              "Student": "Centralizes academic work, removing the chaos of emails"
            }
          }
        ]
      },
      {
        id: "grades",
        title: "Gradebook & Grades View",
        features: [
          {
            title: "Grade Tracking",
            functionality: [
              "View graded assignments with detailed feedback",
              "Rubric breakdowns showing per-criterion scores",
              "Grade trends over time",
              "Course-wise grade summary"
            ],
            importance: {
              "Student": "Provides immediate feedback loops, essential for learning improvement"
            }
          }
        ]
      },
      {
        id: "evaluations",
        title: "Student Evaluations View",
        features: [
          {
            title: "Holistic Evaluations",
            functionality: [
              "View detailed evaluations created by teachers",
              "Quantitative metrics: Attendance Score, Participation Score, Assignment Score, Language Proficiency",
              "Qualitative feedback: Overall comments and improvement suggestions",
              "Term-wise evaluation history",
              "Trend indicators (up/down/flat)",
              "Print/Download evaluation as PDF"
            ],
            importance: {
              "Student": "Holistic understanding of performance beyond just grades"
            }
          }
        ]
      },
      {
        id: "reports",
        title: "Progress Reports View",
        features: [
          {
            title: "Official Reports",
            functionality: [
              "Comprehensive end-of-term PDF reports",
              "Attendance summary with visual breakdown (Present/Late/Absent)",
              "Performance metrics and grading summary",
              "Teacher evaluation notes",
              "Downloadable PDF generation (client-side with jsPDF)"
            ],
            importance: {
              "Student": "Official documentation for academic progress"
            }
          }
        ]
      },
      {
        id: "attendance",
        title: "Attendance History View",
        features: [
          {
            title: "Attendance Tracking",
            functionality: [
              "View personal attendance log per session",
              "Status categories: Present, Late, Absent, Excused",
              "Detailed logs showing check-in/check-out times",
              "Duration spent in each session",
              "Attendance percentage calculations with breakdown (Full/Partial/Missing)",
              "Statistics: Total sessions, average attendance, total minutes attended",
              "Filtering by status category"
            ],
            importance: {
              "Student": "Helps track requirement fulfillment for certification"
            }
          }
        ]
      },
      {
        id: "billing",
        title: "Billing Dashboard & Payment Portal",
        features: [
          {
            title: "Financial Management",
            functionality: [
              "View current invoice with amount due",
              "Payment history showing all past transactions",
              "Pending balances and arrears visibility",
              "Invoice breakdown with due dates",
              "Secure payment via Mobile Money (M-Pesa) or Card",
              "Intasend payment gateway integration",
              "Real-time payment status updates via webhooks",
              "Payment confirmation notifications",
              "Receipt generation for completed payments"
            ],
            importance: {
              "Student": "Clear, consolidated billing with convenient payment options"
            }
          }
        ]
      },
      {
        id: "forums",
        title: "Student Forums",
        features: [
          {
            title: "Community Forums",
            functionality: [
              "Participate in course-specific or general threads",
              "Post questions anonymously if desired",
              "Thread audiences: Public, Course-Only, Teachers-Only",
              "Pinned threads for important announcements",
              "Locked threads for archived discussions",
              "Nested replies for threaded conversations"
            ],
            importance: {
              "Student": "Builds a peer-support network, reducing isolation in online learning"
            }
          }
        ]
      },
      {
        id: "testimonials",
        title: "Testimonial Submission",
        features: [
          {
            title: "Feedback System",
            functionality: [
              "Submit feedback and ratings (1-5 stars) about the learning experience",
              "Written testimonials for public display",
              "Moderated by admin before featuring on landing page"
            ],
            importance: {
              "Student": "Voice in shaping the platform and helping prospective students"
            }
          }
        ]
      },
      {
        id: "verification",
        title: "Verification Status",
        features: [
          {
            title: "Account Verification",
            functionality: [
              "View current verification status (Pending/Verified)",
              "Understand what verification unlocks (full access to all features)"
            ],
            importance: {
              "Student": "Transparency about account status and access levels"
            }
          }
        ]
      }
    ]
  },
  {
    id: "teacher",
    title: "Teacher Features",
    icon: "person_search",
    color: "purple",
    description: "Tools for efficient course delivery, student management, and academic rigor.",
    subSections: [
      {
        id: "teacher-dashboard",
        title: "Teacher Dashboard",
        features: [
          {
            title: "Dashboard Overview",
            functionality: [
              "Overview of all courses created",
              "Upcoming sessions with quick actions",
              "Pending assignments to grade",
              "Recent student submissions",
              "Quick stats (total students, sessions this week, pending grades)"
            ],
            importance: {
              "Teacher": "Command center for daily teaching activities"
            }
          }
        ]
      },
      {
        id: "course-creator",
        title: "Course Creator Studio",
        features: [
          {
            title: "Course Creation",
            functionality: [
              "Create courses with complete details: Title, description, slug, level (A1-C2), duration, price, thumbnail",
              "Learning outcomes definition",
              "Course status management: Draft → Published → Archived",
              "Module Management: Structure content into logical modules with ordering",
              "Resource Upload: PDF, Videos, Documents, Links with bulk upload",
              "Version management for updated resources",
              "Download permissions control"
            ],
            importance: {
              "Teacher": "Full pedagogical control over curriculum structure"
            }
          }
        ]
      },
      {
        id: "course-edit",
        title: "Course Editing & Management",
        features: [
          {
            title: "Course Management",
            functionality: [
              "Edit any aspect of existing courses",
              "Archive courses to hide from public view",
              "View enrolled students list per course",
              "Access course-specific analytics"
            ],
            importance: {
              "Teacher": "Ongoing curriculum refinement and adaptation"
            }
          }
        ]
      },
      {
        id: "class-management",
        title: "Live Class Management",
        features: [
          {
            title: "Session Management",
            functionality: [
              "Schedule sessions with title, description, start/end times",
              "Learning objectives and homework assignments",
              "Start/End meetings from the classroom interface",
              "Manage participant mute states",
              "Automatic Attendance Logging based on join/leave events",
              "Session recording URL storage",
              "Session status management (Scheduled → Live → Completed/Cancelled)"
            ],
            importance: {
              "Teacher": "Streamlines administrative burden of attendance, allowing more time for teaching"
            }
          }
        ]
      },
      {
        id: "assignment-creation",
        title: "Assignment Creation",
        features: [
          {
            title: "Creating Assignments",
            functionality: [
              "Create assignments with title, description, due date",
              "Maximum points configuration",
              "Rubric definition (structured grading criteria)",
              "Attachment resources for the assignment",
              "Assign to all enrolled students automatically"
            ],
            importance: {
              "Teacher": "Standardized assignment distribution"
            }
          }
        ]
      },
      {
        id: "grading",
        title: "Rubric Builder & Grading Tool",
        features: [
          {
            title: "Grading System",
            functionality: [
              "Distinct criteria for grading (e.g., Grammar, Creativity, Accuracy)",
              "Inline grading with per-criterion score assignment",
              "Overall grade calculation",
              "Private feedback comments",
              "Submission status management (Pending → Graded → Returned)",
              "View submission timestamps (on-time vs late)",
              "Attachment viewing for student submissions"
            ],
            importance: {
              "Teacher": "Ensures objectiveness and consistency in grading"
            }
          }
        ]
      },
      {
        id: "grading-overview",
        title: "Grading Overview Page",
        features: [
          {
            title: "Bulk Grading",
            functionality: [
              "List all pending submissions across courses",
              "Filter by course or assignment",
              "Bulk actions for efficient grading"
            ],
            importance: {
              "Teacher": "Efficient workflow for managing multiple assignments"
            }
          }
        ]
      },
      {
        id: "evaluation-system",
        title: "Student Evaluation System",
        features: [
          {
            title: "Comprehensive Evaluations",
            functionality: [
              "Create evaluations per student per course with quantitative metrics (0-100 scale): Attendance, Participation, Assignment, Language Proficiency",
              "Overall Grade with trend indicator (up/down/flat)",
              "Qualitative Feedback: Overall comment, improvement suggestions",
              "Link evaluations to academic terms",
              "Evaluation categories (e.g., Mid-Term, Final)"
            ],
            importance: {
              "Teacher": "Holistic assessment beyond exam grades, crucial for language learning"
            }
          }
        ]
      },
      {
        id: "students-directory",
        title: "Students Directory",
        features: [
          {
            title: "Student Management",
            functionality: [
              "List all students enrolled in teacher's courses",
              "Quick overview: name, email, enrolled courses, overall progress",
              "Access to individual student profiles"
            ],
            importance: {
              "Teacher": "Central roster management"
            }
          }
        ]
      },
      {
        id: "student-profile-teacher",
        title: "Student Profile View",
        features: [
          {
            title: "Detailed Student View",
            functionality: [
              "View detailed student information",
              "Enrollment history and progress across courses",
              "Update editable student fields",
              "Teacher Notes: Private notes on student profiles with categories (Academic, Behavior, General)",
              "Timestamped entries with Edit/Delete capabilities",
              "Start direct message with student"
            ],
            importance: {
              "Teacher": "Personalizes instruction and tracks patterns over time"
            }
          }
        ]
      },
      {
        id: "attendance-management",
        title: "Session Attendance Management",
        features: [
          {
            title: "Attendance Control",
            functionality: [
              "View attendance for specific sessions",
              "Manual override: Mark students as Present/Absent/Late/Excused",
              "Add attendance notes",
              "View auto-logged check-in/check-out times",
              "Duration tracking per student"
            ],
            importance: {
              "Teacher": "Accuracy in attendance records with teacher discretion"
            }
          }
        ]
      },
      {
        id: "forum-moderation",
        title: "Forum Moderation",
        features: [
          {
            title: "Content Moderation",
            functionality: [
              "Pin important threads",
              "Lock heated or concluded discussions",
              "Answer student queries officially",
              "Moderate content in course-specific forums"
            ],
            importance: {
              "Teacher": "Maintains a healthy, focused learning environment"
            }
          }
        ]
      },
      {
        id: "fee-plans",
        title: "Fee Plan Management",
        features: [
          {
            title: "Course Pricing",
            functionality: [
              "Create fee plans for courses: Amount, billing cycle (Monthly/Quarterly/Fixed)",
              "Installment options",
              "View existing fee plans across courses"
            ],
            importance: {
              "Teacher": "Control over course pricing and payment structure"
            }
          }
        ]
      },
      {
        id: "teacher-calendar",
        title: "Teacher Calendar",
        features: [
          {
            title: "Schedule Management",
            functionality: [
              "Personal view of all scheduled sessions",
              "Color-coded by status",
              "Quick session creation/editing"
            ],
            importance: {
              "Teacher": "Time management and planning"
            }
          }
        ]
      }
    ]
  },
  {
    id: "admin",
    title: "Admin Features",
    icon: "admin_panel_settings",
    color: "orange",
    description: "Operational control, oversight, and strategic business management.",
    subSections: [
      {
        id: "admin-dashboard",
        title: "Admin Dashboard",
        features: [
          {
            title: "System Overview",
            functionality: [
              "System-wide statistics: Total students, teachers, courses",
              "Revenue overview",
              "Active sessions today",
              "Quick actions for common tasks",
              "Recent activity feed"
            ],
            importance: {
              "Admin": "High-level health check of the platform"
            }
          }
        ]
      },
      {
        id: "admin-students",
        title: "Students Directory",
        features: [
          {
            title: "Student Management",
            functionality: [
              "List all students on the platform",
              "Filter by verification status, enrollment status",
              "Search by name or email",
              "Verification Actions: Verify/Unverify student accounts",
              "View detailed student profiles",
              "Reset passwords, suspend accounts"
            ],
            importance: {
              "Admin": "Fundamental security and operational control"
            }
          }
        ]
      },
      {
        id: "admin-teachers",
        title: "Teachers Directory",
        features: [
          {
            title: "Teacher Management",
            functionality: [
              "List all teachers on the platform",
              "Filter by specialization, courses taught",
              "View teacher profiles and qualifications",
              "Manage teacher accounts"
            ],
            importance: {
              "Admin": "Faculty oversight and management"
            }
          }
        ]
      },
      {
        id: "audit-logs",
        title: "Audit Logs",
        features: [
          {
            title: "Activity Tracking",
            functionality: [
              "Immutable record of sensitive actions: deletions, grade changes, payment verifications, logins",
              "Details include: User ID, Action, Entity, Entity ID, Timestamp, IP Address, User Agent",
              "Filterable and searchable logs"
            ],
            importance: {
              "Admin": "Critical for accountability, security audits, and dispute resolution"
            }
          }
        ]
      },
      {
        id: "billing-settings",
        title: "Global Billing Settings",
        features: [
          {
            title: "Financial Configuration",
            functionality: [
              "Set default currency (KES/EUR)",
              "Configure default fee amount",
              "Define billing cycle defaults (Monthly/Quarterly/One-Time)",
              "Late fee policies (e.g., Roll to Next, Add Penalty)",
              "Tax rate configuration"
            ],
            importance: {
              "Admin": "Business model adaptation without code changes"
            }
          }
        ]
      },
      {
        id: "invoice-management",
        title: "Invoice Generation & Management",
        features: [
          {
            title: "Invoice Operations",
            functionality: [
              "Bulk Invoice Generation: Create invoices for all enrolled students in a term",
              "Manual Invoice Creation with custom amounts and descriptions",
              "Invoice List with status (Pending/Paid/Partial/Overdue/Failed/Refunded)",
              "Invoice Reminders: Send payment reminder notifications",
              "Invoice Notification System: Automated email notifications"
            ],
            importance: {
              "Admin": "Core revenue driver ensuring no student slips through"
            }
          }
        ]
      },
      {
        id: "revenue-dashboard",
        title: "Revenue Dashboard",
        features: [
          {
            title: "Financial Analytics",
            functionality: [
              "Visual charts of income over time",
              "Outstanding invoices summary",
              "Collection rate percentage",
              "Breakdown by: Paid, Partial, Overdue invoices",
              "Total revenue vs total outstanding"
            ],
            importance: {
              "Admin": "Financial health visibility for strategic planning"
            }
          }
        ]
      },
      {
        id: "payment-tracking",
        title: "Payment Tracking",
        features: [
          {
            title: "Transaction Management",
            functionality: [
              "View all payments received",
              "Payment method breakdown (Card, M-Pesa, Bank Transfer)",
              "Transaction references and checkout IDs",
              "Payment status tracking",
              "Webhook integration for real-time updates (Intasend)"
            ],
            importance: {
              "Admin": "Reconciliation and financial accuracy"
            }
          }
        ]
      },
      {
        id: "admin-courses",
        title: "Courses Management",
        features: [
          {
            title: "Content Oversight",
            functionality: [
              "View all courses on the platform",
              "Filter by status (Draft/Published/Archived), level, teacher",
              "Course analytics and enrollment counts",
              "Administrative actions on courses"
            ],
            importance: {
              "Admin": "Quality control and content oversight"
            }
          }
        ]
      },
      {
        id: "term-management",
        title: "Term Management",
        features: [
          {
            title: "Academic Terms",
            functionality: [
              "Define academic terms (name, start/end dates)",
              "Set current active term",
              "View term history",
              "Link evaluations and invoices to terms"
            ],
            importance: {
              "Admin": "Structures the academic year for reporting and enrollment cycles"
            }
          }
        ]
      },
      {
        id: "system-reports",
        title: "System Reports Generation",
        features: [
          {
            title: "Reporting Suite",
            functionality: [
              "Generate aggregate reports: Academic Summary, Financial Statement, Attendance Summary, Student Progress",
              "Report formats: PDF, Excel",
              "Report status tracking (Processing/Ready/Failed)",
              "Downloadable report storage",
              "KPIs dashboard: Average grade, attendance rate, revenue, active classrooms"
            ],
            importance: {
              "Admin": "Mandatory for compliance, board reporting, and decision making"
            }
          }
        ]
      },
      {
        id: "broadcast-center",
        title: "Broadcast Center",
        features: [
          {
            title: "Mass Communication",
            functionality: [
              "Compose and send system-wide notifications",
              "Target audience: All Users, All Students, All Teachers, Course-Specific",
              "Alert types: Information, Warning, Success, Critical",
              "Live Preview before sending",
              "Recipient count tracking"
            ],
            importance: {
              "Admin": "Efficient mass communication for announcements and alerts"
            }
          }
        ]
      },
      {
        id: "testimonials-management",
        title: "Testimonials Management",
        features: [
          {
            title: "Social Proof Control",
            functionality: [
              "Review submitted student testimonials",
              "Approve/Reject testimonials",
              "Feature testimonials on public landing page (limit of 3)",
              "Star rating display",
              "Delete inappropriate testimonials"
            ],
            importance: {
              "Admin": "Controls brand narrative and social proof"
            }
          }
        ]
      },
      {
        id: "system-settings",
        title: "System Settings",
        features: [
          {
            title: "Platform Configuration",
            functionality: [
              "Configure platform basics: System name, support email, max students per class, default currency",
              "Notification Settings: Global toggles for notification channels",
              "Integration Settings: API keys for Jitsi, payment gateway, email provider"
            ],
            importance: {
              "Admin": "Reduces reliance on developers for configuration changes"
            }
          }
        ]
      }
    ]
  },
  {
    id: "public",
    title: "Public & Marketing Features",
    icon: "language",
    color: "green",
    description: "For prospective students and SEO optimization.",
    subSections: [
      {
        id: "landing",
        title: "Landing Page",
        features: [
          {
            title: "Homepage",
            functionality: [
              "Professional homepage with hero section and call-to-action",
              "Feature highlights",
              "Course level overview (A1-C2)",
              "Student testimonials carousel",
              "Platform statistics (students, courses, teachers)",
              "Registration and login links"
            ],
            importance: {
              "Business": "First impression and conversion for prospective students"
            }
          }
        ]
      },
      {
        id: "public-catalog",
        title: "Public Course Catalog",
        features: [
          {
            title: "Course Discovery",
            functionality: [
              "Browse all published courses without login",
              "Filter by level",
              "Course preview with basic details",
              "Registration prompt for enrollment"
            ],
            importance: {
              "Business": "Lead generation and course discovery"
            }
          }
        ]
      },
      {
        id: "course-details",
        title: "Course Detail Pages",
        features: [
          {
            title: "Detailed Information",
            functionality: [
              "Complete course information: description, learning outcomes",
              "Module breakdown",
              "Teacher information",
              "Price and duration",
              "Session schedule preview",
              "Resource preview (limited)",
              "Enrollment call-to-action"
            ],
            importance: {
              "Business": "Informed decision-making for prospective students"
            }
          }
        ]
      },
      {
        id: "legal-pages",
        title: "About/Privacy/Terms Pages",
        features: [
          {
            title: "Legal & Information",
            functionality: [
              "About Us page with school mission and vision",
              "Privacy Policy (GDPR-compliant)",
              "Terms of Service"
            ],
            importance: {
              "Business": "Legal compliance and trust building"
            }
          }
        ]
      },
      {
        id: "seo",
        title: "SEO Optimization",
        features: [
          {
            title: "Search Engine Optimization",
            functionality: [
              "Proper meta tags, title tags, descriptions",
              "OpenGraph and Twitter cards for social sharing",
              "Sitemap generation",
              "robots.txt configuration",
              "Web manifest for PWA capability"
            ],
            importance: {
              "Business": "Discoverability and professional web presence"
            }
          }
        ]
      }
    ]
  },
  {
    id: "technical",
    title: "Technical Infrastructure",
    icon: "code",
    color: "slate",
    description: "The technology stack powering the platform.",
    subSections: [
      {
        id: "file-storage",
        title: "File Upload & Storage",
        features: [
          {
            title: "Storage Solutions",
            functionality: [
              "Secure file uploads via API routes",
              "DigitalOcean Spaces / S3 for documents, PDFs, videos",
              "Cloudinary for images and avatar uploads",
              "Vercel Blob for lightweight document storage",
              "File size and type validation",
              "Secure signed URLs for downloads"
            ],
            importance: {
              "System": "Reliable content delivery and storage"
            }
          }
        ]
      },
      {
        id: "payment-gateway",
        title: "Payment Gateway (Intasend)",
        features: [
          {
            title: "Payment Processing",
            functionality: [
              "Mobile Money (M-Pesa) support",
              "Card payment processing",
              "Webhook handlers for payment status updates",
              "Secure checkout flow",
              "Transaction logging"
            ],
            importance: {
              "System": "Revenue collection with local payment methods"
            }
          }
        ]
      },
      {
        id: "email-service",
        title: "Email Service (Resend)",
        features: [
          {
            title: "Transactional Emails",
            functionality: [
              "Email verification, password reset",
              "Payment confirmations, invoice notifications",
              "Session reminders",
              "Templated, branded emails"
            ],
            importance: {
              "System": "Reliable communication channel"
            }
          }
        ]
      },
      {
        id: "video-conferencing",
        title: "Video Conferencing (Jitsi)",
        features: [
          {
            title: "Virtual Classroom Tech",
            functionality: [
              "Embedded video conferencing",
              "Configurable Jitsi domain",
              "JWT-based session security",
              "Integration with attendance tracking"
            ],
            importance: {
              "System": "Core virtual classroom functionality"
            }
          }
        ]
      },
      {
        id: "api-architecture",
        title: "API Architecture",
        features: [
          {
            title: "Backend Structure",
            functionality: [
              "RESTful API routes organized by role and feature",
              "Authentication middleware for protected endpoints",
              "Standardized API response format",
              "Error handling and validation"
            ],
            importance: {
              "System": "Scalable, maintainable backend structure"
            }
          }
        ]
      },
      {
        id: "database",
        title: "Database (PostgreSQL + Prisma)",
        features: [
          {
            title: "Data Management",
            functionality: [
              "Comprehensive data model covering all entities",
              "Type-safe database access via Prisma",
              "Migrations for schema versioning",
              "Seed data for development/testing"
            ],
            importance: {
              "System": "Data integrity and developer productivity"
            }
          }
        ]
      }
    ]
  }
];

// Value proposition data
const valueProposition = [
  {
    role: "Student",
    icon: "school",
    color: "indigo",
    value: "Convenience & clarity. A single portal for learning, paying, and tracking progress without administrative friction. Complete visibility into attendance, grades, evaluations, and billing."
  },
  {
    role: "Teacher",
    icon: "person_search",
    color: "purple",
    value: "Efficiency & Autonomy. Tools that automate low-value tasks (attendance tracking, progress calculation) and empower high-value tasks (curriculum design, personalized feedback, holistic evaluation)."
  },
  {
    role: "Admin",
    icon: "admin_panel_settings",
    color: "orange",
    value: "Control & Insight. Complete oversight of the business's academic and financial health with tools to enforce policy, manage users, and generate compliance-ready reports."
  }
];

const colorClasses: { [key: string]: { bg: string; text: string; border: string; light: string } } = {
  blue: { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500", light: "bg-blue-50 dark:bg-blue-900/20" },
  indigo: { bg: "bg-indigo-500", text: "text-indigo-500", border: "border-indigo-500", light: "bg-indigo-50 dark:bg-indigo-900/20" },
  purple: { bg: "bg-purple-500", text: "text-purple-500", border: "border-purple-500", light: "bg-purple-50 dark:bg-purple-900/20" },
  orange: { bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-500", light: "bg-orange-50 dark:bg-orange-900/20" },
  green: { bg: "bg-green-500", text: "text-green-500", border: "border-green-500", light: "bg-green-50 dark:bg-green-900/20" },
  slate: { bg: "bg-slate-500", text: "text-slate-500", border: "border-slate-500", light: "bg-slate-50 dark:bg-slate-900/20" },
};

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState("system-wide");
  const [expandedSubSections, setExpandedSubSections] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      
      for (const section of documentationData) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = sectionRefs.current[id];
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setIsMobileNavOpen(false);
  };

  const toggleSubSection = (id: string) => {
    setExpandedSubSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Filter sections based on search
  const filteredSections = searchQuery
    ? documentationData.map(section => ({
        ...section,
        subSections: section.subSections.filter(sub =>
          sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.features.some(f => 
            f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.functionality.some(func => func.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        )
      })).filter(s => s.subSections.length > 0)
    : documentationData;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6"
            >
              <span className="material-symbols-outlined text-lg">menu_book</span>
              Platform Documentation
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6"
            >
              German Virtual School
              <br />
              <span className="text-white/80">Features & Functionality</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-8"
            >
              Comprehensive documentation of 66+ features powering the platform for Students, Teachers, and Administrators.
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6 md:gap-10"
            >
              {[
                { label: "Total Features", value: "66+", icon: "category" },
                { label: "User Roles", value: "3", icon: "groups" },
                { label: "Sections", value: "6", icon: "folder" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                  <span className="material-symbols-outlined text-2xl text-white/70">{stat.icon}</span>
                  <div className="text-left">
                    <div className="text-2xl font-black">{stat.value}</div>
                    <div className="text-xs text-white/60 uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Navigation */}
              <nav className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Sections</h3>
                <ul className="space-y-1">
                  {documentationData.map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                          activeSection === section.id
                            ? `${colorClasses[section.color].light} ${colorClasses[section.color].text}`
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className={`material-symbols-outlined text-lg ${activeSection === section.id ? colorClasses[section.color].text : ""}`}>
                          {section.icon}
                        </span>
                        {section.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Quick Links */}
              <div className="bg-gradient-to-br from-primary/10 to-indigo-500/10 dark:from-primary/20 dark:to-indigo-500/20 rounded-2xl p-5 border border-primary/20">
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">rocket_launch</span>
                  Get Started
                </h4>
                <div className="space-y-2">
                  <Link href="/reserve-seat" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                    Reserve a Seat
                  </Link>
                  <Link href="/courses" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                    Browse Courses
                  </Link>
                  <Link href="/about" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                    About Us
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Navigation Toggle */}
          <div className="lg:hidden fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center"
            >
              <span className="material-symbols-outlined">
                {isMobileNavOpen ? "close" : "menu"}
              </span>
            </button>
          </div>

          {/* Mobile Navigation Panel */}
          <AnimatePresence>
            {isMobileNavOpen && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="lg:hidden fixed inset-x-4 bottom-24 z-40 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-4 max-h-[60vh] overflow-y-auto"
              >
                <div className="relative mb-4">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm focus:outline-none"
                  />
                </div>
                <ul className="space-y-1">
                  {documentationData.map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                          activeSection === section.id
                            ? `${colorClasses[section.color].light} ${colorClasses[section.color].text}`
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">{section.icon}</span>
                        {section.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-16">
            {filteredSections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                ref={(el) => { sectionRefs.current[section.id] = el; }}
                className="scroll-mt-24"
              >
                {/* Section Header */}
                <div className={`flex items-center gap-4 mb-8 pb-4 border-b ${colorClasses[section.color].border} border-opacity-30`}>
                  <div className={`w-12 h-12 ${colorClasses[section.color].bg} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    <span className="material-symbols-outlined text-2xl">{section.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                      {section.title}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{section.description}</p>
                  </div>
                </div>

                {/* Sub-sections */}
                <div className="space-y-4">
                  {section.subSections.map((subSection) => (
                    <div
                      key={subSection.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <button
                        onClick={() => toggleSubSection(subSection.id)}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${colorClasses[section.color].bg}`} />
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {subSection.title}
                          </h3>
                        </div>
                        <span className={`material-symbols-outlined text-slate-400 transition-transform ${expandedSubSections.has(subSection.id) ? "rotate-180" : ""}`}>
                          expand_more
                        </span>
                      </button>

                      <AnimatePresence>
                        {expandedSubSections.has(subSection.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 pt-0 space-y-4">
                              {subSection.features.map((feature, idx) => (
                                <div key={idx} className="space-y-3">
                                  {/* Functionality List */}
                                  <div className={`rounded-xl p-4 ${colorClasses[section.color].light}`}>
                                    <h4 className={`text-sm font-bold ${colorClasses[section.color].text} uppercase tracking-wider mb-3 flex items-center gap-2`}>
                                      <span className="material-symbols-outlined text-base">checklist</span>
                                      Functionality
                                    </h4>
                                    <ul className="space-y-2">
                                      {feature.functionality.map((func, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                          <span className={`material-symbols-outlined text-base ${colorClasses[section.color].text} mt-0.5`}>
                                            check_circle
                                          </span>
                                          {func}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Importance */}
                                  {feature.importance && (
                                    <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50">
                                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-base">lightbulb</span>
                                        Why It Matters
                                      </h4>
                                      <div className="space-y-2">
                                        {Object.entries(feature.importance).map(([role, text]) => (
                                          <div key={role} className="flex items-start gap-2">
                                            <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                                              {role}
                                            </span>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{text}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Value Proposition Section */}
            <section className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-primary border-opacity-30">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                  <span className="material-symbols-outlined text-2xl">diamond</span>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                    Value Proposition
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">What each role gains from the platform</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {valueProposition.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative overflow-hidden rounded-2xl p-6 ${colorClasses[item.color].light} border ${colorClasses[item.color].border} border-opacity-30`}
                  >
                    <div className={`w-12 h-12 ${colorClasses[item.color].bg} rounded-xl flex items-center justify-center text-white mb-4`}>
                      <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                    </div>
                    <h3 className={`text-xl font-black ${colorClasses[item.color].text} mb-3`}>{item.role}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Feature Summary */}
            <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-black mb-8 text-center">Feature Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[
                  { label: "System-Wide Core", count: 8, icon: "settings_suggest", color: "blue" },
                  { label: "Student Features", count: 18, icon: "school", color: "indigo" },
                  { label: "Teacher Features", count: 15, icon: "person_search", color: "purple" },
                  { label: "Admin Features", count: 14, icon: "admin_panel_settings", color: "orange" },
                  { label: "Public Features", count: 5, icon: "language", color: "green" },
                  { label: "Technical Infrastructure", count: 6, icon: "code", color: "slate" },
                ].map((cat, idx) => (
                  <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center">
                    <span className={`material-symbols-outlined text-3xl mb-2 ${colorClasses[cat.color].text}`}>
                      {cat.icon}
                    </span>
                    <div className="text-3xl font-black">{cat.count}</div>
                    <div className="text-xs text-white/60 uppercase tracking-wider">{cat.label}</div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8 pt-8 border-t border-white/10">
                <div className="text-5xl md:text-6xl font-black text-primary">66+</div>
                <div className="text-sm text-white/60 uppercase tracking-widest mt-2">Total Distinct Features</div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 left-6 w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary transition-colors z-40"
      >
        <span className="material-symbols-outlined">arrow_upward</span>
      </button>
    </div>
  );
}

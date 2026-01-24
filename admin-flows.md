# Admin User Flows

This document outlines the complete user journey for an Administrator on the German Virtual School (GVS) platform.

## 1. User Management

### 1.1 Student Administration
- **Route**: `/admin/students`
- **Verification**:
  - Filter by `Status: Unverified`.
  - Review student details.
  - Action: Click "Verify" to unlock full platform access.
- **Oversight**:
  - View enrollment history and payment status (Arrears).
  - Reset passwords (if implemented) or update profile details.

### 1.2 Teacher Administration
- **Route**: `/admin/teachers`
- **Oversight**:
  - Monitor performance (Student count, Revenue generated).
  - View created courses.
- **Actions**:
  - Deactivate accounts (e.g., if leaving).
  - Invite new teachers (if invite-only system).

### 1.3 Role Management
- **Route**: `/admin/users` (General User List)
- **Action**: Assign/Revoke `ADMIN` privileges to other users.

---

## 2. System Configuration

### 2.1 General Settings
- **Route**: `/admin/settings`
- **Configurable Items**:
  - School Name & Support Email.
  - **Billing**: Default Currency, Tax Rates.
  - **Classroom**: Max students per class limits.

### 2.2 Integrations
- **Route**: `/admin/settings#integrations`
- **Video**: Configure Jitsi Meet domain.
- **Payment**: Set Intasend Public Key/API secrets.

---

## 3. Financial Oversight

### 3.1 Revenue Monitoring
- **Route**: `/admin/finance`
- **Dashboard**: High-level view of Total Revenue, Monthly Recurring Revenue (MRR), and Outstanding Arrears.
- **Transactions**: View real-time log of payments via Intasend.

### 3.2 Invoice Management
- **Route**: `/admin/finance/invoices`
- **Actions**:
  - Manually generate invoices.
  - Mark invoices as `PAID` / `VOID` (manual override).
  - Send payment reminders to students with overdue balances.

### 3.3 Payroll
- **Route**: `/admin/finance/payouts`
- **Action**: Process teacher payouts based on completed sessions/revenue share.

---

## 4. Content & Academic Oversight

### 4.1 Course Moderation
- **Route**: `/admin/courses`
- **Action**:
  - Review new courses submitted by teachers.
  - **Publish**: Approve course to go live on the marketplace.
  - **Reject**: Send back for edits with comments.

### 4.2 Reports & Analytics
- **Route**: `/admin/reports`
- **Generate**:
  - **Academic**: Student performance summaries, Attendance rates.
  - **Financial**: Quarterly revenue reports.
- **Audit Logs**: Trace system actions (Who did what when) via the audit log viewer.

---

## 5. Security & Compliance

### 5.1 Audit Logs
- **Route**: `/admin/audit` (or integrated into Reports).
- **View**: System-wide log of critical actions (Verifications, Settings Changes, User Deletions).

### 5.2 Data Management
- **Action**: Handle GDPR data export/deletion requests.

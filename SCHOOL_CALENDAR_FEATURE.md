# School Calendar & Enrollment Settings Feature

## Summary

This feature allows administrators to configure school calendar dates and automatically restrict student registrations outside the enrollment period.

### What Was Implemented

**Database Changes:**
- Added 5 new date fields to `SystemSettings` model in Prisma:
  - `enrollmentStartDate` - When registration opens
  - `enrollmentEndDate` - When registration closes
  - `orientationDate` - Student orientation day
  - `firstClassDate` - When classes begin
  - `lastClassDate` - When classes end

**Backend APIs:**
- Updated `/api/admin/settings` - GET/PATCH now include calendar fields
- Created `/api/school/calendar` - Public endpoint returning calendar info + enrollment status
- Updated `/api/auth/register` - Blocks student registration when enrollment is closed
- Updated `/api/student/term/register` - Blocks term registration when enrollment is closed

**Admin UI:**
- New "School Calendar" section in `/admin/settings`
- Date inputs for all 5 calendar fields
- Live enrollment status indicator (Open/Closed/Not Started)

**Student Registration:**
- RegisterForm now checks enrollment status on load
- Displays informative message when enrollment is closed
- Shows orientation and first class dates when available

---

## How to Test

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test Admin Calendar Settings

1. Log in as an **Admin** user
2. Navigate to `/admin/settings`
3. Scroll down to find the **School Calendar** section
4. You should see:
   - Enrollment status indicator (green/amber/red)
   - 5 date input fields
5. Set the following dates per client requirements:
   - **Enrollment Start Date**: 2026-02-02 (today)
   - **Enrollment End Date**: 2026-02-13
   - **Orientation Date**: 2026-02-18
   - **First Class Date**: 2026-02-23
   - **Last Class Date**: 2026-02-24
6. Click **Save Settings**
7. Refresh the page - dates should persist

### 3. Test Enrollment Restrictions (Enrollment Open)

1. While enrollment dates are valid (today is within start/end range):
2. Open an incognito/private browser window
3. Navigate to `/register`
4. The registration form should display normally
5. You should be able to register a new student account

### 4. Test Enrollment Restrictions (Enrollment Closed)

1. As Admin, go to `/admin/settings`
2. Set **Enrollment End Date** to yesterday (e.g., 2026-02-01)
3. Save settings
4. Open an incognito window and navigate to `/register`
5. Instead of the registration form, you should see:
   - "Enrollment is Currently Closed" message
   - The enrollment closed date
   - Orientation and First Class dates (if set)
   - A "Sign In" button for existing users

### 5. Test Public Calendar API

```bash
curl http://localhost:3000/api/school/calendar
```

Expected response includes:
- All 5 date fields
- `isEnrollmentOpen`: boolean
- `enrollmentMessage`: human-readable status

---

## Files Modified

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added 5 calendar date fields to SystemSettings |
| `app/api/admin/settings/route.ts` | Handle calendar fields in GET/PATCH |
| `app/api/school/calendar/route.ts` | New public calendar endpoint |
| `app/api/auth/register/route.ts` | Enrollment validation for students |
| `app/api/student/term/register/route.ts` | Enrollment validation for term registration |
| `app/admin/settings/page.tsx` | School Calendar UI section |
| `src/components/auth/RegisterForm.tsx` | Enrollment status check & closed message |
| `src/components/shared/SchoolCalendarCard.tsx` | **NEW** - Reusable calendar widget |
| `app/student/(dashboard)/dashboard/page.tsx` | Added SchoolCalendarCard to sidebar |
| `app/teacher/dashboard/page.tsx` | Added SchoolCalendarCard to sidebar |

---

## Client Requirements Mapping

| Requirement | Implementation |
|-------------|----------------|
| Enrollment Start: Feb 2 | Set via Admin Settings → enrollmentStartDate |
| Enrollment End: Feb 13 | Set via Admin Settings → enrollmentEndDate |
| Orientation: Feb 18 | Set via Admin Settings → orientationDate |
| First Class: Feb 23 | Set via Admin Settings → firstClassDate |
| Last Class: Feb 24 | Set via Admin Settings → lastClassDate |
| School Fees: 38,000/semester | Already exists in Finance Settings → defaultFee |
| Block registration after enrollment | Automatic based on enrollmentEndDate |

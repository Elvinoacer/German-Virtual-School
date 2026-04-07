Yes — there are two separate problems here.

First, the marketer dashboard is using the wrong commission defaults.
Second, your seat-reservation enforcement is incomplete, so a student can still get into the system through some paths without a paid reservation.

## 1) Quick fix for the marketer dashboard

The `$500` and `$1,500` values are coming from code defaults, not from a properly persisted admin setting.

### Broken spots

`app/api/marketer/dashboard/route.ts`

- fallback is `500` and `1500`

`app/api/webhooks/intasend/route.ts`

- reservation commission fallback is `500`
- full payment commission fallback is `1500`

`app/admin/settings/page.tsx`

- frontend defaults are `"500"` and `"1500"`

`app/api/admin/settings/route.ts`

- **critical bug:** it does not save `reservationCommission` and `fullPaymentCommission` at all

So even if admin changes the fees, those values are never persisted by the backend.

## What to change immediately

### A. Save commission settings in admin API

In `app/api/admin/settings/route.ts`, add these fields to both `update` and `create`:

```ts
reservationCommission:
  body.reservationCommission !== undefined
    ? (body.reservationCommission ? Number(body.reservationCommission) : null)
    : undefined,

fullPaymentCommission:
  body.fullPaymentCommission !== undefined
    ? (body.fullPaymentCommission ? Number(body.fullPaymentCommission) : null)
    : undefined,
```

And in `create`:

```ts
reservationCommission: body.reservationCommission ? Number(body.reservationCommission) : 5,
fullPaymentCommission: body.fullPaymentCommission ? Number(body.fullPaymentCommission) : 15,
```

### B. Fix frontend defaults

In `app/admin/settings/page.tsx` change:

- `"500"` → `"5"`
- `"1500"` → `"15"`

Also change placeholders:

- `placeholder="500"` → `placeholder="5"`
- `placeholder="1500"` → `placeholder="15"`

### C. Fix marketer dashboard fallback

In `app/api/marketer/dashboard/route.ts` change:

```ts
ratePerStudent: systemSettings?.reservationCommission
  ? Number(systemSettings.reservationCommission)
  : 5;
```

and

```ts
ratePerStudent: systemSettings?.fullPaymentCommission
  ? Number(systemSettings.fullPaymentCommission)
  : 15;
```

### D. Fix webhook fallback

In `app/api/webhooks/intasend/route.ts` change:

```ts
const commissionAmount = settings?.reservationCommission
  ? Number(settings.reservationCommission)
  : 5;
```

and

```ts
const commissionAmount = settings?.fullPaymentCommission
  ? Number(settings.fullPaymentCommission)
  : 15;
```

---

## 2) Why people are still joining without paying reservation fee

Your credentials registration route already checks for a paid reservation.

That part is fine:

- `app/api/auth/register/route.ts`

But there are other entry points that bypass the rule.

## The real loopholes

### A. Google OAuth bypasses reservation payment

This is the biggest hole.

In `src/lib/auth.config.ts`:

- Google users are created with `role: "STUDENT"`
- `signIn()` returns `true`
- there is **no paid seat reservation check** before allowing sign-in
- `createUser` then creates `StudentProfile`

So someone can click “Continue with Google” and become a student account holder without paying reservation.

### Fix

Do not allow Google student sign-up unless a paid reservation exists for that email.

Add a shared guard:

```ts
async function hasPaidSeatReservation(email: string) {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "system-settings" },
    select: { intakeLabel: true },
  });

  const intakeLabel = settings?.intakeLabel || "May 2026";

  const reservation = await prisma.seatReservation.findFirst({
    where: {
      email: email.toLowerCase().trim(),
      intakeLabel,
      status: "PAID",
    },
    select: { id: true },
  });

  return !!reservation;
}
```

Then inside `callbacks.signIn` in `src/lib/auth.config.ts`:

```ts
if (account?.provider === "google" && user?.email) {
  const allowed = await hasPaidSeatReservation(user.email);
  if (!allowed) {
    return false;
  }
}
```

### Stronger fix

Also remove Google button from registration and login until this is enforced server-side.

Files:

- `src/components/auth/RegisterForm.tsx`
- `src/components/auth/LoginForm.tsx`

---

### B. Student semester registration bypasses reservation payment

`app/api/student/term/register/route.ts`

This route lets any authenticated student register for the semester and generate an invoice, but it does **not** check paid seat reservation.

That means a student account created through a loophole can continue deeper into the system.

### Fix

Before creating `termRegistration`, enforce paid reservation using the same shared helper.

---

### C. Course enrollment bypasses reservation payment

`app/api/courses/[courseId]/enroll/route.ts`

This route lets any authenticated student enroll in a course without checking paid seat reservation.

So even if registration had a rule, this endpoint still allows progression into core academic records.

### Fix

Before `prisma.enrollment.create`, enforce the same paid-reservation check.

---

### D. Public success page trusts query string, not payment confirmation

`app/(public)/reserve-seat/page.tsx`

This is also a bug:

```ts
const [success, setSuccess] = useState(statusFromUrl === "success");
```

So `/reserve-seat?status=success` shows “Seat Reserved Successfully!” even if webhook never confirmed payment.

That is not what caused the actual enrollment bypass, but it absolutely misleads users and staff.

### Fix

Do not show success from URL param alone.

Instead:

- redirect IntaSend back with `reservationId`
- call your backend to fetch reservation
- show success only if reservation status is `PAID`

Example:

```ts
const reservationId = searchParams.get("reservationId");
```

Then fetch:

```ts
GET /api/seat-reservation?id=...
```

and only render success when backend returns `status === 'PAID'`.

Also change checkout redirect from:

```ts
redirect_url: `${APP_URL}/reserve-seat?status=success`;
```

to something like:

```ts
redirect_url: `${APP_URL}/reserve-seat/verify?reservationId=${reservation.id}`;
```

---

## 3) Where reservation payment must be enforced

These are the places I would lock immediately:

### Hard enforcement points

1. `app/api/auth/register/route.ts`
   - already enforced for email/password student registration
   - keep it

2. `src/lib/auth.config.ts`
   - enforce for Google OAuth sign-in
   - this is missing now

3. `app/api/student/term/register/route.ts`
   - add enforcement

4. `app/api/courses/[courseId]/enroll/route.ts`
   - add enforcement

### Soft enforcement / UI blocking

5. `src/components/auth/RegisterForm.tsx`
   - hide or disable Google sign-up unless reservation exists
   - but server enforcement must still remain

6. `src/components/auth/LoginForm.tsx`
   - if you keep Google login, server must block new unpaid users

7. `app/(public)/reserve-seat/page.tsx`
   - stop showing fake success based on query params

---

## 4) Best structural fix

Do not repeat this logic in 4 places manually.

Create one central helper, for example:

`src/lib/seat-reservation-guard.ts`

```ts
import { prisma } from "@/lib/prisma";

export async function requirePaidSeatReservation(
  email?: string,
  userId?: string,
) {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "system-settings" },
    select: { intakeLabel: true },
  });

  const intakeLabel = settings?.intakeLabel || "May 2026";

  const reservation = await prisma.seatReservation.findFirst({
    where: {
      intakeLabel,
      status: "PAID",
      OR: [
        ...(email ? [{ email: email.toLowerCase().trim() }] : []),
        ...(userId ? [{ userId }] : []),
      ],
    },
    select: { id: true, email: true, userId: true },
  });

  if (!reservation) {
    throw new Error("PAID_SEAT_RESERVATION_REQUIRED");
  }

  return reservation;
}
```

Then use it in:

- auth register
- google sign-in
- term registration
- course enrollment

---

## 5) Webhook/payment flow recommendations

Your overall idea is correct:

- initialize payment
- redirect to checkout URL
- IntaSend webhook is source of truth
- only webhook should mark payment complete

That part is the right model.

But tighten it like this:

### Required rules

- never grant access from redirect URL alone
- only grant access when webhook marks `SeatReservation.status = 'PAID'`
- use `api_ref` strictly
- keep webhook idempotent
- reject any access decision based on `PROCESSING`, `PENDING`, or frontend success states

### State model to keep

For reservation:

- `PENDING`
- `PAID`
- `EXPIRED`
- `REFUNDED`

Only `PAID` should unlock registration/enrollment.

---

## 6) My priority order for you

Do these in this order:

### Today, immediate hotfix

1. Fix commission defaults to `5` and `15`
2. Fix admin settings API so those commission fields are actually saved
3. Disable Google sign-up/sign-in for students until reservation check is enforced server-side
4. Add reservation check to:
   - `/api/student/term/register`
   - `/api/courses/[courseId]/enroll`

5. Remove fake success state from `/reserve-seat?status=success`

### Next pass

6. Centralize reservation enforcement in one helper
7. Add audit logging whenever access is denied for unpaid reservation
8. Add admin report of:
   - accounts created without paid reservation
   - term registrations without paid reservation
   - course enrollments without paid reservation

---

## 7) Bottom line

The two root causes are:

- **commission settings bug:** admin settings backend never persists marketer commission values, and the app falls back to `500/1500`
- **reservation enforcement gap:** credentials registration checks payment, but **Google OAuth, semester registration, and course enrollment do not**

That is why people are still getting in without paying.

Based on the code provided, you are facing two major issues:

1. **The Security Loophole (Bypassing the Fee):** The backend API blindly trusts the frontend when it says onboarding is complete, allowing users to bypass the IntaSend payment gateway entirely.
2. **Hardcoded Fees (Lack of Admin Control):** The onboarding fees are hardcoded as `PAYMENT_AMOUNTS.ONBOARDING_FEE` in the backend and `KES 500` in the frontend, preventing the admin from changing them via the dashboard.

Here is the comprehensive guide and the code required to fix all these issues.

### Issue 1: Closing the Seat Reservation Bypass Loophole

Currently, your onboarding API (`src/app/api/users/onboarding/route.ts`) extracts `onboardingCompleted` directly from the client's request body (`Boolean(body?.onboardingCompleted)`) and saves it to the database. If a user modifies the network request or forces the frontend to skip the payment step, the system lets them in without checking if they actually paid.

**The Fix:** We must add server-side validation to ensure `onboardingCompleted` cannot be set to `true` for Providers/Marketers unless their `Profile` shows the fee was paid or waived.

**Update `src/app/api/users/onboarding/route.ts`:**
Find the section where `updatedUser` is created (around line 409), and insert this validation block _right before_ the `prisma.user.update` call:

```typescript
    // NEW FIX: Enforce seat reservation fee payment before allowing enrollment completion
    if (onboardingCompleted && (role === "PROVIDER" || role === "MARKETER")) {
      const profileState = await prisma.profile.findUnique({
        where: { userId: actingUser.id },
        select: { hasPaidOnboardingFee: true, onboardingFeeWaived: true }
      });

      if (!profileState?.hasPaidOnboardingFee && !profileState?.onboardingFeeWaived) {
        return NextResponse.json(
          { error: "Illegal action: Seat reservation fee must be paid before completing enrollment." },
          { status: 403 }
        );
      }
    }

    // Existing code...
    const updatedUser = await prisma.user.update({
      where: { id: actingUser.id },
      data: {
        role,
        onboardingCompleted,
        // ... rest of the data
```

### Issue 2: Making the Fees Admin-Configurable

Your application uses a hardcoded `PAYMENT_AMOUNTS.ONBOARDING_FEE` constant and hardcodes "KES 500" in the UI. We need to integrate this into your `SystemSetting` table.

**Step 1: Add the Settings to the Admin Dashboard**
In `src/components/admin/EnhancedSystemSettings.tsx`, add the onboarding fees to your `defaultSettings` array so the admin can edit them:

```typescript
    {
      key: "provider_onboarding_fee",
      defaultValue: 15, // Or your KES equivalent
      description: "Seat reservation fee for service providers",
      type: "number",
      icon: DollarSign,
      category: "Finance",
      unit: "USD",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      key: "marketer_onboarding_fee",
      defaultValue: 5,
      description: "Seat reservation fee for marketers",
      type: "number",
      icon: DollarSign,
      category: "Finance",
      unit: "USD",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    }
```

**Step 2: Update the IntaSend Initiation API**
Modify `src/app/api/onboarding-fee/initiate/route.ts` to fetch the dynamic fee instead of the hardcoded constant:

```typescript
// Fetch dynamic fee from SystemSettings
const feeSetting = await prisma.systemSetting.findUnique({
  where: { key: "provider_onboarding_fee" }, // Determine dynamically based on role if needed
});

// Fallback to 15 if not set by admin
const amountToPay =
  feeSetting && feeSetting.value ? Number(feeSetting.value) : 15;

// Generate API reference
const apiRef = generateApiRef("ONBOARD", session.user.id);
const baseUrl = getBaseUrl();
const redirectUrl = `${baseUrl}/dashboard/onboarding-complete`;

const collection = getCollectionService();

// Use amountToPay in IntaSend payload
const response = await collection.charge({
  first_name: session.user.name?.split(" ")[0] || "User",
  last_name: session.user.name?.split(" ").slice(1).join(" ") || "",
  email: session.user.email || "",
  amount: amountToPay, // <-- Dynamic Admin value
  currency: "USD", // Update to KES if dealing with local currency
  api_ref: apiRef,
  redirect_url: redirectUrl,
});
```

**Step 3: Update the Webhook to Check Against the Dynamic Value**
In `src/app/api/onboarding-fee/webhook/route.ts`, the webhook rejects payments if `amount < PAYMENT_AMOUNTS.ONBOARDING_FEE`. You must fetch the system setting here as well so partial payments aren't accidentally triggered by changing the fee:

```typescript
// Fetch dynamic fee to validate the incoming webhook amount
const feeSetting = await tx.systemSetting.findUnique({
  where: { key: "provider_onboarding_fee" },
});
const expectedAmount =
  feeSetting && feeSetting.value ? Number(feeSetting.value) : 15;

if (amount < expectedAmount) {
  // ... execute the existing partial payment logic
}
```

**Step 4: Update the Frontend UI**
Currently, `src/components/revenue/OnboardingFeeModal.tsx` hardcodes the display value to `KES 500`. You should fetch the system setting on the parent page and pass it down as a prop:

```tsx
interface OnboardingFeeModalProps {
  isOpen: boolean;
  userName: string;
  feeAmount: number; // Add this prop
  currency: string; // Add this prop
}

// Inside the component return:
<div className="bg-gray-50 py-3 rounded-lg mb-4 border border-gray-100">
  <span className="text-sm text-gray-500">One-time Reservation Fee</span>
  <div className="text-3xl font-bold text-emerald-700">
    {currency} {feeAmount}
  </div>
</div>;
```

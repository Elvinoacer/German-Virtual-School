# GVS Currency Migration Plan: KES → USD ($)
> German Virtual School — Full codebase audit & fix plan  
> Prepared after scanning all `.ts`, `.tsx`, `.js`, `.prisma` files  
> **Total touch points: 38 files / 90+ individual changes**

---

## Overview

The goal is to convert every user-facing and system-level currency reference from **KES / KSH (Kenyan Shilling)** to **USD ($)**, and to update the **IntaSend payment gateway** to charge in USD via card payment only (dropping M-Pesa as a checkout method for tuition payments).

This plan is grouped into 5 logical sections:

1. [IntaSend Service & API Routes](#1-intasend-service--api-routes)
2. [Prisma Schema & Database Defaults](#2-prisma-schema--database-defaults)
3. [Admin Pages](#3-admin-pages)
4. [Public & Student-Facing Pages](#4-public--student-facing-pages)
5. [Teacher & Marketer Pages + Notification Emails](#5-teacher--marketer-pages--notification-emails)

> **Important note on M-Pesa / MPESA:**  
> There are **two separate uses** of M-Pesa in this codebase:
> - **Checkout method** — used in IntaSend's `method` parameter when generating a checkout link for student payments. This must be **removed / replaced with CARD-PAYMENT** for USD.
> - **Marketer payout method** — used in the admin/marketer payout flow (manual bank/M-Pesa transfers by admin to pay commissions). This is a separate, internal workflow. You may keep MPESA as an option here if the marketers are still based in Kenya, or remove it per client instruction. This plan **flags it** but does not mandate removal.

---

## 1. IntaSend Service & API Routes

### 1.1 `src/lib/intasend.ts`
**What to change:**

- Line 80: Change the fallback currency from `'KES'` to `'USD'`
  ```ts
  // BEFORE
  currency: data.currency || 'KES',

  // AFTER
  currency: data.currency || 'USD',
  ```
- Line 34: The `method` type union currently includes `'M-PESA'`. Keep it for type flexibility but the actual calls should now default to `'CARD-PAYMENT'`. Consider adding `'CARD-PAYMENT'` as the new default in the service, or enforce it at the call site (see routes below).

  **Recommended addition** — add a new default inside `createCheckoutLink`:
  ```ts
  // After building the payload, add:
  ...(data.method && { method: data.method }),
  // Change to:
  method: data.method || 'CARD-PAYMENT',
  ```

---

### 1.2 `app/api/invoices/[invoiceId]/pay/route.ts`
**What to change:**

- Line 67: `currency: 'KES'` → `currency: 'USD'`
- Lines 70–80: The method mapping currently handles `'M-PESA'` → `'MPESA'` enum. Since we're removing M-Pesa from checkout, this branch can be kept for backwards compatibility but should no longer be the default. Remove M-Pesa from any UI select that feeds this route (see Student Billing below).
- Line 67–70: Add `method: 'CARD-PAYMENT'` explicitly if none is passed:
  ```ts
  // BEFORE
  currency: 'KES',
  method: method as 'M-PESA' | 'CARD-PAYMENT' | undefined,

  // AFTER
  currency: 'USD',
  method: (method as 'CARD-PAYMENT') || 'CARD-PAYMENT',
  ```

---

### 1.3 `app/api/seat-reservation/route.ts`
**What to change:**

- Line 81: `currency: 'KES'` → `currency: 'USD'`
- Line 119: `currency: 'KES'` → `currency: 'USD'`
- Both calls should also add `method: 'CARD-PAYMENT'` explicitly:
  ```ts
  // BEFORE
  currency: 'KES',

  // AFTER
  currency: 'USD',
  method: 'CARD-PAYMENT',
  ```

---

### 1.4 `app/api/finance/pay/route.ts`
**What to change:**

- Line 49: `currency: 'KES'` → `currency: 'USD'`
- Add `method: 'CARD-PAYMENT'` to the payload.

---

### 1.5 `app/api/admin/settings/route.ts`
**What to change:**

- Line 26: `defaultCurrency: 'KES'` → `defaultCurrency: 'USD'`
- Line 87: `defaultCurrency: body.defaultCurrency || 'KES'` → `defaultCurrency: body.defaultCurrency || 'USD'`

---

### 1.6 `app/api/admin/finance/settings/route.ts`
**What to change:**

- Line 21: `currency: 'KES'` → `currency: 'USD'`
- Line 56: `currency: currency || 'KES'` → `currency: currency || 'USD'`

---

### 1.7 `app/api/admin/finance/generate/route.ts`
**What to change:**

- Line 128: Change log/note string from:
  ```ts
  `seat reservation KES ${Number(paidReservation.amount).toLocaleString()}`
  ```
  to:
  ```ts
  `seat reservation $${Number(paidReservation.amount).toLocaleString()}`
  ```
- Line 143: Same pattern — change `KES` → `$`:
  ```ts
  `material fee $${Number(paidMaterialInvoice.amount).toLocaleString()}`
  ```

---

### 1.8 `app/api/webhooks/intasend/route.ts`
**What to change:**

- Line 190: Log string `KSH ${commissionAmount}` → `$${commissionAmount}`
- Line 215: Email HTML `KSH ${paidAmount.toLocaleString()}` → `$${paidAmount.toLocaleString()}`
- Line 222: Email HTML `KSH ${paidAmount.toLocaleString()}` → `$${paidAmount.toLocaleString()}`
- Line 223: Email HTML `learning material fees (KSH 7,500)` → `learning material fees ($7,500)`
- Line 261: Email HTML `KSH ${paidAmount.toLocaleString()}` → `$${paidAmount.toLocaleString()}`
- Line 425: Log string `KSH ${commissionAmount}` → `$${commissionAmount}`

---

### 1.9 `app/api/finance/jobs/material-fee-reminder/route.ts`
**What to change:**

- Line 17 comment: `KSH 7,500` → `$7,500`
- Line 119: Notification message `KSH ${materialFee.toLocaleString()}` → `$${materialFee.toLocaleString()}`
- Line 131: Email HTML `KSH ${materialFee.toLocaleString()}` → `$${materialFee.toLocaleString()}`

---

## 2. Prisma Schema & Database Defaults

### 2.1 `prisma/schema.prisma`

**What to change:**

- Line 744 (`BillingSettings` model):
  ```prisma
  // BEFORE
  currency        String       @default("KES")

  // AFTER
  currency        String       @default("USD")
  ```

- Line 755 (`SystemSettings` model):
  ```prisma
  // BEFORE
  defaultCurrency     String   @default("KES")

  // AFTER
  defaultCurrency     String   @default("USD")
  ```

- Lines 135–136 (comments in `CommissionType` enum): Update comment text:
  ```prisma
  // BEFORE
  RESERVATION    // e.g. KSH 500 per confirmed reservation
  FULL_PAYMENT   // e.g. KSH 1,500 per confirmed full payment

  // AFTER
  RESERVATION    // e.g. $5 per confirmed reservation
  FULL_PAYMENT   // e.g. $15 per confirmed full payment
  ```
  > ⚠️ Note: The actual commission amounts in production are stored in `SystemSettings` and are configurable by the admin. Update the comment values to whatever USD equivalents the client decides. These are **comments only** and have no functional impact.

**After changing schema defaults, create a new Prisma migration:**
```bash
npx prisma migrate dev --name currency_usd_default
```

> ⚠️ **Existing database rows** that have `currency = 'KES'` or `defaultCurrency = 'KES'` will **not** be automatically updated by a migration that only changes the `@default`. You must also run a data migration or a one-time SQL update:
> ```sql
> UPDATE "BillingSettings" SET currency = 'USD' WHERE currency = 'KES';
> UPDATE "SystemSettings" SET "defaultCurrency" = 'USD' WHERE "defaultCurrency" = 'KES';
> ```

---

## 3. Admin Pages

### 3.1 `app/admin/settings/page.tsx`
**What to change:**

- Line 24: `defaultCurrency: "KES"` → `defaultCurrency: "USD"`
- Line 63: `settingsData.defaultCurrency || "KES"` → `settingsData.defaultCurrency || "USD"`
- Line 176: The currency `<select>` currently shows `KES` as the first/default option:
  ```tsx
  // BEFORE
  <option value="KES">KES - Kenyan Shilling</option>
  ...
  <option value="USD">USD - US Dollar</option>

  // AFTER — Make USD first and selected by default
  <option value="USD">USD - US Dollar</option>
  ...
  <option value="KES">KES - Kenyan Shilling</option>
  ```
  Or remove KES entirely if the client only wants USD going forward.
- Lines 328, 341: Label text change:
  - `Seat Reservation Fee (KES)` → `Seat Reservation Fee (USD)`
  - `Learning Material Fee (KES)` → `Learning Material Fee (USD)`
- Lines 395, 404, 408, 417: Label and hint text:
  - `Reservation Commission (KES)` → `Reservation Commission (USD)`
  - `Commission per confirmed seat reservation (default: KES 500)` → `Commission per confirmed seat reservation (default: $5)`
  - `Full Payment Commission (KES)` → `Full Payment Commission (USD)`
  - `Commission per confirmed full fee payment (default: KES 1,500)` → `Commission per confirmed full fee payment (default: $15)`
  > ⚠️ Confirm exact USD commission amounts with client before updating default hints.

---

### 3.2 `app/admin/dashboard/page.tsx`
**What to change:**

- Line 157: `KES ${stats.monthlyRevenue.toLocaleString()}` → `$${stats.monthlyRevenue.toLocaleString()}`
- Line 277: `KES ${(financialHealth.total / 1000).toFixed(1)}k` → `$${(financialHealth.total / 1000).toFixed(1)}k`

---

### 3.3 `app/admin/finance/page.tsx`
**What to change:**

- Lines 234, 248, 314, 317, 351: Replace all `KES ` prefix with `$`
  - `KES ${financeData.stats.totalPaid.toLocaleString()}` → `$${financeData.stats.totalPaid.toLocaleString()}`
  - `KES ${financeData.stats.totalOutstanding.toLocaleString()}` → `$${...}`
  - `KES ${invoice.amount.toLocaleString()}` → `$${invoice.amount.toLocaleString()}`
  - `KES ${invoice.paidAmount.toLocaleString()}` → `$${invoice.paidAmount.toLocaleString()}`
  - Label: `Default School Fee (KES)` → `Default School Fee (USD)`

---

### 3.4 `app/admin/courses/page.tsx`
**What to change:**

- Line 134: `KES ${course.price.toLocaleString()}` → `$${course.price.toLocaleString()}`
- Line 168: `KES ${course.stats.revenue.toLocaleString()}` → `$${course.stats.revenue.toLocaleString()}`

---

### 3.5 `app/admin/students/[studentId]/page.tsx`
**What to change:**

- Line 177: `KES ${student.stats.totalInvoiced.toLocaleString()}` → `$${...}`
- Line 181: `KES ${student.stats.totalPaid.toLocaleString()}` → `$${...}`
- Line 186: `KES ${student.stats.arrears.toLocaleString()}` → `$${...}`
- Line 253: `KES ${Number(payment.amount).toLocaleString()}` → `$${...}`

---

### 3.6 `app/admin/students/page.tsx`
**What to change:**

- Line 364: `` `KES ${student.stats.arrears.toLocaleString()} overdue` `` → `` `$${student.stats.arrears.toLocaleString()} overdue` ``
- Line 367: `KES ${student.stats.totalPaid.toLocaleString()}` → `$${...}`

---

### 3.7 `app/admin/teachers/[teacherId]/page.tsx`
**What to change:**

- Line 140: `KES ${course.price.toLocaleString()}` → `$${course.price.toLocaleString()}`

---

### 3.8 `app/admin/teachers/page.tsx`
**What to change:**

- Line 280: `KES ${teacher.stats.totalRevenue.toLocaleString()}` → `$${teacher.stats.totalRevenue.toLocaleString()}`

---

### 3.9 `app/admin/marketers/page.tsx`
**What to change:**

- Line 256 (`fmt` function): 
  ```ts
  // BEFORE
  const fmt = (n: number) => `KES ${n.toLocaleString()}`;

  // AFTER
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  ```
  This single change will fix all downstream uses of `fmt()` in this file (lines ~363, 398, 399, 408, 409, 413, 421).
- Line 712: Label text `Amount (KES) *` → `Amount (USD) *`
- Line 716: Label text `Transaction Ref. (e.g. M-Pesa Code) *` → `Transaction Ref. (e.g. Wire/Card Ref.) *`
- Lines 898, 926, 953: `KES ${Number(...).toLocaleString()}` → `$${Number(...).toLocaleString()}`
- **M-Pesa payout method (flagged):** Lines 74, 156, 227–271, 353, 683–686, 706 reference `"MPESA"` as a payout method in the admin → marketer payout flow. This is the method by which **admins manually send commissions** to marketers. Decide with client whether to keep or remove. If marketers are Kenyan, it may still make sense to keep MPESA as a payout option; the client should confirm.

---

### 3.10 `app/admin/reports/page.tsx`
**What to change:**

- Line 120: `` `KES ${kpis.revenue.toLocaleString()}` `` → `` `$${kpis.revenue.toLocaleString()}` ``
- Line 249: `KES ${kpis.revenue.toLocaleString()}` → `$${kpis.revenue.toLocaleString()}`

---

## 4. Public & Student-Facing Pages

### 4.1 `app/(public)/reserve-seat/page.tsx`
This file has the most dense KES/KSH references on a single page.

**What to change:**

- Line 129: `KSH 2,500` → `$2,500` (or correct USD equivalent)
- Line 206: `KSH ${seatFee.toLocaleString()} — Seat Reservation` → `$${seatFee.toLocaleString()} — Seat Reservation`
- Line 222: `KSH ${matFee.toLocaleString()} — Learning Materials` → `$${matFee.toLocaleString()} — Learning Materials`
- Line 258: `min. KES 9,000 per installment` → `min. $X per installment` (confirm USD value with client)
- Line 448: `KES ${courseFee.toLocaleString()}` → `$${courseFee.toLocaleString()}`
- Line 461: `The KES ${seatFee.toLocaleString()} seat reservation fee` → `The $${seatFee.toLocaleString()} seat reservation fee`
- Line 521: `Pay KSH ${seatFee.toLocaleString()} — Reserve Your Seat` → `Pay $${seatFee.toLocaleString()} — Reserve Your Seat`
- Line 528: Payment powered by IntaSend message — no change needed (IntaSend name stays)

---

### 4.2 `app/(public)/page.tsx` (Homepage)
**What to change:**

- Line 644: `Earn KES 500 instantly on seat reservation` → `Earn $5 instantly on seat reservation` (confirm amount)
- Line 645: `Earn an additional KES 1,500 on full tuition payment` → `Earn an additional $15 on full tuition payment` (confirm amount)
- Line 646: `direct M-Pesa payouts` → `direct bank/card payouts`
- Line 695: `KES 248,000` → `$X,XXX` (confirm USD price)
- Line 845: `KES ${stats.fees.seatReservationFee.toLocaleString()}` → `$${stats.fees.seatReservationFee.toLocaleString()}`
- Line 864: `KES ${stats.fees.materialFee.toLocaleString()}` → `$${stats.fees.materialFee.toLocaleString()}`
- Line 909: `KES ${course.price.toLocaleString()}` → `$${course.price.toLocaleString()}`
- Line 921: `KES ${fp.amount.toLocaleString()}` → `$${fp.amount.toLocaleString()}`
- Line 945: `minimum of KES 9,000` → `minimum of $X` (confirm)
- Line 955: `Min. KES 9,000 per installment` → `Min. $X per installment`
- Line 975: `KSH 2,500` → `$X` (confirm seat reservation USD price)
- Line 998: `Reserve Your Seat — KSH 2,500` → `Reserve Your Seat — $X`

---

### 4.3 `app/(public)/partners/page.tsx`
**What to change:**

- Line 74: `Earn KES 500 when they reserve a seat, and an additional KES 1,500 when they complete full payment.` → `Earn $5 when they reserve a seat, and an additional $15 when they complete full payment.` (confirm amounts)
- Line 112: `Fast payouts directly to your default M-Pesa or Bank account` → `Fast payouts directly to your bank or card account`
- Line 136: `KES 2,000` → `$20` (confirm total commission amount)
- Line 150: `KES 500` → `$5`
- Line 157: `KES 1,500` → `$15`

---

### 4.4 `app/(public)/courses/page.tsx`
**What to change:**

- Line 195: `KES ${course.price}` → `$${course.price}`

---

### 4.5 `app/(public)/courses/[courseId]/page.tsx`
**What to change:**

- Line 302: `KES ${course.price}` → `$${course.price}`

---

### 4.6 `app/(public)/school-info/page.tsx`
**What to change:**

- Line 315: `{data.fees.currency} ${data.fees.semesterFee.toLocaleString()}` — This one is **dynamic** and reads the currency string from the database. Once the DB default is updated to `USD`, this will automatically show `USD`. However, consider formatting it as `$` symbol instead of the currency code string for better UX:
  ```tsx
  // BEFORE
  {data.fees.currency} {data.fees.semesterFee.toLocaleString()}

  // AFTER (option A — symbol)
  ${data.fees.semesterFee.toLocaleString()}

  // AFTER (option B — keep dynamic but display $ for USD)
  {data.fees.currency === 'USD' ? '$' : data.fees.currency} {data.fees.semesterFee.toLocaleString()}
  ```

---

### 4.7 `app/(public)/documentation/page.tsx`
**What to change:**

- Line 419: `"Secure payment via Mobile Money (M-Pesa) or Card"` → `"Secure payment via Card or Bank Transfer"`
- Line 420: `"Intasend payment gateway integration"` — no change needed
- Line 846: `"Set default currency (KES/EUR)"` → `"Set default currency (USD/EUR)"`
- Line 904: `"Payment method breakdown (Card, M-Pesa, Bank Transfer)"` → `"Payment method breakdown (Card, Bank Transfer)"`
- Line 1165: `"Mobile Money (M-Pesa) support"` → `"Card and Bank Transfer support"`

---

### 4.8 `app/student/(dashboard)/billing/page.tsx`
**What to change:**

- Line 17: `useState('CARD-PAYMENT')` — already defaults to CARD, good.
- Line 90: `KES ${totalOutstanding.toFixed(2)}` → `$${totalOutstanding.toFixed(2)}`
- Line 99: `KES ${totalPaid.toFixed(2)}` → `$${totalPaid.toFixed(2)}`
- Lines 164, 170, 176, 223: `KES ${...}` → `$${...}`
- Line 190: M-Pesa option in the payment method `<select>`:
  ```tsx
  // REMOVE this option entirely:
  <option value="M-PESA">M-Pesa</option>
  ```
  Keep only `CARD-PAYMENT`. If you want a clean single-method flow, you can remove the `<select>` dropdown altogether and hardcode `CARD-PAYMENT`.

---

### 4.9 `app/student/(dashboard)/billing/pay/page.tsx`
**What to change:**

- Line 151: `KES ${parseFloat(inv.amount).toFixed(2)}` → `$${parseFloat(inv.amount).toFixed(2)}`
- Line 188: `Pay KES ${amount}` → `Pay $${amount}`
- Lines 206, 207, 208: `KES ${...}` → `$${...}`
- Line 219: `KES ${parseFloat(payment.amount).toFixed(2)}` → `$${...}`

---

### 4.10 `app/student/(dashboard)/billing/history/page.tsx`
**What to change:**

- Line 96: `` `KES ${parseFloat(inv.amount).toFixed(2)}` `` → `` `$${parseFloat(inv.amount).toFixed(2)}` ``
- Lines 257, 271: `KES ${totalPaid...}` / `KES ${totalOutstanding...}` → `$${...}`
- Lines 425, 493: `KES ${parseFloat(invoice.amount).toFixed(2)}` → `$${...}`

---

### 4.11 `app/student/(dashboard)/dashboard/page.tsx`
**What to change:**

- Line 244: `KES ${stats.balance.toFixed(2)}` → `$${stats.balance.toFixed(2)}`
- Line 457: `` `KES ${course.price.toLocaleString()}` `` → `` `$${course.price.toLocaleString()}` ``
- Line 477: `KES ${stats.balance.toLocaleString(...)}` → `$${...}`

---

### 4.12 `app/student/(dashboard)/courses/[courseId]/page.tsx`
**What to change:**

- Line 196: `KES {course.unpaidInvoice.amount.toLocaleString()}` → `$${course.unpaidInvoice.amount.toLocaleString()}`

---

### 4.13 `app/student/(dashboard)/courses/page.tsx`
**What to change:**

- Line 309: `KES ${course.price}` → `$${course.price}`

---

## 5. Teacher & Marketer Pages + Notification Emails

### 5.1 `app/teacher/dashboard/page.tsx`
**What to change:**

- Line 219: `KES ${stats.monthlyRevenue.toLocaleString()}` → `$${stats.monthlyRevenue.toLocaleString()}`

---

### 5.2 `app/teacher/courses/new/page.tsx`
**What to change:**

- Line 368: Label `Price (KES)` → `Price (USD)`
- Line 372: Inline span `KES` → `$`
  ```tsx
  // BEFORE
  <span className="text-gray-500 sm:text-sm">KES</span>

  // AFTER
  <span className="text-gray-500 sm:text-sm">$</span>
  ```

---

### 5.3 `app/teacher/courses/[courseId]/edit/page.tsx`
**What to change:**

- Line 409: Label `Price (KES)` → `Price (USD)`
- Line 413: Inline span `KES` → `$`

---

### 5.4 `app/teacher/courses/[courseId]/page.tsx`
**What to change:**

- Line 117: `KES ${course.price}` → `$${course.price}`

---

### 5.5 `app/teacher/courses/page.tsx`
**What to change:**

- Line 132: `KES ${course.price}` → `$${course.price}`

---

### 5.6 `app/settings/page.tsx`
**What to change:**

- Line 368: Label `Hourly Rate (KES)` → `Hourly Rate (USD)`

---

### 5.7 `app/marketer/dashboard/page.tsx`
**What to change:**

- Line 150: `fmt` function:
  ```ts
  // BEFORE
  const fmt = (n: number) => `KES ${n.toLocaleString()}`;

  // AFTER
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  ```
  This fixes all downstream uses of `fmt()` in this file (lines ~363, 395, 399, 408, 409, 413, 421).

---

### 5.8 `app/marketer/payouts/page.tsx`
**What to change:**

- Line 91: `KES ${Number(payout.amount).toLocaleString()}` → `$${Number(payout.amount).toLocaleString()}`
- Line 124: `KES ${Number(comm.amount)}` → `$${Number(comm.amount)}`

---

### 5.9 `app/marketer/referrals/page.tsx`
**What to change:**

- Line 126: `KES ${Number(comm.amount).toLocaleString()}` → `$${Number(comm.amount).toLocaleString()}`

---

### 5.10 `app/marketer/settings/page.tsx`
**What to change:**

- Line 271: `Earnings will be sent to this number automatically via IntaSend.` → Update to reflect bank/card payout method: `Earnings will be sent to your registered bank account.`
- Lines 227–271 (M-Pesa payout section): As noted in the overview — confirm with client whether marketers still receive commissions via M-Pesa (Kenya-based) or a new method. Flag for client decision before removing.

---

### 5.11 `src/lib/invoice-notification.ts`
**What to change (PDF invoice generation):**

- Line 94: `'Amount (KES)'` → `'Amount (USD)'`
- Line 115: `` `KES ${invoice.amount.toLocaleString()}` `` → `` `$${invoice.amount.toLocaleString()}` ``
- Line 150: Notification message: `` `KES ${invoice.amount.toLocaleString()}` `` → `` `$${invoice.amount.toLocaleString()}` ``
- Line 161: Email subject: `` `KES ${invoice.amount.toLocaleString()}` `` → `` `$${invoice.amount.toLocaleString()}` ``
- Line 186: Email HTML body: `` KES ${invoice.amount.toLocaleString()} `` → `` $${invoice.amount.toLocaleString()} ``

---

### 5.12 `src/components/BillingAccessGuard.tsx`
**What to change:**

- Line 83: `KES ${data.amount?.toLocaleString()}` → `$${data.amount?.toLocaleString()}`

---

## Summary Checklist

| # | File | Changes |
|---|------|---------|
| 1 | `src/lib/intasend.ts` | Default currency KES→USD, default method CARD-PAYMENT |
| 2 | `app/api/invoices/[invoiceId]/pay/route.ts` | currency KES→USD, method CARD-PAYMENT |
| 3 | `app/api/seat-reservation/route.ts` | currency KES→USD ×2, add CARD-PAYMENT |
| 4 | `app/api/finance/pay/route.ts` | currency KES→USD, add CARD-PAYMENT |
| 5 | `app/api/admin/settings/route.ts` | defaultCurrency KES→USD ×2 |
| 6 | `app/api/admin/finance/settings/route.ts` | currency KES→USD ×2 |
| 7 | `app/api/admin/finance/generate/route.ts` | KES→$ in note strings ×2 |
| 8 | `app/api/webhooks/intasend/route.ts` | KSH→$ in emails/logs ×6 |
| 9 | `app/api/finance/jobs/material-fee-reminder/route.ts` | KSH→$ ×3 |
| 10 | `prisma/schema.prisma` | @default("KES")→@default("USD") ×2 + comments |
| 11 | `app/admin/settings/page.tsx` | defaultCurrency, labels, option order ×8 |
| 12 | `app/admin/dashboard/page.tsx` | KES→$ ×2 |
| 13 | `app/admin/finance/page.tsx` | KES→$ ×5 |
| 14 | `app/admin/courses/page.tsx` | KES→$ ×2 |
| 15 | `app/admin/students/[studentId]/page.tsx` | KES→$ ×4 |
| 16 | `app/admin/students/page.tsx` | KES→$ ×2 |
| 17 | `app/admin/teachers/[teacherId]/page.tsx` | KES→$ ×1 |
| 18 | `app/admin/teachers/page.tsx` | KES→$ ×1 |
| 19 | `app/admin/marketers/page.tsx` | fmt() update + labels ×5; M-Pesa payout: client decision |
| 20 | `app/admin/reports/page.tsx` | KES→$ ×2 |
| 21 | `app/(public)/reserve-seat/page.tsx` | KSH/KES→$ ×7 |
| 22 | `app/(public)/page.tsx` | KES/KSH→$ ×12, M-Pesa→bank/card |
| 23 | `app/(public)/partners/page.tsx` | KES→$ ×5, M-Pesa text ×1 |
| 24 | `app/(public)/courses/page.tsx` | KES→$ ×1 |
| 25 | `app/(public)/courses/[courseId]/page.tsx` | KES→$ ×1 |
| 26 | `app/(public)/school-info/page.tsx` | Dynamic currency display update |
| 27 | `app/(public)/documentation/page.tsx` | M-Pesa refs ×3, KES→USD ×1 |
| 28 | `app/student/(dashboard)/billing/page.tsx` | KES→$ ×6, remove M-Pesa option |
| 29 | `app/student/(dashboard)/billing/pay/page.tsx` | KES→$ ×5 |
| 30 | `app/student/(dashboard)/billing/history/page.tsx` | KES→$ ×5 |
| 31 | `app/student/(dashboard)/dashboard/page.tsx` | KES→$ ×3 |
| 32 | `app/student/(dashboard)/courses/[courseId]/page.tsx` | KES→$ ×1 |
| 33 | `app/student/(dashboard)/courses/page.tsx` | KES→$ ×1 |
| 34 | `app/teacher/dashboard/page.tsx` | KES→$ ×1 |
| 35 | `app/teacher/courses/new/page.tsx` | KES→USD/$ ×2 |
| 36 | `app/teacher/courses/[courseId]/edit/page.tsx` | KES→USD/$ ×2 |
| 37 | `app/teacher/courses/[courseId]/page.tsx` | KES→$ ×1 |
| 38 | `app/teacher/courses/page.tsx` | KES→$ ×1 |
| 39 | `app/settings/page.tsx` | KES→USD label ×1 |
| 40 | `app/marketer/dashboard/page.tsx` | fmt() KES→$ |
| 41 | `app/marketer/payouts/page.tsx` | KES→$ ×2 |
| 42 | `app/marketer/referrals/page.tsx` | KES→$ ×1 |
| 43 | `app/marketer/settings/page.tsx` | M-Pesa payout text; client decision |
| 44 | `src/lib/invoice-notification.ts` | KES→$ ×5 in PDF + emails |
| 45 | `src/components/BillingAccessGuard.tsx` | KES→$ ×1 |

---

## Open Questions for Client

Before implementation, confirm these with Harvey / the client:

1. **USD price equivalents** — What are the USD prices for:
   - Seat reservation fee (was KSH 2,500)?
   - Learning materials fee (was KSH 7,500)?
   - Min. installment (was KES 9,000)?
   - Total course fees (was KES 248,000 on homepage)?
   - Reservation commission per marketer (was KES 500)?
   - Full payment commission per marketer (was KES 1,500)?

2. **Marketer payout method** — Should MPESA still be an option for commission payouts to marketers (admin-side), or should it be replaced entirely with bank/card?

3. **M-Pesa in student billing** — The student billing page has an M-Pesa dropdown option. Should this be fully removed, or kept for legacy paid invoices display?

4. **Database migration** — Are there existing live records in the DB using `KES`? A one-time SQL update script will be needed for those rows.

5. **IntaSend account** — Confirm that the IntaSend account is configured to accept USD payments. USD support must be enabled on the IntaSend merchant dashboard before going live.

---

## Implementation Order (Recommended)

1. **Start with `src/lib/intasend.ts`** — foundation of all payment logic
2. **API routes** — backend before frontend
3. **Prisma schema + DB migration** — run migration + SQL update
4. **Admin pages** — test with admin account first
5. **Public pages** — homepage, reserve-seat, partners
6. **Student billing pages** — test full checkout flow end-to-end
7. **Teacher/marketer pages** — lower risk, mostly display
8. **Invoice PDF & email notifications** — verify with a test payment
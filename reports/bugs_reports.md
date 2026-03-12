# GVS Marketing & Referral System — Bug Audit Report

---

## Executive Summary

The client's reported issue — **"clicks are not showing for the marketer or for admin"** — has a confirmed root cause: a **field name mismatch** in the referral click tracking call. Every single click silently fails. Beyond that, **6 additional bugs** were identified across the marketing flow, ranging from a broken admin tab to a security issue.

---

## Bug #1 — CRITICAL: Click Tracking Always Fails (Root Cause of Client Report)

**Files affected:**
- `app/(public)/reserve-seat/page.tsx` — line 30
- `proxy.ts` — line 167
- `app/api/referral/track/route.ts` — line 9

**What's broken:**

The frontend sends the referral code under the field name **`code`**, but the API endpoint reads it as **`referralCode`**. Because the field never matches, the API returns a 400 error on every single click. The frontend silently swallows this with `.catch(console.error)`, so neither the marketer nor the admin ever sees any clicks recorded.

```js
// reserve-seat/page.tsx — WRONG: sends "code"
axios.post("/api/referral/track", { code: refFromUrl, page: "/reserve-seat" })

// proxy.ts — ALSO WRONG: sends "code"
body: JSON.stringify({ code: ref, page: req.nextUrl.pathname })

// api/referral/track/route.ts — expects "referralCode"
const { referralCode, page } = body;
if (!referralCode) {
  return NextResponse.json({ error: "Missing referralCode" }, { status: 400 });
}
```

**Fix — both calling sites:**
```js
// reserve-seat/page.tsx
axios.post("/api/referral/track", { referralCode: refFromUrl, page: "/reserve-seat" })

// proxy.ts
body: JSON.stringify({ referralCode: ref, page: req.nextUrl.pathname })
```

Because both the reserve-seat page AND the middleware have the same wrong field name, this needs to be fixed in both places.

---

## Bug #2 — HIGH: Homepage Referral Clicks Are Never Tracked

**File:** `app/(public)/page.tsx`

**What's broken:**

When a marketer shares their link and it lands on the homepage (e.g., `/?ref=MARK01`), absolutely nothing tracks that click. The tracking `useEffect` only exists in `/reserve-seat`. A user who lands on the homepage and later navigates to the form will have their click go unrecorded even after Bug #1 is fixed.

**Fix:**

Add referral tracking to the homepage's `useEffect`, or better — move the tracking call into the Next.js middleware (`proxy.ts`) so it fires on any page with a `?ref=` param. The middleware already has the skeleton for this but the field name bug (Bug #1) has been stopping it from working.

Once Bug #1 is fixed, the middleware in `proxy.ts` will actually fire correctly on the homepage too — so fixing Bug #1 implicitly fixes most of this. However, verify the middleware `matcher` config covers public pages.

---

## Bug #3 — HIGH: `prisma` Used Inside a Transaction Instead of `tx`

**File:** `app/api/webhooks/intasend/route.ts` — inside `handleCompletePayment()`

**What's broken:**

Inside a `prisma.$transaction(async (tx) => { ... })` block, a call to fetch system settings uses the global `prisma` client instead of the transactional `tx` client. This means it doesn't participate in the transaction — it can read stale or inconsistent data and in edge cases could cause commission amounts to be calculated with wrong settings.

```js
// WRONG — uses global prisma, not transaction-scoped tx
const settings = await prisma.systemSettings.findUnique({
  where: { id: 'system-settings' },
  select: { fullPaymentCommission: true },
});
```

**Fix:**
```js
// CORRECT — use tx inside the transaction
const settings = await tx.systemSettings.findUnique({
  where: { id: 'system-settings' },
  select: { fullPaymentCommission: true },
});
```

---

## Bug #4 — MEDIUM: Admin PAYOUTS Tab Is Completely Empty

**File:** `app/admin/marketers/page.tsx`

**What's broken:**

The admin marketer page has three tabs: CRM, COMMISSIONS, and PAYOUTS. The PAYOUTS tab never fetches any data — it's left with a comment saying "keeping simple for now." If an admin clicks on it, they see nothing.

```js
useEffect(() => {
  if (activeTab === "CRM") fetchMarketers();
  if (activeTab === "COMMISSIONS") fetchCommissions();
  // PAYOUTS tab would fetch payouts, but keeping simple for now  ← never implemented
}, [activeTab, fetchMarketers, fetchCommissions]);
```

**Fix:**

Implement a `fetchPayouts` function that calls `/api/admin/marketers` or a dedicated payouts endpoint, and wire it into the `useEffect` for `activeTab === "PAYOUTS"`. The data structures for payouts already exist in the API response.

---

## Bug #5 — MEDIUM: Conversion Rate Is Inflated (Counts Unpaid Reservations)

**File:** `app/api/marketer/dashboard/route.ts`

**What's broken:**

The conversion rate is calculated by dividing total reservations (including PENDING and EXPIRED) by total clicks. This inflates the conversion stat — a user who clicked the link, started the form, but never completed payment is counted as a "conversion."

```js
// reservations.length includes PENDING and EXPIRED — WRONG
const conversionRate = totalClicks > 0 ? (reservations.length / totalClicks) * 100 : 0;
```

**Fix:**
```js
// Only count PAID reservations as true conversions
const conversionRate = totalClicks > 0 ? (paidReservations.length / totalClicks) * 100 : 0;
```

`paidReservations` is already computed a few lines above and only includes `status === 'PAID'` records.

---

## Bug #6 — MEDIUM: Commission Rate Display Uses Wrong Source

**File:** `app/api/marketer/dashboard/route.ts`

**What's broken:**

The "rate per student" shown in the Commission Breakdown section reads the amount from the first commission record rather than from system settings. If the admin ever changes commission rates, the displayed rate will show the old rate from the first commission ever created, not the current one.

```js
// Takes rate from first commission record — incorrect
ratePerStudent: reservationCommissions.length > 0 
  ? Number(reservationCommissions[0].amount) 
  : 500,
```

**Fix:**

Fetch the current commission rates from `systemSettings` alongside the other queries, then use those values for `ratePerStudent`.

---

## Bug #7 — LOW/SECURITY: Marketer JWT Shares the Same Secret as NextAuth

**File:** `src/lib/marketer-auth.ts`

**What's broken:**

The marketer authentication system uses `process.env.NEXTAUTH_SECRET` as its JWT signing secret — the same secret as NextAuth. This means:

1. A NextAuth session token could theoretically be crafted as a marketer token (or vice versa) since they share the same signing key.
2. The hardcoded fallback `'marketer-secret-fallback'` is predictable and would be used on any environment that hasn't set `NEXTAUTH_SECRET`.

```js
// RISKY — reuses NextAuth's secret
const MARKETER_JWT_SECRET = process.env.NEXTAUTH_SECRET || 'marketer-secret-fallback';
```

**Fix:**

Add a dedicated environment variable `MARKETER_JWT_SECRET` that is separate from `NEXTAUTH_SECRET`:

```js
const MARKETER_JWT_SECRET = process.env.MARKETER_JWT_SECRET 
  || process.env.NEXTAUTH_SECRET 
  || 'marketer-secret-fallback';
```

Then set `MARKETER_JWT_SECRET` in your environment with a unique, long random value.

---

## Summary Table

| # | Severity | Location | Description |
|---|----------|----------|-------------|
| 1 | 🔴 CRITICAL | `reserve-seat/page.tsx`, `proxy.ts` | Field name `code` should be `referralCode` — zero clicks ever tracked |
| 2 | 🟠 HIGH | `page.tsx` (homepage) | No referral tracking on the homepage at all |
| 3 | 🟠 HIGH | `webhooks/intasend/route.ts` | `prisma` used inside transaction instead of `tx` |
| 4 | 🟡 MEDIUM | `admin/marketers/page.tsx` | PAYOUTS tab never fetches data — shows blank |
| 5 | 🟡 MEDIUM | `marketer/dashboard/route.ts` | Conversion rate counts unpaid/expired reservations |
| 6 | 🟡 MEDIUM | `marketer/dashboard/route.ts` | Commission rate display reads stale first-record value |
| 7 | 🟢 LOW/SEC | `src/lib/marketer-auth.ts` | Marketer JWT shares secret with NextAuth |

---

## Recommended Fix Order

1. **Bug #1** — Fix the field name in both `reserve-seat/page.tsx` and `proxy.ts`. This is a one-line fix in each file and immediately restores all click tracking.
2. **Bug #3** — Change `prisma.` to `tx.` inside the transaction in the webhook handler to protect payment integrity.
3. **Bug #4** — Implement the PAYOUTS tab data fetch in the admin panel.
4. **Bugs #5 & #6** — Fix the dashboard stats calculations.
5. **Bug #7** — Add a separate `MARKETER_JWT_SECRET` env variable.

---

*Report generated from static code audit of `German-Virtual-School-main` codebase.*

---

## 1️⃣ Reality Check: What “pure Next.js” means

In Next.js App Router:

| Feature                | Allowed?                      |
| ---------------------- | ----------------------------- |
| Nodemailer             | ✅ **YES** (Node runtime only) |
| Firebase Admin         | ✅ **YES** (Node runtime only) |
| Long-lived connections | ❌ No                          |
| Background jobs        | ❌ No (unless external queue)  |
| Singleton services     | ⚠️ Careful                    |

👉 **Key rule**
All notification logic must live in **server-only files** and explicitly use:

```ts
export const runtime = "nodejs";
```

---

## 2️⃣ Recommended Folder Structure (Next.js-native)

```
src/
├── lib/
│   └── notifications/
│       ├── channels/
│       │   ├── email.ts
│       │   ├── push.ts
│       │   └── inApp.ts
│       ├── orchestrator.ts
│       └── types.ts
│
├── app/
│   └── api/
│       └── notify/
│           └── route.ts
│
└── server-actions/
    └── notify.ts
```

---

## 3️⃣ Prompt #1 – Nodemailer (Next.js compatible)

Use this prompt **exactly** 👇

> **Prompt**
>
> You are a senior Next.js App Router engineer.
>
> Build a Nodemailer email notification utility that works inside Next.js server runtime.
>
> Constraints:
>
> * Must run in **Node.js runtime**, not Edge
> * Must NOT rely on Express or long-lived servers
> * Must be safe for serverless execution
>
> Requirements:
>
> * Use Nodemailer with SMTP
> * Credentials from environment variables
> * Export:
>
>   ```ts
>   export async function sendEmailNotification(params: {
>     to: string;
>     subject: string;
>     html?: string;
>     text?: string;
>   }): Promise<{ success: boolean; error?: string }>
>   ```
> * Must:
>
>   * validate inputs
>   * handle errors gracefully (no throws)
>   * log failures
> * Mark file as server-only:
>
>   ```ts
>   import "server-only";
>   export const runtime = "nodejs";
>   ```
>
> Output:
>
> * `email.ts`
> * `.env` variables
> * Usage example from a Server Action or Route Handler

---

## 4️⃣ Prompt #2 – Firebase Admin Push Notifications (Next.js safe)

This one is **critical** because Firebase Admin must be initialized carefully.

> **Prompt**
>
> You are a senior Next.js backend engineer.
>
> Build a Firebase Admin push notification utility for Next.js App Router.
>
> Constraints:
>
> * Must use `firebase-admin`
> * Must avoid re-initializing Firebase on hot reload
> * Must run only on Node.js runtime
>
> Requirements:
>
> * Create a safe singleton Firebase Admin initialization
> * Export:
>
>   ```ts
>   export async function sendPushNotification(params: {
>     title: string;
>     body: string;
>     tokens?: string[];
>     topic?: string;
>     data?: Record<string, string>;
>   }): Promise<{ success: boolean; error?: string }>
>   ```
> * Validate input (tokens or topic required)
> * Catch and return errors
> * Log success/failure
>
> Output:
>
> * `push.ts`
> * Firebase Admin init code
> * Usage example from a Route Handler

---

## 5️⃣ Prompt #3 – In-App Notification (Database)

This is where your **existing DB logic plugs in**.

> **Prompt**
>
> Build an in-app notification persistence function for Next.js.
>
> Requirements:
>
> * Function:
>
>   ```ts
>   export async function createInAppNotification(params: {
>     userId: string;
>     title: string;
>     message: string;
>     metadata?: Record<string, any>;
>   }): Promise<{ id: string }>
>   ```
> * Assume Prisma is used
> * No delivery logic
> * Pure persistence only
>
> Output:
>
> * `inApp.ts`

---

## 6️⃣ Prompt #4 – Notification Orchestrator (Core Brain)

This is the **central channel you asked for**.

> **Prompt**
>
> You are designing a notification orchestration layer for a Next.js App Router application.
>
> Build a `notify()` function that:
>
> * Persists notifications in the database
> * Sends email notifications
> * Sends Firebase push notifications
>
> Requirements:
>
> * Input:
>
>   ```ts
>   type NotifyPayload = {
>     userId: string;
>     title: string;
>     message: string;
>     email?: {
>       to: string;
>       subject?: string;
>     };
>     push?: {
>       tokens?: string[];
>       topic?: string;
>     };
>     metadata?: Record<string, any>;
>   }
>   ```
> * Steps:
>
>   1. Create in-app notification
>   2. Trigger email (if present)
>   3. Trigger push (if present)
> * Must:
>
>   * execute email & push **in parallel**
>   * isolate failures
>   * return combined results
>   * never throw
>
> Output:
>
> * `orchestrator.ts`
> * Example return value
> * Usage example

---

## 7️⃣ Prompt #5 – Expose via Server Action or API Route

### Option A: Server Action

> **Prompt**
>
> Create a Next.js Server Action that calls the `notify()` function.
>
> Requirements:
>
> * Use `"use server"`
> * Validate input
> * Call orchestrator
> * Return result
>
> Output:
>
> * `notify.ts` server action
> * Example usage from a React component

### Option B: Route Handler

> **Prompt**
>
> Create a Next.js Route Handler `/api/notify` that:
>
> * Accepts POST requests
> * Calls `notify()`
> * Returns JSON result
>
> Must use:
>
> ```ts
> export const runtime = "nodejs";
> ```

---

## 8️⃣ Final Reality Check (Important)

You **cannot**:

* send notifications from client components
* run Firebase Admin on Edge
* rely on memory persistence between requests

You **can**:

* orchestrate everything cleanly
* scale horizontally
* later swap delivery channels for queues (Upstash, SQS)

---

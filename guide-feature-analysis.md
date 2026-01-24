---

The Golden Rule (start here)

> Always trace DATA, not files.
Pick one user action and follow the data lifecycle.



Example:

> “User clicks Save Profile → data leaves UI → hits API → touches DB → response → UI update”



Everything below follows that rule.


---

1️⃣ Start at the UI: “What triggers this feature?”

Your questions:

What exact user action starts this?

click?

page load?

form submit?


Is this a:

Server Component

Client Component ("use client")?



What to inspect:

app/**/page.tsx

app/**/layout.tsx

Components using:

onClick

onSubmit

useEffect

useFormState, useActionState

router.push, router.refresh



Red flags:

Client component fetching sensitive data

Too much logic in UI components

Side effects inside render


📌 Key insight:
If you don’t know where the data leaves the browser, you don’t understand the feature yet.


---

2️⃣ Identify the Data Fetching Strategy (VERY IMPORTANT)

Next.js App Router gives multiple ways to fetch data. You must identify which one is used.

Possible paths:

fetch() in Server Component

fetch() in Client Component

Server Actions

Route Handlers (app/api/**/route.ts)

External SDK (e.g. Supabase, Prisma directly)


Ask:

Is data fetched on:

build time?

request time?

user interaction?



Check for:

fetch(url, { cache: "no-store" })
fetch(url, { next: { revalidate: 60 } })

📌 Key insight:
Caching & revalidation define truth freshness. Bugs often live here.


---

3️⃣ Trace the Request Boundary (Client → Server)

Now answer this clearly:

> “How does data cross from client to server?”



Common patterns:

fetch("/api/feature")

Server Action:


"use server"
export async function saveData(formData: FormData)

Analyze:

What data is sent?

Is it validated?

Is auth checked here or later?


Red flags:

Trusting client input

No schema validation

Business logic in client


📌 Rule:
All trust stops at the server boundary.


---

4️⃣ API Layer / Route Handlers (Control Center)

This is where control, security, and structure should live.

Look at:

app/api/**/route.ts

Checklist:

HTTP method used correctly? (GET, POST, etc)

Input validation:

Zod?

manual checks?


Auth:

cookies?

headers?

session?


Authorization:

can THIS user do THIS action?



Ask:

Is this API reusable or tightly coupled?

Is business logic here or deeper?


📌 Big mistake to watch for:
Fat APIs with no separation from DB logic.


---

5️⃣ Business Logic Layer (Often Missing 😅)

Ask bluntly:

> “Where does the actual thinking happen?”



Good systems have:

/lib
/services
/use-cases
/domain

Example:

createOrder()
updateUserProfile()
calculateInvoice()

Evaluate:

Is logic reusable?

Is it testable without UI?

Is it isolated from Next.js?


📌 Mature systems separate: UI ≠ API ≠ Business Logic ≠ DB


---

6️⃣ Database Layer (Source of Truth)

Now inspect:

ORM (Prisma? Drizzle? raw SQL?)

Queries:

transactions?

indexes?

joins?


Data integrity:

constraints?

foreign keys?



Ask:

Is DB enforcing rules or only app logic?

Is data shape consistent with API response?

Any N+1 queries?


📌 Rule:
If the DB allows bad data, the app eventually will too.


---

7️⃣ Response Path (DB → UI)

Now trace backwards.

Check:

API response shape

Serialization issues (Dates, BigInt)

Error handling

UI state updates


Look for:

router.refresh()

optimistic updates

stale UI after mutation


📌 Key insight:
Most “bugs” are actually state synchronization problems.


---

8️⃣ Cross-Cutting Concerns (Advanced but critical)

Ask for the feature:

Logging?

Monitoring?

Rate limiting?

Caching?

Error boundaries?

Edge vs Node runtime?


This is where production pain lives.


---

9️⃣ The One-Page Analysis Template (use this every time)

When analyzing a feature, write this:

Feature: ___________________

Trigger:
UI Component:
Client/Server:
Data Sent:
Transport Method:
API Route:
Validation:
Auth:
Business Logic:
DB Tables:
Write/Read:
Caching:
Failure Modes:
Security Risks:
Performance Risks:

If you can fill this cleanly — you understand the system.


---
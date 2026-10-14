import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const nodeRequire = createRequire(import.meta.url);

// Execute the real handlers with isolated database/auth dependencies. No emails,
// payment requests, or database writes leave this test process.
function loadModule(path, dependencies = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  const testModule = { exports: {} };
  const localRequire = (name) => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    if (name === '@/lib/api-response') return loadModule('src/lib/api-response.ts');
    if (name.startsWith('@/')) throw new Error(`Unexpected application dependency: ${name}`);
    return nodeRequire(name);
  };
  vm.runInNewContext(outputText, {
    module: testModule, exports: testModule.exports, require: localRequire,
    process, console, Date, URLSearchParams,
  }, { filename: path });
  return testModule.exports;
}

function registrationFixture(settings = {}) {
  const created = [];
  const profiles = [];
  const sent = [];
  const prisma = {
    systemSettings: { findUnique: async () => settings },
    user: {
      findUnique: async ({ where }) => created.find(user => user.email === where.email) ?? null,
      create: async ({ data }) => {
        const user = { id: 'student-1', ...data };
        created.push(user);
        return user;
      },
    },
    studentProfile: { create: async ({ data }) => { profiles.push(data); return data; } },
    verificationToken: { create: async ({ data }) => data },
    // Existing payments can still be linked for credits; none is required.
    seatReservation: { updateMany: async () => ({ count: 0 }) },
    marketer: { findUnique: async () => ({ id: 'marketer-1' }) },
  };
  const { POST } = loadModule('app/api/auth/register/route.ts', {
    '@/lib/prisma': { prisma },
    '@/lib/auth': { hashPassword: async () => 'hashed-password' },
    '@/lib/notifications/channels/email': { sendEmailNotification: async data => sent.push(data) },
  });
  const data = {
    email: 'new-student@example.com', password: 'StrongPassword1',
    firstName: 'New', lastName: 'Student', role: 'STUDENT', interestedProgram: 'A1',
  };
  const request = (body = data) => ({ json: async () => body, cookies: { get: () => undefined } });
  return { POST, request, data, created, profiles, sent };
}

test('new student registers without a reservation and receives email verification', async () => {
  const fixture = registrationFixture({ seatReservationFee: 20, intakeLabel: 'May 2026' });
  const response = await fixture.POST(fixture.request());
  assert.equal(response.status, 201);
  assert.equal((await response.json()).success, true);
  assert.equal(fixture.created.length, 1);
  assert.equal(fixture.created[0].isVerified, undefined); // No bypass of admin approval.
  assert.equal(fixture.sent.length, 1);
  assert.match(fixture.sent[0].email.html, /verify-email\?token=/);
});

test('direct registration retains program selection and marketer referral', async () => {
  const fixture = registrationFixture();
  const response = await fixture.POST(fixture.request({ ...fixture.data, referralCode: 'MARK01' }));
  assert.equal(response.status, 201);
  assert.equal(fixture.created[0].referredByMarketerId, 'marketer-1');
  assert.equal(fixture.profiles[0].interestedProgram, 'A1');
});

test('duplicate accounts are still rejected', async () => {
  const fixture = registrationFixture();
  await fixture.POST(fixture.request());
  assert.equal((await fixture.POST(fixture.request())).status, 409);
});

for (const [label, settings] of [
  ['not yet open', { enrollmentStartDate: new Date(Date.now() + 86400000) }],
  ['closed', { enrollmentEndDate: new Date(Date.now() - 86400000) }],
]) {
  test(`signup still respects enrollment dates: ${label}`, async () => {
    const fixture = registrationFixture(settings);
    assert.equal((await fixture.POST(fixture.request())).status, 403);
    assert.equal(fixture.created.length, 0);
  });
}

function enrollmentFixture({ role = 'STUDENT', status = 'PUBLISHED', duplicate = false, settings = null } = {}) {
  const enrollments = [];
  const registrations = [];
  const invoices = [];
  const prisma = {
    course: { findUnique: async () => ({ id: 'course-1', status }) },
    enrollment: { findUnique: async () => duplicate ? { id: 'existing' } : null },
    academicTerm: { findFirst: async () => ({ id: 'term-1', name: 'Current Term', startDate: new Date() }) },
    systemSettings: { findUnique: async () => settings },
    globalBillingSettings: { findFirst: async () => ({ defaultFee: 100 }) },
    termRegistration: { findUnique: async () => duplicate ? { id: 'existing' } : null },
    $transaction: async callback => callback({
      enrollment: { create: async ({ data }) => { enrollments.push(data); return { id: 'enrollment-1', ...data }; } },
      termRegistration: {
        findUnique: async () => null,
        create: async ({ data }) => { registrations.push(data); return { id: 'registration-1', ...data }; },
      },
      invoice: { create: async ({ data }) => { invoices.push(data); return data; } },
    }),
  };
  const dependencies = {
    '@/lib/prisma': { prisma },
    '@/lib/auth-middleware': { authenticate: async () => ({ id: 'student-1', role }) },
  };
  return {
    enroll: loadModule('app/api/courses/[courseId]/enroll/route.ts', dependencies).POST,
    registerTerm: loadModule('app/api/student/term/register/route.ts', dependencies).POST,
    enrollments, registrations, invoices,
  };
}

const courseContext = () => ({ params: Promise.resolve({ courseId: 'course-1' }) });

test('student enrolls in a published course without a reservation', async () => {
  const fixture = enrollmentFixture();
  const response = await fixture.enroll({}, courseContext());
  assert.equal(response.status, 201);
  assert.equal(fixture.enrollments[0].studentId, 'student-1');
  assert.equal(fixture.registrations[0].termId, 'term-1');
});

test('student registers for a semester without a reservation; normal tuition still applies', async () => {
  const fixture = enrollmentFixture();
  assert.equal((await fixture.registerTerm({})).status, 201);
  assert.equal(fixture.registrations.length, 1);
  assert.equal(fixture.invoices.length, 1);
  assert.equal(fixture.invoices[0].amount, 100);
});

test('teachers cannot use student course or semester enrollment', async () => {
  const fixture = enrollmentFixture({ role: 'TEACHER' });
  assert.equal((await fixture.enroll({}, courseContext())).status, 403);
  assert.equal((await fixture.registerTerm({})).status, 403);
  assert.equal(fixture.registrations.length, 0);
});

test('unpublished courses and duplicate enrollments remain blocked', async () => {
  const draft = enrollmentFixture({ status: 'DRAFT' });
  assert.equal((await draft.enroll({}, courseContext())).status, 400);
  const duplicate = enrollmentFixture({ duplicate: true });
  assert.equal((await duplicate.enroll({}, courseContext())).status, 409);
  assert.equal((await duplicate.registerTerm({})).status, 409);
});

test('semester registration still respects enrollment dates', async () => {
  const fixture = enrollmentFixture({ settings: { enrollmentEndDate: new Date(Date.now() - 86400000) } });
  assert.equal((await fixture.registerTerm({})).status, 403);
  assert.equal(fixture.registrations.length, 0);
});

for (const existing of [false, true]) {
  test(`Google sign-in works without a reservation for ${existing ? 'existing' : 'new'} students`, async () => {
    let config;
    loadModule('src/lib/auth.config.ts', {
      'next-auth': settings => { config = settings; return {}; },
      '@auth/prisma-adapter': { PrismaAdapter: () => ({}) },
      'next-auth/providers/credentials': settings => settings,
      '@/lib/auth': { verifyPassword: async () => true },
      '@/lib/prisma': { prisma: { user: {
        findUnique: async () => existing ? { firstName: 'New', lastName: 'Student', role: 'STUDENT' } : null,
        update: async () => ({}),
      } } },
    });
    const result = await config.callbacks.signIn({
      user: { id: 'student-1', email: 'new-student@example.com' },
      account: { provider: 'google' }, profile: {},
    });
    assert.equal(result, true);
  });
}

test('old reservation links redirect to signup and preserve program and referral', async () => {
  const { default: redirectPage } = loadModule('app/(public)/reserve-seat/page.tsx', {
    'next/navigation': { redirect: destination => { throw new Error(destination); } },
  });
  await assert.rejects(redirectPage({ searchParams: Promise.resolve({}) }), { message: '/register' });
  await assert.rejects(redirectPage({
    searchParams: Promise.resolve({ program: 'A1', ref: 'MARK01', reservationRequired: '1' }),
  }), { message: '/register?program=A1&ref=MARK01' });
});

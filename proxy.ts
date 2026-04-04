import { auth } from "@/lib/auth.config";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;

  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname.startsWith("/forgot-password") ||
    nextUrl.pathname.startsWith("/reset-password");
  const isPublicRoute =
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/public") ||
    nextUrl.pathname.startsWith("/about") ||
    nextUrl.pathname.startsWith("/privacy") ||
    nextUrl.pathname.startsWith("/terms") ||
    nextUrl.pathname.startsWith("/courses") ||
    nextUrl.pathname.startsWith("/opportunities") ||
    nextUrl.pathname.startsWith("/exam-prep") ||
    nextUrl.pathname.startsWith("/services") ||
    nextUrl.pathname.startsWith("/resources") ||
    nextUrl.pathname.startsWith("/blog") ||
    nextUrl.pathname.startsWith("/success-stories") ||
    nextUrl.pathname.startsWith("/contact") ||
    nextUrl.pathname.startsWith("/german-for-hospitality") ||
    nextUrl.pathname.startsWith("/german-for-it") ||
    nextUrl.pathname.startsWith("/german-for-nurses") ||
    nextUrl.pathname.startsWith("/german-visa-requirements") ||
    nextUrl.pathname.startsWith("/calendar") ||
    nextUrl.pathname.startsWith("/channels") || // Public channels page
    nextUrl.pathname.startsWith("/documentation") ||
    nextUrl.pathname.startsWith("/school-info") ||
    nextUrl.pathname.startsWith("/partners") ||
    nextUrl.pathname.startsWith("/reserve-seat") ||
    nextUrl.pathname.startsWith("/verify-email") ||
    nextUrl.pathname.startsWith("/check-email") ||
    nextUrl.pathname.startsWith("/marketer");

  // Route protection logic
  const isStudentRoute = nextUrl.pathname.startsWith("/student");
  const isTeacherRoute = nextUrl.pathname.startsWith("/teacher");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isClassroomRoute = nextUrl.pathname.startsWith("/classroom");
  const isPublicApiRoute =
    (nextUrl.pathname.startsWith("/api/courses") && req.method === "GET") ||
    (nextUrl.pathname.startsWith("/api/testimonials") && req.method === "GET") ||
    (nextUrl.pathname.startsWith("/api/stats/public") && req.method === "GET") ||
    (nextUrl.pathname.startsWith("/api/channels") && req.method === "GET") || // Public channels
    (nextUrl.pathname.startsWith("/api/school") && req.method === "GET") || // Public school info & calendar
    nextUrl.pathname.startsWith("/api/marketer"); // Marketer APIs have their own auth middleware

  if (isApiRoute) {
    return;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (user?.role === "STUDENT") {
        return NextResponse.redirect(new URL("/student/dashboard", nextUrl));
      } else if (user?.role === "TEACHER") {
        return NextResponse.redirect(new URL("/teacher/dashboard", nextUrl));
      } else if (user?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
      }
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return;
  }

  if (!isLoggedIn && !isPublicRoute && !isPublicApiRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  // RBAC Checks
  if (isLoggedIn) {
    // 0. Check for Email Verification first (before any other checks)
    const isEmailVerifyPage = nextUrl.pathname === "/verify-email";
    // Also allow check-email just in case, though usually verify-email is the target now
    
    // If email is not verified
    // emailVerified is null for unverified emails (credentials signup)
    // OAuth users have emailVerified set automatically
    if (!user?.emailVerified) {
      // If we are already on the verification page, allow it and stop further checks
      if (isEmailVerifyPage) {
        return;
      }
      // Otherwise redirect to verify-email
      return NextResponse.redirect(new URL("/verify-email", nextUrl));
    }

    // 1. Check for Onboarding Completion (after email verification, ONLY for unverified students)
    // Verified students with incomplete profiles will see a soft prompt (modal) on their dashboard
    const isOnboardingPage = nextUrl.pathname === "/student/complete-profile";
    if (user?.role === "STUDENT" && !user?.isVerified && !user?.onboardingComplete) {
      // If unverified student hasn't completed onboarding
      if (!isOnboardingPage) {
        return NextResponse.redirect(new URL("/student/complete-profile", nextUrl));
      }
      // If they are on the onboarding page, let them be
      return;
    }

    // If onboarding complete but unverified student tries to access onboarding page, redirect to verification status
    if (user?.role === "STUDENT" && !user?.isVerified && user?.onboardingComplete && isOnboardingPage) {
      return NextResponse.redirect(new URL("/student/verification-status", nextUrl));
    }

    // If verified student accesses onboarding page, redirect to dashboard (they can update via profile settings)
    if (user?.role === "STUDENT" && user?.isVerified && isOnboardingPage) {
      return NextResponse.redirect(new URL("/student/dashboard", nextUrl));
    }

    const isVerificationStatusPage = nextUrl.pathname === "/student/verification-status";

    // 2. Check for Student Admin Verification (isVerified = admin approval)
    // Email verification is now handled at login level - users can't login without verified email
    if (user?.role === "STUDENT" && !user.isVerified) {
       // If student is unverified by admin and trying to access anything but the verification status page
       if (!isVerificationStatusPage) {
          return NextResponse.redirect(new URL("/student/verification-status", nextUrl));
       }
       // If they are on the verification page, let them be
       return;
    }

    // If verified student tries to access verification status page, send them to dashboard
    if (user?.role === "STUDENT" && user.isVerified && isVerificationStatusPage) {
       return NextResponse.redirect(new URL("/student/dashboard", nextUrl));
    }
    
    // 2. Role-based Access
    if (isStudentRoute && user?.role !== "STUDENT") {
       if (user?.role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
       }
       return NextResponse.redirect(new URL("/", nextUrl));
    }
    if (isTeacherRoute && user?.role !== "TEACHER") {
       if (user?.role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
       }
       return NextResponse.redirect(new URL("/", nextUrl));
    }
    if (isAdminRoute && user?.role !== "ADMIN") {
       return NextResponse.redirect(new URL("/", nextUrl));
    }
    // Classroom access: All roles can access? Or only enrolled?
    // Middleware can't check enrollment strictly without db call.
    // Auth check is done above (isLoggedIn).
  }
  if (nextUrl.searchParams.has('ref')) {
    const cookieResponse = setReferralCookie(req);
    if (cookieResponse) return cookieResponse;
  }
  return;
});

// Helper to set referral cookie on the response and fire async tracking
function setReferralCookie(req: any): NextResponse | undefined {
  const ref = req.nextUrl.searchParams.get('ref');
  if (!ref) return;

  // Skip if cookie already set for this marketer (deduplication)
  const existingCookie = req.cookies.get('gvs_referral');
  if (existingCookie?.value === ref.toUpperCase()) return;

  const response = NextResponse.next();

  // Set the cookie directly on the middleware response so it reaches the browser
  response.cookies.set('gvs_referral', ref.toUpperCase(), {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  // Still fire click tracking async (best effort)
  fetch(`${req.nextUrl.origin}/api/referral/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ referralCode: ref, page: req.nextUrl.pathname }),
  }).catch(() => {});

  return response;
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

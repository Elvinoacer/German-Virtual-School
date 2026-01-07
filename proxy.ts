import { auth } from "@/lib/auth.config";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
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
    nextUrl.pathname.startsWith("/courses");

  // Route protection logic
  const isStudentRoute = nextUrl.pathname.startsWith("/student");
  const isTeacherRoute = nextUrl.pathname.startsWith("/teacher");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isClassroomRoute = nextUrl.pathname.startsWith("/classroom");
  const isPublicApiRoute =
    (nextUrl.pathname.startsWith("/api/courses") && req.method === "GET") ||
    (nextUrl.pathname.startsWith("/api/testimonials") && req.method === "GET");

  if (isApiAuthRoute) {
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
    // 1. Check for Student Verification
    const isVerificationPage = nextUrl.pathname === "/student/verification-status";

    if (user?.role === "STUDENT" && !user.isVerified) {
       // If student is unverified and trying to access anything but the verification status page
       if (!isVerificationPage) {
          return NextResponse.redirect(new URL("/student/verification-status", nextUrl));
       }
       // If they are on the verification page, let them be
       return;
    }

    // If verified student tries to access verification status page, send them to dashboard
    if (user?.role === "STUDENT" && user.isVerified && isVerificationPage) {
       return NextResponse.redirect(new URL("/student/dashboard", nextUrl));
    }
    
    // 2. Role-based Access
    if (isStudentRoute && user?.role !== "STUDENT") {
       return NextResponse.redirect(new URL("/", nextUrl));
    }
    if (isTeacherRoute && user?.role !== "TEACHER" && user?.role !== "ADMIN") { // Admin might need access?
       return NextResponse.redirect(new URL("/", nextUrl));
    }
    if (isAdminRoute && user?.role !== "ADMIN") {
       return NextResponse.redirect(new URL("/", nextUrl));
    }
    // Classroom access: All roles can access? Or only enrolled?
    // Middleware can't check enrollment strictly without db call.
    // Auth check is done above (isLoggedIn).
  }

  return;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

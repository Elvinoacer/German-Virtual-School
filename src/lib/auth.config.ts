import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { UserRole } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userId: string;
      role: UserRole;
      firstName: string;
      lastName: string;
      isVerified: boolean;
      onboardingComplete: boolean;
      emailVerified: Date | null;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    isVerified: boolean;
    onboardingComplete: boolean;
    emailVerified?: Date | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma as any) as any,
  trustHost: true, // Trust localhost in development
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            passwordHash: true,
            role: true,
            avatarUrl: true,
            isVerified: true,
            onboardingComplete: true,
            emailVerified: true,
          },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await verifyPassword(
          credentials.password as string,
          user.passwordHash,
        );

        if (!isValid) {
          return null;
        }

        // Allow login even if email not verified - middleware will redirect to verify-email
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          image: user.avatarUrl,
          isVerified: user.isVerified,
          onboardingComplete: user.onboardingComplete,
          emailVerified: user.emailVerified,
        };
      },
    }),
    // Google Provider
    // Note: Requires AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET env vars
    {
      id: "google",
      name: "Google",
      type: "oidc",
      issuer: "https://accounts.google.com",
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      profile(profile: any) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          firstName:
            profile.given_name || profile.name?.split(" ")[0] || "Unknown",
          lastName:
            profile.family_name ||
            profile.name?.split(" ").slice(1).join(" ") ||
            ".",
          image: profile.picture,
          role: "STUDENT" as UserRole,
          isVerified: false,
          onboardingComplete: false,
          emailVerified: new Date(),
        };
      },
    },
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers, ensure custom fields are populated
      if (account?.provider && account.provider !== "credentials" && user?.id) {
        try {
          // Check if user already has custom fields populated
          const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
              firstName: true,
              lastName: true,
              role: true,
              isVerified: true,
              emailVerified: true,
            },
          });

          // Only attempt update if user ALREADY exists (prevent P2025 error for new users)
          if (existingUser) {
            // Prepare update data
            const updateData: any = {
              emailVerified: new Date(), // Always verify email for Google sign-in
            };

            // If firstName is the default empty string or missing, populate profile data
            if (!existingUser.firstName || existingUser.firstName === "") {
              const profileData = profile as any;
              const fullName = user.name || profileData?.name || "";
              const nameParts = fullName.split(" ");

              updateData.firstName =
                profileData?.given_name || nameParts[0] || "Unknown";
              updateData.lastName =
                profileData?.family_name || nameParts.slice(1).join(" ") || ".";
              updateData.role = "STUDENT";
              updateData.isVerified = false;
            }

            // Force update to ensure email is verified
            await prisma.user.update({
              where: { id: user.id },
              data: updateData,
            });
          } else {
          }
        } catch (error) {
          console.error("Error updating OAuth user:", error);
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.id = user.id as string;
        token.userId = user.id as string;

        // For OAuth users, the user object from adapter doesn't include custom fields
        // We need to fetch them from the database
        const userWithRole = user as any;

        // Check if we need to fetch fresh data from DB
        const needsDbFetch =
          !userWithRole.role ||
          !userWithRole.firstName ||
          !userWithRole.emailVerified;

        if (needsDbFetch) {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id as string },
            select: {
              firstName: true,
              lastName: true,
              role: true,
              isVerified: true,
              onboardingComplete: true,
              emailVerified: true,
            },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.firstName = dbUser.firstName;
            token.lastName = dbUser.lastName;
            token.isVerified = dbUser.isVerified;
            token.onboardingComplete = dbUser.onboardingComplete;
            token.emailVerified = dbUser.emailVerified;
          }
        } else {
          // Credentials login - use the user object directly if it has everything
          token.role = userWithRole.role;
          token.firstName = userWithRole.firstName;
          token.lastName = userWithRole.lastName;
          token.isVerified = userWithRole.isVerified;
          token.onboardingComplete = userWithRole.onboardingComplete;
          token.emailVerified = userWithRole.emailVerified;
        }

        // Force email verified for OAuth providers if not already set (fixes race condition)
        if (
          account?.provider?.toLowerCase() === "google" &&
          !token.emailVerified
        ) {
          token.emailVerified = new Date();
        }
      }

      // On subsequent calls (no 'user'), check if token is verified.
      if (!token.emailVerified) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { emailVerified: true },
          });
          if (dbUser?.emailVerified) {
            token.emailVerified = dbUser.emailVerified;
          }
        } catch (e) {
          // Ignore db error
        }
      }

      // Optimize: Only fetch user data on sign-in or explicit update
      // We trust the JWT token for subsequent requests to reduce DB load
      if (trigger === "update" && session?.user) {
        // Allow updating token from client-side session.update()
        if (session.user.role) token.role = session.user.role;
        if (session.user.isVerified !== undefined)
          token.isVerified = session.user.isVerified;
        if (session.user.firstName) token.firstName = session.user.firstName;
        if (session.user.lastName) token.lastName = session.user.lastName;
      }

      // Update session if data changed (e.g. verification status update)
      if (trigger === "update" && session) {
        token.isVerified = session.user.isVerified;
      }

      // We might want to re-fetch verification status here on every JWT rotation
      // to ensure real-time blocking, but for now we trust the login check
      return token;
    },
    async session({ session, token }) {
      // console.log("[DEBUG] session callback");
      if (session.user) {
        session.user.id = token.id as string;
        session.user.userId = token.userId as string;
        session.user.role = token.role as UserRole;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.onboardingComplete = token.onboardingComplete as boolean;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      try {
        // Dynamically import to safely run server-side logic (e.g. sending emails)
        // without breaking Edge Middleware compatibility
        const { notifyAdminsOfNewUser } = await import("@/lib/auth-events");
        await notifyAdminsOfNewUser(user as any);

        // Create role-specific profile for OAuth users (credentials flow does this in register API)
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { role: true },
        });

        if (dbUser?.role === "STUDENT") {
          // Check if profile already exists (upsert-like behavior)
          const existingProfile = await prisma.studentProfile.findUnique({
            where: { userId: user.id as string },
          });
          if (!existingProfile) {
            await prisma.studentProfile.create({
              data: { userId: user.id as string },
            });
            console.log(
              "[Auth] Created StudentProfile for OAuth user:",
              user.id,
            );
          }
        } else if (dbUser?.role === "TEACHER") {
          const existingProfile = await prisma.teacherProfile.findUnique({
            where: { userId: user.id as string },
          });
          if (!existingProfile) {
            await prisma.teacherProfile.create({
              data: { userId: user.id as string },
            });
            console.log(
              "[Auth] Created TeacherProfile for OAuth user:",
              user.id,
            );
          }
        }
      } catch (error) {
        console.error("Failed to process createUser event:", error);
      }
    },
    async linkAccount({ user, account }) {
      if (account.provider === "google") {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              emailVerified: new Date(),
              // Admin verification (isVerified) remains false by default
            },
          });
        } catch (error) {
          console.error("Failed to auto-verify email", error);
        }
      }
    },
  },
});

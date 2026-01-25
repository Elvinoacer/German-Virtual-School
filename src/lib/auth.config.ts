import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { UserRole } from '@/generated/prisma/client';

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userId: string;
      role: UserRole;
      firstName: string;
      lastName: string;
      isVerified: boolean;
      emailVerified: Date | null;
    } & DefaultSession["user"];
  }

  interface User {
      id?: string;
      role: UserRole;
      firstName: string;
      lastName: string;
      isVerified: boolean;
      emailVerified?: Date | null;
  }
}


export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
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
            emailVerified: true,
          },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await verifyPassword(
          credentials.password as string,
          user.passwordHash
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
          firstName: profile.given_name || profile.name?.split(" ")[0] || "Unknown",
          lastName: profile.family_name || profile.name?.split(" ").slice(1).join(" ") || ".",  // Fallback to dot or empty string if allowed, likely we need something not empty if possible, but empty string is fine for string type
          image: profile.picture,
          role: "STUDENT" as UserRole, // Default role for OAuth
          isVerified: false, // Default verification status
          emailVerified: new Date(),
        };
      },
    },

  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[DEBUG] signIn callback started");
      
      // For OAuth providers, ensure custom fields are populated
      if (account?.provider && account.provider !== "credentials" && user?.id) {
        console.log("[DEBUG] Processing OAuth signin for:", account.provider);
        try {
          // Check if user already has custom fields populated
          const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { firstName: true, lastName: true, role: true, isVerified: true, emailVerified: true }
          });
          console.log("[DEBUG] Existing user found in DB:", existingUser);
          
          // Only attempt update if user ALREADY exists (prevent P2025 error for new users)
          if (existingUser) {
             // Prepare update data
            const updateData: any = {
              emailVerified: new Date(), // Always verify email for Google sign-in
              isVerified: true, // Automatically approve Google users (bypass admin check)
            };

            // If firstName is the default empty string or missing, populate profile data
            if (!existingUser.firstName || existingUser.firstName === "") {
              console.log("[DEBUG] User detected with missing profile, populating...");
              const profileData = profile as any;
              const fullName = user.name || profileData?.name || "";
              const nameParts = fullName.split(" ");
              
              updateData.firstName = profileData?.given_name || nameParts[0] || "Unknown";
              updateData.lastName = profileData?.family_name || nameParts.slice(1).join(" ") || ".";
              updateData.role = "STUDENT";
              // match linkAccount logic
            }

            console.log("[DEBUG] Updating EXISTING user with data:", updateData);
            // Force update to ensure email is verified
            await prisma.user.update({
              where: { id: user.id },
              data: updateData
            });
            console.log("[DEBUG] Existing User updated successfully");
          } else {
            console.log("[DEBUG] User does not exist yet (New SignUp). Skipping update in signIn callback. expecting events.linkAccount to handle it.");
          }
        } catch (error) {
          console.error("[DEBUG] Error updating OAuth user:", error);
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session, account }) {
      console.log("[DEBUG] jwt callback started. trigger:", trigger);
      if (user) {
        console.log("[DEBUG] jwt - user object present (sign in event)");
        token.id = user.id as string;
        token.userId = user.id as string;
        
        // For OAuth users, the user object from adapter doesn't include custom fields
        // We need to fetch them from the database
        const userWithRole = user as any;
        
        // Check if we need to fetch fresh data from DB
        const needsDbFetch = !userWithRole.role || !userWithRole.firstName || !userWithRole.emailVerified;
        console.log("[DEBUG] needsDbFetch:", needsDbFetch);

        if (needsDbFetch) {
          console.log("[DEBUG] Fetching user from DB for JWT...");
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id as string },
            select: { firstName: true, lastName: true, role: true, isVerified: true, emailVerified: true }
          });
          console.log("[DEBUG] DB User fetched:", dbUser);
          if (dbUser) {
            token.role = dbUser.role;
            token.firstName = dbUser.firstName;
            token.lastName = dbUser.lastName;
            token.isVerified = dbUser.isVerified;
            token.emailVerified = dbUser.emailVerified;
          }
        } else {
          // Credentials login - use the user object directly if it has everything
          token.role = userWithRole.role;
          token.firstName = userWithRole.firstName;
          token.lastName = userWithRole.lastName;
          token.isVerified = userWithRole.isVerified;
          token.emailVerified = userWithRole.emailVerified;
        }

        // Force email verified for OAuth providers if not already set (fixes race condition)
        if (account?.provider?.toLowerCase() === 'google' && !token.emailVerified) {
          console.log("[DEBUG] Forcing emailVerified in JWT for Google signin");
          token.emailVerified = new Date();
        }
      }

      // On subsequent calls (no 'user'), check if token is verified. 
      if (!token.emailVerified) {
         console.log("[DEBUG] Token emailVerified is missing on subsequent call. Checking DB...");
         try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { emailVerified: true }
            });
            console.log("[DEBUG] DB re-check result:", dbUser);
            if (dbUser?.emailVerified) {
              token.emailVerified = dbUser.emailVerified;
            }
         } catch (e) {
           console.error("[DEBUG] DB re-check failed:", e);
         }
      }

      // Optimize: Only fetch user data on sign-in or explicit update
      // We trust the JWT token for subsequent requests to reduce DB load
      if (trigger === "update" && session?.user) {
        // Allow updating token from client-side session.update()
        if (session.user.role) token.role = session.user.role;
        if (session.user.isVerified !== undefined) token.isVerified = session.user.isVerified;
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
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
  },
  events: {
    async linkAccount({ user, account }) {
      console.log("[DEBUG] linkAccount event triggered for:", account.provider);
      if (account.provider === "google") {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { 
                emailVerified: new Date(),
                isVerified: true, // Automatically approve Google users (bypass admin check)
            }
          });
          console.log("[DEBUG] linkAccount: User email AND status automatically verified for Google");
        } catch (error) {
          console.error("[DEBUG] linkAccount: Failed to auto-verify email", error);
        }
      }
    }
  }
});

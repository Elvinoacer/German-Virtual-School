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
    // Microsoft Provider
    // Note: Requires AUTH_MICROSOFT_ENTRA_ID_ID and AUTH_MICROSOFT_ENTRA_ID_SECRET env vars
    {
      id: "microsoft-entra-id",
      name: "Microsoft Entra ID",
      type: "oidc",
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      authorization: { params: { scope: "openid profile email User.Read" } },
      profile(profile: any) {
         return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          firstName: profile.given_name || profile.name?.split(" ")[0] || "Unknown",
          lastName: profile.family_name || profile.name?.split(" ").slice(1).join(" ") || ".",
          image: null,
          role: "STUDENT" as UserRole,
          isVerified: false,
          emailVerified: new Date(),
        };
      }
    }
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[AUTH DEBUG] signIn callback triggered");
      console.log("[AUTH DEBUG] account provider:", account?.provider);
      console.log("[AUTH DEBUG] user:", JSON.stringify(user, null, 2));
      console.log("[AUTH DEBUG] profile:", JSON.stringify(profile, null, 2));
      
      // For OAuth providers, ensure custom fields are populated
      // PrismaAdapter only saves standard NextAuth fields (id, email, name, image, emailVerified)
      // We need to update the user with our custom fields (firstName, lastName, role, isVerified)
      if (account?.provider && account.provider !== "credentials" && user?.id) {
        console.log("[AUTH DEBUG] OAuth provider detected, checking user custom fields");
        try {
          // Check if user already has custom fields populated
          const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { firstName: true, lastName: true, role: true, isVerified: true, emailVerified: true }
          });
          console.log("[AUTH DEBUG] existingUser from DB:", JSON.stringify(existingUser, null, 2));
          
          // If firstName is the default empty string or missing, this is a new OAuth user
          // The schema has firstName as required String, so Prisma will set it to empty string by default
          if (existingUser && (!existingUser.firstName || existingUser.firstName === "")) {
            console.log("[AUTH DEBUG] New OAuth user - updating custom fields");
            const profileData = profile as any;
            const fullName = user.name || profileData?.name || "";
            const nameParts = fullName.split(" ");
            
            const updateData = {
              firstName: profileData?.given_name || nameParts[0] || "Unknown",
              lastName: profileData?.family_name || nameParts.slice(1).join(" ") || ".",
              role: "STUDENT" as const,
              isVerified: false,
              emailVerified: new Date(),
            };
            console.log("[AUTH DEBUG] Update data:", JSON.stringify(updateData, null, 2));
            
            await prisma.user.update({
              where: { id: user.id },
              data: updateData
            });
            console.log("[AUTH DEBUG] User updated successfully");
          } else {
            console.log("[AUTH DEBUG] Existing OAuth user - no update needed");
          }
        } catch (error) {
          console.error("[AUTH DEBUG] Error updating OAuth user with custom fields:", error);
          // Don't block sign-in on error, user can still login
        }
      }
      console.log("[AUTH DEBUG] signIn returning true");
      return true;
    },
    async jwt({ token, user, trigger, session, account }) {
      console.log("[AUTH DEBUG] jwt callback triggered, trigger:", trigger);
      if (user) {
        console.log("[AUTH DEBUG] jwt - user object present:", JSON.stringify(user, null, 2));
        token.id = user.id as string;
        token.userId = user.id as string;
        
        // For OAuth users, the user object from adapter doesn't include custom fields
        // We need to fetch them from the database
        const userWithRole = user as any;
        console.log("[AUTH DEBUG] jwt - userWithRole.role:", userWithRole.role, ", firstName:", userWithRole.firstName);
        if (!userWithRole.role || !userWithRole.firstName) {
          console.log("[AUTH DEBUG] jwt - fetching user data from DB");
          // Fetch user data from database
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id as string },
            select: { firstName: true, lastName: true, role: true, isVerified: true, emailVerified: true }
          });
          console.log("[AUTH DEBUG] jwt - dbUser:", JSON.stringify(dbUser, null, 2));
          if (dbUser) {
            token.role = dbUser.role;
            token.firstName = dbUser.firstName;
            token.lastName = dbUser.lastName;
            token.isVerified = dbUser.isVerified;
            token.emailVerified = dbUser.emailVerified;
          }
        } else {
          console.log("[AUTH DEBUG] jwt - using user object directly (credentials)");
          // Credentials login - use the user object directly
          token.role = userWithRole.role;
          token.firstName = userWithRole.firstName;
          token.lastName = userWithRole.lastName;
          token.isVerified = userWithRole.isVerified;
          token.emailVerified = userWithRole.emailVerified;
        }
      }
      console.log("[AUTH DEBUG] jwt - final token:", JSON.stringify({ id: token.id, role: token.role, firstName: token.firstName, isVerified: token.isVerified }, null, 2));

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
      console.log("[AUTH DEBUG] session callback triggered");
      console.log("[AUTH DEBUG] session - token:", JSON.stringify({ id: token.id, role: token.role, firstName: token.firstName, isVerified: token.isVerified }, null, 2));
      if (session.user) {
        session.user.id = token.id as string;
        session.user.userId = token.userId as string;
        session.user.role = token.role as UserRole;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      console.log("[AUTH DEBUG] session - final session.user:", JSON.stringify(session.user, null, 2));
      return session;
    },
  },
});

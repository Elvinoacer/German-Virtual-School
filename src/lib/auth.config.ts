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
    } & DefaultSession["user"];
  }

  interface User {
      id?: string;
      role: UserRole;
      firstName: string;
      lastName: string;
      isVerified: boolean;
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
        };
      }
    }
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.userId = user.id as string;
        token.role = (user as any).role;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.isVerified = (user as any).isVerified;
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
      if (session.user) {
        session.user.id = token.id as string;
        session.user.userId = token.userId as string;
        session.user.role = token.role as UserRole;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
  },
});

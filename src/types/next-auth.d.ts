import { DefaultSession } from "next-auth";
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

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userId: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    isVerified: boolean;
  }
}

import NextAuth, { DefaultSession } from "next-auth";

import { Role } from "@prisma/client";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id. */
      id: string;
      role: Role;
      points: number;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    points: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    points: number;
  }
}

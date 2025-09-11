import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Расширяем стандартный тип Session, добавляя в него наше поле id.
   */
  interface Session {
    user?: {
      id?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /**
   * Расширяем стандартный тип JWT, добавляя в него наше поле id.
   */
  interface JWT {
    id?: string;
  }
}
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import client from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
  // adapter: PrismaAdapter(client),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const agent = await client.agent.findUnique({
          where: { email: credentials.email }
        });

        if (agent && await bcrypt.compare(credentials.password, agent.password)) {
          // ВАЖНО: Возвращаем объект агента, включая его ID
          return { 
            id: agent.id, 
            email: agent.email,
            // можно добавить и другие поля, если нужно
          };
        }
        return null;
      }
    })
  ],
  // ==========================================================
  // НАША НОВАЯ И САМАЯ ВАЖНАЯ ЧАСТЬ
  // ==========================================================
  session: {
    strategy: 'jwt', // Обязательно используем JWT для кастомных callbacks
  },
  callbacks: {
    async jwt({ token, user }) {
      // Когда JWT создается (после логина), мы добавляем в него ID пользователя
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Когда создается сессия, мы берем ID из токена и кладем его в session.user
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  // ==========================================================
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/agent/login', // Указываем нашу страницу входа
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = exports.authOptions = void 0;
const next_auth_1 = __importDefault(require("next-auth")); // Импортируем AuthOptions
const prisma_adapter_1 = require("@auth/prisma-adapter");
const prisma_1 = __importDefault(require("@/lib/prisma"));
const credentials_1 = __importDefault(require("next-auth/providers/credentials"));
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.authOptions = {
    adapter: (0, prisma_adapter_1.PrismaAdapter)(prisma_1.default),
    providers: [
        (0, credentials_1.default)({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text', placeholder: 'agent@travel.com' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!(credentials === null || credentials === void 0 ? void 0 : credentials.email) || !credentials.password) {
                    return null;
                }
                const agent = await prisma_1.default.agent.findUnique({
                    where: { email: credentials.email },
                });
                if (!agent) {
                    return null;
                }
                const isPasswordValid = await bcrypt_1.default.compare(credentials.password, agent.password);
                if (!isPasswordValid) {
                    return null;
                }
                // Возвращаем полный объект agent
                return agent;
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/agent/login',
    },
    // ===============================================
    // ДОБАВЛЯЕМ ЭТОТ БЛОК CALLBACKS
    // ===============================================
    callbacks: {
        // Этот callback вызывается при создании JWT
        async jwt({ token, user }) {
            // При первом входе (когда `user` доступен) добавляем id в токен
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        // Этот callback вызывается при создании объекта сессии
        async session({ session, token }) {
            // Добавляем id из токена в объект сессии
            if (token && session.user) {
                session.user.id = token.id;
            }
            return session;
        },
    },
};
const handler = (0, next_auth_1.default)(exports.authOptions);
exports.GET = handler;
exports.POST = handler;

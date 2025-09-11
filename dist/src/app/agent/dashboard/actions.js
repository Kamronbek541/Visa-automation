"use strict";
'use server';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientAndApplication = createClientAndApplication;
const route_1 = require("@/app/api/auth/[...nextauth]/route");
const prisma_1 = __importDefault(require("@/lib/prisma"));
const next_auth_1 = require("next-auth");
const nanoid_1 = require("nanoid");
// Создаем кастомный генератор для кодов вида UK-A8B3-F7K2
const nanoid = (0, nanoid_1.customAlphabet)('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);
async function createClientAndApplication(fullName) {
    var _a;
    // 1. Проверяем сессию, чтобы убедиться, что действие выполняет авторизованный агент
    const session = await (0, next_auth_1.getServerSession)(route_1.authOptions);
    if (!((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.id)) {
        return { success: false, message: 'Unauthorized' };
    }
    // 2. Находим агента и его компанию в базе данных
    const agent = await prisma_1.default.agent.findUnique({
        where: { id: session.user.id },
        include: { company: true },
    });
    if (!agent) {
        return { success: false, message: 'Agent not found.' };
    }
    try {
        // 3. Создаем нового клиента
        const newClient = await prisma_1.default.client.create({
            data: {
                fullName: fullName,
                // Здесь можно будет добавить привязку к компании или агенту
            },
        });
        // 4. Генерируем уникальный код и создаем для него заявку
        const accessCode = `UK-${nanoid(4)}-${nanoid(4)}`;
        await prisma_1.default.application.create({
            data: {
                accessCode: accessCode,
                country: 'UK', // Пока хардкодим UK
                status: 'DRAFT', // Начальный статус
                client: {
                    connect: { id: newClient.id }, // Связываем заявку с созданным клиентом
                },
            },
        });
        return { success: true };
    }
    catch (error) {
        console.error("Error creating client/application:", error);
        return { success: false, message: 'Database error.' };
    }
}

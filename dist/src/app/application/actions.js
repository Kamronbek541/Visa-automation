"use strict";
// application/action.ts
'use server';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveApplicationData = saveApplicationData;
const prisma_1 = __importDefault(require("@/lib/prisma"));
const cache_1 = require("next/cache");
const zod_1 = require("zod");
const visa_schema_1 = require("@/lib/visa-schema"); // <-- ИМПОРТИРУЕМ НАШУ ОСНОВНУЮ СХЕМУ
async function saveApplicationData(input) {
    try {
        // 1. Валидируем входящие данные на сервере (двойная проверка)
        // Используем полную схему для валидации всех полей сразу.
        const validatedData = visa_schema_1.UkVisaSchema.parse(input.formData);
        // 2. Данные уже в правильной структуре благодаря Zod,
        // так что дополнительное преобразование не нужно.
        // Zod уже гарантирует, что у нас есть `dateOfBirth: { day, month, year }`.
        // 3. Обновляем запись в базе данных
        await prisma_1.default.application.update({
            where: {
                accessCode: input.accessCode,
            },
            data: {
                formData: validatedData, // Сохраняем весь объект в поле formData
                status: 'PENDING', // Меняем статус на "Ожидает проверки агентом"
            },
        });
        // 4. Очищаем кеш для этой страницы
        (0, cache_1.revalidatePath)(`/application/${input.accessCode}`);
        (0, cache_1.revalidatePath)(`/agent/dashboard`); // Также очистим кеш дашборда, чтобы там обновился список
        return { success: true, message: 'Application submitted successfully.' };
    }
    catch (error) {
        console.error('Failed to save application data:', error);
        if (error instanceof zod_1.z.ZodError) {
            // Это поможет нам при отладке понять, какое именно поле не прошло валидацию
            console.error('Zod Validation Errors:', error.flatten().fieldErrors);
            return { success: false, message: 'Validation failed. Please check your input.', errors: error.errors };
        }
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

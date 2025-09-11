"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
// src/app/api/agent/run-automation/route.ts
const prisma_1 = __importDefault(require("@/lib/prisma"));
const server_1 = require("next/server");
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const uk_visa_script_1 = require("@/automation/uk-visa-script"); // Мы создадим этот файл в след. шаге
// Применяем stealth-плагин
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
async function POST(req) {
    try {
        const { applicationId } = await req.json();
        if (!applicationId) {
            return server_1.NextResponse.json({ message: 'Application ID is required' }, { status: 400 });
        }
        // 1. Получаем данные заявки из нашей базы
        const application = await prisma_1.default.application.findUnique({
            where: { id: applicationId },
        });
        if (!application || !application.formData) {
            return server_1.NextResponse.json({ message: 'Application not found or is empty' }, { status: 404 });
        }
        // 2. Обновляем статус в базе, чтобы агент видел, что работа началась
        await prisma_1.default.application.update({
            where: { id: applicationId },
            data: { status: 'PROCESSING' }
        });
        // 3. Запускаем нашу автоматизацию!
        // Мы используем then/catch, чтобы не блокировать ответ сервера.
        // Автоматизация будет работать в фоне.
        (0, uk_visa_script_1.runUkVisaAutomation)(applicationId, application.formData)
            .then(result => {
            console.log(`✅ Automation for ${applicationId} completed successfully.`);
            // В будущем здесь можно отправлять уведомление агенту
        })
            .catch(error => {
            console.error(`❌ Automation for ${applicationId} failed:`, error.message);
        });
        // 4. Сразу же отвечаем агенту, что процесс запущен
        return server_1.NextResponse.json({ message: 'Automation started successfully!' });
    }
    catch (error) {
        console.error('Error in run-automation endpoint:', error);
        return server_1.NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

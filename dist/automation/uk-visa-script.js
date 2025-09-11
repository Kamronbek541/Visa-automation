"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runUkVisaAutomation = runUkVisaAutomation;
// automation/uk-visa-script.ts
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const prisma_1 = __importDefault(require("@/lib/prisma"));
const uk_visa_selectors_json_1 = __importDefault(require("./uk-visa-selectors.json"));
// Вспомогательная функция для клика и ожидания
async function clickAndWait(page, selector) {
    await page.waitForSelector(selector, { visible: true });
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click(selector),
    ]);
}
// Основная функция, которую вызывает наш API
async function runUkVisaAutomation(applicationId, formData) {
    const data = formData; // Приводим к нашему типу
    let browser;
    try {
        console.log(`🚀 Starting automation for Application ID: ${applicationId}`);
        browser = await puppeteer_extra_1.default.launch({ headless: false, slowMo: 50 }); // headless: false для отладки
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto('https://visas-immigration.service.gov.uk/product/uk-visit-visa');
        // --- Start Page ---
        await clickAndWait(page, uk_visa_selectors_json_1.default.startPage.languageEnglish);
        // --- Visa Type Page ---
        await clickAndWait(page, uk_visa_selectors_json_1.default.visaTypePage.standardVisitorVisa);
        // --- Country Select Page ---
        await page.waitForSelector(uk_visa_selectors_json_1.default.countrySelectPage.countryInput);
        await page.type(uk_visa_selectors_json_1.default.countrySelectPage.countryInput, data.countryRef); // Используем данные из формы!
        await clickAndWait(page, uk_visa_selectors_json_1.default.startPage.submitButton); // Кнопка та же
        // ... И так далее, мы вызываем маленькие функции для каждой страницы
        // Пример заполнения личной информации
        await fillPersonalDetails(page, data);
        console.log('✅ Automation logic finished. Need to get the resume link.');
        // В конце, когда все заполнено
        const resumeLink = 'https://some-resume-link-from-portal.com'; // Здесь будет логика получения ссылки
        // Сохраняем результат в базу
        await prisma_1.default.application.update({
            where: { id: applicationId },
            data: { status: 'COMPLETED', resumeLink: resumeLink },
        });
    }
    catch (error) {
        console.error(`🔥 An error occurred during automation for ${applicationId}:`, error);
        // Сохраняем ошибку в базу
        await prisma_1.default.application.update({
            where: { id: applicationId },
            data: { status: 'FAILED', errorMessage: error.message },
        });
        // Передаем ошибку дальше, чтобы она отобразилась в логах сервера
        throw error;
    }
    finally {
        if (browser) {
            // await browser.close(); // Раскомментировать для продакшена
        }
        console.log(`✅ Finished processing application ${applicationId}`);
    }
}
// Пример маленькой функции для одной страницы
async function fillPersonalDetails(page, data) {
    console.log('Filling personal details...');
    await page.waitForSelector(uk_visa_selectors_json_1.default.personalInfoPage.givenNameInput);
    await page.type(uk_visa_selectors_json_1.default.personalInfoPage.givenNameInput, data.givenNameFirst);
    await page.type(uk_visa_selectors_json_1.default.personalInfoPage.familyNameInput, data.familyNameFirst);
    // ... здесь логика для выбора пола, даты рождения и т.д.
    await clickAndWait(page, uk_visa_selectors_json_1.default.startPage.submitButton);
    console.log('Personal details page completed.');
}

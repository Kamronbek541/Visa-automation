// src/automation/uk-visa-script.ts
import { Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import prisma from '@/lib/prisma';
import { UkVisaDataType } from '@/lib/visa-schema';
import selectors from './uk-visa-selectors.json';
import { OpenAI } from 'openai';

async function safeClick(page: Page, selector: string, options: { waitForNavigation?: boolean } = {}) {
  await page.waitForSelector(selector, { visible: true, timeout: 20000 });
  const element = await page.$(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);
  
  await element.evaluate(el => el.scrollIntoView({ block: 'center' }));
  await page.waitForFunction(selector => {
    const el = document.querySelector(selector);
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }, {}, selector);

  if (options.waitForNavigation) {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
      element.click(),
    ]);
  } else {
    await element.click();
  }
}


async function safeType(page: Page, selector: string, text: string) {
  await page.waitForSelector(selector, { visible: true, timeout: 20000 });
  const element = await page.$(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);
  await element.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await element.type(text, { delay: 1 }); 
}

async function safeSelect(page: Page, selector: string, value: string) {
  await page.waitForSelector(selector, { visible: true, timeout: 20000 });
  await page.select(selector, value);
}
function needsPreviousAddress(time: { unit: string; value: string }): boolean {
  if (!time || !time.value || !/^\d+$/.test(time.value)) return false;
  const valueNum = parseInt(time.value, 10);
  if (time.unit === 'years') return valueNum < 2;
  if (time.unit === 'months') return valueNum < 24;
  if (time.unit === 'weeks') return valueNum < 104;
  if (time.unit === 'days') return valueNum < 730;
  return false;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type GeneratedData = {
  arrivalDate: string; // В ISO формате
  leaveDate: string;   // В ISO формате
  adults: number;
  children: number;
}


// export async function runUkVisaAutomation(applicationId: string, formData: any, agentCredentials: { email: string; password: string }) {
//   const data = formData as UkVisaDataType;
//   let browser: Browser | null = null;

//   try {
//     // ==========================================================
//     // ЭТАП 1: ПОДГОТОВКА ДАННЫХ (включая "заглушку" для отеля)
//     // ==========================================================
    
//     // --- 1. Даты поездки (остаются без изменений) ---
//     const arrivalDate = new Date();
//     arrivalDate.setDate(arrivalDate.getDate() + 42);
//     const tripDurationDays = Math.floor(Math.random() * (16 - 7 + 1)) + 7;
//     const leaveDate = new Date(arrivalDate);
//     leaveDate.setDate(leaveDate.getDate() + tripDurationDays);
    
//     // --- 2. Количество гостей (остается без изменений) ---
//     const numberOfGuests = 1 + (data.partnerDetails?.isTravellingWithYou ? 1 : 0) + (data.dependants?.filter(d => d.isTravellingWithYou).length || 0);
    
//     // --- 3. "Заглушка" для отеля ---
//     const hotelBookingDetails = {
//         name: 'The Strand Palace Hotel', // Реальный отель
//         addressLine1: '372 Strand',
//         townCity: 'London',
//         postCode: 'WC2R 0JJ' // Реальный индекс
//     };
    
//     // Обновляем локальные данные, чтобы использовать их дальше в скрипте
//     data.hotelBookingDetails = hotelBookingDetails;

//     // --- 4. Выводим инструкцию для оператора в консоль ---
//     console.log(`
//     ============================================================
//     !!! ACTION REQUIRED FOR AGENT !!!
//     Please book a hotel in LONDON with free cancellation.
//     Check-in: ${arrivalDate.toLocaleDateString()}
//     Check-out: ${leaveDate.toLocaleDateString()}
//     Number of guests: ${numberOfGuests}
//     ============================================================
//     `);

//     // ==========================================================
//     // ЭТАП 2: ЗАПОЛНЕНИЕ ВИЗОВОЙ АНКЕТЫ
//     // ==========================================================
//     browser = await puppeteer.launch({ headless: false, slowMo: 50 });
//     const page = await browser.newPage();
//     await page.setViewport({ width: 1366, height: 768 });
//     await page.goto('https://visas-immigration.service.gov.uk/apply-visa-type/visit', { waitUntil: 'networkidle2' });

export async function runUkVisaAutomation(
  applicationId: string, 
  formData: any, 
  agentCredentials: { email: string; password: string },
  generatedData: GeneratedData // <-- НОВЫЙ АРГУМЕНТ
) {
const data = formData as UkVisaDataType;
let browser: Browser | null = null;

try {
  // --- ЭТАП 1: ПОДГОТОВКА ДАННЫХ ---
  // Преобразуем даты из ISO строк обратно в объекты Date
  const arrivalDate = new Date(generatedData.arrivalDate);
  const leaveDate = new Date(generatedData.leaveDate);
  const tripDurationDays = Math.round((leaveDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));

  const hotelBookingDetails = {
      name: 'The Strand Palace Hotel',
      addressLine1: '372 Strand',
      townCity: 'London',
      postCode: 'WC2R 0JJ'
  };
  data.hotelBookingDetails = hotelBookingDetails;

  // --- ЭТАП 2: ЗАПОЛНЕНИЕ ВИЗОВОЙ АНКЕТЫ ---
  browser = await puppeteer.launch({ headless: false, slowMo: 0 });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('https://visas-immigration.service.gov.uk/apply-visa-type/visit', { waitUntil: 'networkidle2' });
  

// ШАГ 1: ВЫБОР ЯЗЫКА
await safeClick(page, selectors.languagePage.englishRadioButton);
await safeClick(page, selectors.languagePage.nextButton, { waitForNavigation: true });

// ШАГ 2: ВЫБОР СТРАНЫ
await safeType(page, selectors.countrySelectPage.countryInput, 'Uzbekistan');
await page.waitForSelector(selectors.countrySelectPage.countrySuggestion, { visible: true });
await page.keyboard.press('Enter');
// await safeClick(page, selectors.countrySelectPage.nextButton, { waitForNavigation: true });

// ШАГ 3: ПОДТВЕРЖДЕНИЕ VAC
await safeClick(page, selectors.vacConfirmationPage.confirmTrueRadioButton);
await page.waitForSelector(`${selectors.vacConfirmationPage.nextButton}:not([disabled])`, { visible: true });
await safeClick(page, selectors.vacConfirmationPage.nextButton, { waitForNavigation: true });

// ШАГ 4: НАЧАЛО ЗАПОЛНЕНИЯ
await safeClick(page, selectors.startApplicationPage.startButton, { waitForNavigation: true });

// ШАГ 5: РЕГИСТРАЦИЯ/ВХОД
await safeType(page, selectors.accountSetupPage.emailInput, agentCredentials.email);
await safeType(page, selectors.accountSetupPage.passwordInput_1, agentCredentials.password);
await safeType(page, selectors.accountSetupPage.passwordInput_2, agentCredentials.password);
await safeClick(page, selectors.accountSetupPage.saveButton, { waitForNavigation: true });

// ШАГ 6: ПОДТВЕРЖДЕНИЕ EMAIL
await safeClick(page, selectors.emailOwnerPage.isMyEmailRadioButton);
await safeClick(page, selectors.emailOwnerPage.saveButton, { waitForNavigation: true });

// ШАГ 7: ДОПОЛНИТЕЛЬНЫЙ EMAIL
await safeClick(page, selectors.additionalEmailPage.noAdditionalEmailRadioButton);
await safeClick(page, selectors.additionalEmailPage.saveButton, { waitForNavigation: true });

// ШАГ 8: ВВОД НОМЕРА ТЕЛЕФОНА
await safeType(page, selectors.telephonePage.telephoneInput, data.telephoneNumber);
await safeClick(page, selectors.telephonePage.purposeOutsideUKCheckbox);
await safeClick(page, selectors.telephonePage.typeMobileCheckbox);
await safeClick(page, selectors.telephonePage.saveButton, { waitForNavigation: true });

// ШАГ 9: ДРУГОЙ НОМЕР?
await safeClick(page, selectors.addAnotherTelephonePage.noRadioButton);
await safeClick(page, selectors.addAnotherTelephonePage.saveButton, { waitForNavigation: true });

// ШАГ 10: ПРЕДПОЧТЕНИЯ ПО СВЯЗИ
await safeClick(page, selectors.contactPreferencePage.callAndTextRadioButton);
await safeClick(page, selectors.contactPreferencePage.saveButton, { waitForNavigation: true });

// ШАГ 11: ВВОД ИМЕНИ
await safeType(page, selectors.namePage.givenNameInput, data.givenNameFirst);
await safeType(page, selectors.namePage.familyNameInput, data.familyNameFirst);
await safeClick(page, selectors.namePage.saveButton, { waitForNavigation: true });

// ШАГ 12: ДРУГИЕ ИМЕНА?
await safeClick(page, selectors.otherNamesPage.noRadioButton);
await safeClick(page, selectors.otherNamesPage.saveButton, { waitForNavigation: true });

// ШАГ 13: ПОЛ И СЕМ. ПОЛОЖЕНИЕ
if (data.sex === 'M') await safeClick(page, selectors.personalDetailsPage.genderMaleRadioButton);
else if (data.sex === 'F') await safeClick(page, selectors.personalDetailsPage.genderFemaleRadioButton);
await safeSelect(page, selectors.personalDetailsPage.relationshipStatusSelect, data.relationshipStatus);
await safeClick(page, selectors.personalDetailsPage.saveButton, { waitForNavigation: true });

// ==========================================================
// ШАГ 14: ВВОД АДРЕСА (ФИНАЛЬНАЯ ВЕРСИЯ 5.0 - с правильным порядком)
// ==========================================================
console.log("Step 14: Providing address...");
await page.waitForSelector(selectors.addressPage.addressLine1Input, { visible: true, timeout: 30000 });

await safeType(page, selectors.addressPage.addressLine1Input, data.outOfCountryAddress);
await safeType(page, selectors.addressPage.townCityInput, data.townCity);
await safeType(page, selectors.addressPage.countryInput, data.countryRef);

await page.waitForSelector(selectors.countrySelectPage.countrySuggestion, { visible: true });
await page.keyboard.press('Enter');
console.log("Country selected from suggestion.");

console.log("Confirming correspondence address...");

// 1. ЖДЕМ, ПОКА РАДИОКНОПКА СТАНЕТ ДОСТУПНОЙ
await page.waitForSelector(selectors.addressPage.correspondenceAddressYes, { visible: true });

// 2. ДЕЛАЕМ СИЛОВОЙ КЛИК
await page.evaluate((selector) => {
    const element = document.querySelector(selector) as HTMLInputElement;
    if (element) element.click();
}, selectors.addressPage.correspondenceAddressYes);

// 3. ЖДЕМ ПОДТВЕРЖДЕНИЯ, ЧТО КЛИК СРАБОТАЛ
await page.waitForFunction(
    (selector) => (document.querySelector(selector) as HTMLInputElement)?.checked,
    { timeout: 5000 },
    selectors.addressPage.correspondenceAddressYes
);
console.log("Radio button is now confirmed as checked.");

// ==========================================================
// 4. И ТОЛЬКО ТЕПЕРЬ НАЖИМАЕМ "SAVE AND CONTINUE" ОДИН РАЗ
// ==========================================================
await safeClick(page, selectors.addressPage.saveButton, { waitForNavigation: true });
console.log("Address provided successfully.");

// ...

// // ШАГ 15: СТАТУС ПРОЖИВАНИЯ
// await safeType(page, selectors.livingSituationPage.timeLivedValueInput, data.timeLivedAtAddress.value);
// await safeSelect(page, selectors.livingSituationPage.timeLivedUnitSelect, data.timeLivedAtAddress.unit);
// ШАГ 15: СТАТУС ПРОЖИВАНИЯ (НОВАЯ ЛОГИКА)
// ==========================================================
// 1. Конвертируем общее кол-во месяцев в годы и месяцы
const totalMonths = data.timeLivedAtAddressInMonths;
const years = Math.floor(totalMonths / 12);
const months = totalMonths % 12;

// 2. Вводим данные
await safeType(page, selectors.livingSituationPage.yearsLivedInput, String(years));
await safeType(page, selectors.livingSituationPage.monthsLivedInput, String(months));

if (data.statusOfOwnershipHome === 'OWNED') await safeClick(page, selectors.livingSituationPage.ownershipOwnRadioButton);
else if (data.statusOfOwnershipHome === 'RENTED') await safeClick(page, selectors.livingSituationPage.ownershipRentRadioButton);
else if (data.statusOfOwnershipHome === 'OTHER') {
    await safeClick(page, selectors.livingSituationPage.ownershipOtherRadioButton);
    await safeType(page, selectors.livingSituationPage.otherOwnershipDetailsTextarea, data.otherOwnershipDetails);
}
await safeClick(page, selectors.livingSituationPage.saveButton, { waitForNavigation: true });

// ШАГ 16: ПРЕДЫДУЩИЙ АДРЕС (ЕСЛИ НУЖНО)
// if (needsPreviousAddress(data.timeLivedAtAddress) && data.previousAddress) {
  if (totalMonths < 24 && data.previousAddress) {
    await safeClick(page, selectors.previousAddressPage.notInUkRadioButton);
    await safeType(page, selectors.previousAddressPage.addressLine1Input, data.previousAddress.addressLine1);
    await safeType(page, selectors.previousAddressPage.townCityInput, data.previousAddress.townCity);
    const countryCode = 'UZB'; // TODO: Converter
    await safeSelect(page, selectors.previousAddressPage.countrySelect, countryCode);
    await safeType(page, selectors.previousAddressPage.startDateMonthInput, data.previousAddress.startDate.month);
    await safeType(page, selectors.previousAddressPage.startDateYearInput, data.previousAddress.startDate.year);
    await safeType(page, selectors.previousAddressPage.endDateMonthInput, data.previousAddress.endDate.month);
    await safeType(page, selectors.previousAddressPage.endDateYearInput, data.previousAddress.endDate.year);
    await safeClick(page, selectors.previousAddressPage.saveButton, { waitForNavigation: true });
    // НОВЫЙ ШАГ 16.5: ДОБАВИТЬ ЕЩЕ ОДИН АДРЕС? (Выбираем "Нет")
    await safeClick(page, selectors.addAnotherAddressPage.noRadioButton);
    await safeClick(page, selectors.addAnotherAddressPage.saveButton, { waitForNavigation: true });
} else {
    console.log("Lived at address more than 2 years. Skipping previous address page.");
}

// ШАГ 17: ВВОД ПАСПОРТНЫХ ДАННЫХ (Данные из формы)
await safeType(page, selectors.passportDetailsPage.passportNumberInput, data.passportNumber);
await safeType(page, selectors.passportDetailsPage.issuingCountryInput, data.issuingAuthority);
await safeType(page, selectors.passportDetailsPage.issueDayInput, data.issueDate.day);
await safeType(page, selectors.passportDetailsPage.issueMonthInput, data.issueDate.month);
await safeType(page, selectors.passportDetailsPage.issueYearInput, data.issueDate.year);
await safeType(page, selectors.passportDetailsPage.expiryDayInput, data.expiryDate.day);
await safeType(page, selectors.passportDetailsPage.expiryMonthInput, data.expiryDate.month);
await safeType(page, selectors.passportDetailsPage.expiryYearInput, data.expiryDate.year);
await safeClick(page, selectors.passportDetailsPage.saveButton, { waitForNavigation: true });

// ШАГ 18: ВВОД ДАННЫХ NATIONAL ID CARD
await safeClick(page, selectors.nationalIdPage.hasIdCardYesRadioButton);
await safeType(page, selectors.nationalIdPage.idCardNumberInput, data.nationalIdCard.documentNumber);
await safeType(page, selectors.nationalIdPage.issuingAuthorityInput, data.nationalIdCard.issuingAuthority);
await safeType(page, selectors.nationalIdPage.issueDayInput, data.nationalIdCard.issueDate.day);
await safeType(page, selectors.nationalIdPage.issueMonthInput, data.nationalIdCard.issueDate.month);
await safeType(page, selectors.nationalIdPage.issueYearInput, data.nationalIdCard.issueDate.year);
await safeType(page, selectors.nationalIdPage.expiryDayInput, data.nationalIdCard.expiryDate.day);
await safeType(page, selectors.nationalIdPage.expiryMonthInput, data.nationalIdCard.expiryDate.month);
await safeType(page, selectors.nationalIdPage.expiryYearInput, data.nationalIdCard.expiryDate.year);
await safeClick(page, selectors.nationalIdPage.saveButton, { waitForNavigation: true });

// ШАГ 19: ГРАЖДАНСТВО И ДАТА РОЖДЕНИЯ
await safeType(page, selectors.nationalityPage.nationalityInput, 'Uzbekistan');
await safeType(page, selectors.nationalityPage.countryOfBirthInput, 'Uzbekistan');
await safeType(page, selectors.nationalityPage.placeOfBirthInput, data.placeOfBirth);
await safeType(page, selectors.nationalityPage.dobDayInput, data.dateOfBirth.day);
await safeType(page, selectors.nationalityPage.dobMonthInput, data.dateOfBirth.month);
await safeType(page, selectors.nationalityPage.dobYearInput, data.dateOfBirth.year);
await safeClick(page, selectors.nationalityPage.saveButton, { waitForNavigation: true });

// ШАГ 20: ДРУГОЕ ГРАЖДАНСТВО (Выбираем "Нет")
await safeClick(page, selectors.otherNationalityPage.noRadioButton);
await safeClick(page, selectors.otherNationalityPage.saveButton, { waitForNavigation: true });

// ШАГ 21: СТАТУС ЗАНЯТОСТИ (Условный выбор)
// ==========================================================
const empType = data.employmentType;
if (empType === 'EMPLOYED') {
  await safeClick(page, selectors.employmentStatusPage.employedCheckbox);
} else if (empType === 'SELF_EMPLOYED') {
  await safeClick(page, selectors.employmentStatusPage.selfEmployedCheckbox);
} else if (empType === 'STUDENT') {
  await safeClick(page, selectors.employmentStatusPage.studentCheckbox);
} else if (empType === 'UNEMPLOYED') {
  await safeClick(page, selectors.employmentStatusPage.unemployedCheckbox);
} else if (empType === 'STUDENT_EMPLOYED') {
  await safeClick(page, selectors.employmentStatusPage.employedCheckbox);
  await safeClick(page, selectors.employmentStatusPage.studentCheckbox);
}
await safeClick(page, selectors.employmentStatusPage.saveButton, { waitForNavigation: true });

// ==========================================================
// ШАГ 22: ДЕТАЛИ РАБОТОДАТЕЛЯ (ЕСЛИ НУЖНО)
// ==========================================================
if ((empType === 'EMPLOYED' || empType === 'STUDENT_EMPLOYED') && data.employerDetails) {
  const details = data.employerDetails;
  await safeType(page, selectors.employerDetailsPage.employerInput, details.name);
  await safeType(page, selectors.employerDetailsPage.addressLine1Input, details.address);
  await safeType(page, selectors.employerDetailsPage.townCityInput, details.townCity);
  await safeType(page, selectors.employerDetailsPage.provinceInput, details.townCity); // Как вы и просили
  await safeType(page, selectors.employerDetailsPage.countryInput, details.country);
  await safeType(page, selectors.employerDetailsPage.phoneCodeInput, details.phoneCode);
  await safeType(page, selectors.employerDetailsPage.phoneNumberInput, details.phoneNumber);
  await safeType(page, selectors.employerDetailsPage.startDateMonthInput, details.startDate.month);
  await safeType(page, selectors.employerDetailsPage.startDateYearInput, details.startDate.year);
  await safeClick(page, selectors.employerDetailsPage.saveButton, { waitForNavigation: true });
  
  // Следующая страница с деталями работы
  await safeType(page, selectors.jobDetailsPage.jobTitleInput, details.jobTitle);
  await safeType(page, selectors.jobDetailsPage.salaryAmountInput, details.annualSalary);
  await safeSelect(page, selectors.jobDetailsPage.currencySelect, details.currency);
  await safeType(page, selectors.jobDetailsPage.jobDescriptionTextarea, details.jobDescription);
  await safeClick(page, selectors.jobDetailsPage.saveButton, { waitForNavigation: true });
}

// ==========================================================
// ШАГ 23: ДЕТАЛИ ИП (ЕСЛИ НУЖНО)
// ==========================================================
if (empType === 'SELF_EMPLOYED' && data.selfEmployedDetails) {
  const details = data.selfEmployedDetails;
  await safeType(page, selectors.selfEmployedDetailsPage.jobTitleInput, details.jobTitle);
  await safeType(page, selectors.selfEmployedDetailsPage.incomeAmountInput, details.annualIncome);
  await safeSelect(page, selectors.selfEmployedDetailsPage.currencySelect, details.currency);
  await safeClick(page, selectors.selfEmployedDetailsPage.saveButton, { waitForNavigation: true });
}

// ШАГ 24: ИСТОЧНИКИ ДОХОДА И СБЕРЕЖЕНИЯ
await safeClick(page, selectors.incomeAndSavingsPage.moneyInBankCheckbox);
const usdAmount = parseFloat(data.moneyInBankAmountUSD.replace(/,/g, ''));
const exchangeRate = 1.35; // Примерный курс USD к GBP. Можно вынести в конфиг.
const gbpAmount = Math.round(usdAmount / exchangeRate);
await safeSelect(page, selectors.incomeAndSavingsPage.currencySelect, 'GBP');
await safeType(page, selectors.incomeAndSavingsPage.amountInput, gbpAmount.toString());
await safeClick(page, selectors.incomeAndSavingsPage.saveButton, { waitForNavigation: true });

// ШАГ 25: СТОИМОСТЬ ПОЕЗДКИ (Авто-расчет)
const totalSavingsUSD = parseFloat(data.moneyInBankAmountUSD.replace(/,/g, ''));
const visitCostUSD = totalSavingsUSD * 0.85;
const visitCostGBP = Math.round(visitCostUSD / exchangeRate);
await safeSelect(page, selectors.visitCostPage.currencySelect, 'GBP');
await safeType(page, selectors.visitCostPage.amountInput, visitCostGBP.toString());
await safeClick(page, selectors.visitCostPage.saveButton, { waitForNavigation: true });

// ШАГ 26: ЕЖЕМЕСЯЧНЫЕ ТРАТЫ (Данные из формы)
const monthlySpendingUZS = data.moneySpendMonth;
await safeSelect(page, selectors.monthlySpendingPage.currencySelect, 'UZS');
await safeType(page, selectors.monthlySpendingPage.amountInput, monthlySpendingUZS);
await safeClick(page, selectors.monthlySpendingPage.saveButton, { waitForNavigation: true });

// ШАГ 27: КТО ПЛАТИТ ЗА ПОЕЗДКУ?
// ==========================================================
if (data.isSomeoneElsePaying && data.sponsorDetails) {
  // --- Ветка "ДА, кто-то платит" ---
  await safeClick(page, selectors.payingForVisitPage.yesRadioButton);
  await safeClick(page, selectors.payingForVisitPage.saveButton, { waitForNavigation: true });

  // -- Следующая страница: Кто именно платит? --
  const sponsor = data.sponsorDetails;
  const who = sponsor.whoIsPaying;

  if (who === 'SOMEONE_I_KNOW') {
    await safeClick(page, selectors.whoIsPayingPage.someoneIKnowRadio);
    await safeType(page, selectors.whoIsPayingPage.sponsorNameInput, sponsor.sponsorName);
    await safeType(page, selectors.whoIsPayingPage.addressLine1Input, sponsor.addressLine1);
    await safeType(page, selectors.whoIsPayingPage.townCityInput, sponsor.townCity);
    await safeType(page, selectors.whoIsPayingPage.provinceInput, sponsor.townCity); // Дублируем
    await safeType(page, selectors.whoIsPayingPage.countryInput, sponsor.country);
  } else if (who === 'MY_EMPLOYER') {
    await safeClick(page, selectors.whoIsPayingPage.myEmployerRadio);
  } else if (who === 'OTHER_ORGANISATION') {
    await safeClick(page, selectors.whoIsPayingPage.otherOrganisationRadio);
    await safeType(page, selectors.whoIsPayingPage.sponsorNameInput, sponsor.sponsorName);
    await safeType(page, selectors.whoIsPayingPage.addressLine1Input, sponsor.addressLine1);
    await safeType(page, selectors.whoIsPayingPage.townCityInput, sponsor.townCity);
    await safeType(page, selectors.whoIsPayingPage.provinceInput, sponsor.townCity); // Дублируем
    await safeType(page, selectors.whoIsPayingPage.countryInput, sponsor.country);
  }
  await safeSelect(page, selectors.whoIsPayingPage.currencySelect, 'UZS'); // Всегда сумы
  await safeType(page, selectors.whoIsPayingPage.amountInput, sponsor.amountInUZS);
  await safeType(page, selectors.whoIsPayingPage.reasonTextarea, sponsor.reason);
  await safeClick(page, selectors.whoIsPayingPage.saveButton, { waitForNavigation: true });

  // ШАГ 27.5: ДОБАВИТЬ ЕЩЕ СПОНСОРА? (Выбираем "Нет")
  await safeClick(page, selectors.addAnotherSponsorPage.noRadioButton);
  await safeClick(page, selectors.addAnotherSponsorPage.saveButton, { waitForNavigation: true });

} else {
  await safeClick(page, selectors.payingForVisitPage.noRadioButton);
  await safeClick(page, selectors.payingForVisitPage.saveButton, { waitForNavigation: true });
}


// ШАГ 28: ДАТЫ ПОЕЗДКИ (Умная генерация)
// await safeType(page, selectors.travelDatesPage.arrivalDayInput, String(arrivalDate.getDate()));
// await safeType(page, selectors.travelDatesPage.arrivalMonthInput, String(arrivalDate.getMonth() + 1)); // getMonth() возвращает 0-11
// await safeType(page, selectors.travelDatesPage.arrivalYearInput, String(arrivalDate.getFullYear()));
// await safeType(page, selectors.travelDatesPage.leaveDayInput, String(leaveDate.getDate()));
// await safeType(page, selectors.travelDatesPage.leaveMonthInput, String(leaveDate.getMonth() + 1));
// await safeType(page, selectors.travelDatesPage.leaveYearInput, String(leaveDate.getFullYear()));
// await safeClick(page, selectors.travelDatesPage.saveButton, { waitForNavigation: true });

// ШАГ 28: ДАТЫ ПОЕЗДКИ (Умная генерация)
await safeType(page, selectors.travelDatesPage.arrivalDayInput, String(arrivalDate.getDate()));
await safeType(page, selectors.travelDatesPage.arrivalMonthInput, String(arrivalDate.getMonth() + 1));
await safeType(page, selectors.travelDatesPage.arrivalYearInput, String(arrivalDate.getFullYear()));
await safeType(page, selectors.travelDatesPage.leaveDayInput, String(leaveDate.getDate()));
await safeType(page, selectors.travelDatesPage.leaveMonthInput, String(leaveDate.getMonth() + 1));
await safeType(page, selectors.travelDatesPage.leaveYearInput, String(leaveDate.getFullYear()));
await safeClick(page, selectors.travelDatesPage.saveButton, { waitForNavigation: true });


// ШАГ 29: ВЫБОР ЯЗЫКА ДЛЯ ИНТЕРВЬЮ (Выбираем "English")
await safeClick(page, selectors.languagePreferencePage.englishRadioButton);
await safeClick(page, selectors.languagePreferencePage.saveButton, { waitForNavigation: true });

// ШАГ 30: ОСНОВНАЯ ЦЕЛЬ ПОЕЗДКИ (Выбираем "Tourism")
await safeClick(page, selectors.mainPurposePage.tourismRadioButton);
await safeClick(page, selectors.mainPurposePage.saveButton, { waitForNavigation: true });

// ШАГ 31: УТОЧНЕНИЕ ЦЕЛИ (Выбираем "Tourist")
await safeClick(page, selectors.tourismSubtypePage.touristRadioButton);
await safeClick(page, selectors.tourismSubtypePage.saveButton, { waitForNavigation: true });

  // ШАГ 32: ГЕНЕРАЦИЯ УНИКАЛЬНОГО ПЛАНА ПОЕЗДКИ (AI-POWERED)
    // ==========================================================
    console.log("Step 32: Generating unique travel plan with AI...");
    const formattedArrival = arrivalDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const formattedLeave = leaveDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Рассчитываем бюджет поездки
    const budget = Math.round(parseFloat(data.moneyInBankAmountUSD) * 0.35);

    // 2. Создаем "умный" промпт для GPT
    const prompt = `
        Write a short, convincing travel plan for a UK tourist visa application, in the first person ("I plan to...").
        The text must be under 490 characters.
        The applicant is a citizen of Uzbekistan.
        
        Travel Dates: from ${formattedArrival} to ${formattedLeave}.
        Trip Duration: ${tripDurationDays} days.
        Budget for the trip: approximately ${budget} USD.

        Mention 2-3 standard tourist activities in London. For example: visiting the British Museum, Buckingham Palace, Tower of London, exploring Covent Garden, or seeing a West End show.
        Keep the language simple and clear. The goal is to show a genuine tourist interest.
        Do not write any greetings or closings. Just the plan itself.
    `;
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Быстрая и дешевая модель, идеальна для этого
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100, // Примерно 500 символов
        temperature: 0.7, // Добавляет немного креативности
    });
    const travelPlan = completion.choices[0].message.content?.trim();
    if (!travelPlan) {
        throw new Error("AI failed to generate a travel plan.");
    }
    await safeType(page, selectors.activitiesPage.detailsTextarea, travelPlan);
    await safeClick(page, selectors.activitiesPage.saveButton, { waitForNavigation: true });
    
// // ШАГ 33: ДАННЫЕ ПАРТНЕРА (ЕСЛИ ЖЕНАТ/ЗАМУЖЕМ)
if (data.relationshipStatus === 'M' && data.partnerDetails) {
  const partner = data.partnerDetails;
  await safeType(page, selectors.partnerPage.givenNameInput, partner.givenName);
  await safeType(page, selectors.partnerPage.familyNameInput, partner.familyName);
  
  await safeType(page, selectors.partnerPage.dobDayInput, partner.dateOfBirth.day);
  await safeType(page, selectors.partnerPage.dobMonthInput, partner.dateOfBirth.month);
  await safeType(page, selectors.partnerPage.dobYearInput, partner.dateOfBirth.year);
  
  // 1. Вводим гражданство и выбираем из подсказки
  await safeType(page, selectors.partnerPage.nationalityInput, partner.nationality);
  await page.waitForSelector(selectors.countrySelectPage.countrySuggestion, { visible: true });
  await page.keyboard.press('Enter');
  
  // ==========================================================
  // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: СТАБИЛИЗИРУЕМ СТРАНИЦУ
  // ==========================================================
  // После нажатия Enter, ждем, пока само поле ввода гражданства снова станет
  // стабильным. Это гарантирует, что все JS-перерисовки завершились.
  await page.waitForSelector(selectors.partnerPage.nationalityInput, { visible: true });
  // Можно добавить небольшую дополнительную паузу для надежности
  await new Promise(resolve => setTimeout(resolve, 300));
  // ==========================================================
  
  // 2. Теперь безопасно кликаем на радиокнопку
  await page.waitForSelector(selectors.partnerPage.liveWithYouYesRadio, { visible: true });
  await page.evaluate((selector) => {
      (document.querySelector(selector) as HTMLElement)?.click();
  }, selectors.partnerPage.liveWithYouYesRadio);
  await page.waitForFunction(
      (selector) => (document.querySelector(selector) as HTMLInputElement)?.checked,
      {},
      selectors.partnerPage.liveWithYouYesRadio
  );
  
  // 3. Условно выбираем "едет с вами" и вводим паспорт
  if (partner.isTravellingWithYou) {
    await safeClick(page, selectors.partnerPage.travellingWithYouYesRadio);
    await page.waitForSelector(selectors.partnerPage.passportNumberInput, { visible: true });
    await safeType(page, selectors.partnerPage.passportNumberInput, partner.passportNumber || '');
  }
  
  // 4. Сохраняем и продолжаем
  await safeClick(page, selectors.partnerPage.saveButton, { waitForNavigation: true });
}

// ШАГ 34: ДЕТИ (Dependants) - с циклом
// ==========================================================
if (data.dependants && data.dependants.length > 0) {
  await safeClick(page, selectors.hasDependantsPage.yesRadioButton);
  await safeClick(page, selectors.hasDependantsPage.saveButton, { waitForNavigation: true });

  for (let i = 0; i < data.dependants.length; i++) {
    const dependant = data.dependants[i];
    if (i > 0) {
        console.log(`-- On the form for dependant #${i + 1}.`);
    }
    await safeType(page, selectors.dependantDetailsPage.relationshipInput, 'Child');
    await safeType(page, selectors.dependantDetailsPage.givenNameInput, dependant.givenName);
    await safeType(page, selectors.dependantDetailsPage.familyNameInput, dependant.familyName);
    await safeType(page, selectors.dependantDetailsPage.dobDayInput, dependant.dateOfBirth.day);
    await safeType(page, selectors.dependantDetailsPage.dobMonthInput, dependant.dateOfBirth.month);
    await safeType(page, selectors.dependantDetailsPage.dobYearInput, dependant.dateOfBirth.year);
    await safeClick(page, selectors.dependantDetailsPage.livingWithYouYesRadio);


    if (dependant.isTravellingWithYou) {
      await safeClick(page, selectors.dependantDetailsPage.travellingYesRadio);
      
      // 1. Вводим гражданство и выбираем из подсказки
      await safeType(page, selectors.dependantDetailsPage.nationalityInput, 'Uzbekistan');
      await page.waitForSelector(selectors.countrySelectPage.countrySuggestion, { visible: true });
      await page.keyboard.press('Enter');
      
      // ==========================================================
      // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: СТАБИЛИЗИРУЕМ СТРАНИЦУ
      // ==========================================================
      // Ждем, пока поле ввода гражданства снова станет стабильным
      await page.waitForSelector(selectors.dependantDetailsPage.nationalityInput, { visible: true });
      await new Promise(resolve => setTimeout(resolve, 300));
      // ==========================================================
    
      // 2. Теперь безопасно вводим номер паспорта
      await safeType(page, selectors.dependantDetailsPage.passportNumberInput, dependant.passportNumber || '');
      // await safeClick(page, selectors.dependantDetailsPage.travellingYesRadio);
      // const countryCode = 'UZB'; // TODO: Сделать конвертер Uzbekistan -> UZB
      // await safeSelect(page, selectors.dependantDetailsPage.nationalitySelect, countryCode);
      // await safeType(page, selectors.dependantDetailsPage.passportNumberInput, dependant.passportNumber || '');
    } else {
      await safeClick(page, selectors.dependantDetailsPage.travellingNoRadio);
    }
    await safeClick(page, selectors.dependantDetailsPage.saveButton, { waitForNavigation: true });
    if (i < data.dependants.length - 1) {
      await safeClick(page, selectors.dependantDetailsPage.addAnotherYesRadio);
      await safeClick(page, selectors.dependantDetailsPage.saveButton, { waitForNavigation: true });
    }
  }
  await safeClick(page, selectors.dependantDetailsPage.addAnotherNoRadio);
  await safeClick(page, selectors.dependantDetailsPage.saveButton, { waitForNavigation: true });

} else {
  await safeClick(page, selectors.hasDependantsPage.noRadioButton);
  await safeClick(page, selectors.hasDependantsPage.saveButton, { waitForNavigation: true });
}

// ШАГ 35: ДАННЫЕ РОДИТЕЛЕЙ (Сложная условная логика)
// ==========================================================
const consent = data.parentalConsent;

// --- ФУНКЦИЯ-ПОМОЩНИК для заполнения данных одного родителя ---
// const fillParentDetails = async (parentType: 'mother' | 'father', details: any) => {
//     await safeClick(page, parentType === 'mother' ? selectors.parentsPage.motherRadioButton : selectors.parentsPage.fatherRadioButton);
//     await safeType(page, selectors.parentsPage.givenNameInput, details.givenName);
//     await safeType(page, selectors.parentsPage.familyNameInput, details.familyName);
//     await safeType(page, selectors.parentsPage.dobDayInput, details.dateOfBirth.day);
//     await safeType(page, selectors.parentsPage.dobMonthInput, details.dateOfBirth.month);
//     await safeType(page, selectors.parentsPage.dobYearInput, details.dateOfBirth.year);
//     await safeType(page, selectors.parentsPage.nationalityInput, details.nationality);
//     await page.waitForSelector(selectors.countrySelectPage.countrySuggestion, { visible: true });
//     await page.keyboard.press('Enter');
//     await safeClick(page, selectors.parentsPage.sameNationalityYesRadio);
//     await safeClick(page, selectors.parentsPage.saveButton, { waitForNavigation: true });
// };
const fillParentDetails = async (parentType: 'mother' | 'father', details: any) => {
  await safeClick(page, parentType === 'mother' ? selectors.parentsPage.motherRadioButton : selectors.parentsPage.fatherRadioButton);
  await safeType(page, selectors.parentsPage.givenNameInput, details.givenName);
  await safeType(page, selectors.parentsPage.familyNameInput, details.familyName);
  await safeType(page, selectors.parentsPage.dobDayInput, details.dateOfBirth.day);
  await safeType(page, selectors.parentsPage.dobMonthInput, details.dateOfBirth.month);
  await safeType(page, selectors.parentsPage.dobYearInput, details.dateOfBirth.year);
  
  // 1. Вводим гражданство и выбираем
  await safeType(page, selectors.parentsPage.nationalityInput, details.nationality);
  await page.waitForSelector(selectors.countrySelectPage.countrySuggestion, { visible: true });
  await page.keyboard.press('Enter');
  
  // ==========================================================
  // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: СТАБИЛИЗИРУЕМ СТРАНИЦУ
  // ==========================================================
  await page.waitForSelector(selectors.parentsPage.nationalityInput, { visible: true });
  await new Promise(resolve => setTimeout(resolve, 300));
  // ==========================================================

  // 2. Теперь безопасно кликаем на остальные элементы
  await safeClick(page, selectors.parentsPage.sameNationalityYesRadio);
  await safeClick(page, selectors.parentsPage.saveButton, { waitForNavigation: true });
};

// --- ФУНКЦИЯ-ПОМОЩНИК для выбора "Не знаю" ---
const selectParentIsUnknown = async () => {
    await safeClick(page, selectors.parentsPage.dontKnowDetailsToggle);
    await safeClick(page, selectors.parentsPage.isUnknownCheckbox);
    await safeClick(page, selectors.parentsPage.saveButton, { waitForNavigation: true });
};

// --- Основная логика ---
if (consent === 'BOTH' && data.motherDetails && data.fatherDetails) {
    // Заполняем сначала Мать, потом Отца
    await fillParentDetails('mother', data.motherDetails);
    await fillParentDetails('father', data.fatherDetails);
} else if (consent === 'MOTHER_ONLY' && data.motherDetails) {
    // Заполняем Мать, потом для Отца выбираем "Не знаю"
    await fillParentDetails('mother', data.motherDetails);
    await selectParentIsUnknown();
} else if (consent === 'FATHER_ONLY' && data.fatherDetails) {
    // Заполняем Отца, потом для Матери выбираем "Не знаю"
    // Важно: сайт всегда сначала спрашивает про Мать
    await selectParentIsUnknown(); // "Пропускаем" Мать
    await fillParentDetails('father', data.fatherDetails);
} else { // consent === 'NONE'
    // Для обоих выбираем "Не знаю"
    await selectParentIsUnknown(); // "Пропускаем" Мать
    await selectParentIsUnknown(); // "Пропускаем" Отца
}

// ШАГ 36: ЕСТЬ ЛИ СЕМЬЯ В UK? (Выбираем "Нет")
await safeClick(page, selectors.familyInUkPage.noRadioButton);
await safeClick(page, selectors.familyInUkPage.saveButton, { waitForNavigation: true });

// ШАГ 37: ПУТЕШЕСТВУЕТЕ В ОРГАНИЗОВАННОЙ ГРУППЕ? (Выбираем "Нет")
await safeClick(page, selectors.travellingWithOrganisedGroupPage.noRadioButton);
await safeClick(page, selectors.travellingWithOrganisedGroupPage.saveButton, { waitForNavigation: true });

// ШАГ 38: ЕЩЕ КТО-ТО ЕДЕТ С ВАМИ? (Выбираем "Нет")
await safeClick(page, selectors.travellingWithAnyoneElsePage.noRadioButton);
await safeClick(page, selectors.travellingWithAnyoneElsePage.saveButton, { waitForNavigation: true });

// ШАГ 39: ИНФОРМАЦИЯ О ПРОЖИВАНИИ
await safeClick(page, selectors.accommodationPage.hasAccommodationYesRadio);
await safeClick(page, selectors.accommodationPage.saveButton, { waitForNavigation: true });
if (!data.hotelBookingDetails) {
    throw new Error("Hotel details (from the static placeholder) are missing!");
}
await safeType(page, selectors.hotelDetailsPage.nameInput, data.hotelBookingDetails.name);
await safeType(page, selectors.hotelDetailsPage.addressLine1Input, data.hotelBookingDetails.addressLine1);
await safeType(page, selectors.hotelDetailsPage.townCityInput, data.hotelBookingDetails.townCity);
await safeType(page, selectors.hotelDetailsPage.postCodeInput, data.hotelBookingDetails.postCode);
await safeType(page, selectors.hotelDetailsPage.checkinDayInput, String(arrivalDate.getDate()));
await safeType(page, selectors.hotelDetailsPage.checkinMonthInput, String(arrivalDate.getMonth() + 1));
await safeType(page, selectors.hotelDetailsPage.checkinYearInput, String(arrivalDate.getFullYear()));    
await safeType(page, selectors.hotelDetailsPage.checkoutDayInput, String(leaveDate.getDate()));
await safeType(page, selectors.hotelDetailsPage.checkoutMonthInput, String(leaveDate.getMonth() + 1));
await safeType(page, selectors.hotelDetailsPage.checkoutYearInput, String(leaveDate.getFullYear()));
await safeClick(page, selectors.hotelDetailsPage.saveButton, { waitForNavigation: true });

// ШАГ 40: ДОБАВИТЬ ЕЩЕ МЕСТО ПРОЖИВАНИЯ? (Выбираем "Нет") то е
await safeClick(page, selectors.addAnotherAccommodationPage.noRadioButton);
await safeClick(page, selectors.addAnotherAccommodationPage.saveButton, { waitForNavigation: true });

// ШАГ 41: ИСТОРИЯ ПОЕЗДОК В UK
const history = data.ukTravelHistory;
if (history && history.hasVisited && history.previousVisits && history.previousVisits.length > 0) {
  await safeClick(page, selectors.ukTravelHistoryPage.yesRadioButton);
  await safeClick(page, selectors.ukTravelHistoryPage.saveButton, { waitForNavigation: true });
  const numberOfVisits = history.previousVisits.length;
  await safeType(page, selectors.ukTravelHistoryPage.numberOfTimesInput, String(numberOfVisits));
  await safeClick(page, selectors.ukTravelHistoryPage.saveButton, { waitForNavigation: true });
  for (const visit of history.previousVisits) {
    switch (visit.reason) {
      case 'TOURISM':
        await safeClick(page, selectors.previousVisitDetailsPage.reasonTouristRadio);
        break;
      case 'WORK':
        await safeClick(page, selectors.previousVisitDetailsPage.reasonWorkRadio);
        break;
      case 'STUDY':
        await safeClick(page, selectors.previousVisitDetailsPage.reasonStudyRadio);
        break;
      case 'TRANSIT':
        await safeClick(page, selectors.previousVisitDetailsPage.reasonTransitRadio);
        break;
      case 'OTHER':
        await safeClick(page, selectors.previousVisitDetailsPage.reasonOtherRadio);
        break;
    }

    await safeType(page, selectors.previousVisitDetailsPage.arrivalMonthInput, visit.arrivalMonth);
    await safeType(page, selectors.previousVisitDetailsPage.arrivalYearInput, visit.arrivalYear);
    await safeSelect(page, selectors.previousVisitDetailsPage.durationUnitSelect, 'days');
    await safeType(page, selectors.previousVisitDetailsPage.durationValueInput, visit.durationInDays);
    await safeClick(page, selectors.previousVisitDetailsPage.saveButton, { waitForNavigation: true });
  }
    
  // -- Страница "Мед. лечение?" -> Нет --
  await safeClick(page, selectors.medicalTreatmentPage.noRadioButton);
  await safeClick(page, selectors.medicalTreatmentPage.saveButton, { waitForNavigation: true });

  // -- Страница "Въезжали как гражданин EEA?" -> Нет --
  await safeClick(page, selectors.enterAsNationalPage.noRadioButton);
  await safeClick(page, selectors.enterAsNationalPage.saveButton, { waitForNavigation: true });

  // -- Страница "Водительские права?" -> Нет --
  await safeClick(page, selectors.drivingLicencePage.noRadioButton);
  await safeClick(page, selectors.drivingLicencePage.saveButton, { waitForNavigation: true });

  // -- Страница "Гос. пособия?" -> Нет --
  await safeClick(page, selectors.publicFundsPage.noRadioButton);
  await safeClick(page, selectors.publicFundsPage.saveButton, { waitForNavigation: true });
  
  // -- Страница "Была ли виза?" (Условный) --
  if (history.hadPreviousVisa && history.previousVisaIssueDate) {
    await safeClick(page, selectors.previousVisaPage.yesRadioButton);
    await safeType(page, selectors.previousVisaPage.issueMonthInput, history.previousVisaIssueDate.month);
    await safeType(page, selectors.previousVisaPage.issueYearInput, history.previousVisaIssueDate.year);
  } else {
    await safeClick(page, selectors.previousVisaPage.noRadioButton);
  }
  await safeClick(page, selectors.previousVisaPage.saveButton, { waitForNavigation: true });

  await safeClick(page, selectors.previousApplicationsPage.noRadioButton);
  await safeClick(page, selectors.previousApplicationsPage.saveButton, { waitForNavigation: true });


} else {
  await safeClick(page, selectors.ukTravelHistoryPage.noRadioButton);
  await safeClick(page, selectors.ukTravelHistoryPage.saveButton, { waitForNavigation: true });
}

// ШАГ 42: ИСТОРИЯ ПОЕЗДОК В ДРУГИЕ СТРАНЫ
// ==========================================================
const cwHistory = data.commonwealthTravelHistory || [];
const visitCount = cwHistory.length;

if (visitCount === 0) {
  await safeClick(page, selectors.commonwealthTravelIntroPage.zeroVisitsRadio);
  // Нажимаем "Save" и эта секция на этом ЗАВЕРШАЕТСЯ
  await safeClick(page, selectors.commonwealthTravelIntroPage.saveButton, { waitForNavigation: true });

} else {
  // Если была хотя бы одна поездка
  if (visitCount === 1) {
    await safeClick(page, selectors.commonwealthTravelIntroPage.oneVisitRadio);
  } else if (visitCount >= 2 && visitCount <= 5) {
    await safeClick(page, selectors.commonwealthTravelIntroPage.twoToFiveVisitsRadio);
  } else { // 6+
    await safeClick(page, selectors.commonwealthTravelIntroPage.sixPlusVisitsRadio);
  }
  await safeClick(page, selectors.commonwealthTravelIntroPage.saveButton, { waitForNavigation: true });

  const sortedVisits = [...cwHistory].sort((a, b) => 
    new Date(`${a.arrivalYear}-${a.arrivalMonth}-01`).getTime() > new Date(`${b.arrivalYear}-${b.arrivalMonth}-01`).getTime() ? -1 : 1
  );
  // Берем не более 2-х последних поездок
  const visitsToFill = sortedVisits.slice(0, 2);

  for (const visit of visitsToFill) {
    // --- Следующая страница: "Детали поездки" ---
    
    // 1. Выбираем страну
    switch (visit.country) {
      case 'USA': await safeClick(page, selectors.commonwealthVisitDetailsPage.usaRadio); break;
      case 'CANADA': await safeClick(page, selectors.commonwealthVisitDetailsPage.canadaRadio); break;
      case 'AUSTRALIA': await safeClick(page, selectors.commonwealthVisitDetailsPage.australiaRadio); break;
      case 'NEW_ZEALAND': await safeClick(page, selectors.commonwealthVisitDetailsPage.newZealandRadio); break;
      case 'EU_SWISS':
        await safeClick(page, selectors.commonwealthVisitDetailsPage.euSwissRadio);
        await page.waitForSelector(selectors.commonwealthVisitDetailsPage.euCountryInput, { visible: true });
        
        await safeType(page, selectors.commonwealthVisitDetailsPage.euCountryInput, visit.euCountryName || '');
        await page.waitForSelector(selectors.countrySelectPage.countrySuggestion, { visible: true });
        await page.keyboard.press('Enter');
        
        // --- СТАБИЛИЗИРУЮЩАЯ ПАУЗА ---
        await page.waitForSelector(selectors.commonwealthVisitDetailsPage.euCountryInput, { visible: true });
        await new Promise(resolve => setTimeout(resolve, 300));

        break
    }

    // 2. Выбираем причину визита
    switch (visit.reason) {
      case 'TOURISM': await safeClick(page, selectors.commonwealthVisitDetailsPage.reasonTouristRadio); break;
      case 'WORK': await safeClick(page, selectors.commonwealthVisitDetailsPage.reasonWorkRadio); break;
      case 'STUDY': await safeClick(page, selectors.commonwealthVisitDetailsPage.reasonStudyRadio); break;
      case 'TRANSIT': await safeClick(page, selectors.commonwealthVisitDetailsPage.reasonTransitRadio); break;
      case 'OTHER': await safeClick(page, selectors.commonwealthVisitDetailsPage.reasonOtherRadio); break;
    }
    
    // 3. Вводим дату прибытия
    await safeType(page, selectors.commonwealthVisitDetailsPage.arrivalMonthInput, visit.arrivalMonth);
    await safeType(page, selectors.commonwealthVisitDetailsPage.arrivalYearInput, visit.arrivalYear);
    
    // 4. Вводим длительность пребывания (всегда в днях)
    await safeSelect(page, selectors.commonwealthVisitDetailsPage.durationUnitSelect, 'days');
    await safeType(page, selectors.commonwealthVisitDetailsPage.durationValueInput, visit.durationInDays);
    
    // 5. Сохраняем и переходим к следующей итерации (или выходим из цикла)
    await safeClick(page, selectors.commonwealthVisitDetailsPage.saveButton, { waitForNavigation: true });
  }
}

// ШАГ 43: ИСТОРИЯ ПОЕЗДОК В ОСТАЛЬНЫЕ СТРАНЫ
// ==========================================================
const worldHistory = data.worldTravelHistory || [];

if (worldHistory.length > 0) {
  // --- Страница "Были ли в других странах?" -> Да ---
  await safeClick(page, selectors.worldTravelIntroPage.yesRadioButton);
  await safeClick(page, selectors.worldTravelIntroPage.saveButton, { waitForNavigation: true });
  
  // --- Запускаем цикл по всем поездкам (максимум 2, как в форме) ---
  for (let i = 0; i < worldHistory.length; i++) {
    const visit = worldHistory[i];

    // --- Следующая страница: "Детали поездки" ---
    
    // 1. Вводим страну с автодополнением
    await safeType(page, selectors.worldVisitDetailsPage.countryInput, visit.country);
    await page.waitForSelector(selectors.countrySelectPage.countrySuggestion, { visible: true });
    await page.keyboard.press('Enter');

    // --- СТАБИЛИЗИРУЮЩАЯ ПАУЗА ---
    await page.waitForSelector(selectors.worldVisitDetailsPage.countryInput, { visible: true });
    await new Promise(resolve => setTimeout(resolve, 300));

    // 2. Выбираем причину
    switch (visit.reason) {
      case 'TOURISM': await safeClick(page, selectors.worldVisitDetailsPage.reasonTourismRadio); break;
      case 'BUSINESS': await safeClick(page, selectors.worldVisitDetailsPage.reasonBusinessRadio); break;
      case 'STUDY': await safeClick(page, selectors.worldVisitDetailsPage.reasonStudyRadio); break;
      case 'TRANSIT': await safeClick(page, selectors.worldVisitDetailsPage.reasonTransitRadio); break;
      case 'OTHER': await safeClick(page, selectors.worldVisitDetailsPage.reasonOtherRadio); break;
    }

    // 3. Вводим дату начала поездки
    await safeType(page, selectors.worldVisitDetailsPage.startDateDayInput, visit.visitStartDate.day);
    await safeType(page, selectors.worldVisitDetailsPage.startDateMonthInput, visit.visitStartDate.month);
    await safeType(page, selectors.worldVisitDetailsPage.startDateYearInput, visit.visitStartDate.year);
    
    // 4. Вводим дату окончания поездки
    await safeType(page, selectors.worldVisitDetailsPage.endDateDayInput, visit.visitEndDate.day);
    await safeType(page, selectors.worldVisitDetailsPage.endDateMonthInput, visit.visitEndDate.month);
    await safeType(page, selectors.worldVisitDetailsPage.endDateYearInput, visit.visitEndDate.year);
    
    // 5. Сохраняем данные этой поездки
    await safeClick(page, selectors.worldVisitDetailsPage.saveButton, { waitForNavigation: true });

    // --- Следующая страница: "Добавить еще одну?" ---
    // 6. Решаем, добавлять ли еще
    if (i < worldHistory.length - 1) {
      // Если это НЕ последняя поездка в нашем списке, нажимаем "Да"
      await safeClick(page, selectors.addAnotherWorldVisitPage.yesRadioButton);
      await safeClick(page, selectors.addAnotherWorldVisitPage.saveButton, { waitForNavigation: true });
    } else {
      // Если это последняя поездка, нажимаем "Нет"
      await safeClick(page, selectors.addAnotherWorldVisitPage.noRadioButton);
      await safeClick(page, selectors.addAnotherWorldVisitPage.saveButton, { waitForNavigation: true });
    }
  }
} else {
  // --- Ветка "В других странах не был" ---
  await safeClick(page, selectors.worldTravelIntroPage.noRadioButton);
  await safeClick(page, selectors.worldTravelIntroPage.saveButton, { waitForNavigation: true });
}
// --- ШАГ 44: Иммиграционная история (проблемы) -> Нет ---
await safeClick(page, selectors.immigrationHistoryPage.noRadioButton);
await safeClick(page, selectors.immigrationHistoryPage.saveButton, { waitForNavigation: true });

// --- ШАГ 45: Нарушения иммиграционного законодательства -> Нет ---
await safeClick(page, selectors.immigrationBreachPage.noRadioButton);
await safeClick(page, selectors.immigrationBreachPage.saveButton, { waitForNavigation: true });

// --- ШАГ 46: Судимости -> Нет ---
await safeClick(page, selectors.convictionsPage.noneRadioButton);
await safeClick(page, selectors.convictionsPage.saveButton, { waitForNavigation: true });

// --- ШАГ 47: Военные преступления -> Нет + Подтвердить ---
await safeClick(page, selectors.warCrimesPage.noRadioButton);
await safeClick(page, selectors.warCrimesPage.confirmCheckbox);
await safeClick(page, selectors.warCrimesPage.saveButton, { waitForNavigation: true });

// --- ШАГ 48: Терроризм -> Нет, Нет, Нет + Подтвердить ---
await safeClick(page, selectors.terrorismPage.activitiesNoRadio);
await safeClick(page, selectors.terrorismPage.organisationsNoRadio);
await safeClick(page, selectors.terrorismPage.viewsNoRadio);
await safeClick(page, selectors.terrorismPage.confirmCheckbox);
await safeClick(page, selectors.terrorismPage.saveButton, { waitForNavigation: true });

// --- ШАГ 49: Экстремизм -> Нет, Нет + Подтвердить ---
await safeClick(page, selectors.extremismPage.organisationsNoRadio);
await safeClick(page, selectors.extremismPage.viewsNoRadio);
await safeClick(page, selectors.extremismPage.confirmCheckbox);
await safeClick(page, selectors.extremismPage.saveButton, { waitForNavigation: true });

// --- ШАГ 50: Репутация -> Нет, Нет, Нет ---
await safeClick(page, selectors.goodCharacterPage.goodCharacterNoRadio);
await safeClick(page, selectors.goodCharacterPage.otherActivitiesNoRadio);
await safeClick(page, selectors.goodCharacterPage.anyOtherInfoNoRadio);
await safeClick(page, selectors.goodCharacterPage.saveButton, { waitForNavigation: true });

// --- ШАГ 51: История работы в спецслужбах -> Ничего из перечисленного ---
await safeClick(page, selectors.employmentHistoryPage.noneCheckbox);
await safeClick(page, selectors.employmentHistoryPage.saveButton, { waitForNavigation: true });

// --- ШАГ 52: Дополнительная информация -> (здесь мы уже вставляли AI-текст, этот шаг, скорее всего, будет пропущен или это другая страница)
// На всякий случай добавим клик, если это просто страница-саммари
try {
  await safeClick(page, selectors.finalSubmitPage.saveButton, { waitForNavigation: true });
} catch(e) { /* Игнорируем, если кнопки нет */ }
//


    // ... ЗДЕСЬ БУДЕТ ЛОГИКА ДЛЯ СЛЕДУЮЩИХ СТРАНИЦ ...
    
    console.log('✅ Initial steps completed successfully. Ready for the main form.');

    // Временно завершаем успешно для теста
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'COMPLETED', resumeLink: 'initial-steps-ok' },
    });

  } catch (error: any) {
    console.error(`🔥 An error occurred during automation for ${applicationId}:`, error);
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'FAILED', errorMessage: error.message },
    });
    throw error;
  } finally {
    if (browser) {
      // await browser.close();
    }
    console.log(`✅ Finished processing application ${applicationId}`);
  }
}
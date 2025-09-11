"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UkVisaSchema = void 0;
// src/lib/visa-schema.ts
const zod_1 = require("zod");
// Регулярное выражение для имен (латиница, кириллица, пробелы, дефисы)
const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s-]*$/;
const numberRegex = /^\d+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const moneyRegex = /^[\d.,]*$/;
exports.UkVisaSchema = zod_1.z.object({
    // === STEP 1: Personal Information ===
    givenNameFirst: zod_1.z.string().min(1, "First name is required.").regex(nameRegex, "Only letters, spaces, and hyphens are allowed."),
    familyNameFirst: zod_1.z.string().min(1, "Last name is required.").regex(nameRegex, "Only letters, spaces, and hyphens are allowed."),
    sex: zod_1.z.enum(['M', 'F', 'OTHER'], { required_error: "Gender is required." }),
    dateOfBirth: zod_1.z.object({
        day: zod_1.z.string().min(1, "Day is required.").max(2).regex(numberRegex, "Invalid day."),
        month: zod_1.z.string().min(1, "Month is required.").max(2).regex(numberRegex, "Invalid month."),
        year: zod_1.z.string().min(4, "Year must be 4 digits.").max(4).regex(numberRegex, "Invalid year."),
    }),
    email: zod_1.z.string().min(1, "Email is required.").regex(emailRegex, "Invalid email address."),
    telephoneNumber: zod_1.z.string().min(10, "A valid phone number is required.").regex(/^[\d\s()+-]*$/, "Invalid phone number format."),
    // === STEP 2: Passport & Nationality ===
    passportNumber: zod_1.z.string().min(9, "Passport number is required.").max(9).regex(/^[a-zA-Zа-яА-ЯёЁ]{0,2}(?:\d{0,7})?$/, "Invalid Passport number format"),
    issuingAuthority: zod_1.z.string().min(2, "Issuing authority is required.").regex(/^[a-zA-Zа-яА-ЯёЁ0-9\s]*$/, "Invalid characters."),
    issueDate: zod_1.z.object({
        day: zod_1.z.string().min(1, "Required").max(2).regex(numberRegex),
        month: zod_1.z.string().min(1, "Required").max(2).regex(numberRegex),
        year: zod_1.z.string().min(4, "Required").max(4).regex(numberRegex),
    }),
    expiryDate: zod_1.z.object({
        day: zod_1.z.string().min(1, "Required").max(2).regex(numberRegex),
        month: zod_1.z.string().min(1, "Required").max(2).regex(numberRegex),
        year: zod_1.z.string().min(4, "Required").max(4).regex(numberRegex),
    }),
    nationality: zod_1.z.string().min(2, "Nationality is required.").regex(nameRegex),
    countryOfBirth: zod_1.z.string().min(2, "Country of birth is required.").regex(nameRegex),
    placeOfBirth: zod_1.z.string().min(2, "Place of birth is required.").regex(nameRegex),
    // === STEP 3: Address & Living Situation ===
    outOfCountryAddress: zod_1.z.string().min(5, "Address is required."),
    townCity: zod_1.z.string().min(2, "Town/City is required.").regex(nameRegex),
    postalCode: zod_1.z.string().optional(), // Почтовый код может быть не везде
    countryRef: zod_1.z.string().min(2, "Country of residence is required.").regex(nameRegex),
    statusOfOwnershipHome: zod_1.z.enum(['OWNED', 'RENTED', 'OTHER']),
    // === STEP 4: Employment & Finances ===
    selectedStatuses: zod_1.z.array(zod_1.z.string()).min(1, "Select at least one employment status."),
    jobTitle: zod_1.z.string().min(1, "This field is required.").regex(nameRegex),
    employerName: zod_1.z.string().min(1, "This field is required.").regex(nameRegex),
    moneyInBankAmount: zod_1.z.string().min(1, "This field is required.").regex(moneyRegex),
    moneySpendMonth: zod_1.z.string().min(1, "This field is required.").regex(moneyRegex),
    // ... И так далее, мы можем добавлять сюда все поля по мере необходимости
});

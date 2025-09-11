// src/lib/visa-schema.ts
import { z } from 'zod';

// Регулярные выражения для переиспользования
const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s-]*$/;
const numberRegex = /^\d+$/;
const moneyRegex =  /^[\d.,]*$/;

// Функция для проверки, нужно ли запрашивать предыдущий адрес
function needsPreviousAddress(time: { unit: string; value: string }): boolean {
    if (!time.value || !/^\d+$/.test(time.value)) return false; // Проверка, что value - это число
    const valueNum = parseInt(time.value, 10);
    if (time.unit === 'years') return valueNum < 2;
    if (time.unit === 'months') return valueNum < 24;
    if (time.unit === 'weeks') return valueNum < 104;
    if (time.unit === 'days') return valueNum < 730;
    return false;
}

// Основная схема данных
export const UkVisaSchema = z.object({
  // === STEP 1: Personal Information ===
  givenNameFirst: z.string().min(1, "First name is required.").regex(nameRegex, "Only letters, spaces, and hyphens are allowed."),
  familyNameFirst: z.string().min(1, "Last name is required.").regex(nameRegex, "Only letters, spaces, and hyphens are allowed."),
  sex: z.enum(['M', 'F', 'OTHER'], { required_error: "Gender is required." }),
  relationshipStatus: z.enum(['S', 'M', 'D', 'U', 'P', 'W'], { required_error: "Marital status is required."}),
  partnerDetails: z.object({
    givenName: z.string(),
    familyName: z.string(),
    dateOfBirth: z.object({ day: z.string(), month: z.string(), year: z.string() }),
    nationality: z.string(),
    isTravellingWithYou: z.boolean(),
    passportNumber: z.string().optional(), // Опциональный паспорт
  }).optional(),
  dateOfBirth: z.object({
    day: z.string().min(1, "Day is required.").max(2).regex(numberRegex, "Invalid day."),
    month: z.string().min(1, "Month is required.").max(2).regex(numberRegex, "Invalid month."),
    year: z.string().min(4, "Year must be 4 digits.").max(4).regex(numberRegex, "Invalid year."),
  }),
  telephoneNumber: z.string().min(10, "A valid phone number is required.").regex(/^[\d\s()+-]*$/, "Invalid phone number format."),
  
  // === STEP 2: Passport & Nationality ===
  passportNumber: z.string().min(9, "Passport number is required.").max(9).regex(/^[A-Z]{2}\d{7}$/, "Must be 2 capital letters followed by 7 digits (e.g., AA1234567)."),
  issuingAuthority: z.string().min(2, "Issuing authority is required.").regex(/^[a-zA-Zа-яА-ЯёЁ0-9\s]*$/, "Invalid characters."),
  issueDate: z.object({
    day: z.string().min(1, "Required").max(2).regex(numberRegex),
    month: z.string().min(1, "Required").max(2).regex(numberRegex),
    year: z.string().min(4, "Required").max(4).regex(numberRegex),
  }),
  expiryDate: z.object({
    day: z.string().min(1, "Required").max(2).regex(numberRegex),
    month: z.string().min(1, "Required").max(2).regex(numberRegex),
    year: z.string().min(4, "Required").max(4).regex(numberRegex),
  }),
  nationality: z.string().min(2, "Nationality is required.").regex(nameRegex),
  placeOfBirth: z.string().min(2, "Place of birth is required.").regex(nameRegex),
  nationalIdCard: z.object({
    documentNumber: z.string().min(9, "ID card number is required.").max(9).regex(/^[A-Z]{2}\d{7}$/, "Must be 2 capital letters followed by 7 digits."),
    issuingAuthority: z.string().min(2, "Issuing authority is required.").default("UZBEKISTAN"), // По умолчанию 'UZBEKISTAN'
    issueDate: z.object({
      day: z.string().min(1, "Required").max(2).regex(numberRegex),
      month: z.string().min(1, "Required").max(2).regex(numberRegex),
      year: z.string().min(4, "Required").max(4).regex(numberRegex),
    }),
    expiryDate: z.object({
      day: z.string().min(1, "Required").max(2).regex(numberRegex),
      month: z.string().min(1, "Required").max(2).regex(numberRegex),
      year: z.string().min(4, "Required").max(4).regex(numberRegex),
    }),
  }),
  dependants: z.array(z.object({
    givenName: z.string().min(1, "Required"),
    familyName: z.string().min(1, "Required"),
    dateOfBirth: z.object({ day: z.string(), month: z.string(), year: z.string() }),
    isTravellingWithYou: z.boolean(),
    passportNumber: z.string().optional(),
  })).optional(),
  parentalConsent: z.enum(['BOTH', 'MOTHER_ONLY', 'FATHER_ONLY', 'NONE']),
  motherDetails: z.object({
    givenName: z.string(),
    familyName: z.string(),
    dateOfBirth: z.object({ day: z.string(), month: z.string(), year: z.string() }),
    nationality: z.string(),
  }).optional(),
  fatherDetails: z.object({
    givenName: z.string(),
    familyName: z.string(),
    dateOfBirth: z.object({ day: z.string(), month: z.string(), year: z.string() }),
    nationality: z.string(),
  }).optional(),




  
  
  // === STEP 3: Address & Living Situation ===
  outOfCountryAddress: z.string().min(5, "Address is required."),
  townCity: z.string().min(2, "Town/City is required.").regex(nameRegex),
  postalCode: z.string().optional(),
  countryRef: z.string().min(2, "Country of residence is required.").regex(nameRegex),
  // timeLivedAtAddress: z.object({
  //   unit: z.enum(['days', 'weeks', 'months', 'years'], { required_error: "Unit is required." }),
  //   value: z.string().min(1, "Value is required.").regex(numberRegex),
  // }),
  timeLivedAtAddressInMonths: z.number().min(1, "Required"),
  statusOfOwnershipHome: z.enum(['OWNED', 'RENTED', 'OTHER'], { required_error: "Ownership status is required." }),
  otherOwnershipDetails: z.string().optional(),
  previousAddress: z.object({
    addressLine1: z.string().min(1, "Required"),
    townCity: z.string().min(1, "Required"),
    country: z.string().min(1, "Required"),
    startDate: z.object({ 
      month: z.string().min(1, "Required").max(2).regex(numberRegex), 
      year: z.string().min(4, "Required").max(4).regex(numberRegex) 
    }),
    endDate: z.object({ 
      month: z.string().min(1, "Required").max(2).regex(numberRegex), 
      year: z.string().min(4, "Required").max(4).regex(numberRegex) 
    }),
  }).optional(),

  // === STEP 4: Employment & Finances ===
  employmentType: z.enum(['EMPLOYED', 'SELF_EMPLOYED', 'STUDENT', 'UNEMPLOYED', 'STUDENT_EMPLOYED']),

  // -- Блок данных для EMPLOYED и STUDENT_EMPLOYED --
  employerDetails: z.object({
    name: z.string(),
    address: z.string(),
    townCity: z.string(),
    country: z.string(),
    phoneCode: z.string(),
    phoneNumber: z.string(),
    startDate: z.object({ month: z.string(), year: z.string() }),
    jobTitle: z.string(),
    annualSalary: z.string().regex(moneyRegex), // Годовая ЗП
    currency: z.enum(['GBP', 'UZS', 'USD']), // Добавим USD для удобства
    jobDescription: z.string(),
  }).optional(),
  
  // -- Блок данных для SELF_EMPLOYED --
  selfEmployedDetails: z.object({
    jobTitle: z.string(),
    annualIncome: z.string().regex(moneyRegex),
    currency: z.enum(['GBP', 'UZS', 'USD']),
  }).optional(),
  
  // Общие финансовые вопросы для всех
  moneyInBankAmountUSD: z.string().min(1, "This field is required.").regex(moneyRegex), // <-- ПЕРЕИМЕНОВАНО
  moneySpendMonth: z.string().min(1, "This field is required.").regex(moneyRegex),
  
  // === STEP 5: VISIT SPONSORSHIP ===
  isSomeoneElsePaying: z.boolean(),

  // -- Объект для данных спонсора, опциональный --
  sponsorDetails: z.object({
    whoIsPaying: z.enum(['SOMEONE_I_KNOW', 'MY_EMPLOYER', 'OTHER_ORGANISATION']),
    
    // -- Общие поля для всех спонсоров --
    amountInUZS: z.string().regex(moneyRegex),
    reason: z.string(),

    // -- Поля только для SOMEONE_I_KNOW и OTHER_ORGANISATION --
    sponsorName: z.string().optional(),
    addressLine1: z.string().optional(),
    townCity: z.string().optional(),
    country: z.string().optional(),
  }).optional(),

  // ukTravelHistory: z.object({
  //   hasVisited: z.boolean(),
  //   // Массив предыдущих поездок (максимум 3)
  //   previousVisits: z.array(z.object({
  //     reason: z.enum(['TOURISM', 'WORK', 'STUDY', 'TRANSIT', 'OTHER']),
  //     arrivalMonth: z.string().min(1).max(2),
  //     arrivalYear: z.string().min(4).max(4),
  //     durationInDays: z.string().min(1),
  //   })).optional(),
  //   hadPreviousVisa: z.boolean(),
  //   previousVisaIssueDate: z.object({
  //     month: z.string(),
  //     year: z.string(),
  //   }).optional(),
  // }),
  // В схеме сделайте эти поля опциональными:
  ukTravelHistory: z.object({
    hasVisited: z.boolean(),
    previousVisits: z.array(z.object({
      reason: z.enum(['TOURISM', 'WORK', 'STUDY', 'TRANSIT', 'OTHER']),
      arrivalMonth: z.string().min(1).max(2),
      arrivalYear: z.string().min(4).max(4),
      durationInDays: z.string().min(1),
    })).optional(),
    hadPreviousVisa: z.boolean().optional(), // Сделать опциональным
    previousVisaIssueDate: z.object({
      month: z.string(),
      year: z.string(),
    }).optional(), // Сделать опциональным
  }),

  commonwealthTravelHistory: z.array(z.object({
    country: z.enum(['AUSTRALIA', 'CANADA', 'NEW_ZEALAND', 'USA', 'EU_SWISS']),
    // Если EU_SWISS, то это поле обязательно
    euCountryName: z.string().optional(),
    reason: z.enum(['TOURISM', 'WORK', 'STUDY', 'TRANSIT', 'OTHER']),
    arrivalMonth: z.string(),
    arrivalYear: z.string(),
    durationInDays: z.string(),
  })).optional(),
  worldTravelHistory: z.array(z.object({
    country: z.string().min(2),
    reason: z.enum(['TOURISM', 'WORK', 'STUDY', 'TRANSIT', 'OTHER']),
    visitStartDate: z.object({ day: z.string(), month: z.string(), year: z.string() }),
    visitEndDate: z.object({ day: z.string(), month: z.string(), year: z.string() }),
  })).optional(),
  



    

}).superRefine((data, ctx) => {
  // Условная валидация: если выбран 'OTHER', то детали обязательны
  if (data.statusOfOwnershipHome === 'OTHER' && (!data.otherOwnershipDetails || data.otherOwnershipDetails.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please provide details for 'Other' ownership status.",
      path: ["otherOwnershipDetails"],
    });
  }

  // Условная валидация: если выбран 'Employed', то jobTitle и employerName обязательны
  if (data.selectedStatuses.includes('status_employed')) {
    if (!data.jobTitle || data.jobTitle.trim().length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Job Title is required.", path: ["jobTitle"] });
    }
    if (!data.employerName || data.employerName.trim().length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Employer Name is required.", path: ["employerName"] });
    }
  }
  const isEmployed = data.employmentType === 'EMPLOYED' || data.employmentType === 'STUDENT_EMPLOYED';
  if (isEmployed && !data.employerDetails) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Employer details are required.", path: ["employerDetails.name"] });
  }

  const isSelfEmployed = data.employmentType === 'SELF_EMPLOYED';
  if (isSelfEmployed && !data.selfEmployedDetails) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Self-employment details are required.", path: ["selfEmployedDetails.jobTitle"] });
  }  
  
  // // Условная валидация: если прожил меньше 2 лет, то previousAddress обязателен
  // if (needsPreviousAddress(data.timeLivedAtAddress)) {
  //   if (!data.previousAddress) {
  //      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous address is required.", path: ["previousAddress.addressLine1"] });
  //   } else {
  //       if (!data.previousAddress.addressLine1) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["previousAddress.addressLine1"] });
  //       if (!data.previousAddress.townCity) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["previousAddress.townCity"] });
  //       // ... и так далее можно добавить проверки для всех полей previousAddress
  //   }
  // }
  function needsPreviousAddress(months: number): boolean {
    return months < 24; // Меньше 2 лет (24 месяца)
}

// И обновите вызов в superRefine:
if (needsPreviousAddress(data.timeLivedAtAddressInMonths)) {
    if (!data.previousAddress) {
       ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Previous address is required.", path: ["previousAddress.addressLine1"] });
    } else {
        if (!data.previousAddress.addressLine1) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["previousAddress.addressLine1"] });
        if (!data.previousAddress.townCity) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["previousAddress.townCity"] });
        // ... остальные проверки
    }
}
  if (data.isSomeoneElsePaying && !data.sponsorDetails) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Sponsor details are required.", path: ["sponsorDetails.whoIsPaying"] });
  }
  if (data.relationshipStatus === 'M') {
    if (!data.partnerDetails) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Partner details are required.", path: ["partnerDetails.givenName"] });
    } else if (data.partnerDetails.isTravellingWithYou && !data.partnerDetails.passportNumber) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Partner's passport number is required if they are travelling with you.", path: ["partnerDetails.passportNumber"] });
    }
  }
  
  const isPrivateSponsor = data.sponsorDetails?.whoIsPaying === 'SOMEONE_I_KNOW' || data.sponsorDetails?.whoIsPaying === 'OTHER_ORGANISATION';
  if (isSomeoneElsePaying && isPrivateSponsor && (!data.sponsorDetails?.sponsorName || !data.sponsorDetails?.addressLine1)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Sponsor name and address are required.", path: ["sponsorDetails.sponsorName"] });
  }

  if (data.dependants) {
    data.dependants.forEach((dependant, index) => {
      if (dependant.isTravellingWithYou && !dependant.passportNumber) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passport is required.", path: [`dependants.${index}.passportNumber`] });
      }
    });
  }
  if (data.parentalConsent === 'BOTH' && (!data.motherDetails || !data.fatherDetails)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Details for both parents are required.", path: ["parentalConsent"] });
  }
  if (data.parentalConsent === 'MOTHER_ONLY' && !data.motherDetails) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Mother's details are required.", path: ["motherDetails.givenName"] });
  }
  if (data.parentalConsent === 'FATHER_ONLY' && !data.fatherDetails) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Father's details are required.", path: ["fatherDetails.givenName"] });
  }
  if (data.ukTravelHistory.hasVisited && data.ukTravelHistory.hadPreviousVisa && !data.ukTravelHistory.previousVisaIssueDate) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please provide the issue date of your previous visa.", path: ["ukTravelHistory.previousVisaIssueDate"] });
  }
  if (data.commonwealthTravelHistory) {
    data.commonwealthTravelHistory.forEach((visit, index) => {
      if (visit.country === 'EU_SWISS' && (!visit.euCountryName || visit.euCountryName.trim().length === 0)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify the EU country.", path: [`commonwealthTravelHistory.${index}.euCountryName`] });
      }
    });
  }
});


// Создаем тип для использования в нашем коде
export type UkVisaDataType = z.infer<typeof UkVisaSchema>;
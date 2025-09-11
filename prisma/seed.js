// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // ==========================================================
  // 1. ПОЛНАЯ ОЧИСТКА ДАННЫХ
  // ==========================================================
  // Удаляем в правильном порядке, чтобы не было конфликтов
  await prisma.application.deleteMany();
  await prisma.client.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.travelCompany.deleteMany();
  console.log('Cleared all previous data.');

  // ==========================================================
  // 2. СОЗДАНИЕ АГЕНТА И КОМПАНИИ С НУЛЯ
  // ==========================================================
  const company = await prisma.travelCompany.create({
    data: { name: 'Tashkent Travel Pro' },
  });
  console.log(`Created company: ${company.name}`);

  const hashedPassword = await bcrypt.hash('password123', 10);
  const agent = await prisma.agent.create({
    data: {
      email: 'agent@travel.uz',
      password: hashedPassword,
      companyId: company.id,
    },
  });
  console.log(`Created agent with email: ${agent.email}`);
  
  // ==========================================================
  // 3. СОЗДАНИЕ "ТЕСТОВОЙ БОЛВАНКИ"
  // ==========================================================
  const testClient = await prisma.client.create({
    data: { fullName: 'Test Client Automation' },
  });
  await prisma.application.create({
    data: {
      accessCode: `TEST-COMPLEX-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      country: 'UK', 
      status: 'PENDING', // Сразу готов к запуску автоматизации
      clientId: testClient.id,
      formData: {
        // --- Personal Info ---
        givenNameFirst: 'Complex',
        familyNameFirst: 'Client',
        sex: 'F',
        relationshipStatus: 'M', // <-- ИЗМЕНЕНО НА 'Married'
        partnerDetails: { // <-- ДОБАВЛЕН БЛОК
          givenName: 'Partner',
          familyName: 'Clientova',
          dateOfBirth: { day: '10', month: '10', year: '1996' },
          nationality: 'UZBEKISTAN',
          isTravellingWithYou: true,
          passportNumber: 'EE1122334'
        },
        dependants: [
          { // Ребенок 1: едет с нами
            givenName: 'Farrukh', familyName: 'Clientov',
            dateOfBirth: { day: '12', month: '12', year: '2018' },
            isTravellingWithYou: true,
            passportNumber: 'GG5566778'
          },
          { // Ребенок 2: не едет
            givenName: 'Zarina', familyName: 'Clientova',
            dateOfBirth: { day: '03', month: '03', year: '2020' },
            isTravellingWithYou: false,
            passportNumber: ''
          }
        ],
        parentalConsent: 'BOTH',
        motherDetails: {
          givenName: 'Ona', familyName: 'Clientova',
          dateOfBirth: { day: '01', month: '01', year: '1975' },
          nationality: 'Uzbekistan'
        },
        fatherDetails: {
          givenName: 'Ota', familyName: 'Clientov',
          dateOfBirth: { day: '02', month: '02', year: '1972' },
          nationality: 'Uzbekistan'
        },
        dateOfBirth: { day: '05', month: '05', year: '1995' },
        telephoneNumber: '+998912345678',
        
        // --- Passport ---
        passportNumber: 'BB7654321',
        issuingAuthority: 'UZBEKISTAN',
        issueDate: { day: '10', month: '10', year: '2019' },
        expiryDate: { day: '10', month: '10', year: '2029' },
        nationality: 'UZBEKISTAN',
        placeOfBirth: 'TASHKENT',
        nationalIdCard: {
          documentNumber: 'CC1234567',
          issuingAuthority: 'UZBEKISTAN',
          issueDate: { day: '02', month: '02', year: '2021' },
          expiryDate: { day: '02', month: '02', year: '2031' }
        },

        ukTravelHistory: {
          hasVisited: true,
          previousVisits: [
            { reason: 'TOURISM', arrivalMonth: '07', arrivalYear: '2022', durationInDays: '10' },
            { reason: 'WORK', arrivalMonth: '03', arrivalYear: '2023', durationInDays: '5' },
          ],
          hadPreviousVisa: true,
          previousVisaIssueDate: { month: '06', year: '2022' }
        },
        commonwealthTravelHistory: [
          { country: 'USA', euCountryName: '', reason: 'TOURISM', arrivalMonth: '05', arrivalYear: '2023', durationInDays: '14' },
          { country: 'EU_SWISS', euCountryName: 'Germany', reason: 'WORK', arrivalMonth: '11', arrivalYear: '2022', durationInDays: '7' },
          { country: 'CANADA', euCountryName: '', reason: 'STUDY', arrivalMonth: '01', arrivalYear: '2022', durationInDays: '90' }
        ],
        worldTravelHistory: [
          { country: 'Turkey', reason: 'TOURISM', visitStartDate: { day: '15', month: '07', year: '2023' }, visitEndDate: { day: '25', month: '07', year: '2023' } },
          { country: 'United Arab Emirates', reason: 'BUSINESS', visitStartDate: { day: '10', month: '02', year: '2023' }, visitEndDate: { day: '15', month: '02', year: '2023' } }
        ],
        // --- Current Address (LIVED LESS THAN 2 YEARS) ---
        outOfCountryAddress: '123 New Street',
        townCity: 'Tashkent',
        postalCode: '100017',
        countryRef: 'Uzbekistan',
        // timeLivedAtAddress: {
        //   unit: 'years',
        //   value: '1', // <-- МЕНЬШЕ 2 ЛЕТ
        // },
        // statusOfOwnershipHome: 'OTHER', // <-- СТАТУС "OTHER"
        timeLivedAtAddressInMonths: 12, // 1 год = 12 месяцев (< 24)
        statusOfOwnershipHome: 'OTHER',
        otherOwnershipDetails: 'Living with my family', // <-- ДЕТАЛИ ДЛЯ "OTHER"
        
        // --- Previous Address (NOW REQUIRED) ---
        previousAddress: {
          addressLine1: '456 Old Avenue',
          townCity: 'Samarkand',
          country: 'Uzbekistan',
          startDate: { month: '06', year: '2015' },
          endDate: { month: '06', year: '2023' },
        },
        
        // --- Employment & Finances ---
        employmentType: 'STUDENT_EMPLOYED', // <-- ГЛАВНЫЙ СЦЕНАРИЙ
        
        // -- Детали для EMPLOYED --
        employerDetails: {
          name: 'Global IT Solutions',
          address: '42 Mustaqillik Square',
          townCity: 'Tashkent',
          country: 'Uzbekistan',
          phoneCode: '998',
          phoneNumber: '712001122',
          startDate: { month: '09', year: '2023' },
          jobTitle: 'Junior Frontend Developer',
          annualSalary: '150000000', // ~12000 USD в сумах
          currency: 'UZS',
          jobDescription: 'Developing and maintaining web application interfaces, participating in team meetings and code reviews.',
        },

        // -- Детали для SELF_EMPLOYED (оставляем null, так как не выбран) --
        selfEmployedDetails: null,
        
        moneyInBankAmountUSD: '15000',
        moneySpendMonth: '5000000',  
        isSomeoneElsePaying: true,
        sponsorDetails: {
          whoIsPaying: 'SOMEONE_I_KNOW',
          amountInUZS: '25000000',
          reason: 'My father is sponsoring my trip to visit historical sites.',
          sponsorName: 'Test Sponsor (Father)',
          addressLine1: '789 Sponsor Street',
          townCity: 'Tashkent',
          country: 'Uzbekistan',
        },
      },
    },
  });
  console.log('Created test client with pre-filled data.');

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });


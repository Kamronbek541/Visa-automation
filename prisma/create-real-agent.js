// prisma/create-real-agent.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // <-- ИСПРАВЛЕНО

const prisma = new PrismaClient();

async function main() {
  const companyName = "Uzbekistan Travel Co.";
  const agentEmail = "agent@travel.com";
  const agentPassword = "password123";

  // 1. Создаем компанию, если ее нет
  let company = await prisma.travelCompany.findUnique({ where: { name: companyName } });
  if (!company) {
    company = await prisma.travelCompany.create({
      data: { name: companyName },
    });
    console.log(`Created company: ${company.name}`);
  } else {
    console.log(`Company "${company.name}" already exists.`);
  }

  // 2. Хешируем пароль
  const hashedPassword = await bcrypt.hash(agentPassword, 10);

  // 3. Создаем или обновляем агента (Upsert - более надежно)
  const agent = await prisma.agent.upsert({
    where: { email: agentEmail },
    update: {
      password: hashedPassword,
      companyId: company.id,
    },
    create: {
      email: agentEmail,
      password: hashedPassword,
      companyId: company.id,
    },
  });

  console.log(`Successfully created/updated agent: ${agent.email}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
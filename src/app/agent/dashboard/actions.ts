'use server';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import client from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { customAlphabet } from 'nanoid';
import { revalidatePath } from 'next/cache';

// Создаем кастомный генератор для кодов вида UK-A8B3-F7K2
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);

export async function createClientAndApplication(fullName: string) {
  // 1. Проверяем сессию, чтобы убедиться, что действие выполняет авторизованный агент
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' };
  }

  // 2. Находим агента и его компанию в базе данных
  const agent = await client.agent.findUnique({
    where: { id: session.user.id },
    include: { company: true },
  });

  if (!agent) {
    return { success: false, message: 'Agent not found.' };
  }

  try {
    // 3. Создаем нового клиента
    const newClient = await client.client.create({
      data: {
        fullName: fullName,
        // Здесь можно будет добавить привязку к компании или агенту
      },
    });

    // 4. Генерируем уникальный код и создаем для него заявку
    const accessCode = `UK-${nanoid(4)}-${nanoid(4)}`;
    await client.application.create({
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

  } catch (error) {
    console.error("Error creating client/application:", error);
    return { success: false, message: 'Database error.' };
  }
}
// НОВАЯ ФУНКЦИЯ ДЛЯ УДАЛЕНИЯ
export async function deleteClientAndApplications(clientId: string) {
  // Здесь можно добавить проверку сессии, чтобы убедиться, что удаляет авторизованный агент
  // const session = await getServerSession(authOptions);
  // if (!session?.user?.id) {
  //   return { success: false, message: 'Unauthorized' };
  // }

  if (!clientId) {
    return { success: false, message: 'Client ID is required.' };
  }

  try {
    // Prisma заботится о транзакциях. 
    // Сначала она удалит все связанные 'Application', а затем самого 'Client'.
    // Это возможно благодаря связи `relation` в нашей schema.prisma
    // Однако, для явной надежности, лучше удалить заявки вручную.

    // 1. Сначала удаляем все заявки, связанные с этим клиентом
    await client.application.deleteMany({
      where: {
        clientId: clientId,
      },
    });

    // 2. Затем удаляем самого клиента
    await client.client.delete({
      where: {
        id: clientId,
      },
    });

    // 3. Говорим Next.js, что данные на странице дашборда устарели и их надо перезагрузить
    revalidatePath('/agent/dashboard');

    return { success: true, message: 'Client and all related applications have been deleted.' };

  } catch (error) {
    console.error("Error deleting client:", error);
    return { success: false, message: 'Database error occurred during deletion.' };
  }
}

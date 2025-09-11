// application/action.ts
'use server';

import client from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { UkVisaSchema, UkVisaDataType } from '@/lib/visa-schema'; // <-- ИМПОРТИРУЕМ НАШУ ОСНОВНУЮ СХЕМУ

// Тип для входных данных функции
type SaveApplicationDataInput = {
  accessCode: string;
  formData: UkVisaDataType; // <-- ИСПОЛЬЗУЕМ ТИП ИЗ ОСНОВНОЙ СХЕМЫ
};

export async function saveApplicationData(input: SaveApplicationDataInput) {
  try {
    // 1. Валидируем входящие данные на сервере (двойная проверка)
    // Используем полную схему для валидации всех полей сразу.
    const validatedData = UkVisaSchema.parse(input.formData);
    
    // 2. Данные уже в правильной структуре благодаря Zod,
    // так что дополнительное преобразование не нужно.
    // Zod уже гарантирует, что у нас есть `dateOfBirth: { day, month, year }`.
    
    // 3. Обновляем запись в базе данных
    await client.application.update({
      where: {
        accessCode: input.accessCode,
      },
      data: {
        formData: validatedData as any, // Сохраняем весь объект в поле formData
        status: 'PENDING',  // Меняем статус на "Ожидает проверки агентом"
      },
    });

    // 4. Очищаем кеш для этой страницы
    revalidatePath(`/application/${input.accessCode}`);
    revalidatePath(`/agent/dashboard`); // Также очистим кеш дашборда, чтобы там обновился список
    
    return { success: true, message: 'Application submitted successfully.' };

  } catch (error) {
    console.error('Failed to save application data:', error);
    if (error instanceof z.ZodError) {
      // Это поможет нам при отладке понять, какое именно поле не прошло валидацию
      console.error('Zod Validation Errors:', error.flatten().fieldErrors);
      return { success: false, message: 'Validation failed. Please check your input.', errors: error.errors };
    }
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
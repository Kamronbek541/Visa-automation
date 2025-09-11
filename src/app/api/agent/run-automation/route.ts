// // src/app/api/agent/run-automation/route.ts

// import prisma from '@/lib/prisma';
// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// // Эта инструкция остается, она критически важна для работы Puppeteer
// export const runtime = 'nodejs'; 

// export async function POST(req: NextRequest) {
//   // Динамически импортируем тяжелую функцию, чтобы не ломать сборку клиента
//   const { runUkVisaAutomation } = await import('@/automation/uk-visa-script');
  
//   try {
//     // 1. Получаем сессию текущего агента, чтобы узнать его email
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       // Если сессии нет, значит, запрос не авторизован
//       return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//     }
    
//     // 2. Получаем ID заявки из тела запроса
//     const { applicationId } = await req.json();
//     if (!applicationId) {
//       return NextResponse.json({ message: 'Application ID is required' }, { status: 400 });
//     }

//     // 3. Находим заявку в базе данных
//     const application = await prisma.application.findUnique({
//       where: { id: applicationId },
//     });

//     if (!application || !application.formData) {
//       return NextResponse.json({ message: 'Application not found or is empty' }, { status: 404 });
//     }
    
//     // 4. Готовим данные для входа на визовом портале
//     // Мы используем email из сессии авторизованного агента.
//     // Пароль пока что жестко прописан, как мы и договаривались для MVP.
//     // В будущем его можно будет хранить в зашифрованном виде в модели Agent.
//     const agentCredentials = {
//       email: session.user.email,
//       password: 'ComplexPassword!123' // Временный стандартный пароль
//     };

//     // 5. Обновляем статус заявки на "В ОБРАБОТКЕ"
//     await prisma.application.update({
//       where: { id: applicationId },
//       data: { status: 'PROCESSING' }
//     });

//     // 6. Запускаем автоматизацию в фоновом режиме
//     // Мы передаем ID заявки, ее данные И данные для входа агента.
//     runUkVisaAutomation(applicationId, application.formData, agentCredentials)
//       .catch(error => {
//           // Если в процессе автоматизации произойдет ошибка, мы ее здесь поймаем и залогируем
//           console.error(`❌ Automation for ${applicationId} failed in the background:`, error.message);
//           // Статус на FAILED изменится внутри самого скрипта runUkVisaAutomation
//       });
    
//     // 7. Сразу же отвечаем, что процесс запущен, не дожидаясь его окончания
//     return NextResponse.json({ message: 'Automation started successfully!' });

//   } catch (error) {
//     console.error('Critical error in run-automation endpoint:', error);
//     return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
//   }
// }

// src/app/api/agent/run-automation/route.ts

import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const runtime = 'nodejs'; 

function formatDateForUrl(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function POST(req: NextRequest) {
  const { runUkVisaAutomation } = await import('@/automation/uk-visa-script');
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const { applicationId } = await req.json();
    if (!applicationId) {
      return NextResponse.json({ message: 'Application ID is required' }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application || !application.formData) {
      return NextResponse.json({ message: 'Application not found or is empty' }, { status: 404 });
    }

    // ==========================================================
    // 1. ГЕНЕРИРУЕМ ДАТЫ И СЧИТАЕМ ГОСТЕЙ ЗДЕСЬ, ОДИН РАЗ
    // ==========================================================
    const data = application.formData as any; // Используем any для гибкости
    
    const arrivalDate = new Date();
    arrivalDate.setDate(arrivalDate.getDate() + 42);
    const tripDurationDays = Math.floor(Math.random() * (16 - 7 + 1)) + 7;
    const leaveDate = new Date(arrivalDate);
    leaveDate.setDate(leaveDate.getDate() + tripDurationDays);
    
    const adults = 1 + (data.partnerDetails?.isTravellingWithYou ? 1 : 0);
    const children = data.dependants?.filter((d: any) => d.isTravellingWithYou).length || 0;

    // Собираем все сгенерированные данные в один объект
    const generatedData = {
      arrivalDate: arrivalDate.toISOString(), // Передаем в ISO формате
      leaveDate: leaveDate.toISOString(),
      adults,
      children,
    };
    
    const agentCredentials = {
      email: session.user.email,
      password: 'ComplexPassword!123'
    };

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'PROCESSING' }
    });

    // 2. ПЕРЕДАЕМ СГЕНЕРИРОВАННЫЕ ДАННЫЕ В PUPPETEER
    runUkVisaAutomation(applicationId, data, agentCredentials, generatedData)
      .catch(error => {
          console.error(`❌ Automation for ${applicationId} failed in the background:`, error.message);
      });
    
    // 3. ВОЗВРАЩАЕМ СГЕНЕРИРОВАННЫЕ ДАННЫЕ КЛИЕНТУ
    // return NextResponse.json({ 
    //   message: 'Automation started successfully!',
    //   bookingInstruction: { // Объект с инструкцией для pop-up
    //     checkIn: arrivalDate.toLocaleDateString('en-GB'),
    //     checkOut: leaveDate.toLocaleDateString('en-GB'),
    //     adults,
    //     children,
    //   }
    // });
    return NextResponse.json({ 
      message: 'Automation started successfully!',
      bookingInstruction: {
        // Формат для красивого отображения в pop-up
        checkInDisplay: arrivalDate.toLocaleDateString('en-GB'),
        checkOutDisplay: leaveDate.toLocaleDateString('en-GB'),
        // Формат для построения URL
        checkInUrl: formatDateForUrl(arrivalDate),
        checkOutUrl: formatDateForUrl(leaveDate),
        adults,
        children,
      }
    });

  } catch (error) {
    console.error('Critical error in run-automation endpoint:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
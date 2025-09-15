// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import client from '@/lib/prisma';
// import { Badge } from '@/components/ui/badge'; // Установим позже
// import { RunAutomationButton } from './RunAutomationButton';
// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
// import { DeleteClientButton } from './DeleteClientButton';

// // Функция для получения цвета бейджа в зависимости от статуса
// const getBadgeVariant = (status: string) => {
//   switch (status) {
//     case 'DRAFT': return 'secondary';
//     case 'PENDING': return 'default';
//     case 'COMPLETED': return 'success';
//     case 'FAILED': return 'destructive';
//     default: return 'outline';
//   }
// }

// export async function ApplicationsTable() {
//   // Здесь мы могли бы фильтровать по ID компании агента, но для MVP покажем все
//   const applications = await client.application.findMany({
//     include: {
//       client: true, // Включаем данные связанного клиента
//     },
//     orderBy: {
//       createdAt: 'desc', // Сортируем по дате, новые вверху
//     },
//   });

//   return (
//     <div className="border rounded-lg">
//         <Table>
//         <TableHeader>
//             <TableRow>
//             <TableHead>Client Name</TableHead>
//             <TableHead>Access Code</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead>Created At</TableHead>
//             <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//         </TableHeader>
//         <TableBody>
//             {applications.map((app) => (
//             <TableRow key={app.id}>
//                 <TableCell className="font-medium">{app.client.fullName}</TableCell>
//                 <TableCell>{app.accessCode}</TableCell>
//                 <TableCell>
//                     <Badge variant={getBadgeVariant(app.status)}>{app.status}</Badge>
//                 </TableCell>
//                 <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
//                 <TableCell className="text-right">
//                   <div className="flex gap-2 justify-end items-center">
//                     {/* Новая кнопка для просмотра/редактирования */}
//                     <Link href={`/agent/application/${app.id}`}>
//                       <Button variant="outline" size="sm">
//                         View / Edit
//                       </Button>
//                     </Link>
                    
//                     {/* Наша старая кнопка для запуска автоматизации */}
//                     <RunAutomationButton
//                       applicationId={app.id}
//                       status={app.status}
//                     />
//                         {/* НАША НОВАЯ КНОПКА УДАЛЕНИЯ */}
//                     <DeleteClientButton
//                       clientId={app.client.id}
//                       clientName={app.client.fullName}
//                     />
//                   </div>  
//                 </TableCell>
//             </TableRow>
//             ))}
//         </TableBody>
//         </Table>
//     </div>
//   );
// }


// // src/app/agent/dashboard/ApplicationsTable.tsx

// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import client from '@/lib/prisma';
// import { Badge } from '@/components/ui/badge';
// import { RunAutomationButton } from './RunAutomationButton';
// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
// import { DeleteClientButton } from './DeleteClientButton';
// import { createTranslator } from '@/lib/translations';
// import { cookies } from 'next/headers';

// const getBadgeVariant = (status: string) => {
//   switch (status) {
//     case 'DRAFT': return 'secondary';
//     case 'PENDING': return 'default';
//     case 'PROCESSING': return 'secondary'; // Сделаем его серым, чтобы не отвлекал
//     case 'COMPLETED': return 'success';
//     case 'FAILED': return 'destructive';
//     default: return 'outline';
//   }
// }

// export async function ApplicationsTable() {
//   const locale = cookies().get('locale')?.value || 'en';
//   const t = await createTranslator(locale as any);

//   const applications = await client.application.findMany({
//     include: { client: true },
//     orderBy: { createdAt: 'desc' },
//   });

//   return (
//     <div className="border rounded-lg bg-white">
//         <Table>
//         <TableHeader>
//             <TableRow>
//             <TableHead>{t('table_header_client_name')}</TableHead>
//             <TableHead>{t('table_header_access_code')}</TableHead>
//             <TableHead>{t('table_header_status')}</TableHead>
//             <TableHead>{t('table_header_created_at')}</TableHead>
//             <TableHead className="text-right">{t('table_header_actions')}</TableHead>
//             </TableRow>
//         </TableHeader>
//         <TableBody>
//             {applications.map((app) => (
//             <TableRow key={app.id}>
//                 <TableCell className="font-medium">{app.client.fullName}</TableCell>
//                 <TableCell className="font-mono">{app.accessCode}</TableCell>
//                 <TableCell>
//                     <Badge variant={getBadgeVariant(app.status)}>{app.status}</Badge>
//                 </TableCell>
//                 <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
//                 <TableCell className="text-right">
//                   <div className="flex gap-2 justify-end items-center">
//                     <Link href={`/agent/application/${app.id}`}>
//                       <Button variant="outline" size="sm">
//                         {t('action_btn_view_edit')}
//                       </Button>
//                     </Link>
//                     <RunAutomationButton
//                       applicationId={app.id}
//                       status={app.status}
//                     />
//                     <DeleteClientButton
//                       clientId={app.client.id}
//                       clientName={app.client.fullName}
//                     />
//                   </div>  
//                 </TableCell>
//             </TableRow>
//             ))}
//         </TableBody>
//         </Table>
//     </div>
//   );
// }


// src/app/agent/dashboard/ApplicationsTable.tsx

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import client from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { RunAutomationButton } from './RunAutomationButton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DeleteClientButton } from './DeleteClientButton';
import { createTranslator } from '@/lib/translations';
import { cookies } from 'next/headers';

const getBadgeVariant = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'secondary';
    case 'PENDING': return 'default';
    case 'PROCESSING': return 'secondary';
    case 'COMPLETED': return 'success';
    case 'FAILED': return 'destructive';
    default: return 'outline';
  }
}

export async function ApplicationsTable() {
  const locale = cookies().get('locale')?.value || 'en';
  const t = await createTranslator(locale as any);

  const applications = await client.application.findMany({
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="border rounded-lg bg-white">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>{t('table_header_client_name')}</TableHead>
            <TableHead>{t('table_header_access_code')}</TableHead>
            <TableHead>{t('table_header_status')}</TableHead>
            <TableHead>{t('table_header_created_at')}</TableHead>
            <TableHead className="text-right">{t('table_header_actions')}</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {applications.map((app) => (
            <TableRow key={app.id}>
                <TableCell className="font-medium">{app.client.fullName}</TableCell>
                <TableCell className="font-mono">{app.accessCode}</TableCell>
                <TableCell>
                    {(() => {
                        // ==========================================================
                        // КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: ПЕРЕВОДИМ СТАТУС
                        // ==========================================================
                        // 1. Создаем ключ, например "status_PENDING"
                        const statusKey = `status_${app.status}`;
                        // 2. Получаем перевод. Если его нет, показываем сам статус (PENDING)
                        const translatedStatus = t(statusKey as any) || app.status;
                        
                        return (
                            <Badge variant={getBadgeVariant(app.status)}>
                                {translatedStatus}
                            </Badge>
                        );
                    })()}
                </TableCell>
                <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end items-center">
                    <Link href={`/agent/application/${app.id}`}>
                      <Button variant="outline" size="sm">
                        {t('action_btn_view_edit')}
                      </Button>
                    </Link>
                    <RunAutomationButton
                      applicationId={app.id}
                      status={app.status}
                    />
                    <DeleteClientButton
                      clientId={app.client.id}
                      clientName={app.client.fullName}
                    />
                  </div>  
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
  );
}
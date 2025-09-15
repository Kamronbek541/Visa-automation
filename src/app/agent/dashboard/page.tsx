// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import { redirect } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import Link from 'next/link';
// import { CreateClientForm } from './CreateClientForm'; // Импорт формы
// import { ApplicationsTable } from './ApplicationsTable'; // Импорт таблицы
// import { Suspense } from 'react';
// import { useLocaleContext } from '@/contexts/LocaleContext';
// import SimpleLanguageSwitcher from '@/components/SimpleLanguageSwitcher';

// export default async function DashboardPage() {
//   const session = await getServerSession(authOptions);

//   if (!session) {
//     redirect('/agent/login');
//   }

//   return (
//     <div className="p-4 md:p-8 max-w-7xl mx-auto">
//       <div className="flex justify-between items-center mb-8">
//         <div>
//             <h1 className="text-3xl font-bold">Agent Dashboard</h1>
//             <p className="text-gray-500">Welcome, {session.user?.email}</p>
//         </div>
//         <div className="flex items-center gap-4">
//             <CreateClientForm /> {/* Кнопка "+ New Application" */}
//             <Link href="/api/auth/signout">
//                 <Button variant="outline">Sign Out</Button>
//             </Link>
//         </div>
//       </div>
      
//       <div className="mt-6">
//         <h2 className="text-xl font-semibold mb-4">Client Applications</h2>
//         {/* Suspense для плавной загрузки таблицы */}
//         <Suspense fallback={<p>Loading applications...</p>}>
//           <ApplicationsTable />
//         </Suspense>
//       </div>
//     </div>
//   );
// }



// src/app/agent/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CreateClientForm } from './CreateClientForm';
import { ApplicationsTable } from './ApplicationsTable';
import { Suspense } from 'react';
import { createTranslator } from '@/lib/translations'; // <-- ИМПОРТ
import { cookies } from 'next/headers'; // <-- ИМПОРТ
import { AgentLanguageSwitcher } from './AgentLanguageSwitcher'; 

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/agent/login');
  }

  const locale = cookies().get('locale')?.value || 'en'; // <-- ПОЛУЧАЕМ ЯЗЫК
  const t = await createTranslator(locale as any); // <-- СОЗДАЕМ ПЕРЕВОДЧИК

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold">{t('dashboard_title')}</h1>
            <p className="text-gray-500">{t('dashboard_welcome', { email: session.user?.email })}</p>
        </div>
        <div className="flex items-center gap-4">
        <AgentLanguageSwitcher /> 
            <CreateClientForm /> {/* Этот компонент переведем отдельно */}
            <Link href="/api/auth/signout">
                <Button variant="outline">{t('dashboard_sign_out_btn')}</Button>
            </Link>
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">{t('dashboard_client_applications_title')}</h2>
        <Suspense fallback={<p>{t('dashboard_loading')}</p>}>
          <ApplicationsTable /> {/* Этот компонент тоже переведем отдельно */}
        </Suspense>
      </div>
    </div>
  );
}
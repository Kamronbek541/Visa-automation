// src/app/agent/application/[id]/page.tsx
import client from '@/lib/prisma';
import { UkVisaForm } from '@/components/visa/UkVisaForm'; // Переиспользуем нашу форму!
import { notFound } from 'next/navigation';

type EditApplicationPageProps = {
  params: {
    id: string; // ID заявки из URL
  };
};

export default async function EditApplicationPage({ params: { id } }: EditApplicationPageProps) {
  const application = await client.application.findUnique({
    where: { id },
    include: {
      client: true, // Загружаем имя клиента
    },
  });

  // Если заявка не найдена, показываем страницу 404
  if (!application) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Review Application</h1>
        <p className="text-gray-500 mt-1">
          Client: <span className="font-semibold">{application.client.fullName}</span>
        </p>
        <p className="text-gray-500">
          Access Code: <span className="font-mono">{application.accessCode}</span>
        </p>
      </div>

      <div className="mt-6">
        {/* 
          Магия здесь! Мы просто переиспользуем наш уже существующий компонент формы.
          Он автоматически загрузит данные из `application.formData` и позволит их редактировать.
          Функция `saveApplicationData` внутри формы обновит данные новыми значениями.
        */}
        <UkVisaForm application={application} countryName={application.country} isAdminMode={true}/>
      </div>
    </div>
  );
}
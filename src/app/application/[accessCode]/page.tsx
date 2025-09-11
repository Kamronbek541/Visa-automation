import client from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { UkVisaForm } from '@/components/visa/UkVisaForm';


// This is the props type for our page component
type ApplicationPageProps = {
  params: {
    accessCode: string;
  };
};

export default async function ApplicationPage({ params }: ApplicationPageProps) {
//   const { accessCode } = params;
  // const accessCode = params.accessCode;
  const awaitedParams = await params; // <-- Сначала "дожидаемся" параметров
  const accessCode = awaitedParams.accessCode; // <-- Теперь безопасно их используем

  // Fetch the application data from the database
  const application = await client.application.findUnique({
    where: { accessCode },
  });

  // If no application is found for this code, show a 404 page
  if (!application) {
    notFound();
  }

  // Определяем красивое название страны
    let countryName = "Unknown";
    switch (application.country) {
    case "UK":
        countryName = "UK";
        break;
    // В будущем можно будет добавить другие
    // case "DE":
    //   countryName = "Germany";
    //   break;
    }

  // HERE WE WILL BUILD OUR FORM
  // For now, we'll just display the data we found

// ==========================================================
  // НАША НОВАЯ ЛОГИКА ЗАЩИТЫ
  // ==========================================================
  // Если статус НЕ 'DRAFT', значит, клиент уже отправлял форму.
  if (application.status !== 'DRAFT') {
    // Перенаправляем его на страницу с сообщением.
    redirect('/application/submitted');
  }
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold leading-6 text-gray-900">
            {application.country} Visa Application
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Please fill out all sections carefully. Your progress is not saved until you submit.
          </p>
        </header>
        <main>
          {/* Форма будет показана ТОЛЬКО если статус 'DRAFT' */}
          <UkVisaForm application={application} countryName={application.country} />
        </main>
      </div>
    </div>
  );
}
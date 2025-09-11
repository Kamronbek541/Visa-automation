// src/app/application/success/page.tsx
export default function SuccessPage() {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8">
        <div className="w-full max-w-md text-center bg-white p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-green-600">Application Submitted!</h1>
          <p className="mt-4 text-gray-600">
            Your application has been successfully sent to your travel agent. They will contact you shortly. You can now close this window.
          </p>
        </div>
      </main>
    );
  }
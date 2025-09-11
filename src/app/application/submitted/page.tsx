// src/app/application/submitted/page.tsx
export default function SubmittedPage() {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8">
        <div className="w-full max-w-md text-center bg-white p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800">Application Already Submitted</h1>
          <p className="mt-4 text-gray-600">
            This application has already been completed and sent to your travel agent. If you need to make changes, please contact your agent directly.
          </p>
        </div>
      </main>
    );
  }
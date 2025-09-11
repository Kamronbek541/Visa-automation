import Link from 'next/link';

export default function InvalidCodePage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-red-600">Invalid Code</h1>
        <p className="mt-4 text-gray-600">
          The access code you entered was not found. Please check the code and try again.
        </p>
        <Link href="/" className="inline-block px-6 py-2 mt-6 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            Return to Home
        </Link>
      </div>
    </main>
  );
}
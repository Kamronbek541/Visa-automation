"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomePage;
const navigation_1 = require("next/navigation");
const prisma_1 = __importDefault(require("@/lib/prisma"));
function HomePage() {
    async function findApplication(formData) {
        'use server'; // This is a Next.js 14+ feature for server-side actions
        const accessCode = formData.get('accessCode');
        if (!accessCode) {
            // Handle empty input if needed
            return;
        }
        const application = await prisma_1.default.application.findUnique({
            where: {
                accessCode: accessCode,
            },
        });
        if (application) {
            // If we find the application, redirect the user to its form page
            (0, navigation_1.redirect)(`/application/${accessCode}`);
        }
        else {
            // Optional: Handle case where code is not found
            // For now, we'll just redirect to an error page
            (0, navigation_1.redirect)('/invalid-code');
        }
    }
    return (<main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Visa Application Portal
        </h1>
        <p className="text-center text-gray-600">
          Please enter the unique access code provided by your travel agent.
        </p>
        <form action={findApplication} className="space-y-6">
          <div>
            <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">
              Access Code
            </label>
            <input id="accessCode" name="accessCode" type="text" required className="w-full px-3 py-2 mt-1 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., UK-A8B3-F7K2"/>
          </div>
          <div>
            <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Start Application
            </button>
          </div>
        </form>
      </div>
    </main>);
}

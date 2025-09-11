"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ApplicationPage;
const prisma_1 = __importDefault(require("@/lib/prisma"));
const navigation_1 = require("next/navigation");
const UkVisaForm_1 = require("@/components/visa/UkVisaForm");
async function ApplicationPage({ params }) {
    //   const { accessCode } = params;
    const accessCode = params.accessCode;
    // Fetch the application data from the database
    const application = await prisma_1.default.application.findUnique({
        where: { accessCode },
    });
    // If no application is found for this code, show a 404 page
    if (!application) {
        (0, navigation_1.notFound)();
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
    return (<main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
    <div className="w-full max-w-4xl">
        {/* Передаем application и новое свойство countryName */}
        <UkVisaForm_1.UkVisaForm application={application} countryName={countryName}/>
        </div>
    </main>);
}

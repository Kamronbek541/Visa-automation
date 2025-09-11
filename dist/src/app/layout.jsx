"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
const google_1 = require("next/font/google");
require("./globals.css");
const providers_1 = __importDefault(require("./providers")); // Импортируем наш провайдер
const inter = (0, google_1.Inter)({ subsets: ["latin"] });
exports.metadata = {
    title: "Visa Automation UZ",
    description: "Automating visa processes",
};
function RootLayout({ children, }) {
    return (<html lang="en">
      <body className={inter.className}>
        <providers_1.default>{children}</providers_1.default> {/* Оборачиваем здесь */}
      </body>
    </html>);
}

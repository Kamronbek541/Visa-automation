"use strict";
// src/app/actions.ts
'use server'; // This marks all functions in this file as Server Actions
// src/app/actions.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findApplication = findApplication;
const navigation_1 = require("next/navigation");
const prisma_1 = __importDefault(require("@/lib/prisma"));
async function findApplication(formData) {
    const accessCode = formData.get('accessCode');
    if (!accessCode) {
        return (0, navigation_1.redirect)('/?error=true');
    }
    const application = await prisma_1.default.application.findUnique({
        where: {
            accessCode: accessCode.trim(),
        },
    });
    if (application) {
        (0, navigation_1.redirect)(`/application/${accessCode}`);
    }
    else {
        (0, navigation_1.redirect)('/?error=true');
    }
}

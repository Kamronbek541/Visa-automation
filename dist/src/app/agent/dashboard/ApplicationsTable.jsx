"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsTable = ApplicationsTable;
const table_1 = require("@/components/ui/table");
const prisma_1 = __importDefault(require("@/lib/prisma"));
const badge_1 = require("@/components/ui/badge"); // Установим позже
const RunAutomationButton_1 = require("./RunAutomationButton");
// Функция для получения цвета бейджа в зависимости от статуса
const getBadgeVariant = (status) => {
    switch (status) {
        case 'DRAFT': return 'secondary';
        case 'PENDING': return 'default';
        case 'COMPLETED': return 'success';
        case 'FAILED': return 'destructive';
        default: return 'outline';
    }
};
async function ApplicationsTable() {
    // Здесь мы могли бы фильтровать по ID компании агента, но для MVP покажем все
    const applications = await prisma_1.default.application.findMany({
        include: {
            client: true, // Включаем данные связанного клиента
        },
        orderBy: {
            createdAt: 'desc', // Сортируем по дате, новые вверху
        },
    });
    return (<div className="border rounded-lg">
        <table_1.Table>
        <table_1.TableHeader>
            <table_1.TableRow>
            <table_1.TableHead>Client Name</table_1.TableHead>
            <table_1.TableHead>Access Code</table_1.TableHead>
            <table_1.TableHead>Status</table_1.TableHead>
            <table_1.TableHead>Created At</table_1.TableHead>
            <table_1.TableHead className="text-right">Actions</table_1.TableHead>
            </table_1.TableRow>
        </table_1.TableHeader>
        <table_1.TableBody>
            {applications.map((app) => (<table_1.TableRow key={app.id}>
                <table_1.TableCell className="font-medium">{app.client.fullName}</table_1.TableCell>
                <table_1.TableCell>{app.accessCode}</table_1.TableCell>
                <table_1.TableCell>
                    <badge_1.Badge variant={getBadgeVariant(app.status)}>{app.status}</badge_1.Badge>
                </table_1.TableCell>
                <table_1.TableCell>{new Date(app.createdAt).toLocaleDateString()}</table_1.TableCell>
                <table_1.TableCell className="text-right">
                  {/* ВОТ ЗДЕСЬ МЫ ВСТАВЛЯЕМ НАШУ КНОПКУ */}
                  <RunAutomationButton_1.RunAutomationButton applicationId={app.id} status={app.status}/>
                  {/* Здесь также можно добавить кнопку для просмотра/редактирования */}
                </table_1.TableCell>
            </table_1.TableRow>))}
        </table_1.TableBody>
        </table_1.Table>
    </div>);
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardPage;
const next_auth_1 = require("next-auth");
const route_1 = require("@/app/api/auth/[...nextauth]/route");
const navigation_1 = require("next/navigation");
const button_1 = require("@/components/ui/button");
const link_1 = __importDefault(require("next/link"));
const CreateClientForm_1 = require("./CreateClientForm"); // Импорт формы
const ApplicationsTable_1 = require("./ApplicationsTable"); // Импорт таблицы
const react_1 = require("react");
async function DashboardPage() {
    var _a;
    const session = await (0, next_auth_1.getServerSession)(route_1.authOptions);
    if (!session) {
        (0, navigation_1.redirect)('/agent/login');
    }
    return (<div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold">Agent Dashboard</h1>
            <p className="text-gray-500">Welcome, {(_a = session.user) === null || _a === void 0 ? void 0 : _a.email}</p>
        </div>
        <div className="flex items-center gap-4">
            <CreateClientForm_1.CreateClientForm /> {/* Кнопка "+ New Application" */}
            <link_1.default href="/api/auth/signout">
                <button_1.Button variant="outline">Sign Out</button_1.Button>
            </link_1.default>
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Client Applications</h2>
        {/* Suspense для плавной загрузки таблицы */}
        <react_1.Suspense fallback={<p>Loading applications...</p>}>
          <ApplicationsTable_1.ApplicationsTable />
        </react_1.Suspense>
      </div>
    </div>);
}

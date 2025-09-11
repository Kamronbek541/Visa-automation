"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginPage;
const react_1 = require("react");
const react_2 = require("next-auth/react");
const navigation_1 = require("next/navigation");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
function LoginPage() {
    const [email, setEmail] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)('');
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const router = (0, navigation_1.useRouter)();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const result = await (0, react_2.signIn)('credentials', {
                redirect: false, // Мы сами будем управлять перенаправлением
                email,
                password,
            });
            if (result === null || result === void 0 ? void 0 : result.error) {
                setError('Invalid email or password.');
                setIsLoading(false);
            }
            else {
                // Успешный вход, перенаправляем на дашборд
                router.push('/agent/dashboard');
            }
        }
        catch (err) {
            setError('An unexpected error occurred.');
            setIsLoading(false);
        }
    };
    return (<div className="flex items-center justify-center min-h-screen bg-gray-100">
      <card_1.Card className="w-full max-w-sm">
        <card_1.CardHeader>
          <card_1.CardTitle className="text-2xl">Agent Login</card_1.CardTitle>
          <card_1.CardDescription>Enter your credentials to access the dashboard.</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="email">Email</label_1.Label>
              <input_1.Input id="email" type="email" placeholder="agent@travel.com" required value={email} onChange={(e) => setEmail(e.target.value)}/>
            </div>
            <div className="space-y-2">
              <label_1.Label htmlFor="password">Password</label_1.Label>
              <input_1.Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}/>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button_1.Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button_1.Button>
          </form>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}

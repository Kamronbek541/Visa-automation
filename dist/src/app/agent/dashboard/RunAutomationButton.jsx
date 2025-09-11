"use strict";
// src/app/agent/dashboard/RunAutomationButton.tsx
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunAutomationButton = RunAutomationButton;
const button_1 = require("@/components/ui/button");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
function RunAutomationButton({ applicationId, status }) {
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const router = (0, navigation_1.useRouter)();
    // Кнопка будет активна только для статуса PENDING
    if (status !== 'PENDING') {
        return null; // Не рендерим кнопку для других статусов
    }
    const handleRun = async () => {
        setIsLoading(true);
        const response = await fetch('/api/agent/run-automation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId }),
        });
        if (response.ok) {
            alert('Automation process started! The status will update shortly.');
            // Обновляем страницу, чтобы увидеть новый статус "PROCESSING"
            router.refresh();
        }
        else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message || 'Failed to start automation.'}`);
        }
        setIsLoading(false);
    };
    return (<button_1.Button size="sm" onClick={handleRun} disabled={isLoading}>
      {isLoading ? 'Starting...' : 'Run Automation'}
    </button_1.Button>);
}

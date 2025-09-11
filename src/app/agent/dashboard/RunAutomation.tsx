// src/app/agent/dashboard/RunAutomationButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type RunAutomationButtonProps = {
  applicationId: string;
  status: string;
};

export function RunAutomationButton({ applicationId, status }: RunAutomationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
    } else {
      const errorData = await response.json();
      alert(`Error: ${errorData.message || 'Failed to start automation.'}`);
    }

    setIsLoading(false);
  };

  return (
    <Button size="sm" onClick={handleRun} disabled={isLoading}>
      {isLoading ? 'Starting...' : 'Run Automation'}
    </Button>
  );
}

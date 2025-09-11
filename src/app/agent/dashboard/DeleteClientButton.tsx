// src/app/agent/dashboard/DeleteClientButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { deleteClientAndApplications } from './actions'; // Импортируем наше серверное действие

type DeleteClientButtonProps = {
  clientId: string;
  clientName: string;
};

export function DeleteClientButton({ clientId, clientName }: DeleteClientButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    // Запрашиваем подтверждение перед удалением
    const isConfirmed = window.confirm(
      `Are you sure you want to delete client "${clientName}" and all their applications? This action cannot be undone.`
    );

    if (isConfirmed) {
      setIsLoading(true);
      await deleteClientAndApplications(clientId);
      // Нам не нужно перезагружать страницу, `revalidatePath` в action сделает это за нас.
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="destructive" // Красный цвет для опасного действия
      size="sm"
      onClick={handleDelete}
      disabled={isLoading}
    >
      {isLoading ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
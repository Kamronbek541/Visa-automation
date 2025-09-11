'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Эта функция будет нашим Server Action
import { createClientAndApplication } from './actions';

export function CreateClientForm() {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async () => {
    if (!fullName) {
      setError('Full name is required.');
      return;
    }
    setIsLoading(true);
    setError('');

    const result = await createClientAndApplication(fullName);

    if (result.success) {
      // Успешно! Закрываем окно.
      // Перезагрузка страницы для обновления списка - самый простой способ для MVP
      window.location.reload();
      setOpen(false);
    } else {
      setError(result.message || 'Failed to create client.');
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ New Application</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Application</DialogTitle>
          <DialogDescription>
            Enter the client's full name. An application with a unique access code will be generated.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Full Name
            </Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Aziz Aliev"
            />
          </div>
          {error && <p className="col-span-4 text-sm text-red-600 text-center">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Code'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
// src/lib/hooks/useAutosave.ts
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

export function useAutosave(storageKey: string) {
  const { watch, reset } = useFormContext();

  // Загрузка данных из localStorage при первой загрузке
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        reset(parsedData, { keepDefaultValues: true }); // Мягко обновляем форму
        console.log('Form data restored from autosave.');
      } catch (e) {
        console.error('Failed to parse autosaved data.', e);
      }
    }
  }, [reset, storageKey]);

  // Отслеживание изменений и сохранение в localStorage
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem(storageKey, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch, storageKey]);
}
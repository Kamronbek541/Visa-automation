import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ДОБАВЬТЕ ЭТУ ФУНКЦИЮ
/**
 * Фильтрует значение ввода, оставляя только символы, соответствующие регулярному выражению.
 * @param value - Текущее значение из поля ввода.
 * @param regex - Регулярное выражение для проверки символов.
 * @returns Отфильтрованная строка.
 */
export const filterInput = (value: string, regex: RegExp): string => {
  return value.split('').filter(char => regex.test(char)).join('');
};
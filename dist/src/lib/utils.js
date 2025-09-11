"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterInput = void 0;
exports.cn = cn;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
// ДОБАВЬТЕ ЭТУ ФУНКЦИЮ
/**
 * Фильтрует значение ввода, оставляя только символы, соответствующие регулярному выражению.
 * @param value - Текущее значение из поля ввода.
 * @param regex - Регулярное выражение для проверки символов.
 * @returns Отфильтрованная строка.
 */
const filterInput = (value, regex) => {
    return value.split('').filter(char => regex.test(char)).join('');
};
exports.filterInput = filterInput;

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOrdinalSuffix(day: number): string {
  const lastDigit = day % 10;
  const lastTwoDigits = day % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return 'st';
  }
  if (lastDigit === 2 && lastTwoDigits !== 12) {
    return 'nd';
  }
  if (lastDigit === 3 && lastTwoDigits !== 13) {
    return 'rd';
  }
  return 'th';
}

export function formatDateWithOrdinal(date: Date): string {
  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);
  return format(date, `MMMM d'${suffix}', yyyy`);
}

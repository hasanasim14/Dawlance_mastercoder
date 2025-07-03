import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to get the current month and year
export const getNextMonthAndYear = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let nextMonth = currentMonth + 1;
  let nextYear = currentYear;

  if (nextMonth > 11) {
    nextMonth = 0;
    nextYear = currentYear + 1;
  }

  const monthString = String(nextMonth + 1).padStart(2, "0");
  const yearString = String(nextYear);

  return { month: monthString, year: yearString };
};

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to get the current month and year
export const getNextMonthAndYear = (type: string) => {
  const now = new Date();
  let baseMonth = now.getMonth();
  const baseYear = now.getFullYear();

  // If today is the 15th or later, consider the "current" month as next month
  if (now.getDate() >= 15) {
    baseMonth += 1;
  }

  let offset = 1; // default
  if (type === "RFC" || type === "offering") offset = 4;
  else if (type === "uploads") offset = -1;

  const next = new Date(baseYear, baseMonth + offset, 1);

  return {
    month: String(next.getMonth() + 1).padStart(2, "0"),
    year: String(next.getFullYear()),
  };
};

// months for select dropdown
export const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();
export const years = Array.from({ length: 10 }, (_, i) => ({
  value: (currentYear - 5 + i).toString(),
  label: (currentYear - 5 + i).toString(),
}));

// get full month names
export const getFullMonthName = (monthNumber: string) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const index = parseInt(monthNumber, 10) - 1;
  return monthNames[index] || monthNumber;
};

export const startServerAPI = async () => {
  try {
    await fetch("http://10.92.0.77:3295");
  } catch (err) {
    console.error("API call failed:", err);
  }
};

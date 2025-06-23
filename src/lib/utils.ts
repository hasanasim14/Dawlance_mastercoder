import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const branches = [
  { label: "Sales Branch All", value: "all" },
  { label: "Sales Branch F.B.A area", value: "fba_area" },
  { label: "Sales Branch SDR", value: "sdr" },
  { label: "Sales Branch Hyderabad", value: "hyderabad" },
  { label: "Sales Branch Multan", value: "multan" },
  { label: "Sales Branch Bahawalpur", value: "bahawalpur" },
  { label: "Sales Branch Rahim Yar Khan", value: "rahim_yar_khan" },
  { label: "Sales Branch Sukkur", value: "sukkur" },
  { label: "Sales Branch Gujranwala", value: "gujranwala" },
  { label: "Sales Branch Lahore suburb", value: "lahore_suburb" },
  { label: "Sales Branch Lahore main", value: "lahore_main" },
  { label: "Sales Branch Faisalabad", value: "faisalabad" },
  { label: "Sales Branch Sahiwal", value: "sahiwal" },
  { label: "Sales Branch Rawalpindi", value: "rawalpindi" },
  { label: "Sales Branch Gujrat", value: "gujrat" },
  { label: "Sales Branch Sialkot", value: "sialkot" },
  { label: "Sales Branch Peshawar", value: "peshawar" },
  { label: "Sales Branch Hasanabdal", value: "hasanabdal" },
];

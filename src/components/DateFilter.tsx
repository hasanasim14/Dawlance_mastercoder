"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface DateFilterProps {
  selectedMonth: string;
  selectedYear: string;
  setSelectedMonth: (value: string) => void;
  setSelectedYear: (value: string) => void;
}

export default function DateFilter({
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
}: DateFilterProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(Number(selectedYear) || currentYear);
  const [open, setOpen] = useState(false);

  const normalizedMonth = selectedMonth ? Number(selectedMonth) - 1 : undefined;

  const handleSelect = (monthIndex: number) => {
    const formattedMonth = (monthIndex + 1).toString().padStart(2, "0");
    setSelectedMonth(formattedMonth);
    setSelectedYear(year.toString());
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[215px] justify-between">
          {normalizedMonth !== undefined && selectedYear
            ? `${months[normalizedMonth]} ${selectedYear}`
            : "Select Month & Year"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[215px]">
        <div className="flex items-center justify-between mb-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setYear((y) => y - 1)}
          >
            <ChevronLeft />
          </Button>
          <span className="font-medium">{year}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setYear((y) => y + 1)}
          >
            <ChevronRight />
          </Button>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-3 gap-2">
          {months.map((m, i) => (
            <Button
              key={m}
              size="sm"
              variant={
                normalizedMonth === i && Number(selectedYear) === year
                  ? "default"
                  : "outline"
              }
              onClick={() => handleSelect(i)}
            >
              {m}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

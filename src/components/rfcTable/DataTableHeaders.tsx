"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save, Send, Loader2, FilterX } from "lucide-react";
import type { RowDataType } from "@/lib/types";

interface BranchOption {
  salesOffice: string;
  salesBranch: string;
}

interface HeadersProps {
  onPost: (
    branch: string,
    month: string,
    year: string,
    data: RowDataType[]
  ) => Promise<void>;
  onSave: (
    branch: string,
    month: string,
    year: string,
    changedData: Array<{ material: string; rfc: string }>
  ) => Promise<void>;
  onFetchData: (
    branch: string,
    month: string,
    year: string,
    filters?: Record<string, string[]>
  ) => Promise<void>;
  isSaving?: boolean;
  isPosting?: boolean;
  rowData: RowDataType[];
  editedValues: Record<number, string>;
  modifiedRows: Set<number>;
  rfcColumnKey?: string;
  columnFilters?: Record<string, string[]>;
}

export const RFCTableHeaders: React.FC<HeadersProps> = ({
  onPost,
  onSave,
  onFetchData,
  isSaving = false,
  isPosting = false,
  rowData,
  editedValues,
  modifiedRows,
  rfcColumnKey,
  columnFilters = {},
}) => {
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Generate years array (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Months array
  const months = [
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

  // Function to get next month and year
  const getNextMonthAndYear = () => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-based (0 = January)
    const currentYear = now.getFullYear();

    let nextMonth = currentMonth + 1; // Add 1 for next month
    let nextYear = currentYear;

    // If current month is December (11), next month should be January (0) of next year
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear = currentYear + 1;
    }

    // Convert to 1-based month for display (01-12)
    const monthString = String(nextMonth + 1).padStart(2, "0");
    const yearString = String(nextYear);

    return { month: monthString, year: yearString };
  };

  // Set default values on component mount
  useEffect(() => {
    const { month, year } = getNextMonthAndYear();
    setSelectedMonth(month);
    setSelectedYear(year);
  }, []);

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/branches`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();
        // Transform the data to include both Sales Office and Sales Branch
        const branchOptions: BranchOption[] = data.data.map((branch: any) => ({
          salesOffice: branch["Sales Office"],
          salesBranch: branch["Sales Branch"] || branch["Sales Office"],
        }));

        setBranches(branchOptions);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, []);

  // Fetch data when selections change (with debouncing) - but NOT when filters change
  useEffect(() => {
    // Clear existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set new timeout - removed columnFilters from dependency
    if (selectedBranch && selectedMonth && selectedYear) {
      const timeout = setTimeout(() => {
        onFetchData(selectedBranch, selectedMonth, selectedYear); // Don't pass filters here
      }, 500); // 500ms delay

      setDebounceTimeout(timeout);
    }

    // Cleanup function
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [selectedBranch, selectedMonth, selectedYear, onFetchData]); // Removed columnFilters

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, []);

  // Get current value for a cell (edited value or original)
  const getCellValue = (rowIndex: number, originalValue: any) => {
    return editedValues[rowIndex] !== undefined
      ? editedValues[rowIndex]
      : String(originalValue ?? "");
  };

  // Validate if all RFC values are filled for POST
  const validateAllRFCFilled = () => {
    if (!rfcColumnKey) return false;

    return rowData.every((row, index) => {
      const currentValue = getCellValue(index, row[rfcColumnKey]);
      return (
        currentValue !== "" &&
        currentValue !== null &&
        currentValue !== undefined
      );
    });
  };

  // Get changed records for SAVE
  const getChangedRecords = () => {
    if (!rfcColumnKey) return [];

    const changedRecords: Array<{ material: string; rfc: string }> = [];

    modifiedRows.forEach((rowIndex) => {
      const row = rowData[rowIndex];
      const editedValue = editedValues[rowIndex];

      if (
        editedValue !== undefined &&
        editedValue !== "" &&
        editedValue !== null
      ) {
        changedRecords.push({
          material: String(row["Material"] || ""),
          rfc: editedValue,
        });
      }
    });

    return changedRecords;
  };

  // Check if save is allowed (has valid changes)
  const canSave = () => {
    const changedRecords = getChangedRecords();
    return changedRecords.length > 0;
  };

  // Check if there are active filters
  const hasActiveFilters = () => {
    return Object.values(columnFilters).some((filters) => filters.length > 0);
  };

  // Get total number of active filters
  const getActiveFilterCount = () => {
    return Object.values(columnFilters).reduce(
      (total, filters) => total + filters.length,
      0
    );
  };

  const handlePost = async () => {
    if (selectedBranch && selectedMonth && selectedYear) {
      if (!validateAllRFCFilled()) {
        alert(
          "All RFC values must be filled before posting. You can use 0 but not leave any field empty."
        );
        return;
      }

      // Create updated data with edited values
      const updatedData = rowData.map((row, index) => {
        if (rfcColumnKey && editedValues[index] !== undefined) {
          return {
            ...row,
            [rfcColumnKey]: editedValues[index],
          };
        }
        return row;
      });

      await onPost(selectedBranch, selectedMonth, selectedYear, updatedData);
    }
  };

  const handleSave = async () => {
    if (selectedBranch && selectedMonth && selectedYear) {
      if (!canSave()) {
        alert("No valid changes to save. Please edit some RFC values first.");
        return;
      }

      const changedRecords = getChangedRecords();
      await onSave(selectedBranch, selectedMonth, selectedYear, changedRecords);
    }
  };

  const isFormValid = selectedBranch && selectedMonth && selectedYear;

  return (
    <div className="flex items-center gap-4 p-4 justify-between border-b bg-background/50 flex-shrink-0">
      <div className="flex items-center gap-4">
        <h3 className="font-semibold">Branch RFC</h3>

        {/* Active Filters Indicator */}
        {hasActiveFilters() && (
          <div className="flex items-center gap-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 rounded-md text-sm">
            <FilterX className="w-3 h-3 text-blue-600" />
            <span className="text-blue-600 font-medium">
              {getActiveFilterCount()} filter
              {getActiveFilterCount() !== 1 ? "s" : ""} active
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Branch Select */}
        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
          <SelectTrigger className="w-[280px] min-w-[200px]">
            <SelectValue placeholder="Select a Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {branches?.map((branch) => (
                <SelectItem key={branch.salesOffice} value={branch.salesOffice}>
                  {branch.salesBranch}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Month Select */}
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Year Select */}
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-4">
          <Button
            onClick={handleSave}
            disabled={!isFormValid || !canSave() || isSaving || isPosting}
            variant="outline"
            size="sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save ({modifiedRows.size})
              </>
            )}
          </Button>

          <Button
            onClick={handlePost}
            disabled={
              !isFormValid || !validateAllRFCFilled() || isSaving || isPosting
            }
            size="sm"
          >
            {isPosting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Post
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

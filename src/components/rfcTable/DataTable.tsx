"use client";

import type React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ColumnConfig, RowDataType } from "@/lib/types";
import { useEffect, useState } from "react";
import { Save, Send, Loader2 } from "lucide-react";

interface DataTableProps {
  rowData: RowDataType[];
  columns: readonly ColumnConfig[];
  onPost: (branch: string, month: string, year: string) => Promise<void>;
  onSave: (branch: string, month: string, year: string) => Promise<void>;
  onFetchData: (branch: string, month: string, year: string) => Promise<void>;
  isLoading?: boolean;
  isSaving?: boolean;
  isPosting?: boolean;
}

export const RFCTable: React.FC<DataTableProps> = ({
  rowData,
  columns,
  onPost,
  onSave,
  onFetchData,
  isLoading = false,
  isSaving = false,
  isPosting = false,
}) => {
  const [branches, setBranches] = useState<string[]>([]);
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
        const branchCodes = data.data.map(
          (branch: any) => branch["Sales Office"]
        );
        setBranches(branchCodes);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, []);

  // Fetch data when selections change (with debouncing)
  useEffect(() => {
    // Clear existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set new timeout
    if (selectedBranch && selectedMonth && selectedYear) {
      const timeout = setTimeout(() => {
        onFetchData(selectedBranch, selectedMonth, selectedYear);
      }, 500); // 500ms delay

      setDebounceTimeout(timeout);
    }

    // Cleanup function
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [selectedBranch, selectedMonth, selectedYear, onFetchData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, []);

  // Helper function to determine column widths based on content
  const getColumnWidth = (columnKey: string): string => {
    switch (columnKey) {
      case "Branch":
        return "180px";
      case "Material":
        return "120px";
      case "Material Description":
        return "250px";
      case "Product":
        return "150px";
      case "Last RFC":
        return "100px";
      default:
        // For dynamic columns (Sales, RFC, etc.)
        if (columnKey.includes("Sales")) {
          return "120px";
        }
        if (columnKey.includes("RFC")) {
          return "120px";
        }
        if (columnKey.includes("YTD")) {
          return "120px";
        }
        return "150px";
    }
  };

  const handlePost = async () => {
    if (selectedBranch && selectedMonth && selectedYear) {
      await onPost(selectedBranch, selectedMonth, selectedYear);
    }
  };

  const handleSave = async () => {
    if (selectedBranch && selectedMonth && selectedYear) {
      await onSave(selectedBranch, selectedMonth, selectedYear);
    }
  };

  const isFormValid = selectedBranch && selectedMonth && selectedYear;

  return (
    <div className="rounded-lg border bg-card shadow-sm h-full w-full flex flex-col overflow-hidden">
      {/* Header with controls */}
      <div className="flex items-center gap-4 p-4 justify-between border-b bg-background/50 flex-shrink-0">
        <h3 className="font-semibold">Branch RFC</h3>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Branch Select */}
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[280px] min-w-[200px]">
              <SelectValue placeholder="Select a Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {branches?.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
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
              disabled={!isFormValid || isSaving || isPosting}
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
                  Save
                </>
              )}
            </Button>

            <Button
              onClick={handlePost}
              disabled={!isFormValid || isSaving || isPosting}
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

      {/* Table container with horizontal scroll */}
      <div className="flex-1 overflow-hidden">
        <div className="w-full h-full overflow-auto">
          <div className="min-w-max">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className="select-none whitespace-nowrap bg-background border-b px-4 py-3"
                      style={{ minWidth: getColumnWidth(column.key) }}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : rowData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No data available. Please select branch, month, and year
                      to view RFC data.
                    </TableCell>
                  </TableRow>
                ) : (
                  rowData.map((row, rowIndex) => (
                    <TableRow key={rowIndex} className="hover:bg-muted/50">
                      {columns.map((column) => (
                        <TableCell
                          key={column.key}
                          className="whitespace-nowrap px-4 py-3"
                          style={{ minWidth: getColumnWidth(column.key) }}
                          title={String(row[column.key] ?? "")}
                        >
                          <div className="truncate max-w-[200px]">
                            {String(row[column.key] ?? "")}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

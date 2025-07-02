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
import { Input } from "@/components/ui/input";
import type { ColumnConfig, RowDataType } from "@/lib/types";
import { useEffect, useState } from "react";
import { Save, Send, Loader2, Edit3 } from "lucide-react";

interface DataTableProps {
  rowData: RowDataType[];
  columns: readonly ColumnConfig[];
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

  // State for tracking edited values and which rows have been modified
  const [editedValues, setEditedValues] = useState<Record<number, string>>({});
  const [modifiedRows, setModifiedRows] = useState<Set<number>>(new Set());
  const [editingCell, setEditingCell] = useState<number | null>(null);

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

  // Reset edited values when data changes
  useEffect(() => {
    setEditedValues({});
    setModifiedRows(new Set());
    setEditingCell(null);
  }, [rowData]);

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // Get the RFC column (last column)
  const getRFCColumn = () => {
    return columns.find(
      (col) => col.key.includes("RFC") && !col.key.includes("Last")
    );
  };

  // Handle cell value change
  const handleCellChange = (rowIndex: number, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [rowIndex]: value,
    }));
    setModifiedRows((prev) => new Set([...prev, rowIndex]));
  };

  // Handle cell edit start
  const handleCellEdit = (rowIndex: number) => {
    setEditingCell(rowIndex);
  };

  // Handle cell edit end
  const handleCellBlur = () => {
    setEditingCell(null);
  };

  // Get current value for a cell (edited value or original)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getCellValue = (rowIndex: number, originalValue: any) => {
    return editedValues[rowIndex] !== undefined
      ? editedValues[rowIndex]
      : String(originalValue ?? "");
  };

  // Validate if all RFC values are filled for POST
  const validateAllRFCFilled = () => {
    const rfcColumn = getRFCColumn();
    if (!rfcColumn) return false;

    return rowData.every((row, index) => {
      const currentValue = getCellValue(index, row[rfcColumn.key]);
      return (
        currentValue !== "" &&
        currentValue !== null &&
        currentValue !== undefined
      );
    });
  };

  // Get changed records for SAVE
  const getChangedRecords = () => {
    const rfcColumn = getRFCColumn();
    if (!rfcColumn) return [];

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
        const rfcColumn = getRFCColumn();
        if (rfcColumn && editedValues[index] !== undefined) {
          return {
            ...row,
            [rfcColumn.key]: editedValues[index],
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

      {/* Table container with horizontal scroll */}
      <div className="flex-1 overflow-hidden">
        <div className="w-full h-full overflow-auto">
          <div className="min-w-max">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow>
                  {columns.map((column, colIndex) => (
                    <TableHead
                      key={column.key}
                      className="select-none whitespace-nowrap bg-background border-b px-4 py-3"
                      style={{ minWidth: getColumnWidth(column.key) }}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {colIndex === columns.length - 1 &&
                          column.key.includes("RFC") && (
                            <Edit3 className="w-3 h-3 text-muted-foreground" />
                          )}
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
                    <TableRow
                      key={rowIndex}
                      className={`hover:bg-muted/50 ${
                        modifiedRows.has(rowIndex)
                          ? "bg-blue-50 dark:bg-blue-950/20"
                          : ""
                      }`}
                    >
                      {columns.map((column, colIndex) => {
                        const isLastColumn = colIndex === columns.length - 1;
                        const isRFCColumn =
                          column.key.includes("RFC") &&
                          !column.key.includes("Last");
                        const isEditable = isLastColumn && isRFCColumn;
                        const cellValue = getCellValue(
                          rowIndex,
                          row[column.key]
                        );
                        const isEditing =
                          editingCell === rowIndex && isEditable;

                        return (
                          <TableCell
                            key={column.key}
                            className="whitespace-nowrap px-4 py-3"
                            style={{ minWidth: getColumnWidth(column.key) }}
                            title={String(row[column.key] ?? "")}
                          >
                            {isEditable ? (
                              isEditing ? (
                                <Input
                                  type="number"
                                  value={cellValue}
                                  onChange={(e) =>
                                    handleCellChange(rowIndex, e.target.value)
                                  }
                                  onBlur={handleCellBlur}
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" ||
                                      e.key === "Escape"
                                    ) {
                                      handleCellBlur();
                                    }
                                  }}
                                  className="w-full h-8 text-sm"
                                  autoFocus
                                  placeholder="Enter RFC value"
                                />
                              ) : (
                                <div
                                  className="cursor-pointer hover:bg-muted/50 p-1 rounded min-h-[24px] flex items-center"
                                  onClick={() => handleCellEdit(rowIndex)}
                                >
                                  <span
                                    className={`truncate max-w-[180px] ${
                                      modifiedRows.has(rowIndex)
                                        ? "font-medium text-blue-600 dark:text-blue-400"
                                        : ""
                                    }`}
                                  >
                                    {cellValue || "Click to edit"}
                                  </span>
                                  {!cellValue && (
                                    <Edit3 className="w-3 h-3 ml-1 text-muted-foreground" />
                                  )}
                                </div>
                              )
                            ) : (
                              <div className="truncate max-w-[200px]">
                                {String(row[column.key] ?? "")}
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
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

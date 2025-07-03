"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import type { ColumnConfig, RowDataType } from "@/lib/types";
import { Loader2, Edit3 } from "lucide-react";
import { RFCTableHeaders } from "./DataTableHeaders";
import { ColumnFilter } from "./ColumnFilter";

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
  // Props for filtering
  filterableColumns?: string[];
  columnFilters?: Record<string, string[]>;
  onFilterChange?: (filters: Record<string, string[]>) => void;
  onApplyFilters?: () => void; // Simplified for frontend filtering
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
  filterableColumns = [],
  columnFilters = {},
  onFilterChange,
  onApplyFilters,
}) => {
  // State for tracking edited values and which rows have been modified
  const [editedValues, setEditedValues] = useState<Record<number, string>>({});
  const [modifiedRows, setModifiedRows] = useState<Set<number>>(new Set());
  const [editingCell, setEditingCell] = useState<number | null>(null);

  // Reset edited values when data changes
  useEffect(() => {
    setEditedValues({});
    setModifiedRows(new Set());
    setEditingCell(null);
  }, [rowData]);

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
        return "90px";
      default:
        // For dynamic columns (Sales, RFC, etc.)
        if (columnKey.includes("Sales")) {
          return "120px";
        }
        if (columnKey.includes("RFC")) {
          return "120px";
        }
        if (columnKey.includes("YTD")) {
          return "150px";
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
  const getCellValue = (rowIndex: number, originalValue: any) => {
    return editedValues[rowIndex] !== undefined
      ? editedValues[rowIndex]
      : String(originalValue ?? "");
  };

  // Handle filter change (this just updates local state)
  const handleFilterChange = (columnKey: string, selectedValues: string[]) => {
    if (onFilterChange) {
      const newFilters = {
        ...columnFilters,
        [columnKey]: selectedValues,
      };
      onFilterChange(newFilters);
    }
  };

  // Handle apply filter (this triggers frontend filtering)
  const handleApplyFilter = () => {
    if (onApplyFilters) {
      onApplyFilters();
    }
  };

  const rfcColumn = getRFCColumn();

  return (
    <div className="rounded-lg border bg-card shadow-sm h-full w-full flex flex-col overflow-hidden">
      {/* Header with controls */}
      <RFCTableHeaders
        onPost={onPost}
        onSave={onSave}
        onFetchData={onFetchData}
        isSaving={isSaving}
        isPosting={isPosting}
        rowData={rowData}
        editedValues={editedValues}
        modifiedRows={modifiedRows}
        rfcColumnKey={rfcColumn?.key}
        columnFilters={columnFilters}
      />

      {/* Table container with proper sticky headers */}
      <div className="flex-1 overflow-hidden relative">
        <div className="w-full h-full overflow-auto">
          <Table className="relative">
            <TableHeader className="sticky top-0 z-20 bg-background shadow-sm">
              <TableRow className="border-b">
                {columns.map((column, colIndex) => {
                  const isFilterable = filterableColumns.includes(column.key);
                  const hasActiveFilter = columnFilters[column.key]?.length > 0;

                  return (
                    <TableHead
                      key={column.key}
                      className="select-none whitespace-nowrap bg-background border-b px-4 py-3 font-semibold"
                      style={{ minWidth: getColumnWidth(column.key) }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {column.label}
                          {colIndex === columns.length - 1 &&
                            column.key.includes("RFC") && (
                              <Edit3 className="w-3 h-3 text-muted-foreground" />
                            )}
                          {hasActiveFilter && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </div>

                        {isFilterable && (
                          <ColumnFilter
                            columnKey={column.key}
                            columnLabel={column.label}
                            data={rowData}
                            selectedFilters={columnFilters[column.key] || []}
                            onFilterChange={handleFilterChange}
                            onApplyFilter={handleApplyFilter}
                            allFilters={columnFilters}
                          />
                        )}
                      </div>
                    </TableHead>
                  );
                })}
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
                    No data available. Please select branch, month, and year to
                    view RFC data.
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

                      const cellValue = getCellValue(rowIndex, row[column.key]);
                      const isEditing = editingCell === rowIndex && isEditable;

                      return (
                        <TableCell
                          key={column.key}
                          className="whitespace-nowrap px-4 py-3 border-b"
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
                                  if (e.key === "Enter" || e.key === "Escape") {
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
  );
};

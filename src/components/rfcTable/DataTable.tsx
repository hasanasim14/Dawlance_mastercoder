"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ColumnConfig, RowDataType } from "@/lib/types";
import { Loader2, Edit3 } from "lucide-react";
import { RFCTableHeaders } from "./DataTableHeaders";
import { ColumnFilter } from "./ColumnFilter";

interface DataTableProps {
  tableName: string;
  rowData: RowDataType[];
  originalRowData: RowDataType[];
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
  filterableColumns?: string[];
  columnFilters?: Record<string, string[]>;
  onFilterChange?: (filters: Record<string, string[]>) => void;
  onApplyFilters?: () => void;
  editedValues?: Record<string, string>;
  onEditedValuesChange?: (editedValues: Record<string, string>) => void;
}

export const RFCTable: React.FC<DataTableProps> = ({
  tableName,
  rowData,
  originalRowData,
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
  editedValues = {},
  onEditedValuesChange,
}) => {
  // State for tracking which rows have been modified (now using unique keys)
  const [modifiedRows, setModifiedRows] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<string | null>(null);

  // Helper function to create unique row key
  const getRowKey = (row: RowDataType): string => {
    // Use Material + Branch as unique identifier (adjust based on your data structure)
    return `${row["Material"] || ""}_${row["Branch"] || ""}`;
  };

  // Reset modified rows when data changes, but preserve edited values
  useEffect(() => {
    setModifiedRows(new Set());
    setEditingCell(null);
  }, [originalRowData]); // Only reset when original data changes, not filtered data

  // Helper function to determine column classes for responsive design
  const getColumnClasses = (columnKey: string): string => {
    const baseClasses = "text-left";

    switch (columnKey) {
      case "Branch":
        return `${baseClasses} min-w-[140px] w-[140px]`; // Always visible
      case "Material":
        return `${baseClasses} min-w-[120px] w-[120px]`; // Always visible
      case "Material Description":
        return `${baseClasses} min-w-[200px] w-[200px] hidden md:table-cell`; // Show on medium and up
      case "Product":
        return `${baseClasses} min-w-[120px] w-[120px] hidden lg:table-cell`; // Show on large and up
      case "Last RFC":
        return `${baseClasses} min-w-[80px] w-[80px] hidden sm:table-cell`; // Show on small and up
      default:
        // For dynamic columns (Sales, RFC, etc.)
        if (columnKey.includes("Sales")) {
          return `${baseClasses} min-w-[100px] w-[100px] hidden lg:table-cell`; // Show on large and up
        }
        if (columnKey.includes("RFC") && !columnKey.includes("Last")) {
          return `${baseClasses} min-w-[120px] w-[120px]`; // Always visible (editable column)
        }
        if (columnKey.includes("YTD")) {
          return `${baseClasses} min-w-[100px] w-[100px] hidden lg:table-cell`; // Show on large and up
        }
        return `${baseClasses} min-w-[100px] w-[100px] hidden md:table-cell`; // Default: show on medium and up
    }
  };

  // Get the RFC column (last column)
  const getRFCColumn = () => {
    return columns.find(
      (col) => col.key.includes("RFC") && !col.key.includes("Last")
    );
  };

  // Handle cell value change
  const handleCellChange = (row: RowDataType, value: string) => {
    const rowKey = getRowKey(row);

    const newEditedValues = {
      ...editedValues,
      [rowKey]: value,
    };

    if (onEditedValuesChange) {
      onEditedValuesChange(newEditedValues);
    }

    setModifiedRows((prev) => new Set([...prev, rowKey]));
  };

  // Handle cell edit start
  const handleCellEdit = (row: RowDataType) => {
    const rowKey = getRowKey(row);
    setEditingCell(rowKey);
  };

  // Handle cell edit end
  const handleCellBlur = () => {
    setEditingCell(null);
  };

  // Get current value for a cell (edited value or original)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getCellValue = (row: RowDataType, originalValue: any) => {
    const rowKey = getRowKey(row);
    const editedValue = editedValues[rowKey];
    const finalValue =
      editedValue !== undefined ? editedValue : String(originalValue ?? "");

    return finalValue;
  };

  // Check if a row has been modified
  const isRowModified = (row: RowDataType): boolean => {
    const rowKey = getRowKey(row);
    return modifiedRows.has(rowKey);
  };

  // Check if a cell is being edited
  const isCellEditing = (row: RowDataType): boolean => {
    const rowKey = getRowKey(row);
    return editingCell === rowKey;
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
    <div className="rounded-lg border bg-card shadow-sm h-full w-full flex flex-col">
      {/* Header with controls */}
      <RFCTableHeaders
        tableName={tableName}
        onPost={onPost}
        onSave={onSave}
        onFetchData={onFetchData}
        isSaving={isSaving}
        isPosting={isPosting}
        rowData={rowData}
        originalRowData={originalRowData}
        editedValues={editedValues}
        modifiedRows={modifiedRows}
        rfcColumnKey={rfcColumn?.key}
        columnFilters={columnFilters}
        getRowKey={getRowKey}
      />

      {/* Responsive table container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full w-full overflow-auto">
          <div className="min-w-full">
            <Table className="relative w-full table-fixed">
              <TableHeader className="sticky top-0 z-50 bg-background">
                <TableRow className="hover:bg-transparent border-b shadow-sm">
                  {columns.map((column, colIndex) => {
                    const isFilterable = filterableColumns.includes(column.key);
                    const hasActiveFilter =
                      columnFilters[column.key]?.length > 0;
                    const columnClasses = getColumnClasses(column.key);

                    return (
                      <TableHead
                        key={column.key}
                        className={`${columnClasses} bg-background p-2 font-semibold text-sm`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate">{column.label}</span>
                            {colIndex === columns.length - 1 &&
                              column.key.includes("RFC") && (
                                <Edit3 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              )}
                            {hasActiveFilter && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                            )}
                          </div>

                          {isFilterable && (
                            <div className="flex-shrink-0">
                              <ColumnFilter
                                columnKey={column.key}
                                columnLabel={column.label}
                                data={rowData}
                                selectedFilters={
                                  columnFilters[column.key] || []
                                }
                                onFilterChange={handleFilterChange}
                                onApplyFilter={handleApplyFilter}
                              />
                            </div>
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
                      No data available. Please select branch, month, and year
                      to view RFC data.
                    </TableCell>
                  </TableRow>
                ) : (
                  rowData.map((row) => (
                    <TableRow
                      key={getRowKey(row)}
                      className={`hover:bg-muted/50 ${
                        isRowModified(row)
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
                        const cellValue = getCellValue(row, row[column.key]);
                        const isEditing = isCellEditing(row) && isEditable;
                        const columnClasses = getColumnClasses(column.key);

                        return (
                          <TableCell
                            key={column.key}
                            className={`${columnClasses} p-2 min-h-[48px]`}
                            title={String(row[column.key] ?? "")}
                          >
                            {isEditable ? (
                              isEditing ? (
                                <Input
                                  type="number"
                                  value={cellValue}
                                  onChange={(e) =>
                                    handleCellChange(row, e.target.value)
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
                                  className="cursor-pointer hover:bg-muted/50 p-1 rounded min-h-[24px] flex items-center w-full"
                                  onClick={() => handleCellEdit(row)}
                                >
                                  <span
                                    className={`truncate flex-1 ${
                                      isRowModified(row)
                                        ? "font-medium text-blue-600 dark:text-blue-400"
                                        : ""
                                    }`}
                                  >
                                    {cellValue || "Click to edit"}
                                  </span>
                                  {!cellValue && (
                                    <Edit3 className="w-3 h-3 ml-1 text-muted-foreground flex-shrink-0" />
                                  )}
                                </div>
                              )
                            ) : (
                              <div className="truncate text-sm w-full">
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

      {/* Mobile responsive indicator */}
      <div className="md:hidden p-2 text-xs text-muted-foreground border-t bg-muted/20">
        <div className="flex items-center gap-1">
          <span>📱</span>
          <span>
            Some columns hidden on smaller screens. Scroll horizontally to view
            all data.
          </span>
        </div>
      </div>
    </div>
  );
};

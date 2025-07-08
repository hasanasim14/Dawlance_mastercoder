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
  branchFilter: boolean;
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
    changedData: Array<{ material: string; [key: string]: any }>
  ) => Promise<void>;
  onFetchData: (branch: string, month: string, year: string) => Promise<void>;
  isLoading?: boolean;
  isSaving?: boolean;
  isPosting?: boolean;
  filterableColumns?: string[];
  columnFilters?: Record<string, string[]>;
  onFilterChange?: (filters: Record<string, string[]>) => void;
  onApplyFilters?: () => void;
  editedValues?: Record<string, Record<string, string>>;
  onEditedValuesChange?: (
    editedValues: Record<string, Record<string, string>>
  ) => void;
}

export const RFCTable: React.FC<DataTableProps> = ({
  tableName,
  branchFilter,
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
  // State for tracking which rows have been modified
  const [modifiedRows, setModifiedRows] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<string | null>(null);

  // Helper function to create unique row key
  const getRowKey = (row: RowDataType): string => {
    return `${row["Material"] || ""}_${row["Branch"] || ""}`;
  };

  // Reset modified rows when data changes, but preserve edited values
  useEffect(() => {
    setModifiedRows(new Set());
    setEditingCell(null);
  }, [originalRowData]);

  // Function for responsive designs
  const getColumnClasses = (columnKey: string): string => {
    const baseClasses = "text-left";
    switch (columnKey) {
      case "Branch":
        return `${baseClasses} min-w-[140px] w-[140px]`;
      case "Material":
        return `${baseClasses} min-w-[120px] w-[120px]`;
      case "Material Description":
        return `${baseClasses} min-w-[200px] w-[200px] hidden md:table-cell`;
      case "Product":
        return `${baseClasses} min-w-[120px] w-[120px] hidden lg:table-cell`;
      case "Last RFC":
        return `${baseClasses} min-w-[80px] w-[80px] hidden sm:table-cell`;
      default:
        if (columnKey.includes("Sales")) {
          return `${baseClasses} min-w-[100px] w-[100px] hidden lg:table-cell`;
        }
        if (columnKey.includes("RFC") && !columnKey.includes("Last")) {
          return `${baseClasses} min-w-[120px] w-[120px]`;
        }
        if (columnKey.includes("YTD")) {
          return `${baseClasses} min-w-[100px] w-[100px] hidden lg:table-cell`;
        }
        return `${baseClasses} min-w-[100px] w-[100px] hidden md:table-cell`;
    }
  };

  // Get all RFC columns (excluding "Last RFC")
  const getRFCColumns = () => {
    return columns.filter((col) => {
      const key = col.key;
      // Must contain "RFC" and end with " RFC" (not "Branch RFC" or "Marketing RFC")
      return (
        key.includes("RFC") &&
        key.endsWith(" RFC") &&
        !key.includes("Branch") &&
        !key.includes("Marketing") &&
        !key.includes("Last")
      );
    });
  };

  // Handle cell value change for specific RFC column
  const handleCellChange = (
    row: RowDataType,
    columnKey: string,
    value: string
  ) => {
    const rowKey = getRowKey(row);
    const currentRowEdits = editedValues[rowKey] || {};

    const newEditedValues = {
      ...editedValues,
      [rowKey]: {
        ...currentRowEdits,
        [columnKey]: value,
      },
    };

    if (onEditedValuesChange) {
      onEditedValuesChange(newEditedValues);
    }
    setModifiedRows((prev) => new Set([...prev, rowKey]));
  };

  // Handle cell edit start
  const handleCellEdit = (row: RowDataType, columnKey: string) => {
    const rowKey = getRowKey(row);
    setEditingCell(`${rowKey}_${columnKey}`);
  };

  // Handle cell edit end
  const handleCellBlur = () => {
    setEditingCell(null);
  };

  // Get cell value for specific column
  const getCellValue = (
    row: RowDataType,
    columnKey: string,
    originalValue: any
  ) => {
    const rowKey = getRowKey(row);
    const rowEdits = editedValues[rowKey];
    const editedValue = rowEdits?.[columnKey];
    const finalValue =
      editedValue !== undefined ? editedValue : String(originalValue ?? "");
    return finalValue;
  };

  // Check if a row has been modified
  const isRowModified = (row: RowDataType): boolean => {
    const rowKey = getRowKey(row);
    return modifiedRows.has(rowKey);
  };

  // Check if a specific cell is being edited
  const isCellEditing = (row: RowDataType, columnKey: string): boolean => {
    const rowKey = getRowKey(row);
    return editingCell === `${rowKey}_${columnKey}`;
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

  const rfcColumns = getRFCColumns();

  return (
    <div className="rounded-lg border bg-card shadow-sm h-full w-full flex flex-col">
      <RFCTableHeaders
        tableName={tableName}
        branchFilter={branchFilter}
        onPost={onPost}
        onSave={onSave}
        onFetchData={onFetchData}
        isSaving={isSaving}
        isPosting={isPosting}
        rowData={rowData}
        originalRowData={originalRowData}
        editedValues={editedValues}
        modifiedRows={modifiedRows}
        rfcColumns={rfcColumns}
        columnFilters={columnFilters}
        getRowKey={getRowKey}
        getCellValue={getCellValue}
      />

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
                    const isRFCColumn =
                      column.key.includes("RFC") &&
                      column.key.endsWith(" RFC") &&
                      !column.key.includes("Branch") &&
                      !column.key.includes("Marketing") &&
                      !column.key.includes("Last");

                    return (
                      <TableHead
                        key={column.key}
                        className={`${columnClasses} bg-background p-2 font-semibold text-sm`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate">{column.label}</span>
                            {isRFCColumn && (
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
                        const isRFCColumn =
                          column.key.includes("RFC") &&
                          column.key.endsWith(" RFC") &&
                          !column.key.includes("Branch") &&
                          !column.key.includes("Marketing") &&
                          !column.key.includes("Last");
                        const isEditable = isRFCColumn;
                        const cellValue = getCellValue(
                          row,
                          column.key,
                          row[column.key]
                        );
                        const isEditing =
                          isCellEditing(row, column.key) && isEditable;
                        const columnClasses = getColumnClasses(column.key);

                        return (
                          <TableCell
                            key={column.key}
                            className={`${columnClasses} p-2 min-h-[48px]`}
                            title={String(row[column.key] ?? "")}
                          >
                            {isEditable ? (
                              <Input
                                type="number"
                                value={cellValue}
                                onChange={(e) =>
                                  handleCellChange(
                                    row,
                                    column.key,
                                    e.target.value
                                  )
                                }
                                onBlur={handleCellBlur}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === "Escape") {
                                    handleCellBlur();
                                  }
                                }}
                                className="w-full h-8 text-sm"
                                placeholder="Enter RFC value"
                              />
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
    </div>
  );
};

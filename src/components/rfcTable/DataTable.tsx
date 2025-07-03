"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import type { ColumnConfig, RowDataType } from "@/lib/types";
import { Loader2, Edit3 } from "lucide-react";
import { RFCTableHeaders } from "./DataTableHeaders";
import { ColumnFilter } from "./ColumnFilter";

interface DataTableProps {
  rowData: RowDataType[];
  originalRowData: RowDataType[]; // Add original data for validation
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
  onApplyFilters?: () => void;
  // Add props for edited values management
  editedValues?: Record<string, string>;
  onEditedValuesChange?: (editedValues: Record<string, string>) => void;
}

export const RFCTable: React.FC<DataTableProps> = ({
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

  // Helper function to determine column widths based on content
  const getColumnWidth = (columnKey: string): string => {
    switch (columnKey) {
      case "Branch":
        return "180px";
      case "Material":
        return "140px";
      case "Material Description":
        return "280px";
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
          return "140px";
        }
        if (columnKey.includes("YTD")) {
          return "120px";
        }
        return "120px";
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
    console.log("Cell change:", {
      rowKey,
      value,
      currentEditedValues: editedValues,
    });

    const newEditedValues = {
      ...editedValues,
      [rowKey]: value,
    };

    console.log("New edited values:", newEditedValues);

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
  const getCellValue = (row: RowDataType, originalValue: any) => {
    const rowKey = getRowKey(row);
    const editedValue = editedValues[rowKey];
    const finalValue =
      editedValue !== undefined ? editedValue : String(originalValue ?? "");

    console.log("Getting cell value:", {
      rowKey,
      editedValue,
      originalValue,
      finalValue,
    });

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

  // Add this useEffect after the existing ones
  useEffect(() => {
    console.log("DataTable editedValues changed:", editedValues);
  }, [editedValues]);

  const rfcColumn = getRFCColumn();

  return (
    <div className="rounded-lg border bg-card shadow-sm h-full w-full flex flex-col">
      {/* Header with controls */}
      <RFCTableHeaders
        onPost={onPost}
        onSave={onSave}
        onFetchData={onFetchData}
        isSaving={isSaving}
        isPosting={isPosting}
        rowData={rowData}
        originalRowData={originalRowData} // Pass original data for validation
        editedValues={editedValues}
        modifiedRows={modifiedRows}
        rfcColumnKey={rfcColumn?.key}
        columnFilters={columnFilters}
        getRowKey={getRowKey} // Pass the row key function
      />

      {/* Table container with custom sticky headers */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          {/* Sticky Table Header */}
          <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
            <div
              className="grid"
              style={{
                gridTemplateColumns: columns
                  .map((col) => getColumnWidth(col.key))
                  .join(" "),
              }}
            >
              {columns.map((column, colIndex) => {
                const isFilterable = filterableColumns.includes(column.key);
                const hasActiveFilter = columnFilters[column.key]?.length > 0;

                return (
                  <div
                    key={column.key}
                    className="px-4 py-3 font-semibold text-sm bg-background border-r last:border-r-0 flex items-center justify-between min-h-[48px]"
                  >
                    <div className="flex items-center gap-2">
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
                          selectedFilters={columnFilters[column.key] || []}
                          onFilterChange={handleFilterChange}
                          onApplyFilter={handleApplyFilter}
                          allFilters={columnFilters}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table Body */}
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading data...
                </div>
              </div>
            ) : rowData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No data available. Please select branch, month, and year to view
                RFC data.
              </div>
            ) : (
              rowData.map((row, rowIndex) => (
                <div
                  key={getRowKey(row)} // Use unique key instead of index
                  className={`grid border-b hover:bg-muted/50 ${
                    isRowModified(row) ? "bg-blue-50 dark:bg-blue-950/20" : ""
                  }`}
                  style={{
                    gridTemplateColumns: columns
                      .map((col) => getColumnWidth(col.key))
                      .join(" "),
                  }}
                >
                  {columns.map((column, colIndex) => {
                    const isLastColumn = colIndex === columns.length - 1;
                    const isRFCColumn =
                      column.key.includes("RFC") &&
                      !column.key.includes("Last");
                    const isEditable = isLastColumn && isRFCColumn;

                    const cellValue = getCellValue(row, row[column.key]);
                    const isEditing = isCellEditing(row) && isEditable;

                    return (
                      <div
                        key={column.key}
                        className="px-4 py-3 border-r last:border-r-0 flex items-center min-h-[48px]"
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
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

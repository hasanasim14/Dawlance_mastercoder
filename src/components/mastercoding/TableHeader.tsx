"use client";

import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronUp, ChevronDown } from "lucide-react";
import { ColumnConfig, RowDataType, SortConfig } from "@/lib/types";
// import type {
//   ColumnConfig,
//   RowDataType,
//   SortConfig,
// } from "@/types/master-coding";

interface MasterCodingTableHeaderProps {
  columns: readonly ColumnConfig[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
  sortConfig: SortConfig;
  onSelectAll: (checked: boolean) => void;
  onSort: (key: keyof RowDataType) => void;
}

export function MasterCodingTableHeader({
  columns,
  isAllSelected,
  isIndeterminate,
  sortConfig,
  onSelectAll,
  onSort,
}: MasterCodingTableHeaderProps) {
  return (
    <TableHeader className="sticky top-0 bg-background z-10">
      <TableRow>
        <TableHead className="w-12 sticky left-0 bg-background z-20">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={onSelectAll}
            aria-label="Select all rows"
            className={
              isIndeterminate
                ? "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground opacity-50"
                : ""
            }
          />
        </TableHead>
        {columns.map((column, index) => (
          <TableHead
            key={column.key}
            className={`${
              column.sortable ? "cursor-pointer hover:bg-muted/50" : ""
            } select-none min-w-[150px] ${
              index === 0 ? "sticky left-12 bg-background z-20" : ""
            }`}
            onClick={() =>
              column.sortable && onSort(column.key as keyof RowDataType)
            }
          >
            <div className="flex items-center gap-2">
              {column.label}
              {column.sortable && (
                <div className="flex flex-col">
                  <ChevronUp
                    className={`h-3 w-3 ${
                      sortConfig?.key === column.key &&
                      sortConfig.direction === "asc"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <ChevronDown
                    className={`h-3 w-3 -mt-1 ${
                      sortConfig?.key === column.key &&
                      sortConfig.direction === "desc"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
              )}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

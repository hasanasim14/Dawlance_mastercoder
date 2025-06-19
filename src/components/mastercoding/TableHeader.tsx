"use client";

import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnConfig } from "@/lib/types";

interface MasterCodingTableHeaderProps {
  columns: readonly ColumnConfig[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (checked: boolean) => void;
}

export function MasterCodingTableHeader({
  columns,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
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
            className={`
              select-none min-w-[150px] ${
                index === 0 ? "sticky left-12 bg-background z-20" : ""
              }`}
          >
            <div className="flex items-center gap-2">{column.label}</div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

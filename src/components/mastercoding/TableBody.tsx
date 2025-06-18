"use client";

import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnConfig, RowDataType } from "@/lib/types";
// import type { RowDataType, ColumnConfig } from "@/types/master-coding";

interface MasterCodingTableBodyProps {
  filteredData: RowDataType[];
  columns: readonly ColumnConfig[];
  selectedRows: RowDataType[];
  selectedRowId: number | null;
  onRowSelect: (row: RowDataType, checked: boolean) => void;
  onRowClick: (row: RowDataType) => void;
  loading: boolean;
}

export function MasterCodingTableBody({
  filteredData,
  columns,
  selectedRows,
  selectedRowId,
  onRowSelect,
  onRowClick,
  loading,
}: MasterCodingTableBodyProps) {
  if (filteredData.length === 0 && !loading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columns.length + 1} className="text-center py-8">
            <div className="text-muted-foreground">No data found</div>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {filteredData.map((row) => {
        const isSelected = selectedRows.some(
          (r) => r["Master ID"] === row["Master ID"]
        );
        const isRowSelected = selectedRowId === row["Master ID"];

        return (
          <TableRow
            key={row["Master ID"]}
            className={`cursor-pointer hover:bg-muted/50 ${
              isRowSelected ? "bg-muted" : ""
            }`}
            onClick={() => onRowClick(row)}
          >
            <TableCell
              onClick={(e) => e.stopPropagation()}
              className="sticky left-0 bg-background z-10"
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) =>
                  onRowSelect(row, checked as boolean)
                }
                aria-label={`Select row ${row["Master ID"]}`}
              />
            </TableCell>
            {columns.map((column, index) => (
              <TableCell
                key={column.key}
                className={`max-w-[200px] truncate ${
                  index === 0 ? "sticky left-12 bg-background z-10" : ""
                }`}
              >
                {row[column.key as keyof RowDataType]}
              </TableCell>
            ))}
          </TableRow>
        );
      })}
    </TableBody>
  );
}

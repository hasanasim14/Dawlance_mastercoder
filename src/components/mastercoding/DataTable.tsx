"use client";

import { Table } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
// import { RowDataType } from "@/lib/types";
// import { MasterCodingTableHeader } from "./table-header";
// import { MasterCodingTableBody } from "./table-body";
// import { Pagination } from "./pagination";
// import { TableActions } from "./table-actions";
import type {
  RowDataType,
  SortConfig,
  PaginationData,
  ColumnConfig,
} from "@/lib/types";
import { TableActions } from "./TableActions";
import { MasterCodingTableBody } from "./TableBody";
import { Pagination } from "./Pagination";
import { MasterCodingTableHeader } from "./TableHeader";

interface DataTableProps {
  loading: boolean;
  deleting: boolean;
  filteredData: RowDataType[];
  selectedRows: RowDataType[];
  selectedRowId: number | null;
  sortConfig: SortConfig;
  pagination: PaginationData;
  currentPage: number;
  pageSize: number;
  columns: readonly ColumnConfig[];
  onRowSelect: (row: RowDataType, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onRowClick: (row: RowDataType) => void;
  onSort: (key: keyof RowDataType) => void;
  onPageSizeChange: (newPageSize: string) => void;
  onPageChange: (newPage: number) => void;
  onDeleteClick: () => void;
  onAddClick: () => void;
}

export function DataTable({
  loading,
  deleting,
  filteredData,
  selectedRows,
  selectedRowId,
  sortConfig,
  pagination,
  currentPage,
  pageSize,
  columns,
  onRowSelect,
  onSelectAll,
  onRowClick,
  onSort,
  onPageSizeChange,
  onPageChange,
  onDeleteClick,
  onAddClick,
}: DataTableProps) {
  const isAllSelected =
    filteredData.length > 0 && selectedRows.length === filteredData.length;
  const isIndeterminate =
    selectedRows.length > 0 && selectedRows.length < filteredData.length;

  return (
    <div className="rounded-lg border bg-card shadow-sm flex flex-col h-full w-full overflow-hidden">
      <TableActions
        selectedRowsCount={selectedRows.length}
        deleting={deleting}
        onDeleteClick={onDeleteClick}
        onAddClick={onAddClick}
      />

      {loading ? (
        <div className="flex-1 overflow-hidden">
          {/* Create consistent skeleton rows that match the actual table height */}
          {Array.from({ length: 15 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <>
          {/* Table with horizontal scroll and visible scrollbar */}
          <div className="flex-1 overflow-auto">
            <div
              className="overflow-x-auto h-full"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgb(203 213 225) transparent",
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  height: 8px;
                }
                div::-webkit-scrollbar-track {
                  background: rgb(248 250 252);
                  border-radius: 4px;
                }
                div::-webkit-scrollbar-thumb {
                  background: rgb(203 213 225);
                  border-radius: 4px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: rgb(148 163 184);
                }
              `}</style>
              <Table className="min-w-[100px] h-full">
                <MasterCodingTableHeader
                  columns={columns}
                  isAllSelected={isAllSelected}
                  isIndeterminate={isIndeterminate}
                  sortConfig={sortConfig}
                  onSelectAll={onSelectAll}
                  onSort={onSort}
                />
                <MasterCodingTableBody
                  filteredData={filteredData}
                  columns={columns}
                  selectedRows={selectedRows}
                  selectedRowId={selectedRowId}
                  onRowSelect={onRowSelect}
                  onRowClick={onRowClick}
                  loading={loading}
                />
              </Table>
            </div>
          </div>

          <Pagination
            pagination={pagination}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
}

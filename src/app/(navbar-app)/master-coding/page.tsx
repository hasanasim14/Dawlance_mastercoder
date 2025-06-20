"use client";

import { useEffect, useState } from "react";
import { RightSheet } from "@/components/RightSheet";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type {
  RowDataType,
  PaginationData,
  FieldConfig,
  ColumnConfig,
} from "@/lib/types";
import { DataTable } from "@/components/DataTable";
import {
  transformToApiFormat,
  transformArrayFromApiFormat,
  extractFields,
} from "@/lib/data-transformers";
import SearchComponent from "@/components/SearchComponent";

const MasterCoding = () => {
  const [selectedRow, setSelectedRow] = useState<RowDataType | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<RowDataType[]>([]);
  const [rowData, setRowData] = useState<RowDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Pagination states
  const [pagination, setPagination] = useState<PaginationData>({
    total_records: 0,
    records_per_page: 50,
    page: 1,
    total_pages: 0,
  });
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Define field configuration for the RightSheet
  const fieldConfig: FieldConfig[] = [
    {
      key: "Master ID",
      label: "Master ID",
      type: "number",
      readOnly: true,
    },
    { key: "Product", label: "Product", type: "text", required: true },
    {
      key: "Material",
      label: "Material",
      type: "text",
      required: true,
    },
    {
      key: "Material Description",
      label: "Material Description",
      type: "text",
    },
    {
      key: "Measurement Instrument",
      label: "Measurement Instrument",
      type: "text",
    },
    {
      key: "Colour Similarity",
      label: "Colour Similarity",
      type: "text",
    },
    { key: "Product type", label: "Product Type", type: "text" },
    { key: "Function", label: "Function", type: "text" },
    { key: "Series", label: "Series", type: "text" },
    { key: "Colour", label: "Colour", type: "text" },
    { key: "Key Feature", label: "Key Feature", type: "text" },
  ];

  const columns: readonly ColumnConfig[] = [
    { key: "Master ID", label: "Master ID" },
    { key: "Product", label: "Product" },
    { key: "Material", label: "Material" },
    { key: "Material Description", label: "Material Description" },
    { key: "Measurement Instrument", label: "Measurement Instrument" },
    { key: "Colour Similarity", label: "Colour Similarity" },
    { key: "Product type", label: "Product type" },
    { key: "Function", label: "Function" },
    { key: "Series", label: "Series" },
    { key: "Colour", label: "Colour" },
    { key: "Key Feature", label: "Key Feature" },
  ];

  const fetchMasterData = async (
    searchParams: Record<string, string> = {},
    page = 1,
    recordsPerPage = 50
  ) => {
    setLoading(true);
    try {
      let endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/mastercoding`;

      const queryParams = new URLSearchParams();

      queryParams.append("page", page.toString());
      queryParams.append("limit", recordsPerPage.toString());

      const hasSearchParams = Object.keys(searchParams).length > 0;

      if (hasSearchParams) {
        const apiSearchParams = transformToApiFormat(searchParams);
        Object.entries(apiSearchParams).forEach(([field, value]) => {
          queryParams.append(field, value);
        });
      }

      endpoint = `${endpoint}?${queryParams.toString()}`;

      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      const parsedData = typeof data === "string" ? JSON.parse(data) : data;

      if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
        const transformedData = transformArrayFromApiFormat(
          parsedData.data
        ) as RowDataType[];
        setRowData(transformedData);

        if (parsedData.pagination) {
          setPagination(parsedData.pagination);
        }
      } else {
        console.error("Invalid data structure received:", parsedData);
        setRowData([]);
      }
    } catch (error) {
      console.error("Error fetching data", error);
      setRowData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (
    field: string,
    query: string
  ): Promise<string[]> => {
    if (!query.trim()) return [];

    try {
      const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/mastercoding/distinct/${field}?filt=${query}`;

      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch suggestions: ${res.status}`);
      }

      const data = await res.json();

      if (data && typeof data === "object") {
        const fieldKey = field.toLowerCase().replace(/\s+/g, " ").trim();

        // Try to find the key in the response that matches our field
        const matchingKey = Object.keys(data).find(
          (key) =>
            key.toLowerCase() === fieldKey ||
            fieldKey.includes(key.toLowerCase()) ||
            key.toLowerCase().includes(fieldKey)
        );

        if (matchingKey && Array.isArray(data[matchingKey])) {
          return data[matchingKey];
        }
      }

      return [];
    } catch (error) {
      console.error(`Error fetching suggestions for ${field}:`, error);
      return [];
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    setDeleting(true);
    try {
      const masterIds = extractFields(selectedRows, "Master ID");

      const deletePayload = {
        master_id: masterIds,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/mastercoding/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deletePayload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh data after deletion
      fetchMasterData({}, currentPage, pageSize);

      // Clear selections
      setSelectedRows([]);
      setSelectedRow(null);
      setSelectedRowId(null);
    } catch (error) {
      console.error("Error deleting records:", error);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Pagination handlers
  const handlePageSizeChange = (newPageSize: string) => {
    const size = Number.parseInt(newPageSize);
    setPageSize(size);
    setCurrentPage(1);
    fetchMasterData({}, 1, size);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchMasterData({}, newPage, pageSize);
  };

  useEffect(() => {
    fetchMasterData({}, currentPage, pageSize);
  }, []);

  // Handle search with debouncing
  const handleSearch = (searchParams: Record<string, string>) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchMasterData(searchParams, 1, pageSize);
    }, 500); // 0.5 seconds

    setSearchTimeout(timeout);
  };

  // Handle row selection
  const handleRowSelect = (row: RowDataType, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, row]);
    } else {
      setSelectedRows((prev) =>
        prev.filter((r) => r["Master ID"] !== row["Master ID"])
      );
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows([...rowData]);
    } else {
      setSelectedRows([]);
    }
  };

  // Handle row click
  const handleRowClick = (row: RowDataType) => {
    setIsSheetOpen(true);
    const clickedRowId = row["Master ID"];

    // If clicking the same row, toggle the sheet
    if (selectedRowId === clickedRowId) {
      setSelectedRow(null);
      setSelectedRowId(null);
    } else {
      // Select new row
      setSelectedRow(row);
      setSelectedRowId(clickedRowId);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSave = async (data: Record<string, any>): Promise<void> => {
    try {
      // Transform data to API format before sending
      const apiFormattedData = transformToApiFormat(data);
      const isUpdate = !!selectedRowId;

      const endpoint = isUpdate
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/mastercoding/update/${selectedRowId}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/mastercoding/add`;

      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiFormattedData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setRowData((prevData) =>
        prevData.map((row) =>
          row["Master ID"] === data["Master ID"] ? { ...row, ...data } : row
        )
      );

      // Update selected row data
      setSelectedRow(data as RowDataType);
    } catch (error) {
      console.error("Error saving master coding data:", error);
      throw error;
    }
  };

  // const handleReset = () => {
  //   setSelectedRow(null);
  //   setSelectedRowId(null);
  // };

  const handleAddClick = () => {
    setIsSheetOpen(true);
  };

  const excludedKeys = ["Master ID"];

  const filteredFieldConfig = fieldConfig.filter(
    (field) => !excludedKeys.includes(field.key)
  );

  return (
    <div className="w-full h-[85vh] p-4 overflow-hidden">
      <div className="w-full h-full flex flex-col lg:flex-row gap-4 overflow-hidden">
        <div className="w-full lg:w-[300px] flex-shrink-0 h-full overflow-hidden">
          <div className="h-full overflow-auto">
            <SearchComponent
              fields={columns}
              onSearch={handleSearch}
              fetchSuggestions={fetchSuggestions}
            />
          </div>
        </div>

        <div className="flex-1 h-full overflow-hidden min-w-0">
          <DataTable
            tableName="Master Coding"
            selectionValue="Master ID"
            loading={loading}
            deleting={deleting}
            data={rowData}
            selectedRows={selectedRows}
            selectedRowId={selectedRowId}
            pagination={pagination}
            currentPage={currentPage}
            pageSize={pageSize}
            columns={columns}
            onRowSelect={handleRowSelect}
            onSelectAll={handleSelectAll}
            onRowClick={handleRowClick}
            onPageSizeChange={handlePageSizeChange}
            onPageChange={handlePageChange}
            onDeleteClick={() => setShowDeleteDialog(true)}
            onAddClick={handleAddClick}
          />
        </div>

        <RightSheet
          parent={"mastercoding"}
          selectedRow={selectedRow}
          onReset={() => {
            setSelectedRow(null);
            setIsSheetOpen(false);
          }}
          onSave={handleSave}
          fields={selectedRow ? fieldConfig : filteredFieldConfig}
          title={selectedRow ? "Edit Entry" : "Create New Entry"}
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
        />
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Records"
        description={`Are you sure you want to delete ${
          selectedRows.length
        } record${
          selectedRows.length > 1 ? "s" : ""
        }? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleBulkDelete}
        variant="destructive"
      />
    </div>
  );
};

export default MasterCoding;

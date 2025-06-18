"use client";

import { useEffect, useState } from "react";
import { RightSheet } from "@/components/RightSheet";
import SearchComponent from "@/components/SearchComponent";
// import { DataTable } from "@/components/master-coding/data-table";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  transformToApiFormat,
  transformArrayFromApiFormat,
  extractMasterIds,
} from "@/lib/data-transformers";
import type {
  RowDataType,
  SortConfig,
  FilterConfig,
  PaginationData,
  FieldConfig,
  ColumnConfig,
} from "@/lib/types";
import { DataTable } from "@/components/mastercoding/DataTable";

const MasterCoding = () => {
  const [selectedRow, setSelectedRow] = useState<RowDataType | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<RowDataType[]>([]);
  const [rowData, setRowData] = useState<RowDataType[]>([]);
  const [filteredData, setFilteredData] = useState<RowDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [columnFilters, setColumnFilters] = useState<FilterConfig>({});

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

  // Column definitions
  const columns: readonly ColumnConfig[] = [
    { key: "Master ID", label: "Master ID", sortable: true, filterable: true },
    { key: "Product", label: "Product", sortable: true, filterable: true },
    { key: "Material", label: "Material", sortable: true, filterable: true },
    {
      key: "Material Description",
      label: "Material Description",
      sortable: true,
      filterable: true,
    },
    {
      key: "Measurement Instrument",
      label: "Measurement Instrument",
      sortable: true,
      filterable: true,
    },
    {
      key: "Colour Similarity",
      label: "Colour Similarity",
      sortable: true,
      filterable: true,
    },
    {
      key: "Product type",
      label: "Product type",
      sortable: true,
      filterable: true,
    },
    { key: "Function", label: "Function", sortable: true, filterable: true },
    { key: "Series", label: "Series", sortable: true, filterable: true },
    { key: "Colour", label: "Colour", sortable: true, filterable: true },
    {
      key: "Key Feature",
      label: "Key Feature",
      sortable: true,
      filterable: true,
    },
  ];

  // API to retrieve the main data
  const fetchMasterData = async (
    searchParams: Record<string, string> = {},
    page = 1,
    recordsPerPage = 50
  ) => {
    setLoading(true);
    try {
      let endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/mastercoding`;

      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add pagination parameters
      queryParams.append("page", page.toString());
      queryParams.append("limit", recordsPerPage.toString());

      // Check if there are any search parameters
      const hasSearchParams = Object.keys(searchParams).length > 0;

      if (hasSearchParams) {
        // Transform search parameters to API format
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

      // Fix: Access the data array from the response
      if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
        // Transform the received data from API format to display format
        const transformedData = transformArrayFromApiFormat(
          parsedData.data
        ) as RowDataType[];
        setRowData(transformedData);

        // Update pagination info
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

  // API to fetch suggestions for a specific field
  const fetchSuggestions = async (
    field: string,
    query: string
  ): Promise<string[]> => {
    if (!query.trim()) return [];

    try {
      // Construct the API endpoint for suggestions
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

      // Handle the specific response format where the field name is the key
      if (data && typeof data === "object") {
        // Convert field to lowercase to match potential API response keys
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

      // Fallback to empty array if we can't find matching data
      return [];
    } catch (error) {
      console.error(`Error fetching suggestions for ${field}:`, error);
      return [];
    }
  };

  // Sorting function
  const handleSort = (key: keyof RowDataType) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter function
  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  // Apply sorting and filtering
  useEffect(() => {
    let processedData = [...rowData];

    // Apply column filters
    Object.entries(columnFilters).forEach(([column, filterValue]) => {
      if (filterValue.trim()) {
        processedData = processedData.filter((row) => {
          const cellValue = row[column as keyof RowDataType];
          return cellValue
            ?.toString()
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig) {
      processedData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredData(processedData);
  }, [rowData, sortConfig, columnFilters]);

  // Bulk delete function
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    setDeleting(true);
    try {
      // Extract Master IDs from selected rows
      const masterIds = extractMasterIds(selectedRows);

      // Transform to API format for delete request
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

      const result = await response.json();

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
      setSelectedRows([...filteredData]);
    } else {
      setSelectedRows([]);
    }
  };

  // Handle row click
  const handleRowClick = (row: RowDataType) => {
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

  // Handle save operation - Fixed return type
  const handleSave = async (data: Record<string, any>): Promise<void> => {
    try {
      // Transform data to API format before sending
      const apiFormattedData = transformToApiFormat(data);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/mastercoding/update/${selectedRowId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiFormattedData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Update the local data if the save was successful
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

  const handleReset = () => {
    setSelectedRow(null);
    setSelectedRowId(null);
  };

  const handleAddClick = () => {
    // TODO: Implement add new record functionality
    console.log("Add new record clicked");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-90px)] p-4">
      <div className="flex flex-col lg:flex-row gap-4 flex-grow overflow-hidden">
        {/* Search Component - Fixed width with min-height to prevent layout shift */}
        <div className="lg:w-1/4 lg:max-w-[15%] lg:min-w-[150px] flex-shrink-0 min-h-[600px]">
          <SearchComponent
            onSearch={handleSearch}
            fetchSuggestions={fetchSuggestions}
          />
        </div>

        {/* Table Component */}
        <DataTable
          loading={loading}
          deleting={deleting}
          filteredData={filteredData}
          selectedRows={selectedRows}
          selectedRowId={selectedRowId}
          sortConfig={sortConfig}
          pagination={pagination}
          currentPage={currentPage}
          pageSize={pageSize}
          columns={columns}
          onRowSelect={handleRowSelect}
          onSelectAll={handleSelectAll}
          onRowClick={handleRowClick}
          onSort={handleSort}
          onPageSizeChange={handlePageSizeChange}
          onPageChange={handlePageChange}
          onDeleteClick={() => setShowDeleteDialog(true)}
          onAddClick={handleAddClick}
        />

        <RightSheet
          selectedRow={selectedRow}
          onReset={handleReset}
          onSave={handleSave}
          fields={fieldConfig}
          title="Master Coding Details"
        />
      </div>

      {/* Delete Confirmation Dialog */}
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

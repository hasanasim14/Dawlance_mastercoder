"use client";

import { useState, useCallback, useMemo } from "react";
import type { RowDataType, ColumnConfig } from "@/lib/types";
import { transformArrayFromApiFormat } from "@/lib/data-transformers";
import { RFCTable } from "@/components/rfcTable/DataTable";

export default function BranchRFC() {
  // Original data from API (unfiltered)
  const [originalRowData, setOriginalRowData] = useState<RowDataType[]>([]);
  // Filtered data for display
  const [filteredRowData, setFilteredRowData] = useState<RowDataType[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [columns, setColumns] = useState<readonly ColumnConfig[]>([]);

  // State for column filters
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {}
  );

  // Define which columns should have filters (make this dynamic)
  const filterableColumns = ["Product", "Material", "Branch"]; // Add more columns as needed

  // Generate columns from API response data
  const generateColumnsFromData = (
    data: RowDataType[]
  ): readonly ColumnConfig[] => {
    if (!data || data.length === 0) {
      return [];
    }

    // Get all unique keys from the first row
    const firstRow = data[0];
    const keys = Object.keys(firstRow);

    // Define the preferred order of columns
    const columnOrder = [
      "Branch",
      "Material",
      "Material Description",
      "Product",
      "Last RFC",
    ];

    // Separate known columns from dynamic ones
    const knownColumns: string[] = [];
    const dynamicColumns: string[] = [];

    keys.forEach((key) => {
      if (columnOrder.includes(key)) {
        knownColumns.push(key);
      } else {
        dynamicColumns.push(key);
      }
    });

    // Sort known columns by preferred order
    knownColumns.sort(
      (a, b) => columnOrder.indexOf(a) - columnOrder.indexOf(b)
    );

    // Sort dynamic columns (sales columns first, then RFC columns)
    dynamicColumns.sort((a, b) => {
      const aIsSales = a.includes("Sales");
      const bIsSales = b.includes("Sales");
      const aIsRFC = a.includes("RFC");
      const bIsRFC = b.includes("RFC");

      // Sales columns come first
      if (aIsSales && !bIsSales) return -1;
      if (!aIsSales && bIsSales) return 1;

      // Then RFC columns
      if (aIsRFC && !bIsRFC) return 1;
      if (!aIsRFC && bIsRFC) return -1;

      // Alphabetical for same type
      return a.localeCompare(b);
    });

    // Combine all columns in order
    const orderedKeys = [...knownColumns, ...dynamicColumns];

    // Convert to ColumnConfig format
    return orderedKeys.map((key) => ({
      key,
      label: key,
    }));
  };

  // Frontend filtering function
  const applyFiltersToData = useCallback(
    (data: RowDataType[], filters: Record<string, string[]>) => {
      if (!data || data.length === 0) return data;

      // If no filters are applied, return all data
      const hasActiveFilters = Object.values(filters).some(
        (filterValues) => filterValues.length > 0
      );
      if (!hasActiveFilters) return data;

      return data.filter((row) => {
        // Check each filter
        for (const [columnKey, selectedValues] of Object.entries(filters)) {
          if (selectedValues.length === 0) continue; // Skip empty filters

          const cellValue = String(row[columnKey] || "").trim();

          // If the cell value is not in the selected values, exclude this row
          if (!selectedValues.includes(cellValue)) {
            return false;
          }
        }
        return true; // Row passes all filters
      });
    },
    []
  );

  // Apply filters whenever filters or original data changes
  const applyCurrentFilters = useCallback(() => {
    const filtered = applyFiltersToData(originalRowData, columnFilters);
    setFilteredRowData(filtered);

    console.log("Filters applied:", columnFilters);
    console.log("Original data count:", originalRowData.length);
    console.log("Filtered data count:", filtered.length);
  }, [originalRowData, columnFilters, applyFiltersToData]);

  const fetchBranchRFCData = useCallback(
    async (branch: string, month: string, year: string) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          branch,
          month,
          year,
        });

        const endpoint = `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/branch-rfc?${queryParams.toString()}`;
        const authToken = localStorage.getItem("token");

        const res = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await res.json();
        const parsedData = typeof data === "string" ? JSON.parse(data) : data;

        if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
          const transformedData = transformArrayFromApiFormat(
            parsedData.data
          ) as RowDataType[];

          // Store original data
          setOriginalRowData(transformedData);

          // Apply current filters to the new data
          const filtered = applyFiltersToData(transformedData, columnFilters);
          setFilteredRowData(filtered);

          // Generate columns based on actual response data
          const generatedColumns = generateColumnsFromData(transformedData);
          setColumns(generatedColumns);

          console.log(
            "Data fetched successfully:",
            transformedData.length,
            "rows"
          );
        } else {
          console.error("Invalid data structure received:", parsedData);
          setOriginalRowData([]);
          setFilteredRowData([]);
          setColumns([]);
        }
      } catch (error) {
        console.error("Error fetching branch rfc data", error);
        setOriginalRowData([]);
        setFilteredRowData([]);
        setColumns([]);
      } finally {
        setLoading(false);
      }
    },
    [columnFilters, applyFiltersToData]
  );

  // Handle filter changes (this just updates local state)
  const handleFilterChange = useCallback(
    (filters: Record<string, string[]>) => {
      setColumnFilters(filters);
    },
    []
  );

  // Handle apply filters (this triggers frontend filtering)
  const handleApplyFilters = useCallback(() => {
    applyCurrentFilters();
  }, [applyCurrentFilters]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setColumnFilters({});
    setFilteredRowData(originalRowData);
  }, [originalRowData]);

  const handlePost = useCallback(
    async (
      branch: string,
      month: string,
      year: string,
      data: RowDataType[]
    ) => {
      setPosting(true);
      try {
        const query = new URLSearchParams({
          branch,
          month,
          year,
        }).toString();

        const authToken = localStorage.getItem("token");

        // Find the RFC column (same logic as in RFCTable component)
        const rfcColumn = columns.find(
          (col) => col.key.includes("RFC") && !col.key.includes("Last")
        );

        if (!rfcColumn) {
          throw new Error("RFC column not found");
        }

        // Transform data to only include material and rfc, same format as save API
        const postData = data.map((row) => ({
          material: String(row["Material"] || ""),
          rfc: String(row[rfcColumn.key] || ""),
        }));

        // First API call - existing branch-rfc endpoint
        const branchRfcEndpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/branch-rfc?${query}`;

        // Second API call - add your second endpoint here
        const secondApiEndpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/branch-rfc-save?${query}`;

        // Call both APIs in parallel for better performance
        const [branchRfcResponse, secondApiResponse] = await Promise.all([
          fetch(branchRfcEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(postData),
          }),
          fetch(secondApiEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(postData),
          }),
        ]);

        // Check if both responses are successful
        if (!branchRfcResponse.ok) {
          throw new Error(
            `Branch RFC API error! status: ${branchRfcResponse.status}`
          );
        }

        if (!secondApiResponse.ok) {
          throw new Error(
            `Second API error! status: ${secondApiResponse.status}`
          );
        }

        // Parse both responses
        const branchRfcResult = await branchRfcResponse.json();
        const secondApiResult = await secondApiResponse.json();

        console.log("Branch RFC API result:", branchRfcResult);
        console.log("Second API result:", secondApiResult);

        // Refresh data after both successful posts
        await fetchBranchRFCData(branch, month, year);
      } catch (error) {
        console.error("Error posting RFC data:", error);
      } finally {
        setPosting(false);
      }
    },
    [fetchBranchRFCData, columns]
  );

  const handleSave = useCallback(
    async (
      branch: string,
      month: string,
      year: string,
      changedData: Array<{ material: string; rfc: string }>
    ) => {
      setSaving(true);
      try {
        const query = new URLSearchParams({ branch, month, year }).toString();
        const authToken = localStorage.getItem("token");
        const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/branch-rfc-save?${query}`;

        console.log("the response is", changedData);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(changedData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Refresh data after saving
        await fetchBranchRFCData(branch, month, year);
      } catch (error) {
        console.error("Error saving RFC data:", error);
      } finally {
        setSaving(false);
      }
    },
    [fetchBranchRFCData]
  );

  // Get filter summary for display
  const filterSummary = useMemo(() => {
    const activeFilters = Object.entries(columnFilters).filter(
      ([_, values]) => values.length > 0
    );
    const totalFiltered = activeFilters.reduce(
      (sum, [_, values]) => sum + values.length,
      0
    );
    return {
      activeFilters: activeFilters.length,
      totalFiltered,
      showing: filteredRowData.length,
      total: originalRowData.length,
    };
  }, [columnFilters, filteredRowData.length, originalRowData.length]);

  return (
    <div className="w-full h-[85vh] p-4 overflow-hidden">
      <div className="w-full h-full overflow-hidden">
        {/* Filter Summary */}
        {filterSummary.activeFilters > 0 && (
          <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing {filterSummary.showing} of {filterSummary.total} rows (
              {filterSummary.activeFilters} filter
              {filterSummary.activeFilters !== 1 ? "s" : ""} applied)
            </div>
            <button
              onClick={clearAllFilters}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        <RFCTable
          rowData={filteredRowData} // Use filtered data instead of original
          columns={columns}
          onPost={handlePost}
          onSave={handleSave}
          onFetchData={fetchBranchRFCData}
          isLoading={loading}
          isSaving={saving}
          isPosting={posting}
          filterableColumns={filterableColumns}
          columnFilters={columnFilters}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
        />
      </div>
    </div>
  );
}

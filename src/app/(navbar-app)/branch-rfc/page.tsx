"use client";

import { useState, useCallback } from "react";
import type {
  RowDataType,
  PaginationData,
  FieldConfig,
  ColumnConfig,
} from "@/lib/types";
import {
  transformToApiFormat,
  transformArrayFromApiFormat,
} from "@/lib/data-transformers";
import { RFCTable } from "@/components/rfcTable/DataTable";
// import { toast } from "@/hooks/use-toast";

export default function BranchRFC() {
  const [selectedRow, setSelectedRow] = useState<RowDataType | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [rowData, setRowData] = useState<RowDataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [columns, setColumns] = useState<readonly ColumnConfig[]>([]);

  // Pagination states
  const [pagination, setPagination] = useState<PaginationData>({
    total_records: 0,
    records_per_page: 50,
    page: 1,
    total_pages: 0,
  });

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
      required: true,
    },
    {
      key: "Measurement Instrument",
      label: "Measurement Instrument",
      type: "text",
      required: true,
    },
    {
      key: "Colour Similarity",
      label: "Colour Similarity",
      type: "text",
      required: true,
    },
    {
      key: "Product Type",
      label: "Product Type",
      type: "text",
      required: true,
    },
    { key: "Function", label: "Function", type: "text", required: true },
    { key: "Series", label: "Series", type: "text", required: true },
    { key: "Colour", label: "Colour", type: "text", required: true },
    { key: "Key Feature", label: "Key Feature", type: "text", required: true },
  ];

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

  const fetchBranchRFCData = useCallback(
    async (branch: string, month: string, year: string) => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          branch,
          month,
          year,
        }).toString();

        const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/branch-rfc?${query}`;
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
          setRowData(transformedData);

          // Generate columns based on actual response data
          const generatedColumns = generateColumnsFromData(transformedData);
          setColumns(generatedColumns);

          if (parsedData.pagination) {
            setPagination(parsedData.pagination);
          }

          // toast({
          //   title: "Data loaded successfully",
          //   description: `Loaded ${transformedData.length} records for ${branch}`,
          // });
        } else {
          console.error("Invalid data structure received:", parsedData);
          setRowData([]);
          setColumns([]);
          // toast({
          //   title: "No data found",
          //   description: "No RFC data available for the selected criteria",
          //   variant: "destructive",
          // });
        }
      } catch (error) {
        console.error("Error fetching branch rfc data", error);
        setRowData([]);
        setColumns([]);
        // toast({
        //   title: "Error loading data",
        //   description: "Failed to fetch RFC data. Please try again.",
        //   variant: "destructive",
        // });
      } finally {
        setLoading(false);
      }
    },
    []
  );

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
        const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/branch-rfc?${query}`;

        const requestBody = {
          // branch,
          // month: Number.parseInt(month),
          // year: Number.parseInt(year),
          data: data,
        };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // toast({
        //   title: "Data posted successfully",
        //   description: `RFC data for ${branch} has been posted successfully`,
        // });

        // Refresh data after posting
        await fetchBranchRFCData(branch, month, year);
      } catch (error) {
        console.error("Error posting RFC data:", error);
        // toast({
        //   title: "Error posting data",
        //   description: "Failed to post RFC data. Please try again.",
        //   variant: "destructive",
        // });
      } finally {
        setPosting(false);
      }
    },
    [fetchBranchRFCData]
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
          body: JSON.stringify(changedData), // Send only changed records in the specified format
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // toast({
        //   title: "Data saved successfully",
        //   description: `RFC data for ${branch} has been saved successfully`,
        // });

        // Refresh data after saving
        await fetchBranchRFCData(branch, month, year);
      } catch (error) {
        console.error("Error saving RFC data:", error);
        // toast({
        //   title: "Error saving data",
        //   description: "Failed to save RFC data. Please try again.",
        //   variant: "destructive",
        // });
      } finally {
        setSaving(false);
      }
    },
    [fetchBranchRFCData]
  );

  return (
    <div className="w-full h-[85vh] p-4 overflow-hidden">
      <div className="w-full h-full overflow-hidden">
        <RFCTable
          rowData={rowData}
          columns={columns}
          onPost={handlePost}
          onSave={handleSave}
          onFetchData={fetchBranchRFCData}
          isLoading={loading}
          isSaving={saving}
          isPosting={posting}
        />
      </div>
    </div>
  );
}

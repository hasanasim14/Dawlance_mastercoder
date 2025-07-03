"use client";

import { useState, useCallback } from "react";
import type { RowDataType, ColumnConfig } from "@/lib/types";
import { transformArrayFromApiFormat } from "@/lib/data-transformers";
import { RFCTable } from "@/components/rfcTable/DataTable";

// import { toast } from "@/hooks/use-toast";

export default function BranchRFC() {
  const [rowData, setRowData] = useState<RowDataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);

  const [columns, setColumns] = useState<readonly ColumnConfig[]>([]);

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
            body: JSON.stringify(postData), // You can modify this data structure if needed
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

        // toast({
        //   title: "Data posted successfully",
        //   description: `RFC data for ${branch} has been posted to both endpoints successfully`,
        // });

        // Refresh data after both successful posts
        await fetchBranchRFCData(branch, month, year);
      } catch (error) {
        console.error("Error posting RFC data:", error);
        // toast({
        //   title: "Error posting data",
        //   description: `Failed to post RFC data: ${error.message}. Please try again.`,
        //   variant: "destructive",
        // });
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
          body: JSON.stringify(changedData), // Send only changed records in the specified format
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // const result = await response.json();

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

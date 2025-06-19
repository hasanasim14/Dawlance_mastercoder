"use client";

import { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { ClientSideRowModelModule, themeAlpine } from "ag-grid-community";
import { ModuleRegistry } from "ag-grid-community";
import { ValidationModule } from "ag-grid-community";
import { Skeleton } from "@/components/ui/skeleton";
import { RightSheet } from "@/components/RightSheet";

// Register modules
ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule]);

type RowDataType = {
  ID: number;
  "Branch Name": string;
  Province: string;
  Time: string;
};

const MasterCoding = () => {
  const [selectedRow, setSelectedRow] = useState<RowDataType | null>(null);
  const [rowData, setRowData] = useState<RowDataType[]>([]);
  const [loading, setLoading] = useState(true);

  // API to retrieve the main data
  const fetchMasterData = async (searchParams: Record<string, string> = {}) => {
    setLoading(true);
    try {
      let endpoint = `${process.env}/branchmaster`;

      // Check if there are any search parameters
      const hasSearchParams = Object.keys(searchParams).length > 0;

      if (hasSearchParams) {
        // Convert the search parameters to a query string
        const queryParams = new URLSearchParams();

        Object.entries(searchParams).forEach(([field, value]) => {
          queryParams.append(field, value);
        });

        endpoint = `${process.env}/mastercoding/?${queryParams.toString()}`;
      }

      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      setRowData(parsedData);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  // Column Definitions for Master Coding
  const columnDefs: ColDef<RowDataType>[] = useMemo(
    () => [
      // ID
      {
        headerName: "ID",
        field: "ID",
        sortable: true,
        filter: true,
        minWidth: 120,
      },
      // Branch Name
      {
        headerName: "Branch Name",
        field: "Branch Name",
        sortable: true,
        filter: true,
        minWidth: 150,
      },
      // Province
      {
        headerName: "Province",
        field: "Province",
        sortable: true,
        filter: true,
        minWidth: 150,
      },
      // Time
      {
        headerName: "Time",
        field: "Time",
        sortable: true,
        filter: true,
        minWidth: 200,
      },
    ],
    []
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onRowClicked = (event: any) => {
    setSelectedRow(event.data);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event.api.forEachNode((node: any) => {
      node.setSeleted(false);
    });
    event.node.setSeleted(true);
  };

  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      resizable: true,
      sortable: true,
      filter: true,
    };
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-90px)] p-4">
      <div className="flex flex-col md:flex-row gap-4 flex-grow overflow-hidden h-[calc(100%-120px)]">
        <div className="rounded-lg border bg-card flex-grow shadow-sm flex flex-col h-full">
          <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
            <h3 className="font-semibold">Branch Master</h3>
          </div>

          {loading ? (
            <div className="p-4 space-y-3 flex-grow">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="ag-theme-alpine w-full h-full">
              <AgGridReact<RowDataType>
                theme={themeAlpine}
                rowData={rowData}
                columnDefs={columnDefs}
                onRowClicked={onRowClicked}
                defaultColDef={defaultColDef}
                animateRows={true}
                rowHeight={30}
                headerHeight={38}
                suppressCellFocus={true}
              />
            </div>
          )}
        </div>

        <RightSheet selectedRow={selectedRow} />
      </div>
    </div>
  );
};

export default MasterCoding;

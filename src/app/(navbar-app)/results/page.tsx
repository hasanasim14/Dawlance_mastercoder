"use client";

import { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { ClientSideRowModelModule, themeAlpine } from "ag-grid-community";
import { ModuleRegistry } from "ag-grid-community";
import { ValidationModule } from "ag-grid-community";
import { Skeleton } from "@/components/ui/skeleton";
// import { RightSheet } from "@/components/RightSheet";

// Register modules
ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule]);

type RowDataType = {
  Material: string;
  "Material Description": string;
  Category: string;
  PredYear: string;
  PredMonth: string;
  TYear: string;
  TMonth: string;
  Prediction: string;
  Horizon: string;
};

const Results = () => {
  // const [selectedRow, setSelectedRow] = useState<RowDataType | null>(null);
  const [rowData, setRowData] = useState<RowDataType[]>([]);
  const [loading, setLoading] = useState(true);

  // API to retrieve the main data
  const fetchMasterData = async () => {
    setLoading(true);
    try {
      const endpoint = "http://192.168.1.10:3295/aipredictions";

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
      // Material
      {
        headerName: "Material",
        field: "Material",
        sortable: true,
        filter: true,
        minWidth: 150,
      },
      // Material Description
      {
        headerName: "Material Description",
        field: "Material Description",
        sortable: true,
        filter: true,
        minWidth: 200,
      },
      // Category
      {
        headerName: "Category",
        field: "Category",
        sortable: true,
        filter: true,
        minWidth: 180,
      },
      // PredYear
      {
        headerName: "PredYear",
        field: "PredYear",
        sortable: true,
        filter: true,
        minWidth: 150,
      },
      // PredMonth
      {
        headerName: "PredMonth",
        field: "PredMonth",
        sortable: true,
        filter: true,
        minWidth: 150,
      },
      // TYear
      {
        headerName: "TYear",
        field: "TYear",
        sortable: true,
        filter: true,
        minWidth: 150,
      },
      // TMonth
      {
        headerName: "TMonth",
        field: "TMonth",
        sortable: true,
        filter: true,
        minWidth: 120,
      },
      // Prediction
      {
        headerName: "Prediction",
        field: "Prediction",
        sortable: true,
        filter: true,
        minWidth: 120,
      },
      // Key Feature
      {
        headerName: "Horizon",
        field: "Horizon",
        sortable: true,
        filter: true,
        minWidth: 150,
      },
    ],
    []
  );

  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      resizable: true,
      sortable: true,
      filter: true,
    };
  }, []);

  return (
    <div className="flex flex-col h-screen p-4 md:px-3 md:py-2 box-border">
      <div className="flex flex-col flex-grow overflow-hidden h-[calc(100%-120px)]">
        <div className="rounded-lg border bg-card flex-grow shadow-sm flex flex-col h-full">
          <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
            <h3 className="font-semibold">Results</h3>
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
                // pagination={true}
                // paginationAutoPageSize={true}
                // onRowClicked={onRowClicked}
                // getRowClass={getRowClass}
                defaultColDef={defaultColDef}
                // onGridReady={onGridReady}
                animateRows={true}
                rowHeight={30}
                headerHeight={38}
                suppressCellFocus={true}
                // className="rounded-md"
                // domLayout="normal"
              />
            </div>
          )}
        </div>

        {/* <RightSheet selectedRow={selectedRow} /> */}
      </div>
    </div>
  );
};

export default Results;

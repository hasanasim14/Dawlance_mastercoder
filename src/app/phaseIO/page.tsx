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
  Product: string;
  Material: string;
  "Material Description": string;
  "Measurement Instrument": string;
  "Phase Out-(revised)": string;
  "Phase In Date-Revised": string;
  "Sales Group": string;
  "Price Group": string;
  TYear: string;
  TMonth: string;
};

const PhaseIO = () => {
  const [selectedRow, setSelectedRow] = useState<RowDataType | null>(null);
  const [rowData, setRowData] = useState<RowDataType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMasterData = async (search = "") => {
    setLoading(true);
    try {
      const endpoint = search
        ? `http://192.168.1.10:3295/phaseio/search?term=${encodeURIComponent(
            search
          )}`
        : "http://192.168.1.10:3295/phaseio";

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
      // Product
      {
        headerName: "Product",
        field: "Product",
        sortable: true,
        filter: true,
        minWidth: 150,
      },
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
      // Phase Out-(revised)
      {
        headerName: "Phase Out-(revised)",
        field: "Phase Out-(revised)",
        sortable: true,
        filter: true,
        minWidth: 200,
      },
      // Phase In Date-Revised
      {
        headerName: "Phase In Date-Revised",
        field: "Phase In Date-Revised",
        sortable: true,
        filter: true,
        minWidth: 180,
      },
      //  Sales Group
      {
        headerName: "Sales Group",
        field: "Sales Group",
        sortable: true,
        filter: true,
        minWidth: 150,
      },
      // Price Group
      {
        headerName: "Price Group",
        field: "Price Group",
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
    <div className="flex flex-col h-screen p-4 md:p-6 box-border">
      <div className="flex flex-col md:flex-row gap-4 flex-grow overflow-hidden h-[calc(100%-120px)]">
        <div className="rounded-lg border bg-card flex-grow shadow-sm flex flex-col h-full">
          <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
            <h3 className="font-semibold">Phase In And Out</h3>
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
                onRowClicked={onRowClicked}
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

        <RightSheet selectedRow={selectedRow} />
      </div>
    </div>
  );
};

export default PhaseIO;

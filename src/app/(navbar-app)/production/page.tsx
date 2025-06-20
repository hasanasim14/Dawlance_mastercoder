"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { ClientSideRowModelModule, themeAlpine } from "ag-grid-community";
import { ModuleRegistry } from "ag-grid-community";
import { ValidationModule } from "ag-grid-community";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RightSheet } from "@/components/RightSheet";

// Register modules
ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule]);

type RowDataType = {
  Tyear: string;
  TMonth: string;
  Material: string;
  "Material Description": string;
  Quantity: string;
};

const Production = () => {
  const [selectedRow, setSelectedRow] = useState<RowDataType | null>(null);
  const [rowData, setRowData] = useState<RowDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // API to retrieve the main data
  const fetchMasterData = async (search = "") => {
    setLoading(true);
    try {
      const endpoint = search
        ? `${
            process.env.NEXT_PUBLIC_BASE_URL
          }/production/search?term=${encodeURIComponent(search)}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/production`;

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

  // Debouncing
  const handleSearch = (value: string) => {
    setSearchTerm(value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchMasterData(value);
    }, 500); // 0.5 seconds

    setSearchTimeout(timeout);
  };

  // Column Definitions for Master Coding
  const columnDefs: ColDef<RowDataType>[] = useMemo(
    () => [
      // TYear
      {
        headerName: "Tyear",
        field: "Tyear",
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
      // "Quantity"
      {
        headerName: "Quantity",
        field: "Quantity",
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
      <div className="flex flex-col flex-grow overflow-hidden h-[calc(100%-120px)]">
        <div className="rounded-lg border bg-card flex-grow shadow-sm flex flex-col h-full">
          <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
            <h3 className="font-semibold">Production</h3>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
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

        <RightSheet selectedRow={selectedRow} parent={"production"} />
      </div>
    </div>
  );
};

export default Production;

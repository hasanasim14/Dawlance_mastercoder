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
import Image from "next/image";

// Register modules
ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule]);

type RowDataType = {
  "Master ID": number;
  Product: string;
  Material: string;
  "Material Description": string;
  "Measurement Instrument": string;
  "Colour Similarity": string;
  "Product type": string;
  Function: string;
  Series: string;
  Colour: string;
  "Key Feature": string;
};

const MasterCoding = () => {
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
        ? `http://192.168.1.10:3295/mastercoding/search?term=${encodeURIComponent(
            search
          )}`
        : "http://192.168.1.10:3295/mastercoding";

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
      // Master ID
      {
        headerName: "Master ID",
        field: "Master ID",
        sortable: true,
        filter: true,
        minWidth: 120,
      },
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
      // Measurement Instrument
      {
        headerName: "Measurement Instrument",
        field: "Measurement Instrument",
        sortable: true,
        filter: true,
        minWidth: 180,
      },
      // Colour Similarity
      {
        headerName: "Colour Similarity",
        field: "Colour Similarity",
        sortable: true,
        filter: true,
        minWidth: 150,
      },
      // Product type
      {
        headerName: "Product type",
        field: "Product type",
        sortable: true,
        filter: true,
        minWidth: 150,
      },
      // Function
      {
        headerName: "Function",
        field: "Function",
        sortable: true,
        filter: true,
        minWidth: 150,
      },
      // Series
      {
        headerName: "Series",
        field: "Series",
        sortable: true,
        filter: true,
        minWidth: 120,
      },
      // Colour
      {
        headerName: "Colour",
        field: "Colour",
        sortable: true,
        filter: true,
        minWidth: 120,
      },
      // Key Feature
      {
        headerName: "Key Feature",
        field: "Key Feature",
        sortable: true,
        filter: true,
        minWidth: 150,
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
      <div className="w-full mb-2 flex-shrink-0">
        <Image
          src="/logo.png"
          alt="Master Coding Header"
          width={1200}
          height={120}
          className="w-50 object-cover opacity-90"
          priority
        />
      </div>

      <div className="flex flex-col flex-grow overflow-hidden h-[calc(100%-120px)]">
        <div className="rounded-lg border bg-card flex-grow shadow-sm flex flex-col h-full">
          <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
            <h3 className="font-semibold">Master Coding</h3>
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

        <RightSheet selectedRow={selectedRow} />
      </div>
    </div>
  );
};

export default MasterCoding;

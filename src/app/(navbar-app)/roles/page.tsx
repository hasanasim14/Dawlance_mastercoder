"use client";

import { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { ClientSideRowModelModule, themeAlpine } from "ag-grid-community";
import { ModuleRegistry } from "ag-grid-community";
import { ValidationModule } from "ag-grid-community";
import { Skeleton } from "@/components/ui/skeleton";
import { RightSheet } from "@/components/RightSheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Register modules
ModuleRegistry.registerModules([ClientSideRowModelModule, ValidationModule]);

type RowDataType = {
  ID: string;
  Access: string;
  // Access: string;
};

const Roles = () => {
  const [selectedRow, setSelectedRow] = useState<RowDataType | null>(null);
  const [rowData, setRowData] = useState<RowDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const fetchMasterData = async (search = "") => {
    setLoading(true);
    try {
      const endpoint = search
        ? `${process.env}/phaseio/search?term=${encodeURIComponent(search)}`
        : `${process.env}/phaseio`;

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
        minWidth: 150,
      },
      // Access
      {
        headerName: "Access",
        field: "Access",
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

  const handleAddNewRole = () => {
    const emptyRow: RowDataType = {
      ID: "",
      Access: "",
    };
    setSelectedRow(emptyRow);
    setIsAddingNew(true);
  };

  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      resizable: true,
      sortable: true,
      filter: true,
    };
  }, []);

  const rightSheetData = isAddingNew ? { ID: "", Access: "" } : selectedRow;

  return (
    <div className="flex flex-col h-[calc(100vh-90px)] p-4">
      <div className="flex flex-col md:flex-row gap-4 flex-grow overflow-hidden h-[calc(100%-120px)]">
        <div className="rounded-lg border bg-card flex-grow shadow-sm flex flex-col h-full">
          <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
            <h3 className="font-semibold">Roles</h3>
            <Button
              className="px-4 py-2 text-white rounded-md transition-colors"
              onClick={handleAddNewRole}
            >
              <Plus />
              Add a new Role
            </Button>
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

        <RightSheet selectedRow={rightSheetData} parent={"roles"} />
      </div>
    </div>
  );
};

export default Roles;

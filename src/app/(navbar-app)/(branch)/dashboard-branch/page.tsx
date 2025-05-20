"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { Download, Upload, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ClientSideRowModelApiModule,
  ClientSideRowModelModule,
  GridApi,
  GridOptions,
  ModuleRegistry,
  NumberEditorModule,
  TextEditorModule,
  ValidationModule,
  createGrid,
} from "ag-grid-community";
import { IOlympicData } from "@/lib/interface";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// Register modules
ModuleRegistry.registerModules([
  NumberEditorModule,
  TextEditorModule,
  ClientSideRowModelApiModule,
  ClientSideRowModelModule,
  ValidationModule,
]);

// Mock data for the table
const customData: IOlympicData[] = [
  {
    athlete: "Michael Phelps",
    age: 23,
    country: "USA",
    year: 2008,
    total: 8,
  },
  {
    athlete: "Usain Bolt",
    age: 22,
    country: "Jamaica",
    year: 2008,
    total: 3,
  },
  {
    athlete: "Simone Biles",
    age: 19,
    country: "USA",
    year: 2016,
    total: 4,
  },
];

// Grid configuration
const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: "athlete", headerName: "Athlete", minWidth: 150 },
    { field: "age", headerName: "Age", minWidth: 90 },
    { field: "country", headerName: "Country", minWidth: 120 },
    { field: "year", headerName: "Year", minWidth: 90 },
    {
      field: "total",
      headerName: "Total Medals",
      minWidth: 120,
      editable: true,
    },
  ],
  defaultColDef: {
    resizable: true,
    sortable: true,
    filter: true,
    flex: 1,
  },
  rowHeight: 40,
  headerHeight: 40,
};

export default function DashboardBranch() {
  const [isLoading, setIsLoading] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const gridApiRef = useRef<GridApi<IOlympicData> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    const api = createGrid(gridRef.current, gridOptions);
    gridApiRef.current = api;

    api.setGridOption("rowData", customData);
    api.sizeColumnsToFit();

    const handleResize = () => {
      api.sizeColumnsToFit();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      api.destroy();
    };
  }, []);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an Excel file
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return;
    }

    setIsLoading(true);

    // Mock API call for file processing
    setTimeout(() => {
      // Simulate new data from the Excel file
      const newData = [
        ...customData,
        {
          athlete: "New Athlete " + new Date().toLocaleTimeString(),
          age: 25,
          country: "Imported",
          year: 2024,
          total: 5,
        },
        {
          athlete: "Another Athlete " + new Date().toLocaleDateString(),
          age: 21,
          country: "Imported",
          year: 2024,
          total: 3,
        },
      ];

      gridApiRef.current?.setGridOption("rowData", newData);
      setIsLoading(false);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 1500);
  };

  // Handle data download
  const handleDownload = () => {
    const rowData: IOlympicData[] = [];
    gridApiRef.current?.forEachNode((node) =>
      rowData.push(node.data as IOlympicData)
    );

    // Convert data to CSV
    const headers = ["Athlete", "Age", "Country", "Year", "Total Medals"];
    const csvContent = [
      headers.join(","),
      ...rowData.map((row) =>
        [
          `"${row.athlete}"`,
          row.age,
          `"${row.country}"`,
          row.year,
          row.total,
        ].join(",")
      ),
    ].join("\n");

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `olympic_data_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle save data
  const handleSave = () => {
    setIsLoading(true);

    // Mock API call for saving data
    setTimeout(() => {
      const rowData: IOlympicData[] = [];
      gridApiRef.current?.forEachNode((node) =>
        rowData.push(node.data as IOlympicData)
      );

      console.log("Data to be saved:", rowData);
      setIsLoading(false);
    }, 1000);
  };

  // Handle post data
  const handlePost = () => {
    setIsLoading(true);

    // Mock API call for posting data
    setTimeout(() => {
      const rowData: IOlympicData[] = [];
      gridApiRef.current?.forEachNode((node) =>
        rowData.push(node.data as IOlympicData)
      );

      console.log("Data to be posted:", rowData);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <>
      <div className="container mx-auto py-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-medium tracking-tight">
              Dashboard - Branches
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <Download className="h-4 w-4" />
                Download Data
              </Button>
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  ref={fileInputRef}
                  className="absolute inset-0 opacity-0 w-full cursor-pointer"
                  onChange={handleFileUpload}
                  accept=".xlsx,.xls"
                  disabled={isLoading}
                />
                <Button
                  variant="default"
                  className="flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Uploading..."
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Excel
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col h-screen p-4 md:px-3 md:py-2 box-border">
        <div className="flex flex-col md:flex-row gap-4 flex-grow overflow-hidden h-[calc(100%-120px)]">
          <div className="rounded-lg border bg-card flex-grow shadow-sm flex flex-col h-full">
            <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
              <h3 className="font-semibold">Dashboard - Branches</h3>
              <div className="flex items-center gap-2">
                {/* Save Button */}
                <Button
                  variant="outline"
                  onClick={handleSave}
                  className="flex items-center gap-2 px-3 py-1.5"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
                {/* Post Button */}
                <Button
                  variant="default"
                  onClick={handlePost}
                  className="flex items-center gap-2 px-3 py-1.5"
                  disabled={isLoading}
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Post</span>
                </Button>
              </div>
            </div>

            <div
              ref={gridRef}
              className="ag-theme-alpine w-full"
              style={
                {
                  height: "calc(100vh - 220px)",
                  minHeight: "500px",
                  width: "100%",
                  "--ag-border-radius": "0",
                  "--ag-grid-size": "6px",
                  "--ag-list-item-height": "28px",
                  "--ag-font-size": "14px",
                  "--ag-font-family": "inherit",
                  "--ag-header-background-color": "hsl(var(--background))",
                  "--ag-background-color": "hsl(var(--background))",
                  "--ag-odd-row-background-color": "hsl(var(--muted))",
                  "--ag-header-column-resize-handle-color":
                    "hsl(var(--border))",
                  "--ag-border-color": "hsl(var(--border))",
                  "--ag-row-border-color": "hsl(var(--border))",
                  "--ag-secondary-border-color": "hsl(var(--border))",
                } as React.CSSProperties
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}

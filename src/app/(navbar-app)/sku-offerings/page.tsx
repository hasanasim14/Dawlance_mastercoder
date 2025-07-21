"use client";

import type React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getNextMonthAndYear } from "@/lib/utils";
import { PaginationData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateFilter from "@/components/DateFilter";
import SKUValidations from "@/components/sku-offerings/Validations";

interface UploadedData {
  Material: string;
  "Material Description": string;
  Product: string;
}

interface FileUploadStatus {
  file: File | null;
  status: "idle" | "uploading" | "processing" | "success" | "error";
  progress: number;
  lastUploaded: string | null;
  error?: string;
}

export default function SKUOfferings() {
  const [uploadStatus, setUploadStatus] = useState<FileUploadStatus>({
    file: null,
    status: "idle",
    progress: 0,
    lastUploaded: null,
  });
  const [uploadedData, setUploadedData] = useState<UploadedData[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [apiResponse, setApiResponse] = useState<{
    // message?: string;
    // recordsProcessed?: number;
    // errors?: string[];
    data?: string[];
  } | null>(null);

  // Pagination states
  const [pagination, setPagination] = useState<PaginationData>({
    total_records: 0,
    records_per_page: 50,
    page: 1,
    total_pages: 0,
  });
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const { month, year } = getNextMonthAndYear("Non-RFC");
    setSelectedMonth(month);
    setSelectedYear(year);
  }, []);

  // useEffect(() => {
  const fetchOffering = async (page = 1, recordsPerPage = 50) => {
    setIsLoading(true);
    try {
      if (!selectedMonth || !selectedYear) return;

      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", recordsPerPage.toString());
      const authToken = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/offerings/${selectedMonth}/${selectedYear}?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const data = await res.json();
      setUploadedData(data?.data);
      setPagination(data?.pagination);
    } catch (error) {
      console.error("The error is = ", error);
    }
  };
  // fetchOffering();
  // }, [selectedMonth, selectedYear]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setUploadStatus((prev) => ({
        ...prev,
        status: "error",
        error: "Please upload only Excel files (.xlsx or .xls)",
      }));
      return;
    }
    setApiResponse(null);

    setUploadStatus({
      file,
      status: "uploading",
      progress: 0,
      lastUploaded: null,
    });

    const authToken = localStorage.getItem("token");
    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("year", selectedYear!.toString());
      formData.append("month", selectedMonth!.toString());

      // Update progress to show uploading
      setUploadStatus((prev) => ({
        ...prev,
        progress: 50,
      }));

      // Send file to API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/offerings`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      // Update progress to show processing
      setUploadStatus((prev) => ({
        ...prev,
        progress: 75,
        status: "processing",
      }));

      if (!response.ok) {
        // Extract the error message from the API response
        const errorMessage =
          data?.message || data?.detail || "Upload failed. Please try again.";
        setApiResponse({
          data: data?.data || [],
        });
        throw new Error(errorMessage);
      }

      // if (!response.ok) {
      // }

      if (data.data && Array.isArray(data.data)) {
        setUploadedData(data.data);
      }

      setApiResponse({
        // message: data.message || "File processed successfully",
        // recordsProcessed: data.data?.length || 0,
        // errors: data.errors || [],
        data: data?.data || [],
      });

      // Set success status
      setUploadStatus({
        file,
        status: "success",
        progress: 100,
        lastUploaded: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      });
    } catch (error) {
      console.error("File upload error:", error);

      let errorMessage = "Upload failed. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setUploadStatus((prev) => ({
        ...prev,
        status: "error",
        error: errorMessage,
      }));
    }

    // Reset file input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const getStatusIcon = () => {
    switch (uploadStatus.status) {
      case "uploading":
      case "processing":
        return <Clock className="w-4 h-4 animate-spin" />;
      // case "success":
      //   return <CheckCircle className="w-4 h-4 text-green-600" />;
      // case "error":
      //   return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Upload className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (uploadStatus.status) {
      case "uploading":
        return `Uploading... ${uploadStatus.progress}%`;
      case "processing":
        return "Processing file...";
      // case "success":
      //   return "Upload completed successfully";
      // case "error":
      //   return "Upload failed";
      default:
        return "Drop Excel file here or click to browse";
    }
  };

  // Pagination handlers
  const handlePageSizeChange = (newPageSize: string) => {
    const size = Number.parseInt(newPageSize);
    setPageSize(size);
    setCurrentPage(1);
    fetchOffering(1, size);
  };

  // changing the page
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchOffering(newPage, pageSize);
  };

  // calling the intial data load
  useEffect(() => {
    fetchOffering(currentPage, pageSize);
  }, []);

  console.log("uploaded date", uploadedData);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* File Upload Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Offerings</CardTitle>
                <p className="text-sm text-gray-600">
                  Upload Offerings Spreadsheet
                </p>
              </div>
            </div>
            <div className="text-right">
              <h3 className="font-medium text-gray-900">File Validations</h3>
              {uploadStatus.lastUploaded && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  Last uploaded: {uploadStatus.lastUploaded}
                </p>
              )}
            </div>
          </CardHeader>
          <div className="px-6 pb-4 border-b">
            <div className="flex gap-3 flex-wrap">
              <DateFilter
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
              />
            </div>
          </div>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  isDragOver
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-4 h-full text-center">
                  {getStatusIcon()}
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-sm font-medium text-gray-900">
                      {getStatusText()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      (.xlsx files only)
                    </p>
                    {uploadStatus.status === "idle" && (
                      <p className="text-xs text-gray-400 mt-2">
                        Files will be uploaded automatically when selected
                      </p>
                    )}
                  </div>

                  {(uploadStatus.status === "uploading" ||
                    uploadStatus.status === "processing") && (
                    <div className="w-full max-w-xs">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadStatus.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Validation Results */}
              <div className="flex items-center justify-center">
                {uploadStatus?.status === "idle" &&
                uploadedData?.length === 0 ? (
                  <div className="text-center text-gray-500">
                    <div className="text-sm font-medium">
                      No results to display
                    </div>
                    <div className="text-xs mt-1">
                      Upload a file to see processing results
                    </div>
                  </div>
                ) : uploadStatus.status === "success" && apiResponse ? (
                  <div className="h-[40vh] overflow-auto w-full">
                    <SKUValidations
                      validationData={apiResponse?.data ?? null}
                    />
                  </div>
                ) : uploadStatus.status === "uploading" ||
                  // jab upload horaha hai
                  uploadStatus.status === "processing" ? (
                  <div className="text-center text-blue-600">
                    <Clock className="w-8 h-8 mx-auto mb-2 animate-spin" />
                    <div className="text-sm font-medium">
                      {uploadStatus.status === "uploading"
                        ? "Uploading file..."
                        : "Processing data..."}
                    </div>
                    <div className="text-xs mt-1">
                      Please wait while we process your file
                    </div>
                  </div>
                ) : uploadStatus.status === "error" ? (
                  <div className="h-[40vh] overflow-auto w-full">
                    <SKUValidations
                      validationData={apiResponse?.data ?? null}
                    />
                  </div>
                ) : (
                  <div className="text-center text-green-600">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm font-medium">
                      Data loaded successfully
                    </div>
                    <div className="text-xs mt-1">
                      {uploadedData?.length} records available
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table Section */}
        {uploadedData?.length > 0 && (
          <>
            <div className="rounded-md border p-2">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Material Description</TableHead>
                    <TableHead>Product</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadedData.map((record) => (
                    <TableRow key={record.Material + record.Product}>
                      <TableCell className="font-medium">
                        {record.Material}
                      </TableCell>
                      <TableCell>{record["Material Description"]}</TableCell>
                      <TableCell>{record.Product}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* </> */}

            <div className="p-4 border-t flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="150">150</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">entries</span>
                </div>

                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, pagination.total_records)}{" "}
                  of {pagination.total_records} entries
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.total_pages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.total_pages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.total_pages - 2) {
                        pageNum = pagination.total_pages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.total_pages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

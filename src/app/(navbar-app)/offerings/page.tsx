"use client";

import type React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getNextMonthAndYear, months, years } from "@/lib/utils";

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

export default function Offerings() {
  const [uploadStatus, setUploadStatus] = useState<FileUploadStatus>({
    file: null,
    status: "idle",
    progress: 0,
    lastUploaded: null,
  });
  const [uploadedData, setUploadedData] = useState<UploadedData[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>();
  const [selectedMonth, setSelectedMonth] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [apiResponse, setApiResponse] = useState<{
    message?: string;
    recordsProcessed?: number;
    errors?: string[];
  } | null>(null);

  useEffect(() => {
    const { month, year } = getNextMonthAndYear();
    setSelectedMonth(month);
    setSelectedYear(year);
  }, []);

  useEffect(() => {
    const fetchOffering = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/offerings/${selectedMonth}/${selectedYear}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();

        setUploadedData(data?.data);
      } catch (error) {
        console.error("The error is = ", error);
      }
    };
    fetchOffering();
  }, [selectedMonth, selectedYear]);

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
        throw new Error(errorMessage);
      }

      if (data.data && Array.isArray(data.data)) {
        setUploadedData(data.data);
      }

      setApiResponse({
        message: data.message || "File processed successfully",
        recordsProcessed: data.data?.length || 0,
        errors: data.errors || [],
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
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
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
      case "success":
        return "Upload completed successfully";
      case "error":
        return "Upload failed";
      default:
        return "Drop Excel file here or click to browse";
    }
  };

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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Year:
                </label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger id="year-select" className="w-[100px]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Month:
                </label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="month-select" className="w-[140px]">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  isDragOver
                    ? "border-blue-400 bg-blue-50"
                    : uploadStatus.status === "success"
                    ? "border-green-400 bg-green-50"
                    : uploadStatus.status === "error"
                    ? "border-red-400 bg-red-50"
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

                <div className="flex flex-col items-center space-y-4">
                  {getStatusIcon()}
                  <div>
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
                  <div className="text-center space-y-3">
                    <div className="text-green-600">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-sm font-medium">
                        {apiResponse.message}
                      </div>
                      <div className="text-xs mt-1">
                        {apiResponse.recordsProcessed} records processed
                      </div>
                    </div>
                    {apiResponse.errors && apiResponse.errors?.length > 0 && (
                      <div className="text-left">
                        <div className="text-xs font-medium text-amber-600 mb-1">
                          Warnings:
                        </div>
                        <div className="text-xs text-amber-600 space-y-1">
                          {apiResponse.errors.map((error, index) => (
                            <div key={index} className="flex items-start gap-1">
                              <span className="text-amber-500">•</span>
                              <span>{error}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : uploadStatus.status === "uploading" ||
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
                  <div className="border rounded-lg p-6 max-h-60 overflow-y-auto">
                    <div className="flex items-center mb-3">
                      <AlertCircle className="w-5 h-5 mr-2 text-red-600 flex-shrink-0" />
                      <div className="text-sm font-medium text-red-600">
                        Upload Failed
                      </div>
                    </div>

                    <div className="text-xs text-gray-700 space-y-1">
                      {uploadStatus.error?.split("\n").map((line, index) => (
                        <div key={index} className="leading-relaxed">
                          {line.trim() && (
                            <>
                              {line.startsWith("1.") ||
                              line.startsWith("2.") ||
                              line.startsWith("3.") ||
                              line.startsWith("4.") ||
                              line.startsWith("5.") ||
                              line.startsWith("6.") ||
                              line.startsWith("7.") ||
                              line.startsWith("8.") ||
                              line.startsWith("9.") ||
                              /^\d+\./.test(line) ? (
                                <div className="flex items-start gap-2 mt-2">
                                  <span className="text-red-500 font-mono text-xs">
                                    •
                                  </span>
                                  <span className="font-mono">{line}</span>
                                </div>
                              ) : (
                                <div
                                  className={index === 0 ? "font-medium" : ""}
                                >
                                  {line}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Offerings</CardTitle>
              <div className="flex space-x-2"></div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

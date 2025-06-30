"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CloudUpload,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShoppingCart,
  Server,
  GanttChart,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Server Action for handling file upload
async function uploadFileAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const option = formData.get("type") as string;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file type
    if (!file.name.endsWith(".xlsx")) {
      return { success: false, error: "Only .xlsx files are supported" };
    }

    const newFormData = new FormData();
    newFormData.append("file", formData.get("file") as File);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/upload/${option}`,
      {
        method: "POST",
        body: newFormData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    // Handle successful response
    return {
      success: true,
      message: result.message || `Successfully processed ${file.name}`,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

// Upload status types
type UploadStatus = "idle" | "success" | "error" | "pending";

// Card data type
interface UploadCardData {
  id: string;
  title: string;
  description: string;
  status: UploadStatus;
  lastUploaded: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  icon: React.ReactNode;
  result: string | null;
}

function UploadCards() {
  // Create refs outside of state
  const SalesInputRef = useRef<HTMLInputElement>(null);
  const StocksInputRef = useRef<HTMLInputElement>(null);
  const ProductionInputRef = useRef<HTMLInputElement>(null);
  const ProductionPlanInputRef = useRef<HTMLInputElement>(null);

  // Initial card data
  const [cards, setCards] = useState<UploadCardData[]>([
    {
      id: "sales",
      title: "Sales",
      description: "Upload Sales information spreadsheet",
      status: "idle",
      lastUploaded: null,
      inputRef: SalesInputRef,
      icon: <ShoppingCart className="h-5 w-5" />,
      result: null,
    },
    {
      id: "stocks",
      title: "Stocks",
      description: "Upload Stocks information spreadsheet",
      status: "idle",
      lastUploaded: null,
      inputRef: StocksInputRef,
      icon: <DollarSign className="h-5 w-5" />,
      result: null,
    },
    {
      id: "production",
      title: "Production",
      description: "Upload Production information spreadsheet",
      status: "idle",
      lastUploaded: null,
      inputRef: ProductionInputRef,
      icon: <Server className="h-5 w-5" />,
      result: null,
    },
    {
      id: "production_plan",
      title: "Production Plan",
      description: "Upload Production Plans information spreadsheet",
      status: "idle",
      lastUploaded: null,
      inputRef: ProductionPlanInputRef,
      icon: <GanttChart className="h-5 w-5" />,
      result: null,
    },
  ]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = async (
    cardId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx")) {
      alert("Only .xlsx files are supported");
      return;
    }

    // Set status to pending immediately
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? { ...card, status: "pending" as UploadStatus, result: null }
          : card
      )
    );

    try {
      // Create FormData with file and type
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", cardId);

      // Call the server action
      const result = await uploadFileAction(formData);

      if (result.success) {
        setCards((prev) =>
          prev.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  status: "success" as UploadStatus,
                  result: result.message,
                  lastUploaded: new Date().toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  }),
                }
              : card
          )
        );
      } else {
        setCards((prev) =>
          prev.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  status: "error" as UploadStatus,
                  result: result.error || null,
                }
              : card
          )
        );
      }
    } catch (error) {
      setCards((prev) =>
        prev.map((card) =>
          card.id === cardId
            ? {
                ...card,
                status: "error" as UploadStatus,
                result: `Error: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
              }
            : card
        )
      );
    }

    // Clear the input
    e.target.value = "";
  };

  const handleFileDrop = async (
    cardId: string,
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx")) {
      alert("Only .xlsx files are supported");
      return;
    }

    // Set status to pending immediately
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? { ...card, status: "pending" as UploadStatus, result: null }
          : card
      )
    );

    try {
      // Create FormData with file and type
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", cardId);

      // Call the server action
      const result = await uploadFileAction(formData);

      if (result.success) {
        setCards((prev) =>
          prev.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  status: "success" as UploadStatus,
                  result: result.message,
                  lastUploaded: new Date().toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  }),
                }
              : card
          )
        );
      } else {
        setCards((prev) =>
          prev.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  status: "error" as UploadStatus,
                  result: result.error || null,
                }
              : card
          )
        );
      }
    } catch (error) {
      setCards((prev) =>
        prev.map((card) =>
          card.id === cardId
            ? {
                ...card,
                status: "error" as UploadStatus,
                result: `Error: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
              }
            : card
        )
      );
    }
  };

  const getStatusBadge = (status: UploadStatus) => {
    switch (status) {
      case "success":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case "error":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"
          >
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col items-center justify-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Data Upload Center</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Upload your Excel files to update your business data. Click on a card
          or drag and drop files.
        </p>
      </div>

      <div className="flex flex-col space-y-6">
        {cards.map((card) => (
          <Card
            key={card.id}
            className="overflow-hidden border-l-4 transition-all hover:shadow-md"
            style={{
              borderLeftColor:
                card.status === "success"
                  ? "var(--green-500)"
                  : card.status === "error"
                  ? "var(--red-500)"
                  : card.status === "pending"
                  ? "var(--yellow-500)"
                  : "var(--border)",
            }}
          >
            <div className="grid md:grid-cols-[1fr_1fr]">
              {/* Upload Section */}
              <div className="p-5 border-r border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    {card.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-medium">
                      {card.title}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {card.description}
                    </CardDescription>
                  </div>
                  <div className="ml-auto">{getStatusBadge(card.status)}</div>
                </div>

                {card.lastUploaded && (
                  <div className="flex items-center text-xs text-muted-foreground mb-4">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Last uploaded: {card.lastUploaded}</span>
                  </div>
                )}

                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center flex flex-col items-center justify-center min-h-[180px] transition-colors duration-200",
                    "border-gray-300 dark:border-gray-600 hover:border-primary/50 cursor-pointer",
                    card.status === "pending"
                      ? "opacity-50 pointer-events-none"
                      : ""
                  )}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleFileDrop(card.id, e)}
                  onClick={() => card.inputRef.current?.click()}
                >
                  <CloudUpload className="h-12 w-12 mb-3 text-primary/80" />
                  <p className="text-base font-medium mb-2">
                    Drop Excel file here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    (.xlsx files only)
                  </p>
                  {card.status === "pending" && (
                    <p className="text-xs text-muted-foreground mt-4">
                      Processing file...
                    </p>
                  )}

                  <input
                    type="file"
                    ref={card.inputRef}
                    onChange={(e) => handleFileChange(card.id, e)}
                    accept=".xlsx"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Results Section */}
              <div className="p-5 bg-muted/10">
                <div className="flex items-center mb-4">
                  <h3 className="text-base font-medium">Processing Results</h3>
                  {card.status === "pending" && (
                    <Badge variant="outline" className="ml-auto animate-pulse">
                      <Clock className="h-3 w-3 mr-1" />
                      Processing...
                    </Badge>
                  )}
                </div>

                {card.status === "pending" ? (
                  <div className="flex flex-col items-center justify-center h-[180px] text-center">
                    <div className="animate-spin mb-4">
                      <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">Processing your file</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Calling API...
                    </p>
                  </div>
                ) : card.result ? (
                  <div className="p-4 bg-background rounded-lg border border-border/50 h-[180px] flex items-center">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        {card.status === "success" ? (
                          <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                        )}
                        <h4 className="font-medium">
                          {card.status === "success"
                            ? "Upload Successful"
                            : "Upload Failed"}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {card.result}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[180px] text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">
                      No results to display
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">
                      Upload a file to see processing results
                    </p>
                  </div>
                )}
              </div>
            </div>

            {card.status === "pending" && (
              <Progress value={50} className="h-1 rounded-none animate-pulse" />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default UploadCards;

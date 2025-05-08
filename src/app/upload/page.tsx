"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  X,
  FileSpreadsheet,
  CloudUpload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Upload status types
type UploadStatus = "idle" | "success" | "error" | "pending";

// Card data type
interface UploadCardData {
  id: string;
  title: string;
  description: string;
  file: File | null;
  fileName: string;
  fileSize: string;
  status: UploadStatus;
  lastUploaded: string;
  inputRef: React.RefObject<HTMLInputElement>;
  icon: React.ReactNode;
  result: string | null;
}

function UploadCards() {
  // Create refs outside of state
  // const customerInputRef = useRef<HTMLInputElement>(null);
  const customerInputRef = useRef<HTMLInputElement>(undefined!);
  const productInputRef = useRef<HTMLInputElement>(undefined!);
  const orderInputRef = useRef<HTMLInputElement>(undefined!);
  const inventoryInputRef = useRef<HTMLInputElement>(undefined!);

  // Dummy last uploaded dates
  const dummyDates = [
    "May 5, 2025 - 10:23 AM",
    "May 2, 2025 - 3:45 PM",
    "Apr 28, 2025 - 9:12 AM",
    "Apr 25, 2025 - 2:30 PM",
  ];

  // Dummy result data
  const dummyResults = {
    customer:
      "All customer records processed successfully. 1,250 records processed: 320 new customers added, 930 updated.",
    product:
      "842 of 845 products processed. 3 products had invalid SKUs. 145 new products added, 697 updated.",
    order:
      "2,130 of 2,156 orders processed. 26 orders had missing customer IDs and were skipped.",
    inventory:
      "All 752 inventory records updated successfully. 52 items flagged as low in stock.",
  };

  // Initial card data
  const [cards, setCards] = useState<UploadCardData[]>([
    {
      id: "customer",
      title: "Customer Data",
      description: "Upload customer information spreadsheet",
      file: null,
      fileName: "",
      fileSize: "",
      status: "idle",
      lastUploaded: dummyDates[0],
      inputRef: customerInputRef,
      icon: <Users className="h-5 w-5" />,
      result: null,
    },
    {
      id: "product",
      title: "Product Catalog",
      description: "Upload product inventory and details",
      file: null,
      fileName: "",
      fileSize: "",
      status: "success",
      lastUploaded: dummyDates[1],
      inputRef: productInputRef,
      icon: <Package className="h-5 w-5" />,
      result: dummyResults.product,
    },
    {
      id: "order",
      title: "Order History",
      description: "Upload order data and transactions",
      file: null,
      fileName: "",
      fileSize: "",
      status: "error",
      lastUploaded: dummyDates[2],
      inputRef: orderInputRef,
      icon: <ShoppingCart className="h-5 w-5" />,
      result: dummyResults.order,
    },
    {
      id: "inventory",
      title: "Inventory Status",
      description: "Upload current inventory levels",
      file: null,
      fileName: "",
      fileSize: "",
      status: "success",
      lastUploaded: dummyDates[3],
      inputRef: inventoryInputRef,
      icon: <BarChart3 className="h-5 w-5" />,
      result: dummyResults.inventory,
    },
  ]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
    );
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = (
    cardId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.name.endsWith(".xlsx")) {
        alert("Only .xlsx files are supported");
        return;
      }

      setCards(
        cards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                file: file,
                fileName: file.name,
                fileSize: formatFileSize(file.size),
              }
            : card
        )
      );

      // Automatically trigger upload when file is selected
      setTimeout(() => {
        uploadFile(cardId);
      }, 100);
    }
  };

  const handleFileDrop = (
    cardId: string,
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.name.endsWith(".xlsx")) {
        alert("Only .xlsx files are supported");
        return;
      }

      setCards(
        cards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                file: file,
                fileName: file.name,
                fileSize: formatFileSize(file.size),
              }
            : card
        )
      );

      // Automatically trigger upload when file is dropped
      setTimeout(() => {
        uploadFile(cardId);
      }, 100);
    }
  };

  const removeFile = (cardId: string) => {
    setCards(
      cards.map((card) =>
        card.id === cardId
          ? {
              ...card,
              file: null,
              fileName: "",
              fileSize: "",
            }
          : card
      )
    );
  };

  const uploadFile = async (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);

    if (!card || !card.file) {
      alert("No file selected");
      return;
    }

    // Set status to pending
    setCards(
      cards.map((c) =>
        c.id === cardId
          ? {
              ...c,
              status: "pending",
              result: null,
            }
          : c
      )
    );

    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Get dummy result data for this card
      const result = dummyResults[cardId as keyof typeof dummyResults];

      // Update status to success and update last uploaded time
      setCards(
        cards.map((c) =>
          c.id === cardId
            ? {
                ...c,
                status: "success",
                lastUploaded: new Date().toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }),
                file: null,
                fileName: "",
                fileSize: "",
                result: result,
              }
            : c
        )
      );
    } catch (error) {
      // Update status to error
      setCards(
        cards.map((c) =>
          c.id === cardId
            ? {
                ...c,
                status: "error",
                result: `Error: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
              }
            : c
        )
      );

      console.error("Upload error:", error);
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

                <div className="flex items-center text-xs text-muted-foreground mb-4">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Last uploaded: {card.lastUploaded}</span>
                </div>

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
                  {!card.file ? (
                    <>
                      <CloudUpload className="h-12 w-12 mb-3 text-primary/80" />
                      <p className="text-base font-medium mb-2">
                        Drop Excel file here or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground">
                        (.xlsx files only)
                      </p>
                      {card.status === "idle" && (
                        <p className="text-xs text-muted-foreground mt-4">
                          Files will be uploaded automatically when selected
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="w-full">
                      <div className="flex items-center justify-between border rounded-md p-3 px-4 text-sm bg-background/50">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <FileSpreadsheet className="h-5 w-5 flex-shrink-0 text-green-500" />
                          <span className="truncate">
                            {card.fileName} - {card.fileSize}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(card.id);
                          }}
                          className="h-7 w-7 rounded-full flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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

              {/* Results Section - Simplified */}
              <div className="p-5 bg-muted/10">
                <div className="flex items-center mb-4">
                  <h3 className="text-base font-medium">Results</h3>
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
                      This may take a few moments...
                    </p>
                    <Progress value={45} className="h-1 w-full mt-4" />
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
              <Progress value={45} className="h-1 rounded-none" />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default UploadCards;

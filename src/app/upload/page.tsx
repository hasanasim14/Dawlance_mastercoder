"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  X,
  FileSpreadsheet,
  CloudUpload,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
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
  // inputRef: React.RefObject<HTMLInputElement>;
  inputRef: React.RefObject<HTMLInputElement>;
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
            }
          : c
      )
    );

    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

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
              }
            : c
        )
      );

      // Show success message
      alert(`Successfully uploaded file to ${card.title} endpoint`);
    } catch (error) {
      // Update status to error
      setCards(
        cards.map((c) =>
          c.id === cardId
            ? {
                ...c,
                status: "error",
              }
            : c
        )
      );

      console.error("Upload error:", error);
      alert(
        `Error uploading file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
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
    <div className="w-full max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex flex-col items-center justify-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Data Upload Center</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Upload your Excel files to update your business data. Click on a card
          or drag and drop files.
        </p>
      </div>

      <div className="flex flex-col space-y-4">
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
            <div className="grid md:grid-cols-[1fr_auto]">
              <div>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-medium">
                        {card.title}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {card.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(card.status)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-2">
                  <div className="flex items-center text-xs text-muted-foreground mb-3">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Last uploaded: {card.lastUploaded}</span>
                  </div>

                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-4 text-center flex flex-col items-center justify-center min-h-[120px] transition-colors duration-200",
                      "border-gray-300 dark:border-gray-600 hover:border-primary/50 cursor-pointer"
                    )}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleFileDrop(card.id, e)}
                    onClick={() => card.inputRef.current?.click()}
                  >
                    {!card.file ? (
                      <>
                        <CloudUpload className="h-8 w-8 mb-2 text-primary/80" />
                        <p className="text-sm font-medium mb-1">
                          Drop Excel file here or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                          (.xlsx files only)
                        </p>
                      </>
                    ) : (
                      <div className="w-full">
                        <div className="flex items-center justify-between border rounded-md p-2 px-3 text-sm bg-background/50">
                          <div className="flex items-center gap-2 truncate pr-2">
                            <FileSpreadsheet className="h-4 w-4 flex-shrink-0 text-green-500" />
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
                            className="h-6 w-6 rounded-full flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
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
                </CardContent>
              </div>

              <div className="flex items-center justify-center p-4 bg-muted/20">
                <Button
                  onClick={() => uploadFile(card.id)}
                  disabled={!card.file || card.status === "pending"}
                  className="h-10 px-4"
                  variant={card.file ? "default" : "outline"}
                >
                  {card.status === "pending" ? (
                    <>
                      <span className="animate-spin mr-2">
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
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
                      </span>
                      Processing
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" /> Upload
                    </>
                  )}
                </Button>
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

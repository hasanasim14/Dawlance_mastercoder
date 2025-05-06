"use client";

import React, { useState } from "react";
// import { put } from "@vercel/blob";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
//   Button,
//   Progress,
//   toast,
// } from "@/components/ui";
import { FileIcon, Trash2Icon, UploadIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// File type for each upload slot
type FileSlot = {
  id: number;
  name: string;
  url: string | null;
  file: File | null;
};

// Main component that handles the entire file upload module
export default function ExcelFileUploader() {
  const [fileSlots, setFileSlots] = useState<FileSlot[]>([
    { id: 1, name: "Excel Document 1", url: null, file: null },
    { id: 2, name: "Excel Document 2", url: null, file: null },
    { id: 3, name: "Excel Document 3", url: null, file: null },
    { id: 4, name: "Excel Document 4", url: null, file: null },
  ]);

  // Handle file upload completion
  const handleFileUploaded = (id: number, url: string, file: File) => {
    setFileSlots(
      fileSlots.map((slot) => (slot.id === id ? { ...slot, url, file } : slot))
    );
  };

  // Handle file removal
  const handleRemoveFile = (id: number) => {
    setFileSlots(
      fileSlots.map((slot) =>
        slot.id === id ? { ...slot, url: null, file: null } : slot
      )
    );
  };

  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Excel File Upload System</h1>
      <p className="text-gray-600 mb-8">
        Upload your Excel files one at a time. You can upload up to 4 different
        files.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {fileSlots.map((slot) => (
          <Card key={slot.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-lg">{slot.name}</CardTitle>
              <CardDescription>
                {slot.file ? `File: ${slot.file.name}` : "No file uploaded yet"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {slot.url ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/30">
                    <FileIcon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium truncate flex-1">
                      {slot.file?.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFile(slot.id)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <FileUploader
                  onFileUploaded={(url, file) =>
                    handleFileUploaded(slot.id, url, file)
                  }
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

// File uploader component for individual slots
function FileUploader({
  onFileUploaded,
}: {
  onFileUploaded: (url: string, file: File) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Check if file is an Excel file
      const isExcel =
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".xls");

      if (!isExcel) {
        setError("Only Excel files (.xlsx, .xls) are allowed");
        return;
      }

      setFile(selectedFile);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);

      // In a real implementation, this would use the server action
      // For this example, we're simulating the upload
      // const url = await uploadFile(file)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create a fake URL for demonstration
      const url = URL.createObjectURL(file);

      clearInterval(progressInterval);
      setProgress(100);

      onFileUploaded(url, file);

      // Show success toast (in a real app)
      console.log("File uploaded successfully:", file.name);
    } catch (error) {
      setError("There was an error uploading your file.");
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 ${
          file ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25"
        }`}
      >
        {file ? (
          <div className="flex items-center gap-2 text-sm">
            <FileIcon className="h-5 w-5 text-primary" />
            <span className="font-medium truncate max-w-[200px]">
              {file.name}
            </span>
          </div>
        ) : (
          <>
            <UploadIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Drag and drop your Excel file here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Only Excel files (.xlsx, .xls) are accepted
            </p>
          </>
        )}
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          disabled={uploading}
          accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {progress > 0 && (
        <div className="w-full">
          <Progress value={progress} className="h-2 w-full" />
          <p className="text-xs text-right mt-1">{progress}%</p>
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full"
      >
        {uploading ? "Uploading..." : "Upload Excel File"}
      </Button>
    </div>
  );
}

// Server action for file upload (in a real implementation)
// This would be in a separate file in a real app, but included here for completeness
// async function uploadFile(file: File): Promise<string> {
//   try {
//     const filename = `excel-${Date.now()}-${file.name}`;
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     const blob = await put(filename, buffer, {
//       access: "public",
//       contentType: file.type,
//     });

//     return blob.url;
//   } catch (error) {
//     console.error("Error uploading file:", error);
//     throw new Error("Failed to upload file");
//   }
// }

// Mock Progress component for the single file example
function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div
      className={`relative h-4 w-full overflow-hidden rounded-full bg-secondary ${className}`}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
}

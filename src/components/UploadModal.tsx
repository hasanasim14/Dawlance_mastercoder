"use client";

import type React from "react";

import { useState, useRef } from "react";
import { X, Plus, FileSpreadsheet, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";

type UploadedFile = {
  id: string;
  name: string;
  size: string;
  file: File;
};

export function UploadModal() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => file.name.endsWith(".xlsx"));

    if (validFiles.length !== newFiles.length) {
      alert("Only .xlsx files are supported");
    }

    const newUploadedFiles = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: formatFileSize(file.size),
      file: file,
    }));

    setFiles((prev) => [...prev, ...newUploadedFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

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
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    // Here you would implement the actual upload logic
    console.log("Files to upload:", files);
    // Example: Upload to Vercel Blob or your backend
    alert(`Uploading ${files.length} files`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Modal</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-3xl w-[90vw] p-2 md:p-6 space-y-4 md:space-y-6 overflow-y-auto max-h-[90vh]">
        <CardHeader className="p-0 mb-0">
          <CardTitle className="text-lg md:text-xl text-center font-semibold">
            Upload Files to get started
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-3 md:p-6 text-center flex flex-col items-center justify-center min-h-[150px] md:min-h-[200px] transition-colors duration-200",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-gray-300 dark:border-gray-600 hover:border-primary/50 cursor-pointer",
              files.length > 0 ? "py-2 md:py-4" : "py-6 md:py-10"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {files.length === 0 ? (
              <>
                <CloudUpload className="h-8 w-8 md:h-12 md:w-12 mb-2 md:mb-4 text-primary/80" />
                <p className="text-base md:text-lg font-medium mb-1 md:mb-2">
                  Drag and drop to upload files
                </p>
                <div className="flex items-center gap-2 my-1 md:my-2">
                  <div className="h-px bg-gray-300 dark:bg-gray-700 w-16 md:w-24" />
                  <span className="text-sm md:text-base text-muted-foreground">
                    or
                  </span>
                  <div className="h-px bg-gray-300 dark:bg-gray-700 w-16 md:w-24" />
                </div>
                <Button
                  variant="outline"
                  onClick={handleBrowseClick}
                  className="text-sm md:text-base py-1 px-3 md:py-2 md:px-4 mt-1"
                >
                  Browse
                </Button>

                <div className="mt-2 md:mt-4 text-xs md:text-sm text-muted-foreground">
                  <p>File size limit: 250MB</p>
                  <p>Supported formats: xlsx</p>
                </div>
              </>
            ) : (
              <div className="w-full space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between border rounded-md p-1.5 md:p-2.5 px-3 md:px-4 text-sm md:text-base bg-background/50 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <FileSpreadsheet className="h-4 w-4 flex-shrink-0 text-green-500" />
                      <span className="truncate">
                        {file.name} - {file.size}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.id)}
                      className="h-6 w-6 rounded-full flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBrowseClick}
                    className="text-sm"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add More
                  </Button>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx"
              multiple
              className="hidden"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 md:gap-3 border-t pt-3 md:pt-4 p-0 md:p-2 mb-0">
          <Button
            variant="outline"
            className="text-sm md:text-base py-1.5 px-3 md:py-2 md:px-4"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0}
            className="text-sm md:text-base py-1.5 px-3 md:py-2 md:px-4"
          >
            Next
          </Button>
        </CardFooter>
      </DialogContent>
    </Dialog>
  );
}

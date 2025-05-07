"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { X, FileSpreadsheet, CloudUpload, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadCards() {
  // Customer Card State
  const [customerFile, setCustomerFile] = useState<File | null>(null);
  const [customerFileName, setCustomerFileName] = useState("");
  const [customerFileSize, setCustomerFileSize] = useState("");
  const customerFileInputRef = useRef<HTMLInputElement>(null);

  // Product Card State
  const [productFile, setProductFile] = useState<File | null>(null);
  const [productFileName, setProductFileName] = useState("");
  const [productFileSize, setProductFileSize] = useState("");
  const productFileInputRef = useRef<HTMLInputElement>(null);

  // Order Card State
  const [orderFile, setOrderFile] = useState<File | null>(null);
  const [orderFileName, setOrderFileName] = useState("");
  const [orderFileSize, setOrderFileSize] = useState("");
  const orderFileInputRef = useRef<HTMLInputElement>(null);

  // Inventory Card State
  const [inventoryFile, setInventoryFile] = useState<File | null>(null);
  const [inventoryFileName, setInventoryFileName] = useState("");
  const [inventoryFileSize, setInventoryFileSize] = useState("");
  const inventoryFileInputRef = useRef<HTMLInputElement>(null);

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

  // Customer Card Functions
  const handleCustomerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.name.endsWith(".xlsx")) {
        alert("Only .xlsx files are supported");
        return;
      }
      setCustomerFile(file);
      setCustomerFileName(file.name);
      setCustomerFileSize(formatFileSize(file.size));
    }
  };

  const handleCustomerDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.name.endsWith(".xlsx")) {
        alert("Only .xlsx files are supported");
        return;
      }
      setCustomerFile(file);
      setCustomerFileName(file.name);
      setCustomerFileSize(formatFileSize(file.size));
    }
  };

  const removeCustomerFile = () => {
    setCustomerFile(null);
    setCustomerFileName("");
    setCustomerFileSize("");
  };

  const uploadCustomerFile = async () => {
    if (!customerFile) {
      alert("No file selected");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", customerFile);
      // Uncomment to implement actual API call
      // const response = await fetch("/api/upload/customers", {
      //   method: 'POST',
      //   body: formData,
      // });
      // if (!response.ok) throw new Error('Upload failed');
      alert(
        `Successfully uploaded ${customerFileName} to Customer Data endpoint`
      );
      removeCustomerFile();
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        `Error uploading file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Product Card Functions
  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.name.endsWith(".xlsx")) {
        alert("Only .xlsx files are supported");
        return;
      }
      setProductFile(file);
      setProductFileName(file.name);
      setProductFileSize(formatFileSize(file.size));
    }
  };

  const handleProductDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.name.endsWith(".xlsx")) {
        alert("Only .xlsx files are supported");
        return;
      }
      setProductFile(file);
      setProductFileName(file.name);
      setProductFileSize(formatFileSize(file.size));
    }
  };

  const removeProductFile = () => {
    setProductFile(null);
    setProductFileName("");
    setProductFileSize("");
  };

  const uploadProductFile = async () => {
    if (!productFile) {
      alert("No file selected");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", productFile);
      // Uncomment to implement actual API call
      // const response = await fetch("/api/upload/products", {
      //   method: 'POST',
      //   body: formData,
      // });
      // if (!response.ok) throw new Error('Upload failed');
      alert(
        `Successfully uploaded ${productFileName} to Product Catalog endpoint`
      );
      removeProductFile();
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        `Error uploading file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Order Card Functions
  const handleOrderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.name.endsWith(".xlsx")) {
        alert("Only .xlsx files are supported");
        return;
      }
      setOrderFile(file);
      setOrderFileName(file.name);
      setOrderFileSize(formatFileSize(file.size));
    }
  };

  const handleOrderDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.name.endsWith(".xlsx")) {
        alert("Only .xlsx files are supported");
        return;
      }
      setOrderFile(file);
      setOrderFileName(file.name);
      setOrderFileSize(formatFileSize(file.size));
    }
  };

  const removeOrderFile = () => {
    setOrderFile(null);
    setOrderFileName("");
    setOrderFileSize("");
  };

  const uploadOrderFile = async () => {
    if (!orderFile) {
      alert("No file selected");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", orderFile);
      // Uncomment to implement actual API call
      // const response = await fetch("/api/upload/orders", {
      //   method: 'POST',
      //   body: formData,
      // });
      // if (!response.ok) throw new Error('Upload failed');
      alert(`Successfully uploaded ${orderFileName} to Order History endpoint`);
      removeOrderFile();
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        `Error uploading file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Inventory Card Functions
  const handleInventoryFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.name.endsWith(".xlsx")) {
        alert("Only .xlsx files are supported");
        return;
      }
      setInventoryFile(file);
      setInventoryFileName(file.name);
      setInventoryFileSize(formatFileSize(file.size));
    }
  };

  const handleInventoryDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.name.endsWith(".xlsx")) {
        alert("Only .xlsx files are supported");
        return;
      }
      setInventoryFile(file);
      setInventoryFileName(file.name);
      setInventoryFileSize(formatFileSize(file.size));
    }
  };

  const removeInventoryFile = () => {
    setInventoryFile(null);
    setInventoryFileName("");
    setInventoryFileSize("");
  };

  const uploadInventoryFile = async () => {
    if (!inventoryFile) {
      alert("No file selected");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", inventoryFile);
      // Uncomment to implement actual API call
      // const response = await fetch("/api/upload/inventory", {
      //   method: 'POST',
      //   body: formData,
      // });
      // if (!response.ok) throw new Error('Upload failed');
      alert(
        `Successfully uploaded ${inventoryFileName} to Inventory Status endpoint`
      );
      removeInventoryFile();
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        `Error uploading file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-6">
        Upload Excel Files
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customer Card */}
        <Card className="overflow-hidden">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-medium">Customer Data</CardTitle>
            <CardDescription className="text-xs">
              Upload customer information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-2 text-center flex flex-col items-center justify-center min-h-[100px] transition-colors duration-200",
                "border-gray-300 dark:border-gray-600 hover:border-primary/50 cursor-pointer"
              )}
              onDragOver={handleDragOver}
              onDrop={handleCustomerDrop}
              onClick={() => customerFileInputRef.current?.click()}
            >
              {!customerFile ? (
                <>
                  <CloudUpload className="h-6 w-6 mb-1 text-primary/80" />
                  <p className="text-xs font-medium mb-0.5">
                    Drop Excel file here
                  </p>
                  <p className="text-xs text-muted-foreground">(.xlsx only)</p>
                </>
              ) : (
                <div className="w-full">
                  <div className="flex items-center justify-between border rounded-md p-1 px-2 text-xs bg-background/50">
                    <div className="flex items-center gap-1 truncate pr-1">
                      <FileSpreadsheet className="h-3 w-3 flex-shrink-0 text-green-500" />
                      <span className="truncate">
                        {customerFileName} - {customerFileSize}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCustomerFile();
                      }}
                      className="h-5 w-5 rounded-full flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={customerFileInputRef}
                onChange={handleCustomerFileChange}
                accept=".xlsx"
                className="hidden"
              />
            </div>
          </CardContent>
          <CardFooter className="p-3 pt-0 flex justify-end">
            <Button
              onClick={uploadCustomerFile}
              disabled={!customerFile}
              size="sm"
              className="text-xs h-7 px-2"
            >
              <Upload className="h-3 w-3 mr-1" /> Upload
            </Button>
          </CardFooter>
        </Card>

        {/* Product Card */}
        <Card className="overflow-hidden">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-medium">
              Product Catalog
            </CardTitle>
            <CardDescription className="text-xs">
              Upload product inventory
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-2 text-center flex flex-col items-center justify-center min-h-[100px] transition-colors duration-200",
                "border-gray-300 dark:border-gray-600 hover:border-primary/50 cursor-pointer"
              )}
              onDragOver={handleDragOver}
              onDrop={handleProductDrop}
              onClick={() => productFileInputRef.current?.click()}
            >
              {!productFile ? (
                <>
                  <CloudUpload className="h-6 w-6 mb-1 text-primary/80" />
                  <p className="text-xs font-medium mb-0.5">
                    Drop Excel file here
                  </p>
                  <p className="text-xs text-muted-foreground">(.xlsx only)</p>
                </>
              ) : (
                <div className="w-full">
                  <div className="flex items-center justify-between border rounded-md p-1 px-2 text-xs bg-background/50">
                    <div className="flex items-center gap-1 truncate pr-1">
                      <FileSpreadsheet className="h-3 w-3 flex-shrink-0 text-green-500" />
                      <span className="truncate">
                        {productFileName} - {productFileSize}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeProductFile();
                      }}
                      className="h-5 w-5 rounded-full flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={productFileInputRef}
                onChange={handleProductFileChange}
                accept=".xlsx"
                className="hidden"
              />
            </div>
          </CardContent>
          <CardFooter className="p-3 pt-0 flex justify-end">
            <Button
              onClick={uploadProductFile}
              disabled={!productFile}
              size="sm"
              className="text-xs h-7 px-2"
            >
              <Upload className="h-3 w-3 mr-1" /> Upload
            </Button>
          </CardFooter>
        </Card>

        {/* Order Card */}
        <Card className="overflow-hidden">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-medium">Order History</CardTitle>
            <CardDescription className="text-xs">
              Upload order data
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-2 text-center flex flex-col items-center justify-center min-h-[100px] transition-colors duration-200",
                "border-gray-300 dark:border-gray-600 hover:border-primary/50 cursor-pointer"
              )}
              onDragOver={handleDragOver}
              onDrop={handleOrderDrop}
              onClick={() => orderFileInputRef.current?.click()}
            >
              {!orderFile ? (
                <>
                  <CloudUpload className="h-6 w-6 mb-1 text-primary/80" />
                  <p className="text-xs font-medium mb-0.5">
                    Drop Excel file here
                  </p>
                  <p className="text-xs text-muted-foreground">(.xlsx only)</p>
                </>
              ) : (
                <div className="w-full">
                  <div className="flex items-center justify-between border rounded-md p-1 px-2 text-xs bg-background/50">
                    <div className="flex items-center gap-1 truncate pr-1">
                      <FileSpreadsheet className="h-3 w-3 flex-shrink-0 text-green-500" />
                      <span className="truncate">
                        {orderFileName} - {orderFileSize}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOrderFile();
                      }}
                      className="h-5 w-5 rounded-full flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={orderFileInputRef}
                onChange={handleOrderFileChange}
                accept=".xlsx"
                className="hidden"
              />
            </div>
          </CardContent>
          <CardFooter className="p-3 pt-0 flex justify-end">
            <Button
              onClick={uploadOrderFile}
              disabled={!orderFile}
              size="sm"
              className="text-xs h-7 px-2"
            >
              <Upload className="h-3 w-3 mr-1" /> Upload
            </Button>
          </CardFooter>
        </Card>

        {/* Inventory Card */}
        <Card className="overflow-hidden">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-medium">
              Inventory Status
            </CardTitle>
            <CardDescription className="text-xs">
              Upload inventory levels
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-2 text-center flex flex-col items-center justify-center min-h-[100px] transition-colors duration-200",
                "border-gray-300 dark:border-gray-600 hover:border-primary/50 cursor-pointer"
              )}
              onDragOver={handleDragOver}
              onDrop={handleInventoryDrop}
              onClick={() => inventoryFileInputRef.current?.click()}
            >
              {!inventoryFile ? (
                <>
                  <CloudUpload className="h-6 w-6 mb-1 text-primary/80" />
                  <p className="text-xs font-medium mb-0.5">
                    Drop Excel file here
                  </p>
                  <p className="text-xs text-muted-foreground">(.xlsx only)</p>
                </>
              ) : (
                <div className="w-full">
                  <div className="flex items-center justify-between border rounded-md p-1 px-2 text-xs bg-background/50">
                    <div className="flex items-center gap-1 truncate pr-1">
                      <FileSpreadsheet className="h-3 w-3 flex-shrink-0 text-green-500" />
                      <span className="truncate">
                        {inventoryFileName} - {inventoryFileSize}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeInventoryFile();
                      }}
                      className="h-5 w-5 rounded-full flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={inventoryFileInputRef}
                onChange={handleInventoryFileChange}
                accept=".xlsx"
                className="hidden"
              />
            </div>
          </CardContent>
          <CardFooter className="p-3 pt-0 flex justify-end">
            <Button
              onClick={uploadInventoryFile}
              disabled={!inventoryFile}
              size="sm"
              className="text-xs h-7 px-2"
            >
              <Upload className="h-3 w-3 mr-1" /> Upload
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default UploadCards;

"use client";

import { useState, useRef, useEffect } from "react";
import type React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, X, Loader2 } from "lucide-react";
import { transformToApiFormat } from "@/lib/data-transformers";
// import { useToast } from "@/hooks/use-toast";
// import { transformToApiFormat } from "@/lib/data-transformers";

interface FieldConfig {
  key: string;
  label: string;
  type?: "text" | "number" | "email" | "tel";
  required?: boolean;
  readOnly?: boolean;
}

interface RightSheetProps {
  children?: React.ReactNode;
  className?: string;
  selectedRow?: Record<string, any> | null;
  onReset?: () => void;
  onSave?: (data: Record<string, any>) => Promise<void>;
  title?: string;
  fields?: FieldConfig[];
  apiEndpoint?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function RightSheet({
  children,
  className,
  selectedRow,
  onReset,
  onSave,
  title = "Details",
  fields,
  apiEndpoint = "/api/save",
  isOpen,
  onClose,
}: RightSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  // const { toast } = useToast();

  // Auto-generate fields from selectedRow if not provided
  const effectiveFields =
    fields ||
    (selectedRow
      ? Object.keys(selectedRow).map((key) => ({
          key,
          label: key,
          type: "text" as const,
          required: false,
          readOnly: false,
        }))
      : []);

  // Effect to expand sheet when a row is selected
  useEffect(() => {
    const shouldBeOpen = isOpen !== undefined ? isOpen : !!selectedRow;
    if (shouldBeOpen) {
      setIsExpanded(true);
      // Initialize form data with selected row data
      if (selectedRow) {
        setFormData({ ...selectedRow });
        setHasChanges(false);
      }
    } else {
      setIsExpanded(false);
      setFormData({});
      setHasChanges(false);
    }
  }, [selectedRow, isOpen]);

  const toggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    // If collapsing, also clear the selected row
    if (!newExpandedState) {
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({});
    setHasChanges(false);
    onClose?.();
    onReset?.();
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [key]: value };
      // Check if there are changes compared to original data
      const hasDataChanges = selectedRow
        ? Object.keys(newData).some((k) => newData[k] !== selectedRow[k])
        : Object.values(newData).some((v) => v !== "");
      setHasChanges(hasDataChanges);
      return newData;
    });
  };

  const handleSave = async () => {
    if (!hasChanges) {
      // toast({
      //   title: "No changes",
      //   description: "No changes were made to save.",
      //   variant: "default",
      // });
      return;
    }

    setIsSaving(true);
    try {
      // Transform data to API format before sending
      const apiFormattedData = transformToApiFormat(formData);

      if (onSave) {
        // Use custom save handler if provided
        await onSave(apiFormattedData);
      } else {
        // Default API call
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiFormattedData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Save successful:", result);
      }

      // toast({
      //   title: "Success",
      //   description: "Changes saved successfully!",
      //   variant: "default",
      // });

      setHasChanges(false);
    } catch (error) {
      console.error("Error saving data:", error);
      // toast({
      //   title: "Error",
      //   description: "Failed to save changes. Please try again.",
      //   variant: "destructive",
      // });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (selectedRow) {
      setFormData({ ...selectedRow });
    } else {
      setFormData({});
    }
    setHasChanges(false);
    onReset?.();
  };

  const isVisible = isOpen !== undefined ? isOpen : !!selectedRow;

  return (
    <div
      ref={sheetRef}
      className={cn(
        "fixed top-0 bottom-0 right-0 z-50 bg-background border-l border-border rounded-l-xl shadow-lg transition-all duration-300 ease-in-out",
        isExpanded ? "w-[450px]" : "w-[6px]",
        className
      )}
      style={{
        transform: isVisible ? "translateX(0)" : "translateX(100%)",
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      {/* Handle and header */}
      <div
        className="cursor-pointer flex items-center justify-between p-4 border-b"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-1 bg-muted-foreground/30 rounded-full" />
          <h2 className="text-lg font-semibold truncate">
            {selectedRow && selectedRow["Master ID"]
              ? `Master ID: ${selectedRow["Master ID"]}`
              : title}
          </h2>
          {hasChanges && <div className="h-2 w-2 bg-orange-500 rounded-full" />}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
            className="h-8 w-8"
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                isExpanded ? "rotate-0" : "rotate-180"
              )}
            />
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div
        className={cn(
          "overflow-auto p-5 transition-all h-[calc(100%-130px)]",
          isExpanded ? "opacity-100" : "opacity-0"
        )}
      >
        {isVisible && effectiveFields.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {effectiveFields.map((field) => {
              if (field.key === "Master ID" && selectedRow) return null; // Skip Master ID as it's in the header

              return (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key.toLowerCase().replace(/\s+/g, "_")}>
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  <Input
                    id={field.key.toLowerCase().replace(/\s+/g, "_")}
                    type={field.type || "text"}
                    placeholder={field.label}
                    value={formData[field.key]?.toString() || ""}
                    onChange={(e) =>
                      handleInputChange(field.key, e.target.value)
                    }
                    readOnly={field.readOnly}
                    required={field.required}
                    className={cn(
                      field.readOnly && "bg-muted/40",
                      hasChanges &&
                        formData[field.key] !== selectedRow?.[field.key] &&
                        "border-orange-300"
                    )}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 py-10">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <X className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-center">Select a row to view details</p>
          </div>
        )}

        {children}
      </div>

      {/* Action buttons */}
      <div
        className={cn(
          "border-t p-4 flex justify-end gap-3 bg-background/80 backdrop-blur-sm transition-all absolute bottom-0 left-0 right-0",
          isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <Button
          variant="outline"
          disabled={!isVisible || isSaving}
          onClick={handleReset}
          className="flex-1"
        >
          Reset
        </Button>
        <Button
          disabled={!isVisible || !hasChanges || isSaving}
          onClick={handleSave}
          className="flex-1"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}

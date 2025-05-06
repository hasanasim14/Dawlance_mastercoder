"use client";

import { useState, useRef, useEffect } from "react";
import type React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronUp, X } from "lucide-react";

interface BottomSheetProps {
  children?: React.ReactNode;
  className?: string;
  selectedRow?: {
    "Master ID"?: number;
    Product?: string;
    Material?: string;
    "Material Description"?: string;
    "Measurement Instrument"?: string;
    "Colour Similarity"?: string;
    "Product type"?: string;
    Function?: string;
    Series?: string;
    Colour?: string;
    "Key Feature"?: string;
  } | null;
  onReset?: () => void;
  onSave?: () => void;
}

export function BottomSheet({
  children,
  className,
  selectedRow,
  onReset,
  onSave,
}: BottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Effect to expand sheet when a row is selected
  useEffect(() => {
    if (selectedRow) {
      setIsExpanded(true);
    }
  }, [selectedRow]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      ref={sheetRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-xl shadow-lg transition-all duration-300 ease-in-out",
        isExpanded ? "h-[60vh]" : "h-[60px]",
        className
      )}
      style={{
        transform: selectedRow ? "translateY(0)" : "translateY(100%)",
        opacity: selectedRow ? 1 : 0,
        pointerEvents: selectedRow ? "auto" : "none",
      }}
    >
      {/* Handle and header */}
      <div
        className="cursor-pointer flex items-center justify-between p-4 border-b"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          <h2 className="text-lg font-semibold truncate">
            {selectedRow ? `Master ID: ${selectedRow["Master ID"]}` : "Details"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="h-8 w-8"
          >
            <ChevronUp
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
          "overflow-auto p-5 transition-all",
          isExpanded ? "opacity-100 h-[calc(100%-60px)]" : "opacity-0 h-0"
        )}
      >
        {selectedRow ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(selectedRow).map(([key, value]) => {
              if (key === "Master ID") return null; // Skip Master ID as it's in the header

              return (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key.toLowerCase().replace(/\s+/g, "_")}>
                    {key}
                  </Label>
                  <Input
                    id={key.toLowerCase().replace(/\s+/g, "_")}
                    placeholder={key}
                    value={value?.toString() || ""}
                    readOnly
                    className="bg-muted/40"
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
          "border-t p-4 flex justify-end gap-3 bg-background/80 backdrop-blur-sm transition-all",
          isExpanded ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
        )}
      >
        <Button
          variant="outline"
          disabled={!selectedRow}
          onClick={onReset}
          className="min-w-[100px]"
        >
          Reset
        </Button>
        <Button
          disabled={!selectedRow}
          onClick={onSave}
          className="min-w-[100px]"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}

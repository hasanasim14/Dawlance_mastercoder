"use client";

import { useState, useRef, useEffect } from "react";
import type React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, X } from "lucide-react";

interface RightSheetProps {
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

export function RightSheet({
  children,
  className,
  selectedRow,
  onReset,
  onSave,
}: RightSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Effect to expand sheet when a row is selected
  useEffect(() => {
    if (selectedRow) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  }, [selectedRow]);

  const toggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    // If collapsing, also clear the selected row
    if (!newExpandedState) {
      onReset?.();
    }
  };

  return (
    <div
      ref={sheetRef}
      className={cn(
        "fixed top-0 bottom-0 right-0 z-50 bg-background border-l border-border rounded-l-xl shadow-lg transition-all duration-300 ease-in-out",
        isExpanded ? "w-[450px]" : "w-[6px]",
        className
      )}
      style={{
        transform: selectedRow ? "translateX(0)" : "translateX(100%)",
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
          <div className="h-10 w-1 bg-muted-foreground/30 rounded-full" />
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
        {selectedRow ? (
          <div className="grid grid-cols-1 gap-4">
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
          "border-t p-4 flex justify-end gap-3 bg-background/80 backdrop-blur-sm transition-all absolute bottom-0 left-0 right-0",
          isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <Button
          variant="outline"
          disabled={!selectedRow}
          onClick={onReset}
          className="flex-1"
        >
          Reset
        </Button>
        <Button disabled={!selectedRow} onClick={onSave} className="flex-1">
          Save Changes
        </Button>
      </div>
    </div>
  );
}

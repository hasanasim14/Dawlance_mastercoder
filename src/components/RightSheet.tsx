"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, X, Loader2 } from "lucide-react";
import { transformToApiFormat } from "@/lib/data-transformers";

interface MaterialOption {
  material: string;
}

interface MaterialDetails {
  material: string;
  material_description: string;
  product: string;
}

interface FieldConfig {
  key: string;
  label: string;
  type?: "text" | "number" | "email" | "tel";
  required?: boolean;
  readOnly?: boolean;
}

interface RightSheetProps {
  parent: string;
  children?: React.ReactNode;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedRow?: Record<string, any> | null;
  onReset?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave?: (data: Record<string, any>) => Promise<void>;
  title?: string;
  fields?: FieldConfig[];
  apiEndpoint?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function RightSheet({
  parent,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  // const { toast } = useToast();

  const [materialOptions, setMaterialOptions] = useState<MaterialOption[]>([]);
  const [isSearchingMaterials, setIsSearchingMaterials] = useState(false);
  const [materialDropdownOpen, setMaterialDropdownOpen] = useState(false);
  const [materialError, setMaterialError] = useState("");

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
      const hasDataChanges = selectedRow
        ? Object.keys(newData).some((k) => newData[k] !== selectedRow[k])
        : Object.values(newData).some((v) => v !== "");
      setHasChanges(hasDataChanges);
      return newData;
    });
  };

  const handleSave = async () => {
    if (!hasChanges) {
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

        // const result = await response.json();
      }

      setHasChanges(false);
    } catch (error) {
      console.error("Error saving data:", error);
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

  useEffect(() => {
    if (selectedRow || parent === "mastercoding") {
      setMaterialOptions([]);
      setMaterialDropdownOpen(false);
      return;
    }

    // Check both possible field keys
    const materialValue = formData.Material || formData.material || "";

    const searchMaterials = async () => {
      const query = materialValue.toString();

      if (!query.trim()) {
        setMaterialOptions([]);
        setMaterialError("");
        setMaterialDropdownOpen(false);
        return;
      }

      if (query.trim().length < 2) {
        setMaterialOptions([]);
        setMaterialDropdownOpen(false);
        return;
      }

      setIsSearchingMaterials(true);
      setMaterialError("");

      try {
        const endpoint = `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/mastercoding/distinct/material?filt=${encodeURIComponent(query)}`;

        const response = await fetch(endpoint);
        if (!response.ok) throw new Error("Failed to fetch materials");
        const data = await response.json();

        const materialOptions =
          data.material?.map((material: string) => ({ material })) || [];

        setMaterialOptions(materialOptions);

        if (materialOptions.length > 0) {
          setMaterialDropdownOpen(true);
        } else {
          setMaterialDropdownOpen(false);
          setMaterialError("Please add material in mastercoding first");
        }
      } catch (error) {
        console.error("Error searching materials:", error);
        setMaterialError("Failed to search materials");
        setMaterialOptions([]);
        setMaterialDropdownOpen(false);
      } finally {
        setIsSearchingMaterials(false);
      }
    };

    const debounceTimer = setTimeout(searchMaterials, 300);
    return () => clearTimeout(debounceTimer);
  }, [formData.Material, formData.material, selectedRow, selectedRow]);

  // Handle clicking outside to close material dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const materialContainer = target.closest("[data-material-container]");
      if (!materialContainer && materialDropdownOpen) {
        setMaterialDropdownOpen(false);
      }
    };

    if (materialDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [materialDropdownOpen]);

  const fetchMaterialDetails = async (
    materialCode: string
  ): Promise<MaterialDetails | null> => {
    try {
      const endpoint = `${
        process.env.NEXT_PUBLIC_BASE_URL
      }/mastercoding?page=1&limit=50&material=${encodeURIComponent(
        materialCode
      )}`;
      const response = await fetch(endpoint);

      if (!response.ok) throw new Error("Failed to fetch material details");

      const result = await response.json();

      // Extract the first item from the data array
      if (result.data && result.data.length > 0) {
        const item = result.data[0];
        return {
          material: item.Material || materialCode,
          material_description: item["Material Description"] || "",
          product: item.Product || "",
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching material details:", error);
      setMaterialError("Failed to fetch material details");
      return null;
    }
  };

  const handleMaterialSelect = async (material: MaterialOption) => {
    // Close dropdown and clear error immediately
    setMaterialDropdownOpen(false);
    setMaterialError("");

    // Determine which field key to use
    const materialFieldKey = formData.hasOwnProperty("Material")
      ? "Material"
      : "material";

    // Update form data with selected material
    setFormData((prev) => ({
      ...prev,
      [materialFieldKey]: material.material,
    }));
    setHasChanges(true);

    // Fetch and populate material details
    try {
      const details = await fetchMaterialDetails(material.material);
      if (details) {
        setFormData((prev) => ({
          ...prev,
          [materialFieldKey]: material.material,
          "Material Description": details.material_description,
          Product: details.product,
          // Also try lowercase versions in case field keys are different
          material_description: details.material_description,
          product: details.product,
        }));
      }
    } catch (error) {
      console.error("Error fetching material details:", error);
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
        {materialError && (
          <div className="bg-red-200 mb-4 p-2 text-xs text-red-500 rounded">
            {materialError}
          </div>
        )}
        {isVisible && effectiveFields.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {effectiveFields.map((field) => {
              if (field.key === "Master ID" && selectedRow) return null; // Skip Master ID as it's in the header

              if (field.key === "Material" || field.key === "material") {
                const isEditMode = !!selectedRow;

                return (
                  <div key={field.key} className="space-y-2">
                    <Label
                      htmlFor={field.key.toLowerCase().replace(/\s+/g, "_")}
                    >
                      {field.label}
                    </Label>
                    <div className="relative" data-material-container>
                      <Input
                        id={field.key.toLowerCase().replace(/\s+/g, "_")}
                        type={field.type || "text"}
                        placeholder={
                          isEditMode ? field.label : `Search ${field.label}...`
                        }
                        value={formData[field.key]?.toString() || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleInputChange(field.key, value);
                        }}
                        onFocus={() => {
                          if (!isEditMode) {
                            const currentValue =
                              formData[field.key]?.toString() || "";
                            if (
                              currentValue.trim().length >= 2 &&
                              materialOptions.length > 0
                            ) {
                              setMaterialDropdownOpen(true);
                            }
                          }
                        }}
                        readOnly={field.readOnly}
                        required={field.required}
                        className={cn(
                          field.readOnly && "bg-muted/40",
                          hasChanges &&
                            formData[field.key] !== selectedRow?.[field.key] &&
                            "border-orange-300"
                        )}
                      />
                      {isSearchingMaterials && !isEditMode && (
                        <div className="absolute right-3 top-3">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="sr-only">Loading...</span>
                        </div>
                      )}

                      {materialDropdownOpen &&
                        materialOptions.length > 0 &&
                        !isEditMode && (
                          <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                            {materialOptions.map((option, index) => (
                              <div
                                key={`${option.material}-${index}`}
                                className="cursor-pointer rounded px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleMaterialSelect(option);
                                }}
                              >
                                <span className="font-medium">
                                  {option.material}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key.toLowerCase().replace(/\s+/g, "_")}>
                    {field.label}
                  </Label>
                  <Input
                    id={field.key.toLowerCase().replace(/\s+/g, "_")}
                    type={field.type || "text"}
                    placeholder={field.label}
                    value={formData[field.key]?.toString() || ""}
                    onChange={(e) =>
                      handleInputChange(field.key, e.target.value)
                    }
                    readOnly={
                      field.readOnly ||
                      (field.key.toLowerCase() === "material_description" &&
                        formData["material"]) ||
                      (field.key.toLowerCase() === "product" &&
                        formData["material"])
                    }
                    required={field.required}
                    className={cn(
                      (field.readOnly ||
                        (field.key.toLowerCase() === "material_description" &&
                          formData["material"]) ||
                        (field.key.toLowerCase() === "product" &&
                          formData["material"])) &&
                        "bg-muted/40",
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
          disabled={
            !isVisible ||
            !hasChanges ||
            isSaving ||
            // Check if any required fields are empty
            effectiveFields.some(
              (field) =>
                field.required &&
                (!formData[field.key] ||
                  formData[field.key].toString().trim() === "")
            ) ||
            // Check if there's a material error
            !!materialError
          }
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

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";

// Define the type for the props based on the parent component's row data type
type SearchComponentProps = {
  onSearch?: (fieldSearches: Record<string, string>) => void;
};

export default function SearchComponent({ onSearch }: SearchComponentProps) {
  // All available fields from the table
  const fields = [
    { value: "master_id", label: "Master ID" },
    { value: "product", label: "Product" },
    { value: "material", label: "Material" },
    { value: "material_description", label: "Material Description" },
    { value: "measurement_instrument", label: "Measurement Instrument" },
    { value: "colour_similarity", label: "Colour Similarity" },
    { value: "product_type", label: "Product type" },
    { value: "function", label: "Function" },
    { value: "series", label: "Series" },
    { value: "colour", label: "Colour" },
    { value: "key_feature", label: "Key Feature" },
  ];

  // State to track the search value for each field
  const [fieldSearches, setFieldSearches] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.value]: "" }), {})
  );

  const handleInputChange = (field: string, value: string) => {
    setFieldSearches((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    if (onSearch) {
      // Filter out empty search fields
      const nonEmptySearches = Object.entries(fieldSearches).reduce(
        (acc, [key, value]) => {
          if (value.trim()) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, string>
      );

      onSearch(nonEmptySearches);
    }
  };

  // const clearAllFields = () => {
  //   setFieldSearches(
  //     fields.reduce((acc, field) => ({ ...acc, [field.value]: "" }), {})
  //   );
  // };

  return (
    <Card className="gap-1 h-full flex flex-col pt-2 pb-1">
      <CardHeader className="flex-shrink-0 p-0">
        <div className="flex justify-center border-b p-2">
          <CardTitle className="text-lg">Search Fields</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="overflow-y-auto flex-grow pr-0 pl-3">
        <div className="space-y-3 pr-2">
          {fields.map((field) => (
            <div key={field.value} className="space-y-1">
              <Label htmlFor={`search-${field.value}`} className="text-sm">
                {field.label}
              </Label>
              <Input
                id={`search-${field.value}`}
                placeholder={`Search by ${field.label}...`}
                value={fieldSearches[field.value]}
                onChange={(e) => handleInputChange(field.value, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          ))}
        </div>
      </CardContent>
      <div className="p-4 border-t mt-auto flex-shrink-0">
        <Button onClick={handleSearch} className="w-full">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
    </Card>
  );
}

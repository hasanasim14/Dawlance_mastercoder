"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { AutocompleteInput } from "./AutoCompleteInput";
import { ColumnConfig } from "@/lib/types";

// Define the type for the props based on the parent component's row data type
type SearchComponentProps = {
  fields: readonly ColumnConfig[];
  onSearch?: (fieldSearches: Record<string, string>) => void;
  fetchSuggestions?: (field: string, query: string) => Promise<string[]>;
};

export default function SearchComponent({
  fields,
  onSearch,
  fetchSuggestions,
}: SearchComponentProps) {
  const [fieldSearches, setFieldSearches] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {})
  );

  const handleInputChange = (field: string, key: string) => {
    setFieldSearches((prev) => ({
      ...prev,
      [field]: key,
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

  const handleFieldSearch = (field: string, value: string) => {
    // Update the field value
    handleInputChange(field, value);

    // Create a search object with just this field
    const searchObj = { [field]: value };

    // Trigger the search
    if (onSearch) {
      onSearch(searchObj);
    }
  };

  const clearAllFields = () => {
    setFieldSearches(
      fields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {})
    );
  };

  // Default implementation if fetchSuggestions is not provided
  const defaultFetchSuggestions = async (query: string): Promise<string[]> => {
    // This is a placeholder - in a real app, you'd call your API
    console.log("Fetching suggestions for:", query);
    return [];
  };

  return (
    <Card className="gap-1 h-full flex flex-col pt-2 pb-1">
      <CardHeader className="flex-shrink-0 p-0">
        <div className="flex border-b p-2 justify-between">
          <CardTitle className="text-lg">Search Fields</CardTitle>
          <Button variant="outline" size="sm" onClick={clearAllFields}>
            <X className="h-4 w-4 mr-1" /> Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-y-auto flex-grow pr-0 pl-3">
        <div className="space-y-3 pr-2">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <Label htmlFor={`search-${field.key}`} className="text-sm">
                {field.label}
              </Label>
              <AutocompleteInput
                id={`search-${field.key}`}
                placeholder={`Search by ${field.label}...`}
                value={fieldSearches[field.key]}
                onChange={(value) => handleInputChange(field.key, value)}
                onSearch={(value) => handleFieldSearch(field.key, value)}
                fetchSuggestions={(query) =>
                  fetchSuggestions
                    ? fetchSuggestions(field.key, query)
                    : defaultFetchSuggestions(query)
                }
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

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the type for the props based on the parent component's row data type
type SearchComponentProps = {
  onSearch?: (field: string, value: string) => void;
};

export default function SearchComponent({ onSearch }: SearchComponentProps) {
  const [selectedField, setSelectedField] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = () => {
    if (searchQuery.trim() && onSearch) {
      onSearch(selectedField, searchQuery);
    }
  };

  // All available fields from the table
  const fields = [
    { value: "all", label: "All Fields" },
    { value: "Master ID", label: "Master ID" },
    { value: "Product", label: "Product" },
    { value: "Material", label: "Material" },
    { value: "Material Description", label: "Material Description" },
    { value: "Measurement Instrument", label: "Measurement Instrument" },
    { value: "Colour Similarity", label: "Colour Similarity" },
    { value: "Product type", label: "Product type" },
    { value: "Function", label: "Function" },
    { value: "Series", label: "Series" },
    { value: "Colour", label: "Colour" },
    { value: "Key Feature", label: "Key Feature" },
  ];

  return (
    <Card className="mb-4 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Advanced Search</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-field">Search Field</Label>
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger id="search-field">
                <SelectValue placeholder="Select field to search" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field.value} value={field.value}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-query">Search Query</Label>
            <div className="flex space-x-2">
              <Input
                id="search-query"
                placeholder="Enter search term..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} aria-label="Search">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

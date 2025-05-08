"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AutocompleteInputProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  fetchSuggestions: (query: string) => Promise<string[]>;
}

export function AutocompleteInput({
  id,
  placeholder,
  value,
  onChange,
  onSearch,
  fetchSuggestions,
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions when the input value changes
  useEffect(() => {
    const getSuggestions = async () => {
      if (value.trim().length > 0) {
        setIsLoading(true);
        try {
          const results = await fetchSuggestions(value);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(getSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [value, fetchSuggestions]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle suggestion selection
  // const handleSuggestionClick = (suggestion: string) => {
  //   onChange(suggestion);
  //   onSearch(suggestion);
  //   setShowSuggestions(false);
  // };

  // Handle key press events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(value);
      setShowSuggestions(false);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    suggestion: string
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onChange(suggestion);
      setShowSuggestions(false);
      inputRef.current?.focus();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      inputRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
      if (nextSibling) nextSibling.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevSibling = e.currentTarget.previousElementSibling as HTMLElement;
      if (prevSibling) {
        prevSibling.focus();
      } else {
        inputRef.current?.focus();
      }
    }
  };

  return (
    <div className="relative">
      <div className="flex">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() =>
            value.trim().length > 0 &&
            suggestions.length > 0 &&
            setShowSuggestions(true)
          }
          onKeyDown={handleKeyDown}
          className="w-full pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full"
          onClick={() => {
            onSearch(value);
            setShowSuggestions(false);
          }}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading ? (
            <div className="p-2 text-center text-muted-foreground">
              Loading...
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion}-${index}`}
                tabIndex={0}
                className="cursor-pointer rounded px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(suggestion);
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }}
                onKeyDown={(e) => handleSuggestionKeyDown(e, suggestion)}
              >
                {suggestion}
              </div>
            ))
          ) : (
            <div className="p-2 text-center text-muted-foreground">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

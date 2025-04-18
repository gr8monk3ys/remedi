"use client";

import { memo, useState, useEffect, useCallback } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export const Filter = memo(function Filter({
  title,
  options,
  selectedValues,
  onChange,
}: FilterProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [localSelectedValues, setLocalSelectedValues] =
    useState<string[]>(selectedValues);

  useEffect(() => {
    setLocalSelectedValues(selectedValues);
  }, [selectedValues]);

  const handleOptionChange = useCallback(
    (value: string) => {
      setLocalSelectedValues((prev) => {
        const newValues = prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value];
        onChange(newValues);
        return newValues;
      });
    },
    [onChange],
  );

  const handleClearAll = useCallback(() => {
    setLocalSelectedValues([]);
    onChange([]);
  }, [onChange]);

  const handleSelectAll = useCallback(() => {
    const allValues = options.map((option) => option.value);
    setLocalSelectedValues(allValues);
    onChange(allValues);
  }, [options, onChange]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <Card>
      <CardHeader className="cursor-pointer py-3 px-4" onClick={toggleExpanded}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{title}</CardTitle>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="px-4 pb-3 pt-0">
          <div className="mb-2 flex items-center justify-between">
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={handleSelectAll}
            >
              Select all
            </Button>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground"
              onClick={handleClearAll}
            >
              Clear
            </Button>
          </div>

          <ScrollArea className="max-h-48">
            <div className="space-y-1">
              {options.map((option) => {
                const isSelected = localSelectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => handleOptionChange(option.value)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      isSelected
                        ? "bg-primary/10 text-foreground"
                        : "hover:bg-accent text-muted-foreground",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input",
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span className="flex-1 text-left truncate">
                      {option.label}
                    </span>
                    {option.count !== undefined && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        {option.count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
});

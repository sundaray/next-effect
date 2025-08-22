"use client";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectCommandProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onValueChange: (selectedValues: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function MultiSelectCommand({
  options,
  selectedValues,
  onValueChange,
  placeholder = "Search items...",
  emptyMessage = "No items found.",
  className,
}: MultiSelectCommandProps) {
  const handleToggle = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onValueChange(newSelectedValues);
  };

  return (
    <Command className={cn("rounded-lg border shadow-md", className)}>
      <CommandInput placeholder={placeholder} />
      <ScrollArea className="h-48">
        <CommandList>
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup>
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleToggle(option.value)}
                  className="cursor-pointer"
                >
                  <Checkbox
                    id={`select-${option.value}`}
                    checked={isSelected}
                    className="mr-2 pointer-events-none"
                  />
                  <label
                    htmlFor={`select-${option.value}`}
                    className="w-full cursor-pointer"
                  >
                    {option.label}
                  </label>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </ScrollArea>
    </Command>
  );
}

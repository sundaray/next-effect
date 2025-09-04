"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MultiSelectOption {
  value: string;
  label: string;
  count: number;
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
                  className="flex cursor-pointer justify-between"
                >
                  <div className="flex">
                    <Checkbox
                      id={`select-${option.value}`}
                      checked={isSelected}
                      className="pointer-events-none mr-2"
                    />
                    <Label className="font-normal">{option.label}</Label>
                  </div>
                  <span className="text-neutral-500">{option.count}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </ScrollArea>
    </Command>
  );
}

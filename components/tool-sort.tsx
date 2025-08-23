"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useToolFilters } from "@/hooks/use-tool-filters";
import { toolSortOptions } from "@/config/tool-options";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function ToolSort() {
  const [open, setOpen] = useState(false);
  const { isPending, filters, setFilters } = useToolFilters();

  const selectedLabel =
    toolSortOptions.find((option) => option.value === filters.sort)?.label ||
    "Latest";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          data-pending={isPending ? "" : undefined}
          className="w-full md:w-[220px] justify-between border-neutral-300 bg-transparent h-10"
        >
          <span>
            <span className="text-neutral-500">Sort by: </span>
            <span className="font-medium">{selectedLabel}</span>
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {toolSortOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    setFilters({ sort: currentValue });
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      filters.sort === option.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

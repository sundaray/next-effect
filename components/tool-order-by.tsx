"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useQueryState, parseAsString } from "nuqs";
import { useTransition } from "react";

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

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "name-asc", label: "Name (A to Z)" },
  { value: "name-desc", label: "Name (Z to A)" },
  { value: "bookmarks-desc", label: "Most Bookmarks" },
];

export function ToolOrderBy() {
  const [open, setOpen] = useState(false);
  const [_isPending, startTransition] = useTransition();

  const [orderBy, setOrderBy] = useQueryState(
    "orderBy",
    parseAsString.withDefault("latest").withOptions({
      startTransition,
      shallow: false,
    })
  );

  const selectedLabel =
    sortOptions.find((option) => option.value === orderBy)?.label || "Latest";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full sm:w-[220px] justify-between border-neutral-300 bg-transparent h-10"
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
              {sortOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    setOrderBy(currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      orderBy === option.value ? "opacity-100" : "opacity-0"
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

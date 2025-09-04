"use client";

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MAX_CATEGORIES_PER_TOOL } from "@/config/limit";
import { Plus, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  ControllerFieldState,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";

type CategoryInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  disabled: boolean;
  fieldErrorId: string;
  categories: string[];
};

export function CategoryInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  field,
  fieldState,
  disabled,
  fieldErrorId,
  categories,
}: CategoryInputProps<TFieldValues, TName>) {
  const [categoryInput, setCategoryInput] = useState("");
  const [open, setOpen] = useState(false);

  const fieldError = fieldState.error;

  const selectedCategories = (field.value || []) as string[];
  const reachedMaxCategories =
    selectedCategories.length >= MAX_CATEGORIES_PER_TOOL;

  const isDisabled = disabled || reachedMaxCategories;

  // Filter suggestions based on input
  const filteredSuggestions = categories.filter(
    (cat) =>
      !selectedCategories.includes(cat) &&
      cat.toLowerCase().includes(categoryInput.toLowerCase()),
  );

  function addCategory(category: string) {
    const trimmedCategory = category.trim();
    if (
      trimmedCategory &&
      !selectedCategories.includes(trimmedCategory) &&
      !reachedMaxCategories
    ) {
      field.onChange([...selectedCategories, trimmedCategory]);
      setCategoryInput("");
    }
  }

  function removeCategory(categoryToRemove: string) {
    field.onChange(
      selectedCategories.filter((cat: string) => cat !== categoryToRemove),
    );
  }

  return (
    <div>
      {/* Selected Categories */}
      {selectedCategories.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          <AnimatePresence>
            {selectedCategories.map((category: string, index: number) => (
              <div
                key={`${category}-${index}`}
                className="flex items-center gap-2"
              >
                <span className="text-xs font-medium text-neutral-500">
                  {index === 0 ? "Primary:" : "Secondary:"}
                </span>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="flex items-center gap-x-2 rounded-full border bg-neutral-200 px-2 py-1"
                >
                  <span className="text-xs font-semibold text-neutral-700">
                    {category}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCategory(category)}
                    className="text-neutral-500 transition-colors hover:text-neutral-700"
                    aria-label={`Remove ${category}`}
                  >
                    <X className="size-4" />
                  </button>
                </motion.div>
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Category input */}
      <Popover
        open={open}
        onOpenChange={(newOpenState) => {
          if (isDisabled && newOpenState) {
            return;
          }
          setOpen(newOpenState);
        }}
      >
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="categories"
              className="mt-2 border-neutral-300 pl-8"
              disabled={isDisabled}
              value={categoryInput}
              onChange={(e) => {
                setCategoryInput(e.target.value);
                setOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (categoryInput.trim()) {
                    addCategory(categoryInput);
                  }
                }
              }}
              placeholder="ex: Image upscaler, Image enhancer"
              aria-invalid={fieldError ? "true" : "false"}
              aria-describedby={fieldError ? fieldErrorId : undefined}
              autoComplete="off"
              role="combobox"
              aria-expanded={open}
            />
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              {categoryInput && filteredSuggestions.length === 0 && (
                <div className="p-3 text-center text-sm text-neutral-700">
                  No category named{" "}
                  <span className="font-semibold">{categoryInput}</span> was
                  found.
                </div>
              )}

              <CommandGroup>
                {filteredSuggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    value={suggestion}
                    onSelect={() => {
                      addCategory(suggestion);
                      setOpen(false);
                    }}
                  >
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>

              {categoryInput &&
                !categories.some(
                  (c) => c.toLowerCase() === categoryInput.toLowerCase(),
                ) && (
                  <CommandGroup className="border-t">
                    <CommandItem
                      onSelect={() => {
                        addCategory(categoryInput);
                        setOpen(false);
                      }}
                      className="font-medium text-sky-900 data-[selected=true]:text-sky-900"
                    >
                      <div className="flex w-full items-center justify-center gap-2">
                        <Plus className="size-4" />
                        <span>Create "{categoryInput}"</span>
                      </div>
                    </CommandItem>
                  </CommandGroup>
                )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

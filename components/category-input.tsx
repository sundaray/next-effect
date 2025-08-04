"use client";

import { useState } from "react";
import { X, Plus, Search } from "lucide-react";
import { PREDEFINED_CATEGORIES } from "@/components/tool-submission-form";
import { Input } from "@/components/ui/input";
import {
  ControllerRenderProps,
  ControllerFieldState,
  FieldValues,
  FieldPath,
} from "react-hook-form";

type CategoryInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> = {
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  disabled: boolean;
  fieldErrorId: string;
};

export function CategoryInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  field,
  fieldState,
  disabled,
  fieldErrorId,
}: CategoryInputProps<TFieldValues, TName>) {
  const [categoryInput, setCategoryInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fieldError = fieldState.error;

  const selectedCategories = (field.value || []) as string[];
  const reachedMaxCategories = selectedCategories.length >= 3;

  const isDisabled = disabled || reachedMaxCategories;

  // Filter suggestions based on input
  const filteredSuggestions = PREDEFINED_CATEGORIES.filter(
    (cat) =>
      !selectedCategories.includes(cat) &&
      cat.toLowerCase().includes(categoryInput.toLowerCase())
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
      setShowSuggestions(false);
    }
  }

  function removeCategory(categoryToRemove: string) {
    field.onChange(
      selectedCategories.filter((cat: string) => cat !== categoryToRemove)
    );
  }

  return (
    <div>
      {/* Selected Categories */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCategories.map((category: string, index: number) => (
            <div
              key={`${category}-${index}`}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-700 px-3 py-1"
            >
              <span className="text-xs text-neutral-300">
                {index === 0 ? "Primary" : `Secondary`}:
              </span>
              <span className="text-neutral-100 text-xs">{category}</span>
              <button
                type="button"
                onClick={() => removeCategory(category)}
                className="text-neutral-500 hover:text-neutral-300 hover:bg-neutral-600 rounded-full p-1.5 transition"
                aria-label={`Remove ${category}`}
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Category input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" />
          <Input
            id="categories"
            className="border-neutral-300 mt-2 pl-8"
            disabled={isDisabled}
            value={categoryInput}
            onChange={(e) => {
              setCategoryInput(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (categoryInput.trim()) {
                  addCategory(categoryInput);
                }
              }
              if (e.key === "Escape") {
                setShowSuggestions(false);
              }
            }}
            onFocus={() => {
              setShowSuggestions(true);
              // Show all categories when focusing with empty input
              if (!categoryInput) {
                setCategoryInput("");
              }
            }}
            onBlur={() => {
              field.onBlur();
              // Delay to allow clicking on suggestions
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder="ex: Image upscaler, Image enhancer"
            aria-invalid={fieldError ? "true" : "false"}
            aria-describedby={fieldError ? fieldErrorId : undefined}
            autoComplete="off"
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && !isDisabled && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg max-h-48 overflow-y-auto">
            {categoryInput ? (
              <>
                {/* Filtered suggestions */}
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="w-full px-3 py-2.5 text-left text-sm hover:bg-gray-100 focus:bg-gray-50 focus:outline-none transition-colors"
                      onClick={() => addCategory(suggestion)}
                    >
                      {suggestion}x``
                    </button>
                  ))
                ) : (
                  /* No matches found */
                  <div className="p-3 text-center text-sm text-gray-500">
                    No matching categories
                  </div>
                )}

                {/* Create new category option */}
                {!PREDEFINED_CATEGORIES.some(
                  (cat) => cat.toLowerCase() === categoryInput.toLowerCase()
                ) && (
                  <div
                    className={filteredSuggestions.length > 0 ? "border-t" : ""}
                  >
                    <button
                      type="button"
                      className="w-full px-3 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-100 focus:bg-blue-50 focus:outline-none flex items-center justify-center gap-2 transition-colors"
                      onClick={() => addCategory(categoryInput)}
                    >
                      <Plus className="size-4" />
                      Create "{categoryInput}"
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Show all available categories when no search input */
              PREDEFINED_CATEGORIES.filter(
                (cat) => !selectedCategories.includes(cat)
              ).map((category) => (
                <button
                  key={category}
                  type="button"
                  className="w-full px-3 py-2.5 text-left text-sm hover:bg-gray-100 focus:bg-gray-50 focus:outline-none transition-colors"
                  onClick={() => addCategory(category)}
                >
                  {category}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

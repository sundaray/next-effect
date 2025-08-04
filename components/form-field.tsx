import { useId } from "react";
import {
  Controller,
  ControllerRenderProps,
  ControllerFieldState,
  Control,
  FieldValues,
  FieldPath,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormFieldMessage } from "@/components/form-field-message";
import { countWords, getFieldErrorId } from "@/lib/utils";
import { cn } from "@/lib/utils";

type InputProps = React.ComponentPropsWithoutRef<"input">;

export type RenderFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> = {
  id: string;
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  disabled: boolean;
  fieldErrorId: string;
};

type FormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> = {
  id: string;
  name: TName;
  label: string;
  hint?: string;
  help?: {
    message: string;
    maxWordCount?: number;
    maxCategoriesCount?: number;
  };
  className?: string;
  control: Control<TFieldValues>;
  renderField?: (
    props: RenderFieldProps<TFieldValues, TName>
  ) => React.ReactNode;
} & Omit<InputProps, "id" | "name">;

export function FormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  id: propId,
  name,
  label,
  hint,
  help,
  className,
  control,
  renderField,
  disabled,
  ...props
}: FormFieldProps<TFieldValues, TName>) {
  const id = useId();
  return (
    <div>
      <div className="flex justify-between">
        <Label
          htmlFor={propId}
          onClick={() => {
            if (renderField) {
              // For custom components like the RichTextEditor,
              // we need to manually trigger the focus.
              document.getElementById(propId)?.focus();
            }
          }}
        >
          {label}
        </Label>
        {hint && (
          <span className="text-sm text-neutral-500 font-normal">{hint}</span>
        )}
      </div>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const fieldErrorId = getFieldErrorId(field.name, id);
          const error = fieldState.error;

          let currentWordCount = 0;
          let hasExceededLimit = false;
          const showWordCounter = help && help.maxWordCount;

          if (showWordCounter) {
            currentWordCount = countWords(field.value);
            hasExceededLimit = currentWordCount > help.maxWordCount!;
          }

          let currentItemsCount = 0;
          const showItemsCounter = help && help.maxCategoriesCount;

          if (showItemsCounter) {
            currentItemsCount = Array.isArray(field.value)
              ? field.value.length
              : 0;
          }

          return (
            <>
              {typeof renderField === "function" ? (
                renderField({
                  id: propId,
                  field,
                  fieldState,
                  disabled: !!disabled,
                  fieldErrorId,
                })
              ) : (
                <Input
                  {...field}
                  {...props}
                  id={propId}
                  name={name}
                  disabled={disabled}
                  className={cn("mt-2 border-neutral-300", className)}
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={error ? fieldErrorId : undefined}
                />
              )}
              {help && (
                <div className="flex items-center justify-between mt-1 text-sm text-neutral-500">
                  <span>{help.message}</span>
                  {/* Word counter */}
                  {showWordCounter && (
                    <span>
                      <span
                        className={cn(
                          hasExceededLimit && "font-medium text-red-600"
                        )}
                      >
                        {currentWordCount}
                      </span>
                      <span> / {help.maxWordCount} words</span>
                    </span>
                  )}
                  {/* Categories counter */}
                  {showItemsCounter && (
                    <span>
                      {currentItemsCount} / {help.maxCategoriesCount}
                    </span>
                  )}
                </div>
              )}
              <FormFieldMessage
                errorMessage={error?.message}
                errorId={fieldErrorId}
              />
            </>
          );
        }}
      />
    </div>
  );
}

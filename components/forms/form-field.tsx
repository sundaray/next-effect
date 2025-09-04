import { Input } from "@/components/ui/input";
import { FormFieldMessage } from "@/components/forms/form-field-message";
import { Label } from "@/components/ui/label";
import { cn, countWords, getFieldErrorId } from "@/lib/utils";
import { useId } from "react";
import {
  Control,
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";

type InputProps = React.ComponentPropsWithoutRef<"input">;

export type RenderFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  id: string;
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  disabled: boolean;
  fieldErrorId: string;
  required: boolean;
};

type FormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
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
    props: RenderFieldProps<TFieldValues, TName>,
  ) => React.ReactNode;
  required?: boolean;
} & Omit<InputProps, "id" | "name">;

export function FormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
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
  required,
  ...props
}: FormFieldProps<TFieldValues, TName>) {
  const id = useId();
  return (
    <div>
      <div className="flex justify-between">
        <Label
          htmlFor={propId}
          className={cn(required && "after:text-red-600 after:content-['*']")}
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
          <span className="text-sm font-normal text-neutral-500">{hint}</span>
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
                  required: !!required,
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
                <div className="mt-1 flex items-center justify-between text-sm text-neutral-500">
                  <span>{help.message}</span>
                  {/* Word counter */}
                  {showWordCounter && (
                    <span>
                      <span
                        className={cn(
                          hasExceededLimit && "font-medium text-red-600",
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

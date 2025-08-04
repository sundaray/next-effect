"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import {
  ToolSubmissionSchema,
  type ToolSubmissionFormData,
  pricingOptions,
} from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/form-message";
// import { submitTool } from "@/lib/submit-tool";
import { FormField } from "@/components/form-field";
import { CategoryInput } from "@/components/category-input";
import { RichTextEditor } from "@/components/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFieldErrorId } from "@/lib/utils";
import { Effect, Either, ParseResult } from "effect";
import { FetchHttpClient } from "@effect/platform";
import { client } from "@/app/api/client";

import { DropzoneInput } from "@/components/dropzone-input";
import {
  LOGO_MAX_SIZE_MB,
  SCREENSHOT_MAX_SIZE_MB,
  SUPPORTED_FILE_TYPES,
  SUPPORTED_MIME_TYPES,
} from "@/lib/schema";

type FormValidationError = {
  name: "FormValidationError";
  issues: { path: string[]; message: string }[];
};

function isParseError(error: unknown): error is ParseResult.ParseError {
  return (
    typeof error === "object" &&
    error !== null &&
    // The _tag property is the key!
    (error as any)._tag === "ParseError"
  );
}

export const PREDEFINED_CATEGORIES = [
  "Development",
  "Design",
  "Marketing",
  "Productivity",
  "AI/ML",
  "Analytics",
  "Communication",
  "Security",
];

export function ToolSubmissionForm() {
  const id = useId();
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { control, handleSubmit, reset, setError } =
    useForm<ToolSubmissionFormData>({
      // resolver: effectTsResolver(ToolSubmissionSchema),
      mode: "onTouched",
      reValidateMode: "onChange",
      defaultValues: {
        name: "",
        website: "",
        tagline: "",
        description: "",
        categories: [],
        pricing: undefined,
        logo: undefined,
        homepageScreenshot: undefined,
      },
    });

  const onSubmit = async function (data: ToolSubmissionFormData) {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const submitProgram = Effect.gen(function* () {
      const apiClient = yield* client;
      return yield* apiClient.tools.submitTool({ payload: data });
    });

    const result = await submitProgram.pipe(
      Effect.either,
      Effect.provide(FetchHttpClient.layer),
      Effect.runPromise
    );

    setIsProcessing(false);

    if (Either.isRight(result)) {
      const response = result.right;
      Effect.log("Form success response: ", response);
      reset();
    } else {
      const error = result.left;

      console.log("Error", error);

      if (isParseError(error)) {
        const issues = ParseResult.ArrayFormatter.formatErrorSync(error);
        console.log("Parse error issues: ", issues);

        issues.forEach((issue) => {
          const fieldName = issue.path[0] as keyof ToolSubmissionFormData;
          setError(fieldName, {
            type: "server",
            message: issue.message,
          });
        });
      }
    }
  };

  const message = successMessage || errorMessage;
  const messageType = successMessage ? "success" : "error";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
      {message && <FormMessage message={message} type={messageType} />}

      <FormField
        id="name"
        name="name"
        label="Name"
        placeholder="ex: Clarity AI"
        type="text"
        control={control}
        disabled={isProcessing}
      />

      <FormField
        id="website"
        name="website"
        label="Website"
        placeholder="ex: https://clarityai.co"
        control={control}
        disabled={isProcessing}
      />

      <FormField
        id="tagline"
        name="tagline"
        label="Tagline"
        placeholder="ex: Upscale and enhance your images with AI Magic"
        help={{
          message: "Tagline must be 20 words or fewer.",
          maxWordCount: 20,
        }}
        type="text"
        control={control}
        disabled={isProcessing}
      />

      <FormField
        id="description"
        name="description"
        label="Description"
        help={{
          message: "Description must be 500 words or fewer.",
          maxWordCount: 500,
        }}
        control={control}
        disabled={isProcessing}
        renderField={({ id, field, fieldState, disabled }) => (
          <RichTextEditor
            id={id}
            field={field}
            fieldState={fieldState}
            disabled={disabled}
          />
        )}
      />

      <FormField
        id="categories"
        name="categories"
        label="Categories"
        help={{
          message:
            "Start typing to search existing categories or create your own.",
          maxCategoriesCount: 3,
        }}
        control={control}
        disabled={isProcessing}
        renderField={({ field, fieldState, disabled }) => (
          <CategoryInput
            field={field}
            fieldState={fieldState}
            disabled={disabled}
          />
        )}
      />

      <FormField
        id="pricing"
        name="pricing"
        label="Pricing"
        control={control}
        disabled={isProcessing}
        renderField={({ id, field, fieldState, disabled }) => {
          const randomId = useId();
          const fieldErrorId = getFieldErrorId(field.name, randomId);
          const fieldError = fieldState.error;

          return (
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={disabled}
            >
              <SelectTrigger
                id={id}
                className="mt-2 border-neutral-300 w-full"
                aria-invalid={fieldError ? "true" : "false"}
                aria-describedby={fieldError ? fieldErrorId : undefined}
              >
                <SelectValue placeholder="Select a pricing model" />
              </SelectTrigger>
              <SelectContent>
                {pricingOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }}
      />

      <FormField
        id="logo"
        name="logo"
        label="Logo"
        hint="Optional"
        control={control}
        disabled={isProcessing}
        renderField={({ field, fieldState, disabled }) => (
          <DropzoneInput
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            maxSizeInMb={LOGO_MAX_SIZE_MB}
            supportedFileTypes={SUPPORTED_FILE_TYPES}
            supportedMimeTypes={SUPPORTED_MIME_TYPES}
          />
        )}
      />

      <FormField
        id="homepageScreenshot"
        name="homepageScreenshot"
        label="Homepage Screenshot"
        control={control}
        disabled={isProcessing}
        renderField={({ field, fieldState, disabled }) => (
          <DropzoneInput
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            maxSizeInMb={SCREENSHOT_MAX_SIZE_MB}
            supportedFileTypes={SUPPORTED_FILE_TYPES}
            supportedMimeTypes={SUPPORTED_MIME_TYPES}
          />
        )}
      />

      <Button type="submit" disabled={isProcessing}>
        {isProcessing ? "Submitting..." : "Submit Tool"}
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import {
  ToolSubmissionFormSchema,
  ToolSubmissionFormSchemaType,
  pricingOptions,
} from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/form-message";
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
import { DropzoneInput } from "@/components/dropzone-input";
import {
  LOGO_MAX_SIZE_MB,
  SCREENSHOT_MAX_SIZE_MB,
  SUPPORTED_FILE_TYPES,
  SUPPORTED_MIME_TYPES,
} from "@/lib/schema";
import { getPresignedUrls } from "@/lib/get-presigned-urls";
import { uploadFilesToS3 } from "@/lib/upload-files-to-s3";
import type { GetPresignedUrlsError } from "@/lib/get-presigned-urls";
import type { FileUploadError } from "@/lib/upload-files-to-s3";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleError(error: GetPresignedUrlsError) {
    setErrorMessage(null);

    switch (error._tag) {
      case "ParseError":
        error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof ToolSubmissionFormSchemaType;
          if (field) {
            setError(field, { type: "server", message: issue.message });
          }
        });
        break;

      case "ConfigError":
      case "PresignedUrlGenerationError":
      case "NetworkError":
      case "ResponseBodyParseError":
        setErrorMessage(error.message);
        break;

      default:
        setErrorMessage("An unexpected error occurred. Please try again.");
    }
  }

  const { control, handleSubmit, reset, setError, clearErrors } =
    useForm<ToolSubmissionFormSchemaType>({
      // resolver: effectTsResolver(ToolSubmissionFormSchema),
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

  const onSubmit = async (data: ToolSubmissionFormSchemaType) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    /********************************************************************
     *
     *  STEP 1: Get presigned URLs
     *
     ********************************************************************/
    const response = await getPresignedUrls(data);

    if (response.isErr()) {
      const error = response.error;
      setErrorMessage(null);

      switch (error._tag) {
        case "ParseError":
          error.issues.forEach((issue) => {
            const field = issue.path[0] as keyof ToolSubmissionFormSchemaType;
            if (field) {
              setError(field, { type: "server", message: issue.message });
            }
          });
          break;

        case "ConfigError":
        case "PresignedUrlGenerationError":
        case "NetworkError":
        case "ResponseBodyParseError":
          setErrorMessage(error.message);
          break;

        default:
          setErrorMessage("An unexpected error occurred. Please try again.");
      }

      setIsProcessing(false);
      return;
    }

    const {
      logoKey,
      logoUploadUrl,
      homepageScreenshotKey,
      homepageScreenshotUploadUrl,
    } = response.value;

    /********************************************************************
     *
     *  STEP 2: Upload logo and homepage screenshot directly to S3
     *
     ********************************************************************/
    const uploadResult = await uploadFilesToS3({
      homepageScreenshot: data.homepageScreenshot,
      homepageScreenshotUploadUrl,
      logo: data.logo,
      logoUploadUrl,
    });

    if (uploadResult.isErr()) {
      const error = uploadResult.error;
      setErrorMessage(null);

      switch (error._tag) {
        case "FileUploadError":
        case "NetworkError":
          setErrorMessage(error.message);
          break;

        default:
          setErrorMessage("An unexpected error occurred. Please try again.");
      }

      setIsProcessing(false);
      return;
    }

    // Save tool in the database
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
        renderField={({ id, field, fieldState, disabled, fieldErrorId }) => (
          <RichTextEditor
            id={id}
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            fieldErrorId={fieldErrorId}
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
        renderField={({ field, fieldState, disabled, fieldErrorId }) => (
          <CategoryInput
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            fieldErrorId={fieldErrorId}
          />
        )}
      />

      <FormField
        id="pricing"
        name="pricing"
        label="Pricing"
        control={control}
        disabled={isProcessing}
        renderField={({ id, field, fieldState, disabled, fieldErrorId }) => {
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
        renderField={({ field, fieldState, disabled, fieldErrorId }) => (
          <DropzoneInput
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            maxSizeInMb={LOGO_MAX_SIZE_MB}
            supportedFileTypes={SUPPORTED_FILE_TYPES}
            supportedMimeTypes={SUPPORTED_MIME_TYPES}
            setError={setError}
            clearErrors={clearErrors}
            fieldErrorId={fieldErrorId}
          />
        )}
      />

      <FormField
        id="homepageScreenshot"
        name="homepageScreenshot"
        label="Homepage Screenshot"
        control={control}
        disabled={isProcessing}
        renderField={({ field, fieldState, disabled, fieldErrorId }) => (
          <DropzoneInput
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            maxSizeInMb={SCREENSHOT_MAX_SIZE_MB}
            supportedFileTypes={SUPPORTED_FILE_TYPES}
            supportedMimeTypes={SUPPORTED_MIME_TYPES}
            setError={setError}
            clearErrors={clearErrors}
            fieldErrorId={fieldErrorId}
          />
        )}
      />

      <Button type="submit" disabled={isProcessing}>
        {isProcessing ? "Submitting..." : "Submit Tool"}
      </Button>
    </form>
  );
}

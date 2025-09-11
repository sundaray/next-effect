"use client";
import { CategoryInput } from "@/components/forms/category-input";
import { DropzoneInput } from "@/components/forms/dropzone-input";
import { FormField } from "@/components/forms/form-field";
import { FormMessage } from "@/components/forms/form-message";
import { RichTextEditor } from "@/components/forms/rich-text-editor";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tool } from "@/db/schema";
import { clientRuntime } from "@/lib/client-runtime";
import { getPresignedUrls } from "@/lib/client/get-presigned-urls";
import { saveTool } from "@/lib/client/save-tool";
import { uploadFilesToS3 } from "@/lib/client/upload-files-to-s3";
import {
  LOGO_MAX_SIZE_MB,
  SCREENSHOT_MAX_SIZE_MB,
  SUPPORTED_FILE_TYPES,
  SUPPORTED_MIME_TYPES,
  ToolSubmissionFormSchema,
  ToolSubmissionFormSchemaType,
  pricingOptions,
} from "@/lib/schema";
import type { User } from "@/lib/services/auth-service";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import { Effect, pipe } from "effect";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface ToolSubmissionFormProps {
  categories: string[];
  initialData?: Tool | null;
  user: User | null;
}

export function ToolSubmissionForm({
  categories,
  initialData,
  user,
}: ToolSubmissionFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const { control, handleSubmit, reset, setError, clearErrors } =
    useForm<ToolSubmissionFormSchemaType>({
      resolver: effectTsResolver(ToolSubmissionFormSchema),
      mode: "onTouched",
      reValidateMode: "onChange",
      defaultValues: {
        name: initialData?.name ?? "",
        websiteUrl: initialData?.websiteUrl ?? "",
        tagline: initialData?.tagline ?? "",
        description: initialData?.description ?? "",
        categories: initialData?.categories ?? [],
        pricing: initialData?.pricing ?? undefined,
        logo: undefined,
        showcaseImage: undefined,
      },
    });

  async function onSubmit(data: ToolSubmissionFormSchemaType) {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const program = Effect.gen(function* () {
      const {
        logoKey,
        showcaseImageKey,
        logoUploadUrl,
        showcaseImageUploadUrl,
      } = yield* getPresignedUrls({
        ...data,
        ...(initialData?.id && { toolId: initialData.id }),
      });

      if (
        (data.logo && logoUploadUrl) ||
        (data.showcaseImage && showcaseImageUploadUrl)
      ) {
        yield* uploadFilesToS3({
          logoUploadUrl,
          showcaseImageUploadUrl,
          logo: data.logo,
          showcaseImage: data.showcaseImage,
        });
      }

      const { logo, showcaseImage, ...toolData } = data;

      yield* saveTool({
        ...toolData,
        logoKey,
        showcaseImageKey,
        toolId: initialData?.id,
      });
    });

    const handledProgram = pipe(
      program,
      Effect.tap(() =>
        Effect.sync(() => {
          reset();
          if (initialData && user?.role === "admin") {
            router.push("/submit/edit-success");
          } else {
            router.push("/submit/success");
          }
        }),
      ),
      Effect.tapError((error) =>
        Effect.logError("Tool submission error: ", error),
      ),
      Effect.catchTag("ParseError", (error) =>
        Effect.sync(() => {
          error.issues.forEach((issue) => {
            const fieldName = issue
              .path[0] as keyof ToolSubmissionFormSchemaType;
            if (fieldName) {
              setError(fieldName, { type: "server", message: issue.message });
            }
          });
        }),
      ),
      Effect.catchTag("UserSessionNotFoundError", () =>
        Effect.sync(() => {
          const params = new URLSearchParams();
          params.set("next", pathname);
          router.push(`/signin?${params.toString()}`);
        }),
      ),
      Effect.catchTag("ToolPermanentlyRejectedError", (error) =>
        Effect.sync(() => setErrorMessage(error.message)),
      ),
      Effect.catchTag("InternalServerError", (error) =>
        Effect.sync(() => setErrorMessage(error.message)),
      ),
      Effect.catchTag("NetworkError", (error) =>
        Effect.sync(() => setErrorMessage(error.message)),
      ),
      Effect.ensureErrorType<never>(),
      Effect.ensuring(Effect.sync(() => setIsProcessing(false))),
    );

    await clientRuntime.runPromise(handledProgram);
  }

  const message = successMessage || errorMessage;
  const messageType = successMessage ? "success" : "error";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
      {message && <FormMessage message={message} type={messageType} />}

      <FormField
        id="name"
        name="name"
        label="Name"
        placeholder="Clarity AI"
        type="text"
        control={control}
        disabled={isProcessing}
        required={true}
      />

      <FormField
        id="websiteUrl"
        name="websiteUrl"
        label="Website URL"
        placeholder="www.clarityai.co"
        control={control}
        disabled={isProcessing}
        required={true}
      />

      <FormField
        id="tagline"
        name="tagline"
        label="Tagline"
        placeholder="Upscale and enhance your images with AI Magic"
        help={{
          message: "Tagline must be 20 words or fewer.",
          maxWordCount: 20,
        }}
        type="text"
        control={control}
        disabled={isProcessing}
        required={true}
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
        required={true}
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
            categories={categories}
          />
        )}
        required={true}
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
                className="mt-2 w-full border-neutral-300"
                aria-invalid={fieldError ? "true" : "false"}
                aria-describedby={fieldError ? fieldErrorId : undefined}
              >
                <SelectValue placeholder="Select a pricing model" />
              </SelectTrigger>
              <SelectContent>
                {pricingOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {/* Capitalize the first letter. */}
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }}
        required={true}
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
        id="showcaseImage"
        name="showcaseImage"
        label="Showcase image"
        control={control}
        disabled={isProcessing}
        help={{
          message:
            "Upload an image that best showcases your product. This could be a screenshot of the homepage, a key feature, or the dashboard. It will be displayed on the product's detail page.",
        }}
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
        required={true}
      />
      <Button type="submit" disabled={isProcessing}>
        {isProcessing ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}

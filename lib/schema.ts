import { Schema } from "effect";

export const ForgotPasswordFormSchema = Schema.Struct({
  email: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Email is required." })
  ),
});

export const pricingOptions = ["Free", "Paid", "Freemium"] as const;

export const LOGO_MAX_SIZE_MB = 2;
export const SCREENSHOT_MAX_SIZE_MB = 5;
export const SUPPORTED_FILE_TYPES = ["JPEG", "PNG", "WEBP"];

export const SUPPORTED_MIME_TYPES = SUPPORTED_FILE_TYPES.map(
  (format) => `image/${format.toLowerCase()}`
);

const formatMimeTypeForDisplay = (mimeType: string): string => {
  if (!mimeType) {
    return "UNKNOWN";
  }
  const parts = mimeType.split("/");
  const format = parts[1] || parts[0] || "UNKNOWN";
  return format.toUpperCase();
};

const validateFileContent = (maxSizeInMb: number) => {
  const maxSizeInBytes = maxSizeInMb * 1024 * 1024;
  const FileLike = Schema.Struct(
    {
      size: Schema.Number,
      type: Schema.String,
    },
    { key: Schema.String, value: Schema.Unknown } // Allows other properties
  );

  return FileLike.pipe(
    Schema.filter(
      (file) =>
        file.size <= maxSizeInBytes ||
        `File size cannot exceed ${maxSizeInMb}MB. Current size: ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB`,
      { identifier: "FileSize" }
    ),
    Schema.filter(
      (file) =>
        SUPPORTED_MIME_TYPES.includes(file.type) ||
        `Invalid file type: ${formatMimeTypeForDisplay(
          file.type
        )}. Accepted formats: ${SUPPORTED_FILE_TYPES.join(", ")}`,
      { identifier: "FileType" }
    )
  );
};
export const ToolSubmissionSchema = Schema.Struct({
  name: Schema.String.pipe(
    Schema.nonEmptyString({
      message: () => "Name is required.",
    })
  ),
  website: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Website URL is required." }),
    Schema.pattern(
      /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      {
        message: () => "Please enter a valid website URL",
      }
    )
  ),
  tagline: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Tagline is required." }),
    Schema.filter(
      (text) => text.trim().split(/\s+/).filter(Boolean).length <= 20,
      {
        message: () => "Tagline must be 20 words or fewer.",
      }
    )
  ),
  description: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Description is required." }),
    Schema.filter(
      (text) => text.trim().split(/\s+/).filter(Boolean).length <= 500,
      {
        message: () => "Description must be 500 words or fewer.",
      }
    )
  ),
  categories: Schema.Array(
    Schema.Trim.pipe(
      Schema.nonEmptyString({
        message: () => "At least one category is required.",
      })
    )
  ).pipe(
    Schema.minItems(1, {
      message: () => "At least one category is required.",
    }),
    Schema.maxItems(3, {
      message: () => "You can select a maximum of three categories.",
    })
  ),
  pricing: Schema.Literal(...pricingOptions).annotations({
    message: () => ({
      message: "Pricing is required.",
      override: true,
    }),
  }),
  logo: Schema.optional(
    Schema.Union(validateFileContent(LOGO_MAX_SIZE_MB), Schema.Null)
  ),
  homepageScreenshot: Schema.Union(
    validateFileContent(SCREENSHOT_MAX_SIZE_MB),
    Schema.Null,
    Schema.Undefined
  ).pipe(
    Schema.filter(
      (value): value is { size: number; type: string } =>
        value !== null && value !== undefined,
      {
        message: () => "Homepage screenshot is required.",
      }
    )
  ),
});

export type ToolSubmissionFormData = Schema.Schema.Encoded<
  typeof ToolSubmissionSchema
>;

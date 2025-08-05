import { Schema, type Schema as S } from "effect";

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

const ValidFileSchema = (maxSizeInMb: number) =>
  Schema.instanceOf(File).pipe(
    Schema.filter((file) => file.size <= maxSizeInMb * 1024 * 1024, {
      message: () => `File cannot exceed ${maxSizeInMb}MB.`,
    }),
    Schema.filter((file) => SUPPORTED_MIME_TYPES.includes(file.type), {
      message: () =>
        `Invalid file type. Use ${SUPPORTED_FILE_TYPES.join(", ")}.`,
    })
  );

const RequiredFileSchema = (maxSizeInMb: number, requiredMessage: string) =>
  Schema.Unknown.pipe(
    Schema.filter((u): u is File => u instanceof File, {
      message: () => requiredMessage,
    }),
    Schema.compose(ValidFileSchema(maxSizeInMb))
  ) as S.Schema<File>;

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
  logo: Schema.optional(ValidFileSchema(LOGO_MAX_SIZE_MB)),
  homepageScreenshot: RequiredFileSchema(
    SCREENSHOT_MAX_SIZE_MB,
    "Homepage screenshot is required."
  ),
}).pipe(Schema.annotations({ parseOptions: { errors: "all" } }));

export type ToolSubmissionFormData = Schema.Schema.Type<
  typeof ToolSubmissionSchema
>;

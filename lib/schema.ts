import { Schema } from "effect";

export const pricingOptions = ["Free", "Paid", "Freemium"] as const;

export const LOGO_MAX_SIZE_MB = 2;
export const SCREENSHOT_MAX_SIZE_MB = 5;
export const SUPPORTED_FILE_TYPES = ["JPEG", "PNG", "WEBP"];

export const SUPPORTED_MIME_TYPES = SUPPORTED_FILE_TYPES.map(
  (format) => `image/${format.toLowerCase()}`
);

export const ToolSubmissionFormSchema = Schema.Struct({
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
  categories: Schema.Array(Schema.String).pipe(
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
  logo: Schema.optional(Schema.instanceOf(File)),
  homepageScreenshot: Schema.instanceOf(File)
    .annotations({ message: () => "Homepage screenshot is required." })
    .pipe(
      Schema.filter(
        (file) => file.size <= SCREENSHOT_MAX_SIZE_MB * 1024 * 1024,
        {
          message: () =>
            `Screenshot must be less than ${SCREENSHOT_MAX_SIZE_MB}MB`,
        }
      )
    ),
})
  .annotations({ identifier: "ToolSubmissionFormSchema" })
  .pipe(Schema.annotations({ parseOptions: { errors: "all" } }));

export type ToolSubmissionFormSchemaType = Schema.Schema.Type<
  typeof ToolSubmissionFormSchema
>;

import { Schema } from "effect";

export const pricingOptions = ["free", "paid", "freemium"] as const;

export const LOGO_MAX_SIZE_MB = 1;
export const SCREENSHOT_MAX_SIZE_MB = 4;
export const SUPPORTED_FILE_TYPES = ["JPEG", "PNG", "WEBP"];

export const SUPPORTED_MIME_TYPES = SUPPORTED_FILE_TYPES.map(
  (format) => `image/${format.toLowerCase()}`,
);

const ValidatedLogoFile = Schema.instanceOf(File).pipe(
  Schema.filter((file) => file.size <= LOGO_MAX_SIZE_MB * 1024 * 1024, {
    message: () => `Logo must be less than ${LOGO_MAX_SIZE_MB}MB`,
  }),
  Schema.filter((file) => SUPPORTED_MIME_TYPES.includes(file.type), {
    message: () =>
      `Invalid file type. Supported types are ${SUPPORTED_FILE_TYPES.join(
        ", ",
      )}.`,
  }),
);

export const ToolSubmissionFormSchema = Schema.Struct({
  name: Schema.String.pipe(
    Schema.nonEmptyString({
      message: () => "Name is required.",
    }),
  ),
  websiteUrl: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Website URL is required." }),
    Schema.filter(
      (url) =>
        !url.startsWith("http://") ||
        "'http://' is not allowed. Please use 'https://'",
    ),
    Schema.filter(
      (url) =>
        url.startsWith("https://") ||
        url.startsWith("www.") ||
        "URL is incomplete. It must start with 'https://' or 'www.'",
    ),
    Schema.pattern(
      /^(https:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      {
        message: () => "Please enter a valid website URL",
      },
    ),
  ),
  tagline: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Tagline is required." }),
    Schema.filter(
      (text) => text.trim().split(/\s+/).filter(Boolean).length <= 15,
      {
        message: () => "Tagline must be 15 words or fewer.",
      },
    ),
  ),
  description: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Description is required." }),
    Schema.filter(
      (html) => {
        const plainText = html.replace(/<[^>]*>/g, " ");
        const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
        return wordCount <= 500;
      },
      {
        message: () => "Description must be 500 words or fewer.",
      },
    ),
  ),
  categories: Schema.Array(Schema.String).pipe(
    Schema.minItems(1, {
      message: () => "At least one category is required.",
    }),
    Schema.maxItems(3, {
      message: () => "You can select a maximum of three categories.",
    }),
  ),
  pricing: Schema.Literal(...pricingOptions).annotations({
    message: () => ({
      message: "Pricing is required.",
      override: true,
    }),
  }),
  logo: Schema.optional(ValidatedLogoFile),
  showcaseImage: Schema.instanceOf(File)
    .annotations({ message: () => "Showcase image is required." })
    .pipe(
      Schema.filter(
        (file) => file.size <= SCREENSHOT_MAX_SIZE_MB * 1024 * 1024,
        {
          message: () =>
            `Showcase image must be less than ${SCREENSHOT_MAX_SIZE_MB}MB`,
        },
      ),
      Schema.filter((file) => SUPPORTED_MIME_TYPES.includes(file.type), {
        message: () =>
          `Invalid file type. Supported types are ${SUPPORTED_FILE_TYPES.join(
            ", ",
          )}.`,
      }),
    ),
})
  .annotations({ identifier: "ToolSubmissionFormSchema" })
  .pipe(Schema.annotations({ parseOptions: { errors: "all" } }));

export type ToolSubmissionFormSchemaType = Schema.Schema.Type<
  typeof ToolSubmissionFormSchema
>;

export const SignInWithEmailOtpFormSchema = Schema.Struct({
  email: Schema.String.pipe(
    Schema.nonEmptyString({ message: () => "Email is required." }),
    Schema.pattern(
      /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i,
      {
        message: () => "Please enter a valid email address.",
      },
    ),
  ),
});

export type SignInWithEmailOtpFormSchemaType = Schema.Schema.Type<
  typeof SignInWithEmailOtpFormSchema
>;

export type saveToolPayload = Omit<
  ToolSubmissionFormSchemaType,
  "logo" | "showcaseImage"
> & {
  logoKey?: string;
  showcaseImageKey: string;
};

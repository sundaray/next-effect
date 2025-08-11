import { ok, err, Result, ResultAsync, safeTry } from "neverthrow";
import { ToolSubmissionFormSchemaType } from "@/lib/schema";

type GetPresignedUrlResponse = {
  homepageScreenshotUploadUrl: string;
  homepageScreenshotKey: string;
  logoUploadUrl?: string;
  logoKey?: string;
};

class ConfigError extends Error {
  readonly _tag = "ConfigError" as const;
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

class ParseError extends Error {
  readonly _tag = "ParseError" as const;
  constructor(
    readonly issues: { message: string; path: (string | number)[] }[]
  ) {
    super();
    this.name = "ParseError";
  }
}

class PresignedUrlGenerationError extends Error {
  readonly _tag = "PresignedUrlGenerationError" as const;
  constructor(message: string) {
    super(message);
    this.name = "PresignedUrlGenerationError";
  }
}

class NetworkError extends Error {
  readonly _tag = "NetworkError" as const;
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

class ResponseBodyParseError extends Error {
  readonly _tag = "ResponseBodyParseError" as const;
  constructor(message: string) {
    super(message);
    this.name = "ResponseBodyParseError";
  }
}

export type GetPresignedUrlsError =
  | ConfigError
  | ParseError
  | PresignedUrlGenerationError
  | ResponseBodyParseError
  | NetworkError;

export async function getPresignedUrls(
  data: ToolSubmissionFormSchemaType
): Promise<Result<GetPresignedUrlResponse, GetPresignedUrlsError>> {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("website", data.website);
  formData.append("tagline", data.tagline);
  formData.append("description", data.description);
  formData.append("pricing", data.pricing);
  formData.append("categories", JSON.stringify(data.categories));
  if (data.logo) {
    formData.append("logo", data.logo);
  }
  formData.append("homepageScreenshot", data.homepageScreenshot);

  const result = await safeTry(async function* () {
    const response = yield* ResultAsync.fromPromise(
      fetch("/api/tools/presigned-url", { method: "POST", body: formData }),
      () =>
        new NetworkError("Please check your internet connection and try again.")
    );

    const data = yield* ResultAsync.fromPromise(
      response.json(),
      () =>
        new ResponseBodyParseError(
          "Failed to parse response body. Please try again."
        )
    );

    if (!response.ok) {
      return err(data as GetPresignedUrlsError);
    }

    return ok(data as GetPresignedUrlResponse);
  });

  return result;
}

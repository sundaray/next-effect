import { ok, err, Result, ResultAsync, safeTry } from "neverthrow";
import { ToolSubmissionFormSchemaType } from "@/lib/schema";

type GetPresignedUrlResponse = {
  homepageScreenshotUploadUrl: string;
  homepageScreenshotKey: string;
  logoUploadUrl?: string;
  logoKey?: string;
};

type ConfigError = {
  _tag: "ConfigError";
  message: string;
};

type ParseError = {
  _tag: "ParseError";
  issues: { message: string; path: (string | number)[] }[];
};

type PresignedUrlGenerationError = {
  _tag: "PresignedUrlGenerationError";
  message: string;
};

type NetworkError = {
  _tag: "NetworkError";
  message: string;
};

type ResonseBodyParseError = {
  _tag: "ResponseBodyParseError";
  message: string;
};

export type GetPresignedUrlsError =
  | ConfigError
  | ParseError
  | PresignedUrlGenerationError
  | ResonseBodyParseError
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
      (): NetworkError => ({
        _tag: "NetworkError",
        message: "Please check your internet connection and try again.",
      })
    );

    const data = yield* ResultAsync.fromPromise(
      response.json(),
      (): ResonseBodyParseError => ({
        _tag: "ResponseBodyParseError",
        message: "Failed to parse response body. Please try again.",
      })
    );

    if (!response.ok) {
      return err(data as GetPresignedUrlsError);
    }

    return ok(data as GetPresignedUrlResponse);
  });

  return result;
}

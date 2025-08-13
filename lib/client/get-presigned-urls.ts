import "client-only";

import { ok, err, Result, ResultAsync, safeTry } from "neverthrow";
import { ToolSubmissionFormSchemaType } from "@/lib/schema";
import {
  ParseError,
  InternalServerError,
  NetworkError,
} from "@/lib/client/errors";

type GetPresignedUrlResponse = {
  homepageScreenshotUploadUrl: string;
  homepageScreenshotKey: string;
  logoUploadUrl?: string;
  logoKey?: string;
};

export type GetPresignedUrlsError =
  | ParseError
  | InternalServerError
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

    const data = yield* ResultAsync.fromPromise(response.json(), (error) => {
      console.error("InternalServerError: ", error);
      return new InternalServerError(
        "Tool submission failed due to a server error. Please try again."
      );
    });
    if (!response.ok) {
      return err(data as GetPresignedUrlsError);
    }

    return ok(data as GetPresignedUrlResponse);
  });

  return result;
}

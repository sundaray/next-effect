import { Effect, Schema } from "effect";
import { HttpClientRequest } from "@effect/platform";
import { ApiClientService } from "@/lib/services/apiClient-service";
import { ToolSubmissionFormSchemaType } from "@/lib/schema";

const GetPresignedUrlsReturnType = Schema.Struct({
  homepageScreenshotUploadUrl: Schema.String,
  homepageScreenshotKey: Schema.String,
  logoUploadUrl: Schema.String,
  logoKey: Schema.String,
});

export function getpresignedUrls(data: ToolSubmissionFormSchemaType) {
  return Effect.gen(function* () {
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

    const client = yield* ApiClientService;

    const response = yield* client
      .post("/api/tools/presigned-url")
      .pipe(HttpClientRequest.bodyFormData(formData));
  });
}

import { Effect, Schema } from "effect";
import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { ApiClientService } from "@/lib/services/apiClient-service";
import { ToolSubmissionFormSchemaType } from "@/lib/schema";

const GetPresignedUrlsSchema = Schema.Struct({
  homepageScreenshotUploadUrl: Schema.String,
  homepageScreenshotKey: Schema.String,
  logoUploadUrl: Schema.optional(Schema.String),
  logoKey: Schema.optional(Schema.String),
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

    const baseClient = yield* ApiClientService;

    const client = baseClient.pipe(HttpClient.filterStatusOk);

    const request = HttpClientRequest.post("/api/tools/presigned-url").pipe(
      HttpClientRequest.bodyFormData(formData)
    );

    const response = yield* client.execute(request);

    const parsedData = yield* HttpClientResponse.schemaBodyJson(
      GetPresignedUrlsSchema
    )(response);

    return parsedData;
  });
}

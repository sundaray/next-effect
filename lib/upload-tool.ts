import { Effect, Schema } from "effect";
import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { ApiClientService } from "@/lib/services/apiClient-service";
import { pricingOptions } from "@/lib/schema";

const ToolSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  website: Schema.String,
  tagline: Schema.String,
  description: Schema.String,
  categories: Schema.Array(Schema.String),
  pricing: Schema.Literal(...pricingOptions),
  logoUrl: Schema.optional(Schema.String),
  homepageScreenshotUrl: Schema.String,
  status: Schema.String,
  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
});

const SubmitToolResponseSchema = Schema.Struct({
  tool: ToolSchema,
});

export type SubmitToolDataParams = {
  name: string;
  website: string;
  tagline: string;
  description: string;
  pricing: (typeof pricingOptions)[number];
  categories: readonly string[];
  homepageScreenshotKey: string;
  logoKey?: string;
};

export function uploadTool(params: SubmitToolDataParams) {
  return Effect.gen(function* () {
    const baseClient = yield* ApiClientService;
    const client = baseClient.pipe(HttpClient.filterStatusOk);

    const toolUploadPayload = {
      name: params.name,
      website: params.website,
      tagline: params.tagline,
      description: params.description,
      pricing: params.pricing,
      categories: params.categories,
      homepageScreenshotUrl: params.homepageScreenshotKey,
      logoUrl: params.logoKey,
    };

    const request = yield* HttpClientRequest.post("/api/tools/upload").pipe(
      HttpClientRequest.bodyJson(toolUploadPayload)
    );

    const response = yield* client.execute(request);

    const result = yield* HttpClientResponse.schemaBodyJson(
      SubmitToolResponseSchema
    )(response);

    return result;
  });
}

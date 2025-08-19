import "client-only";
import { Effect } from "effect";
import { hc, parseResponse, DetailedError } from "hono/client";
import type { InferResponseType } from "hono/client";
import type { ApiRoutes } from "@/app/api/[[...path]]/route";
import { ToolSubmissionFormSchemaType } from "@/lib/schema";
import { ParseError, UserSessionNotFoundError } from "@/lib/client/errors";

const client = hc<ApiRoutes>(process.env.NEXT_PUBLIC_BASE_URL!);

const $post = client.api.tools["presigned-url"].$post;
type GetPresignedUrlsResponse = InferResponseType<typeof $post>;

export async function getPresignedUrls(data: ToolSubmissionFormSchemaType) {
  try {
    const response = await parseResponse(
      client.api.tools["presigned-url"].$post({
        form: { ...data, categories: JSON.stringify(data.categories) },
      })
    );

    return response;
  } catch (error) {
    if (error instanceof DetailedError) {
      const detail = error.detail;
      const tag = detail.data._tag;

      switch (tag) {
        case "ParseError": {
          throw new ParseError({ issues: detail.data.issues });
        }
        case "UserSessionNotFoundError": {
          const message = detail.data.message;
          throw new UserSessionNotFoundError({ message });
        }
      }
    }
  }
}

import "client-only";
import { Effect } from "effect";
import { hc, parseResponse, DetailedError } from "hono/client";
import type { ApiRoutes } from "@/app/api/[[...path]]/route";
import { ToolSubmissionFormSchemaType } from "@/lib/schema";
import {
  ParseError,
  UserSessionNotFoundError,
  InternalServerError,
  NetworkError,
} from "@/lib/client/errors";

const client = hc<ApiRoutes>(process.env.NEXT_PUBLIC_BASE_URL!);

export function getPresignedUrls(data: ToolSubmissionFormSchemaType) {
  return Effect.tryPromise({
    try: () =>
      parseResponse(
        client.api.tools["presigned-url"].$post({
          form: { ...data, categories: JSON.stringify(data.categories) },
        })
      ),
    catch: (error) => {
      if (error instanceof DetailedError) {
        const detail = error.detail;
        const tag = detail.data._tag;

        switch (tag) {
          case "UserSessionNotFoundError":
            return new UserSessionNotFoundError({
              message: detail.data.message,
            });
          case "ParseError":
            return new ParseError({ issues: detail.data.issues });
          case "InternalServerError":
            return new InternalServerError({ message: detail.data.message });
          default:
            return new InternalServerError({
              message:
                "Tool submission failed due to a server error. Please try again.",
            });
        }
      }
      return new NetworkError({
        message: "Network error. Please check your internet connection.",
      });
    },
  });
}

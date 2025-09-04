import type { ApiRoutes } from "@/app/api/[[...path]]/route";
import {
  InternalServerError,
  NetworkError,
  ParseError,
  ToolPermanentlyRejectedError,
  UserSessionNotFoundError,
} from "@/lib/client/errors";
import { ToolSubmissionFormSchemaType } from "@/lib/schema";
import "client-only";
import { Effect } from "effect";
import { DetailedError, hc, parseResponse } from "hono/client";

const client = hc<ApiRoutes>(process.env.NEXT_PUBLIC_BASE_URL!);

type ApiErrorData =
  | {
      _tag: "ParseError";
      issues: { _tag: string; path: string[]; message: string }[];
    }
  | { _tag: "UserSessionNotFoundError"; message: string }
  | { _tag: "InternalServerError"; message: string }
  | { _tag: "ToolPermanentlyRejectedError"; message: string };

function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

export function getPresignedUrls(data: ToolSubmissionFormSchemaType) {
  return Effect.tryPromise({
    try: () =>
      parseResponse(
        client.api.tools["presigned-url"].$post({
          form: { ...data, categories: JSON.stringify(data.categories) },
        }),
      ),
    catch: (error) => {
      if (error instanceof DetailedError) {
        const data = error.detail.data as ApiErrorData;
        const tag = data._tag;

        switch (tag) {
          case "UserSessionNotFoundError":
            return new UserSessionNotFoundError({
              message: data.message,
            });
          case "ParseError":
            return new ParseError({ issues: data.issues });
          case "InternalServerError":
            return new InternalServerError({ message: data.message });
          case "ToolPermanentlyRejectedError":
            return new ToolPermanentlyRejectedError({ message: data.message });
          default: {
            assertNever(tag);
          }
        }
      }
      return new NetworkError({
        message: "Network error. Please check your internet connection.",
      });
    },
  });
}

import "client-only";
import { Effect } from "effect";
import { hc, parseResponse, DetailedError } from "hono/client";
import type { ApiRoutes } from "@/app/api/[[...path]]/route";
import { saveToolPayload } from "@/lib/schema";
import { InternalServerError, NetworkError } from "@/lib/client/errors";

const client = hc<ApiRoutes>(process.env.NEXT_PUBLIC_BASE_URL!);

type ApiErrorData = { _tag: "InternalServerError"; message: string };

function assertNever(value: never): never {
  throw new Error(`Unhandled case in saveTool: ${JSON.stringify(value)}`);
}

export function saveTool(params: saveToolPayload) {
  return Effect.tryPromise({
    try: () => parseResponse(client.api.tools.save.$post({ json: params })),
    catch: (error) => {
      if (error instanceof DetailedError) {
        const data = error.detail.data as ApiErrorData;
        const tag = data._tag;

        switch (tag) {
          case "InternalServerError":
            return new InternalServerError({ message: data.message });
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

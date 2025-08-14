import "client-only";
import { Effect, Data } from "effect";
import { ToolSubmissionFormSchemaType } from "@/lib/schema";

class NetworkError extends Data.TaggedError("NetworkError")<{
  cause: unknown;
  message: string;
}> {}

class InternalServerError extends Data.TaggedError("InternalServerError")<{
  message: string;
}> {}

export function getPresignedUrls(data: ToolSubmissionFormSchemaType) {
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
    formData.append("showcaseImage", data.showcaseImage);

    const response = yield* Effect.tryPromise({
      try: () =>
        fetch("/api/tools/presigned-url", { method: "POST", body: formData }),
      catch: (error) =>
        new NetworkError({
          message: "Please check your internet connection and try again.",
          cause: error,
        }),
    });

    const jsonResult = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (cause) =>
        new InternalServerError({
          message: "Failed to parse server response.",
        }),
    });

    if (!response.ok) {
      if (jsonResult._tag === "ParseError") {
        return yield* Effect.fail({ issues: jsonResult.issues });
      }
      return yield* Effect.fail(
        new InternalServerError({ message: jsonResult.message })
      );
    }

    return jsonResult;
  });
}

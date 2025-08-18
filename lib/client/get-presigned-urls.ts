import "client-only";
import { Effect } from "effect";
import { ToolSubmissionFormSchemaType } from "@/lib/schema";
import {
  NetworkError,
  InternalServerError,
  ParseError,
  UserSessionNotFoundError,
} from "@/lib/client/errors";

type GetPresignedUrlsResponse = {
  logoKey?: string;
  logoUploadUrl?: string;
  showcaseImageUploadUrl: string;
  showcaseImageKey: string;
};

export function getPresignedUrls(
  data: ToolSubmissionFormSchemaType
): Effect.Effect<
  GetPresignedUrlsResponse,
  ParseError | NetworkError | InternalServerError | UserSessionNotFoundError
> {
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
      catch: () =>
        new NetworkError({
          message: "Please check your internet connection and try again.",
        }),
    });

    const result = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (error) => {
        console.log("Client getPresignedURL error: ", error);
        return new InternalServerError({
          message:
            "Tool submission failed due to a server error. Please try again.",
        });
      },
    });

    if (!response.ok) {
      if (result._tag === "ParseError") {
        return yield* Effect.fail(new ParseError({ issues: result.issues }));
      }
      if (result._tag === "UserSessionNotFoundError") {
        return yield* Effect.fail(
          new UserSessionNotFoundError({ message: result.issues })
        );
      }
      return yield* Effect.fail(
        new InternalServerError({ message: result.message })
      );
    }

    return result;
  });
}

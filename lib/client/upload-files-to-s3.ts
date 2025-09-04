import { InternalServerError, NetworkError } from "@/lib/client/errors";
import "client-only";
import { Effect, pipe } from "effect";

type UploadFilesToS3Params = {
  showcaseImage: File;
  showcaseImageUploadUrl: string;
  logo?: File;
  logoUploadUrl?: string;
};

export function uploadFilesToS3(params: UploadFilesToS3Params) {
  return Effect.gen(function* () {
    const createUploadEffect = (url: string, file: File) =>
      pipe(
        Effect.tryPromise({
          try: () =>
            fetch(url, {
              method: "PUT",
              headers: { "Content-Type": file.type },
              body: file,
            }),
          catch: () =>
            new NetworkError({
              message: "Please check your internet connection and try again.",
            }),
        }),
        Effect.flatMap((response) =>
          response.ok
            ? Effect.succeed(undefined)
            : Effect.fail(
                new InternalServerError({
                  message:
                    "Tool submission failed due to a server error. Please try again.",
                }),
              ),
        ),
      );

    const uploadEffects = [];

    uploadEffects.push(
      createUploadEffect(params.showcaseImageUploadUrl, params.showcaseImage),
    );

    if (params.logo && params.logoUploadUrl) {
      uploadEffects.push(createUploadEffect(params.logoUploadUrl, params.logo));
    }

    yield* Effect.all(uploadEffects, { concurrency: 2 });
  });
}

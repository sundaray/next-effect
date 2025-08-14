import "client-only";
import { Effect, pipe } from "effect";
import { NetworkError, InternalServerError } from "@/lib/client/errors";

type UploadFilesToS3Params = {
  showcaseImage: File;
  showcaseImageUploadUrl: string;
  logo?: File;
  logoUploadUrl?: string;
};

export function uploadFilesToS3(params: UploadFilesToS3Params) {
  // We wrap the entire logic in Effect.gen
  return Effect.gen(function* () {
    // Helper function to create an Effect for a single file upload.
    const createUploadEffect = (url: string, file: File) =>
      pipe(
        Effect.tryPromise({
          try: () =>
            fetch(url, {
              method: "PUT",
              headers: { "Content-Type": file.type },
              body: file,
            }),
          catch: (cause) => new NetworkError({ cause }),
        }),
        Effect.flatMap((response) =>
          response.ok
            ? Effect.succeed(undefined)
            : Effect.fail(
                new InternalServerError({
                  message: `File upload to S3 failed with status: ${response.status}`,
                })
              )
        )
      );

    // Create a list to hold our upload effects.
    const uploadEffects: Effect.Effect<void, UploadFilesToS3Errors>[] = [];

    // Always add the showcase image upload effect.
    uploadEffects.push(
      createUploadEffect(params.showcaseImageUploadUrl, params.showcaseImage)
    );

    // Conditionally add the logo upload effect.
    if (params.logoUploadUrl && params.logo) {
      yield* Effect.logInfo("Logo found, preparing logo upload.");
      uploadEffects.push(createUploadEffect(params.logoUploadUrl, params.logo));
    }

    yield* Effect.all(uploadEffects, { concurrency: "inherit", discard: true });
  });
}

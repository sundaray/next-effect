import { Effect, Data } from "effect";
import { S3Client } from "@aws-sdk/client-s3";
import { S3ClientService } from "@/lib/services/s3Client-service";

class StorageError extends Data.TaggedError("StorageError")<{
  cause: unknown;
}> {}

type StorageServiceImp = {
  use: <A>(
    f: (client: S3Client) => Promise<A>
  ) => Effect.Effect<A, StorageError>;
};

export class StorageService extends Effect.Service<StorageServiceImp>()(
  "EmailService",
  {
    effect: Effect.gen(function* () {
      const s3Client = yield* S3ClientService;

      return {
        use: (f) =>
          Effect.tryPromise({
            try: () => {
              return f(s3Client);
            },
            catch: (error) => new StorageError({ cause: error }),
          }),
      } satisfies StorageServiceImp;
    }),
    dependencies: [S3ClientService.Default],
  }
) {}

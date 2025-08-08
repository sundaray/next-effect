import { Effect, Data } from "effect";
import { S3Client } from "@aws-sdk/client-s3";
import { S3ClientService } from "@/lib/services/s3Client-service";

class EmailError extends Data.TaggedError("EmailError")<{ cause: unknown }> {}

type StorageServiceImp = {
  use: <A>(f: (client: S3Client) => Promise<A>) => Effect.Effect<A, EmailError>;
};

export class StorageService extends Effect.Service<StorageServiceImp>()(
  "EmailService",
  {
    effect: Effect.gen(function* () {
      const s3Client = yield* S3ClientService;

      return {
        use: (f) =>
          Effect.tryPromise({
            try: () => f(s3Client),
            catch: (error) => new EmailError({ cause: error }),
          }),
      } satisfies StorageServiceImp;
    }),
    dependencies: [S3ClientService.Default],
  }
) {}

import { SesClientService } from "@/lib/services/sesClient-service";
import { SESClient } from "@aws-sdk/client-ses";
import { Data, Effect } from "effect";

class EmailError extends Data.TaggedError("EmailError")<{ cause: unknown }> {}

type EmailServiceImp = {
  use: <A>(
    f: (client: SESClient) => Promise<A>,
  ) => Effect.Effect<A, EmailError>;
};

export class EmailService extends Effect.Service<EmailServiceImp>()(
  "EmailService",
  {
    effect: Effect.gen(function* () {
      const sesClient = yield* SesClientService;

      return {
        use: (f) =>
          Effect.tryPromise({
            try: () => f(sesClient),
            catch: (error) => new EmailError({ cause: error }),
          }),
      } satisfies EmailServiceImp;
    }),
    dependencies: [SesClientService.Default],
  },
) {}

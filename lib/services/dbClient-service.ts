import { SESClient } from "@aws-sdk/client-ses";
import { Config, Effect, Redacted } from "effect";

export class DbClientService extends Effect.Service<DbClientService>()(
  "DbClientService",
  {
    effect: Effect.gen(function* () {
      const config = yield* Config.all({
        region: Config.string("AWS_REGION"),
        accessKeyId: Config.string("AWS_ACCESS_KEY_ID"),
        secretAccessKey: Config.redacted("AWS_SECRET_ACCESS_KEY"),
      });

      return new SESClient({
        region: config.region,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: Redacted.value(config.secretAccessKey),
        },
      });
    }),
  }
) {}

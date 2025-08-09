import { SESClient } from "@aws-sdk/client-ses";
import { Config, Effect } from "effect";
import { awsCredentialsProvider } from "@vercel/functions/oidc";

export class SesClientService extends Effect.Service<SesClientService>()(
  "SesClient",
  {
    effect: Effect.gen(function* () {
      const config = yield* Config.all({
        region: Config.string("AWS_REGION"),
        roleArn: Config.string("AWS_ROLE_ARN"),
      });

      return new SESClient({
        region: config.region,
        credentials: awsCredentialsProvider({
          roleArn: config.roleArn,
        }),
      });
    }),
  }
) {}

import { S3Client } from "@aws-sdk/client-s3";
import { Config, Effect } from "effect";
import { awsCredentialsProvider } from "@vercel/functions/oidc";

export class S3ClientService extends Effect.Service<S3ClientService>()(
  "S3ClientService",
  {
    effect: Effect.gen(function* () {
      const config = yield* Config.all({
        region: Config.string("AWS_REGION"),
        roleArn: Config.string("AWS_ROLE_ARN"),
      });

      return new S3Client({
        region: config.region,
        credentials: awsCredentialsProvider({
          roleArn: config.roleArn,
        }),
      });
    }),
  }
) {}

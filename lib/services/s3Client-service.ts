import { S3Client } from "@aws-sdk/client-s3";
import { Config, Effect } from "effect";
import { fromWebToken } from "@aws-sdk/credential-providers";

export class S3ClientService extends Effect.Service<S3ClientService>()(
  "S3ClientService",
  {
    effect: Effect.gen(function* () {
      const config = yield* Config.all({
        region: Config.string("AWS_REGION"),
        roleArn: Config.string("AWS_ROLE_ARN"),
        bucketName: Config.string("S3_BUCKET_NAME"),
      });

      return {
        getclient: (vercelOidcToken: string) =>
          new S3Client({
            region: config.region,
            credentials: fromWebToken({
              roleArn: config.roleArn,
              webIdentityToken: vercelOidcToken,
            }),
          }),
      };
    }),
  }
) {}

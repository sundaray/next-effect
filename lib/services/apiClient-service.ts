import { FetchHttpClient, HttpClient } from "@effect/platform";
import { Effect } from "effect";

export class ApiClientService extends Effect.Service<ApiClientService>()(
  "ApiClientService",
  {
    effect: Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      return client;
    }),
    dependencies: [FetchHttpClient.layer],
  },
) {}

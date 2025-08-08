import { Effect } from "effect";
import { HttpClient, FetchHttpClient } from "@effect/platform";

export class ApiClientService extends Effect.Service<ApiClientService>()(
  "ApiClientService",
  {
    effect: Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;
      return client;
    }),
    dependencies: [FetchHttpClient.layer],
  }
) {}

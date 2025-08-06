import { Effect } from "effect";
import { HttpApiClient, FetchHttpClient } from "@effect/platform";
import { api } from "@/app/api/api";

export class ApiClientService extends Effect.Service<ApiClientService>()(
  "ApiClientService",
  {
    effect: Effect.gen(function* () {
      const apiClient = HttpApiClient.make(api, {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      });

      return yield* apiClient;
    }),
    dependencies: [FetchHttpClient.layer],
  }
) {}

import { HttpApiClient } from "@effect/platform";
import { combinedApi } from "@/app/api/api";

export const client = HttpApiClient.make(combinedApi, {
  baseUrl: "http://localhost:3000",
});

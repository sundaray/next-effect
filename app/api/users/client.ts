import { HttpApiClient } from "@effect/platform";
import { usersApi } from "@/app/api/users/api";

export const usersClient = HttpApiClient.make(usersApi, {
  baseUrl: "http://localhost:3000",
});

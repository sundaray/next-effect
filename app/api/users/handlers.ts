import { Effect } from "effect";
import { HttpApiBuilder, HttpApiError } from "@effect/platform";
import { api } from "@/app/api/api";

const dummyUsers = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
];

// Get users
export const getUsersHandler = HttpApiBuilder.handler(
  api,
  "users",
  "getUsers",
  ({ request }) =>
    Effect.gen(function* () {
      console.log("HttpServerRequest: ", request);
      return "Hello users";
    })
);

// Get user by id
export const getUserHandler = HttpApiBuilder.handler(
  api,
  "users",
  "getUser",
  ({ path: { id }, request }) =>
    Effect.gen(function* () {
      console.log("HTTP server request: ", request);
      const user = dummyUsers.find((user) => user.id === id);

      if (!user) {
        return yield* Effect.fail(new HttpApiError.NotFound());
      }
      return user;
    })
);

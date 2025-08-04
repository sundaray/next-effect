import { Effect } from "effect";
import { FetchHttpClient } from "@effect/platform";
import { usersClient } from "@/app/api/users/client";

export default async function Home() {
  const users = await Effect.gen(function* () {
    const client = yield* usersClient;
    return yield* client.users.getUsers();
  }).pipe(Effect.provide(FetchHttpClient.layer), Effect.runPromise);
  return (
    <ul>
      {users.map((user) => (
        <li key={user.name}>Name: {user.name}</li>
      ))}
    </ul>
  );
}

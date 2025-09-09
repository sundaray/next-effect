import "server-only";

import { users } from "@/db/schema";
import { serverRuntime } from "@/lib/server-runtime";
import { DatabaseService } from "@/lib/services/database-service";
import { desc } from "drizzle-orm";
import { Effect } from "effect";

export type UserForAdminTable = {
  id: string;
  email: string;
  role: string;
};

export async function getAllUsers() {
  const program = Effect.gen(function* () {
    const dbService = yield* DatabaseService;

    const allUsers = yield* dbService.use((db) =>
      db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .orderBy(desc(users.createdAt)),
    );

    return allUsers;
  }).pipe(
    Effect.tapError((error) =>
      Effect.logError("Database error in getAllUsers(): ", error),
    ),
  );

  return (await serverRuntime.runPromise(program)) as UserForAdminTable[];
}
